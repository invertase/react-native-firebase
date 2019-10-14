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

import com.crashlytics.android.Crashlytics;
import com.crashlytics.android.core.CrashTest;
import com.crashlytics.android.core.CrashlyticsCore;
import com.facebook.react.bridge.*;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class ReactNativeFirebaseCrashlyticsModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Crashlytics";

  ReactNativeFirebaseCrashlyticsModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @ReactMethod
  public void crash() {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      Crashlytics.getInstance().core.log("Crash Test");
      // async task so as not to get caught by the React Native redbox handler in debug
      (new CrashTest()).crashAsyncTask(50);
    }
  }

  @ReactMethod
  public void log(String message) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      Crashlytics.getInstance().core.log(message);
    }
  }

  // For internal use only.
  @ReactMethod
  public void logPromise(String message, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      Crashlytics.getInstance().core.log(message);
    }
    promise.resolve(null);
  }

  @ReactMethod
  public void setAttribute(String key, String value, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      Crashlytics.getInstance().core.setString(key, value);
    }
    promise.resolve(null);
  }

  @ReactMethod
  public void setAttributes(ReadableMap keyValuesMap, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      ReadableMapKeySetIterator iterator = keyValuesMap.keySetIterator();
      CrashlyticsCore crashlyticsCore = Crashlytics.getInstance().core;

      while (iterator.hasNextKey()) {
        String key = iterator.nextKey();
        String value = keyValuesMap.getString(key);
        crashlyticsCore.setString(key, value);
      }
    }

    promise.resolve(null);
  }


  @ReactMethod
  public void setUserId(String userId, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      Crashlytics.getInstance().core.setUserIdentifier(userId);
    }
    promise.resolve(null);
  }

  @ReactMethod
  public void setUserName(String userName, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      Crashlytics.getInstance().core.setUserName(userName);
    }
    promise.resolve(null);
  }

  @ReactMethod
  public void setUserEmail(String userEmail, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      Crashlytics.getInstance().core.setUserEmail(userEmail);
    }
    promise.resolve(null);
  }

  @ReactMethod
  public void setCrashlyticsCollectionEnabled(Boolean enabled) {
    ReactNativeFirebasePreferences
      .getSharedInstance()
      .setBooleanValue(Constants.KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, enabled);
  }

  @ReactMethod
  public void recordError(ReadableMap jsErrorMap) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      recordJavaScriptError(jsErrorMap);
    }
  }

  @ReactMethod
  public void recordErrorPromise(ReadableMap jsErrorMap, Promise promise) {
    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()) {
      recordJavaScriptError(jsErrorMap);
    }
    promise.resolve(null);
  }

  private void recordJavaScriptError(ReadableMap jsErrorMap) {
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

    Crashlytics.getInstance().core.logException(customException);
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(
      "isCrashlyticsCollectionEnabled",
      ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled()
    );
    return constants;
  }
}
