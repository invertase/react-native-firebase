---
type: Reference
title: Monorepo tooling rollout work queue
description: Ephemeral phase tracker for rolling out Nx local cache, deterministic prepare graph, declaration maps, dependency-cycle linting, and dev watch in the React Native Firebase monorepo.
tags: [monorepo, tooling, nx, work-queue, rollout]
timestamp: 2026-07-10T00:00:00Z
---

# Monorepo tooling — rollout work queue

> **IN PROGRESS (2026-07-10):** Durable docs landed + adversarial-review revisions applied (**MT0.2**). **Next pickup: MT0.0** (update Lerna to current), then **MT0.1** (dependency-cruiser `lint:deps`). Phases MT1–MT4 pending; **MT-WATCH** deferred (gap-analysis pre-phase); **MTV** gated on earlier phases.
> **Goal/order:** update Lerna → guardrails first (cycle lint, docs, benchmark) → deterministic cached prepare (graph + `nx.json` incl. complete outputs + scoped inputs + no-cloud + `ai` split) → declaration maps → dependency-rule hardening → full validation. Dev watch / e2e-rerun is **deferred** to a later gap-analysis pre-phase (not on the critical path).

Ephemeral tracker; see [OKF policy](../documentation-policy.md). Work types / tiers / gate field ids: [iteration vocabulary](../testing/iteration-vocabulary.md). **Loop, gates, host rule, harness:** [change authoring workflow](../testing/change-authoring-workflow.md) — not restated. **Agent commands:** [agent command policy](../testing/agent-command-policy.md) only — no `yarn workspace … prepare`, no Jet probes.

Durable decisions: **[architecture-decisions.md](architecture-decisions.md)**. Design detail: **[prepare-and-cache.md](prepare-and-cache.md)**.

---

## Locked decisions (index)

