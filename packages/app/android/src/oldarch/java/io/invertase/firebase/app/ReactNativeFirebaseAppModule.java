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

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.util.Map;

public class ReactNativeFirebaseAppModule extends ReactContextBaseJavaModule {
  private ReactNativeFirebaseAppModuleImpl moduleImpl;

  ReactNativeFirebaseAppModule(ReactApplicationContext reactContext) {
    moduleImpl = new ReactNativeFirebaseAppModuleImpl(reactContext);
  }

  @NonNull
  @Override
  public String getName() {
    return moduleImpl.getName();
  }

  @ReactMethod
  public void initializeApp(ReadableMap options, ReadableMap appConfig, Promise promise) {
    moduleImpl.initializeApp(options, appConfig, promise);
  }

  @ReactMethod
  public void setAutomaticDataCollectionEnabled(String appName, Boolean enabled) {
    moduleImpl.setAutomaticDataCollectionEnabled(appName, enabled);
  }

  @ReactMethod
  public void deleteApp(String appName, Promise promise) {
    moduleImpl.deleteApp(appName, promise);
  }

  @ReactMethod
  public void eventsNotifyReady(Boolean ready) {
    moduleImpl.eventsNotifyReady(ready);
  }

  @ReactMethod
  public void eventsGetListeners(Promise promise) {
    moduleImpl.eventsGetListeners(promise);
  }

  @ReactMethod
  public void eventsPing(String eventName, ReadableMap eventBody, Promise promise) {
    moduleImpl.eventsPing(eventName, eventBody, promise);
  }

  @ReactMethod
  public void eventsAddListener(String eventName) {
    moduleImpl.eventsAddListener(eventName);
  }

  @ReactMethod
  public void eventsRemoveListener(String eventName, Boolean all) {
    moduleImpl.eventsRemoveListener(eventName, all);
  }

  @ReactMethod
  public void addListener(String eventName) {
    moduleImpl.addListener(eventName);
  }

  @ReactMethod
  public void removeListeners(Integer count) {
    moduleImpl.removeListeners(count);
  }

  /** ------------------ META ------------------ */
  @ReactMethod
  public void metaGetAll(Promise promise) {
    moduleImpl.metaGetAll(promise);
  }

  /** ------------------ JSON ------------------ */
  @ReactMethod
  public void jsonGetAll(Promise promise) {
    moduleImpl.jsonGetAll(promise);
  }

  /** ------------------ PREFERENCES ------------------ */
  @ReactMethod
  public void preferencesSetBool(String key, boolean value, Promise promise) {
    moduleImpl.preferencesSetBool(key, value, promise);
  }

  @ReactMethod
  public void preferencesSetString(String key, String value, Promise promise) {
    moduleImpl.preferencesSetString(key, value, promise);
  }

  @ReactMethod
  public void preferencesGetAll(Promise promise) {
    moduleImpl.preferencesGetAll(promise);
  }

  @ReactMethod
  public void preferencesClearAll(Promise promise) {
    moduleImpl.preferencesClearAll(promise);
  }

  @ReactMethod
  public void setLogLevel(String logLevel) {
    moduleImpl.setLogLevel(logLevel);
  }

  @Override
  public Map<String, Object> getConstants() {
    return moduleImpl.getConstants();
  }
}
