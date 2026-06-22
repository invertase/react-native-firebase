# Detox yarn patches

E2E runs on **Detox 20.51.0** (`tests/package.json`), applied via Yarn Berry patch:

`.yarn/patches/detox-npm-20.51.0-3e13b6e309.patch`

Patches are maintained in-repo (including by agents). Prefer **editing the patch file directly** or the headless workflow below — `yarn patch-commit` can prompt for overwrite confirmation, which fails in non-interactive shells.

## Inventory

| Change | File(s) | Platforms | Problem |
|--------|---------|-----------|---------|
| Disable network idling | `NetworkIdlingResource.kt` | Android | OkHttp never idle in RN Firebase tests → Detox sync timeout |
| Disable timers idling | `TimersIdlingResource.kt` | Android | RN timer queue never drains → infinite idle wait |
| Disable Fabric UI idling | `FabricUIManagerIdlingResources.kt` | Android | Stuck mount items on API 36+ / edge-to-edge → false busy |
| Buffer early `ready` | `AnonymousConnectionHandler.js` | iOS | App sends `ready` before Detox login → `launchApp` stuck |
| Ignore missing adb reverse on teardown | `ADB.js` | Android | Jet WS 1006 triggers mid-run `reverse --remove` → adb exit 1 |
| **2× device-registry lock stale** | `ExclusiveLockfile.js` | iOS, macOS, Android | `proper-lockfile` `ECOMPROMISED` before tests start |

Related non-Detox patches: `jet`, `mocha-remote-client`, `mocha-remote-server` — WS reconnect grace, coverage handshake (`coverage-ready` / `pull-coverage`), client keepalive. See [coverage design](../testing/coverage-design.md) and [iOS CI — issues 6–8](ios.md#6-jet-websocket-disconnect-1006--1001).

## Device registry lock (`ECOMPROMISED`)

### Symptom

Detox Test step fails **before any test output**, often ~30–60s after `yarn tests:ios:test:release` starts:

```
Error: Unable to update lock within the stale threshold
  at .../proper-lockfile/lib/lockfile.js:109
  code: 'ECOMPROMISED'
```

Build, pre-boot, and app install usually succeed. Codecov and coverage steps are skipped because Jest never starts.

### Cause

Detox serializes access to `~/Library/Detox/device.registry.json` (the **device allocation ledger**: which simulators/emulators are busy, session IDs, PIDs). It uses `proper-lockfile`, which refreshes the lock file mtime on a timer (default **stale = 10s**). If the runner is under load — simulator logging, Firestore emulator, `yeetd`, Xcode build cache — a heartbeat can miss that window and Detox throws `ECOMPROMISED`.

This is a known Detox / CI flake ([Detox #4210](https://github.com/wix/Detox/issues/4210)). Community reports ~1-in-25 on busy macOS CI.

### Mitigation (this repo)

**Patch** `ExclusiveLockfile.js` to pass `{ stale: 20000 }` (2× default) into `plockfile.lockSync` when locking the device registry.

We **do not** run `detox reset-lock-file` in CI. That command wipes `device.registry.json` — useful for local recovery, but it destroys Detox's ledger state and can mask concurrent-session bugs. Extending the stale window preserves the ledger while tolerating slow heartbeats.

Other prerequisites already in place:

- `maxWorkers: 1` in `tests/e2e/jest.config.js` (multi-worker lock contention is a common trigger)
- Pre-boot simulator before Detox (orthogonal; fixes boot/migration, not lock heartbeats)

### Diagnosing

| Pattern | Meaning |
|---------|---------|
| Failure in first minute, no Jest/Detox test lines | Startup lock failure (this issue) |
| `proper-lockfile` + `ECOMPROMISED` in Detox step log | Confirms lock heartbeat, not test logic |
| Release fails, debug passes (or vice versa) | Timing/load flake; same root cause |
| Orphan `node` in job cleanup | Stuck Detox/Jest from lock abort |

```bash
rg 'ECOMPROMISED|proper-lockfile|Unable to update lock' detox-step.log
```

### When to bump further

If `ECOMPROMISED` persists after 20s, consider 30s in the patch (MetaMask used 20s on Bitrise). Re-evaluate when migrating off Detox to Appium.

## Updating a Detox patch (headless)

**Do not** `rsync` the whole `node_modules/detox` tree into a patch folder — that pulls in frameworks and multi‑MB artifacts.

1. Edit the patched file under `tests/node_modules/detox/...` (after `yarn install`), **or** append a correct unified-diff hunk to `.yarn/patches/detox-npm-20.51.0-3e13b6e309.patch`.
2. Regenerate the patch file without prompts:

```bash
PATCH_DIR=$(yarn patch detox@npm:20.51.0 2>&1 | sed -n 's/.*folder: //p')
SRC=tests/node_modules/detox

# Copy ONLY the files this patch touches (see inventory table above)
/bin/cp -f "$SRC/src/utils/ExclusiveLockfile.js" "$PATCH_DIR/src/utils/ExclusiveLockfile.js"
/bin/cp -f "$SRC/src/server/handlers/AnonymousConnectionHandler.js" "$PATCH_DIR/src/server/handlers/AnonymousConnectionHandler.js"
/bin/cp -f "$SRC/src/devices/common/drivers/android/exec/ADB.js" "$PATCH_DIR/src/devices/common/drivers/android/exec/ADB.js"
/bin/cp -f "$SRC/android/detox/src/full/java/com/wix/detox/reactnative/idlingresources/network/NetworkIdlingResource.kt" \
  "$PATCH_DIR/android/detox/src/full/java/com/wix/detox/reactnative/idlingresources/network/NetworkIdlingResource.kt"
/bin/cp -f "$SRC/android/detox/src/full/java/com/wix/detox/reactnative/idlingresources/timers/TimersIdlingResource.kt" \
  "$PATCH_DIR/android/detox/src/full/java/com/wix/detox/reactnative/idlingresources/timers/TimersIdlingResource.kt"
/bin/cp -f "$SRC/android/detox/src/full/java/com/wix/detox/reactnative/idlingresources/uimodule/fabric/FabricUIManagerIdlingResources.kt" \
  "$PATCH_DIR/android/detox/src/full/java/com/wix/detox/reactnative/idlingresources/uimodule/fabric/FabricUIManagerIdlingResources.kt"

yarn patch-commit -s "$PATCH_DIR"   # non-interactive when using /bin/cp -f, not plain cp
```

3. `yarn install` from repo root and confirm the change in `tests/node_modules/detox/...`.
4. Update this doc and platform pages (`ios.md`, `android.md`) if behaviour or file list changes.

**Detox version bump:** change `tests/package.json`, run `yarn`, re-apply all hunks (or redo the headless flow from a fresh `yarn patch`), run iOS + Android E2E.

## Platform docs

- [iOS](ios.md) — simulator boot, early-ready, Jet WS, lock flake sentinels
- [Android](android.md) — idling resources, adb reverse teardown
