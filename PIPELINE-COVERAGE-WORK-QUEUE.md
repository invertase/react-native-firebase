# Pipeline coverage — work queue (temporary)

> **IN PROGRESS (2026-06-25):** Phase **H** 3-platform verify ✅ — macOS **141/141**, iOS **146/146**, Android **146/146**. **Commit H** → Phase **I** (parity audit). Uncommitted e2e + native parser fix + OKF.  
> **Goals:** (1) **Platform parity first** — same observable behavior on iOS, Android, and macOS unless a difference is a **native SDK limitation**; drift triaged and closed or **formally documented** in OKF. (2) Then raise pipeline coverage (TS + native) toward intractable limits (~100% where reachable).  
> **Parity policy:** [okf-bundle/packages/firestore/pipeline-platform-parity.md](okf-bundle/packages/firestore/pipeline-platform-parity.md)  
> **Coverage policy:** [okf-bundle/testing/coverage-design.md](okf-bundle/testing/coverage-design.md)  
> **E2e commands:** [okf-bundle/testing/running-e2e.md](okf-bundle/testing/running-e2e.md) — **only** these commands; **one e2e at a time**, **no source edits during runs** (rules 6–7)  
> **Architecture:** [okf-bundle/packages/firestore/pipelines.md](okf-bundle/packages/firestore/pipelines.md)

---

## Phase ordering (2026-06-25)

**Parity before coverage.** Chasing coverage while parity drift remains tends to:

- add per-platform e2e `Platform.*` workarounds instead of fixing bridges;
- hit native arms that differ by platform and mis-read gaps as “intractable”;
- deepen structural drift between Swift and Java lowering paths.

**Sequence from H onward:** commit **H** → **I** parity audit → **J** parity remediation → **K–Q** coverage + intractability → **R** unfocused pre-merge snapshot.

| Old letter | New letter | Focus |
|------------|------------|--------|
| Q | **I** | Platform parity audit |
| R | **J** | Platform parity remediation |
| I | **K** | TS `pipeline_runtime` + `expressions` |
| J | **L** | Android parsed-aggregate tail |
| K | **M** | Android exit frames + receiver chains |
| L | **N** | iOS stage coercion |
| M | **O** | Android Executor remainder |
| N | **P** | Jest-only TS paths |
| O | **Q** | Intractability audit |
| P | **R** | Pre-merge harness restore |

---

## Resume checklist

1. Clean host: single emulator set; `adb devices` empty or one device before Android e2e ([running-e2e.md](okf-bundle/testing/running-e2e.md)).
2. Background: `yarn tests:emulator:start`, `yarn tests:packager:jet`.
3. **Serial e2e only** — one `:test-cover` at a time; no source edits mid-run ([running-e2e.md rules 6–7](okf-bundle/testing/running-e2e.md)).
4. **Phase H commit** (e2e tamper tests + Android parser `isReferencePathConstantMap` fix).
5. **Phase I** — parity audit (inventory + OKF registry); no new coverage probes until **J** closes bridge gaps.
6. Full clean cycle when measuring native deltas; never trust stale `.ec`/profraw ([coverage-design § stale data](okf-bundle/testing/coverage-design.md)).

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
| **H** | TS `pipeline_validate` execute guards | **commit** | 3-platform e2e ✅ **141/141 / 146/146 / 146/146**; parser ref-constant fix |
| **I** | **Platform parity audit** | **next** | drift inventory + SDK vs bridge triage → OKF registry |
| **J** | **Platform parity remediation** | queued | close bridge gaps; revert e2e `Platform.*` workarounds |
| **K** | TS `pipeline_runtime` + `expressions` | queued | guards, timestamp/FieldPath *(was old I)* |
| **L** | Android parsed-aggregate tail | queued | ~143 missed *(was old J)* |
| **M** | Android exit frames + receiver chains | queued | ~77 loop remainder + exit/receiver *(was old K)* |
| **N** | iOS stage coercion | queued | ~293 missed; operand tail *(was old L)* |
| **O** | Android Executor remainder | queued | sub-60% after E *(was old M)* |
| **P** | Jest-only TS paths | queued | validation branches *(was old N)* |
| **Q** | Intractability audit | queued | measured caps per file *(was old O)* |
| **R** | Pre-merge harness restore | queued | unfocused 3-platform snapshot *(was old P)* |

**Compare-types exports:** out of scope until Phase **R**.

**Rule during I–J:** do **not** add new `Platform.android` / `Platform.ios` e2e branches to raise coverage — file as drift and fix in **J** or document as SDK limitation.

---

## Current snapshot

**Label:** `after-phase-h-3platform-green` · **Harness:** firestore Pipeline only (local `tests/app.js` — do not commit)

**E2e counts:** macOS **141**, iOS **146**, Android **146** ✅

| Target | macOS | iOS | Android (gap map) |
|--------|-------|-----|-------------------|
| TS `pipeline_validate.ts` | 82/88 (93.18%) | 78/88 (88.64%) | 78/88 (88.64%) |
| E2e gate | ✅ | ✅ | ✅ |

