---
type: Reference
title: Pipeline implementation workflow (compare-types iterations)
description: Canonical workflow for closing one Firestore Pipelines compare-types gap — gap analysis, baseline coverage, subagent implementation and review, documentation, and commit.
tags: [firestore, pipelines, compare-types, workflow, coverage, subagent]
timestamp: 2026-06-24T00:00:00Z
---

# Pipeline implementation workflow

This is the **single source of truth** for implementing one missing export from `.github/scripts/compare-types/configs/firestore-pipelines.ts`. The `pipeline-implementer` skill and any agent prompt must **link here** rather than duplicate steps.

Each iteration closes **one** compare-types backlog entry and produces **one** focused commit.

## Architecture and semantics (read first)

| Topic | Document |
|-------|----------|
| Bridge design, subqueries, coercion, native coverage strategy | [Pipelines implementation design](pipelines.md) |
| E2e commands, fast iteration hacks, handoff rules | [Running e2e tests](../../testing/running-e2e.md) |
| Coverage policy, per-file reading, refactor-vs-test | [Coverage design](../../testing/coverage-design.md) |
| All validation commands | [Validation checklist](../../testing/validation-checklist.md) |
| Serialization tests per export | [Serialization testing](serialization-testing.md) |
| Compare-types machinery | `.github/scripts/compare-types/README.md` |

## Hard gates (blocking)

Do **not** commit or hand off until **all** are true:

