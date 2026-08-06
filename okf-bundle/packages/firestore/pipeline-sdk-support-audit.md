---
type: Reference
title: Firestore Pipeline SDK support audit
description: Repeatable method to determine which pipeline functions are supported on each platform, and reconciliation of RNFB bridge lowering against upstream SDK releases.
tags: [firestore, pipelines, ios, android, sdk, parity, audit]
timestamp: 2026-06-25T00:00:00Z
---

# Purpose

RNFB pipeline parity depends on native bridge lowering matching pinned Firebase SDKs. This method compares RNFB exports, CHANGELOG evidence, bridge code, and runtime e2e execute probes.

Related: [Platform parity](pipeline-platform-parity.md), [work queue](pipeline-coverage-work-queue.md) (live status).

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md).

---

# Repeatable audit method

Run on Firebase SDK pin change or parity triage.

## 1. Record pinned SDK versions

| Source | What to read |
|--------|----------------|
| `packages/app/package.json` | `sdkVersions.ios.firebase`, `sdkVersions.android.firebase` (BOM) |
| `packages/firestore/RNFBFirestore.podspec` | iOS Firestore pod version |
| `packages/firestore/android/build.gradle` | Firebase BOM from `@react-native-firebase/app` |
| `tests/ios/Podfile.lock` | Resolved `FirebaseFirestore` version in e2e |
| `tests/android` Gradle lock / dependency report | Resolved `firebase-firestore` artifact (optional) |
| Root `package.json` / `tests/package.json` | Pinned **`firebase`** npm (firebase-js-sdk) — macOS e2e + compare-types input |

**Current pins (2026-06-25):** iOS **12.15.0**, Android BOM **34.15.0**, firebase-js-sdk **12.15.0** (root/tests).

## 1b. Three layers — what each source proves

Use the right source per platform/question:

| Layer | Tool / source | Proves | Does **not** prove |
|-------|----------------|--------|-------------------|
| **A — Public API surface** | `yarn compare:types` → `firestore-pipelines` ([config](../../../.github/scripts/compare-types/configs/firestore-pipelines.ts)) | firebase-js-sdk **exports** missing from RNFB types, extra RN exports, signature drift | Native iOS/Android **runtime** execute; macOS runtime for new JS-only backend features |
| **B — JS / macOS runtime** | firebase-js-sdk CHANGELOG + macOS e2e (`Platform.other` path uses web SDK) | What the **pinned npm `firebase`** package can execute on macOS | Native bridge behaviour |
| **C — Native runtime** | Native Firestore CHANGELOGs + iOS/Android e2e execute probes | What **linked iOS/Android SDKs** accept through RNFB native bridges | RNFB type exports; JS SDK additions RN has not typed yet |

`compare:types` is necessary, not sufficient:

- Sees new firebase-js-sdk exports via installed `node_modules/firebase`.
- Silent when both SDKs export same name but native iOS rejects at execute.
- Does not track native-only SDK releases independently.

Use firebase-js-sdk CHANGELOG for verification/macOS context, not instead of native CHANGELOGs/probes.

