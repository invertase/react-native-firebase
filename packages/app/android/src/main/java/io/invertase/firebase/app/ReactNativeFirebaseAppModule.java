package io.invertase.firebase.app;

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

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.FirebaseApp;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.invertase.firebase.common.RCTConvertFirebaseCommon;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;

public class ReactNativeFirebaseAppModule extends ReactNativeFirebaseModule {
  private static final String TAG = "App";

  ReactNativeFirebaseAppModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG, false);
  }

  @Override
  public void initialize() {
    super.initialize();
    ReactNativeFirebaseEventEmitter.getSharedInstance().attachContext(getContext());
    ReactNativeFirebasePreferences.getSharedInstance().attachContext(getContext());
  }

  @ReactMethod
  public void initializeApp(ReadableMap firebaseAppRaw, Promise promise) {
    FirebaseApp firebaseApp = RCTConvertFirebaseCommon.readableMapToFirebaseApp(
      firebaseAppRaw,
      getContext()
    );

    WritableMap firebaseAppMap = RCTConvertFirebaseCommon.firebaseAppToWritableMap(firebaseApp);
    promise.resolve(firebaseAppMap);
  }

  @ReactMethod
  public void deleteApp(String appName, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    if (firebaseApp != null) {
      firebaseApp.delete();
    }

    promise.resolve(null);
  }

  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();
    List<Map<String, Object>> appsList = new ArrayList<>();
    List<FirebaseApp> firebaseApps = FirebaseApp.getApps(getReactApplicationContext());

    for (FirebaseApp app : firebaseApps) {
      appsList.add(RCTConvertFirebaseCommon.firebaseAppToMap(app));
    }

    constants.put("apps", appsList);
    return constants;
  }

}
