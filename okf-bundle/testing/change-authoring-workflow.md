---
type: Reference
title: Change authoring workflow
description: Canonical cross-package loop for verified product changes — baseline, unit-focused implementation, area-focused review, documentation, commit, and pre-merge validation.
tags: [testing, validation, workflow, implementation, review]
timestamp: 2026-06-26T00:00:00Z
---

# Change authoring workflow

Single source for **how to author and verify a product change** in RNFB (bug fix, feature, parity, coverage). Package workflows add artifacts; work queues add ephemeral gate state — neither restates this loop.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md). **Terms:** [iteration vocabulary](iteration-vocabulary.md).

## Primary loop

```mermaid
flowchart TD
  START([Pick change scope]) --> GA{Need feasibility /<br/>semantics check?}
  GA -->|yes| GAP["gap-analysis<br/>tier: none"]
  GA -->|no| BC{Need before snapshot<br/>or area-focused e2e baseline?}
  GAP --> BC

  BC -->|yes| BASE["baseline-capture<br/>tier: area-focused"]
  BC -->|no| IMPL
  BASE --> IMPL

  IMPL["implementation<br/>tier: unit-focused<br/>Jest + narrow e2e loop"]
  IMPL --> IG{implementation gate<br/>green?}
  IG -->|no| IMPL
  IG -->|yes| REV

  REV["independent-review<br/>tier: area-focused<br/>frozen tree"]
  REV --> RG{review gate<br/>green?}
  RG -->|blocking findings| IMPL
  RG -->|yes| DOC

  DOC{User-facing or<br/>OKF durable updates?}
  DOC -->|yes| DOCS["documentation<br/>tier: none"]
  DOC -->|no| COMMIT
  DOCS --> COMMIT

  COMMIT["commit<br/>tier: none"]
  COMMIT --> PM{Branch ready<br/>to merge?}
  PM -->|yes| FULL["pre-merge-validation<br/>tier: full"]
  PM -->|no| END([Hand off / next item])
  FULL --> END
```

## Work types

