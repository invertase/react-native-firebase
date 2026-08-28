# React Native Firebase AGENTS Guide

## Project

- Yarn workspaces monorepo for React Native Firebase.
- Library code: `packages/**/lib`; e2e app: `tests/`.
- Contributor/review norms: `CONTRIBUTING.md`.

## Working

- Run from repo root; install once with `yarn`.
- **Agent shell commands:** [agent-command-policy.md](okf-bundle/testing/agent-command-policy.md) only (allowlist). E2e additionally [running-e2e.md § agent rule](okf-bundle/testing/running-e2e.md#agent-rule-read-first).
- Follow local package patterns; check `type-test.ts`, `__tests__/`, and plugin dirs before public API/platform changes.
- Start with `okf-bundle/index.md` for repo-specific implementation/testing/maintenance knowledge.
- **Change authoring:** [change-authoring-workflow.md](okf-bundle/testing/change-authoring-workflow.md) — baseline → unit-focused implementation → `documentation?` → area-focused `independent-review` → commit; [**validation evidence**](okf-bundle/testing/change-authoring-workflow.md#validation-evidence-blocking) and [**coverage evidence**](okf-bundle/testing/coverage-design.md#coverage-evidence-package) required before gates close or push. Do not add OKF / `AGENTS.md` / `CONTRIBUTING.md` after a frozen review without another `independent-review`.
- Use package indexes under `okf-bundle/packages/` for package-specific workflows and active work queues (Linear project documents; see [documentation-policy.md](okf-bundle/documentation-policy.md#work-queue-documents)). Do not create new `okf-bundle/**/*work-queue.md` files.
- Follow [documentation-policy § public vs ephemeral vs private](okf-bundle/documentation-policy.md#durable-vs-ephemeral): GitHub-public **reference** docs, this file, commits, and PR titles must not contain ephemeral **fields** or Linear issue identifiers. Gated queue state lives on Linear, not in new git files.
- Testing entry points: `okf-bundle/testing/index.md`; validation requirements: `okf-bundle/testing/validation-checklist.md`.
- Match validation to the **work type** and **validation tier** in OKF ([change authoring workflow](okf-bundle/testing/change-authoring-workflow.md); term ids in [iteration vocabulary](okf-bundle/testing/iteration-vocabulary.md)).

## PR instructions

- Keep pull requests scoped to one package or one repo concern where possible.
- PR titles: [documentation-policy § pull requests](okf-bundle/documentation-policy.md#pull-requests). Examples: `CONTRIBUTING.md`.
- When public APIs or observable behavior change, update tests, docs, and types in the same PR.
