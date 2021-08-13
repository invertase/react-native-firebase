package io.invertase.firebase.crashlytics;

import com.google.firebase.crashlytics.FirebaseCrashlytics;

public class ReactNativeFirebaseCrashlyticsNativeHelper {

  public static void recordNativeException(Throwable throwable) {
    FirebaseCrashlytics.getInstance().recordException(throwable);
  }

  public static void log(String message) {
    FirebaseCrashlytics.getInstance().log(message);
  }

  public static void setCustomKey(String key, String value) {
    FirebaseCrashlytics.getInstance().setCustomKey(key, value);
  }
}
