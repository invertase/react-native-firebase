---
type: Reference
title: Running e2e tests
description: The canonical, minimal command set for running React Native Firebase e2e tests on every platform.
tags: [testing, e2e, detox, jet, ios, android, macos, coverage]
timestamp: 2026-06-25T00:00:00Z
---

# Running e2e tests

Canonical local e2e commands. Use **only** these commands. `-ci` variants are CI-only. Avoid `:test-cover-reuse`, `:test-cover-and-process`, `:test-reuse` (stale native risk). If another doc disagrees, this wins.

> All e2e how-to lives here; other docs link here.

## Prerequisites (once per checkout)

```bash
yarn   # applies .yarn/patches (jet, mocha-remote-*, detox); installs tests devDeps incl. babel-plugin-istanbul
```

## Rules

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
   - TS coverage: iOS/Android embed JS at **build** time; run `:build` before `:test-cover` so Istanbul + patched Jet `uploadCoverage` are in app. macOS loads from Metro live; after Jet patch changes, restart packager with `--reset-cache` in `tests/`. Patch `src/index.tsx`, not only compiled `lib/`.

4. **Always run with coverage:**

```bash
yarn tests:ios:test-cover
yarn tests:android:test-cover
yarn tests:macos:test-cover
```

   Clean `:build` + `:test-cover` each time — not reuse variants.

5. **Report locations** — [Coverage design](coverage-design.md).

