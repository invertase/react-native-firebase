<!-- TODO -->

### Enable Database Persistence

Enabling database persistence (setPersistence) via JS for the default is no longer supported. This breaking change was added in v3 to prevent several race condition issues.

You can still however easily enable this natively for the default app instance:

#### Android

Add `FirebaseDatabase.getInstance().setPersistenceEnabled(true);` inside your MainActivity.java onCreate() method.

#### iOS

Add `[FIRDatabase database].persistenceEnabled = YES;` after the `[FIRApp configure];` line inside your `AppDelegate` `didFinishLaunchingWithOptions` method.
