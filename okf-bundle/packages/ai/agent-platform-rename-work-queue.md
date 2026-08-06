---
type: Reference
title: Agent Platform rename work queue
description: Ephemeral gates for renaming Vertex AI backend naming to Agent Platform in @react-native-firebase/ai (CPRN-293).
tags: [ai, agent-platform, vertex-ai, work-queue]
timestamp: 2026-08-05T00:00:00Z
---

# Agent Platform rename — work queue

> **COMPLETE (2026-08-06):** A0 Agent Platform rename ready to land. All gates closed.
> **Next pickup:** — (queue item complete)

Ephemeral tracker; see [OKF policy](../../documentation-policy.md). Work types / tiers / gate field ids: [iteration vocabulary](../../testing/iteration-vocabulary.md). **Loop, gates, host rule, harness:** [change authoring workflow](../../testing/change-authoring-workflow.md). **Agent commands:** [agent command policy](../../testing/agent-command-policy.md) only.

---

## Current snapshot

| Item | Status | `next_work_type` | `validation_tier` | Notes |
|------|--------|------------------|-------------------|-------|
| **A0** Agent Platform backend rename | **complete** | — | — | All gates closed. `commit_subject`: `feat(ai): rename Vertex AI backend to agentPlatform` |

## Current gates

| Item | `implementation_gate` | `review_gate` | `commit_gate` | `commit_subject` |
|------|-----------------------|---------------|---------------|------------------|
| A0 | **closed** | **closed** | **closed** | `feat(ai): rename Vertex AI backend to agentPlatform` |

### Delta review evidence (2026-08-06, [delta reviewer](b05ec1e0-ce66-421e-b2bd-542d44262083))

Verdict: **approve** (no remaining findings). Prior minors fixed; `backend.ts` 100%; lib unchanged; prior area e2e re-cited.

| Check | Exit | Result | Log |
|-------|------|--------|-----|
| Jest backend + coverage | 0 | 12 pass; backend.ts 100% | `/tmp/rnfb-jest-a0-delta-review.log`, `/tmp/rnfb-jest-coverage-a0-delta-review.log` |
| lint:js | 0 | Pass | `/tmp/rnfb-lintjs-a0-delta-review.log` |
| e2e 3-platform | 0 | 35/40/40 (re-cited; test-only delta) | `/tmp/rnfb-e2e-*-a0-review.log` |

`review_gate` → **closed**. `next_work_type` → `documentation` then `commit`.

### Review evidence (2026-08-06, [A0 reviewer](2ad8803e-b308-429b-97df-bee0f001acf0))

Verdict: **approve with minors** (validation green; coverage gap blocks `review_gate`).

| Check | Exit | Result | Log |
|-------|------|--------|-----|
| lint/tsc/deps/compare/Jest | 0 | Pass (24/345) | `/tmp/rnfb-*-a0-review.log` |
| e2e macOS / iOS / Android | 0 | 35 / 40 / 40 pass | `/tmp/rnfb-e2e-{macos,ios,android}-a0-review.log` |
| Harness | — | `['app','ai']` + RNFBDebug; deleted after | — |

**Findings (must fix before review_gate close):**

| Sev | Finding | Plan |
|-----|---------|------|
| **minor** | `GoogleAIBackend` / `VertexAIBackend` `_getTemplatePath` (`backend.ts` L81, L130) uncovered | Add unit asserts in `backend.test.ts` |
| **nit** | Vertex `_getModelPath` only indirect via request tests | Optional assert alongside template path |
| **nit** | `count-tokens` switch names VERTEX only | Optional clarity; AGENT_PLATFORM falls through like JS SDK |

`next_work_type` → `implementation` (remediation), `validation_tier` → `unit-focused`.

### Remediation evidence (2026-08-06, [remediator](1f515a57-fc67-4f82-8430-a2854ae07799))

| Check | Exit | Result | Log |
|-------|------|--------|-----|
| Jest `backend.test.ts` + `packages/ai/__tests__` | 0 | 23 suites / 342 tests | `/tmp/rnfb-jest-a0-remediation.log` |
| coverage `backend.ts` | 0 | **100%** lines (L81/L130 covered) | `/tmp/rnfb-jest-coverage-a0-remediation.log` |
| lint:js | 0 | Pass | `/tmp/rnfb-lintjs-a0-remediation.log` |

`lib/**` unchanged. Findings fixed: minor + Vertex `_getModelPath` nit. count-tokens naming nit skipped (optional).

`next_work_type` → `independent-review` (delta), `validation_tier` → `area-focused`.

---

## Scope (A0)

Port firebase-js-sdk Agent Platform rename into `@react-native-firebase/ai`:

