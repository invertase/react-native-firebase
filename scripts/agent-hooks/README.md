# Agent hooks (Cursor + Claude Code)

Shared commit / validation / compaction hooks for React Native Firebase agent sessions.

## What they do

1. **`gate-commit.js`** (before shell / PreToolUse)
   - Deny `git commit --no-verify`
   - Deny staged `.only(`, `tests/harness.overrides.js`, or `RNFBDebug: true`
   - Deny committing staged `packages/**` or `tests/**` without fresh OKF validation evidence
2. **`record-validation.js`** (after shell / PostToolUse)
   - On allowlisted OKF validation commands, write `.git/rnfb-validation-evidence.json`
3. **`handoff-nudge.js`** (preCompact / PreCompact)
   - Remind to update Linear before context compaction

Evidence is intentionally not forge-resistant. It blocks agent product commits until an allowlisted validation run is recorded; it does not prove honesty. (`ask` was dropped after Cursor agent Shell continued without a human prompt.)

## Wiring (keep both in sync)

| Tool | Config | Events |
|------|--------|--------|
| Claude Code | `.claude/settings.json` | `PreToolUse` / `PostToolUse` / `PreCompact` |
| Cursor | `.cursor/hooks.json` | `beforeShellExecution` / `afterShellExecution` / `preCompact` |

Both call the same scripts under `scripts/agent-hooks/`.

For local dogfooding before merge, you can also point `~/.cursor/hooks.json` at absolute paths to these scripts. Cursor runs those with cwd `~/.cursor` and an empty `cwd` field; the scripts resolve the real checkout via payload `workspace_roots` (then `git rev-parse`). They no-op outside RNFB checkouts (`okf-bundle/` or `package.json` name `react-native-firebase`). Keep this branch checked out at that path (or copy the scripts elsewhere); use a git worktree for other RNFB work.

Evidence is written under `git rev-parse --git-dir` (worktree-safe), not `repo/.git/file`.

## Allowlisted validation (mint evidence)

Examples: `yarn tests:jest`, `yarn lint:js`, `yarn tsc:compile`, `yarn compare:types`, `yarn tests:ios:test-cover`, and other commands listed in `lib.js` `VALIDATION_PATTERNS` (aligned with `okf-bundle/testing/validation-checklist.md`).

## Manual smoke

```bash
# Never-stage deny (requires something staged — use a throwaway index in a test clone)
echo '{"command":"git commit -m test --no-verify"}' | node scripts/agent-hooks/gate-commit.js; echo exit:$?

# Simulate Cursor user-hook cwd (~/.cursor) with workspace_roots pointing at a worktree
echo '{"command":"git commit -m test","workspace_roots":["/path/to/rnfb-worktree"]}' | node scripts/agent-hooks/gate-commit.js

# Record a jest run
echo '{"command":"yarn tests:jest","output":"Test Suites: 1 passed"}' | node scripts/agent-hooks/record-validation.js
```