| Work type | When | Validation tier | Product edits | Commit |
|-----------|------|-----------------|---------------|--------|
| `gap-analysis` | Unclear feasibility, export shape, platform support | none | read-only | no |
| `baseline-capture` | Need before metrics or area-focused e2e on the item | `area-focused` | harness narrow OK locally | no |
| `implementation` | Author fix/feature + tests | `unit-focused` | yes | no |
| `independent-review` | Verify frozen diff | `area-focused` | no — [frozen tree](#frozen-tree) | no |
| `documentation` | User docs + durable OKF updates | none | docs only | no |
| `commit` | Gates closed for the item | none | staging only | yes |
| `pre-merge-validation` | Branch merge gate | `full` | revert narrowing first | no |

**Commands per work type:** [validation checklist](validation-checklist.md) — link only; do not duplicate here.

## Validation tiers

Tier id strings: [iteration vocabulary § validation tier identifiers](iteration-vocabulary.md#validation-tier-identifiers).

```mermaid
flowchart LR
  subgraph unitFocused ["unit-focused — implementation"]
    F1[Area harness narrowing required]
    F2[Jest + package-scoped tests]
    F3[".only OK locally"]
    F4[Fast e2e subset]
    F5[Never commit narrowing or .only]
  end

  subgraph areaFocused ["area-focused — baseline-capture / independent-review"]
    A1[Area harness narrowing required]
    A2[Full loaded package spec]
    A3[No .only]
    A4[Frozen tree for review]
  end

  subgraph full ["full — pre-merge-validation"]
    P1[Revert all narrowing]
    P2[All modules / full app]
    P3[Once per branch before merge]
  end
```

E2e scope, pre-flight, and harness gate: [running e2e § agent rule](running-e2e.md#agent-rule-read-first) (canonical commands only), [validation tiers](running-e2e.md#e2e-validation-tiers-unit-focused-area-focused-full), [harness narrowing gate](running-e2e.md#harness-narrowing-gate-blocking).

**Command rule:** Agents run **only** [agent command policy](agent-command-policy.md) allowlisted commands for install, prepare, and validation — no improvised `yarn workspace … prepare`, `yarn jet`, or package-scoped build probes.

## Gates

| Gate | Closes when |
|------|-------------|
| `implementation` | `implementation` work type complete — code plus **unit-focused**-tier checks green on **every required platform** when native bridge or embed path changed ([platform coverage gate](running-e2e.md#platform-coverage-gate-blocking)); [static analysis](validation-checklist.md#lint-and-formatting) green on the diff |
| `review` | `independent-review` complete — **area-focused**-tier checks green on frozen tree; applicable [validation checklist](validation-checklist.md) rows green (including static analysis) |
| `commit` | Durable commit exists for the item |

**Trust rule:** Code on disk or in git with `review` still **open** is unverified until `independent-review` closes the gate.

If review finds blocking issues, return to **`implementation`** (`unit-focused`), then repeat **`independent-review`** (`area-focused`).

## Frozen tree

Required for **`independent-review`** and for any `:test-cover` run that closes the **`review`** gate:

- No edits to `packages/**`, `tests/**` (except reverting `.only`), or bundle-affecting OKF docs during the run.
- Wait for or cancel in-flight runs before editing again.

Keep **`implementation`** and **`independent-review`** in separate passes. E2e enforcement during runs: [running e2e § rules](running-e2e.md#rules).

## Host rule

On a shared dev host during change authoring:

- One `:test-cover` at a time — never overlap **unit-focused**-tier and **area-focused**-tier runs.
- Every run starts from [running e2e § pre-flight](running-e2e.md#pre-flight-is-the-host-clear-to-start) (host-clear probes, services, harness tier).
- Use only [canonical e2e commands](running-e2e.md#rules). Stalled runs → [stalled run detection](running-e2e.md#stalled-run-detection).

## `implementation` inner loop

```mermaid
flowchart TD
  P0[Pre-flight: host clear, services, harness tier]
  P1[Edit product code + tests]
  P2[Jest — package or scoped paths]
  P3{Native touched?}
  P3 -->|no| P4[macOS e2e when TS/runtime path]
  P3 -->|yes| P5["native rebuild + platform e2e"]
  P4 --> P6{Green?}
  P5 --> P6
  P6 -->|no| P1
  P6 -->|yes| STATIC[Static analysis — validation checklist § lint]
  STATIC --> DONE([Close implementation gate])
  P0 --> P1
```

**Host rule:** one `:test-cover` at a time; never overlap **unit-focused** and **area-focused** tiers on one host ([§ host rule](#host-rule)).

**Static analysis before handoff:** Before closing the **`implementation`** gate, run the [validation checklist § lint and formatting](validation-checklist.md#lint-and-formatting) rows (`yarn lint:js`; `yarn lint:markdown` / `yarn lint:spellcheck` when docs changed). Fix violations in product code — do not hand off with lint failures. Command list lives only in the checklist; do not duplicate here.

Step detail: [running e2e § unit-focused iteration loop](running-e2e.md#unit-focused-tier-iteration-loop).

<a id="platform-sdk-bridge-contracts"></a>

### Platform SDK bridge contracts (blocking)

Before changing native bridge code that calls a **platform SDK** (Firebase Android/iOS, OS APIs, vendor SDKs, etc.):

1. **Read each platform's official API signature and docs independently** — do not assume Android, iOS, and Web behave the same because the RNFB bridge presents a unified JavaScript surface.
2. **Verify null vs empty string** — many SDKs treat absent values (`null`/`nil`) and empty strings (`""`) differently; map bridge fields to the SDK parameter the docs specify for "absent" values.
3. **Do not apply defensive parity** — fixing platform A does not justify the same change on platform B without checking B's contract (e.g. `@Nullable` vs `nonnull`, optional vs required).
4. **Record evidence** — link or cite the reference URL / header signature in the work queue note or triage report when the fix is native-only on one platform.

<a id="e2e-diagnosis-escalation"></a>

### E2e diagnosis escalation

When **`unit-focused`** e2e fails and product cause is unclear:

1. Confirm [pre-flight](running-e2e.md#pre-flight-is-the-host-clear-to-start) was complete ([prepare completion gate](running-e2e.md#prepare-completion-gate-blocking) when `lib/**` changed, host-clear probes, services, harness overrides, **`RNFBDebug: true`** via overrides).
2. If the **same failure repeats** on back-to-back runs with no assertion progress and the host is known clean → **sub-suite narrow** ([running e2e § fail-fast](running-e2e.md#fail-fast-rnfbdebug-and-sub-suite-narrowing)): one spec file or `describe.only` on the failing band (e.g. aggregate `count()` / `average()` / `sum()` only). Still **unit-focused**; never commit narrowing.
3. If sub-suite runs still fail without actionable assertion text → add **temporary native instrumentation** (NSLog, `adb logcat` tags, etc.) on the code path under test; use [running e2e § diagnosing hangs](running-e2e.md#diagnosing-hangs) for log commands. **Remove instrumentation before `commit`** and before **`area-focused`** gate closure on a frozen tree.
4. Do not treat Jet WS disconnect / orchestration timeout alone as product failure — [stalled run detection](running-e2e.md#stalled-run-detection) and pre-flight recovery first.

This escalation applies to **any** change authoring item, not only namespace removal. Work queues record outcomes; they do not restate this loop.

## `independent-review`

On a **frozen tree**:

1. Revert all `.only`.
2. Keep area narrowing; run **area-focused**-tier e2e for loaded package spec(s) on [**every required platform**](running-e2e.md#platform-coverage-gate-blocking) (serial; pre-flight each run).
3. Run applicable [validation checklist](validation-checklist.md) rows — **blocking:** [static analysis § lint and formatting](validation-checklist.md#lint-and-formatting) (`yarn lint:js` on the frozen tree; markdown/spellcheck when docs touched); `yarn reference:api` when public surface changed. For packages registered in `compare:types`, `yarn compare:types` is a **blocking review gate**: the touched package must have zero undocumented or stale differences before `review_gate` closes. If the global command fails on unrelated registered packages, record/fix that drift in the work queue; do not treat an unrelated failure as permission to skip the touched package's type-parity check.
4. If the package workflow requires coverage: [coverage design § completion signal](coverage-design.md#coverage-as-completion-signal).
5. Outcome closes **review gate** or returns to **`implementation`**.

Keep **`implementation`** and **`independent-review`** in separate passes ([§ frozen tree](#frozen-tree)).

## Harness narrowing

**Before the first `:test-cover` at `unit-focused` or `area-focused` tier:** create local [`tests/harness.overrides.js`](../../tests/harness.overrides.example.js) even when the branch commit has full harness — [running e2e § local harness overrides](running-e2e.md#local-harness-overrides-harnessoverridesjs). Set `modules` to the package area and **`RNFBDebug: true`**. Full app load is **`full`** tier only (delete overrides file).

| Kind | `implementation` (**unit-focused**) | `independent-review` (**area-focused**) | `pre-merge-validation` (**full**) | `commit` |
|------|-------------------------------------|------------------------------------------|-----------------------------------|----------|
| **Area narrowing** | Required before `:test-cover` (overrides file) | Required before `:test-cover` | Delete overrides — all modules | Never commit overrides |
| **`RNFBDebug: true`** | Required in overrides before `:test-cover` | Required in overrides before `:test-cover` | Delete overrides / `false` | Never |
| **Single-test** (`.only`) | Allowed (diagnosis) | Revert | Revert | Never |
| **Single-suite** (`describe.only` / one spec file) | Allowed (diagnosis only — [escalation](#e2e-diagnosis-escalation)) | Revert | Revert | Never |

Package workflows define **which module/spec** to load (e.g. Firestore → [pipeline implementation workflow § narrowing](../packages/firestore/pipeline-implementation-workflow.md#pipeline-area-harness)).

**Sanity check:** pass counts must match loaded scope — not full-app totals ([running e2e § gate](running-e2e.md#harness-narrowing-gate-blocking)).

## `commit`

- One focused commit per item when gates close.
- **Never stage:** `tests/harness.overrides.js`, any `.only`, temporary sub-suite edits in `tests/app.js`, or native instrumentation ([running e2e § before merge](running-e2e.md#before-merge-pr-handoff), [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking)).
- **Work queue:** before `git commit`, set the row's `commit_subject` to the commit's subject line, close `commit_gate`, and stage the queue doc **in the same commit** as the product change ([documentation policy § work queues](../documentation-policy.md#work-queue-documents)). Do not record SHAs in queue docs.

```bash
git status
git diff --stat
rg '\.only\(' packages/
```

## Package extensions

| Package / area | Adds to this loop |
|----------------|-------------------|
| Firestore Pipelines | Compare-types gap pick, serialization matrix, `Pipeline.e2e.js` setup, coverage snapshots — [pipeline implementation workflow](../packages/firestore/pipeline-implementation-workflow.md) |
| TurboModule migration | Spec inventory, codegen commit, New Architecture harness, multi-module spec split — [turbomodule implementation workflow](../new-architecture/turbomodule-implementation-workflow.md) |
| Other packages | `okf-bundle/packages/<pkg>/` index when a workflow exists |

Ephemeral coordination (gate rows, `next_work_type`, `commit_subject`): **work queues only** — not part of this workflow.

## Related docs

| Topic | Document |
|-------|----------|
| Term ids and queue field schema | [iteration-vocabulary.md](iteration-vocabulary.md) |
| E2e commands | [running-e2e.md](running-e2e.md) |
| Validation commands | [validation-checklist.md](validation-checklist.md) |
| Coverage policy | [coverage-design.md](coverage-design.md) |
