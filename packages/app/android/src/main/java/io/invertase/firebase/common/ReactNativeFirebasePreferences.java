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

import android.content.Context;
import android.content.SharedPreferences;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;

public class ReactNativeFirebasePreferences {
  private static final String PREFERENCES_FILE = "io.invertase.firebase";
  private static ReactNativeFirebasePreferences sharedInstance = new ReactNativeFirebasePreferences();
  private ReactContext reactContext;
  private SharedPreferences preferences;

  public static ReactNativeFirebasePreferences getSharedInstance() {
    return sharedInstance;
  }

  public void attachContext(final ReactContext reactContext) {
    ReactNativeFirebasePreferences.this.reactContext = reactContext;
  }

  public void setBooleanValue(String key, boolean value) {
    getPreferences().edit().putBoolean(key, value).apply();
  }

  public boolean getBooleanValue(String key) {
    return getPreferences().getBoolean(key, false);
  }

  public WritableMap getAllAsWritableMap() {
    return Arguments.createMap();
    // TODO: Salakar: convert getPreferences().getAll() to writableMap
  }

  public void clearAll() {
    getPreferences().edit().clear().apply();
  }

  private SharedPreferences getPreferences() {
    if (preferences == null) {
      preferences = reactContext.getSharedPreferences(PREFERENCES_FILE, Context.MODE_PRIVATE);
    }

    return preferences;
  }
}
