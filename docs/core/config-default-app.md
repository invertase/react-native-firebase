### Default Firebase App

After following the iOS & Android install guides and correctly setting up your google services plist/json files; the default app is automatically initialized and available for use in react-native-firebase.

There's no need to call `initializeApp(opt)` in your JS code for the default app, import RNFirebase and use the default app straight away:

```javascript
import firebase from 'react-native-firebase';

console.log(firebase.database().app.name); // '[DEFAULT]'
```

!> Calling `initializeApp()` for the default app will throw an 'app already initialized' error in a later release.

### Enable Database Persistence

Enabling database persistence (setPersistence) via JS for the default app is no longer supported. This breaking change was added in v3 to prevent several race condition issues around.

You can still however easily enable this natively for the default app instance:

#### Android

Add `FirebaseDatabase.getInstance().setPersistenceEnabled(true);` inside your `MainActivity.java` files `onCreate()` method.

#### iOS

Add `[FIRDatabase database].persistenceEnabled = YES;` after the `[FIRApp configure];` line inside your `AppDelegate.m` files `didFinishLaunchingWithOptions` method.
