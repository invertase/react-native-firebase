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

| Work type              | Scope                                                                                                                                                                                                                                                                                                          | Shortcuts                                                                                                                                                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gap-analysis`         | `compare:types`, config read, SDK declarations                                                                                                                                                                                                                                                                 | n/a                                                                                                                                                                                                                                                                                                                                   |
| `baseline-capture`     | Full loaded spec(s) + e2e on [**every required platform**](running-e2e.md#platform-coverage-gate-blocking)                                                                                                                                                                                                     | **area-focused** tier; [area narrowing required](running-e2e.md#harness-narrowing-gate-blocking); no `.only`, no `:test-cover-reuse`; **no platform shortcuts**                                                                                                                                                                       |
| `implementation`       | Unit-focused Jest + e2e on **every required platform** when native bridge, **committed `**/generated/**`**, podspec/spec/codegen wiring, or macOS TS/runtime path changed — **Jest-only / `yarn codegen:verify` do not close `implementation_gate`**; `lib/**` edits need `yarn lerna:prepare` + Metro restart, not platform `:build` for JS alone ([running e2e § Rules #3](running-e2e.md#rules)) | **unit-focused** tier; [harness overrides + RNFBDebug](running-e2e.md#local-harness-overrides-harnessoverridesjs) before `:test-cover`; optional `.only` / sub-suite for diagnosis; [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking) — no platform shortcuts                                                  |
| `independent-review`   | Full checklist; e2e on **every required platform** (macOS / iOS / Android per harness)                                                                                                                                                                                                                         | **area-focused** tier; [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking) — **no shortcuts**; [frozen tree](change-authoring-workflow.md#frozen-tree); never commit overrides, sub-suite `.only`, or temporary `tests/app.js` edits ([fail-fast §](running-e2e.md#fail-fast-rnfbdebug-and-sub-suite-narrowing)) |
| `pre-merge-validation` | Full unfocused suite                                                                                                                                                                                                                                                                                           | **full** tier — [running-e2e § merge](running-e2e.md#before-merge-pr-handoff); entire PR branch, once                                                                                                                                                                                                                                 |

## Prepare and compile

Repo root. **Agents:** [agent command policy](agent-command-policy.md) — only these invocations; never `yarn workspace … prepare` or package-scoped `yarn run build` for diagnostics.

```bash
yarn                                  # install + postinstallDev (includes lerna:prepare)
yarn lerna:prepare                    # after packages/*/lib/** edits — transpiles lib → dist/module via each package prepare target
yarn tsc:compile
yarn tsc:compile:consumer
yarn attw:check                    # scoped attw + Expo plugin smoke — [Types-AD-1..4](architecture-decisions.md)
```

`yarn lerna:prepare` runs each package **`prepare`** script (`build` then `compile`/bob). That is the canonical **`lib/**`→`dist/module/**`** path. Do **not** use `cd packages/<pkg> && yarn compile` as a substitute — `compile` is a step **inside** `prepare`, not a standalone agent entrypoint.

**Blocking:** `yarn` and `yarn lerna:prepare` must **exit 0 before any other command** (Jest, tsc, e2e, Metro, builds) — never parallelize. [Agent command policy § prepare must finish first](agent-command-policy.md#prepare-must-finish-first); e2e pre-flight: [running e2e § prepare completion gate](running-e2e.md#prepare-completion-gate-blocking). **Before native `:build`:** [install / patch / fmt gate](agent-command-policy.md#install-patch-fmt-gate-blocking) (fmt **≥ 12.1.0**).

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
- and any intentional RN-only exports documented in that package config to the [compare-types justification bar](../../.github/scripts/compare-types/README.md#justification-bar).

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

## Android JVM unit tests

When `packages/*/android/**` Java bridge/state-machine logic changed (or added under `src/test/java`):

```bash
yarn tests:android:unit               # Robolectric + Mockito — [AndroidTest-AD-1](android-architecture-decisions.md#androidtest-ad-1--robolectric--mockito-for-android-jvm-unit-tests--accepted)
```

Produces Jacoco `*.exec` that **counts** toward native touched-line coverage when merged. After Android e2e:

```bash
yarn tests:android:post-e2e-coverage  # pull .ec → jacocoTestReport (unit + e2e merge)
# optional explicit merge:
yarn tests:android:test:jacoco-report
```

Merged Codecov path: `jacocoTestReport.xml` — [coverage design](coverage-design.md). JVM unit does **not** replace [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking) e2e.

<a id="ios-ruby-unit-tests"></a>

## iOS Ruby unit tests (SPM / CocoaPods helpers)

**Blocking for `implementation_gate` / `review_gate` / handoff** when the diff touches any of:

- `packages/app/**/*.rb` (production helpers such as `firebase_spm.rb`, `firebase_json.rb`)
- `packages/app/__tests__/*_test.rb`

```bash
bundle install                                            # root Gemfile; once per checkout / Gemfile change
yarn tests:ios:ruby                                       # yarn lint:ruby (RuboCop) then all *_test.rb + SimpleCov → coverage/ios-ruby/lcov.info
yarn lint:ruby                                          # RuboCop only (same Gemfile; not part of root yarn lint)
```

Opt-in shape/embed suites skip cleanly when cocoapods/xcodeproj are absent; exit **0** when only skips occur alongside a green unit suite. Coverage artifact and Codecov flag **`ios-ruby`**: [coverage design § iOS Ruby](coverage-design.md#ios-ruby-simplecov). Touched production Ruby lines need test support in the [coverage evidence package](coverage-design.md#coverage-evidence-package) before `review_gate` closes — same spirit as JS/native touched-line bar. Canonical command only ([agent command policy](agent-command-policy.md)); do **not** use ad-hoc `ruby packages/app/__tests__/…_test.rb` as the gate.

<a id="lint-and-formatting"></a>

## Lint and formatting

**Blocking before `implementation` handoff and on the frozen tree for `independent-review`.** Run from repo root after prepare/compile when TS/JS changed.

```bash
yarn lint:js                          # eslint packages/* — must exit 0
yarn lint:js --fix                    # auto-fix; re-run yarn lint:js until clean
yarn lint:deps                        # dependency-cruiser no-circular on packages/*/lib/** — blocking when packages/*/lib/** in diff (see [prepare-and-cache § dependency-cycle linting](../monorepo-tooling/prepare-and-cache.md#dependency-cycle-linting))
yarn lint:android                     # google-java-format on packages/*/android/src — ONLY entrypoint ([agent command policy](agent-command-policy.md)); never invent yarn google-java-format / npx google-java-format
yarn format:js                        # inspect diff after; prefer lint:js --fix first
```

Docs (when `docs/**` or OKF markdown changed):

```bash
yarn lint:markdown
yarn lint:spellcheck
```

**CI Lint job equivalent** (required before `review` / publication when the diff touches JS, Java, or Objective-C/C++ sources):

```bash
yarn lint                              # lint:js + lint:deps + lint:android + lint:ios:check — matches .github/workflows/linting.yml
```

When `packages/*/lib/**` is in the diff, **`yarn lint:deps`** is a **blocking** gate (runs inside `yarn lint`, which matches the CI Lint job). Config and rule detail: [prepare-and-cache § dependency-cycle linting](../monorepo-tooling/prepare-and-cache.md#dependency-cycle-linting).

`yarn lint:android` runs `google-java-format` and fails if it would change committed files — commit formatter output. **Agents:** only `yarn lint:android` ([agent command policy](agent-command-policy.md)) — do not invent `yarn google-java-format` or bare/`npx` `google-java-format`. `lint:android` can flake; rerun once/twice if failure is not clearly in diff.

**CI docs job equivalent** (required before `review` / publication when `docs/**` changed):

```bash
yarn lint:markdown                     # matches .github/workflows/docs.yml
yarn lint:spellcheck
```

## E2e with coverage

[Pre-flight](running-e2e.md#pre-flight-is-the-host-clear-to-start) (host-clear probes + services + **[checkout ownership](running-e2e.md#services-checkout-ownership-blocking)** + harness tier) before every run — [agent command policy](agent-command-policy.md) and [e2e agent rule](running-e2e.md#agent-rule-read-first): use **only** `yarn tests:*` commands from [running e2e](running-e2e.md). Match harness to work type — **unit-focused**/**area-focused** never use full app load ([running e2e § harness](running-e2e.md#3-harness-matches-validation-tier)).

Commands: [Running e2e tests](running-e2e.md). Post-process: [Coverage design](coverage-design.md) (iOS `tests:ios:test:process-coverage`, Android `tests:android:unit` + `tests:android:post-e2e-coverage` → merged `jacocoTestReport`).

Some suites hit **cloud APIs**, e.g. Firestore Pipelines → `pipelines-e2e` Enterprise DB ([pipelines.md](../packages/firestore/pipelines.md#backend-cloud-enterprise-not-the-local-emulator)).

## OKF bundle review

Before handoff, follow [OKF policy](../documentation-policy.md#okf-update-contract):

1. Update relevant `okf-bundle/packages/<pkg>/` docs with durable learnings.
2. Check `okf-bundle/testing/` for conflicts with verified behavior; fix drift.
3. Run independent scan for canonical ownership, DRY refs, link hygiene, durability.

Goal: each iteration improves OKF and removes conflicting guidance.

<a id="validation-evidence-package"></a>

## Validation evidence package (blocking)

Before closing **`implementation_gate`**, **`review_gate`**, **`commit_gate`**, or publishing (`git push` / PR update), record evidence per [change authoring § validation evidence](change-authoring-workflow.md#validation-evidence-blocking). Minimum template:

```markdown
| Step                      | Command                              | Exit | Evidence                                                                                                                                     |
| ------------------------- | ------------------------------------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| prepare                   | yarn lerna:prepare                   | 0    | —                                                                                                                                            |
| jest                      | yarn tests:jest <paths>              | 0    | N/N tests                                                                                                                                    |
| ios Ruby unit             | yarn tests:ios:ruby                  | 0    | when `packages/app/**/*.rb` or `packages/app/__tests__/*_test.rb` touched — coverage/ios-ruby/lcov.info ([§ iOS Ruby](#ios-ruby-unit-tests)) |
| android JVM unit          | yarn tests:android:unit              | 0    | when `packages/*/android/**` Java changed — [AndroidTest-AD-1](android-architecture-decisions.md)                                            |
| e2e macOS                 | yarn tests:macos:test-cover          | 0    | X passing — /tmp/...log                                                                                                                      |
| e2e iOS                   | yarn tests:ios:test-cover            | 0    | Y passing — /tmp/...log                                                                                                                      |
| e2e Android               | yarn tests:android:test-cover        | 0    | Z passing — /tmp/...log                                                                                                                      |
| android merged Jacoco     | yarn tests:android:post-e2e-coverage | 0    | jacocoTestReport.xml (unit + e2e) — [coverage design](coverage-design.md)                                                                    |
| compare:types             | yarn compare:types                   | 0    | <pkg> 0/0/0                                                                                                                                  |
| lint (CI)                 | yarn lint                            | 0    | —                                                                                                                                            |
| lint:deps (lib diff)      | yarn lint:deps                       | 0    | when `packages/*/lib/**` in diff — [dependency-cycle linting](../monorepo-tooling/prepare-and-cache.md#dependency-cycle-linting)             |
| lint:markdown (CI docs)   | yarn lint:markdown                   | 0    | when `docs/**` in diff                                                                                                                       |
| lint:spellcheck (CI docs) | yarn lint:spellcheck                 | 0    | when `docs/**` in diff                                                                                                                       |
| coverage                  | post-process + region table          | —    | [coverage evidence package](coverage-design.md#coverage-evidence-package); closes `coverage_evidence_gate` when lib/native bridge or `packages/app/**/*.rb` touched |
```

**History rewrite invalidates** prior rows — re-run and replace the table after amend/rebase.

## Handoff checklist

- [ ] `yarn lerna:prepare` (after any `packages/*/lib/**` edits)
- [ ] `yarn tsc:compile`, `yarn tsc:compile:consumer`
- [ ] `yarn attw:check` when `package.json` `exports`, `plugin/build`, or published types changed ([Types-AD](architecture-decisions.md))
- [ ] `yarn reference:api`
- [ ] Redirect audit when TypeDoc config changed ([documentation site maintenance § redirect audit](../documentation-site-maintenance.md#redirect-audit-required-when-typedoc-config-changes))
- [ ] `yarn tests:jest`
- [ ] `yarn tests:ios:ruby` when `packages/app/**/*.rb` or `packages/app/__tests__/*_test.rb` touched ([§ iOS Ruby](#ios-ruby-unit-tests); [coverage design](coverage-design.md#ios-ruby-simplecov))
- [ ] `yarn tests:android:unit` when `packages/*/android/**` Java / `src/test/java` changed ([AndroidTest-AD-1](android-architecture-decisions.md))
- [ ] TurboModule wrapper contract ([NewArch-AD-17.1](../new-architecture/architecture-decisions.md#newarch-ad-171--jest-turbomodule-contract-test--accepted)) when `packages/app/lib/internal/registry/nativeModule.ts`, `nativeModuleAndroidIos.ts`, or TurboModule wrapper behavior changed: `yarn tests:jest -- packages/app/__tests__/nativeModuleContract.test.ts`
- [ ] `yarn compare:types` (stale config entries removed)
- [ ] `yarn lint` (CI Lint job) including **`yarn lint:android`** when Java changed ([agent command policy](agent-command-policy.md)); **`yarn lint:deps`** when `packages/*/lib/**` in diff ([dependency-cycle linting](../monorepo-tooling/prepare-and-cache.md#dependency-cycle-linting)); `yarn lint:markdown` + `yarn lint:spellcheck` when `docs/**` changed
- [ ] E2e green on **every required platform** for the changed module ([platform coverage gate](running-e2e.md#platform-coverage-gate-blocking); [harness narrowing gate](running-e2e.md#harness-narrowing-gate-blocking); no `.only`; committed `RNFBDebug` remains `false`)
- [ ] Android post-e2e merged Jacoco when Android native touched: `yarn tests:android:post-e2e-coverage` → `jacocoTestReport.xml` ([coverage design](coverage-design.md))
- [ ] [Validation evidence package](validation-checklist.md#validation-evidence-package) recorded (exit codes, e2e counts, log paths)
- [ ] [Coverage evidence package](coverage-design.md#coverage-evidence-package) when lib/native bridge **or** `packages/app/**/*.rb` touched — `coverage_evidence_gate` closed with verdict line; gaps investigated to fix, delete, or acceptable-exception bar
- [ ] OKF bundle reviewed/updated per § above

Package workflows may add items (e.g. pipeline before/after snapshots — [pipeline workflow](../packages/firestore/pipeline-implementation-workflow.md)).
