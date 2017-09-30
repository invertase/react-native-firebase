# Crash Reporting

RNFirebase provides crash reporting for your app out of the box. Please note crashes do not appear in real-time on the console, they tend to take a number of hours to appear.

## Enabling/Disabling Crash Reporting

By default crash reporting is enabled. If you want to disable reporting, call `setCrashCollectionEnabled(enabled: Boolean)`:

```js
firebase.crash().setCrashCollectionEnabled(false);
```

To check if crash reporting is currently enabled, call `isCrashCollectionEnabled(): Promise<boolean>`:

```js
firebase.crash().isCrashCollectionEnabled()
  .then((enabled) => {
    if (enabled) {
      console.log('Crash Reporting is currently enabled');
    }
  });
```

## Manual Crash Reporting

If you want to manually report a crash, such as a pre-caught exception this is possible by using the `report` method.

```javascript
try {
  initSomeSDK();
} catch (e) {
  firebase.crash().log('Some SDK failed to boot!');
  firebase.crash().report(e);
}
```

### log

Logs a message that will appear in a subsequent crash report.

`firebase.crash().log(String message);`

### logcat

- **Android**: Logs a message that will appear in a subsequent crash report as well as in [logcat](https://developer.android.com/studio/command-line/logcat.html).
- **iOS**: Logs the message in the subsequest crash report only (same as `log`).

`firebase.crash().logcat(int level, String tag, String message);`

### report

Files a crash report, along with any previous logs to Firebase. An [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) object must be passed into the report method.

`firebase.crash().report(Error, int maxStackSize)`.
