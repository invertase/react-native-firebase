---
type: Reference
title: iOS RNCore prebuilt podspec work queue
description: Ephemeral tracker for RNFB podspec Clang non-modular-includes + xcconfig order (CPRN-237, #9200).
tags: [ios, podspec, rncore, cocoapods, work-queue]
timestamp: 2026-08-17T00:00:00Z
---

# iOS RNCore prebuilt podspec — work queue

> **Follow-up (2026-08-18):** Fresh-eyes review of [PR #9200](https://github.com/invertase/react-native-firebase/pull/9200). Durable owner is [iOS RNCore podspec invariants](ios-rncore-podspec.md). Live pods must not double-call `add_rncore_dependency` (`install_modules_dependencies` already does). Do not close #8883 from this PR.
> **Linear:** [CPRN-237](https://linear.app/invertase/issue/CPRN-237) is Issue 1 only (this queue / #9200). Issue 2 (`tests/` prebuilt RNCore link) is [CPRN-321](https://linear.app/invertase/issue/CPRN-321), not this file. Queue line: `okf-work-queue` (`okf-bundle/ios-rncore-podspec-work-queue.md`).
> **Upstream:** invertase/react-native-firebase#9024 (fork PR, producer-side — reimplemented here, not merged as-is). Consumer-side fix already upstream: facebook/react-native#56862 (in RN 0.86.2). Related issue: invertase/react-native-firebase#8883 (not closed by #9200).

Ephemeral tracker; see [OKF policy](documentation-policy.md). Work types / tiers / gate field ids: [iteration vocabulary](testing/iteration-vocabulary.md). **Loop, gates, host rule, harness:** [change authoring workflow](testing/change-authoring-workflow.md) — not restated here. **Agent commands:** [agent command policy](testing/agent-command-policy.md) only. Durable invariants: [iOS RNCore podspec invariants](ios-rncore-podspec.md). SPM imports/embed: [iOS SPM native integration decisions](ios-spm-native-imports.md).

---

## Locked decisions (2026-08-17 grill session)

| # | Decision |
| - | -------- |
| 1 | Reimplement #9024's podspec/`.m` changes on a **new same-repo branch**, not on `wneel`'s fork branch — native GitHub stacked PRs exclude forks. |
| 2 | Stack the new branch on top of **#9192**'s branch (`split-tests-e2e-app-decouple-macos`) via GitHub's native stacked-PR feature (main ← #9192 ← this branch). |
| 3 | Queue covers **both** CPRN-237 phases: Phase 1 (land the podspec fix) and Phase 2 (workaround-removal proof). |
| 4 | **Pilot first:** `packages/app` only (R1), proving the pattern before rolling out to the remaining ~14 podspecs (R2). |
| 5 | **Validation floor (accepted exception):** a direct `xcodebuild` compile of the RNFB pod target(s) under a locally-forced `RCT_USE_PREBUILT_RNCORE=1`, not full `tests/` e2e — see [Required maintainer context](#required-maintainer-context) for why. User-accepted deferral, recorded 2026-08-17. |
| 6 | The `react-native-device-info` / `@invertase/react-native-apple-authentication`-under-prebuilt-RNCore link-time conflict (discovered on #9192) is **out of scope** for this queue. Tracker: [CPRN-321](https://linear.app/invertase/issue/CPRN-321). |
| 7 | Phase 2 validation is **bare RN CLI only** (via `tests/`); Expo is explicitly deferred to CPRN-153 (separate, non-blocking). |
| 8 | invertase/react-native-firebase#8994 (draft build-harness apps) is **not a dependency** of this queue — revisit opportunistically if it's further along by R3. |
| 9 | Attribution: credit `wneel` via `Co-authored-by:` trailers on the reimplemented commit(s). Russell will message #9024 himself once the new PR is in draft — not an agent/queue action item. |
| 10 | Human gate: CPRN-237's "Agent Suitable? Needs human first" flag is satisfied by this grill session for the overall approach; each item below follows [change authoring workflow](testing/change-authoring-workflow.md). |

Superseded 2026-08-18 (do not treat as current): decision 1's `.m` extras did not ship; decision 2's stack ended when #9192 merged (`ios-podspec-rncore-prebuilt` rebases onto `main`); decision 7's `tests/` Phase 2 path cannot turn prebuilt on (Issue 2). Durable outcome is [ios-rncore-podspec.md](ios-rncore-podspec.md), not an expansion of the SPM ADR.

---

## Required maintainer context

**Two independent problems, only one is in scope here:**

1. **Compile-time / header-visibility (in scope):** RNFB umbrellas that re-export `<React/...>` trip `-Werror,-Wnon-modular-include-in-framework-module` under `use_frameworks!`. Fix: `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES=YES` on `pod_target_xcconfig` **before** `install_modules_dependencies`. On RN 0.84+, that helper already calls `add_rncore_dependency`; live pods must not call it again. The package template still does, because it has no helper. Canonical: [ios-rncore-podspec.md](ios-rncore-podspec.md).
2. **Link-time / dynamic-linkage (out of scope):** `tests/ios/Podfile` keeps `RCT_USE_PREBUILT_RNCORE=0` because `react-native-device-info` and `@invertase/react-native-apple-authentication` fail to link (`undefined RCTEventEmitter`) under prebuilt RNCore. Tracker: [CPRN-321](https://linear.app/invertase/issue/CPRN-321). Pin owner: [test app dependency pins](testing/test-app-dependency-pins.md). **Consequence:** `tests/` cannot exercise problem 1's fix end-to-end with prebuilt RNCore actually on, so R1/R2 used a direct pod-target `xcodebuild` compile instead of `tests/` e2e (decision 5 above).

**Stack mechanics:**

- Trunk: `main`. #9192 merged 2026-08-18. This branch is **not stacked**; it was rebased `--onto origin/main`.
- Branch: `ios-podspec-rncore-prebuilt`. Draft PR #9200 targeting `main`. Do not use `Fixes #8883`.

---

## Phase ordering

| Item | Focus | Why |
| ---- | ----- | --- |
| **R1** | `packages/app` pilot | Prove `add_rncore_dependency` + `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES` compile clean under prebuilt RNCore on the umbrella pod first |
| **R2** | Remaining ~14 podspecs | Roll the proven pattern out, mirroring #9024's file list |
| **R3** | Phase 2 — bare RN CLI workaround-removal proof | Once #9192's RN 0.86.2 bump is available on the branch; producer-side proof only (see [context](#required-maintainer-context)) |
| **R4** | Durable ADR write-up | Fold the proven pattern into [ios-rncore-podspec.md](ios-rncore-podspec.md) (not the SPM ADR) |
| **R5** | PR handoff | Draft PR off `main`; fresh-eyes review ([Cross Platform guide § Step 7](https://linear.app/invertase/document/cross-platform-issue-authoring-and-agent-workflow-guide-2b429e4aace0#step-7--fresh-eyes-review-before-merge)) |
| **R6** | Review corrections | Drop duplicate `add_rncore_dependency` on live pods; move durable text out of the SPM ADR; remove `Fixes #8883` |

---

## Resume checklist

1. Branch is based on `origin/main` after #9192 merge (2026-08-18). Do not look for `split-tests-e2e-app-decouple-macos` (remote ref deleted).
2. Post-rebase independent-review of R1/R2 is **green** (2026-08-18). Prior pre-rebase `xcodebuild` rows are historical only; publication evidence is [R5 post-rebase review evidence](#r5-post-rebase-review-evidence).
3. [Pre-flight](testing/running-e2e.md#pre-flight-is-the-host-clear-to-start) still applies for any `tests:*` command, even though R1/R2 use direct `xcodebuild` rather than `yarn tests:ios:test-cover`.
4. **R1/R2 evidence shape (non-standard — read before running):** the platform-coverage e2e-evidence rule in [change authoring § validation evidence](testing/change-authoring-workflow.md#validation-evidence-blocking) is overridden for this queue only, per [decision 5](#locked-decisions-2026-08-17-grill-session). Record the `xcodebuild` command, target, and exit code — not an e2e pass count — as the implementation/review evidence for R1 and R2.
5. Never commit `tests/ios/Podfile.lock` changes made only to locally force `RCT_USE_PREBUILT_RNCORE=1` for validation.

---

## Item arbiter

| Item | Scope | `commit_subject` | `implementation_gate` | `review_gate` | `commit_gate` | `next_work_type` | `validation_tier` | `platform` | Notes |
| ---- | ----- | ---------------- | ---------------------- | ------------- | ------------- | ----------------- | ------------------- | ---------- | ----- |
| **R1** | `packages/app` podspec + `.m` changes, pilot | `fix(app, ios): wire add_rncore_dependency for prebuilt RNCore` | closed | closed | closed | `commit` | `area-focused` (evidence: `xcodebuild` compile, not e2e — see resume checklist #4) | `ios` | All gates closed. Docs scan ready (decision 10 now links change authoring; no durable ADR). Product: `packages/app/RNFBApp.podspec` only. Coverage n/a. See [R1 implementation evidence](#r1-implementation-evidence) and [R1 review evidence](#r1-review-evidence). |
| **R2** | Remaining ~14 podspecs + `.m` files, mirroring #9024's file list | `fix(ios): wire add_rncore_dependency across remaining podspecs for prebuilt RNCore` | closed | closed | closed | `commit` | `area-focused` (same evidence shape as R1) | `ios` | All gates closed. Re-review green, no findings. xcconfig before helpers on all remaining specs. Native-import skip accepted. Coverage n/a. See [R2 re-review evidence](#r2-re-review-evidence). |
| **R3** | Phase 2 producer-side workaround-removal proof, bare RN CLI, doc note | — (no commit; absorbed into R4) | closed | closed | closed | `documentation` | `none` | `ios` | Gap-analysis complete. Producer-side proof **already shipped** as R1/R2 `xcodebuild` (prebuilt on, dynamic `use_frameworks!`, no `$RNFirebaseAsStaticFramework`). Cannot prove full `tests/` link/e2e (Issue 2) or Expo `forceStaticLinking` (CPRN-153). No R3 product/docs commit. See [R3 gap analysis](#r3-gap-analysis). |
| **R4** | Durable ADR | `docs: record add_rncore_dependency for prebuilt RNCore` | closed | closed | closed | `commit` | `none` | — | Landed, then superseded by R6: canonical file is [ios-rncore-podspec.md](ios-rncore-podspec.md), not the SPM ADR. See [R4 documentation evidence](#r4-documentation-evidence). |
| **R5** | Mark PR ready; fresh-eyes review | — (no commit, PR-state change only) | closed | closed | — | — | `none` | — | Fresh-eyes 2026-08-18 found ADR/home/`Fixes #8883` problems. See [R5 post-rebase review evidence](#r5-post-rebase-review-evidence) and CPRN-237 pr-review comment. |
| **R6** | Apply #9200 review corrections | `fix(ios): drop duplicate add_rncore_dependency from live podspecs` | closed | closed | closed | `commit` | `unit-focused` | `ios` | Live pods no longer call `add_rncore_dependency`. Template still does. Durable owner [ios-rncore-podspec.md](ios-rncore-podspec.md). PR body already dropped `Fixes #8883`. See [R6 evidence](#r6-evidence). |

**Current gates:** R1–R6 closed. **Next pickup:** merge #9200. **Current snapshot:** draft PR #9200 targeting `main`. Do not close #8883. Issue 2 is [CPRN-321](https://linear.app/invertase/issue/CPRN-321).

### R1 implementation evidence

`harness narrowed: no` (xcodebuild pod-target compile; no e2e). `-project Pods/Pods.xcodeproj -target RNFBApp` failed (`Packages are not supported when using legacy build locations`); working invocation is workspace + scheme + `-derivedDataPath`.

| Step | Command | Exit | Evidence |
| ---- | ------- | ---- | -------- |
| yarn | `yarn` | 0 | fmt `12.1.0` (`spec.version` and `:tag` in `tests/node_modules/react-native/third-party-podspecs/fmt.podspec`) |
| pod install (local force) | `tests/ios/Podfile` ENV both `'1'`, then `pod install` from `tests/ios` | 0 | Installed `React-Core-prebuilt (0.86.2)`; RNFBApp xcconfig got `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES=YES` and `-ivfsoverlay …/React-Core-prebuilt/React-VFS.yaml` |
| xcodebuild Debug RNFBApp | `xcodebuild -workspace tests/ios/testing.xcworkspace -scheme RNFBApp -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO -derivedDataPath /tmp/rnfb-r1-derived build` | 0 | `/tmp/rnfb-e2e-r1-rncore-debug.log`; `** BUILD SUCCEEDED **`; zero `-Wnon-modular-include-in-framework-module` diagnostics (log hits are compiler **flags**, not warnings) |
| xcodebuild Release RNFBApp | same, `-configuration Release` | 0 | `/tmp/rnfb-e2e-r1-rncore-release.log`; `** BUILD SUCCEEDED **`; same: zero diagnostics |
| Podfile revert | `git checkout -- tests/ios/Podfile tests/ios/Podfile.lock`; restore `pod install` with ENV `'0'` | 0 | `tests/ios` clean; ENV both `'0'` |
| lint (CI) | `yarn lint` | 0 | — |
| jest / tsc / e2e | n/a — skipped | — | podspec only; no `packages/app/lib/**` |

### R1 review evidence

Frozen-tree re-run. `harness narrowed: no` (xcodebuild pod-target compile; no e2e). Verdict: **green**, no findings. Coverage evidence package not required (podspec-only).

| Step | Command | Exit | Evidence |
| ---- | ------- | ---- | -------- |
| frozen diff | `git diff -- packages/` | — | `packages/app/RNFBApp.podspec` only |
| fmt | `rg 'spec\.version\|:tag' tests/node_modules/react-native/third-party-podspecs/fmt.podspec` | — | `12.1.0` |
| pod install (local force) | `tests/ios/Podfile` ENV both `'1'`, then `pod install` from `tests/ios` | 0 | `React-Core-prebuilt (0.86.2)`; xcconfig has both `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES=YES` and `DEFINES_MODULE=YES` |
| xcodebuild Debug | `xcodebuild -workspace tests/ios/testing.xcworkspace -scheme RNFBApp -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO -derivedDataPath /tmp/rnfb-r1-review-derived build` | 0 | `/tmp/rnfb-e2e-r1-review-debug.log`; `** BUILD SUCCEEDED **`; zero non-modular-include diagnostics |
| xcodebuild Release | same, `-configuration Release` | 0 | `/tmp/rnfb-e2e-r1-review-release.log`; `** BUILD SUCCEEDED **`; zero diagnostics |
| Podfile revert | `git checkout -- tests/ios/Podfile tests/ios/Podfile.lock`; restore `pod install` with ENV `'0'` | 0 | `tests/ios` clean; `Removing React-Core-prebuilt` |
| lint (CI) | `yarn lint` | 0 | — |
| coverage | n/a | — | podspec-only; no lib/native/.rb |

### R2 implementation evidence

`harness narrowed: no` (xcodebuild pod-target compile; no e2e). Native `.m`/`.mm` imports skipped: TurboModule umbrellas already include `RCTBridgeModule.h`. Template has no live target.

| Step | Command | Exit | Evidence |
| ---- | ------- | ---- | -------- |
| fmt | `rg 'spec\.version\|:tag' tests/node_modules/react-native/third-party-podspecs/fmt.podspec` | — | `12.1.0` |
| yarn | skipped re-yarn | — | `node_modules` present |
| pod install (local force) | Podfile ENV both `'1'`, `pod install` from `tests/ios` | 0 | `React-Core-prebuilt (0.86.2)`; all 15 RNFB xcconfigs got `CLANG_ALLOW…=YES` |
| xcodebuild (15 schemes × Debug+Release) | workspace + scheme + `-derivedDataPath /tmp/rnfb-r2-derived` | 0 all | logs `/tmp/rnfb-e2e-r2-<Scheme>-{debug,release}.log`; `** BUILD SUCCEEDED **`; zero non-modular-include diagnostics. Schemes: RNFBAnalytics, RNFBAppCheck, RNFBAppDistribution, RNFBAuth, RNFBCrashlytics, RNFBDatabase, RNFBFirestore, RNFBFunctions, RNFBInAppMessaging, RNFBInstallations, RNFBMessaging, RNFBML, RNFBPerf, RNFBRemoteConfig, RNFBStorage |
| Podfile revert | checkout + `pod install` ENV `'0'` | 0 | `Removing React-Core-prebuilt`; `tests/ios` clean |
| lint (CI) | `yarn lint` | 0 | — |
| jest / tsc / e2e | n/a | — | podspec only |

### R2 review evidence

Frozen-tree re-run. `harness narrowed: no`. **Not green.** Native-import skip accepted. Coverage n/a.

**serious:** `pod_target_xcconfig` assigned after `install_modules_dependencies` / `add_rncore_dependency` on `app-distribution`, `functions`, `in-app-messaging`, `installations`, `ml`, `perf`, `remote-config`, and `scripts/_TEMPLATE_`. Overwrites helper-injected `HEADER_SEARCH_PATHS` and `CLANG_CXX_LANGUAGE_STANDARD=c++20`. Prebuilt compile still passed because RN `post_install` restored VFS overlay; from-source (`RCT_USE_PREBUILT_RNCORE=0`, the `tests/ios` default) is the path storage already warns about. **Fix:** set `CLANG_ALLOW…=YES` in `pod_target_xcconfig` **before** the helpers, matching analytics/storage/R1.

**nit:** those after-assign pods copy a "public headers re-export" comment; they already use `private_header_files`.

| Step | Command | Exit | Evidence |
| ---- | ------- | ---- | -------- |
| frozen diff | `git diff -- packages/ scripts/` | — | 15 live podspecs + template; no `packages/app`; no native sources |
| fmt | `rg` fmt.podspec | — | `12.1.0` |
| pod install (local force) | ENV both `'1'`, `pod install` from `tests/ios` | 0 | `React-Core-prebuilt (0.86.2)` |
| xcodebuild 15 schemes × Debug+Release | workspace + scheme + `-derivedDataPath /tmp/rnfb-r2-review-derived` | 0 all | `/tmp/rnfb-e2e-r2-review-<Scheme>-{debug,release}.log`; zero non-modular diagnostics |
| Podfile revert | checkout + `pod install` ENV `'0'` | 0 | `Removing React-Core-prebuilt`; `tests/ios` clean |
| lint (CI) | `yarn lint` | 0 | — |
| coverage | n/a | — | podspec-only |

### R2 fix evidence

Serious xcconfig-order finding and nit comments addressed. `harness narrowed: no`. Seven live pods + template now set `pod_target_xcconfig` **before** RN helpers. Generated xcconfigs retain `c++20` and extra `HEADER_SEARCH_PATHS` (Yoga/React-debug).

| Step | Command | Exit | Evidence |
| ---- | ------- | ---- | -------- |
| fmt | `rg` fmt.podspec | — | `12.1.0` |
| pod install (local force) | ENV both `'1'` | 0 | 7 live pods: `CLANG_ALLOW…=YES`, `c++20`, extra HEADER_SEARCH_PATHS |
| xcodebuild 7 schemes × Debug+Release | workspace + scheme + `-derivedDataPath /tmp/rnfb-r2-fix-derived` | 0 all | `/tmp/rnfb-e2e-r2-fix-<Scheme>-{debug,release}.log`; zero non-modular diagnostics. Schemes: RNFBAppDistribution, RNFBFunctions, RNFBInAppMessaging, RNFBInstallations, RNFBML, RNFBPerf, RNFBRemoteConfig |
| Podfile revert | checkout + `pod install` ENV `'0'` | 0 | `tests/ios` git-clean |
| lint (CI) | `yarn lint` | 0 | — |

### R2 re-review evidence

Full frozen re-review after xcconfig-order fix. `harness narrowed: no`. Verdict: **green**, no findings. Coverage n/a. All 15 live specs + template set `pod_target_xcconfig` before RN helpers. Generated xcconfigs kept `CLANG_ALLOW…`, `c++20`, extra `HEADER_SEARCH_PATHS`.

| Step | Command | Exit | Evidence |
| ---- | ------- | ---- | -------- |
| frozen diff | `git diff --name-only -- packages/ scripts/` | — | 15 live podspecs + template; no `packages/app`; no native sources |
| fmt | `rg` fmt.podspec | — | `12.1.0` |
| pod install (local force) | ENV both `'1'` | 0 | `React-Core-prebuilt (0.86.2)`; all 15 debug xcconfigs: CLANG_ALLOW=YES, c++20, extra HEADER_SEARCH_PATHS |
| xcodebuild 15 schemes × Debug+Release | workspace + scheme + `-derivedDataPath /tmp/rnfb-r2-rereview-derived` | 0 all | `/tmp/rnfb-e2e-r2-rereview-<Scheme>-{debug,release}.log`; zero non-modular diagnostics |
| Podfile revert | checkout + `pod install` ENV `'0'` | 0 | `Removing React-Core-prebuilt`; `tests/ios` git-clean |
| lint (CI) | `yarn lint` | 0 | — |
| coverage | n/a | — | podspec-only |

### R3 gap analysis

Read-only. `harness narrowed: n/a`. No product edits. **No R3 commit.**

**Can show (already R1/R2):** every live RNFB pod scheme compiles Debug+Release under locally forced `RCT_USE_PREBUILT_RNCORE=1` / `RCT_USE_RN_DEP=1`, with `tests/ios` still `use_frameworks! :linkage => :dynamic` and `$RNFirebaseAsStaticFramework` unset. RNFB pods do not need static linkage or prebuilt-off to compile against prebuilt RNCore.

**Cannot show:** full `testing` app link/e2e with prebuilt on (Issue 2: `RNDeviceInfo` / `RNAppleAuthentication`); Expo `forceStaticLinking` drop (CPRN-153); flipping committed `tests/ios` ENV back to `1`.

**Docs:** `docs/ios-spm.mdx`, `CONTRIBUTING.md`, package READMEs, `tests/ios/Podfile` comments: keep. Expo sentence in `docs/index.mdx` (~101) deferred to CPRN-153 / not R3. ADR → R4.

### R4 documentation evidence

`harness narrowed: n/a`. Validation tier `none`. DRY scan of entire `okf-bundle/` by the documentation pass. **Ready for commit: yes.**

| File | Change |
| ---- | ------ |
| `okf-bundle/ios-spm-native-imports.md` | Decision 6, Prebuilt React-Core section, xcconfig-before-helpers review invariant |
| `okf-bundle/index.md` | Entry-point blurb now names prebuilt RNCore podspec wiring |
| `okf-bundle/testing/test-app-dependency-pins.md` | Names both third-party pods; links to the ADR for RNFB podspec opt-in |

Canonical **at the time**: SPM ADR owned RNFB podspec RNCore wiring. **Superseded by R6:** [ios-rncore-podspec.md](ios-rncore-podspec.md) is the owner; the SPM ADR only links. Pins own `tests/ios` `RCT_USE_PREBUILT_RNCORE=0`; queue stays ephemeral. Consumer `docs/index.mdx` / `docs/ios-spm.mdx` not edited.

### R5 post-rebase review evidence

Frozen committed product commits only (docs commit out of xcodebuild scope). `harness narrowed: no`. Verdict: **green**, no findings. Coverage n/a.

| Step | Command | Exit | Evidence |
| ---- | ------- | ---- | -------- |
| frozen diff | `git diff origin/main...HEAD -- packages/ scripts/_TEMPLATE_/` | — | 16 live podspecs + template; no native sources |
| fmt | `rg` fmt.podspec | — | `12.1.0` |
| pod install (local force) | ENV both `'1'`, `pod install` from `tests/ios` | 0 | `React-Core-prebuilt` (0.86.2); all 16 debug xcconfigs: `CLANG_ALLOW…=YES`, `c++20`, extra `HEADER_SEARCH_PATHS` |
| xcodebuild 16 schemes × Debug+Release | workspace + scheme + `-derivedDataPath /tmp/rnfb-r5-review-derived` | 0 all | `/tmp/rnfb-e2e-r5-review-<Scheme>-{debug,release}.log`; `** BUILD SUCCEEDED **`; zero non-modular-include diagnostics. Schemes: RNFBApp, RNFBAnalytics, RNFBAppCheck, RNFBAppDistribution, RNFBAuth, RNFBCrashlytics, RNFBDatabase, RNFBFirestore, RNFBFunctions, RNFBInAppMessaging, RNFBInstallations, RNFBMessaging, RNFBML, RNFBPerf, RNFBRemoteConfig, RNFBStorage |
| Podfile revert | checkout + `pod install` ENV `'0'` | 0 | `Removing React-Core-prebuilt`; `tests/ios` git-clean |
| lint (CI) | `yarn lint` | 0 | — |
| coverage | n/a | — | podspec-only |

xcconfig-order: pass on all 16 live specs + template (`pod_target_xcconfig` before helpers; no second hash). Observation, not a finding: RN 0.86 `install_modules_dependencies` already calls `add_rncore_dependency`, then the podspec calls it again (duplicate VFS overlay flags). Explicit guarded call is still required on the template.

---

## R1 — pilot acceptance checklist (draft)

- [x] `packages/app/RNFBApp.podspec` calls `add_rncore_dependency(s)` guarded by `defined?`, matching #9024's pattern
- [x] `packages/app/RNFBApp.podspec` sets `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES` in `pod_target_xcconfig`
- [x] Local `RCT_USE_PREBUILT_RNCORE=1` + `pod install` in `tests/ios` completes cleanly with these changes
- [x] Direct `xcodebuild` of the RNFBApp pod target succeeds Debug and Release, zero `-Wnon-modular-include-in-framework-module` warnings/errors (working invocation: workspace + scheme + `-derivedDataPath`; `-project Pods/Pods.xcodeproj` is not viable with SPM Firebase)
- [x] `RCT_USE_PREBUILT_RNCORE` reverted to `0` (or overrides discarded) before any other `tests/` command runs, so the unrelated dynamic-pod conflict isn't triggered outside this validation
- [x] `yarn lint` (js + deps + android + ios) green on the diff
- [x] Commit includes `Co-authored-by:` trailer crediting `wneel` (decision 9)

## R2 — rollout acceptance checklist (draft)

- [x] Same two podspec additions applied to the remaining files from #9024's file list (analytics, app-check, app-distribution, auth, crashlytics, database, firestore, functions, in-app-messaging, installations, messaging, ml, perf, remote-config, storage, `scripts/_TEMPLATE_`)
- [x] Same producer-side `xcodebuild` validation approach as R1, scoped to the affected pod targets
- [x] `yarn lint` green on the full diff

## R3 — Phase 2 proof (draft, scope TBD until R2 closes)

- [x] Confirm what "prove workaround removal" can concretely show given the [Issue 2 constraint](#required-maintainer-context): producer-side pod-target compile under prebuilt RNCore without `$RNFirebaseAsStaticFramework`; not a full `tests/` e2e run
- [x] No R3 doc rewrite: `docs/ios-spm.mdx` / CONTRIBUTING.md do not claim the static workaround is required for prebuilt; Expo `forceStaticLinking` sentence stays for CPRN-153
- [x] Record findings back on CPRN-237 (Discovery/Work Completed ledger)

## R4 — durable ADR write-up (draft)

- [x] Add a decision entry to [ios-spm-native-imports.md](ios-spm-native-imports.md) documenting `add_rncore_dependency` + `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES` as the chosen fix for prebuilt-RNCore compile visibility, cross-referencing the Issue 2 link-time gap as a known, separately-tracked limitation
- [x] **R6:** move that durable text to [ios-rncore-podspec.md](ios-rncore-podspec.md); SPM ADR only links

## R6 — review corrections (draft)

- [x] Live `packages/*/RNFB*.podspec` no longer call `add_rncore_dependency` after `install_modules_dependencies`
- [x] Template still calls `add_rncore_dependency` (no `install_modules_dependencies`)
- [x] Durable owner is [ios-rncore-podspec.md](ios-rncore-podspec.md); SPM ADR expansion reverted
- [x] PR body does not use `Fixes #8883`

### R6 evidence

`harness narrowed: no`. Product commit `58ead7795`. No second `xcodebuild`: this pass only removes a duplicate helper call that `install_modules_dependencies` already makes (R1/R2 compiles still stand for the Clang flag + xcconfig order). Issue 2 remains [CPRN-321](https://linear.app/invertase/issue/CPRN-321).

| Step | Command | Exit | Evidence |
| ---- | ------- | ---- | -------- |
| lint (CI) | `yarn lint` | 0 | google-java-format reported 116 files already formatted; no extra diff |

---

## Related product files (starting points)

- `packages/app/RNFBApp.podspec` — umbrella pod; Clang flag + xcconfig before helpers
- `scripts/_TEMPLATE_/RNFB_Template_.podspec` — still calls `add_rncore_dependency` itself
- `tests/ios/Podfile` — `RCT_USE_PREBUILT_RNCORE` / `RCT_USE_RN_DEP` env vars (do not commit local overrides)
- [ios-rncore-podspec.md](ios-rncore-podspec.md) — durable invariants
- [test app dependency pins](testing/test-app-dependency-pins.md) — `tests/` `PREBUILT=0` pin
