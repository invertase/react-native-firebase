---
type: Reference
title: Pipeline coverage and parity work queue
description: Phase tracker for Firestore Pipelines coverage expansion, platform parity audit/remediation, and SDK support reconciliation.
tags: [firestore, pipelines, coverage, parity, e2e, work-queue]
timestamp: 2026-06-25T12:00:00Z
---

# Pipeline coverage and parity — work queue

> **IN PROGRESS (2026-06-25):** **J0-1…J0-4** — all gates closed. **J0-5** `round` `5b4717d0c` — all gates closed. **Next pickup:** **J0-6** `substring` **`implementation`**. **J0b** queued after J0 complete.
> **Goal/order:** platform parity first; then TS/native coverage toward intractable limits. Links: [parity](pipeline-platform-parity.md), [SDK audit](pipeline-sdk-support-audit.md), [coverage](../../testing/coverage-design.md), [e2e](../../testing/running-e2e.md), [architecture](pipelines.md).

---

Ephemeral tracker; see [OKF policy](../../documentation-policy.md).

---

## Phase ordering (2026-06-25)

**Parity before coverage.** Otherwise tests add `Platform.*` workarounds, misclassify bridge drift as intractable, and deepen Swift/Java drift.

**Sequence from H onward:** **H** → **I** drift inventory → **Ib** SDK support reconciliation → **J** (**J0** probes → **J0b** iOS lowering consolidation → **J1–J6** bridge) → **K–Q** coverage → **R** snapshot.


