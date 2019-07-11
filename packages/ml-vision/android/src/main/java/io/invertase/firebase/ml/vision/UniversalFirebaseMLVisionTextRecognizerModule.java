package io.invertase.firebase.ml.vision;

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
import com.google.firebase.ml.vision.FirebaseVision;
import com.google.firebase.ml.vision.common.FirebaseVisionImage;
import com.google.firebase.ml.vision.text.FirebaseVisionCloudTextRecognizerOptions;
import com.google.firebase.ml.vision.text.FirebaseVisionText;
import com.google.firebase.ml.vision.text.FirebaseVisionTextRecognizer;
import com.google.firebase.ml.vision.text.RecognizedLanguage;
import io.invertase.firebase.common.SharedUtils;
import io.invertase.firebase.common.UniversalFirebaseModule;

import java.util.*;

import static io.invertase.firebase.ml.vision.UniversalFirebaseMLVisionCommon.*;

class UniversalFirebaseMLVisionTextRecognizerModule extends UniversalFirebaseModule {
  UniversalFirebaseMLVisionTextRecognizerModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Map<String, Object>> textRecognizerProcessImage(
    String appName,
    String stringUri
  ) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseVisionTextRecognizer detector = FirebaseVision.getInstance(firebaseApp)
        .getOnDeviceTextRecognizer();

      FirebaseVisionImage image = FirebaseVisionImage.fromFilePath(
        getContext(),
        SharedUtils.getUri(stringUri)
      );

      FirebaseVisionText result = Tasks.await(detector.processImage(image));
      return getFirebaseVisionTextMap(result);
    });
  }

  Task<Map<String, Object>> cloudTextRecognizerProcessImage(
    String appName,
    String stringUri,
    Bundle cloudTextRecognizerOptions
  ) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseVisionCloudTextRecognizerOptions options = getCloudTextRecognizerOptions(cloudTextRecognizerOptions);
      FirebaseVisionTextRecognizer detector = FirebaseVision.getInstance(firebaseApp)
        .getCloudTextRecognizer(options);

      FirebaseVisionImage image = FirebaseVisionImage.fromFilePath(
        getContext(),
        SharedUtils.getUri(stringUri)
      );

      FirebaseVisionText result = Tasks.await(detector.processImage(image));
      return getFirebaseVisionTextMap(result);
    });
  }

  private FirebaseVisionCloudTextRecognizerOptions getCloudTextRecognizerOptions(Bundle cloudTextRecognizerOptions) {
    FirebaseVisionCloudTextRecognizerOptions.Builder builder = new FirebaseVisionCloudTextRecognizerOptions.Builder();

    if (
      cloudTextRecognizerOptions.containsKey(KEY_ENFORCE_CERT_FINGERPRINT_MATCH) &&
        cloudTextRecognizerOptions.getBoolean(KEY_ENFORCE_CERT_FINGERPRINT_MATCH)
    ) {
      builder.enforceCertFingerprintMatch();
    }

    if (cloudTextRecognizerOptions.containsKey(KEY_MODEL_TYPE)) {
      int modelType = (int) cloudTextRecognizerOptions.getDouble(KEY_MODEL_TYPE);
      if (modelType == FirebaseVisionCloudTextRecognizerOptions.DENSE_MODEL) {
        builder.setModelType(FirebaseVisionCloudTextRecognizerOptions.DENSE_MODEL);
      } else if (modelType == FirebaseVisionCloudTextRecognizerOptions.SPARSE_MODEL) {
        builder.setModelType(FirebaseVisionCloudTextRecognizerOptions.SPARSE_MODEL);
      }
    }

    if (cloudTextRecognizerOptions.containsKey(KEY_HINTED_LANGUAGES)) {
      builder.setLanguageHints(Objects.requireNonNull(cloudTextRecognizerOptions.getStringArrayList(KEY_HINTED_LANGUAGES)));
    }

    return builder.build();
  }

