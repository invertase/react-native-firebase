---
type: Reference
title: Validation checklist
description: Canonical command sequence for validating RNFB TS/JS changes, e2e, and handoff.
tags: [testing, validation, jest, compare-types, lint, coverage]
timestamp: 2026-06-24T00:00:00Z
---

# Validation checklist

Validation commands for development/handoff. Other docs/skills link here; do not restate.

Coverage acceptance: [expectations](coverage-design.md#coverage-expectations-policy) + [completion signal](coverage-design.md#coverage-as-completion-signal) on every touched file.

## When to run what

Work types and tiers: [iteration vocabulary](iteration-vocabulary.md).

| Work type | Scope | Shortcuts |
|-----------|--------|-----------|
| `gap-analysis` | `compare:types`, config read, SDK declarations | n/a |
| `baseline-capture` | Full loaded spec(s) + e2e coverage on macOS, iOS, Android | **area** tier; area narrowing only ([running-e2e](running-e2e.md#fast-iteration-test-narrowing)); no `.only`, no `:test-cover-reuse` |
| `implementation` | Focused Jest + e2e | **focused** tier; [area narrowing required before `:test-cover`](running-e2e.md#3-harness-matches-validation-tier) + optional `.only` ([running-e2e](running-e2e.md#fast-iteration-test-narrowing)); [pipelines workflow](../packages/firestore/pipeline-implementation-workflow.md#narrowing-during-pipeline-iterations) |
| `independent-review` | Full checklist below on all platforms | **area** tier; [frozen tree](iteration-vocabulary.md#frozen-tree); never commit narrowing |
| `pre-merge-validation` | Full unfocused suite | **full** tier — [running-e2e § merge](running-e2e.md#before-merge-pr-handoff); entire PR branch, once |

## Prepare and compile

Repo root unless noted:

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

Configs: `.github/scripts/compare-types/configs/`. Package workflows define ordering (e.g. [pipelines](../packages/firestore/pipeline-implementation-workflow.md#step-1--compare-types-gap-analysis)).

## Jest

```bash
yarn tests:jest                       # full suite at handoff
```

Focused example:

```bash
yarn tests:jest --watchman=false packages/firestore/__tests__/pipelines.test.ts
```

Optional: `yarn tests:jest-coverage`.

## Lint and formatting

```bash
yarn lint:js
yarn format:js                        # inspect diff after
```

Docs: `yarn lint:markdown`, `yarn lint:spellcheck`.

Native: `yarn lint:android`, `yarn lint:ios:check`. `lint:android` can flake; rerun once/twice if failure is not clearly in diff.

## E2e with coverage

[Pre-flight](running-e2e.md#pre-flight-is-the-host-clear-to-start) (host + services + harness tier) before every run. Match harness to work type — **focused**/**area** never use full app load ([running e2e § harness](running-e2e.md#3-harness-matches-validation-tier)).

Commands: [Running e2e tests](running-e2e.md). Post-process: [Coverage design](coverage-design.md) (iOS `tests:ios:test:process-coverage`, Android `tests:android:post-e2e-coverage`).

Some suites hit **cloud APIs**, e.g. Firestore Pipelines → `pipelines-e2e` Enterprise DB ([pipelines.md](../packages/firestore/pipelines.md#backend-cloud-enterprise-not-the-local-emulator)).

## OKF bundle review

Before handoff, follow [OKF policy](../documentation-policy.md#okf-update-contract):

1. Update relevant `okf-bundle/packages/<pkg>/` docs with durable learnings.
2. Check `okf-bundle/testing/` for conflicts with verified behavior; fix drift.
3. Run independent scan for canonical ownership, DRY refs, link hygiene, durability.

Goal: each iteration improves OKF and removes conflicting guidance.

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