| Phase     | Focus                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ib**    | Reconcile `IOS_UNSUPPORTED_FUNCTION_NAMES` vs upstream CHANGELOG + bridge audit; [repeatable method](pipeline-sdk-support-audit.md)                                                               |
| **J0**    | iOS runtime probes — one function per commit; authoritative guard list                                                                                                                            |
| **J0b**   | **iOS NodeBuilder lowering consolidation** — dedupe boolean/receiver-chain paths added during J0 (see [J0b](#j0b--ios-nodebuilder-lowering-consolidation-after-j0-before-j1j6)); **before J1–J6** |
| **J1–J6** | Bridge remediation (P-001, P-005, P-010–P-012, P-034) after **J0 + J0b**                                                                                                                          |


---

## Resume checklist

Gate prerequisites before any `:test-cover` ([host rule](../../testing/iteration-vocabulary.md#host-rule)):

1. [Pre-flight](../../testing/running-e2e.md#pre-flight-is-the-host-clear-to-start): host clear, [services ready](../../testing/running-e2e.md#2-services-ready), [harness matches validation tier](../../testing/running-e2e.md#3-harness-matches-validation-tier) ([narrowing gate](../../testing/running-e2e.md#harness-narrowing-gate-blocking) — required for **focused** and **area**; not [push harness](#harness)); [serial `:test-cover`](../../testing/running-e2e.md#serialized-e2e-dispatch); [frozen tree](../../testing/iteration-vocabulary.md#frozen-tree) for `independent-review`.
2. Guard probes: [SDK runtime verification](pipeline-sdk-support-audit.md#6-runtime-verification-authoritative) + [Phase J protocol](#phase-j-iteration-protocol-strict) below.
3. Coverage deltas: full clean cycle; never trust stale `.ec`/profraw ([coverage stale data](../../testing/coverage-design.md#stale-coverage-data)).

---

## Phase table


| Phase  | Focus                                 | Status               | Outcome                                                                                                                                            |
| ------ | ------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A**  | Baseline e2e + Jet TS coverage        | ✅                    | 3-platform verify; harness + jet patch                                                                                                             |
| **B**  | Android dead-code removal             | ✅                    | `buildParsed*` cluster; NodeBuilder 55%→66%                                                                                                        |
| **C**  | Gap map + tooling                     | ✅                    | `map-pipeline-coverage-gaps.sh`                                                                                                                    |
| **D**  | Native lowering e2e                   | ✅                    | subcollection 100%; schedule dispatch 100%                                                                                                         |
| **E**  | Executor / Parser / BridgeFactory e2e | ✅                    | Android Executor 49%→58%; iOS BridgeFactory 83%                                                                                                    |
| **F**  | Android L900–1299 lowering            | ✅                    | **Dead removal** — loop 106→77 missed; NodeBuilder 70.2%                                                                                           |
| **G**  | iOS operand modes + map passthrough   | ✅                    | **+8 operand probes** via raw-where e2e; map execute intractable                                                                                   |
| **H**  | TS `pipeline_validate` execute guards | ✅                    | `3a1f7d654` — 3-platform **141/141 / 146/146 / 146/146**                                                                                           |
| **I**  | **Platform parity audit**             | ✅                    | 31 e2e branches; registry P-001–P-031                                                                                                              |
| **Ib** | **SDK support reconciliation**        | ✅                    | Guard list vs iOS 12.15 / Android 34.15 CHANGELOG; [audit method](pipeline-sdk-support-audit.md)                                                   |
| **J**  | **Parity remediation**                | **in progress (J0)** | **J0** probes → **J0b** consolidation → **J1–J6**                                                                                                  |
| **K**  | TS `pipeline_runtime` + `expressions` | queued               | guards, timestamp/FieldPath *(was old I)*                                                                                                          |
| **L**  | Android parsed-aggregate tail         | queued               | ~143 missed *(was old J)*                                                                                                                          |
| **M**  | Android exit frames + receiver chains | queued               | ~77 loop remainder + exit/receiver *(was old K)*                                                                                                   |
| **N**  | iOS stage coercion                    | queued               | ~293 missed; operand tail *(was old L)*                                                                                                            |
| **O**  | Android Executor remainder            | queued               | sub-60% after E *(was old M)*                                                                                                                      |
| **P**  | Jest-only TS paths                    | queued               | validation branches *(was old N)*                                                                                                                  |
| **Q**  | Intractability audit                  | queued               | measured caps per file *(was old O)*                                                                                                               |
| **R**  | Pre-merge harness restore             | queued               | **Full** unfocused 3-platform snapshot — [full validation tier](../../testing/running-e2e.md#e2e-validation-tiers-focused-area-full) *(was old P)* |


**Compare-types exports:** out of scope until **R**. During **J**, no new `Platform.android` / `Platform.ios` branches for coverage; file drift, fix in **J**, or document SDK limitation.

---

## Current snapshot

**Label:** `after-j0-1-j0-2-j0-3-j0-4-j0-5`; **harness:** full test app (`tests/app.js` — all platform modules restored for push)

**E2e counts (Phase H baseline):** macOS **141**, iOS **146**, Android **146** ✅ *(full app load; re-verify before merge)*


| Target                    | macOS          | iOS            | Android (gap map) |
| ------------------------- | -------------- | -------------- | ----------------- |
| TS `pipeline_validate.ts` | 82/88 (93.18%) | 78/88 (88.64%) | 78/88 (88.64%)    |
| Phase H e2e baseline      | ✅              | ✅              | ✅                 |


*Phase H baseline only; not J0 review gate.*

**Next item:** **J0-6** `substring` — `next_work_type`: **`implementation`**; `validation_tier`: **focused**; `platform`: ios. **J0b** blocked until J0-9 complete.

**Arbiter gate (2026-06-25):**


| Probe                   | Code        | `implementation_gate` | `review_gate` | `next_work_type`     | `validation_tier` | `platform` | Notes                                                              |
| ----------------------- | ----------- | --------------------- | ------------- | -------------------- | ----------------- | ---------- | ------------------------------------------------------------------ |
| **J0-1** `stringRepeat` | `f14092909` | closed                | **closed**    | —                    | —                 | —          | Area review 2026-06-25: 100/100/100; stringRepeat unified iOS path |
| **J0-2** `switchOn`     | `ae795b96c` | closed                | **closed**    | —                    | —                 | —          | Committed 2026-06-25; area review 100/100/100                      |
| **J0-3** `trunc`        | `138e45690` | closed                | **closed**    | —                    | —                 | —          | Area review 2026-06-25: 100/100/100; trunc unified iOS path        |
| **J0-4** `conditional`  | `cde7b812c`         | closed                | **closed**    | —                    | —                 | —          | Area review 100/100/100; iOS wire `conditional`; unified e2e       |
| **J0-5** `round`        | `5b4717d0c`         | closed                | **closed**    | —                    | —                 | —          | Area review 100/100/100; round unified iOS path (TS-only)          |
| **J0-6** `substring`    | —           | —                     | —             | **`implementation`** | focused           | ios        | **unblocked** (J0-5 committed)                                     |



| Target                      | macOS             | iOS                    | Android (gap map)                      | Phase |
| --------------------------- | ----------------- | ---------------------- | -------------------------------------- | ----- |
| Parity drift (bridge)       | —                 | —                      | **5 open** (P-001, P-005, P-010–P-012) | **J** |
| Parity drift (SDK/macOS-js) | 11 vacuous        | 10 reduced + 3 vacuous | documented                             | —     |
| TS `pipeline_runtime.ts`    | 86%               | **90.79% (207/228)**   | pre-K baseline                         | **K** |
| TS `expressions.ts`         | 89%               | **93.61% (249/266)**   | pre-K baseline                         | **K** |
| Android NodeBuilder         | 67.5% (1167/1729) | **70.2% (1155/1645)**  | F: −183 LOC dead                       | L, M  |
| Android loop L900–1299      | 106 missed        | **77 missed**          | F: −29 missed                          | M     |
| Android Executor            | 58%               | 58%                    | —                                      | O     |
| iOS NodeBuilder             | 68.89%            | **69.84% (1100/1575)** | G: +15 hit                             | N     |
| iOS operand modes L919–1006 | 27 missed         | **19 missed**          | G: −8 missed                           | N, Q  |


```bash
bash scripts/map-pipeline-coverage-gaps.sh              # current
bash scripts/map-pipeline-coverage-gaps.sh after-phase-g
bash scripts/map-pipeline-coverage-gaps.sh after-phase-f-dead-removal
```

---

## Branch commits (A–G)


| Commit      | Summary                                                                      |
| ----------- | ---------------------------------------------------------------------------- |
| `61e198aaf` | Android e2e infra: Detox FabricTimers, `.ec` delete, OKF stale-coverage docs |
| `fa5b469b2` | Android NodeBuilder: remove dormant lowering duplicates (Phase F)            |
| `970022702` | E2e: expression frame lowering regression cases (Phase F)                    |
| `0650b7783` | E2e: iOS operand modes via raw where filters (Phase G)                       |


Earlier: A–E baseline, dead code, gap map, lowering/executor e2e.

---

## Completed phase summaries

### Phase F (Android loop L900–1299)

- Added five e2e tests under `enter object expression frame lowering coverage`; green 128/133/133; **zero Jacoco delta** because Parser normalizes before NodeBuilder.
- Removed **183 lines** duplicate/zero-caller lowering: wrappers, raw-operator boolean arms duplicated in Parser, scalar/String/Expression entry arms unreachable from `serializeExpressionNode`.
- **Result:** loop **106 → 77 missed**; NodeBuilder **67.5% → 70.2%** (fewer lines, higher %).
- **Remainder → Phase M:** vector expression handler (expression-vector rhs), exit/receiver tails.

**Lesson:** e2e that passes but moves no probes → audit callers before adding more tests.

### Phase G (iOS operand modes + map passthrough)

- One e2e: `coerces bare rhs operands through raw where filters`; raw `.where({ condition: { operator, fieldPath, value }})` with bare string/array/bool rhs (modular wraps rhs constants and misses operand-mode arms).
- **Result:** iOS NodeBuilder **+0.95 pp**; operand modes **69.32% → 78.41%** (−8 missed).
- **Map passthrough execute success (L1208–1219):** **intractable** — Firestore rejects `map(field(…))` execute; lowering already covered by existing error-path e2e.
- **Operand tail (19 missed):** L928, L948–949, L961–966, L973–974, L990–1006 — triage in **Phase I**; Android side is **P-001** (bridge gap, not coverage-only).
- **Parity note:** e2e uses `Platform.android` split for ordering RHS — **must close in Phase J**, not extend in Phase K+.

### Infra side quest (committed `61e198aaf`)

- Detox `FabricTimersIdlingResource` no-op under New Arch (launch crash fix).
- Android post-e2e deletes processed `.ec` (parity with iOS profraw delete).
- OKF: stale coverage → full clean cycle, do not re-report without fresh e2e.

---

## Phase H — complete (2026-06-25)

**Commit:** `3a1f7d654` — e2e tamper tests + Android parser/node-builder ref-constant fix. Docs: `aace9671f`.

- Six e2e tests tamper `_source`/`_stages` before `execute()` to hit JS validation guards.
- **Result:** 65/88 → **82/88 (93.18%)** on macOS (+17 lines).
- **Remaining 6 lines → Phase P/Q:** L96 (valid subcollection return), L175/L181 (runtime-unreachable pending/stages guards), L208/L212 (parseExecuteInput short-circuit), L230 (rawOptions isolated throw). Jest `pipelines-validate.test.ts` covers direct-call paths.
- **Android parser fix:** document-reference `{ path: "col/doc" }` constants — verified **146/146** on r3.

---

## Phase I — platform parity audit (complete 2026-06-25)

**Deliverable:** [pipeline-platform-parity.md](pipeline-platform-parity.md) — full registry.

**Audit inputs:**

- E2e drift inventory — 31 `Platform.*` sites; 141/146 delta = 5 app `utils*` tests (not Pipeline)
- Native bridge diff — NodeBuilder coercion is primary drift
- JS guards audit — single `isIOS` pre-execute guard; execute-options JS gate on all platforms

**Triage totals:**


| Class         | Count                                      | Action                                 |
| ------------- | ------------------------------------------ | -------------------------------------- |
| **bridge**    | 5                                          | Phase **J** (J1–J5)                    |
| **SDK**       | 9 unsupported fns + 3 stage/aggregate gaps | Document (P-003, P-013–P-015)          |
| **macOS-js**  | 11 vacuous/reduced Pipeline tests          | Document (P-004, P-018–P-028)          |
| **test-only** | 1                                          | Unify after J1 (P-034)                 |
| **RNFB-JS**   | 2                                          | Document or narrow in J (P-016, P-017) |
| **closed**    | P-002, P-006                               | —                                      |


---

## Phase Ib — SDK support reconciliation (complete 2026-06-25)

**Goal:** Rebuild iOS unsupported-function list from primary sources; document repeatable method; revise Phase J queue.

**Pins audited:** iOS Firestore **12.15.0**, Android BOM **34.15.0**.

**Deliverables:**

- [pipeline-sdk-support-audit.md](pipeline-sdk-support-audit.md) — 7-step repeatable method + pre-probe matrix (`257e31abb`)
- `**IOS_UNSUPPORTED_FUNCTION_NAMES` likely stale** for iOS SDK **12.11–12.12** additions (`stringRepeat`, `switchOn`, `trunc`, `ConditionalExpression` / `conditional`).
- `**timestampAdd` / `timestampSubtract` / `arrayGet`**: no iOS CHANGELOG at 12.15; Android receiver-chain lowering, iOS raw wire only → **probe then bridge or document**.
- **Runtime probes (Phase J0) are authoritative** — CHANGELOG + bridge audit alone cannot remove guards

**Audit input:** native bridge + CHANGELOG cross-check.

---

## Phase J — parity remediation (in progress)

### Phase J iteration protocol (strict)

Each J0 probe / J1–J6 bridge step follows **one** serial loop. No overlap. Work types: [iteration vocabulary](../../testing/iteration-vocabulary.md).


| Step  | Work type            | Closes gate      | Rules                                                                                                                                                                       |
| ----- | -------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | `implementation`     | `implementation` | Code/e2e changes; Jest + **focused** tier; `.only` / tight area narrowing OK locally; **no commit**                                                                         |
| **2** | `independent-review` | `review`         | **Frozen tree**; **area** tier; no `.only`; area narrowing only in `tests/app.js` + `tests/globals.js`; serial [host rule](../../testing/iteration-vocabulary.md#host-rule) |
| **3** | `commit`             | `commit`         | One focused commit only after `review_gate` closed                                                                                                                          |


Canonical commands: [serialized dispatch](../../testing/running-e2e.md#serialized-e2e-dispatch), [one iteration](../../testing/running-e2e.md#running-one-iteration), [guard probes](pipeline-implementation-workflow.md#ios-guard-probe-iterations).

### J0 — iOS runtime guard probes (do first)

Per [SDK audit §6](pipeline-sdk-support-audit.md): one function/commit; remove guard; restore full iOS e2e assertions; verify canonical iOS e2e only.


| Probe | Function            | Rationale                                                | `implementation_gate` | `review_gate` | `next_work_type`     |
| ----- | ------------------- | -------------------------------------------------------- | --------------------- | ------------- | -------------------- |
| J0-1  | `stringRepeat`      | iOS CHANGELOG 12.12.0                                    | closed                | **closed**    | —                    |
| J0-2  | `switchOn`          | iOS CHANGELOG 12.12.0                                    | closed                | **closed**    | —                    |
| J0-3  | `trunc`             | iOS CHANGELOG 12.11.0                                    | closed                | **closed**    | —                    |
| J0-4  | `conditional`       | `ConditionalExpression` 12.11.0; iOS wire `conditional` | closed                | **closed**    | —                    |
| J0-5  | `round`             | No CHANGELOG; Android + bridge ok                        | closed                | **closed**    | —                    |
| J0-6  | `substring`         | No CHANGELOG; docs list function                         | —                     | —             | **`implementation`** |
| J0-7  | `timestampAdd`      | No CHANGELOG; likely SDK gap or receiver shape           |                       |               |                      |
| J0-8  | `timestampSubtract` | Same                                                     |                       |               |                      |
| J0-9  | `arrayGet`          | No CHANGELOG; likely needs iOS receiver parity if SDK ok |                       |               |                      |


**Output:** updated `pipeline_support.ts`, shrunk P-003 reduced pipelines, confirmed parity classifications.

### J0b — iOS NodeBuilder lowering consolidation (after J0, before J1–J6)

**Status:** **queued** — `**blocked`** until **J0** probes complete (J0-1…J0-9 committed + `review_gate` closed each).

**Why (J0-2 independent-review, 2026-06-25):** `switchOn` landed ~**387 lines** in `RNFBFirestorePipelineNodeBuilder.swift` — a parallel coercion layer (`coerceFirebaseExpression`, `applyBooleanReceiver`, `coerceSwitchOnConditionBridge`, `pipelineExprBridge` + KVC on `FunctionExpression.args`) alongside existing `coerceExpression` / `coerceBooleanExpression` / stack-based lowering. Correctness verified (area e2e green); **maintainability / drift risk** if J0-3…J0-9 add more one-off paths.

**Goal:** Consolidate J0-added boolean/receiver-chain lowering into **shared** NodeBuilder paths (align with Android `scheduleBooleanReceiverChain` / `EnterObjectBooleanFrame` where feasible). Remove fragile KVC probing where `ExprBridge` extraction exists. **No behavior change** — area-tier Pipeline e2e must stay green (especially `switchOn`, `stringRepeat`, and any probe-specific cases).

**Scope:** `packages/firestore/ios/RNFBFirestore/RNFBFirestorePipelineNodeBuilder.swift` only (unless consolidation requires Parser touch — stop and note).

**Protocol:** Same [Phase J iteration protocol](#phase-j-iteration-protocol-strict) — `implementation` (**focused**, switchOn + affected probe tests) → `independent-review` (**area**) → `commit`.

**Gate for J1–J6:** **J0 complete + J0b committed** + parity registry updated.

### J1–J6 — bridge remediation (after J0 + J0b)


| Step   | Registry          | Work                                                        |
| ------ | ----------------- | ----------------------------------------------------------- |
| **J1** | P-001             | Android operand coercion parity                             |
| **J2** | P-005             | Android `integerLiteral` constant lowering                  |
| **J3** | P-010             | Expression-valued `distanceField` / `indexField` on Android |
| **J4** | P-011             | Parser constant envelope routing                            |
| **J5** | P-012             | `timestampTruncate` arity validation on Android             |
| **J6** | P-034 + J0-9 tail | Unify operand-mode + arrayGet e2e after probes              |


**Gate for Phase K+:** J0 complete + **J0b** committed + J1–J6 bridge commits + parity **Resolved** updated.

**Current gates:** **J0-1** + **J0-2** + **J0-3** + **J0-4** + **J0-5** committed; all gates closed. **J0-6** next **`implementation`**. **J0b** queued (blocked on J0 complete).

---

## Coverage phases (K–Q) — after parity


| Phase | Target                                                                   |
| ----- | ------------------------------------------------------------------------ |
| **K** | `pipeline_runtime.ts` + `expressions.ts` normalization gaps              |
| **L** | Android parsed-aggregate expression args (~143 missed)                   |
| **M** | Android exit frames, receiver chains, vector expression handler (F tail) |
| **N** | iOS stage coercion (~293 missed), operand tail                           |
| **O** | Android Executor error branches                                          |
| **P** | Jest-only TS validation paths                                            |
| **Q** | Intractability audit (map execute, debug gates, codegen caps)            |


**R:** revert harness narrowing; **full** unfocused 3-platform run ([full tier](../../testing/running-e2e.md#e2e-validation-tiers-focused-area-full)); final gate before compare-types.

---

## Harness

- **Push state (committed):** full test app — all `platformSupportedModules` + `require.context` in `tests/app.js`. For merge/CI only; **not** the harness for local `:test-cover` during J–Q.
- **Local `:test-cover`:** must match arbiter **`validation_tier`** — [running e2e § harness + narrowing gate](../../testing/running-e2e.md#harness-narrowing-gate-blocking). **`implementation` → focused** and **`independent-review` → area:** both require [area narrowing](pipeline-implementation-workflow.md#narrowing-during-pipeline-iterations) locally **before** first run even when git has full harness. Revert before **R** (full tier).
- `tests/globals.js` — `RNFBDebug = true` optional for fail-fast

---

## Workflow (each phase)

**Phases I–J (parity):**

1. Audit or implement bridge fix with **shared** e2e assertions.
2. Update OKF parity registry (open/close rows).
3. **Phase J:** follow [Phase J iteration protocol](#phase-j-iteration-protocol-strict) — `implementation` (Jest + **focused** tier) → `independent-review` (**area** tier, frozen tree) → `commit`; never commit before `review_gate` closed; never overlap `:test-cover` ([host rule](../../testing/iteration-vocabulary.md#host-rule)).
4. 3-platform e2e on canonical commands ([running-e2e rules 6–7](../../testing/running-e2e.md)).

**Phases K–Q (coverage):**

1. `bash scripts/map-pipeline-coverage-gaps.sh before-<id>`
2. Prove **live vs dead** before implementing
3. **No new `Platform.`* branches** — if a probe only passes on one platform, stop and file drift for Phase J follow-up
4. OKF background + `:build` if native + `:test-cover` + native post-process
5. `bash scripts/map-pipeline-coverage-gaps.sh after-<id>`
6. One focused commit per logical change (message describes **what**, not phase letter)

**Pitfalls:** iOS `constant(0/1)` → bool (use `constant(2+)`); raw AND where is Android-native (`Platform.other` skip on macOS; document); Detox boots AVD, no manual `emulator -avd`.

---

## Historical notes (A–E)

- **A:** Jet WS coverage transfer; 3-platform TS lcov baseline.
- **B:** Removed Android `buildParsed`* (~690 lines, 0%).
- **C:** `map-pipeline-coverage-gaps.sh`.
- **D:** Subcollection 100%; schedule dispatch 100%; lowering e2e expansion.
- **E:** Executor 49%→58%; database/rawOptions/sample/findNearest/unnest/rawStage e2e.

