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
| `metro-<buildmode>-<iteration>_log` | Metro stdout/stderr from `yarn tests:packager:jet-ci` → `metro.log` (debug only) | Metro hung, slow bundle, or unresponsive `/status` during app launch |
| `simulator-<buildmode>-<iteration>_video` | `xcrun simctl io booted recordVideo` → `simulator.mp4` | Visual confirmation of UI state |
| `screenrecording-<buildmode>-<iteration>` | `screencapture` of the Mac desktop | Includes Simulator.app window |
| `screenrecording-setup-<buildmode>-<iteration>.mov` | Guidepup setup recording | Very early environment setup |
| `emulator-scripts-logs-<buildmode>-<iteration>` | `.github/workflows/scripts/*.log` | Script output if redirected |

**When to use which log**

- **Boot / migration / “simulator won’t start”** — read the **Pre-Boot Simulator** step log in GitHub Actions first. Look for `[boot-status]` lines and `bootstatus -d` migration output. That captures first-boot migration even though `simulator.log` starts only after pre-boot succeeds.
- **Detox / app / test failures** — download `simulator-*_log` and use [E2E test app orchestration](#e2e-test-app-orchestration-detox--jet) grep patterns (`[rnfb-lifecycle]`, `waitForActive`, SpringBoard foreground). Jet WS drops (1006/1001) appear in the **Detox step log** (`[jet-ws]`, `[rnfb-e2e]`). For debug Metro issues, also download `metro-*_log`.
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
| Wait for Metro (`/status`) before `launchApp` | `tests/e2e/firebase.test.js` (debug Detox configs only) |
| Bounded `launchApp` timeout (default 180s) | `tests/e2e/firebase.test.js` |
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
| One in-process `launchApp` retry on Metro/bundle load timeout | `tests/e2e/firebase.test.js` (`RNFB_LAUNCH_APP_MAX_ATTEMPTS`, debug only) |
| Full Jet e2e retry on launch failure (after in-process retries exhausted) | `tests/e2e/firebase.test.js` (debug Metro failures only) |
| Bounded `launchApp` timeout (default 180s, env `RNFB_LAUNCH_APP_TIMEOUT_MS`) | `tests/e2e/firebase.test.js` |
| Metro log artifact (`metro.log`) | `.github/workflows/tests_e2e_ios.yml` |
| JS load failure + packager probe logging | `tests/ios/testing/AppDelegate.mm` |
| Bundle URL pinned to `127.0.0.1` (bypasses RN `localhost` fallback) | `tests/ios/testing/AppDelegate.mm` |

**Known intermittent pattern (community)** — RN iOS debug builds commonly hit `No script URL provided` when Metro is down, slow, or reachable from the host but not from the simulator process. Reported causes include: Metro event loop blocked under load (TCP connect succeeds, HTTP hangs — matches our `-1001` on `/status`), macOS network proxy intercepting `localhost:8081`, port 8081 contention, and `RCTBundleURLProvider` returning a nil bundle URL despite `isPackagerRunning=YES` ([react-native#49173](https://github.com/facebook/react-native/issues/49173)). On **iOS 26+ simulators**, hostname resolution for `localhost` vs `127.0.0.1` can be unreliable; hardcoding `127.0.0.1` in bundle URL resolution has been reported to fix intermittent Metro disconnects ([react-native#56447](https://github.com/facebook/react-native/issues/56447)). Our test app now pins the debug bundle URL to `127.0.0.1:8081` and the e2e harness retries `launchApp` once on Metro/bundle-load timeout before failing the Jet attempt (**debug CI only** — release uses an embedded bundle and does not start Metro). These are typically **environment/timing** flakes rather than app logic bugs; release builds avoid them by using embedded bundles.

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
| Jet + Metro wait, bounded `launchApp` with retry, Detox launch args | `tests/e2e/firebase.test.js` |
| Lifecycle + JS load / packager probe logging; bundle URL `127.0.0.1` | `tests/ios/testing/AppDelegate.mm` |
| Pre-boot + `bootstatus` before install | `boot-simulator.sh` (orthogonal; fixes boot/migration only) |
| Metro stdout/stderr artifact | `.github/workflows/tests_e2e_ios.yml` |

#### 6. Jet WebSocket disconnect (1006 / 1001)

**Symptom** (Detox Test Debug step, often debug build only):

```
[🟨] Jet client disconnected - for no particular reason (code = 1006).
[🟥] Exiting after an abnormal disconnect.
Coverage summary: Unknown% ( 0/0 )
```

Release on the same run may pass; the app process (`testing[<pid>]`) often stays alive in `simulator.log` — the break is the **simulator → host** mocha-remote WebSocket on port **8090**, not a native crash.

**Cause** — Transient abnormal WebSocket closure (1006 = no close frame; 1001 = going away). Common in **debug CI** (live Metro on 8081 + Istanbul `__coverage__` growth + port 8090 forwarding). Jet’s `exitOnError: true` used to exit immediately; mocha-remote-client auto-reconnects in ~1s but the server had already shut down.

**Mitigations in this repo**

| Change | Location |
|--------|----------|
| 15s reconnect grace for 1006/1001 before fatal exit | `.yarn/patches/jet-npm-0.9.0-dev.13-*.patch` → `cli.js` |
| `reconnectGraceMs: 15000` | `tests/.jetrc.js` |
| One e2e retry when grace expires (`RETRYABLE_DISCONNECT`) | `tests/e2e/firebase.test.js` |
| Structured WS logging | `[jet-ws]` / `[rnfb-e2e]` prefixes in Jet + e2e harness |

**Diagnosing from CI logs** (Detox step; `simulator.log` rarely shows Jet WS):

```bash
# Jet WS lifecycle (Actions log)
rg '\[jet-ws\]|\[rnfb-e2e\]|Jet client disconnected|RETRYABLE_DISCONNECT' detox-step.log

# Grace window recovered (no e2e retry needed)
rg '\[jet-ws\] reconnect_recovered' detox-step.log

# Fatal transient disconnect → e2e retry eligible
rg '\[jet-ws\] (transient_disconnect|fatal_disconnect|RETRYABLE_DISCONNECT)' detox-step.log

# E2e harness retry
rg '\[rnfb-e2e\] Retrying after transient Jet WS' detox-step.log

# Coverage lost to abrupt Jet exit
rg 'Coverage summary|jet-coverage' detox-step.log
```

**Sentinel patterns**

| Pattern | Meaning |
|---------|---------|
| `transient_disconnect code=1006` then `reconnect_recovered` | Flaky WS; grace window saved the run |
| `fatal_disconnect code=1006 grace_expired_ms=` + `RETRYABLE_DISCONNECT` | Grace failed; e2e should retry once |
| `[rnfb-e2e] Retrying after transient Jet WS` | Second Jet attempt starting |
| `Coverage summary.*0/0` after disconnect | JS coverage never reached NYC (check `[jet-coverage]` on release for contrast) |
| Release passes, debug fails with 1006 | Points at Metro/debug+coverage, not test logic |

### Operational notes

- **Release vs debug** — matrix runs both; each has separate artifacts (`debug` / `release` in the artifact name).
- **Retry** — Pre-Boot retries up to 3 times with 60s between attempts (clean shutdown + boot each time).
- **Do not boot the simulator only inside Detox** — historical races where the testee never sent “ready” to the Detox proxy; pre-boot remains mandatory.

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
