---
type: Reference
title: OKF documentation and commit policy
description: Canonical rules for durable vs ephemeral knowledge, commit messages, and post-update bundle consistency.
tags: [okf, documentation, policy, commits, work-queue]
timestamp: 2026-06-25T00:00:00Z
---

# OKF documentation and commit policy

Single source of truth for OKF knowledge and commit wording. Other OKF docs/work queues link here; do not restate.

## Durable vs ephemeral

| Kind | Where it lives | What it contains |
|------|----------------|------------------|
| **Durable** | OKF reference docs (design, runbooks, registries, workflows) | Stable API names, registry IDs, SDK versions, classifications, verification **methods**, architecture, canonical commands |
| **Ephemeral** | Explicit **work-queue** docs only | Session phase/probe IDs, **planned commit subjects** (`commit_subject`), gate state, `next_work_type`, snapshot labels, dated banners, run counts |

**Rules**

1. General OKF docs get **durable only** updates: no phase IDs, **commit subjects**, session e2e counts, or gate snapshots.
2. Ephemeral state lives **only** in work queues. When an item closes, durable outcomes move to reference docs; queue rows may archive/delete.
3. Durable docs may link to a work queue for current status; do not duplicate ephemeral fields.

## Commits as documentation

We treat **git commits** as durable documentation: they are the canonical record of what changed, when, and why — for humans and agents reviewing history later, not only for the current PR thread.

Commit messages use [Conventional Commits](https://www.conventionalcommits.org/) and describe durable product/process deliverables: what changed and why, not probe IDs, gates, e2e counts, or “phase X complete”.

## Pull requests

When a PR contains **exactly one commit**, the **PR title must match that commit's subject line exactly** (character-for-character). Multi-commit PRs use a summary title that describes the overall change set.

## OKF update contract

OKF markdown edits require an **independent bundle consistency pass**. Use a fresh context with:

1. A short summary of what changed and which files were touched.
2. Instruction to scan the **entire** `okf-bundle/` tree.

Confirm:

| Check | Requirement |
|-------|-------------|
| **Canonical location** | Each topic has one owning doc; others link to it ([agent command policy](testing/agent-command-policy.md) for **all** agent shell commands; [change authoring](testing/change-authoring-workflow.md) for workflow/gates/frozen tree; [running e2e](testing/running-e2e.md) for e2e `yarn tests:*` detail — [agent rule](testing/running-e2e.md#agent-rule-read-first); [platform coverage gate](testing/running-e2e.md#platform-coverage-gate-blocking); [iteration vocabulary](testing/iteration-vocabulary.md) for term ids only; [change authoring § quality standards](testing/change-authoring-workflow.md#quality-standards) for the review-findings resolution rule and the intractable-limitation bar; [compare-types README § justification bar](../.github/scripts/compare-types/README.md#justification-bar) for firebase-js-sdk type/API drift justification; [coverage design § expectations](testing/coverage-design.md#coverage-expectations-policy) for coverage completion; [documentation site maintenance](documentation-site-maintenance.md) for `docs.json`, TypeDoc, and legacy redirect audits; this file for doc/commit policy, etc.) |
| **DRY** | No duplicated procedures, policy paragraphs, or ephemeral snapshots outside work queues |
| **Link hygiene** | Cross-links resolve; indexes list canonical entry points |
| **Durability** | No ephemeral fields leaked into general reference docs |

Fix violations before handoff/merge. Work-queue edits still follow this split.

## Work-queue documents

Work queues are **intentionally ephemeral**: phases, **commit subjects**, gates, active coordination. They are not policy or finalized registry/design homes.

Work queues record **gates**, **`next_work_type`**, **`validation_tier`**, and **`commit_subject`** using field names and allowed values from [iteration vocabulary](testing/iteration-vocabulary.md). Gate semantics and workflow rules: [change authoring workflow](testing/change-authoring-workflow.md). They do **not** name agent roles, dispatch instructions, or session choreography — those are out of scope for the public repo.

Record **`commit_subject`** (the planned Conventional Commit subject line) **before** `git commit`, in the same staged changeset as the item being memorialized. Do not record SHAs — they are unstable under history rewrite. After commit, the subject in git and in the queue must match character-for-character ([PR title rule](#pull-requests) for single-commit PRs).

New work queues link here in frontmatter/opening section; do not copy policy inline.
