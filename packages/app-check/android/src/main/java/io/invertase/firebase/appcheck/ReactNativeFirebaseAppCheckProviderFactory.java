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
import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.AppCheckProvider;
import com.google.firebase.appcheck.AppCheckProviderFactory;
import java.util.HashMap;

public class ReactNativeFirebaseAppCheckProviderFactory implements AppCheckProviderFactory {
  private static final String LOGTAG = "RNFBAppCheck";

  // This object has one job - create + maintain control over one provider per app
  public HashMap<String, ReactNativeFirebaseAppCheckProvider> providers = new HashMap<>();

  // Our provider will serve as a facade to all the supported native providers,
  // we will just pass through configuration calls to it
  public void configure(String appName, String providerName, String debugToken) {
    Log.d(
        LOGTAG,
        "ProviderFactory::configure - appName/providerName/debugToken: "
            + appName
            + "/"
            + providerName
            + (debugToken != null ? "/(not shown)" : "/null"));

    ReactNativeFirebaseAppCheckProvider provider;

    // Look up the correct provider for the given appName, create it if not created
    provider = providers.get(appName);
    if (provider == null) {
      provider = new ReactNativeFirebaseAppCheckProvider();
      providers.put(appName, provider);
    }
    provider.configure(appName, providerName, debugToken);
  }

  @NonNull
  public AppCheckProvider create(FirebaseApp firebaseApp) {
    String appName = firebaseApp.getName();
    Log.d(LOGTAG, "ProviderFactory::create - fetching provider for app " + appName);
    ReactNativeFirebaseAppCheckProvider provider = providers.get(appName);
    if (provider == null) {
      Log.d(LOGTAG, "ProviderFactory::create - provider not configured for this app.");
      throw new RuntimeException(
          "ReactNativeFirebaseAppCheckProvider not configured for app " + appName);
    }
    return provider;
  }
}
