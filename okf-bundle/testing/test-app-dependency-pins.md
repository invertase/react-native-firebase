---
type: Reference
title: Test app dependency pins
description: Intentional version locks for the e2e test app (tests/) driven by react-native-macos and related tooling.
tags: [testing, dependencies, react-native-macos, cli, pins]
timestamp: 2026-08-03T00:00:00Z
---

# Test app dependency pins

Canonical owner for **intentional** version locks on the e2e test app (`tests/`) and matching root `resolutions`. Do not “helpfully” bump these via Dependabot merges or drive-by upgrades without also upgrading the macOS stack.

Codegen determinism / why floating RN toolchain pins break native builds: [NewArch-AD-20](../new-architecture/architecture-decisions.md#newarch-ad-20--pin-the-rncodegen-toolchain-rn-bumps-are-coordinated-breaking-changes--accepted).

## Why the React Native line is locked

The test app depends on **`react-native-macos`**, which tracks a specific React Native major/minor line. That pins the test app’s **`react-native`** version (and the CLI / codegen tooling that must stay on that band).

Until `react-native-macos` moves forward, keep the test app on the RN line that macOS supports.

## Current pins

| Package | Pin | Where |
|---------|-----|--------|
| `react-native-macos` | **`0.78.6`** | `tests/package.json` dependencies |
| `react-native` | **`0.78.3`** | `tests/package.json` dependencies; root `resolutions` |
| `@react-native/codegen` | **`0.78.3`** | root `resolutions` |
| `@react-native-community/cli` | **`15.1.3`** | `tests/package.json` dependencies; root `devDependencies` + `resolutions` |
| `@react-native-community/cli-platform-android` | **`15.1.3`** | `tests/package.json` |
| `@react-native-community/cli-platform-ios` | **`15.1.3`** | `tests/package.json` |

**CLI rationale:** **`15.1.3`** matches the React Native **0.78** tooling band required while `react-native-macos` locks the test app on that RN line. Bumping CLI to 20.x (or other post-0.78 bands) without a coordinated RN + `react-native-macos` upgrade is out of policy even if CI looks green for a single Dependabot PR.

**Agent / Dependabot rule:** leave these pins alone. Reject or revert CLI / `cli-platform-*` / RN / codegen bumps that are not part of an intentional RN + macOS upgrade.

## When pins may move

Only as part of a deliberate test-app platform upgrade that:

1. Moves `react-native-macos` to a newer supported line
2. Updates `react-native` and `@react-native/codegen` (and related resolutions/patches) to match
3. Updates `@react-native-community/cli` and `cli-platform-*` to the band for that RN line
4. Follows the coordinated regenerate / rebuild steps in [NewArch-AD-20](../new-architecture/architecture-decisions.md#newarch-ad-20--pin-the-rncodegen-toolchain-rn-bumps-are-coordinated-breaking-changes--accepted) and CONTRIBUTING.md **Updating React Native**

## Related

- [NewArch-AD-20](../new-architecture/architecture-decisions.md#newarch-ad-20--pin-the-rncodegen-toolchain-rn-bumps-are-coordinated-breaking-changes--accepted) — codegen reproducibility / no floating toolchain
- [Other CI — macOS e2e](../ci-workflows/other.md) — macOS pipeline and failure modes
- [Agent command policy](agent-command-policy.md) — install / patch / fmt gate for the RN 0.78 test-app pin
- [`tests/package.json`](../../tests/package.json) — declared pins
