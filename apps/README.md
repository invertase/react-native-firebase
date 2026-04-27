# RNFB Build Harnesses

This directory is the main setup guide for the local RNFB harness apps:

- `apps/build-harness/` for bare React Native CLI validation
- `apps/build-harness-expo/` for Expo development-build validation

Use the bare harness when you need to validate checked-in native projects, Podfile changes, Gradle changes, or direct `react-native run-*` behavior.

Use the Expo harness when you need to validate RNFB Expo config plugins, `expo prebuild`, and `expo run:*` behavior.

## What these harnesses are for

- validating local workspace `@react-native-firebase/*` packages without touching `tests/`
- comparing workspace packages with published RNFB packages
- swapping Firebase iOS and Android native SDK versions through supported override hooks
- reusing local `GoogleService-Info.plist` and `google-services.json` files without committing them
- smoke-testing that the JavaScript layer loads before doing deeper native validation

## Environment setup

Set up these local prerequisites before running either harness:

- `node` and `yarn`
- `ruby` via a user-managed install such as `rbenv`, `asdf`, or Homebrew Ruby
- `pod` on macOS for iOS builds and Expo iOS prebuilds
- Xcode and iOS simulator support for iOS
- Android SDK, platform tools, emulator/device access, and a valid `ANDROID_HOME` or `ANDROID_SDK_ROOT` for Android

Avoid using the macOS system Ruby for the harnesses. The bare harness uses Bundler for CocoaPods and Ruby helpers, and `apps/build-harness/Gemfile.lock` pins the Bundler version that must be available in your active Ruby environment.

For example with `rbenv`:

```bash
rbenv install 3.3.3
rbenv global 3.3.3
```

Then reload your shell and run `yarn app:doctor`. The doctor command reports the active Ruby path plus any Bundler mismatch against `apps/build-harness/Gemfile.lock`.

Only install Bundler manually if `yarn app:doctor` reports that Bundler is missing or mismatched:

```bash
gem install bundler -v "$(awk '/^BUNDLED WITH$/{getline; gsub(/^[[:space:]]+/, "", $0); print $0}' apps/build-harness/Gemfile.lock)"
```

Place your local Firebase config files at the default locations:

- `~/Downloads/GoogleService-Info.plist`
- `~/Downloads/google-services.json`

Or pass explicit paths with script flags.

The sync scripts persist your last local choices in ignored files:

- `apps/build-harness/.build-harness.local.json`
- `apps/build-harness-expo/.build-harness.local.json`

Those files store local overrides such as:

- Firebase config file source paths
- `workspace` vs published RNFB source selection
- published RNFB version override
- React / React Native overrides
- bundle identifier and Android application ID overrides
- Firebase native SDK and Gradle plugin version overrides

### Script-managed environment variables

If you use the root commands or sync scripts, you do not need to export these manually. The scripts set them for the native toolchain as needed:

- `RNFB_FIREBASE_IOS_SDK`
- `FIREBASE_SDK_VERSION`
- `RNFB_FIREBASE_ANDROID_BOM`
- `RNFB_GOOGLE_SERVICES_GRADLE`
- `RNFB_CRASHLYTICS_GRADLE`
- `RNFB_PERF_GRADLE`
- `RNFB_APP_DISTRIBUTION_GRADLE`
- `RNFB_BUILD_HARNESS_ANDROID_APPLICATION_ID`
- `RNFB_BUILD_HARNESS_IOS_BUNDLE_ID`
- `NODE_PATH` for the Expo harness CLI so RNFB workspace config plugins resolve correctly

## Repo root commands

### Bare harness commands

- `yarn app:doctor`
  Prints the effective bare harness config, detected defaults, and prerequisite status.
- `yarn app:sync`
  Rewrites the bare harness dependencies, copies Firebase config files, patches iOS metadata, and installs dependencies.
- `yarn app:clean`
  Removes bare harness build products, Pods, and derived data.
- `yarn app:pod:install`
  Re-runs the bare harness iOS pod install using the current effective config.
- `yarn app:start`
  Starts Metro for the bare harness with `--reset-cache`.
