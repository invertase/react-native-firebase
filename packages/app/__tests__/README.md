## Firebase SPM dependency tests

Unit tests for `firebase_spm.rb` — the shared helper that declares Firebase dependencies with SPM support and CocoaPods fallback.

### How to run

```bash
ruby __tests__/firebase_spm_test.rb
```

### Shape-check suite (`firebase_spm_shape_test.rb`)

A companion, opt-in Minitest suite — not a replacement for `firebase_spm_test.rb`. `firebase_spm_test.rb` mocks the `Xcodeproj`/`CocoaPods` classes `firebase_spm.rb` depends on (`MockAggregateTarget`, `MockInstaller`, `MockRootObject`, `MockBuildConfig`, `MockTarget`, `MockUserProject`, `MockBuildType`, etc.) so the helper's post-install logic can be unit-tested without those gems installed. A mock is only ever as accurate as the person who wrote it, and this exact PR shipped a bug of that class (`MockAggregateTarget#build_as_static?` modeled as a directly-settable flag, when the real `Pod::Target#build_as_static?` is unconditionally `true` — the actual per-install signal is `target_definition.build_type.static?`), which only surfaced via a real `pod install`.

`firebase_spm_shape_test.rb` asserts, against the **real** `xcodeproj`/`cocoapods` gems, that every mocked class/method in `firebase_spm_test.rb` still has the shape those mocks assume — so a future CocoaPods/Xcodeproj release that changes that shape fails in seconds instead of ~20 minutes into a real `pod install` in the E2E jobs.

It skips cleanly (no failure, no tests defined) when `xcodeproj`/`cocoapods` aren't installed, so it is always safe to run unconditionally:

```bash
ruby __tests__/firebase_spm_shape_test.rb
```

- **"Test Firebase SPM Helper" step** (`tests_jest.yml`) never installs these gems — the suite is expected to skip there.
- **"Verify Firebase SPM Xcodeproj/CocoaPods API shape" step** (`tests_e2e_ios.yml`, iOS job, debug+spm matrix cell) does have them and runs the suite for real, right after that job's existing `gem update cocoapods xcodeproj` step — no new CI job, no new gem installs.

### Embed-script suite (`firebase_spm_embed_script_test.rb`)

Exercises the bash body of `rnfirebase_spm_embed_script` (`embed_frameworks_from`) against real Mach-O frameworks built with `clang`/`ar`. This is what catches Archive-embed regressions like #9154 (static CocoaPods frameworks incorrectly copied into the app bundle). No `cocoapods`/`xcodeproj` gems needed.

Skips cleanly off macOS or when `clang`/`ar`/`file` are missing:

```bash
ruby __tests__/firebase_spm_embed_script_test.rb
```

Wired as **"Verify Firebase SPM embed script framework filter"** in `tests_e2e_ios.yml` (iOS job, debug+spm matrix cell), next to the shape-check step and before Pod Install.

### What is `Pod::Specification` and why is it mocked?

`Pod::Specification` is the core CocoaPods class — it's the `s` object used inside every `.podspec` file to declare things like `s.dependency`, `s.name`, `s.version`, etc. We mock it with a simple class that records `dependency` calls, so we can run the tests without installing CocoaPods.

### Test flow

1. A mock `Pod::Specification` captures `dependency` calls.
2. `firebase_dependency()` is called with known inputs (version, SPM products, CocoaPods pods).
3. Assertions verify which path executed and with what arguments.

### Tests

