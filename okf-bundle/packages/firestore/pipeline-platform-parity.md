---
type: Reference
title: Firestore Pipelines platform parity
description: Policy, drift inventory, and triage for cross-platform pipeline behavior (iOS, Android, macOS JS).
tags: [firestore, pipelines, ios, android, macos, parity, e2e]
timestamp: 2026-06-25T00:00:00Z
---

# Platform parity policy

Pipeline work has **two completion signals** (see [Coverage design](/testing/coverage-design.md)):

1. **Parity** — observable behavior is **the same across platforms** unless a difference is a **native Firestore SDK limitation** (not an RNFB bridge gap). **Audit and remediate before further coverage work** ([work queue Phase I–J](pipeline-coverage-work-queue.md)).
2. **Coverage** — file-level TS and native coverage rise until **intractable** limits (~100% where reachable), **after** parity drift is triaged and bridge gaps closed.

| Outcome | Action |
|---------|--------|
| Same behavior on iOS, Android, macOS (JS SDK) | Required default — shared e2e assertions, no `Platform.*` branches unless macOS has no native bridge |
| RNFB bridge gap (one platform lowers/coerces differently) | **Fix the bridge** — work-queue Phase **J** (remediation) |
| Native SDK does not support the feature | Document here with SDK version/evidence; optional reduced e2e on that platform only |
| macOS-only path (firebase-js-sdk, no RN bridge) | Document; use `Platform.other` skip when the test requires native-only wire shapes |

**Do not** treat e2e `Platform.android` / `Platform.ios` workarounds as permanent without an entry in the drift registry below.

# Drift registry

**Status:** Phase **I** audit complete (2026-06-25). **31** `Platform.*` branch sites in `Pipeline.e2e.js`; **5** bridge items scheduled for Phase **J**; remainder documented as SDK / macOS-js / test-only.

**Classification key:** `bridge` | `SDK` | `macOS-js` | `test-only` | `RNFB-JS`

---

## Bridge gaps (Phase J — must fix)

| ID | Area | Symptom | iOS | Android | macOS | E2e hook (`Pipeline.e2e.js`) | J priority |
|----|------|---------|-----|---------|-------|------------------------------|------------|
| **P-001** | Operand-mode / numeric coercion | Ordering and arithmetic RHS: bool/scalar coercion differs | `ExpressionCoercionMode.numericOperand` / `.comparisonOperand` in `coerceExpressionTree` | No equivalent; `applyBooleanReceiverConstant` passes raw `Boolean`; arithmetic args use expression-value path only | JS SDK (no native bridge) | L3533–3622 (iOS-only arithmetic + where leg); L3665–3667 (`value: true` vs `1`) | **J1** |
| **P-005** | `integerLiteral` wire tag | `constant()` integers emit `integerLiteral: true`; iOS NodeBuilder bool→0/1 before int | Consumes tag in `scalarConstantBridge` | `unwrapConstantValue` returns raw value; no tag handling | N/A | L3533–3559 (indirect); no wire assert | **J2** |
| **P-010** | Stage option expression fields | Expression-valued `distanceField` / `indexField` | Parsed/coerced as expression | Parser `optionalString` only; executor `withDistanceField(String)` | Skipped (L3902+) | L3795–3845 (Android-only source rawOptions); findNearest/unnest paths | **J3** |
| **P-011** | Parser constant envelope routing | `{ exprType: "constant", value: … }` in value context | `isExpressionLike` true for any `exprType` | `isExpressionLike` excludes `"constant"` — descends as literal map | Same wire | Nested constants (e.g. ref maps) | **J4** |
| **P-012** | `timestampTruncate` arity validation | Validates arg count; throws | Sets `box.value = null` when `args.size() != 2` | Same | L3292–3294 (macOS vacuous) | **J5** |

**Phase J follow-up (test-only, after J1):** **P-034** — extend Android operand-mode e2e (L3533–3579) to match iOS coverage once P-001 is fixed; remove `if (!Platform.ios) return` where-filter leg (L3581–3582).

---

## SDK / platform API gaps (document — update after Phase Ib / J0)

