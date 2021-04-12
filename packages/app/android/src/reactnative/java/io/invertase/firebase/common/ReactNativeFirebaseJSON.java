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

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import io.invertase.firebase.BuildConfig;

public class ReactNativeFirebaseJSON {
  private static ReactNativeFirebaseJSON sharedInstance = new ReactNativeFirebaseJSON();

  private JSONObject jsonObject;

  private ReactNativeFirebaseJSON() {
    try {
      jsonObject = new JSONObject(BuildConfig.FIREBASE_JSON_RAW);
    } catch (JSONException e) {
      // JSON is validated as part of gradle build - should never error
    }
  }

  public static ReactNativeFirebaseJSON getSharedInstance() {
    return sharedInstance;
  }

  public boolean contains(String key) {
    if (jsonObject == null) return false;
    return jsonObject.has(key);
  }

  public boolean getBooleanValue(String key, boolean defaultValue) {
    if (jsonObject == null) return defaultValue;
    return jsonObject.optBoolean(key, defaultValue);
  }

  public int getIntValue(String key, int defaultValue) {
    if (jsonObject == null) return defaultValue;
    return jsonObject.optInt(key, defaultValue);
  }

  public long getLongValue(String key, long defaultValue) {
    if (jsonObject == null) return defaultValue;
    return jsonObject.optLong(key, defaultValue);
  }

  public String getStringValue(String key, String defaultValue) {
    if (jsonObject == null) return defaultValue;
    return jsonObject.optString(key, defaultValue);
  }

  public String getRawJSON() {
    return BuildConfig.FIREBASE_JSON_RAW;
  }

  public WritableMap getAll() {
    WritableMap writableMap = Arguments.createMap();

    JSONArray keys = jsonObject.names();
    for (int i = 0; i < keys.length(); ++i) {
      try {
        String key = keys.getString(i);
        SharedUtils.mapPutValue(key, jsonObject.get(key), writableMap);
      } catch (JSONException e) {
        // ignore
      }
    }

    return writableMap;
  }
}
