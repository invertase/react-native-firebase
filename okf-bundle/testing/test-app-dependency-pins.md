---
type: Reference
title: Test app dependency pins
description: Intentional version locks for the mobile (tests/) and macOS (tests-macos/) e2e apps; codegen resolves from tests/.
tags: [testing, dependencies, react-native-macos, cli, pins]
timestamp: 2026-08-11T00:00:00Z
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

Root `package.json` must **not** use blanket `resolutions` for `react-native`, `@react-native/codegen`, or `@react-native-community/cli` — each app pins its own line. Codegen scripts resolve the mobile toolchain from **`tests/`**.

## Current pins (both apps on 0.78 until mobile bump)

| Package | Pin | Where |
|---------|-----|--------|
| `react-native` (mobile) | **`0.78.3`** | `tests/package.json` |
| `@react-native-community/cli` (+ platform packages) | **`15.1.3`** | `tests/package.json` (and root `devDependencies` for tooling convenience) |
| `@react-native/codegen` | **`0.78.3`** | Resolved with mobile `react-native` from `tests/` (no root resolution) |
| `react-native` (macOS shell) | **`0.78.3`** | `tests-macos/package.json` |
| `react-native-macos` | **`0.78.6`** | `tests-macos/package.json` |

**CLI rationale:** **`15.1.3`** matches the React Native **0.78** tooling band for the current mobile pin. When `tests/` moves to a newer RN line, bump CLI / `cli-platform-*` / codegen with that app — not via a global resolution that would pull `tests-macos` off its macOS-compatible line.

**Agent / Dependabot rule:** leave these pins alone unless the change is an intentional dual-app or mobile-only upgrade. Reject RN / codegen / CLI bumps that only “look green” for one app while breaking the other or codegen verify.

## When pins may move

**Mobile (`tests/`) only** (macOS stays on its pair):

1. Bump `tests/` `react-native` and matching `@react-native/*` / CLI band
2. Regenerate codegen / rebuild native per [NewArch-AD-20](../new-architecture/architecture-decisions.md#newarch-ad-20--pin-the-rncodegen-toolchain-rn-bumps-are-coordinated-breaking-changes--accepted)
3. Keep `tests-macos/` on the `react-native-macos`-compatible pair until that stack can move

**macOS (`tests-macos/`)**:

1. Move `react-native-macos` to a newer supported line
2. Update `tests-macos/` `react-native` (and patches) to match
3. Does **not** require a mobile RN bump

**Both** still follow CONTRIBUTING.md **Updating React Native** for any change that regenerates `packages/**/generated/**`.

## Related

- [NewArch-AD-20](../new-architecture/architecture-decisions.md#newarch-ad-20--pin-the-rncodegen-toolchain-rn-bumps-are-coordinated-breaking-changes--accepted) — codegen reproducibility / no floating toolchain
- [Other CI — macOS e2e](../ci-workflows/other.md) — macOS pipeline (`tests-macos/`)
- [Agent command policy](agent-command-policy.md) — install / patch / fmt gate
- [`tests/package.json`](../../tests/package.json) / [`tests-macos/package.json`](../../tests-macos/package.json) — declared pins