**Next:** Phase H commit → **Phase I** (parity audit).

| Target | macOS | iOS | Android (gap map) | Phase |
|--------|-------|-----|-------------------|-------|
| TS `pipeline_runtime.ts` | 86% | **90.79% (207/228)** | I-mixed: +8 hit | **K** |
| TS `expressions.ts` | 89% | **93.61% (249/266)** | I-mixed: +4 hit | **K** |
| Android NodeBuilder | 67.5% (1167/1729) | **70.2% (1155/1645)** | F: −183 LOC dead | L, M |
| Android loop L900–1299 | 106 missed | **77 missed** | F: −29 missed | M |
| Android Executor | 58% | 58% | — | O |
| iOS NodeBuilder | 68.89% | **69.84% (1100/1575)** | G: +15 hit | N |
| iOS operand modes L919–1006 | 27 missed | **19 missed** | G: −8 missed | N, Q |
| Known parity drift | — | — | P-001 open | **I, J** |

```bash
bash scripts/map-pipeline-coverage-gaps.sh              # current
bash scripts/map-pipeline-coverage-gaps.sh after-phase-g
bash scripts/map-pipeline-coverage-gaps.sh after-phase-f-dead-removal
```

---

## Branch commits (A–G)

| Commit | Summary |
|--------|---------|
| `595194643` | Android e2e infra: Detox FabricTimers, `.ec` delete, OKF stale-coverage docs |
| `6425ee139` | Android NodeBuilder: remove dormant lowering duplicates (Phase F) |
| `fba73ce8d` | E2e: expression frame lowering regression cases (Phase F) |
| `e909a9be1` | E2e: iOS operand modes via raw where filters (Phase G) |

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

### Infra side quest (committed `595194643`)

- Detox `FabricTimersIdlingResource` no-op under New Arch (launch crash fix).
- Android post-e2e deletes processed `.ec` (parity with iOS profraw delete).
- OKF: stale coverage → full clean cycle, do not re-report without fresh e2e.

---

## Phase H — complete (2026-06-25)

**Commit pending:** `packages/firestore/e2e/Pipeline.e2e.js` (+6 tamper tests), Android parser/node-builder ref-constant fix, OKF parity docs.

- Six e2e tests tamper `_source`/`_stages` before `execute()` to hit JS validation guards.
- **Result:** 65/88 → **82/88 (93.18%)** on macOS (+17 lines).
- **Remaining 6 lines → Phase P/Q:** L96 (valid subcollection return), L175/L181 (runtime-unreachable pending/stages guards), L208/L212 (parseExecuteInput short-circuit), L230 (rawOptions isolated throw). Jest `pipelines-validate.test.ts` covers direct-call paths.
- **Android parser fix:** document-reference `{ path: "col/doc" }` constants — verified **146/146** on r3.

---

## Phase I — platform parity audit (next)

**Goal:** Complete inventory of behavioral drift before any further coverage work.

**Steps:**

1. Grep `Platform.(ios|android|other)` and iOS-reduced pipelines in `Pipeline.e2e.js`.
2. Compare live native paths (NodeBuilder, Parser, Executor) — not dormant clusters.
3. Cross-check `pipeline_support.ts` guards and e2e count deltas (macOS **141** vs iOS/Android **146**).
4. Triage each item: `SDK` | `bridge` | `test-only` | `macOS-js`.
5. Extend [pipeline-platform-parity.md](okf-bundle/packages/firestore/pipeline-platform-parity.md) registry; produce ordered **Phase J** remediation list.

**Deliverable:** Full drift registry + J work breakdown. **No new coverage probes** in this phase.

**Seed rows:** P-001 (Android operand coercion), P-003–P-006 in parity doc; P-002 closed (parser fix, pending H commit).

---

## Phase J — platform parity remediation (queued)

**Goal:** Close **bridge** gaps from Phase I; leave only SDK-documented differences.

**Priority items (from seeds):**

- **P-001** — Android numeric operand coercion parity with iOS; revert `Platform.android` split in `coerces bare rhs operands through raw where filters`.
- Any new **bridge** rows from Phase I audit.

**Done when:** No e2e workaround without an OKF row marked `SDK`; 3-platform e2e green with shared assertions where macOS has native bridge.

**Gate for Phase K+:** Phase J commit + updated parity registry.

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

**Phase R** — revert harness narrowing; unfocused 3-platform run (final gate before compare-types track).

---

## Harness (local only — do not commit)

- `tests/app.js` — firestore-only + `require('../packages/firestore/e2e/Pipeline.e2e.js')`
- `tests/globals.js` — `RNFBDebug = true` optional for fail-fast

---

## Workflow (each phase)

**Phases I–J (parity):**

1. Audit or implement bridge fix with **shared** e2e assertions.
2. Update OKF parity registry (open/close rows).
3. 3-platform e2e on canonical commands.
4. One focused commit per logical change.

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
