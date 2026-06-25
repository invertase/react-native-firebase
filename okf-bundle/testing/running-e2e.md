---
type: Reference
title: Running e2e tests
description: The canonical, minimal command set for running React Native Firebase e2e tests on every platform.
tags: [testing, e2e, detox, jet, ios, android, macos, coverage]
timestamp: 2026-06-25T00:00:00Z
---

# Running e2e tests

Single source of truth for local e2e. Use **only** these commands. `-ci` variants are CI-only. **Avoid** `:test-cover-reuse`, `:test-cover-and-process`, and `:test-reuse` (stale native risk — rule 4). If another doc disagrees, this doc wins.

> **Maintenance contract.** All e2e how-to knowledge lives **here**. Other docs link here; they do not restate anything.

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
   - **TS e2e coverage (Jet/NYC):** iOS/Android embed the JS bundle at **build** time — run `:build` before `:test-cover` so Istanbul + patched Jet client (`uploadCoverage` WS handshake) are in the app. macOS loads JS from Metro live; restart packager with `--reset-cache` in `tests/` after Jet patch changes. Jet patch must update `src/index.tsx` (Metro entry), not only compiled `lib/`.

4. **Always run with coverage:**

```bash
yarn tests:ios:test-cover
yarn tests:android:test-cover
yarn tests:macos:test-cover
```

   Clean `:build` + `:test-cover` each time — not reuse variants.

5. **Report locations** — [Coverage design](coverage-design.md).

6. **One e2e at a time** — never run more than one `:test-cover` (or any Detox/Jet e2e) concurrently on the same host. Jet listens on a single port (`:8090`); macOS, iOS, and Android all connect to the same Jet server and the same Metro packager (`:8081`). Parallel runs race on coverage upload, device registry locks, and emulator ports — treat failures as operator error, not product bugs.

7. **No source edits during e2e** — do not modify tracked or untracked source while an e2e run is in progress. macOS loads JS live from Metro; iOS/Android debug builds can also pick up bundle changes. A save mid-run triggers hot reload/rebundle and invalidates the in-flight test ( flaky timeouts, partial coverage, false reds). Wait for the run to finish (or cancel it cleanly) before editing `packages/**`, `tests/**`, or OKF docs that affect the bundle.

## Subagent e2e loops (shared dev host)

Implementer/reviewer subagents run iterative e2e locally. The orchestrator should **not** stream full e2e output into its context — subagents run canonical commands, wait on the **shell exit code**, and return a short summary.

### How a platform run is structured (Android/iOS)

Detox/Jest is the top-level process you wait on; Jet is a **child** it spawns:

```text
yarn tests:android:test-cover
  └─ detox test → jest (e2e/jest.config.js)
       └─ firebase.test.js spawns: yarn jet --target=android --coverage  (:8090)
            └─ app on emulator/simulator
```

macOS is flat: `yarn tests:macos:test-cover` → `jet --target=macos` (same `:8090` while that command runs).

**Do not poll `pgrep`, `detox`, or `jet.js` for completion.** Those match stale yarn wrappers, orphan Jest, and zombie Jet long after a run has stopped (especially if a prior shell was interrupted). Port `:8090` alone is not reliable — Metro/Jet zombies and cross-platform contention look the same.

### Running one iteration (subagent)

1. **Pre-flight** — host clear for *this* platform (below). If busy, wait or report blocked; do not start another `:test-cover`.
2. **One foreground command** — use the Shell tool with `block_until_ms` large enough for the platform (~15 min macOS, ~45–60 min iOS/Android). Do **not** background the run and poll.
3. **Log to file, not context** — from **repo root**, tee the canonical command only (rule 4):

```bash
yarn tests:android:test-cover 2>&1 | tee /tmp/rnfb-e2e-android.log
yarn tests:ios:test-cover     2>&1 | tee /tmp/rnfb-e2e-ios.log
yarn tests:macos:test-cover   2>&1 | tee /tmp/rnfb-e2e-macos.log
```

Use `/tmp/rnfb-e2e-<platform>.log` (overwrite each iteration). Never substitute `detox test`, `cd tests && yarn detox …`, or other non-canonical entrypoints — they are not equivalent for docs, CI, or agent prompts.

4. **Completion = shell exit code** — `0` means Detox/Jest finished (still read the log for test counts). Non-zero = failed or aborted.
5. **Parse the log tail** — do not infer from processes (substitute the log path for your platform):

