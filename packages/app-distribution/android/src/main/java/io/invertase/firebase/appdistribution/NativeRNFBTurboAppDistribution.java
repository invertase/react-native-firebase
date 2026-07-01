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

import com.facebook.fbreact.specs.NativeRNFBTurboAppDistributionSpec;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;

public class NativeRNFBTurboAppDistribution extends NativeRNFBTurboAppDistributionSpec {
  private static final String TAG = "AppDistribution";

  public NativeRNFBTurboAppDistribution(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public void isTesterSignedIn(Promise promise) {
    promise.reject("platform-unsupported", "Android is not supported for App Distribution");
  }

  @Override
  public void signInTester(Promise promise) {
    promise.reject("platform-unsupported", "Android is not supported for App Distribution");
  }

  @Override
  public void checkForUpdate(Promise promise) {
    promise.reject("platform-unsupported", "Android is not supported for App Distribution");
  }

  @Override
  public void signOutTester(Promise promise) {
    promise.reject("platform-unsupported", "Android is not supported for App Distribution");
  }
}
