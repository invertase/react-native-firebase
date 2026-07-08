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
| **Ephemeral** | Linear **project** work-queue documents (grandfathered `okf-bundle/**/*work-queue.md` until migrated) | Session phase/probe IDs, **planned commit subjects** (`commit_subject`), gate state, `next_work_type`, snapshot labels, dated banners, run counts |
| **Private** | Linear issues and internal docs | Issue IDs, discussion, non-public commercial terms. Not GitHub-public; not the same as ephemeral |

GitHub-public **reference** docs, `AGENTS.md`, commits, and PR titles must **not** contain ephemeral fields (for example work-queue gates) or private items (for example Linear issue identifiers). Queue **state** lives on Linear project documents, not in new git files. Grandfathered repo `*work-queue.md` files may still hold ephemeral fields until pickup.

**Rules**

1. General OKF docs get **public/durable only** updates: no phase IDs, **commit subjects**, session e2e counts, gate snapshots, or Linear issue identifiers.
2. Ephemeral state lives **only** in work queues. Private tracker state lives on the Linear issue. When an item closes, **public** outcomes move to reference docs; archive the Linear queue document (un-archive on reopen).
3. Durable docs may link to a work queue for current status; do not duplicate ephemeral or private fields.

## Commits as documentation

We treat **git commits** as durable documentation: they are the canonical record of what changed, when, and why — for humans and agents reviewing history later, not only for the current PR thread.

Commit messages use [Conventional Commits](https://www.conventionalcommits.org/) and describe durable product/process deliverables: what changed and why, not probe IDs, gates, e2e counts, or “phase X complete”.

## Pull requests

Commit subjects and PR titles use [Conventional Commits](https://www.conventionalcommits.org/). When a PR contains **exactly one commit**, the **PR title must match that commit's subject line exactly** (character-for-character). Multi-commit PRs use a summary title that describes the overall change set.

PRs are squash-merged. Maintainers or agents may amend or squash to **fix** a non-conforming subject so the published commit is Conventional Commits. That is an exception flow to repair a violation, not permission to skip the format on commits.

## OKF update contract

OKF markdown edits require an **independent bundle consistency pass**. That pass **is** `independent-review` when the frozen tree includes `okf-bundle/` reference docs, `AGENTS.md`, or `CONTRIBUTING.md` — [validation-checklist § OKF bundle review](testing/validation-checklist.md#okf-bundle-review). The `documentation` work type **promotes** durable text; it does not run this scan. Loop order: [change authoring § primary loop](testing/change-authoring-workflow.md#primary-loop).

Scan the **entire** `okf-bundle/` tree against:

| Check | Requirement |
|-------|-------------|
<<<<<<< HEAD
| **Canonical location** | Each topic has one owning doc; others link to it. Bundle owners: [index.md](index.md). Testing owners: [testing/index.md](testing/index.md) (file **and** section links). |
=======
| **Canonical location** | Each topic has one owning doc; others link to it ([agent command policy](testing/agent-command-policy.md) for **all** agent shell commands; [change authoring](testing/change-authoring-workflow.md) for workflow/gates/frozen tree; [change authoring § validation evidence (blocking)](testing/change-authoring-workflow.md#validation-evidence-blocking); [running e2e](testing/running-e2e.md) for e2e `yarn tests:*` detail — [agent rule](testing/running-e2e.md#agent-rule-read-first); [platform coverage gate](testing/running-e2e.md#platform-coverage-gate-blocking); [iteration vocabulary](testing/iteration-vocabulary.md) for term ids and gate field names (`coverage_evidence_gate`); [change authoring § quality standards](testing/change-authoring-workflow.md#quality-standards) for the review-findings resolution rule and the intractable-limitation bar; [compare-types README § justification bar](../.github/scripts/compare-types/README.md#justification-bar) for firebase-js-sdk type/API drift justification; [coverage design § expectations](testing/coverage-design.md#coverage-expectations-policy); [coverage design § evidence package](testing/coverage-design.md#coverage-evidence-package) for coverage completion evidence and anti-patterns; [documentation site maintenance](documentation-site-maintenance.md) for `docs.json`, TypeDoc, and legacy redirect audits; this file for doc/commit policy, etc.) |
>>>>>>> d49739206 (docs(testing): tighten up coverage evidence requirements)
| **DRY** | No duplicated procedures, policy paragraphs, or ephemeral snapshots outside work queues |
| **Efficiency** | Shortest text that stays **complete and true** ([§ Efficiency](#efficiency)). Completeness wins over brevity |
| **Link hygiene** | Cross-links resolve; indexes list canonical entry points |
| **Durability** | No ephemeral or private fields in GitHub-public **reference** docs, commits, or PR titles. Queue state lives on Linear (or a grandfathered repo file until pickup). Linear issue identifiers stay off GitHub |

**Report-only** during `independent-review` ([frozen tree](testing/change-authoring-workflow.md#frozen-tree)). **Fix before `git commit`**. Do not add OKF after a frozen review without another `independent-review`. Work-queue edits still follow this split.

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

**Home:** a Linear **project** document on the issue's Linear project. Not a git file, and not the issue description. One copy. Document shape: How the Work Queue Orchestrator Works. Issue pointer rules: Cross Platform Issue Authoring & Agent Workflow Guide, Step 10.

**Do not create** new `okf-bundle/**/*work-queue.md` files.

**Existing repo queues:** stay the source of truth until that item is next picked up. On pickup, copy the file into a Linear project document, point the Linear issue at it (`Queue: linear-work-queue`), and delete the file in the same change. Do not dual-write.

Work queues record **gates**, **`next_work_type`**, **`validation_tier`**, and **`commit_subject`** using field names and allowed values from [iteration vocabulary](testing/iteration-vocabulary.md). Gate semantics, workflow rules, and `commit_subject` recording: [change authoring workflow](testing/change-authoring-workflow.md) (including [§ commit](testing/change-authoring-workflow.md#commit)). Public OKF owns those terms, gates, and commands. They do **not** name agent roles, dispatch instructions, or session choreography.

Record **`commit_subject`** (the planned Conventional Commit subject line) **before** `git commit`. After commit, the subject in git and in the Linear queue document must match character-for-character ([PR title rule](#pull-requests) for single-commit PRs). Do not record SHAs. The queue document is not part of the git changeset.
