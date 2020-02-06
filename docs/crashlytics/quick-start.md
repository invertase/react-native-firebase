---
title: Quick Start
description: Getting started with Crashlytics in React Native Firebase
---

# Crashlytics Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the project's <Anchor version={false} group={false} href="/quick-start">quick start</Anchor> guide.

Install this module with Yarn:

```bash
yarn add @react-native-firebase/crashlytics
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

Both platforms require additional steps to complete installation:

<Grid columns="2">
	<Block
		title="Android: Additional Steps"
		to="/android-setup"
		icon="android"
		color="#4CAF50"
	>
		Follow the Android steps to complete Crashlytics integration.
  </Block>
</Grid>

## Module usage

The Crashlytics package will automatically report on any fatal application crash. Both native and JavaScript
crashes along with unhandled promise rejections are captured with full stack traces.

The package provides a JavaScript API to create your own crash reports and/or send additional information
with crash reports to the Firebase console for a better debugging experience.

Once installed, import the Crashlytics package into your project:

```js
import crashlytics from '@react-native-firebase/crashlytics';
```

You need to import the library even if you're not using any functions of the Crashlytics SDK. By doing this, you enable the listener that get the JS stacktrace into the Crash Reporting console in Firebase

Consider putting this in `index.js` file.

```js
import '@react-native-firebase/crashlytics';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/crashlytics';
```

### Testing crashes

The Crashlytics package provides a `crash` method which is provided to ensure crash reports are correctly
being sent to the Firebase console and can be used with your own test suite. Any `log` methods called before
sending a crash report and sent with the crash report.

```js
import crashlytics from '@react-native-firebase/crashlytics';

function forceCrash() {
  crashlytics().log('Testing crash');
  crashlytics().crash();
}
```

### Handling non-fatal crashes

Crashlytics supports sending JavaScript stack traces to the Firebase console. This can be used in any situations
where an error occurs but is caught by your own code as a bailout method. To
send a stack trace, pass a [JavaScript Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
to the `recordError` method.

```js
import crashlytics from '@react-native-firebase/crashlytics';

function sendReport() {
  crashlytics().recordError(new Error('Error with a stack trace'));
}
```

### Additional crash attributes

It is possible to provide additional attributes which are sent with crash reports. This helps with debugging and
localising the error. To set additional attributes call the `set*` methods.

```js
import crashlytics from '@react-native-firebase/crashlytics';

async function onSignIn(user) {
  await Promise.all([
    crashlytics().setUserId(user.uid),
    crashlytics().setUserName(user.username),
    crashlytics().setUserEmail(user.email),
    crashlytics().setAttribute('credits', user.credits),
  ]);

  crashlytics.crash();
}
```

### Disabling Crashlytics automatic collection 

To disable Crashlytics so you can manually opt-in your app users, set the `crashlytics_auto_collection_enabled` option to `false` in the `firebase.json` file.

Once your user has consented, enable Crashlytics collection via the JavaScript API:

```js
await firebase.crashlytics().setCrashlyticsCollectionEnabled(true);
```


### Enabling Debug Reports
By default, Crashlytics won't report crashes and logs from builds in debug mode. To enable it, set the `crashlytics_debug_enabled` option to `true` in the `react-native` section of your `firebase.json` config file.

To learn more about all the `firebase.json` options, view the <Anchor version group="app" href="/reference/firebasejsonconfig">documentation here</Anchor>. 
