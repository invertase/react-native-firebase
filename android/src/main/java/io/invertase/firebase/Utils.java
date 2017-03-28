package io.invertase.firebase;

import android.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.ReadableArray;
import com.google.firebase.database.DataSnapshot;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.google.firebase.database.MutableData;

@SuppressWarnings("WeakerAccess")
public class Utils {
  private static final String TAG = "Utils";

  // TODO NOTE
  public static void todoNote(final String tag, final String name, final Callback callback) {
    Log.e(tag, "The method " + name + " has not yet been implemented.");
    Log.e(tag, "Feel free to contribute to finish the method in the source.");

    WritableMap errorMap = Arguments.createMap();
    errorMap.putString("error", "unimplemented");
    callback.invoke(null, errorMap);
  }

  /**
   * send a JS event
   **/
  public static void sendEvent(final ReactContext context, final String eventName, final WritableMap params) {
    if (context != null) {
      context
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
    } else {
      Log.d(TAG, "Missing context - cannot send event!");
    }
  }

  /**
   * @param key   map key
   * @param value map value
   * @param map   map
   */
  public static void mapPutValue(String key, Object value, WritableMap map) {
    String type = value != null ? value.getClass().getName() : "";
    switch (type) {
      case "java.lang.Boolean":
        map.putBoolean(key, (Boolean) value);
        break;
      case "java.lang.Long":
        Long longVal = (Long) value;
        map.putDouble(key, (double) longVal);
        break;
      case "java.lang.Double":
        map.putDouble(key, (Double) value);
        break;
      case "java.lang.String":
        map.putString(key, (String) value);
        break;
      default:
        map.putString(key, null);
    }
  }

  /**
   *
   * @param name
   * @param path
   * @param modifiersString
   * @param dataSnapshot
   * @return
   */
  public static WritableMap snapshotToMap(String name, String path, String modifiersString, DataSnapshot dataSnapshot) {
    WritableMap snapshot = Arguments.createMap();
    WritableMap eventMap = Arguments.createMap();

    snapshot.putString("key", dataSnapshot.getKey());
    snapshot.putBoolean("exists", dataSnapshot.exists());
    snapshot.putBoolean("hasChildren", dataSnapshot.hasChildren());
    snapshot.putDouble("childrenCount", dataSnapshot.getChildrenCount());

    if (!dataSnapshot.hasChildren()) {
      mapPutValue("value", dataSnapshot.getValue(), snapshot);
    } else {
      Object value = Utils.castValue(dataSnapshot);
      if (value instanceof WritableNativeArray) {
        snapshot.putArray("value", (WritableArray) value);
      } else {
        snapshot.putMap("value", (WritableMap) value);
      }
    }

    snapshot.putArray("childKeys", Utils.getChildKeys(dataSnapshot));
    mapPutValue("priority", dataSnapshot.getPriority(), snapshot);

    eventMap.putString("path", path);
    eventMap.putMap("snapshot", snapshot);
    eventMap.putString("eventName", name);
    eventMap.putString("modifiersString", modifiersString);

    return eventMap;
  }

  /**
   *
   * @param dataSnapshot
   * @return
   */
  public static WritableMap snapshotToMap(DataSnapshot dataSnapshot) {
    WritableMap snapshot = Arguments.createMap();

    snapshot.putString("key", dataSnapshot.getKey());
    snapshot.putBoolean("exists", dataSnapshot.exists());
    snapshot.putBoolean("hasChildren", dataSnapshot.hasChildren());
    snapshot.putDouble("childrenCount", dataSnapshot.getChildrenCount());

    if (!dataSnapshot.hasChildren()) {
      mapPutValue("value", dataSnapshot.getValue(), snapshot);
    } else {
      Object value = Utils.castValue(dataSnapshot);
      if (value instanceof WritableNativeArray) {
        snapshot.putArray("value", (WritableArray) value);
      } else {
        snapshot.putMap("value", (WritableMap) value);
      }
    }

    snapshot.putArray("childKeys", Utils.getChildKeys(dataSnapshot));
    mapPutValue("priority", dataSnapshot.getPriority(), snapshot);

    return snapshot;
  }

  /**
   *
   * @param snapshot
   * @param <Any>
   * @return
   */
  public static <Any> Any castValue(DataSnapshot snapshot) {
    if (snapshot.hasChildren()) {
      if (isArray(snapshot)) {
        return (Any) buildArray(snapshot);
      } else {
        return (Any) buildMap(snapshot);
      }
    } else {
      if (snapshot.getValue() != null) {
        String type = snapshot.getValue().getClass().getName();
        switch (type) {
          case "java.lang.Boolean":
          case "java.lang.Long":
          case "java.lang.Double":
          case "java.lang.String":
            return (Any) (snapshot.getValue());
          default:
            Log.w(TAG, "Invalid type: " + type);
            return null;
        }
      }
      return null;
    }
  }

