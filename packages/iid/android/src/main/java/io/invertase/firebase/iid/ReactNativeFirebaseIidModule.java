package io.invertase.firebase.iid;

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
import com.google.firebase.FirebaseApp;
import com.google.firebase.iid.FirebaseInstanceId;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseIidModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Iid";

  ReactNativeFirebaseIidModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @ReactMethod
  public void get(String appName, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    try {
      String id = FirebaseInstanceId.getInstance(firebaseApp).getId();
      promise.resolve(id);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void getToken(String appName, String authorizedEntity, String scope, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    try {
      String token = FirebaseInstanceId.getInstance(firebaseApp).getToken(authorizedEntity, scope);
      promise.resolve(token);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void delete(String appName, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    try {
      FirebaseInstanceId.getInstance(firebaseApp).deleteInstanceId();
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void deleteToken(String appName, String authorizedEntity, String scope, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    try {
      FirebaseInstanceId.getInstance(firebaseApp).deleteToken(authorizedEntity, scope);
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }
}
