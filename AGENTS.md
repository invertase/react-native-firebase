# React Native Firebase AGENTS Guide

## Project overview

- This repository is a Yarn workspaces monorepo for React Native Firebase packages.
- Most library code lives in `packages/**/lib`.
- The end-to-end test app lives in `tests/`.
- Contributor expectations and review norms are documented in `CONTRIBUTING.md`.

## Dev environment tips

- Install dependencies once at the repository root with `yarn`.
- Prefer working from the repository root so package scripts and workspace resolution behave consistently.
- Check the affected package's `type-test.ts`, `__tests__/`, and plugin directories before changing public APIs or platform-specific behavior.
- Prefer consistency with existing patterns in the package you are editing instead of introducing new structure.

## Knowledge bundle

- Start with `okf-bundle/index.md` for repository-specific implementation, testing, and maintenance knowledge.
- Use package indexes under `okf-bundle/packages/` for package-specific workflows and active work queues.
- Follow `okf-bundle/documentation-policy.md` when editing OKF docs or writing commit messages: durable knowledge belongs in reference docs, ephemeral state belongs only in explicit work queues.

## Testing instructions

- Follow `okf-bundle/testing/index.md` for testing entry points and `okf-bundle/testing/validation-checklist.md` for validation requirements.
- Prefer focused validation for the area changed; package-specific OKF docs may add stricter gates.

## PR instructions

- Keep pull requests scoped to one package or one repo concern where possible.
- Use Conventional Commit style PR titles, following the examples in `CONTRIBUTING.md`.
- When public APIs or observable behavior change, update tests, docs, and types in the same PR.
