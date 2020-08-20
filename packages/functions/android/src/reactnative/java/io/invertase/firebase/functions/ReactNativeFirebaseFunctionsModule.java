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

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.firebase.functions.FirebaseFunctionsException;

import io.invertase.firebase.common.RCTConvertFirebase;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import java.io.IOException;

import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.CODE_KEY;
import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.DATA_KEY;
import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.DETAILS_KEY;
import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.MSG_KEY;

public class ReactNativeFirebaseFunctionsModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "Functions";
  private final UniversalFirebaseFunctionsModule module;

  ReactNativeFirebaseFunctionsModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    this.module = new UniversalFirebaseFunctionsModule(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void httpsCallable(
    String appName,
    String region,
    String origin,
    String name,
    ReadableMap wrapper,
    ReadableMap options,
    Promise promise
  ) {
    Task<Object> callMethodTask = module.httpsCallable(
      appName,
      region,
      origin,
      name,
      wrapper.toHashMap().get(DATA_KEY),
      options
    );

    // resolve
    callMethodTask.addOnSuccessListener(getExecutor(), result -> {
      promise.resolve(RCTConvertFirebase.mapPutValue(DATA_KEY, result, Arguments.createMap()));
    });

    // reject
    callMethodTask.addOnFailureListener(getExecutor(), exception -> {
      Object details = null;
      String code = "UNKNOWN";
      String message = exception.getMessage();
      WritableMap userInfo = Arguments.createMap();
      if (exception.getCause() instanceof FirebaseFunctionsException) {
        FirebaseFunctionsException functionsException = (FirebaseFunctionsException) exception.getCause();
        details = functionsException.getDetails();
        code = functionsException.getCode().name();
        message = functionsException.getMessage();
        String timeout = FirebaseFunctionsException.Code.DEADLINE_EXCEEDED.name();
        Boolean isTimeout = code.contains(timeout);

        if (functionsException.getCause() instanceof IOException && !isTimeout) {
          // return UNAVAILABLE for network io errors, to match iOS
          code = FirebaseFunctionsException.Code.UNAVAILABLE.name();
          message = FirebaseFunctionsException.Code.UNAVAILABLE.name();
        }
      }
      RCTConvertFirebase.mapPutValue(CODE_KEY, code, userInfo);
      RCTConvertFirebase.mapPutValue(MSG_KEY, message, userInfo);
      RCTConvertFirebase.mapPutValue(DETAILS_KEY, details, userInfo);
      promise.reject(code, message, exception, userInfo);
    });
  }
}
