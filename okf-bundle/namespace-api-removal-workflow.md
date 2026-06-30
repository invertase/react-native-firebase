---
type: Reference
title: Namespace API removal workflow
description: Cross-package requirements for removing the deprecated namespaced JS API and leaving a modular-only public surface — extends the change authoring workflow.
tags: [app, modular, namespaced, deprecation, migration, workflow]
timestamp: 2026-06-26T00:00:00Z
---

# Namespace API removal workflow

Cross-package requirements for one module (or the final **NF** app cleanup). **Shared loop:** [change authoring workflow](testing/change-authoring-workflow.md).

**Policy:** [OKF documentation and commit policy](documentation-policy.md). **Live gate snapshots:** [namespace API removal work queue](namespace-api-removal-work-queue.md) (ephemeral).

## Read first

| Topic | Document |
|-------|----------|
| **Change authoring loop** | [change-authoring-workflow.md](testing/change-authoring-workflow.md) |
| Work type / tier / gate field ids | [iteration-vocabulary.md](testing/iteration-vocabulary.md) |
| E2e commands | [running-e2e.md](testing/running-e2e.md) |
| Validation commands | [validation-checklist.md](testing/validation-checklist.md) |
| Auth compare-types triage (N6) | [packages/auth/compare-types-triage.md](packages/auth/compare-types-triage.md) |

## Remove vs keep (per module)

**Remove** (the namespaced surface):

| Surface | Where |
|---------|-------|
| `firebase.<module>()` root accessor | `app` root proxy + each package's `firebase` named export |
| `firebase.app().<module>()` accessor | `app` `setOnAppCreate` getters + `declare module '@react-native-firebase/app'` augmentation in `lib/types/namespaced.ts` |
| default export `<module>()` | `lib/namespaced.ts` `export default` |
| `Firebase<Module>Types` namespace | `lib/types/namespaced.ts` (or `FirebaseXTypes` block in an alt type file) |
| per-method deprecation warnings | `createDeprecationProxy` + `mapOfDeprecationReplacements` entry in `packages/app/lib/common/index.ts` |
| `KNOWN_NAMESPACES` entry + `createModuleNamespace()` | `packages/app/lib/internal/constants.ts`, each `lib/namespaced.ts` |

**Keep** (modular surface): `getX(app?)` / `fn(instance, …)` in `lib/index.ts` (modular-only entry — no separate `lib/modular.ts`), public types in `lib/types/<module>.ts`, statics as top-level named exports, native wiring.

**Modular-only end-state templates:** [`phone-number-verification`](../packages/phone-number-verification/lib/modular.ts) (stateless — `getReactNativeModule` directly; `modular.ts` is the sole implementation file) and [`ai`](../packages/ai/lib/index.ts) (instance object via `getAI(app)`; single `index.ts` entry). Factory-based modules (`ml`, `in-app-messaging`, …) follow the **`ai`** pattern: merge former `modular.ts` into `index.ts` and delete `modular.ts`. `vertexai` is a deprecated re-export of `ai`.

## Modular instance factory (N0)

Today modular getters route through the namespaced accessor + deprecation proxy (`getApp().<module>()` → `createDeprecationProxy(new ModuleClass())`). Modular-only removal must build the instance **without** the namespaced registry/proxy.

**Decision (proven on `ml`):** `getOrCreateModularInstance(ModuleClass, config, app?, customUrlOrRegion?)` in `packages/app/lib/internal/registry/modular.ts`. Memoises `new ModuleClass(app, config)` per `app.name`+key; resolves the app via the registry by name (with modular sentinel — see factory JSDoc); applies multi-app guard; clears cache via additive `addOnAppDestroy`. Each module's `lib/index.ts` owns its `ModuleClass` + `ModuleConfig` (modular-only — no `lib/modular.ts`). Stateless modules may skip the instance (phone-number-verification template).

## Namespace hard gates

