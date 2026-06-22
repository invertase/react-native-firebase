---
type: Design
title: reCAPTCHA Enterprise feature design
description: Design, platform matrix, and implementation plan for App Check and Auth reCAPTCHA Enterprise support in React Native Firebase.
tags: [app-check, auth, recaptcha, enterprise, design]
timestamp: 2026-06-22T00:00:00Z
---

# reCAPTCHA Enterprise — design & implementation plan

Design, platform behaviour, and phased implementation checklist for reCAPTCHA Enterprise support across `@react-native-firebase/app-check` and `@react-native-firebase/auth`.

**SDK floor:** Firebase JS SDK **12.15.0**, Android BOM **34.15.0**, Firebase Apple SDK with App Check `FIRRecaptchaProvider` (gradually rolling out, GA end-of-June 2026). The JS SDK floor includes [firebase-js-sdk #9991](https://github.com/firebase/firebase-js-sdk/pull/9991), which lets Auth and App Check both use reCAPTCHA Enterprise simultaneously.

**Reference implementation (FlutterFire):** [#18261](https://github.com/firebase/flutterfire/pull/18261) (mobile App Check `recaptcha`), [#11573](https://github.com/firebase/flutterfire/commit/09825edd0e1ecd609e2046fdefda439ce4099087) (web `ReCaptchaEnterpriseProvider`), [#17365](https://github.com/firebase/flutterfire/commit/73f9028e114874fddc8a4f76f22b247504a95a02) (`initializeRecaptchaConfig`).

---

## Upstream scope

Firebase’s reCAPTCHA Enterprise rollout touches **two RNFB packages**:

| Product | New capability | Upstream docs |
|---------|----------------|---------------|
| **App Check** | `ReCaptchaEnterpriseProvider` (web); mobile `recaptcha` attestation provider; optional provider-less init from project `recaptchaSiteKey` (js-sdk 12.15+) | [Web Enterprise provider](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider), [Android `RecaptchaAppCheckProviderFactory` reference](https://firebase.google.com/docs/reference/android/com/google/firebase/appcheck/recaptcha/RecaptchaAppCheckProviderFactory), [iOS `FIRRecaptchaProvider` reference](https://firebase.google.com/docs/reference/ios/firebaseappcheck/api/reference/Classes/FIRRecaptchaProvider), [js-sdk 12.15.0 release](https://github.com/firebase/firebase-js-sdk/releases/tag/firebase%4012.15.0) |
| **Auth** | `initializeRecaptchaConfig(auth)` — proactive Enterprise client init for phone/email bot protection | [JS reference](https://firebase.google.com/docs/reference/js/auth#initializerecaptchaconfig), [Android Kotlin reference](https://firebase.google.com/docs/reference/kotlin/com/google/firebase/auth/FirebaseAuth#initializeRecaptchaConfig()), [Identity Platform integration](https://cloud.google.com/identity-platform/docs/recaptcha-enterprise) |

---

## Design principles

1. **firebase-js-sdk type parity first.** Public TypeScript surface should match firebase-js-sdk modular exports. RNFB-specific types (`ReactNativeFirebaseAppCheckProvider`, etc.) are **extensions** that shim native SDK capabilities into that compatible surface — not replacements for js-sdk types.

2. **Do not export symbols for only one execution context.** If `ReCaptchaEnterpriseProvider` exists in firebase-js-sdk, it is exported from `@react-native-firebase/app-check` on **all** platforms with **runtime** behaviour documented per context. Types must not fork by platform.

3. **Implement everything we can.** Prefer implementing native SDK features even when they are a superset of firebase-js-sdk. When no js-sdk equivalent exists, expose behaviour through:
   - the existing RNFB shim (`ReactNativeFirebaseAppCheckProvider.configure({ android: { provider: 'recaptcha' } })`), and/or
   - new modular-style APIs consistent with firebase-js-sdk naming.

4. **Provider-less App Check init.** firebase-js-sdk 12.15 allows `initializeAppCheck(app, { isTokenAutoRefreshEnabled })` without an explicit `provider` — the SDK initializes a `ReCaptchaEnterpriseProvider` using the `recaptchaSiteKey` from the Firebase project config. RNFB **implements** this on **Other/Web** only. iOS/Android require an explicit App Check provider and throw clearly when `provider` is omitted.

5. **Native dependencies are under our control, always linked.** The App Check / Auth reCAPTCHA Enterprise artifacts ship unconditionally (Option A) — no gating, zero user setup. See [Native dependency requirements](#native-dependency-requirements) for exactly which artifacts and when each is exercised.

6. **compare:types is the guardrail.** Shrink `missingInRN` / `differentShape` entries as implementation lands; document only genuine, unavoidable drift.

7. **Graceful no-op for optional/best-effort APIs; loud throw for required mechanisms.** An API whose absence does not break the app **no-ops + warns** where the underlying native/web capability is unavailable. An API that *is* the security mechanism (e.g. a reCAPTCHA App Check provider that must produce attestation tokens) **throws** when it cannot function, so misconfiguration is never silent. `initializeRecaptchaConfig` is mixed: it is best-effort pre-warm for email/password Enterprise protection, but it is required setup before Web phone Enterprise verification; docs and tests must preserve that distinction.

---

## Platform matrix

Terminology matches [auth compare-types triage](/packages/auth/compare-types-triage.md):

| Context | Detection | Backend | DOM |
|---------|-----------|---------|-----|
| **iOS/Android** | `Platform.OS === 'ios' \| 'android'` | Native Firebase SDKs | No |
| **Other/Hermes** | `isOther && Platform.OS !== 'web'` (e.g. `macos`, `windows`) | firebase-js-sdk via JS bridge | No (polyfills may exist — see below) |
| **Other/Web** | `Platform.OS === 'web'` (react-native-web) | firebase-js-sdk via JS bridge | Yes |
| **Other/All** | `isOther` | firebase-js-sdk | varies |

`isOther` = `Platform.OS !== 'ios' && Platform.OS !== 'android'` (`packages/app/lib/common/index.ts`).

> **macOS is Other/Hermes.** RNFB treats macOS as a non-DOM `isOther` target (see `tests/globals.js` `Platform.other`). Anywhere this document says "Other/Hermes", macOS is included; there is no separate macOS row.

### Can we distinguish Other/Web from Other/Hermes?

**Yes, at runtime — but not in TypeScript.**

| Approach | Works? | Notes |
|----------|--------|-------|
| `Platform.OS === 'web'` | **Yes** for react-native-web | Primary signal for Other/Web in RNFB tests and production web builds |
| `Platform.OS === 'macos' \| 'windows'` | **Yes** for Hermes targets | Explicit Hermes platform IDs |
| `isOther && Platform.OS !== 'web'` | **Yes** | Recommended composite for “Other/Hermes” |
| `typeof document !== 'undefined'` | **Unreliable** | `@react-native-firebase/app` polyfills `window` / IndexedDB on Hermes (`packages/app/lib/internal/web/memidb/`) |
| Separate public TypeScript types per context | **No** | Would violate principle #2; use runtime behaviour instead |

**Approach:** add helpers to `@react-native-firebase/app` common (non-breaking):

```typescript
export const isWeb = Platform.OS === 'web';
export const isOtherHermes = isOther && Platform.OS !== 'web';
```

Use these in runtime guards to branch behaviour **without splitting the type system**. The same exported function/class has identical TypeScript on every platform; only its runtime does context-appropriate work (delegate on Web, no-op+warn or throw on Hermes per principle #7). Document the per-context runtime in API `@remarks`, the docs routing tables, and the migration guide — same convention as `getRedirectResult` (types match js-sdk; native differs).

**Edge case:** a true browser embedding RN without `Platform.OS === 'web'` is rare; if needed later, combine `isWeb` with an explicit app config flag rather than fragile DOM heuristics.

---

## Current RNFB gaps

| Area | Current | Target |
|------|---------|--------|
| App Check web bridge | Wraps all providers in `CustomProvider`; the `web.provider: 'reCaptchaEnterprise'` option on the RNFB custom provider is accepted by the type but never wired | Real js-sdk `ReCaptchaV3Provider` / `ReCaptchaEnterpriseProvider`; provider-less init; **wire the existing RNFB custom-provider `web.provider` option** to those js-sdk providers on Other/Web |
| App core options | `FirebaseAppOptions` does not explicitly model `recaptchaSiteKey`; native default apps get whatever is in `google-services.json` / `GoogleService-Info.plist`; `authDomain` is handled through one-off app→auth maps | Add first-class `recaptchaSiteKey` option plumbing through app core for JS-created apps and Other/Web. Native default apps continue to source from native config files; future work can generalize this plumbing to replace the bespoke `authDomain` bridge |
| App Check native providers | Android: `debug`, `playIntegrity`. Apple: `debug`, `deviceCheck`, `appAttest`, `appAttestWithDeviceCheckFallback` | Add `'recaptcha'` on both |
| App Check native deps | No reCAPTCHA Enterprise App Check artifacts linked | Add per [Native dependency requirements](#native-dependency-requirements) |
| App Check types | `reCaptchaEnterprise` in web options union only; js-sdk provider classes in `missingInRN` | Export js-sdk provider classes; extend native provider unions |
| Auth | No `initializeRecaptchaConfig`; documented as “not exported” in v25 migration | Native bridge + Other/Web js-sdk delegation; no-op+warn on Other/Hermes |
| Docs | App Check docs show `reCaptchaV3` only; no Enterprise mobile provider | Full Enterprise coverage incl. routing tables |

---

## API design

### Drop-in summary — exported surface & where runtime differs

The goal: a developer can copy firebase-js-sdk App Check / Auth code into an RNFB app and have it **type-check unchanged**. Every symbol below has **one** TypeScript declaration shared by all platforms; only the runtime adapts.

**`@react-native-firebase/app-check` adds (js-sdk-identical types):**

| Export | js-sdk shape | RNFB runtime by context |
|--------|--------------|--------------------------|
| `ReCaptchaEnterpriseProvider` | `class { constructor(siteKey) }` | iOS/Android → native `recaptcha` factory · Web → js-sdk provider · Hermes → throw |
| `ReCaptchaV3Provider` | `class { constructor(siteKey) }` | Web → js-sdk provider · iOS/Android & Hermes → throw (native uses Enterprise factory, not v3) |
| `initializeAppCheck(app, options?)` | `options.provider` optional | Provider-less init implemented on Web; native/throw per routing table |

**`@react-native-firebase/auth` adds (js-sdk-identical types):**

| Export | js-sdk shape | RNFB runtime by context |
|--------|--------------|--------------------------|
| `initializeRecaptchaConfig(auth)` | `(auth: Auth) => Promise<void>` | iOS/Android/Web → real init · Hermes (incl. macOS) → resolve no-op + warn |

**RNFB extensions (no js-sdk equivalent — documented in `extraInRN`):**

`ReactNativeFirebaseAppCheckProvider` and its option types remain the cross-platform shim that maps native attestation providers (`playIntegrity`, `deviceCheck`, `appAttest`, **`recaptcha`**) into the js-sdk-compatible `initializeAppCheck` flow. They are additive union members in `AppCheckOptions['provider']`, never replacements for the js-sdk provider classes.

**Net result for compare:types:** `ReCaptchaEnterpriseProvider`, `ReCaptchaV3Provider`, and `initializeRecaptchaConfig` move out of `missingInRN`. `AppCheckOptions` stays in `differentShape` but its reason narrows to "adds RNFB provider union members" rather than "omits js-sdk provider classes".

### App Check — firebase-js-sdk compatible surface

#### Export js-sdk provider classes (all platforms)

Match firebase-js-sdk public classes:

```typescript
export class ReCaptchaV3Provider {
  constructor(siteKey: string);
  // internal token used by initializeAppCheck routing
}

export class ReCaptchaEnterpriseProvider {
  constructor(siteKey: string);
}
```

Reference: [FlutterFire `web_providers.dart`](https://github.com/firebase/flutterfire/blob/main/packages/firebase_app_check/firebase_app_check_platform_interface/lib/src/web_providers.dart).

**Runtime routing for `initializeAppCheck(app, options)`:**

| `options.provider` | iOS/Android | Other/Web | Other/Hermes |
|--------------------|-------------|-----------|--------------|
| `ReCaptchaEnterpriseProvider` | Map to native `'recaptcha'` provider via internal factory; native site key is read from `FirebaseApp` options / native config, not the constructor | Delegate to js-sdk provider instance | Throw: DOM / Enterprise web bootstrap unavailable |
| `ReCaptchaV3Provider` | Throw or document unsupported on native attestation (native uses Enterprise recaptcha factory, not v3) | js-sdk delegation | Throw |
| `ReactNativeFirebaseAppCheckProvider` | Existing native `configureProvider` path | Web branch selects js-sdk provider from `providerOptions.web` | CustomProvider path if configured |
| `CustomProvider` | Other-only today | js-sdk CustomProvider | js-sdk CustomProvider |
| **Omitted** (`provider` undefined) | Throw: native RNFB requires explicit provider selection | **Implement** js-sdk 12.15 provider-less init via project `recaptchaSiteKey` | Throw: provider-less init relies on the web Enterprise bootstrap |

`ReCaptchaV3Provider` / `ReCaptchaEnterpriseProvider` and the omitted-provider case throw on Other/Hermes because they *are* the attestation mechanism and cannot produce tokens without the DOM-based reCAPTCHA bootstrap (principle #7 — security primitives fail loud, never open). `CustomProvider` remains the supported Other/Hermes path.

#### Extend `ReactNativeFirebaseAppCheckProvider` (RNFB shim — retained)

Add native provider token `'recaptcha'`:

```typescript
// Android
provider?: 'debug' | 'playIntegrity' | 'recaptcha';

// Apple (recaptcha is iOS-only in the native SDK)
provider?: 'debug' | 'deviceCheck' | 'appAttest' | 'appAttestWithDeviceCheckFallback' | 'recaptcha';
```

**Web option is already half-built.** `ReactNativeFirebaseAppCheckProviderWebOptions.provider` already accepts `'reCaptchaEnterprise'` (and `'reCaptchaV3'`) — the type exists but the web bridge ignores it and wraps everything in `CustomProvider`. The work is to **wire that existing option**: when a user configures the RNFB custom provider with `web: { provider: 'reCaptchaEnterprise', siteKey }`, the Other/Web bridge constructs a real js-sdk `ReCaptchaEnterpriseProvider(siteKey)` (and `reCaptchaV3` → `ReCaptchaV3Provider`). This means the cross-platform RNFB provider becomes a complete drop-in: one `configure({ android, apple, web })` call selects native attestation on devices and real Enterprise/v3 providers on Other/Web — no separate code path for users.

#### `AppCheckOptions` type alignment

Target union compatible with firebase-js-sdk **plus** RNFB extensions:

```typescript
provider?:
  | ReCaptchaV3Provider
  | ReCaptchaEnterpriseProvider
  | CustomProvider
  | ReactNativeFirebaseAppCheckProvider
  | ReactNativeFirebaseAppCheckProviderConfig;
```

Update compare:types `AppCheckOptions` `differentShape` reason to document only the **additional** RNFB union members, not missing js-sdk classes.

#### Provider-less init replaces the need for a `WebReCaptchaProvider`

FlutterFire added a site-key-less `WebReCaptchaProvider`; js-sdk 12.15 instead supports **omitting `provider`** entirely (auto-uses project `recaptchaSiteKey`). Since firebase-js-sdk does **not** export a `WebReCaptchaProvider` class, RNFB does **not** invent one (principle #2) — the omitted-`provider` path covers the same use case with a js-sdk-identical surface. Revisit only if firebase-js-sdk later exports such a class.

### App core — `recaptchaSiteKey` plumbing

App Check reCAPTCHA on both native platforms consumes the site key from the configured `FirebaseApp` options:

- Android BOM 34.15.0 / `firebase-common:22.1.0` exposes `FirebaseOptions.getRecaptchaSiteKey()` and `FirebaseOptions.Builder.setRecaptchaSiteKey(String)`.
- Apple Firebase SDK exposes `FIROptions.recaptchaSiteKey`.
- Android App Check `RecaptchaAppCheckProviderFactory.create(app)` reads `app.getOptions().getRecaptchaSiteKey()` internally and fails with “Missing site key from configuration” if absent.
- iOS `FIRRecaptchaProvider initWithApp:` reads the app’s `FIROptions`; users must redownload `GoogleService-Info.plist` after enabling the provider so `recaptchaSiteKey` is present.

**Configuration source by app kind:**

| App kind | iOS/Android source | Other/Web source | Notes |
|----------|--------------------|------------------|-------|
| Native default app configured at startup | `google-services.json` / `GoogleService-Info.plist` processed by native Firebase | n/a | JS cannot retroactively change native default-app options; users must redownload native config files |
| Native secondary app initialized from JS | `firebase.initializeApp({ recaptchaSiteKey, ... }, name)` once RNFB app core sets native options | n/a | This is where JS option plumbing directly enables native App Check recaptcha |
| Other/Web app initialized from JS | n/a | `initializeApp({ recaptchaSiteKey, ... })` | Provider-less App Check works here every time because the js-sdk owns app initialization |
| Other/Hermes app initialized from JS | n/a | Stored in JS app options, but DOM reCAPTCHA providers cannot run | `CustomProvider` remains the supported path |

**Constructor semantics:** `new ReCaptchaEnterpriseProvider(siteKey)` is a js-sdk-compatible public class and the constructor site key is honored on Other/Web. On iOS/Android, RNFB maps the class to the native `recaptcha` provider, but native SDKs read the site key from `FirebaseApp` options / native config. If a constructor site key is present on native and differs from `app.options.recaptchaSiteKey`, RNFB should throw or warn loudly rather than silently using the wrong value.

The same generalized Firebase options plumbing can later improve `authDomain`: RNFB currently stores `authDomain` in bespoke app-level maps and then configures Auth from those maps. `recaptchaSiteKey` should not add another one-off bridge.

### App Check — native implementation

The Enterprise App Check factory needs the project **site key**, but native SDKs source it from the configured `FirebaseApp`, not from the App Check provider constructor.

#### Android (`ReactNativeFirebaseAppCheckProvider.java`)

Resolved by direct Google Maven / AAR inspection for BOM 34.15.0:

- Artifact: `com.google.firebase:firebase-appcheck-recaptcha:19.0.0`
- Public package/class: `com.google.firebase.appcheck.recaptcha.RecaptchaAppCheckProviderFactory`
- Public factory method: `RecaptchaAppCheckProviderFactory.getInstance()`
- `create(FirebaseApp)` reads `FirebaseOptions.getRecaptchaSiteKey()` internally.

```java
if ("recaptcha".equals(providerName)) {
  delegateProvider = RecaptchaAppCheckProviderFactory.getInstance().create(app);
}
```

Dependency (`packages/app-check/android/build.gradle`): add `implementation 'com.google.firebase:firebase-appcheck-recaptcha'`. The previously considered `firebase-appcheck-recaptchaenterprise` artifact is not present in Google Maven for BOM 34.15.0 and must not be used.

#### iOS (`RNFBAppCheckProvider.m`) — CocoaPods

The provider class `FIRRecaptchaProvider` ships **inside `FirebaseAppCheck`** (the CocoaPods distribution bundles the provider into AppCheckCore — no separate App Check recaptcha pod). It is therefore always available to compile against:

```objc
if ([providerName isEqualToString:@"recaptcha"]) {
#if TARGET_OS_IOS
  self.delegateProvider = [[FIRRecaptchaProvider alloc] initWithApp:app];
#else
  // recaptcha App Check provider is iOS-only; surface a clear error on other Apple platforms
#endif
}
```

The provider only **functions** if the reCAPTCHA Enterprise SDK pod is also linked; otherwise `getToken` fails with `GACAppCheckErrorCodeUnsupported` / `ERROR_RECAPTCHA_SDK_NOT_LINKED`. See [Native dependency requirements](#native-dependency-requirements). Reference: [`FIRRecaptchaProvider`](https://firebase.google.com/docs/reference/ios/firebaseappcheck/api/reference/Classes/FIRRecaptchaProvider), [google/app-check #94](https://github.com/google/app-check/pull/94).

Site key on iOS comes from `FIROptions.recaptchaSiteKey`: for the native default app this means the redownloaded `GoogleService-Info.plist`; for JS-created secondary apps this means RNFB app core must set `firOptions.recaptchaSiteKey` before `[FIRApp configureWithName:options:]`.

### Auth — `initializeRecaptchaConfig(auth)`

Export modular function matching firebase-js-sdk signature on **all** platforms:

```typescript
export function initializeRecaptchaConfig(auth: Auth): Promise<void>;
```

| Context | Implementation |
|---------|----------------|
| **Android** | `FirebaseAuth.getInstance(app).initializeRecaptchaConfig()` → `Promise<void>` |
| **iOS** | `[auth initializeRecaptchaConfigWithCompletion:]` → `Promise<void>` |
| **Other/Web** | `initializeRecaptchaConfig` from `@firebase/auth` via `RNFBAuthModule` → `Promise<void>` |
| **Other/Hermes** (incl. macOS) | **Resolve no-op + `console.warn`** — js-sdk requires the DOM reCAPTCHA bootstrap which is unavailable; matches FlutterFire's macOS handling |

Upstream has different requirements by protected Auth flow:

- **Email/password Enterprise protection:** `initializeRecaptchaConfig(auth)` is a latency/signal pre-warm. If it is not called, the SDK can lazily load config and restart the flow when required.
- **Phone Enterprise verification on Web:** `initializeRecaptchaConfig(auth)` must be called once before initiating Enterprise phone verification. Upstream js-sdk docs/tests state that without it, phone auth uses reCAPTCHA v2 or fails when Enterprise verification is required.
- **Android/iOS phone Enterprise verification:** Cloud docs say native SDKs automatically fetch the reCAPTCHA config after integration, and expose `initializeRecaptchaConfig` as an explicit force-fetch/pre-warm API. RNFB docs should still instruct users to call it during startup before Enterprise-protected phone flows for consistency and lower latency.
- **Other/Hermes:** resolve no-op + `console.warn`; Enterprise phone verification is not available in this context.

**Fail-fast decision:** RNFB should not require `initializeRecaptchaConfig` before constructing or using Auth globally, because that would break unrelated sign-in flows and non-Enterprise phone auth. Instead, every Enterprise phone-auth example and e2e must call it first, docs must state it as a required precondition for Web phone Enterprise verification, and tests should assert the upstream Web failure path when omitted. If a future upstream API exposes the project enforcement state locally, RNFB can add a targeted phone-flow guard without guessing.

Native dependency: the reCAPTCHA Enterprise mobile SDK is required for the Auth recaptcha flows to actually run — see [Native dependency requirements](#native-dependency-requirements).

Document the Firebase Console pitfall: enabling the reCAPTCHA Enterprise API can leave SMS defense enabled even after disabling it ([flutterfire#18171](https://github.com/firebase/flutterfire/issues/18171), [firebase-ios-sdk#15345](https://github.com/firebase/firebase-ios-sdk/issues/15345)).

Remove “not exported” language from `docs/migrating-to-v25.mdx`; update compare:types auth config entry #23a.

### Auth + App Check coexistence

With js-sdk 12.15 / #9991, both modules may use Enterprise concurrently on Other/Web. Verify no double-initialization in the web bridge; add a regression e2e or integration note.

---

## Native dependency requirements

**Short answer to "are these always needed if we use the APIs at all?": yes.** The reCAPTCHA Enterprise mobile SDK is the engine that produces tokens. Without it linked, the feature cannot function on that platform — the provider class may exist but returns an "SDK not linked / unsupported" error. There is no partial mode.

| Platform | Artifact | Provides | Required when |
|----------|----------|----------|---------------|
| **Android — App Check** | `com.google.firebase:firebase-appcheck-recaptcha` | `RecaptchaAppCheckProviderFactory`; uses `FirebaseOptions.recaptchaSiteKey` internally | Build + runtime, to reference/use the `'recaptcha'` App Check provider at all |
| **Android — Auth** | `com.google.android.recaptcha:recaptcha` (Enterprise SDK, **18.7.0+** for Auth) | reCAPTCHA Enterprise client used by phone/email verification | Runtime, whenever Enterprise-protected Auth flows execute (incl. `initializeRecaptchaConfig` doing real work) |
| **iOS — App Check** | reCAPTCHA Enterprise SDK pod (provider code itself is already in `FirebaseAppCheck`) | The Enterprise engine `FIRRecaptchaProvider` calls into | Runtime, or `getToken` fails `unsupported` / `ERROR_RECAPTCHA_SDK_NOT_LINKED` |
| **iOS — Auth** | reCAPTCHA Enterprise SDK pod (**18.7.0+** for Auth) | Enterprise client for phone/email verification | Runtime, whenever Enterprise-protected Auth flows execute |
| **Other/Web** | none (loaded from `@firebase/*` + Google’s hosted reCAPTCHA script) | — | n/a — no native artifact |

**Nuance for RNFB’s build model.** RNFB ships **one** prebuilt-from-source module per package, so a dependency is either linked for *every* consumer of that package or for none. Two consequences:

- **Android App Check:** our Java references `RecaptchaAppCheckProviderFactory`, so the artifact must be on the classpath at build time — i.e. it ships to all `@react-native-firebase/app-check` users, not only those who pick the recaptcha provider. (The iOS App Check provider class is already inside `FirebaseAppCheck`, so iOS has no equivalent compile-time add; only the runtime SDK matters.)
- **The reCAPTCHA Enterprise SDK is heavyweight.** Always-linking it increases binary size for users who never touch Enterprise.

**Decision (resolved): Option A — always link.** The reCAPTCHA Enterprise SDK is linked unconditionally for `@react-native-firebase/app-check` (Android `firebase-appcheck-recaptcha`; iOS Enterprise SDK pod) and for `@react-native-firebase/auth` (Android `com.google.android.recaptcha:recaptcha` 18.7.0+; iOS Enterprise SDK pod). This matches FlutterFire and RNFB's existing precedent for `playintegrity` / `debug`, gives users a zero-config drop-in, and keeps a single code path. The accepted trade-off is a binary-size increase for all app-check/auth consumers.

| Option | Pros | Cons |
|--------|------|------|
| **A. Always link** *(chosen)* — FlutterFire / existing RNFB precedent for `playintegrity`/`debug` | Simplest; zero user setup; consistent with current providers; single code path | Binary-size cost for all app-check/auth users (accepted) |
| **B. Opt-in gate** — gradle property + documented Podfile line, mirroring the existing `FIREBASE_APP_CHECK_DEBUG_TOKEN` build-config pattern | No size cost unless enabled | More setup; Android compile-time reference needs reflection or a stub when ungated |

---

## Phase 0 — App core: Firebase options plumbing

- [x] **0.1** Add `recaptchaSiteKey?: string` to `ReactNativeFirebase.FirebaseAppOptions` in `packages/app/lib/types/app.ts`.
- [x] **0.2** Preserve `recaptchaSiteKey` in Other/Web app initialization (`packages/app/lib/internal/web/RNFBAppModule.ts`) and expose it through `app.options`.
- [x] **0.3** Android native app initialization: set `FirebaseOptions.Builder.setRecaptchaSiteKey(options.getString("recaptchaSiteKey"))` when provided, and include `appOptions.getRecaptchaSiteKey()` in `firebaseAppToMap`.
- [x] **0.4** iOS native app initialization: set `firOptions.recaptchaSiteKey` when provided, and include `firOptions.recaptchaSiteKey` in `RNFBSharedUtils` app option maps.
- [x] **0.5** Add focused app tests for default native-app config exposure, JS-created secondary app propagation, and Other/Web option preservation. The native default app test should document that JS cannot retroactively mutate startup-configured native options.
- [x] **0.6** Add implementation notes for future `authDomain` cleanup: prefer generalized Firebase option propagation over additional one-off app→package maps. *(Note: `recaptchaSiteKey` uses native `FirebaseOptions` / `FIROptions` plumbing; `authDomain` still uses the legacy `authDomains` side map — future work should migrate `authDomain` to the same pattern.)*
- [ ] **0.7** Expo/config-plugin docs: users must redownload `google-services.json` / `GoogleService-Info.plist` after enabling App Check reCAPTCHA so native default apps contain `recaptchaSiteKey`; plugins copy these files and should not synthesize keys.

---

## Phase 1 — App Check: TypeScript & web bridge

- [x] **1.1** Add `ReCaptchaV3Provider`, `ReCaptchaEnterpriseProvider` in `packages/app-check/lib/providers.ts` with js-sdk-matching public constructors; export from package root / `modular.ts`.
- [x] **1.2** Extend native provider unions with `'recaptcha'` in `packages/app-check/lib/types/appcheck.ts` and namespaced types.
- [ ] **1.3** Refactor `packages/app-check/lib/web/RNFBAppCheckModule.ts`:
  - Route `ReCaptchaEnterpriseProvider` / `ReCaptchaV3Provider` to real js-sdk imports from `packages/app/lib/internal/web/firebaseAppCheck.ts`.
  - Route `ReactNativeFirebaseAppCheckProvider` web config (`reCaptchaEnterprise`, `reCaptchaV3`) to same js-sdk providers.
  - Implement provider-less `initializeAppCheck` when `provider` omitted and `recaptchaSiteKey` present in Firebase options (js-sdk 12.15 behaviour).
  - Stop wrapping standard providers in `CustomProvider`.
- [ ] **1.4** Update `packages/app-check/lib/namespaced.ts` `initializeAppCheck`:
  - Accept js-sdk provider class instances on all platforms (native routing for Enterprise/recaptcha).
  - Throw on native when `provider` is omitted; provider-less init is Other/Web only.
  - On native `ReCaptchaEnterpriseProvider`, map to native `'recaptcha'` but read the site key from `FirebaseApp` options/native config. If the constructor site key and `app.options.recaptchaSiteKey` both exist and differ, throw or warn loudly.
  - Preserve existing `ReactNativeFirebaseAppCheckProvider` path.
- [x] **1.5** Add `isWeb` / `isOtherHermes` to `packages/app/lib/common/index.ts` with unit tests. *(Web-only throw/delegate usage lands in 1.3/1.4.)*
- [ ] **1.6** Update `.github/scripts/compare-types/configs/app-check.ts` — remove `ReCaptchaEnterpriseProvider` / `ReCaptchaV3Provider` from `missingInRN`; narrow `AppCheckOptions` / `CustomProvider` `differentShape` reasons.
- [ ] **1.7** Update `packages/app-check/type-test.ts` — provider classes, `'recaptcha'` options, provider-less init.

---

## Phase 2 — App Check: Android native

- [ ] **2.1** Add `implementation 'com.google.firebase:firebase-appcheck-recaptcha'` to `packages/app-check/android/build.gradle` — always linked (Option A).
- [ ] **2.2** Implement `'recaptcha'` branch in `ReactNativeFirebaseAppCheckProvider.java` via `RecaptchaAppCheckProviderFactory.getInstance().create(app)`.
- [ ] **2.3** Ensure missing native `recaptchaSiteKey` errors surface clearly. The Android SDK throws “Missing site key from configuration. Verify your google-services.json file is updated.”; wrap/preserve that message rather than replacing it with a generic RNFB error.
- [ ] **2.4** Native coverage: ensure e2e / JaCoCo exercises new provider branch (`okf-bundle/testing/coverage-design.md`).

---

## Phase 3 — App Check: iOS native (CocoaPods)

- [ ] **3.1** Implement `'recaptcha'` in `RNFBAppCheckProvider.m` via `FIRRecaptchaProvider` (iOS-only `#if`; clear error on other Apple platforms).
- [ ] **3.2** Link the reCAPTCHA Enterprise SDK pod unconditionally (Option A; provider code already lives in `FirebaseAppCheck`); document the redownloaded `GoogleService-Info.plist` / `FIROptions.recaptchaSiteKey` requirement.
- [ ] **3.3** Confirm `RNFBAppCheckModule` early init (`sharedInstance` before `FirebaseApp.configure()`) is compatible with the Recaptcha provider.
- [ ] **3.4** iOS native coverage via LLVM profraw pipeline on e2e path.

---

## Phase 4 — Auth: `initializeRecaptchaConfig`

- [ ] **4.1** Add `initializeRecaptchaConfig(appName)` to Android `ReactNativeFirebaseAuthModule.java`.
- [ ] **4.2** Add iOS bridge (`initializeRecaptchaConfigWithCompletion`). (macOS is Other/Hermes in RNFB, handled by the JS bridge in 4.5 — not the native iOS module.)
- [ ] **4.3** Export `initializeRecaptchaConfig(auth)` from `packages/auth/lib/modular.ts`; wire namespaced if applicable.
- [ ] **4.4** Implement Other/Web in `packages/auth/lib/web/RNFBAuthModule.ts` via js-sdk.
- [ ] **4.5** Other/Hermes (incl. macOS): resolve no-op + `console.warn` (use `isOtherHermes`) — do not throw.
- [ ] **4.6** Link the reCAPTCHA Enterprise SDK for Auth unconditionally (Option A): `com.google.android.recaptcha:recaptcha` 18.7.0+ on Android; Enterprise pod on iOS — see [Native dependency requirements](#native-dependency-requirements).
- [ ] **4.7** Other/Web phone-auth tests: Enterprise phone examples call `initializeRecaptchaConfig(auth)` before `signInWithPhoneNumber` / `PhoneAuthProvider.verifyPhoneNumber`; add a negative test or note for the upstream failure when omitted.
- [ ] **4.8** Update `.github/scripts/compare-types/configs/auth.ts` — remove `initializeRecaptchaConfig` from `missingInRN`.
- [ ] **4.9** Update `packages/auth/type-test.ts`.

---

## Phase 5 — Documentation (`docs/` tree)

> **Requirement:** user-facing docs MUST include **per-platform routing tables** equivalent to the [App Check](#app-check--firebase-js-sdk-compatible-surface) and [Auth](#auth--initializerecaptchaconfigauth) tables in this design. Users need an at-a-glance view of which provider / call does what on iOS, Android, Other/Web, and Other/Hermes (incl. macOS), and where RNFB intentionally differs from firebase-js-sdk (throw vs delegate vs no-op+warn).

- [ ] **5.1** `docs/app-check/usage/index.mdx` — Enterprise web (`ReCaptchaEnterpriseProvider`), mobile `'recaptcha'`, provider-less init, links to Firebase guides; demote SafetyNet. **Include the provider routing table** (provider × platform → behaviour).
- [ ] **5.2** `docs/auth/phone-auth.mdx` — `initializeRecaptchaConfig`, Enterprise SMS defense, troubleshooting `ERROR_RECAPTCHA_SDK_NOT_LINKED`. **Include the `initializeRecaptchaConfig` platform behaviour table** (incl. Other/Hermes no-op+warn) and clearly state that Web phone Enterprise verification must call `initializeRecaptchaConfig(auth)` before starting phone verification.
- [ ] **5.3** `docs/migrating-to-v25.mdx` — replace “initializeRecaptchaConfig is not exported” with platform matrix.
- [ ] **5.4** `docs/app/json-config.mdx` — `recaptchaSiteKey` in Firebase options, including the native default-app caveat: default iOS/Android apps read native config files at startup, while JS-provided options affect JS-created secondary apps and Other/Web apps.
- [ ] **5.5** `docs/platforms.mdx` — update App Check / Auth Other column notes if needed.

---

## Phase 6 — okf-bundle maintenance

- [ ] **6.1** Link this document from [okf-bundle index](/index.md).
- [ ] **6.2** Create `okf-bundle/packages/app-check/index.md` (provider matrix, compare:types pointers).
- [ ] **6.3** Update `okf-bundle/packages/auth/compare-types-triage.md` item **#23a** after Auth implementation.
- [ ] **6.4** Update `okf-bundle/testing/coverage-design.md` if new native files need explicit Codecov paths.

---

## Phase 7 — Unit tests

- [ ] **7.1** `packages/app-check/__tests__/appcheck.test.ts` — provider class exports; modular paths.
- [ ] **7.2** New tests for web module provider routing (Enterprise vs V3 vs provider-less) with mocked js-sdk.
- [ ] **7.3** Tests for `isWeb` / `isOtherHermes` guards (throw vs delegate).
- [ ] **7.4** `packages/auth/__tests__/auth.test.ts` — `initializeRecaptchaConfig` export and modular wiring.
- [ ] **7.5** Auth web bridge test for js-sdk delegation and Web phone Enterprise initialization ordering.
- [ ] **7.6** Plugin tests only if Expo config changes.

---

## Phase 8 — Type tests & compare:types

- [ ] **8.1** `yarn compare:types app-check` — green with updated registry.
- [ ] **8.2** `yarn compare:types auth` — green after `initializeRecaptchaConfig`.
- [ ] **8.3** `packages/app/type-test.ts` (or nearest app type coverage), `packages/app-check/type-test.ts`, and `packages/auth/type-test.ts` compile.
- [ ] **8.4** Root TypeScript / package build scripts for touched packages.

---

## Phase 9 — E2E tests

- [ ] **9.1** `packages/app-check/e2e/appcheck.e2e.js`:
  - Other/Web (`Platform.OS === 'web'`): `ReCaptchaEnterpriseProvider` or provider-less init (gate on CI secrets / project config).
  - Native: `'recaptcha'` provider smoke test (skip if Firebase console not registered — document gate).
- [ ] **9.2** Auth e2e: `initializeRecaptchaConfig()` completes without throw on Android/iOS device (skip on emulator if unsupported — FlutterFire pattern); Other/Web delegation smoke test.
- [ ] **9.3** Document combined App Check + Auth Enterprise scenario (manual or e2e) for #9991 regression.
- [ ] **9.4** Native coverage flush hooks for new Java/ObjC lines.

---

## Phase 10 — Validation runs

- [ ] **10.1** `yarn tests:jest` / `yarn tests:jest-coverage` — unit suite; file-level coverage on changed `lib/**`.
- [ ] **10.2** `yarn compare:types` (at minimum `auth`, `app-check`).
- [ ] **10.3** `yarn tests:android:test` — App Check + Auth e2e.
- [ ] **10.4** `yarn tests:ios:test` — App Check + Auth e2e.
- [ ] **10.5** `yarn tests:macos:test` — Other/Hermes rejection paths / non-DOM behaviour.
- [ ] **10.6** Native coverage: `tests:android:post-e2e-coverage`, `tests:ios:test-cover-and-process` (CI parity).
- [ ] **10.7** Lint / spellcheck / affected package builds.

---

## Risks & testability

| Risk | Mitigation |
|------|------------|
| Mobile App Check `recaptcha` needs Firebase console + often real device | E2e `this.skip()` gates; debug provider remains default in CI |
| Native default app already configured before JS can supply `recaptchaSiteKey` | Document native config-file requirement; JS option plumbing applies to JS-created secondary apps and Other/Web |
| Auth emulator lacks `initializeRecaptchaConfig` | Smoke “does not throw” only (FlutterFire) |
| Web phone Enterprise fails if `initializeRecaptchaConfig` is omitted | Docs/examples call it first; tests cover expected upstream failure path |
| iOS `ERROR_RECAPTCHA_SDK_NOT_LINKED` after Console toggling | Document Cloud Identity Platform disable steps in phone-auth docs |
| `ReCaptchaV3Provider` on native | Runtime throw with clear message — native attestation uses Enterprise recaptcha factory, not v3 |
| DOM polyfills on Hermes confuse feature detection | Use `Platform.OS === 'web'`, not `typeof document` |

---

## Implementation order

```
Phase 0 (app core recaptchaSiteKey plumbing)
  → Phase 1 (TS + web bridge + isWeb helpers)
  → Phase 2 ∥ Phase 3 (native App Check)
  → Phase 4 (Auth)
  → Phases 5–6 (docs + okf-bundle)
  → Phases 7–8 (unit + types)
  → Phases 9–10 (e2e + CI validation)
```

---

## Related files

| Path | Role |
|------|------|
| `packages/app/lib/types/app.ts` | `FirebaseAppOptions.recaptchaSiteKey` public type |
| `packages/app/lib/internal/web/RNFBAppModule.ts` | Other/Web app option preservation |
| `packages/app/android/src/reactnative/java/io/invertase/firebase/common/RCTConvertFirebase.java` | Android native FirebaseOptions mapping |
| `packages/app/ios/RNFBApp/RNFBAppModule.m` / `RNFBSharedUtils.m` | iOS native FIROptions mapping and app option export |
| `packages/app-check/lib/web/RNFBAppCheckModule.ts` | Other platform App Check bridge |
| `packages/app-check/lib/providers.ts` | Provider classes |
| `packages/app-check/android/.../ReactNativeFirebaseAppCheckProvider.java` | Android provider facade |
| `packages/app-check/ios/RNFBAppCheck/RNFBAppCheckProvider.m` | Apple provider facade |
| `packages/auth/lib/modular.ts` | Auth modular exports |
| `packages/auth/lib/web/RNFBAuthModule.ts` | Other platform Auth bridge |
| `.github/scripts/compare-types/configs/app-check.ts` | Type parity registry |
| `.github/scripts/compare-types/configs/auth.ts` | Type parity registry |
| `docs/app-check/usage/index.mdx` | User-facing App Check docs |
| `docs/auth/phone-auth.mdx` | User-facing phone auth docs |
