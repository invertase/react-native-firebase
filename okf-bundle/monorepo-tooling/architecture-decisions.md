---
type: Reference
title: Monorepo tooling decisions (ADR)
description: Canonical owner of durable build-tooling decisions for the React Native Firebase monorepo — task orchestration, caching, prepare graph, declaration maps, dependency-cycle linting, and dev watch. The "what we decided and why", including rejected alternatives.
tags: [monorepo, tooling, nx, lerna, bob, adr, decisions]
timestamp: 2026-07-10T00:00:00Z
---

# Monorepo tooling decisions (ADR)

**Canonical owner of durable build-tooling decisions.** Each entry is a decision plus rationale and the rejected alternatives. Design detail lives in [prepare, cache, and watch design](prepare-and-cache.md); ephemeral rollout state lives in the [rollout work queue](work-queue.md). Those docs **link here** for the "why" — they do not restate decisions.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md).

## Decision ID convention

All decisions use the **`MonoTool-AD-<n>`** prefix so monorepo-tooling ADRs are unambiguous from `NewArch-AD-*` (TurboModule) records. Use this prefix in durable code comments and docs that cite these decisions.

## Status legend

| Status       | Meaning                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Accepted** | Decided; implement to this.                                                                                                               |
| **Proposed** | Recommended, awaiting sign-off; safe to plan around.                                                                                      |
| **Open**     | Under analysis; do not lock in code until resolved.                                                                                       |
| **Deferred** | Direction noted, but the mechanism needs a dedicated gap-analysis pre-phase before it is locked or implemented; not on the critical path. |

## Goals (unchanged from evaluation)

The targets for RNFB monorepo tooling:

- Deterministic, correctly-ordered package builds on a **clean tree**
- Fast local rebuilds (avoid re-transpiling unchanged packages)
- Publishable, self-contained npm packages (build output, not source)
- IDE go-to-definition into TypeScript source
- Low-friction developer inner loop (watch / TDD)

The evaluation baseline: Yarn 4 workspaces + Lerna 9 (`lerna run` delegates to Nx) + react-native-builder-bob, **no `nx.json`**, **no caching**, and peer-dependency build edges invisible to the task runner.

---

## MonoTool-AD-1 — Nx local cache via the Lerna runner; no Turborepo, no Nx Cloud — **Accepted**

Adopt Nx **local computation cache** by adding an `nx.json`. Keep `lerna run` as the task entrypoint (Lerna 6+ already delegates to the Nx task runner). Do **not** add Turborepo. Do **not** connect Nx Cloud or any remote cache.

**Why:** Lerna already routes `lerna run` through Nx; an `nx.json` unlocks caching and graph ordering with no new task runner. Local cache turns a no-op `yarn lerna:prepare` and unchanged-package installs into near-instant cache replays, and rebuilds only changed packages + dependents.

