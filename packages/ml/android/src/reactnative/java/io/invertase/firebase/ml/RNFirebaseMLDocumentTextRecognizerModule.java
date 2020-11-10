package io.invertase.firebase.ml;

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

public class RNFirebaseMLDocumentTextRecognizerModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "MLDocumentTextRecognizer";
  private final UniversalFirebaseMLDocumentTextRecognizerModule module;

  RNFirebaseMLDocumentTextRecognizerModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    this.module = new UniversalFirebaseMLDocumentTextRecognizerModule(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void cloudDocumentTextRecognizerProcessImage(
    String appName,
    String stringUri,
    ReadableMap cloudDocumentTextRecognizerOptions,
    Promise promise
  ) {
    module.cloudDocumentTextRecognizerProcessImage(appName, stringUri, Arguments.toBundle(cloudDocumentTextRecognizerOptions))
      .addOnCompleteListener(getExecutor(), task -> {
        if (task.isSuccessful()) {
          promise.resolve(Arguments.makeNativeMap(task.getResult()));
        } else {
          String[] errorCodeAndMessage = UniversalFirebaseMLCommon.getErrorCodeAndMessageFromException(
            task.getException());
          rejectPromiseWithCodeAndMessage(
            promise,
            errorCodeAndMessage[0],
            errorCodeAndMessage[1],
            errorCodeAndMessage[2]
          );
        }
      });
  }
}
