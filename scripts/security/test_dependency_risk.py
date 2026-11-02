"""Offline adversarial tests. Fictional data below is not production evidence."""
import copy
import base64
import json
import unittest
from unittest.mock import patch

import dependency_risk as gate


def lock(version, name='fixture-package', edge='^1.0.0'):
    return ('# Fixture only\n\n__metadata:\n  version: 8\n\n'
            f'"{name}@npm:^6.1.1":\n  version: {version}\n'
            f'  resolution: "{name}@npm:{version}"\n'
            f'  dependencies:\n    fixture-child: "npm:{edge}"\n'
            f'  checksum: 10c0/{"a" * 128}\n  languageName: node\n  linkType: hard\n')


def fixture():
    head, base = 'a' * 40, 'b' * 40
    checks = [{'name': n, 'head_sha': head, 'status': 'completed',
               'conclusion': 'success', 'app_id': 46505 if n == 'GitGuardian Security Checks' else 15368,
               'url': 'https://github.com/AniTrend/anitrend-website/actions/runs/1/job/' + str(i)}
              for i, n in enumerate(sorted(gate.REQUIRED_JOBS | {'GitGuardian Security Checks', 'Container Security Scan'}), 1)]
    e = {'repository': gate.REPOSITORY, 'pr_number': 1,
         'pr_url': 'https://github.com/AniTrend/anitrend-website/pull/1',
         'base_sha': base, 'head_sha': head, 'complete': True, 'coverage_gaps': [],
         'open': True, 'draft': False, 'same_repository': True,
         'author': 'dependabot[bot]', 'author_id': 49699333, 'author_type': 'Bot',
         'changed_files': ['yarn.lock'], 'base_lock': lock('6.1.4'), 'head_lock': lock('6.1.5'),
         'head_parent': base, 'merge_parents': [base, head], 'mergeable': True,
         'mergeable_state': 'clean', 'protections_verified': True, 'required_approvals': 1,
         'assessment_url': 'https://github.com/AniTrend/anitrend-website/pull/1#issuecomment-1',
         'assessment_updated_at': '2026-10-31T00:00:00Z',
         'observed_at': '2026-10-31T00:30:00+00:00',
         'reviews': [], 'required_checks': [], 'checks': checks, 'jobs_verified': True}
    e['reviews'] = [{'user': {'id': 123, 'type': 'User'}, 'state': 'APPROVED',
                     'commit_id': head, 'body': 'Risk assessment: ' + e['assessment_url'],
                     'permission': 'write', 'submitted_at': '2026-10-31T00:01:00Z'}]
    a = {'schema_version': 'anitrend.security-runner.v1', 'assessed_at': '2026-10-31T00:00:00Z',
         'repository': gate.REPOSITORY, 'pr_number': 1, 'pr_url': e['pr_url'],
         'base_sha': base, 'head_sha': head, 'changed_files': ['yarn.lock'],
         'dependency_changes': gate.lock_changes(e['base_lock'], e['head_lock']),
         'advisory_aliases': [], 'severity': 'unknown', 'findings': [],
         'decision': 'approve', 'risk': 'low', 'confidence': 'high', 'update_type': 'semver-patch',
         'breaking_change_assessment': 'compatible', 'breaking_change_evidence': 'Fictional release evidence',
         'runtime_impact': 'low', 'runtime_impact_evidence': 'Fictional scope evidence',
         'required_checks': [{'name': c['name'], 'sha': head, 'result': 'success', 'url': c['url']}
                             for c in checks if c['name'] != 'Container Security Scan'],
         'scans': [{'surface': surface, 'scanner': 'fixture', 'version': '1.0.0',
                    'advisory_data_timestamp': None, 'scope': 'fixture only', 'tested_sha': head,
                    'status': 'pass', 'introduced_findings': 0,
                    'url': next(c['url'] for c in checks if c['name'] == gate.SCAN_JOBS[surface])}
                   for surface in ['resolved-dependencies', 'code', 'secrets', 'container']],
         'coverage_gaps': [], 'manual_follow_up': [],
         'sources_checked': [{'kind': 'official-release-notes', 'url': 'https://example.org/fixture'}],
         'automerge_allowed': True, 'release_allowed': False}
    return a, e


