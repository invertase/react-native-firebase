---
type: Reference
title: Namespace API removal work queue
description: Phase tracker for removing the deprecated namespaced JS API across all packages, leaving a modular-only public surface.
tags: [app, modular, namespaced, deprecation, migration, work-queue]
timestamp: 2026-06-26T00:00:00Z
---

# Namespace API removal — work queue

> **IN PROGRESS (2026-06-27):** Committing N6 **`auth`**. **Next:** N6 `firestore` (`gap-analysis`). Latest committed: `refactor(analytics): remove deprecated namespaced API`.
> **Order:** pilot smallest (`ml`, `in-app-messaging`) → spike hardest (`messaging`) → bulk small→large → **NF** app cleanup → **NV** full validation. **Workflow:** [namespace-api-removal-workflow.md](namespace-api-removal-workflow.md).

---

Ephemeral tracker; see [OKF policy](documentation-policy.md). Work types / tiers / gate field ids: [iteration vocabulary](testing/iteration-vocabulary.md). **Loop, gates, host rule, harness:** [change authoring workflow](testing/change-authoring-workflow.md) — not restated here. **Agent commands:** [agent command policy](testing/agent-command-policy.md) only — no `yarn workspace … prepare`, no Jet probes.

---

## Phase ordering

| Phase | Module(s) | Why |
|-------|-----------|-----|
| **N0** | app factory | `gap-analysis` — factory shape; blocks N1 |
| **N1** | `ml` (0m) | hollowest pilot — proves factory + index/test rewrite |
| **N2** | `in-app-messaging` (3m) | second pilot — `withModularFlag` getters |
| **N3** | `messaging` (~28m) | **hardest** — headless task, globals, cross-module hops; native ⇒ `:build` before e2e |
| **N4** | `installations`, `app-distribution`, `functions` (~4m) | small bulk |
| **N5** | `perf`, `app-check`, `crashlytics`, `database`, `storage` | medium bulk |
| **N6** | `remote-config`, `analytics`, `auth`, `firestore` | large blast radius + `compare:types` |
| **NF** | `app` + shared infra | [final cleanup](namespace-api-removal-workflow.md#nf--final-cleanup-app--shared-infra) |
| **NV** | all | `pre-merge-validation`, **full** tier |

`ai`, `vertexai`, `phone-number-verification` already modular-only — no phase.

---

## Resume checklist

Gate prerequisites before any `:test-cover` ([host rule](testing/change-authoring-workflow.md#host-rule)):

1. [Pre-flight](testing/running-e2e.md#pre-flight-is-the-host-clear-to-start): [host-clear probes](testing/running-e2e.md#host-clear-probes), [services ready](testing/running-e2e.md#2-services-ready), [harness matches validation tier](testing/running-e2e.md#3-harness-matches-validation-tier) ([narrowing gate](testing/running-e2e.md#harness-narrowing-gate-blocking) — **unit-focused** and **area-focused** only); [serial `:test-cover`](testing/running-e2e.md#serialized-e2e-dispatch); [frozen tree](testing/change-authoring-workflow.md#frozen-tree) for `independent-review`.
2. Per-module checklist and removal greps: [namespace-api-removal-workflow.md](namespace-api-removal-workflow.md). User-facing namespace removal: [Migrating to v26](/migrating-to-v26).

---

## Per-module iteration protocol

Each module follows **one** serial loop. Work types: [change authoring workflow § work types](testing/change-authoring-workflow.md#work-types). Module checklist: [namespace-api-removal-workflow.md § implementation](namespace-api-removal-workflow.md#per-module-implementation).

| Step | Work type | Closes gate | Rules |
|------|-----------|-------------|-------|
| **1** | `gap-analysis` | — | Read-only; [workflow § gap-analysis](namespace-api-removal-workflow.md#per-module-gap-analysis) |
| **2** | `baseline-capture` | — | **area-focused** tier where native |
| **3** | `implementation` | `implementation` | [Workflow checklist](namespace-api-removal-workflow.md#per-module-implementation); **unit-focused** tier; `.only` OK locally; **no commit** |
| **4** | `independent-review` | `review` | **Frozen tree**; **area-focused** tier; removal greps; minor/nit → remediation + delta re-review |
| **5** | `documentation` | — | Migration guide + OKF if durable learnings |
| **6** | `commit` | `commit` | Set `commit_subject`, close gates in queue doc, stage queue **with** product commit; one focused commit |

---

## Module arbiter gates

Update immediately after each work type closes a gate ([fields](testing/iteration-vocabulary.md#work-queue-fields)). `~m` = instance methods.

| Phase | Module | `impl_gate` | `review_gate` | `commit_gate` | `commit_subject` | `next_work_type` | `validation_tier` | Notes |
|-------|--------|-------------|---------------|---------------|------------------|------------------|-------------------|-------|
| N0 | app factory | **closed** | **closed** | **closed** | `refactor(ml): remove deprecated namespace APIs` | — | area-focused | factory shipped with N1 commit |
| N1 | `ml` (0m) | **closed** | **closed** | **closed** | `refactor(ml): remove deprecated namespace APIs` | — | area-focused | pilot modular-only |
| N2 | `in-app-messaging` (3m) | **closed** | **closed** | **closed** | `refactor(in-app-messaging): remove deprecated namespaced API` | — | area-focused | web stub macOS; modular e2e 4×3 |
| N3 | `messaging` (~28m) | **closed** | **closed** | **closed** | `refactor(messaging): remove deprecated namespaced API` | — | area-focused | headless atomic swap; utils native hop |
| N4 | `installations` (4m) | **closed** | **closed** | **closed** | `refactor(installations): remove deprecated namespaced API` | — | area-focused | ios/android 4 passing |
| N4 | `app-distribution` (4m) | **closed** | **closed** | **closed** | `refactor(app-distribution): remove deprecated namespaced API` | — | area-focused | review2 iOS: 49 pass / 0 fail |
| N4 | `functions` (4m) | **closed** | **closed** | **closed** | `refactor(functions): remove deprecated namespaced API` | — | area-focused | review3 iOS: 36 pass / 0 fail (amended) |
| N5 | `perf` (6m) | **closed** | **closed** | **closed** | `refactor(perf): remove deprecated namespaced API` | — | area-focused | review2 iOS: 106 pass / 0 fail |
| N5 | `app-check` (8m) | **closed** | **closed** | **closed** | `refactor(app-check): remove deprecated namespaced API` | — | area-focused | review2 iOS: 50 pass / 0 fail |
| N5 | `crashlytics` (11m) | **closed** | **closed** | **closed** | `refactor(crashlytics): remove deprecated namespaced API` | — | area-focused | review2 iOS: 64 pass / 0 fail |
| N5 | `database` (10m) | **closed** | **closed** | **closed** | `refactor(database): remove deprecated namespaced API` | — | area-focused | review3 iOS: 228 pass / 0 fail (amended) |
| N5 | `storage` (6m) | **closed** | **closed** | **closed** | `refactor(storage): remove deprecated namespaced API` | — | area-focused | review3 iOS: 144 pass / 0 fail (amended) |
| N6 | `remote-config` (15m) | **closed** | **closed** | **closed** | `refactor(remote-config): remove deprecated namespaced API` | — | area-focused | review3 macOS 71/4p, iOS 78/4p, Android 78/4p; `npx jet` spawn fix uncommitted in firebase.test.js |
| N6 | `analytics` (~50m) | **closed** | **closed** | **closed** | `refactor(analytics): remove deprecated namespaced API` | — | area-focused | review1 macOS 62/6p, iOS 63/5p, Android 63/5p |
| N6 | `auth` (~43m) | **closed** | **closed** | **closed** | `refactor(auth): remove deprecated namespaced API` | — | area-focused | review: macOS 139/6p, iOS 148/23p, Android 155/15p; compare:types auth ✓. Minors deferred: legacy `firebase.auth()` error strings + stale JSDoc (NF/string cleanup) |
| N6 | `firestore` (~17m) | open | open | open | — | `gap-analysis` | area-focused | pipelines + `compare:types` |
| NF | `app` | open | open | open | — | `gap-analysis` | full | |
| NV | all | open | open | open | — | `pre-merge-validation` | full | revert all narrowing |

---

## N0/N1 review findings

**Fixed (delta re-review closed):** registry re-resolution + deleted-app guard; internal-`getApp` deprecation warning suppressed; fabricated `getX` message removed.

**Deferred:** atomic swap for side-effect modules (N3); custom-URL validation (N5); factory unit tests (N2).

**Edge cases for N3+:** headless handler + module globals; `firebase.utils(app)` hop; dual-exposed statics; instance-method deprecation maps on nested classes.

---

## NV — pre-merge

`pre-merge-validation`, **full** tier: [change authoring § pre-merge](testing/change-authoring-workflow.md#primary-loop); `compare:types` all registered configs; [validation checklist](testing/validation-checklist.md).
