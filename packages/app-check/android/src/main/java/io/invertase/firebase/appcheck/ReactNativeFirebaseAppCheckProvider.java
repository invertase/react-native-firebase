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
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.AppCheckProvider;
import com.google.firebase.appcheck.AppCheckProviderFactory;
import com.google.firebase.appcheck.AppCheckToken;
import com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory;
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory;
import com.google.firebase.appcheck.safetynet.SafetyNetAppCheckProviderFactory;
import java.lang.reflect.Constructor;

// Facade for all possible provider factory delegates,
// configurable dynamically instead of at startup
public class ReactNativeFirebaseAppCheckProvider implements AppCheckProvider {
  private static final String LOGTAG = "RNFBAppCheck";

  AppCheckProvider delegateProvider;

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
          // Create a debug provider using hidden factory constructor and our debug token
          Class<DebugAppCheckProviderFactory> debugACFactoryClass =
              DebugAppCheckProviderFactory.class;
          Class<?>[] argType = {String.class};
          Constructor c = debugACFactoryClass.getDeclaredConstructor(argType);
          Object[] cArgs = {debugToken};
          delegateProvider = ((AppCheckProviderFactory) c.newInstance(cArgs)).create(app);
        } else {
          delegateProvider = DebugAppCheckProviderFactory.getInstance().create(app);
        }
      }

      if ("safetyNet".equals(providerName)) {
        delegateProvider = SafetyNetAppCheckProviderFactory.getInstance().create(app);
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
