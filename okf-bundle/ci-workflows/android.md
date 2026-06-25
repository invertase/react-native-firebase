# Android CI workflows

## E2E job shape

1. `yarn tests:android:test-cover --headless` — Detox + Jet (pass/fail gate)
2. `yarn tests:android:post-e2e-coverage` — poll/pull `coverage.ec`, Jacoco report (best-effort, never fails the job)
3. **Codecov upload** — two flagged uploads (`e2e-ts-android`, `android-native`); `continue-on-error: true` on the action steps. **`codecov/project/android-native`** fails if the native flag upload is missing (see [coverage design](../testing/coverage-design.md#native-gates)).

Native Android coverage is **not** pulled inside `tests/e2e/firebase.test.js`. The Jet `after` hook in `tests/app.js` calls `RNFBTestingCoverage.flush()` in the **app process** to write `coverage.ec` before Detox SIGINTs instrumentation. Post-e2e pull runs after Detox exits.

## CI failure: Jet 1006 → adb `reverse --remove` mid-run

Observed failure shape:

| Time | Event |
|------|--------|
| Jet attempt 1 | Mocha-remote WS **1006** → Jet grace timer starts |
| Same second | Detox runs `adb reverse --remove tcp:<detox-port>` |
| +15s | Grace expires → Jet exits → orchestration retries |
| Attempt 2 | Retry can pass the suite |
| Teardown | `adb reverse --remove` fails again → Jest FAIL |

**Why reverse cleanup runs mid-run:** Detox `AndroidDriver._launchInstrumentationProcess()` registers a termination handler that always calls `adb reverse --remove` when instrumentation stops:

```342:347:tests/node_modules/detox/src/devices/runtime/drivers/android/AndroidDriver.js
    const serverPort = await this._reverseServerPort(adbName);
    this.instrumentation.setTerminationFn(async () => {
      await this._terminateInstrumentation();
      await this.adb.reverseRemove(adbName, serverPort);
    });
```

When the Jet/app WebSocket drops (1006), Detox can treat the session as dead and tear down instrumentation **while Jet is still in its 15s reconnect grace**. That triggers `reverseRemove` before the orchestration retry's `terminateApp()`. If the listener was never established or was already removed, adb exits non-zero.

**Mitigation (patched):** `.yarn/patches/detox-npm-20.51.0-*.patch`:

- `ADB.reverseRemove` — ignore `listener 'tcp:…' not found` during teardown (below)
- Android idling resources — force idle (network/timers/Fabric)
- `ExclusiveLockfile.js` — 2× lock stale for `ECOMPROMISED` flake ([detox-patches.md](detox-patches.md))

Full inventory: [detox-patches.md](detox-patches.md).

**Orchestration retry:** `firebase.test.js` still retries on `RETRYABLE_DISCONNECT`; attempt 2 can pass all tests even when attempt 1's teardown logged adb noise.

## CI failure: Jet JSON / WS protocol desync (Unexpected end of JSON input)

Observed on Android CI under load: Jet may run only a small prefix of tests before the mocha-remote transport desyncs — often after a transient 1006 under high `loadavg`.

**Symptom**

```
[🟥] Unexpected end of JSON input
[mocha-remote-ws] parse_buffering ...
```

**Cause** — TCP/WebSocket chunks can split JSON frames; under I/O pressure, partial reads are more common. Unbuffered `JSON.parse` on each chunk corrupts the protocol stream.

**Mitigations (patches + orchestration)**

| Change | Location |
|--------|----------|
| Inbound parse buffer + `tryDeserialize` in `serialization.js` / `parse_skip` logging | mocha-remote-server patch |
| Outbound queue flushed on reconnect | mocha-remote-client patch |
| `JET_PROTOCOL_ERROR_RE` → retryable Jet session (attempt 2) | `tests/e2e/firebase.test.js` |
| Cold-boot ready wait + post-boot settle before Jet attempt 1 | `firebase.test.js` (`waitForAndroidEmulatorReady`, `RNFB_ANDROID_BOOT_SETTLE_MS`) |
| Load gate before starting Jet (threshold 5, 3 consecutive polls) | `firebase.test.js` |

**Patch workflow reminder** — after editing `tests/node_modules/jet` or `mocha-remote-*`, run `yarn patch-commit` **and** `yarn install` from repo root so `yarn.lock` patch hashes update. CI applies patches from the lockfile, not live `node_modules` edits.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `[native-coverage] Android native coverage file not found after N attempts` | App-process flush did not run or failed; check Jet log for `[native-coverage] flushing android coverage` |
| Empty Jacoco XML (~235 bytes) | No `.ec` pulled — check post-e2e logs |
| `adb reverse --remove` in Detox logs | Expected on 1006; should be warn-only after Detox patch |
| Detox red, tests green in log | Pre-patch: teardown adb error; re-run or check patch applied |
| `codecov/project/android-native` fail | Jacoco XML not uploaded — check post-e2e logs and Codecov Uploads tab for `android-native` flag |
