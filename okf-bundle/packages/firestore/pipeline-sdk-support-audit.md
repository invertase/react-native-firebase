---
type: Reference
title: Firestore Pipeline SDK support audit
description: Repeatable method to determine which pipeline functions are unsupported on each platform, and reconciliation of the iOS JS guard list against upstream SDK releases.
tags: [firestore, pipelines, ios, android, sdk, parity, audit]
timestamp: 2026-06-25T00:00:00Z
---

# Purpose

RNFB maintains `IOS_UNSUPPORTED_FUNCTION_NAMES` in `pipeline_support.ts` and iOS e2e reduced pipelines. That list was built when the linked iOS SDK rejected functions at runtime with `invalid-argument`, even when RNFB bridge lowering existed.

**Upstream Firestore Pipeline SDKs have shipped many expression additions since that list was frozen.** A stale guard causes false “SDK unsupported” classification in the parity registry (P-003) and blocks remediation planning.

**SDK support reconciliation** (method below) compares guards against **primary sources** and defines **runtime verification** before changing guards or e2e.

Related: [Platform parity](pipeline-platform-parity.md), [work queue](pipeline-coverage-work-queue.md) (live status).

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md).

---

# Repeatable audit method

Run this whenever Firebase SDK pins change or parity drift is triaged.

## 1. Record pinned SDK versions

| Source | What to read |
|--------|----------------|
| `packages/app/package.json` | `sdkVersions.ios.firebase`, `sdkVersions.android.firebase` (BOM) |
| `packages/firestore/RNFBFirestore.podspec` | iOS Firestore pod version |
| `packages/firestore/android/build.gradle` | Firebase BOM from `@react-native-firebase/app` |
| `tests/ios/Podfile.lock` | Resolved `FirebaseFirestore` version in e2e |
| `tests/ios/Podfile.lock` | Resolved `FirebaseFirestore` version in e2e |
| `tests/android` Gradle lock / dependency report | Resolved `firebase-firestore` artifact (optional) |
| Root `package.json` / `tests/package.json` | Pinned **`firebase`** npm (firebase-js-sdk) — macOS e2e + compare-types input |

**Current pins (2026-06-25):** iOS **12.15.0**, Android BOM **34.15.0**, firebase-js-sdk **12.15.0** (root/tests).

## 1b. Three layers — what each source proves

Pipeline “support” is not one list. Use the right source per platform and question:

| Layer | Tool / source | Proves | Does **not** prove |
|-------|----------------|--------|-------------------|
| **A — Public API surface** | `yarn compare:types` → `firestore-pipelines` ([config](../../../.github/scripts/compare-types/configs/firestore-pipelines.ts)) | firebase-js-sdk **exports** missing from RNFB types, extra RN exports, signature drift | Native iOS/Android **runtime** execute; stale `IOS_UNSUPPORTED_*` guards; macOS runtime for new JS-only backend features |
| **B — JS / macOS runtime** | firebase-js-sdk CHANGELOG + macOS e2e (`Platform.other` path uses web SDK) | What the **pinned npm `firebase`** package can execute on macOS | Native bridge behaviour; iOS guard list |
| **C — Native runtime** | Native Firestore CHANGELOGs + iOS/Android e2e execute probes | What **linked iOS/Android SDKs** accept through RNFB native bridges | RNFB type exports; JS SDK additions RN has not typed yet |

**compare:types is necessary but not sufficient for guard reconciliation and runtime probes.**

- It reads types from **installed** `node_modules/firebase` (same pin as macOS). When firebase-js-sdk adds a **new export**, CI fails until `firestore-pipelines.ts` documents `missingInRN` or RNFB implements it — so **new JS API surface is “seen”**.
- It is **silent** when both SDKs already export the same name (e.g. `stringRepeat`, `switchOn`) but **native iOS still rejects at execute** — the stale-guard case this audit addresses.
- It does **not** track native-only SDK releases independently: iOS/Android native pins can diverge in timing from the npm `firebase` pin even when versions share a marketing number (12.15 / 34.15).

