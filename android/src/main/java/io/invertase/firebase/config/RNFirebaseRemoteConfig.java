package io.invertase.firebase.config;

import android.support.annotation.NonNull;
import android.util.Log;

import com.google.android.gms.tasks.Task;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.google.android.gms.tasks.OnCompleteListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.google.firebase.FirebaseApp;
import com.google.firebase.remoteconfig.FirebaseRemoteConfig;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigValue;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings;

import java.util.Map;
import java.util.Set;
import java.util.List;

import io.invertase.firebase.Utils;

class RNFirebaseRemoteConfig extends ReactContextBaseJavaModule {

  private static final String TAG = "RNFirebaseRemoteConfig";

  private static final String STRING_VALUE = "stringValue";
  private static final String DATA_VALUE = "dataValue";
  private static final String BOOL_VALUE = "boolValue";
  private static final String NUMBER_VALUE = "numberValue";
  private static final String SOURCE = "source";

  RNFirebaseRemoteConfig(ReactApplicationContext reactContext) {
    super(reactContext);
    Log.d(TAG, "New instance");
  }

  /**
   * @return
   */
  @Override
  public String getName() {
    return TAG;
  }

  @ReactMethod  public void enableDeveloperMode() {
    FirebaseRemoteConfigSettings.Builder settings = new FirebaseRemoteConfigSettings.Builder();
    settings.setDeveloperModeEnabled(true);

    FirebaseRemoteConfig.getInstance().setConfigSettings(settings.build());
  }

  @ReactMethod
  public void fetch(final Promise promise) {
    fetchInternal(promise, false, 0);
  }

  @ReactMethod
  public void fetchWithExpirationDuration(double expirationDuration, final Promise promise) {
    fetchInternal(promise, true, (long) expirationDuration);
  }

  @ReactMethod
  public void activateFetched(final Promise promise) {
    Boolean status = FirebaseRemoteConfig.getInstance().activateFetched();
    promise.resolve(status);
  }

  @ReactMethod
  public void getValue(String key, final Promise promise) {
    FirebaseRemoteConfigValue value = FirebaseRemoteConfig.getInstance().getValue(key);
    promise.resolve(convertRemoteConfigValue(value));
  }

  @ReactMethod
  public void getValues(ReadableArray keys, final Promise promise) {
    WritableArray array = Arguments.createArray();
    List<Object> keysList = Utils.recursivelyDeconstructReadableArray(keys);

    for (Object key : keysList) {
      FirebaseRemoteConfigValue value = FirebaseRemoteConfig.getInstance().getValue((String) key);
      array.pushMap(convertRemoteConfigValue(value));
    }

    promise.resolve(array);
  }

  @ReactMethod
  public void getKeysByPrefix(String prefix, final Promise promise) {
    Set<String> keys = FirebaseRemoteConfig.getInstance().getKeysByPrefix(prefix);
    WritableArray array = Arguments.createArray();

    for (String key : keys) {
      array.pushString(key);
    }

    promise.resolve(array);
  }

  @ReactMethod
  public void setDefaults(ReadableMap map) {
    Map<String, Object> convertedMap = Utils.recursivelyDeconstructReadableMap(map);
    FirebaseRemoteConfig.getInstance().setDefaults(convertedMap);
  }

  @ReactMethod
  public void setDefaultsFromResource(int resourceId) {
    FirebaseRemoteConfig.getInstance().setDefaults(resourceId);
  }

  private void fetchInternal(final Promise promise, Boolean withExpiration, long expirationDuration) {
    FirebaseRemoteConfig.getInstance().fetch(withExpiration ? expirationDuration : 43200) // 12 hours default
      .addOnCompleteListener(new OnCompleteListener<Void>() {
        @Override
        public void onComplete(@NonNull Task<Void> task) {
          if (task.isSuccessful()) {
            promise.resolve("remoteConfigFetchStatusSuccess");
          } else {
            promise.reject("config/failure", task.getException().getMessage(), task.getException());
          }
        }
      });
  }

  private WritableMap convertRemoteConfigValue(FirebaseRemoteConfigValue value) {
    WritableMap map = Arguments.createMap();

    map.putString(STRING_VALUE, value.asString());

    try {
      map.putString(DATA_VALUE, new String(value.asByteArray()));
    } catch (Exception e) {
      map.putNull(DATA_VALUE);
    }

    Boolean booleanValue;
    try {
      booleanValue = value.asBoolean();
      map.putBoolean(BOOL_VALUE, booleanValue);
    } catch (Exception e) {
      map.putNull(BOOL_VALUE);
    }

    Double numberValue;
    try {
      numberValue = value.asDouble();
      map.putDouble(NUMBER_VALUE, numberValue);
    } catch (Exception e) {
      map.putNull(NUMBER_VALUE);
    }

    // TODO check with ios
    switch (value.getSource()) {
      case FirebaseRemoteConfig.VALUE_SOURCE_DEFAULT:
        map.putString(SOURCE, "default");
        break;
      case FirebaseRemoteConfig.VALUE_SOURCE_REMOTE:
        map.putString(SOURCE, "remote");
        break;
      default:
        map.putString(SOURCE, "static");
    }

    return map;
  }

}
