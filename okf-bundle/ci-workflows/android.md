---
type: Reference
title: Android CI workflows
description: Android CI job structure, coverage handling, Detox failure modes, mitigations, and troubleshooting guidance.
tags: [ci, android, detox, e2e, coverage, troubleshooting]
timestamp: 2026-08-26T00:00:00Z
---

# Android CI workflows

## E2E job shape (CI — mirrors workflow YAML; local: [running e2e](../testing/running-e2e.md))

1. `tests:android:build`
2. `tests:android:unit` — JVM unit (no emulator); produces module Jacoco `*.exec` ([AndroidTest-AD-1](../testing/android-architecture-decisions.md))
3. `tests:android:test-cover --headless` — pass/fail gate
4. `tests:android:post-e2e-coverage` — poll/pull `coverage.ec`, merged **`jacocoTestReport`** (unit `*.exec` + e2e `*.ec`; best-effort, never fails the job)
5. **Codecov upload** — two flagged uploads (`e2e-ts-android`, `android-native` → `jacocoTestReport.xml`); `continue-on-error: true` on the action steps. **`codecov/project/android-native`** fails if the native flag upload is missing (see [coverage design](../testing/coverage-design.md#native-gates)).

Android native coverage is flushed in app process by `tests/app.js` Jet `after`; post-e2e pull runs after Detox exits and merges with JVM unit execution data. Full Jacoco contract: [coverage design](../testing/coverage-design.md) — do not duplicate here.

## CI failure: Jet 1006 → adb `reverse --remove` mid-run

Observed failure shape:

| Time | Event |
|------|--------|
| Jet attempt 1 | Mocha-remote WS **1006** → Jet grace timer starts |
| Same second | Detox runs `adb reverse --remove tcp:<detox-port>` |
| +15s | Grace expires → Jet exits → orchestration retries |
| Attempt 2 | Retry can pass the suite |
| Teardown | `adb reverse --remove` fails again → Jest FAIL |

**Why reverse cleanup runs mid-run:** Detox always calls `adb reverse --remove` when instrumentation stops:

```342:347:tests/node_modules/detox/src/devices/runtime/drivers/android/AndroidDriver.js
    const serverPort = await this._reverseServerPort(adbName);
    this.instrumentation.setTerminationFn(async () => {
      await this._terminateInstrumentation();
      await this.adb.reverseRemove(adbName, serverPort);
    });
```

On Jet/app WS 1006, Detox may tear down instrumentation during Jet's 15s reconnect grace. `reverseRemove` can run before retry `terminateApp()`; missing listener gives non-zero adb.

**Mitigation (patched):** `.yarn/patches/detox-npm-20.51.0-*.patch`:

- `ADB.reverseRemove` — ignore `listener 'tcp:…' not found` during teardown (below)
- Android idling resources — force idle (network/timers/Fabric)
- `ExclusiveLockfile.js` — 2× lock stale for `ECOMPROMISED` flake ([detox-patches.md](detox-patches.md))

Inventory: [detox-patches.md](detox-patches.md). `firebase.test.js` retries `RETRYABLE_DISCONNECT`; retry can pass despite attempt-1 adb noise.

## CI failure: Jet JSON / WS protocol desync (Unexpected end of JSON input)

Under load, Jet may run only a small prefix before mocha-remote desync, often after transient 1006/high `loadavg`.

**Symptom**

```
[🟥] Unexpected end of JSON input
[mocha-remote-ws] parse_buffering ...
```

**Cause** — WS chunks can split JSON frames; unbuffered `JSON.parse` corrupts stream under I/O pressure.

**Mitigations (patches + orchestration)**

| Change | Location |
|--------|----------|
| Defer `server.run()` until host `POST /launch-ready` on control port **8091** (`RNFB_JET_DEFER_RUN=1`) | Jet patch + `firebase.test.js` — [Jet host orchestration](../testing/running-e2e.md#jet-host-orchestration-ports-and-launch-gate) |
| Inbound parse buffer + `tryDeserialize` in `serialization.js` / `parse_skip` logging | mocha-remote-server patch |
| Outbound queue flushed on reconnect | mocha-remote-client patch |
| `JET_PROTOCOL_ERROR_RE` → retryable Jet session (attempt 2) | `tests/e2e/firebase.test.js` |
| Cold-boot ready wait + post-boot settle before Jet attempt 1 | `firebase.test.js` (`waitForAndroidEmulatorReady`, `RNFB_ANDROID_BOOT_SETTLE_MS`) |
| Load gate before starting Jet (threshold 5, 3 consecutive polls) | `firebase.test.js` |

**Patch workflow:** after editing `tests/node_modules/jet` or `mocha-remote-*`, run `yarn patch-commit` **and** root `yarn install`; CI uses lockfile patch hashes.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `[native-coverage] Android native coverage file not found after N attempts` | App-process flush did not run or failed; check Jet log for `[native-coverage] flushing android coverage` |
| Empty Jacoco XML (~235 bytes) | No `.ec` / `.exec` in merge — check post-e2e logs and that `yarn tests:android:unit` ran ([coverage design](../testing/coverage-design.md)) |

| `adb reverse --remove` in Detox logs | Expected on 1006; should be warn-only after Detox patch |
| Detox red, tests green in log | Pre-patch: teardown adb error; re-run or check patch applied |
| Emulator offline / hung / duplicate instance | Warm quickboot snapshot restore; `tests/.detoxrc.js` sets `bootArgs: '-no-snapshot-load -no-snapshot-save'` for cold boot when Detox launches TestingAVD |
| `codecov/project/android-native` fail | Jacoco XML not uploaded — check post-e2e logs and Codecov Uploads tab for `android-native` flag; path must be `jacocoTestReport.xml` (merged), not e2e-only `jacocoAndroidTestReport.xml` |
| FIS 503 / `Too many server requests` / RC cascade | Live cloud quota (shared project) — not Android-specific; see [cloud API quota triage](../testing/firebase-testing-project.md#ci-triage-cloud-api-quota-pressure) |
