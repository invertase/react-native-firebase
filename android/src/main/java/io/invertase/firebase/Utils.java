package io.invertase.firebase;

import android.app.ActivityManager;
import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

import javax.annotation.Nullable;


@SuppressWarnings("WeakerAccess")
public class Utils {
  private static final String TAG = "Utils";

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
   * Takes a value and calls the appropriate setter for its type on the target map + key
   *
   * @param key   String key to set on target map
   * @param value Object value to set on target map
   * @param map   WritableMap target map to write the value to
   */
  @SuppressWarnings("unchecked")
  public static void mapPutValue(String key, @Nullable Object value, WritableMap map) {
    if (value == null) {
      map.putNull(key);
    } else {
      String type = value
        .getClass()
        .getName();
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
          map.putDouble(key, (Double) value);
          break;
        case "java.lang.Integer":
          map.putInt(key, (int) value);
          break;
        case "java.lang.String":
          map.putString(key, (String) value);
          break;
        case "org.json.JSONObject$1":
          map.putString(key, value.toString());
          break;
        default:
          if (List.class.isAssignableFrom(value.getClass())) {
            map.putArray(key, Arguments.makeNativeArray((List<Object>) value));
          } else if (Map.class.isAssignableFrom(value.getClass())) {
            WritableMap childMap = Arguments.createMap();
            Map<String, Object> valueMap = (Map<String, Object>) value;

            for (Map.Entry<String, Object> entry : valueMap.entrySet()) {
              mapPutValue(entry.getKey(), entry.getValue(), childMap);
            }

            map.putMap(key, childMap);
          } else {
            Log.d(TAG, "utils:mapPutValue:unknownType:" + type);
            map.putNull(key);
          }
      }
    }
  }

  /**
   * Convert a ReadableMap to a WritableMap for the purposes of re-sending back to JS
   * TODO This is now a legacy util - internally uses RN functionality
   *
   * @param map ReadableMap
   * @return WritableMap
   */
  public static WritableMap readableMapToWritableMap(ReadableMap map) {
    WritableMap writableMap = Arguments.createMap();
    // https://github.com/facebook/react-native/blob/master/ReactAndroid/src/main/java/com/facebook/react/bridge/WritableNativeMap.java#L54
    writableMap.merge(map);
    return writableMap;
  }

  /**
   * Convert a ReadableMap into a native Java Map
   * TODO This is now a legacy util - internally uses RN functionality
   *
   * @param readableMap ReadableMap
   * @return Map
   */
  public static Map<String, Object> recursivelyDeconstructReadableMap(ReadableMap readableMap) {
    // https://github.com/facebook/react-native/blob/master/ReactAndroid/src/main/java/com/facebook/react/bridge/ReadableNativeMap.java#L216
    return readableMap.toHashMap();
  }

  /**
   * Convert a ReadableArray into a native Java Map
   * TODO This is now a legacy util - internally uses RN functionality
   *
   * @param readableArray ReadableArray
   * @return List<Object>
   */
  public static List<Object> recursivelyDeconstructReadableArray(ReadableArray readableArray) {
    // https://github.com/facebook/react-native/blob/master/ReactAndroid/src/main/java/com/facebook/react/bridge/ReadableNativeArray.java#L175
    return readableArray.toArrayList();
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
}
