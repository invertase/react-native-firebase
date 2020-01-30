---
title: Integrate into an Existing Project
description: Integrate Firebase into an existing React Native project
---

# Integrate Into Existing Project

This guide is for integrating Firebase into an existing React Native project.

Creating a new React Native project? See the [new projects guide](/quick-start/new-project) instead.

> **Expo Users**: Support will not be provided when using the library in Expo applications (ejected or otherwise). For support on how to use Firebase with Expo, you should contact the Expo team or the Expo community.

## Adding the app dependency

Every project using React Native Firebase requires the `app` module to be installed. Using Yarn, add the module to your
project:

```bash
yarn add @react-native-firebase/app

# For iOS
cd ios && pod install
```

If you are using React Native <= 0.59 you need to manually integrate the `app` module into your project.
See the following steps for [Android](/v6/app/android) and [iOS](/v6/app/ios) for more information on manual linking.

For users on React Native >= 0.60, the module will be automatically linked to your project.

## Next

Now that you've installed the core Firebase module into your existing project, you now need to setup your project
with Android & iOS:

<Grid columns="2">
	<Block
		title="Android: Setting up Firebase"
		to="/quick-start/android-firebase-credentials"
		icon="android"
		color="#4CAF50"
	>
		Adding Firebase credentials to your Android app.
	</Block>
	<Block
		title="iOS: Setting up Firebase"
		to="/quick-start/ios-firebase-credentials"
		icon="phone_iphone"
		color="#2196F3"
	>
		Adding Firebase credentials to your iOS app.
	</Block>
</Grid>
