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

import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.CODE_KEY;
import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.DATA_KEY;
import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.DETAILS_KEY;
import static io.invertase.firebase.functions.UniversalFirebaseFunctionsModule.MSG_KEY;

import com.facebook.fbreact.specs.NativeFunctionsModuleSpec;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.functions.FirebaseFunctionsException;
import io.invertase.firebase.common.RCTConvertFirebase;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import io.invertase.firebase.common.UniversalFirebaseModule;
;
import java.io.IOException;

public class NativeFunctionsModule extends NativeFunctionsModuleSpec {
  private static final String SERVICE_NAME = "Functions";
  private final UniversalFirebaseFunctionsModule module;
  private final UniversalFirebaseModule universalFirebaseModule;

  public NativeFunctionsModule(ReactApplicationContext reactContext) {
    super(reactContext);
    // cannot have multiple inheritance so we make this a property rather than extending it
    universalFirebaseModule = new UniversalFirebaseModule(reactContext, SERVICE_NAME);
    this.module = new UniversalFirebaseFunctionsModule(reactContext, SERVICE_NAME);
  }

  @Override
  public void httpsCallable(
      String emulatorHost,
      double emulatorPort,
      String name,
      ReadableMap data,
      ReadableMap options,
      Promise promise) {

    // Get the default Firebase app
    FirebaseApp firebaseApp = FirebaseApp.getInstance();
    String region = "us-central1"; // Default region

    // Extract data from the wrapper
    Object callableData = data.toHashMap().get(DATA_KEY);

    // Convert emulatorPort to Integer (null if not using emulator)
    Integer port = emulatorHost != null ? (int) emulatorPort : null;

    Task<Object> callMethodTask = module.httpsCallable(
        firebaseApp.getName(), region, emulatorHost, port, name, callableData, options);

    // resolve
    callMethodTask.addOnSuccessListener(
      universalFirebaseModule.getExecutor(),
        result -> {
          promise.resolve(RCTConvertFirebase.mapPutValue(DATA_KEY, result, Arguments.createMap()));
        });

    // reject
    callMethodTask.addOnFailureListener(
      universalFirebaseModule.getExecutor(),
        exception -> {
          Object details = null;
          String code = "UNKNOWN";
          String message = exception.getMessage();
          WritableMap userInfo = Arguments.createMap();
          if (exception.getCause() instanceof FirebaseFunctionsException) {
            FirebaseFunctionsException functionsException =
                (FirebaseFunctionsException) exception.getCause();
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

  @Override
  public void httpsCallableFromUrl(
      String emulatorHost,
      double emulatorPort,
      String url,
      ReadableMap data,
      ReadableMap options,
      Promise promise) {

    // Get the default Firebase app
    FirebaseApp firebaseApp = FirebaseApp.getInstance();
    String region = "us-central1"; // Default region

    // Extract data from the wrapper
    Object callableData = data.toHashMap().get(DATA_KEY);

    // Convert emulatorPort to Integer (null if not using emulator)
    Integer port = emulatorHost != null ? (int) emulatorPort : null;

    Task<Object> callMethodTask = module.httpsCallableFromUrl(
        firebaseApp.getName(), region, emulatorHost, port, url, callableData, options);

    // resolve
    callMethodTask.addOnSuccessListener(
      universalFirebaseModule.getExecutor(),
        result -> {
          promise.resolve(RCTConvertFirebase.mapPutValue(DATA_KEY, result, Arguments.createMap()));
        });

    // reject
    callMethodTask.addOnFailureListener(
      universalFirebaseModule.getExecutor(),
        exception -> {
          Object details = null;
          String code = "UNKNOWN";
          String message = exception.getMessage();
          WritableMap userInfo = Arguments.createMap();
          if (exception.getCause() instanceof FirebaseFunctionsException) {
            FirebaseFunctionsException functionsException =
                (FirebaseFunctionsException) exception.getCause();
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
