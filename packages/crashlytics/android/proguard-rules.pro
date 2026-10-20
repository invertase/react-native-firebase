# Consumer R8/ProGuard rules for @react-native-firebase/crashlytics.
#
# com.google.firebase.crashlytics.ReactNativeFirebaseCrashlyticsInternal reads this private field by
# reflection to wait for a JS fatal's event write before the process exits. Without this rule the
# lookup falls back to the field's type, and failing that to a bounded wait, so a missing rule only
# weakens the guarantee; it never crashes.
-keepclassmembers class com.google.firebase.crashlytics.internal.common.CrashlyticsCore {
  com.google.firebase.crashlytics.internal.concurrency.CrashlyticsWorkers crashlyticsWorkers;
}