- `missingInRN`: read [@firebase/firestore CHANGELOG](https://github.com/firebase/firebase-js-sdk/blob/main/packages/firestore/CHANGELOG.md) to date/export context and native lag.
- macOS parity: macOS uses `executeWebSdkPipeline`; run macOS e2e if RN exports name and JS SDK added behavior.
- iOS bridge reconciliation: native CHANGELOG + runtime e2e probe matter most.

Rule: every firebase pin bump → `yarn compare:types`; every native pin bump → native CHANGELOG + runtime probes; consult JS CHANGELOG for API/macOS questions.

## 2. Read upstream release notes (primary)

Do **not** rely on RNFB comments or old e2e skips.

| Platform | Primary changelog |
|----------|-------------------|
| **JS / macOS** | [firebase-js-sdk `packages/firestore/CHANGELOG.md`](https://github.com/firebase/firebase-js-sdk/blob/main/packages/firestore/CHANGELOG.md) — filter ≤ pinned `firebase` npm |
| iOS | [firebase-ios-sdk `Firestore/CHANGELOG.md`](https://github.com/firebase/firebase-ios-sdk/blob/master/Firestore/CHANGELOG.md) — filter entries ≤ pinned version |
| Android | [firebase-android-sdk `firebase-firestore/CHANGELOG.md`](https://github.com/firebase/firebase-android-sdk/blob/main/firebase-firestore/CHANGELOG.md) — filter entries ≤ pinned BOM’s Firestore release |
| **API surface (automated)** | `yarn compare:types` — `firestore-pipelines` package (layer A above) |
| Cross-platform reference | [Firebase docs — all pipeline functions](https://firebase.google.com/docs/firestore/pipelines/functions/all_functions) (product surface; not a substitute for CHANGELOGs or probes) |

Record **SDK wire name** (docs often `camelCase`, runtime `snake_case`).

## 3. Map JS export names → wire names

RNFB serializes helper `name`; native builders normalize:

| JS / serialized `name` | iOS wire (typical) | Android wire (typical) |
|------------------------|--------------------|-------------------------|
| `conditional` | `conditional` | `conditional()` API |
| `timestampSubtract` | `timestamp_subtract` (RNFB currently emits `timestamp_sub` — **wrong**) | receiver `.timestampSubtract()` |
| `timestampAdd` | `timestamp_add` (generic wire; **needs receiver chain** on iOS) | receiver `.timestampAdd()` |
| `arrayGet` | `array_get` (generic wire; **needs receiver chain** on iOS) | receiver `.arrayGet()` |
| `stringRepeat` | `string_repeat` | raw `string_repeat` |
| `switchOn` | `switch_on` | raw `switch_on` |

Inspect: `RNFBFirestorePipelineNodeBuilder.swift` / `ReactNativeFirebaseFirestorePipelineNodeBuilder.java`.

## 4. Audit RNFB bridge lowering (not SDK)

For each function under review:

1. **iOS:** Does `coerceExpressionTree` use dedicated exit (`conditionalExit`), generic `FunctionExprBridge`, or nothing?
2. **Android:** Dedicated API, receiver chain (`scheduleReceiverExpressionChain`), or `Expression.rawFunction`?
3. **Parity:** Same semantic path on both natives? (e.g. Android receiver `.arrayGet()` vs iOS raw `array_get`.)

SDK support does not prove RNFB lowering shape is correct.

## 5. Build a support matrix (evidence columns)

Per function:

| Column | Source |
|--------|--------|
| iOS CHANGELOG ≤ pin | Yes / No / N/A |
| Android CHANGELOG ≤ pin | Yes / No / N/A |
| iOS bridge lowers? | Swift builder |
| Android bridge lowers? | Java builder |
| iOS e2e today | Full / reduced / skip |
| **Classification** | See below |
| **Next action** | Bridge remediation / runtime e2e probe / document only |

**Classification values:**

| Value | Meaning |
|-------|---------|
| `sdk-unsupported-confirmed` | No CHANGELOG entry + runtime probe fails on pinned SDK |
| `rnfb-bridge-gap` | SDK may support; RNFB lowering missing or wrong shape on one platform |
| `sdk-supported-bridge-ok` | Bridge lowering + unified cross-platform e2e pass |
| `pending-probe` | Insufficient evidence — do not change e2e until probed |

## 6. Runtime verification (authoritative)

CHANGELOG + bridge audit is insufficient. Authority = RNFB execute on pinned SDK.

Probe order/gates/live status: [work queue](pipeline-coverage-work-queue.md#j0--ios-runtime-guard-probes-do-first). Commands: [running-e2e.md](../../testing/running-e2e.md).

**Per-function probe (iOS):**

1. Branch from current main; **one function or batch at a time** when bridge work is scoped.
2. Implement or fix native lowering; unify matching `Pipeline.e2e.js` assertions cross-platform.
3. Run the implement/review gate defined in the [work queue runtime protocol](pipeline-coverage-work-queue.md#phase-j-iteration-protocol-strict).
4. Record outcome:
   - **`independent-review` pass** → `sdk-supported-bridge-ok`; close parity row; `commit` after `review_gate` closed **with** [validation/coverage evidence](../../testing/validation-checklist.md#validation-evidence-package) recorded.
   - **`invalid-argument` / pipeline execute error** → capture exact message; classify `sdk-unsupported-confirmed` or `rnfb-bridge-gap` (compare native request in debug logs).

Android already runs full pipelines; macOS uses JS SDK. Probes focus on **native iOS/Android** execute paths.

## 7. Update artifacts

After probes update:

| Artifact | Update |
|----------|--------|
| `RNFBFirestorePipelineNodeBuilder.swift` / Android NodeBuilder | New or fixed lowering |
| `Pipeline.e2e.js` | Unified cross-platform assertions |
| [pipeline-platform-parity.md](pipeline-platform-parity.md) | Bridge / SDK gap rows |
| [pipeline-coverage-work-queue.md](pipeline-coverage-work-queue.md) | Live remediation tracker |

Re-run on `@react-native-firebase/app` `sdkVersions` bump.

---

# SDK support reconciliation (2026-06-25)

**Pins:** iOS Firestore **12.15.0**, Android BOM **34.15.0**.

**Method:** steps 1–5 above; audit detail in [work queue](pipeline-coverage-work-queue.md).

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

Live probes/gates: [work queue](pipeline-coverage-work-queue.md#j0--ios-runtime-guard-probes-do-first).

| Function | iOS bridge | Android bridge | CHANGELOG @ 12.15 | Classification | Verification status |
|----------|------------|----------------|-------------------|----------------|---------------------|
| `stringRepeat` | Generic `string_repeat` | raw | **Added 12.12** | **sdk-supported-bridge-ok** | Unified cross-platform e2e |
| `switchOn` | Generic `switch_on` | raw | **Added 12.12** | **sdk-supported-bridge-ok** | Unified cross-platform e2e |
| `trunc` | Generic `trunc` | raw | **Added 12.11** | **sdk-supported-bridge-ok** | Unified cross-platform e2e |
| `conditional` | `conditional` wire | `Expression.conditional()` | **ConditionalExpression 12.11** | **sdk-supported-bridge-ok** | iOS wire `cond`→`conditional`; unified e2e |
| `round` | Generic `round` | raw | Not listed | **sdk-supported-bridge-ok** | Unified cross-platform e2e |
| `substring` | Receiver chain (`.substring()`) | raw | Not listed (SDK API present) | **sdk-supported-bridge-ok** | iOS receiver lowering; unified cross-platform e2e |
| `timestampAdd` | Receiver chain (`.timestampAdd()`) | receiver chain | Not listed (SDK API present) | **sdk-supported-bridge-ok** | iOS receiver lowering; unified cross-platform e2e |
| `timestampSubtract` | Receiver chain (`.timestampSubtract()`); wire `timestamp_subtract` | receiver chain | Not listed (SDK API present) | **sdk-supported-bridge-ok** | Fixed wire name + iOS receiver lowering; unified e2e |
| `arrayGet` | Receiver chain (`.arrayGet()`) | receiver chain | Not listed (SDK API present) | **sdk-supported-bridge-ok** | iOS receiver lowering; unified cross-platform e2e |

## Impact on parity registry

| Registry row | Reconciliation finding |
|--------------|------------------------|
| **P-013** (iOS aggregate skip L3740) | Unrelated — separate SDK/bridge investigation |
| **P-001, P-005, P-010–P-012** (bridge gaps) | Unchanged — operand coercion is independent of function support matrix |

## Recommended remediation order

Live order/gates: [work queue](pipeline-coverage-work-queue.md).

| Step | Work |
|------|------|
| **1** | iOS runtime bridge probes + unified e2e ([§6](#6-runtime-verification-authoritative)) |
| **2** | P-001 Android operand coercion |
| **3–7** | Remaining bridge items from [parity registry](pipeline-platform-parity.md) |

Treat reduced iOS e2e branches as bridge/SDK gaps until native lowering or SDK support is confirmed.

---

# Maintenance checklist (copy per SDK bump)

- [ ] Record new iOS + Android + **firebase npm** pin versions
- [ ] Run **`yarn compare:types`** — resolve new `missingInRN` / stale config in `firestore-pipelines.ts`
- [ ] Diff **firebase-js-sdk** `@firebase/firestore` CHANGELOG (macOS / layer B)
- [ ] Diff **native** Firestore CHANGELOGs since last audit (layer C)
- [ ] Re-run bridge lowering grep for new/changed function names
- [ ] Update matrix; run **runtime guard probes** for any function moving from “unsupported” to “CHANGELOG added” on **native**
- [ ] Sync parity doc ↔ native lowering comments
