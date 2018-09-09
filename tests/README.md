# React Native Firebase - Testing Project

Our tests are powered by [Jet ✈️](https://github.com/invertase/jet).

> **Note**: instructions in this file assume you're running terminal commands from the root of the project and not from inside the tests directory.

## Requirements

- Make sure you have Xcode installed (tested with Xcode 9.2+).
- Make sure you have NodeJS installed (Node 8.4.0 and up is required).
- Make sure you have all required dependencies installed:
  - [Apple Sim Utils](https://github.com/wix/AppleSimulatorUtils):

    ```bash
    brew tap wix/brew
    brew install wix/brew/applesimutils
    ```

---

### Step 1: Install test project dependencies

Yarn install at project root and also inside tests directory.

Also install tests project iOS Pods.

```bash
yarn
cd tests/ && yarn
cd tests/ios && pod install --repo-update
```

---

### Step 2: Start Packager Script

Start the React Native packager using the script provided;

```bash
cd tests/ && yarn run packager-jet
```

> ⚠️ It must be this script only that starts the RN Packager, using the default RN packager command will not work.

> ⚠️ Also ensure that all existing packagers are terminated and that you have no React Native debugger tabs open on your browsers.

> This packager will automatically rebuild on any JS changes to the library code. You don't need to restart this, leave it running whilst developing.

---

### Step 3: Build Native App

As always; the first build for each platform will take a while. Subsequent builds are much much quicker ⚡️

> ⚠️ You must rebuild native every time you make changes to native code (anything in /android /ios directories).

#### Android

```bash
cd tests/ && yarn run build-android
```

#### iOS

```bash
cd tests/ && yarn run build-ios
```

---

### Step 4: Finally, run the tests

This action will launch a new simulator (if not already open) and run the tests on it.

> 💡 iOS by default will background launch the simulator - to have
> it launch in the foreground make sure any simulator is currently open, `Finder -> Simulator.app`.

> 💡 Android by default looks for a pre-defined emulator named `TestingAVD` - make sure you have one named the same setup on Android Studio.
> Or you can change this name in the `package.json` of the tests project (don't commit the change though please).
> **DO NOT** rename an existing AVD to this name - it will not work, rename does not change the file path currently so Detox will
> fail to find the AVD in the correct directory. Create a new one with Google Play Services.

#### Android

```bash
cd tests/ && yarn run test-android
```

#### iOS

```bash
cd tests/ && yarn run test-ios
```

The `test-${platform}` commands uninstall any existing app and installs a fresh copy. You can
run `test-${platform}-reuse` instead if you don't need to re-install the app (i.e only making JS code changes).
Just remember to use `test-${platform}` if you made native code changes and rebuilt - after installing once you can
go back to using the `reuse` variant.

The `cover` variant of the yarn scripts will additionally run tests with coverage.
Coverage is output to the root directory of the project: `react-native-firebase/coverage`,
open `react-native-firebase/coverage/lcov-report/index.html` in your browser after running tests
to view detailed coverage output.

---

### Running specific tests

Mocha supports the `.only` syntax, e.g. instead of `describe(...) || it(...)` you can use `describe.only(...) || it.only(...)` to only run that specific context or test.

Another way to do this is via adding a `--grep` option to e2e/mocha.opts file, e.g. `--grep auth` for all tests that have auth in the file path or tests descriptions.

> 💡 Don't forget to remove these before committing your code and submitting a pull request

For more Mocha options see https://mochajs.org/#usage
