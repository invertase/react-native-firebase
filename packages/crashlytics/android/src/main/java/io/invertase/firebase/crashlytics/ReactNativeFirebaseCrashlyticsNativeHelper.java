package io.invertase.firebase.crashlytics;

import com.google.firebase.crashlytics.FirebaseCrashlytics;

public class ReactNativeFirebaseCrashlyticsNativeHelper {

  public static void recordNativeException(Throwable throwable) {
    FirebaseCrashlytics.getInstance().recordException(throwable);
  }

}
