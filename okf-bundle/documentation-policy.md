---
type: Reference
title: OKF documentation and commit policy
description: Canonical rules for durable vs ephemeral knowledge, commit messages, and post-update bundle consistency.
tags: [okf, documentation, policy, commits, work-queue]
timestamp: 2026-06-25T00:00:00Z
---

# OKF documentation and commit policy

Single source of truth for how knowledge and git history are written in this repository. Other OKF docs and work-queue files **link here**; they do not restate this policy.

## Durable vs ephemeral

| Kind | Where it lives | What it contains |
|------|----------------|------------------|
| **Durable** | General OKF reference docs (design, runbooks, registries, workflows) | Stable deliverables: API names, registry IDs, SDK versions, classifications, verification **methods**, architecture, canonical commands |
| **Ephemeral** | Explicit **work-queue** documents only (filename or frontmatter marks them as trackers) | Session state: phase letters, probe IDs, commit SHAs, gate open/closed, snapshot labels, subagent IDs, dated status banners, pass/fail counts from a specific run |

**Rules**

1. General OKF docs get **durable updates only** — no workstream phase IDs, no commit SHAs, no session e2e counts, no gate snapshots.
2. Ephemeral state is tracked **only** in work-queue documents. When a queue item closes, durable outcomes (registry rows, supported APIs, audit conclusions) move into reference docs; the queue row may be archived or deleted.
3. Durable docs may **link** to a work queue for “current status” but must not duplicate ephemeral fields inline.

## Commits

Commit messages describe **product or process deliverables** (Conventional Commits). They state **what changed and why** in durable terms — not session outcomes (probe IDs, gate status, e2e pass counts, “phase X complete”).

## OKF update contract

Any change that adds or edits OKF markdown is not done until an **independent bundle consistency pass** completes.

**After updating OKF**, run a fresh pass that was not performed by the same context that made the edits. The pass receives:

1. A short summary of what changed and which files were touched.
2. Instruction to scan the **entire** `okf-bundle/` tree.

The pass must confirm:

| Check | Requirement |
|-------|-------------|
| **Canonical location** | Each topic has one owning doc; others link to it ([running e2e](testing/running-e2e.md) for e2e commands, this file for doc/commit policy, etc.) |
| **DRY** | No duplicated procedures, policy paragraphs, or ephemeral snapshots outside work queues |
| **Link hygiene** | Cross-links resolve; indexes list canonical entry points |
| **Durability** | No ephemeral fields leaked into general reference docs |

Fix any violations before handoff or merge. Work-queue edits still follow the durable/ephemeral split above.

## Work-queue documents

Work queues are **intentionally ephemeral**. They name phases, SHAs, and gates for active coordination. They are **not** the long-term home for policy (see this file) or for finalized registry/design content (see package reference docs).

When creating a new work queue, link here in the frontmatter or opening section — do not copy this policy inline.
