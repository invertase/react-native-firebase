---
type: Reference
title: Firestore Pipelines implementation workflow
description: Pipeline-specific artifacts for compare-types exports, serialization, coverage snapshots, and area harness setup — extends the cross-package change authoring workflow.
tags: [firestore, pipelines, compare-types, workflow, coverage]
timestamp: 2026-06-26T00:00:00Z
---

# Firestore Pipelines implementation workflow

Pipeline-specific requirements for one `.github/scripts/compare-types/configs/firestore-pipelines.ts` export (or equivalent parity item). **Shared loop:** [change authoring workflow](../../testing/change-authoring-workflow.md).

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md).

## Read first

| Topic | Document |
|-------|----------|
| **Change authoring loop** | [change-authoring-workflow.md](../../testing/change-authoring-workflow.md) |
| Bridge design, subqueries, coercion | [pipelines.md](pipelines.md) |
| Live gate snapshots | [pipeline-coverage-work-queue.md](pipeline-coverage-work-queue.md) |
| Work types, tiers, gates | [change-authoring-workflow.md](../../testing/change-authoring-workflow.md); term ids: [iteration-vocabulary.md](../../testing/iteration-vocabulary.md) |
| E2e commands | [running-e2e.md](../../testing/running-e2e.md) |
| Coverage policy | [coverage-design.md](../../testing/coverage-design.md) |
| Validation commands | [validation-checklist.md](../../testing/validation-checklist.md) |
| Serialization tests per export | [serialization-testing.md](serialization-testing.md) |
| Compare-types machinery | `.github/scripts/compare-types/README.md` |

## Pipeline hard gates

