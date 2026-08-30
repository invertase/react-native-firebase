# Coverage baseline artifacts

Permanent baseline-capture output for native (and macOS JS) coverage stability.

## Files

| Path | Commit? | Purpose |
|------|---------|---------|
| `coverage-baseline.json` | yes | Latest summary: runs, primary metrics, variance vs provisional T, recommendation |
| `coverage-baseline.schema.json` | yes | JSON schema for the summary |
| `runs/<platform>-run<N>/` | no (gitignored) | Per-run snapshots (LCOV / Jacoco XML + `capture.json`) |

## Capture after a Law `:test-cover` cycle (slot 1 example)

```bash
eval "$(yarn tests:e2e:export-slot-env android 1)"   # full carry-in for the slot
# … packager / emulator / pod:install / :build per running-e2e.md § slot-lifecycle …
yarn tests:android:test-cover
yarn tests:android:post-e2e-coverage
yarn tests:coverage:capture-baseline --platform=android --run=1 --slot=1 \
  --log=/tmp/rnfb-e2e-android-r1.log --exit-code=$?

yarn tests:ios:test-cover
yarn tests:ios:test:process-coverage
yarn tests:coverage:capture-baseline --platform=ios --run=1 --slot=1 \
  --log=/tmp/rnfb-e2e-ios-r1.log --exit-code=$?

yarn tests:macos:test-cover
yarn tests:coverage:capture-baseline --platform=macos --run=1 --slot=1 \
  --log=/tmp/rnfb-e2e-macos-r1.log --exit-code=$?
```

`--log` is optional local diagnostics only. Omit it (or leave `logPath` null) in committed `coverage-baseline.json` — do not embed queue or work-item paths.


Repeat with `--run=2`, then:

```bash
yarn tests:coverage:capture-baseline --finalize --threshold=1
```

## Metrics

- **iOS (native):** `packagesHits`, `sourceFileCount` from `coverage/ios-native/lcov.info`; `trackedImageCount` (RNFB\*.framework images).
- **Android (native):** Jacoco LINE/INSTRUCTION counters from merged `jacocoTestReport.xml` (invertase packages + report totals); `.ec` presence note (post-e2e deletes `.ec` after a successful report).
- **macOS:** JS NYC `coverage/lcov.info` only — **no RNFB native coverage** (firebase-js-sdk path). Documented in `okf-bundle/testing/coverage-design.md`.

Primary metric for variance: iOS/macOS `packagesHits`; Android `packages.lineCovered`.
