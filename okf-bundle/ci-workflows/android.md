# Android CI workflows

## E2E job shape

1. `yarn tests:android:test-cover --headless` — Detox + Jet (pass/fail gate)
2. `yarn tests:android:post-e2e-coverage` — poll/pull `coverage.ec`, Jacoco report (best-effort, never fails the job)
3. Codecov upload — `continue-on-error: true`

Native Android coverage is **not** pulled inside `tests/e2e/firebase.test.js`. The Jet `after` hook in `tests/app.js` calls `RNFBTestingCoverage.flush()` in the **app process** to write `coverage.ec` before Detox SIGINTs instrumentation. Post-e2e pull runs after Detox exits.

## CI failure: Jet 1006 → adb `reverse --remove` mid-run

Observed on [run 27803881448](https://github.com/invertase/react-native-firebase/actions/runs/27803881448):

| Time | Event |
|------|--------|
| Jet attempt 1 | Mocha-remote WS **1006** → Jet grace timer starts |
| Same second | Detox runs `adb reverse --remove tcp:<detox-port>` |
| +15s | Grace expires → Jet exits → orchestration retries |
| Attempt 2 | **2586 tests pass** |
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

**Mitigation (patched):** `.yarn/patches/detox-npm-20.51.0-*.patch` makes `ADB.reverseRemove` ignore `listener 'tcp:…' not found` during teardown.

**Orchestration retry:** `firebase.test.js` still retries on `RETRYABLE_DISCONNECT`; attempt 2 can pass all tests even when attempt 1's teardown logged adb noise.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `[native-coverage] Android native coverage file not found after N attempts` | App-process flush did not run or failed; check Jet log for `[native-coverage] flushing android coverage` |
| Empty Jacoco XML (~235 bytes) | No `.ec` pulled — check post-e2e logs |
| `adb reverse --remove` in Detox logs | Expected on 1006; should be warn-only after Detox patch |
| Detox red, tests green in log | Pre-patch: teardown adb error; re-run or check patch applied |
