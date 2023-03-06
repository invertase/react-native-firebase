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
import com.facebook.react.bridge.ReadableMap;

import java.util.Map;

import io.invertase.firebase.NativeFirebaseAppModuleSpec;

public class ReactNativeFirebaseAppModule extends NativeFirebaseAppModuleSpec {
  private ReactNativeFirebaseAppModuleImpl moduleImpl;

  ReactNativeFirebaseAppModule(ReactApplicationContext reactContext) {
    super(reactContext);
    moduleImpl = new ReactNativeFirebaseAppModuleImpl(reactContext);
  }

  @NonNull
  @Override
  public String getName() {
    return moduleImpl.getName();
  }

  @Override
  public void initializeApp(ReadableMap options, ReadableMap appConfig, Promise promise) {
    moduleImpl.initializeApp(options, appConfig, promise);
  }

  @Override
  public void setAutomaticDataCollectionEnabled(String appName, boolean enabled) {
    moduleImpl.setAutomaticDataCollectionEnabled(appName, enabled);
  }

  @Override
  public void deleteApp(String appName, Promise promise) {
    moduleImpl.deleteApp(appName, promise);
  }

  @Override
  public void eventsNotifyReady(boolean ready) {
    moduleImpl.eventsNotifyReady(ready);
  }

  @Override
  public void eventsGetListeners(Promise promise) {
    moduleImpl.eventsGetListeners(promise);
  }

  @Override
  public void eventsPing(String eventName, ReadableMap eventBody, Promise promise) {
    moduleImpl.eventsPing(eventName, eventBody, promise);
  }

  @Override
  public void eventsAddListener(String eventName) {
    moduleImpl.eventsAddListener(eventName);
  }

  @Override
  public void eventsRemoveListener(String eventName, boolean all) {
    moduleImpl.eventsRemoveListener(eventName, all);
  }

  @Override
  public void addListener(String eventName) {
    moduleImpl.addListener(eventName);
  }

  @Override
  public void removeListeners(double count) {
    moduleImpl.removeListeners((int)count);
  }

  /** ------------------ META ------------------ */
  @Override
  public void metaGetAll(Promise promise) {
    moduleImpl.metaGetAll(promise);
  }

  /** ------------------ JSON ------------------ */
  @Override
  public void jsonGetAll(Promise promise) {
    moduleImpl.jsonGetAll(promise);
  }

  /** ------------------ PREFERENCES ------------------ */
  @Override
  public void preferencesSetBool(String key, boolean value, Promise promise) {
    moduleImpl.preferencesSetBool(key, value, promise);
  }

  @Override
  public void preferencesSetString(String key, String value, Promise promise) {
    moduleImpl.preferencesSetString(key, value, promise);
  }

  @Override
  public void preferencesGetAll(Promise promise) {
    moduleImpl.preferencesGetAll(promise);
  }

  @Override
  public void preferencesClearAll(Promise promise) {
    moduleImpl.preferencesClearAll(promise);
  }

  @Override
  public void setLogLevel(String logLevel) {
    moduleImpl.setLogLevel(logLevel);
  }

  @Override
  protected Map<String, Object> getTypedExportedConstants() {
    return moduleImpl.getConstants();
  }
}
