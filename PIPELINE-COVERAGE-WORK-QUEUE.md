# Pipeline coverage — work queue (temporary)

> **Status:** Phases A–G **complete** — Phase H **next** — Phases I–O queued  
> **Goal:** Raise pipeline coverage (TS + native) toward intractable limits (~100% where reachable).  
> **Deferred:** compare-types / new pipeline exports — separate track after coverage plateaus.  
> **Policy:** [okf-bundle/testing/coverage-design.md](okf-bundle/testing/coverage-design.md)  
> **E2e commands:** [okf-bundle/testing/running-e2e.md](okf-bundle/testing/running-e2e.md) — **only** these commands for verification  
> **Architecture:** [okf-bundle/packages/firestore/pipelines.md](okf-bundle/packages/firestore/pipelines.md)

---

## Phase table

| Phase | Focus | Status | Notes |
|-------|--------|--------|-------|
| **A** | Baseline e2e + Jet TS coverage transfer | ✅ | 3-platform verify; harness + jet patch |
| **B** | Android dormant dead-code removal | ✅ | `buildParsed*` cluster; NodeBuilder 55%→66% |
| **C** | Live-path gap map + tooling | ✅ | `map-pipeline-coverage-gaps.sh` |
| **D** | Native lowering e2e expansion | ✅ | subcollection 100%; schedule dispatch 100% |
| **E** | Executor / Parser / BridgeFactory e2e | ✅ | Android Executor 49%→58%; iOS BridgeFactory 83% |
| **F** | Android L900–1299 lowering region | **done (dead removal)** | loop 106→77 missed; NodeBuilder 67.5%→70.2% |
| **G** | iOS operand modes + map passthrough | **done (e2e)** | operand 69/88 (+8); map passthrough execute success intractable |
| **H** | TS `pipeline_validate` execute guards | queued | ~29 missed; negative Modular/e2e |
| **I** | TS `pipeline_runtime` + `expressions` gaps | queued | guards, timestamp/FieldPath, runtime-node literals |
| **J** | Android parsed-aggregate expression args | queued | ~143 missed mixed-live tail |
| **K** | Android exit frames + receiver chains | queued | ~97 + ~57 missed (partial overlap with F region) |
| **L** | iOS stage coercion (incremental) | queued | ~293 missed — error branches first |
| **M** | Android Executor error branches (remainder) | queued | ~42% of file still open after Phase E |
| **N** | Jest-only TS paths | queued | validation branches impractical in native e2e |
| **O** | Intractability audit | queued | Document unmappable lines (debug gates, codegen) |
| **P** | Pre-merge harness restore + full snapshot | queued | Revert area narrowing; unfocused 3-platform run |

**Compare-types exports:** explicitly **out of scope** for this queue until Phase P sign-off.

---

## Current coverage snapshot

**Label:** `after-phase-f-dead-removal` (133 Android tests; loop 77 missed)

**E2e counts (firestore Pipeline harness):** macOS **128**, iOS/Android **133** pass.

| Target | Phase E baseline | Current | Δ Phase F | Open |
|--------|------------------|---------|-----------|------|
| TS `subcollection.ts` | 100% | 100% | — | — |
| TS `pipeline_validate.ts` | 67% | 67% | — | H |
| TS `pipeline_runtime.ts` | 86% | 86% | — | I |
| TS `expressions.ts` | 89% | 89% | — | I |
| Android NodeBuilder | **1167/1729 (67.5%)** | **1155/1645 (70.2%)** | **+84 lines removed** | J, K |
| Android loop L900–1299 | **128/234 (106 missed)** | **165/242 (77 missed)** | **−29 missed** | K (vector handler) |
| Android Executor | 58% | 58% | — | M |
| iOS NodeBuilder | 69% | **69.8%** | **+0.95% (operand modes)** | L, remainder |

```bash
bash scripts/map-pipeline-coverage-gaps.sh android
```

**Label:** `after-phase-g` (134 iOS / 129 macOS tests; Android blocked emulator conflict)

---

## Phase G — progress (2026-06-25)

### Done

- One e2e test in `operand mode rhs shape coverage`: **`coerces bare rhs operands through raw where filters`** — raw `.where({ condition: { operator, fieldPath, value }})` shapes deliver bare string/array/bool rhs to iOS `comparisonOperand` / `numericOperand` (Parser serializes function args as primitives, not `exprType: constant` maps).

### Coverage outcome (`before-phase-g` → `after-phase-g`)

| Target | Before | After | Δ |
|--------|--------|-------|---|
| iOS NodeBuilder total | 1085/1575 (68.89%) | **1100/1575 (69.84%)** | **+15 hit** |
| iOS operand modes L919–1006 | 61/88 (69.32%), 27 missed | **69/88 (78.41%), 19 missed** | **+8 hit, −8 missed** |
| iOS map passthrough L1208–1219 | 1 hit/line (error e2e) | unchanged | no delta |

### E2e added

| Test | Target | Result |
|------|--------|--------|
| `coerces bare rhs operands through raw where filters` | comparisonOperand array/bool/string; numericOperand bool (`>=`, `value: true`) | **+8 operand probes** |
| *(rejected)* `executes map field passthrough through native lowering` | map passthrough execute success | Firestore `invalid-argument` for `map(field(…))`, `map(mapMerge(…))` |

