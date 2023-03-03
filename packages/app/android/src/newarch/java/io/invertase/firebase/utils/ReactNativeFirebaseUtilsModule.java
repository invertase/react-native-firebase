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

import java.util.Map;

import io.invertase.firebase.NativeFirebaseUtilsModuleSpec;

public class ReactNativeFirebaseUtilsModule extends NativeFirebaseUtilsModuleSpec {
  private ReactNativeFirebaseUtilsModuleImpl moduleImpl;

  public ReactNativeFirebaseUtilsModule(ReactApplicationContext reactContext) {
    super(reactContext);
    moduleImpl = new ReactNativeFirebaseUtilsModuleImpl(reactContext);
  }

  @Override
  public void androidGetPlayServicesStatus(Promise promise) {
    moduleImpl.androidGetPlayServicesStatus(promise);
  }

  /** Prompt the device user to update play services */
  @Override
  public void androidPromptForPlayServices() {
    moduleImpl.androidPromptForPlayServices();
  }

  /** Prompt the device user to update play services */
  @Override
  public void androidResolutionForPlayServices() {
    moduleImpl.androidResolutionForPlayServices();
  }

  /** Prompt the device user to update Play Services */
  @Override
  public void androidMakePlayServicesAvailable() {
    moduleImpl.androidMakePlayServicesAvailable();
  }

  @NonNull
  @Override
  public String getName() {
    return moduleImpl.getName();
  }

  @Override
  protected Map<String, Object> getTypedExportedConstants() {
    return moduleImpl.getConstants();
  }
}
