#!/usr/bin/env python3
"""Read-only trusted-base gate. Python stdlib only; never executes PR code.

The first eligibility profile supports graph-preserving Yarn npm lock refreshes.
Semantic evidence needs a human's exact-head approval citing the assessment URL.
No assessment, check result, or output from this program performs a mutation.
"""
import argparse
import base64
import datetime as dt
import json
import os
from pathlib import Path
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / '.github/security/dependency-risk.schema.json'
MARKER = '<!-- anitrend.security-runner.v1 -->'
REPOSITORY = 'AniTrend/anitrend-website'
BOTS = {'renovate[bot]': 29139614, 'dependabot[bot]': 49699333}
REQUIRED_JOBS = {
    'Lint & Type Check', 'Build & Test', 'Browser Regression Tests',
    'Build Matrix Test (ubuntu-latest, 20)', 'Build Matrix Test (ubuntu-latest, 22)',
    'Static Code Analysis', 'Dependency Security Scan', 'Build Performance Analysis',
    'TypeScript Coverage',
}
QUALITY_JOBS = {'Static Code Analysis', 'Dependency Security Scan',
                'Build Performance Analysis', 'TypeScript Coverage'}
OPTIONAL_SKIPS = {'Deployment Ready Check', 'auto-approve', 'autolabel-pr'}
OPTIONAL_FAILURE_STEPS = {'Upload failure evidence'}
SCAN_JOBS = {'resolved-dependencies': 'Dependency Security Scan',
             'code': 'Static Code Analysis', 'secrets': 'GitGuardian Security Checks',
             'container': 'Container Security Scan'}
SENSITIVE = re.compile(r'(^|[/@-])(auth|crypto|jose|jwt|openssl|gateway)([/@-]|$)|^(next|zod)$')


class Blocked(Exception):
    """Controlled non-sensitive reason code suitable for a public summary."""


def require(condition, code):
    if not condition:
        raise Blocked(code)


def strict_json(raw):
    def pairs(items):
        result = {}
        for key, value in items:
            require(key not in result, 'duplicate_json_key')
            result[key] = value
        return result
    def constant(_):
        raise Blocked('nonfinite_json')
    return json.loads(raw, object_pairs_hook=pairs, parse_constant=constant)


def structure(value, schema, root=None):
    """Closed schema subset; unsupported keywords fail instead of being ignored.

    This is deliberately NOT a general-purpose JSON Schema implementation.
    """
    root = root or schema
    supported = {'$schema', '$id', 'title', 'description', '$defs', '$ref', 'type',
                 'const', 'enum', 'pattern', 'minLength', 'minimum', 'minItems',
                 'uniqueItems', 'properties', 'required', 'additionalProperties', 'items'}
    require(not set(schema) - supported, 'unsupported_schema_keyword')
    if '$ref' in schema:
        require(schema['$ref'].startswith('#/$defs/'), 'unsupported_schema_reference')
        return structure(value, root['$defs'][schema['$ref'].split('/')[-1]], root)
    types = {'object': dict, 'array': list, 'string': str, 'integer': int,
             'boolean': bool, 'null': type(None)}
    if 'type' in schema:
        kinds = schema['type'] if isinstance(schema['type'], list) else [schema['type']]
        require(any(type(value) is types[k] for k in kinds), 'schema_type')
    if 'const' in schema:
        require(value == schema['const'], 'schema_const')
    if 'enum' in schema:
        require(value in schema['enum'], 'schema_enum')
    if isinstance(value, dict):
        require(set(schema.get('required', [])) <= value.keys(), 'schema_missing_field')
        props = schema.get('properties', {})
        if schema.get('additionalProperties') is False:
            require(not value.keys() - props.keys(), 'schema_unknown_field')
        for key in value.keys() & props.keys():
            structure(value[key], props[key], root)
    if isinstance(value, list):
        require(len(value) >= schema.get('minItems', 0), 'schema_empty_array')
        if schema.get('uniqueItems'):
            require(len({json.dumps(x, sort_keys=True) for x in value}) == len(value), 'schema_duplicates')
        for entry in value:
            structure(entry, schema.get('items', {}), root)
    if isinstance(value, str):
        require(len(value.strip()) >= schema.get('minLength', 0), 'schema_empty_string')
        if 'pattern' in schema:
            require(re.search(schema['pattern'], value) is not None, 'schema_pattern')
    if type(value) is int and 'minimum' in schema:
        require(value >= schema['minimum'], 'schema_minimum')


