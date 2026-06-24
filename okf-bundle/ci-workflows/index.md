# CI workflows

Knowledge for GitHub Actions workflows in this repository: how jobs are structured, platform-specific reliability concerns, and how to debug failures from CI artifacts.

## Platforms

* [iOS](ios.md) — simulator boot reliability, logging, and troubleshooting
* [Android](android.md) — idling resources, adb teardown, native coverage pull
* [Other](other.md) — macOS Jet e2e (Metro bundle startup), Windows, and shared workflow concerns

## Shared E2E dependencies

* [Detox yarn patches](detox-patches.md) — inventory, `ECOMPROMISED` lock flake, headless patch update workflow
* [iOS diagnostic scripts](ios.md#operational-notes) — `resource-monitor.sh`, `flake-summary.sh` (artifact helpers for flake triage)

## Related

* [Running e2e tests](../testing/running-e2e.md) — the local e2e runbook (CI uses the same yarn targets, with `-ci`/`--headless`/release variants noted per platform below)
* [Testing / coverage design](../testing/coverage-design.md) — e2e coverage collection, Codecov flags, and upload gates
