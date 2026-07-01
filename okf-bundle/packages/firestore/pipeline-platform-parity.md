---
type: Reference
title: Firestore Pipelines platform parity
description: Policy, drift inventory, and triage for cross-platform pipeline behavior (iOS, Android, macOS JS).
tags: [firestore, pipelines, ios, android, macos, parity, e2e]
timestamp: 2026-06-25T00:00:00Z
---

# Platform parity policy

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md).

Completion signals:

1. **Parity** — same behavior across platforms unless native Firestore SDK limitation; audit/remediate before coverage work.
2. **Coverage** — touched TS/native coverage rises until intractable limits after parity drift is triaged.

| Outcome | Action |
|---------|--------|
| Same behavior on iOS, Android, macOS (JS SDK) | Required default — shared e2e assertions, no `Platform.*` branches unless macOS has no native bridge |
| RNFB bridge gap (one platform lowers/coerces differently) | **Fix the bridge** — parity remediation ([work queue](pipeline-coverage-work-queue.md)) |
| Native SDK does not support the feature | Document here with SDK version/evidence; optional reduced e2e on that platform only |
| macOS-only path (firebase-js-sdk, no RN bridge) | Document; use `Platform.other` skip when the test requires native-only wire shapes |

No permanent `Platform.android` / `Platform.ios` e2e workaround without registry entry.

# Drift registry

**Status:** drift audit complete. `Pipeline.e2e.js`: 31 `Platform.*` sites; 5 bridge gaps; remainder SDK / macOS-js / test-only. Live order: [work queue](pipeline-coverage-work-queue.md).

**Classification key:** `bridge` | `SDK` | `macOS-js` | `test-only` | `RNFB-JS`

---

## Bridge gaps (must fix)

| ID | Area | Symptom | iOS | Android | macOS | E2e hook (`Pipeline.e2e.js`) | Remediation order |
|----|------|---------|-----|---------|-------|------------------------------|-------------------|
| **P-005** | `integerLiteral` wire tag | `constant()` integers emit `integerLiteral: true`; iOS NodeBuilder bool→0/1 before int | Consumes tag in `scalarConstantBridge` | `unwrapConstantValue` returns raw value; no tag handling | N/A | L3533–3559 (indirect); no wire assert | **1** |
| **P-010** | Stage option expression fields | Expression-valued `distanceField` / `indexField` | Parsed/coerced as expression | Parser `optionalString` only; executor `withDistanceField(String)` | Skipped (L3902+) | L3795–3845 (Android-only source rawOptions); findNearest/unnest paths | **2** |
| **P-011** | Parser constant envelope routing | `{ exprType: "constant", value: … }` in value context | `isExpressionLike` true for any `exprType` | `isExpressionLike` excludes `"constant"` — descends as literal map | Same wire | Nested constants (e.g. ref maps) | **3** |
| **P-012** | `timestampTruncate` arity validation | Validates arg count; throws | Sets `box.value = null` when `args.size() != 2` | Same | L3292–3294 (macOS vacuous) | **4** |

**After P-001 closure:** **P-034** may still trim remaining operand-mode `Platform.*` branches elsewhere in `Pipeline.e2e.js`.

---

## SDK / platform API gaps (document — update after runtime verification)

| ID | Area | Symptom | Justification | E2e |
|----|------|---------|---------------|-----|
| **P-013** | iOS extended aggregate accumulators | `first`/`last`/`minimum`/`maximum` with expression args skipped on iOS only (L3740) | **Likely iOS SDK** — functions not in unsupported list; needs SDK repro; document until confirmed | L3740–3790 |
| **P-014** | Execute `indexMode` / `rawOptions` on iOS | iOS parser rejects at native boundary | iOS SDK gap | L3796–3798 skip (iOS + macOS) |
| **P-015** | Source `rawOptions` on iOS | iOS parser rejects `pipeline.source.rawOptions` | iOS SDK gap; Android applies `CollectionHints` | L3795–3845 (Android-only execute) |

---

## RNFB JS policy (document or narrow during remediation)