In addition to [change authoring gates](../../testing/change-authoring-workflow.md#gates):

| Gate | Requirement |
|------|-------------|
| Gap analysis | Export confirmed against firebase-js-sdk; platform support verified; semantic dependencies identified |
| Baseline coverage | `snapshot-pipeline-coverage.sh before-<export>` stdout recorded |
| Implementation | Public API, lowering, Jest, [serialization-testing.md](serialization-testing.md), consumer type-test, **unit-focused** e2e |
| Review coverage | `after-<export>` snapshot; [coverage completion signal](../../testing/coverage-design.md#coverage-as-completion-signal) |
| Review e2e | Full `Pipeline.e2e.js` on macOS, iOS, Android — **area-focused** tier; no `.only` |
| Compare-types | Remove `missingInRN` entry when RNFB shape matches firebase-js-sdk |

### Coverage snapshots

After full 3-platform e2e:

```bash
bash scripts/snapshot-pipeline-coverage.sh before-<export-name>
bash scripts/snapshot-pipeline-coverage.sh after-<export-name>
```

## Compare-types gap analysis

Primary backlog: **`missingInRN`** in `.github/scripts/compare-types/configs/firestore-pipelines.ts`.

1. Read the config in **file order**.
2. Select first still-relevant `missingInRN` entry unless a semantic companion must ship first.
3. Confirm shape from installed SDK:
   - `node_modules/firebase/package.json` → `exports["./firestore/pipelines"]`
   - `node_modules/@firebase/firestore/pipelines/pipelines.d.ts`
   - `node_modules/@firebase/firestore/dist/pipelines.esm.js`
4. Check feasibility via [pipelines.md](pipelines.md). If any required platform blocked, **stop**.
5. Run `yarn compare:types` to confirm the entry is still undocumented drift (not stale).
6. Note ordering dependencies; do not skip ahead without user approval.

`compare-types` config is backlog, not permission.

### Shape differences: `differentShape` / `extraInRN`

Every documented difference must clear the [compare-types justification bar](../../../.github/scripts/compare-types/README.md#justification-bar). Avoidable drift is aligned to firebase-js-sdk and the entry removed; do not introduce new `differentShape` / `extraInRN` drift when implementing a `missingInRN` export.

## Pipeline `implementation`

- Follow [pipelines.md](pipelines.md) patterns only; no one-export abstraction.
- **Serialization blocking:** [serialization-testing.md](serialization-testing.md) all four checks.
- Trace patterns in `packages/firestore/lib/pipelines/`, `internal.ts`, native parsers, web bridge.
- Implement public API matching firebase-js-sdk **exactly** (including lowercase string unions — native may normalize internally).
- Add Jest, consumer `type-test.ts`, serialization matrix, e2e cases.
- **Unit-focused** tier per [change authoring § implementation inner loop](../../testing/change-authoring-workflow.md#implementation-inner-loop) and [pipeline area harness](#pipeline-area-harness) below.

## Pipeline `independent-review`

On a **frozen tree** — full [change authoring § independent-review](../../testing/change-authoring-workflow.md#independent-review), plus:

- Full `Pipeline.e2e.js` e2e + coverage on all platforms; `after-<export>` snapshot.
- Compare coverage to baseline; touched-file coverage must rise until intractable limits or plateau → refactor.

## Pipeline area harness

Extends [change authoring § harness narrowing](../../testing/change-authoring-workflow.md#harness-narrowing). **Mechanics:** [running e2e § local harness overrides](../../testing/running-e2e.md#local-harness-overrides-harnessoverridesjs).

**Area setup (required for `unit-focused` and `area-focused` tiers):** firestore-only `platformSupportedModules` with **both** `if (Platform.other)` and `if (!Platform.other)` disabled (`if (false && …)` on each) or trimmed inside each block; load `require('../packages/firestore/e2e/Pipeline.e2e.js')` or full firestore `require.context` per scope; **`RNFBDebug = true`** locally per [running e2e § fail-fast](../../testing/running-e2e.md#fail-fast-rnfbdebug-and-sub-suite-narrowing) — **never commit**. Revert **both** platform blocks before **full** tier or `commit`.

**Sanity check:** ~**100** passing per platform when only `Pipeline.e2e.js` loads. Pass counts in the **hundreds or thousands** mean full app load — stop and re-apply narrowing ([running-e2e § gate](../../testing/running-e2e.md#harness-narrowing-gate-blocking)).

## Pipeline `documentation`

Per export, same commit:

**User docs**

- Page or section under `docs/firestore/pipelines/`
- Parity table row on pipelines overview
- `docs.json` sidebar entry for new pages
- [Validation checklist § lint and formatting](../../testing/validation-checklist.md#lint-and-formatting) — markdown/spellcheck when docs changed

**OKF bundle maintenance**

- Update `pipelines.md`, `serialization-testing.md`, or this file for changed bridge behavior/gotchas/rules.
- Cross-cutting testing/coverage learnings go in `okf-bundle/testing/`.
- Record non-obvious choices in OKF, not only commit messages.

## Pipeline `commit`

```text
feat(firestore): expose pipeline <export-name>
```

**Never stage:** area narrowing in `tests/app.js` / `tests/globals.js`, any `.only`.

Before `git commit`: [validation evidence package](../../testing/validation-checklist.md#validation-evidence-package) recorded; [coverage evidence package](../../testing/coverage-design.md#coverage-evidence-package) when lib/native bridge touched ([change authoring § commit](../../testing/change-authoring-workflow.md#commit)).

## Gotchas

- **macOS is first-class** — web SDK interop; parity bugs often appear there first.
- **Serialization ≠ types** — `compare:types` and `type-test.ts` do not validate `.serialize()` output.
- **Never add zero-argument helpers** to `EXPRESSION_METHOD_NAMES` (invalid fluent chains).
- **Two native expression builders per platform** — edit the live path; use coverage to disambiguate ([pipelines.md § Cross-platform e2e](pipelines.md#two-expression-builders-per-platform--edit-the-live-one)).
- iOS profraw pull can flake — retry once before treating as environment failure.

Parity remediation serial rules and live probe status: [pipeline coverage work queue](pipeline-coverage-work-queue.md) (ephemeral).
