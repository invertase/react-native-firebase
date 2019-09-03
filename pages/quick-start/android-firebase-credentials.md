---
title: Adding Firebase credentials to your Android app
description: Firebase provides a google-services.json file containing your Firebase project credentials. Learn how to add this to your React Native project.
---

# Adding Firebase credentials to your Android app

The Firebase console provides a `google-services.json` file containing a set of credentials for Android devices to use when authenticating with your Firebase project.

We'll quickly walk through the process of retrieving this file and installing it into your Android project.

## Generating the credentials

The credential file can be generated from the Firebase [console](https://console.firebase.google.com/). After selecting your Firebase project, open the project settings by clicking on the gear icon and then navigate to 'Project Settings'.

Under 'Your apps', click on the Android logo to add a new Android app to your Firebase project:

![Add an Android app to the project](https://prismic-io.s3.amazonaws.com/invertase%2F5efac24d-9551-4667-8ce7-2d6d4e5910f3_screenshot+2019-05-07+at+10.43.40.png)

Enter your application details then click on 'Register app'. The 'Android package name' must  match your local Android package name.

> The debug signing certificate is optional to use Firebase with your app, but is required for Dynamic Links, Invites and Phone Auth. To generate a certificate run `cd android && ./gradlew signingReport` and copy the SHA1 from the `debug` key.  This generates two variant keys. You can copy the 'SHA1' that belong to the `debugAndroidTest` variant key option.

![Register app](https://prismic-io.s3.amazonaws.com/invertase%2F3ea8d102-0fa8-4a5e-bbb4-938f5955800e_screenshot+2019-05-07+at+11.00.01.png)


Download the config file locally by pressing "Download google-services.json".  Now add the downloaded JSON file to your React Native project at the following location: `/android/app/google-services.json`.

![Download](https://prismic-io.s3.amazonaws.com/invertase%2F3bd36734-a2a7-46c7-aca5-a7b007c4ec35_screenshot+2019-05-07+at+10.48.12.png)

The step "Add Firebase SDK" on the Firebase console can be skipped - React Native Firebase automatically includes the necessary Firebase SDKs.

# Applying the config file

The Firebase SDKs now need to read the config file - this can be achived by applying the `google-services` plugin in our Android project.

Add the `google-services` dependancy inside of your `android/build.gradle` file:

```groovy{3}
buildscript {
  dependencies {
    ...
    classpath 'com.google.gms:google-services:{{ google.services }}'
  }
}
```

Next we need to apply the plugin. Add the following line to the **very bottom** of the `android/app/build.gradle` file:

```groovy
apply plugin: 'com.google.gms.google-services'
```

Once complete, rebuild your Android project using `react-native run-android`.

## Next

Once your Android project is setup, you can follow the setup for getting started with iOS, or get started using Firebase services.

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
