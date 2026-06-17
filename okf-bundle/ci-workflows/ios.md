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
- **Detox / app / test failures** — download `simulator-*_log` and search for `com.invertase.testing`, `SpringBoard`, `xctest`, or `Detox`.
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

### Operational notes

- **Release vs debug** — matrix runs both; each has separate artifacts (`debug` / `release` in the artifact name).
- **Retry** — Pre-Boot retries up to 3 times with 60s between attempts (clean shutdown + boot each time).
- **Do not boot the simulator only inside Detox** — historical races where the testee never sent “ready” to the Detox proxy; pre-boot remains mandatory.
