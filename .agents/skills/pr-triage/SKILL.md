---
name: pr-triage
description: >-
  Triage a single react-native-firebase PR: rebase onto main, consult gh pr
  checks, apply mapped CI fixes (lint, type, docs), address review comments, and
  review the PR diff for fixable issues. Useful both for contributors preparing
  their own PR and for the maintainer harness. Never pushes — changes stay local
  for review.
metadata:
  owner_team: contributors
  maintainer: mike
  status: draft
  tags: pr,triage,ci,lint,rebase,react-native-firebase
  last_reviewed: "2026-06-06"
  version: "0.1.0"
---

# PR triage

Prepare a single PR so its CI is green and its diff is review-ready, fixing what
can be fixed locally. This skill is useful two ways:

- **Contributors:** run it against your own PR branch in your local checkout to
  reproduce and fix CI failures before requesting review.
- **Maintainer harness:** the `pr-triage` subagent loads this skill; the
  maintainer passes worktree paths and a report path in the task prompt.

Repo: `invertase/react-native-firebase`.

## Where you work

- **Harness mode:** the task prompt provides `Primary clone`, `Worktrees root`,
  `Worktree name` (`pr{N}-triage`), a `Report path`, and the path to a `Worktree
  discipline` reference. Read that reference and follow it exactly: all task work
  happens in the worktree, never in the primary clone.
- **Standalone mode:** work on the PR branch in your own checkout. You can skip
  the worktree/primary-clone mechanics; the rebase, checks, and review steps below
  still apply.

## Hard rules

- **`git push` is never allowed by this skill.** Commits are allowed; a human (or
  the PR author) pushes after review.
- **One conflict-resolution attempt** for rebase. If still conflicted, abort and
  report `blocked`.
- **Best effort:** if stuck (step limit, unclear intent), report `blocked` or
  `needs_human` — do not loop indefinitely.

## Workflow

### 0. Optional: prior pr-verifier findings

If the task prompt includes `findings_for_triage`, read those first and address
critical/serious items before re-verification.

### 1. Resolve PR head (before any git setup)

```bash
gh pr view {N} --repo invertase/react-native-firebase \
  --json headRepository,headRefName,baseRefName \
  --jq '{head_repo: .headRepository.nameWithOwner, head_branch: .headRefName, base: .baseRefName}'
```

Record `head_repo`, `head_branch`, and `head_owner` (the part before `/` in
`head_repo`). You need these for checkout and push-remote setup.

### 2. Get onto the PR branch

**Harness mode** — from the **primary clone cwd**, create/reuse the worktree per
the worktree discipline reference, then from the **worktree cwd**:

```bash
gh pr checkout {N} --repo invertase/react-native-firebase
git rev-parse --short HEAD
```

This checks out the PR's real head branch and configures the correct fork/upstream
via `gh` — **not** a synthetic `origin/pr/{N}` ref. **Do not** use
`git worktree add … origin/pr/{N} -b pr-{N}-triage`; that leaves a local-only
branch tracking a non-pushable ref.

**Standalone mode** — `gh pr checkout {N}` in your checkout.

#### 2b. Push-remote repair (reuse / legacy worktrees)

If the branch is `pr-{N}-triage` or `@{u}` is `origin/pr/{N}`, repair **without**
discarding local commits:

```bash
HEAD_REPO=…   # from step 1
HEAD_BRANCH=…
HEAD_OWNER=…  # owner segment of HEAD_REPO
PUSH_REMOTE=origin
if [ "$HEAD_REPO" != "invertase/react-native-firebase" ]; then
  git remote add "$HEAD_OWNER" "git@github.com:${HEAD_REPO}.git" 2>/dev/null || \
    git remote set-url "$HEAD_OWNER" "git@github.com:${HEAD_REPO}.git"
  PUSH_REMOTE="$HEAD_OWNER"
fi
git fetch "$PUSH_REMOTE" "$HEAD_BRANCH"
git branch -m "$HEAD_BRANCH"
git branch -u "$PUSH_REMOTE/$HEAD_BRANCH"
```

Verify (dry-run only — **never push** here):

```bash
git branch -vv
git push --dry-run
```

After a rebase onto `main`, dry-run may show **non-fast-forward**; that is
expected. A human push after review uses `git push --force-with-lease`.

### 3. Rebase onto main

```bash
git fetch origin
git rebase origin/main
```

- On conflict: resolve once, `git rebase --continue`.
- If unresolvable or a second conflict wave: `git rebase --abort` →
  `verdict: blocked`, `rebase: failed`.

### 3.5. Local changes (commits or working tree)

After rebase, detect local work not on the remote PR head:

```bash
git fetch "$PUSH_REMOTE" "$HEAD_BRANCH"
git log "$PUSH_REMOTE/$HEAD_BRANCH"..HEAD --oneline
git status --porcelain
```

If there are **local commits** and/or **uncommitted changes**, treat them as
**intentional** — they belong to the PR. **Do not stop or skip triage.**

- Record them in the report under **Local changes**.
- Set `manual_work_preserved: true` in the YAML summary.
- **Continue with steps 4–6 in full.** Local fixes may already resolve some CI
  failures; verify what still needs work.