| Gate | Requirement |
|------|-------------|
| Gap analysis | Selected export confirmed against firebase-js-sdk; platform support verified; semantic dependencies identified |
| Baseline e2e | Full `Pipeline.e2e.js` on macOS, iOS, Android (no `.only`; area narrowing OK) |
| Baseline coverage | `snapshot-pipeline-coverage.sh before-<export>` stdout recorded |
| Implementation | Public API, lowering, Jest, serialization matrix, consumer type-test, focused e2e |
| Review e2e | Full `Pipeline.e2e.js` on all three platforms — **no** `it.only` / `describe.only`; **area narrowing** in `tests/app.js` + `tests/globals.js` is allowed |
| Review coverage | `after-<export>` snapshot; [coverage policy](../../testing/coverage-design.md#coverage-as-completion-signal) |
| Validation | Full [Validation checklist](../../testing/validation-checklist.md) + OKF review § |
| Documentation | User docs + OKF bundle updates (decisions/learnings consolidated) |
| Commit | One focused commit; area narrowing and `.only` never staged |

**Coverage acceptance:** [Coverage design § completion signal](../../testing/coverage-design.md#coverage-as-completion-signal) and [expectations (policy)](../../testing/coverage-design.md#coverage-expectations-policy).

### Coverage snapshots (pipeline)

After full e2e on all three platforms:

```bash
bash <skill-root>/scripts/snapshot-pipeline-coverage.sh before-<export-name>
bash <skill-root>/scripts/snapshot-pipeline-coverage.sh after-<export-name>
```

Script lives in primary clone `.agents/skills/pipeline-implementer-gitctx/scripts/`. Paste stdout in the iteration report.

## Orchestration model

The coordinating agent runs gap analysis and baseline, then delegates implementation and review to **separate subagents** so implementation bias does not substitute for independent verification.

```mermaid
flowchart TD
  A[Phase A: Gap analysis] --> B[Phase B: Baseline e2e + coverage]
  B --> C[Phase C: Subagent — implement]
  C --> D[Phase D: Subagent — review]
  D --> E[Phase E: Documentation]
  E --> F[Phase F: Commit]
```

| Phase | Actor | OKF docs to load |
|-------|-------|------------------|
| A | Coordinator | This doc § Phase A; `firestore-pipelines.ts`; compare-types README |
| B | Coordinator | Baseline e2e + `before-<export>` — area narrowing OK, no `.only` |
| C | **Implementer subagent** | [pipelines.md](pipelines.md); [serialization-testing.md](serialization-testing.md); [narrowing § below](#narrowing-during-pipeline-iterations) |
| D | **Reviewer subagent** | [validation-checklist.md](../../testing/validation-checklist.md); [narrowing § below](#narrowing-during-pipeline-iterations) |
| E | Coordinator or implementer | `docs/firestore/pipelines/` conventions below |
| F | Coordinator | Commit scope below |

### Subagent: implement (Phase C)

Launch with `subagent_type: generalPurpose` (or platform specialist if native-heavy). Prompt must include:

- Selected export name and firebase-js-sdk reference paths (`node_modules/@firebase/firestore/pipelines/pipelines.d.ts`, `dist/pipelines.esm.js`)
- Instruction to follow [pipelines.md](pipelines.md) patterns only — no new abstractions for one export
- **Fast iteration:** per [narrowing § below](#narrowing-during-pipeline-iterations) and [running-e2e](../../testing/running-e2e.md#fast-iteration-test-narrowing)
- **Serialization blocking:** [serialization-testing.md](serialization-testing.md) all four checks
- Deliverable: implementation diff, unit/e2e tests, consumer type-test updates; **do not commit**

### Subagent: review (Phase D)

Launch fresh (not resumed from implementer). Prompt must include:

- Implementer diff summary and export name
- **Revert** `it.only` / `describe.only`; **area narrowing may remain** per [narrowing § below](#narrowing-during-pipeline-iterations)
- Run the full [Validation checklist](../../testing/validation-checklist.md) (no `:test-cover-reuse`)
- Run full `Pipeline.e2e.js` e2e + coverage on macOS, iOS, Android; record `after-<export>` snapshot
- Compare coverage to baseline; coverage on touched files must rise until intractable limits or plateau → refactor
- Deliverable: pass/fail report with command list and coverage delta; **do not commit**

If review fails, return to Phase C (implementer fixes) then re-run Phase D.

### Narrowing during pipeline iterations

Generic narrowing definitions: [running-e2e § test narrowing](../../testing/running-e2e.md#fast-iteration-test-narrowing). Pipeline-specific phase rules:

| Kind | Phase C (implement) | Phase D (review) | Commit |
|------|---------------------|------------------|--------|
| **Area narrowing** (`tests/app.js`, `tests/globals.js`) | Allowed | Allowed — full `Pipeline.e2e.js`, no `.only` | Never |
| **Single-test** (`it.only`) | Allowed | Revert | Never |
| **Single-suite** (`describe.only`) | Allowed | Revert | Never |

Example area setup: firestore-only `platformSupportedModules` + `require('../packages/firestore/e2e/Pipeline.e2e.js')`; `RNFBDebug = true` in `tests/globals.js`.

## Phase A — Compare-types gap analysis

### Work queue: `missingInRN`

The primary iteration queue is **`missingInRN`** in `.github/scripts/compare-types/configs/firestore-pipelines.ts`.

1. Read the config in **file order**.
2. Select the **first still-relevant** `missingInRN` entry unless a **semantic companion** must ship first (e.g. `variable()` before a lambda helper that references it).
3. Confirm shape from installed SDK:
   - `node_modules/firebase/package.json` → `exports["./firestore/pipelines"]`
   - `node_modules/@firebase/firestore/pipelines/pipelines.d.ts`
   - `node_modules/@firebase/firestore/dist/pipelines.esm.js`
4. Check platform feasibility using [pipelines.md](pipelines.md) (iOS unsupported list, Android/iOS parser invariants, macOS web path). If blocked on any required platform, **stop and report** — do not implement.
5. Run `yarn compare:types` to confirm the entry is still undocumented drift (not stale).
6. Note ordering dependencies: do not skip ahead in the config file without user approval; companions that are also listed may need to be implemented in the same iteration only when the selected API is unusable without them.

**Compare-types config is a backlog, not a permission slip.** Remove a `missingInRN` entry only when RNFB exports match the firebase-js-sdk shape.

### Shape differences: `differentShape`

Entries in **`differentShape`** are not the default work queue, but each one must be **fully justified** as a strict technical requirement that is **completely intractable** in the React Native context (bridge constraints, platform SDK gaps, Hermes/Metro limits, etc.).

- If a `differentShape` entry **cannot** be defended from that perspective, treat **SDK alignment** as a valid task — fix RNFB types/implementation to match firebase-js-sdk and remove the config entry.
- Do not treat `differentShape` as a permanent escape hatch for avoidable drift (formatting-only differences, naming we could match, optional parameters we could add).
- When implementing a `missingInRN` export, do not introduce new `differentShape` drift without the same intractability bar.

`extraInRN` entries document RN-specific surface; justify similarly or remove when no longer needed.

## Phase B — Coverage baseline (before coding)

Skip only when continuing immediately after a prior item's `after-<export>` snapshot in the **same session** on the same worktree.

**Retroactive baseline:** If implementation was already committed without baseline numbers, check out the parent commit, apply harness only if needed for e2e load, run full Phase B, snapshot `before-<export>`, return to HEAD.

1. Revert any leftover **single-test** or **single-suite** narrowing (`.only`). Area narrowing in `tests/app.js` / `tests/globals.js` is allowed for pipeline baseline runs.
2. Start [running e2e prerequisites](../../testing/running-e2e.md): emulators, packager, rebuild native if needed.
3. Full pipeline e2e + coverage on **macOS, iOS, Android** — no `:test-cover-reuse` variants.
4. `bash <skill-root>/scripts/snapshot-pipeline-coverage.sh before-<export-name>` — paste full stdout into the iteration report.

Do not start Phase C until baseline e2e is green on all three platforms.

## Phase C — Implement (subagent)

1. Trace patterns in `packages/firestore/lib/pipelines/`, `internal.ts`, native parsers, web bridge.
2. Implement public API matching firebase-js-sdk **exactly** (including lowercase string unions — native may normalize internally).
3. Add Jest, consumer `type-test.ts`, serialization matrix, e2e cases.
4. Use single-test/suite narrowing during development; area narrowing may persist — [narrowing §](#narrowing-during-pipeline-iterations).
5. Re-run at least one platform e2e per fix while packager stays up.

## Phase D — Review (subagent)

1. Remove `it.only` / `describe.only`.
2. Keep area narrowing if applied — [narrowing §](#narrowing-during-pipeline-iterations).
3. Full [Validation checklist](../../testing/validation-checklist.md).
4. Full `Pipeline.e2e.js` e2e + coverage on all platforms; `after-<export>` snapshot.
5. Compare before/after; coverage on touched files must rise until intractable technical limits; plateau below that → refactor before approving.
6. Remove `firestore-pipelines.ts` entry when shape matches.

## Phase E — Documentation

Per export (same commit as implementation):

**User docs**

- Page or section under `docs/firestore/pipelines/`
- Parity table row on pipelines overview
- `docs.json` sidebar entry for new pages
- `yarn lint:markdown` and `yarn lint:spellcheck`

**OKF bundle maintenance**

Review, consolidate, and extend the bundle with decisions and learnings from this iteration — same commit when the knowledge is durable:

- **`okf-bundle/packages/firestore/`** — update `pipelines.md`, `serialization-testing.md`, or this workflow when bridge behaviour, gotchas, or phase rules changed; add new pages only when a topic outgrows an existing doc.
- **Cross-cutting** — if testing or coverage learnings apply beyond pipelines, update `okf-bundle/testing/` (see [Validation checklist § OKF bundle review](../../testing/validation-checklist.md#okf-bundle-review)).
- **Consolidate** — move any ad-hoc notes from the iteration report or skill output into OKF; remove or fix conflicting statements in linked docs so the bundle stays the single source of truth.
- **Decisions** — record non-obvious choices (e.g. standalone-only fluent export, intractable `differentShape` justification, dormant native path removed) in the relevant OKF doc, not only in commit messages.

Skills and other docs should **link** to OKF after this pass, not restate what was added.

## Phase F — Commit

One focused commit:

```text
feat(firestore): expose pipeline <export-name>
```

**Never stage:** area narrowing in `tests/app.js` / `tests/globals.js`, any `.only`, skill snapshot logs.

Verify before commit:

```bash
git status
git diff --stat
rg '\.only\(' packages/firestore/e2e/
```

## Gotchas

- **macOS is first-class** — web SDK interop; parity bugs often appear there first.
- **Serialization ≠ types** — `compare:types` and `type-test.ts` do not validate `.serialize()` output.
- **Never add zero-argument helpers** to `EXPRESSION_METHOD_NAMES` (invalid fluent chains).
- **Two native expression builders per platform** — edit the live path; use coverage to disambiguate ([pipelines.md § Cross-platform e2e](pipelines.md#cross-platform-e2e--coverage-pass-2026-06)).
- iOS profraw pull can flake — retry once before treating as environment failure.

## Iteration report template

```markdown
# Pipeline iteration: <export>

## Gap analysis
- why this item was next
- companion exports (if any)

## Baseline
- e2e: macOS / iOS / Android — pass | fail
- before-<export> snapshot (paste)

## Implementation (subagent)
- summary of changes

## Review (subagent)
- validation checklist: pass | fail
- e2e: macOS / iOS / Android — pass | fail
- after-<export> snapshot (paste)
- coverage delta / refactor notes

## Documentation
- user docs: pages / parity table / docs.json
- OKF bundle: files updated, decisions recorded, conflicts resolved

## Commit
- hash + message (or blocked reason)
```
