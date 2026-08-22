---
type: Reference
title: OKF documentation and commit policy
description: Canonical rules for public vs ephemeral vs private knowledge, commit messages, and post-update bundle consistency.
tags: [okf, documentation, policy, commits, work-queue]
timestamp: 2026-08-22T00:00:00Z
---

# OKF documentation and commit policy

Single source of truth for OKF knowledge and commit wording. Other OKF docs/work queues link here; do not restate.

<a id="durable-vs-ephemeral"></a>

## Public vs ephemeral vs private

| Kind | Where it lives | What it contains |
|------|----------------|------------------|
| **Public (durable)** | GitHub-**public** reference docs and indexes under `okf-bundle/` (not work-queue files) | Stable API names, registry IDs, SDK versions, classifications, verification **methods**, architecture, canonical commands |
| **Ephemeral** | Explicit **work-queue** docs (including committed queues under `okf-bundle/`) | Session phase/probe IDs, **planned commit subjects** (`commit_subject`), gate state, `next_work_type`, snapshot labels, dated banners, run counts |
| **Private** | Linear, internal docs | Issue IDs, discussion, non-public commercial terms. Not GitHub-public; not the same as ephemeral |

GitHub-public **reference** docs, `AGENTS.md`, commits, and PR titles must **not** contain ephemeral fields (for example work-queue gates) or private items (for example Linear identifiers, internal docs). Work-queue **files** may hold ephemeral fields (this repo commits some under `okf-bundle/`). Private items stay off GitHub, including off committed queues.

**Rules**

1. General OKF docs get **public/durable only** updates: no phase IDs, **commit subjects**, session e2e counts, gate snapshots, or Linear identifiers.
2. Ephemeral state lives **only** in work queues. Private tracker state lives in Linear. When an item closes, **public** outcomes move to reference docs; leave session state in the queue and tracker state in Linear. Queue rows may archive/delete.
3. Durable docs may link to a work queue for current status; do not duplicate ephemeral or private fields.

## Commits as documentation

We treat **git commits** as durable documentation: they are the canonical record of what changed, when, and why — for humans and agents reviewing history later, not only for the current PR thread.

Commit messages use [Conventional Commits](https://www.conventionalcommits.org/) and describe durable product/process deliverables: what changed and why, not probe IDs, gates, e2e counts, or “phase X complete”.

## Pull requests

Commit subjects and PR titles use [Conventional Commits](https://www.conventionalcommits.org/). When a PR contains **exactly one commit**, the **PR title must match that commit's subject line exactly** (character-for-character). Multi-commit PRs use a summary title that describes the overall change set.

PRs are squash-merged. Maintainers or agents may amend or squash to **fix** a non-conforming subject so the published commit is Conventional Commits. That is an exception flow to repair a violation, not permission to skip the format on commits.

## OKF update contract

OKF markdown edits require an **independent bundle consistency pass**. Use a fresh context with:

1. A short summary of what changed and which files were touched.
2. Instruction to scan the **entire** `okf-bundle/` tree.

Confirm:

| Check | Requirement |
|-------|-------------|
| **Canonical location** | Each topic has one owning doc; others link to it. Bundle owners: [index.md](index.md). Testing owners: [testing/index.md](testing/index.md) (file **and** section links). |
| **DRY** | No duplicated procedures, policy paragraphs, or ephemeral snapshots outside work queues |
| **Efficiency** | Shortest text that stays **complete and true** ([§ Efficiency](#efficiency)). Completeness wins over brevity |
| **Link hygiene** | Cross-links resolve; indexes list canonical entry points |
| **Durability** | No ephemeral or private fields in GitHub-public **reference** docs, commits, or PR titles. Work-queue **files** may hold ephemeral fields. Private items stay off GitHub |

Fix violations before handoff/merge. Work-queue edits still follow this split. Handoff entry: [validation-checklist § OKF bundle review](testing/validation-checklist.md#okf-bundle-review).

## Efficiency

Efficiency is **information-preserving brevity**, not a token budget.

**Pass when:**

- Non-owning docs **link** to the owner instead of copying procedures, policy paragraphs, or command lists.
- Sentences and tables are as short as they can be **without** dropping a rule, case, exception, location, dual path (for example single- vs multi-commit PR titles), blocking step, or inbound heading id.
- Index and `AGENTS.md` summaries remain **true**: every distinction an agent needs in order to act correctly is either stated or linked with enough qualifier that the wrong place or rule cannot be assumed.

**Fail when:**

- A shorter owner doc omits a requirement that existed, or that other docs still depend on.
- A summary collapses two cases into one.
- A heading rename breaks `#fragment` links.
- “Don’t restate” is used to skip updating `AGENTS.md` or indexes after a policy change.

If shortening would change how an agent acts, keep the longer text.

## Work-queue documents

Work queues are **intentionally ephemeral**: phases, **commit subjects**, gates, active coordination. They are not policy or finalized registry/design homes.

Work queues record **gates**, **`next_work_type`**, **`validation_tier`**, and **`commit_subject`** using field names and allowed values from [iteration vocabulary](testing/iteration-vocabulary.md). Gate semantics, workflow rules, and `commit_subject` staging: [change authoring workflow](testing/change-authoring-workflow.md) (including [§ commit](testing/change-authoring-workflow.md#commit)). They do **not** name agent roles, dispatch instructions, or session choreography — those are out of scope for the public repo.

New work queues link here in frontmatter/opening section; do not copy policy inline.
