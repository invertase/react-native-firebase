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


import io.invertase.firebase.app.ReactNativeFirebaseApp;

public class UniversalFirebasePreferences {
  private static final String PREFERENCES_FILE = "io.invertase.firebase";
  private static UniversalFirebasePreferences sharedInstance = new UniversalFirebasePreferences();
  private SharedPreferences preferences;

  public static UniversalFirebasePreferences getSharedInstance() {
    return sharedInstance;
  }

  public boolean contains(String key) {
    return getPreferences().contains(key);
  }

  // Boolean
  public void setBooleanValue(String key, boolean value) {
    getPreferences().edit().putBoolean(key, value).apply();
  }

  public boolean getBooleanValue(String key, boolean defaultValue) {
    return getPreferences().getBoolean(key, defaultValue);
  }

  // Int
  public void setIntValue(String key, int value) {
    getPreferences().edit().putInt(key, value).apply();
  }

  public int getIntValue(String key, int defaultValue) {
    return getPreferences().getInt(key, defaultValue);
  }

  // Long
  public void setLongValue(String key, long value) {
    getPreferences().edit().putLong(key, value).apply();
  }

  public long getLongValue(String key, long defaultValue) {
    return getPreferences().getLong(key, defaultValue);
  }

  // String
  public void setStringValue(String key, String value) {
    getPreferences().edit().putString(key, value).apply();
  }

  public String getStringValue(String key, String defaultValue) {
    return getPreferences().getString(key, defaultValue);
  }

  public void clearAll() {
    getPreferences().edit().clear().apply();
  }

  public SharedPreferences.Editor remove(String key){
    return getPreferences().edit().remove(key);
  }

  private SharedPreferences getPreferences() {
    if (preferences == null) {
      preferences = ReactNativeFirebaseApp
        .getApplicationContext()
        .getSharedPreferences(PREFERENCES_FILE, Context.MODE_PRIVATE);
    }
    return preferences;
  }
}
