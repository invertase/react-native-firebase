/**
 * Known differences between the firebase-js-sdk @firebase/app-check public
 * API and the @react-native-firebase/app-check modular API.
 *
 * Each entry must have a `name` (the export name) and a `reason` explaining
 * why the difference exists. Any difference NOT listed here will cause CI to
 * fail so that new drift is caught and deliberately acknowledged.
 */

import type { PackageConfig } from '../../src/types';

const config: PackageConfig = {
  nameMapping: {},
  missingInRN: [
    {
      name: 'AppCheckTokenListener',
      reason:
        'RN Firebase exposes token change listeners through the `onTokenChanged` overloads but does not export the standalone listener type alias from the firebase-js-sdk.',
    },
    {
      name: 'PartialObserver',
      reason:
        'RN Firebase re-exports this type from `@react-native-firebase/app` common types rather than mirroring the firebase-js-sdk utility export directly.',
    },
    {
      name: 'ReCaptchaEnterpriseProvider',
      reason:
        'Web-only reCAPTCHA Enterprise provider from the firebase-js-sdk. RN Firebase uses `ReactNativeFirebaseAppCheckProvider` to configure native platform providers instead.',
    },
    {
      name: 'ReCaptchaV3Provider',
      reason:
        'Web-only reCAPTCHA v3 provider from the firebase-js-sdk. RN Firebase uses `ReactNativeFirebaseAppCheckProvider` for cross-platform provider configuration.',
    },
    {
      name: 'Unsubscribe',
      reason:
        'RN Firebase re-exports this type from `@react-native-firebase/app` common types rather than mirroring the firebase-js-sdk utility export directly.',
    },
  ],
  extraInRN: [
    {
      name: 'AppCheckProvider',
      reason:
        'RN Firebase keeps the provider interface public because its native and React Native-specific provider classes are part of the package surface.',
    },
    {
      name: 'ReactNativeFirebaseAppCheckProviderOptions',
      reason:
        'RN Firebase-specific base options type used to configure native and React Native provider behavior across platforms.',
    },
    {
      name: 'ReactNativeFirebaseAppCheckProviderWebOptions',
      reason:
        'RN Firebase-specific web provider config shape used by `ReactNativeFirebaseAppCheckProvider.configure()`.',
    },
    {
      name: 'ReactNativeFirebaseAppCheckProviderAppleOptions',
      reason:
        'RN Firebase-specific Apple provider config shape used to select native iOS/macOS App Check providers.',
    },
    {
      name: 'ReactNativeFirebaseAppCheckProviderAndroidOptions',
      reason:
        'RN Firebase-specific Android provider config shape used to select native Android App Check providers.',
    },
    {
      name: 'ReactNativeFirebaseAppCheckProviderOptionsMap',
      reason:
        'RN Firebase-specific cross-platform provider options map used to configure Android, Apple, and web providers together.',
    },
    {
      name: 'ReactNativeFirebaseAppCheckProviderConfig',
      reason:
        'RN Firebase convenience config object that allows provider options to be passed directly during initialization.',
    },
    {
      name: 'ReactNativeFirebaseAppCheckProvider',
      reason:
        'RN Firebase-specific provider class that wraps native platform provider selection; there is no firebase-js-sdk equivalent export.',
    },
  ],
  differentShape: [
    {
      name: 'initializeAppCheck',
      reason:
        'RN Firebase returns `Promise<AppCheck>` because App Check initialization crosses the native bridge, whereas the firebase-js-sdk returns `AppCheck` synchronously.',
    },
    {
      name: 'AppCheckOptions',
      reason:
        'RN Firebase accepts `CustomProvider`, `ReactNativeFirebaseAppCheckProvider`, or a RN-specific provider config object instead of the firebase-js-sdk reCAPTCHA provider classes.',
    },
    {
      name: 'CustomProvider',
      reason:
        'The RN Firebase `CustomProvider` class is tailored to the React Native/native initialization model, so its public class shape differs from the firebase-js-sdk version.',
    },
  ],
};

export default config;
