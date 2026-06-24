---
type: Reference
title: Running e2e tests
description: The canonical, minimal command set for running React Native Firebase e2e tests on every platform.
tags: [testing, e2e, detox, jet, ios, android, macos, coverage]
timestamp: 2026-06-24T00:00:00Z
---

# Running e2e tests (canonical commands)

This is the single source of truth for running e2e tests locally. Use **only** these commands. The `-ci` variants are for CI (GitHub Actions) only; the `-reuse` / `-and-process` variants should be **avoided** (see rule 4 — they risk stale native code). If another doc disagrees, this doc wins.

> **Maintenance contract (for humans and agents).** Keep all e2e how-to-run knowledge **in this one doc**. When you learn something new about running e2e — a command, an environment gotcha, a diagnosis trick, a benign-noise pattern — add it **here**, not in the doc you happened to be editing. Every other doc that needs e2e instructions must **link to this doc** rather than restate commands or steps; the only e2e-related edit allowed elsewhere is adding/repairing such a reference. This keeps the runbook authoritative and prevents the conflicting drift this doc was created to end.

## The five rules

1. **Packager** — all e2e tests use one Metro packager in the background. Always start it with:

```bash
yarn tests:packager:jet
```

2. **Emulators** — all e2e tests require the Firebase emulators in the background, without exception. Always start them with:

```bash
yarn tests:emulator:start
```

3. **Native rebuild** — iOS and Android e2e run real native code. If native code changed, rebuild before testing:

```bash
yarn tests:ios:build       # iOS
yarn tests:android:build   # Android
```

   macOS e2e runs against the **firebase-js-sdk** (JavaScript), so native (Swift/Java/ObjC) changes do **not** require a macOS rebuild.

   **JS library rebuild (easy to forget):** Metro serves the bundled `packages/*/dist/module/**`, **not** `packages/*/lib/**` directly. If you changed library source under `packages/*/lib/**`, run `yarn lerna:prepare` so Metro serves the updated bundle — otherwise your JS change silently does not take effect in any e2e (including macOS). e2e spec files (`packages/*/e2e/**`, `tests/**`) are served directly by Metro and do **not** need `lerna:prepare`.

4. **Run with coverage** — always run e2e with coverage. It is the only mode that works reliably every time:

```bash
yarn tests:ios:test-cover       # iOS
yarn tests:android:test-cover   # Android
yarn tests:macos:test-cover     # macOS
```

   **Do not use the `:test-cover-reuse` / `:test-cover-and-process` / `:test-reuse` variants.** They skip the native build to save a little time, but that risks running **stale native code** against new JS — a silent source of wrong results. The time saved is not worth the risk; always do a clean `:build` + `:test-cover`.

5. **Coverage** — how coverage is collected and where the reports go (JS lcov, iOS LLVM lcov, Android Jacoco XML, Codecov flags/gates) is documented in [Coverage design](coverage-design.md).

## Typical local loop

```bash
# Once, in their own background terminals (leave running):
yarn tests:emulator:start
yarn tests:packager:jet

# Each iteration on a platform (rebuild only if native changed):
yarn tests:ios:build && yarn tests:ios:test-cover
yarn tests:android:build && yarn tests:android:test-cover
yarn tests:macos:test-cover
```

## Fast iteration (this is what makes e2e quick — all TEMPORARY, revert before merge)

Full e2e is slow because it loads every module's specs. To iterate quickly, narrow the run. **Every one of these is a temporary local hack — revert before committing/merging:**

* **Focus which suites load** — `tests/app.js` builds `platformSupportedModules` and `require`s each module's e2e. Temporarily trim it to just the module you're working on (and even `require` a single spec file, e.g. `require('../packages/firestore/e2e/Pipeline.e2e.js')` instead of the whole `require.context`). This is the single biggest speed-up. Mark it clearly (e.g. `// TEMP: pipeline e2e only`) so it is obvious in the diff.
* **Focus which tests run within a file** — use Mocha `it.only(...)` / `describe.only(...)` while iterating. Remember to remove them; a stray `.only` silently skips everything else.
* **Verbose per-test logging** — set `RNFBDebug` to `true` (temporarily) in `tests/globals.js`. This prints `[TEST-->Start]` / `[TEST->Finish]` lines so you can see exactly which test is running, hanging, or failing, and disables test retries (which otherwise make a hang look like a 4x-longer hang).

A focused pipeline-only run is ~1 minute; there is no reason to avoid running e2e frequently once focused.

## Environment control (be sure you own the session)

* **Devices** — Detox boots the device it needs: it launches the iOS **simulator** and the Android **emulator** (`avdName: TestingAVD` in `tests/.detoxrc.js`) automatically, so you usually don't need to start them by hand. macOS auto-starts the app itself. Manually pre-booting the emulator is optional.
* **adb shows no device even though the emulator is up** — kick the adb server: `adb kill-server && adb start-server && adb devices`.
* **Stale Metro / Firebase emulators** — only one of each should be running. If a run behaves oddly (wrong bundle served, `EADDRINUSE`, emulator connection failures), confirm and clean up before retrying:
  * Metro listens on `:8081`; the Firebase emulators on `:8080` (firestore), `:9099` (auth), `:9000` (database), `:4400` (hub), etc. Check with `lsof -nP -iTCP -sTCP:LISTEN | rg ':8081|:8080|:9099|:4400'`.
  * Kill stale processes (`pkill -f "react-native start"`, `pkill -f "firebase emulators"`) and restart with the canonical commands above. A leftover Jet server on `:8090` (`JET_REMOTE_PORT`) also causes `EADDRINUSE`.

## Diagnosing hard failures (hangs / "stuck on test N")

For a test that hangs or fails in native in a way the JS output doesn't explain, **instrumenting native code + watching device logs is the fastest path to understanding** — much faster than guessing from JS:

* **iOS** — stream the app's logs: `xcrun simctl spawn booted log stream --level debug --style compact --predicate 'process == "testing"'`. For a true native hang (e.g. an infinite parse loop that precedes any log line), `sample <pid>` the `testing` process to capture the stuck call stack.
* **Android** — `adb logcat` (filter on your tags). Add temporary `Log.i(...)` / `NSLog`/`print` instrumentation in the parser/builder to confirm which branch executes.
* Remove all temporary instrumentation before merge.

### Benign log noise (not failures)

* iOS `detox … child-process:EXEC_FAIL "xcrun simctl terminate … com.invertase.testing" … found nothing to terminate` — Detox tried to stop an app that wasn't running. Harmless startup noise; ignore it.

## Before you hand off / merge (end of the PR development cycle)

The fast-iteration hacks above trade correctness signal for speed, so at the **end** of the PR cycle — once the change is believed complete — undo them and run the real thing. These full runs are slow but **required** before merge:

1. Revert every temporary focus/diagnostic change: restore `tests/app.js` (`platformSupportedModules` + module `require.context`), restore `RNFBDebug` in `tests/globals.js`, remove all `it.only` / `describe.only`, and remove all native instrumentation.
2. Rebuild as needed (`tests:<platform>:build` for native changes; `yarn lerna:prepare` for `packages/*/lib/**` changes).
3. Run the **full, unfocused** suite with coverage on **all three** platforms (`tests:ios:test-cover`, `tests:android:test-cover`, `tests:macos:test-cover`) and confirm green.

## Notes

* Never reuse a stale app build after changing native code — rebuild with the platform `:build` command first; rebuild JS with `yarn lerna:prepare` after changing `packages/*/lib/**`.
* All three platforms (iOS, Android, macOS) must pass; macOS exercises the JS SDK path and is not optional.
