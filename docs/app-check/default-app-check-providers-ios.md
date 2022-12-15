---
title: Default iOS App Check providers
description: Setps for integrating default iOS app check providers in your app
previous: /app-check/usage
next: /app-distribution/usage
---

# DeviceCheck

DeviceCheck is a built-in AppCheck provider for Apple platforms. Follow below steps to integrate DeviceCheck in your apps.

## Create private key for DeviceCheck

- Create new private key or enable **DeviceCheck** in your existing key from [Apple Developers Account](https://developer.apple.com/account/resources/authkeys/add)

  ![AppCheck](https://i.imgur.com/kIDUt4r.png)

## Upload key to DeviceCheck in Firebase console

- Navigate to [App Check](https://console.firebase.google.com/project/_/appcheck) section of firebase console
- Switch to **Apps** tab
- Select the iOS app that you would like to integrate DeviceCheck provider with
- Select DeviceCheck
- Provide the private key you created in the previous step
  ![AppCheck](https://i.imgur.com/2jg48Mg.png)
- You can find you private key Id in your [Apple developers account](https://developer.apple.com/account/resources/authkeys/review/)
- Save

# AppAttest

AppAttest is another built-in AppCheck provider for Apple platforms. Follow below steps to integrate AppAttest in your apps.

**You will need Xcode 12.5+ to use App Attest.**

## Add AppAttest to your firebase project

- Navigate to [App Check](https://console.firebase.google.com/project/_/appcheck) section of firebase console
- Switch to **Apps** tab
- Select the iOS app that you would like to integrate AppAttest provider with
- Check AppAttest and save
  ![AppCheck](https://i.imgur.com/kxZ0JyI.png)
- Save

## Add AppAttest Capability to your app

- Open **Xcode**
- Select your app from `Targets` and click on `Signing & Capabilities` and add `AppAttest` as your app capability.
  ![AppCheck](https://i.imgur.com/1HavXoq.png)
- This will create/update your `.entitlements` file which can be found under `ios/MyAppName/MyAppName.entitlements`
- Open `.entitlements` file and set the AppAttest environment to `production`
  ```js
  <key>com.apple.developer.devicecheck.appattest-environment</key>
  <string>production</string>
  ```

## Update App Identifier to have `AppAttest` capability

- Open [Apple Developer Account](https://developer.apple.com/account/resources/identifiers/bundleId/).
- Select your app identifier
- Select `App Attest` and save
  ![AppCheck](https://i.imgur.com/deA7oZe.png)
- This will invalidate your provisioning profile. Don't forget to re-generate it.

## Update `AppDelegate.mm` file

- Paste following code before `@implementation AppDelegate` line

  ```objc
  @interface AppAttestProviderFactory : NSObject<FIRAppCheckProviderFactory>
  @end

  @implementation AppAttestProviderFactory
  - (nullable id<FIRAppCheckProvider>)createProviderWithApp:(nonnull FIRApp *)app {
  return [[FIRAppAttestProvider alloc] initWithApp:app];
  }

  @end
  ```

- (Optianal) Since `AppAttest` can be only used with iOS 14 and later and if you would like to use `AppAttest` for latest versions of iOS and fallback to `DeviceCheck` for older versions you need to modify above `AppAttestProviderFactory` implementation as follow

  ```objc
  @interface AppAttestProviderFactory : NSObject<FIRAppCheckProviderFactory>
  @end

  @implementation AppAttestProviderFactory

  - (nullable id<FIRAppCheckProvider>)createProviderWithApp:(nonnull FIRApp *)app {
  if (@available(iOS 14.0, *)) {
      return [[FIRAppAttestProvider alloc] initWithApp:app];
  } else {
      return [[FIRDeviceCheckProvider alloc] initWithApp:app];
  }
  }

  @end
  ```

## Configure App Check to use `AppAttestProviderFactory`

```objc
YourAppCheckProviderFactory *providerFactory =
        [[YourAppCheckProviderFactory alloc] init];
[FIRAppCheck setAppCheckProviderFactory:providerFactory];
// You will need to initialize App Check before you use any other Firebase SDKs.
[FIRApp configure];
```

# AppCheck in debug mode

If you would like to use `AppCheck` in debug mode, update above initialization as follow

```objc
#if DEBUG
  FIRAppCheckDebugProviderFactory *providerFactory = [[FIRAppCheckDebugProviderFactory alloc] init];
#else
  AppAttestProviderFactory *providerFactory = [[AppAttestProviderFactory alloc] init];
#endif
  [FIRAppCheck setAppCheckProviderFactory:providerFactory];
// You will need to initialize App Check before you use any other Firebase SDKs.
  [FIRApp configure];
```
