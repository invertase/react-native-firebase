package io.invertase.firebase._template_;

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

public class ReactNativeFirebase_Template_Module extends ReactNativeFirebaseModule {
  private static final String TAG = "_Template_";

  ReactNativeFirebase_Template_Module(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @ReactMethod
  public void aMethod() {
    // This is just a dummy method. If there are no ReactMethod annotated methods in a module,
    // react-native won't even load it, which may lead to confusion as you test a new module.
    System.err.println("_Template_::aMethod - this method just logs to system out, then throws");
    throw new Exception(TAG + "::aMethod - Implement real methods now.");
  }
}
