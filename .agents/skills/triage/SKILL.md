---
name: triage-rnfb
description: Triage a React Native Firebase GitHub issue by identifying the affected package and platform, reproducing the problem with a targeted RNFB test, implementing a minimal fix when possible, and preparing a concise maintainer response. Use when a specific issue on `invertase/react-native-firebase` needs investigation.
disable-model-invocation: true
argument-hint: <issue-number>
metadata:
  owner_team: react-native-firebase
  maintainer: russell.wheatley
  status: draft
  tags: triage,issues,react-native,firebase,detox,jet
  last_reviewed: "2026-03-30"
  version: "0.1.0"
---

# Triage React Native Firebase Issue #$ARGUMENTS

## Scope

This skill triages a single GitHub issue for `invertase/react-native-firebase`: fetch the report, map it to the affected RNFB package and platform, reproduce it with the right test type, make the minimal fix when practical, and prepare a short maintainer response.

Use it for bug reports and regression triage inside this monorepo. Do not use it for feature requests, generic Firebase usage questions, or app-specific debugging that cannot be tied back to RNFB code.

## Triggers

Use this skill when the user asks for:

- triaging a specific `invertase/react-native-firebase` issue number
- reproducing an RNFB bug report with tests
- fixing a React Native Firebase regression after confirming it locally
- writing a maintainer-ready response or PR summary for an RNFB issue

## Out-of-scope boundaries

Do not use this skill for:

- feature requests or enhancement planning
- issues on repositories other than `invertase/react-native-firebase`
- generic React Native or Firebase SDK support questions unrelated to RNFB implementation
- bulk triage of multiple issues at once

You are triaging issue #$ARGUMENTS on `invertase/react-native-firebase`.
Your goal: **understand the report, reproduce it with the right RNFB test type, fix it if feasible, verify the result, then prepare concise response files.**

## Defaults

Set one clear default path so the agent does not choose randomly between options.

- Default tool or method: start with `gh issue view`, then read the affected package source plus package-local `e2e` or `__tests__`, then reproduce with the smallest test that can fail red before any code fix
- Fallback when default fails: use source analysis only, explain why reproduction was not possible, and ask for a minimal reproduction or missing environment details
- Why this default exists: RNFB bugs often sit at the boundary between JS, shared runtime, native wrappers, and platform-specific test harnesses, so a code-path-first workflow is faster and more reliable than guessing from issue text alone

## Gotchas

- `packages/app` is shared runtime plumbing, not just another product package. If the issue involves namespace registration, app instances, native module lookup, or events, inspect `packages/app` early.
- Most package runtime tests live in `packages/<package>/e2e/*.e2e.js` and are loaded by `tests/app.js`. Add tests there unless the bug is truly unit-test-only.
- Prefer an existing `issues.e2e.js` file when the package has one. RNFB already uses issue-numbered test names there, so `it('#$ARGUMENTS should ...')` matches repo style.
- `Platform.other` is the non-Android/non-iOS path. It often uses JS SDK fallback modules registered with `setReactNativeModule(...)`, not native wrappers.
- Not every module is enabled on `Platform.other`; `tests/app.js` controls what loads on each platform. Do not assume macOS coverage exists for every package.
- RNFB uses both namespaced (`firebase.auth()`) and modular APIs. If you fix one path, check whether the other path shares the bug or needs separate coverage.
- JS-only changes can usually reuse an existing Detox build with `tests:*:test-reuse`, but any native code change requires rebuilding the test app first.
- The test packager must be started with the repo script, not a generic Metro command: use `yarn tests:packager:jet` or the reset-cache variant from repo docs.
- If you touch generated TurboModule output, edit the source spec and regenerate. In this repo that currently means `packages/functions/specs` plus `cd packages/functions && yarn codegen` or `yarn codegen:all`. Do not hand-edit generated files.
- Some packages still mix JS and TS. Follow the package’s local style instead of forcing a migration during triage work.
- Do not leave `.only`, extra debug logging, or temporary skips in `e2e` or Jest tests.

