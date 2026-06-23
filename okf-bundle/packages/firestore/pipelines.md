---
type: Reference
title: Firestore Pipelines implementation design
description: Architecture, bridge coercion, emulator setup, and e2e-driven native coverage for RNFB Firestore Pipelines.
tags: [firestore, pipelines, e2e, ios, android, coverage]
timestamp: 2026-06-22T00:00:00Z
---

# Overview

Firestore Pipelines in RNFB mirror the firebase-js-sdk modular `pipelines` API. User code builds a pipeline in JavaScript; execution crosses the React Native bridge; native code constructs Firebase `Pipeline` objects and runs them against Firestore.

```mermaid
flowchart LR
  JS["packages/firestore/lib/pipelines/*.ts"] --> SER["serialize() / pipelineExecute()"]
  SER --> BRIDGE["RN bridge NSDictionary args"]
  BRIDGE --> PARSER["RNFBFirestorePipelineParser (Swift / Java)"]
  PARSER --> BUILDER["RNFBFirestorePipelineNodeBuilder"]
  BUILDER --> FACTORY["RNFBFirestorePipelineBridgeFactory"]
  FACTORY --> SDK["Firebase Firestore Pipeline SDK"]
```

**Coverage strategy:** Native Swift/Java for pipeline node building is exercised through **Detox/Jet e2e** (`Pipeline.e2e.js`), not standalone XCTest/JUnit suites. iOS profraw is pulled after each Jet run (including failures) and merged via `process-ios-native-coverage.js`. See also [Coverage design](/testing/coverage-design.md).

# Backend: cloud Enterprise, not the local emulator

Pipeline `execute()` requires **Firestore Enterprise edition**. The local emulator used by RNFB e2e (`yarn tests:emulator:start`) is configured as **Standard** edition and does not faithfully run pipeline queries.

| Database | Emulator connected in `tests/app.js`? | Used for |
|----------|--------------------------------------|----------|
| `(default)` | Yes (`localhost:8080`) | Regular Firestore e2e |
| `second-rnfb` | Yes | Second-database e2e |
| **`pipelines-e2e`** | **No — intentionally omitted** | **Pipeline e2e only** |

On `main`, `tests/app.js` calls `connectFirestoreEmulator` only for `(default)` and `second-rnfb`. `Pipeline.e2e.js` uses `getFirestore('pipelines-e2e')`, which therefore talks to the **live** `pipelines-e2e` database on the `react-native-firebase-testing` Firebase project (Enterprise), not the emulator.

Evidence in-repo:

* `tests/local-tests/firestore/pipelines-e2e.tsx` — comment: *"default database does not seem to work"*; manual harness uses `getFirestore('pipelines-e2e')` against cloud.
* Pipelines are an Enterprise-only API; Standard `(default)` databases reject pipeline execute.

CI still starts the Firestore emulator for auth/database/functions/storage and for regular Firestore e2e, but **pipeline integration tests are cloud-backed**. They need network access to Google APIs during Detox/Jet runs.

### Emulator status (2026)

The Firestore emulator has **partial** Enterprise/pipeline support when started with `"edition": "enterprise"` in `firebase.json` (`firestore.edition` or `emulators.firestore.edition`). RNFB does **not** configure this today. Even with Enterprise emulator mode, coverage is incomplete (vector `findNearest`, some stages) compared to cloud.

Do **not** add `connectFirestoreEmulator(..., 'pipelines-e2e')` unless deliberately migrating pipeline e2e to an Enterprise emulator setup — doing so breaks tests that expect the cloud `pipelines-e2e` database.

### Vector indexes / `findNearest`

Vector indexes belong in **`firestore.pipelines-e2e.indexes.json`** (`vectorConfig` with `dimension` + `flat`), **not** in security rules. Example in repo under `.github/workflows/scripts/`. Deploy with `./deploy-firestore.sh` after editing.

### Cloud rules and indexes (operator summary)

See [Firebase testing project and emulator setup](/testing/firebase-testing-project.md) for the full map (emulator ports, database matrix, CI, pitfalls). Scripts live in `.github/workflows/scripts/`:

* `./sync-firestore-indexes.sh` — pull indexes from cloud into repo
* `./deploy-firestore.sh` — push rules + indexes to `react-native-firebase-testing`

# JavaScript layer

* Expression helpers (`field`, `constant`, `add`, `map`, `array`, aggregates, etc.) build plain JSON-serializable trees.
* `pipeline().collection(…).select(…)` produces a `Pipeline` object; `execute()` sends the serialized pipeline to native.
* `packages/firestore/lib/pipelines/pipeline_support.ts` lists **iOS-unsupported** function names validated before execute (e.g. `arrayGet`, `conditional`) so e2e can assert clear errors.

# Native layer (iOS)