  /**
   *
   * @param mutableData
   * @param <Any>
   * @return
   */
  public static <Any> Any castValue(MutableData mutableData) {
    if (mutableData.hasChildren()) {
      if (isArray(mutableData)) {
        return (Any) buildArray(mutableData);
      } else {
        return (Any) buildMap(mutableData);
      }
    } else {
      if (mutableData.getValue() != null) {
        String type = mutableData.getValue().getClass().getName();
        switch (type) {
          case "java.lang.Boolean":
          case "java.lang.Long":
          case "java.lang.Double":
          case "java.lang.String":
            return (Any) (mutableData.getValue());
          default:
            Log.w(TAG, "Invalid type: " + type);
            return null;
        }
      }
      return null;
    }
  }

  /**
   *
   * @param snapshot
   * @return
   */
  private static boolean isArray(DataSnapshot snapshot) {
    long expectedKey = 0;
    for (DataSnapshot child : snapshot.getChildren()) {
      try {
        long key = Long.parseLong(child.getKey());
        if (key == expectedKey) {
          expectedKey++;
        } else {
          return false;
        }
      } catch (NumberFormatException ex) {
        return false;
      }
    }
    return true;
  }

  /**
   *
   * @param mutableData
   * @return
   */
  private static boolean isArray(MutableData mutableData) {
    long expectedKey = 0;
    for (MutableData child : mutableData.getChildren()) {
      try {
        long key = Long.parseLong(child.getKey());
        if (key == expectedKey) {
          expectedKey++;
        } else {
          return false;
        }
      } catch (NumberFormatException ex) {
        return false;
      }
    }
    return true;
  }

  /**
   *
   * @param snapshot
   * @param <Any>
   * @return
   */
  private static <Any> WritableArray buildArray(DataSnapshot snapshot) {
    WritableArray array = Arguments.createArray();
    for (DataSnapshot child : snapshot.getChildren()) {
      Any castedChild = castValue(child);
      switch (castedChild.getClass().getName()) {
        case "java.lang.Boolean":
          array.pushBoolean((Boolean) castedChild);
          break;
        case "java.lang.Long":
          Long longVal = (Long) castedChild;
          array.pushDouble((double) longVal);
          break;
        case "java.lang.Double":
          array.pushDouble((Double) castedChild);
          break;
        case "java.lang.String":
          array.pushString((String) castedChild);
          break;
        case "com.facebook.react.bridge.WritableNativeMap":
          array.pushMap((WritableMap) castedChild);
          break;
        case "com.facebook.react.bridge.WritableNativeArray":
          array.pushArray((WritableArray) castedChild);
          break;
        default:
          Log.w(TAG, "Invalid type: " + castedChild.getClass().getName());
          break;
      }
    }
    return array;
  }

  /**
   *
   * @param mutableData
   * @param <Any>
   * @return
   */
  private static <Any> WritableArray buildArray(MutableData mutableData) {
    WritableArray array = Arguments.createArray();
    for (MutableData child : mutableData.getChildren()) {
      Any castedChild = castValue(child);
      switch (castedChild.getClass().getName()) {
        case "java.lang.Boolean":
          array.pushBoolean((Boolean) castedChild);
          break;
        case "java.lang.Long":
          Long longVal = (Long) castedChild;
          array.pushDouble((double) longVal);
          break;
        case "java.lang.Double":
          array.pushDouble((Double) castedChild);
          break;
        case "java.lang.String":
          array.pushString((String) castedChild);
          break;
        case "com.facebook.react.bridge.WritableNativeMap":
          array.pushMap((WritableMap) castedChild);
          break;
        case "com.facebook.react.bridge.WritableNativeArray":
          array.pushArray((WritableArray) castedChild);
          break;
        default:
          Log.w(TAG, "Invalid type: " + castedChild.getClass().getName());
          break;
      }
    }
    return array;
  }

