---
type: Reference
title: Firestore Pipelines platform parity
description: Policy, drift inventory, and triage for cross-platform pipeline behavior (iOS, Android, macOS JS).
tags: [firestore, pipelines, ios, android, macos, parity, e2e]
timestamp: 2026-06-25T00:00:00Z
---

# Platform parity policy

Pipeline work has **two completion signals** (see [Coverage design](/testing/coverage-design.md)):

1. **Parity** — observable behavior is **the same across platforms** unless a difference is a **native Firestore SDK limitation** (not an RNFB bridge gap). **Audit and remediate before further coverage work** ([work queue Phase I–J](../../../PIPELINE-COVERAGE-WORK-QUEUE.md)).
2. **Coverage** — file-level TS and native coverage rise until **intractable** limits (~100% where reachable), **after** parity drift is triaged and bridge gaps closed.

| Outcome | Action |
|---------|--------|
| Same behavior on iOS, Android, macOS (JS SDK) | Required default — shared e2e assertions, no `Platform.*` branches unless macOS has no native bridge |
| RNFB bridge gap (one platform lowers/coerces differently) | **Fix the bridge** — work-queue Phase **J** (remediation) |
| Native SDK does not support the feature | Document here with SDK version/evidence; optional reduced e2e on that platform only |
| macOS-only path (firebase-js-sdk, no RN bridge) | Document; use `Platform.other` skip when the test requires native-only wire shapes |

**Do not** treat e2e `Platform.android` / `Platform.ios` workarounds as permanent without an entry in the drift registry below.

# Drift registry

Status: **seed list** — Phase **I** (parity audit) will expand, triage, and assign Phase **J** remediation.

| ID | Area | Symptom / test hook | iOS | Android | macOS | Triage | Remediation |
|----|------|---------------------|-----|---------|-------|--------|-------------|
| P-001 | Operand-mode RHS | `coerces bare rhs operands through raw where filters` uses `value: true` on iOS/macOS, `value: 1` on Android | Coerces bool→0/1 in NodeBuilder | No equivalent in `applyBooleanReceiverConstant` | JS SDK | **RNFB bridge gap** (Android) | Phase **J** — Android numeric operand parity; revert e2e split |
| P-002 | Document ref constants | `normalizes nested literal maps…` — `constant(linkedRef)` | Pass | Pass (r3) | Pass | **RNFB bridge gap** (Android parser) — **closed** | Parser `isReferencePathConstantMap`; uncommitted |
| P-003 | Unsupported functions | `IOS_UNSUPPORTED_FUNCTION_NAMES` pre-execute throw | Reduced pipelines / `expectIOSUnsupportedFunctions` | Full API | Full API (JS) | **SDK / platform API gap** | Document only; keep JS guard + e2e skips |
| P-004 | Raw AND where | Tests use `Platform.other` skip | Native | Native | Skipped | **macOS has no native pipeline** | Document; not a bridge gap |
| P-005 | Integer/boolean wire | Avoid `constant(0)`/`constant(1)` in heterogeneous arrays | CFBoolean vs int collision | — | — | **Bridge coercion** (documented) | [pipelines.md § Integer/boolean coercion](pipelines.md#integer--boolean-coercion-ios-bridge) |
| P-006 | E2e counts | macOS **141** vs iOS **146** vs Android **146** (target) | — | — | — | **Audit** | Phase **I** — map skipped/reduced tests to registry rows |

Add rows in Phase **I** with: file/line, classification (`SDK` | `bridge` | `test-only` | `macOS-js`), owner phase, and OKF justification text.

# Parity audit workflow (Phase I)

Runs **immediately after Phase H commit**, **before** coverage phases K–Q. Further coverage work without this audit risks new per-platform e2e workarounds.

1. **Inventory e2e drift** — `rg 'Platform\\.(ios|android|other)' packages/firestore/e2e/Pipeline.e2e.js`; list skips, reduced pipelines, and divergent assertions.
2. **Inventory bridge drift** — diff live lowering paths (`coerceExpressionTree` vs `EnterObjectExpressionFrame`), parser `isExpressionLike` / constant handling, stage coercion.
3. **Inventory JS guards** — `pipeline_support.ts` unsupported lists, validation differences.
4. **Triage each item** — SDK limitation (cite Firebase release notes / repro against bare SDK) vs RNFB gap vs intentional macOS skip.
5. **Update this registry** — every remaining difference gets a row and justification.
6. **Schedule Phase J** — ordered remediation list in [PIPELINE-COVERAGE-WORK-QUEUE.md](../../../PIPELINE-COVERAGE-WORK-QUEUE.md); bridge fixes before doc-only SDK gaps.

Deliverable: updated drift registry + remediation table linked from the work queue.

# Parity remediation workflow (Phase J)

For each **bridge** row in the registry:

1. Implement native parity (prefer matching the **strictest correct** platform behavior).
2. Remove e2e `Platform.*` workarounds; use one shared assertion block.
3. Run 3-platform e2e (`running-e2e.md` canonical commands).
4. Record closure in this file (move row to **Resolved** subsection with commit ref).

**Gate:** Phase **K+** (coverage) starts only after Phase **J** commit. Phase **R** (unfocused harness restore) runs after coverage phases **K–Q**.

# Resolved

| ID | Fix | Verified |
|----|-----|----------|
| P-002 | Android parser/node-builder: `{ path: "col/doc" }` reference constants no longer treated as field paths | Android e2e r3 **146/146** ([r3 verify](e08dbaef-62f8-4895-827f-b69ced385aa1)) |
