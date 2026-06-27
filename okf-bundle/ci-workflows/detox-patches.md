# Detox yarn patches

E2E runs on **Detox 20.51.0** (`tests/package.json`), applied via Yarn Berry patch:

`.yarn/patches/detox-npm-20.51.0-3e13b6e309.patch`

Patches are in-repo. Prefer direct patch-file edits or headless workflow; `yarn patch-commit` may prompt and fail in non-interactive shells.

## Inventory

| Change | File(s) | Platforms | Problem |
|--------|---------|-----------|---------|
| Disable network idling | `NetworkIdlingResource.kt` | Android | OkHttp never idle in RN Firebase tests → Detox sync timeout |
| Disable timers idling | `TimersIdlingResource.kt` | Android | RN timer queue never drains → infinite idle wait |
| Disable Fabric UI idling | `FabricUIManagerIdlingResources.kt` | Android | Stuck mount items on API 36+ / edge-to-edge → false busy |
| Buffer early `ready` | `AnonymousConnectionHandler.js` | iOS | App sends `ready` before Detox login → `launchApp` stuck |
| Ignore missing adb reverse on teardown | `ADB.js` | Android | Jet WS 1006 triggers mid-run `reverse --remove` → adb exit 1 |
| **2× device-registry lock stale** | `ExclusiveLockfile.js` | iOS, macOS, Android | `proper-lockfile` `ECOMPROMISED` before tests start |

Related patches: `jet`, `mocha-remote-client`, `mocha-remote-server` — WS reconnect grace, coverage handshake, client keepalive, parse buffering, reconnect assignment order; **host control HTTP on `JET_REMOTE_PORT + 1` (default 8091)** for launch defer + orchestrate phase (`RNFB_JET_DEFER_RUN`); HTTP POST `/coverage` on 8090 removed. See [Jet host orchestration](../testing/running-e2e.md#jet-host-orchestration-ports-and-launch-gate), [coverage design](../testing/coverage-design.md), [iOS issues 6–8](ios.md#6-jet-websocket-disconnect-1006--1001).

## Updating the jet patch (headless)

1. Edit under `tests/node_modules/jet/` after `yarn install`, **or** append hunks to `.yarn/patches/jet-npm-0.9.0-dev.13-3321aeea6e.patch`.
2. Regenerate without prompts:

```bash
PATCH_DIR=$(yarn patch jet@npm:0.9.0-dev.13 2>&1 | sed -n 's/.*folder: //p')
SRC=tests/node_modules/jet
/bin/cp -f "$SRC/lib/commonjs/cli.js" "$PATCH_DIR/lib/commonjs/cli.js"
/bin/cp -f "$SRC/lib/commonjs/index.js" "$PATCH_DIR/lib/commonjs/index.js"
/bin/cp -f "$SRC/src/index.tsx" "$PATCH_DIR/src/index.tsx"
yarn patch-commit -s "$PATCH_DIR"
```

3. `yarn install` from repo root — confirm updated `yarn.lock` patch hash and applied files in `tests/node_modules/jet/`.

**Touch list:** `lib/commonjs/cli.js` (server: WS `coverage-data`, reconnect grace, **`startControlHttpServer` on port `JET_REMOTE_PORT + 1`**, defer `server.run()` until `POST /launch-ready` when `RNFB_JET_DEFER_RUN=1`; **no** control HTTP on the 8090 WebSocket stack), `lib/commonjs/index.js` + `src/index.tsx` (client: `client.uploadCoverage()`). Metro resolves Jet via `"react-native": "src/index"` — patching `lib/` alone does not fix macOS bundles.

## Device registry lock (`ECOMPROMISED`)

### Symptom

Detox fails **before test output**, often ~30–60s after start:

```
Error: Unable to update lock within the stale threshold
  at .../proper-lockfile/lib/lockfile.js:109
  code: 'ECOMPROMISED'
```

Build/pre-boot/install usually succeed; coverage skips because Jest never starts.

### Cause

Detox locks `~/Library/Detox/device.registry.json` (device allocation ledger) via `proper-lockfile`; default stale window is 10s. Under runner load, heartbeat can miss and throw `ECOMPROMISED`.

This is a known Detox / CI flake ([Detox #4210](https://github.com/wix/Detox/issues/4210)). Community reports ~1-in-25 on busy macOS CI.

### Mitigation (this repo)

Patch `ExclusiveLockfile.js` with `{ stale: 20000 }` for device registry lock.

Do **not** run `detox reset-lock-file` in CI: it wipes the ledger and can mask concurrency bugs. Extend stale window instead.

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

If 20s still flakes, consider 30s; re-evaluate when moving off Detox.

## Updating a Detox patch (headless)

Do **not** `rsync` all `node_modules/detox`; it pulls frameworks and multi-MB artifacts.

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

3. Root `yarn install`; confirm `tests/node_modules/...` and `yarn.lock` patch hashes.
4. Update this doc and platform pages (`ios.md`, `android.md`) if behaviour or file list changes.

**Detox version bump:** change `tests/package.json`, run `yarn`, re-apply all hunks (or redo the headless flow from a fresh `yarn patch`), run iOS + Android E2E.

## Platform docs

- [iOS](ios.md) — simulator boot, early-ready, Jet WS, lock flake sentinels
- [Android](android.md) — idling resources, adb reverse teardown
