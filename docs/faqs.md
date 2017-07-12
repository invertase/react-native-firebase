# FAQs / Troubleshooting

## Usage with Expo

If you use Expo and would like to use this package, you'll need to eject. If you do not want to eject, but wish to make use of features
such as Realtime Database (without offline support) & Authentication, you can still use the Firebase Web SDK in your project. 

For features such a Crash Reporting, Push Notifications (via Firebase not Expo), Performance Monitoring, AdMob, Analytics, Storage & Remote Config, you will have to eject your Expo project as these require the native SDKs, as the Web SDK does not support these.

You can see an indepth conversation [here](https://expo.canny.io/feature-requests/p/full-native-firebase-integration).

## Comparison to Firestack

Firestack was a great start to integrating Firebase and React Native, however has underlying issues which needed to be fixed.
A V3 fork of Firestack was created to help address issues such as lack of standardisation with the Firebase Web SDK,
and missing core features (crash reporting, transactions etc). The volume of pull requests with fixes/features soon became
too large to manage on the existing repository, whilst trying to maintain backwards compatibility.

RNFirebase was re-written from the ground up, addressing these issues with core focus being around matching the Web SDK as
closely as possible and fixing the major bugs/issues along the way.

## [Android] Google Play Services related issues

The firebase SDK requires a certain version of Google Play Services installed on Android in order to function properly.

If the version of Google Play Services installed on your device is incorrect or non existent, React Native Firebase will throw a red box error, and your app will possibly crash as well. The red box error will have a numerical code associated with it. These codes can be found here:

 https://developers.google.com/android/reference/com/google/android/gms/common/ConnectionResult#SERVICE_VERSION_UPDATE_REQUIRED

Here is a quick guide to some of the most common errors encountered:

code 2 -  Google Play Services is required to run this application but no valid installation was found:

The emulator/device you're using does not have the Play Services SDK installed.

- Emulator: Open SDK manager, under 'SDK Tools' ensure "Google Play services, rev X" is installed. Once installed,
create a new emulator image. When selecting your system image, ensure the target comes "with Google APIs".
- Device: Play Services needs to be downloaded from the Google Play Store.

code 9 - The version of the Google Play services installed on this device is not authentic:

This error applies to modified or 'shimmed' versions of Google Play Services which you might be using in a third
party emulator such as GenyMotion.

Using this kind of workaround with Google Play Services can be problematic, so we
recommend using the native Android Studio emulators to reduce the chance of these complications.

## [Android] Turning off Google Play Services availability errors

G.P.S errors can be turned off using a config option like so:

```javascript
const firebase = RNFirebase.initializeApp({
  errorOnMissingPlayServices: false,
});
```
This will stop your app from immediately red-boxing or crashing, but won't solve the underlying issue of G.P.S not being available or of the correct version. This will mean certain functionalities won't work properly and your app may even crash.

## [Android] Checking for Google Play Services availability with React Native Firebase

React Native Firebase actually has a useful helper object for checking G.P.S availability:

```javascript
const availability = firebase.googleApiAvailability;
```

The availability object would then have the following properties that you can run checks against:

```javascript
isAvailable: boolean
```

and if not available (isAvailable === false):

```javascript
isUserResolvableError: boolean
```

This variable indicates whether or not the end user can fix the issue, for example by downloading the required version of Google Play Services. In a case such as a GenyMotion emulator, this would return false for missing G.P.S, as the end user can't add the package directly.

```javascript
error: string
```
This error will match the messages and error codes mentioned above, and can be found here:

https://developers.google.com/android/reference/com/google/android/gms/common/ConnectionResult#SERVICE_VERSION_UPDATE_REQUIRED


## [Android] Duplicate Dex Files error (build time error)

A common build time error when using libraries that require google play services is of the form:
'Failed on android with com.android.dex.DexException: Multiple dex files... '

This error (https://github.com/invertase/react-native-firebase/issues/48) occurs because different versions of google play services or google play services modules are being required by different libraries.

The process to fix this is fairly manual and depends on your specific combination of external libraries. Essentially what's required is to check the app level build.gradle file of each external library and establish which ones have a Google Play Services dependency.

You then need to find the lowest common version of each G.P.S module dependency, require that in the app level build.gradle file of your own project, and exclude it from being required by the modules themselves. This will force the use of a consistent version of the G.P.S module.

It's not a good idea to modify the version within the library's build.gradle, as this will be overwritten when you update the library, which will lead to the build breaking again.

A good break down of this process can be found here:
https://medium.com/@suchydan/how-to-solve-google-play-services-version-collision-in-gradle-dependencies-ef086ae5c75f
