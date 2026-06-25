---
type: Reference
title: TurboModule migration implementation workflow
description: New Architecture–specific artifacts for Codegen specs, native module conversion, area harness setup, and coordinated break validation — extends the cross-package change authoring workflow.
tags: [new-architecture, turbomodule, codegen, workflow, migration]
timestamp: 2026-06-26T00:00:00Z
---

# TurboModule migration implementation workflow

Requirements for migrating **one package** (or one legacy native module within a multi-module package) from legacy `NativeModules` to Codegen TurboModules. **Shared loop:** [change authoring workflow](../testing/change-authoring-workflow.md).

**Policy:** [OKF documentation and commit policy](../documentation-policy.md).

## Read first

| Topic | Document |
|-------|----------|
| **Change authoring loop** | [change-authoring-workflow.md](../testing/change-authoring-workflow.md) |
| Live phase/gate snapshots | [migration-work-queue.md](migration-work-queue.md) |
| Locked decisions, inventory, phase order | [migration-work-queue.md](migration-work-queue.md) |
| Work types, tiers, gates | [change-authoring-workflow.md](../testing/change-authoring-workflow.md); term ids: [iteration-vocabulary.md](../testing/iteration-vocabulary.md) |
| E2e commands | [running-e2e.md](../testing/running-e2e.md) |
| Validation commands | [validation-checklist.md](../testing/validation-checklist.md) |
| Reference implementation | [`packages/functions`](../../../packages/functions/) ([PR #8603](https://github.com/invertase/react-native-firebase/pull/8603)) |

## TurboModule hard gates

In addition to [change authoring gates](../testing/change-authoring-workflow.md#gates):

| Gate | Requirement |
|------|-------------|
| Spec inventory | Native methods inventoried from Java/ObjC; mapped to typed spec using `packages/<pkg>/lib/types/internal.ts` where available |
| Codegen | `specs/NativeRNFBTurbo*.ts` + `codegenConfig`; generated android/ios artifacts **committed** (`includesGeneratedCode: true`) |
| Native shell | Android `NativeRNFBTurbo*` extends generated `*Spec`; iOS spec protocol + `getTurboModule()` |
| JS wiring | `nativeModuleName` → `NativeRNFBTurbo*`; `turboModule: true`; web shims via `setReactNativeModule` unchanged |
| Podspec / package | New-arch guard; exclude duplicate RN generated providers (see [`RNFBFunctions.podspec`](../../../packages/functions/RNFBFunctions.podspec)) |
| Implementation | Package Jest + **unit-focused** e2e on New Architecture build |
| Review | Package e2e **area-focused** tier on frozen tree; no `.only`; native lint rows from [validation checklist](../testing/validation-checklist.md) where touched |
| Event deferral | Legacy event proxy retained unless [queue deferral discriminator](migration-work-queue.md#deferred-cleanup-phase-eventemitter) triggers escalation |

### Multi-module packages

One TurboModule spec **per legacy native module** — do not consolidate in the first pass (database ×5, firestore ×4). One focused commit per spec/module when gates close, or one commit per package when the whole package converts in a single PR — follow queue phase boundaries.

## Spec authoring (`gap-analysis` / pre-`implementation`)

1. Inventory `@ReactMethod` / `RCT_EXPORT_METHOD` from existing Java/ObjC sources.
2. Draft `specs/NativeRNFBTurbo*.ts` — strong types from `lib/types/internal.ts` and firebase-js-sdk shapes; `Object` / open maps only for genuinely dynamic payloads.
3. Naming: `NativeRNFBTurbo*` prefix (locked decision — [migration work queue § locked decisions](migration-work-queue.md#locked-decisions)).
4. Run `yarn codegen` in the package; commit generated output under `android/.../generated` and `ios/generated`.
5. For Phase 0 (`app`): include unified module resolver work in `packages/app` ([queue § reference pattern](migration-work-queue.md#reference-pattern-functions)).

## TurboModule `implementation`

Per package, repeat the [`functions`](../../../packages/functions/) shape:

1. **`specs/NativeRNFBTurbo*.ts`** — extends `TurboModule`.
2. **`package.json` `codegenConfig`** — `jsSrcsDir: "specs"`, android `javaPackageName`, ios `modulesProvider`.
3. **Android** — `NativeRNFBTurbo*` extends generated `*Spec`; register in package class.
4. **iOS** — `.mm` implements spec; `- (std::shared_ptr<TurboModule>)getTurboModule:` returns generated JSI class.
5. **JS** — update namespace config; no public API changes unless unavoidable.
6. **Native business logic** — prefer keeping ObjC++/Java shell + existing Swift helpers; language modernization is out of scope ([queue rationale](migration-work-queue.md#reference-pattern-functions)).

**Unit-focused** tier per [change authoring § implementation inner loop](../testing/change-authoring-workflow.md#implementation-inner-loop) and [TurboModule area harness](#turbomodule-area-harness) below.

Shared infrastructure (already landed for `functions`):

* [`packages/app/lib/internal/registry/nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts) — `turboModule` flag, iOS null encoding
* [`packages/app/lib/internal/nullSerialization.ts`](../../../packages/app/lib/internal/nullSerialization.ts) + native interceptor

## TurboModule `independent-review`

On a **frozen tree** — full [change authoring § independent-review](../testing/change-authoring-workflow.md#independent-review), plus:

* New Architecture build on each touched platform (native bridge change).
* Package e2e at **area-focused** tier with [area harness](#turbomodule-area-harness) applied locally before first `:test-cover`.
* iOS: exercise null-in-object payloads where the package passes option maps ([RN #52802](https://github.com/facebook/react-native/issues/52802)) — highest risk: `auth`, `firestore`, `database`, `storage`.

## TurboModule area harness

Extends [change authoring § harness narrowing](../testing/change-authoring-workflow.md#harness-narrowing).

**Area setup (required for `unit-focused` and `area-focused` tiers):** narrow `tests/app.js` / `tests/globals.js` to the package under migration — load only that package's `platformSupportedModules` entry and its `packages/<pkg>/e2e/*.e2e.js` specs.

| Package | Typical e2e entry |
|---------|-------------------|
| `app` | `packages/app/e2e/` |
| `auth` | `packages/auth/e2e/` |
| `firestore` | `packages/firestore/e2e/` (may coexist with Pipeline specs — load package module only) |
| `functions` | `packages/functions/e2e/` (reference; already migrated) |
| Others | `packages/<pkg>/e2e/` |

**Sanity check:** pass counts must match loaded scope — not full-app totals ([running e2e § gate](../testing/running-e2e.md#harness-narrowing-gate-blocking)).

**Push state (committed):** full test app remains default for CI. Local `:test-cover` during migration uses area narrowing even when git has full harness.

**Phase R / coordinated break:** revert all narrowing; **full** tier 3-platform run before monorepo major ships ([change authoring § pre-merge-validation](../testing/change-authoring-workflow.md#work-types)).

## TurboModule `documentation`

Per package (or per phase batch), same commit when user-facing:

**User docs**

* Migration guide update for coordinated New Architecture break (final phase only unless package already ships new-arch-only like `functions`)
* Package install notes if podspec/build requirements change

**OKF bundle maintenance**

* Update [migration work queue](migration-work-queue.md) gate rows when items close
* Record non-obvious codegen or null-serialization choices here or in queue historical notes — not only commit messages

## TurboModule `commit`

```text
feat(<pkg>): migrate <module-or-package> to TurboModules
```

**Never stage:** area narrowing in `tests/app.js` / `tests/globals.js`, any `.only`.

## Gotchas

* **New Architecture only** — no dual old/new bridge; podspec old-arch guard like [`RNFBFunctions.podspec`](../../../packages/functions/RNFBFunctions.podspec).
* **Events deferred** — keep `RNFBRCTEventEmitter` / `nativeEvents` fan-out unless testing forces escalation ([queue § deferred cleanup](migration-work-queue.md#deferred-cleanup-phase-eventemitter)).
* **Swift / ObjC interop** — TurboModule shell stays ObjC++; follow functions podspec patterns for `use_frameworks!` and non-framework builds.
* **Unified resolver** — Phase 0 adds `TurboModuleRegistry.get` with `NativeModules` fallback in `packages/app`; turbo-only packages drop fallback once migrated.
* **phone-number-verification** — bypasses `createModuleNamespace`; wire spec + resolver directly in `modular.ts`.

Live phase status and arbiter gates: [migration work queue](migration-work-queue.md) (ephemeral).
