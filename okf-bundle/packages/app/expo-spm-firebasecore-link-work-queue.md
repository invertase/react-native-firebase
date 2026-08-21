---
type: Reference
title: Expo SPM FirebaseCore app-target link work queue
description: Ephemeral tracker for reopening CPRN-301 / #9158 under Expo prebuild (undefined _OBJC_CLASS_$_FIRApp despite #9164).
tags: [app, ios, spm, expo, work-queue]
timestamp: 2026-08-21T00:00:00Z
---

# Expo SPM FirebaseCore app-target link — work queue

> **IN PROGRESS:** Pickup **E1** (product fix). Branch: `feature/cprn-301-ios-spm-dynamic-linkage-app-target-never-gets-firebasecore`.
> **Goal:** Documented Expo path (SPM on, `useFrameworks: "dynamic"`, prebuilt RNCore on) links with `FirebaseCore` on the app target so `FirebaseApp.configure()` / `FIRApp` resolves. Closer is past `_OBJC_CLASS_$_FIRApp`, not past `#9202` duplicate `_FIRFirebaseVersion`.
> **Linear:** [CPRN-301](https://linear.app/invertase/issue/CPRN-301/ios-spm-dynamic-linkage-app-target-never-gets-firebasecore). Upstream GitHub [#9158](https://github.com/invertase/react-native-firebase/issues/9158). Prior fix [#9164](https://github.com/invertase/react-native-firebase/pull/9164) is on this tree; Expo `test-expo/` still red with the same signature.
> **Blocks:** [CPRN-321](https://linear.app/invertase/issue/CPRN-321/expo-documented-path-ios-link-fails-under-prebuilt-rncore) / [#9202](https://github.com/invertase/react-native-firebase/issues/9202). Do not chase duplicate-symbol work here.

Ephemeral tracker; see [OKF policy](../../documentation-policy.md). Work types / tiers / gate field ids: [iteration vocabulary](../../testing/iteration-vocabulary.md). **Loop, gates, host rule, harness:** [change authoring workflow](../../testing/change-authoring-workflow.md) — not restated. **Agent commands:** [agent command policy](../../testing/agent-command-policy.md) only.

Durable SPM context: [iOS SPM native integration decisions](../../ios-spm-native-imports.md). Package index: [index.md](index.md).

---

## Locked decisions

| Decision | Notes |
| -------- | ----- |
| Reopen CPRN-301; do not open a parallel Private Task | Same `_OBJC_CLASS_$_FIRApp` / missing app-target FirebaseCore link as #9158. #9164 shipped; Expo prebuild path still fails. |
| Red/green closer is `yarn test-expo:ios:link` | E0 red with `#9158` signature. E1 green past that signature. Stop if red is `undefined RCTEventEmitter` (wrong graph) or `#9202` duplicate `_FIRFirebaseVersion` (belongs on CPRN-321). |
| Reuse WIP on this branch | E0 fixture/script/workflow were retargeted from CPRN-321 WIP; do not rebuild `test-expo/` from scratch unless broken. |
| Forbidden “fixes” | `disableSPM`, `forceStaticLinking` of RNFB, `buildReactNativeFromSource` as the product fix. |

---

## Phase ordering (red → green)

| Phase | Focus | Why |
| ----- | ----- | --- |
| **E0** | `implementation` (red fixture) | Land / confirm `test-expo/` + `yarn test-expo:ios:link` is **red** with `_OBJC_CLASS_$_FIRApp` (and missing app-target `FirebaseCore` / `packageProductDependencies`). Commit the red harness if not already committed. |
| **E1** | `implementation` (product fix) | Diagnose why `rnfirebase_add_spm_core_to_app_target` does not attach under `expo prebuild` (first suspect: target skip unless `[CP] Embed Pods Frameworks` exists — `packages/app/firebase_spm.rb`). Fix + Ruby/Jest. Same command **green** past FIRApp. |
| **E2** | `independent-review` | Frozen tree; area-focused for touched app / SPM / Ruby / fixture. |
| **E3** | `documentation` | Only if durable SPM/Expo docs or OKF invariants change. |
| **E4** | `commit` | One focused Conventional Commit (or E0 red commit then E1 fix commit if the grilled split is kept). |

---

## Resume checklist

1. Read CPRN-301 Step 10 + this queue. Confirm branch name matches Linear `gitBranchName`.
2. Confirm WIP: `test-expo/`, `.github/workflows/scripts/test-expo-ios-link.sh`, `yarn test-expo:ios:link`.
3. [Agent command policy](../../testing/agent-command-policy.md) — root `yarn` / `yarn lerna:prepare` before validation. Fixture command: `yarn test-expo:ios:link`.
4. Ruby unit tests when touching `firebase_spm.rb`: `yarn tests:ios:ruby` / `yarn lint:ruby` per agent command policy.
5. Do **not** flip `tests/ios/Podfile` ENV prebuilt pin; do **not** treat `#9202` as this closer.

---

## Current snapshot

**Label:** `cprn-301-expo-spm-firebasecore-link-e0-commit-2026-08-21`

**Next pickup:** **E1** — product fix; `yarn test-expo:ios:link` green past `_OBJC_CLASS_$_FIRApp`.

**Current gates:** E0 all gates closed. E1 `implementation_gate` open.

---

## Item arbiter

| Item | Scope | `commit_subject` | `implementation_gate` | `review_gate` | `commit_gate` | `next_work_type` | `validation_tier` | `platform` | Notes |
| ---- | ----- | ---------------- | ----------------------- | ------------- | ------------- | ---------------- | ------------------- | ---------- | ----- |
| **E0** | Red Expo documented-path link fixture (`test-expo/` + script + optional informational workflow) | `test(expo): reproduce FIRApp undefined under SPM dynamic prebuild` | closed | closed | closed | `commit` | `none` | `ios` | Gates closed with evidence. Reviewer green, no findings. Docs DRY: allowlist + app/SPM/e2e indexes point at `yarn test-expo:ios:link` (not Detox). Split commit from E1. |
| **E1** | Product fix so helper links FirebaseCore under Expo prebuild; Ruby/Jest | `fix(ios): link FirebaseCore into Expo app target under SPM` | open | open | open | `implementation` | `unit-focused` | `ios` | Pass: same command green past FIRApp. First suspect (skip unless `[CP] Embed Pods Frameworks`) is **weaker**: E0 pbxproj **has** that phase and the helper still did not attach. |
| **E2** | Independent review of E1 (E0 already committed) | `fix(ios): link FirebaseCore into Expo app target under SPM` | open | open | open | `independent-review` | `area-focused` | `ios` | Frozen tree. Include Ruby SPM tests + `yarn test-expo:ios:link`. |
| **E3** | Durable docs / OKF only if path changes | (same as product commit or docs-only subject) | open | open | open | `documentation` | `none` | — | E0 already shipped command-policy + index links. Skip unless E1 changes SPM/Expo path text. |
| **E4** | Commit memorial | (subjects above) | open | open | open | `commit` | `none` | — | Stage product + this queue together. |

---

## E0 — red fixture acceptance

- [x] Documented path: SPM on, `useFrameworks: "dynamic"`, no `disableSPM` / `forceStaticLinking` / `buildReactNativeFromSource`
- [x] Modules: `@react-native-firebase/app` + `messaging` (existing `test-expo/` shape)
- [x] `yarn test-expo:ios:link` fails with `_OBJC_CLASS_$_FIRApp` (or equivalent missing FirebaseCore on app target)
- [x] Evidence note: whether `testexpo.xcodeproj` lacks `packageProductDependencies` / `XCSwiftPackageProductDependency` / Frameworks `PBXBuildFile` for FirebaseCore
- [x] Not `#9202` duplicate `_FIRFirebaseVersion`; not Issue 2 `RCTEventEmitter`

**E0 validation evidence:** (implementer 2026-08-21; reviewer re-run 2026-08-21)

| Step | Command | Exit | Evidence |
| --- | --- | --- | --- |
| install | `yarn` | 0 | workspace `test-expo` linked to local `packages/app` + `packages/messaging` (26.3.0) |
| expo iOS link (impl) | `yarn test-expo:ios:link` | non-zero (`ld` 1, `BUILD FAILED`) | `#9158` `_OBJC_CLASS_$_FIRApp` from `AppDelegate.o`. `/tmp/test-expo-prebuild.log`, `/tmp/test-expo-xcodebuild.log`, `/tmp/rnfb-test-expo-ios-link.log` |
| expo iOS link (review) | `yarn test-expo:ios:link` | **65** | same `#9158` signature; pbxproj has `[CP] Embed Pods Frameworks`, **no** `packageProductDependencies` / FirebaseCore `PBXBuildFile` / `[RNFB] Embed Firebase SPM Frameworks`. `/tmp/test-expo-prebuild.log`, `/tmp/test-expo-xcodebuild.log` |
| JS lint | `yarn lint:js` | N/A | fixture-only; `eslint packages/*` |
| coverage | — | N/A | no lib/native/Ruby in E0 product diff |

---

## E1 — green fix acceptance

- [ ] Root cause named (why `#9164` helper did not attach under this Expo prebuild graph)
- [ ] Product change in `packages/app` (likely `firebase_spm.rb` and/or Pod activation path)
- [ ] Ruby unit coverage for the Expo/app-target selection gap (extend `packages/app/__tests__/firebase_spm*_test.rb`)
- [ ] `yarn test-expo:ios:link` green past `_OBJC_CLASS_$_FIRApp`
- [ ] If shared native/plugin code changed beyond Ruby: `yarn tests:ios:build` per change-authoring when required

**E1 unit-focused validation evidence:** _(fill on close)_

---

## Related product files (starting points)

- `packages/app/firebase_spm.rb` — `rnfirebase_add_spm_core_to_app_target` (line ~715; skip unless `[CP] Embed Pods Frameworks`)
- `packages/app/__tests__/firebase_spm_test.rb` (+ embed/shape siblings)
- `packages/app/plugin/src/ios/appDelegate.ts` — Expo `FirebaseApp.configure()` injection
- `test-expo/` — workspace Expo fixture (WIP on this branch)
- `.github/workflows/scripts/test-expo-ios-link.sh`
- `.github/workflows/test_expo_ios_link.yml`
- Durable: `okf-bundle/ios-spm-native-imports.md`, `docs/ios-spm.mdx`
