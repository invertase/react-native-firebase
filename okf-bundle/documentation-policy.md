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
| **Canonical location** | Each topic has one owning doc; others link to it ([agent command policy](testing/agent-command-policy.md) for **all** agent shell commands; [change authoring](testing/change-authoring-workflow.md) for workflow/gates/frozen tree; [change authoring § validation evidence (blocking)](testing/change-authoring-workflow.md#validation-evidence-blocking); [running e2e](testing/running-e2e.md) for e2e `yarn tests:*` detail — [agent rule](testing/running-e2e.md#agent-rule-read-first); [platform coverage gate](testing/running-e2e.md#platform-coverage-gate-blocking); [iteration vocabulary](testing/iteration-vocabulary.md) for term ids only; [change authoring § quality standards](testing/change-authoring-workflow.md#quality-standards) for the review-findings resolution rule and the intractable-limitation bar; [compare-types README § justification bar](../.github/scripts/compare-types/README.md#justification-bar) for firebase-js-sdk type/API drift justification; [coverage design § expectations](testing/coverage-design.md#coverage-expectations-policy); [coverage design § evidence package](testing/coverage-design.md#coverage-evidence-package) for coverage completion evidence; [documentation site maintenance](documentation-site-maintenance.md) for `docs.json`, TypeDoc, and legacy redirect audits; this file for doc/commit policy, etc.) |
| **DRY** | No duplicated procedures, policy paragraphs, or ephemeral snapshots outside work queues |
| **Link hygiene** | Cross-links resolve; indexes list canonical entry points |
| **Durability** | No ephemeral fields leaked into general reference docs |

Fix violations before handoff/merge. Work-queue edits still follow this split.

## Work-queue documents

Work queues are **intentionally ephemeral**: phases, **commit subjects**, gates, active coordination. They are not policy or finalized registry/design homes.

Work queues record **gates**, **`next_work_type`**, **`validation_tier`**, and **`commit_subject`** using field names and allowed values from [iteration vocabulary](testing/iteration-vocabulary.md). Gate semantics and workflow rules: [change authoring workflow](testing/change-authoring-workflow.md). They do **not** name agent roles, dispatch instructions, or session choreography — those are out of scope for the public repo.

Record **`commit_subject`** (the planned Conventional Commit subject line) **before** `git commit`, in the same staged changeset as the item being memorialized. Do not record SHAs — they are unstable under history rewrite. After commit, the subject in git and in the queue must match character-for-character ([PR title rule](#pull-requests) for single-commit PRs).

New work queues link here in frontmatter/opening section; do not copy policy inline.

### When to create a work queue

Create a new work-queue markdown file when **all** of these are true:

1. The work is a **multi-item backlog** that will span multiple sessions (migration, API removal, coverage drain, compare-types parity, etc.).
2. Gate state (`implementation` / `review` / `commit`), `next_work_type`, and `validation_tier` must survive chat compaction and fresh sessions.
3. Linear alone is not enough (too many parallel gated items to track cleanly in one issue description).

Do **not** create a queue file for:

- A single PR / contained fix (use the Linear issue Step 10 structure instead — see [Cross Platform Issue Authoring Guide](https://linear.app/invertase/document/cross-platform-issue-authoring-and-agent-workflow-guide-2b429e4aace0)).
- Truly one-shot work that finishes in one session (chat is enough).

Orchestrator role split (implement / review / commit) can still run without a queue file.

### Where a work queue lives

| Scale | Persistence |
| ----- | ----------- |
| Multi-item backlog | Tracked markdown under `okf-bundle/` (e.g. `okf-bundle/<area>/work-queue.md` or `okf-bundle/testing/<name>-work-queue.md`), updated after every subagent return, **committed with the product change** |
| Single PR / contained fix spanning chats | Linear issue only (Step 10 + dated comments) |
| One-shot | Chat alone |

**Default for new RNFB queues:** tracked + committed with the product change. That matches existing queues (`okf-bundle/monorepo-tooling/work-queue.md`, `okf-bundle/testing/compare-types-work-queue.md`, and similar). A gitignored-on-disk option was considered and is **not** the default — ephemeral means the *content* is disposable session state, not that the file is untracked.

### Bootstrap template (minimum shape)

Copy structure from an existing queue rather than inventing a new format. Minimum:

1. YAML frontmatter (`type: Reference`, `title`, `description`, `tags` including `work-queue`, `timestamp`).
2. Status banner blockquote (`IN PROGRESS` / `COMPLETE`, next pickup, goal).
3. Links to canonical OKF docs (this policy, [iteration vocabulary](testing/iteration-vocabulary.md), [change authoring](testing/change-authoring-workflow.md), package workflow if any) — **link, do not restate**.
4. Resume checklist (host/prepare/validation pointers).
5. Item table with columns using vocabulary field ids: `commit_subject`, `implementation_gate`, `review_gate`, `commit_gate`, `next_work_type`, `validation_tier`, notes.
6. Footer: current snapshot / current gates.

Private orchestrator skill (`work-queue-orchestrator`) owns how agents dispatch against the queue; this policy owns when/where/what the file contains.

### Defining the queue (before orchestrating)

Do not invent queue rows cold and immediately start the orchestrator. For a new multi-item backlog:

1. **Grill the plan** from current state → stated goal using [grill-me](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me) / [grilling](https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling). Capture hard-to-reverse decisions with [domain-modeling](https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling) / [ADR format](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/ADR-FORMAT.md) when they meet the ADR bar.
2. **Developer comprehension gate:** run [comprehension-gate](https://github.com/tomasmihalyi/living-spec-skill/blob/main/agents/comprehension-gate.md) so the human can prove they understand the plan (trade-offs, assumptions, failure modes) before Planning → Building. Do not write the queue or start implementation until that gate passes. (Prefer [grill-with-docs](https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs) when ADRs/glossary should be written during the interview.)
3. **Gap analysis → queue:** after the gate passes, draft the work-queue markdown (often starting with a `gap-analysis` / scope item), then hand off to `work-queue-orchestrator`.

Canonical kickoff wording and Cross Platform-facing summary: [How the Work Queue Orchestrator Works](https://linear.app/invertase/document/how-the-work-queue-orchestrator-works-ad928da78c5a) § Defining the queue before orchestrating.
