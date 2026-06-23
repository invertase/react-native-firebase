---
type: Design
title: reCAPTCHA Enterprise — test setup & verification
description: Agent-consumable verification design for react-native-firebase-testing — App Check recaptcha, Auth initializeRecaptchaConfig, Enterprise phone SMS in AUDIT via secondaryFromNative, e2e tiering vs emulators, quotas, and programmatic Identity Platform toggles.
tags: [app-check, auth, recaptcha, enterprise, testing, e2e, agent-runbook, adversarial-review]
parent: recaptcha-enterprise-design.md
timestamp: 2026-06-22T00:00:00Z
status: draft
iteration: 5
---

# reCAPTCHA Enterprise — test setup & verification

Companion to [reCAPTCHA Enterprise design](/recaptcha-enterprise-design.md).

**Iteration 5** (post-review): **`phoneEnforcementState: AUDIT` stays on** the shared test project at all times (acceptable assessment cost; budget alerts; revisit if volume grows). **Both App Check and Auth Enterprise** must be fully set up and exercised in e2e. **No CI AUDIT/OFF wrapper** (YAGNI). **Iteration 4** established **`secondaryFromNative` as the only cloud Auth path** in Jet e2e (no env toggles, no `tests/app.js` changes).

---

## Decisions (iteration 5)

| Decision | Choice |
|----------|--------|
| Firebase project | **`react-native-firebase-testing`** |
| Platforms (automated) | **Android + iOS** in Jet e2e |
| App Check product enforcement | **UNENFORCED (monitoring)** on shared project — no ENFORCE on Firestore/Auth/Storage |
| Auth SMS defense on shared project | **`AUDIT` always on** — project-level Identity Platform setting; e2e **expects** it; one-time bootstrap via script (see § Project setup); **not** toggled per CI run |
| ENFORCE mode | **Not used** on shared project for foreseeable future |
| **Cloud Auth Enterprise in Jet e2e** | **`getAuth(getApp('secondaryFromNative'))` only** — default app stays on Auth emulator; **no env vars**, **no `tests/app.js` changes** |
| **Dual Enterprise proof** | **App Check** (`recaptchaSiteKey` + `getToken()`) **and** **Auth** (`recaptchaKeys` + `initializeRecaptchaConfig` + phone AUDIT) — both required setup; both tested when config present |
| Web (`Platform.OS === 'web'`) | **Deferred** — welcome reports |
| Enterprise phone **ENFORCE** | **Deferred** — welcome reports |
| CI AUDIT/OFF wrapper | **Not planned** (YAGNI while project stays AUDIT) |
| Formal Cursor skill | **Deferred** until tier 1–2 e2e proven |

> **Note:** `phoneEnforcementState` is **project-wide** (Identity Platform), not per Firebase app. Tier 2 uses **`secondaryFromNative`** only to reach **cloud Auth** while the default app stays on the emulator — not because AUDIT is scoped to that app.

---

## ⚠️ Web — NOT COVERED (unchanged)

> **CAUTION:** No automated Web validation in RNFB Jet. Unit tests only. **Welcome success/failure reports** for Expo Web / react-native-web (App Check Enterprise, provider-less init, `initializeRecaptchaConfig`, phone ordering).

---

## ⚠️ Enterprise phone ENFORCE — NOT COVERED (unchanged)

> **CAUTION:** SMS defense **`ENFORCE`** (blocking toll-fraud scores) is out of scope. **Welcome reports** if you test ENFORCE on a non-shared project.

**Enterprise phone `AUDIT` + fictional test numbers** is **in scope as Tier 2** (see below) — it exercises most of the Enterprise client + Identity Platform path **without blocking** legitimate test traffic. On `react-native-firebase-testing`, **`AUDIT` is the steady-state project setting** for e2e (not a per-run toggle).

---

## Conceptual model — two independent control planes

Confusing these planes is the main source of test-design bugs. They are **orthogonal**.

### Plane A — App Check (attestation tokens)

| Console setting | Per-product `enforcementMode` | What `getToken()` does | What Firestore/Auth/etc. do |
|-----------------|------------------------------|------------------------|----------------------------|
| App registered with reCAPTCHA provider | **`UNENFORCED`** (monitoring) | **Always calls cloud** App Check + Enterprise; returns JWT if config valid | **Accept requests without token**; metrics show verified vs missing |
| Same | **`ENFORCED`** | Same minting behaviour | **Reject** requests without valid App Check token |

**Key insight:** **`getToken()` does not require enforcement to be on.** Minting is a **client → Google App Check** exchange. Enforcement only matters when a **downstream Firebase product API** validates the token server-side.

**Iteration 3 default:** stay **`UNENFORCED`** everywhere. Validate by:

- `initializeAppCheck` + `configureProvider('recaptcha')` succeeds
- `getToken()` returns non-empty JWT decodable as App Check token
- **Do not** call Firestore/Functions with enforcement expectations

### Plane B — Auth Identity Platform reCAPTCHA (SMS / email bot defense)

Separate config: `projects/{project}/config` → `recaptchaConfig`.

| `phoneEnforcementState` | Behaviour |
|-------------------------|-----------|
| **`OFF`** | No Enterprise SMS toll-fraud assessment on phone provider flows |
| **`AUDIT`** | Enterprise **creates assessment**, records metrics, **does not block** SMS |
| **`ENFORCE`** | Assessment **can block** SMS when score exceeds `tollFraudManagedRules` threshold |

There is also **`emailPasswordEnforcementState`** (`OFF` / `AUDIT` / `ENFORCE`) for email/password bot defense — independent of phone.

