---
title: Integrate into an Existing Project
description: Integrate Firebase into an existing React Native project
---

# Integrate Into Existing Project

This guide is for integrating Firebase into an existing React Native project.

Creating a new React Native project? See the [`new projects guide`](/quick-start/new-project) instead.

## Before you begin

// TODO(salakar) React Native version requirements

## Guide

```bash
yarn add @react-native-firebase/app
```

// TODO(salakar): Manual or Automatic linking for Android & ios

## Next

Now that you've installed the core Firebase module into your exist project, let's continue to the final step; follow the guides below for the platforms you wish to integrate with.

<Grid>
	<Block
		title="Adding Firebase credentials to your Android app"
		to="/quick-start/android-firebase-credentials"
		icon="phone_android"
		color="#4CAF50"
	>
		Creating an Android Firebase app and downloading the credentials from the Firebase console.
  	</Block>
    <Block
		title="Adding Firebase credentials to your iOS app"
        to="/quick-start/ios-firebase-credentials"
        icon="phone_iphone"
        color="#2196F3"
    >
        Creating an iOS Firebase app and downloading the credentials from the Firebase console.
    </Block>
</Grid>
