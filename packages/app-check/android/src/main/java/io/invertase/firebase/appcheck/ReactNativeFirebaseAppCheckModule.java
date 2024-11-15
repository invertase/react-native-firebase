package io.invertase.firebase.appcheck;

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

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.Log;
import com.facebook.react.bridge.*;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.FirebaseAppCheck;
import io.invertase.firebase.common.ReactNativeFirebaseEvent;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseJSON;
import io.invertase.firebase.common.ReactNativeFirebaseMeta;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class ReactNativeFirebaseAppCheckModule extends ReactNativeFirebaseModule {
  private static final String TAG = "AppCheck";
  private static final String LOGTAG = "RNFBAppCheck";
  private static final String KEY_APPCHECK_TOKEN_REFRESH_ENABLED = "app_check_token_auto_refresh";

  private static HashMap<String, FirebaseAppCheck.AppCheckListener> mAppCheckListeners =
      new HashMap<>();

  ReactNativeFirebaseAppCheckProviderFactory providerFactory =
      new ReactNativeFirebaseAppCheckProviderFactory();

  static boolean isAppCheckTokenRefreshEnabled() {
    boolean enabled;
    ReactNativeFirebaseJSON json = ReactNativeFirebaseJSON.getSharedInstance();
    ReactNativeFirebaseMeta meta = ReactNativeFirebaseMeta.getSharedInstance();
    ReactNativeFirebasePreferences prefs = ReactNativeFirebasePreferences.getSharedInstance();

    if (prefs.contains(KEY_APPCHECK_TOKEN_REFRESH_ENABLED)) {
      enabled = prefs.getBooleanValue(KEY_APPCHECK_TOKEN_REFRESH_ENABLED, true);
      Log.d(LOGTAG, "isAppCheckCollectionEnabled via RNFBPreferences: " + enabled);
    } else if (json.contains(KEY_APPCHECK_TOKEN_REFRESH_ENABLED)) {
      enabled = json.getBooleanValue(KEY_APPCHECK_TOKEN_REFRESH_ENABLED, true);
      Log.d(LOGTAG, "isAppCheckCollectionEnabled via RNFBJSON: " + enabled);
    } else {
      enabled = meta.getBooleanValue(KEY_APPCHECK_TOKEN_REFRESH_ENABLED, true);
      Log.d(LOGTAG, "isAppCheckCollectionEnabled via RNFBMeta: " + enabled);
    }

    if (BuildConfig.DEBUG) {
      if (!json.getBooleanValue(KEY_APPCHECK_TOKEN_REFRESH_ENABLED, false)) {
        enabled = false;
      }
      Log.d(
          LOGTAG,
          "isAppCheckTokenRefreshEnabled after checking "
              + KEY_APPCHECK_TOKEN_REFRESH_ENABLED
              + ": "
              + enabled);
    }

    Log.d(LOGTAG, "isAppCheckTokenRefreshEnabled final value: " + enabled);
    return enabled;
  }

  private boolean isAppDebuggable() throws Exception {
    boolean isDebuggable = false;
    PackageManager pm = getContext().getPackageManager();
    if (pm != null) {
      isDebuggable =
          (0
              != (pm.getApplicationInfo(getContext().getPackageName(), 0).flags
                  & ApplicationInfo.FLAG_DEBUGGABLE));
    }
    Log.d(LOGTAG, "debuggable status? " + isDebuggable);
    return isDebuggable;
  }

  ReactNativeFirebaseAppCheckModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);

    // Our default token refresh config comes from config files, set it
    FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance();
    firebaseAppCheck.setTokenAutoRefreshEnabled(isAppCheckTokenRefreshEnabled());
  }

  @Override
  public void invalidate() {
    super.invalidate();
    Log.d(TAG, "instance-destroyed");

    Iterator appCheckListenerIterator = mAppCheckListeners.entrySet().iterator();

    while (appCheckListenerIterator.hasNext()) {
      Map.Entry pair = (Map.Entry) appCheckListenerIterator.next();
      String appName = (String) pair.getKey();
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance(firebaseApp);
      FirebaseAppCheck.AppCheckListener mAppCheckListener =
          (FirebaseAppCheck.AppCheckListener) pair.getValue();
      firebaseAppCheck.removeAppCheckListener(mAppCheckListener);
      appCheckListenerIterator.remove();
    }
  }

  @ReactMethod
  public void configureProvider(
      String appName, String providerName, String debugToken, Promise promise) {
    Log.d(
        LOGTAG,
        "configureProvider - appName/providerName/debugToken: "
            + appName
            + "/"
            + providerName
            + (debugToken != null ? "/(not shown)" : "/null"));
    try {
      providerFactory.configure(appName, providerName, debugToken);
      FirebaseAppCheck.getInstance(FirebaseApp.getInstance(appName))
          .installAppCheckProviderFactory(providerFactory);
      promise.resolve(null);
    } catch (Exception e) {
      rejectPromiseWithCodeAndMessage(promise, "unknown", "internal-error", e.getMessage());
    }
  }

  @ReactMethod
  public void activate(
      String appName, String siteKeyProvider, boolean isTokenAutoRefreshEnabled, Promise promise) {
    try {

      FirebaseAppCheck firebaseAppCheck =
          FirebaseAppCheck.getInstance(FirebaseApp.getInstance(appName));
      firebaseAppCheck.setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled);

      // Configure our new proxy factory in a backwards-compatible way for old API
      if (isAppDebuggable()) {
        Log.d(LOGTAG, "app is debuggable, configuring AppCheck for testing mode");
        if (BuildConfig.FIREBASE_APP_CHECK_DEBUG_TOKEN != "null") {
          Log.d(LOGTAG, "debug app check token found in BuildConfig. Installing known token.");
          providerFactory.configure(appName, "debug", BuildConfig.FIREBASE_APP_CHECK_DEBUG_TOKEN);
        } else {
          Log.d(
              LOGTAG,
              "no debug app check token found in BuildConfig. Check Log for dynamic test token to"
                  + " configure in console.");
          providerFactory.configure(appName, "debug", null);
        }
      } else {
        providerFactory.configure(appName, "safetyNet", null);
      }

      FirebaseAppCheck.getInstance(FirebaseApp.getInstance(appName))
          .installAppCheckProviderFactory(providerFactory);
      promise.resolve(null);
    } catch (Exception e) {
      rejectPromiseWithCodeAndMessage(promise, "unknown", "internal-error", e.getMessage());
    }
  }

  @ReactMethod
  public void setTokenAutoRefreshEnabled(String appName, boolean isTokenAutoRefreshEnabled) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAppCheck.getInstance(firebaseApp).setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled);
  }

  @ReactMethod
  public void getToken(String appName, boolean forceRefresh, Promise promise) {
    Log.d(LOGTAG, "getToken appName/forceRefresh: " + appName + "/" + forceRefresh);
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    Tasks.call(
            getExecutor(),
            () -> {
              return Tasks.await(
                  FirebaseAppCheck.getInstance(firebaseApp).getAppCheckToken(forceRefresh));
            })
        .addOnCompleteListener(
            getExecutor(),
            (task) -> {
              if (task.isSuccessful()) {
                WritableMap tokenResultMap = Arguments.createMap();
                tokenResultMap.putString("token", task.getResult().getToken());
                promise.resolve(tokenResultMap);
              } else {
                Log.e(
                    LOGTAG,
                    "RNFB: Unknown error while fetching AppCheck token "
                        + task.getException().getMessage());
                rejectPromiseWithCodeAndMessage(
                    promise, "token-error", task.getException().getMessage());
              }
            });
  }

  @ReactMethod
  public void getLimitedUseToken(String appName, Promise promise) {
    Log.d(LOGTAG, "getLimitedUseToken appName: " + appName);
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    Tasks.call(
            getExecutor(),
            () -> {
              return Tasks.await(
                  FirebaseAppCheck.getInstance(firebaseApp).getLimitedUseAppCheckToken());
            })
        .addOnCompleteListener(
            getExecutor(),
            (task) -> {
              if (task.isSuccessful()) {
                WritableMap tokenResultMap = Arguments.createMap();
                tokenResultMap.putString("token", task.getResult().getToken());
                promise.resolve(tokenResultMap);
              } else {
                Log.e(
                    LOGTAG,
                    "Unknown error while fetching limited-use AppCheck token "
                        + task.getException().getMessage());
                rejectPromiseWithCodeAndMessage(
                    promise, "token-error", task.getException().getMessage());
              }
            });
  }

  /** Add a new token change listener - if one doesn't exist already */
  @ReactMethod
  public void addAppCheckListener(final String appName) {
    Log.d(TAG, "addAppCheckListener " + appName);

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance(firebaseApp);

    if (mAppCheckListeners.get(appName) == null) {
      FirebaseAppCheck.AppCheckListener newAppCheckListener =
          appCheckToken -> {
            WritableMap eventBody = Arguments.createMap();
            eventBody.putString("appName", appName); // for js side distribution
            eventBody.putString("token", appCheckToken.getToken());
            eventBody.putDouble("expireTimeMillis", appCheckToken.getExpireTimeMillis());

            ReactNativeFirebaseEventEmitter emitter =
                ReactNativeFirebaseEventEmitter.getSharedInstance();
            ReactNativeFirebaseEvent event =
                new ReactNativeFirebaseEvent("appCheck_token_changed", eventBody, appName);
            emitter.sendEvent(event);
          };

      firebaseAppCheck.addAppCheckListener(newAppCheckListener);
      mAppCheckListeners.put(appName, newAppCheckListener);
    }
  }

  /** Removes the current token change listener */
  @ReactMethod
  public void removeAppCheckListener(String appName) {
    Log.d(TAG, "removeAppCheckListener " + appName);

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance(firebaseApp);

    FirebaseAppCheck.AppCheckListener mAppCheckListener = mAppCheckListeners.get(appName);

    if (mAppCheckListener != null) {
      firebaseAppCheck.removeAppCheckListener(mAppCheckListener);
      mAppCheckListeners.remove(appName);
    }
  }
}
