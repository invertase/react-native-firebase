# React Native Firebase - Testing Project

## Requirements

* Make sure you have Xcode installed (tested with Xcode 8.1-8.2).
* make sure you have node installed (`brew install node`, node 7.6.0 and up is required.
* Make sure you have react-native dependencies installed:
  * react-native-cli is installed (`npm install -g react-native-cli`)
  * watchman is installed (`brew install watchman`)
  * [appleSimUtils](https://github.com/wix/AppleSimulatorUtils)
  * detox-cli `npm install -g detox-cli`

### Step 1: Npm install

* Run `npm install`.

## To test Release build of your app

### Step 2: Build

* Build the demo project

```sh
detox build --configuration ios.sim.release
```

### Step 3: Test

* Run tests on the demo project

```sh
detox test --configuration ios.sim.release
```

This action will open a new simulator and run the tests on it.

## To test Debug build of your app

### Step 2: Build

* Build the demo project

```sh
detox build --configuration ios.sim.debug
```

### Step 3: Test

* start react-native packager

```sh
npm run start
```

* Run tests on the demo project

```sh
detox test --configuration ios.sim.debug
```

This action will open a new simulator and run the tests on it.

### TODO - Troubleshooting

Gradle issues... https://stackoverflow.com/questions/46917365/error-could-not-initialize-class-com-android-sdklib-repository-androidsdkhandle?rq=1

mac: `export JAVA_HOME="/Applications/Android Studio.app/Contents/jre/jdk/Contents/Home"`
windows `"C://Program Files/Java/jdk_1.x_"`

android sdk root `export ANDROID_SDK_ROOT="/Users/mike/Library/Android/sdk"`

Add platform-tools to your path

echo 'export ANDROID_HOME=/Users/$USER/Library/Android/sdk' >> ~/.bash_profile
echo 'export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools' >> ~/.bash_profile

Name: TestingAVD

CPU/ABI: null (null)

Path: /Users/mike/.android/avd/Actually_THIS_one.avd

Error: Failed to parse properties from /Users/mike/.android/avd/Actually_THIS_one.avd/config.ini

#### Running specific tests

Add a `--grep` to e2e/mocha.opts file, e.g. `--grep auth` for all tests that have auth in the file path or tests descriptions.

#### Running Node debugger

Add `--inspect` to e2e/mocha.opts file

To open node debugger tools on chrome navigate to chrome://inspect/#devices and click the `Open dedicated DevTools for Node` link.

Add the default connection of `localhost:9229` if you haven't already - then the debugger will automatically connect everytime you start tests with inspect flag.
