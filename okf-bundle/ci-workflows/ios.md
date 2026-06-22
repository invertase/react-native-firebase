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
| `kill_resolved` | Kill `Simulator.app`, terminate app, `simctl shutdown` the resolved UDID |
| `boot_command` | `xcrun simctl boot <name>` |
| `wait_for_full_boot` | Poll every 20s (up to 11 min) until `simctl bootstatus` reports ready |
| `wait_shutdown` | If device is still `Booted` when install is about to run, poll up to 120s for `Shutdown` (avoids LaunchServices races after Jet retries) |
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
| `testing-<buildmode>-<iteration>_log` | `log stream --predicate 'process == "testing"'` → `testing.log` | **Filtered** app-process log — much smaller than `simulator.log`; use for `[rnfb-lifecycle]`, Detox WS, Metro probes |
| `springboard-<buildmode>-<iteration>_log` | `log stream` with SpringBoard + `invertase` predicate → `springboard-invertase.log` | FrontBoard / LaunchServices launch failures (`unknown to FrontBoard`, install races) |
| `detox-step-<buildmode>-<iteration>_log` | Detox/Jet step stdout/stderr (`tee detox-step.log`) | `[jet-ws]`, `[rnfb-e2e]`, `[jet-coverage]`, Jest output — primary orchestration log |
| `flake-summary-<buildmode>-<iteration>` | `.github/workflows/scripts/flake-summary.sh` → `flake-summary.txt` | Pre-digested `rg` hits across detox/simulator/testing/springboard/metro/resource-monitor logs |
| `resource-monitor-<buildmode>-<iteration>_log` | `.github/workflows/scripts/resource-monitor.sh` → `resource-monitor.log` | Periodic `uptime` + `ps` snapshots (10s default) to correlate WS drops with CPU/memory pressure |
| `metro-<buildmode>-<iteration>_log` | Metro stdout/stderr from `yarn tests:packager:jet-ci` → `metro.log` (debug only) | Metro hung, slow bundle, or unresponsive `/status` during app launch |
| `simulator-<buildmode>-<iteration>_video` | `xcrun simctl io booted recordVideo` → `simulator.mp4` | Visual confirmation of UI state |
| `screenrecording-<buildmode>-<iteration>` | `screencapture` of the Mac desktop | Includes Simulator.app window |
| `screenrecording-setup-<buildmode>-<iteration>.mov` | Guidepup setup recording | Very early environment setup |
| `emulator-scripts-logs-<buildmode>-<iteration>` | `.github/workflows/scripts/*.log` | Script output if redirected |

**When to use which log**

- **Boot / migration / “simulator won’t start”** — read the **Pre-Boot Simulator** step log in GitHub Actions first. Look for `[boot-status]` lines and `bootstatus -d` migration output. That captures first-boot migration even though `simulator.log` starts only after pre-boot succeeds.
- **Detox / app / test failures** — start with **`detox-step-*_log`** or **`flake-summary-*`** (fast triage). For native app instrumentation, download **`testing-*_log`** instead of searching all of `simulator.log`. Jet WS drops (1006/1001) appear in the Detox step (`[jet-ws]`, `[rnfb-e2e]`). For debug Metro issues, also download `metro-*_log`.
- **FrontBoard / relaunch after terminate** — `springboard-*_log` plus `[rnfb-e2e] install-state` / `launchApp failure` lines in `detox-step-*_log`.
- **Runner load during flake** — `resource-monitor-*_log` (correlate timestamps with `[jet-ws] disconnect_context` loadavg/mem lines).
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

### Codecov (debug matrix only)