def lock_changes(before, after):
    """Compare whole raw blocks; permit only npm version/resolution/integrity deltas.

    No YAML evaluation, graph/descriptor changes, protocols or prereleases.
    Unknown lock formats and integrity-only changes require manual review.
    """
    def blocks(text):
        result, key = {}, None
        for line in text.splitlines(keepends=True):
            if line and not line[0].isspace() and not line.startswith('#'):
                require(line.rstrip().endswith(':'), 'unsupported_lock_format')
                key = line.rstrip()
                require(key not in result, 'duplicate_lock_block')
                result[key] = ''
            result.setdefault(key, '')
            result[key] += line
        return result
    old, new = blocks(before), blocks(after)
    require(old.keys() == new.keys(), 'lock_graph_or_descriptor_change')
    changes = []
    for key in old:
        if old[key] == new[key]:
            continue
        require(key not in {None, '__metadata:'}, 'lock_metadata_change')
        def fields(block):
            found, rest = {}, []
            for line in block.splitlines(keepends=True):
                match = re.fullmatch(r'  (version|resolution|checksum): (.+)\n?', line)
                if match:
                    name, val = match.groups()
                    require(name not in found, 'duplicate_lock_field')
                    found[name] = val.rstrip('\n').strip('"')
                else:
                    rest.append(line)
            require(set(found) == {'version', 'resolution', 'checksum'}, 'missing_lock_integrity')
            require(re.fullmatch(r'[0-9a-f]+/[0-9a-f]{128}', found['checksum']), 'unsupported_lock_integrity')
            require(re.fullmatch(r'(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)', found['version']), 'non_semver_update')
            resolution = re.fullmatch(r'(@?[^\s:@]+(?:/[^\s:@]+)?)@npm:(.+)', found['resolution'])
            require(resolution is not None and resolution[2] == found['version'], 'non_npm_resolution')
            return found, ''.join(rest), resolution[1]
        a, ar, name = fields(old[key])
        b, br, new_name = fields(new[key])
        require(ar == br and name == new_name, 'lock_graph_or_layout_change')
        av, bv = tuple(map(int, a['version'].split('.'))), tuple(map(int, b['version'].split('.')))
        require(0 < av[0] == bv[0] and av < bv, 'major_zero_prerelease_or_downgrade')
        require(not SENSITIVE.search(name), 'sensitive_dependency_manual_review')
        changes.append({'name': name, 'from': a['version'], 'to': b['version'],
                        'path': 'yarn.lock', 'ecosystem': 'npm',
                        'update_type': 'semver-minor' if av[1] != bv[1] else 'semver-patch'})
    require(bool(changes), 'no_dependency_delta')
    return sorted(changes, key=lambda x: (x['name'], x['from'], x['to']))


