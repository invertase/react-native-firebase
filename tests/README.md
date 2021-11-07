# React Native Firebase - Testing Project

Our tests are powered by [Jet ✈️](https://github.com/invertase/jet).

> **Note**: instructions in this file assume you're running terminal commands from the root of the project and not from inside the tests directory.

## Requirements

- Make sure you have Xcode installed (tested with Xcode 13+) to develop iOS items
- Make sure you have Node.js installed with yarn installed globally (node version 14, yarn v1 is required).
- Make sure you have all required iOS dependencies installed:

  - [Apple Sim Utils](https://github.com/wix/AppleSimulatorUtils):

    ```bash
    brew tap wix/brew
    brew install wix/brew/applesimutils
    ```

> **Note**: If Homebrew complains about a conflict in the `wix/brew` tap, run `brew untap wix/brew && brew tap wix/brew` and try installing again

---

## Cleaning dependencies

You might find yourself in a situation where you want to start from a clean slate. The following will delete all `node_modules` and project `build` folders.

```bash
yarn lerna:clean
yarn build:all:clean
```

---

### Step 1: Install test project dependencies

```bash
yarn
yarn tests:ios:pod:install  # for iOS development
```

---

### Step 2: Start Packager Script

Start the React Native packager using the script provided;

```bash
yarn tests:packager:jet
```

> ⚠️ It must be this script only that starts the RN Packager, using the default RN packager command will not work.

> ⚠️ Also ensure that all existing packagers are terminated and that you have no React Native debugger tabs open on your browsers.

> This packager will automatically rebuild on any JS changes to the library code. You don't need to restart this, leave it running whilst developing.

---

### Step 3: Build Native App

As always; the first build for each platform will take a while. Subsequent builds are much quicker ⚡️

> ⚠️ You must rebuild native every time you make changes to native code (anything in /android /iOS directories).

#### Android

```bash
yarn tests:android:build
```

#### iOS

```bash
yarn tests:ios:build
```

---

### Step 4: Setting up android emulator and iOS simulator and Firestore emulator

To run android tests you will need to create a new emulator and name it `TestingAVD` (You can't rename existing one).
This emulator will need to be up and running before you start your android tests from Step 5.

With iOS Detox will start a simulator for you by default or run tests in an open one.

For the Firestore emulator you need to install the tools and start the emulator:

```bash
yarn tests:emulator:start # for linux/macOS-hosted development
yarn tests:emulator:start-windows # if developing on windows
```

---

### Step 5: Finally, run the tests

This action will launch a new simulator (if not already open) and run the tests on it.

> 💡 iOS by default will background launch the simulator - to have
> it launch in the foreground make sure any simulator is currently open, `Finder -> Simulator.app`.

> 💡 Android by default looks for a predefined emulator named `TestingAVD` - make sure you have one named the same setup on Android Studio.
> Or you can change this name in the `package.json` of the tests project (don't commit the change though please).
> **DO NOT** rename an existing AVD to this name - it will not work, rename does not change the file path currently so Detox will
> fail to find the AVD in the correct directory. Create a new one with Google Play Services.

#### Android

```bash
yarn tests:android:test
```

#### iOS

```bash
yarn tests:ios:test
```

The `tests:${platform}:test` commands uninstall any existing app and installs a fresh copy. You can
run `tests:${platform}:test-reuse` instead if you don't need to re-install the app (i.e only making JS code changes).
Just remember to use `test-${platform}` if you made native code changes and rebuilt - after installing once you can
go back to using the `reuse` variant.

The `tests:${platform}:cover` variant of the yarn scripts will additionally run tests with coverage.
Coverage is output to the root directory of the project: `react-native-firebase/coverage`,
open `react-native-firebase/coverage/lcov-report/index.html` in your browser after running tests
to view detailed coverage output.

---

### Running specific tests

Mocha supports the `.only` syntax, e.g. instead of `describe(...) || it(...)` you can use `describe.only(...) || it.only(...)` to only run that specific context or test.

Another way to do this is via adding a `--grep` option to `e2e/mocha.opts` file, e.g. `--grep auth` for all tests that have auth in the file path or tests descriptions.

> 💡 Don't forget to remove these before committing your code and submitting a pull request

For more Mocha options see https://mochajs.org/#usage

---

### Linting & type checking files

Runs ESLint and respective type checks on project files

```bash
yarn validate:all:js
yarn validate:all:ts
yarn validate:all:flow
```

---

### Debugging E2E JS Tests (VSCode)

Navigate to your .vscode/launch.json.

Ensure the following exists as a debugging option.

```js
{
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "port": 9229
    }
```

1. Add a breakpoint in the JS file where you will need to debug.
2. Select the debug icon under 'NPM Scripts' when selecting one of the following scripts...

- tests:ios:test:debug (iOS)
- tests:android:test:debug (Android)

---

<p>
  <img align="left" width="75px" src="https://static.invertase.io/assets/invertase-logo-small.png">
  <p align="left">
    Built and maintained with 💛 by <a href="https://invertase.io">Invertase</a>.
  </p>
  <p align="left">
    <a href="https://invertase.io/hire-us">💼 Hire Us</a> |
    <a href="https://opencollective.com/react-native-firebase">☕️ Sponsor Us</a> |
    <a href="https://opencollective.com/jobs">‍💻 Work With Us</a>
  </p>
</p>

---