### Intractable / remainder (Phase G tail → Phase L / O)

- **Map passthrough execute success (L1208–1219):** lowering already hit by `lowers map non-literal arguments through native passthrough lowering` (error path completes enter + `mapPassthroughExit`); Firestore rejects all `map(nonLiteral)` execute shapes tried (`map(field)`, `map(mapMerge)`, nested `map(map(…))`).
- **Operand modes still missed (19 lines):** L928 (`expressionValue` bare scalar fallback); L948–949 (comparisonOperand → re-enter expression); L961–962 (numericOperand bare array); L965–966 (numericOperand bare string); L973–974 (CFBoolean `NSNumber`); L990–1006 (`vectorExpressionValue` `{values:…}` map + fallbacks). Likely need raw-stage injection or bridge-only shapes — defer to Phase L/O unless raw `.where`/`addFields` wire formats found.

### 3-platform test counts

| Platform | Before | After | Notes |
|----------|--------|-------|-------|
| iOS | 133 | **134** | +1 test green |
| macOS | 128 | **129** | +1 test green |
| Android | 133 | *(not run)* | emulator conflict (`Another emulator instance is running`) |

---

## Phase F — progress (2026-06-25)

### Done

- Five e2e tests in `enter object expression frame lowering coverage` (`Pipeline.e2e.js`, uncommitted) — **3-platform green** (128 macOS / 133 iOS / 133 Android).
- Trustworthy Jacoco restored; full OKF Android cycle verified (2026-06-24 evening).
- **Coverage outcome:** Phase F e2e moved **zero** probes in NodeBuilder total or L900–1299 region vs Phase E baseline.

### Interpretation

The gap script region **L900–1299** is not only `EnterObjectExpressionFrame` — it also includes `EnterObjectBooleanFrame`, `EnterObjectValueOrExpressionFrame` entry, `EnterObjectVectorExpressionValueFrame` handler, and related arms inside `processObjectLoweringStack`. Phase F tests targeted expression/boolean lowering shapes; Jacoco shows **106 lines still missed** with **zero delta**.

**Next step (mandatory):** for each missed cluster, prove **live** (reachable from TS/bridge serialization → add e2e) or **dead** (no callers → remove like Phase B). Do not add more e2e blindly.

### Phase F e2e added (uncommitted)

| Test | Intended target | Jacoco result |
|------|-----------------|---------------|
| `lowers array and map slots with direct constant and field exprType nodes` | non-all-constant array/map literal slots | no loop delta |
| `lowers conditional boolean value frames through native lowering` | `EnterObjectBooleanValueFrame` (iOS skipped) | no loop delta |
| `lowers raw operator AND and comparison boolean shapes in where filters` | `EnterObjectBooleanFrame` AND (Android-only) | no loop delta |
| `lowers arrayConcat through value-or-expression literal slots` | value-or-expression lowering | no loop delta |
| `lowers countIf boolean predicate through boolean value lowering frames` | boolean value frames | no loop delta |

**Rejected e2e shapes** (Firestore `invalid-argument`, not native bugs): bare `field()` as boolean; nested `{ condition: { condition } }`; vector `array([field, field])` in distance args.

**Platform pitfalls:** iOS `constant(0/1)` → bool — use `constant(2+)`; raw AND where is Android-native (`Platform.other` skip on macOS).

### Phase F audit (2026-06-25, subagent)

**Confirmed dead (removed):**
- `lowerValueOrExpressionObject` / `resolveValueOrExpression` / `resolveValueOrExpressionNode` — zero callers; live path pushes `EnterObjectValueOrExpressionFrame` directly (arrayConcat L1646).
- `lowerVectorExpressionValueObject` / `coerceVectorExpressionValue` — zero callers; live path pushes `EnterObjectVectorExpressionValueFrame` directly (vector distance L1691).
- `EnterObjectExpressionFrame` bare String / Expression SDK / scalar constant arms — execute path always arrives via `serializeExpressionNode` (exprType maps).
- `EnterObjectExpressionFrame` `operator` → boolean sub-frame delegate + `EnterObjectBooleanFrame` raw `operator`/`condition` arms — duplicate `ReactNativeFirebaseFirestorePipelineParser.parseExpressionValueTree` (operators normalized to `name: and|or|equal|…` before lowering).
- `mapOperatorToFunctionName` — orphaned by boolean raw-operator removal.

**Live (unchanged; still missed — Phase F e2e could not reach):**
- `EnterObjectExpressionFrame` `exprType: constant|field`, `name` function dispatch, `.expr`/`.expression` unwrap, boolean `name` logical/comparison via `scheduleBooleanFunctionLowering`.
- `EnterObjectValueOrExpressionFrame` handler (arrayConcat slots).
- `EnterObjectVectorExpressionValueFrame` handler — needs expression-vector rhs e2e (not constant `[0,1]`); re-scope remainder to Phase K if needed.

