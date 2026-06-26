---
type: Reference
title: Iteration vocabulary
description: Workflow-neutral terms for iteration steps, validation tiers, gates, and host rules used across OKF docs and work queues.
tags: [testing, validation, workflow, gates, work-queue]
timestamp: 2026-06-25T00:00:00Z
---

# Iteration vocabulary

Canonical terms for **what kind of work** an iteration requires and **which validation applies**. These terms describe verification work — not agent roles, session types, or dispatch policy.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md).

## Work types

| Work type | Purpose | Typical validation tier | Product edits during work | Commit allowed |
|-----------|---------|-------------------------|---------------------------|----------------|
| `gap-analysis` | Confirm export/SDK semantics and feasibility | none | read-only | no |
| `baseline-capture` | Record before snapshots and area-tier e2e baseline | `area` | harness narrowing OK locally; never commit narrowing | no |
| `implementation` | Code, unit tests, fast e2e loop | `focused` | yes | no |
| `independent-review` | Adversarial pass on a **frozen tree** | `area` (+ checklist where workflow requires) | no — [frozen tree](#frozen-tree) | no |
| `documentation` | User docs and durable OKF updates | none | docs only | no |
| `commit` | Single focused commit after gates close | none | staging/commit only | yes |
| `pre-merge-validation` | Branch-wide unfocused gate before merge | `full` | revert all narrowing first | no |

Work types are ordered in package workflows (e.g. [pipeline implementation workflow](../packages/firestore/pipeline-implementation-workflow.md)). A work queue row names the **`next_work_type`** when pickup should continue an in-flight item.

## Validation tiers

E2e scope and narrowing rules: [running e2e § validation tiers](running-e2e.md#e2e-validation-tiers-focused-area-full).

| Tier | E2e scope | Narrowing |
|------|-----------|-----------|
| `focused` | Fast loop while product code is changing | `.only` and tight area narrowing OK locally — never commit |
| `area` | Full loaded spec(s) for the package/area under change | Area narrowing in `tests/app.js` / `tests/globals.js` OK; no `.only` |
| `full` | All modules, all platforms | Revert all narrowing |

Jest, prepare, compile, and checklist commands per work type: [validation checklist](validation-checklist.md).

## Gates

Binary checkpoints on a queue item or iteration. Values: `open` | `closed`. Work queues may also mark an item **`blocked`** when a dependency gate is open elsewhere.

| Gate | Closed when |
|------|-------------|
| `implementation` | `implementation` work type complete — code plus focused-tier checks reported green |
| `review` | `independent-review` work type complete — area-tier (and checklist where required) green on frozen tree |
| `commit` | Durable commit exists for the item |

**Trust rule:** Code may exist on disk or in git while `review` is still `open`. That state is **unverified** until `independent-review` closes the `review` gate.

## Frozen tree

Required for `independent-review` and for any `:test-cover` run that closes the `review` gate:

- No edits to `packages/**`, `tests/**` (except reverting `.only`), or bundle-affecting OKF docs during the run.
- Wait for or cancel in-flight runs before editing again.

See also: [running e2e rule 7](running-e2e.md#rules) and [host rule](running-e2e.md#serialized-e2e-loops-shared-dev-host).

## Host rule

On a shared dev host:

- One `:test-cover` at a time — never overlap focused-tier and area-tier runs.
- [Pre-flight](running-e2e.md#pre-flight-is-the-host-clear-to-start) before every run: host clear, [services ready](running-e2e.md#2-services-ready), [harness matches `validation_tier`](running-e2e.md#3-harness-matches-validation-tier).
- Canonical commands only — [running e2e](running-e2e.md). Stalled runs → [stalled run detection](running-e2e.md#stalled-run-detection).

## Work-queue fields

Ephemeral work queues may record:

| Field | Meaning |
|-------|---------|
| `next_work_type` | Which work type unblocks the item next |
| `validation_tier` | `focused` \| `area` \| `full` for the next validation pass |
| `platform` | Optional scope (e.g. `ios` for iOS-only guard probes) |
| `implementation_gate` | `open` \| `closed` |
| `review_gate` | `open` \| `closed` |
| `commit_gate` | `open` \| `closed` |
| `blocked` | Item or dependent blocked until named gate closes |

Queues record **state**, not who executes the work.

## Related docs

| Topic | Document |
|-------|----------|
| E2e commands and tiers | [running-e2e.md](running-e2e.md) |
| Validation commands | [validation-checklist.md](validation-checklist.md) |
| Doc/commit policy | [documentation-policy.md](../documentation-policy.md) |
| Pipeline iteration steps | [pipeline-implementation-workflow.md](../packages/firestore/pipeline-implementation-workflow.md) |
| Live gate snapshots | [pipeline coverage work queue](../packages/firestore/pipeline-coverage-work-queue.md) |
