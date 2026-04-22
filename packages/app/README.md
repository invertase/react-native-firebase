<p align="center">
  <a href="https://rnfirebase.io">
    <img width="160px" src="https://i.imgur.com/JIyBtKW.png"><br/>
  </a>
  <h2 align="center">React Native Firebase</h2>
</p>

<p align="center">
  <a href="https://api.rnfirebase.io/coverage/app/detail"><img src="https://api.rnfirebase.io/coverage/app/badge?style=flat-square" alt="Coverage"></a>
  <a href="https://www.npmjs.com/package/@react-native-firebase/app"><img src="https://img.shields.io/npm/dm/@react-native-firebase/app.svg?style=flat-square" alt="NPM downloads"></a>
  <a href="https://www.npmjs.com/package/@react-native-firebase/app"><img src="https://img.shields.io/npm/v/@react-native-firebase/app.svg?style=flat-square" alt="NPM version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/npm/l/@react-native-firebase/app.svg?style=flat-square" alt="License"></a>
  <a href="https://lerna.js.org/"><img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=flat-square" alt="Maintained with Lerna"></a>
</p>

<p align="center">
  <a href="https://invertase.link/discord"><img src="https://img.shields.io/discord/295953187817521152.svg?style=flat-square&colorA=7289da&label=Chat%20on%20Discord" alt="Chat on Discord"></a>
  <a href="https://twitter.com/rnfirebase"><img src="https://img.shields.io/twitter/follow/rnfirebase.svg?style=flat-square&colorA=1da1f2&colorB=&label=Follow%20on%20Twitter" alt="Follow on Twitter"></a>
  <a href="https://www.facebook.com/groups/rnfirebase"><img src="https://img.shields.io/badge/Follow%20on%20Facebook-4172B8?logo=facebook&style=flat-square&logoColor=fff" alt="Follow on Facebook"></a>
</p>

---

## Installation

```bash
yarn add @react-native-firebase/app
```

## Documentation

- [Quick Start](https://rnfirebase.io/app/usage)
- [Reference](https://rnfirebase.io/reference/app)

### Additional Topics

- [Utils](https://rnfirebase.io/app/utils)

## iOS Dependency Resolution: SPM vs CocoaPods

Starting with React Native 0.75+, `@react-native-firebase` supports **Swift Package Manager (SPM)** for resolving Firebase iOS SDK dependencies. SPM is enabled by default when the `spm_dependency` macro is available (injected by React Native >= 0.75) — no configuration needed.

### How it works

Each RNFB module uses `firebase_dependency()` (defined in `firebase_spm.rb`) to declare its Firebase dependencies. This helper automatically chooses between:

| Condition | Resolution | When to use |
|-----------|-----------|-------------|
| RN >= 0.75 and `$RNFirebaseDisableSPM` **not set** | **SPM** (default) | Dynamic linkage / pre-built RN core (`use_frameworks! :linkage => :dynamic`) |
| `$RNFirebaseDisableSPM = true` in Podfile | **CocoaPods** | Static linkage / no pre-built RN core (`use_frameworks! :linkage => :static`) |
| RN < 0.75 | **CocoaPods** (automatic fallback) | Older React Native versions without `spm_dependency` support |

> **Note on linkage:** firebase-ios-sdk SPM products use dynamic linkage. When using `use_frameworks! :linkage => :static`, each pod embeds its own copy of Firebase SPM products, causing duplicate symbol errors. Use CocoaPods mode (`$RNFirebaseDisableSPM = true`) with static linkage.

### Configuration

#### Option A — SPM (default, recommended for Xcode 26+)

No changes needed. Just make sure your Podfile uses dynamic linkage:

```ruby
# Podfile
use_frameworks! :linkage => :dynamic
```

> **Xcode 26 note:** If you see build errors about `FirebaseCoreInternal` or `FirebaseSharedSwift`
> module resolution, add this to your Podfile `post_install`:
> ```ruby
> config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
> ```
> This does NOT disable SPM — it only tells the Swift compiler to use implicit module discovery
> (the Xcode 16 default) so transitive SPM targets are resolved automatically.

#### Option B — CocoaPods only

Add this line at the top of your Podfile (before any `target` block):

```ruby
# Podfile
$RNFirebaseDisableSPM = true
```

This forces all RNFB modules to use traditional `s.dependency` CocoaPods declarations.
You can use either static or dynamic linkage with this option.

#### Expo

For Expo managed projects, use `expo-build-properties` to configure linkage and Podfile directives:

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "dynamic"
          }
        }
      ]
    ]
  }
}
```

To disable SPM in Expo, add a Podfile directive via a config plugin or `app.json`:

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static",
            "extraPods": []
          }
        }
      ]
    ]
  }
}
```

Then create a small [config plugin](https://docs.expo.dev/config-plugins/introduction/) to prepend
`$RNFirebaseDisableSPM = true` to the generated Podfile, or add it manually if you have ejected.

### How to verify

During `pod install`, you will see messages indicating which resolution mode is active:

```
# SPM mode:
[react-native-firebase] RNFBApp: Using SPM for Firebase dependency resolution (products: FirebaseCore)
[react-native-firebase] RNFBAuth: Using SPM for Firebase dependency resolution (products: FirebaseAuth)

# CocoaPods mode:
[react-native-firebase] RNFBApp: SPM disabled ($RNFirebaseDisableSPM = true), using CocoaPods for Firebase dependencies
```

### Monorepo / pnpm notes

The `firebase_spm.rb` helper is loaded by each RNFB podspec via `require '../app/firebase_spm'`.
This relative path assumes the standard `node_modules/@react-native-firebase/` layout. If your
package manager hoists dependencies differently (e.g., pnpm strict mode), you may need to verify
that the require path resolves correctly. The SPM URL is read from
`@react-native-firebase/app/package.json` at the location of `firebase_spm.rb`.

## License

- See [LICENSE](/LICENSE)

---

<p>
  <img align="left" width="75px" src="https://static.invertase.io/assets/invertase/invertase-rounded.png">
  <p align="left">
    Built and maintained with 💛 by <a href="https://invertase.io">Invertase</a>.
  </p>
</p>

---
