---
name: pr-verification
description: >-
  Verify a single react-native-firebase PR: install deps, Phase 1 read-only code
  review with a severity rubric, Phase 2 full local tests only when there are no
  critical or serious findings. Useful for contributors self-checking a PR and for
  the maintainer harness pr-verifier. Never pushes.
metadata:
  owner_team: contributors
  maintainer: mike
  status: draft
  tags: pr,verification,review,tests,react-native-firebase
  last_reviewed: "2026-06-06"
  version: "0.1.0"
---

# PR verification

Independently verify a PR after triage. Two ways to use it:

- **Contributors:** sanity-check your own PR before requesting review.
- **Maintainer harness:** the `pr-verifier` subagent loads this skill; the maintainer
  passes the worktree path and a report path in the task prompt.

In harness mode, work only inside the provided worktree path and follow the
worktree discipline reference whose path the maintainer provides in the task
prompt (if given). In standalone mode, work in your checkout of the PR branch.

## Hard rules

- **`git push` is never allowed.**
- **Install dependencies first** — run `yarn install` before any other `yarn`
  script or verification command.
- **Phase 1 is read-only** — no file edits.
- **Phase 2 runs only** when the Phase 1 gate passes (zero critical, zero serious
  findings).
- Best effort; on step limit or failure, report `blocked` with partial findings.
- **Worktree-local recovery only** — never run commands that affect global state
  (`yarn cache clean`, `corepack`, global npm/yarn config changes, etc.).

## Bootstrap — install dependencies

From the checkout/worktree cwd, before Phase 1 commands that need the toolchain
and before Phase 2:

```bash
yarn install
```

- Run at the start of every verification.
- `scripts/run-full-tests.sh` may run install again internally — that is fine.

### If `yarn install` fails

Do **not** immediately report `blocked`. Read the error, then apply the **only**
allowed recovery (worktree-local):

```bash
rm -rf node_modules && yarn install
```

- **One recovery attempt** after the initial failure (two `yarn install` runs
  total).
- Do **not** use `yarn cache clean`, `corepack enable`, or any other global-state
  command.
- Lockfile out of sync with `package.json` → `verdict: needs_human` (do not edit
  `package.json` or `yarn.lock`).
- Node engine mismatch → note required version; `verdict: needs_human`.
- Any other error after recovery fails → `verdict: blocked` with the last error
  excerpt.

Record attempts in the report **Bootstrap** section. Proceed to Phase 1 only
after a successful install.

## Phase 1 — Review (read-only)

Review the PR change set (diff vs `origin/main`, PR description, tests touched).

Classify **each** finding:

| Severity | Definition |
|----------|------------|
| **critical** | Would cause production failure, data loss, security hole, or definite break |
| **serious** | Likely bug, missing tests for non-trivial logic, broken API contract, or issue triage should fix |
| **minor** | Suboptimal but mergeable (naming, small refactor suggestion) |
| **nit** | Style or preference only |

### Gate rule

- **Any `critical` or `serious` finding** → `verdict: serious_findings`. **Do not
  run Phase 2.**
- **Only `minor`, `nit`, or none** → proceed to Phase 2.

List critical/serious items with `file:line` (or file scope) in
`findings_for_triage` for the maintainer retry loop.

## Phase 2 — Local tests

Only when the Phase 1 gate passes and bootstrap completed.

From the checkout/worktree cwd:

```bash
bash scripts/run-full-tests.sh
```

- The script redirects bulk output to temp logs; on failure it prints the log —
  include a short excerpt in the report, not full output.
- Pass → `verdict: pass`
- Fail → `verdict: tests_failed`

## Write report

In harness mode, write full detail to the **Report path** from the task prompt.

```markdown
# Verification report — PR #{N}

**Completed:** {ISO8601}
**Worktree:** {absolute path or checkout}

## Bootstrap
**yarn install:** succeeded | failed (recovered) | failed (blocked)
**Recovery attempts:** …

## Phase 1 — Review
### Findings
| Severity | Location | Description |
|----------|----------|-------------|
| … | … | … |
**Gate:** pass | blocked (critical/serious present)

## Phase 2 — Tests
**Run:** yes | no (gate blocked)
**Result:** passed | failed | skipped
### Test excerpt (failures only)
…
```

## Return YAML summary (harness mode)

```yaml
pr: {N}
verdict: pass | serious_findings | tests_failed | needs_human | blocked
review_severity: none | minor | serious | critical
minutes_worked: 0
tests_run: true | false
tests_passed: true | false | null
report_path: {report path}
summary: "One-line outcome."
findings_for_triage:
  - severity: serious
    location: path/to/file.ts:42
    description: "…"
test_log_excerpt: ""
```

### Verdict mapping

| verdict | When |
|---------|------|
| `pass` | Gate passed and tests passed |
| `serious_findings` | Any critical or serious in Phase 1 |
| `tests_failed` | Gate passed, tests failed |
| `needs_human` | Review inconclusive or needs judgment |
| `blocked` | Step limit, environment error, or could not complete |

**review_severity:** highest severity found in Phase 1 (`none` if no findings).