- `yarn app:ios`
  Syncs and runs the bare harness on iOS.
- `yarn app:android`
  Syncs and runs the bare harness on Android.

Examples:

```bash
yarn app:doctor
yarn app:sync
yarn app:start
yarn app:ios
yarn app:android
yarn app:clean
yarn app:pod:install
```

### Expo harness commands

- `yarn app:expo:doctor`
  Prints the effective Expo harness config and prerequisite status.
- `yarn app:expo:sync`
  Rewrites the Expo harness dependencies, copies Firebase config files, and validates Expo config.
- `yarn app:expo:clean`
  Removes generated Expo native folders and local build artifacts.
- `yarn app:expo:start`
  Starts the Expo bundler with the required workspace plugin resolution environment.
- `yarn app:ios:expo`
  Syncs the Expo harness, runs `expo prebuild --clean --platform ios`, then runs `expo run:ios`.
- `yarn app:android:expo`
  Syncs the Expo harness, runs `expo prebuild --clean --platform android`, then runs `expo run:android`.

Examples:

```bash
yarn app:expo:doctor
yarn app:expo:sync
yarn app:expo:start
yarn app:ios:expo
yarn app:android:expo
yarn app:expo:clean
```

## Direct script usage

Use the scripts directly when you need overrides or extra platform-specific arguments.

### Bare harness script

```bash
bash ./scripts/sync-build-harness.sh <command> [options] [-- extra react-native args]
```

Commands:

- `doctor`
- `clean`
- `sync`
- `pod-install`
- `build-ios`
- `build-android`

Examples:

```bash
bash ./scripts/sync-build-harness.sh doctor
bash ./scripts/sync-build-harness.sh sync
bash ./scripts/sync-build-harness.sh pod-install
bash ./scripts/sync-build-harness.sh build-ios -- --simulator "iPhone 16"
bash ./scripts/sync-build-harness.sh build-android -- --deviceId emulator-5554
```

### Expo harness script

```bash
bash ./scripts/sync-build-harness-expo.sh <command> [options] [-- extra expo args]
```

Commands:

- `doctor`
- `clean`
- `sync`
- `start`
- `build-ios`
- `build-android`

Examples:

```bash
bash ./scripts/sync-build-harness-expo.sh doctor
bash ./scripts/sync-build-harness-expo.sh sync
bash ./scripts/sync-build-harness-expo.sh start -- --tunnel
bash ./scripts/sync-build-harness-expo.sh build-ios -- --device "iPhone 16"
bash ./scripts/sync-build-harness-expo.sh build-android -- --variant debug
```

## Flags and examples

The two sync scripts share the same versioning and Firebase-config override flags except for bare-only `--pod-install` controls.

### RNFB source selection

- `--rnfb-source <workspace|published>`
  Choose local workspace packages or published RNFB packages.

```bash
bash ./scripts/sync-build-harness.sh sync --rnfb-source workspace
bash ./scripts/sync-build-harness-expo.sh sync --rnfb-source published --rnfb-version 24.0.0
```

- `--rnfb-version <version>`
  Required when `--rnfb-source published` is used.

```bash
bash ./scripts/sync-build-harness.sh sync \
  --rnfb-source published \
  --rnfb-version 24.0.0
```

### React and Firebase dependency overrides

- `--react-native <version>`
- `--react <version>`
- `--firebase-js <version>`

```bash
bash ./scripts/sync-build-harness.sh sync \
  --react-native 0.78.3 \
  --react 19.0.0 \
  --firebase-js 12.12.0
```

### Native Firebase SDK overrides

- `--firebase-ios <version>`
- `--firebase-android-bom <version>`
- `--google-services-gradle <version>`
- `--crashlytics-gradle <version>`
- `--perf-gradle <version>`
- `--app-distribution-gradle <version>`

```bash
bash ./scripts/sync-build-harness.sh sync \
  --firebase-ios 12.13.0 \
  --firebase-android-bom 34.13.0 \
  --google-services-gradle 4.4.4 \
  --crashlytics-gradle 3.0.7 \
  --perf-gradle 2.0.2 \
  --app-distribution-gradle 5.2.1
```

