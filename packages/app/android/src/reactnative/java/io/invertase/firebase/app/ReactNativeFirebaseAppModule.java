package io.invertase.firebase.app;

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

import android.util.Log;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.FirebaseApp;
import io.invertase.firebase.common.RCTConvertFirebase;
import io.invertase.firebase.common.ReactNativeFirebaseEvent;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseJSON;
import io.invertase.firebase.common.ReactNativeFirebaseMeta;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReactNativeFirebaseAppModule extends ReactNativeFirebaseModule {
  private static final String TAG = "App";

  public static Map<String, String> authDomains = new HashMap<>();

  ReactNativeFirebaseAppModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @Override
  public void initialize() {
    super.initialize();
    ReactNativeFirebaseEventEmitter.getSharedInstance().attachReactContext(getContext());
  }

  @ReactMethod
  public void initializeApp(ReadableMap options, ReadableMap appConfig, Promise promise) {
    FirebaseApp firebaseApp =
        RCTConvertFirebase.readableMapToFirebaseApp(options, appConfig, getContext());
    ReactNativeFirebaseAppModule.configureAuthDomain(
        appConfig.getString("name"), options.getString("authDomain"));

    WritableMap firebaseAppMap = RCTConvertFirebase.firebaseAppToWritableMap(firebaseApp);
    promise.resolve(firebaseAppMap);
  }

  public static void configureAuthDomain(String name, String authDomain) {
    if (authDomain != null) {
      Log.d(TAG, name + " custom authDomain " + authDomain);
      authDomains.put(name, authDomain);
    } else {
      authDomains.remove(name);
    }
  }

  @ReactMethod
  public void setAutomaticDataCollectionEnabled(String appName, Boolean enabled) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    firebaseApp.setDataCollectionDefaultEnabled(enabled);
  }

  @ReactMethod
  public void deleteApp(String appName, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    if (firebaseApp != null) {
      firebaseApp.delete();
    }

    promise.resolve(null);
  }

  @ReactMethod
  public void eventsNotifyReady(Boolean ready) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.notifyJsReady(ready);
  }

  @ReactMethod
  public void eventsGetListeners(Promise promise) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    promise.resolve(emitter.getListenersMap());
  }

  @ReactMethod
  public void eventsPing(String eventName, ReadableMap eventBody, Promise promise) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.sendEvent(
        new ReactNativeFirebaseEvent(
            eventName, RCTConvertFirebase.readableMapToWritableMap(eventBody)));
    promise.resolve(RCTConvertFirebase.readableMapToWritableMap(eventBody));
  }

  @ReactMethod
  public void eventsAddListener(String eventName) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.addListener(eventName);
  }

  @ReactMethod
  public void eventsRemoveListener(String eventName, Boolean all) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.removeListener(eventName, all);
  }

  @ReactMethod
  public void addListener(String eventName) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  public void removeListeners(Integer count) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  /** ------------------ META ------------------ */
  @ReactMethod
  public void metaGetAll(Promise promise) {
    promise.resolve(ReactNativeFirebaseMeta.getSharedInstance().getAll());
  }

  /** ------------------ JSON ------------------ */
  @ReactMethod
  public void jsonGetAll(Promise promise) {
    promise.resolve(ReactNativeFirebaseJSON.getSharedInstance().getAll());
  }

  /** ------------------ PREFERENCES ------------------ */
  @ReactMethod
  public void preferencesSetBool(String key, boolean value, Promise promise) {
    ReactNativeFirebasePreferences.getSharedInstance().setBooleanValue(key, value);
    promise.resolve(null);
  }

  @ReactMethod
  public void preferencesSetString(String key, String value, Promise promise) {
    ReactNativeFirebasePreferences.getSharedInstance().setStringValue(key, value);
    promise.resolve(null);
  }

  @ReactMethod
  public void preferencesGetAll(Promise promise) {
    promise.resolve(ReactNativeFirebasePreferences.getSharedInstance().getAll());
  }

  @ReactMethod
  public void preferencesClearAll(Promise promise) {
    ReactNativeFirebasePreferences.getSharedInstance().clearAll();
    promise.resolve(null);
  }

  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();
    List<Map<String, Object>> appsList = new ArrayList<>();
    List<FirebaseApp> firebaseApps = FirebaseApp.getApps(getReactApplicationContext());

    for (FirebaseApp app : firebaseApps) {
      appsList.add(RCTConvertFirebase.firebaseAppToMap(app));
    }

    constants.put("NATIVE_FIREBASE_APPS", appsList);

    constants.put("FIREBASE_RAW_JSON", ReactNativeFirebaseJSON.getSharedInstance().getRawJSON());

    return constants;
  }
}
