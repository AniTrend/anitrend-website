# Website dependency risk gate

This is a **read-only eligibility validator**, not an approval, merge bot, release
pipeline, vulnerability scanner, or proof of deployment. It adapts local-stack's
trusted-base review strategy to `anitrend.security-runner.v1`. It does not inherit
medium-confidence approval or duplicate approvals from one identity.

## Trust boundary

`auto-approve.yml` replaces unconditional Renovate approval with a read-only gate.
It checks out the trusted base SHA, never the PR head, and installs nothing. It
does not mint App tokens or expose repository secrets to dependency code. The
checkout action is pinned to the full v7 commit already observed in this repo's
CI. JSON is data, not shell/code; API redirects are refused. API errors, denied
protection reads, incomplete pagination, ambiguous checks, and unknown evidence
produce `neutral`, `automerge_allowed=false`, and a failing gate job.

The workflow has **no review/merge/release write authority**. Its successful
output is a short-lived eligibility snapshot, not permission to bypass GitHub.
A separate authorized runner must re-read head/base/checks/reviews immediately
before using the expected head SHA with a normal protected merge. Never reuse a
green result after either SHA changes. Release and deployment remain separately
authorized and verified; this profile always emits `release_allowed=false`.

## Assessment contract

Post or update one PR conversation comment whose body is exactly:

```text
<!-- anitrend.security-runner.v1 -->
{...complete JSON matching dependency-risk.schema.json...}
```

The schema requires exact repository, PR number/URL, base/head SHA, actual changed
files, dependency delta, advisory aliases/severity, findings with scope and
reachability evidence, decision/risk/confidence/update type, compatibility/runtime
evidence, required check URLs/results/SHAs, four scan surfaces and scanner versions,
advisory-data timestamp (null if unavailable), coverage gaps, manual follow-up,
official sources, and both action booleans. No omitted-to-safe defaults. Empty
findings means a completed scan found none, never that scanning was unavailable.
Unknown scan surfaces must remain unknown, and therefore block eligibility.
Scan URLs must resolve to the corresponding successful CI check: Dependency
Security Scan, Static Code Analysis, GitGuardian Security Checks, and Container
Security Scan respectively. This repository currently lacks the last check;
container coverage is therefore a real blocker, not an inferred pass from a
successful application build. This PR does not implicitly enable a new scanner.

The latest marked comment is used; malformed newer data never falls back to an
older pass. Do not include secrets, private alert details, or exploit material in
public comments. Use private reporting for sensitive findings; that work will
remain manual rather than leaking its assessment into this public gate.

An independent human maintainer must review the actual diff, official advisories
and release notes, full resolved-graph report and other scan evidence, including
introduced vs pre-existing findings. On the **current head**, submit an approval
with a body containing:

```text
Risk assessment: https://github.com/AniTrend/anitrend-website/pull/NUMBER#issuecomment-ID
```

The approval must be later than the assessment's last edit. Only distinct human
identities with write/maintain/admin permission count. Bot/self/stale/dismissed
reviews and repeated approvals by one identity do not count. Any outstanding
changes-requested decision blocks. GitHub's clean mergeability state plus readable
branch protection must also demonstrate that configured approvals, CODEOWNER and
conversation rules are satisfied. The model's semantic claims are not treated as
an independent security control: the human attests them and the validator checks
the independently observable facts.

## Intentionally narrow first eligibility profile

- Same-repository genuine Renovate/Dependabot identity, non-draft, open PR.
- Only `yarn.lock` modified. Whole before/after blocks are compared, not a claimed
  file list. Only version, npm resolution, and integrity may change; descriptors,
  graph edges, metadata, protocols, source, workflows, patches, and manifests may
  not. Major/zero-major/prerelease/downgrade/sensitive auth/crypto/Next/Zod changes
  require manual review. Other ecosystems and runner-authored PRs are manual.
- `approve`, **low risk and high confidence**; compatible release notes, no
  gaps/follow-up, target findings fixed, zero introduced vulnerabilities, and no
  unmitigated residual high/critical/unknown findings. Existing owner-approved
  exception handling is deliberately not automated by this first profile.
- One head commit directly on the current base and the exact current merge
  candidate's parents must match. Assessment age is at most 24 hours.
- Every pinned substantive job (including **both Node 20/22 matrix jobs**, browser,
  security, lint/type and builds) plus repository-required checks must complete
  successfully from the expected GitHub App on the exact head/current base.
  Individual job steps are checked. The only optional skipped step is browser
  `Upload failure evidence` after successful tests. Optional skipped checks are
  deployment readiness (non-main PR), legacy approval (disabled), and autolabeling
  (not a validation gate). A green Quality summary cannot replace failed jobs.
- Protection must be readable and strict, with stale-review dismissal, at least
  one human, conversation resolution, and admin enforcement. Active rulesets,
  legacy status contexts, duplicate substantive check names or unverified policy semantics
  remain blocked until a separately reviewed implementation supports them.

## Running and rollout

```bash
python3 -m unittest discover -s scripts/security -p 'test_dependency_risk.py' -v
# Use only a normally configured, least-privilege read token. Never print it.
python3 scripts/security/dependency_risk.py --repo AniTrend/anitrend-website --pr NUMBER
```

`GH_TOKEN` is read only by the API collector. There is no offline evidence-file
mode that can accidentally be mistaken for a live authorization. Tests use
fictional in-memory evidence and include negative/stale/unknown/spoofing cases.

After a human merges this workflow PR, new/synchronized PRs or marked assessment
comments run the trusted gate. After CI or review changes, re-run it through
`workflow_dispatch` on **main** (the previous dispatch input name is retained).
Do not dispatch untrusted branches. Current PRs cannot use this unmerged validator
to authorize themselves, and this workflow PR itself requires human review.

No branch protection, rulesets, permissions, environments, or security features
are changed. In particular, **this PR does not install a new required check**.
Until an owner separately chooses policy integration, the scheduled runner must
consult the validator and existing protections; a non-required green check alone
does not enforce this contract. Do not broaden access or weaken repository policy
to make a protection-read failure green.

`pull_request_target` and comment-triggered results are not automatically PR-head
checks. Do not simply mark this target job as a required head check: that would
also introduce a circular dependency on its own result. A future owner-reviewed
integration must bind the validator's exact-SHA result into the protected merge
path. This PR intentionally does not grant the permissions needed to do that.

References:

- [local-stack trusted workflow](https://github.com/AniTrend/local-stack/blob/dev/.github/workflows/renovate-opencode-gate.yml)
- [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use)
- [pull_request_target](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target)