| ADR | Decision |
|-----|----------|
| [MonoTool-AD-1](architecture-decisions.md#monotool-ad-1--nx-local-cache-via-the-lerna-runner-no-turborepo-no-nx-cloud--accepted) | Nx local cache via Lerna runner; no Turborepo; no Nx Cloud |
| [MonoTool-AD-2](architecture-decisions.md#monotool-ad-2--keep-lerna-for-versioning-and-publish--accepted) | Keep Lerna for versioning + publish |
| [MonoTool-AD-3](architecture-decisions.md#monotool-ad-3--build-order-via-devdependencies-not-manual-phase-scripts--accepted) | Build order via `devDependencies` |
| [MonoTool-AD-4](architecture-decisions.md#monotool-ad-4--one-inlined-prepare-command-no-wrapper-script--accepted) | One inlined prepare command; no wrapper script |
| [MonoTool-AD-5](architecture-decisions.md#monotool-ad-5--keep-react-native-builder-bob-emit-declaration-maps--accepted) | Keep bob; emit declaration maps |
| [MonoTool-AD-6](architecture-decisions.md#monotool-ad-6--dependency-cycle-linting-via-dependency-cruiser-as-lintdeps--accepted) | dependency-cruiser as `lint:deps` |
| [MonoTool-AD-7](architecture-decisions.md#monotool-ad-7--ai-test-fixtures-are-a-jest-prerequisite-not-a-build-step--accepted) | AI fixtures = Jest prerequisite, not build step |
| [MonoTool-AD-8](architecture-decisions.md#monotool-ad-8--nxcache-shared-on-ci-not-on-publish--accepted) | `.nx/cache` on CI (with `NX_NO_CLOUD`), not on publish |
| [MonoTool-AD-9](architecture-decisions.md#monotool-ad-9--dev-watch-rebuilds-prepare-e2e-tdd-rerun-is-event-driven-off-metro--deferred) | Dev watch + e2e rerun off Metro — **Deferred** (gap-analysis pre-phase) |
| [MonoTool-AD-10](architecture-decisions.md#monotool-ad-10--generated-version-files-are-declared-cache-outputs-not-committed--accepted) | Generated version files are declared cache `outputs`, not committed |
| [MonoTool-AD-11](architecture-decisions.md#monotool-ad-11--scope-prepare-cache-inputs-with-a-jssource-namedinput--accepted) | Scope `prepare` cache inputs via a `jsSource` namedInput |

---

## Phase ordering

| Phase | Scope | Depends on | Why |
|-------|-------|-----------|-----|
| **MT0.0** | Update `lerna` to current (pulls current bundled `nx`) | — | Prereq: nx.json keys + `nx watch` fixes; cheap |
| **MT0.1** | dependency-cruiser `lint:deps` (`no-circular`) + scoped config + CI + change-authoring gate | MT0.0 | Guardrail; cheap; catches cycles before graph edits |
| **MT0.2** | Durable OKF docs (this bundle) | — | **Landed** (planning + adversarial-review revision) |
| **MT0.3** | `scripts/benchmark-prepare.sh` + pre-Nx baseline numbers | MT0.0 | Baseline before cache claims |
| **MT1** | devDependency graph (17 pkgs) + `nx.json` (scoped `inputs` + complete `outputs` + no-cloud) + inline prepare (name unchanged) + `ai` prepare split + gated AI fetch + CI `.nx/cache` (`NX_NO_CLOUD`) | MT0.3 | Deterministic, cached prepare |
| **MT2** | `declarationMap` in base + `ai` + `vertexai` tsconfig | MT1 | IDE go-to-definition; cheap follow-on |
| **MT4** | dependency-cruiser rule hardening (`not-to-own-dist` scoped + hub/chain allowlist) | MT1 | Enforce graph after devDeps land |
| **MT-WATCH** | **Deferred** — gap-analysis pre-phase: dev watch + event-driven e2e rerun | MT1 | Not built today; needs detailed analysis before implementation; off critical path |
| **MTV** | Branch-wide validation | MT1, MT2, MT4 | Merge gate (MT-WATCH not required) |

---

## Resume checklist

Gate prerequisites before any `:test-cover` ([host rule](../testing/change-authoring-workflow.md#host-rule)):

1. [Pre-flight](../testing/running-e2e.md#pre-flight-is-the-host-clear-to-start): [host-clear probes](../testing/running-e2e.md#host-clear-probes), [services ready](../testing/running-e2e.md#2-services-ready), [harness matches validation tier](../testing/running-e2e.md#3-harness-matches-validation-tier); serial `:test-cover` runs; [frozen tree](../testing/change-authoring-workflow.md#frozen-tree) for `independent-review`.
2. Most items here are config/build/docs (no `:test-cover`); e2e applies only where the row's `validation_tier` names it (**MTV**, and the deferred **MT-WATCH** if/when it reaches implementation).

---

## Per-item detail

Each item is one serial loop: `implementation` (unit-focused) → `independent-review` (frozen) → `commit`. Gate fields: [iteration vocabulary](../testing/iteration-vocabulary.md). No item touches `packages/*/lib/**` runtime or `android/ios` native, so **`coverage_evidence_gate: n/a`** throughout (verify per item against the [coverage grep](../testing/coverage-design.md)).

### MT0.0 — Update Lerna to current (prerequisite)

- **next_work_type:** `implementation` · **validation_tier:** `unit-focused` · gates: impl `open`, review `open`, commit `open` · **commit_subject:** `build(deps): update lerna to current`
- **Do:**
  - Bump `lerna` to the latest release in root `devDependencies`; refresh `yarn.lock`. This pulls a current bundled `nx` ([MonoTool-AD-1 prerequisite](architecture-decisions.md#monotool-ad-1--nx-local-cache-via-the-lerna-runner-no-turborepo-no-nx-cloud--accepted)).
  - Confirm the bundled `nx` version supports the `nx.json` keys used in MT1 (`neverConnectToCloud`, `namedInputs`, per-target `cache`/`inputs`/`outputs`) and includes the `nx watch --all --initialRun` fix (nx PR #32282) needed by the deferred MT-WATCH.
- **Acceptance:**
  - `yarn` installs cleanly; `yarn lerna:prepare` still exits 0 (behavior unchanged pre-`nx.json`).
  - `yarn lint`, `yarn tsc:compile`, `yarn tests:jest` remain green.
  - Record the resulting `lerna` + bundled `nx` versions in a note (feeds MT1/MT-WATCH version checks).

### MT0.1 — dependency-cruiser `lint:deps`

- **next_work_type:** `implementation` · **validation_tier:** `unit-focused` · gates: impl `open`, review `open`, commit `open` · **commit_subject:** `build(deps): add dependency-cruiser lint:deps for lib import graph`
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

### MT0.2 — Durable OKF docs — **ready to commit**

- **work type:** `documentation` · **validation_tier:** none · gates: n/a · **commit_subject:** `docs: add monorepo tooling OKF bundle`
- **Do:** `okf-bundle/monorepo-tooling/{index.md,architecture-decisions.md,prepare-and-cache.md,work-queue.md}`; add a "Monorepo tooling" entry to [`okf-bundle/index.md`](../index.md).
- **Acceptance:** OKF DRY/consistency pass green (canonical location, link hygiene, durable vs ephemeral split); decisions live only in `architecture-decisions.md`; ephemeral phases live only here. Documentation/DRY pass completed after `docs: correct assertion about JS bundles in dev`.

### MT0.3 — Benchmark baseline

- **next_work_type:** `implementation` · **validation_tier:** none · gates: impl `open`, review `open`, commit `open` · **commit_subject:** `build(scripts): add prepare benchmark script`
- **Do:** `scripts/benchmark-prepare.sh` (macOS; scenarios A–D from [prepare-and-cache § benchmark](prepare-and-cache.md#benchmark-methodology)); capture **pre-Nx** B/C/D medians into a benchmarks note.
- **Acceptance:**
  - Script runs A–D, prints median-of-3 per scenario, exits 0.
  - Pre-Nx baseline numbers recorded (used to prove MT1 gains).

### MT1 — Deterministic cached prepare

- **next_work_type:** `implementation` · **validation_tier:** `unit-focused` · gates: impl `open`, review `open`, commit `open` · **commit_subject:** `build(deps): enforce package build order and enable nx prepare cache`
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

### MT2 — Declaration maps

- **next_work_type:** `implementation` · **validation_tier:** `unit-focused` · gates: impl `open`, review `open`, commit `open` · **commit_subject:** `build(ts): emit declaration maps for package builds`
- **Do:** add `declaration: true` + `declarationMap: true` to `tsconfig.packages.base.json`, `packages/ai/tsconfig.json`, `packages/vertexai/tsconfig.json` ([MonoTool-AD-5](architecture-decisions.md#monotool-ad-5--keep-react-native-builder-bob-emit-declaration-maps--accepted)).
- **Acceptance:**
  - After `yarn lerna:prepare`, `packages/*/dist/typescript/**/*.d.ts.map` exist.
  - `yarn tsc:compile` exits 0; `yarn lint` exits 0.
  - Spot-check: IDE go-to-definition on a cross-package symbol lands on `lib/**` source (record the check in notes).
  - **Map resolves to shipped source:** open one emitted `.d.ts.map` and confirm its `sources` point at the published `lib/*.ts` (relative, no absolute path leak) — since `files` publishes `lib`, external consumers get go-to-definition too.
  - `.d.ts.map` do not leak into unintended published paths (bob `files`/`exclude` still correct).

### MT4 — dependency-cruiser rule hardening — **gated on MT1**

- **next_work_type:** `implementation` · **validation_tier:** `unit-focused` · gates: impl `open`, review `open`, commit `open` · **commit_subject:** `build(deps): enforce package import boundaries`
- **Do:** extend `.dependency-cruiser.cjs` ([MonoTool-AD-6](architecture-decisions.md#monotool-ad-6--dependency-cycle-linting-via-dependency-cruiser-as-lintdeps--accepted)): **`not-to-own-dist`** (forbid only *relative* `../dist/**`/`./dist/**` imports — **not** the mapped hub API `@react-native-firebase/app/dist/module/...`, which is legitimate); graph allowlist (satellites → `app` only; `ai` → `auth`/`app-check`; `vertexai` → `ai`).
- **Acceptance:**
  - `yarn lint:deps` exits 0 on current tree with the stricter rules (the existing `@react-native-firebase/app/dist/module/...` imports in ~15 satellites must **not** be flagged).
  - A deliberate off-graph import (e.g. `firestore` importing `auth`) fails `lint:deps` (then revert).
  - A deliberate *relative* own-`../dist` import fails `lint:deps` (then revert).
  - `yarn lint` full still exits 0.

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

### MTV — Branch-wide validation — **gated on all**

- **next_work_type:** `pre-merge-validation` · **validation_tier:** `full` · gates tracked at branch level · **commit_subject:** n/a (no product edit)
- **Acceptance:** full validation per [running e2e § before merge](../testing/running-e2e.md#before-merge-pr-handoff) and [validation checklist](../testing/validation-checklist.md); clean-tree `yarn` + `yarn lerna:prepare` deterministic; `yarn lint` (incl `lint:deps`), `yarn tsc:compile`, `yarn tests:jest` green; e2e on required platforms green.

---

## Current gates

| Item | impl | review | commit | next_work_type |
|------|------|--------|--------|----------------|
| MT0.0 | open | open | open | `implementation` |
| MT0.1 | open | open | open | `implementation` |
| MT0.2 | closed | n/a | `docs: add monorepo tooling OKF bundle` | `commit` |
| MT0.3 | open | open | open | `implementation` |
| MT1 | open | open | open | `implementation` |
| MT2 | open | open | open | `implementation` |
| MT4 | open | open | open | `implementation` |
| MT-WATCH | open | open | open | `gap-analysis` (deferred) |
| MTV | open | open | open | `pre-merge-validation` |
