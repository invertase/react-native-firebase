---
type: Reference
title: App Check iOS provider init work queue
description: Ephemeral tracker for fixing iOS App Check installing the debug provider before JS configure (GitHub #9116).
tags: [app-check, ios, provider, work-queue]
timestamp: 2026-08-04T00:00:00Z
---

# App Check iOS provider init — work queue

> **DONE:** All gates closed 2026-08-07. Commit subject: `fix(app-check, ios): do not install debug provider before configure`. No further pickup for this item.
> **Goal:** Stop release (and DEBUG) builds from installing `FIRAppCheckDebugProvider` during eager `FirebaseApp.configure()`; pending facade + fail-closed tokens until `configureProvider`; JS configure-before-auto-refresh; plugin comment/docs honesty; soft-break troubleshooting docs.
> **Upstream:** [#9116](https://github.com/invertase/react-native-firebase/issues/9116). Contributor [#9117](https://github.com/invertase/react-native-firebase/pull/9117) left open as temporary patch; close manually when the durable PR is up (do not merge #9117 as the long-term design).

Ephemeral tracker; see [OKF policy](../../documentation-policy.md). Work types / tiers / gate field ids: [iteration vocabulary](../../testing/iteration-vocabulary.md). **Loop, gates, host rule, harness:** [change authoring workflow](../../testing/change-authoring-workflow.md) — not restated. **Agent commands:** [agent command policy](../../testing/agent-command-policy.md) only.

Durable decisions: **[architecture-decisions.md](architecture-decisions.md)**. Package index: **[index.md](index.md)**.

---

## Locked decisions (index)

| ADR | Decision |
| --- | -------- |
| [AppCheck-AD-1](architecture-decisions.md#appcheck-ad-1--pending-provider-before-configure-fail-closed-token-apis--accepted) | Pending provider + fail-closed tokens |
| [AppCheck-AD-2](architecture-decisions.md#appcheck-ad-2--same-pending-path-for-debug-and-release--accepted) | Same path for DEBUG and release |
| [AppCheck-AD-3](architecture-decisions.md#appcheck-ad-3--expo--appdelegate-keep-factory-before-firebaseappconfigure--accepted) | Keep factory before `configure()`; fix comments/docs only |
| [AppCheck-AD-4](architecture-decisions.md#appcheck-ad-4--initializeappcheck-configure-provider-before-enabling-auto-refresh--accepted) | JS: configure provider before auto-refresh |
| [AppCheck-AD-5](architecture-decisions.md#appcheck-ad-5--pre-js-native-provider-via-firebasejson--deferred) | firebase.json pre-JS provider — **Deferred** |
| [AppCheck-AD-6](architecture-decisions.md#appcheck-ad-6--native-regression-coverage-preferred-no-new-ios-xctest-platform-in-this-fix--accepted) | Prefer native seam/test; fallback Jest/plugin/e2e |
| [AppCheck-AD-7](architecture-decisions.md#appcheck-ad-7--soft-break-release-framing--accepted) | Soft-break bug fix + troubleshooting docs |
| [AppCheck-AD-8](architecture-decisions.md#appcheck-ad-8--fail-closed-error-identity--accepted) | `appCheck/provider-not-ready` — **Accepted** (AC0) |

---

## Phase ordering

| Phase | Focus | Why |
| ----- | ----- | --- |
| **AC0** | `gap-analysis` | Promote/confirm ADRs; lock AppCheck-AD-8; estimate diff size → keep one AC1 or split AC1a/b/c |
| **AC1** | `implementation` | Pending factory + fail-closed + tests; JS reorder; plugin comment (single item if reasonably sized) |
| **AC2** | `independent-review` | Frozen tree; area-focused; **iOS + Android + macOS** app-check e2e |
| **AC3** | `documentation` | Site troubleshooting (`exchangeDebugToken` 403); usage “configure before use”; OKF durable moves; release-note wording |
| **AC4** | `commit` | One focused Conventional Commit (or per-split subjects if AC0 re-slices) |

**Re-slice rule (AC0):** Prefer one AC1 implementation if the diff stays reasonably sized. If AC0 estimates a large blast radius, split before coding into e.g. **AC1a** native pending/fail-closed + tests, **AC1b** JS reorder, **AC1c** plugin comment — each with its own gates/commit subjects as needed.

---

## Resume checklist

Before any `:test-cover` ([host rule](../../testing/change-authoring-workflow.md#host-rule)):

1. [Pre-flight](../../testing/running-e2e.md#pre-flight-is-the-host-clear-to-start): host-clear probes, services ready, harness matches validation tier; [harness narrowing gate](../../testing/running-e2e.md#harness-narrowing-gate-blocking); serial `:test-cover`; [frozen tree](../../testing/change-authoring-workflow.md#frozen-tree) for `independent-review`.
2. **unit-focused (AC1):** iOS-speed loop (native `:build` when iOS native touched) + Jest + plugin tests; Android/macOS e2e optional unless needed for diagnosis.
3. **area-focused (AC2):** full loaded app-check spec on **iOS, Android, and macOS**.

---

## Current snapshot

**Label:** `app-check-ios-provider-init-queue-authored-2026-08-04`

**Next pickup:** none — item complete.

**Current gates:** AC0–AC4 all closed 2026-08-07. AC1/AC2 `review_gate` closed on a user-accepted exception for the delta re-review tier (see AC2 section below). `commit_gate` closes on the commit matching the subject above.

---

## Item arbiter

| Item | Scope | `commit_subject` | `implementation_gate` | `review_gate` | `commit_gate` | `next_work_type` | `validation_tier` | `platform` | Notes |
| ---- | ----- | ---------------- | ----------------------- | ------------- | ------------- | ---------------- | ------------------- | ---------- | ----- |
| **AC0** | ADR lock + size / re-slice | — | closed | closed | closed | — (done) | `none` | — | Closed 2026-08-04. Single AC1 (~150–250 LOC). AppCheck-AD-8 Accepted as `appCheck/provider-not-ready`. Do not merge #9117. |
| **AC1** | Native pending + fail-closed + tests; JS reorder; plugin comment | `fix(app-check, ios): do not install debug provider before configure` | closed | closed | closed | — (done) | `area-focused` | `ios`+`android`+`macos` | Exclude Podfile.lock. Nit remediation evidence below. |
| **AC2** | Independent review of AC1 | `fix(app-check, ios): do not install debug provider before configure` | closed | closed | closed | — (done) | `area-focused` | `ios`+`android`+`macos` | Full re-review green with nits 2026-08-05. Delta closed 2026-08-07 on user-accepted exception (see below). |
| **AC3** | User docs + durable OKF | `fix(app-check, ios): do not install debug provider before configure` | closed | closed | closed | — (done) | `none` | — | Docs done 2026-08-07. `lib/types/internal.ts` activate() docstring fixed; `docs/app-check/usage/index.mdx` Expo/configure-before-use note + new Troubleshooting section (`appCheck/provider-not-ready`, `exchangeDebugToken` soft-break). AD-8 durable docs re-verified accurate against code, no changes needed. |
| **AC4** | Commit | `fix(app-check, ios): do not install debug provider before configure` | closed | closed | closed | — (done) | `none` | — | Stage product + docs + this queue together. Exclude `tests/*/Podfile.lock`. |

---

## AC0 — gap-analysis checklist

Read-only. Closed 2026-08-04 (explore gap-analysis).

- [x] Confirm factory-before-configure still required by current Firebase iOS App Check docs/SDK behavior
- [x] Trace `createProviderWithApp:` → eager `FIRAppCheckInterop` → JS `configureProvider` on current `main`
- [x] Choose fail-closed `NSError` / JS code — **Accepted:** `provider-not-ready` → `appCheck/provider-not-ready` ([AppCheck-AD-8](architecture-decisions.md#appcheck-ad-8--fail-closed-error-identity--accepted))
- [x] Assess native test seam vs XCTest cost — nil `delegateProvider` seam; no new XCTest; Jest + plugin + AC2 e2e ([AppCheck-AD-6](architecture-decisions.md#appcheck-ad-6--native-regression-coverage-preferred-no-new-ios-xctest-platform-in-this-fix--accepted))
- [x] Estimate AC1 diff size → **single AC1** (~150–250 LOC); no AC1a/b/c
- [x] Note plugin snapshot tests — source-comment-only → **no** snapshot updates unless emitted AppDelegate text changes
- [x] Note stale docs lines for AC3 — `packages/app-check/lib/types/internal.ts` “including the module”; `docs/app-check/usage/index.mdx` Expo/configure-before-use / missing `exchangeDebugToken` troubleshooting; plugin comment inverted

**AC0 notes (evidence summary):**

- Footgun: `RNFBAppCheckProviderFactory.m` `createProviderWithApp:` calls `configure:… providerName:@"debug"`.
- JS AD-4 gap: `lib/index.ts` enables auto-refresh before `configureProvider`.
- Module today maps all provider errors to `token-error`; AC1 must map pending → `provider-not-ready`.
- Android already throws if `create` before configure; iOS uses pending facade instead (AD-1).

---

## AC1 — implementation acceptance (draft)

- [x] Pre-configure `createProviderWithApp:` does not call `configure:… providerName:@"debug"`
- [x] Pending token APIs fail closed (no network)
- [x] `configureProvider` attaches real delegate; subsequent tokens use configured provider
- [x] JS `initializeAppCheck` configures provider before auto-refresh
- [x] Expo plugin comment corrected; emitted order unchanged
- [x] Tests per AppCheck-AD-6; validation + coverage evidence recorded (unit-focused)

**AC1 unit-focused validation evidence:**

| Check | Exit | Result | Log |
| --- | --- | --- | --- |
| `yarn` + `yarn lerna:prepare` | 0 | green | (shell) |
| Jest app-check + plugin | 0 | **25 passed**, 5 snapshots unchanged | `/tmp/rnfb-jest-app-check.log` |
| `yarn lint` (js+deps+android+ios) | 0 | green | `/tmp/rnfb-lint.log` |
| `yarn tests:ios:pod:install` | 0 | pods installed | `/tmp/rnfb-ios-pod-install.log` |
| `yarn tests:ios:build` | 0 | Build Succeeded | `/tmp/rnfb-ios-build.log` |
| `yarn tests:ios:test-cover` | 0 | **42 passing**, 0 failing | `/tmp/rnfb-e2e-ios.log` |
| `yarn tests:ios:test:process-coverage` | 0 | `coverage/ios-native/lcov.info` | `/tmp/rnfb-ios-native-coverage.log` |

Harness: narrowed to `app`+`appCheck` during run; overrides removed after. Coverage: factory/configure/JS AD-4 hit; pending fail-closed **0% e2e** — gap disposition AppCheck-AD-6 nil-delegate seam (ADR-accepted). Residual: optional e2e negative case for AC2 judgment. Note: `tests/ios/Podfile.lock` dirty from pod install (review whether to include).

---

## AC2 — independent-review (failed 2026-08-05)

**Verdict:** failed (critical). Area-focused e2e green: iOS 42 / Android 42 / macOS 35+2 pending. Jest 24. Harness narrowed `app`+`appCheck`, reverted after. **Exclude** `tests/ios/Podfile.lock` and `tests/macos/Podfile.lock` from commit.

| Severity | Finding | Fix |
| --- | --- | --- |
| **critical** | AD-8 JS identity lost: `FIRAppCheck` wraps `RNFBErrorDomain` pending errors; module reads top-level `userInfo[@"code"]` only → JS gets `appCheck/token-error` not `appCheck/provider-not-ready`. Files: `RNFBAppCheckProvider.m` emit; `RNFBAppCheckModule.mm` mapper. | In module `getToken` / `getLimitedUseToken`, if factory provider for app has `delegateProvider == nil`, reject `provider-not-ready` **before** calling FIRAppCheck. Optionally also walk `NSUnderlyingErrorKey`. |
| **nit** | Podfile.lock churn (AppCheckCore patch + macOS pod install) | Exclude from AC1 commit |

**AC2 validation evidence:**

| Check | Exit | Result | Log |
| --- | --- | --- | --- |
| Jest app-check + plugin | 0 | 24 passed | `/tmp/rnfb-jest-app-check.log` |
| `yarn tests:ios:test-cover` | 0 | **42 passing** | `/tmp/rnfb-e2e-ios.log` |
| `yarn tests:android:test-cover` | 0 | **42 passing** | `/tmp/rnfb-e2e-android.log` |
| `yarn tests:macos:test-cover` | 0 | **35 passing**, 2 pending | `/tmp/rnfb-e2e-macos.log` |

Coverage: factory pending/configure/JS AD-4 hit; module `provider-not-ready` mapper **0%** (broken by SDK wrap). AD-6 e2e gap on pending path not a separate finding; finding #1 is product/AD-8.

---

## AC2 — independent-review re-run (green with nits 2026-08-05)

**Verdict:** green with nits. Prior AD-8 critical **resolved** (iOS e2e both pending cases assert `provider-not-ready`, not `token-error`). Acceptance 1–7 hold. Do not merge #9117.

| Severity | Finding | Disposition |
| --- | --- | --- |
| **nit** | AD-8 message string duplicated | **Fixed** — `kRNFBAppCheckProviderNotReadyMessage` in Provider.h/.m; Module uses shared constant. Unit-focused iOS 44 green. |
| **nit** | `tests/ios/Podfile.lock` + `tests/macos/Podfile.lock` dirty | **Exclude** from commit (not product) |

**Nit remediation validation (unit-focused iOS):**

| Check | Exit | Result | Log |
| --- | --- | --- | --- |
| `yarn tests:ios:build` | 0 | Build Succeeded | (shell) |
| `yarn tests:ios:test-cover` | 0 | **44 passing** (both AD-8 cases) | `/tmp/rnfb-e2e-ios.log` |

**AC2 validation evidence:**

| Check | Exit | Result | Log |
| --- | --- | --- | --- |
| Jest app-check + plugin | 0 | **25 passed** | `/tmp/rnfb-jest-app-check.log` |
| `yarn lint` / `yarn compare:types` | 0 | green | `/tmp/rnfb-lint.log`, `/tmp/rnfb-compare-types.log` |
| `yarn tests:ios:test-cover` | 0 | **44 passing** | `/tmp/rnfb-e2e-ios.log` |
| `yarn tests:android:test-cover` | 0 | **42 passing**, 2 pending | `/tmp/rnfb-e2e-android.log` |
| `yarn tests:macos:test-cover` | 0 | **35 passing**, 4 pending | `/tmp/rnfb-e2e-macos.log` |

Harness: `app`+`appCheck`, reverted. Coverage: pre-check FNDA:7; provider pending bodies FNDA:0 (shadowed by module pre-check, acceptable).

**Delta re-review disposition (user-accepted exception, 2026-08-07):** The 2026-08-05 area-focused reviewer run above already covers the full AC1 diff pre-fix. The subsequent nit fix (shared `kRNFBAppCheckProviderNotReadyMessage` constant) touches only `RNFBAppCheckProvider.h/.m` and `RNFBAppCheckModule.mm` — a string-literal extraction, no logic change, no Android/macOS files touched. A fresh area-focused reviewer for this delta would re-run Android/macOS e2e that this diff cannot affect. User confirmed accepting the iOS-only unit-focused evidence (`yarn tests:ios:build` + `yarn tests:ios:test-cover`, 44 passing, both AD-8 pending cases) as sufficient to close `review_gate` for AC1/AC2, in lieu of relaunching the delta area-focused reviewer. `review_gate` closed 2026-08-07.

---

## AC1 remediation — AD-8 mapping (unit-focused green 2026-08-05)

**Fix:** `RNFBAppCheckRejectIfProviderNotReady` in module before FIRAppCheck; `providerForApp:` on factory; `RejectCodeForError` walks `NSUnderlyingErrorKey`. E2e on `secondaryFromNative` asserts `provider-not-ready` (not `token-error`).

| Check | Exit | Result | Log |
| --- | --- | --- | --- |
| Jest `appcheck.test.ts` | 0 | **15/15** | `/tmp/rnfb-jest-appcheck.log` |
| `yarn tests:ios:build` | 0 | Build Succeeded | `/tmp/rnfb-ios-build.log` |
| `yarn tests:ios:test-cover` | 0 | **44 passing**, 0 failing | `/tmp/rnfb-e2e-ios.log` |
| `yarn tests:ios:test:process-coverage` | 0 | `coverage/ios-native/lcov.info` | (processed 2026-08-05) |

Harness: `app`+`appCheck`, reverted after. Coverage: pre-check helper FNDA:7; AD-8 e2e both green. Exclude Podfile.lock.

---

## AC3 — documentation (closed 2026-08-07)

**Scope:** `packages/app-check/lib/types/internal.ts` (stale `activate()` docstring), `docs/app-check/usage/index.mdx` (Expo/configure-before-use note, new Troubleshooting section), durable OKF re-verification (no changes needed — `AppCheck-AD-8` locked shape confirmed to match code exactly), OKF bundle consistency scan.

**Validation evidence:**

| Check | Exit | Result |
| --- | --- | --- |
| `yarn lerna:prepare` | 0 | 20 projects, app-check rebuilt clean |
| `yarn tsc:compile` | 0 | no errors |
| `yarn lint:js` | 0 | no errors |
| `yarn lint:markdown` | 0 | Prettier-clean |
| `yarn lint:spellcheck` | 0 | no failures |
| `yarn format:js` | 0 | no reformat needed on target files (unrelated `packages/app/type-test.ts` drift reformatted then reverted, out of scope) |
| `yarn compare:types` | 0 | app-check: 4 missing / 9 extra / 2 different — documented (pre-existing) |

**OKF bundle consistency pass:** full `okf-bundle/` sweep, focused on `packages/app-check/**` and inbound links. No DRY violations or dangling anchors found in files touched by this item. One **pre-existing, unrelated** dangling anchor flagged (not fixed — out of scope): `documentation-policy.md`'s OKF update contract table links `testing/coverage-design.md#coverage-evidence-package`, actual heading slug is `#coverage-evidence-package-blocking`. Route to a separate cleanup.

**Draft release-note wording** (repo has no CHANGELOG/changeset file; for PR body use):

- Fixed: on iOS, App Check could install and use the debug provider before `initializeAppCheck` ran, including in release builds, sometimes producing unexpected `exchangeDebugToken` 403/429 traffic. The native provider now stays pending until `initializeAppCheck` (or the deprecated `activate`) is called.
- Behavior change: requesting a token before `initializeAppCheck` now rejects immediately with `appCheck/provider-not-ready` instead of silently exchanging a debug token or falling through to another provider.

---

## Related product files (starting points)

- `packages/app-check/ios/RNFBAppCheck/RNFBAppCheckProviderFactory.m`
- `packages/app-check/ios/RNFBAppCheck/RNFBAppCheckProvider.m`
- `packages/app-check/ios/RNFBAppCheck/RNFBAppCheckModule.mm`
- `packages/app-check/lib/index.ts` (`initializeAppCheck`)
- `packages/app-check/plugin/src/ios/appDelegate.ts`
- `packages/app-check/plugin/__tests__/`
- `docs/app-check/usage/index.mdx`