**firebase-js-sdk CHANGELOG:** use as **verification and macOS context**, not as a substitute for native CHANGELOGs or probes.

- **When compare:types shows `missingInRN`:** read [@firebase/firestore CHANGELOG](https://github.com/firebase/firebase-js-sdk/blob/main/packages/firestore/CHANGELOG.md) (or release notes) to learn when the export appeared and whether it is macOS/web-only until native catches up.
- **When auditing macOS parity:** macOS Pipeline e2e runs through `executeWebSdkPipeline` — if JS SDK CHANGELOG adds a function and compare:types shows RN already exports it, run macOS e2e (no iOS guard applies).
- **When reconciling `IOS_UNSUPPORTED_FUNCTION_NAMES`:** JS SDK CHANGELOG is **weak evidence alone** — iOS native SDK CHANGELOG + runtime guard probe matter more; JS may have shipped `stringRepeat` in types before or after native.

**Practical rule:** run **`yarn compare:types`** on every firebase pin bump (surface drift); run **native CHANGELOG + runtime guard probes** on every native pin bump (runtime drift); consult **firebase-js-sdk CHANGELOG** when layer A or macOS behaviour is in question.

## 2. Read upstream release notes (primary)

Do **not** rely on RNFB comments or old e2e skips alone.

| Platform | Primary changelog |
|----------|-------------------|
| **JS / macOS** | [firebase-js-sdk `packages/firestore/CHANGELOG.md`](https://github.com/firebase/firebase-js-sdk/blob/main/packages/firestore/CHANGELOG.md) — filter ≤ pinned `firebase` npm |
| iOS | [firebase-ios-sdk `Firestore/CHANGELOG.md`](https://github.com/firebase/firebase-ios-sdk/blob/master/Firestore/CHANGELOG.md) — filter entries ≤ pinned version |
| Android | [firebase-android-sdk `firebase-firestore/CHANGELOG.md`](https://github.com/firebase/firebase-android-sdk/blob/main/firebase-firestore/CHANGELOG.md) — filter entries ≤ pinned BOM’s Firestore release |
| **API surface (automated)** | `yarn compare:types` — `firestore-pipelines` package (layer A above) |
| Cross-platform reference | [Firebase docs — all pipeline functions](https://firebase.google.com/docs/firestore/pipelines/functions/all_functions) (product surface; not a substitute for CHANGELOGs or probes) |

Note the **SDK wire name** in changelog entries (often `camelCase` in docs, `snake_case` at runtime).

## 3. Map JS export names → wire names

RNFB serializes `name` from expression helpers. Native builders normalize via `normalizeExpressionFunctionName` / `canonicalizeExpressionFunctionName`:

| JS / serialized `name` | iOS wire (typical) | Android wire (typical) |
|------------------------|--------------------|-------------------------|
| `conditional` | `cond` | `conditional()` API |
| `timestampSubtract` | `timestamp_sub` | receiver `.timestampSubtract()` |
| `timestampAdd` | `timestamp_add` | receiver `.timestampAdd()` |
| `arrayGet` | `array_get` (raw) | receiver `.arrayGet()` |
| `stringRepeat` | `string_repeat` | raw `string_repeat` |
| `switchOn` | `switch_on` | raw `switch_on` |

Inspect: `RNFBFirestorePipelineNodeBuilder.swift` / `ReactNativeFirebaseFirestorePipelineNodeBuilder.java`.

## 4. Audit RNFB bridge lowering (not SDK)

For each function under review:

1. **iOS:** Does `coerceExpressionTree` use dedicated exit (`conditionalExit`), generic `FunctionExprBridge`, or nothing?
2. **Android:** Dedicated API, receiver chain (`scheduleReceiverExpressionChain`), or `Expression.rawFunction`?
3. **Parity:** Same semantic path on both natives? (e.g. Android receiver `.arrayGet()` vs iOS raw `array_get`.)

A function can be **SDK-supported** but **RNFB-iOS-unsupported** if lowering shape is wrong.

## 5. Build a support matrix (evidence columns)

For each function, fill:

| Column | Source |
|--------|--------|
| In JS guard? | `pipeline_support.ts` |
| iOS CHANGELOG ≤ pin | Yes / No / N/A |
| Android CHANGELOG ≤ pin | Yes / No / N/A |
| iOS bridge lowers? | Swift builder |
| Android bridge lowers? | Java builder |
| iOS e2e today | Full / reduced / throw-only |
| **Classification** | See below |
| **Next action** | Runtime guard probe / bridge remediation / document only |

**Classification values:**

| Value | Meaning |
|-------|---------|
| `sdk-supported-stale-guard` | CHANGELOG + bridge lowering; guard likely obsolete — **runtime probe required** |
| `sdk-unsupported-confirmed` | No CHANGELOG entry + runtime probe fails on pinned SDK |
| `rnfb-bridge-gap` | SDK may support; RNFB lowering missing or wrong shape on one platform |
| `sdk-supported-bridge-ok` | Probe passed; remove guard + restore full e2e |
| `pending-probe` | Insufficient evidence — **do not** change guard until step 6 |

## 6. Runtime verification (authoritative)

CHANGELOG + bridge audit is **necessary but not sufficient**. The only authoritative test is **execute on pinned SDK** through RNFB.

Probe ordering, review-gate rules, and live status are owned by the [work queue](pipeline-coverage-work-queue.md#j0--ios-runtime-guard-probes-do-first). Canonical e2e command policy is owned by [running-e2e.md](../../testing/running-e2e.md).

**Per-function probe (iOS):**

1. Branch from current main; **one function at a time**.
2. Remove that name from `IOS_UNSUPPORTED_FUNCTION_NAMES` only.
3. Restore the **full** (non-reduced) assertion block in the matching `Pipeline.e2e.js` test (remove `expectIOSUnsupportedFunctions` + iOS reduced pipeline for that test).
4. Run the implement/review gate defined in the [work queue runtime guard protocol](pipeline-coverage-work-queue.md#phase-j-iteration-protocol-strict).
5. Record outcome:
   - **Reviewer pass** → `sdk-supported-bridge-ok`; remove guard permanently; close P-003 sub-row; coordinator commits.
   - **`invalid-argument` / pipeline execute error** → capture exact message; classify `sdk-unsupported-confirmed` or `rnfb-bridge-gap` (compare native request in debug logs).
6. Revert before next function unless committing a confirmed removal.

**Batch probe (optional):** temporary e2e `describe` that executes minimal pipeline per function in a loop; still one guard change per commit.

**Android / macOS:** Android already runs full pipelines for all nine; macOS uses JS SDK — no iOS guard. Probes are **iOS-only**.

## 7. Update artifacts

After probes:

| Artifact | Update |
|----------|--------|
| `pipeline_support.ts` | `IOS_UNSUPPORTED_FUNCTION_NAMES` |
| `RNFBFirestorePipelineNodeBuilder.swift` | Comment block ~L883–893 + any new lowering |
| `Pipeline.e2e.js` | Remove reduced iOS pipelines for confirmed functions |
| [pipeline-platform-parity.md](pipeline-platform-parity.md) | P-003 / iOS unsupported map |
| [pipeline-coverage-work-queue.md](pipeline-coverage-work-queue.md) | Live remediation tracker |

Re-run when bumping `sdkVersions` in `@react-native-firebase/app`.

---

# SDK support reconciliation (2026-06-25)

**Pins:** iOS Firestore **12.15.0**, Android BOM **34.15.0**.

**Method used:** Steps 1–5 above (native bridge cross-check + e2e inventory — audit detail in [work queue](pipeline-coverage-work-queue.md)).

## iOS CHANGELOG evidence (≤ 12.15.0)

| Function | Listed in iOS CHANGELOG? | Version |
|----------|--------------------------|---------|
| `stringRepeat` | **Yes** | 12.12.0 |
| `switchOn` | **Yes** | 12.12.0 |
| `trunc` | **Yes** | 12.11.0 |
| `conditional` / `ConditionalExpression` | **Yes** (API migration) | 12.11.0 (`then` removed → `ConditionalExpression`) |
| `timestampTruncate` | **Yes** | 12.12.0 — *not guarded*; iOS e2e passes |
| `timestampAdd` / `timestampSubtract` | **No** explicit entry | — |
| `arrayGet` | **No** explicit entry | — |
| `round` | **No** explicit entry | — |
| `substring` | **No** explicit entry | — |

## Support matrix (runtime verification)

Live probe ordering and gate status: [work queue runtime guard probes](pipeline-coverage-work-queue.md#j0--ios-runtime-guard-probes-do-first).

| Function | JS guard | iOS bridge | Android bridge | CHANGELOG @ 12.15 | Classification | Verification status |
|----------|----------|------------|----------------|-------------------|----------------|---------------------|
| `stringRepeat` | No | Generic `string_repeat` | raw | **Added 12.12** | **sdk-supported-bridge-ok** | Guard removed; unified cross-platform e2e |
| `switchOn` | Yes | Generic `switch_on` | raw | **Added 12.12** | **pending-probe** → likely stale | Runtime probe pending |
| `trunc` | Yes | Generic `trunc` | raw | **Added 12.11** | **pending-probe** → likely stale | Runtime probe pending |
| `conditional` | Yes | Dedicated `cond` | `Expression.conditional()` | **ConditionalExpression 12.11** | **pending-probe** → likely stale | Runtime probe pending |
| `round` | Yes | Generic `round` | raw | Not listed | **pending-probe** | Runtime probe pending |
| `substring` | Yes | Generic `substring` | raw | Not listed | **pending-probe** | Runtime probe pending |
| `timestampAdd` | Yes | Generic `timestamp_add` only | receiver chain | Not listed | **pending-probe**; suspect real SDK gap | Runtime probe pending; if fail → document SDK gap |
| `timestampSubtract` | Yes | Generic `timestamp_sub` | receiver chain | Not listed | Same as timestampAdd | Runtime probe pending |
| `arrayGet` | Yes | Generic `array_get` only | receiver chain | Not listed | **rnfb-bridge-gap** + **pending-probe** | Runtime probe pending; if SDK ok → iOS receiver parity |

## Impact on parity registry

| Registry row | Reconciliation finding |
|--------------|------------------------|
| **P-003** (umbrella iOS unsupported) | **Partially stale** — at least 3–4 functions added in iOS SDK 12.11–12.12 while guards unchanged |
| **P-003a** (per-function e2e) | Ten iOS reduced/throw tests may shrink after runtime guard probes |
| **P-013** (iOS aggregate skip L3740) | Unrelated to guard list — separate SDK/bridge investigation |
| **P-001, P-005, P-010–P-012** (bridge gaps) | Unchanged — operand coercion is independent of function guard list |

## Recommended remediation order

Live probe sequence and gate status: [work queue](pipeline-coverage-work-queue.md).

| Step | Work |
|------|------|
| **1** | iOS runtime guard probes — one commit per confirmed guard removal ([§6](#6-runtime-verification-authoritative)) |
| **2** | P-001 Android operand coercion |
| **3–7** | Remaining bridge items from [parity registry](pipeline-platform-parity.md) |

**Do not** treat P-003 e2e reduced pipelines as permanent SDK limitations until runtime verification completes.

---

# Maintenance checklist (copy per SDK bump)

- [ ] Record new iOS + Android + **firebase npm** pin versions
- [ ] Run **`yarn compare:types`** — resolve new `missingInRN` / stale config in `firestore-pipelines.ts`
- [ ] Diff **firebase-js-sdk** `@firebase/firestore` CHANGELOG (macOS / layer B)
- [ ] Diff **native** Firestore CHANGELOGs since last audit (layer C)
- [ ] Re-run bridge lowering grep for new/changed function names
- [ ] Update matrix; run **runtime guard probes** for any function moving from “unsupported” to “CHANGELOG added” on **native**
- [ ] Sync `pipeline_support.ts` ↔ Swift comment ↔ parity doc
