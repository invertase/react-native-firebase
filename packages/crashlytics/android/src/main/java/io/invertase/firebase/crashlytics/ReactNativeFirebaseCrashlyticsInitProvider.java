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

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.Log;

import com.crashlytics.android.Crashlytics;
import com.crashlytics.android.ndk.CrashlyticsNdk;

import io.fabric.sdk.android.Fabric;
import io.invertase.firebase.common.ReactNativeFirebaseInitProvider;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;

@SuppressWarnings("NullableProblems")
public class ReactNativeFirebaseCrashlyticsInitProvider extends ReactNativeFirebaseInitProvider {
  private static final String TAG = "RNFBCrashlyticsInit";
  private static final String EMPTY_APPLICATION_ID_PROVIDER_AUTHORITY =
    "io.invertase.firebase.crashlytics.reactnativefirebasecrashlyticsinitprovider";
  private static final String RNFIREBASE_CRASHLYTICS_COLLECTION_ENABLED = "rnfirebase_crashlytics_collection_enabled";

  @Override
  public String getEmptyProviderAuthority() {
    return EMPTY_APPLICATION_ID_PROVIDER_AUTHORITY;
  }

  @Override
  public boolean onCreate() {
    super.onCreate();

    Context applicationContext = getContext();
    if (shouldInitializeCrashlytics(applicationContext)) {
      try {
        Fabric.with(applicationContext, new Crashlytics(), new CrashlyticsNdk());
        Log.i(TAG, "initialization successful");
      } catch (IllegalStateException exception) {
        Log.i(TAG, "initialization unsuccessful");
        return false;
      }
    } else {
      Log.i(TAG, "skipping initialization");
    }

    return true;
  }

  boolean shouldInitializeCrashlytics(Context applicationContext) {
    boolean enabled = true;
    ReactNativeFirebasePreferences preferences = ReactNativeFirebasePreferences.getSharedInstance();

    if (preferences.contains(RNFIREBASE_CRASHLYTICS_COLLECTION_ENABLED)) {
      enabled = preferences.getBooleanValue(RNFIREBASE_CRASHLYTICS_COLLECTION_ENABLED, true);
      Log.i(
        TAG,
        RNFIREBASE_CRASHLYTICS_COLLECTION_ENABLED + " preference key specified as " + enabled + "."
      );
    } else {
      try {
        PackageManager packageManager = applicationContext.getPackageManager();

        if (packageManager != null) {
          ApplicationInfo applicationInfo = packageManager.getApplicationInfo(
            applicationContext.getPackageName(),
            PackageManager.GET_META_DATA
          );

          if (applicationInfo != null && applicationInfo.metaData != null && applicationInfo.metaData
            .containsKey(
              RNFIREBASE_CRASHLYTICS_COLLECTION_ENABLED)) {
            enabled = applicationInfo.metaData.getBoolean(RNFIREBASE_CRASHLYTICS_COLLECTION_ENABLED);
            Log.i(
              TAG,
              RNFIREBASE_CRASHLYTICS_COLLECTION_ENABLED + " meta-data key specified as " + enabled + "."
            );
          } else {
            Log.i(TAG, RNFIREBASE_CRASHLYTICS_COLLECTION_ENABLED + " meta-data not specified");
          }
        }
      } catch (PackageManager.NameNotFoundException var6) {
        Log.d(TAG, "Unable to get PackageManager, defaulting to enabled.");
      }
    }

    return enabled;
  }
}