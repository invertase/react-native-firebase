# Pipeline coverage — work queue (temporary)

> **STOP (2026-06-25):** Phases **A–G complete** on branch `pipeline-apis-20260622`. **Resume at Phase H.**  
> **Goal:** Raise pipeline coverage (TS + native) toward intractable limits (~100% where reachable).  
> **Deferred:** compare-types / new pipeline exports — separate track after coverage plateaus.  
> **Policy:** [okf-bundle/testing/coverage-design.md](okf-bundle/testing/coverage-design.md)  
> **E2e commands:** [okf-bundle/testing/running-e2e.md](okf-bundle/testing/running-e2e.md) — **only** these commands  
> **Architecture:** [okf-bundle/packages/firestore/pipelines.md](okf-bundle/packages/firestore/pipelines.md)

---

## Resume checklist

1. Clean host: single emulator set; `adb devices` empty or one device before Android e2e ([running-e2e.md](okf-bundle/testing/running-e2e.md)).
2. Background: `yarn tests:emulator:start`, `yarn tests:packager:jet`.
3. **Pending:** Android **134** cross-platform verify for Phase G (`yarn tests:android:build && yarn tests:android:test-cover`) — blocked by emulator conflicts during G; iOS **134** / macOS **129** already green.
4. Start **Phase H** (`pipeline_validate` execute guards) or optional **Phase G tail** iteration (19 operand-mode lines — see below).
5. Full clean cycle when measuring native deltas; never trust stale `.ec`/profraw ([coverage-design § stale data](okf-bundle/testing/coverage-design.md)).

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
| **H** | TS `pipeline_validate` execute guards | **next** | ~28 missed |
| **I** | TS `pipeline_runtime` + `expressions` | queued | guards, timestamp/FieldPath |
| **J** | Android parsed-aggregate tail | queued | ~143 missed |
| **K** | Android exit frames + receiver chains | queued | ~77 loop remainder + exit/receiver |
| **L** | iOS stage coercion | queued | ~293 missed |
| **M** | Android Executor remainder | queued | sub-60% after E |
| **N** | Jest-only TS paths | queued | validation branches |
| **O** | Intractability audit | queued | measured caps per file |
| **P** | Pre-merge harness restore | queued | unfocused 3-platform snapshot |

**Compare-types exports:** out of scope until Phase P.

---

## Current snapshot

**Label:** `after-phase-g` · **Harness:** firestore Pipeline only (local `tests/app.js` — do not commit)

**E2e counts:** macOS **129**, iOS **134**, Android **134 expected** (133 verified post-F; G +1 not re-run on Android)

| Target | Post-E baseline | Now | Last Δ | Open |
|--------|-----------------|-----|--------|------|
| TS `subcollection.ts` | 100% | 100% | — | — |
| TS `pipeline_validate.ts` | 67% | 67% | — | **H** |
| TS `pipeline_runtime.ts` | 86% | 86% | — | I |
| TS `expressions.ts` | 89% | 89% | — | I |
| Android NodeBuilder | 67.5% (1167/1729) | **70.2% (1155/1645)** | F: −183 LOC dead | J, K |
| Android loop L900–1299 | 106 missed | **77 missed** | F: −29 missed | K |
| Android Executor | 58% | 58% | — | M |
| iOS NodeBuilder | 68.89% | **69.84% (1100/1575)** | G: +15 hit | L, tail |
| iOS operand modes L919–1006 | 27 missed | **19 missed** | G: −8 missed | L/O tail |

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
- **Remainder → Phase K:** vector expression handler (expression-vector rhs), exit/receiver tails.

**Lesson:** e2e that passes but moves no probes → audit callers before adding more tests.

### Phase G (iOS operand modes + map passthrough)

- **One e2e:** `coerces bare rhs operands through raw where filters` — raw `.where({ condition: { operator, fieldPath, value }})` with bare string/array/bool rhs (modular API wraps rhs in `exprType: constant` maps and cannot hit operand-mode arms).
- **Result:** iOS NodeBuilder **+0.95 pp**; operand modes **69.32% → 78.41%** (−8 missed).
- **Map passthrough execute success (L1208–1219):** **intractable** — Firestore rejects `map(field(…))` execute; lowering already covered by existing error-path e2e.
- **Operand tail (19 missed):** L928, L948–949, L961–966, L973–974, L990–1006 — likely bridge-only / vector wire / CFBoolean; defer to **Phase L/O** or later iteration.

### Infra side quest (committed `595194643`)

- Detox `FabricTimersIdlingResource` no-op under New Arch (launch crash fix).
- Android post-e2e deletes processed `.ec` (parity with iOS profraw delete).
- OKF: stale coverage → full clean cycle, do not re-report without fresh e2e.

---

## Phase H — next (when resuming)

**Target:** `packages/firestore/lib/pipelines/pipeline_validate.ts` (~28 missed) — per-source throws, `validateExecuteOptions` indexMode/rawOptions.

**Approach:** Modular negative tests + e2e where execute reaches guards. Jest where native e2e cannot.

---

## Queued phases (brief)

| Phase | Target |
|-------|--------|
| **I** | `pipeline_runtime.ts` + `expressions.ts` normalization gaps |
| **J** | Android parsed-aggregate expression args (~143 missed) |
| **K** | Android exit frames, receiver chains, vector expression handler (F tail) |
| **L** | iOS stage coercion (~293 missed), operand tail |
| **M** | Android Executor error branches |
| **N** | Jest-only TS validation paths |
| **O** | Intractability audit (map execute, debug gates, codegen caps) |
| **P** | Revert harness narrowing; unfocused 3-platform run |

---

## Harness (local only — do not commit)

- `tests/app.js` — firestore-only + `require('../packages/firestore/e2e/Pipeline.e2e.js')`
- `tests/globals.js` — `RNFBDebug = true` optional for fail-fast

---

## Workflow (each phase)

1. `bash scripts/map-pipeline-coverage-gaps.sh before-<id>`
2. Prove **live vs dead** before implementing
3. OKF background + `:build` (if native) + `:test-cover` + native post-process
4. `bash scripts/map-pipeline-coverage-gaps.sh after-<id>`
5. One focused commit per logical change (message describes **what**, not phase letter)

**Platform pitfalls (retain):** iOS `constant(0/1)` → bool (use `constant(2+)`); raw AND where is Android-native (`Platform.other` skip on macOS); emulator hygiene — Detox boots AVD, no manual `emulator -avd`.

---

## Historical notes (A–E)

- **A:** Jet WS coverage transfer; 3-platform TS lcov baseline.
- **B:** Removed Android `buildParsed*` (~690 lines, 0%).
- **C:** `map-pipeline-coverage-gaps.sh`.
- **D:** Subcollection 100%; schedule dispatch 100%; lowering e2e expansion.
- **E:** Executor 49%→58%; database/rawOptions/sample/findNearest/unnest/rawStage e2e.
