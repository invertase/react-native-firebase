# iOS CI workflows

**Testing E2E iOS** workflow (`.github/workflows/tests_e2e_ios.yml`) and `.github/workflows/scripts/`.

## Simulator reliability

### Problem

On GHA macOS runners, `simctl list` can show `Booted` before the simulator is test-ready:

1. First-boot `com.apple.datamigrator` can run for minutes; app install/launch is unreliable until done.
2. Device names are ambiguous across runtimes; use `tests/.detoxrc.js` name, not pinned UDID.
3. `Booted` ≠ ready; install/launch during migration can hang/fail.

### What we do

**Pre-boot step** (`.github/workflows/scripts/boot-simulator.sh`), run via `nick-fields/retry` before Detox:

> **Not for local operators.** `boot-simulator.sh` is **CI-only** (this workflow) or invoked **internally** by `tests/e2e/firebase.test.js` on iOS test-runner retry. Local e2e: [running-e2e.md](../testing/running-e2e.md) only — [host-clear probes](../testing/running-e2e.md#host-clear-probes), [agent rule](../testing/running-e2e.md#agent-rule-read-first). Do not run `boot-simulator.sh` as operator prep.

| Phase | What happens |
|--------|----------------|
| `resolve_device` | Read simulator name from `tests/.detoxrc.js` (e.g. `iPhone 17`) |
| `kill_resolved` | Kill `Simulator.app`, terminate app, `simctl shutdown` the resolved UDID |
| `boot_command` | `xcrun simctl boot <name>` |
| `wait_for_full_boot` | Poll every 20s (up to 11 min) until `simctl bootstatus` reports ready |
| `wait_shutdown` | If device is still `Booted` when install is about to run, poll up to 120s for `Shutdown` (avoids LaunchServices races after Jet retries) |
| `install_app` | `simctl install` the built `testing.app` **only after** bootstatus succeeds |

During `wait_for_full_boot`, `[boot-status]` logs:

- Whether `simctl list` shows the device as `Booted`
- **Data migration** snippets from `xcrun simctl bootstatus <name> -d` (probed with a short timeout so the step keeps printing progress instead of looking hung)
- Elapsed time per poll

Wait for **`simctl bootstatus`**, not just `Booted`.

**Timeouts** (tuned for first-boot migration on latest iOS):

| Setting | Value | Notes |
|---------|-------|--------|
| Pre-Boot retry step | 12 min × 3 attempts | was 5 min |
| Job `timeout-minutes` | 87 | +7 min vs previous 80 |
| Detox test step | 62 min | +7 min vs previous 55 |

Simulator device caching deferred; bad migration cache needs invalidation policy.

### Simulator logging and video (troubleshooting)

Artifacts upload on every run (`if: always()`).

| Artifact | Source | Use when |
|----------|--------|----------|
| `sim-app-<buildmode>-<iteration>_log` | One filtered `log stream` → `sim-app.log` (`testing` + SpringBoard/invertase) | `[rnfb-lifecycle]`, Detox WS, Metro probes, FrontBoard launch failures |
| `detox-step-<buildmode>-<iteration>_log` | Detox/Jet step stdout/stderr (`tee detox-step.log`) | `[jet-ws]`, `[rnfb-e2e]`, `[jet-coverage]`, Jest output — primary orchestration log |
| `flake-summary-<buildmode>-<iteration>` | `.github/workflows/scripts/flake-summary.sh` → `flake-summary.txt` | Pre-digested `rg` hits across detox/sim-app/metro/resource-monitor logs |
| `resource-monitor-<buildmode>-<iteration>_log` | `.github/workflows/scripts/resource-monitor.sh` → `resource-monitor.log` | Periodic `uptime` + `ps` snapshots (10s default) to correlate WS drops with CPU/memory pressure |
| `metro-<buildmode>-<iteration>_log` | Metro stdout/stderr from `yarn tests:packager:jet-ci` → `metro.log` (debug only) | Metro hung, slow bundle, or unresponsive `/status` during app launch |
| `simulator-<buildmode>-<iteration>_video` | `simctl recordVideo` → `simulator.mp4` | Visual confirmation (**`workflow_dispatch` / `workflow_call` `record_screens: true` only**) |
| `screenrecording-<buildmode>-<iteration>` | `screencapture` of the Mac desktop | Includes Simulator.app window (**`record_screens: true` only**) |
| `screenrecording-setup-<buildmode>-<iteration>.mov` | Guidepup setup recording | Very early environment setup (**`record_screens: true` only**) |
| `emulator-scripts-logs-<buildmode>-<iteration>` | `.github/workflows/scripts/*.log` | Script output if redirected |

Video artifacts upload only when **`record_screens: true`** (see [CI baseload policy](#ci-baseload-policy-instrumentation) below).

### CI baseload policy (instrumentation)

**Why** — macOS GHA runners showed `loadavg` in the hundreds during iOS e2e. Unfiltered simulator debug log streams (~1M+ lines/run before Detox), host syslog with `--backtrace`, dual video capture (host + sim), and three separate log streams kept baseline CPU/disk load high. A pre-Detox gate at load **10** never cleared within the wait budget.

**What changed** — shrink always-on instrumentation; gate load immediately before Jet/Detox orchestration at a realistic threshold (**20**).

**Workflow order** (`.github/workflows/tests_e2e_ios.yml`, before Detox):

| Step | Script / action | Notes |
|------|-----------------|-------|
| Pre-Boot Simulator | `RNFB_START_SIM_LOGS=0 ./boot-simulator.sh` | Boot + install only; no log streams |
| Start Simulator App Log | `RNFB_SIM_BOOT_MODE=logs ./boot-simulator.sh` | One filtered stream + `resource-monitor.sh`; sim video only if `RNFB_RECORD_SCREENS=1` |
| Wait for host load to settle | `wait-for-load-settle.sh` | Poll until `load1 < 20` or 1200s timeout; `continue-on-error: true` |
| Detox Test Debug / Release | `yarn tests:ios:test-cover` / `:release` | Jet orchestration begins here |

**Removed (high I/O / never triaged from artifacts)**

| Was | Why removed |
|-----|-------------|
| Host `log stream --backtrace` → `syslog.log` | Whole-machine syslog; heavy under Spotlight/indexing |
| Unfiltered `simctl log stream` → `simulator.log` | Millions of debug lines; triage uses filtered app/SpringBoard lines only |
| Separate `testing.log` + `springboard-invertase.log` | Merged into one stream (below) |

**Single sim log** — `simulator-logging.sh` writes **`sim-app.log`** via one predicate:

```text
process == "testing" OR (process == "SpringBoard" AND eventMessage CONTAINS "invertase")
```

Covers `[rnfb-lifecycle]`, Detox/Metro app lines, and FrontBoard/LaunchServices invertase failures.

**Optional video — `record_screens` input** — on `workflow_dispatch` and `workflow_call` only; default **`false`**. PR/push runs leave it off.

| When `record_screens: true` | When false (default) |
|-----------------------------|-------------------------|
| Guidepup setup recording | Skipped |
| Host `screencapture` → `screenrecording.*` | Skipped |
| `simctl recordVideo` → `simulator.mp4` | Skipped |

Set explicitly for UI regressions: `gh workflow run tests_e2e_ios.yml -f record_screens=true`.

**Load settle env** (`wait-for-load-settle.sh`):

| Variable | Default | Role |
|----------|---------|------|
| `RNFB_LOAD_SETTLE_MAX_LOAD` | **20** | Proceed when 1-min loadavg drops below this |
| `RNFB_LOAD_SETTLE_MAX_WAIT_SEC` | 1200 | Stop waiting and proceed anyway |
| `RNFB_LOAD_SETTLE_POLL_SEC` | 5 | Poll interval |

Log markers: `[load-settle] ts=… elapsed=… load1=… threshold=20` in the workflow step; copied into `flake-summary.txt` when present.

**Triage** — Debug legs often plateau higher than release (Metro still running). Saturated runners may never reach 20; treat `[load-settle] WARN: timed out` as informational — Detox still runs. Correlate flakes with `resource-monitor-*_log` and `[jet-ws] disconnect_context loadavg=…` rather than expecting idle hosts.

**When to use which log**

- **Boot / migration / “simulator won’t start”** — read the **Pre-Boot Simulator** step log in GitHub Actions first. Look for `[boot-status]` lines and `bootstatus -d` migration output.
- **Detox / app / test failures** — start with **`detox-step-*_log`** or **`flake-summary-*`** (fast triage). For native app instrumentation, download **`sim-app-*_log`**. Jet WS drops (1006/1001) appear in the Detox step (`[jet-ws]`, `[rnfb-e2e]`). For debug Metro issues, also download `metro-*_log`.
- **FrontBoard / relaunch after terminate** — `sim-app-*_log` plus `[rnfb-e2e] install-state` / `launchApp failure` lines in `detox-step-*_log`.
- **Runner load during flake** — `resource-monitor-*_log` (correlate timestamps with `[jet-ws] disconnect_context` loadavg/mem lines).
- **UI regressions** — re-run with `record_screens: true` → `simulator-*_video` or `screenrecording-*`.

**Downloading artifacts**

Workflow page **Artifacts**, or:

```bash
gh run download <run-id> -n sim-app-debug-0_log
```

**Analyzing `sim-app.log`**

Useful patterns:

```bash
rg 'testing\[' sim-app.log | rg -i 'waitForActive|waitForActiveDone|com\.wix\.Detox|ready action too early'
rg '\[rnfb-lifecycle\]' sim-app.log
rg '\[rnfb-lifecycle\].*RCTJavaScriptDidFailToLoad|packager-probe|packager-status-fetch' sim-app.log
rg 'No script URL provided|com\.facebook\.react\.log' sim-app.log
rg -i 'invertase|FrontBoard|unknown' sim-app.log
```

Long `datamigrator` activity with no `com.invertase.testing` means migration/pre-boot install not done.

### Detox configuration

Device type comes from `tests/.detoxrc.js`; boot script and Detox use it. No hard-coded UDID.

**Missing Detox framework cache** — if iOS `:test-cover` fails before tests with `Detox.framework could not be found`, rebuild the local cache: [running e2e § iOS Detox framework cache](../testing/running-e2e.md#ios-detox-framework-cache-blocking) (`yarn tests:ios:detox-framework-cache:rebuild`). CI restores `~/Library/Detox/ios` from Actions cache keyed by Xcode version.

### Codecov (debug matrix only)

Debug leg: `yarn tests:ios:test:process-coverage` + Codecov flags `e2e-ts-ios`, `ios-native`; `codecov/project/ios-native` blocks on missing native upload. Release skips coverage.

### E2E test app orchestration (Detox + Jet)

After pre-boot, failures often move inside app process `testing`: boot/install are fine, `launchApp` stalls while app stays alive.

#### 1. Early `ready` race

**Detox step symptom**

```
ws-server connection :50400<->:50415
ws-server The app has dispatched "ready" action too early.
```

**Cause** — iOS `DetoxManager` sends `ready` before server `login`; Detox 20.x drops it, so `launchApp()` waits forever.

**Mitigation** — Detox patch buffers early `ready` and replays after `login`; see [detox-patches.md](detox-patches.md).

#### 2. Device registry lock (`ECOMPROMISED`)

**Symptom** — failure before test output, often first minute:

```
Error: Unable to update lock within the stale threshold
  code: 'ECOMPROMISED'
```

**Cause** — Detox locks `~/Library/Detox/device.registry.json`; 10s heartbeat can miss under CI load ([Detox #4210](https://github.com/wix/Detox/issues/4210)).

**Mitigation** — same Detox patch doubles stale to 20s in `ExclusiveLockfile.js`. We do **not** use `detox reset-lock-file` in CI (wipes the ledger). See [detox-patches.md](detox-patches.md#device-registry-lock-ecompromised).

**Sentinel** — `proper-lockfile` + `ECOMPROMISED` in the Detox step log; build and Pre-Boot steps green.

#### 3. Main-thread delay before WebSocket handshake

**Symptom** — 30–60s gap between app launched and first `Connection 1: ready` / `handshake successful`; main-thread Firebase/RN/LLVM startup can defer WS callbacks.

**Mitigations**

| Change | Location |
|--------|----------|
| Wait for Jet (port 8090) before `launchApp` | `tests/e2e/firebase.test.js` |
| Defer `server.run()` until host `POST /launch-ready` on control port **8091** (`RNFB_JET_DEFER_RUN=1`) | Jet patch + `firebase.test.js` — [Jet host orchestration](../testing/running-e2e.md#jet-host-orchestration-ports-and-launch-gate) |
| `POST /orchestrate-state` + `[rnfb-e2e] orchestrate-state=` for launch/retry triage | `firebase.test.js` + Jet patch |
| Wait for Metro (`/status`) before `launchApp` | `tests/e2e/firebase.test.js` (debug Detox configs only; release skips Metro wait) |
| Bounded `launchApp` timeout (debug default 180s; release default 120s via `RNFB_LAUNCH_APP_RELEASE_TIMEOUT_MS`) | `tests/e2e/firebase.test.js` |
| `detoxEnableSynchronization: 'NO'` at launch | `tests/e2e/firebase.test.js` |
| `detoxURLBlacklistRegex: '.*'` | `tests/e2e/firebase.test.js` (existing) |

#### 4. `waitForActive` / scene never foreground-active

**Symptom** — `isReady` + `waitForActive`, no `waitForActiveDone`; app alive, scene remains unattached/inactive.

**Instrumentation** — `AppDelegate.mm` logs `[rnfb-lifecycle]` at launch, lifecycle notifications, and +30s/+60s probes.

**Distinguish from issue 5** — If `[rnfb-lifecycle]` probes show `UIApplication.state=active` / `foregroundActive` but Detox still hangs on `waitForActive`, the cause is likely Metro/JS bundle load failure (issue 5), not scene activation.

#### 5. Metro unresponsive at launch → `waitForActive` hang (active app)

**Symptom** — same as issue 4, but `[rnfb-lifecycle]` shows app active; usually debug-only (live Metro).

**Cause chain**:

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

#### Diagnosing from `sim-app.log`

Download the artifact (`gh run download <run-id> -n sim-app-debug-0_log`), unzip if needed, then search `sim-app.log`.

**Quick triage** — map Detox step timestamps to simulator log (`testing[<pid>]`):

```bash
# Detox orchestration inside the app process
rg 'testing\[' sim-app.log | rg -i 'waitForActive|waitForActiveDone|com\.wix\.Detox|ready action too early'

# App lifecycle confirmation (AppDelegate instrumentation)
rg '\[rnfb-lifecycle\]' sim-app.log

# Metro / JS bundle load failure (issue 5)
rg '\[rnfb-lifecycle\].*RCTJavaScriptDidFailToLoad|packager-probe|packager-status-fetch' sim-app.log
rg 'No script URL provided|com\.facebook\.react\.log' sim-app.log
rg 'testing\[' sim-app.log | rg '8081/status|index\.bundle'

# SpringBoard launch intent vs app scene state
rg 'com\.invertase\.testing' sim-app.log | rg -i 'foreground-interactive|visibility.*Foreground|running-active'
rg 'testing\[' sim-app.log | rg -i 'Deactivation reason|activationState|UISceneActivationState'

# WebSocket timing (main-thread block before handshake)
rg 'testing\[' sim-app.log | rg 'Connection 1: ready|handshake successful'

# Heavy startup on main thread (often precedes WS delay)
rg 'testing\[' sim-app.log | rg -i 'FIRApp|RNFB|RCTBridge|configure'
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
| Cloud quota Jet retry + cooldown + metrics/summary hooks | `tests/e2e/firebase.test.js`, `packages/app/e2e/cloud-metrics.js` — see [cloud API quota triage](../testing/firebase-testing-project.md#ci-triage-cloud-api-quota-pressure) |
| Lifecycle + JS load / packager probe logging; bundle URL `127.0.0.1` | `tests/ios/testing/AppDelegate.mm` |
| Pre-boot + `bootstatus` + shutdown wait before install | `boot-simulator.sh` |
| Baseload shrink: one `sim-app.log` stream, load settle before Detox, optional video | `simulator-logging.sh`, `wait-for-load-settle.sh`, `tests_e2e_ios.yml` — [CI baseload policy](#ci-baseload-policy-instrumentation) |
| Filtered logs, resource monitor, flake summary, Detox `tee` | `.github/workflows/tests_e2e_ios.yml`, `resource-monitor.sh`, `flake-summary.sh` |
| Metro stdout/stderr artifact | `.github/workflows/tests_e2e_ios.yml` |

#### 6. Jet WebSocket disconnect (1006 / 1001)

**Symptom** (Detox step, debug and release):

```
[🟨] Jet client disconnected - for no particular reason (code = 1006).
[jet-ws] transient_disconnect code=1006 grace_ms=30000 waiting_for_reconnect
```

The app process (`testing[<pid>]`) often stays alive in `sim-app.log` — the break is the **simulator → host** mocha-remote WebSocket on port **8090**, not a native crash.

**Cause** — Transient abnormal WebSocket closure (1006 = no close frame; 1001 = going away). Common in long debug+coverage runs (live Metro + Istanbul `__coverage__` growth + port 8090 forwarding). mocha-remote-client auto-reconnects in ~1s; Jet and mocha-remote-server now preserve the runner during a grace window instead of exiting immediately.

**Mitigations in this repo**

| Change | Location |
|--------|----------|
| 30s reconnect grace for 1006/1001 before fatal exit | `.yarn/patches/jet-npm-0.9.0-dev.13-*.patch` → `cli.js` |
| `reconnectGraceMs: 30000` | `tests/.jetrc.js` |
| mocha-remote-server preserves runner + sends `pull-coverage` on reconnect | `.yarn/patches/mocha-remote-server-npm-1.13.2-*.patch` |
| Assign `this.client` **before** `emit('connection')`; `Server.send()` warns instead of throwing | mocha-remote-server patch → `Server.js` |
| Client WS keepalive (`ping` when supported) + `readyState` logging on send failure | `.yarn/patches/mocha-remote-client-npm-1.13.2-*.patch` |
| `disconnect_context` logs `loadavg`, `process.memoryUsage()`, orchestrate phase, current test/suite, coverage-upload flag | Jet patch → `cli.js` |
| One Jet e2e retry when grace expires (`RETRYABLE_DISCONNECT`) or session/coverage retryable | `tests/e2e/firebase.test.js` |
| Structured WS / orchestration logging | `[jet-ws]`, `[rnfb-e2e]`, `[mocha-remote-ws]` prefixes |

**Diagnosing from CI logs** (start with `detox-step-*_log` or `flake-summary-*`):

```bash
# Jet WS lifecycle
rg '\[jet-ws\]|\[rnfb-e2e\]|\[mocha-remote-ws\]|Jet client disconnected|RETRYABLE_DISCONNECT' detox-step.log

# Disconnect resource context (+ orchestrate phase when defer-run enabled)
rg '\[jet-ws\] disconnect_context|\[rnfb-e2e\] orchestrate-state' detox-step.log

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
| `reconnect_recovered` then `Error: No client connected` or `send skipped action=pull-coverage` | Reconnect send race (issue 6b); Jet attempt 2 should trigger |

#### 6b. Reconnect send race under extreme host load

**Symptom** (often **release** matrix leg, mid-run during heavy emulator tests e.g. Functions `HttpsError`):

```
[jet-ws] transient_disconnect code=1006 grace_ms=30000 waiting_for_reconnect
[jet-ws] reconnect_recovered code=1006 elapsed_ms=~30000
Error: No client connected
```

Or, after the server patch, the Jet process stays up but logs:

```
[mocha-remote-ws] send skipped action=pull-coverage readyState=...
```

**Cause** — macOS GitHub runners can become **heavily I/O saturated** at any time (Spotlight indexing is a common contributor). We **cannot** disable Spotlight — `xcodebuild` / Xcode expect an up-to-date index. Under load averages in the hundreds, a transient WS 1006 is more likely; the 30s grace window often **does** recover the transport, but upstream `mocha-remote-server` used to `emit('connection')` **before** assigning `this.client`. Jet's `connection` listener immediately called `server.send({ action: 'pull-coverage' })`, which threw `No client connected` and **killed the Jet Node process** (uncaught exception). That failure was **not** classified as retryable WS disconnect — `retry-eligibility` showed all `false`.

A duplicate proactive `pull-coverage` in the Jet patch made the race worse (two senders on reconnect).

**Mitigations in this repo**

| Change | Location |
|--------|----------|
| `this.client = ws` before `emit('connection')`; protocol check first | mocha-remote-server patch → `handleConnection` |
| Single `pull-coverage` after reconnect (server only, when runner active) | mocha-remote-server patch → `handleConnection` |
| Remove Jet `connection` handler `pull-coverage` (keep `reconnect_recovered` log) | Jet patch → `cli.js` |
| `Server.send()` logs `[mocha-remote-ws] send skipped` instead of throwing | mocha-remote-server patch → `Server.js` |
| `JET_NO_CLIENT_CONNECTED_RE` → retryable Jet session failure | `tests/e2e/firebase.test.js` |

**Diagnosing**

```bash
rg 'reconnect_recovered|No client connected|send skipped action=pull-coverage' detox-step.log
rg '\[rnfb-e2e\] retry-eligibility' detox-step.log
rg 'disconnect_context|resource-monitor' detox-step.log resource-monitor.log
```

Correlate `disconnect_context loadavg=…` with `resource-monitor-*_log` — high loadavg during disconnect is expected on saturated runners and is **not** something we can eliminate; orchestration must tolerate it.

**Reference symptom** — grace can recover after a disconnect, then Jet may still crash on `No client connected`.

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
| Filtered sim app log artifact | `sim-app.log` |
| `wait_shutdown` before `simctl install` on reboot | `boot-simulator.sh` |

**Diagnosing**

```bash
rg 'install-state|launchApp failure|FrontBoard|FBSOpenApplication|terminateApp' detox-step.log
rg -i 'invertase|FrontBoard|unknown' sim-app.log
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
| Server sends `pull-coverage` proactively after reconnect | mocha-remote-server patch only (Jet `connection` handler must not duplicate) |
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

**Cloud API quota (Installations / Remote Config)** — platform-agnostic; see [firebase testing project — CI triage](../testing/firebase-testing-project.md#ci-triage-cloud-api-quota-pressure).

### Operational notes

- **macOS runner load / Spotlight** — GHA macOS hosts may run Spotlight indexing (or other disk-heavy work) at any time and saturate disk I/O. Disabling Spotlight is **not** an option for Xcode CI. Design for tolerance: longer grace windows, non-throwing `Server.send()`, Jet e2e retry on orchestration crashes, trimmed CI instrumentation ([CI baseload policy](#ci-baseload-policy-instrumentation)), `resource-monitor` + `disconnect_context` for triage. Do not treat high `loadavg` alone as a misconfiguration.
- **Release vs debug** — matrix runs both; each has separate artifacts (`debug` / `release` in the artifact name).
- **Retry** — Pre-Boot retries up to 3 times with 60s between attempts (clean shutdown + boot each time). Jet e2e retries once on retryable WS / launch / coverage teardown / **cloud quota** failures (simulator reboot via `boot-simulator.sh` on iOS; cloud quota adds cooldown — [cloud API quota triage](../testing/firebase-testing-project.md#ci-triage-cloud-api-quota-pressure)).
- **Do not boot the simulator only inside Detox** — historical races where the testee never sent “ready” to the Detox proxy; pre-boot remains mandatory.
- **CI helper scripts** (repo root relative):

| Script | Env vars | Role |
|--------|----------|------|
| `.github/workflows/scripts/simulator-logging.sh` | `RNFB_RECORD_SCREENS` (0/1), `RNFB_SIM_LOG_DIR`, `RNFB_SIM_LOG_STDOUT` | One filtered `sim-app.log` stream; optional sim video — sourced by `boot-simulator.sh` |
| `.github/workflows/scripts/wait-for-load-settle.sh` | `RNFB_LOAD_SETTLE_MAX_LOAD` (default **20**), `RNFB_LOAD_SETTLE_MAX_WAIT_SEC`, `RNFB_LOAD_SETTLE_POLL_SEC` | Poll host load immediately before Detox |
| `.github/workflows/scripts/resource-monitor.sh` | `RNFB_RESOURCE_MONITOR_INTERVAL_SEC` (default 10), `RNFB_RESOURCE_MONITOR_LOG` | Background `uptime` + `ps` snapshots during Detox |
| `.github/workflows/scripts/flake-summary.sh` | `RNFB_DETOX_LOG`, `RNFB_FLAKE_SUMMARY_OUT` | Post-run `rg` digest → `flake-summary.txt` |

Detox steps use `tee detox-step.log` and `exit ${PIPESTATUS[0]}` so the artifact preserves full output while the step still fails correctly.

### Local stress iteration (optional)

> **CI/manual mirror only.** The steps below reproduce CI deflake semantics on a developer machine. Local e2e runs must use [running-e2e.md](../testing/running-e2e.md) only — do not substitute `boot-simulator.sh`, `resource-monitor.sh`, or `flake-summary.sh` for the canonical `:build && :test-cover` loop.

To deflake without pushing every change, mirror CI on a macOS machine or VM (SSH is fine): emulators → build → `boot-simulator.sh` (pre-boot, CI-only) → `wait-for-load-settle.sh` → `resource-monitor.sh` → `:test-cover` per [running e2e](../testing/running-e2e.md) → `flake-summary.sh`. Wrap in a loop over `iterations` and collect `local-e2e-artifacts/iter-N-*` directories.

### Pinned Homebrew utilities

CI installs macOS build helpers from **vendored formulae** in `.github/homebrew-rnfb/Formula/` instead of live taps (`wix/brew`, `homebrew-core`). Each formula file is frozen in git with pinned `url`, source `sha256`, and bottle hashes — similar in spirit to SHA-pinned GitHub Actions.

| Formula | Version | Upstream source | Used in |
|---------|---------|-----------------|---------|
| `applesimutils.rb` | 0.9.12 | [wix/homebrew-brew](https://github.com/wix/homebrew-brew), pinned in vendored formula | iOS e2e (`tests_e2e_ios.yml`) |
| `xcbeautify.rb` | 3.2.1 | [homebrew-core](https://github.com/Homebrew/homebrew-core), pinned in vendored formula | iOS e2e + macOS e2e (`tests_e2e_other.yml`) |

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
