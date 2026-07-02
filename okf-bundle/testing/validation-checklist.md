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

Work types and tiers: [change authoring workflow](change-authoring-workflow.md). Term ids: [iteration vocabulary](iteration-vocabulary.md).

| Work type | Scope | Shortcuts |
|-----------|--------|-----------|
| `gap-analysis` | `compare:types`, config read, SDK declarations | n/a |
| `baseline-capture` | Full loaded spec(s) + e2e on [**every required platform**](running-e2e.md#platform-coverage-gate-blocking) | **area-focused** tier; [area narrowing required](running-e2e.md#harness-narrowing-gate-blocking); no `.only`, no `:test-cover-reuse`; **no platform shortcuts** |
| `implementation` | Unit-focused Jest + e2e on required platforms when native/TS path needs it | **unit-focused** tier; [area narrowing + RNFBDebug=true locally](running-e2e.md#fail-fast-rnfbdebug-and-sub-suite-narrowing) before `:test-cover`; optional `.only` / sub-suite for diagnosis; [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking) when module loads on iOS and Android |
| `independent-review` | Full checklist; e2e on **every required platform** (macOS / iOS / Android per harness) | **area-focused** tier; [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking) — **no shortcuts**; [frozen tree](change-authoring-workflow.md#frozen-tree); never commit narrowing, sub-suite `.only`, or `RNFBDebug = true` ([fail-fast §](running-e2e.md#fail-fast-rnfbdebug-and-sub-suite-narrowing)) |
| `pre-merge-validation` | Full unfocused suite | **full** tier — [running-e2e § merge](running-e2e.md#before-merge-pr-handoff); entire PR branch, once |

## Prepare and compile

Repo root. **Agents:** [agent command policy](agent-command-policy.md) — only these invocations; never `yarn workspace … prepare` or package-scoped `yarn run build` for diagnostics.

```bash
yarn                                  # install + postinstallDev (includes lerna:prepare)
yarn lerna:prepare                    # after packages/*/lib/** edits — transpiles lib → dist/module via each package prepare target
yarn lerna run prepare --scope @react-native-firebase/<pkg>   # single package only when needed
yarn tsc:compile
yarn tsc:compile:consumer
```

`yarn lerna:prepare` runs each package **`prepare`** script (`build` then `compile`/bob). That is the canonical **`lib/**` → `dist/module/**`** path. Do **not** use `cd packages/<pkg> && yarn compile` as a substitute — `compile` is a step **inside** `prepare`, not a standalone agent entrypoint.

**Blocking:** `yarn` and `yarn lerna:prepare` must **exit 0 before any other command** (Jest, tsc, e2e, Metro, builds) — never parallelize. [Agent command policy § prepare must finish first](agent-command-policy.md#prepare-must-finish-first); e2e pre-flight: [running e2e § prepare completion gate](running-e2e.md#prepare-completion-gate-blocking).

## API reference and type parity

```bash
yarn reference:api                    # after consumer tsc
yarn compare:types                    # remove stale config entries when fixed
```

Configs: `.github/scripts/compare-types/configs/`. Package workflows define ordering (e.g. [pipelines](../packages/firestore/pipeline-implementation-workflow.md#step-1--compare-types-gap-analysis)).

When **`typedoc.json` or `packages/*/typedoc.json`** changes anything that can alter reference URL structure, also run the [legacy redirect audit](../documentation-site-maintenance.md#redirect-audit-required-when-typedoc-config-changes) (verify every `docs.json` → `redirects` target; add mappings for newly orphaned legacy `/reference/...` paths).

For any package registered in `compare:types`, type parity is a **review-gate requirement**, not a best-effort signal. Before closing `independent-review`, the touched package must have:

- no undocumented differences,
- no stale config entries,
- and any intentional RN-only exports documented in that package config.

If `yarn compare:types` fails because of unrelated packages, keep the touched package's result in the handoff and add/fix a work-queue item for the unrelated drift. Do not close a review gate for a registered package when its own compare-types output is failing.

## Jest

```bash
yarn tests:jest                       # full suite at handoff
```

Focused example:

```bash
yarn tests:jest --watchman=false packages/firestore/__tests__/pipelines.test.ts
```

Optional: `yarn tests:jest-coverage`.

<a id="lint-and-formatting"></a>

## Lint and formatting

**Blocking before `implementation` handoff and on the frozen tree for `independent-review`.** Run from repo root after prepare/compile when TS/JS changed.

```bash
yarn lint:js                          # eslint packages/* — must exit 0
yarn lint:js --fix                    # auto-fix; re-run yarn lint:js until clean
yarn format:js                        # inspect diff after; prefer lint:js --fix first
```

Docs (when `docs/**` or OKF markdown changed):

```bash
yarn lint:markdown
yarn lint:spellcheck
```

Native (when platform sources in diff): `yarn lint:android`, `yarn lint:ios:check`. `lint:android` can flake; rerun once/twice if failure is not clearly in diff.

Full aggregate (pre-merge optional): `yarn lint` (= js + android + ios check).

## E2e with coverage

[Pre-flight](running-e2e.md#pre-flight-is-the-host-clear-to-start) (host-clear probes + services + harness tier) before every run — [agent command policy](agent-command-policy.md) and [e2e agent rule](running-e2e.md#agent-rule-read-first): use **only** `yarn tests:*` commands from [running e2e](running-e2e.md). Match harness to work type — **unit-focused**/**area-focused** never use full app load ([running e2e § harness](running-e2e.md#3-harness-matches-validation-tier)).

Commands: [Running e2e tests](running-e2e.md). Post-process: [Coverage design](coverage-design.md) (iOS `tests:ios:test:process-coverage`, Android `tests:android:post-e2e-coverage`).

Some suites hit **cloud APIs**, e.g. Firestore Pipelines → `pipelines-e2e` Enterprise DB ([pipelines.md](../packages/firestore/pipelines.md#backend-cloud-enterprise-not-the-local-emulator)).

## OKF bundle review

Before handoff, follow [OKF policy](../documentation-policy.md#okf-update-contract):

1. Update relevant `okf-bundle/packages/<pkg>/` docs with durable learnings.
2. Check `okf-bundle/testing/` for conflicts with verified behavior; fix drift.
3. Run independent scan for canonical ownership, DRY refs, link hygiene, durability.

Goal: each iteration improves OKF and removes conflicting guidance.

## Handoff checklist

- [ ] `yarn lerna:prepare` (after any `packages/*/lib/**` edits)
- [ ] `yarn tsc:compile`, `yarn tsc:compile:consumer`
- [ ] `yarn reference:api`
- [ ] Redirect audit when TypeDoc config changed ([documentation site maintenance § redirect audit](../documentation-site-maintenance.md#redirect-audit-required-when-typedoc-config-changes))
- [ ] `yarn tests:jest`
- [ ] `yarn compare:types` (stale config entries removed)
- [ ] `yarn lint:js` (+ markdown/spellcheck if docs; + platform lint if native)
- [ ] E2e green on **every required platform** for the changed module ([platform coverage gate](running-e2e.md#platform-coverage-gate-blocking); [harness narrowing gate](running-e2e.md#harness-narrowing-gate-blocking); no `.only`; committed `RNFBDebug` remains `false`)
- [ ] Native coverage post-processing per [coverage-design](coverage-design.md)
- [ ] [Coverage policy](coverage-design.md#coverage-expectations-policy) satisfied on touched files
- [ ] OKF bundle reviewed/updated per § above

Package workflows may add items (e.g. pipeline before/after snapshots — [pipeline workflow](../packages/firestore/pipeline-implementation-workflow.md)).