class FixtureAPI:
    """Complete synthetic collector path; never contacts GitHub."""
    prefix = '/repos/' + gate.REPOSITORY

    def __init__(self):
        self.a, self.e = fixture()
        self.comment = {'id': 1, 'body': gate.MARKER + json.dumps(self.a),
                        'html_url': self.e['assessment_url'], 'updated_at': self.e['assessment_updated_at']}
        self.reads = 0
        self.mutate_head = self.mutate_comment = False

    def get(self, path):
        e = self.e
        if path.endswith('/pulls/1'):
            self.reads += 1
            return {'head': {'sha': 'd' * 40 if self.mutate_head and self.reads > 1 else e['head_sha'],
                             'repo': {'full_name': gate.REPOSITORY}},
                    'base': {'sha': e['base_sha'], 'ref': 'main'}, 'changed_files': 1,
                    'merge_commit_sha': 'c' * 40, 'html_url': e['pr_url'], 'state': 'open',
                    'draft': False, 'user': {'login': e['author'], 'id': e['author_id'], 'type': 'Bot'},
                    'mergeable': True, 'mergeable_state': 'clean'}
        if '/git/ref/' in path:
            return {'object': {'sha': e['base_sha']}}
        if path.endswith('/protection'):
            names = sorted(gate.REQUIRED_JOBS | {'GitGuardian Security Checks'})
            return {'required_status_checks': {'strict': True, 'contexts': names,
                        'checks': [{'context': n, 'app_id': 46505 if n == 'GitGuardian Security Checks' else 15368} for n in names]},
                    'required_pull_request_reviews': {'dismiss_stale_reviews': True, 'required_approving_review_count': 1},
                    'enforce_admins': {'enabled': True}, 'required_conversation_resolution': {'enabled': True}}
        if '/collaborators/' in path:
            return {'permission': 'write'}
        if '/git/commits/' in path:
            return {'parents': [{'sha': x} for x in ([e['base_sha']] if path.endswith(e['head_sha']) else e['merge_parents'])]}
        if '/contents/yarn.lock' in path:
            raw = e['base_lock'] if path.endswith(e['base_sha']) else e['head_lock']
            return {'encoding': 'base64', 'content': base64.b64encode(raw.encode()).decode()}
        if '/issues/comments/' in path:
            result = copy.deepcopy(self.comment)
            if self.mutate_comment:
                result['body'] += '\n'
            return result
        raise AssertionError('Unexpected fixture request: ' + path)

    def pages(self, path, field=None):
        if path.endswith('/comments'):
            return [self.comment]
        if path.endswith('/files'):
            return [{'filename': 'yarn.lock', 'status': 'modified'}]
        if '/rulesets' in path or path.endswith('/statuses'):
            return []
        if path.endswith('/reviews'):
            result = copy.deepcopy(self.e['reviews'])
            result[0]['user']['login'] = 'fixture-reviewer'
            return result
        if '/check-runs' in path:
            return [dict(c, app={'id': c['app_id']}, html_url=c['url']) for c in self.e['checks']]
        if '/actions/runs?' in path:
            return [{'id': i, 'path': p, 'status': 'completed', 'conclusion': 'success',
                     'pull_requests': [{'number': 1, 'head': {'sha': self.e['head_sha']}, 'base': {'sha': self.e['base_sha']}}]}
                    for i, p in [(1, '.github/workflows/ci.yml'), (2, '.github/workflows/quality.yml')]]
        if path.endswith('/jobs'):
            names = gate.QUALITY_JOBS if '/2/' in path else gate.REQUIRED_JOBS - gate.QUALITY_JOBS
            return [{'name': n, 'status': 'completed', 'conclusion': 'success',
                     'steps': [{'name': 'fixture-test', 'conclusion': 'success'}]} for n in names]
        raise AssertionError('Unexpected fixture collection: ' + path)


