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

import android.content.Context;
import android.os.Build;
import android.os.Bundle;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.ml.common.modeldownload.FirebaseModelDownloadConditions;
import com.google.firebase.ml.naturallanguage.FirebaseNaturalLanguage;
import com.google.firebase.ml.naturallanguage.translate.FirebaseTranslateLanguage;
import com.google.firebase.ml.naturallanguage.translate.FirebaseTranslateModelManager;
import com.google.firebase.ml.naturallanguage.translate.FirebaseTranslateRemoteModel;
import com.google.firebase.ml.naturallanguage.translate.FirebaseTranslator;
import com.google.firebase.ml.naturallanguage.translate.FirebaseTranslatorOptions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import io.invertase.firebase.common.UniversalFirebaseModule;

@SuppressWarnings("WeakerAccess")
class UniversalFirebaseMLNaturalLanguageTranslateModule extends UniversalFirebaseModule {
  UniversalFirebaseMLNaturalLanguageTranslateModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  /**
   * @url No reference documentation yet...
   */
  public Task<String> translate(String appName, String text, Bundle translationOptionsMap) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseNaturalLanguage naturalLanguage = FirebaseNaturalLanguage.getInstance(firebaseApp);
      FirebaseTranslatorOptions translatorOptions = getOptions(translationOptionsMap);
      FirebaseTranslator translator = naturalLanguage.getTranslator(translatorOptions);
      return Tasks.await(translator.translate(text));
    });
  }

  /**
   * @url No reference documentation yet...
   */
  public Task<List<Map<String, Object>>> modelManagerGetAvailableModels(String appName) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseTranslateModelManager translateModelManager = FirebaseTranslateModelManager.getInstance();
      Set<FirebaseTranslateRemoteModel> modelsRaw = Tasks.await(translateModelManager.getAvailableModels(
        firebaseApp));

      List<Map<String, Object>> modelsArray = new ArrayList<>(modelsRaw.size());
      for (FirebaseTranslateRemoteModel modelRaw : modelsRaw) {
        Map<String, Object> modelMap = new HashMap<>();
        modelMap.put("language", modelRaw.getLanguage());
        modelMap.put("languageCode", modelRaw.getLanguageCode());
        modelMap.put("backendModelName", modelRaw.getModelNameForBackend());
        modelMap.put("persistUniqueModelName", modelRaw.getUniqueModelNameForPersist());
        modelsArray.add(modelMap);
      }

      return modelsArray;
    });
  }

  /**
   * @url No reference documentation yet...
   */
  public Task<Void> modelManagerDeleteDownloadedModel(String appName, int language) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseTranslateModelManager translateModelManager = FirebaseTranslateModelManager.getInstance();
      FirebaseTranslateRemoteModel model = new FirebaseTranslateRemoteModel.Builder(language)
        .setFirebaseApp(firebaseApp)
        .build();
      Tasks.await(translateModelManager.deleteDownloadedModel(model));
      return null;
    });
  }

  /**
   * @url No reference documentation yet...
   */
  public Task<Void> modelManagerDownloadRemoteModel(
    String appName,
    int language,
    Bundle downloadConditionsBundle
  ) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseTranslateModelManager translateModelManager = FirebaseTranslateModelManager.getInstance();
      FirebaseModelDownloadConditions downloadConditions = getDownloadConditions(
        downloadConditionsBundle);
      FirebaseTranslateRemoteModel model = new FirebaseTranslateRemoteModel.Builder(language)
        .setDownloadConditions(downloadConditions)
        .setFirebaseApp(firebaseApp)
        .build();
      Tasks.await(translateModelManager.downloadRemoteModelIfNeeded(model));
      return null;
    });
  }

  private FirebaseModelDownloadConditions getDownloadConditions(Bundle downloadConditionsBundle) {
    FirebaseModelDownloadConditions.Builder conditionsBuilder = new FirebaseModelDownloadConditions.Builder();

    if (downloadConditionsBundle.containsKey("requireCharging") && downloadConditionsBundle.getBoolean(
      "requireCharging")) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        conditionsBuilder.requireCharging();
      }
    }

    if (downloadConditionsBundle.containsKey("requireDeviceIdle") && downloadConditionsBundle.getBoolean(
      "requireDeviceIdle")) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        conditionsBuilder.requireDeviceIdle();
      }
    }

    if (downloadConditionsBundle.containsKey("requireWifi") && downloadConditionsBundle.getBoolean(
      "requireWifi")) {
      conditionsBuilder.requireWifi();
    }

    return conditionsBuilder.build();
  }

  private FirebaseTranslatorOptions getOptions(Bundle translationOptionsBundle) {
    FirebaseTranslatorOptions.Builder optionsBuilder = new FirebaseTranslatorOptions.Builder();

    if (translationOptionsBundle.containsKey("sourceLanguage")) {
      optionsBuilder.setSourceLanguage((int) translationOptionsBundle.get("sourceLanguage"));
    } else {
      optionsBuilder.setSourceLanguage(FirebaseTranslateLanguage.EN);
    }

    if (translationOptionsBundle.containsKey("targetLanguage")) {
      optionsBuilder.setTargetLanguage((int) translationOptionsBundle.get("targetLanguage"));
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
    constantsMap.put("TRANSLATE_LANGUAGES", languagesMap);
    return constantsMap;
  }
}
