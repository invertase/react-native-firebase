---
type: Reference
title: Monorepo tooling
description: Durable decisions and design for React Native Firebase monorepo build tooling — Nx local cache, prepare graph, declaration maps, dependency cycle linting, dev watch, and the ephemeral rollout queue.
tags: [monorepo, tooling, nx, lerna, bob, build, work-queue]
timestamp: 2026-07-10T00:00:00Z
---

# Monorepo tooling

Build-tooling decisions and design for the React Native Firebase monorepo: task orchestration, caching, package build graph, declaration maps, dependency-cycle linting, and developer watch/TDD ergonomics.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md).

## Documents

- [Architecture decisions (ADR)](architecture-decisions.md) — **canonical owner** of durable tooling decisions (the "what + why"); other docs reference it
- [Prepare, cache, and watch design](prepare-and-cache.md) — durable design: Nx local cache, deterministic prepare graph, declaration maps, dependency-cruiser, dev watch + TDD hook chain, benchmark methodology
- [Rollout work queue](work-queue.md) — ephemeral phase tracker, per-item steps, gates, and acceptance criteria

## Scope

In scope: `lerna`/`nx` task orchestration and caching, `react-native-builder-bob` outputs, the `packages/*` build graph, root `prepare` flow, `tsconfig` declaration maps, and dependency-cycle linting. Local dev watch + event-driven e2e rerun are **in scope but deferred** to a gap-analysis pre-phase ([MonoTool-AD-9](architecture-decisions.md#monotool-ad-9--dev-watch-rebuilds-prepare-e2e-tdd-rerun-is-event-driven-off-metro--deferred)) — not on the initial critical path.

Out of scope (explicitly rejected — see [ADR](architecture-decisions.md)): Turborepo, Nx Cloud / remote cache, tsdown, oxlint/oxfmt, lefthook, isolate-package, `@codecompose/typescript-config`.

## Related repository files

- [`lerna.json`](../../../lerna.json) — versioning + publish config (unchanged by this work)
- [`package.json`](../../../package.json) — root scripts, workspaces, `lerna:prepare`
- [`tsconfig.packages.base.json`](../../../tsconfig.packages.base.json) — shared package compiler options (17 of 19 packages extend it)
- [`.github/workflows/linting.yml`](../../../.github/workflows/linting.yml) — CI lint job (target for `lint:deps` + `.nx/cache`)
