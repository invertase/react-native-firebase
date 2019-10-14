package io.invertase.firebase.utils;

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
import android.content.IntentSender;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.util.Log;
import com.facebook.react.bridge.*;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;

import io.invertase.firebase.app.ReactNativeFirebaseApp;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class ReactNativeFirebaseUtilsModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Utils";
  private static final String KEY_MAIN_BUNDLE = "MAIN_BUNDLE";
  private static final String KEY_DOCUMENT_DIRECTORY = "DOCUMENT_DIRECTORY";
  private static final String KEY_LIBRARY_DIRECTORY = "LIBRARY_DIRECTORY";
  private static final String KEY_EXTERNAL_DIRECTORY = "EXTERNAL_DIRECTORY";
  private static final String KEY_EXT_STORAGE_DIRECTORY = "EXTERNAL_STORAGE_DIRECTORY";
  private static final String KEY_PICS_DIRECTORY = "PICTURES_DIRECTORY";
  private static final String KEY_MOVIES_DIRECTORY = "MOVIES_DIRECTORY";
  private static final String KEY_TEMP_DIRECTORY = "TEMP_DIRECTORY";
  private static final String KEY_CACHE_DIRECTORY = "CACHES_DIRECTORY";
  private static final String FIREBASE_TEST_LAB = "firebase.test.lab";

  public ReactNativeFirebaseUtilsModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  /**
   * Is this app running in Firebase Test Lab
   *
   * @return Boolean
   */
  private static Boolean isRunningInTestLab() {
    String testLabSetting = Settings.System.getString(
      ReactNativeFirebaseApp.getApplicationContext().getContentResolver(),
      FIREBASE_TEST_LAB
    );

    return "true".equals(testLabSetting);
  }

  @ReactMethod
  public void androidGetPlayServicesStatus(Promise promise) {
    promise.resolve(getPlayServicesStatusMap());
  }

  /**
   * Prompt the device user to update play services
   */
  @ReactMethod
  public void androidPromptForPlayServices() {
    int status = isGooglePlayServicesAvailable();
    GoogleApiAvailability gapi = GoogleApiAvailability.getInstance();

    if (status != ConnectionResult.SUCCESS && gapi.isUserResolvableError(status)) {
      Activity activity = getActivity();
      if (activity != null) {
        gapi.getErrorDialog(activity, status, status).show();
      }
    }
  }

  /**
   * Prompt the device user to update play services
   */
  @ReactMethod
  public void androidResolutionForPlayServices() {
    int status = isGooglePlayServicesAvailable();
    ConnectionResult connectionResult = new ConnectionResult(status);

    if (!connectionResult.isSuccess() && connectionResult.hasResolution()) {
      Activity activity = getActivity();
      if (activity != null) {
        try {
          connectionResult.startResolutionForResult(activity, status);
        } catch (IntentSender.SendIntentException error) {
          Log.d(TAG, "resolutionForPlayServices", error);
        }
      }
    }
  }

  /**
   * Prompt the device user to update Play Services
   */
  @ReactMethod
  public void androidMakePlayServicesAvailable() {
    int status = isGooglePlayServicesAvailable();

    if (status != ConnectionResult.SUCCESS) {
      Activity activity = getActivity();
      if (activity != null) {
        GoogleApiAvailability.getInstance().makeGooglePlayServicesAvailable(activity);
      }
    }
  }

  private int isGooglePlayServicesAvailable() {
    GoogleApiAvailability gapi = GoogleApiAvailability.getInstance();
    return gapi.isGooglePlayServicesAvailable(getContext());
  }

  private WritableMap getPlayServicesStatusMap() {
    WritableMap result = Arguments.createMap();
    GoogleApiAvailability gapi = GoogleApiAvailability.getInstance();

    int status = gapi.isGooglePlayServicesAvailable(getContext());
    result.putInt("status", status);

    if (status == ConnectionResult.SUCCESS) {
      result.putBoolean("isAvailable", true);
    } else {
      result.putBoolean("isAvailable", false);
      result.putString("error", gapi.getErrorString(status));
      result.putBoolean("isUserResolvableError", gapi.isUserResolvableError(status));
      result.putBoolean("hasResolution", new ConnectionResult(status).hasResolution());
    }

    return result;
  }

  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();

    constants.put("isRunningInTestLab", isRunningInTestLab());
    constants.put("androidPlayServices", getPlayServicesStatusMap());

    Context context = getReactApplicationContext();
    constants.put(KEY_MAIN_BUNDLE, "");
    constants.put(KEY_LIBRARY_DIRECTORY, context.getFilesDir().getAbsolutePath());
    constants.put(KEY_TEMP_DIRECTORY, context.getCacheDir().getAbsolutePath());
    constants.put(KEY_CACHE_DIRECTORY, context.getCacheDir().getAbsolutePath());


    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
      File folder = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
      constants.put(KEY_DOCUMENT_DIRECTORY, folder.getAbsolutePath());
    } else {
      constants.put(KEY_DOCUMENT_DIRECTORY, context.getFilesDir().getAbsolutePath());
    }

    constants.put(KEY_PICS_DIRECTORY, Environment
      .getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
      .getAbsolutePath());

    constants.put(KEY_MOVIES_DIRECTORY, Environment
      .getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES)
      .getAbsolutePath());

    File externalStorageDirectory = Environment.getExternalStorageDirectory();
    if (externalStorageDirectory != null) {
      constants.put(KEY_EXT_STORAGE_DIRECTORY, externalStorageDirectory.getAbsolutePath());
    }

    File externalDirectory = context.getExternalFilesDir(null);
    if (externalDirectory != null) {
      constants.put(KEY_EXTERNAL_DIRECTORY, externalDirectory.getAbsolutePath());
    }

    return constants;
  }
}
