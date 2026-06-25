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
| **Ephemeral** | Explicit **work-queue** docs only | Session phase/probe IDs, SHAs, gate state, snapshot labels, subagent IDs, dated banners, run counts |

**Rules**

1. General OKF docs get **durable only** updates: no phase IDs, SHAs, session e2e counts, or gate snapshots.
2. Ephemeral state lives **only** in work queues. When an item closes, durable outcomes move to reference docs; queue rows may archive/delete.
3. Durable docs may link to a work queue for current status; do not duplicate ephemeral fields.

## Commits

Commit messages use Conventional Commits and describe durable product/process deliverables: what changed and why, not probe IDs, gates, e2e counts, or “phase X complete”.

## OKF update contract

OKF markdown edits require an **independent bundle consistency pass**. Use a fresh context with:

1. A short summary of what changed and which files were touched.
2. Instruction to scan the **entire** `okf-bundle/` tree.

Confirm:

| Check | Requirement |
|-------|-------------|
| **Canonical location** | Each topic has one owning doc; others link to it ([running e2e](testing/running-e2e.md) for e2e commands, this file for doc/commit policy, etc.) |
| **DRY** | No duplicated procedures, policy paragraphs, or ephemeral snapshots outside work queues |
| **Link hygiene** | Cross-links resolve; indexes list canonical entry points |
| **Durability** | No ephemeral fields leaked into general reference docs |

Fix violations before handoff/merge. Work-queue edits still follow this split.

## Work-queue documents

Work queues are **intentionally ephemeral**: phases, SHAs, gates, active coordination. They are not policy or finalized registry/design homes.

New work queues link here in frontmatter/opening section; do not copy policy inline.
