# @react-native-firebase/app-check

Knowledge for App Check TypeScript alignment with the firebase-js-sdk modular API (v25+) and reCAPTCHA Enterprise provider routing.

## Documents

* [reCAPTCHA Enterprise design](../../recaptcha-enterprise-design.md) — full feature design, native dependency requirements, and phased implementation checklist

## Platform contexts

| Context | Detection | Backend | DOM |
|---------|-----------|---------|-----|
| **iOS/Android** | `Platform.OS === 'ios' \| 'android'` | Native Firebase App Check SDKs | No |
| **Other/Hermes** | `isOther && Platform.OS !== 'web'` (e.g. `macos`, `windows`) | firebase-js-sdk via JS bridge | No |
| **Other/Web** | `Platform.OS === 'web'` | firebase-js-sdk via JS bridge | Yes |
| **Other/All** | `isOther` | firebase-js-sdk | varies |

`isOther` = `Platform.OS !== 'ios' && Platform.OS !== 'android'` (`packages/app/lib/common/index.ts`).

Helpers: `isWeb`, `isOtherHermes` from `@react-native-firebase/app` common.

## Provider routing matrix

Runtime behaviour for `initializeAppCheck(app, options)` by provider and context. Types are identical on all platforms; only runtime differs.

| `options.provider` | iOS/Android | Other/Web | Other/Hermes |
|--------------------|-------------|-----------|--------------|
| `ReCaptchaEnterpriseProvider` | Native `'recaptcha'` via `RecaptchaAppCheckProviderFactory` (Android) / `FIRRecaptchaProvider` (iOS, not macOS); site key from `FirebaseApp` options / native config | js-sdk `ReCaptchaEnterpriseProvider` | **Throw** — DOM / Enterprise web bootstrap unavailable |
| `ReCaptchaV3Provider` | **Throw** — native attestation uses Enterprise recaptcha factory, not v3 | js-sdk `ReCaptchaV3Provider` | **Throw** |
| `ReactNativeFirebaseAppCheckProvider` | Existing native `configureProvider` path (`debug`, `playIntegrity`, `deviceCheck`, `appAttest`, **`recaptcha`**, …) | Web branch selects js-sdk provider from `providerOptions.web` (`reCaptchaEnterprise`, `reCaptchaV3`) | `CustomProvider` path if configured |
| `CustomProvider` | Other-only today | js-sdk `CustomProvider` | js-sdk `CustomProvider` |
| **Omitted** (`provider` undefined) | **Throw** — native RNFB requires explicit provider | js-sdk 12.15 provider-less init via project `recaptchaSiteKey` | **Throw** |

Native `'recaptcha'` requires `recaptchaSiteKey` in `google-services.json` / `GoogleService-Info.plist` (default app) or JS `initializeApp({ recaptchaSiteKey, … })` (secondary app). iOS App Check recaptcha is iOS-only; macOS rejects with a JS-visible error.

## compare:types

Registry: [`.github/scripts/compare-types/configs/app-check.ts`](../../../.github/scripts/compare-types/configs/app-check.ts) (`yarn compare:types app-check`).

| Outcome | Exports |
|---------|---------|
| **Removed from `missingInRN`** | `ReCaptchaEnterpriseProvider`, `ReCaptchaV3Provider` |
| **`differentShape` (intentional)** | `initializeAppCheck` (async bridge return), `AppCheckOptions` (adds RNFB provider union members), `CustomProvider`, `ReCaptchaEnterpriseProvider`, `ReCaptchaV3Provider` (public `siteKey` / `getToken` for routing) |
| **`extraInRN`** | `ReactNativeFirebaseAppCheckProvider` and its option types |

## Related repository files

* [`packages/app-check/lib/providers.ts`](../../../packages/app-check/lib/providers.ts) — js-sdk-matching provider classes
* [`packages/app-check/lib/appCheckInitializeRouting.ts`](../../../packages/app-check/lib/appCheckInitializeRouting.ts) — native / Hermes routing guards
* [`packages/app-check/lib/web/RNFBAppCheckModule.ts`](../../../packages/app-check/lib/web/RNFBAppCheckModule.ts) — Other/Web js-sdk bridge
* [`packages/app-check/android/.../ReactNativeFirebaseAppCheckProvider.java`](../../../packages/app-check/android/src/main/java/io/invertase/firebase/appcheck/ReactNativeFirebaseAppCheckProvider.java) — Android provider facade
* [`packages/app-check/ios/RNFBAppCheck/RNFBAppCheckProvider.m`](../../../packages/app-check/ios/RNFBAppCheck/RNFBAppCheckProvider.m) — Apple provider facade
* [`docs/app-check/usage/index.mdx`](../../../docs/app-check/usage/index.mdx) — user-facing App Check docs with routing table
