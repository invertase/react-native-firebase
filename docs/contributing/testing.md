# Testing

Currently due to the blackbox Firebase enviroment, we have found the best way to test the library is to directly test against the library using a live Firebase project. As some modules also work with the offical web SDK, we can directly compare the results against our own library. This is however restrictive as it doesn't directly test the native code/modules. Plans are in place to overhaul the entire testing setup.

## Running the test app

For convenience all of the required NPM scripts are packaged with the main library to run the test app.

### Step 1 - Fork & Clone

```bash
git clone git@github.com:<username>/react-native-firebase.git
```

### Step 2 - Install dependencies

```bash
npm run tests-npm-install
```


### Step 3 - Install [WML](https://github.com/wix/wml)

WML is a library which copies files & directories to a location. This allows us to copy any changes from the library directly into the tests app, so we can quickly test changes.

```bash
npm install -g wml
```

### Step 4 - Start the watcher

```bash
npm run tests-watch-init
npm run tests-watch-start
```

### Step 5 - Start the app

```bash
npm run tests-packager
```

#### Android

Open the `tests/android` directory from Android Studio and allow Gradle to sync. Now run the app on an emulator/device.

#### iOS

First install the Pods:

```
npm run tests-pod-install
```

Open the `tests/ios/ReactNativeFirebaseDemo.xcworkspace` file in XCode and build for your preffered device or simulator.