**Prerequisite — update Lerna to current:** bump `lerna` to the latest release before this work; that pulls a current bundled `nx`, which (a) supports the `nx.json` keys used here (`neverConnectToCloud`, per-target `cache`/`inputs`/`outputs`, `namedInputs`) and (b) includes the `nx watch --all --initialRun` fix needed later. Tracked as [work-queue MT0.0](work-queue.md#mt00--update-lerna-to-current-prerequisite).

**No-cloud everywhere:** `neverConnectToCloud: true` blocks _connecting/setup_ only — per Nx docs it does **not** disable cloud usage at command time. The runtime guard is `NX_NO_CLOUD=true` (or `--no-cloud`), so it is applied in **both** places: on the local `lerna:prepare` entrypoint (via `cross-env`, see [MonoTool-AD-4](#monotool-ad-4--one-inlined-prepare-command-no-wrapper-script--accepted)) and in every CI job that runs Nx ([MonoTool-AD-8](#monotool-ad-8--nxcache-shared-on-ci-not-on-publish--accepted)).

**Rejected:**

- **Turborepo** — a third task runner stacked on Lerna→Nx; duplicates `nx.json` `targetDefaults`; no benefit over the runner already present.
- **Nx Cloud / remote cache** — introduces a third-party runtime dependency and data egress. OSS terms are not publicly guaranteed; self-hosted remote cache is Enterprise-only. Local cache captures the day-to-day win without the dependency. CI may still share `.nx/cache` via `actions/cache` (see [MonoTool-AD-8](#monotool-ad-8--nxcache-shared-on-ci-not-on-publish--accepted)) without Nx Cloud.

---

## MonoTool-AD-2 — Keep Lerna for versioning and publish — **Accepted**

Lerna remains the owner of version bumping, changelog generation, and `lerna publish from-package` (OIDC provenance). No change to `lerna.json`, `publish.yml`, or the release flow.

**Why:** The publish workflow is mature (conventional commits, `ignoreChanges`, trusted publishing). Nx adoption is scoped to task running/caching only; splitting publish from task-running is the documented Lerna+Nx pattern.

**Publish impact of the new devDeps (verify, expected-nil):** [MonoTool-AD-3](#monotool-ad-3--build-order-via-devdependencies-not-manual-phase-scripts--accepted) adds internal `@react-native-firebase/app` `devDependencies`. In this repo's **fixed** versioning (`lerna.json` `version: 25.1.0`, `exact: true`) every package already bumps in lockstep and Lerna already rewrites internal `peerDependencies` ranges each release; the new devDep ranges are rewritten by the same mechanism. Confirm with a `lerna version` dry run that (a) the exact devDep ranges are rewritten to the new version and (b) nothing else in the release flow (provenance, `ignoreChanges`) is affected. No side effects expected.

**Rejected:** Full Nx (drop Lerna publish) — large migration (per-package project config, RN-native task wiring) for no publish-side benefit.

---

## MonoTool-AD-3 — Build order via `devDependencies`, not manual phase scripts — **Accepted**

Encode the compile-time build graph as workspace **`devDependencies`** so the Nx/Lerna task runner orders `prepare` correctly on a clean tree. Combined with `"prepare": { "dependsOn": ["^prepare"] }` in `nx.json`.

**Package counts are owned by [prepare-and-cache § package dependency graph](prepare-and-cache.md#package-dependency-graph)** (documentation policy: single owner per fact). In short: add `"@react-native-firebase/app": "<version>"` to `devDependencies` of **17 packages — every package except `app` and `vertexai`** (the 16 plain satellites plus `ai`). `vertexai` is excluded on purpose: its existing `@react-native-firebase/ai` `dependency` already orders it after `ai` (→ `app`).

**Why:** Lerna/Nx topologically sort on `dependencies` + `devDependencies` only — **`peerDependencies` are ignored**. Today `app` and its dependents land in the same parallel wave, so a clean-tree build can start a satellite's `tsc`/`bob` before `packages/app/dist/**` exists. That currently "works" only by timing luck and pre-existing `dist/`. Declaring the edges as devDependencies makes the existing graph machinery enforce the real order (both Lerna's own topological `--sort` and Nx's `^prepare` task graph). `devDependencies` are stripped from published tarballs, so npm consumers are unaffected; `peerDependencies` remain the runtime contract.

**Rejected:**

- **Manual multi-phase prepare scripts** (`prepare:hub` → `prepare:satellites` → …) — exposes useless intermediate states; a developer wants "unknown tree → trusted tree" in one command. We have full control over the dependency graph declaration, so the runner should just know the order.
- **Converting `peerDependencies` to `dependencies`** — changes publish/runtime semantics; wrong tool for a build-ordering problem.
- **`dependsOn: ["^prepare"]` alone** — insufficient; without the devDependency edges the runner cannot see the `app` hub relationship.

---

## MonoTool-AD-4 — One inlined prepare command; no wrapper script — **Accepted**

The only prepare entrypoint stays **`yarn lerna:prepare`**. Its inline body gains just the no-cloud env prefix: `cross-env NX_NO_CLOUD=true lerna run prepare` (still one inlined line; still delegates to the Nx runner; `cross-env` is already a devDependency, so this is cross-platform). No `scripts/*.sh` wrapper, no new developer-facing scripts, no entrypoint rename — the command **name** agents type is unchanged.

**Why:** `lerna run prepare` is already a single inlined line and already routes through Nx; with [MonoTool-AD-1](#monotool-ad-1--nx-local-cache-via-the-lerna-runner-no-turborepo-no-nx-cloud--accepted) + [MonoTool-AD-3](#monotool-ad-3--build-order-via-devdependencies-not-manual-phase-scripts--accepted) it becomes cached and correctly ordered with zero new surface and zero churn to the many OKF/agent docs that reference `yarn lerna:prepare`. The `NX_NO_CLOUD=true` prefix is the runtime no-cloud guard ([MonoTool-AD-1](#monotool-ad-1--nx-local-cache-via-the-lerna-runner-no-turborepo-no-nx-cloud--accepted)). Agents keep a single canonical command; scoped prepare is removed from docs.

**Ordering fallback:** the clean-tree ordering relies on `lerna run prepare` honoring the graph. Lerna's own topological `--sort` on the [MonoTool-AD-3](#monotool-ad-3--build-order-via-devdependencies-not-manual-phase-scripts--accepted) devDep edges should order `app` first regardless of Nx; the `nx.json` `dependsOn: ["^prepare"]` additionally drives the cache graph. If `lerna run` is ever found **not** to expand `^prepare`, the drop-in remedy is to make the inline body `cross-env NX_NO_CLOUD=true nx run-many -t prepare` (same entrypoint name). MT1 acceptance explicitly tests repeatable clean-tree ordering to catch this.

**Rejected:** A `scripts/rnfb-prepare.sh` wrapper — adds surface/churn for no gain over the existing inlined line.

---

## MonoTool-AD-5 — Keep react-native-builder-bob; emit declaration maps — **Accepted**

Keep `react-native-builder-bob` as the package bundler. Enable `declaration` + `declarationMap` so bob's `typescript` (tsc) target emits `.d.ts.map` alongside `dist/typescript/**`. Configure in the **existing** shared config `tsconfig.packages.base.json` plus the two standalone configs (`packages/ai`, `packages/vertexai`) — no new base tsconfig files.

**Why:** bob is the RN-ecosystem-correct builder (RN field conventions, ESM `module` target, per-package layout). Declaration maps give IDE go-to-definition into source for external consumers without the old `bundler && tsc --emitDeclarationOnly` two-step. Reusing the shared base keeps the change to three files.

**Rejected:**

- **tsdown / rslib / tsup** — generic TS-service bundlers, not RN-aware; defer unless bob becomes a measured bottleneck.
- **New `tsconfig.build.json` per package / `@codecompose/typescript-config`** — adds base-config surface; deferred. RNFB already has a shared base to extend.

---

## MonoTool-AD-6 — Dependency-cycle linting via dependency-cruiser as `lint:deps` — **Accepted**

Add `dependency-cruiser` as a static-analysis lint, surfaced as `yarn lint:deps`, wired into the lint suite, CI lint job, and the change-authoring lint gate. It validates the `packages/*/lib/**` import graph (no cycles; no import of a package's **own** built output; cross-package imports restricted to the known graph). Rule/config detail: [prepare-and-cache § dependency-cycle linting](prepare-and-cache.md#dependency-cycle-linting).

**Scoped `dist` rule (not a blanket ban):** the "no import of dist" rule is **`not-to-own-dist`** — it forbids only _relative_ imports of a package's own `../dist/**`/`./dist/**`. It must **not** forbid the intentional hub API `@react-native-firebase/app/dist/module/...`, which ~15 satellites import by design (that specifier is mapped to type stubs via each package's tsconfig `paths`, and is how satellites consume the built hub). A blanket `no lib → **/dist/**` rule would fail on the **current, correct** tree and is rejected.

**Why:** The current toolchain has **no** cycle detection (no `import/no-cycle`, no madge/depcruise). dependency-cruiser is an architecture **linter** — rule engine, TS/path awareness, ESLint-style CI output — versus madge which is visualization-first ([author's own framing](https://github.com/sverweij/dependency-cruiser/issues/203): dependency-cruiser's "main goal is to validate dependencies, given your own set of rules"; madge's "primary goal is visualisation"). Treating dependency validation as a lint fits it into existing `yarn lint` + CI with no new toolchain category. Correct resolution requires pointing dependency-cruiser at the tsconfig path aliases and excluding `dist`/`__tests__`/`e2e`/`node_modules` from traversal ([design](prepare-and-cache.md#dependency-cycle-linting)).

**Rejected:**

- **madge** — cycle listing + images, but weak rule DSL and CI integration.
- **oxlint `import/no-cycle`** — would mean adopting a new linter; out of scope (lint/format toolchains are staying).
- **Nx circular-dependency analytics** — Nx Cloud Enterprise feature; rejected with [MonoTool-AD-1](#monotool-ad-1--nx-local-cache-via-the-lerna-runner-no-turborepo-no-nx-cloud--accepted).

---

## MonoTool-AD-7 — AI test fixtures are a Jest prerequisite, not a build step — **Accepted**

Remove the `vertexai-sdk-test-data` mock download (`yarn tests:ai:mocks`) from `packages/ai`'s `prepare`. Make it a **Jest prerequisite gated on AI-test detection**. Fixtures remain **gitignored** (not committed).

**Why:** The mocks are consumed **only** by `packages/ai/__tests__/**` (verified: no `tests/e2e`, no `vertexai` e2e, no `tests/local-tests` usage). Coupling a network clone into `prepare` runs it on every `yarn` / `yarn lerna:prepare` and makes `ai:prepare` non-cacheable and non-deterministic. As a Jest prerequisite it runs only when AI unit tests run, and `ai:prepare` becomes fully cacheable.

**Wiring constraint (single flat jest config):** the root `jest.config.js` has **no `projects`** and **no `globalSetup`** today, so a bare `globalSetup` would fetch mocks for _every_ `yarn tests:jest` run — re-adding the non-determinism this removes. Therefore **gate the fetch on AI-test detection** (a `globalSetup` that no-ops unless the run includes `packages/ai/__tests__/**`); converting jest to `projects` with an `ai`-only project is an acceptable heavier alternative. The fetch itself must be **fast-exit/offline-idempotent**: it already skips the clone when present but still runs a network `git ls-remote` each call — add a local-clone short-circuit so repeat AI runs need no network. Detail: [prepare-and-cache § `ai` special case](prepare-and-cache.md#ai-special-case).

**Rejected:**

- **Commit the fixtures** — user decision: do not vendor the test-data repo.
- **Bare (ungated) `globalSetup`** — fetches on every jest run, not just AI; defeats the determinism goal.
- **Keep in `prepare`** — network dependency in the build path; breaks cache determinism ([MonoTool-AD-1](#monotool-ad-1--nx-local-cache-via-the-lerna-runner-no-turborepo-no-nx-cloud--accepted)).

---

## MonoTool-AD-8 — `.nx/cache` shared on CI, not on publish — **Accepted**

CI PR/main jobs may restore/save `.nx/cache` via `actions/cache` (keyed on `yarn.lock` + nx version) and set **`NX_NO_CLOUD=true`** on every Nx-running job. The **publish** workflow does **not** restore the Nx cache.

**Why:** CI benefits from cross-run cache replay without any Nx Cloud dependency. Release builds should be reproduced from clean publish-checkout semantics; a warm task cache must never influence a published artifact.

**Cross-machine cache correctness depends on complete `outputs`:** CI restores `.nx/cache` onto a **fresh checkout** where gitignored generated files (`lib/version.ts` in 18 packages; `app`'s native version files) do not yet exist. If those are not declared `outputs`, a cache **hit** restores `dist/**` but leaves them missing → the JS jobs' subsequent `tsc:compile`/`lint`/`tests:jest` fail on unresolved `./version`, and native builds miss their version constants. This is why [MonoTool-AD-10](#monotool-ad-10--generated-version-files-are-declared-cache-outputs-not-committed--accepted) is a hard prerequisite for turning on CI cache sharing.

**Rejected:** Nx Cloud remote cache ([MonoTool-AD-1](#monotool-ad-1--nx-local-cache-via-the-lerna-runner-no-turborepo-no-nx-cloud--accepted)); caching on publish (reproducibility risk).

---

## MonoTool-AD-9 — Dev watch rebuilds prepare; e2e TDD rerun is event-driven off Metro — **Deferred**

**Deferred to a gap-analysis pre-phase** ([work-queue MT-WATCH](work-queue.md#mt-watch--dev-watch--e2e-rerun-gap-analysis-pre-phase--deferred)). No incremental dev-watch/hot-reload loop exists today; rather than lock a mechanism now, the direction below is recorded and the details are driven by a dedicated analysis phase that is **not on the critical path** for the cache/graph/declaration-map/lint work.

**Direction:** provide a root **`dev:watch`** that uses `nx watch` to rebuild `dist/**` on `lib/**` change. For the e2e TDD loop, drive test rerun from a **Metro bundle-ready event** (HMR `update-done` / `onBundleBuilt`), not a fixed `sleep`. Because RNFB owns the Jet test runner and its HTTP control plane (port 8091), add a control action to re-run the loaded suite on that signal.

**Bundling premise:** per [running e2e § Rules #3](../testing/running-e2e.md#rules) (canonical owner). The `lib → dist → Metro → rerun` chain is therefore a valid inner loop for iOS/Android/macOS **debug**.

**Why (direction):** `nx watch` runs its callback sequentially after each rebuild, but that point is upstream of Metro re-bundling. The real "bundle is live in the app" signal is Metro's HMR `update-done` message (client-observable) or `onBundleBuilt` (server callback). Keying the rerun on that event makes the loop deterministic and `sleep`-free, and the **same** Metro-ready signal is the correct driver for a future Appium-based e2e rerun.

**Command caveats to resolve before locking** ([design](prepare-and-cache.md#tier-a--prepare-watch--unit-tdd-sketch-to-be-validated)): `nx watch --all --initialRun` was a no-op bug fixed only Aug-2025 (do the first pass with `nx run-many -t prepare`); `$NX_PROJECT_NAME` is comma-joined for multi-project batches (use `nx run-many -t prepare -p $NX_PROJECT_NAME`). These are inputs to the gap analysis, not accepted commands.

**Rejected (direction-level):**

- **`sleep N && <rerun>`** — races the Metro bundle; flaky.
- **Appium instead of Jet for the rerun trigger** — Appium drives UI, not JS bundling; Metro still owns updates, and Jet's in-app mocha-remote + 8091 control plane is a better rerun mechanism than external WebDriver commands. Metro remains the shared bundle-ready source for either runner.

---

## MonoTool-AD-10 — Generated version files are declared cache outputs, not committed — **Accepted**

Every file that `prepare` generates must be listed in the Nx target `outputs`, so a cache **hit** reproduces a complete tree. This covers the _gitignored, generated_ files: `{projectRoot}/lib/version.ts` (all packages; shared `targetDefaults`) and `app`'s native version files `ios/RNFBApp/RNFBVersion.m` + `android/src/reactnative/java/io/invertase/firebase/app/ReactNativeFirebaseVersion.java` (an `app`-scoped target override in `packages/app/package.json`). Do **not** commit these files.

**Why:** `genversion` writes `lib/version.ts`, imported by 18 packages' `lib` source (`import { version } from './version'`); Jest/eslint/`tsc` compile that source. `app`'s `build:version` writes the native version constants used by the iOS/Android builds. All are gitignored. The original `outputs` list (`dist/**` + `plugin/build/**`) omitted them, so a cache hit on a **clean tree** (a fresh CI checkout with restored `.nx/cache`, per [MonoTool-AD-8](#monotool-ad-8--nxcache-shared-on-ci-not-on-publish--accepted); or a locally cleaned tree) would restore `dist/**` but leave these missing → `tests:jest`/`lint`/`tsc:compile` fail on unresolved `./version`, and native builds miss version constants. Declaring them as outputs makes them generated-on-miss / restored-on-hit. **Correctness:** being gitignored, they are excluded from Nx **input** hashing (no self-invalidation); they restore into `lib/`/`ios/`/`android/` (safe regenerated artifacts); `genversion-ios/-android` read `lib/version.ts`, which restores alongside them, so the set is internally consistent. Detail: [prepare-and-cache § generated-file outputs](prepare-and-cache.md#generated-file-outputs-cache-correctness).

**Rejected:**

- **Commit the generated files** — constant per-release churn (they change on every version bump) and contradicts their own `# do not modify or commit` banners; the cache-output approach avoids tracked-file churn entirely.
- **Original `dist`-only `outputs`** — silently incomplete; breaks cache replay on clean trees (the failure mode above), especially under CI cache sharing.

---

## MonoTool-AD-11 — Scope `prepare` cache inputs with a `jsSource` namedInput — **Accepted**

Define a `jsSource` `namedInput` (`{projectRoot}/lib/**/*`, `{projectRoot}/plugin/**/*`, `{projectRoot}/tsconfig.json`, `{projectRoot}/plugin/tsconfig.json`, `{projectRoot}/package.json`, `{workspaceRoot}/tsconfig.packages.base.json`, `{workspaceRoot}/yarn.lock`) and set `targetDefaults.prepare.inputs = ["jsSource"]`.

**Why:** without an explicit `inputs`, Nx hashes the entire `{projectRoot}` for `prepare`. Edits to `__tests__/**`, `e2e/**`, `android/**`, `ios/**`, or docs would then bust a package's `prepare` cache — and via `dependsOn: ["^prepare"]`, every dependent's too — even though `prepare` only consumes JS source + the tsconfig/bob config. Scoping inputs to what `prepare` actually reads is what makes the "edit one `lib` file → rebuild that package only; rest replay" claim true and keeps native/test/doc edits from invalidating the JS build graph. (`lib/version.ts` is gitignored, so it is excluded from hashing despite matching `lib/**` — no self-invalidation with [MonoTool-AD-10](#monotool-ad-10--generated-version-files-are-declared-cache-outputs-not-committed--accepted).) Detail: [prepare-and-cache § Nx local cache](prepare-and-cache.md#nx-local-cache).

**Naming:** the input is named **`jsSource`** (not Nx's conventional `production`) because these are RN library packages, not deployed apps — "production" would misdescribe the set; `jsSource` names exactly what it globs.

**Rejected:** Nx default inputs (whole `projectRoot`) — over-invalidates the cache and undercuts the stated rebuild-scope benefits.

---

## Related docs

| Topic                                          | Document                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| Design detail (cache, graph, watch, benchmark) | [prepare-and-cache.md](prepare-and-cache.md)                         |
| Ephemeral rollout state                        | [work-queue.md](work-queue.md)                                       |
| Agent shell commands                           | [agent command policy](../testing/agent-command-policy.md)           |
| Change loop / gates                            | [change authoring workflow](../testing/change-authoring-workflow.md) |
| Doc/commit policy                              | [documentation policy](../documentation-policy.md)                   |
