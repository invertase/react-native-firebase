---
type: Reference
title: Coverage design
description: Goals and implementation details for unit and e2e test coverage across platforms.
tags: [testing, coverage, codecov, e2e, jest]
timestamp: 2026-06-17T00:00:00Z
---

# Goals

Coverage shows which **TS library sources** (`packages/*/lib/**`) and **native sources** (Java/ObjC/Swift under `packages/*/android/**`, `packages/*/ios/**`) tests exercise.

| Layer | Proves | Consumers |
|-------|--------|-----------|
| **Unit (Jest)** | Package logic with mocks | Fast feedback on `lib/**` |
| **E2e (Jet / Detox)** | Real app behaviour against Firebase emulators and cloud APIs | TS + native bridge integration |

Codecov merges CI uploads. Project-level % swings can be noise; **file-level** coverage on changed sources is the signal. macOS e2e uses firebase-js-sdk only — no native RNFB coverage there.

# Coverage expectations (policy)

For **new code in a PR**:

* **Coverage only goes up** on files the change touches.
* **100% is the goal** for TS and native sources in that area. "Mostly covered" is not enough for new code.
* **Gaps need quantified intractability** — e.g. Swift codegen unreachable arms (`default`/`fatalError`, synthesized conformances) capping coverage a few % below 100%; name and measure ("~NN% unreachable Swift codegen"), don't hand-wave.
* **Any other gap is either testable or dead code** — add tests (negative paths, failure branches, every reachable branch) or delete unreachable/duplicate/superseded code. Large uncovered blocks: ask "is this reachable?" before writing tests.

Gap passes should **add tests and remove dead code** together.

## Coverage as completion signal

File-level coverage means an iteration is **done** — not merely green Jest/e2e or passing type checks.

1. **Baseline** after full e2e (all relevant platforms).
2. Implement with tests.
3. **After** full e2e with single-test/suite narrowing reverted (area narrowing may persist per package workflow until pre-merge).
4. Touched files: coverage **only rises** until **intractable limits** (above).

**Plateau below that limit → refactor**, not ship:

* Large uncovered native blocks often mean **dormant code paths** — use coverage to find the live path, delete the rest.
* Duplicate traversal (e.g. visiting the same tree property twice) can pass tests while leaving untestable structure — simplify until coverage rises.

Do not hand off with closable gaps. Package workflows may define snapshot tooling (e.g. [pipeline before/after scripts](../packages/firestore/pipeline-implementation-workflow.md)).

## Reading per-file coverage locally

After `tests:<platform>:test-cover`:

* **JS:** `npx jest <path> --coverage --collectCoverageFrom='packages/<pkg>/lib/**/*.ts' --coverageReporters=text`
* **iOS native:** `yarn tests:ios:test:process-coverage` → `coverage/ios-native/lcov.info` (`DA:` lines). **Deletes processed `.profraw`** — re-run e2e before re-processing.
* **Android native:** `yarn tests:android:post-e2e-coverage` → Jacoco XML per `sourcefile`.
* macOS e2e overwrites `coverage/lcov.info`; process iOS/Android native before a macOS run if you need both.

# End-to-end overview

```mermaid
flowchart LR
  subgraph unit [Unit Jest]
    J1[jest --coverage] --> J2[coverage/lcov.info]
  end
  subgraph ts_e2e [E2e TypeScript]
    M[Metro + inline source maps] --> A[App bundle]
    A --> J[Jet --coverage]
    J --> N[NYC remap]
    N --> T2[coverage/lcov.info]
  end
  subgraph android_native [E2e Android native]
    D1[Detox e2e] --> FLA[RNFBTestingCoverage.flush]
    FLA --> EC[coverage.ec in app filesDir]
    EC --> P1[pull-native-coverage.js]
    P1 --> J1R[jacocoAndroidTestReport]
    J1R --> AX[jacoco XML]
  end
  subgraph ios_native [E2e iOS native]
    D2[Detox e2e] --> FLI[RNFBTestingCoverage.flush]
    FLI --> PR[coverage.profraw in Documents]
    PR --> P2[pull-native-coverage.js]
    P2 --> LLVM[process-ios-native-coverage.js]
    LLVM --> I2[coverage/ios-native/lcov.info]
  end
  J2 --> C[Codecov]
  T2 --> C
  AX --> C
  I2 --> C
```

# Unit coverage (Jest)

```bash
yarn tests:jest-coverage
```

- Jest + `coverageProvider: "babel"` (Istanbul), **not** NYC.
- Scope: `packages/**/__tests__/**` (`jest.config.js`).
- Output: `coverage/lcov.info` at repo root.
- Instruments `packages/*/lib/**` directly — no source-map remap.

# E2e TypeScript coverage (Jet + NYC)

Commands: [e2e runbook](running-e2e.md) (`tests:<platform>:test-cover`).

| Platform | Script | Notes |
|----------|--------|-------|
| macOS | `tests:macos:test-cover` | Jet only |
| iOS | `tests:ios:test-cover` | Detox → Jet `--coverage` |
| Android | `tests:android:test-cover` | Detox → Jet `--coverage` |

