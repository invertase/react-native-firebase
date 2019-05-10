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
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.FirebaseApp;
import com.google.firebase.ml.common.modeldownload.FirebaseModelDownloadConditions;
import com.google.firebase.ml.naturallanguage.FirebaseNaturalLanguage;
import com.google.firebase.ml.naturallanguage.translate.FirebaseTranslateLanguage;
import com.google.firebase.ml.naturallanguage.translate.FirebaseTranslateModelManager;
import com.google.firebase.ml.naturallanguage.translate.FirebaseTranslateRemoteModel;
import com.google.firebase.ml.naturallanguage.translate.FirebaseTranslator;
import com.google.firebase.ml.naturallanguage.translate.FirebaseTranslatorOptions;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

class RNFirebaseMLNaturalLanguageTranslateModule extends ReactNativeFirebaseModule {
  private static final String TAG = "MLNaturalLanguageTranslate";

  RNFirebaseMLNaturalLanguageTranslateModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  /**
   * @url No reference documentation yet...
   */
  @ReactMethod
  public void translate(String appName, String text, ReadableMap translationOptionsMap, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseNaturalLanguage naturalLanguage = FirebaseNaturalLanguage.getInstance(firebaseApp);
    FirebaseTranslatorOptions translatorOptions = getOptions(translationOptionsMap);
    FirebaseTranslator translator = naturalLanguage.getTranslator(translatorOptions);

    translator.translate(text).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(task.getResult());
      } else {
        String[] errorCodeAndMessage = RNFirebaseMLNaturalLanguageCommon.getErrorCodeAndMessageFromException(task.getException());
        rejectPromiseWithCodeAndMessage(promise, errorCodeAndMessage[0], errorCodeAndMessage[1], errorCodeAndMessage[2]);
      }
    });
  }

  /**
   * @url No reference documentation yet...
   */
  @ReactMethod
  public void modelManagerGetAvailableModels(String appName, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseTranslateModelManager translateModelManager = FirebaseTranslateModelManager.getInstance();

    translateModelManager.getAvailableModels(firebaseApp)
      .continueWith(task -> {
        WritableArray modelsArray = Arguments.createArray();
        Set<FirebaseTranslateRemoteModel> modelsRaw = Objects.requireNonNull(task.getResult());
        for (FirebaseTranslateRemoteModel modelRaw : modelsRaw) {
          WritableMap modelMap = Arguments.createMap();
          modelMap.putInt("language", modelRaw.getLanguage());
          modelMap.putString("languageCode", modelRaw.getLanguageCode());
          modelMap.putString("backendModelName", modelRaw.getModelNameForBackend());
          modelMap.putString("persistUniqueModelName", modelRaw.getUniqueModelNameForPersist());
          modelsArray.pushMap(modelMap);
        }
        return modelsArray;
      })
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          String[] errorCodeAndMessage = RNFirebaseMLNaturalLanguageCommon.getErrorCodeAndMessageFromException(task.getException());
          rejectPromiseWithCodeAndMessage(promise, errorCodeAndMessage[0], errorCodeAndMessage[1], errorCodeAndMessage[2]);
        }
      });
  }

  /**
   * @url No reference documentation yet...
   */
  @ReactMethod
  public void modelManagerDeleteDownloadedModel(String appName, int language, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseTranslateModelManager translateModelManager = FirebaseTranslateModelManager.getInstance();
    FirebaseTranslateRemoteModel model = new FirebaseTranslateRemoteModel.Builder(language).setFirebaseApp(firebaseApp).build();
    translateModelManager.deleteDownloadedModel(model).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(null);
      } else {
        String[] errorCodeAndMessage = RNFirebaseMLNaturalLanguageCommon.getErrorCodeAndMessageFromException(task.getException());
        rejectPromiseWithCodeAndMessage(promise, errorCodeAndMessage[0], errorCodeAndMessage[1], errorCodeAndMessage[2]);
      }
    });
  }

  /**
   * @url No reference documentation yet...
   */
  @ReactMethod
  public void modelManagerDownloadRemoteModel(String appName, int language, ReadableMap downloadConditionsMap, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseTranslateModelManager translateModelManager = FirebaseTranslateModelManager.getInstance();
    FirebaseModelDownloadConditions downloadConditions = getDownloadConditions(downloadConditionsMap);
    FirebaseTranslateRemoteModel model = new FirebaseTranslateRemoteModel.Builder(language).setDownloadConditions(downloadConditions).setFirebaseApp(firebaseApp).build();
    translateModelManager.downloadRemoteModelIfNeeded(model).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(null);
      } else {
        String[] errorCodeAndMessage = RNFirebaseMLNaturalLanguageCommon.getErrorCodeAndMessageFromException(task.getException());
        rejectPromiseWithCodeAndMessage(promise, errorCodeAndMessage[0], errorCodeAndMessage[1], errorCodeAndMessage[2]);
      }
    });
  }

  private FirebaseModelDownloadConditions getDownloadConditions(ReadableMap downloadConditionsMap) {
    FirebaseModelDownloadConditions.Builder conditionsBuilder = new FirebaseModelDownloadConditions.Builder();

    if (downloadConditionsMap.hasKey("requireCharging") && downloadConditionsMap.getBoolean("requireCharging")) {
      conditionsBuilder.requireCharging();
    }

    if (downloadConditionsMap.hasKey("requireDeviceIdle") && downloadConditionsMap.getBoolean("requireDeviceIdle")) {
      conditionsBuilder.requireDeviceIdle();
    }

    if (downloadConditionsMap.hasKey("requireWifi") && downloadConditionsMap.getBoolean("requireWifi")) {
      conditionsBuilder.requireWifi();
    }

    return conditionsBuilder.build();
  }

  private FirebaseTranslatorOptions getOptions(ReadableMap translationOptionsMap) {
    FirebaseTranslatorOptions.Builder optionsBuilder = new FirebaseTranslatorOptions.Builder();

    if (translationOptionsMap.hasKey("sourceLanguage")) {
      optionsBuilder.setSourceLanguage(translationOptionsMap.getInt("sourceLanguage"));
    } else {
      optionsBuilder.setSourceLanguage(FirebaseTranslateLanguage.EN);
    }

    if (translationOptionsMap.hasKey("targetLanguage")) {
      optionsBuilder.setTargetLanguage(translationOptionsMap.getInt("targetLanguage"));
    } else {
      optionsBuilder.setTargetLanguage(FirebaseTranslateLanguage.EN);
    }

    return optionsBuilder.build();
  }

  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constantsMap = new HashMap<>();
    Map<String, Object> languagesMap = new HashMap<>();
    Set<Integer> languages = FirebaseTranslateLanguage.getAllLanguages();
    for (Integer language : languages) {
      languagesMap.put(FirebaseTranslateLanguage.languageCodeForLanguage(language), language);
    }
    constantsMap.put("LANGUAGES", languagesMap);
    return constantsMap;
  }
}
