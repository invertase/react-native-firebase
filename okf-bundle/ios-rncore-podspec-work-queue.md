---
type: Reference
title: iOS RNCore prebuilt podspec work queue
description: Ephemeral tracker for wiring add_rncore_dependency + non-modular-includes into RNFB podspecs for RN 0.84+ prebuilt RNCore (CPRN-237, upstream PR #9024).
tags: [ios, podspec, rncore, cocoapods, work-queue]
timestamp: 2026-08-17T00:00:00Z
---

# iOS RNCore prebuilt podspec — work queue

> **Goal:** Land a maintainer-owned, same-repo reimplementation of invertase/react-native-firebase#9024 (`add_rncore_dependency` + `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES` in every RNFB podspec), stacked on invertase/react-native-firebase#9192 (`split-tests-e2e-app-decouple-macos`), pilot-first on `packages/app`, then rolled out to the remaining podspecs, then used to document what Phase 2 (workaround-removal proof) can and can't currently show.
> **Linear:** [CPRN-237](https://linear.app/invertase/issue/CPRN-237/track-pr-9024-rnfb-podspec-add-rncore-dependency-non-modular-includes) — Queue line set to `okf-work-queue` (`okf-bundle/ios-rncore-podspec-work-queue.md`).
> **Upstream:** invertase/react-native-firebase#9024 (fork PR, producer-side fix — reimplemented here, not merged as-is). Consumer-side fix already upstream: facebook/react-native#56862 (in RN 0.86.2). Root issue: invertase/react-native-firebase#8883.

Ephemeral tracker; see [OKF policy](documentation-policy.md). Work types / tiers / gate field ids: [iteration vocabulary](testing/iteration-vocabulary.md). **Loop, gates, host rule, harness:** [change authoring workflow](testing/change-authoring-workflow.md) — not restated here. **Agent commands:** [agent command policy](testing/agent-command-policy.md) only. Compile-boundary background: [iOS SPM native integration decisions](ios-spm-native-imports.md).

---

## Locked decisions (2026-08-17 grill session)

| # | Decision |
| - | -------- |
| 1 | Reimplement #9024's podspec/`.m` changes on a **new same-repo branch**, not on `wneel`'s fork branch — native GitHub stacked PRs exclude forks. |
| 2 | Stack the new branch on top of **#9192**'s branch (`split-tests-e2e-app-decouple-macos`) via GitHub's native stacked-PR feature (main ← #9192 ← this branch). |
| 3 | Queue covers **both** CPRN-237 phases: Phase 1 (land the podspec fix) and Phase 2 (workaround-removal proof). |
| 4 | **Pilot first:** `packages/app` only (R1), proving the pattern before rolling out to the remaining ~14 podspecs (R2). |
| 5 | **Validation floor (accepted exception):** a direct `xcodebuild` compile of the RNFB pod target(s) under a locally-forced `RCT_USE_PREBUILT_RNCORE=1`, not full `tests/` e2e — see [Required maintainer context](#required-maintainer-context) for why. User-accepted deferral, recorded 2026-08-17. |
| 6 | The `react-native-device-info` / `@invertase/react-native-apple-authentication`-under-prebuilt-RNCore link-time conflict (discovered on #9192) is **out of scope** for this queue — tracked only via the [CPRN-237 discovery comment](https://linear.app/invertase/issue/CPRN-237#comment-8b021722), no fix item here. |
| 7 | Phase 2 validation is **bare RN CLI only** (via `tests/`); Expo is explicitly deferred to CPRN-153 (separate, non-blocking). |
| 8 | invertase/react-native-firebase#8994 (draft build-harness apps) is **not a dependency** of this queue — revisit opportunistically if it's further along by R3. |
| 9 | Attribution: credit `wneel` via `Co-authored-by:` trailers on the reimplemented commit(s). Russell will message #9024 himself once the new PR is in draft — not an agent/queue action item. |
| 10 | Human gate: CPRN-237's "Agent Suitable? Needs human first" flag is satisfied by this grill session for the overall approach; each item below follows [change authoring workflow](testing/change-authoring-workflow.md). |

---

## Required maintainer context

**Two independent problems, only one is in scope here:**

1. **Compile-time / header-visibility (in scope):** RNFB podspecs never opted into React Native's `add_rncore_dependency` helper, so under `RCT_USE_PREBUILT_RNCORE=1` (RN 0.84+ default), RNFB source can't resolve `<React/RCTConvert.h>` and friends. Separately, RNFBApp's umbrella header re-exporting `<React/...>` imports trips `-Werror,-Wnon-modular-include-in-framework-module` under `use_frameworks!`. Both fixed by two additions to every RNFB podspec — this is what R1/R2 below do.
2. **Link-time / dynamic-linkage (out of scope, tracked separately):** `tests/ios/Podfile` (on #9192) keeps `RCT_USE_PREBUILT_RNCORE=0` because `react-native-device-info` and `@invertase/react-native-apple-authentication` (both dynamic pods, like `tests/`'s SPM-dynamic Firebase setup) fail to link (`undefined RCTEventEmitter`) under prebuilt RNCore. This is undocumented upstream and unrelated to RNFB's own podspecs — see [CPRN-237 discovery](https://linear.app/invertase/issue/CPRN-237#comment-8b021722). **Consequence:** `tests/` cannot exercise problem 1's fix end-to-end with prebuilt RNCore actually on, so R1/R2 use a direct pod-target `xcodebuild` compile instead of `tests/` e2e as their evidence floor (decision 5 above).

**Stack mechanics:**

- Trunk: `main`. Bottom of stack: #9192 (`split-tests-e2e-app-decouple-macos`, already open). Top of stack: this queue's new branch, based on `split-tests-e2e-app-decouple-macos`.
- Branch name (proposed, confirm before creating): `ios-podspec-rncore-prebuilt`.
- Create via `gh stack` CLI extension (`gh stack init --base split-tests-e2e-app-decouple-macos`) if installed, or manually: branch from `origin/split-tests-e2e-app-decouple-macos`, push, open a PR with base = `split-tests-e2e-app-decouple-macos`, select "Create stack" on GitHub.
- Every commit in the stack is still evaluated against the stack's trunk (`main`) for branch protection/CI, per GitHub's stacked-PR docs — no CI config changes needed.
- Open the PR as **draft** (per repo GitHub-voice convention). Russell messages #9024 once it's in draft (decision 9) — not a queue action item.

---

## Phase ordering

| Item | Focus | Why |
| ---- | ----- | --- |
| **R1** | `packages/app` pilot | Prove `add_rncore_dependency` + `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES` compile clean under prebuilt RNCore on the umbrella pod first |
| **R2** | Remaining ~14 podspecs | Roll the proven pattern out, mirroring #9024's file list |
| **R3** | Phase 2 — bare RN CLI workaround-removal proof | Once #9192's RN 0.86.2 bump is available on the branch; producer-side proof only (see [context](#required-maintainer-context)) |
| **R4** | Durable ADR write-up | Fold the proven pattern into [ios-spm-native-imports.md](ios-spm-native-imports.md) once R2 closes |
| **R5** | PR handoff | Mark stacked PR ready; fresh-eyes review ([Cross Platform guide § Step 7](https://linear.app/invertase/document/cross-platform-issue-authoring-and-agent-workflow-guide-2b429e4aace0#step-7--fresh-eyes-review-before-merge)) |

---

## Resume checklist

1. Confirm `origin/split-tests-e2e-app-decouple-macos` is fetchable and current before branching (#9192 may have moved since 2026-08-17).
2. Create/checkout the stacked branch (see [stack mechanics](#required-maintainer-context)) before any product edit.
3. [Pre-flight](testing/running-e2e.md#pre-flight-is-the-host-clear-to-start) still applies for any `tests:*` command run during R3, even though R1/R2 use direct `xcodebuild` rather than `yarn tests:ios:test-cover`.
4. **R1/R2 evidence shape (non-standard — read before running):** the platform-coverage e2e-evidence rule in [change authoring § validation evidence](testing/change-authoring-workflow.md#validation-evidence-blocking) is overridden for this queue only, per [decision 5](#locked-decisions-2026-08-17-grill-session). Record the `xcodebuild` command, target, and exit code — not an e2e pass count — as the implementation/review evidence for R1 and R2.
5. Never commit `tests/ios/Podfile.lock` changes made only to locally force `RCT_USE_PREBUILT_RNCORE=1` for validation.

---

## Item arbiter

| Item | Scope | `commit_subject` | `implementation_gate` | `review_gate` | `commit_gate` | `next_work_type` | `validation_tier` | `platform` | Notes |
| ---- | ----- | ---------------- | ---------------------- | ------------- | ------------- | ----------------- | ------------------- | ---------- | ----- |
| **R1** | `packages/app` podspec + `.m` changes, pilot | `fix(app, ios): wire add_rncore_dependency for prebuilt RNCore` | closed | closed | closed | `commit` | `area-focused` (evidence: `xcodebuild` compile, not e2e — see resume checklist #4) | `ios` | All gates closed. Docs scan ready (decision 10 now links change authoring; no durable ADR). Product: `packages/app/RNFBApp.podspec` only. Coverage n/a. See [R1 implementation evidence](#r1-implementation-evidence) and [R1 review evidence](#r1-review-evidence). |
| **R2** | Remaining ~14 podspecs + `.m` files, mirroring #9024's file list | `fix(ios): wire add_rncore_dependency across remaining podspecs for prebuilt RNCore` | closed | closed | closed | `commit` | `area-focused` (same evidence shape as R1) | `ios` | All gates closed. Re-review green, no findings. xcconfig before helpers on all remaining specs. Native-import skip accepted. Coverage n/a. See [R2 re-review evidence](#r2-re-review-evidence). |
| **R3** | Phase 2 producer-side workaround-removal proof, bare RN CLI, doc note | TBD — set once scope of any doc change is known | open | open | open | `gap-analysis` | `unit-focused` | `ios` | Unblocked. R2 committed. Stack still based on #9192; local branch may be behind `origin/split-tests-e2e-app-decouple-macos` (do not rebase without re-review). |
| **R4** | Durable ADR addition to `ios-spm-native-imports.md` | TBD — may fold into R2's or R3's commit if small | open | open | open | — | `none` | — | Unblocked on R2 `review_gate`. Not folded into R2 (keep ADR as its own commit). Pickup after R3 unless R3 is docs-only. |
| **R5** | Mark stacked PR ready; fresh-eyes review | — (no commit, PR-state change only) | open | open | — | — | `none` | — | Blocked on R1-R4. Fresh-eyes review per [Cross Platform guide § Step 7](https://linear.app/invertase/document/cross-platform-issue-authoring-and-agent-workflow-guide-2b429e4aace0#step-7--fresh-eyes-review-before-merge) — propose, don't assume. |

**Current gates:** R1 and R2 all closed. **Next pickup:** R3 (`gap-analysis` for Phase 2 workaround-removal proof). **Current snapshot:** R2 memorialized on `ios-podspec-rncore-prebuilt`.

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

- [ ] Confirm what "prove workaround removal" can concretely show given the [Issue 2 constraint](#required-maintainer-context): likely limited to "producer-side compiles clean without `$RNFirebaseAsStaticFramework`/`RCT_USE_PREBUILT_RNCORE=0`", not a full `tests/` e2e run
- [ ] Update any doc/comment that still describes the workaround as required, if the diff shows otherwise (e.g. `docs/ios-spm.mdx`, CONTRIBUTING.md, if applicable)
- [ ] Record findings back on CPRN-237 (Discovery/Work Completed ledger)

## R4 — durable ADR write-up (draft)

- [ ] Add a decision entry to [ios-spm-native-imports.md](ios-spm-native-imports.md) documenting `add_rncore_dependency` + `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES` as the chosen fix for prebuilt-RNCore compile visibility, cross-referencing the Issue 2 link-time gap as a known, separately-tracked limitation

---

## Related product files (starting points)

- `packages/app/RNFBApp.podspec` — pilot target
- `scripts/_TEMPLATE_/RNFB_Template_.podspec` — template podspec, keep in sync so future packages inherit the pattern
- `tests/ios/Podfile` — `RCT_USE_PREBUILT_RNCORE` / `RCT_USE_RN_DEP` env vars (do not commit local overrides)
- [ios-spm-native-imports.md](ios-spm-native-imports.md) — R4 target
- Full #9024 file list (for R2 scope): all `packages/*/RNFB*.podspec` except `ml` and `perf` subtleties already noted in that PR's diff — re-derive from `gh pr view 9024 --json files` rather than trusting this list to stay current
