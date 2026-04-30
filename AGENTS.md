# React Native Firebase AGENTS Guide

## Project overview

- This repository is a Yarn workspaces monorepo for React Native Firebase packages.
- Most library code lives in `packages/*`.
- The end-to-end test app lives in `tests/`.
- Contributor expectations and review norms are documented in `CONTRIBUTING.md`.

## Dev environment tips

- Install dependencies once at the repository root with `yarn`.
- Prefer working from the repository root so package scripts and workspace resolution behave consistently.
- Check the affected package's `type-test.ts`, `__tests__/`, and plugin directories before changing public APIs or platform-specific behavior.
- Prefer consistency with existing patterns in the package you are editing instead of introducing new structure.

## Testing instructions

- Start with focused validation for the area you changed instead of running the entire suite.
- For JavaScript and TypeScript changes, run `yarn lint:js`.
- For package behavior changes, run targeted Jest coverage with `yarn tests:jest <path-to-test-file>`.
- For public API changes, update and run the relevant `packages/<name>/type-test.ts` checks and nearby Jest tests in `packages/<name>/__tests__/`.
- Run platform-specific e2e commands in `tests/` only when the change affects Android, iOS, or macOS behavior.
- Before merging substantial code changes, run the relevant root scripts from `package.json` for the touched area.

## PR instructions

- Keep pull requests scoped to one package or one repo concern where possible.
- Use Conventional Commit style PR titles, following the examples in `CONTRIBUTING.md`.
- When public APIs or observable behavior change, update tests, docs, and types in the same PR.
