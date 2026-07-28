---
name: ts-js-validation
description: Validate React Native Firebase changes by running the CI-equivalent prepare, TypeScript, lint, Jest, formatting, and compare-types scripts. Use before handoff, commit, or push when package sources, native bridge code, or docs changed.
metadata:
  owner_team: react-native-firebase
  maintainer: russell.wheatley
  status: draft
  tags: typescript,javascript,testing,validation,formatting,react-native-firebase
  last_reviewed: "2026-07-06"
  version: "0.2.0"
---

# React Native Firebase TS/JS Validation

## Scope

Use this skill to validate changes in the React Native Firebase monorepo before handoff, commit, or push.

It runs the same static-analysis and compile/test commands CI uses for the Lint, TypeScript, Jest, docs, and compare-types jobs — not a narrowed JS-only subset.

## Triggers

Use this skill when the user asks for:

- testing TS or JS changes
- validating TypeScript or JavaScript edits before commit or handoff
- running the standard validation pass for RNFB
- checking whether package changes compile and pass Jest
- formatting and linting before push
- CI-equivalent validation before publication

## Out-of-scope boundaries

Do not use this skill for:

- release validation that requires the full platform, emulator, Detox, or packaging matrix (see [validation checklist § e2e](../../../okf-bundle/testing/validation-checklist.md))
- migrating a package from JavaScript to TypeScript; use the TypeScript refactor or migration skills instead

## Defaults

- Default tool or method: run the canonical command sequence below from the repository root
- Fallback when default fails: stop, inspect the failure, fix issues in the current change set when authorized, then rerun the failed command and any later commands
- Why this default exists: the sequence mirrors CI Lint + TypeScript + Jest + docs + compare-types gates

## Command sequence

Run these root `package.json` scripts in order. **Canonical checklist:** [validation-checklist.md](../../../okf-bundle/testing/validation-checklist.md). **Agent allowlist (no improvisation):** [agent-command-policy.md](../../../okf-bundle/testing/agent-command-policy.md). OKF bundle wins if this skill disagrees.

1. `yarn lerna:prepare`
2. `yarn tsc:compile`
3. `yarn tsc:compile:consumer`
4. `yarn reference:api`
5. `yarn lint` — **CI Lint job** (`lint:js` + `lint:android` + `lint:ios:check`). When `lint:android` reformats Java, commit the formatter output and rerun until exit 0.
6. When `docs/**` changed: `yarn lint:markdown` then `yarn lint:spellcheck` — **CI docs job**
7. `yarn lint:js --fix` then `yarn lint:js` when step 5 reported ESLint issues only (optional shortcut before re-running full `yarn lint`)
8. `yarn tests:jest`
9. `yarn format:js` — inspect diff; rerun `yarn lint` if formatting touched files
10. `yarn compare:types`

## Gotchas

- **Forbidden:** `yarn workspace … prepare`, `cd packages/<pkg> && yarn prepare/build`, `yarn jet`, `npx jet` — see [agent command policy](../../../okf-bundle/testing/agent-command-policy.md). On failure, fix product code and re-run the **same** canonical command.
- **`yarn lint` is not optional** when native Java or iOS sources are in the diff — `lint:js` alone does not match CI.
- **`yarn lint:spellcheck` is not optional** when `docs/**` is in the diff — `lint:markdown` alone does not match CI.
- `yarn format:js` writes changes across `packages/**/*.{js,ts,tsx}`. Check the diff after formatting and do not revert user changes.
- Run commands from the repository root so workspace resolution, root `tsconfig.json`, and Jest configuration are consistent.
- `yarn lerna:prepare` may rebuild or refresh package artifacts needed before TypeScript or tests run.
- `yarn compare:types` installs dependencies under `.github/scripts/compare-types` before running the type parity comparison. Keep it last.
- If validation is slow, keep the command running rather than replacing it with a narrower command unless the user explicitly narrows validation.

## Workflow

1. Confirm the task scope and note changed packages, native paths, or docs.
2. Check whether the worktree has unrelated dirty files if the current task includes code edits or commit preparation.
3. Run the command sequence from the repository root.
4. If `yarn lint:android` or `yarn format:js` changes files, include those changes and rerun `yarn lint` before continuing.
5. If a command fails:
   - stop before running later commands
   - identify whether the failure belongs to the current changes, pre-existing repo state, or missing local setup
   - fix current-change failures when authorized, then rerun the failed command and continue the remaining sequence
6. Return a concise result with the commands run, pass/fail status, and any remaining blockers.

## Validation loop

1. Run the command sequence.
2. If validation fails because of current changes and fixing is in scope, fix the issue and rerun the failed command plus all later commands.
3. If validation fails for unrelated or environment-specific reasons, stop and report the blocker with the command that failed and the shortest useful error summary.
4. Only report success when every applicable command in the sequence completes successfully.

## Output format

Use this template:

```markdown
# TS/JS Validation

## Summary
- passed | failed | blocked
- one-sentence validation verdict

## Commands
- `yarn lerna:prepare`: passed | failed | not run
- `yarn tsc:compile`: passed | failed | not run
- `yarn tsc:compile:consumer`: passed | failed | not run
- `yarn reference:api`: passed | failed | not run
- `yarn lint`: passed | failed | not run
- `yarn lint:markdown`: passed | failed | not run | n/a
- `yarn lint:spellcheck`: passed | failed | not run | n/a
- `yarn tests:jest`: passed | failed | not run
- `yarn format:js`: passed | failed | changed files
- `yarn compare:types`: passed | failed | not run

## Findings
- failing suite, compiler error, or setup blocker if any

## Next actions
1. next required action, only if validation did not fully pass
```

## Constraints

- Keep responses factual and grounded in command output.
- Do not skip `yarn lint` or docs lint rows when the diff requires them.
- Do not claim validation passed unless `compare:types` ran after any formatting changes.
- Do not revert unrelated local changes.
- Avoid broad refactors while fixing validation failures.

## Additional resources

Load files only when needed:

- **`okf-bundle/testing/validation-checklist.md`** — full validation command list including e2e, coverage, and CI job mapping
- Read `package.json` if command names or script definitions need to be confirmed.
- Read affected package `type-test.ts` or nearby `__tests__/` files only when a failure needs package-specific diagnosis.