**Why prior Phase F e2e moved zero probes:** raw `.where({ condition: { operator: AND }})` is normalized in Parser pass 1; NodeBuilder only sees `{ exprType: Function, name: and, args: … }`.

### Missed-line clusters (Jacoco, L900–1299, 106 lines)

Grouped for live/dead audit (orchestrator static pre-scan — **subagent must confirm**):

| Lines | Code | Hypothesis |
|-------|------|------------|
| **938–942** | `lowerValueOrExpressionObject` entry | **Dead?** — no callers; `resolveValueOrExpression` / `resolveValueOrExpressionNode` also uncalled |
| **947–951** | `lowerVectorExpressionValueObject` entry | **Dead?** — `coerceVectorExpressionValue` uncalled; vector distance pushes `EnterObjectVectorExpressionValueFrame` directly (L1691) |
| **967–977** | Expression frame: bare `String`, pre-built `Expression` | **Live** — need serialization shapes that arrive as String or Expression refs |
| **990–993** | Expression frame: scalar constants | **Live?** — may already route via `exprType: constant` (L1084+) instead |
| **1008–1017** | `.expr` / `.expression` unwrap | **Live** — nested serialized expression wrappers |
| **1022–1035** | operator map → boolean sub-frame | **Live** — boolean operator objects inside expression context |
| **1084–1105** | `exprType: constant`, fieldPath variants, fallthrough throw | **Live** / error path |
| **1124–1270** | `EnterObjectBooleanFrame` body (AND/OR, comparisons, nesting) | **Live** — raw AND e2e did not move probes; verify which bridge path handles `.where({ condition })` |
| **1287–1299** | `EnterObjectVectorExpressionValueFrame` handler | **Live** — vector distance / findNearest; entry wrapper dead, handler may be live |

### Phase F — closed (2026-06-25)

Dead-code removal satisfied done-when #1 (loop **106 → 77 missed**). Remaining **77** live misses → **Phase K**. Commits: `6425ee139` (native), e2e in following commit.

---

## Phase details (queued)

### Phase G — iOS operand modes + map passthrough

**Target:** `coerceExpressionTree` operand modes (~29 missed); iOS map passthrough L1208–1219.

**Closed 2026-06-25:** +8 operand-mode probes via raw-where e2e; map passthrough execute success documented intractable (lowering covered by existing error e2e).

### Phase H — TS `pipeline_validate`

Per-source throws; `validateExecuteOptions` indexMode/rawOptions.

### Phase I — TS runtime + expressions

`pipeline_runtime.ts` guards; `expressions.ts` runtime-node literals.

### Phase J — Android parsed-aggregate tail

~143 missed in aggregate coercion tail.

### Phase K — Android exit frames + receiver chains

L1300+ exit frames (~97 missed); L2208+ receiver chains (~57 missed). Overlaps structurally with tail of F region — coordinate after F audit.

### Phase L — iOS stage coercion

Largest iOS hole (~293 missed); batch by stage family.

### Phase M — Android Executor remainder

Sub-60% after Phase E.

### Phase N — Jest-only TS

Validation branches impractical in native e2e.

### Phase O — Intractability audit

Per coverage policy: name unmappable lines with measured caps.

### Phase P — Pre-merge

Revert harness narrowing; unfocused 3-platform run; snapshot `pre-merge-coverage-<date>`.

---

## Harness (local only — do not commit)

- `tests/app.js` — firestore-only + direct `Pipeline.e2e.js` require
- `tests/globals.js` — `RNFBDebug = true` optional

---

## Workflow (each phase)

Per [running-e2e.md](okf-bundle/testing/running-e2e.md) and [coverage-design.md](okf-bundle/testing/coverage-design.md):

1. `bash scripts/map-pipeline-coverage-gaps.sh before-<phase-id>`
2. Implement (e2e and/or dead-code removal — **prove live vs dead first**)
3. Background: `yarn tests:emulator:start`, `yarn tests:packager:jet`
4. Full 3-platform `:build` (if native changed) + `:test-cover`; iOS `tests:ios:test:process-coverage`; Android `tests:android:post-e2e-coverage`
5. `bash scripts/map-pipeline-coverage-gaps.sh after-<phase-id>`
6. One focused commit; messages describe **what** changed, not phase letters

**Stale coverage:** if numbers look wrong, full clean cycle per platform — do not re-post-e2e without fresh e2e ([coverage-design § stale data](okf-bundle/testing/coverage-design.md)).

---

## Completed phase notes

### Phase A — Baseline

Jet WS `uploadCoverage`; babel-plugin-istanbul; 3-platform TS lcov.

### Phase B — Dead code

Removed Android `buildParsed*` cluster (~690 lines, 0% coverage).

### Phase C — Gap map

`scripts/map-pipeline-coverage-gaps.sh`.

### Phase D — Native lowering e2e

Subcollection; array/map literals; schedule dispatch; operand rhs; aggregate expression args.

### Phase E — Executor / bridge e2e

`database()` source; rawOptions; sample/findNearest/unnest; rawStage bridge.

### Side quest (committed)

Detox FabricTimers idling fix; Android `.ec` delete after post-e2e; OKF stale-coverage docs.
