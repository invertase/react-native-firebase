# RNFB Bare Build Harness

This app is the bare React Native CLI harness under `apps/build-harness/`.

For the full shared guide covering both the bare and Expo harnesses, see [`../README.md`](../README.md).

## Use this harness for

- checked-in native project validation
- Podfile and Gradle override validation
- direct `react-native run-ios` and `react-native run-android` flows

## Common commands

From the repo root:

```bash
yarn app:doctor
yarn app:sync
yarn app:start
yarn app:ios
# or
yarn app:android
```

For direct script usage and all supported flags, see:

- [`../README.md`](../README.md)
- `scripts/sync-build-harness.sh --help`

## Notes

- The bare harness patches the iOS Xcode project directly and keeps the Android namespace fixed at `com.invertase.testing`.
- Local Firebase config files copied into this app remain ignored and should stay local.
- This app is intentionally separate from `tests/`, which remains the CI and Detox harness.
