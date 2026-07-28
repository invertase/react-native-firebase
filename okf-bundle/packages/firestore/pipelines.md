---
type: Reference
title: Firestore Pipelines implementation design
description: Architecture, bridge coercion, emulator setup, and e2e-driven native coverage for RNFB Firestore Pipelines.
tags: [firestore, pipelines, e2e, ios, android, coverage]
timestamp: 2026-06-22T00:00:00Z
---

# ELI5 overview

JS defines a pipeline; RNFB serializes it for native Firestore (Swift/Java), which executes it:

1. **Serialize** — JS turns the pipeline into a plain JSON tree for the bridge.
2. **Parse + build** — native reads JSON and rebuilds Firebase `Pipeline` / expression objects.
3. **Execute** — native runs against the cloud `pipelines-e2e` Enterprise database and returns JSON results.

A **subquery** embeds an inner pipeline as **`PipelineValue`** inside `scalar`/`array`. **Rule:** parser pass 1 treats `PipelineValue` as opaque; pass 2 hands it to `parsePipelineMap`. Never expression-walk it; aggregates use `kind`, not `name`.

# Overview

```mermaid
flowchart LR
  JS["packages/firestore/lib/pipelines/*.ts"] --> SER["serialize() / pipelineExecute()"]
  SER --> BRIDGE["RN bridge NSDictionary args"]
  BRIDGE --> PARSER["RNFBFirestorePipelineParser (Swift / Java)"]
  PARSER --> BUILDER["RNFBFirestorePipelineNodeBuilder"]
  BUILDER --> FACTORY["RNFBFirestorePipelineBridgeFactory"]
  FACTORY --> SDK["Firebase Firestore Pipeline SDK"]
```

**Coverage strategy:** native pipeline code is exercised through **Detox/Jet e2e** (`Pipeline.e2e.js`), not standalone XCTest/JUnit. See [Coverage design](/testing/coverage-design.md).

# Backend: cloud Enterprise, not the local emulator

Pipeline `execute()` requires **Firestore Enterprise**; local emulator is Standard.

| Database | Emulator in `tests/app.js`? | Used for |
|----------|----------------------------|----------|
| `(default)` | Yes (`:8080`) | Regular Firestore e2e |
| `second-rnfb` | Yes | Second-database e2e |
| **`pipelines-e2e`** | **No** | **Pipeline e2e only** (cloud Enterprise) |

CI uses emulator for standard products; **pipeline execute hits cloud**.

### Emulator status (2026)

Enterprise emulator mode exists but RNFB does **not** use it; cloud is authoritative, including vector `findNearest`.

### Why `pipelines-e2e` has its own rules and indexes (cloud deploy split)

Emulator multi-DB/rules behavior broke Standard Firestore security-rules e2e when mixed with Enterprise pipeline work. **Resolution:** `pipelines-e2e` is cloud-only for execute/rules/indexes.

| Database | Rules file | Indexes file | Emulator | Cloud deploy |
|----------|------------|--------------|----------|--------------|
| `(default)` | `firestore.rules` | `firestore.indexes.json` | Yes | Yes |
| `second-rnfb` | *(same `firestore.rules`, `database == "second-rnfb"` guards)* | *(none in repo)* | Yes | No `firebase.json` entry |
| **`pipelines-e2e`** | **`firestore.pipelines-e2e.rules`** | **`firestore.pipelines-e2e.indexes.json`** | **No** | **Yes** |

Vector indexes live in **`firestore.pipelines-e2e.indexes.json`** only. Do **not** `connectFirestoreEmulator(..., 'pipelines-e2e')` without an Enterprise-emulator migration.

