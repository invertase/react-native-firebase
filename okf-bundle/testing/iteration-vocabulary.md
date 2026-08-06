---
type: Reference
title: Iteration vocabulary
description: Identifier glossary and work-queue field schema for OKF — not workflow rules or commands.
tags: [testing, validation, workflow, work-queue]
timestamp: 2026-06-25T00:00:00Z
---

# Iteration vocabulary

Glossary of **string identifiers** and **work-queue field names** used across OKF. This doc does not define procedures, gate rules, harness policy, or e2e commands — each topic has one owning doc; others link.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md).

| Topic | Owner |
|-------|--------|
| Change loop, gates, frozen tree, host rule | [change authoring workflow](change-authoring-workflow.md) |
| **All agent shell commands** (install, prepare, validation, e2e) | [agent command policy](agent-command-policy.md) |
| E2e-only detail, pre-flight, harness gate, tier scope | [running e2e](running-e2e.md) — `yarn tests:*` subset of agent command policy |
| Validation command sequence | [validation checklist](validation-checklist.md) |
| Work-queue gate snapshots | Package work queues (ephemeral) |

## Work type identifiers

| Work type | Brief meaning |
|-----------|---------------|
| `gap-analysis` | Read-only feasibility / semantics check |
| `baseline-capture` | Record before snapshots or baselines |
| `implementation` | Author product code and tests |
| `independent-review` | Verify a frozen diff |
| `documentation` | User docs and durable OKF updates |
| `commit` | Stage and create one commit |
| `pre-merge-validation` | Branch-wide merge gate |

When to use each work type, validation tier, edit policy, and commit rules: [change authoring § work types](change-authoring-workflow.md#work-types).

## Validation tier identifiers

| Tier id | Brief meaning |
|---------|---------------|
| `unit-focused` | Fast validation while product code is changing |
| `area-focused` | Full loaded package spec(s) for the change area |
| `full` | Unfocused — all modules and platforms |

E2e scope, narrowing, and harness rules: [change authoring § validation tiers](change-authoring-workflow.md#validation-tiers), [running e2e § validation tiers](running-e2e.md#e2e-validation-tiers-unit-focused-area-focused-full).

## Gate identifiers

Work queues use these **field names** (values: `open` | `closed`):

| Field | Tracks |
|-------|--------|
| `implementation_gate` | `implementation` work type complete |
| `review_gate` | `independent-review` work type complete |
| `commit_gate` | Durable commit exists for the item **after** prior gates closed with [validation evidence](change-authoring-workflow.md#validation-evidence-blocking) |

What closes each gate, trust rules, and loop transitions: [change authoring § gates](change-authoring-workflow.md#gates).

`commit_gate` closes when a durable commit exists whose subject matches the row's `commit_subject`, **after** `implementation_gate` and `review_gate` closed with [validation evidence](change-authoring-workflow.md#validation-evidence-blocking).

Items may also be marked **`blocked`** when a dependency gate is open elsewhere.

## Work-queue fields

Ephemeral work queues may record:

| Field | Allowed values / meaning |
|-------|--------------------------|
| `next_work_type` | A [work type identifier](#work-type-identifiers) |
| `validation_tier` | `unit-focused` \| `area-focused` \| `full` |
| `platform` | Optional scope (e.g. `ios`) |
| `implementation_gate` | `open` \| `closed` |
| `review_gate` | `open` \| `closed` |
| `commit_gate` | `open` \| `closed` |
| `commit_subject` | Planned or landed **first line** of the item's focused commit (Conventional Commits subject). Set **before** `git commit`; must match the commit that closes `commit_gate`. Do not record SHAs. |
| `blocked` | Item or dependency blocked until named gate closes |

Queues record **state**, not who executes the work.

## Related docs

| Topic | Document |
|-------|----------|
| **Change authoring loop** | [change-authoring-workflow.md](change-authoring-workflow.md) |
| E2e commands | [running-e2e.md](running-e2e.md) |
| Validation commands | [validation-checklist.md](validation-checklist.md) |
| Doc/commit policy | [documentation-policy.md](../documentation-policy.md) |
| Pipeline-specific artifacts | [pipeline-implementation-workflow.md](../packages/firestore/pipeline-implementation-workflow.md) |
| Live gate snapshots | [pipeline coverage work queue](../packages/firestore/pipeline-coverage-work-queue.md) |
