# @react-native-firebase/app-check

Knowledge for App Check native/JS initialization, especially iOS provider-factory timing relative to `FirebaseApp.configure()`.

## Documents

* [Architecture decisions (ADR)](architecture-decisions.md) — `AppCheck-AD-*` (pending provider, fail-closed tokens, plugin order, deferred firebase.json pre-JS provider)
* [iOS provider init work queue](ios-provider-init-work-queue.md) — ephemeral gates for [#9116](https://github.com/invertase/react-native-firebase/issues/9116) (pending + fail-closed fix)

## Related repository files

* [`packages/app-check/ios/RNFBAppCheck/RNFBAppCheckProviderFactory.m`](../../../packages/app-check/ios/RNFBAppCheck/RNFBAppCheckProviderFactory.m) — pre-configure provider creation
* [`packages/app-check/ios/RNFBAppCheck/RNFBAppCheckProvider.m`](../../../packages/app-check/ios/RNFBAppCheck/RNFBAppCheckProvider.m) — delegate provider facade / token proxy
* [`packages/app-check/ios/RNFBAppCheck/RNFBAppCheckModule.mm`](../../../packages/app-check/ios/RNFBAppCheck/RNFBAppCheckModule.mm) — `sharedInstance` factory registration, `configureProvider`
* [`packages/app-check/lib/index.ts`](../../../packages/app-check/lib/index.ts) — `initializeAppCheck`
* [`packages/app-check/plugin/src/ios/appDelegate.ts`](../../../packages/app-check/plugin/src/ios/appDelegate.ts) — Expo AppDelegate injection
* [`docs/app-check/usage/index.mdx`](../../../docs/app-check/usage/index.mdx) — user-facing App Check docs