In addition to [change authoring gates](testing/change-authoring-workflow.md#gates):

| Gate | Requirement |
|------|-------------|
| Gap analysis | Every namespaced capability has a modular export; flag cross-module namespaced hops, constructor side-effects, module-level state, multi-app support |
| Baseline | Module Jest + (where native) **area-focused** e2e on [**every required platform**](testing/running-e2e.md#platform-coverage-gate-blocking); `compare:types` baseline if registered |
| Implementation | Atomic swap — never register in **both** namespaced registry and factory at once (duplicate constructor side-effects) |
| Review | Removal greps empty (below); no deprecation-proxy regression for other modules; `compare:types` unchanged-or-improved if registered |
| Documentation | Row in [`docs/migrating-to-v26.mdx`](../../../docs/migrating-to-v26.mdx) → "namespaced removed"; reconcile v22 deprecation messaging |

### Removal greps (review must be empty)

```bash
rg "firebase\.<module>\(" packages/<module>
rg "createModuleNamespace|getFirebaseRoot" packages/<module>/lib
rg "Firebase<Module>Types" packages/<module>
rg "'<module>'" packages/app/lib/internal/constants.ts
test ! -f packages/<module>/lib/namespaced.ts && test ! -f packages/<module>/lib/types/namespaced.ts
test ! -f packages/<module>/lib/modular.ts
```

## Per-module `gap-analysis`

Read-only. Enumerate namespaced surface (instance methods, getters, statics, default + `firebase` exports, `Firebase<Module>Types`). Confirm modular parity; list gaps to add first. Note whether `getX()` still delegates via `getApp().<module>()`.

## Per-module `implementation`

Complete modular-only checklist (one focused commit scope):

1. Move `Firebase<Module>Module`, constructor side-effects, module state, statics out of `namespaced.ts` into `lib/index.ts`.
2. Rewire `getX()` in `lib/index.ts` via the N0 factory (or native module directly) — not `getApp().<module>()`; preserve `.app`/`.native`/`.emitter`/multi-app guards/side-effects.
3. Drop the module's `MODULAR_DEPRECATION_ARG` / `withModularFlag` plumbing.
4. Delete `lib/namespaced.ts`, `lib/types/namespaced.ts`, and `lib/modular.ts`; keep `lib/index.ts` as the sole public entry (`import './types/internal'`; export public types + statics).
5. Remove from `KNOWN_NAMESPACES`, `mapOfDeprecationReplacements`, and `declare module '@react-native-firebase/app'` augmentation.
6. `__tests__`: delete `describe('namespace')` + deprecation-pair tests; keep/expand modular.
7. `type-test.ts`: drop namespaced + `Firebase<Module>Types`.
8. `e2e`: remove `firebase v8 compatibility` suite; keep/expand modular API suite.
9. `README.md` + inline doc snippets.

**Unit-focused** tier: Jest subset + `tsc:compile` + `type-test.ts`; package-scoped e2e when native touched. Per [change authoring § implementation inner loop](testing/change-authoring-workflow.md#implementation-inner-loop) and [module area harness](#module-area-harness) when applicable.

## Per-module `independent-review`

On a **frozen tree** — [change authoring § independent-review](testing/change-authoring-workflow.md#independent-review), plus removal greps and module-specific **area-focused** e2e on [**every required platform**](testing/running-e2e.md#platform-coverage-gate-blocking) (no `.only`; **no Android/macOS shortcuts**). Minor/nit findings: fix or defer-with-rationale, then delta re-review before `commit`.

## Module area harness

Extends [change authoring § harness narrowing](testing/change-authoring-workflow.md#harness-narrowing). **Mechanics:** [running e2e § local harness overrides](testing/running-e2e.md#local-harness-overrides-harnessoverridesjs).

When native e2e runs: load **only** the target package's e2e spec(s) in `tests/app.js`. Narrow **`platformSupportedModules` on both** `if (Platform.other)` and `if (!Platform.other)` (recommended: Pattern A — initial array + `if (false && …)` on **both** blocks). Set **`RNFBDebug = true`** locally per [running e2e § fail-fast](testing/running-e2e.md#fail-fast-rnfbdebug-and-sub-suite-narrowing) — **never commit** (`false` is the committed default). Revert **both** blocks before `commit` or **full** tier. Pass counts must match loaded scope — not full-app totals ([running e2e § gate](testing/running-e2e.md#harness-narrowing-gate-blocking), [platform coverage gate](testing/running-e2e.md#platform-coverage-gate-blocking)).

## Per-module `documentation`

- User migration guide row under [`docs/migrating-to-v26.mdx`](../../../docs/migrating-to-v26.mdx) (one section per module)
- [Validation checklist § handoff](testing/validation-checklist.md#handoff-checklist) — `yarn reference:api`, static analysis, etc. when applicable
- Durable learnings in this file or package OKF — not only commit messages

## Per-module `commit`

```text
refactor(<module>): remove deprecated namespaced API
```

Before `git commit`:

1. Set the queue row's `commit_subject` to that exact line (replace `<module>`).
2. Close `commit_gate` and update the header/next-pickup line in [namespace API removal work queue](namespace-api-removal-work-queue.md).
3. Stage product, user docs, durable OKF learnings, **and** the queue doc together — one commit.

**Never stage:** area narrowing, any `.only`, ad-hoc harness edits, or **`RNFBDebug = true`** in `tests/globals.js`.

## NF — final cleanup (app + shared infra)

Only after N1–N6 modules committed and their greps empty. Same change-authoring loop; **full** tier for pre-merge.

- **App namespaced surface:** remove `firebase` + default from `packages/app/lib/index.ts`/`namespaced.ts`; remove namespace plumbing from `registry/namespace.ts`; remove `KNOWN_NAMESPACES` from `constants.ts` and `utils`'s `createModuleNamespace`.
- **Deprecation machinery:** remove `createDeprecationProxy`, `mapOfDeprecationReplacements`, `MODULAR_DEPRECATION_ARG`/`withModularFlag`/`warnIfNotModularCall`, and related globals in `global.d.ts` + `tests/globals.js`. Retire single-slot `setOnAppDestroy` in favor of `addOnAppDestroy`.
- **Pre-existing modular-only packages:** `ai`, `vertexai`, and `phone-number-verification` shipped before N1–N6 but must match the same end-state as migrated modules — **sole public entry is `lib/index.ts`** (no `export * from './modular'` shim; delete `lib/modular.ts` after inlining). `typedoc.json` entry points and internal imports must reference `lib/index.ts` only.
- **Repo sweep:**

```bash
rg "createModuleNamespace|createDeprecationProxy|KNOWN_NAMESPACES" packages/
rg "MODULAR_DEPRECATION_ARG|withModularFlag|warnIfNotModularCall" packages/
rg "RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS|RNFB_MODULAR_DEPRECATION_STRICT_MODE" .
rg "firebase\.(app\(\)\.)?\w+\(" packages/*/e2e packages/*/__tests__ tests/
```

## Gotchas

- **Atomic swap:** side-effect constructors (messaging headless task) — delete namespaced path in the **same** change as factory wiring.
- **Cross-module namespaced hops** (e.g. `firebase.utils(app)` in messaging): re-point before dependency loses accessor.
- **Dual-exposed statics:** keep modular export; remove namespaced/proxy path only.
- **`compare:types` gap:** only 10 packages registered — rely on `tsc` + `type-test.ts` for the rest.
- **Factory parity:** registry re-resolution by name; custom-URL validation deferred to N5 modules.
- **macOS e2e (native-only modules):** register a no-op `lib/web/` stub via `setReactNativeModule` in `lib/index.ts` so macOS Jet can load and exercise modular JS without a native bridge (see `in-app-messaging` `RNFBFiamModule` web fallback).
- **Firestore on Other/macOS:** Firestore **Lite** only on the web bridge — no full `firebase/firestore`. Unsupported APIs reject with `Not supported in the lite SDK.` See [Other platform Firestore Lite](packages/firestore/other-platform-firestore-lite.md).