| ID | Area | Symptom | Justification | E2e |
|----|------|---------|---------------|-----|
| **P-016** | Execute-options JS gate | `validateExecuteOptions` rejects **all** `indexMode` / `rawOptions` on every platform | RNFB stability choice; JSDoc says “Android and web only” but JS blocks Android too | L588–617 (all platforms) |
| **P-017** | Aliased-expression wire shape | Flat `{ path, alias, as }` + duplicate `as` for simple fields | Universal serialization for native bridges — not platform-branched | Indirect (web rehydration) |

---

## macOS-js (no native RN bridge — expected skips)

| ID | Area | E2e lines | Behavior |
|----|------|-----------|----------|
| **P-004** | Raw AND where filters | L3387–3389 | Vacuous pass on macOS; native iOS/Android only |
| **P-018** | Constant-wrapped array lowering | L3236–3246 | Reduced select on macOS |
| **P-019** | Map passthrough lowering | L3266–3268 | Vacuous pass |
| **P-020** | `timestampTruncate` arity validation | L3292–3294 | Vacuous pass |
| **P-021** | Operand-mode equality subset | L3511–3530 | Reduced select (4 fields); mirrors Android reduced path |
| **P-022** | Raw where operand-mode | L3626–3628 | Vacuous pass |
| **P-023** | Source rawOptions / index hints | L3796–3798 | Vacuous pass (with iOS) |
| **P-024** | findNearest execute | L3902–3904 | Vacuous pass |
| **P-025** | unnest options-object | L3954–3956 | Vacuous pass |
| **P-026** | findNearest validation | L4011–4013 | Vacuous pass |
| **P-027** | empty addFields/removeFields | L4047–4049 | Vacuous pass |
| **P-028** | findNearest DOTPRODUCT alias | L4073–4075 | Vacuous pass |

**macOS count note:** lower macOS total is app `utils*` registration, not Pipeline drift. Pipeline tests register on every platform; some macOS passes are vacuous (table).

---

## Architecture drift (document-only)

| ID | Note |
|----|------|
| **P-029** | Android receiver-chain / deferred-unary lowering vs iOS direct `coerceExpressionTree` — no known e2e split |
| **P-030** | iOS-only builder features: `xor`/`nor`, `pipelinevalue` direct build, `.condition` boolean unwrap — low traffic |
| **P-031** | iOS `rawStage` skip (L3981) + iOS index-hint skip (L3796) — align with P-014/P-015 SDK gaps |

---

# Platform drift audit summary (2026-06-25)

| Source | Finding |
|--------|---------|
| E2e inventory (`Pipeline.e2e.js`) | 31 `Platform.*` branch sites; macOS vs iOS/Android total count delta is app harness only (see P-006) |
| Native bridge diff (Swift vs Java NodeBuilder/Parser) | Primary drift in NodeBuilder coercion; secondary in Parser + stage fields |
| JS guards audit (`pipeline_validate.ts` / `pipeline_runtime.ts`) | Execute-options JS gate on all platforms; no iOS function-name pre-execute block |
| [SDK support audit](pipeline-sdk-support-audit.md) | Pins iOS 12.15 / Android 34.15; bridge + runtime e2e verification |

# Parity remediation workflow

For each **bridge** row:

1. Implement native parity (prefer matching iOS / strictest correct behavior).
2. Remove e2e `Platform.*` workarounds; use one shared assertion block.
3. Run 3-platform e2e ([running-e2e.md](/testing/running-e2e.md)).
4. Record closure in **Resolved** below.

**Gate:** expand coverage only after bridge gaps + iOS guard verification close; see [work queue](pipeline-coverage-work-queue.md).

# Resolved

| ID | Fix | Verified |
|----|-----|----------|
| **P-001** | Android NodeBuilder: `ExpressionCoercionMode` with numeric/comparison operand constant lowering aligned with iOS `coerceExpressionTree`; unified cross-platform operand-mode e2e (ordering/arithmetic RHS and raw-where bool coercion). **Remainder:** wire `COMPARISON_OPERAND` at non-ordering comparison call sites on Android. | 3-platform `Pipeline.e2e.js` |
| P-002 | Android parser/node-builder: `{ path: "col/doc" }` reference constants no longer treated as field paths | Verified on Android e2e after parser fix |
| P-006 | MacOS e2e count delta | **Closed** — app `utils*` tests are skipped by platform; Pipeline registration is not the cause |
