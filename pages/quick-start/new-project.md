---
title: Create a new React Native Firebase app
description: Create a new React Native project with Firebase pre-integrated
---

# Create a New Project

This guide is for starting a **new** React Native app with Firebase pre-integrated.

For pre-existing React Native projects see the [`existing projects guide`](/quick-start/existing-project)

## Guide

Let's 'init' a project using the React Native CLI with the React Native Firebase project template:

#### Init Project from Template

```bash
npx @react-native-community/cli@next init --template=@react-native-firebase/template@alpha <myProjectName>
```

> Substitute `<myProjectName>` for the name of your new project.

This will create a new React Native project in a folder called `<myProjectName>` with the `@react-react-native/app` package pre installed.

## Next

Now that you have a new project with the core Firebase module integrated, let's continue to the final step; follow the guides below for the platforms you wish to integrate with.

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
