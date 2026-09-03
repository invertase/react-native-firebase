---
okf_version: '0.1'
---

# React Native Firebase knowledge bundle

- [Documentation/commit policy](/documentation-policy.md#durable-vs-ephemeral) — public **reference** docs vs ephemeral queue state on Linear project documents vs private items (Linear issue identifiers stay off GitHub); [Efficiency](/documentation-policy.md#efficiency); OKF consistency
- [Documentation site maintenance](/documentation-site-maintenance.md) — docs.json, TypeDoc reference site, legacy `/reference/` redirect audits

# CI workflows

- [CI workflows](/ci-workflows/index.md) — GitHub Actions reliability, logs, Detox/Jet troubleshooting

# Testing

- [Agent command policy](/testing/agent-command-policy.md) — allowlisted shell commands for agents (install, prepare, validation, e2e, Expo documented-path iOS **link**, RN CLI prebuilt RNCore iOS **build**; not Detox)
- [Change authoring workflow](/testing/change-authoring-workflow.md) — verified product change loop (unit-focused → `documentation?` → area-focused `independent-review` → commit); [§ validation evidence (blocking)](testing/change-authoring-workflow.md#validation-evidence-blocking); [coverage evidence package](testing/coverage-design.md#coverage-evidence-package)
- [Iteration vocabulary](/testing/iteration-vocabulary.md) — work type, tier, and queue field identifiers
- [Running e2e tests](/testing/running-e2e.md) — canonical e2e commands, narrowing, environment, diagnosis; [§ test-app native modules](testing/running-e2e.md#test-app-native-modules); [§ slot lifecycle](testing/running-e2e.md#slot-lifecycle)
- [E2e parallel design](/testing/e2e-parallel-design.md) — resources, why they collide, parameterization, 9 overlapping cells, coordinator rollout
- [Test app dependency pins](/testing/test-app-dependency-pins.md) — intentional RN / CLI locks (mobile + Expo/RN CLI fixtures share one line; `react-native-macos` is independent)
- [Validation checklist](/testing/validation-checklist.md) — compile, Jest, lint, `compare:types`, e2e, coverage
- [Published types ADR](/testing/architecture-decisions.md) — attw scope, Expo plugin checks, discarded resolutions; [Types-AD-5](/testing/architecture-decisions.md#types-ad-5--pack-ignores-nested-ios-unit-build-trees--accepted) pack ignore for nested iOS unit `build/`
- [Android unit testing ADR](/testing/android-architecture-decisions.md#androidtest-ad-1) — JUnit-first JVM unit tests; Robolectric when Android APIs are required; omit `@Config` / `sdk` unless proven (`AndroidTest-AD-1`)
- [iOS unit testing ADR](/testing/ios-architecture-decisions.md#iostest-ad-1) — macOS/host-first in-package XCTest; Simulator only if UIKit required (`IosTest-AD-1`)
- [Coverage design](/testing/coverage-design.md) — unit/e2e coverage policy, native gates, Codecov; [iOS Ruby SimpleCov](/testing/coverage-design.md#ios-ruby-simplecov); [§ react-native-coverage](/testing/coverage-design.md#react-native-coverage); probe vs flush — [running e2e § test-app native modules](/testing/running-e2e.md#test-app-native-modules)
- [Firebase testing project](/testing/firebase-testing-project.md) — cloud vs emulator, live FIS/RC, helper callables, rules/indexes, deploy

# Cross-cutting work

- [TurboModule / New Architecture](/new-architecture/index.md) — [ADR](/new-architecture/architecture-decisions.md); Codegen TurboModules (library `includesGeneratedCode` vs test-app build-time — [NewArch-AD-5](/new-architecture/architecture-decisions.md#newarch-ad-5--commit-generated-code--accepted)); coordinated New Architecture break
- [iOS SPM native integration decisions](/ios-spm-native-imports.md) — dual imports, Swift-product helpers, runtime framework embedding, Expo precompiled module linkage repair
- [iOS RNCore podspec invariants](/ios-rncore-podspec.md) — Clang non-modular-includes flag and `pod_target_xcconfig` order under `use_frameworks!`
- [Monorepo tooling](/monorepo-tooling/index.md) — Nx local cache, deterministic prepare graph, declaration maps, dependency-cycle linting, dev watch; decisions (ADR) + rollout queue

# Packages

- [AI](/packages/ai/index.md) — Agent Platform / Vertex backend naming, compare-types, generative models
- [App](/packages/app/index.md) — core app / Expo plugin / iOS SPM helpers; Expo documented-path iOS link (`test-expo/`); RN CLI prebuilt RNCore iOS compile (`test-rn-bare/`)
- [App Check](/packages/app-check/index.md) — iOS provider-factory init (pending + fail-closed), ADRs + work queue for #9116
- [Auth](/packages/auth/index.md) — modular API type parity, platform matrix, `compare:types`
- [Firestore](/packages/firestore/index.md) — Pipelines architecture, parity, e2e coverage
- [Messaging](/packages/messaging/index.md) — iOS `UNUserNotificationCenter` delegate forwarding, `completionHandler` contract
