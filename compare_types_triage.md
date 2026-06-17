# Auth modular API — compare:types triage

Working document for sorting known differences between `@react-native-firebase/auth` and the firebase-js-sdk modular Auth API.

**Related files**

- [`.github/scripts/compare-types/configs/auth.ts`](.github/scripts/compare-types/configs/auth.ts) — machine-readable registry (`yarn compare:types auth`)
- [`docs/migrating-to-v25.mdx`](docs/migrating-to-v25.mdx) — user-facing migration guide (also read by agents)
- [`packages/auth/lib/modular.ts`](packages/auth/lib/modular.ts) — modular API
- [`packages/auth/lib/web/RNFBAuthModule.ts`](packages/auth/lib/web/RNFBAuthModule.ts) — Other platform js-sdk bridge
- [`tests/local-tests/`](tests/local-tests/) — mini-app exercising MFA / TOTP on Other platforms

---

## Platform contexts

| Context | Examples | Backend | DOM |
|---------|----------|---------|-----|
| **iOS/Android** | iOS simulator, Android device | Native Firebase Auth SDK | No |
| **Other/Hermes** | react-native-macos, Windows RN | firebase-js-sdk via JS bridge | No |
| **Other/Web** | Browser tab, web embedding | firebase-js-sdk | Yes |
| **Other/All** | Other/Hermes **and** Other/Web | firebase-js-sdk | varies |

`isOther` = `Platform.OS !== 'ios' && Platform.OS !== 'android'`.

**Note:** `yarn compare:types` compares **TypeScript shapes** only. Runtime behaviour gaps (throws vs works, `auth.config` empty object) may be documented in triage / migration docs even when signatures match.

---

## Won't change now (#1–#2, #5, #7–#8, #11, #37)

Permanent on iOS/Android, or verified elsewhere; no further work this round.

| # | Item | Why |
|---|------|-----|
| **1** | `isSignInWithEmailLink` async | Native bridge — `Promise<boolean>` vs js-sdk sync `boolean` |
| **2** | `TotpSecret.generateQrCodeUrl` async | Native bridge — `Promise<string>` vs js-sdk sync `string` |
| **5** | `useUserAccessGroup` | iOS native keychain only |
| **7** | `PhoneAuthState`, `PhoneAuthListener`, `PhoneAuthSnapshot`, `PhoneAuthError` | Native listener types (iOS/Android) |
| **8** | `PhoneAuthProvider` MF overloads | Native MFA bridge extension on iOS/Android. MFA on **Other** works via js-sdk (`tests/local-tests`); not missing Other work |
| **11** | Credential `token` / `secret` bridge fields | Native module wire format |
| **37** | `PhoneAuthProvider` compare:types entry | Same as **#8** — documents intentional RN extension, not stale |

---

## Update compare:types note (#3–#4, #6, #9–#10, #12–#22, #23a–#23h)

Won't change on **iOS/Android** now, but `configs/auth.ts` reasons should document future **Other/Hermes**, **Other/Web**, or **Other/All** support. Registry updated unless noted.

