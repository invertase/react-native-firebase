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
import com.google.firebase.inappmessaging.FirebaseInAppMessaging;

import java.util.HashMap;
import java.util.Map;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseFiamModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Fiam";

  ReactNativeFirebaseFiamModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @ReactMethod
  public void setAutomaticDataCollectionEnabled(Boolean enabled, Promise promise) {
    try {
      FirebaseInAppMessaging.getInstance().setAutomaticDataCollectionEnabled(enabled);
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void setMessagesDisplaySuppressed(Boolean enabled, Promise promise) {
    try {
      FirebaseInAppMessaging.getInstance().setMessagesSuppressed(enabled);
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(
      "isMessagesDisplaySuppressed",
      FirebaseInAppMessaging.getInstance().areMessagesSuppressed()
    );
    constants.put(
      "isAutomaticDataCollectionEnabled",
      FirebaseInAppMessaging.getInstance().isAutomaticDataCollectionEnabled()
    );
    return constants;
  }
}
