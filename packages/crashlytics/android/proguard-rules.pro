# Consumer R8/ProGuard rules for @react-native-firebase/crashlytics.
#
# io.invertase.firebase.crashlytics.ReactNativeFirebaseCrashlyticsInternal reaches these Crashlytics
# SDK internals by reflection to wait for a JS fatal's event write before the process exits. Keep
# this list in sync with the names there. A missing rule (or an SDK without these members) only
# makes the barrier fail, which falls back to a bounded wait; it never crashes.
-keepclassmembers class com.google.firebase.crashlytics.FirebaseCrashlytics {
  com.google.firebase.crashlytics.internal.common.CrashlyticsCore core;
}
-keepclassmembers class com.google.firebase.crashlytics.internal.common.CrashlyticsCore {
  com.google.firebase.crashlytics.internal.concurrency.CrashlyticsWorkers crashlyticsWorkers;
}
-keepclassmembers class com.google.firebase.crashlytics.internal.concurrency.CrashlyticsWorkers {
  com.google.firebase.crashlytics.internal.concurrency.CrashlyticsWorker common;
  com.google.firebase.crashlytics.internal.concurrency.CrashlyticsWorker diskWrite;
}
-keepclassmembers class com.google.firebase.crashlytics.internal.concurrency.CrashlyticsWorker {
  com.google.android.gms.tasks.Task submit(java.lang.Runnable);
  com.google.android.gms.tasks.Task submitTask(java.util.concurrent.Callable);
}