//  Task<Map<String, Object>> cloudDocumentTextRecognizerProcessImage(
//    String appName,
//    String stringUri,
//    Bundle cloudDocumentTextRecognizerOptions
//    ) {
//    return Tasks.call(getExecutor(), () -> {
//      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
//      FirebaseVisionDocumentTextRecognizer detector = FirebaseVision.getInstance(firebaseApp)
//        .getCloudDocumentTextRecognizer();
//
//      FirebaseVisionImage image = FirebaseVisionImage.fromFilePath(
//        getContext(),
//        SharedUtils.getUri(stringUri)
//      );
//
//      FirebaseVisionDocumentText result = Tasks.await(detector.processImage(image));
//
//      return getFirebaseVisionTextMap(result);
//    });
//  }

  private Map<String, Object> getFirebaseVisionTextMap(FirebaseVisionText visionText) {
    Map<String, Object> firebaseVisionTextMap = new HashMap<>(2);
    firebaseVisionTextMap.put(KEY_TEXT, visionText.getText());
    firebaseVisionTextMap.put(KEY_TEXT_BLOCKS, getVisionTextBlocksList(visionText.getTextBlocks()));
    return firebaseVisionTextMap;
  }

  private List<Map<String, Object>> getVisionTextBlocksList(List<FirebaseVisionText.TextBlock> textBlocks) {
    List<Map<String, Object>> textBlocksFormattedList = new ArrayList<>(textBlocks.size());

    for (FirebaseVisionText.TextBlock textBlockRaw : textBlocks) {
      Map<String, Object> textBlockFormatted = new HashMap<>(6);

      textBlockFormatted.put(
        KEY_BOUNDING_BOX,
        SharedUtils.rectToIntArray(textBlockRaw.getBoundingBox())
      );
      textBlockFormatted.put(KEY_TEXT, textBlockRaw.getText());
      //noinspection ConstantConditions
      textBlockFormatted.put(KEY_CONFIDENCE, textBlockRaw.getConfidence());
      textBlockFormatted.put(
        KEY_CORNER_POINTS,
        SharedUtils.pointsToIntsList(textBlockRaw.getCornerPoints())
      );
      textBlockFormatted.put(
        KEY_RECOGNIZED_LANGUAGES,
        getRecognizedLanguagesList(textBlockRaw.getRecognizedLanguages())
      );

      textBlockFormatted.put(KEY_LINES, getLinesList(textBlockRaw.getLines()));
      textBlocksFormattedList.add(textBlockFormatted);
    }

    return textBlocksFormattedList;
  }

  private List<Map<String, Object>> getLinesList(List<FirebaseVisionText.Line> lineList) {
    List<Map<String, Object>> linesListFormatted = new ArrayList<>(lineList.size());

    for (FirebaseVisionText.Line lineRaw : lineList) {
      Map<String, Object> lineFormatted = new HashMap<>(6);

      lineFormatted.put(KEY_BOUNDING_BOX, SharedUtils.rectToIntArray(lineRaw.getBoundingBox()));
      lineFormatted.put(KEY_TEXT, lineRaw.getText());
      //noinspection ConstantConditions
      lineFormatted.put(KEY_CONFIDENCE, lineRaw.getConfidence());
      lineFormatted.put(KEY_CORNER_POINTS, SharedUtils.pointsToIntsList(lineRaw.getCornerPoints()));
      lineFormatted.put(
        KEY_RECOGNIZED_LANGUAGES,
        getRecognizedLanguagesList(lineRaw.getRecognizedLanguages())
      );
      lineFormatted.put(KEY_ELEMENTS, getElementsList(lineRaw.getElements()));
      linesListFormatted.add(lineFormatted);
    }

    return linesListFormatted;
  }

  private List<Map<String, Object>> getElementsList(List<FirebaseVisionText.Element> elementList) {
    List<Map<String, Object>> elementsListFormatted = new ArrayList<>(elementList.size());

    for (FirebaseVisionText.Element elementRaw : elementList) {
      Map<String, Object> elementFormatted = new HashMap<>(5);

      elementFormatted.put(KEY_TEXT, elementRaw.getText());
      //noinspection ConstantConditions
      elementFormatted.put(KEY_CONFIDENCE, elementRaw.getConfidence());
      elementFormatted.put(KEY_BOUNDING_BOX, SharedUtils.rectToIntArray(elementRaw.getBoundingBox()));
      elementFormatted.put(
        KEY_CORNER_POINTS,
        SharedUtils.pointsToIntsList(elementRaw.getCornerPoints())
      );
      elementFormatted.put(
        KEY_RECOGNIZED_LANGUAGES,
        getRecognizedLanguagesList(elementRaw.getRecognizedLanguages())
      );
      elementsListFormatted.add(elementFormatted);
    }

    return elementsListFormatted;
  }

  private List<String> getRecognizedLanguagesList(List<RecognizedLanguage> recognizedLanguages) {
    List<String> recognizedLanguagesFormatted = new ArrayList<>(recognizedLanguages.size());

    for (RecognizedLanguage recognizedLanguage : recognizedLanguages) {
      recognizedLanguagesFormatted.add(recognizedLanguage.getLanguageCode());
    }

    return recognizedLanguagesFormatted;
  }

}
