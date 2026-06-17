# iOS CI workflows

This document covers the **Testing E2E iOS** workflow (`.github/workflows/tests_e2e_ios.yml`) and scripts it uses under `.github/workflows/scripts/`.

## Simulator reliability

### Problem

On GitHub Actions macOS runners (currently `macos-26` with `XCODE_VERSION: latest-stable`), booting an iOS Simulator for Detox is not instantaneous. A simulator can report `Booted` in `simctl list` while it is still unusable:

1. **First-boot data migration** — `com.apple.datamigrator` can run for several minutes on a fresh simulator (observed ~4+ minutes on iOS 26.5). SpringBoard and app install are not reliable until migration finishes.
2. **Ambiguous device names** — runners often have multiple simulators with the same marketing name (e.g. several `iPhone 17` entries across iOS runtimes). We intentionally use the **device name** from `tests/.detoxrc.js`, not a pinned UDID, so we do not churn workflow YAML when runner images change.
3. **`Booted` ≠ ready for testing** — installing or launching the app during migration can block or fail; Detox may time out while the simulator is still migrating.

### What we do

**Pre-boot step** (`.github/workflows/scripts/boot-simulator.sh`), run via `nick-fields/retry` before Detox:

| Phase | What happens |
|--------|----------------|
| `resolve_device` | Read simulator name from `tests/.detoxrc.js` (e.g. `iPhone 17`) |
| `shutdown_existing` | Kill `Simulator.app` and `simctl shutdown` the target |
| `boot_command` | `xcrun simctl boot <name>` |
| `wait_for_full_boot` | Poll every 20s (up to 11 min) until `simctl bootstatus` reports ready |
| `install_app` | `simctl install` the built `testing.app` **only after** bootstatus succeeds |

During `wait_for_full_boot`, the script logs to the **GitHub Actions step log** with the `[boot-status]` prefix:

- Whether `simctl list` shows the device as `Booted`
- **Data migration** snippets from `xcrun simctl bootstatus <name> -d` (probed with a short timeout so the step keeps printing progress instead of looking hung)
- Elapsed time per poll

We wait for **`simctl bootstatus`** (full boot completion), not merely the `Booted` line in `simctl list`.

**Timeouts** (tuned for first-boot migration on latest iOS):

| Setting | Value | Notes |
|---------|-------|--------|
| Pre-Boot retry step | 12 min × 3 attempts | was 5 min |
| Job `timeout-minutes` | 87 | +7 min vs previous 80 |
| Detox test step | 62 min | +7 min vs previous 55 |

Simulator **caching** of device data is intentionally deferred — caching a bad migration state would require cache invalidation policy.

### Simulator logging and video (troubleshooting)

Artifacts are uploaded on every run (`if: always()`), even when tests fail.

| Artifact | Source | Use when |
|----------|--------|----------|
| `simulator-<buildmode>-<iteration>_log` | `xcrun simctl spawn booted log stream` → `simulator.log` | In-simulator system/app logs during Detox |
| `simulator-<buildmode>-<iteration>_video` | `xcrun simctl io booted recordVideo` → `simulator.mp4` | Visual confirmation of UI state |
| `screenrecording-<buildmode>-<iteration>` | `screencapture` of the Mac desktop | Includes Simulator.app window |
| `screenrecording-setup-<buildmode>-<iteration>.mov` | Guidepup setup recording | Very early environment setup |
| `emulator-scripts-logs-<buildmode>-<iteration>` | `.github/workflows/scripts/*.log` | Script output if redirected |

**When to use which log**

