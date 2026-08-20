---
type: Reference
title: App Check decisions (ADR)
description: Canonical owner of durable architectural decisions for @react-native-firebase/app-check — provider factory timing, pending state, and related init behavior.
tags: [app-check, ios, provider, architecture, decisions, adr]
timestamp: 2026-08-04T00:00:00Z
---

# App Check decisions (ADR)

**Canonical owner of durable architectural decisions** for `@react-native-firebase/app-check`. Procedure and ephemeral gate state live in the [iOS provider init work queue](ios-provider-init-work-queue.md). That queue **links here** for the "why" — it does not restate decisions.

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md).

**Upstream:** [GitHub #9116](https://github.com/invertase/react-native-firebase/issues/9116), contributor PR [#9117](https://github.com/invertase/react-native-firebase/pull/9117) (temporary `#if DEBUG` default; not the durable design), discussion [#7518](https://github.com/invertase/react-native-firebase/discussions/7518).

## Decision ID convention

Use the **`AppCheck-AD-<n>`** prefix when citing these decisions in code or docs.

## Status legend

| Status       | Meaning                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Accepted** | Decided; implement to this.                                                                                                          |
| **Proposed** | Recommended, awaiting sign-off in `gap-analysis`; safe to plan around.                                                               |
| **Open**     | Under analysis; do not lock in code until resolved.                                                                                  |
| **Deferred** | Direction noted; needs a dedicated follow-up before implementation; not on the critical path for the iOS debug-provider footgun fix. |

---

## AppCheck-AD-1 — Pending provider before configure; fail-closed token APIs — **Accepted**

When `RNFBAppCheckProviderFactory` `createProviderWithApp:` runs before any `configure` / `configureProvider` for that app, install the RNFB provider **facade only** with **no** real delegate (`debug`, App Attest, DeviceCheck, etc.).

While pending, `getToken` / limited-use token completion handlers must **fail closed**: invoke the completion with an error immediately and **must not** call Google APIs (`exchangeDebugToken` or attestation).

**Why:** Firebase requires the App Check provider factory to be registered before `FirebaseApp.configure()`. Eager `FIRAppCheckInterop` creation during `configure()` then calls `createProviderWithApp:` while JS has not yet configured a provider. The historical default installed `FIRAppCheckDebugProvider`, which produced release-build `exchangeDebugToken` 403/429 traffic ([#9116](https://github.com/invertase/react-native-firebase/issues/9116)). Android already refuses to invent a provider (`create` throws if not configured). iOS cannot throw during eager create without risking launch failure, so a pending facade + fail-closed tokens is the iOS-safe equivalent.

**Rejected:**

- **Default to `appAttestWithDeviceCheckFallback` outside `#if DEBUG`** ([#9117](https://github.com/invertase/react-native-firebase/pull/9117)) — acceptable local patch, not durable: wrong provider for many apps, `#if DEBUG` ≠ prod intent, CocoaPods macro skew, still creates a real provider too early.
- **Reverse AppDelegate so `FirebaseApp.configure()` runs before factory registration** — conflicts with Firebase’s factory-before-configure contract.
- **Block/wait or queue token requests until configure** — hang risk if JS never configures.

---

## AppCheck-AD-2 — Same pending path for DEBUG and release — **Accepted**

Do **not** special-case `#if DEBUG` to install the debug provider before `configureProvider`. DEBUG and release share the pending + fail-closed path until JS/native configure runs.

**Why:** Early debug tokens before `initializeAppCheck` were accidental. Normal RNFB usage configures `provider: 'debug'` from JS in development. A DEBUG-only native default recreates the footgun class (#9117 path).

**Follow-up (not this fix):** explicit native opt-in for pre-JS providers is [AppCheck-AD-5](#appcheck-ad-5--pre-js-native-provider-via-firebasejson--deferred).

---

## AppCheck-AD-3 — Expo / AppDelegate: keep factory before `FirebaseApp.configure()` — **Accepted**

The Expo config plugin (and bare AppDelegate guidance) must keep `RNFBAppCheckModule.sharedInstance()` **before** `FirebaseApp.configure()`. Fix misleading comments/docs that imply Firebase should be initialized before App Check. Do **not** change emitted call order as the bug fix.

**Why:** Factory-before-configure is required by Firebase. The defect is the factory’s debug default, not the registration order. Reordering every consumer AppDelegate has high blast radius for no architectural gain once AD-1 lands.

---

## AppCheck-AD-4 — `initializeAppCheck`: configure provider before enabling auto-refresh — **Accepted**

In JS `initializeAppCheck`, call native `configureProvider` **before** `setTokenAutoRefreshEnabled`.

**Why:** Today auto-refresh can be enabled while the provider is still pending (or previously defaulted to debug). After AD-1, early refresh only errors, but reordering removes useless failed refresh attempts during the pending window and matches the intended init sequence.

---

## AppCheck-AD-5 — Pre-JS native provider via firebase.json — **Deferred**

A firebase.json / Info.plist (or similar) knob to install a real provider before JS runs is **out of scope** for the #9116 fix. Record the need here; design and implement in a follow-up after pending + fail-closed ships.

**Why:** Keeps the bug fix focused. Apps that need tokens before JS can call `initializeAppCheck` earlier today; a native default is a feature, not required to stop debug exchanges in release.

---

## AppCheck-AD-6 — Native regression coverage preferred; no new iOS XCTest platform in this fix — **Accepted**

Prefer a small iOS unit/host test or injectable seam proving pre-configure `createProviderWithApp:` does not install debug and fail-closed token paths do not hit the network. If that requires standing up full package XCTest + CI wiring beyond this bugfix, use a cheap in-package seam first; if still intractable, ship with Jest (JS reorder) + plugin snapshot + area-focused app-check e2e and record an evidence-backed intractable limitation (user-accepted) in this ADR / coverage notes.

**Why:** The monorepo has Android JVM unit tests ([AndroidTest-AD-1](../../testing/android-architecture-decisions.md#androidtest-ad-1)) but no package-level iOS XCTest harness. Introducing that platform is a separate decision, not a blocker for #9116.

---

## AppCheck-AD-7 — Soft-break release framing — **Accepted**

Treat the behavior change as a **bug fix** with an explicit release note and troubleshooting docs (early token fetch before `initializeAppCheck` now errors; release builds must not exchange debug tokens). Do **not** hold for a coordinated semver major solely for this.

**Why:** The old behavior was unsupported footgun behavior, not a documented API. Callers still need a clear “configure before use” story ([docs work in the queue](ios-provider-init-work-queue.md)).

---

## AppCheck-AD-8 — Fail-closed error identity — **Accepted**

While pending, token completions must use an **actionable** error that mentions configuring / `initializeAppCheck`.

**Locked shape (AC0 gap-analysis):**

| Layer | Value |
| ----- | ----- |
| Provider `NSError` domain | `RNFBErrorDomain` (same as `RNFBSharedUtils`) |
| Provider `NSError` code | `666` (RNFB promise-error convention) |
| `userInfo[@"code"]` | `provider-not-ready` |
| Message | `App Check provider is not ready. Call initializeAppCheck before requesting tokens.` |
| JS / TurboModule reject `code` | `provider-not-ready` |
| Full `NativeFirebaseError` | `appCheck/provider-not-ready` |

Map pending in `RNFBAppCheckModule` (`getToken` / `getLimitedUseToken`) so provider errors do not collapse to generic `token-error`. Detect via `userInfo[@"code"] == provider-not-ready` or nil `delegateProvider` before calling the SDK.

**Rejected:** Reusing `FIRAppCheckErrorCodeInvalidConfiguration` (or other `FIRAppCheckErrorDomain` codes) for pending — those mean SDK invalid-config / network / keychain, not “JS has not configured yet,” and would still surface as today’s generic `token-error` path without an explicit module map.

**Why:** Fail-closed without a clear message produces another support loop. Stable codes help tests and app-level handling. Fits existing RNFB reject / `NativeFirebaseError` prefixing (`appCheck/<code>`).
