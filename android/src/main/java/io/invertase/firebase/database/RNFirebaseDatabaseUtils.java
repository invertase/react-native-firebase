package io.invertase.firebase.database;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.MutableData;

import javax.annotation.Nullable;

import io.invertase.firebase.Utils;

public class RNFirebaseDatabaseUtils {
  private static final String TAG = "RNFirebaseDatabaseUtils";

  /**
   * @param dataSnapshot
   * @param previousChildName
   * @return
   */
  public static WritableMap snapshotToMap(
    DataSnapshot dataSnapshot,
    @Nullable String previousChildName
  ) {
    WritableMap result = Arguments.createMap();
    WritableMap snapshot = snapshotToMap(dataSnapshot);

    result.putMap("snapshot", snapshot);
    result.putString("previousChildName", previousChildName);
    return result;
  }

  /**
   * @param dataSnapshot
   * @return
   */
  public static WritableMap snapshotToMap(DataSnapshot dataSnapshot) {
    WritableMap snapshot = Arguments.createMap();

    snapshot.putString("key", dataSnapshot.getKey());
    snapshot.putBoolean("exists", dataSnapshot.exists());
    snapshot.putBoolean("hasChildren", dataSnapshot.hasChildren());
    snapshot.putDouble("childrenCount", dataSnapshot.getChildrenCount());
    snapshot.putArray("childKeys", getChildKeys(dataSnapshot));
    Utils.mapPutValue("priority", dataSnapshot.getPriority(), snapshot);

    if (!dataSnapshot.hasChildren()) {
      Utils.mapPutValue("value", dataSnapshot.getValue(), snapshot);
    } else {
      Object value = castValue(dataSnapshot);
      if (value instanceof WritableNativeArray) {
        snapshot.putArray("value", (WritableArray) value);
      } else {
        snapshot.putMap("value", (WritableMap) value);
      }
    }

    return snapshot;
  }

  /**
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
        String type = snapshot
          .getValue()
          .getClass()
          .getName();
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
        String type = mutableData
          .getValue()
          .getClass()
          .getName();
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
   * Data should be treated as an array if:
   * 1) All the keys are integers
   * 2) More than half the keys between 0 and the maximum key in the object have non-empty values
   * <p>
   * Definition from: https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
   *
   * @param snapshot
   * @return
   */
  private static boolean isArray(DataSnapshot snapshot) {
    long expectedKey = -1;
    long maxAllowedKey = (snapshot.getChildrenCount() * 2) - 1;
    for (DataSnapshot child : snapshot.getChildren()) {
      try {
        long key = Long.parseLong(child.getKey());
        if (key > expectedKey && key <= maxAllowedKey) {
          expectedKey = key;
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
   * Data should be treated as an array if:
   * 1) All the keys are integers
   * 2) More than half the keys between 0 and the maximum key in the object have non-empty values
   * <p>
   * Definition from: https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
   *
   * @param mutableData
   * @return
   */
  private static boolean isArray(MutableData mutableData) {
    long expectedKey = -1;
    long maxAllowedKey = (mutableData.getChildrenCount() * 2) - 1;
    for (MutableData child : mutableData.getChildren()) {
      try {
        long key = Long.parseLong(child.getKey());
        if (key > expectedKey && key <= maxAllowedKey) {
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
   * @param snapshot
   * @param <Any>
   * @return
   */
  private static <Any> WritableArray buildArray(DataSnapshot snapshot) {
    long expectedKey = 0;
    WritableArray array = Arguments.createArray();
    for (DataSnapshot child : snapshot.getChildren()) {
      long key = Long.parseLong(child.getKey());
      if (key > expectedKey) {
        for (long i = expectedKey; i < key; i++) {
          array.pushNull();
        }
        expectedKey = key;
      }
      Any castedChild = castValue(child);
      switch (castedChild
        .getClass()
        .getName()) {
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
          Log.w(
            TAG,
            "Invalid type: " + castedChild
              .getClass()
              .getName()
          );
          break;
      }
      expectedKey++;
    }
    return array;
  }

  /**
   * @param mutableData
   * @param <Any>
   * @return
   */
  private static <Any> WritableArray buildArray(MutableData mutableData) {
    long expectedKey = 0;
    WritableArray array = Arguments.createArray();
    for (MutableData child : mutableData.getChildren()) {
      long key = Long.parseLong(child.getKey());
      if (key > expectedKey) {
        for (long i = expectedKey; i < key; i++) {
          array.pushNull();
        }
        expectedKey = key;
      }
      Any castedChild = castValue(child);
      switch (castedChild
        .getClass()
        .getName()) {
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
          Log.w(
            TAG,
            "Invalid type: " + castedChild
              .getClass()
              .getName()
          );
          break;
      }
      expectedKey++;
    }
    return array;
  }

  /**
   * @param snapshot
   * @param <Any>
   * @return
   */
  private static <Any> WritableMap buildMap(DataSnapshot snapshot) {
    WritableMap map = Arguments.createMap();
    for (DataSnapshot child : snapshot.getChildren()) {
      Any castedChild = castValue(child);

      switch (castedChild
        .getClass()
        .getName()) {
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
          Log.w(
            TAG,
            "Invalid type: " + castedChild
              .getClass()
              .getName()
          );
          break;
      }
    }
    return map;
  }

  /**
   * @param mutableData
   * @param <Any>
   * @return
   */
  private static <Any> WritableMap buildMap(MutableData mutableData) {
    WritableMap map = Arguments.createMap();
    for (MutableData child : mutableData.getChildren()) {
      Any castedChild = castValue(child);

      switch (castedChild
        .getClass()
        .getName()) {
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
          Log.w(
            TAG,
            "Invalid type: " + castedChild
              .getClass()
              .getName()
          );
          break;
      }
    }
    return map;
  }

  /**
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

}