- **Boot / migration / “simulator won’t start”** — read the **Pre-Boot Simulator** step log in GitHub Actions first. Look for `[boot-status]` lines and `bootstatus -d` migration output. That captures first-boot migration even though `simulator.log` starts only after pre-boot succeeds.
- **Detox / app / test failures** — download `simulator-*_log` and use [E2E test app orchestration](#e2e-test-app-orchestration-detox--jet) grep patterns (`[rnfb-lifecycle]`, `waitForActive`, SpringBoard foreground).
- **UI regressions** — `simulator-*_video` or `screenrecording-*`.

**Downloading artifacts**

From the workflow run page: **Artifacts** section at the bottom, or:

```bash
gh run download <run-id> -n simulator-debug-0_log
```

**Analyzing `simulator.log`**

The file is unified logging from the booted simulator (compact style). Useful patterns:

```bash
rg -i "datamigrator|Telemetry: duration|systemShellWillBootstrap" simulator.log
rg -i "com\.invertase\.testing|installcoordination" simulator.log
rg -i "test daemon not ready|xctest" simulator.log
```

A long gap with only `com.apple.datamigrator` activity and no `com.invertase.testing` usually means the simulator was still in first-boot migration or pre-boot had not finished installing the app yet.

### Detox configuration

Device type is defined in `tests/.detoxrc.js` (`devices.simulator.device.type`). The boot script and Detox both use this name. CI does not hard-code a UDID.

### E2E test app orchestration (Detox + Jet)

After pre-boot succeeds, failures often move **inside** the test app process (`com.invertase.testing`, binary `testing`). Simulator boot and app install are fine; Detox `launchApp` stalls while the app stays alive. Three overlapping issues show up in CI logs.

#### 1. Early `ready` race

**Detox step symptom**

```
ws-server connection :50400<->:50415
ws-server The app has dispatched "ready" action too early.
```

**Cause** — iOS `DetoxManager` sends proactive `ready` on `webSocketDidConnect` before the anonymous server handles `login`. Detox 20.x logs and drops that `ready`, leaving `device.launchApp()` stuck in `waitUntilReady`.

**Mitigation** — `.yarn/patches/detox-npm-20.51.0-*.patch` buffers early `ready` and replays it after app `login` (`AnonymousConnectionHandler.js`).

#### 2. Main-thread delay before WebSocket handshake

**Symptom** — Long gap (~30–60s) between `device com.invertase.testing launched` (Detox step log) and the first `Connection 1: ready` / `handshake successful` lines in `simulator.log`. Firebase configure, RN bridge startup, and LLVM coverage instrumentation run on the main thread and can defer Detox’s `URLSessionWebSocketDelegate` callbacks.

**Mitigations**

| Change | Location |
|--------|----------|
| Wait for Jet (port 8090) before `launchApp` | `tests/e2e/firebase.test.js` |
| `detoxEnableSynchronization: 'NO'` at launch | `tests/e2e/firebase.test.js` |
| `detoxURLBlacklistRegex: '.*'` | `tests/e2e/firebase.test.js` (existing) |

#### 3. `waitForActive` / scene never foreground-active

**Symptom** — Detox reaches `isReady` and `waitForActive` but never logs `waitForActiveDone`. App process stays alive for the rest of the step timeout (~30+ min). In `simulator.log`, SpringBoard requests `foreground-interactive` while the app scene stays `UISceneActivationStateUnattached` and UIKit deactivation reasons (e.g. `3104`) never clear.

**Instrumentation** — `tests/ios/testing/AppDelegate.mm` logs `[rnfb-lifecycle]` at launch, on UIApplication/UIScene lifecycle notifications, and at **+30s / +60s** one-shot probes if the app never becomes active. Confirms whether the stall is Detox-side or the app never reaching `UIApplicationStateActive` / `foregroundActive`.

**Mitigations in this repo (summary)**

| Change | Location |
|--------|----------|
| Buffer early `ready`, replay after app `login` | `.yarn/patches/detox-npm-20.51.0-*.patch` |
| Jet wait + Detox launch args | `tests/e2e/firebase.test.js` |
| Lifecycle logging for post-mortem | `tests/ios/testing/AppDelegate.mm` |
| Pre-boot + `bootstatus` before install | `boot-simulator.sh` (orthogonal; fixes boot/migration only) |

#### Diagnosing from `simulator.log`

Download the artifact (`gh run download <run-id> -n simulator-debug-0_log`), unzip if needed, then search `simulator.log`.

**Quick triage** — map Detox step timestamps to simulator log (`testing[<pid>]`):

```bash
# Detox orchestration inside the app process
rg 'testing\[' simulator.log | rg -i 'waitForActive|waitForActiveDone|com\.wix\.Detox|ready action too early'

# App lifecycle confirmation (AppDelegate instrumentation)
rg '\[rnfb-lifecycle\]' simulator.log

# SpringBoard launch intent vs app scene state
rg 'com\.invertase\.testing' simulator.log | rg -i 'foreground-interactive|visibility.*Foreground|running-active'
rg 'testing\[' simulator.log | rg -i 'Deactivation reason|activationState|UISceneActivationState'

# WebSocket timing (main-thread block before handshake)
rg 'testing\[' simulator.log | rg 'Connection 1: ready|handshake successful'

# Heavy startup on main thread (often precedes WS delay)
rg 'testing\[' simulator.log | rg -i 'FIRApp|RNFB|RCTBridge|configure'
```

**Sentinel patterns**

| Pattern | Meaning |
|---------|---------|
| `ready action too early` in Detox step only | Early-ready race (patch should fix; check patch applied in `yarn install`) |
| `waitForActive` without `waitForActiveDone` | Scene/active hang; check `[rnfb-lifecycle]` probes still `unattached` / not `active` |
| `probe+30s` / `probe+60s` with `UIApplication.state=inactive` or scene `unattached` | App never became foreground-active; compare with SpringBoard `foreground-interactive` lines |
| `handshake successful` 30–60s after `simctl launch` | Main-thread startup delay; not a boot failure |
| Only `com.apple.datamigrator` activity, no `testing[` | Pre-boot / migration issue — use Actions `[boot-status]` log, not Detox orchestration |

**Example healthy sequence** (abbreviated): `didFinishLaunching+after` → `UIApplicationDidBecomeActiveNotification` / scene `foregroundActive` → Detox `loginSuccess` → `isReady` → `waitForActiveDone`. A gap between SpringBoard foreground request and `[rnfb-lifecycle]` `active` is the smoking gun for issue 3.

### Operational notes

- **Release vs debug** — matrix runs both; each has separate artifacts (`debug` / `release` in the artifact name).
- **Retry** — Pre-Boot retries up to 3 times with 60s between attempts (clean shutdown + boot each time).
- **Do not boot the simulator only inside Detox** — historical races where the testee never sent “ready” to the Detox proxy; pre-boot remains mandatory.