| Test                                                                        | What it verifies                                                                                                                                                                                                                           | Path           | Flow                                                                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | -------------------------------------------------------------------------------------------------------- |
| `test_cocoapods_single_pod`                                                 | When SPM is not available, a single Firebase pod (like Auth) is added as a CocoaPods dependency with the correct name and version.                                                                                                         | CocoaPods      | `spm_dependency` undefined → `spec.dependency('Firebase/Auth', '12.10.0')` called once                   |
| `test_cocoapods_multiple_pods`                                              | When SPM is not available and a module needs multiple pods (like Crashlytics + CoreExtension), all of them are added as CocoaPods dependencies.                                                                                            | CocoaPods      | `spm_dependency` undefined → `spec.dependency` called twice (Crashlytics + CoreExtension)                |
| `test_spm_single_product`                                                   | When SPM is available, the Firebase dependency is declared via Swift Package Manager instead of CocoaPods, using the correct URL, version, and product name.                                                                               | SPM            | `spm_dependency` defined → called with `['FirebaseAuth']`, `spec.dependency` not called                  |
| `test_spm_multiple_products_ignores_cocoapods_extras`                       | When SPM is available, only the SPM product names are used. Extra CocoaPods-only dependencies (like FirebaseCoreExtension) are correctly ignored because SPM resolves them automatically as transitive dependencies.                       | SPM            | `spm_dependency` defined → called with `['FirebaseCrashlytics']` only, ignores CocoaPods extras          |
| `test_reads_spm_url_from_package_json`                                      | The Firebase SPM repository URL is read from `package.json` instead of being hardcoded, ensuring a single source of truth for the SDK location.                                                                                            | Config         | `$firebase_spm_url` reads from `package.json` → `https://github.com/firebase/firebase-ios-sdk.git`       |
| `test_spm_path_sets_active_flag`                                            | Taking the SPM path in `firebase_dependency` sets `$rnfirebase_spm_active`, which `rnfirebase_add_spm_embed_phase` uses to decide whether to run — no reflection into RN-internal state.                                                   | Embed flag     | SPM path taken → `$rnfirebase_spm_active` becomes truthy                                                 |
| `test_cocoapods_path_does_not_set_active_flag`                              | The CocoaPods path never sets the flag.                                                                                                                                                                                                    | Embed flag     | CocoaPods path taken → `$rnfirebase_spm_active` stays falsy                                              |
| `test_disabled_spm_does_not_set_active_flag_even_if_spm_dependency_defined` | `$RNFirebaseDisableSPM = true` forces CocoaPods even when `spm_dependency` exists, and must not set the flag.                                                                                                                              | Embed flag     | `$RNFirebaseDisableSPM = true` → flag stays falsy                                                        |
| `test_embed_phase_noop_when_spm_not_active`                                 | `rnfirebase_add_spm_embed_phase` returns immediately (never touches `installer`) when Firebase isn't using SPM — safe to always call from a Podfile.                                                                                       | Embed phase    | `$rnfirebase_spm_active` falsy → no-op, installer never walked                                           |
| `test_embed_phase_noop_without_cp_embed_pods_frameworks_phase`              | No RNFB phase is added to a target that has no `[CP] Embed Pods Frameworks` phase, and the project is not saved.                                                                                                                           | Embed phase    | No matching CocoaPods phase → no changes, no save                                                        |
| `test_embed_phase_adds_phase_when_active_and_cp_phase_present`              | The `[RNFB] Embed Firebase SPM Frameworks` phase is added with the correct script/paths, and the project is saved exactly once.                                                                                                            | Embed phase    | Matching CocoaPods phase found → RNFB phase added + project saved                                        |
| `test_embed_phase_is_idempotent_across_repeated_pod_installs`               | Running the embed-phase logic twice (i.e. two `pod install`s) reuses the existing phase instead of duplicating it.                                                                                                                         | Embed phase    | Phase added once and updated in place on subsequent runs                                                 |
| `test_hook_wraps_original_method_and_calls_embed_phase`                     | `rnfirebase_hook_cocoapods_post_install!` wraps CocoaPods' own `run_podfile_post_install_hooks`, still runs the original behavior, and calls `rnfirebase_add_spm_embed_phase` with the installer afterward — no RN-internal hook involved. | CocoaPods hook | Fake `Pod::Installer`-shaped class → original called once, embed phase called once with the instance     |
| `test_hook_preserves_original_method_privacy`                               | The patched method stays private if it was private beforehand (matches real `Pod::Installer#run_podfile_post_install_hooks`), keeping the patch's footprint minimal.                                                                       | CocoaPods hook | Original private → patched version still private                                                         |
| `test_hook_is_idempotent_across_repeated_podspec_requires`                  | Multiple RNFB podspecs requiring `firebase_spm.rb` in the same `pod install` process must not double-wrap the method.                                                                                                                      | CocoaPods hook | Hook installed twice → original/embed phase still each called exactly once                               |
| `test_hook_swallows_embed_phase_errors_without_breaking_original_hook`      | A bug in our own embed-phase logic must not break CocoaPods' own post-install behavior or its return value.                                                                                                                                | CocoaPods hook | `rnfirebase_add_spm_embed_phase` raises → original hook still completes and its result is still returned |
| `test_hook_noop_when_hook_method_does_not_exist`                            | Guards against a future CocoaPods release renaming/removing `run_podfile_post_install_hooks` — must not raise.                                                                                                                             | CocoaPods hook | Target method missing → no-op, no alias created                                                          |
| `test_hook_noop_when_installer_class_is_nil`                                | Mirrors production when `Pod::Installer` isn't defined (e.g. outside a real CocoaPods environment) — must not raise.                                                                                                                       | CocoaPods hook | `installer_class` is `nil` → no-op                                                                       |
