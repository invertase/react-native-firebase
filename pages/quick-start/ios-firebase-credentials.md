---
title: Adding Firebase credentials to your iOS app
description: Firebase provides a GoogleService-Info.plist file containing your Firebase project credentials. Learn how to add this to your React Native project.
---

# Adding Firebase credentials to your iOS app

The Firebase console provides a `GoogleService-Info.plist` file containing a set of credentials for iOS devices to use when authenticating with your Firebase project. 

We'll quickly walk through the process of retrieving this file and installing it into your iOS project.

## Generating the credentials

The credential file can be generated from the Firebase [console](https://console.firebase.google.com/):

- Select your Firebase project.
- Go to the general project settings by clicking on the gear icon and then 'Project Settings'.
- Under 'Your apps', click on iOS to add an iOS app to your Firebase project. If you already have an app added, click on 'Add app' first to add another one.

![Add an iOS app](https://prismic-io.s3.amazonaws.com/invertase%2Ffd23f086-ac13-4b31-8c08-8fc6a7c512f4_screenshot+2019-05-07+at+11.11.36.png)

- Enter your application details then click on 'Register app':

![Register app](https://prismic-io.s3.amazonaws.com/invertase%2Fa5074801-2205-4812-99e2-a8b9ddebec74_screenshot+2019-05-07+at+11.12.48.png)

- Download the config file to your machine:

![Download file](https://prismic-io.s3.amazonaws.com/invertase%2Fb5967fd4-7620-4d6b-8c2e-d582a1f66f86_screenshot+2019-05-07+at+11.13.51.png)

 Open the React Native iOS project with XCode. 

If using Pods, open the `ios/{projectName}.xcworkspace` file, otherwise open the `ios/{projectName}.xcodeproj` file.

> Do not copy the file manually. XCode must add the file to ensure it is correctly linked to the project.

- Right click your project in XCode and select "Add Files to '{projectName}'".

![Add files](https://prismic-io.s3.amazonaws.com/invertase%2F140b5f1f-3cfa-4bc5-a5e8-f6f33cc43165_unknown+%281%29.png)

- Select the downloaded `GoogleService-Info.plist` file. Ensure 'Copy items if needed' is enabled:

![Select file](https://prismic-io.s3.amazonaws.com/invertase%2F7d37e0ce-3e79-468d-930c-b7dc7bc2e291_unknown+%282%29.png)

- Initialise Firebase using the credentials:

At the top of the following file, add:

**`ios/{projectName}/AppDelegate.m`**:
```objectivec
@import Firebase;
```

Add the following lines to the file:

```objectivec{4-6}
@implementation AppDelegate
// ...
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    if ([FIRApp defaultApp] == nil) {
      [FIRApp configure];
    }
    // ...
}
// ...
```

## Next

<Grid columns="2">
	<Block
		title="Android Firebase Credentials"
		to="/quick-start/android-firebase-credentials"
		icon="android"
		color="#4CAF50"
	>
		Adding Firebase credentials to your Android app from the Firebase console.
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
