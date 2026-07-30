---
type: Reference
title: Monorepo tooling rollout work queue
description: Ephemeral phase tracker for rolling out Nx local cache, deterministic prepare graph, declaration maps, dependency-cycle linting, and dev watch in the React Native Firebase monorepo.
tags: [monorepo, tooling, nx, work-queue, rollout]
timestamp: 2026-07-10T00:00:00Z
---

# Monorepo tooling — rollout work queue

> **COMPLETE (2026-07-11):** **MT0.0–MT4** + docs committed. **MTV** closed — validation + review **GREEN**; branch ready for PR. **Next pickup: MT-WATCH** (deferred) or PR.
> **Goal/order:** update Lerna → guardrails first (cycle lint, docs, benchmark) → deterministic cached prepare (graph + `nx.json` incl. complete outputs + scoped inputs + no-cloud + `ai` split) → declaration maps → dependency-rule hardening → full validation. Dev watch / e2e-rerun is **deferred** to a later gap-analysis pre-phase (not on the critical path).

Ephemeral tracker; see [OKF policy](../documentation-policy.md). Work types / tiers / gate field ids: [iteration vocabulary](../testing/iteration-vocabulary.md). **Loop, gates, host rule, harness:** [change authoring workflow](../testing/change-authoring-workflow.md) — not restated. **Agent commands:** [agent command policy](../testing/agent-command-policy.md) only — no `yarn workspace … prepare`, no Jet probes.

Durable decisions: **[architecture-decisions.md](architecture-decisions.md)**. Design detail: **[prepare-and-cache.md](prepare-and-cache.md)**.

---

## Locked decisions (index)

