# CI workflows

GitHub Actions job shape, platform reliability, and artifact triage.

## Platforms

* [iOS](ios.md) — simulator boot, logging, troubleshooting
* [Android](android.md) — idling, adb teardown, native coverage
* [Other](other.md) — macOS Jet/Metro, Windows/shared

## Shared E2E dependencies

* [Detox patches](detox-patches.md) — inventory, `ECOMPROMISED`, patch workflow
* [iOS diagnostics](ios.md#operational-notes) — `resource-monitor.sh`, `flake-summary.sh`

## Related

* [Running e2e tests](../testing/running-e2e.md) — local runbook; CI variants noted per platform
* [Coverage design](../testing/coverage-design.md) — e2e coverage, Codecov flags/gates
