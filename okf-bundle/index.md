---
okf_version: "0.1"
---

# React Native Firebase knowledge bundle

Knowledge documents for react-native-firebase development, testing, and maintenance.

# CI workflows

* [CI workflows](/ci-workflows/index.md) — GitHub Actions reliability, logging, and troubleshooting (iOS simulator boot and Detox/Jet e2e orchestration)

# Testing

* [Running e2e tests](/testing/running-e2e.md) — the canonical e2e runbook: the minimal command set, fast-iteration tips, environment control, and diagnosis (start here)
* [Validation checklist](/testing/validation-checklist.md) — canonical validation command sequence (`reference:api`, Jest, lints, spellcheck, `compare:types`, e2e, coverage policy)
* [Coverage design](/testing/coverage-design.md) - unit and e2e coverage goals, expectations/policy, pipelines, and Codecov uploads
* [Firebase testing project and emulator setup](/testing/firebase-testing-project.md) - cloud vs emulator, rules/indexes, deploy workflow for `react-native-firebase-testing`

# Packages

* [@react-native-firebase/auth](/packages/auth/index.md) — Auth modular API type parity, platform matrix, and compare:types triage
* [@react-native-firebase/firestore](/packages/firestore/index.md) — Firestore Pipelines architecture, coercion, and e2e coverage
