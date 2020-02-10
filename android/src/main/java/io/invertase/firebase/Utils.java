package io.invertase.firebase;

import android.app.ActivityManager;
import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
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
