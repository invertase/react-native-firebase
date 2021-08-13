package io.invertase.firebase.fiam;

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

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import java.util.Map;

public class ReactNativeFirebaseFiamModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "Fiam";
  private final UniversalFirebaseFiamModule module;

  ReactNativeFirebaseFiamModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    module = new UniversalFirebaseFiamModule(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void setAutomaticDataCollectionEnabled(Boolean enabled, Promise promise) {
    module
        .setAutomaticDataCollectionEnabled(enabled)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void setMessagesDisplaySuppressed(Boolean enabled, Promise promise) {
    module
        .setMessagesDisplaySuppressed(enabled)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void triggerEvent(String eventId, Promise promise) {
    module
        .triggerEvent(eventId)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @Override
  public Map<String, Object> getConstants() {
    return module.getConstants();
  }
}