def evaluate(a, e):
    structure(a, strict_json(SCHEMA.read_text()))
    require(a['repository'] == e['repository'] == REPOSITORY, 'repository_mismatch')
    for field in ('pr_number', 'pr_url', 'base_sha', 'head_sha'):
        require(a[field] == e[field], 'stale_or_mismatched_identity')
    require(e['complete'] is True and not e['coverage_gaps'], 'incomplete_github_evidence')
    require(e['open'] and not e['draft'] and e['same_repository'], 'ineligible_pr_state_or_origin')
    require(e['author_id'] == BOTS.get(e['author']) and e['author_type'] == 'Bot', 'untrusted_author')
    require(a['decision'] == 'approve' and a['risk'] == 'low' and a['confidence'] == 'high', 'manual_risk_decision')
    require(a['automerge_allowed'] is True and a['release_allowed'] is False, 'merge_only_profile')
    require(not a['coverage_gaps'] and not a['manual_follow_up'], 'assessment_has_blockers')
    require(a['breaking_change_assessment'] == 'compatible' and a['runtime_impact'] == 'low', 'compatibility_unproven')
    require(a['changed_files'] == e['changed_files'] == ['yarn.lock'], 'unexpected_changed_files')
    actual = lock_changes(e['base_lock'], e['head_lock'])
    require(a['dependency_changes'] == actual, 'dependency_delta_mismatch')
    update = 'semver-minor' if any(c['update_type'] == 'semver-minor' for c in actual) else 'semver-patch'
    require(a['update_type'] == update, 'update_type_mismatch')
    require(e['head_parent'] == e['base_sha'], 'stale_base_or_stacked_history')
    require(e['merge_parents'] == [e['base_sha'], e['head_sha']], 'stale_merge_candidate')
    require(e['mergeable'] is True and e['mergeable_state'] == 'clean', 'github_merge_blocked')
    require(e['protections_verified'] is True, 'protection_requirements_unknown')
    require(e['review_decision'] == 'APPROVED' and e['threads_resolved'] is True, 'review_or_thread_blocker')
    substantive = [c['name'] for c in e['checks'] if c['name'] not in OPTIONAL_SKIPS
                   or c['name'] in e['required_checks']]
    require(len(set(substantive)) == len(substantive), 'ambiguous_duplicate_check_names')
    # Deduplicate identities; latest decisive review, exact head, human identity,
    # and explicit attestation of this assessment (not a model-only judgment).
    latest = {}
    for review in e['reviews']:
        if review['state'] in {'APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'}:
            latest[review['user']['id']] = review
    require(not any(r['state'] == 'CHANGES_REQUESTED' for r in latest.values()), 'changes_requested')
    approvals = {r['user']['id'] for r in latest.values()
                 if r['state'] == 'APPROVED' and r['commit_id'] == a['head_sha']
                 and r['user']['type'] == 'User' and r['user']['id'] != e['author_id']
                 and r['permission'] in {'admin', 'maintain', 'write'}
                 and r['submitted_at'] >= e['assessment_updated_at']
                 and 'Risk assessment: ' + e['assessment_url'] in r['body']}
    require(len(approvals) >= max(1, e['required_approvals']), 'independent_assessment_approval_missing')
    now = dt.datetime.fromisoformat(e['observed_at'])
    assessed = dt.datetime.fromisoformat(a['assessed_at'].replace('Z', '+00:00'))
    require(assessed.tzinfo is not None and dt.timedelta(0) <= now - assessed <= dt.timedelta(hours=24), 'assessment_expired')
    checks = {c['name']: c for c in e['checks']}
    required = REQUIRED_JOBS | set(e['required_checks']) | {'GitGuardian Security Checks'}
    for name in required:
        c = checks.get(name)
        require(c is not None and c['status'] == 'completed' and c['conclusion'] == 'success', 'required_check_not_success')
        require(c['head_sha'] == a['head_sha'], 'stale_check_sha')
        require(c['app_id'] == (46505 if name == 'GitGuardian Security Checks' else 15368), 'unexpected_check_origin')
    for c in e['checks']:
        if c['name'] == 'Dependency Risk Gate':
            continue  # decision cannot depend on itself
        require(c['conclusion'] == 'success' or
                (c['conclusion'] == 'skipped' and c['name'] in OPTIONAL_SKIPS), 'other_check_not_success')
    require({(c['name'], c['sha'], c['result'], c['url']) for c in a['required_checks']} ==
            {(n, a['head_sha'], 'success', checks[n]['url']) for n in required}, 'assessment_check_evidence_mismatch')
    require(e['jobs_verified'] is True, 'matrix_or_steps_unverified')
    for scan in a['scans']:
        require(scan['tested_sha'] == a['head_sha'] and scan['status'] == 'pass', 'scan_unknown_or_stale')
        require(scan['introduced_findings'] == 0, 'introduced_vulnerability')
        scan_check = checks.get(SCAN_JOBS[scan['surface']])
        require(scan_check is not None and scan_check['status'] == 'completed'
                and scan_check['conclusion'] == 'success'
                and scan_check['head_sha'] == a['head_sha']
                and scan_check['app_id'] == (46505 if scan['surface'] == 'secrets' else 15368)
                and scan['url'] == scan_check['url'], 'scan_evidence_not_verified')
    require(len({s['surface'] for s in a['scans']}) == len(a['scans']), 'ambiguous_scan_surfaces')
    require({s['surface'] for s in a['scans']} >= {'resolved-dependencies', 'code', 'secrets', 'container'}, 'missing_scan_surface')
    require(all(f['state'] in {'fixed', 'pre-existing'} for f in a['findings']), 'unresolved_target_finding')
    require(all(f['state'] == 'fixed' for f in a['findings'] if f['targeted']), 'target_not_fixed')
    require(all(f['severity'] not in {'high', 'critical', 'unknown'} for f in a['findings'] if f['state'] != 'fixed'), 'residual_high_or_unknown')
    require(any(s['kind'] == 'official-release-notes' for s in a['sources_checked']), 'release_notes_missing')
    require(not any(f['targeted'] for f in a['findings']) or
            any(s['kind'] == 'primary-advisory' for s in a['sources_checked']), 'primary_advisory_missing')
    return {'decision': 'approve', 'risk': 'low', 'confidence': 'high',
            'automerge_allowed': True, 'release_allowed': False, 'blockers': []}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        raise Blocked('api_redirect_refused')


