---
title: Adding Firebase credentials to your iOS app
description: Firebase provides a GoogleService-Info.plist file containing your Firebase project credentials. Learn how to add this to your React Native project.
---

# Adding Firebase credentials to your iOS app

The Firebase console provides a `GoogleService-Info.plist` file containing a set of credentials for iOS devices to use when authenticating with your Firebase project.

We'll quickly walk through the process of retrieving this file and installing it into your iOS project.

## Generating the credentials

The credential file can be generated from the Firebase [console](https://console.firebase.google.com/).
After selecting your Firebase project, open the project settings by clicking on the gear icon and then navigate to 'Project Settings'.

Under 'Your apps', click on the iOS logo (highlighted in orange) to add a new iOS app to your Firebase project:

![iOS Settings](https://prismic-io.s3.amazonaws.com/invertase%2F5056358b-5b0a-4e3d-9314-01ee8b9437d4_settings-ios.png)

Enter your application details then click on 'Register app'. The 'iOS bundle ID' must match your local iOS bundle ID.

![iOS Register](https://prismic-io.s3.amazonaws.com/invertase%2Fc7ad084f-d455-4d95-b498-de99bf68742d_register-ios.png)

Download the config file locally by pressing "Download GoogleService-Info.plist". Using Xcode, open the projects
`/ios/{projectName}.xcodeproj` file (or `/ios/{projectName}.xcworkspace` if using Pods).

Right click on the project name and "Add files" to the project, as demonstrated below:

![Add files](https://prismic-io.s3.amazonaws.com/invertase%2F140b5f1f-3cfa-4bc5-a5e8-f6f33cc43165_unknown+%281%29.png)

Select the downloaded `GoogleService-Info.plist` file and ensure the 'Copy items if needed' checkbox is enabled.

![Select file](https://prismic-io.s3.amazonaws.com/invertase%2F7d37e0ce-3e79-468d-930c-b7dc7bc2e291_unknown+%282%29.png)

Next we need to initialize the Firebase service manually. To do this, open the AppDelegate file within your project
`/ios/{projectName}/AppDelegate.m`.

At the top of the file import the Firebase module:

```objectivec
#import <Firebase.h>
```

Within the `didFinishLaunchingWithOptions` method, add the `configure` method:

```objectivec{2-4}
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    if ([FIRApp defaultApp] == nil) {
      [FIRApp configure];
    }
```

## Rebuilding iOS

Your iOS project now needs to be rebuild to start using Firebase. Before doing so, ensure your projects Pods are up-to-date:

```bash
$ cd ios/
$ pod install --repo-update
```

Once complete, rebuild your iOS project from the project root using the React Native CLI:

```bash
$ cd ..
$ npx react-native run-ios
```

## Next Steps

Once your iOS project is setup, you can follow the setup for getting started with Android, or get started using Firebase services.

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
		title="Integrate additional Firebase services"
		to="/v6"
		icon="check"
		color="#43a047"
	>
		Integrate additional Firebase services by following the quick start guides for
		the services you require.
	</Block>
</Grid>