## Workflow

1. Fetch the issue details:

   ```bash
   gh issue view $ARGUMENTS --repo invertase/react-native-firebase --json number,title,body,labels,comments,assignees
   ```

2. If needed, search for duplicates or prior fixes:

   ```bash
   gh search issues --repo invertase/react-native-firebase "<search terms>" --json number,title,state
   gh pr list --repo invertase/react-native-firebase --search "<search terms>" --json number,title,state
   ```

3. Extract the key triage facts:
   - affected RNFB package, for example `auth`, `firestore`, `perf`, `functions`
   - platform(s): android, ios, macos, or `other`
   - whether the report uses namespaced or modular API
   - exact reproduction steps
   - expected vs actual behavior
   - RN, RNFB, and Firebase SDK versions if provided
   - whether the symptoms point to RNFB code, upstream SDK behavior, or app configuration

4. Choose a triage path:
   - clear reproduction steps: continue to source reading and test reproduction
   - obvious duplicate: point to the canonical issue or PR and stop
   - insufficient reproduction: inspect likely code paths, then ask for a minimal reproduction and exact versions
   - obvious feature request: do not force a bug workflow; summarize and stop

5. Read the relevant code before writing tests:
   - package entrypoint and public API in `packages/<package>/lib/`
   - Android wrapper in `packages/<package>/android/`
   - iOS wrapper in `packages/<package>/ios/`
   - macOS or `Platform.other` fallback where relevant
   - shared runtime in `packages/app/lib/internal/` when the issue involves namespace creation, event emitters, app instances, or fallback module lookup
   - package tests in `packages/<package>/e2e/` and `packages/<package>/__tests__/`

6. Pick the smallest test that can prove the bug:
   - use `packages/<package>/e2e/*.e2e.js` for native wrapper, cross-platform runtime, app instance, event, or emulator behavior
   - use `packages/<package>/__tests__/*.test.*` for pure JS helpers, serialization, parsing, or parity logic
   - prefer an existing package `issues.e2e.js` when the regression is issue-shaped and close to existing issue tests
   - if the package already tests both namespaced and modular APIs, add coverage for both when they share the same path

7. Follow red-green discipline:
   - add the failing regression test first
   - for issue-focused `issues.e2e.js` files, keep the issue number in the test name:

     ```js
     it('#$ARGUMENTS should describe the regression', async function () {
       // reproduce the bug here
     });
     ```

   - do not fix implementation until the new test fails for the expected reason

8. Use the RNFB test harness that matches the report:
   - root setup: `yarn`
   - start packager in its own terminal: `yarn tests:packager:jet`
   - start emulator services when the package uses them: `yarn tests:emulator:start`
   - Android native/e2e: ensure an emulator named `TestingAVD` exists, then run `yarn tests:android:build` and `yarn tests:android:test`
   - iOS native/e2e: run `yarn tests:ios:pod:install`, `yarn tests:ios:build`, and `yarn tests:ios:test`
   - macOS / `Platform.other`: run `yarn tests:macos:pod:install`, `yarn tests:macos:build`, and `yarn tests:macos:test`
   - Jest/unit tests: run `yarn tests:jest <path-or-pattern>`
   - after the first successful native build, use `tests:android:test-reuse` or `tests:ios:test-reuse` only for JS-only iteration

9. If you need to narrow the test run while debugging:
   - temporarily use `.only` or Mocha grep locally
   - remove all narrowing before finalizing the change

10. After the test fails red, make the minimal fix in the right layer:
    - JS API or validation in `packages/<package>/lib/`
    - shared runtime in `packages/app` if the bug is cross-package plumbing
    - Android or iOS native wrapper if platform-specific
    - fallback/web module if the bug only appears on `Platform.other`
    - generated TurboModule source plus regeneration if the issue touches `packages/functions/specs`