class GateTests(unittest.TestCase):
    def setUp(self):
        self.a, self.e = fixture()

    def blocked(self, code=None):
        with self.assertRaises(gate.Blocked) as ex:
            gate.evaluate(self.a, self.e)
        if code:
            self.assertEqual(str(ex.exception), code)

    def test_complete_fixture_is_eligible_but_never_release(self):
        result = gate.evaluate(self.a, self.e)
        self.assertTrue(result['automerge_allowed'])
        self.assertFalse(result['release_allowed'])

    def test_every_top_level_field_is_required(self):
        for field in list(self.a):
            with self.subTest(field=field):
                original = self.a.pop(field)
                self.blocked('schema_missing_field')
                self.a[field] = original

    def test_low_risk_and_high_confidence_only(self):
        for field, values in [('confidence', ['medium', 'low']), ('risk', ['medium', 'high', 'unknown']),
                              ('decision', ['neutral', 'changes_requested'])]:
            for value in values:
                with self.subTest(field=field, value=value):
                    a, self.e = fixture()
                    a[field] = value
                    self.a = a
                    self.blocked('manual_risk_decision')

    def test_sha_file_and_origin_guards(self):
        cases = [('head_sha', 'c' * 40), ('base_sha', 'c' * 40), ('same_repository', False),
                 ('complete', False), ('draft', True), ('open', False), ('author_id', 1),
                 ('author_type', 'User'), ('head_parent', 'c' * 40),
                 ('merge_parents', ['c' * 40, 'a' * 40]), ('mergeable', None),
                 ('mergeable_state', 'blocked'), ('protections_verified', False),
                 ('changed_files', ['package.json', 'yarn.lock']), ('jobs_verified', False)]
        for field, value in cases:
            with self.subTest(field=field):
                self.a, self.e = fixture()
                self.e[field] = value
                self.blocked()

    def test_pending_absent_cancelled_stale_and_spoofed_checks(self):
        for field, value in [('status', 'in_progress'), ('conclusion', 'cancelled'),
                             ('conclusion', 'skipped'), ('conclusion', 'failure'),
                             ('head_sha', 'c' * 40), ('app_id', 1)]:
            with self.subTest(field=field, value=value):
                self.a, self.e = fixture()
                self.e['checks'][0][field] = value
                self.blocked()
        self.a, self.e = fixture()
        self.e['checks'].pop()
        self.blocked()

    def test_green_wrapper_does_not_replace_matrix(self):
        self.e['checks'] = [c for c in self.e['checks'] if not c['name'].startswith('Build Matrix')]
        self.e['checks'].append({'name': 'Quality Report Summary', 'conclusion': 'success'})
        self.blocked('required_check_not_success')

    def test_container_unknown_and_wrong_scan_check_remain_blocked(self):
        self.e['checks'] = [c for c in self.e['checks'] if c['name'] != 'Container Security Scan']
        self.blocked('scan_evidence_not_verified')
        self.a, self.e = fixture()
        self.a['scans'][0]['url'] = self.a['scans'][1]['url']
        self.blocked('scan_evidence_not_verified')

    def test_duplicate_check_names_block_even_if_one_is_green(self):
        self.e['checks'].append(copy.deepcopy(self.e['checks'][0]))
        self.blocked('ambiguous_duplicate_check_names')

    def test_duplicate_approvals_do_not_count_twice(self):
        self.e['required_approvals'] = 2
        self.e['reviews'] *= 2
        self.blocked('independent_assessment_approval_missing')

    def test_review_bot_stale_self_readonly_and_edited_assessment(self):
        for field, value in [('commit_id', 'c' * 40), ('permission', 'read'),
                             ('body', 'LGTM'), ('submitted_at', '2026-10-30T00:00:00Z')]:
            with self.subTest(field=field):
                self.a, self.e = fixture()
                self.e['reviews'][0][field] = value
                self.blocked('independent_assessment_approval_missing')
        for user in [{'id': 123, 'type': 'Bot'}, {'id': 49699333, 'type': 'User'}]:
            self.a, self.e = fixture()
            self.e['reviews'][0]['user'] = user
            self.blocked('independent_assessment_approval_missing')

    def test_later_changes_requested_and_dismissal(self):
        for state in ['CHANGES_REQUESTED', 'DISMISSED']:
            self.a, self.e = fixture()
            review = copy.deepcopy(self.e['reviews'][0])
            review['state'] = state
            self.e['reviews'].append(review)
            self.blocked()

    def test_mismatched_dependency_claim_and_major(self):
        self.a['dependency_changes'][0]['to'] = '6.1.6'
        self.blocked('dependency_delta_mismatch')
        self.a, self.e = fixture()
        self.e['head_lock'] = lock('7.0.0')
        self.blocked('major_zero_prerelease_or_downgrade')

    def test_unknown_introduced_and_forged_scans(self):
        for field, value in [('status', 'unknown'), ('introduced_findings', 1),
                             ('tested_sha', 'c' * 40), ('url', 'https://example.org/forged')]:
            self.a, self.e = fixture()
            self.a['scans'][0][field] = value
            self.blocked()
        self.a, self.e = fixture()
        self.a['scans'].pop()
        self.blocked('missing_scan_surface')

    def test_expiry_future_and_missing_timezone(self):
        for value in ['2026-10-29T00:00:00Z', '2026-11-01T00:00:00Z', '2026-10-31T00:00:00']:
            self.a['assessed_at'] = value
            self.blocked('assessment_expired')

    def test_no_release_and_no_missing_to_safe_defaults(self):
        self.a['release_allowed'] = True
        self.blocked('merge_only_profile')
        self.a, self.e = fixture()
        self.a['coverage_gaps'] = ['container audit unknown']
        self.blocked('assessment_has_blockers')

    def test_schema_unknown_fields_type_and_keyword(self):
        self.a['extra'] = True
        self.blocked('schema_unknown_field')
        self.a, self.e = fixture()
        self.a['automerge_allowed'] = 'true'
        self.blocked('schema_type')
        with self.assertRaises(gate.Blocked):
            gate.structure({}, {'oneOf': []})

    def test_strict_json_rejects_duplicate_and_nonfinite(self):
        for text in ['{"risk":"low","risk":"high"}', '{"n":NaN}']:
            with self.assertRaises(gate.Blocked):
                gate.strict_json(text)

    def test_lock_rejects_graph_protocol_descriptor_and_metadata_changes(self):
        candidates = [lock('6.1.5', edge='^2.0.0'), lock('6.1.5').replace('npm:6.1.5', 'https://evil.invalid/pkg'),
                      lock('6.1.5').replace('npm:^6.1.1', 'npm:^6.2.0'),
                      lock('6.1.5').replace('  version: 8', '  version: 9'),
                      lock('6.1.5-beta'), lock('6.1.3'), lock('6.1.4'),
                      lock('6.1.5').replace('  checksum:', '  unknown:')]
        for candidate in candidates:
            with self.subTest(candidate=candidate[:60]):
                with self.assertRaises(gate.Blocked):
                    gate.lock_changes(lock('6.1.4'), candidate)

    def test_sensitive_packages_and_zero_major(self):
        for name in ['next', 'zod', 'jose', '@scope/auth-utils', 'crypto-js']:
            with self.assertRaises(gate.Blocked):
                gate.lock_changes(lock('6.1.4', name), lock('6.1.5', name))
        with self.assertRaises(gate.Blocked):
            gate.lock_changes(lock('0.1.0'), lock('0.2.0'))

    def test_api_pagination_and_partial_result(self):
        client = gate.GitHub(gate.REPOSITORY, 'fixture-not-a-credential')
        with patch.object(client, 'get', side_effect=[list(range(100)), [100]]):
            self.assertEqual(len(client.pages(client.prefix + '/pulls')), 101)
        with patch.object(client, 'get', return_value={'total_count': 5, 'check_runs': []}):
            with self.assertRaises(gate.Blocked):
                client.pages(client.prefix + '/commits/fixture/check-runs', 'check_runs')

    def test_api_scope_and_redirect_rejected(self):
        client = gate.GitHub(gate.REPOSITORY, 'fixture-not-a-credential')
        with self.assertRaises(gate.Blocked):
            client.get('/user')
        with self.assertRaises(gate.Blocked):
            gate.NoRedirect().redirect_request(None, None, None, None, None, None)

    def test_protection_denial_is_not_zero_requirements(self):
        class Denied:
            prefix = '/repos/' + gate.REPOSITORY
            def get(self, path):
                if path.endswith('/protection'):
                    raise gate.Blocked('api_unavailable_403')
                if '/git/ref/' in path:
                    return {'object': {'sha': 'b' * 40}}
                return {'head': {'sha': 'a' * 40}, 'base': {'sha': 'b' * 40, 'ref': 'main'}, 'changed_files': 1}
            def pages(self, path):
                if path.endswith('/comments'):
                    return [{'body': gate.MARKER + json.dumps(fixture()[0])}]
                return [{'status': 'modified'}]
        with self.assertRaisesRegex(gate.Blocked, 'api_unavailable_403'):
            gate.collect(Denied(), 1)

    def test_full_live_collector_shape_and_reread(self):
        api = FixtureAPI()
        a, e = gate.collect(api, 1)
        # The fixture assessment date is adjusted only for this synthetic test.
        e['observed_at'] = '2026-10-31T00:30:00+00:00'
        self.assertTrue(gate.evaluate(a, e)['automerge_allowed'])
        self.assertEqual(api.reads, 2)

    def test_head_and_assessment_races_block(self):
        for field in ['mutate_head', 'mutate_comment']:
            api = FixtureAPI()
            setattr(api, field, True)
            with self.assertRaises(gate.Blocked):
                gate.collect(api, 1)

    def test_missing_matrix_and_skipped_substantive_step_block_collector(self):
        api = FixtureAPI()
        original = api.pages
        def changed(path, field=None):
            rows = original(path, field)
            if path.endswith('/jobs'):
                rows[0]['steps'][0]['conclusion'] = 'skipped'
            return rows
        with patch.object(api, 'pages', side_effect=changed):
            with self.assertRaisesRegex(gate.Blocked, 'required_step_not_success'):
                gate.collect(api, 1)

    def test_no_connection_fails_closed(self):
        with patch.dict('os.environ', {}, clear=True), patch('sys.argv', ['gate', '--repo', gate.REPOSITORY, '--pr', '1']), patch('builtins.print') as out:
            self.assertEqual(gate.main(), 1)
            result = json.loads(out.call_args.args[0])
            self.assertFalse(result['automerge_allowed'])
            self.assertEqual(result['blockers'], ['repository_or_connection_missing'])


if __name__ == '__main__':
    unittest.main()
