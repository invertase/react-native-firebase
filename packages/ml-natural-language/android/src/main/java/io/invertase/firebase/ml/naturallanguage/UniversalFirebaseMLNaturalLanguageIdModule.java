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
import android.os.Bundle;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.ml.naturallanguage.FirebaseNaturalLanguage;
import com.google.firebase.ml.naturallanguage.languageid.FirebaseLanguageIdentification;
import com.google.firebase.ml.naturallanguage.languageid.FirebaseLanguageIdentificationOptions;
import com.google.firebase.ml.naturallanguage.languageid.IdentifiedLanguage;
import com.google.firebase.ml.naturallanguage.translate.FirebaseTranslateLanguage;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.invertase.firebase.common.UniversalFirebaseModule;

@SuppressWarnings("WeakerAccess")
class UniversalFirebaseMLNaturalLanguageIdModule extends UniversalFirebaseModule {

  UniversalFirebaseMLNaturalLanguageIdModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/languageid/FirebaseLanguageIdentification.html#identifyLanguage(java.lang.String)
   */
  public Task<String> identifyLanguage(
    String appName,
    String text,
    Bundle identificationOptionsBundle
  ) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseNaturalLanguage naturalLanguage = FirebaseNaturalLanguage.getInstance(firebaseApp);

      FirebaseLanguageIdentificationOptions identificationOptions = getOptions(
        identificationOptionsBundle,
        true
      );

      FirebaseLanguageIdentification languageIdentification = naturalLanguage.getLanguageIdentification(
        identificationOptions);

      return Tasks.await(languageIdentification.identifyLanguage(text));
    });
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/languageid/FirebaseLanguageIdentification.html#identifyPossibleLanguages(java.lang.String)
   */
  public Task<List<Bundle>> identifyPossibleLanguages(
    String appName,
    String text,
    Bundle identificationOptionsBundle
  ) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseNaturalLanguage naturalLanguage = FirebaseNaturalLanguage.getInstance(firebaseApp);
      FirebaseLanguageIdentificationOptions identificationOptions = getOptions(
        identificationOptionsBundle,
        false
      );
      FirebaseLanguageIdentification languageIdentification = naturalLanguage.getLanguageIdentification(
        identificationOptions);

      List<IdentifiedLanguage> languagesRaw = Tasks.await(languageIdentification.identifyPossibleLanguages(
        text));

      List<Bundle> formattedLanguages = new ArrayList<>(languagesRaw.size());


      for (IdentifiedLanguage identifiedLanguage : languagesRaw) {
        Bundle formattedLanguage = new Bundle(2);
        formattedLanguage.putString("language", identifiedLanguage.getLanguageCode());
        formattedLanguage.putFloat("confidence", identifiedLanguage.getConfidence());
        formattedLanguages.add(formattedLanguage);
      }

      return formattedLanguages;
    });

  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/languageid/FirebaseLanguageIdentificationOptions.html
   */
  private FirebaseLanguageIdentificationOptions getOptions(
    Bundle identificationOptionsBundle,
    boolean singleLanguage
  ) {
    FirebaseLanguageIdentificationOptions.Builder optionsBuilder = new FirebaseLanguageIdentificationOptions.Builder();

    if (identificationOptionsBundle.containsKey("confidenceThreshold")) {
      optionsBuilder.setConfidenceThreshold((float) identificationOptionsBundle.getDouble(
        "confidenceThreshold"));
    } else {
      if (singleLanguage) {
        optionsBuilder.setConfidenceThreshold(FirebaseLanguageIdentification.DEFAULT_IDENTIFY_LANGUAGE_CONFIDENCE_THRESHOLD);
      } else {
        optionsBuilder.setConfidenceThreshold(FirebaseLanguageIdentification.DEFAULT_IDENTIFY_POSSIBLE_LANGUAGES_CONFIDENCE_THRESHOLD);
      }
    }

    return optionsBuilder.build();
  }
}