11. Re-run the exact same test and confirm it passes green. Then run the next most relevant broader validation:
    - nearby `e2e` file or package suite
    - paired namespaced/modular coverage if applicable
    - platform counterpart if the fix should be cross-platform

12. Write response files in the repo root `answers/` directory:
    - `answers/$ARGUMENTS.md` for the maintainer response
    - `answers/$ARGUMENTS-pr.md` for the PR summary when a fix is ready

## Validation loop

Use this loop before finalizing:

1. Confirm the new regression test failed before the fix, unless the issue lacked a reproducible scenario and you explicitly documented that outcome
2. Re-run the exact failing test after the fix and confirm the issue outcome changed in the expected direction
3. Run the smallest relevant repo validators:
   - `yarn lint:js`
   - `yarn lint:android` if Android native files changed
   - `yarn lint:ios:check` if iOS native files changed
   - `yarn tsc:compile` if public TS surfaces or TS files changed materially
4. Remove `.only`, temporary debug logs, and any issue-triage scaffolding that should not ship
5. Only continue when the reproduction story, root cause, fix scope, and validation evidence all agree

## Output format

Use a concrete template when output must be structured:

```markdown
# RNFB Issue #$ARGUMENTS

## Summary
- one-line description of the reported bug
- affected package and platform

## Reproduction
- confirmed / not reproduced / needs more info
- test file used or reason no test was added

## Root cause
- what code path is responsible

## Fix
- files changed and what was updated

## Validation
- exact tests and checks run

## Response files
- `answers/$ARGUMENTS.md`
- `answers/$ARGUMENTS-pr.md` if a PR summary was needed
```

For `answers/$ARGUMENTS.md`, keep the tone short and maintainer-like:

- thank the reporter
- say whether the bug was reproduced
- name the affected package and platform
- briefly explain the root cause or why it was not confirmed
- if more info is needed, ask for a minimal reproduction and exact versions
- if fixed, say the patch and tests are ready for review

For `answers/$ARGUMENTS-pr.md`, use this template:

```markdown
## Description

What was wrong and what the fix changes in 1-3 sentences.

## Related Issues

- Fixes https://github.com/invertase/react-native-firebase/issues/$ARGUMENTS

## Validation

- [x] Added or updated the most relevant RNFB test coverage
- [x] Reproduced the issue before the fix when possible
- [x] Re-ran the targeted test after the fix
- [x] Ran the relevant lint and type checks for the touched layers

## Breaking Change

- [ ] Yes, this is a breaking change.
- [x] No, this is *not* a breaking change.
```

## Constraints

- Keep all conclusions grounded in the current repo state and the actual issue text.
- Prefer the smallest credible reproduction and the smallest fix that addresses it.
- Do not claim an upstream native SDK bug is an RNFB bug without tracing the RNFB wrapper path.
- Do not promise timelines, releases, or maintainer actions you cannot verify.
- If the issue is actually user configuration or unsupported usage, say so plainly and ask for a minimal reproduction only if that could change the conclusion.
- If the issue touches shared runtime behavior, read `packages/app` and do not stop at the package entrypoint.
- Match the local package style, file naming, and test conventions instead of introducing a new pattern during triage.

## Additional resources

- See `../architecture-rnfb/SKILL.md` when you need the shared runtime and package-wiring map before debugging.
- See `CONTRIBUTING.md` for repo testing expectations and contributor-facing validation norms.
- See `tests/README.md` for the packager, Detox, Jet, emulator, and device setup details.
- See `tests/app.js` to confirm which package `e2e` suites load on which platforms.

Load files only when needed:

- Read `../architecture-rnfb/SKILL.md` when the issue involves `createModuleNamespace`, `FirebaseModule`, `nativeEvents`, `setReactNativeModule`, or `Platform.other`.
- Read `tests/README.md` when you need exact local test setup steps, reuse behavior, or narrowing tactics.
- Read `CONTRIBUTING.md` when preparing validation notes or framing the maintainer response.
- Read only the affected package files under `packages/<package>/` plus the matching `tests` harness files for the current issue.