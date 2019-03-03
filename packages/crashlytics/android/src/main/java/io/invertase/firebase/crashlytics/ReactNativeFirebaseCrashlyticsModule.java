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
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

import io.invertase.firebase.common.ReactNativeFirebaseModule;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;

public class ReactNativeFirebaseCrashlyticsModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Crashlytics";

  ReactNativeFirebaseCrashlyticsModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @ReactMethod
  public void crash() {
    Crashlytics.getInstance().crash();
  }

  @ReactMethod
  public void log(String message, Promise promise) {
    Crashlytics.getInstance().core.log(message);
    promise.resolve(null);
  }

  @ReactMethod
  public void recordError(final int code, final String domain) {
    Crashlytics.getInstance().core.logException(new Exception(code + ": " + domain));
  }

  @ReactMethod
  public void setBoolValue(final String key, final boolean boolValue) {
    Crashlytics.getInstance().core.setBool(key, boolValue);
  }

  @ReactMethod
  public void setFloatValue(final String key, final float floatValue) {
    Crashlytics.getInstance().core.setFloat(key, floatValue);
  }

  @ReactMethod
  public void setIntValue(final String key, final int intValue) {
    Crashlytics.getInstance().core.setInt(key, intValue);
  }

  @ReactMethod
  public void setStringValue(final String key, final String stringValue) {
    Crashlytics.getInstance().core.setString(key, stringValue);
  }

  @ReactMethod
  public void setUserIdentifier(String userId) {
    Crashlytics.getInstance().core.setUserIdentifier(userId);
  }

  @ReactMethod
  public void setUserName(String userName) {
    Crashlytics.getInstance().core.setUserName(userName);
  }

  @ReactMethod
  public void setUserEmail(String userEmail) {
    Crashlytics.getInstance().core.setUserEmail(userEmail);
  }

  @ReactMethod
  public void setCrashlyticsCollectionEnabled(Boolean enabled) {
    ReactNativeFirebasePreferences
      .getSharedInstance()
      .setBooleanValue(Constants.KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, enabled);
  }
}