```bash
rg 'passing|failing' /tmp/rnfb-e2e-<platform>.log | tail -1
rg '^\s+\d+\)' /tmp/rnfb-e2e-<platform>.log          # failure blocks, if any
rg 'Tests Complete|jet-coverage.*merged' /tmp/rnfb-e2e-<platform>.log | tail -3
```

Harness markers in `tests/e2e/firebase.test.js`: `✨ Tests Complete ✨`, Jest `N passing` / `N failing`, `[jet-coverage] merged … before NYC shutdown`.

6. **Return upstream (keep it short)** — platform, exit code, passing/failing line, failing test names (if any), log path. Optional: one line from `bash scripts/map-pipeline-coverage-gaps.sh` if coverage was the goal. Do not paste the full log into the orchestrator thread.

### Pre-flight: is the host clear to start?

Run **before** each `:test-cover`. These reflect *device activity*, not Node leftovers.

| Platform | Active e2e signal | Clear to start |
|----------|-------------------|----------------|
| **Android** | `adb -s emulator-5554 shell pidof com.invertase.testing.test` returns a PID | command prints nothing / empty |
| **iOS** | `xcrun simctl spawn booted pgrep -x testing` returns a PID | no output |
| **macOS** | `pgrep -x io.invertase.testing` returns a PID | no output |

Also confirm no other `:test-cover` is in flight: if your IDE/terminal shows an unfinished `yarn tests:*:test-cover` command, wait for its exit code before starting.

Background services (Metro `:8081`, emulators `:8080`/`:9099`) are **expected** to be up — they do not mean e2e is running.

### Iteration loop (implementer)

Typical fast loop while editing specs or harness:

1. Edit e2e/spec (or narrowing in `tests/app.js` — never commit).
2. macOS first when TS-only: `yarn tests:macos:test-cover 2>&1 | tee /tmp/rnfb-e2e-macos.log` — wait for exit code.
3. If macOS green and native touched: `yarn tests:<platform>:build && yarn tests:<platform>:test-cover 2>&1 | tee /tmp/rnfb-e2e-<platform>.log` — **one platform at a time**, serial across macOS → iOS → Android.
4. Grep log tail → fix → repeat from step 1.
5. Reviewer subagent: same commands, no `.only`, area narrowing allowed per [pipeline workflow](../packages/firestore/pipeline-implementation-workflow.md#narrowing-during-pipeline-iterations).

Orchestrator dispatches subagents for implement/review; each subagent owns its own blocking e2e runs and returns summaries only.

### Interrupted run (subagent abort, killed terminal, EADDRINUSE on :8090)

Clean up before the next canonical command:

```bash
# Android — stop app + instrumentation
adb -s emulator-5554 shell am force-stop com.invertase.testing
adb -s emulator-5554 shell am force-stop com.invertase.testing.test

# Stray Jet from an aborted run (note PID, kill only jet.js for this repo)
lsof -nP -iTCP:8090 -sTCP:LISTEN

# Confirm clear
adb -s emulator-5554 shell pidof com.invertase.testing.test || echo "instrumentation clear"
```

Then re-run from repo root: `yarn tests:<platform>:build && yarn tests:<platform>:test-cover` (foreground, with tee as above if logging).

### What not to do

- Do not invoke `detox test`, `npx jet`, or `cd tests && …` directly — use only `yarn tests:<platform>:test-cover` (and `:build` when needed) from repo root.
- Do not background `:test-cover` and poll `pgrep`.
- Do not use `:8090` listening as “e2e still running” without the platform active signal above.
- Do not start iOS/Android/macOS `:test-cover` concurrently on one host.
- Do not edit source while a tee'd run is still in progress.

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
- **Stale processes** — one Metro (`:8081`), one emulator set (`:8080`, `:9099`, `:9000`, `:4400`, …). Jet (`:8090`) is **not** a background service — it is spawned for the duration of each `:test-cover` (macOS directly; iOS/Android via Detox). A listener on `:8090` after a run usually means a stray Jet from an interrupted session — see [Subagent e2e loops § interrupted run](#interrupted-run-subagent-abort-killed-terminal-eaddrinuse-on-8090). Check: `lsof -nP -iTCP -sTCP:LISTEN | rg ':8081|:8080|:9099|:4400'`. Kill Metro/emulators: `pkill -f "react-native start"`, `pkill -f "firebase emulators"`.

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
