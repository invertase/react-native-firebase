package io.invertase.firebase.auth;

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

import com.facebook.react.bridge.ReactApplicationContext;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseAuthUserModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "AuthUser";

  public ReactNativeFirebaseAuthUserModule(ReactApplicationContext reactContext, String moduleName) {
    super(reactContext, moduleName);
  }

  @ReactMethod
  public void userDelete(String appName, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);
    FirebaseUser user = firebaseAuth.getCurrentUser();

    if (user == null) {
      // reject no user
    }


  }
}
