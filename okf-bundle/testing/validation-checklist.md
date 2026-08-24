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

<a id="work-types"></a>

Work types and tiers: [change authoring workflow](change-authoring-workflow.md#work-types). Term ids: [iteration vocabulary](iteration-vocabulary.md).

| Work type              | Scope                                                                                                                                                                                                                                                                                                          | Shortcuts                                                                                                                                                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gap-analysis`         | `compare:types`, config read, SDK declarations                                                                                                                                                                                                                                                                 | n/a                                                                                                                                                                                                                                                                                                                                   |
| `baseline-capture`     | Full loaded spec(s) + e2e on [**every required platform**](running-e2e.md#platform-coverage-gate-blocking)                                                                                                                                                                                                     | **area-focused** tier; [area narrowing required](running-e2e.md#harness-narrowing-gate-blocking); no `.only`, no `:test-cover-reuse`; **no platform shortcuts**                                                                                                                                                                       |
| `implementation`       | Unit-focused Jest + e2e on **every required platform** when native bridge, **committed `**/generated/**`**, podspec/spec/codegen wiring, or macOS TS/runtime path changed — **Jest-only / `yarn codegen:verify` do not close `implementation_gate`**; `lib/**` edits need `yarn lerna:prepare` + Metro restart, not platform `:build` for JS alone ([running e2e § Rules #3](running-e2e.md#rules)) | **unit-focused** tier; [harness overrides + RNFBDebug](running-e2e.md#local-harness-overrides-harnessoverridesjs) before `:test-cover`; optional `.only` / sub-suite for diagnosis; [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking) — no platform shortcuts                                                  |
| `documentation`        | Promote user docs + durable OKF + `AGENTS.md` + `CONTRIBUTING.md` on the same change set **before** `independent-review`                                                                                                                                                                                       | none — does **not** run the [OKF bundle scan](#okf-bundle-review); loop: [change authoring § work types](change-authoring-workflow.md#work-types)                                                                                                                                                                                  |
| `independent-review`   | Full checklist; e2e on **every required platform** (macOS / iOS / Android per harness); **this pass is the OKF scan** when `okf-bundle/` reference docs, `AGENTS.md`, or `CONTRIBUTING.md` are in the frozen tree                                                                                                | **area-focused** tier; [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking) — **no shortcuts**; [frozen tree](change-authoring-workflow.md#frozen-tree) (report-only except revert `.only`); never commit overrides, sub-suite `.only`, or temporary `tests/app.js` edits ([fail-fast §](running-e2e.md#fail-fast-rnfbdebug-and-sub-suite-narrowing)) |
| `commit`               | Stage after gates closed                                                                                                                                                                                                                                                                                       | [change authoring § commit](change-authoring-workflow.md#commit) — staging only; OKF contract findings → `documentation?` then re-scan                                                                                                                                                                                              |
| `pre-merge-validation` | Full unfocused suite                                                                                                                                                                                                                                                                                           | **full** tier — [running-e2e § merge](running-e2e.md#before-merge-pr-handoff); entire PR branch, once                                                                                                                                                                                                                                 |

## Prepare and compile

Repo root. **Agents:** [agent command policy](agent-command-policy.md) — only these invocations; never `yarn workspace … prepare` or package-scoped `yarn run build` for diagnostics.

```bash
yarn                                  # install + postinstallDev (lerna:prepare + ruby:install)
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

Configs: `.github/scripts/compare-types/configs/`. Package workflows define ordering (e.g. [pipelines](../packages/firestore/pipeline-implementation-workflow.md#compare-types-gap-analysis)).

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
yarn ruby:install                                         # root Gemfile; included in root yarn via postinstallDev; skips exit 0 when bundle not on PATH
yarn tests:ios:ruby                                       # yarn lint:ruby (RuboCop) then all *_test.rb + SimpleCov → coverage/ios-ruby/lcov.info
yarn lint:ruby                                          # RuboCop only (same Gemfile; not part of root yarn lint)
```

Do not `bundle install --gemfile=packages/app/__tests__/Gemfile`. That vendors under `packages/app/__tests__/vendor/` and `yarn lint:js` then fails on vendor. [JS lint / Bundler vendor](agent-command-policy.md#js-lint-bundler-vendor).

Host Ruby must be **>= 3.3.1** (not 3.3.0); do not downgrade lockfile `simplecov` — [agent command policy § iOS Ruby](agent-command-policy.md#ios-ruby-spm-helpers).

Opt-in shape/embed suites skip cleanly when cocoapods/xcodeproj are absent; exit **0** when only skips occur alongside a green unit suite. Coverage artifact and Codecov flag **`ios-ruby`**: [coverage design § iOS Ruby](coverage-design.md#ios-ruby-simplecov). Touched production Ruby lines need test support in the [coverage evidence package](coverage-design.md#coverage-evidence-package) before `review_gate` closes — same spirit as JS/native touched-line bar. Canonical command only ([agent command policy](agent-command-policy.md)); do **not** use ad-hoc `ruby packages/app/__tests__/…_test.rb` as the gate.

<a id="lint-and-formatting"></a>

## Lint and formatting

**Blocking before `implementation` handoff and on the frozen tree for `independent-review`.** Run from repo root after prepare/compile when TS/JS changed. **Owner of which script to run** — [change authoring](change-authoring-workflow.md) hops here; do not duplicate this table there.

**CI Lint job** (`.github/workflows/linting.yml`) is `yarn lint` = `lint:js` + `lint:deps` + `lint:android` + `lint:ios:check`.

### Lint-by-tree / by-diff

Run **only** the scripts whose trees are in the diff (exit 0). Do not run the rest.

| Tree in diff | Script | Notes |
| ------------ | ------ | ----- |
| `packages/**` JS/TS | `yarn lint:js` | ESLint `packages/*`. Implementation may `yarn lint:js --fix` then re-run until clean. Prefer that over `yarn format:js`. A flood under `packages/app/__tests__/vendor/` is local Bundler vendor, not product lint. Do not treat it as the lint gate. [Agent command policy § JS lint / Bundler vendor](agent-command-policy.md#js-lint-bundler-vendor). |
| `packages/*/lib/**` | `yarn lint:deps` | Blocking. [dependency-cycle linting](../monorepo-tooling/prepare-and-cache.md#dependency-cycle-linting). |
| Java under `packages/*/android` | `yarn lint:android` | **Implementation only.** `google-java-format --set-exit-if-changed --replace` — **mutates**. Only entrypoint ([agent command policy](agent-command-policy.md)); never invent `yarn google-java-format` / `npx google-java-format`. Can flake; rerun once/twice if failure is not clearly in diff. Commit formatter output. |
| iOS native (`packages/*/ios` `.h` / `.cpp` / `.m` / `.mm`, not generated) | `yarn lint:ios:check` | clang-format **check** (`-n -Werror`). Implementation may `yarn lint:ios:fix` then re-check. |
| `docs/**` | `yarn lint:markdown` then `yarn lint:spellcheck` | Scripts glob `docs/**` only (CI docs job). OKF-only diffs skip these. |

A JS-only (or docs-only) diff does **not** require full `yarn lint`. Full `yarn lint` is the CI equivalent when the diff spans those package trees **and** mutating `lint:android` is allowed (`implementation`).

### Frozen `independent-review` (check-only)

Frozen review is [report/check-only except revert `.only`](change-authoring-workflow.md#frozen-tree). **Do not** run `yarn lint:android` or full `yarn lint` — `lint:android` `--replace` mutates the tree. Run the **check-only** by-diff scripts: `lint:js` (JS/TS), `lint:deps` (lib), `lint:ios:check` (ios), markdown/spellcheck (`docs/**` only).

## Expo documented-path iOS link (not e2e)

Workspace fixture `test-expo/`: **`yarn test-expo:ios:link`** only — [agent command policy](agent-command-policy.md). Not Detox; do not add `yarn tests:ios:*` or ad-hoc `expo prebuild` / `xcodebuild` as that closer. App package: [packages/app](../packages/app/index.md).

## E2e with coverage

[Pre-flight](running-e2e.md#pre-flight-is-the-host-clear-to-start) (host-clear probes + services + **[checkout ownership](running-e2e.md#services-checkout-ownership-blocking)** + harness tier) before every run — [agent command policy](agent-command-policy.md) and [e2e agent rule](running-e2e.md#agent-rule-read-first): use **only** `yarn tests:*` commands from [running e2e](running-e2e.md). Match harness to work type — **unit-focused**/**area-focused** never use full app load ([running e2e § harness](running-e2e.md#3-harness-matches-validation-tier)).

Commands: [Running e2e tests](running-e2e.md). Post-process: [Coverage design](coverage-design.md) (iOS `tests:ios:test:process-coverage`, Android `tests:android:unit` + `tests:android:post-e2e-coverage` → merged `jacocoTestReport`).

Some suites hit **cloud APIs**, e.g. Firestore Pipelines → `pipelines-e2e` Enterprise DB ([pipelines.md](../packages/firestore/pipelines.md#backend-cloud-enterprise-not-the-local-emulator)).

## OKF bundle review

When the frozen tree includes `okf-bundle/` reference docs, `AGENTS.md`, or `CONTRIBUTING.md`, **`independent-review` is this scan**. Confirm every [OKF update contract](../documentation-policy.md#okf-update-contract) row: Canonical location, DRY, [Efficiency](../documentation-policy.md#efficiency), link hygiene, Durability. **Report only** — do not edit the frozen tree. The `documentation` work type promotes durable text; it does not run this scan. Close `commit` only after this scan when those files changed. Do not add OKF after a frozen review without another `independent-review`.

Goal: each iteration improves OKF and removes conflicting guidance. Check meanings live in the contract; do not treat this list as a thinner substitute.

<a id="validation-evidence-package"></a>

## Validation evidence package

**Blocking.** Before closing **`implementation_gate`**, **`review_gate`**, **`commit_gate`**, or publishing (`git push` / PR update), record evidence per [change authoring § validation evidence](change-authoring-workflow.md#validation-evidence-blocking). Minimum template:

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
| lint (by-tree)            | [§ lint and formatting](#lint-and-formatting) | 0    | matching scripts; frozen review: check-only (no `lint:android` / full `yarn lint`)                                                            |
| coverage                  | post-process + region table          | —    | see coverage-design § evidence package                                                                                                       |
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
- [ ] Lint by-tree / by-diff per [§ lint and formatting](#lint-and-formatting) (frozen `independent-review`: check-only — no `yarn lint:android` / full `yarn lint`)
- [ ] E2e green on **every required platform** for the changed module ([platform coverage gate](running-e2e.md#platform-coverage-gate-blocking); [harness narrowing gate](running-e2e.md#harness-narrowing-gate-blocking); no `.only`; committed `RNFBDebug` remains `false`)
- [ ] Android post-e2e merged Jacoco when Android native touched: `yarn tests:android:post-e2e-coverage` → `jacocoTestReport.xml` ([coverage design](coverage-design.md))
- [ ] [Validation evidence package](validation-checklist.md#validation-evidence-package) recorded (exit codes, e2e counts, log paths)
- [ ] [Coverage evidence package](coverage-design.md#coverage-evidence-package) when lib/native bridge **or** `packages/app/**/*.rb` touched — gaps investigated to fix, delete, or acceptable-exception bar
- [ ] Durable OKF / `AGENTS.md` / `CONTRIBUTING.md` promoted in `documentation` **before** frozen review; [OKF bundle scan](#okf-bundle-review) completed in `independent-review` when those files changed (contract findings → `documentation?` then re-scan, not `commit`-pass edits)

Package workflows may add items (e.g. pipeline before/after snapshots — [pipeline workflow](../packages/firestore/pipeline-implementation-workflow.md)).
