# RNFB Build Harness

This app is a checked-in bare React Native harness for manual build validation, Firebase setup checks, and native dependency override testing.

## What it is for

- verifying the local workspace packages build and autolink correctly
- trying published `@react-native-firebase/*` versions without touching `tests/`
- swapping Firebase iOS / Android native SDK versions through supported override hooks
- reusing local `GoogleService-Info.plist` and `google-services.json` files without committing them

## Quick start

From the repo root:

```bash
yarn app:sync
yarn app:start
yarn app:ios
# or
yarn app:android
```

By default the sync script looks for:

- `~/Downloads/GoogleService-Info.plist`
- `~/Downloads/google-services.json`

Those paths are persisted in the ignored file `apps/build-harness/.build-harness.local.json` after the first sync.

## Useful overrides

```bash
bash ./scripts/sync-build-harness.sh sync \
  --firebase-ios 12.13.0 \
  --firebase-android-bom 34.13.0 \
  --google-services-gradle 4.4.4
```

Switch to published RNFB packages:

```bash
bash ./scripts/sync-build-harness.sh sync \
  --rnfb-source published \
  --rnfb-version 24.0.0
```

Override the iOS bundle identifier and Android application id used by the harness:

```bash
bash ./scripts/sync-build-harness.sh sync \
  --ios-bundle-id io.invertase.react-native-demo \
  --android-application-id com.invertase.testing
```

## Notes

- The harness defaults come from `packages/app/package.json` for Firebase JS, Firebase iOS SDK, Android BOM, and Gradle plugin versions.
- The Android namespace stays fixed at `com.invertase.testing`; the script only overrides `applicationId`, which is sufficient for `google-services.json` matching.
- The iOS bundle identifier is patched into the Xcode project by the sync script, which also makes sure `GoogleService-Info.plist` is added to the app target resources.
- The module list in `App.tsx` confirms that the JavaScript layer loads; it is not a substitute for running a native build and checking runtime behavior.
- This app is intentionally separate from `tests/`, which remains the CI / Detox harness.
