package io.invertase.firebase.appdistribution;

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

import com.facebook.react.bridge.*;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseAppDistributionModule extends ReactNativeFirebaseModule {
  private static final String TAG = "AppDistribution";

  ReactNativeFirebaseAppDistributionModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @ReactMethod
  public void isTesterSignedIn(Promise promise) {
    rejectPromiseWithCodeAndMessage(
        promise, "platform-unsupported", "Android is not supported for App Distribution");
  }

  @ReactMethod
  public void signInTester(Promise promise) {
    rejectPromiseWithCodeAndMessage(
        promise, "platform-unsupported", "Android is not supported for App Distribution");
  }

  @ReactMethod
  public void checkForUpdate(Promise promise) {
    rejectPromiseWithCodeAndMessage(
        promise, "platform-unsupported", "Android is not supported for App Distribution");
  }

  @ReactMethod
  public void signOutTester(Promise promise) {
    rejectPromiseWithCodeAndMessage(
        promise, "platform-unsupported", "Android is not supported for App Distribution");
  }
}
