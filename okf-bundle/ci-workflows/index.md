# CI workflows

GitHub Actions job shape, platform reliability, and artifact triage.

## Platforms

* [iOS](ios.md) — simulator boot, logging, troubleshooting, [CI baseload policy](ios.md#ci-baseload-policy-instrumentation)
* [Android](android.md) — idling, adb teardown, native coverage
* [Other](other.md) — macOS e2e, Windows/shared

## Shared E2E dependencies

* [Agent command policy](../testing/agent-command-policy.md) — allowlisted install/prepare/validation/e2e commands for agents
* [Running e2e — agent rule](../testing/running-e2e.md#agent-rule-read-first) — e2e `yarn tests:*` detail; never invoke Jet/Detox/Metro directly
* [Test-runner orchestration (log triage)](../testing/running-e2e.md#test-runner-host-orchestration-log-triage-only) — ports 8090/8091, defer-run launch gate markers
* [Detox patches](detox-patches.md) — inventory, `ECOMPROMISED`, patch workflow
* [Cloud API quota triage](../testing/firebase-testing-project.md#ci-triage-cloud-api-quota-pressure) — live FIS/RC pressure (all platforms)
* [iOS diagnostics](ios.md#operational-notes) — `resource-monitor.sh`, `flake-summary.sh`, [CI baseload / load settle](ios.md#ci-baseload-policy-instrumentation)

## Related

* [Running e2e tests](../testing/running-e2e.md) — local runbook; CI variants noted per platform
* [Coverage design](../testing/coverage-design.md) — e2e coverage, Codecov flags/gates
