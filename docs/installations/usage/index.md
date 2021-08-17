---
title: Installations
description: Installation and getting started with Installations.
icon: //static.invertase.io/assets/social/firebase-logo.png
next: /ml/usage
previous: /in-app-messaging/usage
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app"
module, view the [Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the installations module
yarn add @react-native-firebase/installations

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

# What does it do

The Firebase installations service:

- provides a unique identifier for a Firebase installation
- provides an auth token for a Firebase installation
- provides an API to perform GDPR-compliant deletion of a Firebase installation.

Each configured `FirebaseApp` has a corresponding single instance of Installations. An instance of the class provides access to the installation info for the FirebaseApp as well as the ability to delete it. A Firebase Installation is unique by `FirebaseApp.name` and `FirebaseApp.options.googleAppID`

# Usage

Please see the API Reference for detailed usage information on the available APIs