### Firebase config file path overrides

- `--ios-google-services <path>`
- `--android-google-services <path>`

```bash
bash ./scripts/sync-build-harness.sh sync \
  --ios-google-services "$HOME/Downloads/GoogleService-Info.plist" \
  --android-google-services "$HOME/Downloads/google-services.json"

bash ./scripts/sync-build-harness-expo.sh sync \
  --ios-google-services "$HOME/Downloads/GoogleService-Info.plist" \
  --android-google-services "$HOME/Downloads/google-services.json"
```

### App identifier overrides

Bare harness:

- `--ios-bundle-id <bundle_id>`
- `--android-application-id <id>`

```bash
bash ./scripts/sync-build-harness.sh sync \
  --ios-bundle-id io.invertase.react-native-demo \
  --android-application-id com.invertase.testing
```

Expo harness:

- `--ios-bundle-id <bundle_id>`
- `--android-application-id <id>`

```bash
bash ./scripts/sync-build-harness-expo.sh sync \
  --ios-bundle-id io.invertase.react-native-demo \
  --android-application-id com.invertase.testing
```

### Clean and install controls

- `--clean`
  Removes generated build outputs before syncing or building.

```bash
bash ./scripts/sync-build-harness.sh sync --clean
bash ./scripts/sync-build-harness-expo.sh build-ios --clean
```

- `--yarn-install`
- `--no-yarn-install`
  Force or skip the root `yarn` install step.

```bash
bash ./scripts/sync-build-harness.sh sync --no-yarn-install
bash ./scripts/sync-build-harness-expo.sh sync --yarn-install
```

Bare harness only:

- `--pod-install`
- `--no-pod-install`
  Force or skip CocoaPods for bare sync and iOS build flows.

```bash
bash ./scripts/sync-build-harness.sh sync --no-pod-install
bash ./scripts/sync-build-harness.sh build-ios --pod-install
```

### Extra CLI arguments after `--`

Anything after `--` is passed through to the underlying CLI.

Bare harness examples:

```bash
bash ./scripts/sync-build-harness.sh build-ios -- --scheme BuildHarness
bash ./scripts/sync-build-harness.sh build-android -- --active-arch-only
```

Expo harness examples:

```bash
bash ./scripts/sync-build-harness-expo.sh start -- --localhost
bash ./scripts/sync-build-harness-expo.sh build-ios -- --configuration Release
bash ./scripts/sync-build-harness-expo.sh build-android -- --variant debug
```

## Recommended workflows

### Bare React Native CLI validation

```bash
yarn app:doctor
yarn app:sync
yarn app:start
yarn app:ios
```

Or:

```bash
yarn app:doctor
yarn app:sync
yarn app:start
yarn app:android
```

### Expo development-build validation

```bash
yarn app:expo:doctor
yarn app:expo:sync
yarn app:expo:start
yarn app:ios:expo
```

Or:

```bash
yarn app:expo:doctor
yarn app:expo:sync
yarn app:expo:start
yarn app:android:expo
```

### Compare workspace packages with a published RNFB release

```bash
bash ./scripts/sync-build-harness.sh sync \
  --rnfb-source published \
  --rnfb-version 24.0.0

bash ./scripts/sync-build-harness-expo.sh sync \
  --rnfb-source published \
  --rnfb-version 24.0.0
```

## Notes

- Defaults come from `packages/app/package.json` for Firebase JS, Firebase iOS SDK, Android BOM, and Gradle plugin versions.
- The bare harness patches the iOS Xcode project and keeps the Android namespace fixed at `com.invertase.testing`, while only overriding `applicationId`.
- The Expo harness targets development builds, not Expo Go.
- The Expo harness generates native folders via `expo prebuild --clean`; those generated folders stay ignored.
- The module list in each app confirms the JavaScript layer loads, but real validation still requires native builds and runtime checks.
- These harnesses are intentionally separate from `tests/`, which remains the CI and Detox harness.
