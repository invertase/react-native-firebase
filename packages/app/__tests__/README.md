## Firebase SPM dependency tests

Unit tests for `firebase_spm.rb` — the shared helper that declares Firebase dependencies with SPM support and CocoaPods fallback.

### How to run

```bash
ruby __tests__/firebase_spm_test.rb
```

### What is `Pod::Specification` and why is it mocked?

`Pod::Specification` is the core CocoaPods class — it's the `s` object used inside every `.podspec` file to declare things like `s.dependency`, `s.name`, `s.version`, etc. We mock it with a simple class that records `dependency` calls, so we can run the tests without installing CocoaPods.

### Test flow

1. A mock `Pod::Specification` captures `dependency` calls.
2. `firebase_dependency()` is called with known inputs (version, SPM products, CocoaPods pods).
3. Assertions verify which path executed and with what arguments.

### Tests

| Test | What it verifies | Path | Flow |
|------|-----------------|------|------|
| `test_cocoapods_single_pod` | When SPM is not available, a single Firebase pod (like Auth) is added as a CocoaPods dependency with the correct name and version. | CocoaPods | `spm_dependency` undefined → `spec.dependency('Firebase/Auth', '12.10.0')` called once |
| `test_cocoapods_multiple_pods` | When SPM is not available and a module needs multiple pods (like Crashlytics + CoreExtension), all of them are added as CocoaPods dependencies. | CocoaPods | `spm_dependency` undefined → `spec.dependency` called twice (Crashlytics + CoreExtension) |
| `test_spm_single_product` | When SPM is available, the Firebase dependency is declared via Swift Package Manager instead of CocoaPods, using the correct URL, version, and product name. | SPM | `spm_dependency` defined → called with `['FirebaseAuth']`, `spec.dependency` not called |
| `test_spm_multiple_products_ignores_cocoapods_extras` | When SPM is available, only the SPM product names are used. Extra CocoaPods-only dependencies (like FirebaseCoreExtension) are correctly ignored because SPM resolves them automatically as transitive dependencies. | SPM | `spm_dependency` defined → called with `['FirebaseCrashlytics']` only, ignores CocoaPods extras |
| `test_reads_spm_url_from_package_json` | The Firebase SPM repository URL is read from `package.json` instead of being hardcoded, ensuring a single source of truth for the SDK location. | Config | `$firebase_spm_url` reads from `package.json` → `https://github.com/firebase/firebase-ios-sdk.git` |
