---
title: Create a new React Native Firebase app
description: Create a new React Native project with Firebase pre-integrated
---

# Create a New Project

This guide is for starting a **new** React Native app with Firebase pre-integrated.

For pre-existing React Native projects see the [`existing projects guide`](/quick-start/existing-project).

## Guide

Let's initialise a project using the React Native CLI with the React Native Firebase project template:

#### Init Project from Template

```bash
npx @react-native-community/cli init --template=@react-native-firebase/template <myProjectName>
```

> Substitute `<myProjectName>` for the name of your new project.

This will create a new React Native project in a folder called `<myProjectName>` with the `@react-react-native/app` package pre installed. The generated java package name will be `com.<myProjectName>`, while the XCode iOS Bundle Identifier will have the format `org.reactjs.native.example.<myProjectName>`

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
