package io.invertase.firebase.ml.naturallanguage;

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

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.util.Objects;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

class RNFirebaseMLNaturalLanguageIdModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "MLNaturalLanguageId";
  private final UniversalFirebaseMLNaturalLanguageIdModule module;

  RNFirebaseMLNaturalLanguageIdModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    this.module = new UniversalFirebaseMLNaturalLanguageIdModule(reactContext, SERVICE_NAME);
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/languageid/FirebaseLanguageIdentification.html#identifyLanguage(java.lang.String)
   */
  @ReactMethod
  public void identifyLanguage(
    String appName,
    String text,
    ReadableMap identificationOptionsMap,
    Promise promise
  ) {
    module
      .identifyLanguage(appName, text, Arguments.toBundle(identificationOptionsMap))
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          String[] errorCodeAndMessage = UniversalFirebaseMLNaturalLanguageCommon.getErrorCodeAndMessageFromException(
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

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/languageid/FirebaseLanguageIdentification.html#identifyPossibleLanguages(java.lang.String)
   */
  @ReactMethod
  public void identifyPossibleLanguages(
    String appName,
    String text,
    ReadableMap identificationOptionsMap,
    Promise promise
  ) {
    module
      .identifyPossibleLanguages(appName, text, Arguments.toBundle(identificationOptionsMap))
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(Arguments.fromList(Objects.requireNonNull(task.getResult())));
        } else {
          String[] errorCodeAndMessage = UniversalFirebaseMLNaturalLanguageCommon.getErrorCodeAndMessageFromException(
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
