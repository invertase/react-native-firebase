package io.invertase.firebase.common;

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import android.app.ActivityManager;
import android.content.Context;
import android.provider.Settings;
import android.util.Log;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import io.invertase.firebase.app.ReactNativeFirebaseApp;


@SuppressWarnings("WeakerAccess")
public class SharedUtils {
  private static final String TAG = "Utils";
  private static final String RN_DEVSUPPORT_CLASS = "DevSupportManagerImpl";
  private static final String RN_DEVSUPPORT_PACKAGE = "com.facebook.react.devsupport";

  private static final String EXPO_REGISTRY_CLASS = "ModuleRegistry";
  private static final String EXPO_CORE_PACKAGE = "expo.core";

  private static final String FLUTTER_REGISTRY_CLASS = "PluginRegistry";
  private static final String FLUTTER_CORE_PACKAGE = "io.flutter.plugin.common";

  private static final String REACT_NATIVE_REGISTRY_CLASS = "NativeModuleRegistry";
  private static final String REACT_NATIVE_CORE_PACKAGE = "com.facebook.react.bridge";


  public static String timestampToUTC(long timestamp) {
    Calendar calendar = Calendar.getInstance();
    Date date = new Date((timestamp + calendar.getTimeZone().getOffset(timestamp)) * 1000);
    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US);
    format.setTimeZone(TimeZone.getTimeZone("UTC"));
    return format.format(date);
  }

  /**
   * send a JS event
   **/
  public static void sendEvent(final ReactContext context, final String eventName, Object body) {
    if (context != null) {
      context
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, body);
    } else {
      Log.d(TAG, "Missing context - cannot send event!");
    }
  }

  /**
   * We need to check if app is in foreground otherwise the app will crash.
   * http://stackoverflow.com/questions/8489993/check-android-application-is-in-foreground-or-not
   *
   * @param context Context
   * @return boolean
   */
  public static boolean isAppInForeground(Context context) {
    ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
    if (activityManager == null) return false;

    List<ActivityManager.RunningAppProcessInfo> appProcesses = activityManager.getRunningAppProcesses();
    if (appProcesses == null) return false;

    final String packageName = context.getPackageName();
    for (ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
      if (
        appProcess.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
          && appProcess.processName.equals(packageName)
      ) {
        ReactContext reactContext;

        try {
          reactContext = (ReactContext) context;
        } catch (ClassCastException exception) {
          // Not react context so default to true
          return true;
        }

        return reactContext.getLifecycleState() == LifecycleState.RESUMED;
      }
    }

    return false;
  }

  public static int getResId(Context ctx, String resName) {
    int resourceId = ctx
      .getResources()
      .getIdentifier(resName, "string", ctx.getPackageName());

    if (resourceId == 0) {
      Log.e(TAG, "resource " + resName + " could not be found");
    }

    return resourceId;
  }

  /**
   * Checks for dev support availability - so we can ignore in release builds for example.
   *
   * @return Boolean
   */
  public static Boolean reactNativeHasDevSupport() {
    return hasPackageClass(RN_DEVSUPPORT_PACKAGE, RN_DEVSUPPORT_CLASS);
  }

  /**
   * Is the build platform Expo?
   *
   * @return Boolean
   */
  public static Boolean isExpo() {
    return hasPackageClass(EXPO_CORE_PACKAGE, EXPO_REGISTRY_CLASS);
  }

  /**
   * Is the build platform Flutter?
   *
   * @return Boolean
   */
  public static Boolean isFlutter() {
    return hasPackageClass(FLUTTER_CORE_PACKAGE, FLUTTER_REGISTRY_CLASS);
  }

  /**
   * Is the build platform React Native?
   *
   * @return Boolean
   */
  public static Boolean isReactNative() {
    return !isExpo() && hasPackageClass(REACT_NATIVE_CORE_PACKAGE, REACT_NATIVE_REGISTRY_CLASS);
  }

  /**
   * Returns true/false if a class for a package exists in the app class bundle
   *
   * @param packageName
   * @param className
   * @return
   */
  @SuppressWarnings("StringBufferReplaceableByString")
  public static Boolean hasPackageClass(String packageName, String className) {
    // ProGuard is surprisingly smart in this case and will keep a class if it detects a call to
    // Class.forName() with a static string. So instead we generate a quasi-dynamic string to
    // confuse it.
    String fullName = new StringBuilder(packageName)
      .append(".")
      .append(className)
      .toString();

    try {
      Class.forName(fullName);
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
