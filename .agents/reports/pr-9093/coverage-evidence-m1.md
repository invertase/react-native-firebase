# Coverage evidence — M1 (perf duplicate id collision)

**Verdict:** `100% on reachable touched lines`

**Item:** CPRN-365 / PR #9093 — M1 perf duplicate trace/http/screen id collision semantics

**Decision:** silent last-wins via `putReplacing` + stop displaced outside HandleMap lock ([m1-perf-collision-decision.md](./m1-perf-collision-decision.md))

## Touched regions

| File | Change | Unit coverage |
|------|--------|---------------|
| `packages/perf/android/.../UniversalFirebasePerfModule.java` | `registerStartedTrace` / `registerStartedHttpMetric` / `registerRecordedScreenTrace` (`putReplacing` + stop displaced) | Registry JVM test mirrors module pattern (D12 — no Firebase types in JVM) |
| `packages/perf/ios/RNFBPerf/RNFBPerfModule.mm` | `startTrace` / `startHttpMetric` last-wins + stop displaced | Registry XCTest mirrors module pattern |
| `packages/perf/android/.../RNFBPerfHandleRegistry.java` | Javadoc — module uses `putReplacing` | Existing + new collision-pattern test |
| `packages/perf/ios/RNFBPerf/RNFBPerfHandleRegistry.h` | Javadoc — module uses `putReplacing` | Existing + new collision-pattern test |

## Branch map

| Branch | Test |
|--------|------|
| `putReplacing` when free → store, no displaced | `putReplacing_whenFree_stores` / implicit in occupied test setup |
| `putReplacing` when occupied → return displaced, last wins | `putReplacing_whenOccupied_returnsDisplaced` / `testPutReplacing_whenOccupied_returnsDisplaced` |
| Module pattern: stop displaced outside lock | `putReplacing_moduleCollisionPattern_stopsDisplacedOutsideLock` / `testPutReplacing_moduleCollisionPattern_stopsDisplacedOutsideLock` |
| `putOrDiscard` first-wins (registry API, not module path) | `putOrDiscard_collision_*` / `testPutOrDiscard_collision_*` |

## Gaps

| Gap | Disposition |
|-----|-------------|
| TurboModule `startTrace` / `startHttpMetric` wiring lines in `UniversalFirebasePerfModule` / `RNFBPerfModule.mm` | **User-accepted exception** — [coverage design](../../okf-bundle/testing/coverage-design.md): HandleMap TurboModule delegate lines may stay uncovered; collision lifecycle proven on Registry + documented module pattern |

No dead or intractable gaps.

## Artifacts

| Platform | Command | Result |
|----------|---------|--------|
| Android perf | `./gradlew :react-native-firebase_perf:testDebugUnitTest --tests RNFBPerfHandleRegistryTest` | exit 0 (15 tests) |
| iOS perf | `xcodebuild test -scheme RNFBPerfUnitTests -destination 'platform=macOS'` | exit 0 (8 tests) |

Timestamp: 2026-08-26T17:01:00Z