| ID | Area | Symptom | Justification | E2e |
|----|------|---------|---------------|-----|
| **P-003** | iOS unsupported functions | JS pre-execute throw via `IOS_UNSUPPORTED_FUNCTION_NAMES` (**8 names**; was 9) | **Under review (Ib/J0):** list likely **partially stale** vs iOS **12.15** CHANGELOG — see [sdk-support-audit](pipeline-sdk-support-audit.md). Confirmed unsupported set = **J0 runtime probes only**. `stringRepeat` **resolved J0-1**. | Reduced iOS pipelines until J0 |
| **P-003a** | *(per-function hooks)* | `round`, `conditional`, `switchOn`, `trunc`, `substring`, `arrayGet`, `timestampAdd`, `timestampSubtract` | Subset of P-003 — see [§ iOS unsupported function e2e map](#ios-unsupported-function-e2e-map) | One or more tests each |
| **P-013** | iOS extended aggregate accumulators | `first`/`last`/`minimum`/`maximum` with expression args skipped on iOS only (L3740) | **Likely iOS SDK** — functions not in unsupported list; needs SDK repro; document until confirmed | L3740–3790 |
| **P-014** | Execute `indexMode` / `rawOptions` on iOS | iOS parser rejects at native boundary | iOS SDK gap | L3796–3798 skip (iOS + macOS) |
| **P-015** | Source `rawOptions` on iOS | iOS parser rejects `pipeline.source.rawOptions` | iOS SDK gap; Android applies `CollectionHints` | L3795–3845 (Android-only execute) |

---

## RNFB JS policy (document or narrow in J)

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

**macOS test-count note:** Total e2e **141 vs 146** is **not** Pipeline drift — five `packages/app/e2e/utils*.e2e.js` tests never register on macOS (`Platform.other` at describe level). All **100** Pipeline tests register on every platform; **11** are vacuous passes on macOS (table above).

---

## iOS unsupported function e2e map

| Function | Throw asserted | Reduced iOS pipeline | Approx line | Ib status (CHANGELOG @ 12.15) |
|----------|----------------|----------------------|-------------|-------------------------------|
| `round` | Yes | Yes | L1175, L1680 | No entry — **J0-5 probe** |
| `conditional` | Yes | Yes | L1350, L3356 skip | ConditionalExpression **12.11** — **J0-4 probe** |
| `switchOn` | Yes | No reduced re-run | L1466 | **Added 12.12** — **J0-2 probe** |
| `trunc` | Yes | Yes | L1758 | **Added 12.11** — **J0-3 probe** |
| `substring` | Yes | Yes | L1891 | No entry — **J0-6 probe** |
| `stringRepeat` | — | — | L1985 | **Resolved J0-1** — `sdk-supported-bridge-ok`; guard removed; iOS **146/146** |
| `arrayGet` | Yes | Yes | L2265, L2648 | No entry — **J0-9 probe** (+ possible RNFB receiver gap) |
| `timestampAdd` / `timestampSubtract` | Yes | Yes | L2903 | No entry — **J0-7/8 probe** |

---

## Architecture drift (document-only)

| ID | Note |
|----|------|
| **P-029** | Android receiver-chain / deferred-unary lowering vs iOS direct `coerceExpressionTree` — no known e2e split |
| **P-030** | iOS-only builder features: `xor`/`nor`, `pipelinevalue` direct build, `.condition` boolean unwrap — low traffic |
| **P-031** | iOS `rawStage` skip (L3981) + iOS index-hint skip (L3796) — align with P-014/P-015 SDK gaps |

---

# Phase I audit summary (2026-06-25)

| Source | Finding |
|--------|---------|
| [E2e inventory](f06f1caa-0502-4e60-9933-71bd892dcb2a) | 31 branch sites; 141/146 delta = app harness only |
| [Native bridge diff](c178cb94-1b2d-43f5-8a05-1be6ef1b7263) | Primary drift in NodeBuilder coercion; secondary in Parser + stage fields |
| [JS guards audit](82ebdd56-6894-455f-b58c-7ca8b90ba962) | Single runtime `isIOS` branch; execute-options JS gate on all platforms |
| [SDK support reconciliation (Ib)](pipeline-sdk-support-audit.md) | Pins iOS 12.15 / Android 34.15; 9 guard entries likely partially stale; J0 probes required |

# Parity remediation workflow (Phase J)

For each **bridge** row (P-001, P-005, P-010–P-012):

1. Implement native parity (prefer matching iOS / strictest correct behavior).
2. Remove e2e `Platform.*` workarounds; use one shared assertion block.
3. Run 3-platform e2e ([running-e2e.md](/testing/running-e2e.md) canonical commands).
4. Record closure in **Resolved** below.

**Gate:** Phase **K+** (coverage) starts only after Phase **J** commit.

# Resolved

| ID | Fix | Verified |
|----|-----|----------|
| P-002 | Android parser/node-builder: `{ path: "col/doc" }` reference constants no longer treated as field paths | Android e2e r3 **146/146** — commit `82d2a2cad` |
| P-006 | E2e count delta macOS 141 vs 146 | **Closed** — 5 app `utils*` tests; Pipeline 100/100 on all platforms |
