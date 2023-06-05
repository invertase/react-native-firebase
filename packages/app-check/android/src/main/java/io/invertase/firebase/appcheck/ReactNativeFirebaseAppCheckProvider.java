package io.invertase.firebase.appcheck;

/*
 * Copyright (c) 2023-present Invertase Limited & Contributors
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
import androidx.annotation.NonNull;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.AppCheckProvider;
import com.google.firebase.appcheck.AppCheckToken;
import com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory;
import com.google.firebase.appcheck.debug.InternalDebugSecretProvider;
import com.google.firebase.appcheck.debug.internal.DebugAppCheckProvider;
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory;
import com.google.firebase.inject.Provider;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// Facade for all possible provider factory delegates,
// configurable dynamically instead of at startup
public class ReactNativeFirebaseAppCheckProvider implements AppCheckProvider {
  private static final String LOGTAG = "RNFBAppCheck";

  AppCheckProvider delegateProvider;

  @NonNull
  @Override
  public Task<AppCheckToken> getToken() {
    Log.d(LOGTAG, "Provider::getToken - delegating to native provider");
    return delegateProvider.getToken();
  }

  public void configure(String appName, String providerName, String debugToken) {
    Log.d(
        LOGTAG,
        "Provider::configure with appName/providerName/debugToken: "
            + appName
            + "/"
            + providerName
            + "/"
            + (debugToken != null ? "(not shown)" : "null"));

    try {
      FirebaseApp app = FirebaseApp.getInstance(appName);

      if ("debug".equals(providerName)) {

        // the debug configuration may have a token, or may not
        if (debugToken != null) {
          // To use this token, create debug provider using local secret provider + standard thread
          // pool
          ExecutorService executor = Executors.newCachedThreadPool();
          delegateProvider =
              new DebugAppCheckProvider(
                  app,
                  new Provider<InternalDebugSecretProvider>() {
                    public InternalDebugSecretProvider get() {
                      return new InternalDebugSecretProvider() {
                        public String getDebugSecret() {
                          return debugToken;
                        }
                      };
                    }
                  },
                  executor,
                  executor,
                  executor);

        } else {
          delegateProvider = DebugAppCheckProviderFactory.getInstance().create(app);
        }
      }

      if ("playIntegrity".equals(providerName)) {
        delegateProvider = PlayIntegrityAppCheckProviderFactory.getInstance().create(app);
      }
    } catch (Exception e) {
      // This will bubble up and result in a rejected promise with the underlying message
      throw new RuntimeException(e.getMessage());
    }
  }
}
