---
type: Reference
title: Running e2e tests
description: The canonical, minimal command set for running React Native Firebase e2e tests on every platform.
tags: [testing, e2e, detox, jet, ios, android, macos, coverage]
timestamp: 2026-06-25T00:00:00Z
---

# Running e2e tests

Canonical local e2e commands. Use **only** these commands. `-ci` variants are CI-only. Avoid `:test-cover-reuse`, `:test-cover-and-process`, `:test-reuse` (stale native risk). If another doc disagrees, this wins.

> All e2e how-to lives here; other docs link here — they do **not** define alternate entrypoints or commands.

## Agent rule (read first)

<a id="agent-rule-read-first"></a>

**Never invoke the test runner (Jet), Detox, Metro, or emulators directly.** Use **only** the repo-root `yarn tests:*` commands defined in this document (for example `yarn tests:packager:jet`, `yarn tests:emulator:start`, `yarn tests:<platform>:test-cover`). Do not run `jet`, `npx jet`, `yarn jet`, `detox test`, `cd tests && …`, or ad-hoc Metro/emulator start commands. When another doc mentions e2e, Jet, Detox, or pre-flight, follow the link to this runbook — do not infer commands from log output or implementation details.

Install, prepare, and validation commands are **not** in this doc — they live in [agent command policy](agent-command-policy.md) (read before any non-e2e shell command).

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
   - `packages/*/lib/**` changed → **`yarn lerna:prepare` must run to completion (exit 0) before anything else** — Metro serves `dist/module/**`, not `lib/**`. See [prepare completion gate](#prepare-completion-gate-blocking) and [agent command policy § prepare must finish first](agent-command-policy.md#prepare-must-finish-first). After prepare finishes, restart the packager with `yarn tests:packager:jet-reset-cache` when Metro was already running ([Rules §1](#rules)).
   - TurboModule **codegen / spec / podspec / native shell** changed → same as native changed, plus regen codegen ([workflow § Running codegen](../new-architecture/turbomodule-implementation-workflow.md#running-codegen-canonical)) when specs changed; if app loads with Metro redbox `Requiring unknown module "undefined"`, see [TurboModule stale toolchain](#turbomodule-stale-toolchain-blocking).
   - **JS bundle (debug):** all platforms (iOS, Android, macOS) load JS from Metro; only **release** builds pre-bundle/embed JS. `lib/**` edits alone do not require `:build` — use the [prepare completion gate](#prepare-completion-gate-blocking) and Metro restart above.
   - **TS coverage:** run `:build` before `:test-cover` on iOS/Android so Istanbul + patched test-runner coverage instrumentation is in the debug native app (bundle still from Metro). After test-runner patch changes, restart the packager with `yarn tests:packager:jet-reset-cache` ([Rules §1](#rules)).

4. **Always run with coverage:**

```bash
yarn tests:ios:test-cover
yarn tests:android:test-cover
yarn tests:macos:test-cover
```

Clean `:build` + `:test-cover` each time — not reuse variants.

5. **Report locations** — [Coverage design](coverage-design.md).

6. **One e2e at a time (default)** — never overlap `:test-cover` runs on one host unless each run uses a distinct port/device slot via [configurable e2e environment](#configurable-e2e-environment). Serial runs share Metro `:8081` and the test-runner WebSocket port (default **8090**); parallel runs race on coverage/device/emulator state without slotted env. Every run starts after [clean pre-flight](#pre-flight-is-the-host-clear-to-start). Log triage for port/orchestration markers: [test-runner host orchestration](#test-runner-host-orchestration-log-triage-only).

7. **No source edits during e2e** — wait/cancel cleanly before editing `packages/**`, `tests/**`, or bundle-affecting OKF docs. Saves can hot reload/rebundle and invalidate tests/coverage.

## Serialized e2e loops (shared dev host)

Use [validation tiers](#e2e-validation-tiers-unit-focused-area-focused-full): **unit-focused**, **area-focused**, **full**. Match tier to [work type](change-authoring-workflow.md#work-types). **Serial default:** one unslotted `:test-cover` from clean [pre-flight](#pre-flight-is-the-host-clear-to-start). Slotted cross-platform concurrency: [parallel e2e topology](#parallel-e2e-topology). Log long output; upstream gets exit code + short summary.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md). **Terms:** [iteration vocabulary](iteration-vocabulary.md).

### How a platform run is structured (Android/iOS)

**Internal only — do not invoke sub-commands.** Wait on the single repo-root `:test-cover` command; Detox/Jest and the test runner start automatically.

```text
yarn tests:android:test-cover   # only command you run
  └─ (internal) detox → jest → firebase.test.js → test runner on :8090 → app
```

macOS: `yarn tests:macos:test-cover` only — same `:8090` transport, no Detox.

**Do not poll `pgrep`, `detox`, process names, or `:8090` for completion.** They match stale wrappers, orphans, zombies, and contention.

<a id="jet-host-orchestration-ports-and-launch-gate"></a>
<a id="test-runner-host-orchestration-log-triage-only"></a>

#### Test-runner host orchestration (log triage only)

**No commands to run from this section** — for interpreting `:test-cover` logs and CI artifacts only. Patch workflow: [detox-patches.md](../ci-workflows/detox-patches.md#updating-the-jet-patch-headless). CI triage: [iOS orchestration](../ci-workflows/ios.md#e2e-test-app-orchestration-detox--jet).

| Port                                                                       | Protocol                     | Role                                                       |
| -------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| **8090** (default `JET_REMOTE_PORT`)                                       | WebSocket (`mocha-remote-*`) | App ↔ host test transport; drives Mocha in the app         |
| **8091** (default `JET_REMOTE_PORT + 1`, override `RNFB_JET_CONTROL_PORT`) | HTTP POST only               | Host ↔ test-runner **control plane** — not used by the app |

**Why two ports** — Port 8090 is a WebSocket server (`ws` library). Plain HTTP `POST` to that socket (e.g. `/launch-ready`) gets **426 Upgrade Required** and can crash the runner with `ERR_HTTP_HEADERS_SENT` if a control handler shares the same HTTP stack. Control endpoints therefore live on a **separate** small HTTP server (`startControlHttpServer` in the test-runner patch).

**Launch gate (orchestration race fix)** — `firebase.test.js` starts the test runner with `RNFB_JET_DEFER_RUN=1`. It listens on 8090 and **defers** `server.run()` until the host signals launch success:

1. On Android, host force-stops both test packages and clears any stray **8090** listener before spawning Jet.
2. Host waits for TCP **8090**, then Metro (debug) if needed, then `launchAppWithRetry`.
3. Host `POST`s **`/orchestrate-state`** (`{ "phase": "launch-pending" | "launch-ok" | … }`) to the control port (best-effort diagnostics).
4. After `launchApp` succeeds, host `POST`s **`/launch-ready`** → test runner calls `server.run()` and the app may receive the mocha-remote `run` action.
5. Mocha tests must not start during a stuck or retried `launchApp`; on inner launch retry the host may kill and respawn the test runner before `terminateApp`/simulator reboot.

**Log markers** — `[rnfb-e2e] orchestrate-state=…`, `[jet-control] deferring server.run until POST /launch-ready`, `[jet-control] launch-ready received`, `[jet-control] listening on http://…:8091`, `[jet-coverage] …`, `Jet client connected`.

**Pre-flight** — [Host-clear probes](#host-clear-probes) check **8090 only** (stray test-runner WS listener). **8091** may be open during a run; do not treat it as a stale-process signal by itself.

#### CI iOS instrumentation (not local)

GitHub Actions **Testing E2E iOS** adds CI-only steps local `:test-cover` does not run: pre-boot (`boot-simulator.sh`), one filtered **`sim-app.log`** stream, **`wait-for-load-settle.sh`** (threshold **20**) immediately before Detox, and optional video when `record_screens: true`. Host syslog and unfiltered simulator logs are **disabled** to reduce runner baseload.

**Canonical owner:** [iOS CI baseload policy](../ci-workflows/ios.md#ci-baseload-policy-instrumentation). Artifact names and triage: [simulator logging and video](../ci-workflows/ios.md#simulator-logging-and-video-troubleshooting).

### Running one iteration

1. [Pre-flight](#pre-flight-is-the-host-clear-to-start); if [host-clear probes](#host-clear-probes) fail, [pre-flight recovery](#pre-flight-recovery) first.
2. One foreground Shell command; set `block_until_ms` large enough (~15m macOS, ~45–60m iOS/Android). Do **not** background/poll. If the Shell tool returns no exit status under default sandbox permissions, see [agent command policy § Shell sandbox / permissions](agent-command-policy.md#shell-sandbox-permissions) before retrying or concluding failure.
3. From repo root, tee canonical command:

```bash
yarn tests:android:test-cover 2>&1 | tee /tmp/rnfb-e2e-android.log
yarn tests:ios:test-cover     2>&1 | tee /tmp/rnfb-e2e-ios.log
yarn tests:macos:test-cover   2>&1 | tee /tmp/rnfb-e2e-macos.log
```

Use `/tmp/rnfb-e2e-<platform>.log` (overwrite each iteration). Do not substitute other entrypoints — see [agent rule](#agent-rule-read-first).

4. Completion — **prefer shell exit code** when the Shell tool returns one: `0` finished; non-zero failed/aborted. If the Shell tool is **aborted, interrupted, or returns no exit status**, do **not** conclude failure or incomplete from that alone — check the tee log footer for [done markers](#stalled-run-detection) before deciding; see [interrupted run](#interrupted-run-abort-killed-terminal-eaddrinuse-on-8090).
5. Parse log tail with **anchored** patterns; do not infer from processes. Do **not** use bare `rg 'passing|failing'` — it matches mid-suite test titles too (e.g. `accepts passing in…`), not just the Jest summary line:

```bash
rg '^\s*\d+ (passing|failing)' /tmp/rnfb-e2e-<platform>.log | tail -2
rg '^\s+\d+\)' /tmp/rnfb-e2e-<platform>.log                        # failure blocks, if any
rg 'jet-coverage.*merged .* before NYC' /tmp/rnfb-e2e-<platform>.log | tail -1
rg 'Tests Complete' /tmp/rnfb-e2e-<platform>.log | tail -1          # optional, see below
```

**Done footers** (either is sufficient; both together is strongest): Jest summary `N passing` / `N failing`, **and** — on the coverage path — `[jet-coverage] merged … before NYC shutdown`. `✨ Tests Complete ✨` is **optional** — it is not always emitted on local macOS runs; never require it alone as the done signal. Other markers: `[rnfb-e2e] orchestrate-state=`, `[jet-control] launch-ready received`.

6. Return only platform, exit code (or `unknown (tool aborted); log footer green|red` when the Shell tool gave no exit status — [interrupted run](#interrupted-run-abort-killed-terminal-eaddrinuse-on-8090)), pass/fail line, failing tests, log path, optional coverage-gap line. No full log upstream.
7. **Waiting on output (optional):** if using output-match notifications while a foreground `:test-cover` runs, never pattern bare `passing`. Use an anchored pattern such as `^\s*\d+ (passing|failing)` or `jet-coverage.*merged .* before NYC` instead. Prefer relying on the Shell tool's own exit code when it returns normally over any output-match notification.

### Pre-flight: is the host clear to start?

**Canonical owner** for host-clear probes, recovery after abort, and service checks. Other OKF docs link here by reference — do not duplicate commands or probes elsewhere.

Run **all four** steps before every `:test-cover`. After an [interrupted run](#interrupted-run-abort-killed-terminal-eaddrinuse-on-8090), run [pre-flight recovery](#pre-flight-recovery) and re-run the probes.

<a id="prepare-completion-gate-blocking"></a>

#### 0. Prepare complete (when `packages/*/lib/**` changed)

If product code under `packages/*/lib/**` was edited in this session, **`yarn lerna:prepare`** (or scoped `yarn lerna run prepare --scope …`) must have **fully finished with exit code 0** before pre-flight steps 1–3 or any `:test-cover` / `:build`.

- **Wait** for the prepare shell to return — do not batch prepare in parallel with Metro restart, pre-flight probes, or e2e in the same agent turn.
- **Then** restart Metro when it was already running: `yarn tests:packager:jet-reset-cache` ([Rules §3](#rules)).
- **Then** continue with host-clear probes and service checks below.

Skipping this gate causes missing or half-written `dist/module/**` while Metro `/status` still returns 200 — a common source of bundle-load and module-not-found failures that look like product bugs.

Owner for install/prepare serialization: [agent command policy § prepare must finish first](agent-command-policy.md#prepare-must-finish-first).

#### 1. Host clear

No in-flight test run on the target platform:

| Platform | Clear when |
|----------|------------|
| **Android** | [Android app reset](#android-app-reset-blocking) + `bash scripts/e2e/check-e2e-resources.sh --platform=android` pass |
| **iOS** | `bash scripts/e2e/check-e2e-resources.sh --platform=ios` passes — **zero booted simulators** and no stray listener on `:8090`. Detox boots `iPhone 17` from `tests/.detoxrc.js`; do not pre-boot or leave simulators running. Plain [host-clear probes](#host-clear-probes) without `--platform=ios` intentionally do **not** fail on an unrelated booted simulator — see [global device scoping](#global-device-scoping). |
| **macOS** | [Host-clear probes](#host-clear-probes) pass (no macOS test app process — default `io.invertase.testing`, or `RNFB_MACOS_PRODUCT_NAME` when set; unscoped check also treats `.sN` siblings as busy) |

Also wait for any visible unfinished `yarn tests:*:test-cover`.

<a id="android-app-reset-blocking"></a>

**Android app reset (blocking)** — run **before every** Android `:test-cover`, not only after a failed run:

```bash
ANDROID_SERIAL="${ANDROID_SERIAL:-emulator-5554}"
adb -s "$ANDROID_SERIAL" shell am force-stop com.invertase.testing
adb -s "$ANDROID_SERIAL" shell am force-stop com.invertase.testing.test
# Or via generic release (also clears Jet/Metro per env):
# bash scripts/e2e/release-e2e-resources.sh --only android-apps,jet
```

The main app (`com.invertase.testing`) can sit on **“waiting for jet to start tests…”** while the [host-clear probe](#host-clear-probes) still passes (it only checks `com.invertase.testing.test`). A stale main app then connects as a **second Jet client** after Detox launches a fresh run → `Received a message from the client, but server wasn't running` and no Mocha summary. Force-stop **both** packages, then re-run the probe.

On **darwin** hosts, also clear the macOS test app before Android `:test-cover` when they share a Jet port (serial default `:8090`, or the same `JET_REMOTE_PORT` / platform Jet in slotted runs). Alternating macOS and Android without killing the macOS app leaves a stale macOS Jet client → duplicate clients and `server wasn't running`.

```bash
MACOS_APP="${RNFB_MACOS_PRODUCT_NAME:-io.invertase.testing}"
! pgrep -x "$MACOS_APP" >/dev/null 2>&1
# or: bash scripts/e2e/release-e2e-resources.sh --only macos-app,jet
# Unscoped release also clears io.invertase.testing.s0..sN leftovers from parallel runs.
```

(`firebase.test.js` runs this automatically via `ensureAndroidJetHostClear` before spawning Android Jet; use the probe manually when prepping from the runbook.)

<a id="host-clear-probes"></a>

**Host-clear probes** — prefer the generic scripts (env-aware, mellifera-agnostic). They resolve [configurable e2e environment](#configurable-e2e-environment) vars first, then fall back to serial defaults (`8090`, `8081`, `emulator-5554`, …). **Exit 0 = clear.**

`check-e2e-resources.sh` **default mode reports Jet WebSocket + apps + simulators only** — it does **not** fail solely on Metro `:8081` or the Firebase emulator ports being open, because those are expected to be up already ([step 2, services ready](#2-services-ready), the opposite check). Pass `--services` (alias `--strict`) to additionally treat Metro/emulator ports as BUSY. `--platform=android|ios|macos` scopes device probes to one platform (otherwise an ambiguous serial "global" fallback is used — it does not treat android+ios+macos as all simultaneously active; see [global device scoping](#global-device-scoping)). Unscoped check (no slot env) can report **CLEAR** while slotted leftovers (`.sN` apps, slot ports, booted `TestingAVD-N` / `RNFB E2E iOS slot-N`) remain — load `export-slot-env` (or `--mellifera`) before trusting CLEAR for a slot. `tests/mellifera.env.json` is only consulted with `--mellifera` or `RNFB_MELLIFERA=1` — see [mellifera JSON scoping](#mellifera-json-scoping).

```bash
# Host-clear (default): Jet + apps + sims only — Metro/emulator ports are informational.
bash scripts/e2e/check-e2e-resources.sh

# Services mode: also flag Metro/emulator ports as BUSY (single all-in-one probe).
bash scripts/e2e/check-e2e-resources.sh --services

# Scope device probes to one platform instead of the ambiguous serial "global" fallback.
bash scripts/e2e/check-e2e-resources.sh --platform=ios

# Soft then forceful clear (ports + apps, full wipe by default incl. Metro/emulators).
# Add --devices to also stop AVD / shutdown sims. Add --only to limit scope.
bash scripts/e2e/release-e2e-resources.sh
# bash scripts/e2e/release-e2e-resources.sh --only jet,android-apps  # jet also releases jet-control
# bash scripts/e2e/release-e2e-resources.sh --devices
```

Manual one-liners (defaults only — use when debugging without the scripts):

```bash
JET_PORT="${JET_REMOTE_PORT:-${RNFB_ANDROID_JET_PORT:-${RNFB_IOS_JET_PORT:-${RNFB_MACOS_JET_PORT:-8090}}}}"
test -z "$(lsof -nP -iTCP:${JET_PORT} -sTCP:LISTEN -t 2>/dev/null || true)"
ANDROID_SERIAL="${ANDROID_SERIAL:-emulator-5554}"
! adb -s "$ANDROID_SERIAL" shell pidof com.invertase.testing.test >/dev/null 2>&1
! pgrep -x "${RNFB_MACOS_PRODUCT_NAME:-io.invertase.testing}" >/dev/null 2>&1
```

<a id="pre-flight-recovery"></a>

**Pre-flight recovery** — when probes fail **after** [Android app reset](#android-app-reset-blocking), abort, kill, or `EADDRINUSE` on the Jet port. Canonical recovery:

```bash
bash scripts/e2e/release-e2e-resources.sh
# If AVD/sim must go down too:
bash scripts/e2e/release-e2e-resources.sh --devices
bash scripts/e2e/check-e2e-resources.sh   # must exit 0
```

Do **not** use `boot-simulator.sh` or `simctl shutdown all` as routine prep ([what not to do](#what-not-to-do)).

#### 2. Services ready

Metro and emulators must be **running and responsive** — do not assume from a prior session or background start. This is the **opposite** of [host-clear](#host-clear-probes) (clear = nothing listening; ready = packager/emulators up).

```bash
METRO_PORT="${RCT_METRO_PORT:-${RNFB_METRO_PORT:-8081}}"
FIRESTORE_PORT="${RNFB_ANDROID_EMULATOR_FIRESTORE_PORT:-${RNFB_IOS_EMULATOR_FIRESTORE_PORT:-${RNFB_MACOS_EMULATOR_FIRESTORE_PORT:-8080}}}"
curl -sf "http://127.0.0.1:${METRO_PORT}/status" >/dev/null
curl -sf "http://127.0.0.1:${FIRESTORE_PORT}" >/dev/null
test -n "$(lsof -nP -iTCP:5001 -sTCP:LISTEN -t 2>/dev/null || true)"   # Functions emulator — listener only
```

If Metro or Firestore checks fail: start `yarn tests:packager:jet` and `yarn tests:emulator:start` (background); re-check until both pass. After **`yarn lerna:prepare` has finished** (step [0](#prepare-completion-gate-blocking)) or test-runner patch edits, restart the packager with `yarn tests:packager:jet-reset-cache` ([Rules §1](#rules)) — never restart Metro while prepare is still running.

Slotted mellifera runs use `scripts/e2e/mellifera-preflight.sh` to wait on the reserved Metro/emulator ports from `tests/mellifera.env.json` (services-up gate, not host-clear).

A listener on the Metro/Firestore ports (or `:5001`) alone is **not** sufficient for Metro/Firestore — their HTTP checks must succeed. **Functions (`:5001`):** verify the listener is up; `curl -sf http://127.0.0.1:5001/` exits non-zero because the root path returns **404** — that is expected and **not** a service failure (do not treat it like the Metro/Firestore gates).

#### 3. Harness matches validation tier

Confirm local harness overrides (or committed files for **full** tier only) match the item's **`validation_tier`** ([iteration vocabulary](iteration-vocabulary.md#work-queue-fields)), **not** the branch's committed harness alone.

| Tier                                                        | Harness before `:test-cover`                                                                                                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unit-focused** (`implementation`)                         | **Area narrowing required** — [`tests/harness.overrides.js`](#local-harness-overrides-harnessoverridesjs) with `modules` + `RNFBDebug: true`; `.only` OK locally. |
| **Area-focused** (`independent-review`, `baseline-capture`) | **Area narrowing required** — same overrides file; load **full** spec file(s) for the package area; **no** `.only`; `RNFBDebug: true`.                            |
| **Full** (`pre-merge-validation`)                           | **No** `harness.overrides.js` (delete or `{}`); full app in committed `tests/app.js`; `RNFBDebug: false`.                                                         |

Committed full harness on the branch does **not** override **unit-focused** or **area-focused** tier for local runs. Package workflows define **which module/spec** (e.g. [pipelines § area harness](../packages/firestore/pipeline-implementation-workflow.md#pipeline-area-harness)). **How:** [local harness overrides](#local-harness-overrides-harnessoverridesjs). Never commit `harness.overrides.js`.

See [Harness narrowing gate (blocking)](#harness-narrowing-gate-blocking) — a run that skips step 3 does **not** close `implementation_gate` or `review_gate`.

### Stalled run detection

Completion = shell exit code + log markers — not open-ended log tailing.

| Platform | Early markers (≈2–3 min) | Done |
|----------|--------------------------|------|
| **macOS** | `Jet client connected` | Jest `N passing` / `N failing`, preferably **and** `[jet-coverage] merged … before NYC shutdown` |
| **iOS/Android** | Detox launch done, `Jet client connected` | Same |

`✨ Tests Complete ✨` is **optional** if present — it is not always emitted on local macOS runs; treat it as a bonus signal, never a required one.

**If stalled** — no new markers for **5 minutes**, or past tier budget (~15m macOS, ~45–60m iOS/Android) without a Jest summary (`N passing`/`N failing`) or `[jet-coverage] merged … before NYC shutdown`: treat as [interrupted run](#interrupted-run-abort-killed-terminal-eaddrinuse-on-8090). Do not gate the stall decision on emoji `Tests Complete` alone. Run [pre-flight recovery](#pre-flight-recovery), confirm [host-clear probes](#host-clear-probes) and [services ready](#2-services-ready), retry. Do not keep watching flat tee output.

- macOS bundle/Metro hangs → [ci-workflows/other.md § bundle load hang](../ci-workflows/other.md#ci-failure-bundle-load-hang--could-not-connect-to-development-server)
- iOS Metro at launch → [ci-workflows/ios.md § Metro unresponsive](../ci-workflows/ios.md)

Do not poll `pgrep`, process names, or `:8090` for _completion_ ([above](#how-a-platform-run-is-structured-androidios)). Stall detection uses **missing progress markers**, not exit polling.

### Harness narrowing gate (blocking)

**Both `unit-focused` and `area-focused` tiers require area narrowing before the first `:test-cover`.** The only difference between those tiers is whether `.only` is allowed and whether the full package-area spec loads — not whether the harness stays at full app load.

**Primary mechanism:** create a local **`tests/harness.overrides.js`** (gitignored) from [`tests/harness.overrides.example.js`](../../tests/harness.overrides.example.js). Committed `tests/app.js` and `tests/globals.js` stay at full harness — do **not** edit them for module narrowing or `RNFBDebug`. See [local harness overrides](#local-harness-overrides-harnessoverridesjs).

| Mistake                                                                                                | Symptom                                                                                            | Gate impact                                                                                                   |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Run `:test-cover` with no overrides (full harness) during `implementation` or `independent-review`     | macOS/iOS/Android pass counts in the **hundreds or thousands** (all modules via `require.context`) | Run is **invalid** — does not close `implementation_gate` or `review_gate`                                    |
| Edit only one platform block in `tests/app.js` (legacy pattern) while the other still pushes full list | macOS ~700 firestore tests pass; iOS/Android logs show `database`, `crashlytics`, etc.             | Run is **invalid** on iOS/Android — use [overrides file](#local-harness-overrides-harnessoverridesjs) instead |
| Correct area harness via overrides                                                                     | Pass counts match loaded module/spec scope ([sanity table](#sanity-check-by-platform))             | Expected                                                                                                      |

**Apply locally before every `:test-cover` at unit-focused or area-focused tier** — even when git shows the full push harness. **Remove** `tests/harness.overrides.js` (or export `{}`) after the run when the branch keeps full harness (typical until phase **R**). Never commit `harness.overrides.js`.

**Validation report must state:** harness narrowed (yes/no), override file used (yes/no), which module/spec loads, whether pass counts match area scope, and **which platforms ran** with exit codes. A green full-app run is not a substitute.

<a id="platform-coverage-gate-blocking"></a>

### Platform coverage gate (blocking — no shortcuts)

**Both `unit-focused` (implementation) and `area-focused` (baseline-capture, independent-review) require e2e on every platform where the changed module loads in the committed harness** — not a subset for convenience.

Determine required platforms from committed [`tests/app.js`](../../tests/app.js) platform blocks (use **committed** lists when deciding macOS vs native requirement, not a narrowed local harness):

| Platform class               | When required                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| **macOS** (`Platform.other`) | Module appears in the committed `if (Platform.other)` list (or overrides `modules` includes it)  |
| **iOS** and **Android**      | Module appears in the committed `if (!Platform.other)` list (or overrides `modules` includes it) |

**Area-focused (`baseline-capture`, `independent-review`) — closes `review_gate` / baseline only when:**

1. Full loaded package spec(s) with [area narrowing](#harness-narrowing-gate-blocking) (no `.only`).
2. **Serial** `:test-cover` on **each required platform** above — pre-flight before **every** run.
3. Native platforms: `yarn tests:<platform>:build` before first `:test-cover` when native changed ([Rules §3](#rules)).
4. Validation handoff includes a **platform matrix**: platform, exit code, pass/fail/pending counts, log path.

**Invalid shortcuts (do not close gates):**

- “macOS + iOS minimum”; skipping **Android** when the module loads on Android.
- “Skip Android if time tight” or “Android fallback only if iOS failures look env-related” without a fresh Android run.
- Substituting a prior implementer log for `independent-review` on the frozen tree.

**Module-specific skip:** only when the module is **absent** from that platform’s harness list (e.g. `messaging` is not on macOS). Record in the work-queue **Notes** — not an oral exception.

**Unit-focused (`implementation`) — native touched:** macOS first when the path is TS/web-only; when the module loads on iOS **and** Android, run **both** before closing `implementation_gate` (same narrowing; `.only` OK locally; never commit).

See also: [coverage design § platform parity](coverage-design.md#coverage-expectations-policy), [validation checklist § handoff](validation-checklist.md#handoff-checklist).

**Checklist (copy before first run):**

1. `tests/harness.overrides.js` exists with correct `modules` (almost always include `'app'`) and `RNFBDebug: true`.
2. Overrides `modules` lists only the package under change (e.g. `['app', 'firestore']`).
3. Spec load uses direct `require` of the area spec — not `require.context` for all packages — when sub-suite narrowing applies; otherwise full package `require.context` is OK when the module list is narrowed.
4. No `.only` when tier is **area-focused**; `.only` optional when tier is **unit-focused**.
5. Grep log: pass count consistent with area scope (~100 for pipeline-only, ~700 for full firestore package on macOS), not full app (~141+ macOS baseline with full load per [work queue](../packages/firestore/pipeline-coverage-work-queue.md)).

### Unit-focused-tier iteration loop

For `implementation` work type — validation tier **unit-focused** ([change authoring workflow](change-authoring-workflow.md#implementation-inner-loop)):

1. [Pre-flight](#pre-flight-is-the-host-clear-to-start) — [prepare completion gate](#prepare-completion-gate-blocking) when `lib/**` changed, [host-clear probes](#host-clear-probes), services ready, **harness overrides in place** (step 3), **`RNFBDebug: true`** via overrides; if probes fail, [pre-flight recovery](#pre-flight-recovery) first.
2. Edit e2e/spec; add `.only` if needed; never commit overrides or `.only`.
3. macOS first when TS-only: `yarn tests:macos:test-cover 2>&1 | tee /tmp/rnfb-e2e-macos.log` — wait for exit code ([stalled run](#stalled-run-detection) if markers stop).
4. If macOS green and native touched: `yarn tests:<platform>:build && yarn tests:<platform>:test-cover 2>&1 | tee /tmp/rnfb-e2e-<platform>.log`; one platform at a time.
5. Grep log tail → fix → repeat from step 1.
6. When `implementation_gate` closes, next work type is `independent-review` at **area-focused** tier — [frozen tree](change-authoring-workflow.md#frozen-tree); no `.only`; area narrowing per package workflow.

### Serialized e2e dispatch

**Serial default** for gate closure and unslotted hosts — see [host rule](change-authoring-workflow.md#host-rule). Slotted exception: [parallel e2e topology](#parallel-e2e-topology) + [configurable e2e environment](#configurable-e2e-environment).

| Rule                           | Requirement                                                                                                                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **One unslotted e2e at a time** | Wait for prior shell exit code + short log summary (unless each run has distinct slotted ports/devices per [parallel e2e topology](#parallel-e2e-topology))                                                                   |
| **No overlapping tiers**       | Never run unit-focused-tier and area-focused-tier `:test-cover` concurrently on one host                                                                                                                                      |
| **Clean pre-flight every run** | [Pre-flight](#pre-flight-is-the-host-clear-to-start) — [host-clear probes](#host-clear-probes), services, harness tier                                                                                                        |
| **Authoring loop**             | `implementation` (Jest + **unit-focused**) → `independent-review` (**area-focused**, frozen tree) → `commit` — [change authoring](change-authoring-workflow.md)                                                                |

Tier scope table: [E2e validation tiers](#e2e-validation-tiers-unit-focused-area-focused-full).

Each run owns its blocking `:test-cover` and returns summaries only.

### Interrupted run (abort, killed terminal, EADDRINUSE on :8090)

**Check the log before recovering.** After a STOP/abort or a Shell tool interruption that leaves the exit status unknown, read the `/tmp/rnfb-e2e-<platform>.log` footer **first** — before `pkill`, [pre-flight recovery](#pre-flight-recovery), or any other kill/recovery step:

```bash
rg '^\s*\d+ (passing|failing)' /tmp/rnfb-e2e-<platform>.log | tail -2
rg 'jet-coverage.*merged .* before NYC' /tmp/rnfb-e2e-<platform>.log | tail -1
```

- **Done footers present** (Jest `N passing`/`N failing`, preferably with `[jet-coverage] merged … before NYC shutdown`) → treat the run as **complete**. Record pass/fail from the log; report exit as `unknown (tool aborted); log footer green|red` — do not conclude failure or incomplete just because the Shell tool gave no exit status.
- **Log shows incomplete or stalled** (no done footers, matches [stalled run detection](#stalled-run-detection)) → only then run [pre-flight recovery](#pre-flight-recovery), confirm [host-clear probes](#host-clear-probes) pass, then rerun from repo root: `yarn tests:<platform>:build && yarn tests:<platform>:test-cover` (foreground; tee if logging). Keep one `:test-cover` active at a time on a host.

<a id="macos-done-but-tee-pipe-still-blocked"></a>

#### macOS: done footer green but `tee`/shell never returns

**Failure mode (fixed):** the Jest summary and `[jet-coverage] merged … before NYC shutdown` footer print, but the foreground `| tee /tmp/rnfb-e2e-macos*.log` shell never exits — Agent Shell looks idle/hung forever. Root cause was `tests/.jetrc.js` spawning `io.invertase.testing` with `stdio: ['ignore', 'inherit', 'inherit']`: the app inherited the write end of the tee pipe, so the pipe never saw EOF even after the suite finished. Fixed by detaching macOS app stdio (`stdio: ['ignore', 'ignore', 'ignore']`) and hardening `killMacOsTestApp()` (soft kill → wait → `killall -9` → verify) in `.jetrc.js`.

If this recurs: `pgrep -x io.invertase.testing` — if still alive after the done footer, kill it (`killall -9 io.invertase.testing`) so the tee pipe can close; the anchored log footer ([done footers](#stalled-run-detection)) is still the authoritative completion signal, not the shell exit code alone. The recommended tee command (`yarn tests:macos:test-cover 2>&1 | tee /tmp/rnfb-e2e-macos.log` — [running one iteration](#running-one-iteration)) is unchanged by this fix.

### What not to do

- Do not invoke the test runner (Jet), Detox, Metro, or emulators except through repo-root `yarn tests:*` commands in this doc — see [agent rule](#agent-rule-read-first).
- Do not run `:test-cover`, `:build`, Metro restart, or pre-flight while **`yarn` / `yarn lerna:prepare` is still in progress** — wait for exit 0 first ([prepare completion gate](#prepare-completion-gate-blocking)).
- Do not background `:test-cover` and poll `pgrep`, `detox`, or process names for completion.
- Do not use `:test-cover-reuse`, `:test-cover-and-process`, or `:test-reuse` when measuring coverage or closing review gates.
- Do not use `:8090` listening as “e2e still running” without the platform active signal above.
- Do not start unslotted iOS/Android/macOS `:test-cover` concurrently on one host (same Metro/Jet/emulator defaults). Slotted cross-platform concurrency only per [parallel e2e topology](#parallel-e2e-topology).
- Do not edit source while a tee'd run is still in progress.
- Do not passively tail tee output when progress markers stop — follow [stalled run detection](#stalled-run-detection).
- Do not run **full** harness (`require.context`, all modules) for **unit-focused**/**area-focused** tier — match [harness to tier](#3-harness-matches-validation-tier).
- Do not run `.github/workflows/scripts/boot-simulator.sh`, `simctl shutdown all`, or `kill -9` on `:8090` as prep. `boot-simulator.sh` is CI-only or internal to iOS test-runner retry.

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

| Kind                       | Mechanism                                                                          | Scope                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Area narrowing**         | [`tests/harness.overrides.js`](#local-harness-overrides-harnessoverridesjs)        | Which modules load (filter `platformSupportedModules` on all platforms) |
| **Sub-suite narrowing**    | Temporary edit to `tests/app.js` (`require` one spec instead of `require.context`) | Which spec files load within a module — **unit-focused diagnosis only** |
| **Single-test narrowing**  | `it.only(...)`                                                                     | One case in a loaded file                                               |
| **Single-suite narrowing** | `describe.only(...)`                                                               | One block in a loaded file                                              |

**Area narrowing** = overrides file for modules + `RNFBDebug`; not test-runner `--grep` or packager `--target`.

<a id="local-harness-overrides-harnessoverridesjs"></a>

### Local harness overrides (`harness.overrides.js`)

**Canonical owner** for module narrowing and fail-fast debug. Package workflows name **which module/spec**; this section defines **how** to focus the harness without editing committed files.

#### Setup

```bash
cp tests/harness.overrides.example.js tests/harness.overrides.js
```

Edit `tests/harness.overrides.js` (gitignored — never commit). Shape:

| Field                 | Purpose                                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `modules?: string[]`  | After each platform block builds its list, filter to only these module names (works on macOS **and** iOS/Android — no dual-block edits) |
| `RNFBDebug?: boolean` | `true` = verbose RNFB logging + disabled test retries ([§ fail-fast](#fail-fast-rnfbdebug-and-sub-suite-narrowing))                     |

**Example — app package only, debug on:**

```javascript
module.exports = {
  RNFBDebug: true,
  modules: ['app'],
};
```

Omit a field or export `{}` to keep committed defaults for that field.

#### How it works

Committed [`tests/app.js`](../../tests/app.js) still builds full `platformSupportedModules` per platform block. If `harness.overrides.js` exists, [`tests/globals.js`](../../tests/globals.js) reads `RNFBDebug` and `tests/app.js` filters the module list **after** the platform block runs — so one overrides file applies on every platform.

#### Spec loading (optional second narrowing)

Module specs load in `loadTests()` via `platformSupportedModules.includes('<module>')` — usually `require.context('../packages/<module>/e2e', …)`.

| Goal              | Change                                                                                                                                                                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full package area | Overrides `modules` only — leave `require.context` as-is                                                                                                                                                                                                                                |
| Single spec file  | **Temporarily** replace `require.context` for that module with `require('../packages/<module>/e2e/<Spec>.e2e.js')` in `tests/app.js` — **never commit** ([sub-suite](#fail-fast-rnfbdebug-and-sub-suite-narrowing); unit-focused diagnosis only unless package workflow says otherwise) |

#### Revert before `full` tier or commit

1. Delete `tests/harness.overrides.js` or set `module.exports = {}`.
2. Revert any temporary `require.context` → single `require` edits in `tests/app.js`.
3. Remove all `.only` and native instrumentation.

Do **not** revert durable product wiring in committed `tests/globals.js` (e.g. `NativeRNFBTurbo*` proxy routing — [NewArch-AD-13](../new-architecture/architecture-decisions.md#newarch-ad-13)).

#### Sanity check by platform

| Platform      | Narrowed firestore-only (full `packages/firestore/e2e`)  | Pipeline-only (`Pipeline.e2e.js`) |
| ------------- | -------------------------------------------------------- | --------------------------------- |
| macOS         | ~**700** passing                                         | ~**100** passing                  |
| iOS / Android | Same order of magnitude as macOS for the same spec scope | ~**100** passing                  |

Pass counts in the **thousands** or unrelated suites (`database`, `crashlytics`, …) in the log → confirm overrides file exists with correct `modules` and re-run.

**Area example:** `modules: ['app', 'firestore']` + full firestore specs via existing `require.context`.

Package-specific spec names: [Firestore pipeline harness](../packages/firestore/pipeline-implementation-workflow.md#pipeline-area-harness), [namespace removal § module area harness](../namespace-api-removal-workflow.md#module-area-harness).

<a id="fail-fast-rnfbdebug-and-sub-suite-narrowing"></a>

### Fail-fast (`RNFBDebug`) and sub-suite narrowing

**`RNFBDebug`:** for **`unit-focused`** and **`area-focused`** tiers, set **`RNFBDebug: true`** in `tests/harness.overrides.js` **before the first `:test-cover`** — not optional. It prints per-case start/finish and **disables Mocha retry/backoff**, so failures surface immediately instead of burning time on retries. Committed `tests/globals.js` default stays `false`. Remove overrides (or set `RNFBDebug: false`) before **`full`** tier or commit ([§ before merge](#before-merge-pr-handoff)).

| Kind                      | Mechanism                                                                     | When                                                                                                                                                                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sub-suite narrowing**   | `describe.only` / `require` one e2e file (e.g. `Aggregate/count.e2e.js` only) | **Unit-focused diagnosis only** — after [pre-flight](#pre-flight-is-the-host-clear-to-start) is clean and the **same failure repeats** on back-to-back runs without assertion progress. Never for **`area-focused`** gate closure (no `.only`). Never commit. |
| **Single-test narrowing** | `it.only(...)`                                                                | Same as sub-suite — unit-focused diagnosis only                                                                                                                                                                                                               |

Package workflows may name default area specs (e.g. [Firestore pipeline harness](../packages/firestore/pipeline-implementation-workflow.md#pipeline-area-harness)); sub-suite narrowing is **tighter** than area narrowing for iteration speed.

**E2e diagnosis escalation** (cross-package): [change authoring § implementation inner loop](change-authoring-workflow.md#e2e-diagnosis-escalation).

Package workflows may further restrict narrowing per [validation tier](#e2e-validation-tiers-unit-focused-area-focused-full).

## E2e validation tiers (unit-focused / area-focused / full)

All tiers use [canonical commands](#rules), [host rule](change-authoring-workflow.md#host-rule), and clean [pre-flight](#pre-flight-is-the-host-clear-to-start). Tier names describe **scope**, not who runs the commands — see [iteration vocabulary](iteration-vocabulary.md#validation-tier-identifiers).

| Validation tier  | E2e scope                                             | Narrowing allowed                                                                                    | Typical work type                        |
| ---------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Unit-focused** | Fast loop while product code is changing              | `harness.overrides.js` + optional `.only` / sub-suite `require` in `tests/app.js` — **never commit** | `implementation`                         |
| **Area-focused** | Full loaded spec(s) for the package/area under change | **`harness.overrides.js`** required; **no** `.only`                                                  | `baseline-capture`, `independent-review` |
| **Full**         | Unfocused — all modules, all platforms                | Delete overrides file — committed full harness only                                                  | `pre-merge-validation`                   |

**Universal rules:**

- **Serial default** for gate closure — one unslotted `:test-cover` at a time. Slotted cross-platform concurrency only per [parallel e2e topology](#parallel-e2e-topology) (still never two of the **same** platform from one worktree).
- Every run starts from **verified [pre-flight](#pre-flight-is-the-host-clear-to-start)**; if probes fail, [pre-flight recovery](#pre-flight-recovery) before another run.
- Use **only** canonical commands from this doc.
- Never overlap unit-focused-tier and area-focused-tier `:test-cover` on one host.

See also: [unit-focused-tier loop](#unit-focused-tier-iteration-loop), [dispatch](#serialized-e2e-dispatch), [pre-merge](#before-merge-pr-handoff).

## Environment

- **Devices** — Detox boots simulator/emulator (`iPhone 17` on iOS, `TestingAVD` on Android); slotted runs use `TestingAVD-N` / `RNFB E2E iOS slot-N` — see [slot lifecycle](#slot-lifecycle). iOS `:test-cover` should preflight with `check-e2e-resources.sh --platform=ios` (or a mellifera reservation) for the stricter zero-booted-simulators check — see [global device scoping](#global-device-scoping). macOS auto-starts app.
- **adb empty** — `adb kill-server && adb start-server && adb devices`
- **Stale processes (serial default)** — one Metro (`:8081`), one emulator set (`:8080`, `:9099`, `:9000`, `:4400`, `:5001`, …). Stray listener on `:8090` after a run → [pre-flight recovery](#pre-flight-recovery), then restart background services with [Rules §1–2](#rules) (`yarn tests:packager:jet`, `yarn tests:emulator:start`). Slotted runs: [configurable e2e environment](#configurable-e2e-environment).
- **Android Gradle home** — when Android `:build` or `:test-cover` fails with missing/wrong Gradle cache on a host that does not default to `~/.gradle`, export `GRADLE_USER_HOME=$HOME/.gradle` before the run.

<a id="configurable-e2e-environment"></a>

### Configurable e2e environment

Serial e2e uses committed defaults (Metro `:8081`, Jet `:8090`, emulators `:8080` / `:9099` / …). Slotted parallel runs export **per-platform prefixed** ports (e.g. `RNFB_ANDROID_JET_PORT`, `RNFB_IOS_METRO_PORT`) **before** Metro/native build and `:test-cover`. Unset vars keep legacy serial behaviour.

<a id="parallel-e2e-topology"></a>
<a id="slot-lifecycle"></a>

**Parallel e2e topology (worktrees):** same-platform parallel needs **one git worktree per concurrent instance** of that platform. A single worktree may run **at most** `1× android ∥ 1× ios ∥ 1× macos` (distinct Metro/Jet/emulator blocks + distinct AVD/sim + distinct macOS `PRODUCT_NAME`). Example: `3× android + 3× ios + 3× macos` ⇒ three worktrees (each runs android+ios+macos for its slot). Do **not** launch two androids, two ioses, or two macOS apps from one worktree — native build products, Detox configs, coverage paths, and (for macOS) a single `macos/build` derived-data tree are not multi-instance-safe inside one tree. Architecture / why: [e2e parallel design](e2e-parallel-design.md).

**Slot lifecycle (arbitrary slot `N`, platform `android|ios|macos`)** — keep the exported env in the **same shell** for every step.

**First use of a slot (including `N=0`):** create devices once with `yarn tests:e2e:setup-android-avds` / `yarn tests:e2e:setup-ios-sims` so `TestingAVD-N` and `RNFB E2E iOS slot-N` exist before start/build.

```bash
# 1) Load slot env (full RNFB_{ANDROID,IOS,MACOS}_* carry-in + device identities)
eval "$(bash scripts/e2e/export-slot-env.sh <platform> N)"
# yarn tests:e2e:export-slot-env <platform> N
# Emits unset for parent leftovers (ANDROID_SERIAL, AVD_NAME, …) that would poison check/release.

# 2) Clear this slot (see release scope / --devices below)
bash scripts/e2e/check-e2e-resources.sh          # expect CLEAR (or release then re-check)
# Default release = ports+apps for all three platform blocks; does NOT stop AVD/sims
bash scripts/e2e/release-e2e-resources.sh
# For a CLEAR iOS check afterward, also shut down devices:
# bash scripts/e2e/release-e2e-resources.sh --devices
# Unscoped (no slot env): release also wipes io.invertase.testing.s0..sN leftovers.

# 3) Start services for this platform×slot (packager before build)
bash scripts/e2e/start-emulator-slotted.sh <platform>   # or … <platform> N to self-apply
bash scripts/e2e/run-slotted-packager.sh <platform> N   # background OK; or yarn tests:packager:jet-reset-cache with env loaded

# 4) Build for the slot (macOS uses RNFB_MACOS_PRODUCT_NAME → PRODUCT_NAME_SUFFIX)
# After worktree reset/sync for iOS, if Pods/Manifest.lock may have drifted:
# yarn tests:ios:pod:install
yarn tests:<platform>:build

# 5) Run e2e
bash scripts/e2e/run-slotted-test-cover.sh <platform> N
# yarn tests:e2e:slotted-test-cover <platform> N

# 6) Free the same slot (env still loaded)
# End-of-slot / final free so check --platform=ios is CLEAR: include --devices
bash scripts/e2e/release-e2e-resources.sh --devices
```

Example for macOS slot 1:

```bash
eval "$(bash scripts/e2e/export-slot-env.sh macos 1)"
bash scripts/e2e/release-e2e-resources.sh --devices
bash scripts/e2e/start-emulator-slotted.sh macos
bash scripts/e2e/run-slotted-packager.sh macos 1   # background OK
yarn tests:macos:build
bash scripts/e2e/run-slotted-test-cover.sh macos 1
bash scripts/e2e/release-e2e-resources.sh --devices
```

**Release scope after full carry-in:** `export-slot-env` always loads **all three** `RNFB_{ANDROID,IOS,MACOS}_*` port blocks for slot `N`. Default `release-e2e-resources.sh` (no `--platform`) clears **android + ios + macos** Metro/Jet/emulator **ports and apps** for that slot — it does **not** stop AVDs or shut down iOS sims unless **`--devices`** is passed. After slotted iOS, `check-e2e-resources.sh --platform=ios` treats a still-booted slot sim as **BUSY**, so end-of-slot / final free must use `release-e2e-resources.sh --devices` (env still loaded). Mid-wave early free of one finished platform may omit `--devices` (leave the AVD/sim up for a quick re-run) but must use **`--platform=<done>`** so the other platforms’ port blocks stay up:

```bash
# Wave still running ios+macos; android finished early (ports only; AVD may stay up):
eval "$(bash scripts/e2e/export-slot-env.sh android N)"   # same slot env already loaded is fine
bash scripts/e2e/release-e2e-resources.sh --platform=android
# Final free for that platform (or whole slot) when check must be CLEAR for iOS:
# bash scripts/e2e/release-e2e-resources.sh --platform=ios --devices
# bash scripts/e2e/release-e2e-resources.sh --devices
```

**`--platform=` never selects a slot.** It only narrows which platform’s devices/ports are probed among whatever env is already loaded. For slotted clear/check, always `export-slot-env` (or `run-slotted-*`) first so `RNFB_E2E_SLOT` + `RNFB_*_JET_PORT` are set; otherwise check/release fall back to serial defaults (`TestingAVD` / `:8090` / …). The scripts warn on stderr when `--platform` is set without slotted carry-in.

**Slotted device identities (including slot 0):** slotted runs use `TestingAVD-N`, `RNFB E2E iOS slot-N`, Detox `*.slotN`, and `io.invertase.testing.sN` — **including `N=0`**. Serial unslotted defaults remain `TestingAVD` / `iPhone 17` / `io.invertase.testing`. First use of any slot (including 0): `yarn tests:e2e:setup-android-avds` / `yarn tests:e2e:setup-ios-sims` (slots 0–4).

**Parallel / multi-platform carry-in (proven model):** when android + ios (+ macos) share a worktree, every Metro/Jest/Detox process for a slot must receive **the full set** of `RNFB_{ANDROID,IOS,MACOS}_*` port variables for that slot — not only the active platform’s block. Runtime selection uses platform self-detection (`Platform.*` in [`packages/app/e2e/helpers.js`](../../packages/app/e2e/helpers.js); Detox `device.getPlatform()` / configuration name on the host in [`tests/e2e/firebase.test.js`](../../tests/e2e/firebase.test.js)). Do **not** use `RNFB_E2E_PLATFORM` to choose ports: `tests/.babelrc` inlines static `process.env.NAME` via `transform-inline-environment-variables`, and concurrent transforms in one worktree must see every labeled port present so each `process.env.RNFB_ANDROID_*` / `RNFB_IOS_*` / `RNFB_MACOS_*` literal bakes correctly. Computed keys (`process.env[\`RNFB_${x}_…\`]`) are **not** inlined — in-app code must use static member expressions (or helpers that do). Process-local listen/bind vars (`RCT_METRO_PORT`, `JET_REMOTE_PORT`, Detox config) still identify which socket/config **this** process owns. Host Jet config ([`tests/.jetrc.js`](../../tests/.jetrc.js)) should prefer those process-local binds (and per-target `before()` hooks with an explicit platform key) — not `RNFB_E2E_PLATFORM`.

In-app / e2e specs must call `getE2eEmulatorPort('firestore'|…)` (and siblings) — never hardcode `:8080` / `:5001` / other serial emulator ports.

**Slotted Firebase emulator suites (full isolation):** each platform×slot suite needs its **own** Firebase Tools process with **non-overlapping** ports for every listener the suite actually binds. [`scripts/e2e/start-emulator-slotted.sh`](../../scripts/e2e/start-emulator-slotted.sh) assigns auth/database/firestore/functions/storage/hub/logging **and** Firestore `websocketPort`, Eventarc, and Cloud Tasks (derived as `firestore+8/+9/+12` inside the platform block). Defaults `9150` / `9299` / `9499` collide across suites: Firebase Tools still starts Eventarc+Tasks as Functions dependencies even when `--only` omits them; `EADDRINUSE` on those aux ports aborts the suite and leaves Functions dead while Firestore may still listen — e2e then hangs on callables. Parallel readiness must require the **Functions** port up (not only hub). Serialize `scripts/functions` `yarn`/`yarn build` across concurrent suite starts (shared source dir).

**macOS concurrency:** default process name `io.invertase.testing` is host-global (`pgrep`/`killall`). For per-worktree / multi-slot macOS, set **`RNFB_MACOS_PRODUCT_NAME`** (and optionally **`RNFB_MACOS_BUNDLE_IDENTIFIER`**) before `:build` and `:test-cover` — `export-slot-env.sh` / `run-slotted-*` do this as `io.invertase.testing.s<slot>`. `yarn tests:macos:build` derives `RNFB_MACOS_PRODUCT_NAME_SUFFIX` (e.g. `.s1`) for the pbxproj `PRODUCT_NAME = "io.invertase.testing$(RNFB_MACOS_PRODUCT_NAME_SUFFIX)"` — do **not** pass global `PRODUCT_NAME=` on the `xcodebuild` CLI (that renames Pods and breaks linking). [`.jetrc.js`](../../tests/.jetrc.js) spawn/kill/Metro `app=` follow the same env. Unset → serial defaults. No Firebase Console / GoogleService change is required (JS/Other path). See [macOS process identity](#macos-process-identity-concurrency).

| Variable | Purpose |
|----------|---------|
| `RCT_METRO_PORT`, `RNFB_METRO_PORT` | Metro bundler **listen** port for this process (global fallback; not the in-app selector when prefixed vars are set) |
| `RNFB_{ANDROID,IOS,MACOS}_METRO_PORT` | Per-platform Metro port (in-app / host selection via self-detection) |
| `JET_REMOTE_PORT`, `JET_METRO_PORT` | Process-local Jet / Metro hints (global fallback) |
| `RNFB_{ANDROID,IOS,MACOS}_JET_PORT` | Per-platform Jet WebSocket port |
| `RNFB_{ANDROID,IOS,MACOS}_JET_CONTROL_PORT` | Per-platform Jet HTTP control (preferred); `RNFB_JET_CONTROL_PORT` remains a process-local fallback |
| `RNFB_JET_CONTROL_PORT` | Process-local Jet HTTP control plane fallback (default `JET_REMOTE_PORT + 1`) |
| `RNFB_{ANDROID,IOS,MACOS}_EMULATOR_{FIRESTORE,AUTH,DATABASE,FUNCTIONS,STORAGE,HUB,LOGGING}_PORT` | Per-platform Firebase emulator suite (in-app + host). Slotted launcher also derives Firestore `websocketPort` / Eventarc / Tasks from the firestore port — not separate env vars today |
| `RNFB_DETOX_ANDROID_CONFIG`, `RNFB_DETOX_IOS_CONFIG` | Detox configuration name (e.g. `android.emu.debug.slot0`, `ios.sim.debug.slot1`) |
| `RNFB_E2E_SLOT` | Slot index for orchestration / AVD / sim naming |
| `RNFB_E2E_PLATFORM` | Optional orchestration label only — **not** used for port selection (prefer unset in slotted multi-platform launches) |
| `RNFB_ANDROID_AVD`, `RNFB_IOS_SIMULATOR`, `RNFB_ANDROID_EMULATOR_BOOT_ARGS` | Device selection overrides. Slotted helpers set `TestingAVD-{n}` / `RNFB E2E iOS slot-{n}` (including `n=0`); serial defaults stay `TestingAVD` / `iPhone 17` |
| `RNFB_MACOS_PRODUCT_NAME` | macOS `PRODUCT_NAME` / process name (default `io.invertase.testing`). Required distinct per concurrent macOS slot. Slotted helpers set `io.invertase.testing.s<slot>`; override via `RNFB_MACOS_PRODUCT_NAME_OVERRIDE` |
| `RNFB_MACOS_BUNDLE_IDENTIFIER` | macOS `CFBundleIdentifier` (default derived from product name). Metro `app=` follows this. Slotted override: `RNFB_MACOS_BUNDLE_IDENTIFIER_OVERRIDE` |
| `ORG_GRADLE_PROJECT_reactNativeDevServerPort` | Android Gradle Metro port baked into the APK's `react_native_dev_server_port` resource at build time. **Set automatically** by `yarn tests:android:build` (`RNFB_ANDROID_METRO_PORT` → `RCT_METRO_PORT` → `RNFB_METRO_PORT` → `JET_METRO_PORT` → `8081`) — only export it yourself when building Android outside that script (e.g. `detox build` invoked directly). Detox's `reversePorts` (`tests/.detoxrc.js`) already forwards the same slotted Metro port; this var makes the APK actually *ask* for that port. |
| `SIMCTL_CHILD_RCT_METRO_PORT` | iOS simulator child Metro port |
| `RNFB_E2E_DEBUG` | Verbose `[rnfb-e2e]` port resolution logging in app helpers |
| `RNFB_MELLIFERA` | Set to `1` to opt in to reading `tests/mellifera.env.json` in `check-e2e-resources.sh` / `release-e2e-resources.sh` (`--mellifera` CLI flag also works). **Unset by default** — a stale/leftover JSON from a previous mellifera session must not silently switch a plain serial check into multi-platform mode; the scripts warn on stderr when the file exists but this isn't set. |

See [host-clear probes](#host-clear-probes) for the canonical `check-e2e-resources.sh` / `release-e2e-resources.sh` commands (same scripts; slotted env applies when exported or via mellifera JSON).

<a id="global-device-scoping"></a>
<a id="mellifera-json-scoping"></a>

**Global device scoping** — with no `--platform`, no `RNFB_E2E_PLATFORM`, and no per-platform port env set, both scripts fall back to an ambiguous serial `global` mode. `global` probes android app state (specific package on the default serial) and the macOS app process (specific process name) unconditionally — those are precise, false-positive-safe checks — but it does **not** escalate "any booted iOS simulator" to BUSY in that ambiguous mode, since an unrelated simulator left open for other work would otherwise fail every host-clear check. Pass `--platform=ios` (or set `RNFB_E2E_PLATFORM=ios`) when iOS is actually the platform about to run, to get the stricter "zero booted simulators" behaviour documented under [host clear](#1-host-clear). Reminder: `--platform=` alone does **not** load a slot — see [slot lifecycle](#slot-lifecycle).

With a mellifera reservation (`RNFB_MELLIFERA=1` or `--mellifera`), `mellifera-apply-reservation.js` writes `tests/mellifera.env.json` + platform env files; check/release then read that file (or exported `RNFB_*` vars) so slotted ports clear correctly. `mellifera-teardown.sh` / `mellifera-host-clean.sh` / `mellifera-release-resources.sh` call these generics, then handle mellifera lease APIs.

Helper scripts (not canonical `:test-cover` entrypoints): see [slot lifecycle](#slot-lifecycle); also `yarn tests:e2e:setup-android-avds`, `yarn tests:e2e:setup-ios-sims`.

<a id="macos-process-identity-concurrency"></a>

#### macOS process identity (concurrency)

| Surface | Default | Concurrent macOS |
|---------|---------|------------------|
| **Process / `PRODUCT_NAME`** | `io.invertase.testing` | Set `RNFB_MACOS_PRODUCT_NAME` (e.g. `io.invertase.testing.s1`) — required for isolation |
| App path | `…/${PRODUCT_NAME}.app/Contents/MacOS/${PRODUCT_NAME}` | Follows product name |
| `CFBundleIdentifier` | `org.reactjs.native.io-invertase-testing` | `RNFB_MACOS_BUNDLE_IDENTIFIER` or derived `org.reactjs.native.${PRODUCT_NAME with dots→hyphens}` |
| Metro `app=` query | matches bundle ID | [`.jetrc.js`](../../tests/.jetrc.js) reads the same env |
| Firebase / GoogleService | **None on macOS target** | No cloud re-registration for JS/Other e2e |

`yarn tests:macos:build` exports `RNFB_MACOS_PRODUCT_NAME_SUFFIX` into the xcodebuild environment (pbxproj expansion only). Check/release use `RNFB_MACOS_PRODUCT_NAME` for `pgrep`/`killall`; unscoped host wipe also clears `.s0`…`.sN`. Same-platform parallel still needs **one worktree per macOS instance** ([parallel topology](#parallel-e2e-topology)). Mild residual: shared `io.invertase.firebase` preferences suite across apps.

### Android emulator gray screen / Quick Boot (blocking)

Detox's default emulator launch **restores the AVD Quick Boot snapshot** unless told otherwise. On `TestingAVD` that can leave the device **`offline` on a gray screen** — `adb devices` shows `emulator-XXXX offline` and Detox hangs on `wait-for-device`.

**Root cause:** warm boot paths — Quick Boot snapshot restore on Detox launch, and (pre-fix) `adb reboot` on Jet retry — skip a full cold boot.

**Fix (committed):** [`tests/.detoxrc.js`](../../tests/.detoxrc.js) sets `bootArgs: '-no-snapshot-load -no-snapshot-save'` on the `TestingAVD` device. Jet retry in [`tests/e2e/firebase.test.js`](../../tests/e2e/firebase.test.js) cold-restarts the same emulator (kill + relaunch with the same args) instead of `adb reboot`.

**Detect:**

```bash
adb devices -l   # emulator-XXXX offline
pgrep -fl 'qemu-system.*TestingAVD'
rg 'SPAWN_CMD.*@TestingAVD' /tmp/rnfb-e2e-android.log   # no -no-snapshot-load → stale runbook / config
```

**Recovery before `:test-cover`:**

```bash
adb -s emulator-5554 emu kill 2>/dev/null || true
pkill -f 'qemu-system.*TestingAVD' 2>/dev/null || true
adb kill-server && adb start-server && adb devices   # must be empty
# If gray screen persists after cold-boot config, wipe Quick Boot snapshots:
# rm -rf ~/.android/avd/TestingAVD.avd/snapshots
```

Then rerun [pre-flight](#pre-flight-is-the-host-clear-to-start) and `yarn tests:android:test-cover`. Cold boot adds ~30–60s to the first Android launch vs Quick Boot — expected.

Detox injects a prebuilt **`Detox.framework`** and XCUITest runner from a versioned cache under **`~/Library/Detox/ios/`** (hashed by Xcode version). iOS `:test-cover` / `:build` **fail before any test runs** if that cache is missing or stale (common after Xcode upgrade, first checkout, or a failed Detox postinstall).

**Detect (from a failed iOS run log):**

```bash
rg 'Detox\.framework could not be found' /tmp/rnfb-e2e-ios.log
```

Typical error (Detox prints the fix inline):

```text
DetoxRuntimeError: .../Library/Detox/ios/framework/<hash>/Detox.framework could not be found,
this means either you changed a version of Xcode or Detox postinstall script was unsuccessful.
To attempt a fix try running 'detox clean-framework-cache && detox build-framework-cache'
```

**Detect (proactive, before `:test-cover`):**

```bash
test -d ~/Library/Detox/ios/framework/*/Detox.framework && echo "Detox framework cache: OK" || echo "Detox framework cache: MISSING"
```

**Fix (canonical — repo root):**

```bash
yarn tests:ios:detox-framework-cache:rebuild
```

This runs Detox's `rebuild-framework-cache` (clean + build of both the injected Detox library and the XCUITest runner) from the `tests/` workspace. Expect ~10–30s on a warm machine; first build after Xcode change may take longer.

**Verify cache present after rebuild:**

```bash
ls ~/Library/Detox/ios/framework/*/Detox.framework
ls ~/Library/Detox/ios/xcuitest-runner/*/
```

Then resume the normal iOS loop: [pre-flight](#pre-flight-is-the-host-clear-to-start) → `yarn tests:ios:build` (if native changed) → `yarn tests:ios:test-cover`.

CI restores the same tree from `~/Library/Detox/ios` keyed by Xcode version ([iOS workflow § Detox Framework Cache Restore](../ci-workflows/ios.md)). Local developers must rebuild when the cache is missing — it is not committed to git.

<a id="turbomodule-stale-toolchain-blocking"></a>

### TurboModule migration — stale JS/native toolchain (blocking)

During TurboModule work, three different **`undefined`** / load failures are easy to confuse — only the third row below is fixed by the [native registration checklist](../new-architecture/turbomodule-implementation-workflow.md#turbomodule-native-registration-checklist-blocking):

| Symptom                                                             | Likely cause                                                                                                  | Fix (escalate in order)                                                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `this.native.isFoo` is **`undefined`** in JS                        | Spec/native **constants** chain incomplete (`getConstants`, `getTypedExportedConstants`, iOS typed constants) | [Workflow checklist rows 1, 6, 8](../new-architecture/turbomodule-implementation-workflow.md#turbomodule-native-registration-checklist-blocking) |
| Android `Proxy target must be an Object`                            | JNI not linked / **stale autolinking cache**                                                                  | Delete `tests/android/build/generated/autolinking/autolinking.json` + `*.sha`, `:build`                                                          |
| Metro redbox **`Requiring unknown module "undefined"`** at app load | **Stale Metro and/or partial native refresh** after codegen / `lib/**` / podspec changes                      | Steps below; then [full refresh](#turbomodule-full-toolchain-refresh) if needed                                                                  |

**Detect:** app redbox before `Jet client connected`; `curl` of `index.bundle` may still return 200 — that does **not** rule out staleness.

**Routine fix** (try first after codegen, podspec, or `packages/*/lib/**` edits):

1. [Prepare completion gate](#prepare-completion-gate-blocking) — `yarn lerna:prepare` exit 0.
2. Regenerate codegen if specs changed — [workflow § Running codegen](../new-architecture/turbomodule-implementation-workflow.md#running-codegen-canonical) (`cd tests`, `npx @react-native-community/cli codegen …`).
3. **`yarn tests:<platform>:build`** (includes `pod install` on iOS when needed).
4. **`yarn tests:packager:jet-reset-cache`** (Metro was running during the edits).
5. [Pre-flight](#pre-flight-is-the-host-clear-to-start) → **`yarn tests:<platform>:test-cover`**.

<a id="turbomodule-full-toolchain-refresh"></a>

**Full toolchain refresh** — when the routine fix still shows `Requiring unknown module "undefined"` or you wiped `node_modules` mid-migration:

1. [Pre-flight recovery](#pre-flight-recovery) — stop Metro, Jet, Detox; shutdown booted simulators.
2. Remove **all** `node_modules` (repo root, `tests/`, and under `packages/*` if present).
3. **`yarn`** at repo root (wait for exit 0 — includes `lerna:prepare`).
4. Regenerate **all** touched packages' codegen from `tests/` ([workflow § Running codegen](../new-architecture/turbomodule-implementation-workflow.md#running-codegen-canonical)).
5. **`yarn tests:ios:pod:install`** when iOS native/codegen changed.
6. **`yarn tests:<platform>:build`**.
7. **`yarn tests:packager:jet-reset-cache`** → pre-flight → `:test-cover`.

Do **not** treat this redbox as a missing TurboModule registration until the refresh sequence has been run once on a clean tree.

## Diagnosing hangs

**Local stalls** — see [stalled run detection](#stalled-run-detection) first (Metro `/status`, `Jet client connected` markers).

**Native / device logs** (remove instrumentation before merge):

- **macOS** — `log show --predicate 'process == "io.invertase.testing"' --last 10m --style compact`; filter `com.facebook.react.log:javascript` for bundle errors. **Blank window / Jet never connects:** often `Native module NativeRNFBTurboApp is not registered` — see [TurboModule workflow § gotchas — macOS web registration](../new-architecture/turbomodule-implementation-workflow.md#gotchas). Other bundle errors → [other.md](../ci-workflows/other.md)
- **iOS** — `xcrun simctl spawn booted log stream --level debug --style compact --predicate 'process == "testing"'`; silent hangs: `sample <pid>` on `testing`. Metro redbox **`Requiring unknown module "undefined"`** → [TurboModule stale toolchain](#turbomodule-stale-toolchain-blocking), not registration checklist alone.
- **Android** — `adb logcat` (filter your tags)

**Benign noise:** iOS Detox `EXEC_FAIL "xcrun simctl terminate … com.invertase.testing" … found nothing to terminate` — app wasn't running; ignore.

**Cloud API pressure** — Installations / Remote Config failures with FIS 503 or “Too many server requests” are live-project quota on **any** platform, not emulator issues. See [Firebase testing project — CI triage](firebase-testing-project.md#ci-triage-cloud-api-quota-pressure).

## Before merge (PR handoff)

Pre-merge applies once to the branch commit stream before merge/push intended for merge, not after every commit.

1. Remove all narrowing ([full tier](#e2e-validation-tiers-unit-focused-area-focused-full)): delete `tests/harness.overrides.js` (or `{}`), revert any temporary `require.context` → single `require` edits in `tests/app.js`, remove all `.only`, remove native instrumentation. Committed `tests/globals.js` / `tests/app.js` stay at full harness defaults — do not revert durable product wiring (e.g. `NativeRNFBTurbo*` proxy).
2. [Pre-flight](#pre-flight-is-the-host-clear-to-start) — [host-clear probes](#host-clear-probes) pass before each platform run.
3. Rebuild when needed (`tests:<platform>:build`; `yarn lerna:prepare` for `lib/**`). After TurboModule codegen or native bridge edits, see [TurboModule stale toolchain](#turbomodule-stale-toolchain-blocking).
4. Full unfocused suite with coverage on **iOS, Android, macOS** — one platform at a time, all green.
5. Record [validation evidence package](validation-checklist.md#validation-evidence-package) and [coverage evidence package](coverage-design.md#coverage-evidence-package) when lib/native touched — required before merge or push ([change authoring § validation evidence](change-authoring-workflow.md#validation-evidence-blocking)).

## Notes

- Stale native build after native edits → rebuild first.
- All three platforms required; macOS exercises the JS SDK path.