**Enum source:** [RecaptchaProviderEnforcementState](https://cloud.google.com/identity-platform/docs/reference/rest/v2/projects.tenants#recaptchaproviderenforcementstate) — values are **`OFF`**, **`AUDIT`**, **`ENFORCE`** (plus `UNSPECIFIED`).

**`initializeRecaptchaConfig(auth)`** pre-warms Enterprise client config. It is **not** the same knob as `phoneEnforcementState`, but phone Enterprise paths expect it to have run before verification when defense is enabled.

---

## Can we `getToken()` without protecting any products?

**Yes — and that is the recommended default for shared-project validation.**

1. Register App Check reCAPTCHA provider + native config with `recaptchaSiteKey`.
2. Leave all products **`UNENFORCED`** in Firebase Console → App Check → APIs.
3. Run `initializeAppCheck` → `getToken()`.
4. JWT mint proves: native SDK linked, site key present, Enterprise assessment path reachable.

**Audit/enforce decisions for App Check apply only when a protected product receives the request** (e.g. Firestore `get()` with enforcement on). The mint path always hits Google’s App Check service.

**Auth SMS `AUDIT`:** assessments run during `signInWithPhoneNumber` / `verifyPhoneNumber`, but **SMS is not blocked**. Combined with **fictional test numbers** (no real SMS), this is safe for config verification.

---

## Quotas, billing, and cost control

| Limit | Detail |
|-------|--------|
| **Free tier** | [10,000 assessments / month per organization](https://cloud.google.com/recaptcha/docs/billing-information) (aggregated across sites/accounts) |
| **Billing instrument** | Required on GCP project even for free tier |
| **Beyond 10k** | ~$8 flat to 100k/month, then ~$1 per 1,000 assessments |

**What counts as an assessment (approximate):**

- Each App Check **`getToken()`** / refresh (recaptcha provider)
- Each Auth Enterprise **verification** when SMS defense or bot score paths invoke Enterprise
- App Check **debug** tokens are a different provider (not recaptcha Enterprise assessments)

**Cost-control practices for `react-native-firebase-testing`:**

1. **`phoneEnforcementState: AUDIT`** is the intentional steady state — low e2e iteration count (~1 App Check mint + ~1 phone sign-in per platform per CI run when config present); org has **budget alerts** if volume surprises us; revisit OFF toggling only if cost becomes an issue.
2. Run recaptcha **`getToken()` e2e only when `recaptchaSiteKey` present** — skip otherwise (already implemented).
3. Avoid tight loops / retries on `getToken()` or phone sign-in in CI (rate-limit skips already exist in app-check e2e).
4. Do **not** enable App Check **ENFORCE** on high-traffic products in the shared project.
5. Do **not** enable Auth SMS **`ENFORCE`** on the shared project.

---

## Dual Enterprise setup — App Check + Auth (both required)

App Check and Auth reCAPTCHA Enterprise are **separate products** with **separate setup**. E2e must prove **both** when native config is present.

| Plane | What it proves | Setup artifact | Verified how |
|-------|----------------|----------------|--------------|
| **App Check** | Native `'recaptcha'` provider + cloud JWT mint | **`recaptchaSiteKey`** in `google-services.json` / `GoogleService-Info.plist` (provisioned via Identity Platform + config redownload — **not** App Check Console reCAPTCHA Enterprise on Android/iOS; see § Console: Web vs mobile) | Phase D grep/plist; Tier 1 `getToken()` |
| **Auth** | `initializeRecaptchaConfig` + Enterprise phone path under SMS defense | Identity Platform **`recaptchaKeys`** (iOS/Android); **`phoneEnforcementState: AUDIT`**; fictional test number in Console | Phase D Identity Toolkit GET; Tier 2 phone on `secondaryFromNative` |

**Common mistake:** Expecting **App Check → Register → reCAPTCHA Enterprise** on Android/iOS — that UI is **Web-only** today. Another mistake: App Check site key present but Auth **`recaptchaKeys`** missing → Tier 1 passes, Tier 2 fails.

---

## Console: Web vs mobile App Check (why Android/iOS differ)

Firebase Console **App Check → Register** shows different attestation providers per app platform:

| Platform | Typical App Check providers in Console | reCAPTCHA Enterprise in App Check Register? |
|----------|----------------------------------------|---------------------------------------------|
| **Web** | reCAPTCHA Enterprise, reCAPTCHA v3 | **Yes** — [web App Check guide](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider) |
| **Android** | Play Integrity (recommended), Debug | **Generally no** — not the same flow as Web |
| **iOS** | DeviceCheck, App Attest, Debug | **Generally no** — not the same flow as Web |

**Why you see reCAPTCHA Enterprise on a Web app but not on `com.invertase.testing`:** the Web registration path is documented and GA. Native mobile App Check reCAPTCHA Enterprise is a **separate SDK feature** ([FlutterFire #18261](https://github.com/firebase/flutterfire/pull/18261): *“gradually rolling out … end-of-June 2026”*). The Firebase Console may **not** expose “reCAPTCHA Enterprise” under App Check for Android/iOS apps even when the API is enabled.

**How RNFB Tier 1 still works on Android/iOS:** the native App Check `'recaptcha'` provider reads **`recaptchaSiteKey` from `FirebaseApp` options** (in downloaded `google-services.json` / `GoogleService-Info.plist`). That field is **not** wired up by the Web App Check registration flow. It is provisioned when **Identity Platform Auth reCAPTCHA Enterprise** is configured for your mobile apps (Google creates mobile reCAPTCHA keys and can inject the site key into config files on redownload). There is **no** published `firebase.google.com/docs/app-check/android/recaptcha-enterprise-provider` page yet (404 as of 2026-06).

**RNFB Jet e2e (Android + iOS):** ignore the Web app’s App Check reCAPTCHA Enterprise registration for Tier 1/2. Focus on **Identity Platform** setup for `com.invertase.testing` + config download via **`firebase-recaptcha-enterprise-doctor.sh`**.

**Optional:** existing App Check registrations on Android/iOS (e.g. Play Integrity for other suites) can stay — leave enforcement **Monitoring** only. Tier 1 uses the **`recaptcha` App Check provider in test code**, not Play Integrity.

**E2e gate (when config files committed):**

- **`getRecaptchaSiteKey()`** — skip Tier 1 + Tier 2 blocks if absent (bootstrap not done).
- When site key **is** present, Tier 1 + Tier 2 **run and expect success** — incomplete Auth setup surfaces as test failure (actionable), not silent skip for OFF/AUDIT.

---

## Project setup — AUDIT bootstrap (one-time utility, not CI)

**Yes — programmatic set is supported** via Identity Toolkit Admin API (`projects.updateConfig`), same family as [tests/local-tests/auth/gcloud-enable-totp-in-project.sh](/../tests/local-tests/auth/gcloud-enable-totp-in-project.sh).

**Steady state for `react-native-firebase-testing`:** `phoneEnforcementState: AUDIT`, `useSmsTollFraudProtection: true`. Run once during project bootstrap via **`firebase-recaptcha-enterprise-doctor.sh --fix`**; e2e assumes it remains on. **Not** a per-CI-job toggle.

**States for phone:** `OFF`, `AUDIT`, `ENFORCE` (plus unspecified). **`ENFORCE` is never used** on the shared project. **`OFF` is not the e2e default** (iteration 5).

### Read current config (agent runs)

```bash
export PROJECT_ID=react-native-firebase-testing
curl -s \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "X-Goog-User-Project: ${PROJECT_ID}" \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config" \
  | jq '.recaptchaConfig | {phoneEnforcementState, useSmsTollFraudProtection, emailPasswordEnforcementState}'
```

### Set phone SMS defense to AUDIT (one-time bootstrap or repair)

```bash
export PROJECT_ID=react-native-firebase-testing
curl -s -X PATCH \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config?updateMask=recaptchaConfig" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -H "X-Goog-User-Project: ${PROJECT_ID}" \
  -d '{
    "recaptchaConfig": {
      "phoneEnforcementState": "AUDIT",
      "useSmsTollFraudProtection": true
    }
  }' | jq '.recaptchaConfig.phoneEnforcementState'
```

**Tell the user:** wait ~1–2 minutes for config propagation before first Tier 2 run.

### Set phone SMS defense back to OFF (emergency / cost rollback only)

Not part of normal e2e flow. Use only if assessment volume must be cut; re-run AUDIT bootstrap before Tier 2 e2e again.

```bash
export PROJECT_ID=react-native-firebase-testing
curl -s -X PATCH \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config?updateMask=recaptchaConfig" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -H "X-Goog-User-Project: ${PROJECT_ID}" \
  -d '{
    "recaptchaConfig": {
      "phoneEnforcementState": "OFF",
      "useSmsTollFraudProtection": false
    }
  }' | jq '.recaptchaConfig.phoneEnforcementState'
```

**Permissions required:** Identity Toolkit Admin / Firebase Admin on the project (same as TOTP script operators).

---

## Phone flow in AUDIT + fictional test numbers — what it validates

**Answer: Yes — this is viable and should be Tier 2.**

| Step | Exercised in AUDIT + test number? |
|------|-----------------------------------|
| `initializeRecaptchaConfig(auth)` native bridge | ✅ |
| Enterprise client config fetch | ✅ |
| `signInWithPhoneNumber` with **fictional test number** | ✅ (no real SMS; fixed code from Console) |
| Enterprise toll-fraud **assessment created** | ✅ (AUDIT records metrics) |
| SMS **blocked** by ENFORCE threshold | ❌ intentionally not tested |
| Web-only ordering (`init` before phone) | ❌ Web deferred |

**Fictional test numbers:** Firebase Console → Authentication → Sign-in method → Phone → **Phone numbers for testing**. [Docs](https://firebase.google.com/docs/auth/web/phone-auth#test-with-fictional-phone-numbers).

**Requirements for Tier 2:**

1. **Cloud Auth on `secondaryFromNative` only** — `getAuth(getApp('secondaryFromNative'))`; never call `connectAuthEmulator` on that app (see § E2E architecture).
2. **`phoneEnforcementState: AUDIT`** on the project (steady state — e2e expects it).
3. **`recaptchaKeys`** populated in Identity Platform config (Console Enterprise setup — keys for iOS/Android) — **independent of** App Check `recaptchaSiteKey`.
4. **Fictional test number** registered in Console (hardcoded in e2e — not emulator `getRandomPhoneNumber()`).
5. **Do not use `appVerificationDisabledForTesting`** — bypasses the path under test.
6. **Do not use** emulator helpers (`clearAllUsers`, `getLastSmsCode`) — cloud Auth only.

**What Tier 2 does *not* prove:** App Check + Auth simultaneous Web (#9991), ENFORCE blocking, real SMS delivery, Web reCAPTCHA widget.

---

## E2E architecture — emulator conflict (critical)

### Current behaviour (`tests/app.js`)

Jet `loadTests()` **always** connects emulators in a global `before()`:

```javascript
connectAuthEmulator(getAuth(), 'http://localhost:9099');
connectFirestoreEmulator(getFirestore(), 'localhost', 8080);
// ... database, storage, functions
```

Manual **`tests/local-tests`** UI **does not** load `loadTests()` — comment at line 70–73: *"manual tests will not have this setup - emulators etc"*.

### What works in default Jet e2e (emulators connected)

| Test | Cloud needed? | Works today? |
|------|---------------|--------------|
| App Check **`initializeRecaptchaConfig` smoke** | Native SDK may still reach cloud for config | ✅ likely (smoke = no throw) |
| App Check **`recaptcha` `getToken()`** | **Yes** — App Check mint is always cloud | ✅ **if** `recaptchaSiteKey` in native config (else skip) |
| Auth **email/password** e2e | Emulator | ✅ by design |
| Auth **phone Enterprise AUDIT** | **Yes** — Identity Platform (cloud) | 🔲 **proposed** — via `secondaryFromNative` only (default app stays on emulator) |
| Firestore package tests | Emulator | ✅ by design |

**Conclusion:** Default e2e can cover **Tier 1 (App Check recaptcha mint)** without product enforcement. **Tier 2 (phone AUDIT)** requires **cloud Auth** — incompatible with unconditional `connectAuthEmulator` **on the same `FirebaseAuth` instance** used for cloud phone tests.

### `useEmulator` ordering — can we cloud-test Auth first, then connect the emulator?

**Short answer: not on the default app in one run. A secondary Firebase app is the viable single-run pattern.**

#### What the platform docs actually say

| SDK | `useEmulator` / `connectAuthEmulator` note |
|-----|---------------------------------------------|
| **Android** [`FirebaseAuth.useEmulator`](https://firebase.google.com/docs/reference/android/com/google/firebase/auth/FirebaseAuth#useEmulator(java.lang.String,int)) | **"Note: this must be called before this instance has been used to do any operations."** |
| **Android Kotlin** | Same wording as Java |
| **iOS** [`FIRAuth useEmulatorWithHost:port:`](https://firebase.google.com/docs/reference/ios/firebaseauth/api/reference/Classes/FIRAuth) | Documents only that it *"Configures Firebase Auth to connect to an emulated host"* — **no explicit ordering warning** in the reference (Android is clearer) |
| **Web modular** [`connectAuthEmulator`](https://firebase.google.com/docs/reference/js/auth.md#connectauthemulator) | Must be called *"synchronously immediately following the first call to `initializeAuth()`"* |
| **Firestore Android** [`FirebaseFirestore.useEmulator`](https://firebase.google.com/docs/reference/android/com/google/firebase/firestore/FirebaseFirestore#useEmulator(java.lang.String,int)) | **"Call this method before using the instance to do any database operations."** (stricter startup ordering than Auth guide prose, similar in practice) |

So the iOS reference omission is real — but **Android explicitly forbids** calling `useEmulator` after any Auth operation on that instance. RNFB native bridges guard against double `useEmulator` per app name; there is **no** `disconnectAuthEmulator` on iOS/Android in RNFB.

#### Why "cloud Auth tests first, then `connectAuthEmulator` for the rest" fails on the default app

Current Jet order:

1. `tests/app.js` global `before()` → `connectAuthEmulator(getAuth(), …)` **before any auth e2e file runs**
2. `packages/auth/e2e/auth.e2e.js` `before()` → `createUserWithEmailAndPassword` on **default** `firebase.auth()` (emulator)

If you **defer** `connectAuthEmulator` to run *after* cloud recaptcha phone tests on the **default** app:

- Cloud tests perform Auth SDK operations first → Android **rejects** a later `useEmulator` on that instance.
- If you run cloud tests *before* connecting the emulator but *after* any other auth setup (e.g. `auth.e2e.js` `before()`), same failure.

If you connect the emulator **first** (today's behaviour), all subsequent default-app Auth traffic stays on the emulator — **cloud phone AUDIT cannot run on default app**.

`useEmulator` is **one-way per `FirebaseAuth` instance** (no native disconnect). You cannot "toggle back" to cloud mid-suite on the same app instance.

#### Single-run pattern: `secondaryFromNative` (required — no env toggles)

RNFB already ships **`secondaryFromNative`** at native startup (`tests/ios/testing/AppDelegate.mm`, `tests/android/.../MainApplication.kt`) using the **same** `google-services.json` / `GoogleService-Info.plist` as the default app. `connectAuthEmulator(getAuth(), …)` in `tests/app.js` affects **only the default app**.

| Instance | `useEmulator` called? | Auth backend |
|----------|----------------------|--------------|
| `getAuth()` (default) | Yes (global `before`) | Emulator — existing auth e2e unchanged |
| `getAuth(getApp('secondaryFromNative'))` | **Never** | **Cloud** — Tier 2 phone AUDIT + `initializeRecaptchaConfig` |

**This achieves cloud-backed Enterprise phone testing + emulator-backed default-app auth in one Jet run** with **no environment variables** and **no changes to `tests/app.js`**.

**Caveats for `secondaryFromNative` Tier 2:**

- Same native config files as default — `recaptchaSiteKey` / Enterprise keys must be present after Console setup + redownload.
- Cloud phone tests create **real** Identity Platform state — use Console **fictional test numbers** (hardcoded constants in e2e, not env vars).
- Project must stay at `phoneEnforcementState: AUDIT` (re-run **`firebase-recaptcha-enterprise-doctor.sh --fix`** if ever reset — see § Project setup).
- App Check `getToken()` remains independent (Tier 1) — already cloud with emulators on.
- **Never** call `connectAuthEmulator` on `secondaryFromNative` — would permanently bind that instance to the emulator.


[`tests/local-tests/firestore/pipelines-e2e.tsx`](/../tests/local-tests/firestore/pipelines-e2e.tsx) uses **`getFirestore('pipelines-e2e')`** — a **named cloud database**, not the emulator — because it runs outside Jet’s `loadTests()` emulator hook.

---

## Tiered verification strategy (target architecture)

Strong goal: **maximize automated coverage in normal e2e** without breaking emulator-based suites.

### Tier 0 — Default Jet e2e (every PR / nightly)

**Emulators: ON.** No project config toggles.

| Suite | File | Assertions |
|-------|------|------------|
| Auth init smoke | `packages/auth/e2e/auth.e2e.js` | `initializeRecaptchaConfig()` no throw (default app / emulator — weak) |
| App Check recaptcha | `packages/app-check/e2e/appcheck.e2e.js` | configure + `getToken()` or quota skip (**Tier 1**) |
| Hermes guards | unit tests | throw / no-op |

**Gate:** skip App Check + Auth Enterprise cloud blocks if `!getRecaptchaSiteKey()` (native bootstrap incomplete).

### Tier 1 — Cloud App Check (same Jet run, no Auth change)

**Emulators: ON** (Auth/Firestore emulators OK).

App Check `getToken()` **already uses cloud** App Check backend independent of Firestore emulator. **No `tests/app.js` change required** for Tier 1.

**Optional hardening:** decode JWT `aud` / expiry in e2e (partially done for debug tokens).

### Tier 2 — Cloud Auth phone AUDIT (`secondaryFromNative`, same Jet run)

**Emulators: ON for default Auth**; **cloud Auth exclusively via `getAuth(getApp('secondaryFromNative'))`** (see § E2E architecture — `useEmulator` ordering).

Firestore/database/storage emulators may stay ON — phone flow does not require Firestore.

**Proposed implementation (not yet coded — design only):**

1. **New e2e file** `packages/auth/e2e/recaptchaPhoneCloud.e2e.js`:
   - `const secondaryAuth = getAuth(getApp('secondaryFromNative'))` — **never** `connectAuthEmulator` on this app
   - `before`: `this.skip()` if `!getRecaptchaSiteKey()` (same gate as Tier 1 — native files not bootstrapped)
   - fictional test number + code as **file constants** (registered in Console; see Phase C)
   - `await initializeRecaptchaConfig(secondaryAuth)`
   - `signInWithPhoneNumber(secondaryAuth, …)` + confirm with test code — **expects success** when full dual setup complete (project **AUDIT** steady state)
   - `after`: `signOut(secondaryAuth)` — cloud session cleanup only; does not touch emulator users
   - **No** `./helpers` emulator imports (`clearAllUsers`, `getLastSmsCode`, `getRandomPhoneNumber`)
2. **Project `AUDIT`:** one-time bootstrap (§ Project setup); **not** toggled in CI
3. **Runs in default PR e2e** alongside all other suites — same `yarn tests:*:test-reuse` invocation, no flags
4. **Quota:** ~1 App Check mint + ~1 phone sign-in per platform per run when config present — acceptable with budget alerts

### Tier 3 — Manual local-tests UI

**Emulators: none** (unless developer connects manually).

**Proposed:** `tests/local-tests/recaptcha-enterprise/RecaptchaEnterpriseManual.tsx` — buttons for:

- show `firebase.app().options.recaptchaSiteKey`
- App Check recaptcha init + `getToken()` + display JWT header
- `initializeRecaptchaConfig` + phone sign-in (developer enters test number)

**Use when:** debugging SDK linking, plist/json issues, or demo without Jet.

### Tier matrix summary

| Tier | When | Emulators | App Check getToken | Phone AUDIT | In default PR e2e? |
|------|------|-----------|-------------------|-------------|-------------------|
| 0 | Always | ON | skip if no key | skip if no key | ✅ partial |
| 1 | `recaptchaSiteKey` in native config | ON | ✅ cloud mint | — | ✅ |
| 2 | Same gate + project **AUDIT** + Auth keys | Default Auth ON; **`secondaryFromNative` cloud** | (Tier 1) | ✅ | ✅ |
| 3 | Ad hoc | OFF | ✅ | ✅ | ❌ manual UI |
| Web | Deferred | — | — | — | ❌ |
| ENFORCE | Deferred | — | — | — | ❌ |

---

## Agent runbook — `react-native-firebase-testing` (Phases A–F)

Constants:

| Name | Value |
|------|--------|
| `PROJECT_ID` | `react-native-firebase-testing` |
| Android package name (Console label) | **`com.invertase.testing`** |
| iOS bundle ID (Console label) | **`com.invertase.testing`** |
| Android Firebase app ID | `1:448618578101:android:cc6c1dc7a65cc83c` |
| iOS Firebase app ID | `1:448618578101:ios:cc6c1dc7a65cc83c` |
| Android config | `tests/android/app/google-services.json` |
| iOS config | `tests/ios/GoogleService-Info.plist` |
| reCAPTCHA Enterprise API | `recaptchaenterprise.googleapis.com` |
| Tier 2 fictional phone / code | `+16505554343` / `654321` |

### Phase A — Tooling & auth

```bash
command -v firebase gcloud jq curl >/dev/null
firebase login:list
gcloud auth list
gcloud config set project react-native-firebase-testing
cd "$REPO_ROOT" && yarn && yarn lerna:prepare
```

### Phase B — APIs, IAM, and Identity Platform service identity

Run the doctor in fix or interactive mode (requires permission to enable APIs and modify project IAM):

```bash
tests/local-tests/auth/firebase-recaptcha-enterprise-doctor.sh --fix
# or step through prompts:
tests/local-tests/auth/firebase-recaptcha-enterprise-doctor.sh --interactive
```

When prompted (or automatically with `--fix`), the doctor:

1. Enables **`recaptchaenterprise.googleapis.com`** and **`identitytoolkit.googleapis.com`**
2. Creates the Identity Platform Google-managed service identity (`gcloud beta services identity create --service=identitytoolkit.googleapis.com`) — [Identity Platform docs](https://cloud.google.com/identity-platform/docs/recaptcha-enterprise#create_a_service_account)
3. Grants **`roles/identitytoolkit.serviceAgent`** to `service-PROJECT_NUMBER@gcp-sa-identitytoolkit.iam.gserviceaccount.com`

**Operator IAM** (human running setup — not the service account): [Prepare environment for reCAPTCHA](https://cloud.google.com/recaptcha/docs/prepare-environment#configure-roles-and-permissions) recommends **`roles/recaptchaenterprise.admin`** (or `.agent`) plus **`roles/serviceusage.serviceUsageAdmin`** to enable APIs. The doctor prints **WARN** if your `gcloud` account lacks admin/agent roles and can offer to grant them when you have project IAM permission.

Verify Phase B:

```bash
tests/local-tests/auth/firebase-recaptcha-enterprise-doctor.sh --verify-only
```

Expect: both APIs enabled, Identity Platform SA has `identitytoolkit.serviceAgent`.

### Phase B2 — Enable AUDIT (automated; firebase-admin equivalent)

Same effect as firebase-admin `getAuth().projectConfigManager().updateProjectConfig()` ([Identity Platform phone provider](https://cloud.google.com/identity-platform/docs/recaptcha-enterprise)). The doctor applies this when **`phoneEnforcementState`** is not **AUDIT** — use **`--fix`** or accept the interactive prompt after Phase B.

Wait ~1–2 minutes (key provisioning may take **several minutes**). Re-run **`--verify-only`** until **`recaptchaKeys`** shows iOS + Android.

### Phase C — Console steps (Identity Platform; Web App Check N/A for Jet)

**Tell user:** Do **not** look for App Check → reCAPTCHA Enterprise on Android/iOS — use the **Auth / Identity Platform** path below. A Web app with App Check reCAPTCHA Enterprise configured is expected and **does not** unblock native Tier 1.

**Identity Platform + Auth (Tier 2, also provisions mobile keys for Tier 1):**

1. Confirm doctor **`--verify-only`** is green for Phase B + B2 (APIs, IAM, AUDIT, `recaptchaKeys` when provisioned).
2. Enable **Phone** sign-in: [Authentication → Sign-in method](https://console.firebase.google.com/project/react-native-firebase-testing/authentication/providers).
3. **Firebase apps** — package / bundle must match registered apps (doctor checks via Firebase Management API):

   | Platform | ID | Firebase app |
   |----------|-----|--------------|
   | **Android** | **`com.invertase.testing`** | `1:448618578101:android:cc6c1dc7a65cc83c` |
   | **iOS** | **`com.invertase.testing`** | `1:448618578101:ios:cc6c1dc7a65cc83c` |

   Already registered if doctor prints `OK Firebase Android/iOS app registered`. CLI: `firebase apps:list ANDROID --project react-native-firebase-testing`.

4. **Fallback app verification** (required for production AUDIT; document in [phone-auth.mdx](/../docs/auth/phone-auth.mdx)):
   - **Android:** [Play Integrity / app verification](https://firebase.google.com/docs/auth/android/phone-auth) — Play Integrity → reCAPTCHA v2 when Enterprise assessment fails
   - **iOS:** [APNs silent push / app verification](https://firebase.google.com/docs/auth/ios/phone-auth) — push → reCAPTCHA v2 when Enterprise assessment fails
   - RNFB Jet Tier 2 uses fictional test numbers; simulators may still hit fallbacks.

5. Phone provider → **Phone numbers for testing** — add **`+16505554343`** / **`654321`** (matches `recaptchaPhoneCloud.e2e.js`).
6. Re-run **`firebase-recaptcha-enterprise-doctor.sh --verify-only`** until **`recaptchaKeys`** and native **`recaptchaSiteKey`** are present.

**Native config download (Tier 1 + Tier 2 gate):**

7. After Identity Platform provisioning (steps 4–6), the doctor downloads configs via **`firebase apps:sdkconfig`** when you run **`--fix`** or accept the download prompt in **`--interactive`** (requires `firebase login`):

Targets **`1:448618578101:android:cc6c1dc7a65cc83c`** and **`1:448618578101:ios:cc6c1dc7a65cc83c`**, writing `tests/android/app/google-services.json` and `tests/ios/GoogleService-Info.plist`. Android output is filtered to the single **`com.invertase.testing`** client (CLI returns all project Android apps in one file). After download, the doctor prints **Fresh download verification** with explicit OK/FAIL per platform for **`recaptchaSiteKey`**. Re-run **`--fix`** if absent on first attempt while backend provisioning completes.

Manual fallback: [Project settings → General](https://console.firebase.google.com/project/react-native-firebase-testing/settings/general).

**App Check enforcement (optional, shared project):**

8. [App Check](https://console.firebase.google.com/project/react-native-firebase-testing/appcheck) — if Android/iOS apps show Play Integrity / DeviceCheck registrations from earlier work, leave product enforcement **Monitoring only**. **Do not** require registering reCAPTCHA Enterprise on native apps in this UI for RNFB e2e.

### Phase D — Verify dual setup

```bash
tests/local-tests/auth/firebase-recaptcha-enterprise-doctor.sh --verify-only
```

Or run **`--interactive`** / **`--fix`** to remediate failures. Pass **`--project-id`**, **`--android-dir`**, and **`--ios-dir`** for non-RNFB layouts (package/bundle inferred from gradle/plist or existing config files).

The doctor checks Phases B–D end-to-end: APIs, IAM, AUDIT, `recaptchaKeys`, native **`recaptchaSiteKey`**, and prints fictional test number constants for Console registration.

**Setup complete when:**

| Check | Expected | Verified by doctor |
|-------|----------|-------------------|
| `recaptchaenterprise.googleapis.com` + `identitytoolkit.googleapis.com` | enabled | ✅ |
| `service-…@gcp-sa-identitytoolkit.iam.gserviceaccount.com` | `roles/identitytoolkit.serviceAgent` | ✅ |
| Firebase apps `com.invertase.testing` (Android + iOS) | registered | ✅ |
| Operator `recaptchaenterprise.admin` or `.agent` | recommended | WARN only |
| `recaptchaSiteKey` in native config files | non-empty | ✅ |
| `phoneEnforcementState` | **`AUDIT`** | ✅ |
| `useSmsTollFraudProtection` | **`true`** | ✅ (jq output) |
| `recaptchaKeys` | iOS + Android | ✅ |
| Fictional test number | `+16505554343` / `654321` | manual (printed) |
| Android/iOS fallback verification | configured for production | docs only |

**E2e gate:** `getRecaptchaSiteKey()` skip until native files committed; when present, Tier 1 + Tier 2 **expect pass** if table above is satisfied.

### Phase E — Build

```bash
yarn tests:packager:jet          # terminal 1
yarn tests:android:build         # or tests:ios:build + pod install
```

### Phase F — Run tiers

**Tier 1 (default):**

```bash
yarn tests:android:test-reuse -- --grep "reCAPTCHA Enterprise"
yarn tests:android:test-reuse -- --grep "initializeRecaptchaConfig"
```

**Tier 2 (`secondaryFromNative` — same Jet run as Tier 0–1):**

```bash
yarn tests:android:test-reuse -- --grep "recaptchaPhoneCloud"
```

Skips when `!getRecaptchaSiteKey()` only. When native config is present, **expects project AUDIT + Auth keys** — failure indicates incomplete Phase C/D, not a skip.

---

## Implementation backlog (design → code)

| ID | Item | Tier | Status |
|----|------|------|--------|
| T1 | Documented runbook (this file) | — | ✅ iter 5 |
| T4 | `firebase-recaptcha-enterprise-doctor.sh` (Phases B/B2/D automation) | — | ✅ |
| T5 | `getRecaptchaSiteKey()` → `packages/app/e2e/helpers.js` (shared Tier 1 + 2 gate) | — | ✅ |
| T2 | `packages/auth/e2e/recaptchaPhoneCloud.e2e.js` on **`secondaryFromNative`** | 2 | ✅ |
| T2b | `firebase-recaptcha-enterprise-doctor.sh` (verify + fix) | — | ✅ |
| T3 | `tests/local-tests/recaptcha-enterprise/*` | 3 | 🔲 proposed |
| T6 | `docs/recaptcha-enterprise/testing.mdx` polish | — | 🔲 after tiers proven |
| T7 | Agent skill | — | 🔲 deferred |
| ~~T4 iter 4~~ | ~~CI AUDIT/OFF wrapper~~ | — | ❌ cancelled (YAGNI — steady AUDIT) |

---

## Adversarial review checklist (for fresh-context reviewer)

Use this list to attack the design — every item should have a documented answer or explicit deferral.

### Semantics

- [ ] Are App Check **mint** and **enforce** documented as independent? (§ Conceptual model)
- [ ] Are Auth `OFF` / `AUDIT` / `ENFORCE` documented separately from App Check? (§ Plane B)
- [ ] Is `emailPasswordEnforcementState` mentioned so reviewers do not conflate with phone? (§ Plane B)
- [ ] Does the doc state **`getToken()` works without ENFORCE**? (§ Can we getToken)

### Emulator / cloud

- [ ] Is the `tests/app.js` unconditional `connectAuthEmulator` conflict explicit, including **per-app** isolation via `secondaryFromNative`? (§ E2E architecture — `useEmulator` ordering)
- [ ] Is Android `useEmulator` "before any operations" vs iOS reference gap documented?
- [ ] Is Tier 1 (App Check) valid **with** emulators connected? (§ Tier 1)
- [ ] Is Tier 2 invalid on **default** Auth instance with emulator connected? (§ E2E architecture)
- [ ] Is `local-tests` manual path documented as emulator-free? (§ Tier 3)

### Phone + test numbers

- [ ] Does doc claim AUDIT + test numbers exercise Enterprise **without blocking**? (§ Phone flow)
- [ ] Does doc **not** claim this replaces ENFORCE validation? (§ ⚠️ ENFORCE)
- [ ] Is `appVerificationDisabledForTesting` called out as **incompatible** with Tier 2? (§ Phone flow)

### Cost / toggles

- [ ] Is 10k/month org quota documented? (§ Quotas)
- [ ] Is steady **`AUDIT`** on shared project stated with billing-alert rationale? (§ Decisions iter 5, § Quotas)
- [ ] Are bootstrap/repair curls present (AUDIT set; OFF emergency only)? (§ Project setup)
- [ ] Is it explicit that **no app environment variables** route cloud vs emulator Auth? (§ Decisions)
- [ ] Is **dual setup** (App Check site key + Auth recaptchaKeys) documented? (§ Dual Enterprise setup, Phase D)

### Scope honesty

- [ ] Web deferred with welcome reports? (§ ⚠️ Web)
- [ ] ENFORCE deferred? (§ ⚠️ ENFORCE)
- [ ] App Check per-database enforcement **not** possible? (design doc § emulator vs cloud — still true)

### E2E product quality goal

- [ ] Is there a path to **maximize default e2e** (Tier 0–1) without cloud Auth? (§ Tier 0–1)
- [ ] Is Tier 2 routed **only** through `secondaryFromNative` with **no env toggles**? (§ Decisions iter 4, § Tier 2)
- [ ] Is Tier 2 in **default PR e2e** when native config present (skip only if no site key)? (§ Tier matrix)

### Known gaps / risks (must remain visible)

1. **`initializeRecaptchaConfig` against Auth emulator** — smoke may pass without proving cloud Enterprise config fetch; Tier 2 is the real Auth Enterprise integration test.
2. **Assessment quota** — steady AUDIT + default e2e adds ~2 assessments/platform/run; budget alerts; revisit OFF only if cost bites.
3. **Config propagation delay** after first AUDIT bootstrap — wait ~2m before first Tier 2 run.
4. **iOS Simulator vs device** for recaptcha `getToken()` — may differ; document in iteration log after Tier 1 run.
5. **SMS defense sticky OFF** — [known Console/API bugs](https://cloud.google.com/identity-platform/docs/recaptcha-troubleshooting); doctor **`--verify-only`** should confirm **`AUDIT`** before declaring setup complete; re-run **`--fix`** if stuck.
6. **Tier 1 pass / Tier 2 fail** — usually missing Auth **`recaptchaKeys`** or fictional test number; see § Dual Enterprise setup.

---

## Iteration log

| Date | Iter | Summary |
|------|------|---------|
| 2026-06-22 | 1 | Gap analysis; options |
| 2026-06-22 | 2 | Agent runbook; Android/iOS; defer Web/phone |
| 2026-06-22 | 3 | Enforcement semantics; tiered e2e; phone AUDIT tier; quotas; programmatic toggles; adversarial checklist |
| 2026-06-22 | 4 | **`secondaryFromNative` only** for cloud Auth; remove env-toggle alternatives; Tier 2 in default e2e |
| 2026-06-23 | 5 | **Steady project AUDIT** (no CI toggle); **dual App Check + Auth setup** verification; cancel CI AUDIT/OFF wrapper (YAGNI); ready for implementation bootstrap |

---

## Documentation map

Sources pieced together for each bootstrap phase. **Keep in sync** with script comments and:

```bash
tests/local-tests/auth/firebase-recaptcha-enterprise-doctor.sh --docs
```

| Phase | What | Primary documentation |
|-------|------|------------------------|
| **Runbook** | This file + feature design | [recaptcha-enterprise-design.md](/recaptcha-enterprise-design.md) |
| **B** | Enable APIs | [Prepare environment — enable API](https://cloud.google.com/recaptcha/docs/prepare-environment#enable-api) |
| **B** | Operator IAM (`recaptchaenterprise.admin` / `.agent`) | [Prepare environment — roles](https://cloud.google.com/recaptcha/docs/prepare-environment#configure-roles-and-permissions) |
| **B** | Identity Platform service account + `identitytoolkit.serviceAgent` | [Create a service account](https://cloud.google.com/identity-platform/docs/recaptcha-enterprise#create_a_service_account) |
| **B2** | SMS defense / AUDIT | [Identity Platform reCAPTCHA Enterprise](https://cloud.google.com/identity-platform/docs/recaptcha-enterprise) |
| **B2** | Toll-fraud protection | [SMS defense (recaptcha-tfp)](https://cloud.google.com/identity-platform/docs/recaptcha-tfp) |
| **B2** | `phoneEnforcementState` enum | [REST reference](https://cloud.google.com/identity-platform/docs/reference/rest/v2/projects.tenants#recaptchaproviderenforcementstate) |
| **B2** | firebase-admin equivalent | [projectConfigManager](https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.projectconfigmanager) |
| **C** | Register Firebase apps | [Console → Project settings](https://console.firebase.google.com/project/react-native-firebase-testing/settings/general) |
| **C** | Phone sign-in + fallbacks | [Android phone auth](https://firebase.google.com/docs/auth/android/phone-auth), [iOS phone auth](https://firebase.google.com/docs/auth/ios/phone-auth) |
| **C** | Fictional test numbers | [Firebase test phones](https://firebase.google.com/docs/auth/web/phone-auth#test-with-fictional-phone-numbers), [Identity Platform test phones](https://cloud.google.com/identity-platform/docs/test-phone-numbers) |
| **D** | Download `google-services.json` / plist | [Firebase CLI `apps:sdkconfig`](https://firebase.google.com/docs/cli) ([implementation PR](https://github.com/firebase/firebase-tools/pull/1515)) |
| **D** | Native `recaptchaSiteKey` (Tier 1) | § [Console: Web vs mobile](#console-web-vs-mobile) below; [Android `RecaptchaAppCheckProviderFactory`](https://firebase.google.com/docs/reference/android/com/google/firebase/appcheck/recaptcha/RecaptchaAppCheckProviderFactory), [iOS `FIRRecaptchaProvider`](https://firebase.google.com/docs/reference/ios/firebaseappcheck/api/reference/Classes/FIRRecaptchaProvider) |
| **D** | Web App Check reCAPTCHA Enterprise (Web only in Console) | [Web App Check provider](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider) |
| **Auth client** | `initializeRecaptchaConfig` | [JS reference](https://firebase.google.com/docs/reference/js/auth#initializerecaptchaconfig) |
| **Troubleshooting** | SMS defense stuck / propagation | [Identity Platform troubleshooting](https://cloud.google.com/identity-platform/docs/recaptcha-troubleshooting), [flutterfire#18171](https://github.com/firebase/flutterfire/issues/18171), [firebase-ios-sdk#15345](https://github.com/firebase/firebase-ios-sdk/issues/15345) |
| **Billing** | Assessment quotas | [reCAPTCHA billing / free tier](https://cloud.google.com/recaptcha/docs/billing-information) |
| **Optional** | App Check enforcement | [Enable enforcement](https://firebase.google.com/docs/app-check/enable-enforcement) |

---

## Related links

- [Feature design](/recaptcha-enterprise-design.md) — Phase 11 testing strategy summary
- [User-facing bootstrap docs](/../docs/auth/phone-auth.mdx) — § Project bootstrap
- [Doctor script `--docs`](/../tests/local-tests/auth/firebase-recaptcha-enterprise-doctor.sh) — printable URL map (only bootstrap entry point)
