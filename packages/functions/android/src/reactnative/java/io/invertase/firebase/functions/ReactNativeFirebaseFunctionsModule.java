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
import com.google.firebase.functions.FirebaseFunctionsException;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.invertase.firebase.common.RCTConvertFirebase;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.CODE_KEY;
import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.DATA_KEY;
import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.DETAILS_KEY;
import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.MSG_KEY;

public class ReactNativeFirebaseFunctionsModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Functions";

  private final UniversalFirebaseFunctionsModule context;
  private final ExecutorService executor;

  ReactNativeFirebaseFunctionsModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
    this.context = new UniversalFirebaseFunctionsModule(reactContext);
    this.executor = Executors.newSingleThreadExecutor();
  }

  @ReactMethod
  public void httpsCallable(
    String appName,
    String region,
    String origin,
    String name,
    ReadableMap wrapper,
    Promise promise
  ) {
    this.context.httpsCallable(
      appName,
      region,
      origin,
      name,
      wrapper.toHashMap().get(DATA_KEY),
      executor
    ).addOnCompleteListener(executor, task -> {
      if (task.isSuccessful()) {
        WritableMap map = Arguments.createMap();

        RCTConvertFirebase.mapPutValue(DATA_KEY, task.getResult(), map);
        promise.resolve(map);
      } else {
        Exception exception = task.getException();
        Log.d(TAG, "function:call:onFailure:" + name, exception);

        String message;
        Object details = null;
        String code = "UNKNOWN";
        WritableMap userInfo = Arguments.createMap();

        if (exception != null && exception.getCause() instanceof FirebaseFunctionsException) {
          FirebaseFunctionsException functionsException = (FirebaseFunctionsException) exception.getCause();
          details = functionsException.getDetails();
          code = functionsException
            .getCode()
            .name();
          message = functionsException.getMessage();
        } else {
          message = exception.getMessage();
        }

        RCTConvertFirebase.mapPutValue(CODE_KEY, code, userInfo);
        RCTConvertFirebase.mapPutValue(MSG_KEY, message, userInfo);
        RCTConvertFirebase.mapPutValue(DETAILS_KEY, details, userInfo);
        promise.reject(code, message, exception, userInfo);
      }
    });
  }
}