Jet self-wraps under NYC when `--coverage` is passed.

**Tooling:**

- Metro bundles `packages/*/dist/module/**` with inline source maps (`tests/.babelrc`: `useInlineSourceMaps: true`).
- NYC (`tests/nyc.config.js`) remaps to `packages/*/lib/**` → **`coverage/lcov.info`** (`cwd: '..'`).
- Jet re-invokes under `tests/node_modules/.bin/nyc` (checks `NYC_CONFIG`). Detox/macOS need no extra `nyc` prefix; Jet must run from `tests/`.
- **Transfer:** Patched Jet/mocha-remote WebSocket path (`coverage-ready` → `pull-coverage` → `coverage-data` → `coverage-ack`); HTTP POST failed on ~4.5MB+ payloads. Patches: `.yarn/patches/` (`jet`, `mocha-remote-client`, `mocha-remote-server`). Server assigns client before `connection`, sends `pull-coverage` when runner active; client retries with `readyState` logging. See [iOS issues 6–6b](../ci-workflows/ios.md#6-jet-websocket-disconnect-1006--1001), [issue 8](../ci-workflows/ios.md#8-coverage-teardown-handshake-failure-tests-pass-nyc-00).

**NYC settings:**

```javascript
include: ['packages/*/lib/**/*.{js,ts,tsx}', 'packages/*/dist/**/*.js'],
sourceMap: true, 'exclude-after-remap': true, instrument: false,
reporter: ['lcov', 'html', 'text-summary'],
```

**Verify:** `[jet-coverage] WS received N file(s)` + NYC summary; `coverage/lcov.info` has `SF:packages/...` not just `dist/`.

# E2e Android native (Jacoco)

1. `testCoverageEnabled` on RNFB modules (`tests/android/build.gradle`).
2. Jet `after` in `tests/app.js` → `NativeModules.RNFBTestingCoverage.flush()` in **app** process → `coverage.ec` in `filesDir` **before** Detox SIGINT.
3. After Detox: `yarn tests:android:post-e2e-coverage` (or `pull-native-coverage`) → `emulator_coverage.ec` → `jacocoAndroidTestReport`. Missing file: warning, not test/CI fail (`continue-on-error` on Codecov upload).
4. XML: `tests/android/app/build/reports/jacoco/jacocoAndroidTestReport/jacocoAndroidTestReport.xml`

**Why app-process flush:** Detox SIGINT kills instrumentation right after Jet ends; post-`Detox.runTests()` dump in `DetoxTest.java` never runs.

**Jacoco notes:**

- AGP 8 classes: `build/intermediates/javac/debug/compileDebugJavaWithJavac/classes`
- Sources: include `src/reactnative/java`
- Modules: `rootProject.ext.firebaseModulePaths` (`tests/android/build.gradle`)
- Tasks in `tests/android/app/jacoco.gradle`: `jacocoAndroidTestReport` (e2e `**/*.ec`, CI uses this), `jacocoUnitTestReport` (`**/*.exec`), `jacocoTestReport` (merged)

# E2e iOS native (LLVM)

1. **Build:** LLVM flags in **`tests/ios/Podfile` `post_install`** (`pod install` after checkout):
   - **`testing` target:** compile + link profile flags + Swift toolchain search paths (Firebase static pods on CI)
   - **`RNFB*` pods:** compile-only flags — **no** `-fprofile-instr-generate` on pod `OTHER_LDFLAGS` (breaks `swiftCompatibility56` on CI)
2. **Runtime:** `RNFBTestingConfigureCoverageProfilePath()` at launch → `Documents/coverage.profraw`. Jet `after` → `RNFBTestingCoverage.flush()`. **No custom URL scheme** (iOS "Open in 'testing'?" dialog blocks Detox).
3. **Pull:** Jet exit 0 → `pull-native-coverage.js` → `simulator_coverage.profraw`. **Fails if missing.** Pull on Jet `close`, not `afterAll` (before Detox teardown).
4. **Export:** `yarn tests:ios:test:process-coverage` / `process-ios-native-coverage.js`:
   - exit **1** if no `.profraw`
   - merge from `tests/ios/build/output/coverage/` (+ optional `Build/ProfileData/` for `xcodebuild test`, unused by Detox)
   - `xcrun llvm-cov export -format=lcov` vs app binary → temp file (stdout buffer limit)
   - rewrite `SF:` to repo-relative `packages/**` → **`coverage/ios-native/lcov.info`**
   - **delete processed `.profraw`** (missing file next run = no fresh coverage)

ObjC + Swift share this pipeline. Raw export is mostly Pods/SDK; ~50–60 `packages/*/ios/**` files in a healthy full run among ~2000 entries.

**CocoaPods → SPM:** move same flags to SPM targets; post-test script unchanged.

# Codecov uploads (CI)

[codecov-action](https://github.com/codecov/codecov-action) v7, explicit `files` + `flags`. Steps `continue-on-error: true`; **blocking** = GitHub status checks in `codecov.yml`.

## Flags

Names must match in **`codecov.yml`** and workflow `flags:`.

| Flag | Workflow | File | Blocks PR? |
|------|----------|------|------------|
| `jest` | `tests_jest.yml` | `coverage/lcov.info` | No |
| `e2e-ts-ios` | `tests_e2e_ios.yml` (debug) | `coverage/lcov.info` | No |
| `ios-native` | `tests_e2e_ios.yml` (debug) | `coverage/ios-native/lcov.info` | **Yes** |
| `e2e-ts-android` | `tests_e2e_android.yml` | `coverage/lcov.info` | No |
| `android-native` | `tests_e2e_android.yml` | Jacoco XML path below | **Yes** |
| `e2e-ts-macos` | `tests_e2e_other.yml` | `coverage/lcov.info` | No |

iOS release legs: no upload. macOS: TS only.

## Native gates

`carryforward: false`, `target: 1%` — gates **upload presence**, not % regression. Missing upload → 0% → fail. `codecov/project` overall: `informational: true`.

## CI steps before upload

| Workflow | Steps |
|----------|-------|
| `tests_jest.yml` | `yarn tests:jest-coverage` |
| `tests_e2e_ios.yml` (debug) | Detox → `yarn tests:ios:test:process-coverage` (`continue-on-error: true` for now) |
| `tests_e2e_android.yml` | Detox → `yarn tests:android:post-e2e-coverage` |
| `tests_e2e_other.yml` | macOS Jet e2e |

**Paths:** JS `coverage/lcov.info`; iOS native `coverage/ios-native/lcov.info`; Android `tests/android/app/build/reports/jacoco/jacocoAndroidTestReport/jacocoAndroidTestReport.xml`. Uploads tab: **Processed** = good; **Unusable** = fix format/paths.

# Local iteration

E2e per [runbook](running-e2e.md), then native post-processing:

```bash
yarn tests:ios:test:process-coverage
yarn tests:android:post-e2e-coverage
```

Optional Codecov CLI:

```bash
.codecov-venv/bin/codecovcli upload-process \
  -t "$CODECOV_TOKEN" -r invertase/react-native-firebase \
  --git-service github -C "$(git rev-parse HEAD)" -B "$(git branch --show-current)" \
  -f coverage/ios-native/lcov.info -n local-ios-native --disable-search
```

No `:test-cover-reuse` / `:test-reuse` — stale native risk ([runbook](running-e2e.md)).

# Critical invariants

| Invariant | Enforced |
|-----------|----------|
| LLVM profile flags (iOS) | `Podfile` `post_install` |
| Profile path at launch (iOS) | `AppDelegate` → `RNFBTestingConfigureCoverageProfilePath()` |
| Jacoco instrumentation (Android) | `testCoverageEnabled` in `tests/android/build.gradle` |
| Module name | `RNFBTestingCoverage` / `NativeModules.RNFBTestingCoverage` in `tests/app.js` |
| Flush after Mocha | Jet `after` in `tests/app.js` |
| Profraw pull before Detox teardown (iOS) | `pull-native-coverage.js` on Jet `close` in `firebase.test.js` |
| Android ec pull after Detox | `yarn tests:android:post-e2e-coverage` |
| Fresh profraw processed (iOS) | `process-ios-native-coverage.js` deletes after export |

# Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Open in 'testing'?" dialog | Custom URL scheme | Native module flush only |
| No profraw; test passes | Pull in `afterAll` after cleanup, wrong module name | Pull on Jet `close`; verify export name |
| Stale profraw uploaded | Re-process without re-e2e | Process deletes profraw; exit 1 if missing next time |
| No `packages/` hits in iOS export | Wrong binary / not instrumented | `yarn tests:ios:build`; check Podfile |
| Empty Jacoco XML (~235 B) | AGP 8 path, missing `src/reactnative/java`, no ec | Check post-e2e logs |
| Android ec missing after pass | SIGINT before flush | `[native-coverage] flushing android coverage` in log; `MainApplication` registration |
| Jet after: coverage not enabled | Release / non-instrumented build | Use `:test-cover` debug builds |
| `swiftCompatibility56` undefined | Profile link flags on all Pods | App target only for `OTHER_LDFLAGS` |
| No `[jet-coverage] WS received` | Patches missing | `yarn install`; `.yarn/patches/` |
| WS closed on `reconnect_recovered` | Handshake on dead socket | Client retry + server pull; `JET_COVERAGE_TEARDOWN_RE` — [iOS issue 8](../ci-workflows/ios.md#8-coverage-teardown-handshake-failure-tests-pass-nyc-00) |
| Empty NYC / lcov | Jet not from `tests/` cwd | Detox spawns `yarn jet` in `tests/` |
| Codecov missing iOS native | Wrong path/name | `coverage/ios-native/lcov.info` |
| Upload **Unusable** | Bad `SF:` paths | `process-ios-native-coverage.js` rewrite |
| `ios-native` / `android-native` fail | Upload missing → 0% | Uploads tab; process/post-e2e steps |

# Future cleanups

- Drop `continue-on-error: true` on iOS process-coverage CI step when stable.

# Citations

[1] [OKF spec](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) · [2] [Codecov CLI](https://docs.codecov.com/docs/the-codecov-cli)