After Detox, the debug leg runs `yarn tests:ios:test:process-coverage` then two flagged Codecov uploads (`e2e-ts-ios`, `ios-native`). **`codecov/project/ios-native`** blocks if the native flag upload is missing. Release legs skip coverage. Details: [coverage design](../testing/coverage-design.md#codecov-uploads-ci).

### E2E test app orchestration (Detox + Jet)

After pre-boot succeeds, failures often move **inside** the test app process (`com.invertase.testing`, binary `testing`). Simulator boot and app install are fine; Detox `launchApp` stalls while the app stays alive. Several overlapping issues show up in CI logs.

#### 1. Early `ready` race

**Detox step symptom**

```
ws-server connection :50400<->:50415
ws-server The app has dispatched "ready" action too early.
```

**Cause** — iOS `DetoxManager` sends proactive `ready` on `webSocketDidConnect` before the anonymous server handles `login`. Detox 20.x logs and drops that `ready`, leaving `device.launchApp()` stuck in `waitUntilReady`.

**Mitigation** — `.yarn/patches/detox-npm-20.51.0-*.patch` buffers early `ready` and replays it after app `login` (`AnonymousConnectionHandler.js`). Full patch list: [detox-patches.md](detox-patches.md).

#### 2. Device registry lock (`ECOMPROMISED`)

**Detox step symptom** — failure before any test output, often within the first minute of `Detox Test Debug` / `Detox Test Release`:

```
Error: Unable to update lock within the stale threshold
  code: 'ECOMPROMISED'
```

**Cause** — Detox locks `~/Library/Detox/device.registry.json` (device busy/available ledger) via `proper-lockfile`. Default stale window is 10s; under CI load (simulator logging, Firestore emulator, `yeetd`) lock heartbeats can miss it ([Detox #4210](https://github.com/wix/Detox/issues/4210)).

**Mitigation** — same Detox patch doubles stale to 20s in `ExclusiveLockfile.js`. We do **not** use `detox reset-lock-file` in CI (wipes the ledger). See [detox-patches.md](detox-patches.md#device-registry-lock-ecompromised).

**Sentinel** — `proper-lockfile` + `ECOMPROMISED` in the Detox step log; build and Pre-Boot steps green.

#### 3. Main-thread delay before WebSocket handshake

**Symptom** — Long gap (~30–60s) between `device com.invertase.testing launched` (Detox step log) and the first `Connection 1: ready` / `handshake successful` lines in `simulator.log`. Firebase configure, RN bridge startup, and LLVM coverage instrumentation run on the main thread and can defer Detox’s `URLSessionWebSocketDelegate` callbacks.

**Mitigations**

| Change | Location |
|--------|----------|
| Wait for Jet (port 8090) before `launchApp` | `tests/e2e/firebase.test.js` |
| Wait for Metro (`/status`) before `launchApp` | `tests/e2e/firebase.test.js` (debug Detox configs only; release skips Metro wait) |
| Bounded `launchApp` timeout (debug default 180s; release default 120s via `RNFB_LAUNCH_APP_RELEASE_TIMEOUT_MS`) | `tests/e2e/firebase.test.js` |
| `detoxEnableSynchronization: 'NO'` at launch | `tests/e2e/firebase.test.js` |
| `detoxURLBlacklistRegex: '.*'` | `tests/e2e/firebase.test.js` (existing) |

#### 4. `waitForActive` / scene never foreground-active

**Symptom** — Detox reaches `isReady` and `waitForActive` but never logs `waitForActiveDone`. App process stays alive for the rest of the step timeout (~30+ min). In `simulator.log`, SpringBoard requests `foreground-interactive` while the app scene stays `UISceneActivationStateUnattached` and UIKit deactivation reasons (e.g. `3104`) never clear.

**Instrumentation** — `tests/ios/testing/AppDelegate.mm` logs `[rnfb-lifecycle]` at launch, on UIApplication/UIScene lifecycle notifications, and at **+30s / +60s** one-shot probes if the app never becomes active. Confirms whether the stall is Detox-side or the app never reaching `UIApplicationStateActive` / `foregroundActive`.

**Distinguish from issue 5** — If `[rnfb-lifecycle]` probes show `UIApplication.state=active` / `foregroundActive` but Detox still hangs on `waitForActive`, the cause is likely Metro/JS bundle load failure (issue 5), not scene activation.

#### 5. Metro unresponsive at launch → `waitForActive` hang (active app)

**Symptom** — Same Detox-side pattern as issue 4 (`waitForActive` without `waitForActiveDone`, multi-minute hang in `device.launchApp()`), but **`[rnfb-lifecycle]` shows the app is already active**. Often seen on debug CI only; release on the same run passes (embedded bundle, no live Metro).

**Cause chain** (observed on run [27727525262](https://github.com/invertase/react-native-firebase/actions/runs/27727525262)):

1. Debug app requests `http://localhost:8081/status` from inside the simulator; TCP connects but Metro returns no bytes within ~10s (`NSURLErrorDomain Code=-1001`).
2. RN logs `No script URL provided. Make sure the packager is running...` and shows RedBox; DetoxSync adds an RN-load idling resource that never clears.
3. Detox WS login/`isReady` succeed (early-ready patch works), then `waitForActive` is received but **`waitForActiveDone` never arrives** even though UIKit is active.

Metro can look healthy on the **host** during pre-fetch minutes earlier while being unresponsive when the app actually launches.

**Instrumentation** — `AppDelegate.mm` observes `RCTJavaScriptDidFailToLoadNotification` and logs:

- `event=RCTJavaScriptDidFailToLoad` with NSError domain/code/description
- `event=packager-probe` — `[RCTBundleURLProvider isPackagerRunning:]`, `packagerServerHostPort`, resolved `bundleURL`
- `event=packager-status-fetch` — direct `http://localhost:8081/status` fetch from inside the app with explicit timeout and HTTP status/body or error

**Mitigations in this repo**

| Change | Location |
|--------|----------|
| Wait for Metro `/status` before `launchApp` | `tests/e2e/firebase.test.js` (debug Detox configs only) |
| In-process `launchApp` retry on launch failure (max 2 attempts; logs `launchApp failure reason=`) | `tests/e2e/firebase.test.js` (`RNFB_LAUNCH_APP_MAX_ATTEMPTS`) |
| Keep install on inner retry (`delete: false` on attempt 2+) | `tests/e2e/firebase.test.js` |
| Slow `terminateApp` (≥ `RNFB_SLOW_TERMINATE_MS`, default 10s) → reboot via `boot-simulator.sh` | `tests/e2e/firebase.test.js` |
| Full Jet e2e retry when inner launch retries exhausted or WS/coverage teardown retryable | `tests/e2e/firebase.test.js` (`retryableAtJetLevel`, `isRetryableE2eFailure`) |
| `simctl get_app_container` / `listapps` before and after each launch attempt | `tests/e2e/firebase.test.js` (`[rnfb-e2e] install-state`) |
| Bounded `launchApp` timeout (debug `RNFB_LAUNCH_APP_TIMEOUT_MS` 180s; release `RNFB_LAUNCH_APP_RELEASE_TIMEOUT_MS` 120s) | `tests/e2e/firebase.test.js` |
| Metro log artifact (`metro.log`) | `.github/workflows/tests_e2e_ios.yml` |
| JS load failure + packager probe logging | `tests/ios/testing/AppDelegate.mm` |
| Bundle URL pinned to `127.0.0.1` (bypasses RN `localhost` fallback) | `tests/ios/testing/AppDelegate.mm` |

**Known intermittent pattern (community)** — RN iOS debug builds commonly hit `No script URL provided` when Metro is down, slow, or reachable from the host but not from the simulator process. Reported causes include: Metro event loop blocked under load (TCP connect succeeds, HTTP hangs — matches our `-1001` on `/status`), macOS network proxy intercepting `localhost:8081`, port 8081 contention, and `RCTBundleURLProvider` returning a nil bundle URL despite `isPackagerRunning=YES` ([react-native#49173](https://github.com/facebook/react-native/issues/49173)). On **iOS 26+ simulators**, hostname resolution for `localhost` vs `127.0.0.1` can be unreliable; hardcoding `127.0.0.1` in bundle URL resolution has been reported to fix intermittent Metro disconnects ([react-native#56447](https://github.com/facebook/react-native/issues/56447)). Our test app now pins the debug bundle URL to `127.0.0.1:8081` and the e2e harness retries `launchApp` on retryable launch failures (Metro/bundle timeout, FrontBoard errors) before failing the Jet attempt. Release uses an embedded bundle, shorter launch timeout, and no Metro wait. These are typically **environment/timing** flakes rather than app logic bugs.

#### Diagnosing from `simulator.log`

Download the artifact (`gh run download <run-id> -n simulator-debug-0_log`), unzip if needed, then search `simulator.log`.

**Quick triage** — map Detox step timestamps to simulator log (`testing[<pid>]`):

```bash
# Detox orchestration inside the app process
rg 'testing\[' simulator.log | rg -i 'waitForActive|waitForActiveDone|com\.wix\.Detox|ready action too early'

# App lifecycle confirmation (AppDelegate instrumentation)
rg '\[rnfb-lifecycle\]' simulator.log

# Metro / JS bundle load failure (issue 5)
rg '\[rnfb-lifecycle\].*RCTJavaScriptDidFailToLoad|packager-probe|packager-status-fetch' simulator.log
rg 'No script URL provided|com\.facebook\.react\.log' simulator.log
rg 'testing\[' simulator.log | rg '8081/status|index\.bundle'

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
| `ECOMPROMISED` / `Unable to update lock within the stale threshold` | Device registry lock heartbeat missed — see [detox-patches.md](detox-patches.md) |
| `codecov/project/ios-native` fail | Native lcov not uploaded — check process-coverage step and Codecov Uploads tab for `ios-native` flag |
| `waitForActive` without `waitForActiveDone` | Scene/active hang (issue 4) **or** Metro/JS load failure (issue 5) — check `[rnfb-lifecycle]` probes |
| `probe+30s` / `probe+60s` with `UIApplication.state=inactive` or scene `unattached` | App never became foreground-active (issue 4); compare with SpringBoard `foreground-interactive` lines |
| `probe+30s` / `probe+60s` with `active` / `foregroundActive` but no `waitForActiveDone` | Metro/JS bundle failure despite active UIKit (issue 5); check `RCTJavaScriptDidFailToLoad` and `packager-status-fetch` |
| `packager-status-fetch ... error domain=NSURLErrorDomain code=-1001` | Metro TCP reachable but HTTP timed out from simulator |
| `No script URL provided` in `com.facebook.react.log` | RN never got bundle URL; only `/status` attempts, no `index.bundle` |
| `FBSOpenApplicationServiceErrorDomain` / `unknown to FrontBoard` | LaunchServices race after terminate — see [issue 7](#7-frontboard--launchservices-race-after-terminaterelaunch) |
| `Failed to send 'coverage-ready' message` | Coverage handshake flake — see [issue 8](#8-coverage-teardown-handshake-failure-tests-pass-nyc-00) |
| `[rnfb-e2e] retry-eligibility ... retryable=false` | Check `checks=` JSON for which sub-condition blocked Jet attempt 2 |
| `handshake successful` 30–60s after `simctl launch` | Main-thread startup delay; not a boot failure |
| Only `com.apple.datamigrator` activity, no `testing[` | Pre-boot / migration issue — use Actions `[boot-status]` log, not Detox orchestration |

**Example healthy sequence** (abbreviated): `didFinishLaunching+after` → `UIApplicationDidBecomeActiveNotification` / scene `foregroundActive` → Detox `loginSuccess` → `isReady` → `waitForActiveDone`. A gap between SpringBoard foreground request and `[rnfb-lifecycle]` `active` is the smoking gun for issue 4. For issue 5, lifecycle probes show `active` but you will see `RCTJavaScriptDidFailToLoad` and/or `No script URL provided` before Detox stalls on `waitForActive`.

For Metro-side post-mortem, also download `metro-*_log` and check whether Metro logged bundle requests or stalled around the launch timestamp:

```bash
rg -i 'BUNDLE|index\.bundle|8081|error|ECONN|transform' metro.log
```

**Mitigations in this repo (summary)**

| Change | Location |
|--------|----------|
| Buffer early `ready`, replay after app `login` | `.yarn/patches/detox-npm-20.51.0-*.patch` → `AnonymousConnectionHandler.js` |
| 2× device-registry lock stale (20s) | `.yarn/patches/detox-npm-20.51.0-*.patch` → `ExclusiveLockfile.js` |
| Jet + Metro wait, bounded `launchApp` with retry, Detox launch args, install-state + retry-eligibility logging | `tests/e2e/firebase.test.js` |
| Lifecycle + JS load / packager probe logging; bundle URL `127.0.0.1` | `tests/ios/testing/AppDelegate.mm` |
| Pre-boot + `bootstatus` + shutdown wait before install | `boot-simulator.sh` |
| Filtered logs, resource monitor, flake summary, Detox `tee` | `.github/workflows/tests_e2e_ios.yml`, `resource-monitor.sh`, `flake-summary.sh` |
| Metro stdout/stderr artifact | `.github/workflows/tests_e2e_ios.yml` |

#### 6. Jet WebSocket disconnect (1006 / 1001)

**Symptom** (Detox step, debug and release):

```
[🟨] Jet client disconnected - for no particular reason (code = 1006).
[jet-ws] transient_disconnect code=1006 grace_ms=30000 waiting_for_reconnect
```

The app process (`testing[<pid>]`) often stays alive in `testing.log` / `simulator.log` — the break is the **simulator → host** mocha-remote WebSocket on port **8090**, not a native crash.

**Cause** — Transient abnormal WebSocket closure (1006 = no close frame; 1001 = going away). Common in long debug+coverage runs (live Metro + Istanbul `__coverage__` growth + port 8090 forwarding). mocha-remote-client auto-reconnects in ~1s; Jet and mocha-remote-server now preserve the runner during a grace window instead of exiting immediately.

**Mitigations in this repo**

| Change | Location |
|--------|----------|
| 30s reconnect grace for 1006/1001 before fatal exit | `.yarn/patches/jet-npm-0.9.0-dev.13-*.patch` → `cli.js` |
| `reconnectGraceMs: 30000` | `tests/.jetrc.js` |
| mocha-remote-server preserves runner + sends `pull-coverage` on reconnect | `.yarn/patches/mocha-remote-server-npm-1.13.2-*.patch` |
| Client WS keepalive (`ping` when supported) + `readyState` logging on send failure | `.yarn/patches/mocha-remote-client-npm-1.13.2-*.patch` |
| `disconnect_context` logs `loadavg` + `process.memoryUsage()` on disconnect | Jet patch → `cli.js` |
| One Jet e2e retry when grace expires (`RETRYABLE_DISCONNECT`) or session/coverage retryable | `tests/e2e/firebase.test.js` |
| Structured WS / orchestration logging | `[jet-ws]`, `[rnfb-e2e]`, `[mocha-remote-ws]` prefixes |

**Diagnosing from CI logs** (start with `detox-step-*_log` or `flake-summary-*`):

```bash
# Jet WS lifecycle
rg '\[jet-ws\]|\[rnfb-e2e\]|\[mocha-remote-ws\]|Jet client disconnected|RETRYABLE_DISCONNECT' detox-step.log

# Disconnect resource context
rg '\[jet-ws\] disconnect_context' detox-step.log

# Grace window recovered (no e2e retry needed)
rg '\[jet-ws\] reconnect_recovered|\[mocha-remote-ws\] reconnect_recovered' detox-step.log

# Fatal transient disconnect → e2e retry eligible
rg '\[jet-ws\] (transient_disconnect|fatal_disconnect|RETRYABLE_DISCONNECT)' detox-step.log

# Retry decision tree
rg '\[rnfb-e2e\] retry-eligibility' detox-step.log

# Runner load at disconnect time
rg 'disconnect_context|resource-monitor' detox-step.log resource-monitor.log
```

**Sentinel patterns**

| Pattern | Meaning |
|---------|---------|
| `transient_disconnect code=1006` then `reconnect_recovered` | Flaky WS; grace window saved the run |
| `fatal_disconnect code=1006 grace_expired_ms=30000` + `RETRYABLE_DISCONNECT` | Grace failed; e2e should retry once |
| `[rnfb-e2e] Retrying after transient Jet WS` | Second Jet attempt starting (simulator reboot) |
| `disconnect_context` with high loadavg / RSS | Correlate with `resource-monitor-*_log` snapshot at same UTC timestamp |
| Release passes, debug fails with 1006 | Points at Metro/debug+coverage load, not test logic |

#### 7. FrontBoard / LaunchServices race after terminate+relaunch

**Symptom** — Second `launchApp` attempt fails after a slow or failed first launch:

```
FBSOpenApplicationServiceErrorDomain
Application "com.invertase.testing" is unknown to FrontBoard
```

Often preceded by `[rnfb-e2e] terminateApp ... elapsed=60000ms` (or similar) in `detox-step-*_log`.

**Cause** — Detox `terminateApp` / `simctl` teardown left LaunchServices in a bad state, or `delete: true` on retry removed the install while SpringBoard still tracked the old bundle.

**Mitigations in this repo**

| Change | Location |
|--------|----------|
| `RETRYABLE_LAUNCH_RE` includes `unknown to FrontBoard` / `FBSOpenApplicationServiceErrorDomain` | `tests/e2e/firebase.test.js` |
| Inner retry keeps install (`delete: false` on attempt 2+) | `tests/e2e/firebase.test.js` |
| Slow terminate (≥ `RNFB_SLOW_TERMINATE_MS`) → full `boot-simulator.sh` reboot before relaunch | `tests/e2e/firebase.test.js` |
| Exhausted inner launch retries escalate to **Jet attempt 2** (`retryableAtJetLevel`) | `tests/e2e/firebase.test.js` |
| `simctl get_app_container` + `listapps` logging (`[rnfb-e2e] install-state`) | `tests/e2e/firebase.test.js` |
| Filtered SpringBoard log artifact | `springboard-invertase.log` |
| `wait_shutdown` before `simctl install` on reboot | `boot-simulator.sh` |

**Diagnosing**

```bash
rg 'install-state|launchApp failure|FrontBoard|FBSOpenApplication|terminateApp' detox-step.log
rg -i 'invertase|FrontBoard|unknown' springboard-invertase.log
```

#### 8. Coverage teardown handshake failure (tests pass, NYC 0/0)

**Symptom** — Full Jet suite passes, then `"after all"` / coverage teardown fails:

```
Failed to send 'coverage-ready' message: WebSocket is closed
[jet-coverage] merged 0 file(s)
Coverage summary: Unknown% ( 0/0 )
```

May follow `[jet-ws] reconnect_recovered` mid-run — transport reconnected but the coverage upload socket was already dead.

**Cause** — mocha-remote **transport** reconnect ≠ **coverage handshake** recovery (`coverage-ready` → server `pull-coverage` → `coverage-data` → `coverage-ack`).

**Mitigations in this repo**

| Change | Location |
|--------|----------|
| Server sends `pull-coverage` proactively after reconnect | Jet + mocha-remote-server patches |
| Client `uploadCoverage()` retries up to 3× with backoff; logs `readyState` at send | mocha-remote-client patch |
| `[jet-coverage] server recv coverage-ready` / client send logging | mocha-remote-server + client patches |
| `JET_COVERAGE_TEARDOWN_RE` → retryable Jet session failure | `tests/e2e/firebase.test.js` |
| Jet attempt 2 on reconnect + lost coverage (`JET_COVERAGE_LOST_RE`) | `tests/e2e/firebase.test.js` |

**Diagnosing**

```bash
rg '\[jet-coverage\]|coverage-ready|coverage-ack|pull-coverage|merged 0 file' detox-step.log
rg '\[rnfb-e2e\] retry-eligibility' detox-step.log
```

| Pattern | Meaning |
|---------|---------|
| `reconnect_recovered` then `coverage-ready.*WebSocket is closed` | Handshake flake; should be Jet-retryable |
| `[jet-coverage] client send coverage-ready attempt=2` | Client retry in progress |
| `merged 0 file(s)` after disconnect | NYC got no JS coverage — check handshake lines above |

See also [coverage design — e2e TypeScript coverage](../testing/coverage-design.md#e2e-typescript-coverage-jet--nyc).

### Operational notes

- **Release vs debug** — matrix runs both; each has separate artifacts (`debug` / `release` in the artifact name).
- **Retry** — Pre-Boot retries up to 3 times with 60s between attempts (clean shutdown + boot each time). Jet e2e retries once on retryable WS / launch / coverage teardown failures (simulator reboot via `boot-simulator.sh` on iOS).
- **Do not boot the simulator only inside Detox** — historical races where the testee never sent “ready” to the Detox proxy; pre-boot remains mandatory.
- **CI helper scripts** (repo root relative):

| Script | Env vars | Role |
|--------|----------|------|
| `.github/workflows/scripts/resource-monitor.sh` | `RNFB_RESOURCE_MONITOR_INTERVAL_SEC` (default 10), `RNFB_RESOURCE_MONITOR_LOG` | Background `uptime` + `ps` snapshots during Detox |
| `.github/workflows/scripts/flake-summary.sh` | `RNFB_DETOX_LOG`, `RNFB_FLAKE_SUMMARY_OUT` | Post-run `rg` digest → `flake-summary.txt` |

Detox steps use `tee detox-step.log` and `exit ${PIPESTATUS[0]}` so the artifact preserves full output while the step still fails correctly.

### Local stress iteration (optional)

To deflake without pushing every change, run the same steps as CI on a macOS machine or VM (SSH is fine). Mirror: emulators → build → `boot-simulator.sh` → filtered log streams → `resource-monitor.sh` → `yarn tests:ios:test-cover` (or `:release`) → `flake-summary.sh`. Wrap in a loop over `iterations` and collect `local-e2e-artifacts/iter-N-*` directories. A self-hosted GHA runner on the same VM is optional when you need exact workflow YAML semantics; direct script iteration is faster for day-to-day patch work.

### Pinned Homebrew utilities

CI installs macOS build helpers from **vendored formulae** in `.github/homebrew-rnfb/Formula/` instead of live taps (`wix/brew`, `homebrew-core`). Each formula file is frozen in git with pinned `url`, source `sha256`, and bottle hashes — similar in spirit to SHA-pinned GitHub Actions.

| Formula | Version | Upstream source | Used in |
|---------|---------|-----------------|---------|
| `applesimutils.rb` | 0.9.12 | [wix/homebrew-brew](https://github.com/wix/homebrew-brew) @ `8f636f84541e` | iOS e2e (`tests_e2e_ios.yml`) |
| `xcbeautify.rb` | 3.2.1 | [homebrew-core](https://github.com/Homebrew/homebrew-core) @ `f2e343d17882` | iOS e2e + macOS e2e (`tests_e2e_other.yml`) |

**Workflow install** — both workflows call `.github/workflows/scripts/install-homebrew-rnfb.sh` (from repo root). Homebrew 6+ refuses bare `brew install --formula path/to.rb`; the script copies formulae into a local `invertase/rnfb` tap, trusts it once per job, then installs:

```bash
# iOS e2e (tests_e2e_ios.yml)
bash .github/workflows/scripts/install-homebrew-rnfb.sh applesimutils xcbeautify

# macOS e2e (tests_e2e_other.yml)
bash .github/workflows/scripts/install-homebrew-rnfb.sh xcbeautify
```

**Why** — Third-party taps can change formula definitions on every `brew update`. Vendoring avoids supply-chain drift and Brew 6 untrusted-tap warnings for live third-party taps. We still `brew trust invertase/rnfb` for the ephemeral local tap copy each job creates. The install script **uninstalls any existing `homebrew-core` (or other tap) install** of the same formula name first — GHA macOS images often preinstall `xcbeautify`, and Brew refuses same-name formulae from two taps.

#### When to update a pinned formula

- CI **Install brew utilities** fails after a macOS runner / Xcode image bump (common for `xcbeautify` Swift/`on_sequoia` conditionals).
- You need a newer **applesimutils** or **xcbeautify** feature or bugfix.
- A security advisory affects the pinned upstream release (bump `url` / version and checksums).

#### How to update a pinned formula

1. **Fetch the upstream formula** you want to vendor (usually `master`, or a specific commit if you need a known-good revision):

   ```bash
   # applesimutils (wix tap)
   curl -fsSL "https://raw.githubusercontent.com/wix/homebrew-brew/master/Formula/applesimutils.rb" \
     -o /tmp/applesimutils.rb

   # xcbeautify (homebrew-core)
   curl -fsSL "https://raw.githubusercontent.com/Homebrew/homebrew-core/master/Formula/x/xcbeautify.rb" \
     -o /tmp/xcbeautify.rb
   ```

2. **Record the upstream commit** (for the table above and the file header):

   ```bash
   # applesimutils
   gh api repos/wix/homebrew-brew/commits \
     -f path=Formula/applesimutils.rb -f per_page=1 \
     --jq '.[0].sha[:12]'

   # xcbeautify
   gh api repos/Homebrew/homebrew-core/commits \
     -f path=Formula/x/xcbeautify.rb -f per_page=1 \
     --jq '.[0].sha[:12]'
   ```

3. **Merge into `.github/homebrew-rnfb/Formula/<name>.rb`** — keep the RNFB header at the top (replace version + commit), then paste the upstream `class` body. Remove `head "..."` lines if present (frozen vendored formulae should not track moving branches). Example header:

   ```ruby
   # frozen_string_literal: true
   # RNFB CI vendored formula — do not install from third-party taps in workflows.
   # Upstream: wix/homebrew-brew @ <12-char-sha> — AppleSimulatorUtils <version>
   # Update: see okf-bundle/ci-workflows/ios.md#pinned-homebrew-utilities
   ```

4. **Verify locally on macOS** (from repo root):

   ```bash
   bash .github/workflows/scripts/install-homebrew-rnfb.sh <name>
   <name> --version    # xcbeautify
   applesimutils --help # applesimutils (no --version)
   ```

   If upgrading a formula already in your Cellar, uninstall first: `brew uninstall <name>`.

5. **Update this doc** — bump the version and upstream-commit columns in the table above.

6. **Open a PR** — CI will exercise the same install script as production workflows. Watch the **Install brew utilities** step timing (`applesimutils` often builds from source on `macos-26`).

#### Local dev (optional)

Match CI with the install script, or install a single formula file via the script:

```bash
bash .github/workflows/scripts/install-homebrew-rnfb.sh applesimutils xcbeautify
```

See also `CONTRIBUTING.md` and `tests/README.md`.

**`applesimutils` on modern runners** — upstream bottles target older macOS releases; GHA `macos-26` typically **builds from source** (needs Xcode). Expect a longer “Install brew utilities” step than `xcbeautify`, which usually installs from a matching bottle.
