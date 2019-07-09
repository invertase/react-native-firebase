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

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.ml.vision.FirebaseVision;
import com.google.firebase.ml.vision.common.FirebaseVisionImage;
import com.google.firebase.ml.vision.text.FirebaseVisionText;
import com.google.firebase.ml.vision.text.FirebaseVisionTextRecognizer;
import com.google.firebase.ml.vision.text.RecognizedLanguage;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.invertase.firebase.common.SharedUtils;
import io.invertase.firebase.common.UniversalFirebaseModule;

public class UniversalFirebaseMLVisionTextModule extends UniversalFirebaseModule {

  UniversalFirebaseMLVisionTextModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  public Task<Map<String, Object>> processImageLocal(
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

  private Map<String, Object> getFirebaseVisionTextMap(FirebaseVisionText visionText) {
    Map<String, Object> firebaseVisionTextMap = new HashMap<>(2);
    firebaseVisionTextMap.put("text", visionText.getText());
    firebaseVisionTextMap.put("textBlocks", getVisionTextBlocksList(visionText.getTextBlocks()));
    return firebaseVisionTextMap;
  }

  private List<Map<String, Object>> getVisionTextBlocksList(List<FirebaseVisionText.TextBlock> textBlocks) {
    List<Map<String, Object>> textBlocksFormattedList = new ArrayList<>(textBlocks.size());

    for (FirebaseVisionText.TextBlock textBlockRaw : textBlocks) {
      Map<String, Object> textBlockFormatted = new HashMap<>(6);
      textBlockFormatted.put(
        "boundingBox",
        SharedUtils.rectToIntArray(textBlockRaw.getBoundingBox())
      );
      textBlockFormatted.put("text", textBlockRaw.getText());

      //noinspection ConstantConditions
      textBlockFormatted.put("confidence", textBlockRaw.getConfidence());
      textBlockFormatted.put(
        "cornerPoints",
        SharedUtils.pointsToIntsList(textBlockRaw.getCornerPoints())
      );
      textBlockFormatted.put(
        "recognizedLanguages",
        getRecognizedLanguagesList(textBlockRaw.getRecognizedLanguages())
      );
      textBlockFormatted.put("lines", getLinesList(textBlockRaw.getLines()));

      textBlocksFormattedList.add(textBlockFormatted);
    }

    return textBlocksFormattedList;
  }

  private List<Map<String, Object>> getLinesList(List<FirebaseVisionText.Line> lineList) {
    List<Map<String, Object>> linesListFormatted = new ArrayList<>(lineList.size());

    for (FirebaseVisionText.Line lineRaw : lineList) {
      Map<String, Object> lineFormatted = new HashMap<>(6);

      lineFormatted.put("boundingBox", SharedUtils.rectToIntArray(lineRaw.getBoundingBox()));
      lineFormatted.put("text", lineRaw.getText());

      //noinspection ConstantConditions
      lineFormatted.put("confidence", lineRaw.getConfidence());
      lineFormatted.put("cornerPoints", SharedUtils.pointsToIntsList(lineRaw.getCornerPoints()));
      lineFormatted.put(
        "recognizedLanguages",
        getRecognizedLanguagesList(lineRaw.getRecognizedLanguages())
      );
      lineFormatted.put("elements", getElementsList(lineRaw.getElements()));
      linesListFormatted.add(lineFormatted);
    }

    return linesListFormatted;
  }

  private List<Map<String, Object>> getElementsList(List<FirebaseVisionText.Element> elementList) {
    List<Map<String, Object>> elementsListFormatted = new ArrayList<>(elementList.size());

    for (FirebaseVisionText.Element elementRaw : elementList) {
      Map<String, Object> elementFormatted = new HashMap<>(5);

      elementFormatted.put("text", elementRaw.getText());
      //noinspection ConstantConditions
      elementFormatted.put("confidence", elementRaw.getConfidence());
      elementFormatted.put("boundingBox", SharedUtils.rectToIntArray(elementRaw.getBoundingBox()));
      elementFormatted.put(
        "cornerPoints",
        SharedUtils.pointsToIntsList(elementRaw.getCornerPoints())
      );
      elementFormatted.put(
        "recognizedLanguages",
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