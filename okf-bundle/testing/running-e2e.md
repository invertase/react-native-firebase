---
type: Reference
title: Running e2e tests
description: The canonical, minimal command set for running React Native Firebase e2e tests on every platform.
tags: [testing, e2e, detox, jet, ios, android, macos, coverage]
timestamp: 2026-06-24T00:00:00Z
---

# Running e2e tests

Single source of truth for local e2e. Use **only** these commands. `-ci` variants are CI-only. **Avoid** `:test-cover-reuse`, `:test-cover-and-process`, and `:test-reuse` (stale native risk — rule 4). If another doc disagrees, this doc wins.

> **Maintenance contract.** All e2e how-to knowledge lives **here**. Other docs link here; they do not restate anything.

## Five rules

1. **Packager** (background):

```bash
yarn tests:packager:jet
```

2. **Emulators** (background, always):

```bash
yarn tests:emulator:start
```

3. **Rebuild when needed**
   - Native changed → `yarn tests:ios:build` / `yarn tests:android:build` before e2e. macOS uses firebase-js-sdk only — no native rebuild.
   - `packages/*/lib/**` changed → `yarn lerna:prepare` (Metro serves `dist/module/**`, not `lib/**`; e2e specs under `packages/*/e2e/**` and `tests/**` are served directly).

4. **Always run with coverage:**

```bash
yarn tests:ios:test-cover
yarn tests:android:test-cover
yarn tests:macos:test-cover
```

   Clean `:build` + `:test-cover` each time — not reuse variants.

5. **Report locations** — [Coverage design](coverage-design.md).

## Typical loop

```bash
# Background (once):
yarn tests:emulator:start
yarn tests:packager:jet

# Per platform (rebuild when native changed):
yarn tests:ios:build && yarn tests:ios:test-cover
yarn tests:android:build && yarn tests:android:test-cover
yarn tests:macos:test-cover
```

## Fast iteration: test narrowing

Full e2e loads every package's specs. Narrow locally to iterate faster. **Never commit** any narrowing.

| Kind | Mechanism | Scope |
|------|-----------|--------|
| **Area narrowing** | `tests/app.js` + `tests/globals.js` | Which modules/specs load (e.g. trim `platformSupportedModules`; `require` one spec file instead of `require.context`) |
| **Single-test narrowing** | `it.only(...)` | One case in a loaded file |
| **Single-suite narrowing** | `describe.only(...)` | One block in a loaded file |

**Area narrowing** = edits to `tests/app.js` and `tests/globals.js` only — not Jet `--grep`, not packager `--target`.

**Example (area):** firestore-only modules + `require('../packages/firestore/e2e/Pipeline.e2e.js')`. Mark with `// TEMP: …` in the diff.

**`RNFBDebug`** (`tests/globals.js`): set `globalThis.RNFBDebug = true`. Prints `[TEST-->Start]` / `[TEST->Finish]` per case. Main value: **fail-fast** — disables Mocha retry/backoff in `tests/app.js`, so a hang or failure surfaces immediately instead of looking like a 4× longer hang.

Package-specific workflows may define which narrowing levels are allowed through review (e.g. [Pipeline implementation workflow](../packages/firestore/pipeline-implementation-workflow.md#narrowing-during-pipeline-iterations)).

## Environment

- **Devices** — Detox boots simulator/emulator (`TestingAVD` in `tests/.detoxrc.js`); macOS auto-starts the app.
- **adb empty** — `adb kill-server && adb start-server && adb devices`
- **Stale processes** — one Metro (`:8081`), one emulator set (`:8080`, `:9099`, `:9000`, `:4400`, …), one Jet (`:8090`). Check: `lsof -nP -iTCP -sTCP:LISTEN | rg ':8081|:8080|:9099|:4400'`. Kill: `pkill -f "react-native start"`, `pkill -f "firebase emulators"`.

## Diagnosing native hangs

When JS output is unhelpful, use device logs + temporary native instrumentation (remove before merge):

- **iOS** — `xcrun simctl spawn booted log stream --level debug --style compact --predicate 'process == "testing"'`; for silent hangs, `sample <pid>` on the `testing` process.
- **Android** — `adb logcat` (filter your tags).

**Benign noise:** iOS Detox `EXEC_FAIL "xcrun simctl terminate … com.invertase.testing" … found nothing to terminate` — app wasn't running; ignore.

## Before merge (PR handoff)

PRs are **multiple commits**. These steps apply once to the **entire commit stream** on the branch — immediately before merge, or before push intended for merge — not after every commit.

1. Revert all narrowing: restore `tests/app.js` (`platformSupportedModules` + `require.context`), default `RNFBDebug` in `tests/globals.js`, remove all `.only`, remove native instrumentation.
2. Rebuild if needed (`tests:<platform>:build`; `yarn lerna:prepare` for `lib/**`).
3. Full unfocused suite with coverage on **iOS, Android, macOS** — all green.

## Notes

- Stale native build after native edits → rebuild first.
- All three platforms required; macOS exercises the JS SDK path.