  /**
   *
   * @param snapshot
   * @param <Any>
   * @return
   */
  private static <Any> WritableMap buildMap(DataSnapshot snapshot) {
    WritableMap map = Arguments.createMap();
    for (DataSnapshot child : snapshot.getChildren()) {
      Any castedChild = castValue(child);

      switch (castedChild.getClass().getName()) {
        case "java.lang.Boolean":
          map.putBoolean(child.getKey(), (Boolean) castedChild);
          break;
        case "java.lang.Long":
          map.putDouble(child.getKey(), (double) ((Long) castedChild));
          break;
        case "java.lang.Double":
          map.putDouble(child.getKey(), (Double) castedChild);
          break;
        case "java.lang.String":
          map.putString(child.getKey(), (String) castedChild);
          break;
        case "com.facebook.react.bridge.WritableNativeMap":
          map.putMap(child.getKey(), (WritableMap) castedChild);
          break;
        case "com.facebook.react.bridge.WritableNativeArray":
          map.putArray(child.getKey(), (WritableArray) castedChild);
          break;
        default:
          Log.w(TAG, "Invalid type: " + castedChild.getClass().getName());
          break;
      }
    }
    return map;
  }

  /**
   *
   * @param mutableData
   * @param <Any>
   * @return
   */
  private static <Any> WritableMap buildMap(MutableData mutableData) {
    WritableMap map = Arguments.createMap();
    for (MutableData child : mutableData.getChildren()) {
      Any castedChild = castValue(child);

      switch (castedChild.getClass().getName()) {
        case "java.lang.Boolean":
          map.putBoolean(child.getKey(), (Boolean) castedChild);
          break;
        case "java.lang.Long":
          map.putDouble(child.getKey(), (double) ((Long) castedChild));
          break;
        case "java.lang.Double":
          map.putDouble(child.getKey(), (Double) castedChild);
          break;
        case "java.lang.String":
          map.putString(child.getKey(), (String) castedChild);
          break;
        case "com.facebook.react.bridge.WritableNativeMap":
          map.putMap(child.getKey(), (WritableMap) castedChild);
          break;
        case "com.facebook.react.bridge.WritableNativeArray":
          map.putArray(child.getKey(), (WritableArray) castedChild);
          break;
        default:
          Log.w(TAG, "Invalid type: " + castedChild.getClass().getName());
          break;
      }
    }
    return map;
  }

  /**
   *
   * @param snapshot
   * @return
   */
  public static WritableArray getChildKeys(DataSnapshot snapshot) {
    WritableArray childKeys = Arguments.createArray();

    if (snapshot.hasChildren()) {
      for (DataSnapshot child : snapshot.getChildren()) {
        childKeys.pushString(child.getKey());
      }
    }

    return childKeys;
  }

  public static Map<String, Object> recursivelyDeconstructReadableMap(ReadableMap readableMap) {
    Map<String, Object> deconstructedMap = new HashMap<>();
    if (readableMap == null) {
      return deconstructedMap;
    }

    ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      ReadableType type = readableMap.getType(key);
      switch (type) {
        case Null:
          deconstructedMap.put(key, null);
          break;
        case Boolean:
          deconstructedMap.put(key, readableMap.getBoolean(key));
          break;
        case Number:
          deconstructedMap.put(key, readableMap.getDouble(key));
          break;
        case String:
          deconstructedMap.put(key, readableMap.getString(key));
          break;
        case Map:
          deconstructedMap.put(key, Utils.recursivelyDeconstructReadableMap(readableMap.getMap(key)));
          break;
        case Array:
          deconstructedMap.put(key, Utils.recursivelyDeconstructReadableArray(readableMap.getArray(key)));
          break;
        default:
          throw new IllegalArgumentException("Could not convert object with key: " + key + ".");
      }

    }
    return deconstructedMap;
  }

  public static List<Object> recursivelyDeconstructReadableArray(ReadableArray readableArray) {
    List<Object> deconstructedList = new ArrayList<>(readableArray.size());
    for (int i = 0; i < readableArray.size(); i++) {
      ReadableType indexType = readableArray.getType(i);
      switch (indexType) {
        case Null:
          deconstructedList.add(i, null);
          break;
        case Boolean:
          deconstructedList.add(i, readableArray.getBoolean(i));
          break;
        case Number:
          deconstructedList.add(i, readableArray.getDouble(i));
          break;
        case String:
          deconstructedList.add(i, readableArray.getString(i));
          break;
        case Map:
          deconstructedList.add(i, Utils.recursivelyDeconstructReadableMap(readableArray.getMap(i)));
          break;
        case Array:
          deconstructedList.add(i, Utils.recursivelyDeconstructReadableArray(readableArray.getArray(i)));
          break;
        default:
          throw new IllegalArgumentException("Could not convert object at index " + i + ".");
      }
    }
    return deconstructedList;
  }
}
