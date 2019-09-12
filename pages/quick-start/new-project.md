---
title: Create a new React Native Firebase app
description: Create a new React Native project with Firebase pre-integrated
---

# Creating a new project

This guide creates a fresh React Native project with React Native Firebase pre-integrated using the [React Native CLI](https://github.com/react-native-community/cli). If you already have a React Native project setup, follow the [existing projects](/quick-start/existing-project) guide instead.

## Initializing the project

The following npx command will create a new directory on your machine with the `@react-native-firebase/app` package pre-integrated. The `<name>` varible is used to both create the directory name and setup the Android & iOS environments.

```bash
npx @react-native-community/cli init --template=@react-native-firebase/template <name>
```

For example, to install a new `TodoApp` on your machine and start the Android app:

```bash
$ cd /Users/admin/Documents/
$ npx @react-native-community/cli init --template=@react-native-firebase/template TodoApp
$ cd /TodoApp/
$ react-native run-android
```

## Next

Now that you have a new project with the core Firebase module integrated, you have to complete the integration of Firebase into your project by adding your Firebase credentials. Follow the guides below for the platforms you wish to integrate with.

<Grid columns="2">
	<Block
		title="Adding Firebase credentials to your Android app"
		to="/quick-start/android-firebase-credentials"
		icon="android"
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