**Deploy/sync:** [Firebase testing project](/testing/firebase-testing-project.md#cloud-project-deploy-rules-and-indexes) — `./sync-firestore-indexes.sh`, `./deploy-firestore.sh`.

# JavaScript layer

* Expression helpers build plain JSON-serializable trees; `execute()` sends serialized pipeline to native.
* `pipeline_support.ts` — shared source/stage type lists and unsupported-message helper for native fallback paths.

# Native layer

`RNFBFirestorePipelineNodeBuilder` coerces bridge types, separates literal/expression slots, and builds `ExprBridge` / stage bridges.

# Nested pipelines / subqueries

## JS shape

* `subcollection(path)` → detached pipeline (no Firestore instance; direct `execute()` throws).
* `.toScalarExpression()` / `.toArrayExpression()` → `PipelineValue` wrapped in `scalar`/`array` function node.
* Aggregates: `{ exprType: 'AggregateFunction', kind: 'countAll', … }` — discriminant is **`kind`**, not `name`.

## Native round-trip (two-pass)

1. **Parser** — bridge map → typed nodes.
2. **Node builder** — typed nodes → raw map → `expressionLoop` → SDK bridges. Nested pipelines: `extractNestedPipelineMap` → `parsePipelineMap` ( understands aggregate `kind`).

```mermaid
flowchart TB
  RAW["scalar(args:[PipelineValue])"] --> P1["Parser pass 1"]
  P1 -->|PipelineValue OPAQUE| P2["NodeBuilder pass 2"]
  P2 --> NESTED["parsePipelineMap → parseAggregateStage"]
```

## Decision: `PipelineValue` opaque in parser pass 1

**Why:** Expression-walking `PipelineValue` reaches `AggregateFunction` nodes (`kind`, not `name`). Unhandled `exprType` + `isExpressionLike` causes **`valueEnter`↔`expressionEnter` infinite loop**; confirm hang with `sample <pid>`.

**Fix:** pass 1 stores `PipelineValue` raw; pass 2 re-parses via `parsePipelineMap`. Jest `.serialize()` does **not** catch this; need native e2e or sampled run.

**Guard rails:**

* Never route `PipelineValue` through the generic expression/value walker.
* New `exprType` without an explicit handler → opaque or explicit branch (unhandled + `isExpressionLike` = loop, not error).
* Aggregates → `parseAggregateStage` only; scalars/booleans → `name`.
* Regression: `pipelines-pathological.test.ts` (JS); e2e `describe('pathological subqueries and recursion')` — **111 iOS/Android, 106 macOS** after fixes.

> **`toArrayExpression` shape:** single-field `select()` in an array subquery returns **scalar values** — e.g. `[3, 4, 5]`, not `[{rating:3}, …]`.

# Iterative algorithms vs recursion

## Decision: native parsers use work-list state machines

Swift lacks reliable TCO; JVM stacks are bounded. Heap frame stacks bound depth by heap, not call stack.

**Exception:** `buildNestedPipelineSubquery` re-enters `parsePipelineMap` once per subquery nesting level — fine in practice; only absurd subquery depth grows the native stack.

**Guard rail:** never reintroduce recursive expression/value traversal in native parsers.

## JS tree walks — lessons (fixed 2026-06)

Probes: `packages/firestore/__tests__/pipelines-pathological.test.ts`.

| Issue | Cause | Threshold / fix |
|-------|-------|-----------------|
| Deep expression tree walks | `args` visited explicitly **and** via `Object.values` → **O(2^depth)** | Prefer single-visit iterative work-lists |
| Recursive tree walks | Recursive walk on generated depth | **Iterative work-list** for attacker/generator-controlled depth |
| `serializeValue` still recursive | Runs every `execute()` | ~**5000** depth in Node (less Hermes) before `RangeError`; backend rejects deep nesting — **low urgency** |

**Guard rails:** visit each tree property once; prefer work-lists for attacker/generator-controlled depth.

### DEFERRED: `serializeValue` work-list conversion

Convert `serializeValue` to iterative if deep generated pipelines matter. Preserve `WeakSet`; add friendly "too deeply nested" error.

# Two expression builders per platform — edit the live one

Each platform has a **live** execute-time lowering path and a dormant sibling.

| Platform | Live path | Dormant path |
|----------|-----------|--------------|
| iOS | `coerceExpressionTree` (iterative) | Recursive cluster — **removed ~117 lines** (0% coverage) |
| Android | `EnterObjectExpressionFrame` → `scheduleExpressionFunctionLowering` | `buildExpressionFunctionFromParsedArgs` + `coerceExpressionValueNode` — **interwoven; confirm with coverage before delete** |

**Lesson:** Android `scalar`/`array` were implemented only on dormant path; live path treated `array` as literal and ignored `scalar` until `scheduleExpressionFunctionLowering` gained nested-pipeline handling.

**Guard rails:**

* Change the path that runs at `execute()` — dormant-path cases are a trap.
* **Coverage disambiguates** live vs dormant (0% block = suspect dormant code).
* e2e must run on **all three platforms**; iOS-only green hid the Android subquery gap.

# Native coverage baselines (2026-06)

From `tests:<platform>:test-cover` + post-processing; refresh with `bash scripts/map-pipeline-coverage-gaps.sh <label>`:

Use e2e coverage to distinguish live paths from dormant lowering code; current numbers/deltas live in [work queue](pipeline-coverage-work-queue.md#current-snapshot).

### Native coverage gap map

Live-path holes concentrate in **expression lowering** and **stage coercion**, not dormant parsed-node clusters. Remaining high-value gaps:

- **Android:** expression-frame lowering, parsed aggregate tails, executor branches.
- **iOS:** stage coercion, operand modes, map passthrough success paths.
- **TS:** runtime/validation branches reachable by direct Jest or e2e tamper tests.

Quantified tables/priorities: [work queue](pipeline-coverage-work-queue.md). Script: `bash scripts/map-pipeline-coverage-gaps.sh <label>`.

### Native coverage — live-path gap inventory

Durable inventory of where live-path holes concentrate (live status and quantified baselines belong in the [work queue](pipeline-coverage-work-queue.md), not here):

1. **E2e per live-but-untested operator/stage** in `coerceExpressionTree` (iOS) and live Android lowering, plus remaining executor error branches.
2. **Android parsed-aggregate tail** — partially live (`coerceAliasedAggregate` from Executor); target with e2e, not deletion.

Completion standard: [coverage expectations](/testing/coverage-design.md#coverage-expectations-policy) — touched sources reach 100% or an evidence-backed intractable limit; no cost/convenience deferral.

**Compare-types exports:** tracked separately from coverage expansion ([work queue](pipeline-coverage-work-queue.md)).

# Integer / boolean coercion (iOS bridge)

RN delivers JS booleans as `CFBoolean` `NSNumber`; integers also `NSNumber`, so `0`/`1` and bools collide.

**Decision — `scalarConstantBridge` check order:**

1. Swift `Bool` → bool constant
2. `NSNumber` + `CFBooleanGetTypeID()` → bool **before** integer coercion
3. `wholeNumberInt` (non-bool) → int
4. Swift `Int` → int
5. Fallback (string, double, nested)

`xor` / `nor` / `count_if` use boolean-expression coercion like `and`/`or`.

**E2e mitigation:** avoid ambiguous `constant(0)`/`constant(1)` in heterogeneous `array([…])`; use `constant(2+)` or non-numeric sentinel. Integer tagging deferred.

# E2e environment

* Database: **`pipelines-e2e`** (`DATABASE_ID` in `Pipeline.e2e.js`); random collection suffixes; **no** `helpers.wipe()` (emulator REST only).
* CI: emulator for Standard modules; `Pipeline.e2e.js` execute → cloud. Commands: [Running e2e tests](/testing/running-e2e.md).

# Platform parity

Cross-platform behavior is co-equal with coverage. Differences must be documented SDK limitations or closed bridge fixes, not silent e2e workarounds.

| Topic | Document |
|-------|----------|
| Parity policy, drift registry | [Pipeline platform parity](pipeline-platform-parity.md) |
| SDK unsupported-function audit (repeatable) | [Pipeline SDK support audit](pipeline-sdk-support-audit.md) |
| Coverage + parity work queue | [pipeline-coverage-work-queue.md](pipeline-coverage-work-queue.md) |

# iOS platform gaps (SDK / API)

Native bridge lowering gaps and SDK-only limitations are tracked in [Pipeline platform parity](pipeline-platform-parity.md) (P-013–P-015 and bridge rows). There is no JS pre-execute function blocklist on iOS.

# Measuring native coverage

[Running e2e tests](/testing/running-e2e.md); compare-types snapshots: [Pipeline implementation workflow](pipeline-implementation-workflow.md), [Coverage design](/testing/coverage-design.md#coverage-as-completion-signal).
