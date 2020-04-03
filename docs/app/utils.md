---
title: Utils
description: Using the exposed utilities the library provides.
next: /crashlytics/usage
previous: /app/usage
---

The App module also provides access to some handy utility methods which have been exposed to aid with your 
development.

# File Paths

When working with modules such as [Cloud Storage](/storage), you may need to know about the devices
current directory paths. Rather than installing a separate module, the library provides useful statics
which can be used.

Access the `FilePath` static via utils:

```js
import { utils } from '@react-native-firebase/app';

console.log(utils.FilePath.PICTURES_DIRECTORY);
```

# Test Lab

Firebase [TestLab](https://firebase.google.com/docs/test-lab/?utm_source=invertase&utm_medium=react-native-firebase&utm_campaign=utils)
is a cloud-based app-testing infrastructure. With one operation, you can test your Android or iOS app across
a wide variety of devices and device configurations, and see the results—including logs, videos,
and screenshots—in the Firebase console.

It is useful to change the apps configuration if it is being run in Test Lab, for example disabling Analytics
data collection. Such functionality can be carried out by taking advantage of the `isRunningInTestLab`.
 
> Be aware, `isRunningInTestLab` is Android only property!

```js
import { utils } from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
 
async function bootstrap() {
  if (utils().isRunningInTestLab) {
    await analytics().setAnalyticsCollectionEnabled(false);
  }
}
```
