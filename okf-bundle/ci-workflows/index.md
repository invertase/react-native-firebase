# CI workflows

GitHub Actions job shape, platform reliability, and artifact triage.

## Platforms

* [iOS](ios.md) — **`xcode-27`** + **Xcode 27** + **iOS 27.0** runtime, **Device Hub** boot, XCTest unit (`yarn tests:ios:unit`), logging, troubleshooting, [CI baseload policy](ios.md#ci-baseload-policy-instrumentation); [Tart lab suspended](../testing/local-ios-e2e-reproduction.md#status-suspended)
* [Android](android.md) — JVM unit step, idling, adb teardown, merged Jacoco / native coverage
* [Other](other.md) — macOS e2e, Windows/shared

## Shared E2E dependencies

* **Firebase emulator Actions cache** — key `firebase-emulators-v2-<installed firebase-tools version>` (from `node_modules` after yarn) with restore-keys prefix `firebase-emulators-v2-` (cross-OS, path `~/.cache/firebase/emulators`). **Save only from Android e2e on `main`**; iOS and Other restore-only (avoids parallel sticky-save races for deterministic downloads).
* **Metro bundler Actions cache** — sticky per-platform keys (`*-android-metro-v2-*`, `*-ios-metro-v2-*`, `*-macos-metro-v2-*`) from content `hashFiles` over `yarn.lock`, tests entry/metro config, and `packages/*/package.json` + `packages/*/lib/**` (macOS also hashes `tests-macos` entry files). **No `github.run_id`.** Save only on `main`, iteration `0`, exact restore miss (`cache-hit != 'true'`); iOS save further limited to debug. See [Android](android.md#metro-bundler-cache), [iOS](ios.md#metro-bundler-cache), [Other](other.md#metro-bundler-cache).
* **Xcode ccache (`hendrikmuhs/ccache-action`)** — sticky content-hash keys with `append-timestamp: false` (no run-id/timestamp suffix). Key dimensions keep caches distinct: iOS e2e uses `buildmode` (SPM-only matrix); archive is a single SPM-only key; macOS is a single key; Expo iOS link probe uses `expo-link` (`…-expo-link-ios-v1-xcode27-…`); RN CLI bare iOS probe uses `rn-bare` / `rn-bare-dynfb` (`…-rn-bare-ios-v1-xcode27-…` / `…-rn-bare-dynfb-ios-v1-xcode27-…`). Hash inputs: e2e/macos use `yarn.lock`, `packages/*/*.podspec`, `packages/*/ios/**`, plus the platform `Podfile.lock`; Expo probe hashes `yarn.lock`, `test-expo/**`, and app-package iOS/plugin inputs; RN bare probe hashes `yarn.lock`, `test-rn-bare/**`, and app-package iOS/plugin/ruby inputs (dynfb also `packages/app/package.json`). Save on `main` only; e2e/macos further limit to `matrix.iteration == 0` (first writer wins on the exact sticky key). See [iOS](ios.md#xcode-ccache), [Other](other.md#xcode-ccache).
* [Agent command policy](../testing/agent-command-policy.md) — allowlisted install/prepare/validation/e2e commands for agents; Expo documented-path iOS **link** is `yarn test-expo:ios:link` (not Detox); RN CLI prebuilt RNCore iOS **build** is `yarn test-rn-bare:ios:build` (not Detox)
* [Running e2e — agent rule](../testing/running-e2e.md#agent-rule-read-first) — e2e `yarn tests:*` detail; never invoke Jet/Detox/Metro directly
* [Test-runner orchestration (log triage)](../testing/running-e2e.md#test-runner-host-orchestration-log-triage-only) — ports 8090/8091, defer-run launch gate markers
* [Detox patches](detox-patches.md) — inventory, `ECOMPROMISED`, patch workflow
* [Cloud API quota triage](../testing/firebase-testing-project.md#ci-triage-cloud-api-quota-pressure) — live FIS/RC pressure (all platforms)
* [iOS diagnostics](ios.md#operational-notes) — `resource-monitor.sh`, `flake-summary.sh`, [CI baseload / load settle](ios.md#ci-baseload-policy-instrumentation)

## Related

* [Running e2e tests](../testing/running-e2e.md) — local runbook; CI variants noted per platform
* [Coverage design](../testing/coverage-design.md) — e2e coverage, Codecov flags/gates; [iOS XCTest](../testing/ios-architecture-decisions.md#iostest-ad-1) (`yarn tests:ios:unit`); [iOS Ruby SimpleCov](../testing/coverage-design.md#ios-ruby-simplecov) (`yarn tests:ios:ruby`, flag `ios-ruby` on `tests_e2e_ios.yml` only)
