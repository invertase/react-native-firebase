# Coverage evidence — R6 (database takeIfIdle atomic)

**Verdict:** `100% on reachable touched lines`

**Item:** CPRN-365 / PR #9093 — R6 database `takeIfIdle` atomicity

## Touched regions

| File | Change | Unit coverage |
|------|--------|---------------|
| `packages/app/android/.../RNFBHandleMap.java` | `takeIf(id, predicate)` | `RNFBHandleMapTest` — predicate true/false/missing |
| `packages/app/ios/RNFBApp/RNFBHandleMap.{h,m}` | `takeIf:when:` | `RNFBHandleMapTests` — condition yes/no/missing |
| `packages/database/android/.../RNFBDatabaseQueryRegistry.java` | `takeIfIdle` via `map.takeIf` | `RNFBDatabaseQueryRegistryTest` — idle/active/missing + concurrent |
| `packages/database/ios/.../RNFBDatabaseQueryRegistry.m` | `takeIfIdle` via `takeIf:when:` | `RNFBDatabaseQueryRegistryTests` — same branches + concurrent |

## Branch map

| Branch | Test |
|--------|------|
| `takeIf` / `takeIf:when:` predicate true → remove | `RNFBHandleMapTest.takeIf_whenPredicateTrue_*` / `RNFBHandleMapTests testTakeIf_whenConditionYes_*` |
| Predicate false → keep mapping | `takeIf_whenPredicateFalse_*` / `testTakeIf_whenConditionNo_*` |
| Missing key → nil | `takeIf_whenMissing_*` / `testTakeIf_whenMissing_*` |
| `takeIfIdle` no listeners → take | `takeIfIdle_whenNoListeners_takes` / `testTakeIfIdle_whenNoListeners_takes` |
| Has listeners → keep | `takeIfIdle_whenHasListeners_*` / `testTakeIfIdle_whenHasListeners_*` |
| No `hasListeners` selector → keep | `testTakeIfIdle_objectWithoutHasListeners_*` |
| Concurrent off/on: listener added during `hasListeners` under lock | `takeIfIdle_concurrentOffOnRace_retainsMappingWhenListenersAddedDuringCheck` / iOS equivalent |
| Concurrent off/on stress with listeners active | `takeIfIdle_concurrentOffOnRace_stressRetainsWhenListenersAlreadyActive` / iOS equivalent |
| Concurrent dual `takeIfIdle` on idle query | `takeIfIdle_concurrentTakeIfIdle_onIdleQuery_leavesMapEmpty` / iOS equivalent |

## Gaps

None — all reachable lines in touched production methods exercised by JVM / XCTest.

## Artifacts

| Platform | Command | Result |
|----------|---------|--------|
| Android database | `./gradlew :react-native-firebase_database:testDebugUnitTest --tests RNFBDatabaseQueryRegistryTest` | exit 0 (12 tests) |
| Android app (HandleMap) | `./gradlew :react-native-firebase_app:testDebugUnitTest --tests RNFBHandleMapTest` | exit 0 (14 tests) |
| iOS database | `xcodebuild test … RNFBDatabaseUnitTests` | exit 0 (21 tests) |
| iOS app (HandleMap) | `xcodebuild test … RNFBAppUnitTests` | exit 0 (14 tests) |

Timestamp: 2026-08-26T15:48:39Z
