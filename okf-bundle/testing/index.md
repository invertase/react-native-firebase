# Testing

* [Agent command policy](agent-command-policy.md) — **read before any shell command** (install, prepare, validation, e2e); **`yarn` / `yarn lerna:prepare` must exit 0 before any other command**; [install / patch / fmt gate](agent-command-policy.md#install-patch-fmt-gate-blocking) before native `:build`
* [Documentation/commit policy](../documentation-policy.md) — public vs ephemeral vs private, OKF scan, [Efficiency](../documentation-policy.md#efficiency)
* [Change authoring workflow](change-authoring-workflow.md) — verified product change loop (unit-focused → area-focused review → commit); [§ gates](change-authoring-workflow.md#gates); [§ frozen tree](change-authoring-workflow.md#frozen-tree); [§ quality standards](change-authoring-workflow.md#quality-standards); [§ validation evidence (blocking)](change-authoring-workflow.md#validation-evidence-blocking); [§ commit](change-authoring-workflow.md#commit); [coverage evidence package](coverage-design.md#coverage-evidence-package)
* [compare-types justification bar](../../.github/scripts/compare-types/README.md#justification-bar) — firebase-js-sdk type/API drift justification
* [Iteration vocabulary](iteration-vocabulary.md) — work type, tier, and queue field identifiers
* [Running e2e tests](running-e2e.md) — canonical e2e commands; start here for `:test-cover`; [§ agent rule (read first)](running-e2e.md#agent-rule-read-first); [§ platform coverage gate](running-e2e.md#platform-coverage-gate-blocking)
* [Validation checklist](validation-checklist.md) — handoff command sequence; [§ OKF bundle review](validation-checklist.md#okf-bundle-review)
* [Coverage design](coverage-design.md) — coverage policy, Codecov/native gates (merged Android `jacocoTestReport`); [§ coverage expectations (policy)](coverage-design.md#coverage-expectations-policy); [§ evidence package](coverage-design.md#coverage-evidence-package); [iOS Ruby SimpleCov](coverage-design.md#ios-ruby-simplecov) (`yarn tests:ios:ruby`, flag `ios-ruby`)
* [Android unit testing ADR](android-architecture-decisions.md) — Robolectric + Mockito (`AndroidTest-AD-1`)
* [Published types ADR](architecture-decisions.md) — attw / Expo plugin decisions (`Types-AD-*`)
* [Firebase testing project](firebase-testing-project.md) — cloud vs emulator, live FIS/RC, helper callables, rules/indexes, deploy
* [Test app dependency pins](test-app-dependency-pins.md) — intentional RN / CLI locks driven by `react-native-macos`
