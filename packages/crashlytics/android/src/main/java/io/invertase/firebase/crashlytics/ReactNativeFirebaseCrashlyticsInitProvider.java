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

import android.util.Log;

import com.crashlytics.android.Crashlytics;
import com.crashlytics.android.core.CrashlyticsCore;
import com.crashlytics.android.ndk.CrashlyticsNdk;

import io.fabric.sdk.android.Fabric;
import io.invertase.firebase.common.ReactNativeFirebaseInitProvider;
import io.invertase.firebase.common.ReactNativeFirebaseJSON;
import io.invertase.firebase.common.ReactNativeFirebaseMeta;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;

import static io.invertase.firebase.crashlytics.Constants.EMPTY_APPLICATION_ID_PROVIDER_AUTHORITY;
import static io.invertase.firebase.crashlytics.Constants.KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED;
import static io.invertase.firebase.crashlytics.Constants.KEY_CRASHLYTICS_DEBUG_ENABLED;
import static io.invertase.firebase.crashlytics.Constants.KEY_CRASHLYTICS_NDK_ENABLED;

public class ReactNativeFirebaseCrashlyticsInitProvider extends ReactNativeFirebaseInitProvider {
  private static final String TAG = "RNFBCrashlyticsInit";

  static boolean isCrashlyticsCollectionEnabled() {
    boolean enabled;
    ReactNativeFirebaseJSON json = ReactNativeFirebaseJSON.getSharedInstance();
    ReactNativeFirebaseMeta meta = ReactNativeFirebaseMeta.getSharedInstance();
    ReactNativeFirebasePreferences prefs = ReactNativeFirebasePreferences.getSharedInstance();

    if (prefs.contains(KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED)) {
      enabled = prefs.getBooleanValue(KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, true);
    } else if (json.contains(KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED)) {
      enabled = json.getBooleanValue(KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, true);
    } else {
      enabled = meta.getBooleanValue(KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, true);
    }

    return enabled;
  }

  @Override
  public String getEmptyProviderAuthority() {
    return EMPTY_APPLICATION_ID_PROVIDER_AUTHORITY;
  }

  @Override
  public boolean onCreate() {
    super.onCreate();

    if (ReactNativeFirebaseCrashlyticsInitProvider.isCrashlyticsCollectionEnabled() && getContext() != null) {
      ReactNativeFirebaseJSON json = ReactNativeFirebaseJSON.getSharedInstance();
      boolean useNdk = json.getBooleanValue(KEY_CRASHLYTICS_NDK_ENABLED, true);
      boolean debug = json.getBooleanValue(KEY_CRASHLYTICS_DEBUG_ENABLED, false);

      try {
        Fabric.Builder builder = new Fabric.Builder(getContext());

        Crashlytics crashlyticsCore = new Crashlytics.Builder()
          .core(new CrashlyticsCore.Builder().disabled(!debug && BuildConfig.DEBUG).build())
          .build();

        if (useNdk) {
          builder.kits(crashlyticsCore, new CrashlyticsNdk());
        } else {
          builder.kits(crashlyticsCore);
        }

        builder.debuggable(debug);

        Fabric.with(builder.build());

         Log.i(TAG, "initialization successful");
      } catch (IllegalStateException exception) {
        Log.e(TAG, "initialization failed", exception);
        return false;
      }
    } else {
      Log.i(TAG, "auto collection disabled, skipping initialization");
    }

    return true;
  }
}