`RNFBFirestorePipelineNodeBuilder.swift` walks serialized expression nodes and produces `ExprBridge` / stage bridges consumed by `RNFBFirestorePipelineBridgeFactory.swift`.

Key responsibilities:

1. **Type coercion** — bridge values arrive as `NSDictionary`, `NSArray`, `NSString`, `NSNumber`, etc.
2. **Literal vs expression** — integer positions (offsets, counts) use `tryIntegerLiteral`; expression slots use `scalarConstantBridge` or expression frames.
3. **Boolean expressions** — `and` / `or` / `xor` / `nor` and aggregate predicates (`count_if`) coerce args through `.booleanExpression` paths.

# Integer / boolean coercion

## Problem

On iOS, React Native often delivers JavaScript booleans as `NSNumber` backed by `CFBoolean` (`kCFBooleanTrue` / `kCFBooleanFalse`). The same bridge also carries integers as `NSNumber`. Without care, `0`/`1` literals and booleans are indistinguishable at the `NSNumber` layer, and whole-number coercion can turn booleans into `0`/`1` or vice versa.

## `scalarConstantBridge` (constants and inline literals)

Order of checks in `RNFBFirestorePipelineNodeBuilder.swift`:

1. Swift `Bool` → `ConstantBridge(bool)`
2. `NSNumber` with `CFGetTypeID == CFBooleanGetTypeID()` → `ConstantBridge(boolValue)` **before** integer coercion
3. `NSNumber` passing `wholeNumberInt` (non-boolean, finite integer) → `ConstantBridge(int)`
4. Swift `Int` → `ConstantBridge(int)`
5. Fallback → `ConstantBridge(value)` (strings, doubles, nested structures)

## `wholeNumberInt`

Returns `nil` for boolean `NSNumber` instances so they never become `0`/`1` integers.

## Boolean expression operators

`xor`, `nor`, and `count_if` use the same boolean-expression coercion as `and`/`or` (not generic expression coercion).

## E2e implications

| Scenario | Risk | Mitigation in tests |
|----------|------|---------------------|
| `constant(true)` / `constant(false)` in `mapSet` | Must stay boolean | Assertions on `updated: true`, `disabled: false` |
| `constant(0)` / `constant(1)` inside **heterogeneous `array([…])` literals** | May still surface as bool on some bridge paths | Tier-1 mixed-literal test uses `constant('tail')` instead of `constant(0)` to validate the array-literal code path without ambiguous scalars |
| `constant(1)` in `map({ version: constant(1) })` | Map literal path preserves integers | Covered separately in map literal test |
| Document field booleans (`field('flagA')`) | Read from Firestore, not bridge constants | Safe |

**Alternatives considered for ambiguous numeric constants:**

1. Tag numeric constants in JS serialization (e.g. explicit `integerValue` discriminant) — most robust, larger API/serialization change.
2. Use `field('docField')` instead of `constant(n)` in arrays — couples literal tests to fixture data.
3. Restrict integer literal tests to `map({ … })` only — leaves `array([…])` builder less covered.
4. Further native heuristics — fragile; bool fix already uses `CFBooleanGetTypeID`.

String constants were chosen in the tier-1 **array literal** test as a minimal, unambiguous scalar while still covering mixed field+constant arrays.

# E2e environment

## Dedicated cloud database

Pipeline e2e uses database id **`pipelines-e2e`** (`DATABASE_ID` in `Pipeline.e2e.js`) — a named **Enterprise** database on `react-native-firebase-testing`. It is isolated from emulator-backed `(default)` / `second-rnfb` tests.

Tests use random collection path suffixes to avoid cross-test collisions on the shared cloud database. Do not call `helpers.wipe()` against `pipelines-e2e` from e2e — that helper targets the **emulator** REST endpoint and does not flush the cloud database.

## What CI runs

* `yarn tests:emulator:start-ci` — emulator for auth, RTDB, standard Firestore, functions, storage.
* `Pipeline.e2e.js` — loaded with other Firestore e2e on `main`; pipeline execute hits **cloud** because `pipelines-e2e` is not emulator-connected.

# iOS platform gaps

Functions listed in `IOS_UNSUPPORTED_FUNCTION_NAMES` throw before native execute. E2e branches with `expectIOSUnsupportedFunctions` and runs a reduced pipeline on iOS (e.g. omit `arrayGet`).

# Measuring native coverage

```bash
yarn tests:ios:build
yarn tests:ios:test-cover-reuse
yarn tests:ios:test:process-coverage
```

`tests/e2e/firebase.test.js` pulls iOS profraw in a `finally` block so **partial coverage is retained when Jet fails**. Stale profraw from a previous successful run was a common source of misleading 0% lines on `serializeValueNode` / `buildAggregateStage`.