Do not discard, reset, or rewrite local commits or uncommitted changes unless a
rebase conflict requires it.

### 4. PR checks (remote CI status)

```bash
gh pr checks {N} --repo invertase/react-native-firebase \
  --json name,bucket,state,link,workflow --jq '.[] | {name, bucket, state, workflow}'
```

- `bucket: fail` — attempt the mapped local fix below.
- `bucket: pass` / `skipping` — no action.
- `bucket: pending` — note in report; do not block triage on waiting for CI.
- No mapping — note it under **PR checks**; do not guess broad code changes.

Record each failing check name, attempted fix, and outcome in the report.

#### Check → local fix mapping

| Check name (approx.) | Workflow | Local action |
|----------------------|----------|--------------|
| **Lint** | Code Quality Checks | See [Lint failure playbook](#lint-failure-playbook) |
| **TypeScript Build Validation** | Code Quality Checks | Reproduce: `yarn tsc:compile`. Fix type errors; commit. No auto-fix script. |
| **Consumer Type Test** | Code Quality Checks | Reproduce: `yarn tsc:compile:consumer`. Fix types; commit. |
| **TypeDoc Generation** | Code Quality Checks | Reproduce: `yarn reference:api`. Fix doc/type issues; commit. |
| **Spelling & Grammar** | docs | `yarn lint:markdown`, then `yarn lint:spellcheck`. Fix reported paths; commit. |
| **Jest**, **iOS (…)**, **Android (…)** | test workflows | Do **not** attempt full fixes in triage. Note failure; verification runs `scripts/run-full-tests.sh`. |
| **Compare Types with Firebase JS SDK** | rnfb-js-sdk-comparison | Reproduce locally if a script exists; otherwise `needs_human`. |

#### Lint failure playbook

When **Lint** (or local `yarn lint`) fails, run from the checkout/worktree cwd in
this order:

1. **iOS formatting**
   ```bash
   yarn lint:ios:fix
   ```
   Commit if `git status` shows changes under `packages/*/ios/`.

2. **Android formatting** (may modify files; exits non-zero until changes are
   committed)
   ```bash
   yarn lint:android
   ```
   - If it reports android files changed from linting, stage, commit, then re-run
     (up to **2 retries** total for this step).
   - Example commit message: `style(android): apply google-java-format`

3. **JS formatting / ESLint**
   ```bash
   yarn lint:js --fix
   ```
   Commit if eslint/prettier changed files.

4. **Verify full lint suite**
   ```bash
   yarn lint
   ```
   - If still failing, capture the failing sub-command and report `needs_human`
     unless clearly auto-fixable with one more targeted pass.

**Import order exception:** If `lint:ios:check` fails because `clang-format` wants
to reorder `#import` lines but the PR intentionally requires
`#import <React/RCTBridgeModule.h>` before Firebase (see #8883), do **not** run
`lint:ios:fix`. Add `// clang-format off` / `// clang-format on` around the
intentional import block instead, then re-check.

Combine lint-related commits when sensible, or keep separate per platform if
clearer.

### 5. Review comments, PR review, and issue resolution

**Review comments**

```bash
gh pr view {N} --repo invertase/react-native-firebase
gh pr view {N} --repo invertase/react-native-firebase --comments
```

Use `gh api` for unresolved review threads if needed. Address valid
critical/serious feedback with local commits. If intent conflicts with the base
branch, `needs_human`.

**PR review (full diff)**

Review the change set (`git diff origin/main...HEAD`, PR description, files
touched). Look for bugs, missing tests, regressions, and issues CI did not catch.
Fix what you can with local commits; escalate ambiguous or high-risk items as
`needs_human`. Include any local changes from step 3.5 in the review scope.

### 6. Commit locally

- Stage and commit fixes with conventional messages.
- Never push.

### 7. Write report

In harness mode, write full detail to the **Report path** from the task prompt.
In standalone mode this section is optional. Structure:

```markdown
# Triage report — PR #{N}

**Completed:** {ISO8601}
**Worktree:** {absolute path or checkout}

## Summary
…
## Rebase
…
## Push remote
Record head_repo, head_branch, push remote name, and `git branch -vv`. Note if
`git push --dry-run` would require `--force-with-lease` after rebase.
## Local changes
…
## PR checks
…
## PR review
…
## Commits added
…
## Review comments addressed
…
## Blockers
…
```

### 8. Return YAML summary (harness mode)

Return this block to the parent (no diffs, no full logs):

```yaml
pr: {N}
verdict: done | blocked | needs_human
worktree: {worktree absolute path}
commits_added: 0
minutes_worked: 0
rebase: clean | conflicts_resolved | failed
manual_work_preserved: true | false
pr_checks: all_pass | fixes_applied | failures_remain | pending | skipped
push_remote: origin | {fork_owner}
head_branch: {branch name from gh pr view}
push_ready: true | false
report_path: {report path}
summary: "One-line outcome."
blockers: []
```

**done** — rebase succeeded (or already current), CI/comments/PR review addressed
to best effort, ready for verification.
**blocked** — could not complete after best effort (rebase failed, step limit,
environment error).
**needs_human** — ambiguous conflicts, conflicting review intent, or changes
requiring human judgment.
