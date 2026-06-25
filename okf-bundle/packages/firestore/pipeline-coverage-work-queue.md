---
type: Reference
title: Pipeline coverage and parity work queue
description: Phase tracker for Firestore Pipelines coverage expansion, platform parity audit/remediation, and SDK support reconciliation.
tags: [firestore, pipelines, coverage, parity, e2e, work-queue]
timestamp: 2026-06-25T12:00:00Z
---

# Pipeline coverage and parity — work queue

> **IN PROGRESS (2026-06-25, post-arbiter):** Phase **J0** — **review e2e gates open** (harness contention from parallel review runs — not product regression). **J0-1** (`stringRepeat`) — committed `f14092909`; static/Jest OK; implementer once reported iOS **146/146**; **review e2e gate NOT closed** (Jet `Invalid array length` after `coverage-ready`, SimError 405, desync). **J0-2** (`switchOn`) — uncommitted WIP; Jest **24/24**; **review e2e gate NOT closed** (`switchOn` never ran green on canonical review). **Do not start J0-3** until J0-2 review gate closes. Phase **I** + **H** + **Ib** committed.
> **Goals:** (1) **Platform parity first** — same observable behavior on iOS, Android, and macOS unless a difference is a **native SDK limitation**; drift triaged and closed or **formally documented** in OKF. (2) Then raise pipeline coverage (TS + native) toward intractable limits (~100% where reachable).  
> **Parity policy:** [pipeline-platform-parity.md](pipeline-platform-parity.md)  
> **SDK support audit:** [pipeline-sdk-support-audit.md](pipeline-sdk-support-audit.md)  
> **Coverage policy:** [Coverage design](../../testing/coverage-design.md)  
> **E2e commands:** [Running e2e tests](../../testing/running-e2e.md) — **only** these commands; [e2e tiers](../../testing/running-e2e.md#e2e-tiers-implementer--reviewer--pre-merge) (implementer **focused**, reviewer **area**, pre-merge **full**); **always serial** from verified clean [pre-flight](../../testing/running-e2e.md#pre-flight-is-the-host-clear-to-start)
> **Architecture:** [pipelines.md](pipelines.md)

---

Ephemeral tracker — see [OKF documentation and commit policy](../../documentation-policy.md).

---

## Phase ordering (2026-06-25)

**Parity before coverage.** Chasing coverage while parity drift remains tends to:

- add per-platform e2e `Platform.*` workarounds instead of fixing bridges;
- hit native arms that differ by platform and mis-read gaps as “intractable”;
- deepen structural drift between Swift and Java lowering paths.

**Sequence from H onward:** **H** → **I** drift inventory → **Ib** SDK support reconciliation → **J** (J0 probes + bridge fixes) → **K–Q** coverage → **R** snapshot.

| Phase | Focus |
|-------|--------|
| **Ib** | Reconcile `IOS_UNSUPPORTED_FUNCTION_NAMES` vs upstream CHANGELOG + bridge audit; [repeatable method](pipeline-sdk-support-audit.md) |
| **J0** | iOS runtime probes — one function per commit; authoritative guard list |
| **J1–J6** | Bridge remediation (P-001, P-005, P-010–P-012, P-034) after J0 |

---

## Resume checklist

E2e runs use **only** [running-e2e.md](../../testing/running-e2e.md). That runbook owns prerequisites, background services, pre-flight, serial host rules, interrupted-run cleanup, and platform commands.

1. Start from [running-e2e § Pre-flight](../../testing/running-e2e.md#pre-flight-is-the-host-clear-to-start); do not start if another e2e is active.
2. Follow [running-e2e § Serialized e2e dispatch](../../testing/running-e2e.md#serialized-e2e-dispatch): one e2e run at a time; no source edits during runs.
3. For guard probes, follow [sdk-support-audit § Runtime verification](pipeline-sdk-support-audit.md#6-runtime-verification-authoritative) and the live Phase J protocol below.
4. For coverage deltas, run a full clean cycle; never trust stale `.ec`/profraw ([coverage-design § stale data](../../testing/coverage-design.md#stale-coverage-data)).

---

## Phase table

| Phase | Focus | Status | Outcome |
|-------|--------|--------|---------|
| **A** | Baseline e2e + Jet TS coverage | ✅ | 3-platform verify; harness + jet patch |
| **B** | Android dead-code removal | ✅ | `buildParsed*` cluster; NodeBuilder 55%→66% |
| **C** | Gap map + tooling | ✅ | `map-pipeline-coverage-gaps.sh` |
| **D** | Native lowering e2e | ✅ | subcollection 100%; schedule dispatch 100% |
| **E** | Executor / Parser / BridgeFactory e2e | ✅ | Android Executor 49%→58%; iOS BridgeFactory 83% |
| **F** | Android L900–1299 lowering | ✅ | **Dead removal** — loop 106→77 missed; NodeBuilder 70.2% |
| **G** | iOS operand modes + map passthrough | ✅ | **+8 operand probes** via raw-where e2e; map execute intractable |
| **H** | TS `pipeline_validate` execute guards | ✅ | `3a1f7d654` — 3-platform **141/141 / 146/146 / 146/146** |
| **I** | **Platform parity audit** | ✅ | 31 e2e branches; registry P-001–P-031 |
| **Ib** | **SDK support reconciliation** | ✅ | Guard list vs iOS 12.15 / Android 34.15 CHANGELOG; [audit method](pipeline-sdk-support-audit.md) |
| **J** | **Parity remediation** | **in progress (J0)** | **J0** iOS probes → **J1–J6** bridge + e2e unification |
| **K** | TS `pipeline_runtime` + `expressions` | queued | guards, timestamp/FieldPath *(was old I)* |
| **L** | Android parsed-aggregate tail | queued | ~143 missed *(was old J)* |
| **M** | Android exit frames + receiver chains | queued | ~77 loop remainder + exit/receiver *(was old K)* |
| **N** | iOS stage coercion | queued | ~293 missed; operand tail *(was old L)* |
| **O** | Android Executor remainder | queued | sub-60% after E *(was old M)* |
| **P** | Jest-only TS paths | queued | validation branches *(was old N)* |
| **Q** | Intractability audit | queued | measured caps per file *(was old O)* |
| **R** | Pre-merge harness restore | queued | **Full** unfocused 3-platform snapshot — [pre-merge e2e tier](../../testing/running-e2e.md#e2e-tiers-implementer--reviewer--pre-merge) *(was old P)* |

**Compare-types exports:** out of scope until Phase **R**.

**Rule during J:** do **not** add new `Platform.android` / `Platform.ios` e2e branches to raise coverage — file as drift and fix in **J** or document as SDK limitation.

---

## Current snapshot

**Label:** `after-phase-h-3platform-green` · **Harness:** firestore Pipeline only (local `tests/app.js` — do not commit)

**E2e counts (Phase H baseline):** macOS **141**, iOS **146**, Android **146** ✅

| Target | macOS | iOS | Android (gap map) |
|--------|-------|-----|-------------------|
| TS `pipeline_validate.ts` | 82/88 (93.18%) | 78/88 (88.64%) | 78/88 (88.64%) |
| Phase H e2e baseline | ✅ | ✅ | ✅ |

*Phase H baseline only — not the J0 review e2e gate. See arbiter table below.*

**Next (blocked):** [Pre-flight clear](../../testing/running-e2e.md#pre-flight-is-the-host-clear-to-start) + green canonical iOS review e2e for **J0-2** (`switchOn`); then re-attempt **J0-1** review gate if needed. **Do not start J0-3** (`trunc`) until J0-2 review gate closes.

**Arbiter gate (2026-06-25):**

| Probe | Code | Review e2e | Notes |
|-------|------|------------|-------|
| **J0-1** `stringRepeat` | ✅ committed — `f14092909` | ⛔ **gate open** (harness) | Static/Jest OK; implementer once **146/146**; review e2e NOT closed — parallel runs + Jet/SimError desync; **not a code regression** |
| **J0-2** `switchOn` | ✅ WIP (uncommitted) | ⛔ **gate open** (never green) | Jest **24/24**; canonical review e2e never ran green — re-run after [pre-flight clear](../../testing/running-e2e.md#pre-flight-is-the-host-clear-to-start) |
| **J0-3** `trunc` | — | **hold** | Do not implement until J0-2 review gate closes |

| Target | macOS | iOS | Android (gap map) | Phase |
|--------|-------|-----|-------------------|-------|
| Parity drift (bridge) | — | — | **5 open** (P-001, P-005, P-010–P-012) | **J** |
| Parity drift (SDK/macOS-js) | 11 vacuous | 10 reduced + 3 vacuous | documented | — |
| TS `pipeline_runtime.ts` | 86% | **90.79% (207/228)** | pre-K baseline | **K** |
| TS `expressions.ts` | 89% | **93.61% (249/266)** | pre-K baseline | **K** |
| Android NodeBuilder | 67.5% (1167/1729) | **70.2% (1155/1645)** | F: −183 LOC dead | L, M |
| Android loop L900–1299 | 106 missed | **77 missed** | F: −29 missed | M |
| Android Executor | 58% | 58% | — | O |
| iOS NodeBuilder | 68.89% | **69.84% (1100/1575)** | G: +15 hit | N |
| iOS operand modes L919–1006 | 27 missed | **19 missed** | G: −8 missed | N, Q |

```bash
bash scripts/map-pipeline-coverage-gaps.sh              # current
bash scripts/map-pipeline-coverage-gaps.sh after-phase-g
bash scripts/map-pipeline-coverage-gaps.sh after-phase-f-dead-removal
```

---

## Branch commits (A–G)

| Commit | Summary |
|--------|---------|
| `61e198aaf` | Android e2e infra: Detox FabricTimers, `.ec` delete, OKF stale-coverage docs |
| `fa5b469b2` | Android NodeBuilder: remove dormant lowering duplicates (Phase F) |
| `970022702` | E2e: expression frame lowering regression cases (Phase F) |
| `0650b7783` | E2e: iOS operand modes via raw where filters (Phase G) |

Earlier on branch: Phases A–E (baseline, dead code, gap map, lowering/executor e2e).

---

## Completed phase summaries

### Phase F (Android loop L900–1299)

- **Five e2e tests** added under `enter object expression frame lowering coverage` — green 128/133/133; **zero Jacoco delta** (parser normalizes shapes before NodeBuilder).
- **Live vs dead audit:** removed **183 lines** of duplicate/zero-caller lowering (wrappers, raw-operator boolean arms duplicated in Parser, scalar/String/Expression entry arms never reached from `serializeExpressionNode`).
- **Result:** loop **106 → 77 missed**; NodeBuilder **67.5% → 70.2%** (fewer lines, higher %).
- **Remainder → Phase M:** vector expression handler (expression-vector rhs), exit/receiver tails.

**Lesson:** e2e that passes but moves no probes → audit callers before adding more tests.

### Phase G (iOS operand modes + map passthrough)

- **One e2e:** `coerces bare rhs operands through raw where filters` — raw `.where({ condition: { operator, fieldPath, value }})` with bare string/array/bool rhs (modular API wraps rhs in `exprType: constant` maps and cannot hit operand-mode arms).
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

| Class | Count | Action |
|-------|-------|--------|
| **bridge** | 5 | Phase **J** (J1–J5) |
| **SDK** | 9 unsupported fns + 3 stage/aggregate gaps | Document (P-003, P-013–P-015) |
| **macOS-js** | 11 vacuous/reduced Pipeline tests | Document (P-004, P-018–P-028) |
| **test-only** | 1 | Unify after J1 (P-034) |
| **RNFB-JS** | 2 | Document or narrow in J (P-016, P-017) |
| **closed** | P-002, P-006 | — |

---

## Phase Ib — SDK support reconciliation (complete 2026-06-25)

**Goal:** Rebuild the true iOS unsupported-function list from primary sources; document a repeatable audit method; **revise Phase J queue** before drift closure.

**Pins audited:** iOS Firestore **12.15.0**, Android BOM **34.15.0**.

**Deliverables:**

- [pipeline-sdk-support-audit.md](pipeline-sdk-support-audit.md) — 7-step repeatable method + pre-probe matrix (`257e31abb`)
- Finding: **`IOS_UNSUPPORTED_FUNCTION_NAMES` is likely stale** for functions added in iOS SDK **12.11–12.12** (`stringRepeat`, `switchOn`, `trunc`, `ConditionalExpression` / `conditional`) while guards unchanged since early pipeline work
- Finding: **`timestampAdd` / `timestampSubtract` / `arrayGet`** — no iOS CHANGELOG entry at 12.15; Android uses receiver-chain lowering, iOS uses raw wire only → **probe then bridge or document**
- **Runtime probes (Phase J0) are authoritative** — CHANGELOG + bridge audit alone cannot remove guards

**Audit input:** native bridge + CHANGELOG cross-check.

---

## Phase J — parity remediation (in progress)

### Phase J iteration protocol (strict)

Each J0 probe (and each J1–J6 bridge step) follows **one** serial loop. Do not overlap iterations.

| Step | Actor | Rules |
|------|-------|-------|
| **1. Implement** | Implementation context | Code + e2e spec changes; **Jest** + **focused e2e** ([running-e2e § focused tier](../../testing/running-e2e.md#e2e-tiers-implementer--reviewer--pre-merge)) — serial, canonical commands only; `.only` / tight area narrowing OK; **do not commit** |
| **2. Review** | Fresh review context | Independent pass on frozen diff; **area e2e** — serial canonical `:test-cover` on frozen files, **no** `.only`; area narrowing in `tests/app.js` + `tests/globals.js` only — [running-e2e rules 6–7](../../testing/running-e2e.md) (**one e2e at a time**; **no source edits during e2e**) |
| **3. Commit** | Coordinator | **One** focused commit **only after** review e2e green |

Canonical e2e loop and hard rules: [running-e2e § Serialized e2e dispatch](../../testing/running-e2e.md#serialized-e2e-dispatch), [running-e2e § Running one iteration](../../testing/running-e2e.md#running-one-iteration), and [pipeline implementation workflow § iOS guard probe iterations](pipeline-implementation-workflow.md#ios-guard-probe-iterations).

### J0 — iOS runtime guard probes (do first)

Per [sdk-support-audit §6](pipeline-sdk-support-audit.md): one function per commit, remove from guard, restore full iOS e2e assertions, and verify with canonical iOS e2e only.

| Probe | Function | Rationale | Status |
|-------|----------|-----------|--------|
| J0-1 | `stringRepeat` | iOS CHANGELOG 12.12.0 | Committed `f14092909`; static/Jest OK; implementer once **146/146**; ⛔ **review e2e gate open** (harness contention — not code regression) |
| J0-2 | `switchOn` | iOS CHANGELOG 12.12.0 | Uncommitted WIP; Jest **24/24**; ⛔ **review e2e gate open** (canonical review never green) |
| J0-3 | `trunc` | iOS CHANGELOG 12.11.0 | **hold** — do not start until J0-2 review gate closes |
| J0-4 | `conditional` | `ConditionalExpression` 12.11.0; iOS bridge → `cond` | |
| J0-5 | `round` | No CHANGELOG; Android + bridge ok | |
| J0-6 | `substring` | No CHANGELOG; docs list function | |
| J0-7 | `timestampAdd` | No CHANGELOG; likely SDK gap or receiver shape | |
| J0-8 | `timestampSubtract` | Same | |
| J0-9 | `arrayGet` | No CHANGELOG; likely needs iOS receiver parity if SDK ok | |

**Output:** Updated guard set in `pipeline_support.ts`; shrunk P-003 e2e reduced pipelines; parity registry classifications confirmed.

### J1–J6 — bridge remediation (after J0)

| Step | Registry | Work |
|------|----------|------|
| **J1** | P-001 | Android operand coercion parity |
| **J2** | P-005 | Android `integerLiteral` constant lowering |
| **J3** | P-010 | Expression-valued `distanceField` / `indexField` on Android |
| **J4** | P-011 | Parser constant envelope routing |
| **J5** | P-012 | `timestampTruncate` arity validation on Android |
| **J6** | P-034 + J0-9 tail | Unify operand-mode + arrayGet e2e after probes |

**Gate for Phase K+:** J0 complete + J1–J6 bridge commits + parity **Resolved** updated.

**Current (post-arbiter):** **J0-2** (`switchOn`) — uncommitted WIP; re-run canonical iOS review e2e after [pre-flight clear](../../testing/running-e2e.md#pre-flight-is-the-host-clear-to-start). **J0-1** committed; review e2e gate still open (harness contention). **J0-3** (`trunc`) — **hold** until J0-2 review gate closes.

---

## Coverage phases (K–Q) — after parity

| Phase | Target |
|-------|--------|
| **K** | `pipeline_runtime.ts` + `expressions.ts` normalization gaps |
| **L** | Android parsed-aggregate expression args (~143 missed) |
| **M** | Android exit frames, receiver chains, vector expression handler (F tail) |
| **N** | iOS stage coercion (~293 missed), operand tail |
| **O** | Android Executor error branches |
| **P** | Jest-only TS validation paths |
| **Q** | Intractability audit (map execute, debug gates, codegen caps) |

**Phase R** — revert harness narrowing; **full** unfocused 3-platform run ([pre-merge tier](../../testing/running-e2e.md#e2e-tiers-implementer--reviewer--pre-merge); final gate before compare-types track).

---

## Harness (local only — do not commit)

- `tests/app.js` — firestore-only + `require('../packages/firestore/e2e/Pipeline.e2e.js')`
- `tests/globals.js` — `RNFBDebug = true` optional for fail-fast

---

## Workflow (each phase)

**Phases I–J (parity):**

1. Audit or implement bridge fix with **shared** e2e assertions.
2. Update OKF parity registry (open/close rows).
3. **Phase J:** follow [Phase J iteration protocol](#phase-j-iteration-protocol-strict) — implement (Jest + **focused** e2e) → review (**area** e2e, frozen tree) → **one** commit; never commit before review e2e; never overlap e2e runs.
4. 3-platform e2e on canonical commands ([running-e2e rules 6–7](../../testing/running-e2e.md)).

**Phases K–Q (coverage):**

1. `bash scripts/map-pipeline-coverage-gaps.sh before-<id>`
2. Prove **live vs dead** before implementing
3. **No new `Platform.*` branches** — if a probe only passes on one platform, stop and file drift for Phase J follow-up
4. OKF background + `:build` (if native) + `:test-cover` + native post-process
5. `bash scripts/map-pipeline-coverage-gaps.sh after-<id>`
6. One focused commit per logical change (message describes **what**, not phase letter)

**Platform pitfalls (retain):** iOS `constant(0/1)` → bool (use `constant(2+)`); raw AND where is Android-native (`Platform.other` skip on macOS — document in registry); emulator hygiene — Detox boots AVD, no manual `emulator -avd`.

---

## Historical notes (A–E)

- **A:** Jet WS coverage transfer; 3-platform TS lcov baseline.
- **B:** Removed Android `buildParsed*` (~690 lines, 0%).
- **C:** `map-pipeline-coverage-gaps.sh`.
- **D:** Subcollection 100%; schedule dispatch 100%; lowering e2e expansion.
- **E:** Executor 49%→58%; database/rawOptions/sample/findNearest/unnest/rawStage e2e.
