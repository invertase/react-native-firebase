---
name: ts-js-validation
description: Validate TypeScript and JavaScript changes in React Native Firebase by formatting package JS/TS sources and running the root prepare, TypeScript compile, consumer TypeScript compile, and Jest test scripts. Use when a developer updates TS/JS code and wants the standard RNFB validation pass before handing off or committing.
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

It is for developer-facing validation after editing package JS/TS sources, type tests, Jest tests, or shared TypeScript configuration. It formats code and runs the standard root validation commands that catch generated package setup issues, TypeScript errors, consumer type regressions, and Jest failures.

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

- Default tool or method: run the root Yarn scripts in this order from the repository root: `yarn format:js`, `yarn lerna:prepare`, `yarn tsc:compile`, `yarn tsc:compile:consumer`, and `yarn tests:jest`
- Fallback when default fails: if a command fails, stop the sequence, inspect the failure, fix issues only when the user asked for fixes or the fix is clearly in the current change set, then rerun the failed command and any later commands
- Why this default exists: formatting first avoids reporting stale style noise, while `lerna:prepare`, both TypeScript compiles, and Jest cover the JS/TS surfaces most likely to regress in this monorepo

## Gotchas

- `yarn format:js` writes changes across `packages/**/*.{js,ts,tsx}`. Check the diff after formatting and do not revert user changes.
- Run commands from the repository root so workspace resolution, root `tsconfig.json`, and Jest configuration are consistent.
- `yarn lerna:prepare` may rebuild or refresh package artifacts needed before TypeScript or tests run.
- `yarn tsc:compile` checks the repository TypeScript project, while `yarn tsc:compile:consumer` checks the consumer-facing TypeScript project. Run both.
- `yarn tests:jest` is the root Jest entrypoint. If it fails, report the failing test file or suite and the first actionable error rather than dumping the full output.
- If validation is slow, keep the command running rather than replacing it with a narrower command unless the user explicitly asks for targeted validation.

## Workflow

1. Confirm the task is TS/JS validation and note any specific changed package or test files the user mentioned.
2. Check whether the worktree has unrelated dirty files before formatting if the current task includes code edits or commit preparation.
3. Run the validation sequence from the repository root:
   1. `yarn format:js`
   2. `yarn lerna:prepare`
   3. `yarn tsc:compile`
   4. `yarn tsc:compile:consumer`
   5. `yarn tests:jest`
4. If `yarn format:js` changes files, include those formatting changes in the validation context and inspect the relevant diff before continuing.
5. If a command fails:
   - stop before running later commands
   - identify whether the failure belongs to the current TS/JS changes, pre-existing repo state, or missing local setup
   - fix current-change failures when authorized, then rerun the failed command and continue the remaining sequence
6. Return a concise result with the commands run, pass/fail status, and any remaining blockers.

## Validation loop

Use this loop before finalizing:

1. Run the root validation sequence:
   - `yarn format:js`
   - `yarn lerna:prepare`
   - `yarn tsc:compile`
   - `yarn tsc:compile:consumer`
   - `yarn tests:jest`
2. If validation fails because of current TS/JS changes and fixing is in scope, fix the issue and rerun the failed command plus all later commands.
3. If validation fails for unrelated or environment-specific reasons, stop and report the blocker with the command that failed and the shortest useful error summary.
4. Only report success when all five commands complete successfully after formatting.

## Output format

Use this template:

```markdown
# TS/JS Validation

## Summary
- passed | failed | blocked
- one-sentence validation verdict

## Commands
- `yarn format:js`: passed | failed | changed files
- `yarn lerna:prepare`: passed | failed | not run
- `yarn tsc:compile`: passed | failed | not run
- `yarn tsc:compile:consumer`: passed | failed | not run
- `yarn tests:jest`: passed | failed | not run

## Findings
- failing suite, compiler error, or setup blocker if any

## Next actions
1. next required action, only if validation did not fully pass
```

## Constraints

- Keep responses factual and grounded in command output.
- Do not skip any command in the default sequence unless the user explicitly narrows validation.
- Do not claim validation passed if formatting changed files but later commands were not rerun.
- Do not revert unrelated local changes.
- Avoid broad refactors while fixing validation failures.

## Additional resources

- See the root `package.json` scripts:
  - `lerna:prepare`
  - `tsc:compile`
  - `tsc:compile:consumer`
  - `tests:jest`
  - `format:js`

Load files only when needed:

- Read `package.json` if command names or script definitions need to be confirmed.
- Read affected package `package.json`, `type-test.ts`, or nearby `__tests__/` files only when a failure needs package-specific diagnosis.
