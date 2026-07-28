package io.invertase.firebase.crashlytics;

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

import static io.invertase.firebase.common.ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage;

import android.os.Handler;
import android.util.Log;
import com.facebook.fbreact.specs.NativeRNFBTurboCrashlyticsSpec;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.google.firebase.crashlytics.FirebaseCrashlytics;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class NativeRNFBTurboCrashlytics extends NativeRNFBTurboCrashlyticsSpec {
  private static final String TAG = "Crashlytics";

  public NativeRNFBTurboCrashlytics(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  protected Map<String, Object> getTypedExportedConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(
        "isCrashlyticsCollectionEnabled",
        ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled());
    constants.put(
        "isErrorGenerationOnJSCrashEnabled",
        ReactNativeFirebaseCrashlyticsInitProvider.isErrorGenerationOnJSCrashEnabled());
    constants.put(
        "isCrashlyticsJavascriptExceptionHandlerChainingEnabled",
        ReactNativeFirebaseCrashlyticsInitProvider
            .isCrashlyticsJavascriptExceptionHandlerChainingEnabled());
    return constants;
  }

  @Override
  public void checkForUnsentReports(Promise promise) {
    FirebaseCrashlytics.getInstance()
        .checkForUnsentReports()
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                if (task.getResult() != null) {
                  promise.resolve(task.getResult());
                } else {
                  rejectPromiseWithCodeAndMessage(
                      promise, "unknown", "Unknown result of check for unsent reports");
                }

              } else {
                String message =
                    task.getException() != null
                        ? task.getException().getMessage()
                        : "checkForUnsentReports() request error";
                rejectPromiseWithCodeAndMessage(promise, "unknown", message);
              }
            });
  }

  @Override
  public void crashWithStackPromise(ReadableMap jsErrorMap, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      Exception e = recordJavaScriptError(jsErrorMap);
      e.printStackTrace(System.err);
      Log.e(TAG, "Crash logged. Terminating app.");
      System.exit(0);
    } else {
      Log.i(TAG, "crashlytics collection is not enabled, not crashing.");
    }
    promise.resolve(null);
  }

  @Override
  public void crash() {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      new Handler()
          .postDelayed(
              new Runnable() {
                @Override
                public void run() {
                  throw new RuntimeException("Crash Test");
                }
              },
              50);
    } else {
      Log.i(TAG, "crashlytics collection is not enabled, not crashing.");
    }
  }

  @Override
  public void deleteUnsentReports(Promise promise) {
    FirebaseCrashlytics.getInstance().deleteUnsentReports();
    promise.resolve(null);
  }

  @Override
  public void didCrashOnPreviousExecution(Promise promise) {
    promise.resolve(FirebaseCrashlytics.getInstance().didCrashOnPreviousExecution());
  }

  @Override
  public void log(String message) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      FirebaseCrashlytics.getInstance().log(message);
    }
  }

  @Override
  public void logPromise(String message, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      FirebaseCrashlytics.getInstance().log(message);
    }
    promise.resolve(null);
  }

  @Override
  public void setAttribute(String key, String value, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      FirebaseCrashlytics.getInstance().setCustomKey(key, value);
    }
    promise.resolve(null);
  }

  @Override
  public void setAttributes(ReadableMap keyValuesMap, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      ReadableMapKeySetIterator iterator = keyValuesMap.keySetIterator();
      FirebaseCrashlytics crashlytics = FirebaseCrashlytics.getInstance();

      while (iterator.hasNextKey()) {
        String key = iterator.nextKey();
        String value = keyValuesMap.getString(key);
        crashlytics.setCustomKey(key, value);
      }
    }

    promise.resolve(null);
  }

  @Override
  public void sendUnsentReports() {
    FirebaseCrashlytics.getInstance().sendUnsentReports();
  }

  @Override
  public void setUserId(String userId, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      FirebaseCrashlytics.getInstance().setUserId(userId);
    }
    promise.resolve(null);
  }

  @Override
  public void setCrashlyticsCollectionEnabled(boolean enabled, Promise promise) {
    ReactNativeFirebasePreferences.getSharedInstance()
        .setBooleanValue(Constants.KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, enabled);
    promise.resolve(null);
  }

  @Override
  public void recordError(ReadableMap jsErrorMap) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      recordJavaScriptError(jsErrorMap);
    } else {
      Log.i(TAG, "crashlytics collection is not enabled, not crashing.");
    }
  }

  @Override
  public void recordErrorPromise(ReadableMap jsErrorMap, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      recordJavaScriptError(jsErrorMap);
    } else {
      Log.i(TAG, "crashlytics collection is not enabled, not crashing.");
    }
    promise.resolve(null);
  }

  private Exception recordJavaScriptError(ReadableMap jsErrorMap) {
    String message = jsErrorMap.getString("message");
    ReadableArray stackFrames = Objects.requireNonNull(jsErrorMap.getArray("frames"));
    boolean isUnhandledPromiseRejection = jsErrorMap.getBoolean("isUnhandledRejection");

    Exception customException;
    if (isUnhandledPromiseRejection) {
      customException = new UnhandledPromiseRejection(message);
    } else {
      customException = new JavaScriptError(message);
    }

    StackTraceElement[] stackTraceElements = new StackTraceElement[stackFrames.size()];

    for (int i = 0; i < stackFrames.size(); i++) {
      ReadableMap stackFrame = Objects.requireNonNull(stackFrames.getMap(i));
      String fn = stackFrame.getString("fn");
      String file = stackFrame.getString("file");
      stackTraceElements[i] = new StackTraceElement("", fn, file, -1);
    }

    customException.setStackTrace(stackTraceElements);

    FirebaseCrashlytics.getInstance().recordException(customException);
    return customException;
  }
}