| ADR                                                                                                                                    | Decision                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [MonoTool-AD-1](architecture-decisions.md#monotool-ad-1--nx-local-cache-via-the-lerna-runner-no-turborepo-no-nx-cloud--accepted)       | Nx local cache via Lerna runner; no Turborepo; no Nx Cloud              |
| [MonoTool-AD-2](architecture-decisions.md#monotool-ad-2--keep-lerna-for-versioning-and-publish--accepted)                              | Keep Lerna for versioning + publish                                     |
| [MonoTool-AD-3](architecture-decisions.md#monotool-ad-3--build-order-via-devdependencies-not-manual-phase-scripts--accepted)           | Build order via `devDependencies`                                       |
| [MonoTool-AD-4](architecture-decisions.md#monotool-ad-4--one-inlined-prepare-command-no-wrapper-script--accepted)                      | One inlined prepare command; no wrapper script                          |
| [MonoTool-AD-5](architecture-decisions.md#monotool-ad-5--keep-react-native-builder-bob-emit-declaration-maps--accepted)                | Keep bob; emit declaration maps                                         |
| [MonoTool-AD-6](architecture-decisions.md#monotool-ad-6--dependency-cycle-linting-via-dependency-cruiser-as-lintdeps--accepted)        | dependency-cruiser as `lint:deps`                                       |
| [MonoTool-AD-7](architecture-decisions.md#monotool-ad-7--ai-test-fixtures-are-a-jest-prerequisite-not-a-build-step--accepted)          | AI fixtures = Jest prerequisite, not build step                         |
| [MonoTool-AD-8](architecture-decisions.md#monotool-ad-8--nxcache-shared-on-ci-not-on-publish--accepted)                                | `.nx/cache` on CI (with `NX_NO_CLOUD`), not on publish                  |
| [MonoTool-AD-9](architecture-decisions.md#monotool-ad-9--dev-watch-rebuilds-prepare-e2e-tdd-rerun-is-event-driven-off-metro--deferred) | Dev watch + e2e rerun off Metro — **Deferred** (gap-analysis pre-phase) |
| [MonoTool-AD-10](architecture-decisions.md#monotool-ad-10--generated-version-files-are-declared-cache-outputs-not-committed--accepted) | Generated version files are declared cache `outputs`, not committed     |
| [MonoTool-AD-11](architecture-decisions.md#monotool-ad-11--scope-prepare-cache-inputs-with-a-jssource-namedinput--accepted)            | Scope `prepare` cache inputs via a `jsSource` namedInput                |
| [MonoTool-AD-12](architecture-decisions.md#monotool-ad-12--never-nx-cache-prepare-when-the-script-is-patch-package--accepted)         | Never Nx-cache `prepare` when the script is `patch-package`             |

---

## Phase ordering

| Phase        | Scope                                                                                                                                                                                                | Depends on    | Why                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------- |
| **MT0.0**    | Update `lerna` to current (pulls current bundled `nx`)                                                                                                                                               | —             | Prereq: nx.json keys + `nx watch` fixes; cheap                                    |
| **MT0.1**    | dependency-cruiser `lint:deps` (`no-circular`) + scoped config + CI + change-authoring gate                                                                                                          | MT0.0         | Guardrail; cheap; catches cycles before graph edits                               |
| **MT0.2**    | Durable OKF docs (this bundle)                                                                                                                                                                       | —             | **Landed** (planning + adversarial-review revision)                               |
| **MT0.3**    | `scripts/benchmark-prepare.sh` + pre-Nx baseline numbers                                                                                                                                             | MT0.0         | Baseline before cache claims                                                      |
| **MT1**      | devDependency graph (17 pkgs) + `nx.json` (scoped `inputs` + complete `outputs` + no-cloud) + inline prepare (name unchanged) + `ai` prepare split + gated AI fetch + CI `.nx/cache` (`NX_NO_CLOUD`) | MT0.3         | Deterministic, cached prepare                                                     |
| **MT2**      | `declarationMap` in base + `ai` + `vertexai` tsconfig                                                                                                                                                | MT1           | IDE go-to-definition; cheap follow-on                                             |
| **MT4**      | dependency-cruiser rule hardening (`not-to-own-dist` scoped + hub/chain allowlist)                                                                                                                   | MT1           | Enforce graph after devDeps land                                                  |
| **MT-WATCH** | **Deferred** — gap-analysis pre-phase: dev watch + event-driven e2e rerun                                                                                                                            | MT1           | Not built today; needs detailed analysis before implementation; off critical path |
| **MTV**      | Branch-wide validation                                                                                                                                                                               | MT1, MT2, MT4 | Merge gate (MT-WATCH not required)                                                |

---

## Resume checklist

Gate prerequisites before any `:test-cover` ([host rule](../testing/change-authoring-workflow.md#host-rule)):

1. [Pre-flight](../testing/running-e2e.md#pre-flight-is-the-host-clear-to-start): [host-clear probes](../testing/running-e2e.md#host-clear-probes), [services ready](../testing/running-e2e.md#2-services-ready), [harness matches validation tier](../testing/running-e2e.md#3-harness-matches-validation-tier); serial `:test-cover` runs; [frozen tree](../testing/change-authoring-workflow.md#frozen-tree) for `independent-review`.
2. Most items here are config/build/docs (no `:test-cover`); e2e applies only where the row's `validation_tier` names it (**MTV**, and the deferred **MT-WATCH** if/when it reaches implementation).

---

## Per-item detail

Each item is one serial loop: `implementation` (unit-focused) → `independent-review` (frozen) → `commit`. Gate fields: [iteration vocabulary](../testing/iteration-vocabulary.md). No item touches `packages/*/lib/**` runtime or `android/ios` native, so **`coverage_evidence_gate: n/a`** throughout (verify per item against the [coverage grep](../testing/coverage-design.md)).

### MT0.0 — Update Lerna to current (prerequisite)

- **next_work_type:** `commit` · **validation_tier:** `area-focused` · gates: impl `closed`, review `closed`, commit `closed` · **commit_subject:** `build(deps): refresh nx for lerna runner`
- **Do:**
  - Bump `lerna` to the latest release in root `devDependencies`; refresh `yarn.lock`. This pulls a current bundled `nx` ([MonoTool-AD-1 prerequisite](architecture-decisions.md#monotool-ad-1--nx-local-cache-via-the-lerna-runner-no-turborepo-no-nx-cloud--accepted)).
  - Confirm the bundled `nx` version supports the `nx.json` keys used in MT1 (`neverConnectToCloud`, `namedInputs`, per-target `cache`/`inputs`/`outputs`) and includes the `nx watch --all --initialRun` fix (nx PR #32282) needed by the deferred MT-WATCH.
- **Acceptance:**
  - `yarn` installs cleanly; `yarn lerna:prepare` still exits 0 (behavior unchanged pre-`nx.json`).
  - `yarn lint`, `yarn tsc:compile`, `yarn tests:jest` remain green.
  - Record the resulting `lerna` + bundled `nx` versions in a note (feeds MT1/MT-WATCH version checks).
- **Implementation evidence (unit-focused, 2026-07-10):**
  - Change: `lerna` was already current at `9.0.7`; refreshed transitive `nx` / `@nx/devkit` from `22.1.3` → `22.7.6` via **lockfile refresh** (no root `resolutions` pins; Lerna's `>=21.5.3 <23.0.0` range resolves to latest 22.x).
  - Files changed: `yarn.lock` (Nx-family bump only; no `package.json` pin).
  - Version evidence: `lerna` `9.0.7` → `9.0.7`; bundled `nx` `22.1.3` → `22.7.6`; `nx-schema.json` includes `neverConnectToCloud`, `namedInputs`, and per-target `cache`/`inputs`/`outputs`.
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn` | 0 | Clean install; peer warnings only |
    | `yarn lerna:prepare` | 0 | 20 projects prepared successfully |
    | `yarn lint` | 0 | JS + Android + iOS lint/checks green |
    | `yarn tsc:compile` | 0 | Root TS compile clean |
    | `yarn tests:jest` | 0 | 82 suites / 1172 tests passed; log `/tmp/mt0-jest.log` |
- **Independent-review findings (area-focused, 2026-07-10):**
  - **Serious (initial):** first pass used `resolutions` for `nx` only; `@nx/devkit` skewed at `22.1.3`. Remediation replaced pins with lockfile refresh (no root resolutions); Nx-family aligns at `22.7.6`.
  - **Minor:** commit subject updated to `build(deps): refresh nx for lerna runner`.
  - Review validation reran green before finding: `yarn` 0 (`/tmp/mt0-review-yarn.log`), `yarn lerna:prepare` 0, `yarn lint` 0 (`/tmp/mt0-review-lint.log`), `yarn tsc:compile` 0 (`/tmp/mt0-review-tsc.log`), `yarn tsc:compile:consumer` 0 (`/tmp/mt0-review-tsc-consumer.log`), `yarn tests:jest` 0 (`/tmp/mt0-review-jest.log`, 82 suites / 1172 tests). Coverage evidence: n/a (no `packages/*/lib/**` or native bridge sources).
- **Remediation evidence (unit-focused, 2026-07-10):**
  - Change: removed `nx` / `@nx/devkit` `resolutions`; `yarn install` lockfile refresh aligns all Nx-family packages at `22.7.6` (no `22.1.3` entries remain).
  - Version evidence: `lerna` `9.0.7` unchanged; `nx` `22.7.6`; `@nx/devkit` `22.7.6`; `@nx/nx-darwin-arm64` `22.7.6`; `nx-schema.json` keys present; `nx watch --all --initialRun` supported at `22.7.6` (>= 22.6.0 threshold).
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn` | 0 | Clean install; peer warnings only; log `/tmp/mt0-remediation-yarn.log` |
    | `yarn lerna:prepare` | 0 | 20 projects prepared successfully; log `/tmp/mt0-remediation-lerna-prepare.log` |
    | `yarn lint` | 0 | JS + Android + iOS lint/checks green; log `/tmp/mt0-remediation-lint.log` |
    | `yarn tsc:compile` | 0 | Root TS compile clean; log `/tmp/mt0-remediation-tsc.log` |
    | `yarn tests:jest` | 0 | 82 suites / 1172 tests passed; log `/tmp/mt0-remediation-jest.log` |
    | `yarn tsc:compile:consumer` | 0 | Consumer TS compile clean; log `/tmp/mt0-remediation-tsc-consumer.log` |
- **Independent-review evidence after remediation (area-focused, 2026-07-10):**
  - Findings: none. Serious `@nx/devkit` skew fixed; no `22.1.3` Nx-family entries remain in `yarn.lock`; `nx`, `@nx/devkit`, and all `@nx/nx-*` platform packages resolve to `22.7.6`.
  - Diff scope verified: `package.json` unchanged by Nx pinning; `lerna` remains `^9.0.7` / CLI `9.0.7`; lockfile churn is Nx-family transitive updates, not unrelated scope.
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn` | 0 | Clean install + postinstall prepare; log `/tmp/mt0-fresh-review-yarn.log` |
    | `yarn lerna:prepare` | 0 | 20 projects prepared |
    | `yarn lint` | 0 | JS + Android + iOS checks green; log `/tmp/mt0-fresh-review-lint.log` |
    | `yarn tsc:compile` | 0 | Root TS compile; log `/tmp/mt0-fresh-review-tsc.log` |
    | `yarn tests:jest` | 0 | 82 suites / 1172 tests; log `/tmp/mt0-fresh-review-jest.log` |
    | `yarn tsc:compile:consumer` | 0 | Consumer TS compile; log `/tmp/mt0-fresh-review-tsc-consumer.log` |
  - Coverage evidence: n/a (no `packages/*/lib/**` or native bridge sources).

### MT0.1 — dependency-cruiser `lint:deps`

- **next_work_type:** `commit` · **validation_tier:** `area-focused` · gates: impl `closed`, review `closed`, commit `closed` · **commit_subject:** `build(deps): add dependency-cruiser lint:deps for lib import graph`
- **Do:**
  - Add `dependency-cruiser` devDependency (root).
  - Add `.dependency-cruiser.cjs` with rule `no-circular` on `packages/*/lib/**` (allowlist + `not-to-own-dist` hardening deferred to MT4). **Scope the config now** ([design](prepare-and-cache.md#dependency-cycle-linting)): `doNotFollow`/`exclude` for `node_modules`, `packages/*/dist/**`, `packages/*/__tests__/**`, `packages/*/e2e/**`; set `options.tsConfig` + `enhancedResolveOptions` so the `@react-native-firebase/*` path aliases resolve.
  - `package.json`: `"lint:deps": "depcruise --config .dependency-cruiser.cjs packages"`; add `yarn lint:deps` into the JS lint path.
  - CI: add a `lint:deps` step in [`.github/workflows/linting.yml`](../../../.github/workflows/linting.yml) lint job.
  - `okf-bundle/testing/validation-checklist.md` § lint + `change-authoring-workflow.md` lint gate: note `lint:deps` blocking when `packages/*/lib/**` in diff (durable OKF edit → DRY pass).
- **Acceptance:**
  - `yarn lint:deps` exits 0 on current tree (graph is a DAG today).
  - Resolution sanity: at least one real cross-package edge (e.g. a satellite → `@react-native-firebase/app/...`) is **resolved**, not reported as unresolvable (proves the tsconfig-alias wiring works).
  - `yarn lint` (full) still exits 0.
  - Introducing a deliberate temporary cycle makes `yarn lint:deps` exit non-zero (then revert).
  - CI lint job runs the step.
- **Implementation evidence (unit-focused, 2026-07-10):**
  - Change: added `dependency-cruiser@17.4.3`; new `.dependency-cruiser.cjs` with scoped inter-package `no-circular` on `packages/*/lib/**`, excludes for `node_modules`/`dist`/`__tests__`/`e2e`, TS path-alias resolution via generated `tsconfig.depcruise.json`; root `lint:deps` wired into `yarn lint`; CI step in `.github/workflows/linting.yml`; OKF validation gates updated in `validation-checklist.md` + `change-authoring-workflow.md`.
  - Files changed: `package.json`, `yarn.lock`, `.dependency-cruiser.cjs`, `.github/workflows/linting.yml`, `okf-bundle/testing/validation-checklist.md`, `okf-bundle/testing/change-authoring-workflow.md`.
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn lint:deps` | 0 | 32 modules / 74 deps; log `/tmp/mt01-lint-deps.log` |
    | `yarn lint` | 0 | JS + deps + Android + iOS; log `/tmp/mt01-lint.log` |
    | temporary cycle → `yarn lint:deps` | 3 | app ↔ crashlytics cycle detected; log `/tmp/mt01-lint-deps-cycle.log` |
    | post-revert `yarn lint:deps` | 0 | temp import reverted; clean tree restored |
  - Resolution sanity: `packages/analytics/` → `packages/app/` edge resolved (`@react-native-firebase/app/dist/module/common`, types `aliased-tsconfig-paths`); 0 unresolved from analytics; log `/tmp/mt01-resolution-sanity.log`.
  - Follow-ups flagged by implementer: generated `tsconfig.depcruise.json` each run (consider `.gitignore`); graph currently analyzes compiled `lib/**/*.js` (excludes `.ts`); CI runs `lint:deps` twice via dedicated step + `yarn lint`.
- **Independent-review findings (area-focused, 2026-07-10):**
  - **Serious:** config excludes authored `lib/**/*.ts` and effectively analyzes ephemeral/committed `.js` sidecars, not the real TS import graph; on a clean CI tree without local compile sidecars, MT0.1 acceptance is not proven. Remediation required: remove `.ts` exclude, cruise authored TS under `packages/*/lib/**`, and re-validate on a clean tree.
  - **Minor:** gitignore generated `tsconfig.depcruise.json`; tighten cruise scope/excludes (`plugin/__tests__`, non-`lib/**` noise); deduplicate CI `lint:deps` invocation (dedicated step or `yarn lint`, not both).
  - Review validation: `yarn lint:deps` 0 (`/tmp/mt01-review-lint-deps.log`); `yarn lint`/`yarn lint:js` failed on this host due to ephemeral untracked `packages/*/lib/**/*.js` sidecars (~19.5k eslint errors), outside MT0.1 frozen scope but relevant to clean-tree proof. Coverage evidence: n/a.
- **Remediation evidence (unit-focused, 2026-07-10):**
  - Change: TS-first depcruise config (`includeOnly` on `packages/*/lib/**/*.ts(x)`, `moduleResolution: 'node'`, `noEmit: true`); scoped excludes; gitignored `tsconfig.depcruise.json`; `lint:deps` scoped to `packages/*/lib`; CI deduped to single `yarn lint` step.
  - Files changed: `.dependency-cruiser.cjs`, `.gitignore`, `package.json`, `.github/workflows/linting.yml`, `okf-bundle/testing/validation-checklist.md`.
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn lint:deps` (clean TS tree) | 0 | 19 modules / 23 deps; log `/tmp/mt01-remediation-lint-deps-clean.log` |
    | resolution sanity (analytics → app) | 0 | `@react-native-firebase/app` → `packages/app/` via `aliased-tsconfig-paths`; log `/tmp/mt01-remediation-resolution-sanity.log` |
    | temp cycle → `yarn lint:deps` | 3 | app ↔ crashlytics; log `/tmp/mt01-remediation-lint-deps-cycle.log`; reverted |
    | post-revert `yarn lint:deps` | 0 | log `/tmp/mt01-remediation-lint-deps-post-revert.log` |
    | `yarn lint:js` | 0 | ESLint green |
    | `yarn lint` | 1 | `lint:deps` passes; `lint:android` failed (`google-java-format` exit 1) — implementer claims pre-existing Android formatter flake unrelated to MT0.1 |
  - Clean-tree proof: validation used authored TS only (ephemeral untracked `lib/**/*.js` sidecars temporarily moved aside; tracked memidb `.js` retained).
- **Independent-review evidence after remediation (area-focused, 2026-07-10):**
  - Findings: no serious findings. One minor local-only caveat: with ephemeral untracked `lib/**/*.js` sidecars present, standalone `yarn lint:deps` can vacuously pass (0 deps cruised); mitigated because `yarn lint` runs `lint:js` first and CI uses clean checkout.
  - Validation evidence (clean TS tree):
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn lint:deps` | 0 | 19 modules / 23 deps cruised; log `/tmp/mt01-fresh-review-lint-deps-clean.log` |
    | resolution sanity (analytics → app) | 0 | `@react-native-firebase/app` → `packages/app/` |
    | `yarn lint:js` | 0 | log `/tmp/mt01-fresh-review-lint-js` |
    | `yarn lint` | 0 | js + deps + android + ios; log `/tmp/mt01-fresh-review-lint-clean.log` |
    | `yarn lint:android` (isolated) | 0 | prior android flake not reproduced |
  - Coverage evidence: n/a.

### MT0.2 — Durable OKF docs — **landed**

- **work type:** `documentation` · **validation_tier:** none · gates: n/a · **commit_subject:** `docs: add monorepo tooling OKF bundle`
- **Do:** `okf-bundle/monorepo-tooling/{index.md,architecture-decisions.md,prepare-and-cache.md,work-queue.md}`; add a "Monorepo tooling" entry to [`okf-bundle/index.md`](../index.md).
- **Acceptance:** OKF DRY/consistency pass green (canonical location, link hygiene, durable vs ephemeral split); decisions live only in `architecture-decisions.md`; ephemeral phases live only here. Documentation/DRY pass completed after `docs: correct assertion about JS bundles in dev`.

### MT0.3 — Benchmark baseline

- **next_work_type:** `commit` · **validation_tier:** none · gates: impl `closed`, review `closed`, commit `closed` · **commit_subject:** `build(scripts): add prepare benchmark script`
- **Do:** `scripts/benchmark-prepare.sh` (macOS; scenarios A–D from [prepare-and-cache § benchmark](prepare-and-cache.md#benchmark-methodology)); capture **pre-Nx** B/C/D medians into a benchmarks note.
- **Acceptance:**
  - Script runs A–D, prints median-of-3 per scenario, exits 0.
  - Pre-Nx baseline numbers recorded (used to prove MT1 gains).
- **Implementation evidence (none tier, 2026-07-10):**
  - Change: added `scripts/benchmark-prepare.sh` (macOS guard, scenarios A–D, median-of-3, reversible firestore edit with `EXIT` trap); ephemeral baseline note `prepare-benchmark-baseline.md`.
  - Files changed: `scripts/benchmark-prepare.sh`, `okf-bundle/monorepo-tooling/prepare-benchmark-baseline.md`.
  - Pre-Nx medians (s): A 125.583; B 23.686; C 23.694; D 23.758. Logs: `.tmp/prepare-benchmarks/20260710-122118/`.
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `bash ./scripts/benchmark-prepare.sh` | 0 | Full A–D run (~624s unsandboxed); sandboxed first attempt failed on partial `node_modules` removal |
    | `bash -n scripts/benchmark-prepare.sh` | 0 | Syntax check |
  - Coverage evidence: n/a (no `packages/*/lib/**` runtime or native bridge edits committed).
- **Independent-review evidence (none tier, 2026-07-10):**
  - Findings: none. Script aligns with `prepare-and-cache.md` benchmark methodology; baseline numbers live in ephemeral note only.
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `bash -n scripts/benchmark-prepare.sh` | 0 | Review smoke syntax check |
  - Coverage evidence: n/a.

### MT1 — Deterministic cached prepare

- **next_work_type:** `commit` · **validation_tier:** `area-focused` · gates: impl `closed`, review `closed`, commit `closed` · **commit_subject:** `build(deps): enforce package build order and enable nx prepare cache`
- **Do:**
  - Add `"@react-native-firebase/app": "<version>"` to `devDependencies` of the **17 packages** = every package except `app` and `vertexai` (16 plain satellites + `ai`); `vertexai` orders transitively via its `ai` dependency ([MonoTool-AD-3](architecture-decisions.md#monotool-ad-3--build-order-via-devdependencies-not-manual-phase-scripts--accepted); counts owned by [prepare-and-cache § graph](prepare-and-cache.md#package-dependency-graph)).
  - Add `nx.json` — [design](prepare-and-cache.md#nx-local-cache): `neverConnectToCloud: true`; `namedInputs.jsSource`; `prepare` target `dependsOn: ["^prepare"]`, `inputs: ["jsSource"]` ([MonoTool-AD-11](architecture-decisions.md#monotool-ad-11--scope-prepare-cache-inputs-with-a-jssource-namedinput--accepted)), `cache: true`, `outputs` = `dist/**` + `plugin/build/**` + **`lib/version.ts`** ([MonoTool-AD-10](architecture-decisions.md#monotool-ad-10--generated-version-files-are-declared-cache-outputs-not-committed--accepted)).
  - Add an `app`-scoped `nx.targets.prepare.outputs` override in `packages/app/package.json` re-listing `dist/**`, `plugin/build/**`, `lib/version.ts`, **`ios/RNFBApp/RNFBVersion.m`**, **`android/src/reactnative/java/io/invertase/firebase/app/ReactNativeFirebaseVersion.java`** ([MonoTool-AD-10](architecture-decisions.md#monotool-ad-10--generated-version-files-are-declared-cache-outputs-not-committed--accepted)).
  - Update the `yarn lerna:prepare` **body** (name unchanged) to `cross-env NX_NO_CLOUD=true lerna run prepare` ([MonoTool-AD-4](architecture-decisions.md#monotool-ad-4--one-inlined-prepare-command-no-wrapper-script--accepted)).
  - `packages/ai`: drop `yarn tests:ai:mocks` from `prepare`; add an **AI-test-gated** Jest prerequisite (single flat jest config — a `globalSetup` that no-ops unless the run includes `packages/ai/__tests__/**`, or a `projects` split) running the fetch + convert scripts; make the fetch offline-idempotent (local-clone short-circuit before `git ls-remote`) ([MonoTool-AD-7](architecture-decisions.md#monotool-ad-7--ai-test-fixtures-are-a-jest-prerequisite-not-a-build-step--accepted)).
  - CI: restore/save `.nx/cache` via `actions/cache` in PR/main jobs; set `NX_NO_CLOUD=true` on every Nx-running job; **do not** touch `publish.yml` ([MonoTool-AD-8](architecture-decisions.md#monotool-ad-8--nxcache-shared-on-ci-not-on-publish--accepted)).
  - Remove scoped-prepare guidance from `validation-checklist.md` (durable OKF edit → DRY pass).
- **Acceptance:**
  - **Determinism:** from a clean dist (`rm -rf packages/*/dist packages/*/plugin/build`), `yarn lerna:prepare` exits 0 **repeatably** (run ≥3×); `packages/app/dist/**` exists before any satellite `compile` (no ordering race). If ordering is not honored, switch the inline body to `nx run-many -t prepare` ([MonoTool-AD-4 fallback](architecture-decisions.md#monotool-ad-4--one-inlined-prepare-command-no-wrapper-script--accepted)).
  - **Cache-replay completeness (regression guard for [MonoTool-AD-10](architecture-decisions.md#monotool-ad-10--generated-version-files-are-declared-cache-outputs-not-committed--accepted)):** after a warm prepare, delete the generated files (`git clean -fdx -- 'packages/*/lib/version.ts' packages/app/ios/RNFBApp/RNFBVersion.m 'packages/app/android/**/ReactNativeFirebaseVersion.java'`) **and** `packages/*/dist`, then re-run `yarn lerna:prepare` (cache hit) → all generated files are restored, and `yarn tests:jest` + `yarn tsc:compile` still exit 0. (Simulates the fresh-CI-checkout + restored-`.nx/cache` path.)
  - `yarn tsc:compile` and `yarn tsc:compile:consumer` exit 0.
  - `yarn tests:jest` exits 0, including `packages/ai` (fixtures fetched via the gated prerequisite, not `prepare`); a **non-AI** `yarn tests:jest` run performs **no** network fetch.
  - **Input scoping ([MonoTool-AD-11](architecture-decisions.md#monotool-ad-11--scope-prepare-cache-inputs-with-a-jssource-namedinput--accepted)):** editing a package's `__tests__`/`e2e`/`android`/`ios` file does **not** invalidate its `prepare` cache; editing its `lib/**` does.
  - A no-op `yarn lerna:prepare` (MT0.3 scenario C) is materially faster than the pre-Nx baseline (cache hit); single-package edit (D) rebuilds only that package + dependents.
  - **Publish-flow check ([MonoTool-AD-2](architecture-decisions.md#monotool-ad-2--keep-lerna-for-versioning-and-publish--accepted)):** a `lerna version` **dry run** rewrites the new internal `@react-native-firebase/app` devDep ranges to the bumped version and shows no other release-flow change (no side effects).
  - `git grep vertexai-sdk-test-data` shows fixtures still gitignored; `yarn` (fresh) does **not** clone test data.
  - Optional (review discretion): one platform e2e smoke to confirm `dist/module/**` output is unchanged by the ordering change.
- **Implementation evidence (unit-focused, 2026-07-10):**
  - Change: 17-package `@react-native-firebase/app` devDep graph; root `nx.json` (scoped inputs/outputs, no-cloud); app nx output override; `cross-env NX_NO_CLOUD=true lerna run prepare`; AI mocks out of `prepare` into gated Jest `globalSetup`; fetch script local-clone fast path; CI `.nx/cache` restore/save + `NX_NO_CLOUD` on jest/lint/e2e jobs; validation-checklist scoped-prepare line removed.
  - Files changed: `nx.json`, `package.json`, `packages/{app,ai,16 satellites}/package.json`, `jest.config.js`, `scripts/jest-ai-mocks-global-setup.js`, `scripts/fetch_ai_mock_responses.ts`, `.github/workflows/{tests_jest,linting,tests_e2e_*}.yml`, `okf-bundle/testing/validation-checklist.md`, `yarn.lock`.
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn` | 0 | Fresh install + postinstallDev prepare (20 projects); `/tmp/mt1-yarn-fresh.log` |
    | `yarn lerna:prepare` ×3 | 0 | Warm cache ~1.38–1.40s each; `/tmp/mt1-lerna-prepare-repeat.log` |
    | Determinism (clean dist ×3) | 0 | `packages/app/dist/module/index.js` present; `/tmp/mt1-determinism.log` |
    | Cache-replay (AD-10) | 0 | 20/20 cache hits; version + native files restored; `/tmp/mt1-cache-replay-*.log` |
    | `yarn tsc:compile` | 0 | `/tmp/mt1-tsc.log` |
    | `yarn tsc:compile:consumer` | 0 | `/tmp/mt1-tsc-consumer.log` |
    | `yarn tests:jest` | 0 | 82 suites / 1172 tests; `/tmp/mt1-jest.log` |
    | Non-AI jest | 0 | 59 suites / 847 tests, no network; `/tmp/mt1-jest-non-ai.log` |
    | `yarn lint:js` + `yarn lint:deps` | 0 | `/tmp/mt1-lint-{js,deps}.log` |
    | Benchmark (post-Nx A–D) | 0 | See `prepare-benchmark-baseline.md` § Post-Nx; logs `.tmp/prepare-benchmarks/20260710-152608/`; C **1.410s** vs pre-Nx **23.694s** (~16.8×); B **1.880s** vs **23.686s** (~12.6×); D median **1.457s** vs **23.758s** |
    | `lerna changed` + devDep spot-check | n/a | No `--dry-run` in Lerna 9; devDeps at `25.1.0` on analytics/ai/firestore; `/tmp/mt1-lerna-changed.log` |
    | `git grep vertexai-sdk-test-data` | 0 | Fixtures gitignored; `/tmp/mt1-git-grep-fixtures.log` |
  - Coverage evidence: n/a (no `packages/*/lib/**` or native bridge product edits).
  - Deviations noted: full `yarn lint` (android/ios) not run; lib-edit cache bust not directly exercised; Nx intermittent flaky-task warning on cache-replay (all exit 0).
- **Independent-review findings (area-focused, 2026-07-10):**
  - **Serious:** `nx.json` + `scripts/jest-ai-mocks-global-setup.js` untracked — must stage before commit.
  - **Serious:** `shouldFetchAiMocks()` ignores CLI `--testPathIgnorePatterns=packages/ai` (Jest passes pre-CLI config to globalSetup); non-AI runs can still fetch on fresh hosts. **Fix:** inspect `process.argv` for ignore patterns containing `packages/ai`.
  - **Minor:** non-AI validation command misleading until #2 fixed.
  - **Nit:** do not commit `.dependency-cruiser.min.cjs`; android format warning pre-existing.
  - Review validation: all re-runs green; cache-replay AD-10 verified 20/20 hits. Logs `/tmp/mt1-review-*.log`.
  - **Gate:** review_gate stays **open** — remediation required.
- **Remediation evidence (unit-focused, 2026-07-10):**
  - Change: `getArgvTestPathIgnorePatterns()` merges CLI `--testPathIgnorePatterns` (= and space forms) with `globalConfig.testPathIgnorePatterns`; AI ignored via argv skips fetch.
  - Files changed: `scripts/jest-ai-mocks-global-setup.js`.
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn tests:jest --testPathIgnorePatterns=packages/ai` | 0 | No fetch output; `/tmp/mt1-remediation-ignore-equals.log` |
    | `yarn tests:jest --testPathIgnorePatterns packages/ai` | 0 | No fetch output; `/tmp/mt1-remediation-ignore-space.log` |
    | `yarn tests:jest -- packages/firestore` | 0 | No fetch; `/tmp/mt1-remediation-firestore.log` |
    | `yarn tests:jest -- packages/ai` | 0 | Fetch invoked; `/tmp/mt1-remediation-ai-fetch.log` |
    | `node --check scripts/jest-ai-mocks-global-setup.js` | 0 | Syntax |
- **Independent-review evidence after remediation (area-focused, 2026-07-10):**
  - Findings: none. Prior serious (untracked deliverables — content OK; staged at commit; globalSetup argv gating) resolved.
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn lerna:prepare` | 0 | 20/20 cache hits; `/tmp/mt1-delta-review-20260710-125221.log` |
    | Non-AI jest (ignore patterns) | 0 | Zero fetch with clone moved aside |
    | `yarn tests:jest -- packages/ai` | 0 | Fetch invoked when AI included |
    | `yarn tests:jest` (full) | 0 | 82 suites / 1172 tests |
    | `yarn tsc:compile` + consumer | 0 | |
  - Coverage evidence: n/a.

### MT2 — Declaration maps

- **next_work_type:** `commit` · **validation_tier:** `area-focused` · gates: impl `closed`, review `closed`, commit `closed` · **commit_subject:** `build(ts): emit declaration maps for package builds`
- **Do:** add `declaration: true` + `declarationMap: true` to `tsconfig.packages.base.json`, `packages/ai/tsconfig.json`, `packages/vertexai/tsconfig.json` ([MonoTool-AD-5](architecture-decisions.md#monotool-ad-5--keep-react-native-builder-bob-emit-declaration-maps--accepted)).
- **Acceptance:**
  - After `yarn lerna:prepare`, `packages/*/dist/typescript/**/*.d.ts.map` exist.
  - `yarn tsc:compile` exits 0; `yarn lint` exits 0.
  - Spot-check: IDE go-to-definition on a cross-package symbol lands on `lib/**` source (record the check in notes).
  - **Map resolves to shipped source:** open one emitted `.d.ts.map` and confirm its `sources` point at the published `lib/*.ts` (relative, no absolute path leak) — since `files` publishes `lib`, external consumers get go-to-definition too.
  - `.d.ts.map` do not leak into unintended published paths (bob `files`/`exclude` still correct).
- **Implementation evidence (unit-focused, 2026-07-10):**
  - Change: added `declaration: true` + `declarationMap: true` to `tsconfig.packages.base.json`, `packages/ai/tsconfig.json`, `packages/vertexai/tsconfig.json` ([MonoTool-AD-5](architecture-decisions.md#monotool-ad-5--keep-react-native-builder-bob-emit-declaration-maps--accepted)).
  - Files changed: `tsconfig.packages.base.json`, `packages/ai/tsconfig.json`, `packages/vertexai/tsconfig.json`.
  - Map spot-check: `FirebaseApp` (`analytics/lib/index.ts` → `@react-native-firebase/app` → `packages/app/dist/typescript/lib/index.d.ts`) go-to-def target `packages/app/lib/index.ts`; `index.d.ts.map` has `sourceRoot: ""`, `sources: ["../../../lib/index.ts"]`, 0 absolute-path leaks; 310 `.d.ts.map` emitted, all under `dist/typescript` (0 in `dist/module`).
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn lerna:prepare` | 0 | 20 projects rebuilt (base tsconfig change busted cache); `/tmp/mt2-prepare.log` |
    | `.d.ts.map` count/leak scan | 0 | 310 maps; 0 absolute leaks; 0 outside `dist/typescript`; `/tmp/mt2-dtsmap-count.log`, `/tmp/mt2-leak-scan.log` |
    | `yarn tsc:compile` | 0 | `/tmp/mt2-tsc.log` |
    | `yarn tsc:compile:consumer` | 0 | `/tmp/mt2-tsc-consumer.log` |
    | `yarn lint` (full) | 0 | js + deps + android + ios; `/tmp/mt2-lint-2.log` (android formatter flaked once, clean on re-run) |
    | `yarn lint:deps` | 0 | 19 modules / 23 deps; `/tmp/mt2-lint-deps.log` |
    | `yarn tests:jest` | 0 | 82 suites / 1172 tests; `/tmp/mt2-jest.log` |
  - Coverage evidence: n/a (tsconfig/build-config only; no `packages/*/lib/**` or native bridge edits).
- **Independent-review evidence (area-focused, 2026-07-10):**
  - Findings: none. Product diff is three tsconfig files only.
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn lerna:prepare` | 0 | 20/20 cache hits; `/tmp/mt2-review-prepare.log` |
    | `.d.ts.map` count/leak scan | 0 | 310 maps; 0 absolute leaks; 0 in `dist/module`; `/tmp/mt2-review-dtsmap-scan.log` |
    | `npm pack --dry-run` (analytics) | 0 | 11 maps in tarball under `dist/typescript`; `/tmp/mt2-review-publish-check.log` |
    | `yarn tsc:compile` + consumer | 0 | `/tmp/mt2-review-tsc.log`, `/tmp/mt2-review-tsc-consumer.log` |
    | `yarn lint` (full) | 0 | js + deps + android + ios; `/tmp/mt2-review-lint-full.log` |
    | `yarn tests:jest` | 0 | 82 suites / 1172 tests; `/tmp/mt2-review-jest.log` |
  - Coverage evidence: n/a.

### MT4 — dependency-cruiser rule hardening — **gated on MT1**

- **next_work_type:** `commit` · **validation_tier:** `area-focused` · gates: impl `closed`, review `closed`, commit `closed` · **commit_subject:** `build(deps): enforce package import boundaries`
- **Do:** extend `.dependency-cruiser.cjs` ([MonoTool-AD-6](architecture-decisions.md#monotool-ad-6--dependency-cycle-linting-via-dependency-cruiser-as-lintdeps--accepted)): **`not-to-own-dist`** (forbid only _relative_ `../dist/**`/`./dist/**` imports — **not** the mapped hub API `@react-native-firebase/app/dist/module/...`, which is legitimate); graph allowlist (satellites → `app` only; `ai` → `auth`/`app-check`; `vertexai` → `ai`).
- **Acceptance:**
  - `yarn lint:deps` exits 0 on current tree with the stricter rules (the existing `@react-native-firebase/app/dist/module/...` imports in ~15 satellites must **not** be flagged).
  - A deliberate off-graph import (e.g. `firestore` importing `auth`) fails `lint:deps` (then revert).
  - A deliberate _relative_ own-`../dist` import fails `lint:deps` (then revert).
  - `yarn lint` full still exits 0.
- **Implementation evidence (unit-focused, 2026-07-10):**
  - Change: extended `.dependency-cruiser.cjs` with `not-to-own-dist` (module scope, same-package capture), `hub-no-internal`, `satellites-only-hub`, `ai-graph`, `vertexai-graph`; dynamic tsconfig paths for all non-hub packages; `includeOnly` widened to retain own-dist edges; collapse removed so module-scope violations survive.
  - Files changed: `.dependency-cruiser.cjs`.
  - Probe evidence:
    | Probe | Exit | Notes |
    |-------|------|-------|
    | Clean `yarn lint:deps` | 0 | 313 modules / 963 deps; `/tmp/mt4-lint-deps-clean.log` |
    | Off-graph (firestore → auth) | 1 | `satellites-only-hub`; reverted; `/tmp/mt4-probe-off-graph.log` |
    | Own-dist (analytics `../dist/module`) | 1 | `not-to-own-dist`; reverted; `/tmp/mt4-probe-own-dist.log` |
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn lint:js` | 0 | `/tmp/mt4-lint-js.log` |
    | `yarn lint` (full) | 0 | `/tmp/mt4-lint-full.log` |
    | `yarn tsc:compile` | 0 | `/tmp/mt4-tsc-compile.log` |
    | `yarn tests:jest` | 0 | 82 suites / 1172 tests; `/tmp/mt4-tests-jest.log` |
  - Coverage evidence: n/a (config-only).
- **Independent-review evidence (area-focused, 2026-07-10):**
  - Findings: **minor** (non-blocking, out of MT4 acceptance scope): (1) type-only imports bypass graph allowlist — value imports enforced; matches existing ai/vertexai patterns; (2) relative cross-package `../../pkg/dist/` bypasses allowlist path matching — current tree uses alias imports only; own-dist rule catches same-package relative dist.
  - Validation evidence:
    | Command | Exit | Notes |
    |---------|------|-------|
    | `yarn lint:deps` (clean) | 0 | 313 modules / 963 deps; `/tmp/mt4-review-lint-deps-clean.log` |
    | Off-graph probe (firestore → auth) | 1 | reverted; `/tmp/mt4-review-probe-off-graph.log` |
    | Own-dist probe | 1 | reverted; `/tmp/mt4-review-probe-own-dist.log` |
    | `yarn lint` (full) | 0 | `/tmp/mt4-review-lint-full.log` |
    | `yarn tsc:compile` | 0 | `/tmp/mt4-review-tsc-compile.log` |
    | `yarn tests:jest` | 0 | 82 suites / 1172 tests; `/tmp/mt4-review-tests-jest.log` |
  - Coverage evidence: n/a.

### MT-WATCH — Dev watch + e2e rerun (gap-analysis pre-phase) — **Deferred**

- **next_work_type:** `gap-analysis` · **validation_tier:** `area-focused` (only if it reaches implementation) · gates: impl `open`, review `open`, commit `open` · **commit_subject:** n/a until analysis converges
- **Status:** Deferred — no incremental dev-watch/hot-reload loop exists today; **off the critical path** for MT1/MT2/MT4/MTV ([MonoTool-AD-9](architecture-decisions.md#monotool-ad-9--dev-watch-rebuilds-prepare-e2e-tdd-rerun-is-event-driven-off-metro--deferred)). This pre-phase does the detailed analysis that must precede any implementation.
- **Do (analysis):**
  - Resolve the Tier A command caveats ([design](prepare-and-cache.md#tier-a--prepare-watch--unit-tdd-sketch-to-be-validated)): verify bundled `nx` includes the `--all --initialRun` fix (else first pass via `nx run-many -t prepare`); use `nx run-many -t prepare -p $NX_PROJECT_NAME` for multi-project watch batches.
  - Note: the OKF debug/release correction already landed separately as `docs: correct assertion about JS bundles in dev`; [running e2e § Rules #3](../testing/running-e2e.md#rules) is now the canonical owner of that fact. MT-WATCH only needs to analyze the dev-watch and event-driven rerun mechanics.
  - Analyze the event-driven e2e rerun (Metro `update-done`/`onBundleBuilt` → Jet `POST /rerun` on `8091`; [design Tier C](prepare-and-cache.md#tier-c--event-driven-e2e-rerun-spike); [Jet patch workflow](../ci-workflows/detox-patches.md#updating-the-jet-patch-headless)); confirm `update-done` observability and whether an app-side Jet reload hook is simpler; assess coverage-teardown-handshake bypass in fast-rerun mode.
- **Acceptance (analysis):**
  - Written findings: viability, chosen command shapes, and a go/no-go for a follow-on implementation phase (with its own gates). If no-go, close as `documentation` (record findings) — do not force implementation.
  - `dev:watch`, if later implemented, is **human-only** — `agent-command-policy.md` keeps `yarn lerna:prepare` canonical.

### MTV — Branch-wide validation — **closed**

- **next_work_type:** n/a · **validation_tier:** `full` · gates: impl `closed`, review `closed`, commit `closed` · **commit_subject:** n/a (no product edit)
- **Status (2026-07-11):** **GREEN** — validation ([e821793c](e821793c-c586-4a43-ac25-0d7ae53c350a)) + independent review ([4361b403](4361b403-8cb6-4706-96e4-174bf77b59d2)); no critical/serious findings.
- **Validation evidence:**
  - Static: prepare ×3 (21 cache hits), AD-10 replay, tsc ×2, Jest 82/1172, lint/compare:types/reference:api exit 0 — `/tmp/mtv2-full-*.log`
  - E2e: macOS **710/0/34**, iOS **848/0/85**, Android **878/0/54** — `/tmp/mtv2-full-e2e-*.log`
  - Review: lint:deps, tsc, compare:types, prepare spot-check (20/20 hits) — `/tmp/mtv2-review-*.log`
- **Review follow-ups (non-blocking, post-merge OK):** `app/scripts/**` in nx cache inputs; `lint:deps` in agent-command-policy registry; AD-4 scoped-prepare wording; CI cache key nit.

---

## Current gates

| Item     | impl   | review | commit | next_work_type                                |
| -------- | ------ | ------ | ------ | --------------------------------------------- |
| MT0.0    | closed | closed | closed | `commit`                                      |
| MT0.1    | closed | closed | closed | `commit`                                      |
| MT0.2    | closed | n/a    | closed | `documentation` (landed)                      |
| MT0.3    | closed | closed | closed | `commit`                                      |
| MT1      | closed | closed | closed | `commit`                                      |
| MT2      | closed | closed | closed | `commit`                                      |
| MT4      | closed | closed | closed | `commit`                                      |
| MT-WATCH | open   | open   | open   | `gap-analysis` (deferred)                     |
| MTV      | closed | closed | closed | n/a (merge gate passed)                       |