6. **One e2e at a time** — never overlap `:test-cover`/Detox/Jet on one host. Jet uses `:8090`; all platforms share Jet + Metro `:8081`; parallel runs race on coverage/device/emulator state. Every run starts after [clean pre-flight](#pre-flight-is-the-host-clear-to-start).

7. **No source edits during e2e** — wait/cancel cleanly before editing `packages/**`, `tests/**`, or bundle-affecting OKF docs. Saves can hot reload/rebundle and invalidate tests/coverage.

## Serialized e2e loops (shared dev host)

Use [validation tiers](#e2e-validation-tiers-focused-area-full): **focused**, **area**, **full**. Match tier to [work type](iteration-vocabulary.md#work-types). Runs are serial from clean [pre-flight](#pre-flight-is-the-host-clear-to-start). Log long output; upstream gets exit code + short summary.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md). **Terms:** [iteration vocabulary](iteration-vocabulary.md).

### How a platform run is structured (Android/iOS)

Wait on Detox/Jest; Jet is its **child**:

```text
yarn tests:android:test-cover
  └─ detox test → jest (e2e/jest.config.js)
       └─ firebase.test.js spawns: yarn jet --target=android --coverage  (:8090)
            └─ app on emulator/simulator
```

macOS: `yarn tests:macos:test-cover` → `jet --target=macos` (same `:8090`).

**Do not poll `pgrep`, `detox`, `jet.js`, or `:8090` for completion.** They match stale wrappers, orphans, zombies, and contention.

### Running one iteration

1. [Pre-flight](#pre-flight-is-the-host-clear-to-start); if busy/recovering, wait or clean.
2. One foreground Shell command; set `block_until_ms` large enough (~15m macOS, ~45–60m iOS/Android). Do **not** background/poll.
3. From repo root, tee canonical command:

```bash
yarn tests:android:test-cover 2>&1 | tee /tmp/rnfb-e2e-android.log
yarn tests:ios:test-cover     2>&1 | tee /tmp/rnfb-e2e-ios.log
yarn tests:macos:test-cover   2>&1 | tee /tmp/rnfb-e2e-macos.log
```

Use `/tmp/rnfb-e2e-<platform>.log` (overwrite each iteration). Do not substitute `detox test`, `cd tests && yarn detox …`, or other entrypoints.

4. Completion = shell exit code. `0` finished; non-zero failed/aborted. Read log for counts.
5. Parse log tail; do not infer from processes:

```bash
rg 'passing|failing' /tmp/rnfb-e2e-<platform>.log | tail -1
rg '^\s+\d+\)' /tmp/rnfb-e2e-<platform>.log          # failure blocks, if any
rg 'Tests Complete|jet-coverage.*merged' /tmp/rnfb-e2e-<platform>.log | tail -3
```

Markers: `✨ Tests Complete ✨`, Jest `N passing` / `N failing`, `[jet-coverage] merged … before NYC shutdown`.

6. Return only platform, exit code, pass/fail line, failing tests, log path, optional coverage-gap line. No full log upstream.

### Pre-flight: is the host clear to start?

Run before every `:test-cover`. These check *device activity*, not Node leftovers.

| Platform | Active e2e signal | Clear to start |
|----------|-------------------|----------------|
| **Android** | `adb -s emulator-5554 shell pidof com.invertase.testing.test` returns a PID | command prints nothing / empty |
| **iOS** | `xcrun simctl spawn booted pgrep -x testing` returns a PID | no output |
| **macOS** | `pgrep -x io.invertase.testing` returns a PID | no output |

Also wait for any visible unfinished `yarn tests:*:test-cover`.

Metro `:8081` and emulators `:8080`/`:9099` are expected; they do not mean e2e is running.

### Focused-tier iteration loop

For `implementation` work type ([focused tier](#e2e-validation-tiers-focused-area-full)):

1. [Pre-flight](#pre-flight-is-the-host-clear-to-start) — host clear; if not, wait or clean up per [interrupted run](#interrupted-run-abort-killed-terminal-eaddrinuse-on-8090).
2. Edit e2e/spec; apply focused narrowing (`.only` and/or tight `tests/app.js` area narrowing); never commit.
3. macOS first when TS-only: `yarn tests:macos:test-cover 2>&1 | tee /tmp/rnfb-e2e-macos.log` — wait for exit code.
4. If macOS green and native touched: `yarn tests:<platform>:build && yarn tests:<platform>:test-cover 2>&1 | tee /tmp/rnfb-e2e-<platform>.log`; one platform at a time.
5. Grep log tail → fix → repeat from step 1 (pre-flight again before each run).
6. When `implementation_gate` closes, next work type is `independent-review` at **area** tier — [frozen tree](iteration-vocabulary.md#frozen-tree); canonical commands; no `.only`; area narrowing per package workflow.

### Serialized e2e dispatch

Never overlap runs that use `:test-cover`. See [host rule](iteration-vocabulary.md#host-rule).

| Rule | Requirement |
|------|-------------|
| **One e2e run at a time** | Wait for prior shell exit code + short log summary |
| **No overlapping tiers** | Never run focused-tier and area-tier `:test-cover` concurrently on one host |
| **Clean pre-flight every run** | Verify [pre-flight](#pre-flight-is-the-host-clear-to-start); if not clear, wait/clean |
| **iOS guard probe loop** | `implementation` (Jest + **focused**) → `independent-review` (**area**, frozen tree) → `commit` — [work queue protocol](../packages/firestore/pipeline-coverage-work-queue.md#phase-j-iteration-protocol-strict) |

| Validation tier | E2e scope | Narrowing allowed | Typical work type |
|-----------------|-----------|-------------------|-------------------|
| **Focused** | Backpressure while product code is changing | `it.only` / `describe.only` / tight area narrowing in `tests/app.js` — **never commit** | `implementation` |
| **Area** | Full loaded spec(s) for the package/area under change | Area narrowing only (`tests/app.js` + `tests/globals.js`); **no** `.only` | `baseline-capture`, `independent-review` |
| **Full** | All modules, all platforms | None — revert all narrowing | `pre-merge-validation` |

Each run owns its blocking `:test-cover` and returns summaries only.

### Interrupted run (abort, killed terminal, EADDRINUSE on :8090)

Before next canonical command:

```bash
# Android — stop app + instrumentation
adb -s emulator-5554 shell am force-stop com.invertase.testing
adb -s emulator-5554 shell am force-stop com.invertase.testing.test

# Stray Jet from an aborted run (note PID, kill only jet.js for this repo)
lsof -nP -iTCP:8090 -sTCP:LISTEN

# Confirm clear
adb -s emulator-5554 shell pidof com.invertase.testing.test || echo "instrumentation clear"
```

Then rerun from repo root: `yarn tests:<platform>:build && yarn tests:<platform>:test-cover` (foreground; tee if logging).

### What not to do

- Do not invoke `detox test`, `npx jet`, or `cd tests && …`; use repo-root `yarn tests:<platform>:test-cover` (+ `:build` when needed).
- Do not background `:test-cover` and poll `pgrep`, `detox`, or `jet.js` for completion.
- Do not use `:test-cover-reuse`, `:test-cover-and-process`, or `:test-reuse` when measuring coverage or closing review gates.
- Do not use `:8090` listening as “e2e still running” without the platform active signal above.
- Do not start iOS/Android/macOS `:test-cover` concurrently on one host.
- Do not edit source while a tee'd run is still in progress.
- Do not run `.github/workflows/scripts/boot-simulator.sh`, `simctl shutdown all`, or `kill -9` on `:8090` as prep. `boot-simulator.sh` is CI-only or internal to iOS Jet retry.

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

Full e2e loads every package. Narrow locally; **never commit** narrowing.

| Kind | Mechanism | Scope |
|------|-----------|--------|
| **Area narrowing** | `tests/app.js` + `tests/globals.js` | Which modules/specs load (e.g. trim `platformSupportedModules`; `require` one spec file instead of `require.context`) |
| **Single-test narrowing** | `it.only(...)` | One case in a loaded file |
| **Single-suite narrowing** | `describe.only(...)` | One block in a loaded file |

**Area narrowing** = `tests/app.js` / `tests/globals.js` only; not Jet `--grep` or packager `--target`.

**Area example:** firestore-only modules + `require('../packages/firestore/e2e/Pipeline.e2e.js')`; mark `// TEMP: …`.

**`RNFBDebug`** (`tests/globals.js`): `globalThis.RNFBDebug = true`; prints per-case start/finish and disables Mocha retry/backoff for fail-fast.

Package workflows may further restrict narrowing per [validation tier](#e2e-validation-tiers-focused-area-full).

## E2e validation tiers (focused / area / full)

All tiers use [canonical commands](#rules), [host rule](iteration-vocabulary.md#host-rule), and clean [pre-flight](#pre-flight-is-the-host-clear-to-start). Tier names describe **scope**, not who runs the commands — see [iteration vocabulary](iteration-vocabulary.md).

| Validation tier | E2e scope | Narrowing allowed | Typical work type |
|-----------------|-----------|-------------------|-------------------|
| **Focused** | Fast loop while product code is changing | `it.only` / `describe.only` / tight area narrowing in `tests/app.js` — **never commit** | `implementation` |
| **Area** | Full loaded spec(s) for the package/area under change | Area narrowing only (`tests/app.js` + `tests/globals.js`); **no** `.only` | `baseline-capture`, `independent-review` |
| **Full** | Unfocused — all modules, all platforms | None — revert all narrowing | `pre-merge-validation` |

**Universal rules:**

- E2e is **always serial** — one `:test-cover` at a time on the host.
- Every run starts from **verified clean pre-flight**; if not clear, wait or follow [interrupted-run cleanup](#interrupted-run-abort-killed-terminal-eaddrinuse-on-8090) — do not start another run.
- Use **only** canonical commands from this doc.
- Never overlap focused-tier and area-tier `:test-cover` on one host.

See also: [focused-tier loop](#focused-tier-iteration-loop), [dispatch](#serialized-e2e-dispatch), [pre-merge](#before-merge-pr-handoff).

## Environment

- **Devices** — Detox boots simulator/emulator (`TestingAVD`); macOS auto-starts app.
- **adb empty** — `adb kill-server && adb start-server && adb devices`
- **Stale processes** — one Metro (`:8081`), one emulator set (`:8080`, `:9099`, `:9000`, `:4400`, …). Jet `:8090` is per-`:test-cover`, not background; listener after run usually means stray Jet. Check: `lsof -nP -iTCP -sTCP:LISTEN | rg ':8081|:8080|:9099|:4400'`. Kill Metro/emulators: `pkill -f "react-native start"`, `pkill -f "firebase emulators"`.

## Diagnosing native hangs

If JS output is unhelpful, use device logs + temporary native instrumentation (remove before merge):

- **iOS** — `xcrun simctl spawn booted log stream --level debug --style compact --predicate 'process == "testing"'`; for silent hangs, `sample <pid>` on the `testing` process.
- **Android** — `adb logcat` (filter your tags).

**Benign noise:** iOS Detox `EXEC_FAIL "xcrun simctl terminate … com.invertase.testing" … found nothing to terminate` — app wasn't running; ignore.

## Before merge (PR handoff)

Pre-merge applies once to the branch commit stream before merge/push intended for merge, not after every commit.

1. Revert all narrowing ([full tier](#e2e-validation-tiers-focused-area-full)): restore `tests/app.js` (`platformSupportedModules` + `require.context`), default `RNFBDebug` in `tests/globals.js`, remove all `.only`, remove native instrumentation.
2. [Pre-flight](#pre-flight-is-the-host-clear-to-start) — verified clean host before each platform run.
3. Rebuild if needed (`tests:<platform>:build`; `yarn lerna:prepare` for `lib/**`).
4. Full unfocused suite with coverage on **iOS, Android, macOS** — one platform at a time, all green.

## Notes

- Stale native build after native edits → rebuild first.
- All three platforms required; macOS exercises the JS SDK path.
