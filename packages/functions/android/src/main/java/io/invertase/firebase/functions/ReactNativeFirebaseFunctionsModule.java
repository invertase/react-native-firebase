package io.invertase.firebase.functions;

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

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.FirebaseApp;
import com.google.firebase.functions.FirebaseFunctions;
import com.google.firebase.functions.FirebaseFunctionsException;
import com.google.firebase.functions.HttpsCallableReference;
import com.google.firebase.functions.HttpsCallableResult;

import javax.annotation.Nonnull;

import io.invertase.firebase.common.RCTConvertFirebase;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseFunctionsModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Functions";
  private static final String DATA_KEY = "data";
  private static final String CODE_KEY = "code";
  private static final String MSG_KEY = "message";
  private static final String ERROR_KEY = "__error";
  private static final String DETAILS_KEY = "details";

  ReactNativeFirebaseFunctionsModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @ReactMethod
  public void useFunctionsEmulator(
    String appName,
    String region,
    String origin,
    Promise promise
  ) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseFunctions functionsInstance = FirebaseFunctions.getInstance(firebaseApp, region);
    functionsInstance.useFunctionsEmulator(origin);
    promise.resolve(null);
  }

  @ReactMethod
  public void httpsCallable(
    String appName,
    String region,
    final String name,
    ReadableMap wrapper,
    final Promise promise
  ) {
    Object input = wrapper.toHashMap().get(DATA_KEY);

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseFunctions functionsInstance = FirebaseFunctions.getInstance(firebaseApp, region);
    HttpsCallableReference httpsCallableReference = functionsInstance.getHttpsCallable(name);

    httpsCallableReference
      .call(input)
      .addOnSuccessListener(new OnSuccessListener<HttpsCallableResult>() {
        @Override
        public void onSuccess(HttpsCallableResult httpsCallableResult) {
          WritableMap map = Arguments.createMap();
          Object result = httpsCallableResult.getData();
          RCTConvertFirebase.mapPutValue(DATA_KEY, result, map);
          promise.resolve(map);
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@Nonnull Exception exception) {
          // TODO use new promise reject userInfo api
          Log.d(TAG, "function:call:onFailure:" + name, exception);

          String message;
          Object details = null;
          String code = "UNKNOWN";
          WritableMap map = Arguments.createMap();

          if (exception instanceof FirebaseFunctionsException) {
            FirebaseFunctionsException ffe = (FirebaseFunctionsException) exception;
            details = ffe.getDetails();
            code = ffe
              .getCode()
              .name();
            message = ffe.getMessage();
          } else {
            message = exception.getMessage();
          }

          RCTConvertFirebase.mapPutValue(CODE_KEY, code, map);
          RCTConvertFirebase.mapPutValue(MSG_KEY, message, map);
          RCTConvertFirebase.mapPutValue(ERROR_KEY, true, map);
          RCTConvertFirebase.mapPutValue(DETAILS_KEY, details, map);
          promise.resolve(map);
        }
      });
  }
}
