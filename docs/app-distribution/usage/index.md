---
title: App Distribution
description: Installation and getting started with App Distribution.
icon: /assets/docs/app-distribution/app-distribution.png
next: /auth/usage
previous: /app-check/usage
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app"
module, view the [Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the app-distribution module
yarn add @react-native-firebase/app-distribution

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

## Add the App Distribution Plugin

> This module does not handle Expo config plugins yet but does require a native integration similar to the perf module. If you want to add support for Expo to the App Distribution module we would welcome a PR!

On Android, you need to install the Google App Distribution Plugin.

Add the plugin to your `/android/build.gradle` file as a dependency:

```groovy
buildscript {
    dependencies {
        // ...
        classpath 'com.google.firebase:firebase-appdistribution-gradle:3.0.2'
    }
```

Apply the plugin via the `/android/app/build.gradle` file (at the top):

```groovy
apply plugin: 'com.android.application'
apply plugin: 'com.google.firebase.appdistribution'
```

# What does it do

Firebase App Distribution gives a holistic view of your beta testing program across iOS and Android, providing you with valuable feedback before a new release is in production. You can send pre-release versions of your app using the console or your CI servers, and installing your app is easy for testers.

Firebase App Distribution makes distributing your apps to trusted testers painless. By getting your apps onto testers' devices quickly, you can get feedback early and often. And if you use Crashlytics in your apps, you’ll automatically get stability metrics for all your builds, so you know when you’re ready to ship.

<Youtube id="SiPOaV-5j9o" />

# Key capabilities

- Cross-platform Manage both your iOS and Android pre-release distributions from the same place.
- Fast distributions Get early releases into your testers' hands quickly, with fast onboarding, no SDK to install, and instant app delivery.
- Fits into your workflow Distribute builds using the Firebase console, the Firebase Command Line Interface (CLI) tool, - or Gradle (Android). Automate distribution by integrating the CLI into CI jobs.
- Tester management Manage your testing teams by organizing them into groups. Easily add new testers with email invitations that walk them through the onboarding process. See the status of each tester for specific versions of your app: view who has accepted a testing invitation and downloaded the app.
- Works with Android App Bundles Distribute releases to testers for your Android App Bundle in Google Play. App - Distribution integrates with Google Play's internal app sharing service to streamline your app testing and launching processes.
- Works with Crashlytics When combined with Crashlytics, get insights into the stability of your test distributions.

The [official Firebase App Check documentation](https://firebase.google.com/docs/app-distribution) has more information, including about build upload integration, it is worth a read.

# Usage

The react-native-firebase module for App Distribution is meant to expose the new version alert capabilities of the iOS SDK. The majority of the App Distribution Firebase service depends on native build/release integrations. Those build/release integrations must be natively implemented for iOS and Android, according to [the upstream docs from Firebase](https://firebase.google.com/docs/app-distribution) or our build system provider.

## New Version Alerts

On iOS if you include the App Distribution module, you can optionally enable in-app alerts that appear when new builds are available to test.

## Tester Sign-in Status

The methods signInTester and isTesterSignedIn give you more flexibility customizing your tester's sign-in experience, so it can better match your app's look and feel.

You may check if your tester has already signed into their Firebase App Distribution tester account, so you can choose to display your sign-in UI only for testers who haven't yet signed in. After the tester has signed in, you can then call checkForUpdate to check whether the tester has access to a new build.

##
