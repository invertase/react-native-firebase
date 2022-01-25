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
import com.google.firebase.appcheck.AppCheckProviderFactory;
import com.google.firebase.appcheck.FirebaseAppCheck;
import com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory;
import com.google.firebase.appcheck.safetynet.SafetyNetAppCheckProviderFactory;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import java.lang.reflect.*;

public class ReactNativeFirebaseAppCheckModule extends ReactNativeFirebaseModule {
  private static final String TAG = "AppCheck";

  ReactNativeFirebaseAppCheckModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @ReactMethod
  public void activate(
      String appName, String siteKeyProvider, boolean isTokenAutoRefreshEnabled, Promise promise) {
    try {
      FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance();
      firebaseAppCheck.setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled);
      boolean isDebuggable = false;
      PackageManager pm = getContext().getPackageManager();
      if (pm != null) {
        isDebuggable =
            (0
                != (pm.getApplicationInfo(getContext().getPackageName(), 0).flags
                    & ApplicationInfo.FLAG_DEBUGGABLE));
      }

      if (isDebuggable) {

        if (BuildConfig.FIREBASE_APP_CHECK_DEBUG_TOKEN != "null") {
          // Get DebugAppCheckProviderFactory class
          Class<DebugAppCheckProviderFactory> debugACFactoryClass =
              DebugAppCheckProviderFactory.class;

          // Get the (undocumented) constructor accepting a debug token as string
          Class<?>[] argType = {String.class};
          Constructor c = debugACFactoryClass.getDeclaredConstructor(argType);

          // Create a object containing the constructor arguments
          // and initialize a new instance.
          Object[] cArgs = {BuildConfig.FIREBASE_APP_CHECK_DEBUG_TOKEN};
          firebaseAppCheck.installAppCheckProviderFactory(
              (AppCheckProviderFactory) c.newInstance(cArgs));
        } else {
          firebaseAppCheck.installAppCheckProviderFactory(
              DebugAppCheckProviderFactory.getInstance());
        }

      } else {
        firebaseAppCheck.installAppCheckProviderFactory(
            SafetyNetAppCheckProviderFactory.getInstance());
      }
    } catch (Exception e) {
      rejectPromiseWithCodeAndMessage(promise, "unknown", "internal-error", "unimplemented");
      return;
    }
    promise.resolve(null);
  }

  @ReactMethod
  public void setTokenAutoRefreshEnabled(String appName, boolean isTokenAutoRefreshEnabled) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAppCheck.getInstance(firebaseApp).setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled);
  }

  @ReactMethod
  public void getToken(String appName, boolean forceRefresh, Promise promise) {
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
                    TAG,
                    "RNFB: Unknown error while fetching AppCheck token "
                        + task.getException().getMessage());
                rejectPromiseWithCodeAndMessage(
                    promise, "token-error", task.getException().getMessage());
              }
            });
  }
}
