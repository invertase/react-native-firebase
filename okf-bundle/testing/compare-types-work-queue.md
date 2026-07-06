---
type: Reference
title: Compare-types parity work queue
description: Phased backlog to reduce documented compare-types drift between firebase-js-sdk and @react-native-firebase/* — ranked by fixability.
tags: [testing, compare-types, types, parity, work-queue]
timestamp: 2026-07-03T00:00:00Z
---

# Compare-types parity — work queue

> **IN PROGRESS:** iOS Storage upload pause/resume diagnosis (B3.1); iOS E2E temporarily skips that test.
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
| **B** | 2 — Moderate | Small product work + TurboModule sync candidates |
| **C** | 3 — Hard | Large implementation or structural wrapper typing |
| **D** | 4 — Document | Intentional drift — audit & harden config reasons only |

Each phase starts with item `<phase>0` `gap-analysis` / scope review — use decision branches until scope, ordering, fix-vs-document, and validation tier per item are locked.

---

## Resume checklist

Before any item's `implementation`:

1. `yarn && yarn lerna:prepare` when `packages/*/lib/**` touched ([agent command policy](agent-command-policy.md)).
2. `yarn compare:types` — item closes only when its config row(s) removed or reason updated with intractability bar ([validation checklist § API reference](validation-checklist.md#api-reference-and-type-parity)).
3. Package-scoped: `yarn tsc:compile`, `yarn tsc:compile:consumer`, affected `yarn tests:jest` — full checklist when types touch public exports.
4. E2e only when native/runtime behaviour changes ([change authoring § work types](change-authoring-workflow.md#work-types)).

**Deprecated SDK exports (batch rule):** When a `missingInRN` export is **already deprecated in firebase-js-sdk**, RNFB will **not** implement it. Accept the gap; harden the compare-types config `reason` to: *"Deprecated in firebase-js-sdk; React Native Firebase will not implement."* Process in **Phase D** (config-only), not Phase C implementation.

---

## Phase table

| Phase | Focus | Status | Outcome |
| ----- | ----- | ------ | ------- |
| **A** | Tier 1 — types/docs only | **partial** | A1–A5, A7–A8, A10 committed; A6/A9 deferred |
| **B** | Tier 2 — moderate / sync conversion | **complete** | B1–B9 committed (B3 ✅ 2026-07-05) |
| **C** | Tier 3 — hard / structural | **in progress** | C1.1 ✅ committed; C1.2 ✅ committed; C1.2b documented |
| **D** | Tier 4 — document intractable | **queued** | — |

---

## Current snapshot

**Label:** `ios-storage-upload-pause-diagnosis-2026-07-06`

**Next item:** B3.1 — local iOS e2e + CI `sim-app.log` review for upload pause/resume failure.

**Current gates:** B3.1 open (diagnosis). C1.1, C1.2, C1.2b and PMR-1 closed.

---

## Item arbiter

| Item | Package / scope | `commit_subject` | `implementation_gate` | `review_gate` | `commit_gate` | `next_work_type` | `validation_tier` | Notes |
| ---- | --------------- | ---------------- | ----------------------- | ------------- | ------------- | ---------------- | ------------------- | ----- |
| **A0** | Phase A scope | `fix(types): align compare-types modular API with firebase-js-sdk` | closed | closed | closed | — | `none` | Scope review closed 2026-07-03 — see [Phase A Notes](#phase-a-notes) |
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
| **B0** | Phase B scope | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `none` | Gap-analysis + scope decisions 2026-07-03 — see [Phase B Notes](#phase-b-notes) |
| **B1** | firestore-pipelines | `refactor(firestore/pipelines): add constant preferIntegers option` | closed | closed | closed | — | `area-focused` | Re-review green 2026-07-04: parser integerLiteral iOS/Android, preferIntegers e2e, sdk-compat; macOS 147 / iOS 152 / Android 152 |
| **B2** | firestore-pipelines | `feat(firestore/pipelines): expose search stage and pipeline expressions` | closed | closed | closed | — | `area-focused` | 6× `missingInRN` cleared; macOS 150/150; iOS/Android 155/155; firebase-tools 15.22.4; search index verify cycle. Follow-up: dropped RN-only `Type` export → pipelines 0 documented diffs |
| **B3** | storage | `refactor!(storage): sync UploadTask pause resume cancel booleans` | closed | closed | closed | — | `area-focused` | Committed 2026-07-05: sync `setTaskStatus` boolean; mid-transfer e2e; iOS upload-cancel skip — user-accepted + [firebase-ios-sdk#16353](https://github.com/firebase/firebase-ios-sdk/issues/16353); iOS upload pause/resume e2e temporarily skipped 2026-07-06 (CI failure — see B3.1) |
| **B3.1** | storage / iOS | `test(storage, ios): temporarily skip upload pause/resume testing` | open | open | open | `implementation` | `area-focused` | CI iOS debug+release fail `successfully pauses and resumes an upload` ([storage/unknown], ~50s); Android/macOS pass. **Local:** re-run `StorageTask.e2e.js` on iOS with test unskipped + `RNFBDebug`; capture `xcrun simctl spawn booted log stream` / native `NSError`. **CI:** `RNFB_SIM_LOG_STDOUT=1` + widened sim log predicate; review `sim-app.log` artifact on [Testing E2E iOS](https://github.com/invertase/react-native-firebase/actions/workflows/tests_e2e_ios.yml) runs before root-cause call |
| **C1.1** | firestore | `feat(firestore): support TransactionOptions maxAttempts in runTransaction` | closed | closed | closed | — | `area-focused` | Committed 2026-07-05: TransactionOptions + runTransaction maxAttempts; e2e Transaction 20/20 iOS+Android |
| **B4** | analytics | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `unit-focused` | logEvent sync void |
| **B5** | app-check | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `area-focused` | initializeAppCheck sync AppCheck |
| **B6** | firestore | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `area-focused` | initializeFirestore sync Firestore |
| **B7** | remote-config | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `unit-focused` | FetchStatus native literals documented |
| **B8** | remote-config | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `unit-focused` | RemoteConfigOptions on getRemoteConfig |
| **B9** | firestore | `refactor!(types): align modular APIs with firebase-js-sdk sync signatures` | closed | closed | closed | — | `unit-focused` | aggregateFieldEqual exported |
| **C0** | Phase C scope | — | open | open | open | `gap-analysis` | `none` | [Scope review](#phase-c--tier-3-hard--structural) |
| **C1.2** | firestore | `feat(firestore): export aggregateQuerySnapshotEqual for SDK parity` | closed | closed | closed | — | `unit-focused` | Committed 2026-07-05: pure JS helper; jest 315/315 |
| **C1.2b** | firestore | — | closed | closed | closed | — | `none` | User-accepted: FieldValue `maximum`/`minimum` — iOS Firebase Firestore 12.15.0 lacks APIs; config hardened 2026-07-05 |
| **PMR-1** | pre-merge review remediation | `fix(firestore): validate TransactionOptions maxAttempts` | closed | closed | closed | — | `area-focused` | Review green: markdown/docs/config/runtime findings fixed; validation evidence recorded below |
| **C1.3** | firestore | — | open | open | open | — | `none` | Local-cache config (15 exports) — **document-only** (Phase D): web/N/A on native |
| **C1.4** | firestore | — | open | open | open | — | `none` | Snapshot serialization (3 exports) — **document-only** (Phase D): web-only |
| **C1.5** | firestore | — | open | open | open | — | `none` | Index config (4 exports) — **document-only** (Phase D): deprecated in firebase-js-sdk; RNFB will not implement |
| **C1.6** | firestore | — | open | open | open | — | `none` | IndexedDB persistence (2 exports) — **document-only** (Phase D): deprecated in firebase-js-sdk; RNFB will not implement |
| **C1.7** | firestore | — | open | open | open | — | `none` | `FirestoreErrorCode` — **document-only** (Phase D): D3 error-branding policy |
| **C2** | firestore | — | open | open | open | — | `none` | Wrapper shapes: `DocumentReference`, `Firestore`, snapshots, `Transaction` |
| **C3** | firestore | — | open | open | open | — | `unit-focused` | `FirestoreSettings.persistence`, `LogLevel` subset |
| **C4** | firestore | — | open | open | open | — | `none` | Persistent cache index APIs — keep-async (PS-S2) |
| **C5** | auth | — | open | open | open | — | `area-focused` | Redirect flows, `credentialFromResult`, Recaptcha |
| **C6** | messaging | — | open | open | open | — | `none` | Native FCM vs web push (53 diffs) |
| **C7** | analytics | — | open | open | open | — | `none` | RN-only native APIs (80 extra exports) |
| **C8** | ai | — | open | open | open | — | `none` | Browser-only audio/Web APIs |
| **C9** | app (+ consumers) | — | open | open | open | — | `none` | `ReactNativeFirebase.FirebaseApp` extends SDK `FirebaseApp` |
| **C10** | Native sync conversion (ex-JS façades) | — | open | open | open | — | `none` | Gap-analysis 2026-07-05 — follow-up to B4/B5/B6 façades + PS-S2 `needs-native-change`; see [C10 sub-items](#c10--native-sync-conversion-ex-js-façades) |
| **C10.1** | storage | — | open | open | open | `implementation` | `area-focused` | `setMaxOperationRetryTime`, `setMaxUploadRetryTime` — spec `Promise<void>` → `void`; native already sync in-memory |
| **C10.2** | analytics | — | open | open | open | `implementation` | `unit-focused` | B4 `logEvent` native follow-up + 5 setters — ordered serial analytics queue; clears 5× `differentShape` setter rows |
| **C10.3** | app-check | — | open | open | open | `implementation` | `area-focused` | B5 `initializeAppCheck` follow-up — sync-void+gate; provider configured before return |
| **C10.4** | firestore | — | open | open | open | `implementation` | `area-focused` | B6 `initializeFirestore` follow-up — sync-void+gate; in-memory settings registry before return |
| **D0** | Phase D scope | — | open | open | open | `gap-analysis` | `none` | [Scope review](#phase-d--tier-4-document--leave) |
| **D1** | all packages | — | open | open | open | — | `none` | `SDK_VERSION` extra exports — policy |
| **D2** | database, perf, … | — | open | open | open | — | `none` | RN-only native helpers |
| **D3** | cross-cutting | — | open | open | open | — | `none` | Error branding: keep vs unify |
| **D4** | storage | — | open | open | open | — | `none` | `EmulatorMockTokenOptions` simplification |
| **D5** | storage | — | open | open | open | — | `none` | `getStream` → `NodeJS.ReadableStream` |

---

## PMR-1 Notes

Pre-merge remediation completed 2026-07-05. Findings fixed: markdown table formatting, Firestore compare-types rationale hardening, public OKF wording/state, transaction `maxAttempts` validation, user-facing v26 migration labels, and stale pipeline compatibility rows.

| Command | Exit code | Evidence |
| ------- | --------- | -------- |
| `yarn lerna:prepare` | 0 | 20 packages prepared |
| `yarn tsc:compile` | 0 | Root TypeScript compile green |
| `yarn compare:types` | 0 | Registered package parity documented, no stale entries |
| `yarn lint:js` | 0 | JS/TS lint green |
| `yarn lint:markdown` | 0 | Prettier markdown check green |
| `yarn tests:jest --watchman=false packages/firestore/__tests__/runTransaction.test.ts` | 0 | 1 suite, 4 tests passed |
| `git diff --check` | 0 | Independent remediation review |
| OKF consistency scan | green | Canonical ownership, DRY, links, and durability pass |

---

## Phase A — Tier 1 (types/docs only)

**Goal:** Remove or shrink `differentShape` rows with **TypeScript-only** changes; no native bridge edits.

### A0 — Scope Review (blocking)

**Method:** `gap-analysis` with decision branches for scope, order, fix-vs-document, validation tier, and done signal.

**Resolve before A1:**

| Branch | Questions |
| ------ | ----------- |
| Scope | Batch one PR per package vs one PR per item? Any items defer to B/C? |
| A10 cross-cutting | Single `NativeFirebaseError` structural fix vs per-package callback types? |
| firestore-pipelines | Declaration-only fixes — regenerate from SDK or hand-edit `.d.ts`? |
| Validation | Is `yarn compare:types` + tsc sufficient for all A items, or any need e2e? |
| Ordering | Strict A1→A10 or parallel by package after scope review? |
| Done signal | Config entry **removed** vs **reason narrowed** — rubric for “cosmetic equivalent”? |

**Deliverable:** Phase A **Notes** below updated with decisions; `A0` gates closed; `next_work_type` on A1 set to `implementation`.

### Items

| Item | Config / export | Current reason (summary) | Proposed fix |
| ---- | --------------- | ------------------------ | ------------ |
| **A1** ✅ | firestore `onSnapshotsInSync` | Cosmetic callback signatures; behaviour equivalent | Align `next`/`error` types to SDK |
| **A2** ✅ | firestore-pipelines `StageOptions`, `ExpressionType`, `timestampDiff` | Declaration ordering/format only | Match SDK declaration file |
| **A3** ✅ | firestore-pipelines `TimeGranularity` | Lowercase `isoweek`/`isoyear` literals aligned | Match SDK literals |
| **A4** ✅ | firestore-pipelines `isType` | RN `Type` alias vs SDK `string` | Widen param type |
| **A5** ✅ | storage `uploadBytes`, `uploadBytesResumable` | `TaskResult`/`Task` aliases identical at runtime | Rename to SDK export names |
| **A6** ❓ | storage `TaskEvent`, `TaskState` | const object vs string-literal union | Export SDK-style literals |
| **A7** ✅ | app-check `AppCheckTokenListener` | Missing type re-export | Re-export SDK alias |
| **A8** ✅ | functions `FunctionsError`, `FunctionsErrorCodeCore` | RN uses `HttpsError` at runtime | Thin re-export or alias |
| **A9** ❓ | remote-config `ValueSource` | const object vs type alias | Add SDK-style type alias |
| **A10** ✅ | remote-config, storage, … callbacks | `NativeFirebaseError` vs `FirebaseError` | Structural assignability or unified callback error type |

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

**Scope decisions:**
- **A10 (confirmed):** App-level structural assignability for `NativeFirebaseError` → `FirebaseError`, then update callback params in remote-config + storage; remove config rows. Runtime stays `NativeFirebaseError`; SDK drop-in via `FirebaseError`; RN extras via `'namespace' in error` or cast.
- **A6 (user-accepted deferral):** `TaskEvent`/`TaskState` const-vs-literal alignment needs architectural design/human review not available now, so it is a [user-accepted deferral](change-authoring-workflow.md#acceptable-exceptions) — accepted for now and tracked, not closed by documenting convenience drift. Once reviewed, resolve by aligning to the SDK (literal-only) or by recording the rationale (e.g. removing a shipped public const is a breaking change). Do not strip constants before that review.
- **A9 (user-accepted deferral):** Same as A6 for `ValueSource` const vs SDK literal union — accepted and tracked pending architectural review; resolve by SDK alignment or recorded rationale, not convenience.

**Scope (gap-analysis defaults — locked unless revised):** Per-package PR batching; hand-edit firestore-pipelines sources; `compare:types` + tsc + jest, no e2e; ordering A8 infra → A10 app → parallel A1, A2–A4, A5, A7, A8 aliases → A10 consumers (skip A6, A9 until consensus).

**firestore-pipelines:** Hand-edit `packages/firestore/lib/pipelines/*.ts`; no SDK codegen.

---

## Phase B — Tier 2 (moderate / sync conversion)

**Goal:** Small API additions and async→sync parity where TurboModule sync analysis already flagged candidates.

### B0 — Scope Review (blocking)

**Method:** `gap-analysis` with decision branches for dependencies, native scope, validation tier, and batching.

**Resolve before B1:**

| Branch | Questions |
| ------ | ----------- |
| Sync dependency | Block B on `new-architecture` / sync-infra merge? Which items require TurboModule sync path? |
| B2 pipelines missing | One export per commit vs batched `documentMatches`+`score`? Native lowering required for each? |
| B7 FetchStatus | Breaking change acceptable for literal rename (`no_fetch_yet` → `no-fetch-yet`)? |
| Native scope | B3/B6 — confirm native can return sync bool / sync Firestore instance today |
| Validation tier | Which B items need `:test-cover` vs compare-types + Jest only? |

**Deliverable:** Phase B Notes; item ordering and `commit_subject` templates per slice.

### Items

| Item | Config / export | Proposed fix |
| ---- | --------------- | ------------ |
| **B1** ✅ | firestore-pipelines `constant` `preferIntegers` | Add optional param + wire lowering |
| **B2** ✅ | firestore-pipelines 6× `missingInRN` | Implement pipeline expressions/types per [pipeline workflow](../packages/firestore/pipeline-implementation-workflow.md) |
| **B3** ✅ | storage `UploadTask` sync methods | Native sync TurboModule: spec `setTaskStatus` → `boolean`, codegen regen, iOS resolve fix; breaking-change queue |
| **B4** ✅ | analytics `logEvent` | TurboModule sync-void queue |
| **B5** ✅ | app-check `initializeAppCheck` | TurboModule sync-void gate |
| **B6** ✅ | firestore `initializeFirestore` | TurboModule sync return when settings in-memory |
| **B7** ✅ | remote-config `FetchStatus` | Align literals or document permanent native form |
| **B8** ✅ | remote-config `getRemoteConfig` | Expose `RemoteConfigOptions` (no-op ok on native?) |
| **B9** ✅ | firestore `aggregateFieldEqual` | Export helper if native supports |

### Phase B Notes

**Gap-analysis (2026-07-03):** TurboModule sync infra landed on `new-architecture`. Pipeline queue: compare-types exports were **out of scope until phase R** on `main` — **stale on this branch:** [pipeline coverage queue](../packages/firestore/pipeline-coverage-work-queue.md) shows **K–R complete**, merge gate closed 2026-07-03, **compare-types exports unblocked**.

**Scope decisions (B0):**
- **B1, B2:** Were deferred until pipeline **R** — **R is complete** on `pipeline-continue-workqueue`; proceed per [pipeline workflow](../packages/firestore/pipeline-implementation-workflow.md).
- **B7:** Reclassify **→ Phase D** — document native `no_fetch_yet`/`throttled` literals (mirror deferred A9).
- **B10:** Moved to **C1.1** (2026-07-05 gap-analysis) — `TransactionOptions` + `runTransaction` `maxAttempts`.
- **B3:** Native sync TurboModule shipped; mid-transfer e2e enabled (8 MB fixture). iOS upload-cancel `it.skip` — user-accepted platform gap (FirebaseStorage 12.15.0); upstream [firebase-ios-sdk#16353](https://github.com/firebase/firebase-ios-sdk/issues/16353) filed 2026-07-05; related 750ms pause workaround since 2019-05-03 (RNFB #2043). iOS upload pause/resume e2e skipped 2026-07-06 pending B3.1 diagnosis (CI `[storage/unknown]`; download pause/resume still passes on iOS).
- **B5, B6:** JS façade shipped for compare-types shape (true sync deferred where applicable).
- **B4:** Analytics registry + `logEvent` sync `void` JS shim.
- **B8, B9:** Quick wins — types/JS only.

**Ordering:** B9 → B8 → B7-doc → B4 → B5/B6 façades → **B1/B2** (done) | **B3** (coverage follow-up, then delta review + commit) | B10 → C1.1.

**Validation:** B8/B9/B7-doc/B4 — unit-focused (no e2e). B3 — **unit-focused** storage `:test-cover` after coverage edits (then delta **area-focused** review). B1/B2 — pipeline workflow e2e (done).

**Batching:** Per-package PRs: storage (B3), firestore C1.1+.

**Done signal:** Row removal when fixed; B7 reason-harden only (D treatment).

**Review notes (2026-07-03):** B5/B6 JS façades accepted for compare-types shape — sync return, async native via `void`. B3 is the exception: ship true native sync via TurboModule in breaking-change window.

---

## Phase C — Tier 3 (hard / structural)

**Goal:** Track large efforts — may spawn sub-queues or ADRs; many rows may remain documented after audit.

### C0 — Scope Review (blocking)

**Method:** `gap-analysis` with decision branches for structural items, document-only items, out-of-scope packages, and architecture-decision needs.

**Resolve before C1.1:**

| Branch | Questions |
| ------ | ----------- |
| C2 wrappers | Generated structural types vs `interface` extends SDK vs status quo? |
| C9 FirebaseApp | Monorepo-wide type unification — prerequisite for C2? |
| C1.3–C1.7 document-only | Confirm accepted gaps move to Phase D with hardened config reasons (see [deprecated SDK batch rule](#resume-checklist))? |
| Out of scope | Confirm C6/C7/C8 are **document-only** for this queue |
| ADR | When does a C item need `okf-bundle/new-architecture/architecture-decisions.md` entry? |

**Deliverable:** Phase C Notes; C1 gap-analysis complete (2026-07-05) — see [Phase C Notes](#phase-c-notes).

### C1 — firestore `missingInRN` sub-items

Gap-analysis 2026-07-05: 30 `missingInRN` entries + `differentShape: runTransaction` (ex-B10). Of these, **~5 are implementable**; **~24–25 reclassify to Phase D** (web-only, deprecated, or blocked-on-native-sdk).

| Item | Exports | Verdict | Proposed fix |
| ---- | ------- | ------- | ------------ |
| **C1.1** ✅ | `TransactionOptions`, `runTransaction` | **implement** | Wire `maxAttempts` through JS → `transactionBegin` → native `runTransactionWithOptions` / `TransactionOptions` |
| **C1.2** ✅ | `aggregateQuerySnapshotEqual` | **implement** | Pure JS equality helper (mirror B9 `aggregateFieldEqual`) |
| **C1.2b** ✅ | `maximum`, `minimum` | **document-only** | FieldValue set/update sentinels — user-accepted gap; iOS SDK lacks APIs; see Phase C Notes |
| **C1.3** ❓ | Local-cache factories + 9 types (15 exports) | **document-only** | Web/local-cache API; RN uses native `persistence`/`cacheSizeBytes` — accept gap (Phase D) |
| **C1.4** ❓ | `documentSnapshotFromJSON`, `querySnapshotFromJSON`, `onSnapshotResume` | **document-only** | Web-only serialization API — accept gap (Phase D) |
| **C1.5** ❓ | `setIndexConfiguration`, `Index`, `IndexConfiguration`, `IndexField` | **document-only** | **Deprecated in firebase-js-sdk; RNFB will not implement** — harden config reason (Phase D) |
| **C1.6** ❓ | `enableIndexedDbPersistence`, `enableMultiTabIndexedDbPersistence` | **document-only** | **Deprecated in firebase-js-sdk; RNFB will not implement** — harden config reason (Phase D) |
| **C1.7** ❓ | `FirestoreErrorCode` | **document-only** | Type union; align with D3 `NativeFirebaseError` branding — accept gap (Phase D) |

**Ordering (fixability-first):** C1.1 → C1.2 → C1.3–C1.7 / C1.2b (Phase D config commits, batched where sensible).

### Other Phase C items

| Item | Scope | Notes |
| ---- | ----- | ----- |
| **C2** | firestore wrapper classes | Getters vs properties, `toJSON`, internal members |
| **C3** | firestore settings types | RN-specific `persistence`, log level subset |
| **C4** | firestore cache index APIs | PS-S2: keep-async; `PersistentCacheIndexManager` differentShape |
| **C5** | auth platform matrix | Redirect, Recaptcha, credential extraction |
| **C6** | messaging | Native FCM surface — not SDK parity target |
| **C7** | analytics | RN-only methods — not SDK parity target |
| **C8** | ai | Browser APIs — not on RN |
| **C9** | app | `FirebaseApp` type hierarchy |

### C10 — native sync conversion (ex-JS façades)

Gap-analysis 2026-07-05: replace Phase B compare-types façades (B4/B5/B6) and remaining PS-S2 `needs-native-change` rows with **true TurboModule sync**. **Out of scope:** B3 (`UploadTask` — in flight); C4 cache-index APIs (**keep-async**).

| Item | Exports / scope | Verdict | Proposed fix |
| ---- | --------------- | ------- | ------------ |
| **C10.1** | storage `setMaxOperationRetryTime`, `setMaxUploadRetryTime` | **implement** | Spec → `void`; regen codegen; drop Promise wrappers (native SDK calls already sync) |
| **C10.2** | analytics `logEvent` (B4 follow-up) + 5 setters | **implement** | Ordered serial native queue; spec `Promise<void>` → `void`; modular + namespace sync `void` |
| **C10.3** | app-check `initializeAppCheck` (B5 follow-up) | **implement** | Spec `configureProvider` → `void`; sync-void+gate — provider state before return |
| **C10.4** | firestore `initializeFirestore` / `settings` (B6 follow-up) | **implement** (gate design) | Spec `settings` → `void`; in-memory settings registry visible before return |

**Ordering:** C10.1 → C10.2 → C10.3 → C10.4 (after B3; C10.1 shares storage spec/codegen with B3 but different methods).

### Phase C Notes

**C1.2b analysis (2026-07-05, user-accepted):** Compare-types `maximum`/`minimum` are **FieldValue set/update sentinels** (`maximum(n: number): FieldValue` in firebase-js-sdk **12.15.0**), not aggregate-query helpers. **iOS Firebase Firestore 12.15.0** — `FIRFieldValue` public API has no maximum/minimum factories ([iOS reference](https://firebase.google.com/docs/reference/ios/firebasefirestore/api/reference/Classes/FIRFieldValue)). **Android Firebase Firestore BOM 34.15.0** — `FieldValue.maximum`/`minimum` exist for set/update ([Android reference](https://firebase.google.com/docs/reference/android/com/google/firebase/firestore/FieldValue)) but RNFB serialization (`RNFBFirestoreSerialize.m` / `ReactNativeFirebaseFirestoreSerialize.java`) does not wire them. Cross-platform parity deferred until iOS SDK exposes the APIs.

**C1 gap-analysis (2026-07-05):** … Bulk of C1 is **accepted platform drift** — **document-only in Phase D** (C1.2b iOS-native-limited; C1.3–C1.6 web/deprecated; C1.7 D3 error-branding). Deprecated-in-SDK exports (C1.5, C1.6) use the batch rule: *"Deprecated in firebase-js-sdk; React Native Firebase will not implement."*

**C10 gap-analysis (2026-07-05):** B4/B5/B6 closed compare-types with `void native.X()` façades while native remains async. Three shipped façades + seven still-`Promise` exports (analytics setters, storage retry setters) need native follow-up. B5/B6 config rows already removed — C10.3/C10.4 completion = behavioral correctness, not config row removal. C10.2 clears 5 analytics setter `differentShape` rows.

**Validation:** C1.1 — area-focused + `:test-cover`. C1.2 — unit-focused. C10.1 — area-focused storage. C10.2 — unit-focused + analytics ordering e2e. C10.3/C10.4 — area-focused. C1.3–C1.7 / C1.2b — documentation-only when moved to D.

---

## Phase D — Tier 4 (document & leave)

**Goal:** Harden `configs/*.ts` reasons; **no product fix** unless `gap-analysis` reclassifies an item upward.

### D0 — Scope Review (blocking)

**Method:** `gap-analysis` with decision branches for keep/remove policy, error branding, and audit deliverables.

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

_(Populated by D0 gap-analysis.)_

---

## Workflow (each item)

Per [change authoring workflow](change-authoring-workflow.md):

1. **`gap-analysis`** — confirm diff still present (`yarn compare:types`); read SDK `.d.ts` + RN `dist/typescript`.
2. **`implementation`** — fix types/product; **`unit-focused`** or **`area-focused`** per arbiter table.
3. **`independent-review`** — frozen tree; `yarn compare:types` must show row removed or reason updated.
4. **`commit`** — one focused commit; `commit_subject` set before commit; [validation evidence package](validation-checklist.md#validation-evidence-package) recorded ([documentation policy](../documentation-policy.md)).
5. Remove stale config entries when shapes match.

**Scope-review items (`*0`):** `gap-analysis` only — no product commits until scope Notes complete and gates on `*0` closed.

---

## Historical notes

- **2026-07-03:** Queue created from repo-wide compare-types gap analysis (19 packages, 411 documented diffs, 0 undoc). Source ranking: fixability tiers 1–4.
