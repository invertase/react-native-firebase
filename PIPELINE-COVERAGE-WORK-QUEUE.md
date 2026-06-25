# Pipeline coverage — work queue (temporary)

> **Status:** Phases A–E **complete** — Phases F–P queued for coverage expansion  
> **Goal:** Raise pipeline coverage (TS + native) toward intractable limits (~100% where reachable).  
> **Deferred:** compare-types / new pipeline exports — separate track after coverage plateaus.  
> **Policy:** [okf-bundle/testing/coverage-design.md](okf-bundle/testing/coverage-design.md)  
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
| **F** | Android expression loop (literal lowering) | queued | ~106 missed lines in `EnterObjectExpressionFrame` loop |
| **G** | iOS operand modes + map passthrough (success) | queued | ~29 operand-mode lines; `map(field(…))` live path |
| **H** | TS `pipeline_validate` execute guards | queued | ~29 missed; negative Modular/e2e |
| **I** | TS `pipeline_runtime` + `expressions` gaps | queued | guards, timestamp/FieldPath, runtime-node literals |
| **J** | Android parsed-aggregate expression args | queued | ~143 missed mixed-live tail |
| **K** | Android exit frames + receiver chains | queued | ~97 + ~57 missed |
| **L** | iOS stage coercion (incremental) | queued | ~293 missed — error branches first, then options |
| **M** | Android Executor error branches (remainder) | queued | ~42% of file still open after Phase E |
| **N** | Jest-only TS paths | queued | validation branches impractical in native e2e |
| **O** | Intractability audit | queued | Document unmappable lines (debug gates, codegen) |
| **P** | Pre-merge harness restore + full snapshot | queued | Revert area narrowing; unfocused 3-platform run |

**Compare-types exports:** explicitly **out of scope** for this queue until Phase P sign-off.

---

## Current coverage snapshot

**Label:** `after-iter4-executor-parser-bridge` (regenerate after each phase)

**E2e counts (firestore Pipeline harness):** macOS **123**, iOS/Android **128** pass.

| Target | Baseline (Phase A) | Now | Open |
|--------|-------------------|-----|------|
| TS `subcollection.ts` | 40% | **100%** | — |
| TS `pipeline_validate.ts` | 67% | 67% | Phase H |
| TS `pipeline_runtime.ts` | 85.5% | 86% | Phase I |
| TS `expressions.ts` | 89% | 89% | Phase I |
| Android NodeBuilder | 55% | **68%** | Phases F, J, K |
| Android Executor | 49% | **58%** | Phase M |
| Android Parser | 79% | 81% | incremental |
| iOS NodeBuilder | 66.5% | **69%** | Phases G, L |
| iOS BridgeFactory | 78.5% | **83%** | incremental |
| iOS CallHandler | 71% | **83%** | incremental |
| iOS Parser | 83% | 84% | incremental |

```bash
bash scripts/map-pipeline-coverage-gaps.sh after-iter4-executor-parser-bridge
```

---

## Phase details (queued)

### Phase F — Android expression loop

**Target:** `ReactNativeFirebaseFirestorePipelineNodeBuilder.java` L900–1299 (~106 missed).

**Hypothesis:** e2e must exercise dynamic `array([field, add(…)])` and `map({ k: expr })` shapes that force non-constant literal lowering (not just execute success with pre-covered frames).

**Done when:** missed count in region drops materially; 3-platform e2e green.

### Phase G — iOS operand modes + map passthrough

**Target:** `coerceExpressionTree` L919–1006 (~29 missed); iOS map passthrough L1208–1219.

**Hypothesis:** need success-path `map(field(…))` passthrough (not only error-path); bool rhs in arithmetic/comparison with shapes that hit operand-mode arms.

**Intractable note:** some bool-in-arithmetic paths may be macOS/web-only — document if native iOS cannot express.

### Phase H — TS `pipeline_validate`

**Target:** per-source throws (`collection`, `collectionGroup`, `query`, `documents`, `subcollection`); `validateExecuteOptions` indexMode/rawOptions.

**Approach:** Modular API negative tests + e2e where execute reaches guards.

### Phase I — TS runtime + expressions normalization

**Target:** `pipeline_runtime.ts` (assertSameFirestoreInstance, parseTimestamp arms, replaceWith options); `expressions.ts` (runtime nodes embedded in literals).

### Phase J — Android parsed-aggregate tail

**Target:** `coerceAliasedAggregate` / `aggregateWithParsedValue` / `rawAggregate` default (~143 missed, live).

**Approach:** e2e with `arrayAgg`, `first`, `last`, `min`, `max` on computed expression args (extend Phase D partial work).

### Phase K — Android exit frames + receiver chains

**Target:** L1300–1964 exit frames (~97 missed); L2208–2500 receiver chains (~57 missed).

### Phase L — iOS stage coercion (staged)

**Target:** L1–893 (~293 missed) — largest hole.

**Approach:** batch by stage family (sample, findNearest, rawStage, unnest options, database source) — error paths before happy paths.

### Phase M — Android Executor remainder

**Target:** sub-60% Executor after Phase E — stage apply errors, source builders, result parsing.

### Phase N — Jest-only TS

Unit tests for validation-only branches where e2e cannot reach without contrived harness.

### Phase O — Intractability audit

Per [coverage policy](okf-bundle/testing/coverage-design.md): name and measure gaps that cannot close (e.g. iOS `RNFBFirestorePipelineDebug` log gate).

**Deliverable:** table in this doc + OKF bundle with `%` caps per file.

### Phase P — Pre-merge

- Revert `tests/app.js` / `tests/globals.js` narrowing
- Full unfocused e2e + coverage all platforms
- Final snapshot label: `pre-merge-coverage-<date>`

---

## Harness (local only — do not commit)

- `tests/app.js` — firestore-only + direct `Pipeline.e2e.js` require
- `tests/globals.js` — `RNFBDebug = true`

---

## Workflow (each phase)

1. `bash scripts/map-pipeline-coverage-gaps.sh before-<phase-id>`
2. Implement (e2e and/or Jest; dead-code removal only with coverage proof)
3. Full 3-platform `:test-cover` + native post-processing
4. `bash scripts/map-pipeline-coverage-gaps.sh after-<phase-id>`
5. One focused commit; messages describe **what** changed, not phase letters

---

## Completed phase notes

### Phase A — Baseline

Jet client `uploadCoverage()` WS handshake; `babel-plugin-istanbul`; 3-platform TS lcov verified.

### Phase B — Dead code

Removed Android `buildParsed*` / `booleanExpressionFromParsedFunction` cluster (690 lines, 0% coverage).

### Phase C — Gap map

`scripts/map-pipeline-coverage-gaps.sh` — region-level missed-line report from lcov/Jacoco.

### Phase D — Native lowering e2e

Subcollection options overload; array/map literal lowering; schedule dispatch edges; operand rhs shapes; aggregate expression args.

### Phase E — Executor / bridge e2e

`database()` source; rawOptions errors; sample/findNearest/unnest; rawStage bridge; validation boundaries.
