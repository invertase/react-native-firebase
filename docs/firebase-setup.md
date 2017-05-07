# Firebase Setup

The RNFirebase library is intended on making it easy to work with [Firebase](https://firebase.google.com/) and provides a small native shim to the Firebase native code.

To add Firebase to your project, make sure to create a project in the [Firebase console](https://firebase.google.com/console)

![Create a new project](https://i.imgur.com/KbbamwD.png)

Each platform uses a different setup method after creating the project.

## iOS

For iOS, ensure you've followed the instructions provided by Firebase; adding your [GoogleService-Info.plist](https://github.com/invertase/react-native-firebase/blob/master/tests/ios/GoogleService-Info.plist)
file to the project, and [configuring your AppDelegate](https://github.com/invertase/react-native-firebase/blob/master/tests/ios/ReactNativeFirebaseDemo/AppDelegate.m#L20).

## Android

For Android, ensure you've followed the instructions provided by Firebase; adding your [google-services.json](https://github.com/invertase/react-native-firebase/blob/master/tests/android/app/google-services.json)
file to the project, installing the [google-services](https://github.com/invertase/react-native-firebase/blob/master/tests/android/build.gradle#L9)
  plugin and applying **at the end** of your [`build.gradle`](https://github.com/invertase/react-native-firebase/blob/master/tests/android/app/build.gradle#L144).
