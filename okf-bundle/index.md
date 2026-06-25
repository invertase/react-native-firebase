---
okf_version: "0.1"
---

# React Native Firebase knowledge bundle

* [Documentation/commit policy](/documentation-policy.md) — durable vs ephemeral, commits as documentation, PR titles, OKF consistency
* [Documentation site maintenance](/documentation-site-maintenance.md) — docs.json, TypeDoc reference site, legacy `/reference/` redirect audits

# CI workflows

* [CI workflows](/ci-workflows/index.md) — GitHub Actions reliability, logs, Detox/Jet troubleshooting

# Testing

* [Agent command policy](/testing/agent-command-policy.md) — allowlisted shell commands for agents (install, prepare, validation, e2e)
* [Change authoring workflow](/testing/change-authoring-workflow.md) — verified product change loop (unit-focused → area-focused review → commit)
* [Iteration vocabulary](/testing/iteration-vocabulary.md) — work type, tier, and queue field identifiers
* [Running e2e tests](/testing/running-e2e.md) — canonical e2e commands, narrowing, environment, diagnosis
* [Validation checklist](/testing/validation-checklist.md) — compile, Jest, lint, `compare:types`, e2e, coverage
* [Coverage design](/testing/coverage-design.md) — unit/e2e coverage policy, native gates, Codecov
* [Firebase testing project](/testing/firebase-testing-project.md) — cloud vs emulator, live FIS/RC, helper callables, rules/indexes, deploy

# Cross-cutting work

* [Namespace API removal workflow](/namespace-api-removal-workflow.md) — modular-only migration checklist, factory design, removal greps
* [Namespace API removal work queue](/namespace-api-removal-work-queue.md) — phase tracker and gate snapshots (ephemeral)
* [TurboModule migration](/new-architecture/index.md) — Codegen TurboModules, coordinated New Architecture break, phase queue

# Packages

* [Auth](/packages/auth/index.md) — modular API type parity, platform matrix, `compare:types`
* [Firestore](/packages/firestore/index.md) — Pipelines architecture, parity, e2e coverage
