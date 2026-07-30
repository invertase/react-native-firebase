# Manual test: Sign in with Apple `fullName`

This is a manual, local-tests-only sample for verifying the "Sign in with Apple fullName" support
added to `@react-native-firebase/auth` (`OAuthProvider('apple.com').credential({ fullName })`,
`AppleFullPersonName`, and the iOS native mapping to
`FIROAuthProvider.appleCredentialWithIDToken:rawNonce:fullName:`). iOS only — Apple does not
provide this data on Android/Web.

It uses the community `@invertase/react-native-apple-authentication` package to drive the real
`AuthenticationServices`/`ASAuthorizationController` "Sign in with Apple" sheet, so the JS side
(`apple-full-name.tsx`) exercises a genuine `ASAuthorizationAppleIDCredential` rather than a
hand-typed fake one.

## Files

- `tests/local-tests/auth/nativeAppleSignIn.ts` — thin wrapper around
  `@invertase/react-native-apple-authentication`'s `appleAuth.performRequest(...)`, normalized to
  `{ identityToken, rawNonce, user, email, fullName }`.
- `tests/local-tests/auth/apple-full-name.tsx` — the test screen itself (registered as
  `"Auth Apple fullName Test"` in `tests/local-tests/index.js`).

## One-time setup

1. **Apple Developer account**: ensure the app's App ID (`com.invertase.testing`, team `YYX2P3XVJ7`
   per the existing Xcode project) has the **Sign in with Apple** capability enabled at
   [developer.apple.com](https://developer.apple.com/account/resources/identifiers/list) →
   Identifiers → your App ID → capabilities. If you're using your own team/App ID for local
   testing, enable it there instead, and update `DEVELOPMENT_TEAM` / bundle id / provisioning as
   needed.
   - The Xcode project (`tests/ios/testing.xcodeproj/project.pbxproj`) and
     `tests/ios/testing/testing.entitlements` in this branch already declare the capability
     (`com.apple.developer.applesignin` / `com.apple.SignInWithApple`) — for a **real device**
     build you still need it enabled on the App ID above so a matching provisioning profile can
     be issued (automatic signing will regenerate the profile once the capability is enabled).
     Simulator builds do not require a real provisioning profile.
   - Note: at the time of writing, `com.invertase.testing` is not the App ID actually registered
     on the Apple Developer Portal for this team (`io.invertase.testing` is) — a separate PR
     tracks correcting `PRODUCT_BUNDLE_IDENTIFIER` and `GoogleService-Info.plist` to match. Until
     that lands, real-device testing needs a locally-modified bundle id/provisioning profile;
     Simulator builds are unaffected.

2. **Firebase console**: enable the **Apple** sign-in provider for the test project
   (`react-native-firebase-testing`) under Authentication → Sign-in method.

3. **Install/build**:
   ```bash
   # from repo root
   yarn
   cd tests/ios && pod install && cd ../..
   ```
   This installs `@invertase/react-native-apple-authentication` and links its native module
   (`RNAppleAuthentication`) into the `testing` target. Rebuild the iOS app so it's picked up:
   ```bash
   cd tests/ios && xcodebuild -workspace testing.xcworkspace -scheme testing \
     -configuration Debug -destination 'platform=iOS Simulator,name=<your simulator>' build
   ```
   or simply open `tests/ios/testing.xcworkspace` in Xcode and hit Run.

4. **Simulator**: sign in with a real Apple ID in the Simulator first (Settings app →
   "Sign in to your iPhone"). iOS 13.5+ / Xcode 11.4+ simulators support Sign in with Apple.
   A physical device works too, and does not require an extra Apple ID sign-in step beyond the
   usual device Apple ID.

## Running the test

1. Launch the app, open **"Auth Apple fullName Test"** from the local-tests menu.
2. Tap **Sign in with Apple** and complete the native sheet (choose "Share My Name and Email" if
   prompted — do not choose "Hide My Email" only, and make sure name sharing isn't turned off).
3. On success the screen shows:
   - The raw response returned by Apple (`user`, `email`, `fullName`).
   - The signed-in Firebase user's `displayName`/`email`, so you can confirm Firebase actually
     stored the name it received via
     `FIROAuthProvider.appleCredentialWithIDToken:rawNonce:fullName:`.

## Important: `fullName` is one-time-only

Apple only includes `fullName` (and `email`, if not already shared) in the credential on the
**first** authorization for a given Apple ID + app (bundle id). Every subsequent sign-in returns
an empty name — this is expected Apple behavior, not a bug in the PR or this sample.

To re-test the first-authorization path:

- Use a different (test) Apple ID, or
- Erase the simulator (Device → Erase All Content and Settings) and sign back into iCloud, or
- On a real device: Settings → [your name] → Sign-In & Security → Sign in with Apple → select
  this app → "Stop Using Apple ID", then sign in again in the app.

Note that even a fresh `fullName` from Apple only ends up on `User.displayName` if Firebase is
also creating a **brand-new** user for that identity (`isNewUser: true`); Firebase does not
retroactively backfill `displayName` for an Apple identity it has already seen. If you've already
signed in with this Apple ID + Firebase project before, also delete the existing user from
Firebase Console → Authentication → Users before retrying, or use a completely fresh Apple ID.

You can also verify the "no fullName" fallback path (empty `NSPersonNameComponents`, credential
built without `fullName`) simply by signing in a second time with the same Apple ID — the app
should still sign in successfully and just show `displayName: (none)` if the account had none set
previously.
