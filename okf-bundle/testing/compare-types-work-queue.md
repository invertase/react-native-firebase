---
type: Reference
title: Compare-types parity work queue
description: Phased backlog to reduce documented compare-types drift between firebase-js-sdk and @react-native-firebase/* — ranked by fixability.
tags: [testing, compare-types, types, parity, work-queue]
timestamp: 2026-07-03T00:00:00Z
---

# Compare-types parity — work queue

> **IN PROGRESS:** **B1** — `constant` `preferIntegers` after Phase B commit. **Next:** B1 `implementation` → `independent-review`.
> **Stack:** `main` → `new-architecture` ([#9080](https://github.com/invertase/react-native-firebase/pull/9080)) → `pipeline-continue-workqueue` ([#9086](https://github.com/invertase/react-native-firebase/pull/9086)) → **`compare-types-work-queue`** (frontier).
> **Goal:** shrink `.github/scripts/compare-types/configs/*.ts` by fixing real drift or tightening intractable documentation — not blanket parity for native-only surfaces. Machinery: [compare-types README](../../../.github/scripts/compare-types/README.md). Term ids: [iteration vocabulary](iteration-vocabulary.md). Policy: [documentation policy](../documentation-policy.md).

---

Ephemeral tracker; see [OKF policy](../documentation-policy.md).

**Baseline (2026-07-03):** `yarn compare:types` green — **19/19** packages documented, **0** undoc, **0** stale. ~**411** listed diffs across registered packages (missing + extra + differentShape).

---

## Phase ordering

Fixability-first — cheap type-only wins before native/structural work; confirm intractable rows last so we do not invest in unfixable surface.

| Phase | Tier | Focus |
| ----- | ---- | ----- |
| **A** | 1 — Easiest | Types/docs only — no native bridge |
| **B** | 2 — Moderate | Small product work + Phase S sync candidates |
| **C** | 3 — Hard | Large implementation or structural wrapper typing |
| **D** | 4 — Document | Intentional drift — audit & harden config reasons only |

Each phase **starts with item `<phase>0` grilling** ([Matt Pocock grilling skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)) — one question at a time until scope, ordering, fix-vs-document, and validation tier per item are locked.

---

## Resume checklist

Before any item's `implementation`:

1. `yarn && yarn lerna:prepare` when `packages/*/lib/**` touched ([agent command policy](agent-command-policy.md)).
2. `yarn compare:types` — item closes only when its config row(s) removed or reason updated with intractability bar ([validation checklist § API reference](validation-checklist.md#api-reference-and-type-parity)).
3. Package-scoped: `yarn tsc:compile`, `yarn tsc:compile:consumer`, affected `yarn tests:jest` — full checklist when types touch public exports.
4. E2e only when native/runtime behaviour changes ([change authoring § work types](change-authoring-workflow.md#work-types)).

---

## Phase table

| Phase | Focus | Status | Outcome |
| ----- | ----- | ------ | ------- |
| **A** | Tier 1 — types/docs only | **partial** | A1–A5, A7–A8, A10 committed; A6/A9 deferred |
| **B** | Tier 2 — moderate / Phase S | **partial** | B1, B4–B9 committed; B2 open; B3/B10 deferred |
| **C** | Tier 3 — hard / structural | **queued** | — |
| **D** | Tier 4 — document intractable | **queued** | — |

---

## Current snapshot

**Label:** `baseline-2026-07-03`

**Next item:** **B2** — search stage spine + 6× `missingInRN` (`gap-analysis`).

**Current gates:** B1 closed. B2 `implementation_gate` open. B3 blocked. B10 → C1.

---

## Item arbiter

| Item | Package / scope | `commit_subject` | `implementation_gate` | `review_gate` | `commit_gate` | `next_work_type` | `validation_tier` | Notes |
| ---- | --------------- | ---------------- | ----------------------- | ------------- | ------------- | ---------------- | ------------------- | ----- |
| **A0** | Phase A scope | `fix(types): align compare-types modular API with firebase-js-sdk` | closed | closed | closed | — | `none` | Grilling closed 2026-07-03 — see [Phase A Notes](#phase-a-notes) |
| **A1** | firestore | `fix(types): align compare-types modular API with firebase-js-sdk` | closed | closed | closed | — | `area-focused` | Review green; `onSnapshotsInSync` row removed |
| **A2** | firestore-pipelines | `fix(types): align compare-types modular API with firebase-js-sdk` | closed | closed | closed | — | `area-focused` | Review green — A2 rows removed (batched A2–A4) |
| **A3** | firestore-pipelines | `fix(types): align compare-types modular API with firebase-js-sdk` | closed | closed | closed | — | `area-focused` | Review green — `TimeGranularity` row removed |
| **A4** | firestore-pipelines | `fix(types): align compare-types modular API with firebase-js-sdk` | closed | closed | closed | — | `area-focused` | Review green — `isType` row removed |
| **A5** | storage | `fix(types): align compare-types modular API with firebase-js-sdk` | closed | closed | closed | — | `area-focused` | Review green — upload return type rows removed |
| **A6** | storage | — | open | open | open | — | `unit-focused` | `TaskEvent` / `TaskState` — **user-accepted deferral** ([acceptable exceptions](change-authoring-workflow.md#acceptable-exceptions)): const-vs-literal alignment needs architectural review; accepted for now, tracked. Resolve by SDK alignment or recorded rationale once reviewed |
| **A7** | app-check | `fix(types): align compare-types modular API with firebase-js-sdk` | closed | closed | closed | — | `area-focused` | Review green — `AppCheckTokenListener` removed |
| **A8** | functions | `fix(types): align compare-types modular API with firebase-js-sdk` | closed | closed | closed | — | `area-focused` | Review green — registry + config; `FunctionsError` documented |
| **A9** | remote-config | — | open | open | open | — | `unit-focused` | `ValueSource` — **user-accepted deferral** ([acceptable exceptions](change-authoring-workflow.md#acceptable-exceptions)): const-vs-literal alignment needs architectural review; accepted for now, tracked. Resolve by SDK alignment or recorded rationale once reviewed |
| **A10** | cross-cutting | `fix(types): align compare-types modular API with firebase-js-sdk` | closed | closed | closed | — | `area-focused` | Review green — app structural + callbacks |
| **B0** | Phase B scope | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `none` | Gap-analysis + grilling decisions 2026-07-03 — see [Phase B Notes](#phase-b-notes) |
| **B1** | firestore-pipelines | `refactor(firestore/pipelines): add constant preferIntegers option` | closed | closed | closed | — | `area-focused` | Re-review green 2026-07-04: parser integerLiteral iOS/Android, preferIntegers e2e, sdk-compat; macOS 147 / iOS 152 / Android 152 |
| **B2** | firestore-pipelines | — | open | open | open | `gap-analysis` | `area-focused` | 6× `missingInRN`; search spine first |
| **B3** | storage | — | open | open | open | — | `area-focused` | **Blocked** — Phase S native sync |
| **B4** | analytics | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `unit-focused` | logEvent sync void |
| **B5** | app-check | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `area-focused` | initializeAppCheck sync AppCheck |
| **B6** | firestore | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `area-focused` | initializeFirestore sync Firestore |
| **B7** | remote-config | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `unit-focused` | FetchStatus native literals documented |
| **B8** | remote-config | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `unit-focused` | RemoteConfigOptions on getRemoteConfig |
| **B9** | firestore | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `unit-focused` | aggregateFieldEqual exported |
| **B10** | firestore | — | open | open | open | — | `area-focused` | **→ C1** — native `maxAttempts` blocked |
| **C0** | Phase C scope | — | open | open | open | `gap-analysis` | `none` | [Grilling](#phase-c--tier-3-hard--structural) |
| **C1** | firestore | — | open | open | open | — | `area-focused` | ~25 `missingInRN` (local cache, serialization, aggregates) |
| **C2** | firestore | — | open | open | open | — | `none` | Wrapper shapes: `DocumentReference`, `Firestore`, snapshots, `Transaction` |
| **C3** | firestore | — | open | open | open | — | `unit-focused` | `FirestoreSettings.persistence`, `LogLevel` subset |
| **C4** | firestore | — | open | open | open | — | `none` | Persistent cache index APIs — keep-async (PS-S2) |
| **C5** | auth | — | open | open | open | — | `area-focused` | Redirect flows, `credentialFromResult`, Recaptcha |
| **C6** | messaging | — | open | open | open | — | `none` | Native FCM vs web push (53 diffs) |
| **C7** | analytics | — | open | open | open | — | `none` | RN-only native APIs (80 extra exports) |
| **C8** | ai | — | open | open | open | — | `none` | Browser-only audio/Web APIs |
| **C9** | app (+ consumers) | — | open | open | open | — | `none` | `ReactNativeFirebase.FirebaseApp` extends SDK `FirebaseApp` |
| **D0** | Phase D scope | — | open | open | open | `gap-analysis` | `none` | [Grilling](#phase-d--tier-4-document--leave) |
| **D1** | all packages | — | open | open | open | — | `none` | `SDK_VERSION` extra exports — policy |
| **D2** | database, perf, … | — | open | open | open | — | `none` | RN-only native helpers |
| **D3** | cross-cutting | — | open | open | open | — | `none` | Error branding: keep vs unify |
| **D4** | storage | — | open | open | open | — | `none` | `EmulatorMockTokenOptions` simplification |
| **D5** | storage | — | open | open | open | — | `none` | `getStream` → `NodeJS.ReadableStream` |

---

## Phase A — Tier 1 (types/docs only)

**Goal:** Remove or shrink `differentShape` rows with **TypeScript-only** changes; no native bridge edits.

### A0 — Grilling (blocking)

**Method:** [Matt Pocock grilling skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) — interview relentlessly, **one question at a time**, explore codebase before asking when possible.

**Resolve before A1:**

| Branch | Questions |
| ------ | ----------- |
| Scope | Batch one PR per package vs one PR per item? Any items defer to B/C? |
| A10 cross-cutting | Single `NativeFirebaseError` structural fix vs per-package callback types? |
| firestore-pipelines | Declaration-only fixes — regenerate from SDK or hand-edit `.d.ts`? |
| Validation | Is `yarn compare:types` + tsc sufficient for all A items, or any need e2e? |
| Ordering | Strict A1→A10 or parallel by package after grilling? |
| Done signal | Config entry **removed** vs **reason narrowed** — rubric for “cosmetic equivalent”? |

**Deliverable:** Phase A **Notes** below updated with decisions; `A0` gates closed; `next_work_type` on A1 set to `implementation`.

### Items

| Item | Config / export | Current reason (summary) | Proposed fix |
| ---- | --------------- | ------------------------ | ------------ |
| **A1** | firestore `onSnapshotsInSync` | Cosmetic callback signatures; behaviour equivalent | Align `next`/`error` types to SDK |
| **A2** | firestore-pipelines `StageOptions`, `ExpressionType`, `timestampDiff` | Declaration ordering/format only | Match SDK declaration file |
| **A3** | firestore-pipelines `TimeGranularity` | `isoWeek`/`isoYear` vs lowercase variants | Widen union or alias |
| **A4** | firestore-pipelines `isType` | RN `Type` alias vs SDK `string` | Widen param type |
| **A5** | storage `uploadBytes`, `uploadBytesResumable` | `TaskResult`/`Task` aliases identical at runtime | Rename to SDK export names |
| **A6** | storage `TaskEvent`, `TaskState` | const object vs string-literal union | Export SDK-style literals |
| **A7** | app-check `AppCheckTokenListener` | Missing type re-export | Re-export SDK alias |
| **A8** | functions `FunctionsError`, `FunctionsErrorCodeCore` | RN uses `HttpsError` at runtime | Thin re-export or alias |
| **A9** | remote-config `ValueSource` | const object vs type alias | Add SDK-style type alias |
| **A10** | remote-config, storage, … callbacks | `NativeFirebaseError` vs `FirebaseError` | Structural assignability or unified callback error type |

### Phase A Notes

**Gap-analysis (2026-07-03):** All A1–A9 are types-only; no native bridge edits. A8 needs compare-types registry + baseline config first (`functions` not registered). A6/A9 moderate: const objects used in tests (`TaskEvent.STATE_CHANGED`, `ValueSource.REMOTE`) — dual const+SDK-type pattern likely. A10 touches `remote-config` + `storage` callbacks; app-level `NativeFirebaseError` structural assignability recommended before consumer updates.

**Proposed batching (per package, not per item):**

| Batch | Items |
| ----- | ----- |
| firestore | A1 |
| firestore-pipelines | A2, A3, A4 |
| storage | A5 (+ storage slice of A10); A6 deferred |
| app-check | A7 |
| functions | A8 (+ registry infra) |
| app | A10 structural |
| remote-config | A10 slice; A9 deferred |

**Proposed ordering:** A8 infra → A10 app structural → parallel A1, A2–A4, A5–A6, A7, A8 aliases, A9 → A10 consumers.

**Validation:** `yarn compare:types` + `yarn tsc:compile` + `yarn tsc:compile:consumer` + affected `yarn tests:jest` — no e2e for Phase A.

**Done signal:** Remove config row when shapes match; do not narrow reasons for cosmetic equivalence (reason-narrow reserved for Phase D intractability).

**Deferrals:** UploadTask sync `boolean` stays B3. **A6, A9 deferred** — team consensus before pickup (lean option 1 below).

**Grilling decisions:**
- **A10 (confirmed):** App-level structural assignability for `NativeFirebaseError` → `FirebaseError`, then update callback params in remote-config + storage; remove config rows. Runtime stays `NativeFirebaseError`; SDK drop-in via `FirebaseError`; RN extras via `'namespace' in error` or cast.
- **A6 (user-accepted deferral):** `TaskEvent`/`TaskState` const-vs-literal alignment needs architectural design/human review not available now, so it is a [user-accepted deferral](change-authoring-workflow.md#acceptable-exceptions) — accepted for now and tracked, not closed by documenting convenience drift. Once reviewed, resolve by aligning to the SDK (literal-only) or by recording the rationale (e.g. removing a shipped public const is a breaking change). Do not strip constants before that review.
- **A9 (user-accepted deferral):** Same as A6 for `ValueSource` const vs SDK literal union — accepted and tracked pending architectural review; resolve by SDK alignment or recorded rationale, not convenience.

**Scope (gap-analysis defaults — locked unless revised):** Per-package PR batching; hand-edit firestore-pipelines sources; `compare:types` + tsc + jest, no e2e; ordering A8 infra → A10 app → parallel A1, A2–A4, A5, A7, A8 aliases → A10 consumers (skip A6, A9 until consensus).

**firestore-pipelines:** Hand-edit `packages/firestore/lib/pipelines/*.ts`; no SDK codegen.

---

## Phase B — Tier 2 (moderate / Phase S sync)

**Goal:** Small API additions and async→sync parity where Phase S / PS-S2 already flagged candidates.

### B0 — Grilling (blocking)

**Method:** [Grilling skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md).

**Resolve before B1:**

| Branch | Questions |
| ------ | ----------- |
| Phase S dependency | Block B on `new-architecture` / Phase S merge? Which items require TurboModule sync path? |
| B2 pipelines missing | One export per commit vs batched `documentMatches`+`score`? Native lowering required for each? |
| B7 FetchStatus | Breaking change acceptable for literal rename (`no_fetch_yet` → `no-fetch-yet`)? |
| Native scope | B3/B6 — confirm native can return sync bool / sync Firestore instance today |
| Validation tier | Which B items need `:test-cover` vs compare-types + Jest only? |

**Deliverable:** Phase B Notes; item ordering and `commit_subject` templates per slice.

### Items

| Item | Config / export | Proposed fix |
| ---- | --------------- | ------------ |
| **B1** | firestore-pipelines `constant` `preferIntegers` | Add optional param + wire lowering |
| **B2** | firestore-pipelines 6× `missingInRN` | Implement pipeline expressions/types per [pipeline workflow](../packages/firestore/pipeline-implementation-workflow.md) |
| **B3** | storage `UploadTask` sync methods | Native sync boolean; remove Promise wrapper |
| **B4** | analytics `logEvent` | Phase S sync-void+queue |
| **B5** | app-check `initializeAppCheck` | Phase S sync-void+gate |
| **B6** | firestore `initializeFirestore` | Phase S sync return when settings in-memory |
| **B7** | remote-config `FetchStatus` | Align literals or document permanent native form |
| **B8** | remote-config `getRemoteConfig` | Expose `RemoteConfigOptions` (no-op ok on native?) |
| **B9** | firestore `aggregateFieldEqual` | Export helper if native supports |
| **B10** | firestore `runTransaction` | Wire `maxAttempts` if native supports |

### Phase B Notes

**Gap-analysis (2026-07-03):** Phase S / TurboModule sync infra landed on `new-architecture`. Pipeline queue: compare-types exports were **out of scope until phase R** on `main` — **stale on this branch:** [pipeline coverage queue](../packages/firestore/pipeline-coverage-work-queue.md) shows **K–R complete**, merge gate closed 2026-07-03, **compare-types exports unblocked**.

**Grilling decisions (B0):**
- **B1, B2:** Were deferred until pipeline **R** — **R is complete** on `pipeline-continue-workqueue`; proceed per [pipeline workflow](../packages/firestore/pipeline-implementation-workflow.md).
- **B7:** Reclassify **→ Phase D** — document native `no_fetch_yet`/`throttled` literals (mirror deferred A9).
- **B10:** Reclassify **→ C1** — native `maxAttempts` not wired.
- **B3, B5, B6:** Attempt **JS façade** for compare-types shape (true sync needs Phase S); B3 fix iOS `setTaskStatus` resolve bug if touched.
- **B4:** Analytics registry + `logEvent` sync `void` JS shim.
- **B8, B9:** Quick wins — types/JS only.

**Ordering:** B9 → B8 → B7-doc → B4 → B5/B6 façades → **B1/B2** (unblocked) | defer B3/B10.

**Validation:** B8/B9/B7-doc/B4 — unit-focused (no e2e). B3/B5/B6 if native touched — area-focused + `:test-cover`. B1/B2 — pipeline workflow e2e when unblocked.

**Batching:** Per-package PRs: firestore (B9), remote-config (B8, B7), analytics (B4), storage (B3), app-check (B5), firestore (B6).

**Done signal:** Row removal when fixed; B7 reason-harden only (D treatment).

**Review notes (2026-07-03):** B5/B6 JS façades accepted for compare-types shape — sync return, async native via `void`; true runtime parity awaits Phase S. Follow-up: durable OKF note, `aggregateFieldEqual` unit tests.

---

## Phase C — Tier 3 (hard / structural)

**Goal:** Track large efforts — may spawn sub-queues or ADRs; many rows may remain documented after audit.

### C0 — Grilling (blocking)

**Method:** [Grilling skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md).

**Resolve before C1:**

| Branch | Questions |
| ------ | ----------- |
| C2 wrappers | Generated structural types vs `interface` extends SDK vs status quo? |
| C9 FirebaseApp | Monorepo-wide type unification — prerequisite for C2? |
| Sequencing | C1 missing exports — priority order vs firestore SDK changelog? |
| Out of scope | Confirm C6/C7/C8 are **document-only** for this queue |
| ADR | When does a C item need `okf-bundle/new-architecture/architecture-decisions.md` entry? |

**Deliverable:** Phase C Notes; split C2/C9 into dedicated tracks if needed.

### Items

| Item | Scope | Notes |
| ---- | ----- | ----- |
| **C1** | firestore ~25 `missingInRN` | Local cache, serialization, aggregates — feature work |
| **C2** | firestore wrapper classes | Getters vs properties, `toJSON`, internal members |
| **C3** | firestore settings types | RN-specific `persistence`, log level subset |
| **C4** | firestore cache index APIs | PS-S2: keep-async |
| **C5** | auth platform matrix | Redirect, Recaptcha, credential extraction |
| **C6** | messaging | Native FCM surface — not SDK parity target |
| **C7** | analytics | RN-only methods — not SDK parity target |
| **C8** | ai | Browser APIs — not on RN |
| **C9** | app | `FirebaseApp` type hierarchy |

### Phase C Notes

_(Populated by C0 grilling.)_

---

## Phase D — Tier 4 (document & leave)

**Goal:** Harden `configs/*.ts` reasons; **no product fix** unless grilling reclassifies an item upward.

### D0 — Grilling (blocking)

**Method:** [Grilling skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md).

**Resolve before D1:**

| Branch | Questions |
| ------ | ----------- |
| SDK_VERSION | Remove from modular exports vs keep documented forever? |
| D3 errors | Publish policy doc in OKF for `NativeFirebaseError` branding? |
| Audit bar | **Resolved** — canonical [compare-types justification bar](../../../.github/scripts/compare-types/README.md#justification-bar) / [intractable-limitation bar](change-authoring-workflow.md#acceptable-exceptions-intractable-limitation-bar): evidence-backed platform/toolchain limitation only; convenience drift aligns to firebase-js-sdk. |
| Deliverable | D phase = documentation commits only? |

**Deliverable:** Phase D Notes. Intractability rubric is canonical in the [compare-types justification bar](../../../.github/scripts/compare-types/README.md#justification-bar) — reference it; do not restate.

### Items

| Item | Pattern | Action |
| ---- | ------- | ------ |
| **D1** | `SDK_VERSION` on ~15 packages | Confirm keep + standard reason text |
| **D2** | RN-only helpers (`keepSynced`, FCM, crashlytics, …) | Audit reasons |
| **D3** | Error type branding | Policy: keep native error type in callbacks |
| **D4** | storage emulator mock tokens | Confirm simplified JWT policy |
| **D5** | storage `getStream` | Confirm Node stream vs Web Streams |

### Phase D Notes

_(Populated by D0 grilling.)_

---

## Workflow (each item)

Per [change authoring workflow](change-authoring-workflow.md):

1. **`gap-analysis`** — confirm diff still present (`yarn compare:types`); read SDK `.d.ts` + RN `dist/typescript`.
2. **`implementation`** — fix types/product; **`unit-focused`** or **`area-focused`** per arbiter table.
3. **`independent-review`** — frozen tree; `yarn compare:types` must show row removed or reason updated.
4. **`commit`** — one focused commit; `commit_subject` set before commit ([documentation policy](../documentation-policy.md)).
5. Remove stale config entries when shapes match.

**Grilling items (`*0`):** `gap-analysis` only — no product commits until scope Notes complete and gates on `*0` closed.

---

## Historical notes

- **2026-07-03:** Queue created from repo-wide compare-types gap analysis (19 packages, 411 documented diffs, 0 undoc). Source ranking: fixability tiers 1–4.