1. Add `BackendType.AGENT_PLATFORM` and export `AgentPlatformBackend` (default location `global` via `DEFAULT_LOCATION`).
2. Keep `VertexAIBackend` + `BackendType.VERTEX_AI` as **deprecated** (legacy default `us-central1` via `LEGACY_DEFAULT_LOCATION`).
3. Wire location / request paths for `AgentPlatformBackend` the same way as Vertex (`service.ts`, `getAI`, `requests/request.ts` modelPath). Prefer parity with JS SDK (`_getModelPath` where practical).
4. Update unit tests (add AgentPlatform cases; keep Vertex deprecated coverage), docs/JSDoc, exports, `tests/local-tests/ai` examples as needed.
5. Remove `AgentPlatformBackend` from compare-types `missingInRN` once exported; run `yarn compare:types` for `ai`.
6. Do **not** break `@react-native-firebase/vertexai` wrapper: it may keep constructing deprecated `VertexAIBackend('us-central1')`.
7. E2e: area harness modules `['app', 'ai']`; `ai` loads on macOS + iOS + Android.

**Out of scope:** TTS / speech-config drift already listed in compare-types; Flutter-only factory naming (`FirebaseAI.agentPlatform()`); native bridge changes (none expected).

---

## Gap analysis notes (2026-08-05)

| Source | Shape |
|--------|--------|
| JS SDK `backend.ts` | `AgentPlatformBackend` → `AGENT_PLATFORM`, default `global`; `VertexAIBackend` `@deprecated`, still `VERTEX_AI`, default `LEGACY_DEFAULT_LOCATION` (`us-central1`) |
| JS SDK `constants.ts` | `DEFAULT_LOCATION = 'global'`; `LEGACY_DEFAULT_LOCATION = 'us-central1'` |
| JS SDK request URLs | Uses `backend._getModelPath` / `_getTemplatePath` |
| compare-types | `AgentPlatformBackend` removed from `missingInRN` when shipped |
| FlutterFire | Factory rename `vertexAI()` → `agentPlatform()`; RNFB mirrors JS class/backend API, not Flutter factories |

---

## Item A0 — gates detail

| Field | Value |
|-------|-------|
| `next_work_type` | — |
| `validation_tier` | — |
| `platform` | macOS + iOS + Android (`ai` in both harness lists) |
| `implementation_gate` | **closed** |
| `review_gate` | **closed** |
| `commit_gate` | **closed** |
| `commit_subject` | `feat(ai): rename Vertex AI backend to agentPlatform` |
| `blocked` | no |

### Implementation evidence (2026-08-06, [finish implementer](441ad489-828d-454b-ae04-4e8a3490120b))

| Check | Command/platform | Exit | Pass/Fail/Pending | Log path | Harness narrowed |
|-------|------------------|------|-------------------|----------|------------------|
| lint fix | `yarn lint:js --fix` | 0 | Pass | `/tmp/rnfb-lintjs-a0-fix.log` | n/a |
| lint:js | `yarn lint:js` | 0 | Pass | `/tmp/rnfb-lintjs-a0-final.log` | n/a |
| prepare (ai) | `yarn lerna run prepare --scope @react-native-firebase/ai` | 0 | Pass | `/tmp/rnfb-prepare-a0-final.log` | n/a |
| Jest | `yarn tests:jest --watchman=false packages/ai/__tests__ packages/vertexai/__tests__` | 0 | Pass (24 suites / 345 tests) | `/tmp/rnfb-jest-a0-final.log` | n/a |
| tsc | `yarn tsc:compile` | 0 | Pass | `/tmp/rnfb-tsc-a0-final.log` | n/a |
| lint:deps | `yarn lint:deps` | 0 | Pass | `/tmp/rnfb-lintdeps-a0-final.log` | n/a |
| compare:types | `yarn compare:types` | 0 | Pass (`ai` ✓) | `/tmp/rnfb-compare-types-a0-final.log` | n/a |
| e2e macOS | `yarn tests:macos:test-cover` | 0 | Pass (35 passing) | `/tmp/rnfb-e2e-macos-a0-ai-agentplatform.log` | yes `['app','ai']` |
| e2e iOS | `yarn tests:ios:test-cover` | 0 | Pass (40 passing) | `/tmp/rnfb-e2e-ios-a0-ai-agentplatform.log` | yes |
| e2e Android | `yarn tests:android:test-cover` | 0 | Pass (40 passing) | `/tmp/rnfb-e2e-android-a0-ai-agentplatform.log` | yes |

**Coverage (impl):** AgentPlatform / getAI / AIService / `_getModelPath` covered. Gaps: `GoogleAIBackend`/`VertexAIBackend` `_getTemplatePath` lines (not rename-blocking). `lib/**` unchanged after prior e2e except Prettier-only.

### Validation expectations (review)

* **area-focused** per [change authoring](../../testing/change-authoring-workflow.md) and [running e2e](../../testing/running-e2e.md). Item-only: harness `['app','ai']`; `yarn compare:types` for `ai`.
