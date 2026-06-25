---
type: Reference
title: TurboModule migration work queue
description: Phase tracker for migrating React Native Firebase packages from legacy NativeModules to Codegen TurboModules under a coordinated New Architecture break.
tags: [new-architecture, turbomodule, codegen, migration, work-queue]
timestamp: 2026-06-26T00:00:00Z
---

# TurboModule migration — work queue

> **QUEUED (2026-06-26):** Planning document — awaiting maintainer review before implementation pickup.
> **Goal/order:** app foundation → hard probe → easy wins → remaining complex → coordinated break → EventEmitter cleanup. Links: [implementation workflow](turbomodule-implementation-workflow.md), [change authoring](../testing/change-authoring-workflow.md), [functions reference](../../../packages/functions/) ([PR #8603](https://github.com/invertase/react-native-firebase/pull/8603)).

Ephemeral tracker; see [OKF policy](../documentation-policy.md).

---

## Locked decisions

| # | Decision | Detail |
|---|----------|--------|
| 1 | **New Architecture only** | One coordinated semver break across the monorepo. No dual old/new bridge support per package (`functions` precedent: v24). |
| 2 | **Naming** | Codegen module names use `NativeRNFBTurbo*` prefix (e.g. `NativeRNFBTurboAuth`, `NativeRNFBTurboFirestore`). |
| 3 | **Typing** | Strong Codegen types wherever the API allows. Source of truth: `packages/*/lib/types/internal.ts`, native method inventories, firebase-js-sdk shapes. Use `Object` / open maps only where payloads are genuinely dynamic. |
| 4 | **Events** | **Defer** Codegen EventEmitter cutover to [Phase C cleanup](#deferred-cleanup-phase-eventemitter) unless testing proves deferral impossible. |
| 5 | **Generated code** | Commit codegen output (`includesGeneratedCode: true`); mirror `packages/functions` layout. |
| 6 | **Module resolution** | Unified resolver in `packages/app` — `TurboModuleRegistry.get(name)` with `NativeModules` fallback during transition. |

Implementation steps, harness, and commit rules: [turbomodule implementation workflow](turbomodule-implementation-workflow.md) — do not restate here.

---

## Resume checklist

Gate prerequisites before any `:test-cover` ([host rule](../testing/change-authoring-workflow.md#host-rule)):

1. [Pre-flight](../testing/running-e2e.md#pre-flight-is-the-host-clear-to-start): [host-clear probes](../testing/running-e2e.md#host-clear-probes), [services ready](../testing/running-e2e.md#2-services-ready), [harness matches validation tier](../testing/running-e2e.md#3-harness-matches-validation-tier) ([narrowing gate](../testing/running-e2e.md#harness-narrowing-gate-blocking) — required for **unit-focused** and **area-focused**; not [push harness](#harness)); [serial `:test-cover`](../testing/running-e2e.md#serialized-e2e-dispatch); [frozen tree](../testing/change-authoring-workflow.md#frozen-tree) for `independent-review`.
2. New Architecture enabled on dev host / emulator for native bridge work.
3. Per-package protocol: [Phase iteration protocol](#phase-iteration-protocol) below.

---

## What changes vs what stays

| Layer | Stays | Changes |
|-------|-------|---------|
| JS product API | `namespaced.ts`, `modular.ts`, web shims, `FirebaseModule` subclasses, arg prepending | `nativeModuleName` → `NativeRNFBTurbo*`; `turboModule: true` |
| Events (Phases 0–5) | Compile-time event names, `SharedEventEmitter` fan-out, `nativeEvents` | Native emitters unchanged — see [Phase C](#deferred-cleanup-phase-eventemitter) |
| Native | Firebase SDK integration, business logic | Extend generated `*Spec`; iOS `getTurboModule()`; podspec new-arch guard |
| Release | Per-package semver today | **One coordinated major** when Phases 0–5 complete |

---

## Reference pattern (`functions`)

Brief index — full checklist: [turbomodule implementation workflow](turbomodule-implementation-workflow.md).

Each migrated package repeats the [`functions`](../../../packages/functions/) shape: `specs/NativeRNFBTurbo*.ts` → `codegenConfig` + committed generated output → Android `NativeRNFBTurbo*` / iOS spec + `getTurboModule()` → JS `turboModule: true`.

**Phase 0 still required:** unified module resolver; flip `getAppModule()` turbo TODO in [`nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts).

---

## Deferred cleanup phase (EventEmitter)

Follow-on **after** Phases 0–5 and coordinated break. Not in scope unless testing blocks deferral.

| Topic | Current | Cleanup target |
|-------|---------|----------------|
| Event subscription | `RNFBNativeEventEmitter` + `RNFBAppModule` proxy | Codegen TurboModule events or RN New Architecture event emitters |
| Native emit | `RNFBRCTEventEmitter` / `ReactNativeFirebaseEventEmitter` | Align with chosen Codegen event pattern |
| JS fan-out | Fixed `nativeEvents` + `SharedEventEmitter` prefixes | Re-evaluate once native side supports typed events |

**Deferral discriminator:** if **area-focused** e2e or device testing shows TurboModule migration **cannot** work with the legacy event proxy, escalate that package's event path into the active migration PR — do not wait for Phase C.

---

## Package inventory

### No native bridge (out of scope)

| Package | Notes |
|---------|-------|
| `@react-native-firebase/ai` | Pure JS |
| `@react-native-firebase/vertexai` | Re-export over `ai` |

### Already migrated

| Package | TurboModule(s) | Status |
|---------|----------------|--------|
| `@react-native-firebase/functions` | `NativeRNFBTurboFunctions` | ✅ reference |

### Native packages — complexity summary

Android `@ReactMethod` counts approximate spec surface area. Multi-module: **one spec per legacy module** ([workflow § multi-module](turbomodule-implementation-workflow.md#multi-module-packages)).

#### Multi-module (Tier A)

| Package | Legacy modules | Events | Methods ≈ | Notes |
|---------|----------------|--------|-----------|-------|
| **database** | 5 modules (`RNFBDatabase*`) | 2 | ~22 | Transaction + sync listeners |
| **firestore** | 4 modules (`RNFBFirestore*`) | 4 | ~31 | Pipelines via `pipelineExecute`; listener IDs |

#### Single-module, high complexity (Tier B)

| Package | Legacy module | Events | Methods ≈ | Notes |
|---------|---------------|--------|-----------|-------|
| **auth** | `RNFBAuthModule` | 3 | **59** | Largest single spec |
| **messaging** | `RNFBMessagingModule` | 5–7 | 11 | Platform-conditional events; background iOS |

#### Single-module, moderate (Tier C)

| Package | Legacy module | Events | Methods ≈ |
|---------|---------------|--------|-----------|
| **storage** | `RNFBStorageModule` | 1 | 14 |
| **crashlytics** | `RNFBCrashlyticsModule` | 0 | 14 |
| **analytics** | `RNFBAnalyticsModule` | 0 | 11 |
| **remote-config** | `RNFBConfigModule` | 1 | 11 |
| **app-check** | `RNFBAppCheckModule` | 1 | 7 |
| **perf** | `RNFBPerfModule` | 0 | 7 |

#### Single-module, simple (Tier D)

| Package | Legacy module | Events | Methods ≈ | Notes |
|---------|---------------|--------|-----------|-------|
| **installations** | `RNFBInstallationsModule` | 0 | 3 | Smallest |
| **in-app-messaging** | `RNFBFiamModule` | 0 | 3 | |
| **app-distribution** | `RNFBAppDistributionModule` | 0 | 4 | |
| **ml** | `RNFBMLModule` | 0 | ~0 | Stub |
| **phone-number-verification** | `RNFBPnvModule` | 0 | 6 | Android-only; direct resolver |

#### Foundation (Phase 0)

| Package | Legacy modules | Notes |
|---------|----------------|-------|
| **app** | `RNFBAppModule`, `RNFBUtilsModule` (+ Android utils) | Event proxy; **blocker** for migration complete |

---

## Phase ordering

Strategy: **foundation → hard probe → easy wins → remaining complex → coordinated break → cleanup**.

Pick **one** of `firestore` or `auth` in Phase 1 (firestore = multi-module + pipelines; auth = max single-module spec).

### Phase table

| Phase | Focus | Status | Packages |
|-------|--------|--------|----------|
| **0** | App foundation + unified resolver | queued | `app` |
| **1** | Hard probe | queued | `firestore` **or** `auth` — pick one |
| **2** | Easy wins | queued | `installations`, `perf`, `in-app-messaging`, `app-distribution`, `ml` |
| **3** | Moderate | queued | `app-check`, `remote-config`, `analytics`, `crashlytics`, `storage` |
| **4** | Remaining complex | queued | other Tier A/B + `messaging`, `database` |
| **5** | Android-only / misc | queued | `phone-number-verification` |
| **R** | Pre-merge full validation | queued | Revert harness narrowing; [full tier](../testing/running-e2e.md#e2e-validation-tiers-unit-focused-area-focused-full) 3-platform before coordinated major |
| **C** | EventEmitter cleanup | deferred | All — [§ deferred cleanup](#deferred-cleanup-phase-eventemitter) |

**Coordinated break:** consumer-facing major when Phases 0–5 + **R** complete (`functions` already new-arch-only).

---

## Phase iteration protocol

Each package (or one legacy module within a multi-module package) follows **one** serial loop. No overlap. Work types: [change authoring workflow § work types](../testing/change-authoring-workflow.md#work-types).

| Step | Work type | Closes gate | Rules |
|------|-----------|-------------|-------|
| **1** | `gap-analysis` | — | Spec inventory + feasibility; read-only when export shape unclear |
| **2** | `baseline-capture` | — | Optional area-focused e2e baseline before large packages |
| **3** | `implementation` | `implementation` | Spec, codegen, native, JS; Jest + **unit-focused** tier; `.only` / area narrowing OK locally; **no commit** |
| **4** | `independent-review` | `review` | **Frozen tree**; **area-focused** tier; no `.only`; [area harness](turbomodule-implementation-workflow.md#turbomodule-area-harness); serial [host rule](../testing/change-authoring-workflow.md#host-rule) |
| **5** | `documentation` | — | User docs + durable OKF when applicable |
| **6** | `commit` | `commit` | One focused commit only after `review_gate` closed |

Canonical commands: [validation checklist](../testing/validation-checklist.md), [serialized dispatch](../testing/running-e2e.md#serialized-e2e-dispatch).

Skip steps 1–2 when spec shape is known (most Tier D packages).

---

## Current snapshot

**Label:** `planning`; **harness:** not started

**Next item:** Maintainer review of this queue + [implementation workflow](turbomodule-implementation-workflow.md) → Phase **0** pickup.

**Arbiter gate:**


| Item | Code | `implementation_gate` | `review_gate` | `next_work_type` | `validation_tier` | Notes |
|------|------|----------------------|---------------|------------------|-------------------|-------|
| Phase 0 `app` | — | — | — | — | — | blocked on queue approval |

---

## Harness

- **Push state (committed):** full test app — all `platformSupportedModules` + `require.context` in `tests/app.js`. For CI / Phase **R** only.
- **Local `:test-cover`:** must match arbiter `validation_tier` — [running e2e § harness + narrowing gate](../testing/running-e2e.md#harness-narrowing-gate-blocking). **`implementation` → unit-focused** and **`independent-review` → area-focused:** both require [area narrowing](turbomodule-implementation-workflow.md#turbomodule-area-harness) locally **before** first run even when git has full harness. Revert before **R** (full tier).

---

## Workflow (each phase)

1. Pick package(s) for the phase from [phase table](#phase-table).
2. Follow [Phase iteration protocol](#phase-iteration-protocol) — never commit before `review_gate` closed; never overlap `:test-cover` ([host rule](../testing/change-authoring-workflow.md#host-rule)).
3. Update arbiter gate row when item closes.
4. Phase **R:** `pre-merge-validation` at **full** tier before coordinated major.

**Pitfalls:** iOS null-in-object on option maps ([workflow § gotchas](turbomodule-implementation-workflow.md#gotchas)); New Architecture must be enabled; do not combine language modernization (Kotlin/Swift) with bridge migration in the same PR.

---

## Related links

* [New Architecture index](index.md)
* [TurboModule implementation workflow](turbomodule-implementation-workflow.md)
* [Change authoring workflow](../testing/change-authoring-workflow.md)
* [Documentation policy](../documentation-policy.md)
