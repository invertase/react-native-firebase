---
type: Reference
title: Validation checklist
description: Canonical command sequence for validating RNFB TS/JS changes, e2e, and handoff.
tags: [testing, validation, jest, compare-types, lint, coverage]
timestamp: 2026-06-24T00:00:00Z
---

# Validation checklist

Single source of truth for validation commands during development and handoff. Other docs and skills **link here**; they do not restate anything.

**Coverage acceptance** follows [Coverage design](coverage-design.md) — especially [expectations (policy)](coverage-design.md#coverage-expectations-policy) and [completion signal](coverage-design.md#coverage-as-completion-signal). Validation is not complete until those rules are satisfied on every file touched.

## When to run what

| Phase | Scope | Shortcuts |
|-------|--------|-----------|
| **Analysis** | `compare:types`, config read, SDK declarations | n/a |
| **Baseline** | Full loaded spec(s) + e2e coverage on macOS, iOS, Android | Area narrowing only ([running-e2e](running-e2e.md#fast-iteration-test-narrowing)); no `.only`, no `:test-cover-reuse` |
| **Implementation** | Focused Jest + e2e | Area + single-test/suite narrowing per [running-e2e](running-e2e.md#fast-iteration-test-narrowing); package workflows may define review rules (e.g. [pipelines](../packages/firestore/pipeline-implementation-workflow.md#narrowing-during-pipeline-iterations)) |
| **Review / handoff** | Full checklist below on all platforms | Per package workflow; never commit narrowing |
| **Pre-merge** | Full unfocused suite | [running-e2e § merge](running-e2e.md#before-merge-pr-handoff) — entire PR branch, once |

## Prepare and compile

From repo root unless noted:

```bash
yarn lerna:prepare                    # after packages/*/lib/** edits (Metro serves dist/)
cd packages/<pkg> && yarn compile      # package under change
yarn tsc:compile
yarn tsc:compile:consumer
```

## API reference and type parity

```bash
yarn reference:api                    # after consumer tsc
yarn compare:types                    # remove stale config entries when fixed
```

Compare-types configs live in `.github/scripts/compare-types/configs/`. Package workflows define queue ordering (e.g. [pipelines](../packages/firestore/pipeline-implementation-workflow.md#phase-a--compare-types-gap-analysis)).

## Jest

```bash
yarn tests:jest                       # full suite at handoff
```

Focused during implementation — paths for the package under change, e.g.:

```bash
yarn tests:jest --watchman=false packages/firestore/__tests__/pipelines.test.ts
```

Optional: `yarn tests:jest-coverage`.

## Lint and formatting

```bash
yarn lint:js
yarn format:js                        # inspect diff after
```

When docs changed: `yarn lint:markdown`, `yarn lint:spellcheck`.

When native changed: `yarn lint:android`, `yarn lint:ios:check`. **`lint:android` is sometimes flaky** — if it fails without a clear cause in your diff, re-run once or twice before treating as a real failure.

## E2e with coverage

Commands: [Running e2e tests](running-e2e.md). Post-processing: [Coverage design](coverage-design.md) (iOS `tests:ios:test:process-coverage`, Android `tests:android:post-e2e-coverage`).

Some suites hit **cloud APIs** rather than emulators (e.g. Firestore Pipelines → `pipelines-e2e` Enterprise DB — [pipelines.md](../packages/firestore/pipelines.md#backend-cloud-enterprise-not-the-local-emulator)).

## OKF bundle review

Before handoff, verify and update knowledge docs so the next iteration starts clean:

1. **Area under change** — read the relevant `okf-bundle/packages/<pkg>/` docs; consolidate anything learned this iteration (commands, gotchas, architecture) **into those OKF docs**, not into skills or ad-hoc notes.
2. **Cross-cutting docs** — check `okf-bundle/testing/` (this checklist, [running-e2e](running-e2e.md), [coverage-design](coverage-design.md)) for statements that conflict with what you just verified; fix or remove drift.
3. **References only elsewhere** — skills, package READMEs, and workflow docs should **link** to OKF; if they restate instructions, delete the duplicate and add a link.

Goal: each iteration leaves OKF more accurate and removes conflicting guidance.

## Handoff checklist

- [ ] `yarn lerna:prepare`
- [ ] `cd packages/<pkg> && yarn compile`
- [ ] `yarn tsc:compile`, `yarn tsc:compile:consumer`
- [ ] `yarn reference:api`
- [ ] `yarn tests:jest`
- [ ] `yarn compare:types` (stale config entries removed)
- [ ] `yarn lint:js` (+ markdown/spellcheck if docs; + platform lint if native)
- [ ] E2e green on macOS, iOS, Android ([running-e2e](running-e2e.md); no `.only`)
- [ ] Native coverage post-processing per [coverage-design](coverage-design.md)
- [ ] [Coverage policy](coverage-design.md#coverage-expectations-policy) satisfied on touched files
- [ ] OKF bundle reviewed/updated per § above

Package workflows may add items (e.g. pipeline before/after snapshots — [pipeline workflow](../packages/firestore/pipeline-implementation-workflow.md)).
