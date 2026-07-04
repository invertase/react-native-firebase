# Testing

* [Agent command policy](agent-command-policy.md) — **read before any shell command** (install, prepare, validation, e2e); **`yarn` / `yarn lerna:prepare` must exit 0 before any other command**
* [Documentation/commit policy](../documentation-policy.md) — durable vs ephemeral, OKF scan
* [Change authoring workflow](change-authoring-workflow.md) — verified product change loop (unit-focused → area-focused review → commit); [§ quality standards](change-authoring-workflow.md#quality-standards) — fix every review finding unless the user accepts an exception (intractable-limitation bar or documented user-accepted deferral)
* [Iteration vocabulary](iteration-vocabulary.md) — work type, tier, and queue field identifiers
* [Running e2e tests](running-e2e.md) — canonical e2e commands; start here for `:test-cover`
* [Validation checklist](validation-checklist.md) — handoff command sequence
* [Coverage design](coverage-design.md) — coverage policy, Codecov/native gates
* [Firebase testing project](firebase-testing-project.md) — cloud vs emulator, live FIS/RC, helper callables, rules/indexes, deploy
