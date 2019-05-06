package io.invertase.firebase.common;

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

import android.app.Activity;
import android.content.Context;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.WritableMap;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nonnull;

import io.invertase.firebase.interfaces.ContextProvider;

public class ReactNativeFirebaseModule extends ReactContextBaseJavaModule implements ContextProvider {
  private String moduleName;

  public ReactNativeFirebaseModule(
    ReactApplicationContext reactContext,
    String moduleName
  ) {
    super(reactContext);
    this.moduleName = moduleName;
  }

  @Override
  public void initialize() {
    super.initialize();
  }

  public ReactContext getContext() {
    return getReactApplicationContext();
  }

  public Context getApplicationContext() {
    return getReactApplicationContext().getApplicationContext();
  }

  public Activity getActivity() {
    return getCurrentActivity();
  }

  static WritableMap getExceptionMap(Exception exception) {
    WritableMap exceptionMap = Arguments.createMap();
    String code = "unknown";
    String message = exception.getMessage();
    exceptionMap.putString("code", code);
    exceptionMap.putString("nativeErrorCode", code);
    exceptionMap.putString("message", message);
    exceptionMap.putString("nativeErrorMessage", message);
    return exceptionMap;
  }

  public static void rejectPromiseWithExceptionMap(Promise promise, Exception exception) {
    promise.reject(exception, getExceptionMap(exception));
  }

  public static void rejectPromiseWithCodeAndMessage(Promise promise, String code, String message) {
    WritableMap userInfoMap = Arguments.createMap();
    userInfoMap.putString("code", code);
    userInfoMap.putString("message", message);
    promise.reject(code, message, userInfoMap);
  }

  @Nonnull
  @Override
  public String getName() {
    return "RNFB" + moduleName + "Module";
  }

  @Override
  public Map<String, Object> getConstants() {
    return new HashMap<>();
  }
}
