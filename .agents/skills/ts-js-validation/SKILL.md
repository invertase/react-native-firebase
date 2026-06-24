---
name: ts-js-validation
description: Validate TypeScript and JavaScript changes in React Native Firebase by running the root prepare, TypeScript compile, API reference, Jest, formatting, and compare-types scripts. Use when a developer updates TS/JS code and wants the standard RNFB validation pass before handing off or committing.
metadata:
  owner_team: react-native-firebase
  maintainer: russell.wheatley
  status: draft
  tags: typescript,javascript,testing,validation,formatting,react-native-firebase
  last_reviewed: "2026-05-08"
  version: "0.1.0"
---

# React Native Firebase TS/JS Validation

## Scope

Use this skill to validate changes to TypeScript or JavaScript code in the React Native Firebase monorepo.

It is for developer-facing validation after editing package JS/TS sources, type tests, Jest tests, or shared TypeScript configuration. It runs the standard root validation commands that catch generated package setup issues, TypeScript errors, consumer type regressions, API reference regressions, Jest failures, formatting drift, and firebase-js-sdk type parity drift.

## Triggers

Use this skill when the user asks for:

- testing TS or JS changes
- validating TypeScript or JavaScript edits before commit or handoff
- running the standard JS validation pass for RNFB
- checking whether package JS/TS changes compile and pass Jest
- formatting package JS/TS code and then running validation

## Out-of-scope boundaries

Do not use this skill for:

- Android Java/Kotlin formatting or build validation
- iOS Objective-C, Objective-C++, C++, Swift, or pod validation
- documentation-only changes that do not affect JS/TS behavior
- release validation that requires the full platform, emulator, Detox, or packaging matrix
- migrating a package from JavaScript to TypeScript; use the TypeScript refactor or migration skills instead

## Defaults

Set one clear default path so the agent does not choose randomly between options.

- Default tool or method: run the canonical command sequence below from the repository root
- Fallback when default fails: if a command fails, stop the sequence, inspect the failure, fix issues only when the user asked for fixes or the fix is clearly in the current change set, then rerun the failed command and any later commands
- Why this default exists: `lerna:prepare`, both TypeScript compiles, API reference generation, Jest, formatting, and compare-types cover the JS/TS surfaces most likely to regress in this monorepo

## Command sequence

Run these root `package.json` scripts in order. **Canonical checklist with pipeline/e2e context:** `okf-bundle/testing/validation-checklist.md` (OKF bundle wins if this skill disagrees).

1. `yarn lerna:prepare`
2. `yarn tsc:compile`
3. `yarn tsc:compile:consumer`
4. `yarn reference:api`
5. `yarn tests:jest`
6. `yarn format:js`
7. `yarn compare:types`

## Gotchas

- `yarn format:js` writes changes across `packages/**/*.{js,ts,tsx}`. Check the diff after formatting and do not revert user changes.
- Run commands from the repository root so workspace resolution, root `tsconfig.json`, and Jest configuration are consistent.
- `yarn lerna:prepare` may rebuild or refresh package artifacts needed before TypeScript or tests run.
- `yarn tsc:compile` checks the repository TypeScript project, while `yarn tsc:compile:consumer` checks the consumer-facing TypeScript project. Run both.
- `yarn reference:api` runs TypeDoc and should come after consumer TypeScript compilation.
- `yarn tests:jest` is the root Jest entrypoint. If it fails, report the failing test file or suite and the first actionable error rather than dumping the full output.
- `yarn compare:types` installs dependencies under `.github/scripts/compare-types` before running the type parity comparison. Keep it last.
- If validation is slow, keep the command running rather than replacing it with a narrower command unless the user explicitly asks for targeted validation.

## Workflow

1. Confirm the task is TS/JS validation and note any specific changed package or test files the user mentioned.
2. Check whether the worktree has unrelated dirty files if the current task includes code edits or commit preparation.
3. Run the command sequence from the repository root.
4. If `yarn format:js` changes files, include those formatting changes in the validation context and inspect the relevant diff before continuing.
5. If a command fails:
   - stop before running later commands
   - identify whether the failure belongs to the current TS/JS changes, pre-existing repo state, or missing local setup
   - fix current-change failures when authorized, then rerun the failed command and continue the remaining sequence
6. Return a concise result with the commands run, pass/fail status, and any remaining blockers.

## Validation loop

Use this loop before finalizing:

1. Run the command sequence.
2. If validation fails because of current TS/JS changes and fixing is in scope, fix the issue and rerun the failed command plus all later commands.
3. If validation fails for unrelated or environment-specific reasons, stop and report the blocker with the command that failed and the shortest useful error summary.
4. Only report success when every command in the sequence completes successfully.

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
- Do not skip any command in the default sequence unless the user explicitly narrows validation.
- Do not claim validation passed unless `compare:types` ran after any formatting changes.
- Do not revert unrelated local changes.
- Avoid broad refactors while fixing validation failures.

## Additional resources

Load files only when needed:

- **`okf-bundle/testing/validation-checklist.md`** — full validation command list including e2e, coverage, and doc lints
- Read `package.json` if command names or script definitions need to be confirmed.
- Read affected package `package.json`, `type-test.ts`, or nearby `__tests__/` files only when a failure needs package-specific diagnosis.
