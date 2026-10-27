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
import com.google.android.gms.tasks.Tasks;
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

  static final String PROVIDER_NOT_READY_MESSAGE =
      "App Check provider is not ready. Call initializeAppCheck before requesting tokens.";

  static final class ProviderNotReadyException extends IllegalStateException {
    ProviderNotReadyException() {
      super(PROVIDER_NOT_READY_MESSAGE);
    }
  }

  volatile AppCheckProvider delegateProvider;

  @NonNull
  @Override
  public Task<AppCheckToken> getToken() {
    AppCheckProvider delegate = delegateProvider;
    if (delegate == null) {
      return providerNotReady("getToken");
    }
    Log.d(LOGTAG, "Provider::getToken - delegating to native provider");
    return delegate.getToken();
  }

  @NonNull
  @Override
  public Task<AppCheckToken> getLimitedUseToken() {
    AppCheckProvider delegate = delegateProvider;
    if (delegate == null) {
      return providerNotReady("getLimitedUseToken");
    }
    Log.d(LOGTAG, "Provider::getLimitedUseToken - delegating to native provider");
    return delegate.getLimitedUseToken();
  }

  private static Task<AppCheckToken> providerNotReady(String method) {
    Log.d(LOGTAG, "Provider::" + method + " - provider not ready (no delegate configured)");
    return Tasks.forException(new ProviderNotReadyException());
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

    // Reset first so a failed reconfigure cannot leave the previous delegate serving tokens.
    delegateProvider = null;

    try {
      if ("debug".equals(providerName)) {
        delegateProvider = createDebugProvider(getFirebaseApp(appName), debugToken);
      }

      if ("playIntegrity".equals(providerName)) {
        delegateProvider = createPlayIntegrityProvider(getFirebaseApp(appName));
      }

      if (delegateProvider == null) {
        String message =
            "Unknown provider name \""
                + providerName
                + "\". Valid providers are: debug, playIntegrity.";
        Log.e(LOGTAG, message);
        throw new IllegalArgumentException(message);
      }
    } catch (Exception e) {
      // This will bubble up and result in a rejected promise with the underlying message
      throw new RuntimeException(e.getMessage());
    }
  }

  FirebaseApp getFirebaseApp(String appName) {
    return FirebaseApp.getInstance(appName);
  }

  AppCheckProvider createDebugProvider(FirebaseApp app, String debugToken) {
    if (debugToken == null) {
      return DebugAppCheckProviderFactory.getInstance().create(app);
    }
    ExecutorService executor = Executors.newCachedThreadPool();
    return new DebugAppCheckProvider(
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
  }

  AppCheckProvider createPlayIntegrityProvider(FirebaseApp app) {
    return PlayIntegrityAppCheckProviderFactory.getInstance().create(app);
  }
}
