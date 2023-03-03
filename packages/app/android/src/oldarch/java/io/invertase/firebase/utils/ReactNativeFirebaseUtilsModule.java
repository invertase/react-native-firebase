package io.invertase.firebase.utils;

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

import java.util.Map;

public class ReactNativeFirebaseUtilsModule extends ReactContextBaseJavaModule {
  private ReactNativeFirebaseUtilsModuleImpl moduleImpl;

  public ReactNativeFirebaseUtilsModule(ReactApplicationContext reactContext) {
    moduleImpl = new ReactNativeFirebaseUtilsModuleImpl(reactContext);
  }

  @ReactMethod
  public void androidGetPlayServicesStatus(Promise promise) {
    moduleImpl.androidGetPlayServicesStatus(promise);
  }

  /** Prompt the device user to update play services */
  @ReactMethod
  public void androidPromptForPlayServices() {
    moduleImpl.androidPromptForPlayServices();
  }

  /** Prompt the device user to update play services */
  @ReactMethod
  public void androidResolutionForPlayServices() {
    moduleImpl.androidResolutionForPlayServices();
  }

  /** Prompt the device user to update Play Services */
  @ReactMethod
  public void androidMakePlayServicesAvailable() {
    moduleImpl.androidMakePlayServicesAvailable();
  }

  @Override
  public Map<String, Object> getConstants() {
    return moduleImpl.getConstants();
  }

  @NonNull
  @Override
  public String getName() {
    return moduleImpl.getName();
  }
}
