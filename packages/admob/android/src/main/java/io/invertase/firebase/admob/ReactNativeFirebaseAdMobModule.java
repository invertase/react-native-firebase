package io.invertase.firebase.admob;

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
import com.google.android.gms.ads.MobileAds;

import javax.annotation.Nullable;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseAdMobModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Admob";
  private boolean initilized = false;

  ReactNativeFirebaseAdMobModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);

    // TODO how to do this
//    if (admob_delay_app_measurement_init == false) {
//      setInitialized(null);
//    }
  }

  private void setInitialized(@Nullable Promise promise) {
    MobileAds.initialize(getReactApplicationContext(), initializationStatus -> {
      initilized = true;
      if (promise != null) {
        promise.resolve(null);
      }
    });
  }

  @ReactMethod
  public void initialize(Promise promise) {
    if (initilized) {
      promise.resolve(null);
      return;
    }

    setInitialized(promise);
  }

}
