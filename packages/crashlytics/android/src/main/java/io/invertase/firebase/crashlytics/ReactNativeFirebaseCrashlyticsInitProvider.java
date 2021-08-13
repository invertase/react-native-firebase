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

import static io.invertase.firebase.crashlytics.Constants.*;

import android.util.Log;
import com.google.firebase.crashlytics.FirebaseCrashlytics;
import io.invertase.firebase.common.ReactNativeFirebaseInitProvider;
import io.invertase.firebase.common.ReactNativeFirebaseJSON;
import io.invertase.firebase.common.ReactNativeFirebaseMeta;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;

public class ReactNativeFirebaseCrashlyticsInitProvider extends ReactNativeFirebaseInitProvider {
  private static final String TAG = "RNFBCrashlyticsInit";

  static boolean isCrashlyticsCollectionEnabled() {
    boolean enabled;
    ReactNativeFirebaseJSON json = ReactNativeFirebaseJSON.getSharedInstance();
    ReactNativeFirebaseMeta meta = ReactNativeFirebaseMeta.getSharedInstance();
    ReactNativeFirebasePreferences prefs = ReactNativeFirebasePreferences.getSharedInstance();

    if (prefs.contains(KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED)) {
      enabled = prefs.getBooleanValue(KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, true);
      Log.d(TAG, "isCrashlyticsCollectionEnabled via RNFBPreferences: " + enabled);
    } else if (json.contains(KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED)) {
      enabled = json.getBooleanValue(KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, true);
      Log.d(TAG, "isCrashlyticsCollectionEnabled via RNFBJSON: " + enabled);
    } else {
      enabled = meta.getBooleanValue(KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, true);
      Log.d(TAG, "isCrashlyticsCollectionEnabled via RNFBMeta: " + enabled);
    }

    if (BuildConfig.DEBUG) {
      if (!json.getBooleanValue(KEY_CRASHLYTICS_DEBUG_ENABLED, false)) {
        enabled = false;
      }
      Log.d(
          TAG,
          "isCrashlyticsCollectionEnabled after checking "
              + KEY_CRASHLYTICS_DEBUG_ENABLED
              + ": "
              + enabled);
    }

    Log.d(TAG, "isCrashlyticsCollectionEnabled final value: " + enabled);
    return enabled;
  }

  static boolean isErrorGenerationOnJSCrashEnabled() {
    boolean enabled;
    ReactNativeFirebaseJSON json = ReactNativeFirebaseJSON.getSharedInstance();
    ReactNativeFirebaseMeta meta = ReactNativeFirebaseMeta.getSharedInstance();
    ReactNativeFirebasePreferences prefs = ReactNativeFirebasePreferences.getSharedInstance();

    if (prefs.contains(KEY_CRASHLYTICS_IS_ERROR_GENERATION_ON_JS_CRASH_ENABLED)) {
      enabled =
          prefs.getBooleanValue(KEY_CRASHLYTICS_IS_ERROR_GENERATION_ON_JS_CRASH_ENABLED, true);
      Log.d(TAG, "isErrorGenerationOnJSCrashEnabled via RNFBPreferences: " + enabled);
    } else if (json.contains(KEY_CRASHLYTICS_IS_ERROR_GENERATION_ON_JS_CRASH_ENABLED)) {
      enabled = json.getBooleanValue(KEY_CRASHLYTICS_IS_ERROR_GENERATION_ON_JS_CRASH_ENABLED, true);
      Log.d(TAG, "isErrorGenerationOnJSCrashEnabled via RNFBJSON: " + enabled);
    } else {
      enabled = meta.getBooleanValue(KEY_CRASHLYTICS_IS_ERROR_GENERATION_ON_JS_CRASH_ENABLED, true);
      Log.d(TAG, "isErrorGenerationOnJSCrashEnabled via RNFBMeta: " + enabled);
    }

    Log.d(TAG, "isErrorGenerationOnJSCrashEnabled final value: " + enabled);
    return enabled;
  }

  static boolean isCrashlyticsJavascriptExceptionHandlerChainingEnabled() {
    boolean enabled;
    ReactNativeFirebaseJSON json = ReactNativeFirebaseJSON.getSharedInstance();
    ReactNativeFirebaseMeta meta = ReactNativeFirebaseMeta.getSharedInstance();
    ReactNativeFirebasePreferences prefs = ReactNativeFirebasePreferences.getSharedInstance();

    if (prefs.contains(KEY_CRASHLYTICS_JAVASCRIPT_EXCEPTION_HANDLER_CHAINING_ENABLED)) {
      enabled =
          prefs.getBooleanValue(
              KEY_CRASHLYTICS_JAVASCRIPT_EXCEPTION_HANDLER_CHAINING_ENABLED, true);
      Log.d(
          TAG,
          "isCrashlyticsJavascriptExceptionHandlerChainingEnabled via RNFBPreferences: " + enabled);
    } else if (json.contains(KEY_CRASHLYTICS_JAVASCRIPT_EXCEPTION_HANDLER_CHAINING_ENABLED)) {
      enabled =
          json.getBooleanValue(KEY_CRASHLYTICS_JAVASCRIPT_EXCEPTION_HANDLER_CHAINING_ENABLED, true);
      Log.d(TAG, "isCrashlyticsJavascriptExceptionHandlerChainingEnabled via RNFBJSON: " + enabled);
    } else {
      enabled =
          meta.getBooleanValue(KEY_CRASHLYTICS_JAVASCRIPT_EXCEPTION_HANDLER_CHAINING_ENABLED, true);
      Log.d(TAG, "isCrashlyticsJavascriptExceptionHandlerChainingEnabled via RNFBMeta: " + enabled);
    }

    Log.d(TAG, "isCrashlyticsJavascriptExceptionHandlerChainingEnabled final value: " + enabled);
    return enabled;
  }

  @Override
  public boolean onCreate() {
    super.onCreate();

    try {
      FirebaseCrashlytics.getInstance()
          .setCrashlyticsCollectionEnabled(
              ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled());
      Log.i(TAG, "initialization successful");
    } catch (Exception exception) {
      Log.e(TAG, "initialization failed", exception);
      return false;
    }

    return true;
  }
}