class GitHub:
    def __init__(self, repo, token):
        require(repo == REPOSITORY and bool(token), 'repository_or_connection_missing')
        self.prefix, self.token = '/repos/' + repo, token
        self.opener = urllib.request.build_opener(NoRedirect)

    def get(self, path):
        require(path.startswith(self.prefix + '/'), 'api_scope_violation')
        req = urllib.request.Request('https://api.github.com' + path, headers={
            'Authorization': 'Bearer ' + self.token, 'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'anitrend-risk-gate'})
        try:
            with self.opener.open(req, timeout=30) as response:
                raw = response.read(10_000_001)
                require(len(raw) <= 10_000_000, 'api_response_too_large')
                return strict_json(raw)
        except urllib.error.HTTPError as ex:
            raise Blocked('api_unavailable_' + str(ex.code)) from None

    def pages(self, path, field=None):
        result = []
        for page in range(1, 101):
            response = self.get(path + ('&' if '?' in path else '?') + f'per_page=100&page={page}')
            rows = response[field] if field else response
            require(isinstance(rows, list), 'api_collection_shape')
            result.extend(rows)
            if len(rows) < 100:
                if field and 'total_count' in response:
                    require(len(result) == response['total_count'], 'api_collection_incomplete')
                return result
        raise Blocked('api_pagination_limit')

    def review_state(self, number):
        # Fixed read-only GraphQL query: never accepts model-supplied query text.
        query = '''query($number:Int!, $after:String) {
          repository(owner:"AniTrend", name:"anitrend-website") {
            pullRequest(number:$number) {
              reviewDecision
              reviewThreads(first:100, after:$after) {
                nodes { isResolved }
                pageInfo { hasNextPage endCursor }
              }
            }
          }
        }'''
        after, resolved, decision = None, True, None
        for _ in range(100):
            req = urllib.request.Request('https://api.github.com/graphql', method='POST',
                data=json.dumps({'query': query, 'variables': {'number': number, 'after': after}}).encode(),
                headers={'Authorization': 'Bearer ' + self.token, 'Content-Type': 'application/json',
                         'User-Agent': 'anitrend-risk-gate'})
            try:
                with self.opener.open(req, timeout=30) as response:
                    raw = response.read(10_000_001)
                    require(len(raw) <= 10_000_000, 'api_response_too_large')
                    result = strict_json(raw)
            except urllib.error.HTTPError as ex:
                raise Blocked('api_unavailable_' + str(ex.code)) from None
            require(not result.get('errors'), 'review_threads_unavailable')
            pr = result['data']['repository']['pullRequest']
            require(decision is None or decision == pr['reviewDecision'], 'review_changed_during_evaluation')
            decision = pr['reviewDecision']
            threads = pr['reviewThreads']
            resolved = resolved and all(t['isResolved'] is True for t in threads['nodes'])
            if not threads['pageInfo']['hasNextPage']:
                return decision, resolved
            cursor = threads['pageInfo']['endCursor']
            require(cursor is not None and cursor != after, 'review_thread_pagination_incomplete')
            after = cursor
        raise Blocked('api_pagination_limit')


def collect(api, number):
    p = api.prefix
    pr = api.get(f'{p}/pulls/{number}')
    head, base = pr['head']['sha'], pr['base']['sha']
    branch = urllib.parse.quote(pr['base']['ref'], safe='')
    require(api.get(f'{p}/git/ref/heads/{branch}')['object']['sha'] == base, 'base_changed')
    comments = [c for c in api.pages(f'{p}/issues/{number}/comments') if c['body'].startswith(MARKER)]
    require(bool(comments), 'assessment_missing')
    comment = comments[-1]  # no fallback from a newer invalid assessment
    assessment = strict_json(comment['body'][len(MARKER):].strip())
    files = api.pages(f'{p}/pulls/{number}/files')
    require(len(files) == pr['changed_files'] and all(f['status'] == 'modified' for f in files), 'changed_files_incomplete_or_renamed')
    protection = api.get(f'{p}/branches/{branch}/protection')
    rulesets = api.pages(f'{p}/rulesets?includes_parents=true')
    require(not any(r['enforcement'] != 'disabled' for r in rulesets), 'ruleset_interpretation_requires_owner')
    reviews_policy = protection['required_pull_request_reviews']
    check_policy = protection['required_status_checks']
    require('Dependency Risk Gate' not in check_policy['contexts'], 'recursive_gate_requirement')
    require(check_policy['strict'] is True and protection['enforce_admins']['enabled'] is True
            and protection['required_conversation_resolution']['enabled'] is True
            and reviews_policy['dismiss_stale_reviews'] is True
            and reviews_policy['required_approving_review_count'] >= 1, 'protection_requirements_unverified')
    require(set(check_policy['contexts']) == {c['context'] for c in check_policy['checks']}, 'required_check_list_incomplete')
    require(all(c['app_id'] == (46505 if c['context'] == 'GitGuardian Security Checks' else 15368)
                for c in check_policy['checks']), 'required_check_origin_unverified')
    # Read actual review decision/threads, not only REST mergeable_state.
    review_decision, threads_resolved = api.review_state(number)
    reviews = api.pages(f'{p}/pulls/{number}/reviews')
    permissions = {}
    for review in reviews:
        user = review['user']
        if user['type'] == 'User':
            login = urllib.parse.quote(user['login'], safe='')
            if login not in permissions:
                permissions[login] = api.get(f'{p}/collaborators/{login}/permission')['permission']
            review['permission'] = permissions[login]
        else:
            review['permission'] = 'none'
    checks = api.pages(f'{p}/commits/{head}/check-runs?filter=latest', 'check_runs')
    require(not api.pages(f'{p}/commits/{head}/statuses'), 'legacy_status_context_requires_owner')
    normalized = [{'name': c['name'], 'status': c['status'], 'conclusion': c['conclusion'],
                   'head_sha': c['head_sha'], 'app_id': c['app']['id'], 'url': c['html_url']} for c in checks]
    substantive = [c['name'] for c in normalized if c['name'] not in OPTIONAL_SKIPS
                   or c['name'] in check_policy['contexts']]
    require(len(set(substantive)) == len(substantive), 'ambiguous_duplicate_check_names')
    runs = api.pages(f'{p}/actions/runs?head_sha={head}&event=pull_request', 'workflow_runs')
    for path in ('.github/workflows/ci.yml', '.github/workflows/quality.yml'):
        selected = [r for r in runs if r['path'] == path]
        require(bool(selected), 'required_workflow_missing')
        run = max(selected, key=lambda r: r['id'])
        require(run['status'] == 'completed' and run['conclusion'] == 'success', 'workflow_not_success')
        require(any(r['number'] == number and r['head']['sha'] == head and r['base']['sha'] == base
                    for r in run['pull_requests']), 'workflow_base_or_head_mismatch')
        jobs = api.pages(f"{p}/actions/runs/{run['id']}/jobs")
        for job in jobs:
            if job['name'] in REQUIRED_JOBS:
                require(job['status'] == 'completed' and job['conclusion'] == 'success', 'required_job_not_success')
                require(job.get('steps') and all(s['conclusion'] == 'success' or
                        (s['conclusion'] == 'skipped' and s['name'] in OPTIONAL_FAILURE_STEPS)
                        for s in job['steps']), 'required_step_not_success')
        expected = QUALITY_JOBS if path.endswith('quality.yml') else REQUIRED_JOBS - QUALITY_JOBS
        require(expected <= {j['name'] for j in jobs}, 'matrix_job_missing')
    def lock(sha):
        result = api.get(f'{p}/contents/yarn.lock?ref={sha}')
        require(result['encoding'] == 'base64', 'lock_content_unavailable')
        return base64.b64decode(result['content']).decode('utf-8')
    parents = api.get(f'{p}/git/commits/{head}')['parents']
    merge = api.get(f"{p}/git/commits/{pr['merge_commit_sha']}")
    e = {'repository': REPOSITORY, 'pr_number': number, 'pr_url': pr['html_url'],
         'head_sha': head, 'base_sha': base, 'head_parent': parents[0]['sha'] if len(parents) == 1 else None,
         'merge_parents': [x['sha'] for x in merge['parents']],
         'open': pr['state'] == 'open', 'draft': pr['draft'],
         'same_repository': pr['head']['repo']['full_name'] == REPOSITORY,
         'author': pr['user']['login'], 'author_id': pr['user']['id'], 'author_type': pr['user']['type'],
         'changed_files': sorted(f['filename'] for f in files),
         'base_lock': lock(base), 'head_lock': lock(head),
         'mergeable': pr['mergeable'], 'mergeable_state': pr['mergeable_state'],
         'protections_verified': True, 'required_approvals': reviews_policy['required_approving_review_count'],
         'review_decision': review_decision, 'threads_resolved': threads_resolved,
         'reviews': reviews, 'checks': normalized, 'required_checks': [c['context'] for c in check_policy['checks']],
         'assessment_url': comment['html_url'], 'assessment_updated_at': comment['updated_at'], 'jobs_verified': True,
         'complete': True, 'coverage_gaps': [], 'observed_at': dt.datetime.now(dt.timezone.utc).isoformat()}
    again = api.get(f'{p}/pulls/{number}')
    require(again['head']['sha'] == head and again['base']['sha'] == base
            and again['merge_commit_sha'] == pr['merge_commit_sha']
            and again['mergeable_state'] == pr['mergeable_state'], 'pr_changed_during_evaluation')
    require(api.get(f'{p}/git/ref/heads/{branch}')['object']['sha'] == base, 'base_changed')
    require(api.review_state(number) == (review_decision, threads_resolved), 'review_changed_during_evaluation')
    current_comment = api.get(f"{p}/issues/comments/{comment['id']}")
    require(current_comment['body'] == comment['body'] and
            current_comment['updated_at'] == comment['updated_at'], 'assessment_changed_during_evaluation')
    return assessment, e


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', required=True)
    parser.add_argument('--pr', required=True, type=int)
    args = parser.parse_args()
    result = {'schema_version': 'anitrend.security-runner.v1', 'decision': 'neutral',
              'risk': 'unknown', 'confidence': 'low', 'automerge_allowed': False,
              'release_allowed': False, 'blockers': []}
    try:
        require(args.pr > 0, 'invalid_pr_number')
        a, e = collect(GitHub(args.repo, os.environ.get('GH_TOKEN')), args.pr)
        result.update(evaluate(a, e))
        result.update({'head_sha': e['head_sha'], 'base_sha': e['base_sha']})
    except Blocked as ex:
        result['blockers'] = [str(ex)]
    except Exception:
        result['blockers'] = ['malformed_or_unavailable_evidence']
    print(json.dumps(result, separators=(',', ':')))
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as out:
            out.write('## Dependency risk gate\n\n```json\n' + json.dumps(result) + '\n```\n')
    return 0 if result['automerge_allowed'] else 1


if __name__ == '__main__':
    sys.exit(main())
