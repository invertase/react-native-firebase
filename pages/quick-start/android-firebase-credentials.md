---
title: Adding Firebase credentials to your Android app
description: Firebase provides a google-services.json file containing your Firebase project credentials. Learn how to add this to your React Native project.
---

# Adding Firebase credentials to your Android app

The Firebase console provides a `google-services.json` file containing a set of credentials for Android devices to use when authenticating with your Firebase project.

We'll quickly walk through the process of retrieving this file and installing it into your Android project.

## Generating the credentials

The credential file can be generated from the Firebase [console](https://console.firebase.google.com/):

- Select your Firebase project.
- Go to the general project settings by clicking on the gear icon and then 'Project Settings'.
- Under 'Your apps', click on Android to add an Android app to your Firebase project. If you already have an app added, click on 'Add app' first to add another one.

![Add an Android app to the project](https://prismic-io.s3.amazonaws.com/invertase%2F5efac24d-9551-4667-8ce7-2d6d4e5910f3_screenshot+2019-05-07+at+10.43.40.png)

- Enter your application details then click on 'Register app':

> The debug signing certificate is optional to use Firebase with your app, but is required for Dynamic Links, Invites and Phone Auth. To generate a certificate run `cd android && ./gradlew signingReport` and copy the SHA1 from the `debug` key.  This generate two variant keys. You can copy the 'SHA1' that belong to the `debugAndroidTest` variant key option

![Register app](https://prismic-io.s3.amazonaws.com/invertase%2F3ea8d102-0fa8-4a5e-bbb4-938f5955800e_screenshot+2019-05-07+at+11.00.01.png)

- Download the google-services.json config file for firebase and save it to the `<myProjectName>/android/app` folder in your project:
> Substitute `<myProjectName>` for the name of your new project.

![Download](https://prismic-io.s3.amazonaws.com/invertase%2F3bd36734-a2a7-46c7-aca5-a7b007c4ec35_screenshot+2019-05-07+at+10.48.12.png)

- From the next step, get the com.google.gms:google-services version number, to replace the undefined in the image above. Ignore the rest of the details in this next steps on the Firebase Console and load the `google-services.json` file with the Google services plugin for Gradle:

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

<Grid columns="2">
	<Block
		title="iOS Firebase Credentials"
		to="/quick-start/ios-firebase-credentials"
        icon="phone_iphone"
        color="#2196F3"
	>
		Adding Firebase credentials to your iOS app from the Firebase console.
  	</Block>
	<Block
		title="Integrate additional Firebase services"
		to="/v6"
		icon="check"
		color="#43a047"
	>
		Integrate additional Firebase services by following the quick start guides for
		the services you require.
  	</Block>
</Grid>