| # | Item | compare:types note (summary) |
|---|------|------------------------------|
| **3** | `verifyPhoneNumber` | iOS/Android only. **Other/All:** use `signInWithPhoneNumber` / js-sdk `PhoneAuthProvider` — not this listener API. |
| **4** | `setLanguageCode` | **Other/All:** js-sdk `languageCode` / `useDeviceLanguage` delegation possible. |
| **6** | `getCustomAuthDomain` | iOS/Android native helper. **Other/All:** js-sdk `auth.config` may cover this — see **#32**. |
| **9** | `ApplicationVerifier` ignored | iOS/Android+Hermes ignore. **Other/Web:** js-sdk `RecaptchaVerifier` possible. |
| **10** | `OAuthProvider` scopes / `toObject()` | iOS/Android: `toObject()` for native bridge. **Other/All:** scopes/params via js-sdk; `toObject()` stays bridge-only. |
| **12** | `connectAuthEmulator` `disableWarnings` | iOS/Android: `emulatorConfig` only. **Other/Web:** DOM banner suppression possible. |
| **13** | `signInWithRedirect` / `linkWithRedirect` | iOS/Android: immediate `UserCredential`. **Other/Web:** js-sdk redirect flow possible. |
| **14** | `reauthenticateWithRedirect` | iOS/Android: `Promise<void>`. **Other/Web:** js-sdk redirect semantics possible. |
| **15** | `getRedirectResult` | iOS/Android: throws. **Other/Web:** js-sdk delegation possible. *(Types match js-sdk; runtime note only — not in `differentShape`.)* |
| **16** | `setPersistence` | iOS/Android: throws. **Other/All:** js-sdk persistence possible. *(Types match; runtime note only.)* |
| **17** | `useDeviceLanguage` | iOS/Android: throws. **Other/All:** js-sdk possible. *(Types match; runtime note only.)* |
| **18** | `revokeAccessToken` | iOS/Android: throws. **Other/All:** js-sdk likely possible. *(Types match; runtime note only.)* |
| **19** | `linkWithPhoneNumber` | iOS/Android: throws. **Other/Web:** js-sdk + reCAPTCHA possible; Hermes maybe in emulator. *(Types match; runtime note only.)* |
| **20** | `reauthenticateWithPhoneNumber` | Same as **#19**. |
| **21** | `initializeAuth(deps)` ignored | iOS/Android: deps ignored. **Other/All:** js-sdk persistence/error-map deps possible. *(Types match; runtime note only.)* |
| **22** | `credentialFromResult` / `credentialFromError` → `null` | Signatures match js-sdk on all providers. **Runtime:** always `null` today. **iOS/Android:** no native extraction planned. **Other/Hermes:** not delegated. **Other/Web:** future work — delegate to firebase-js-sdk in `RNFBAuthModule` (see **#40**). Documented on `OAuthProvider`, `FacebookAuthProvider`, and `PhoneAuthProvider` in `configs/auth.ts`; same runtime applies to `GoogleAuthProvider`, `GithubAuthProvider`, `TwitterAuthProvider`. |
| **23a** | `initializeRecaptchaConfig` | **Other/Web** only. |
| **23b** | `RecaptchaVerifier` | **Other/Web** only. |
| **23c** | `SAMLAuthProvider` | **Other/Web** only. |
| **23d** | `AuthErrorCodes` | **Other/All** re-export possible. |
| **23e** | `browser*Persistence` | **Other/Web** only. |
| **23f** | `browserPopupRedirectResolver` | **Other/Web** only. |
| **23g** | `debugErrorMap` / `prodErrorMap` | **Other/All** via `initializeAuth`. |
| **23h** | `inMemoryPersistence` / `ReactNativeAsyncStorage` | **Other/Hermes** primarily via `initializeAuth`. |

---

## RN extensions — documented, intentional (#8, #30, #33, #38, #39)

| # | Item | compare:types treatment |
|---|------|------------------------|
| **8** | `PhoneAuthProvider` MF overloads | `differentShape` — native MFA bridge only |
| **30** | `FacebookAuthProvider.credential(token, secret)` | `differentShape` — limited-login secret overload (js-sdk public API is single-arg) |
| **33** | `UserCredential.additionalUserInfo` + `AdditionalUserInfoNative` | `differentShape` on `UserCredential`; `extraInRN` for `AdditionalUserInfoNative` type |
| **38** | `TotpMultiFactorGenerator` auth overload | `differentShape` — non-default native Firebase apps |
| **39** | `TotpSecret.openInOtpApp` | `differentShape` — RN-only deep-link helper |

### #33 — `additionalUserInfo` (resolved)

**Decision:** Modular sign-in helpers attach **enumerable** `additionalUserInfo` on `UserCredential` when the native bridge returns it.

- Core fields match firebase-js-sdk: `isNewUser`, `profile`, `providerId`, `username`.
- Extra native keys are **spread** onto the object (reflection/copy from bridge payload) for backwards compatibility.
- `getAdditionalUserInfo(userCredential)` returns the same normalized object (`AdditionalUserInfo | null` in declarations).
- Export `AdditionalUserInfoNative` (`AdditionalUserInfo & Record<string, unknown>`) when callers need to type provider-specific native extras.

firebase-js-sdk keeps `additionalUserInfo` off the public `UserCredential` interface and exposes it via `getAdditionalUserInfo` only — RNFB documents the extra property as an intentional extension.

---

## Planned — deprecation v25 (#24–#27)

| # | Item | Status | Migration |
|---|------|--------|-----------|
| **24** | `AppleAuthProvider` | `@deprecated` + migration guide | `new OAuthProvider('apple.com').credential({ idToken, rawNonce })` — verified in `provider.e2e.js` |
| **25** | `OIDCAuthProvider` | `@deprecated` + migration guide | `new OAuthProvider('oidc.<suffix>').credential({ idToken, accessToken })` |
| **26** | `OIDCProvider` interface | `@deprecated` on type | With **#25** |
| **27** | `FirebaseAuthTypes` namespace | Ongoing deprecation | Modular root imports |

---

## Document only — no code change now (#32, #36, #40)

### #32 — `auth.config` (option B)

| Platform | Runtime |
|----------|---------|
| iOS/Android | Always `{}` (native SDKs don't expose web config) |
| Other/All | js-sdk can populate `auth.config` — **not delegated today** |

**Decision:** Keep unified `Auth.config` type (firebase-js-sdk shape). Document runtime split in migration guide; narrow per-platform types deferred.

### #36 — namespaced `sendSignInLinkToEmail` defaults

**Not** an iOS vs Other split — **namespaced vs modular** within RNFB:

| API | `actionCodeSettings` |
|-----|------------------------|
| **Modular** `sendSignInLinkToEmail(auth, email, settings)` | **Required** (matches firebase-js-sdk) |
| **Namespaced** `firebase.auth().sendSignInLinkToEmail(email, settings?)` | Optional — `_resolveActionCodeSettings()` fills `url` from `app.options.authDomain` and defaults `handleCodeInApp: true` |

**Decision:** Document only. Namespaced convenience for native apps; modular stays strict.

### #40 — `credentialFromResult` / `credentialFromError`

Overlap **#22**. Types match firebase-js-sdk; runtime always returns `null` on all platforms today.

| Platform | Today | Future (if any) |
|----------|-------|-----------------|
| **iOS/Android** | Always `null` | No native bridge investment planned |
| **Other/Hermes** | Always `null` | Unlikely — js-sdk popup/redirect credential recovery needs DOM context |
| **Other/Web** | Always `null` | Delegate to firebase-js-sdk in `RNFBAuthModule` |

Documented in **#22**, provider JSDoc, `configs/auth.ts` (`OAuthProvider`, `FacebookAuthProvider`, `PhoneAuthProvider`), and the migration guide.

---

## Done (#28–#31, #33)

| # | Item | What changed |
|---|------|--------------|
| **28** | `ActionCodeURL.parseLink` / `parseActionCodeURL` | Pure JS port from firebase-js-sdk; **sync** `ActionCodeURL \| null` on all platforms |
| **29** | Provider credential return types | Emit `OAuthCredential` class name (not `OAuthCredentialType` alias) in provider static methods |
| **31** | Provider `differentShape` cleanup | Removed stale type-only provider entries where declarations now match |
| **33** | `additionalUserInfo` | Enumerable on modular `UserCredential`; native extras preserved; `AdditionalUserInfoNative` exported |
| **24–27** | Provider deprecations | JSDoc + [`docs/migrating-to-v25.mdx`](docs/migrating-to-v25.mdx) |

**#32 implementation** (narrow `auth.config` typing per platform) — **deferred**; see Document only above.

---

## Triage complete (Auth v25 type gap)

All **#1–#40** items are classified. `yarn compare:types auth` passes with documented differences only.

| Outcome | Items |
|---------|-------|
| **Won't change** | #1, #2, #5, #7, #8, #11, #37 |
| **Implemented** | #28, #29, #31, #33, #24–#27 |
| **Document only** | #32, #36, #40 (+ runtime-only **#15–#22** where types already match) |
| **Deferred implementation** | #32 per-platform `auth.config` typing; **#23a–#23h** / `missingInRN` Other/Web exports; **#40** Other/Web `credentialFromResult` delegation |
| **RN extensions (documented)** | #3, #4, #6, #9–#14, #30, #38, #39, `extraInRN` helpers |

---

## compare:types reason template

```text
iOS/Android: [why native SDK won't match / permanent difference].

Other/Hermes: [not implemented | N/A | possible via js-sdk without DOM].

Other/Web: [not implemented | N/A | possible via js-sdk with DOM/browser APIs].

Other/All: [when both Other sub-contexts apply].

Omit paragraphs that don't apply.
```

### Example (**#12** `disableWarnings`)

```text
iOS/Android: disableWarnings is stored on auth.emulatorConfig only; native SDKs do not show a DOM emulator banner.

Other/Hermes: not applicable (no DOM).

Other/Web: not delegated yet; firebase-js-sdk disableWarnings DOM suppression is possible.
```

---

## Quick reference

### Other/Web only (**W**)

**#9, #12, #13, #14, #15, #22, #23a, #23b, #23c, #23e, #23f**

### Other/All (**H+W**)

**#1, #2, #4, #16, #17, #18, #21, #23d, #23g** (+ **#28** implemented everywhere)

### Native / RN-only (no Other path)

**#3, #5, #7, #11, #39**

---

## Iteration log

| Round | Change |
|-------|--------|
| 1 | Won't change / Planned / Needs decisions (#1–#40) |
| 2 | Unique IDs; **#23a–#23h** |
| 3 | Other/Hermes vs Other/Web |
| 4 | Dumped to this file |
| 5 | **Update compare:types note** table; **#8** reclassified; **#28** implemented; **#24–#27** deprecated |
| 6 | **#8/#37** closed (MFA on Other verified in `tests/local-tests`); **#29/#31** provider typing aligned; **#33** enumerable `additionalUserInfo` + `AdditionalUserInfoNative`; **#32** option B + **#36** document-only; registry + migration guide updated |
| 7 | **#40** document-only; `credentialFromResult` future path on **Other/Web** via `RNFBAuthModule`; triage **#1–#40** complete |

**Future work (post–v25 typing):** Other/Web `credentialFromResult` delegation; optional per-platform `auth.config` typing; `missingInRN` browser/js-sdk exports per **#23a–#23h**.
