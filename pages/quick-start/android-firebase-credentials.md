---
title: Adding Firebase credentials to your Android app
description: Firebase provides a google-services.json file containing your Firebase project credentials. Learn how to add this to your React Native project.
---

# Adding Firebase credentials to your Android app

Firebase provides a `google-services.json` file containing a set of credentials for Android devices. React Native Firebase uses this file
to ensure any connection to a Firebase project is genuine. 

## Generating the credentials

The credential file is generated automatically from the Firebase [console](https://console.firebase.google.com/).

- Select your Firebase project.
- Go to the general project settings: 'Project settings' -> 'General'.
- Add an Android app to the project:

![Add an Android app to the project](https://prismic-io.s3.amazonaws.com/invertase%2F5efac24d-9551-4667-8ce7-2d6d4e5910f3_screenshot+2019-05-07+at+10.43.40.png)

- Enter your application details & 'Register app':

> The debug signing certificate is optional, however is required for Dynamic Links, Invites, Phone Auth. To generate a certificate run `cd android && ./gradlew signingReport` and copy the SHA1 from the `debug` key.  

![Register app](https://prismic-io.s3.amazonaws.com/invertase%2F3ea8d102-0fa8-4a5e-bbb4-938f5955800e_screenshot+2019-05-07+at+11.00.01.png)

- Download the config file:

![Download](https://prismic-io.s3.amazonaws.com/invertase%2F3bd36734-a2a7-46c7-aca5-a7b007c4ec35_screenshot+2019-05-07+at+10.48.12.png)

- Load the `google-services.json` with the Google services plugin for Gradle:

**`android/build.gradle`**:
```groovy
buildscript {
  dependencies {
    // Add this line
    classpath 'com.google.gms:google-services:{{ todo }}'
  }
}
```

- Apply the plugin by adding the following to the *very bottom* of the app Gradle file:

**`android/app/build.gradle`**:
```groovy
apply plugin: 'com.google.gms.google-services'
```

## Next

<Grid>
	<Block
		title="New Projects"
		to="/quick-start/ios-firebase-credentials"
        icon="phone_iphone"
        color="#2196F3"
	>
		Create an iOS Firebase app and download the credentials from the Firebase console.
  	</Block>
	<Block
		title="Install React Native Firebase packages"
		to="/v6"
		icon="check"
		color="#43a047"
	>
		Install React Native Firebase packages by following the quick start guide on
		the packages you require.
  	</Block>
</Grid>
