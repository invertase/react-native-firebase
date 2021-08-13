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
import android.graphics.Point;
import android.graphics.Rect;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import com.facebook.react.bridge.*;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;
import javax.annotation.Nullable;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@SuppressWarnings({"unused", "JavaDoc", "WeakerAccess"})
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

  public static int[] rectToIntArray(@Nullable Rect rect) {
    if (rect == null || rect.isEmpty()) return new int[] {};
    return new int[] {rect.left, rect.top, rect.right, rect.bottom};
  }

  public static int[] pointToIntArray(@Nullable Point point) {
    if (point == null) return new int[] {};
    return new int[] {point.x, point.y};
  }

  public static List<int[]> pointsToIntsList(@Nullable Point[] points) {
    if (points == null) return new ArrayList<>();

    List<int[]> pointsList = new ArrayList<>(points.length);
    for (Point point : points) {
      pointsList.add(pointToIntArray(point));
    }

    return pointsList;
  }

  /** Create a Uri from the path, defaulting to file when there is no supplied scheme */
  public static Uri getUri(String uri) {
    Uri parsed = Uri.parse(uri);

    if (parsed.getScheme() == null || parsed.getScheme().isEmpty()) {
      return Uri.fromFile(new File(uri));
    }

    return parsed;
  }

  public static WritableMap getExceptionMap(Exception exception) {
    WritableMap exceptionMap = Arguments.createMap();
    String code = "unknown";
    String message = exception.getMessage();
    exceptionMap.putString("code", code);
    exceptionMap.putString("nativeErrorCode", code);
    exceptionMap.putString("message", message);
    exceptionMap.putString("nativeErrorMessage", message);
    return exceptionMap;
  }

  public static String timestampToUTC(long timestamp) {
    long millisTimestamp = timestamp * 1000;
    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.ROOT);
    format.setTimeZone(TimeZone.getTimeZone("UTC"));
    return format.format(millisTimestamp);
  }

  /** send a JS event */
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
    ActivityManager activityManager =
        (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
    if (activityManager == null) return false;

    List<ActivityManager.RunningAppProcessInfo> appProcesses =
        activityManager.getRunningAppProcesses();
    if (appProcesses == null) return false;

    // Check if current activity is a background activity
    ReactNativeFirebaseJSON json = ReactNativeFirebaseJSON.getSharedInstance();
    if (json.contains("android_background_activity_names")) {
      ArrayList<String> backgroundActivities =
          json.getArrayValue("android_background_activity_names");

      if (backgroundActivities.size() != 0) {
        String currentActivity = "";
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
          List<ActivityManager.AppTask> taskInfo = activityManager.getAppTasks();
          if (taskInfo.size() > 0) {
            ActivityManager.RecentTaskInfo task = taskInfo.get(0).getTaskInfo();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
              currentActivity = task.baseActivity.getShortClassName();
            } else {
              currentActivity =
                  task.origActivity != null
                      ? task.origActivity.getShortClassName()
                      : task.baseIntent.getComponent().getShortClassName();
            }
          }
        } else {
          List<ActivityManager.RunningTaskInfo> taskInfo = activityManager.getRunningTasks(1);
          if (taskInfo.size() > 0) {
            currentActivity = taskInfo.get(0).topActivity.getShortClassName();
          }
        }

        if (!"".equals(currentActivity) && backgroundActivities.contains(currentActivity)) {
          return false;
        }
      }
    }

    final String packageName = context.getPackageName();
    for (ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
      if (appProcess.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
          && appProcess.processName.equals(packageName)) {
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
    int resourceId = ctx.getResources().getIdentifier(resName, "string", ctx.getPackageName());

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
    String fullName = new StringBuilder(packageName).append(".").append(className).toString();

    try {
      Class.forName(fullName);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public static WritableMap jsonObjectToWritableMap(JSONObject jsonObject) throws JSONException {
    Iterator<String> iterator = jsonObject.keys();
    WritableMap writableMap = Arguments.createMap();

    while (iterator.hasNext()) {
      String key = iterator.next();
      Object value = jsonObject.get(key);
      if (value instanceof Float || value instanceof Double) {
        writableMap.putDouble(key, jsonObject.getDouble(key));
      } else if (value instanceof Number) {
        writableMap.putInt(key, jsonObject.getInt(key));
      } else if (value instanceof String) {
        writableMap.putString(key, jsonObject.getString(key));
      } else if (value instanceof JSONObject) {
        writableMap.putMap(key, jsonObjectToWritableMap(jsonObject.getJSONObject(key)));
      } else if (value instanceof JSONArray) {
        writableMap.putArray(key, jsonArrayToWritableArray(jsonObject.getJSONArray(key)));
      } else if (value == JSONObject.NULL) {
        writableMap.putNull(key);
      }
    }

    return writableMap;
  }

  public static WritableArray jsonArrayToWritableArray(JSONArray jsonArray) throws JSONException {
    WritableArray writableArray = Arguments.createArray();

    for (int i = 0; i < jsonArray.length(); i++) {
      Object value = jsonArray.get(i);
      if (value instanceof Float || value instanceof Double) {
        writableArray.pushDouble(jsonArray.getDouble(i));
      } else if (value instanceof Number) {
        writableArray.pushInt(jsonArray.getInt(i));
      } else if (value instanceof String) {
        writableArray.pushString(jsonArray.getString(i));
      } else if (value instanceof JSONObject) {
        writableArray.pushMap(jsonObjectToWritableMap(jsonArray.getJSONObject(i)));
      } else if (value instanceof JSONArray) {
        writableArray.pushArray(jsonArrayToWritableArray(jsonArray.getJSONArray(i)));
      } else if (value == JSONObject.NULL) {
        writableArray.pushNull();
      }
    }
    return writableArray;
  }

  public static WritableMap mapToWritableMap(Map<String, Object> value) {
    WritableMap writableMap = Arguments.createMap();

    for (Map.Entry<String, Object> entry : value.entrySet()) {
      mapPutValue(entry.getKey(), entry.getValue(), writableMap);
    }

    return writableMap;
  }

  private static WritableArray listToWritableArray(List<Object> objects) {
    WritableArray writableArray = Arguments.createArray();
    for (Object object : objects) {
      arrayPushValue(object, writableArray);
    }
    return writableArray;
  }

  @SuppressWarnings("unchecked")
  public static void arrayPushValue(@Nullable Object value, WritableArray array) {
    if (value == null || value == JSONObject.NULL) {
      array.pushNull();
      return;
    }

    String type = value.getClass().getName();
    switch (type) {
      case "java.lang.Boolean":
        array.pushBoolean((Boolean) value);
        break;
      case "java.lang.Long":
        Long longVal = (Long) value;
        array.pushDouble((double) longVal);
        break;
      case "java.lang.Float":
        float floatVal = (float) value;
        array.pushDouble((double) floatVal);
        break;
      case "java.lang.Double":
        array.pushDouble((double) value);
        break;
      case "java.lang.Integer":
        array.pushInt((int) value);
        break;
      case "java.lang.String":
        array.pushString((String) value);
        break;
      case "org.json.JSONObject$1":
        try {
          array.pushMap(jsonObjectToWritableMap((JSONObject) value));
        } catch (JSONException e) {
          array.pushNull();
        }
        break;
      case "org.json.JSONArray$1":
        try {
          array.pushArray(jsonArrayToWritableArray((JSONArray) value));
        } catch (JSONException e) {
          array.pushNull();
        }
        break;
      default:
        if (List.class.isAssignableFrom(value.getClass())) {
          array.pushArray(listToWritableArray((List<Object>) value));
        } else if (Map.class.isAssignableFrom(value.getClass())) {
          array.pushMap(mapToWritableMap((Map<String, Object>) value));
        } else {
          Log.d(TAG, "utils:arrayPushValue:unknownType:" + type);
          array.pushNull();
        }
    }
  }

  @SuppressWarnings("unchecked")
  public static void mapPutValue(String key, @Nullable Object value, WritableMap map) {
    if (value == null || value == JSONObject.NULL) {
      map.putNull(key);
      return;
    }

    String type = value.getClass().getName();
    switch (type) {
      case "java.lang.Boolean":
        map.putBoolean(key, (Boolean) value);
        break;
      case "java.lang.Long":
        Long longVal = (Long) value;
        map.putDouble(key, (double) longVal);
        break;
      case "java.lang.Float":
        float floatVal = (float) value;
        map.putDouble(key, (double) floatVal);
        break;
      case "java.lang.Double":
        map.putDouble(key, (double) value);
        break;
      case "java.lang.Integer":
        map.putInt(key, (int) value);
        break;
      case "java.lang.String":
        map.putString(key, (String) value);
        break;
      case "org.json.JSONObject$1":
        try {
          map.putMap(key, jsonObjectToWritableMap((JSONObject) value));
        } catch (JSONException e) {
          map.putNull(key);
        }
        break;
      case "org.json.JSONArray$1":
        try {
          map.putArray(key, jsonArrayToWritableArray((JSONArray) value));
        } catch (JSONException e) {
          map.putNull(key);
        }
        break;
      default:
        if (List.class.isAssignableFrom(value.getClass())) {
          map.putArray(key, listToWritableArray((List<Object>) value));
        } else if (Map.class.isAssignableFrom(value.getClass())) {
          map.putMap(key, mapToWritableMap((Map<String, Object>) value));
        } else {
          Log.d(TAG, "utils:mapPutValue:unknownType:" + type);
          map.putNull(key);
        }
    }
  }

  /**
   * Convert a ReadableMap to a WritableMap for the purposes of re-sending back to JS
   *
   * @param map ReadableMap
   * @return WritableMap
   */
  public static WritableMap readableMapToWritableMap(ReadableMap map) {
    WritableMap writableMap = Arguments.createMap();
    writableMap.merge(map);
    return writableMap;
  }
}
