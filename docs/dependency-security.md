# Dependency security maintenance

`yarn check:security` audits the complete dependency graph, including development
dependencies. It rejects unmitigated high/critical findings and fails on network,
timeout, malformed-report, and unexpected-severity errors. CI uploads the complete
JSON report, including mitigated findings. No advisory is globally ignored in
`.yarnrc.yml`.

## Temporary braces 3.0.3 backport

As of 2026-10-11, GHSA-vfj7-8cjw-p6xm affects every released `braces` version.
Tailwind 3's watcher and micromatch consumers still require it. Instead of renaming
the package or ignoring its advisory, Yarn applies the five library-file changes
from [micromatch/braces#72](https://github.com/micromatch/braces/pull/72), pinned to
commit `28d440b5dd449dbf1fe6f3506cf94ecca4d02660`.

The patch caps brace/parenthesis parsing and recursive AST walking at depth 100,
rejects cyclic expansion parent chains, and preserves the released stringify
behavior. The published 3.0.3 suite passed all 764 cases with the backport; adding
the applicable upstream security tests passed 772 cases locally.

The CI verifier checks every installed copy's name, version, and SHA-256 of all
five changed files, plus normal expansions, escaped-invalid compatibility, the
100/101 boundary, fractional/infinite limits, 4,000-deep strings/direct ASTs, and
cyclic parent chains. Only then may the audit policy classify the exact advisory
ID `1240992` / GHSA-vfj7-8cjw-p6xm on `braces@3.0.3` as mitigated. It remains in
the report; another braces advisory or version is rejected. This is a maintained
local security backport, not an official fixed release.

To retire it, upgrade to a reviewed official release or a supported parent
toolchain that removes braces, delete both braces resolutions and the patch,
update/remove the verifier and exact policy branch, then regenerate the lockfile
with Yarn. Require immutable install, security-policy tests, full audit, lint,
typecheck, production build, and Playwright tests before merging.

## Patched transitive versions

The lockfile refresh updates brace-expansion's 1.x and 5.x lines and source-map-js
within their parent ranges. Firebase Firestore still constrains grpc-js to 1.9.x,
so the resolution requires the compatible 1.x security release range `^1.13.6`.
Remove that override when Firestore itself selects a non-vulnerable version.
Next 16.3.8 also fixes the image-optimization SSRF and associated cache advisories.
