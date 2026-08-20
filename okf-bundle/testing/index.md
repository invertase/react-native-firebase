# Testing

* [Agent command policy](agent-command-policy.md) — **read before any shell command** (install, prepare, validation, e2e); **`yarn` / `yarn lerna:prepare` must exit 0 before any other command**; [install / patch / fmt gate](agent-command-policy.md#install-patch-fmt-gate-blocking) before native `:build`
* [Documentation/commit policy](../documentation-policy.md) — durable vs ephemeral, OKF scan
* [Change authoring workflow](change-authoring-workflow.md) — verified product change loop (unit-focused → area-focused review → commit); [§ quality standards](change-authoring-workflow.md#quality-standards); [§ validation evidence (blocking)](change-authoring-workflow.md#validation-evidence-blocking); [coverage evidence package](coverage-design.md#coverage-evidence-package)
* [Iteration vocabulary](iteration-vocabulary.md) — work type, tier, and queue field identifiers
* [Running e2e tests](running-e2e.md) — canonical e2e commands; start here for `:test-cover`
* [Validation checklist](validation-checklist.md) — handoff command sequence
* [Coverage design](coverage-design.md) — coverage policy, Codecov/native gates (merged Android `jacocoTestReport`; iOS unit + e2e LCOV); [iOS Ruby SimpleCov](coverage-design.md#ios-ruby-simplecov) (`yarn tests:ios:ruby`, flag `ios-ruby`)
* [Android unit testing ADR](android-architecture-decisions.md#androidtest-ad-1) — JUnit-first; Robolectric when Android APIs are required; omit `@Config` / `sdk` unless proven (`AndroidTest-AD-1`)
* [iOS unit testing ADR](ios-architecture-decisions.md#iostest-ad-1) — macOS/host-first in-package XCTest; Simulator only if UIKit required (`IosTest-AD-1`)
* [Published types ADR](architecture-decisions.md) — attw / Expo plugin decisions (`Types-AD-*`)
* [Firebase testing project](firebase-testing-project.md) — cloud vs emulator, live FIS/RC, helper callables, rules/indexes, deploy
* [Test app dependency pins](test-app-dependency-pins.md) — intentional RN / CLI locks driven by `react-native-macos`
