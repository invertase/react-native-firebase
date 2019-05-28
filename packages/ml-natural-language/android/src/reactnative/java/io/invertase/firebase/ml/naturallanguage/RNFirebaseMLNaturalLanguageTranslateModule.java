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

import com.facebook.react.bridge.ReactApplicationContext;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

class RNFirebaseMLNaturalLanguageTranslateModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "MLNaturalLanguageTranslate";
  private final UniversalFirebaseMLNaturalLanguageTranslateModule module;

  RNFirebaseMLNaturalLanguageTranslateModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    this.module = new UniversalFirebaseMLNaturalLanguageTranslateModule(reactContext, SERVICE_NAME);
  }

// TODO not available on iOS until SDK 6.0.0

//  /**
//   * @url No reference documentation yet...
//   */
//  @ReactMethod
//  public void translate(
//    String appName,
//    String text,
//    ReadableMap translationOptionsMap,
//    Promise promise
//  ) {
//    module
//      .translate(appName, text, Arguments.toBundle(translationOptionsMap))
//      .addOnCompleteListener(task -> {
//        if (task.isSuccessful()) {
//          promise.resolve(task.getResult());
//        } else {
//          String[] errorCodeAndMessage = UniversalFirebaseMLNaturalLanguageCommon.getErrorCodeAndMessageFromException(
//            task.getException());
//          rejectPromiseWithCodeAndMessage(
//            promise,
//            errorCodeAndMessage[0],
//            errorCodeAndMessage[1],
//            errorCodeAndMessage[2]
//          );
//        }
//      });
//  }
//
//  /**
//   * @url No reference documentation yet...
//   */
//  @ReactMethod
//  public void modelManagerGetAvailableModels(String appName, Promise promise) {
//    module.modelManagerGetAvailableModels(appName).addOnCompleteListener(task -> {
//      if (task.isSuccessful()) {
//        promise.resolve(Arguments.fromList(Objects.requireNonNull(task.getResult())));
//      } else {
//        String[] errorCodeAndMessage = UniversalFirebaseMLNaturalLanguageCommon.getErrorCodeAndMessageFromException(
//          task.getException());
//        rejectPromiseWithCodeAndMessage(
//          promise,
//          errorCodeAndMessage[0],
//          errorCodeAndMessage[1],
//          errorCodeAndMessage[2]
//        );
//      }
//    });
//  }
//
//  /**
//   * @url No reference documentation yet...
//   */
//  @ReactMethod
//  public void modelManagerDeleteDownloadedModel(String appName, int language, Promise promise) {
//    module.modelManagerDeleteDownloadedModel(appName, language).addOnCompleteListener(task -> {
//      if (task.isSuccessful()) {
//        promise.resolve(task.getResult());
//      } else {
//        String[] errorCodeAndMessage = UniversalFirebaseMLNaturalLanguageCommon.getErrorCodeAndMessageFromException(
//          task.getException());
//        rejectPromiseWithCodeAndMessage(
//          promise,
//          errorCodeAndMessage[0],
//          errorCodeAndMessage[1],
//          errorCodeAndMessage[2]
//        );
//      }
//    });
//  }
//
//  /**
//   * @url No reference documentation yet...
//   */
//  @ReactMethod
//  public void modelManagerDownloadRemoteModelIfNeeded(
//    String appName,
//    int language,
//    ReadableMap downloadConditionsMap,
//    Promise promise
//  ) {
//    module
//      .modelManagerDownloadRemoteModelIfNeeded(appName, language, Arguments.toBundle(downloadConditionsMap))
//      .addOnCompleteListener(task -> {
//        if (task.isSuccessful()) {
//          promise.resolve(task.getResult());
//        } else {
//          String[] errorCodeAndMessage = UniversalFirebaseMLNaturalLanguageCommon.getErrorCodeAndMessageFromException(
//            task.getException());
//          rejectPromiseWithCodeAndMessage(
//            promise,
//            errorCodeAndMessage[0],
//            errorCodeAndMessage[1],
//            errorCodeAndMessage[2]
//          );
//        }
//      });
//  }
//
//
//  @Override
//  public Map<String, Object> getConstants() {
//    return module.getConstants();
//  }
}
