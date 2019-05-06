package io.invertase.firebase.config;

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

import android.content.res.Resources;
import android.content.res.XmlResourceParser;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.firebase.remoteconfig.FirebaseRemoteConfig;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigFetchThrottledException;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigInfo;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigValue;

import java.util.ArrayList;
import java.util.Set;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

import static com.google.firebase.remoteconfig.FirebaseRemoteConfig.LAST_FETCH_STATUS_FAILURE;
import static com.google.firebase.remoteconfig.FirebaseRemoteConfig.LAST_FETCH_STATUS_NO_FETCH_YET;
import static com.google.firebase.remoteconfig.FirebaseRemoteConfig.LAST_FETCH_STATUS_SUCCESS;
import static com.google.firebase.remoteconfig.FirebaseRemoteConfig.LAST_FETCH_STATUS_THROTTLED;

public class ReactNativeFirebaseConfigModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Config";
  private static final String STRING_VALUE = "stringValue";
  private static final String BOOL_VALUE = "boolValue";
  private static final String NUMBER_VALUE = "numberValue";
  private static final String SOURCE = "source";

  ReactNativeFirebaseConfigModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @ReactMethod
  public void activateFetched(Promise promise) {
    boolean activated = FirebaseRemoteConfig.getInstance().activateFetched();
    promise.resolve(activated);
  }

  @ReactMethod
  public void fetch(double cacheExpirationSeconds, boolean activate, Promise promise) {
    Task<Void> fetchTask;

    if (cacheExpirationSeconds == -1) {
      fetchTask = FirebaseRemoteConfig.getInstance().fetch((long) cacheExpirationSeconds);
    } else {
      fetchTask = FirebaseRemoteConfig.getInstance().fetch();
    }

    fetchTask.addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        if (activate) {
          promise.resolve(FirebaseRemoteConfig.getInstance().activateFetched());
        } else {
          promise.resolve(null);
        }
      } else {
        if (task.getException() instanceof FirebaseRemoteConfigFetchThrottledException) {
          rejectPromiseWithCodeAndMessage(
            promise,
            "throttled",
            "fetch() operation cannot be completed successfully, due to throttling."
          );
        } else {
          rejectPromiseWithCodeAndMessage(
            promise,
            "failure",
            "fetch() operation cannot be completed successfully."
          );
        }
      }
    });
  }

  @ReactMethod
  public void getConfigSettings(Promise promise) {
    WritableMap configSettingsMap = Arguments.createMap();
    FirebaseRemoteConfigInfo remoteConfigInfo = FirebaseRemoteConfig.getInstance().getInfo();
    FirebaseRemoteConfigSettings remoteConfigSettings = remoteConfigInfo.getConfigSettings();

    configSettingsMap.putDouble("lastFetchTime", remoteConfigInfo.getFetchTimeMillis());
    configSettingsMap.putString(
      "lastFetchStatus",
      lastFetchStatusToString(remoteConfigInfo.getLastFetchStatus())
    );
    configSettingsMap.putBoolean(
      "isDeveloperModeEnabled",
      remoteConfigSettings.isDeveloperModeEnabled()
    );

    promise.resolve(configSettingsMap);
  }

  @ReactMethod
  public void setConfigSettings(ReadableMap configSettings, Promise promise) {
    FirebaseRemoteConfigSettings.Builder configSettingsBuilder = new FirebaseRemoteConfigSettings.Builder();
    configSettingsBuilder.setDeveloperModeEnabled(configSettings.getBoolean("isDeveloperModeEnabled"));
    FirebaseRemoteConfig.getInstance().setConfigSettings(configSettingsBuilder.build());
    getConfigSettings(promise);
  }

  @ReactMethod
  public void setDefaults(ReadableMap defaults, Promise promise) {
    FirebaseRemoteConfig.getInstance().setDefaults(defaults.toHashMap());
    promise.resolve(null);
  }

  @ReactMethod
  public void setDefaultsFromResource(String resourceName, Promise promise) {
    int resourceId = getXmlResourceIdByName(resourceName);
    XmlResourceParser xmlResourceParser = null;

    try {
      xmlResourceParser = getApplicationContext().getResources().getXml(resourceId);
    } catch (Resources.NotFoundException nfe) {
      // do nothing
    }

    if (xmlResourceParser != null) {
      FirebaseRemoteConfig.getInstance().setDefaults(resourceId);
      promise.resolve(null);
    } else {
      rejectPromiseWithCodeAndMessage(
        promise,
        "resource_not_found",
        "The specified resource name was not found."
      );
    }
  }

  private int getXmlResourceIdByName(String name) {
    String packageName = getApplicationContext().getPackageName();
    return getApplicationContext().getResources().getIdentifier(name, "xml", packageName);
  }

  @ReactMethod
  public void getValuesByKeysPrefix(String prefix, Promise promise) {
    Set<String> keys = FirebaseRemoteConfig.getInstance().getKeysByPrefix(prefix);
    WritableMap writableMap = Arguments.createMap();

    for (String key : keys) {
      FirebaseRemoteConfigValue configValue = FirebaseRemoteConfig.getInstance().getValue(key);
      writableMap.putMap(key, convertRemoteConfigValue(configValue));
    }

    promise.resolve(writableMap);
  }


  @ReactMethod
  public void getKeysByPrefix(String prefix, Promise promise) {
    WritableArray keysByPrefix = Arguments.createArray();

    Set<String> keys = FirebaseRemoteConfig.getInstance().getKeysByPrefix(prefix);

    for (String key : keys) {
      keysByPrefix.pushString(key);
    }

    promise.resolve(keysByPrefix);
  }

  @ReactMethod
  public void getValue(String key, Promise promise) {
    FirebaseRemoteConfigValue configValue = FirebaseRemoteConfig.getInstance().getValue(key);
    promise.resolve(convertRemoteConfigValue(configValue));
  }

  @ReactMethod
  public void getValues(ReadableArray keys, Promise promise) {
    WritableArray valuesArray = Arguments.createArray();
    ArrayList<Object> keysList = keys.toArrayList();

    for (Object key : keysList) {

      FirebaseRemoteConfigValue configValue = FirebaseRemoteConfig
        .getInstance()
        .getValue((String) key);

      valuesArray.pushMap(convertRemoteConfigValue(configValue));
    }

    promise.resolve(valuesArray);
  }

  private WritableMap convertRemoteConfigValue(FirebaseRemoteConfigValue value) {
    WritableMap map = Arguments.createMap();

    map.putString(STRING_VALUE, value.asString());

    try {
      boolean booleanValue = value.asBoolean();
      map.putBoolean(BOOL_VALUE, booleanValue);
    } catch (Exception e) {
      map.putNull(BOOL_VALUE);
    }

    try {
      double numberValue = value.asDouble();
      map.putDouble(NUMBER_VALUE, numberValue);
    } catch (Exception e) {
      map.putNull(NUMBER_VALUE);
    }

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


  private String lastFetchStatusToString(int fetchStatus) {
    String status = "unknown";
    switch (fetchStatus) {
      case LAST_FETCH_STATUS_SUCCESS:
        status = "success";
        break;
      case LAST_FETCH_STATUS_FAILURE:
        status = "failure";
        break;
      case LAST_FETCH_STATUS_NO_FETCH_YET:
        status = "no_fetch_yet";
        break;
      case LAST_FETCH_STATUS_THROTTLED:
        status = "throttled";
        break;
    }
    return status;
  }
}
