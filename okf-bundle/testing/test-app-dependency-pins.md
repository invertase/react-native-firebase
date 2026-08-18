---
type: Reference
title: Test app dependency pins
description: Intentional version locks for the mobile (tests/) and macOS (tests-macos/) e2e apps; codegen resolves from tests/.
tags: [testing, dependencies, react-native-macos, cli, pins]
timestamp: 2026-08-18T00:00:00Z
---

# Test app dependency pins

Canonical owner for **intentional** version locks on the e2e apps (`tests/` mobile, `tests-macos/` macOS) and how the RN/codegen toolchain is selected. Do not “helpfully” bump these via Dependabot merges or drive-by upgrades without coordinating the affected app (and codegen when mobile moves).

Codegen determinism: [NewArch-AD-20](../new-architecture/architecture-decisions.md#newarch-ad-20--pin-the-rncodegen-toolchain-rn-bumps-are-coordinated-breaking-changes--accepted). Dual-app split: [CPRN-236](https://linear.app/invertase/issue/CPRN-236).

## Dual-app model

| App | Role | RN pin owner |
|-----|------|----------------|
| **`tests/`** | iOS + Android Detox e2e; **codegen / `codegen:verify` toolchain** | `tests/package.json` (`react-native` + CLI / `@react-native/*`) |
| **`tests-macos/`** | macOS Jet e2e (firebase-js-sdk harness; shared JS under `tests/`) | `tests-macos/package.json` (`react-native` + `react-native-macos`) |

**macOS no longer forces the mobile RN line.** `react-native-macos` only constrains `tests-macos/`. Mobile may advance independently once that workspace is bumped (see [When pins may move](#when-pins-may-move)).

Root `package.json` must **not** use blanket `resolutions` for `react-native`, `@react-native/codegen`, or `@react-native-community/cli` — each app pins its own line. Codegen scripts resolve the mobile toolchain from **`tests/`** via [`scripts/codegen-package.mjs`](../../scripts/codegen-package.mjs).

## Current pins

| Package | Pin | Where |
|---------|-----|--------|
| `react-native` (mobile) | **`0.86.2`** | `tests/package.json` |
| `react` (mobile) | **`19.2.3`** | `tests/package.json` |
| `@react-native-community/cli` (+ platform packages) | **`20.1.0`** | `tests/package.json` (and root `devDependencies` for tooling convenience) |
| `@react-native/babel-preset` / `@react-native/metro-config` | **`0.86.2`** | `tests/package.json` |
| `@react-native/jest-preset` | **`0.86.2`** | `tests/package.json` (and root `devDependencies` for Jest / toolchain lockstep with mobile RN) |
| `@react-native/codegen` | **`0.86.2`** | Resolved with mobile `react-native` from `tests/` (no root resolution) |
| `react-native` (macOS shell) | **`0.78.3`** | `tests-macos/package.json` |
| `react-native-macos` | **`0.78.6`** | `tests-macos/package.json` |
| macOS CLI band | **`15.1.3`** | `tests-macos/package.json` |
| `@react-native-async-storage/async-storage` (mobile) | **`^3.1.1`** | `tests/package.json` (iOS pod `AsyncStorage` 3.x; Android autolink) |
| `@react-native-async-storage/async-storage` (macOS) | **`^2.0.2`** | `tests-macos/package.json` |
| `@react-native-firebase/*` (both e2e apps) | **`26.2.0`** (must match current lerna / package version) | `tests/package.json` and `tests-macos/package.json` — see [RNFB workspace pins](#rnfb-workspace-pins-both-e2e-apps) |
| `@react-native-firebase/app-types` | **`6.7.2`** | both apps (legacy types package; not a workspace) |

**CLI rationale:** mobile CLI **`20.1.0`** matches the React Native **0.86** community template. macOS keeps the **0.78** CLI band with `react-native-macos@0.78.6`. Never add a global resolution that would pull `tests-macos` onto the mobile line.

**fmt / Apple Clang:** RN **0.86.2** ships fmt **12.1.0** upstream (no mobile `patch-package` fmt bump). macOS **0.78.3** still applies [`tests-macos/patches/react-native+0.78.3.patch`](../../tests-macos/patches/react-native+0.78.3.patch). Always verify via [install / patch / fmt gate](agent-command-policy.md#install-patch-fmt-gate-blocking).

**iOS pods (mobile):** RN 0.86 defaults `RCT_USE_PREBUILT_RNCORE` / `RCT_USE_RN_DEP` to **1** inside `use_react_native!`. The test app sets both to **`0`** in [`tests/ios/Podfile`](../../tests/ios/Podfile) before requiring `react_native_pods` so third-party dynamic pods (`react-native-device-info`, `@invertase/react-native-apple-authentication`) link against source RNCore (`RCTEventEmitter`) under SPM-dynamic Firebase. RNFB podspecs opt into prebuilt RNCore separately ([iOS SPM native integration decisions](../ios-spm-native-imports.md#prebuilt-react-core-header-visibility)). Do not re-enable prebuilt RNCore for this app without re-validating those third-party pods.

**Agent / Dependabot rule:** leave these pins alone unless the change is an intentional dual-app or mobile-only upgrade. Reject RN / codegen / CLI bumps that only “look green” for one app while breaking the other or codegen verify.

## RNFB workspace pins (both e2e apps)

Both e2e apps must declare every `@react-native-firebase/*` dependency (except `app-types`) at the **current lerna / package version** so Yarn **workspace-links** them (`workspace:packages/<pkg>`) instead of fetching published npm tarballs.

Today that version is **`26.2.0`**, matching `packages/*/package.json`. A stale pin (for example `26.1.0` while packages are `26.2.0`) resolves as `npm:26.1.0` and a fresh `yarn` downloads ~19 published tarballs. Metro may still remap JS to `packages/*`, so CI can look green while the lockfile is wrong.

The root `version` lifecycle runs [`scripts/version.js`](../../scripts/version.js) during `lerna version`. It deterministically updates **both** `tests/package.json` and `tests-macos/package.json`, including each app's private `"version"` and every `@react-native-firebase/*` dependency except `app-types`. Keep that automation intact; `@react-native-firebase/app-types` remains independently pinned at `6.7.2`.

## AsyncStorage (dual pin + Metro singleton)

Mobile `tests/` is on async-storage **3.x** (TurboModule `RNAsyncStorage`). macOS `tests-macos/` stays on **2.x** (`RNCAsyncStorage`). Dual pin is **app-level only**: `packages/app` does not declare async-storage. Package e2e (`packages/app/e2e/asyncStorage.e2e.js`) imports it; each test app Metro `extraNodeModules` supplies that app's pin.

**Risk on mobile:** a nested **2.x** copy under `packages/*/node_modules/` would let Metro hierarchical lookup load **2.x** JS against **3.x** native when bundling `packages/*/e2e`. Runtime symptom: `[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null`. Pod / lockfile bumps in `tests/` alone do not fix that.

**Mitigation:** [`tests/metro.config.js`](../../tests/metro.config.js) force-resolves async-storage to the `tests/` **3.x** install and blocklists `packages/*/node_modules/@react-native-async-storage/**`. Keep that singleton even though `packages/app` no longer nests 2.x. Do not remove without re-validating mobile e2e from package e2e entrypoints.

## When pins may move

**Mobile (`tests/`) only** (macOS stays on its pair):

1. Bump `tests/` `react-native` and matching `@react-native/*` / CLI band
2. Regenerate codegen / rebuild native per [NewArch-AD-20](../new-architecture/architecture-decisions.md#newarch-ad-20--pin-the-rncodegen-toolchain-rn-bumps-are-coordinated-breaking-changes--accepted) (`yarn codegen:all` → `scripts/codegen-package.mjs`)
3. Keep `tests-macos/` on the `react-native-macos`-compatible pair until that stack can move

**macOS (`tests-macos/`)**:

1. Move `react-native-macos` to a newer supported line
2. Update `tests-macos/` `react-native` (and patches) to match
3. Does **not** require a mobile RN bump

**Both** still follow CONTRIBUTING.md **Updating React Native** for any change that regenerates `packages/**/generated/**`.

## Related

- [NewArch-AD-20](../new-architecture/architecture-decisions.md#newarch-ad-20--pin-the-rncodegen-toolchain-rn-bumps-are-coordinated-breaking-changes--accepted) — codegen reproducibility / no floating toolchain
- [NewArch-AD-21](../new-architecture/architecture-decisions.md#newarch-ad-21--interim-ios-resultt-alias-without-full-codegen-regen--accepted) — ResultT inject **retired** on mobile 0.86 (upstream emits `ResultT`)
- [Other CI — macOS e2e](../ci-workflows/other.md) — macOS pipeline (`tests-macos/`)
- [Agent command policy](agent-command-policy.md) — install / patch / fmt gate
- [`tests/package.json`](../../tests/package.json) / [`tests-macos/package.json`](../../tests-macos/package.json) — declared pins
- [`tests/metro.config.js`](../../tests/metro.config.js) — mobile async-storage singleton + nested blocklist
