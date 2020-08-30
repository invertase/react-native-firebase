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
import com.google.firebase.ml.vision.document.FirebaseVisionCloudDocumentRecognizerOptions;
import com.google.firebase.ml.vision.document.FirebaseVisionDocumentText;
import com.google.firebase.ml.vision.document.FirebaseVisionDocumentTextRecognizer;
import com.google.firebase.ml.vision.text.RecognizedLanguage;
import io.invertase.firebase.common.SharedUtils;
import io.invertase.firebase.common.UniversalFirebaseModule;

import javax.annotation.Nullable;
import java.util.*;

import static io.invertase.firebase.ml.vision.UniversalFirebaseMLVisionCommon.*;

class UniversalFirebaseMLVisionDocumentTextRecognizerModule extends UniversalFirebaseModule {
  UniversalFirebaseMLVisionDocumentTextRecognizerModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Map<String, Object>> cloudDocumentTextRecognizerProcessImage(
    String appName,
    String stringUri,
    Bundle cloudDocumentTextRecognizerOptions
  ) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseVisionCloudDocumentRecognizerOptions options = getCloudDocumentTextRecognizerOptions(cloudDocumentTextRecognizerOptions);
      FirebaseVisionDocumentTextRecognizer detector = FirebaseVision.getInstance(firebaseApp)
        .getCloudDocumentTextRecognizer(options);

      FirebaseVisionImage image = FirebaseVisionImage.fromFilePath(
        getContext(),
        SharedUtils.getUri(stringUri)
      );

      FirebaseVisionDocumentText result = Tasks.await(detector.processImage(image));
      return getFirebaseVisionDocumentTextMap(result);
    });
  }

  private FirebaseVisionCloudDocumentRecognizerOptions getCloudDocumentTextRecognizerOptions(Bundle cloudDocumentTextRecognizerOptions) {
    FirebaseVisionCloudDocumentRecognizerOptions.Builder builder = new FirebaseVisionCloudDocumentRecognizerOptions.Builder();

    if (
      cloudDocumentTextRecognizerOptions.containsKey(KEY_ENFORCE_CERT_FINGERPRINT_MATCH) &&
        cloudDocumentTextRecognizerOptions.getBoolean(KEY_ENFORCE_CERT_FINGERPRINT_MATCH)
    ) {
      builder.enforceCertFingerprintMatch();
    }

    if (cloudDocumentTextRecognizerOptions.containsKey(KEY_HINTED_LANGUAGES)) {
      builder.setLanguageHints(Objects.requireNonNull(cloudDocumentTextRecognizerOptions.getStringArrayList(KEY_HINTED_LANGUAGES)));
    }

    return builder.build();
  }


  private Map<String, Object> getFirebaseVisionDocumentTextMap(FirebaseVisionDocumentText visionText) {
    Map<String, Object> firebaseVisionTextMap = new HashMap<>(2);
    firebaseVisionTextMap.put(KEY_TEXT, visionText.getText());
    firebaseVisionTextMap.put(KEY_TEXT_BLOCKS, getVisionDocumentTextBlocksList(visionText.getBlocks()));
    return firebaseVisionTextMap;
  }

  private List<Map<String, Object>> getVisionDocumentTextBlocksList(List<FirebaseVisionDocumentText.Block> documentTextBlocks) {
    List<Map<String, Object>> documentTextBlocksFormattedList = new ArrayList<>(documentTextBlocks.size());

    for (FirebaseVisionDocumentText.Block documentTextBlockRaw : documentTextBlocks) {
      Map<String, Object> documentTextBlockFormatted = new HashMap<>(6);

      // DocumentTextBase properties
      documentTextBlockFormatted.put(
        KEY_BOUNDING_BOX,
        SharedUtils.rectToIntArray(documentTextBlockRaw.getBoundingBox())
      );
      documentTextBlockFormatted.put(KEY_TEXT, documentTextBlockRaw.getText());
      documentTextBlockFormatted.put(KEY_CONFIDENCE, documentTextBlockRaw.getConfidence());
      documentTextBlockFormatted.put(
        KEY_RECOGNIZED_LANGUAGES,
        getRecognizedLanguagesList(documentTextBlockRaw.getRecognizedLanguages())
      );
      documentTextBlockFormatted.put(KEY_RECOGNIZED_BREAK, getRecognizedBreakMap(documentTextBlockRaw.getRecognizedBreak()));

      // Block specific properties
      documentTextBlockFormatted.put(KEY_PARAGRAPHS, getParagraphsList(documentTextBlockRaw.getParagraphs()));
      documentTextBlocksFormattedList.add(documentTextBlockFormatted);
    }

    return documentTextBlocksFormattedList;
  }

  private List<Map<String, Object>> getParagraphsList(List<FirebaseVisionDocumentText.Paragraph> paragraphListRaw) {
    List<Map<String, Object>> paragraphListFormatted = new ArrayList<>(paragraphListRaw.size());
    for (FirebaseVisionDocumentText.Paragraph paragraphRaw : paragraphListRaw) {
      paragraphListFormatted.add(getParagraphMap(paragraphRaw));
    }
    return paragraphListFormatted;
  }

  private Map<String, Object> getParagraphMap(FirebaseVisionDocumentText.Paragraph paragraphRaw) {
    Map<String, Object> paragraphFormatted = new HashMap<>(6);

    // DocumentTextBase properties
    paragraphFormatted.put(
      KEY_BOUNDING_BOX,
      SharedUtils.rectToIntArray(paragraphRaw.getBoundingBox())
    );
    paragraphFormatted.put(KEY_TEXT, paragraphRaw.getText());
    paragraphFormatted.put(KEY_CONFIDENCE, paragraphRaw.getConfidence());
    paragraphFormatted.put(
      KEY_RECOGNIZED_LANGUAGES,
      getRecognizedLanguagesList(paragraphRaw.getRecognizedLanguages())
    );
    paragraphFormatted.put(KEY_RECOGNIZED_BREAK, getRecognizedBreakMap(paragraphRaw.getRecognizedBreak()));

    // Paragraph specific properties
    paragraphFormatted.put(KEY_WORDS, getWordsList(paragraphRaw.getWords()));

    return paragraphFormatted;
  }

  private List<Map<String, Object>> getWordsList(List<FirebaseVisionDocumentText.Word> wordListRaw) {
    List<Map<String, Object>> wordListFormatted = new ArrayList<>(wordListRaw.size());
    for (FirebaseVisionDocumentText.Word wordRaw : wordListRaw) {
      wordListFormatted.add(getWordMap(wordRaw));
    }
    return wordListFormatted;
  }

  private Map<String, Object> getWordMap(FirebaseVisionDocumentText.Word wordRaw) {
    Map<String, Object> wordFormatted = new HashMap<>(6);

    // DocumentTextBase properties
    wordFormatted.put(
      KEY_BOUNDING_BOX,
      SharedUtils.rectToIntArray(wordRaw.getBoundingBox())
    );
    wordFormatted.put(KEY_TEXT, wordRaw.getText());
    wordFormatted.put(KEY_CONFIDENCE, wordRaw.getConfidence());
    wordFormatted.put(
      KEY_RECOGNIZED_LANGUAGES,
      getRecognizedLanguagesList(wordRaw.getRecognizedLanguages())
    );
    wordFormatted.put(KEY_RECOGNIZED_BREAK, getRecognizedBreakMap(wordRaw.getRecognizedBreak()));

    // Word specific properties
    wordFormatted.put(KEY_SYMBOLS, getSymbolsList(wordRaw.getSymbols()));

    return wordFormatted;
  }

  private List<Map<String, Object>> getSymbolsList(List<FirebaseVisionDocumentText.Symbol> symbolListRaw) {
    List<Map<String, Object>> symbolListFormatted = new ArrayList<>(symbolListRaw.size());
    for (FirebaseVisionDocumentText.Symbol symbolRaw : symbolListRaw) {
      symbolListFormatted.add(getSymbolMap(symbolRaw));
    }
    return symbolListFormatted;
  }

  private Map<String, Object> getSymbolMap(FirebaseVisionDocumentText.Symbol symbolRaw) {
    Map<String, Object> symbolFormatted = new HashMap<>(5);

    // DocumentTextBase properties
    symbolFormatted.put(
      KEY_BOUNDING_BOX,
      SharedUtils.rectToIntArray(symbolRaw.getBoundingBox())
    );
    symbolFormatted.put(KEY_TEXT, symbolRaw.getText());
    symbolFormatted.put(KEY_CONFIDENCE, symbolRaw.getConfidence());
    symbolFormatted.put(
      KEY_RECOGNIZED_LANGUAGES,
      getRecognizedLanguagesList(symbolRaw.getRecognizedLanguages())
    );
    symbolFormatted.put(KEY_RECOGNIZED_BREAK, getRecognizedBreakMap(symbolRaw.getRecognizedBreak()));

    // Symbol specific properties
    // NONE

    return symbolFormatted;
  }

  private Map<String, Object> getRecognizedBreakMap(@Nullable FirebaseVisionDocumentText.RecognizedBreak recognizedBreakRaw) {
    if (recognizedBreakRaw == null) return null;
    Map<String, Object> recognizedBreakFormatted = new HashMap<>(2);
    recognizedBreakFormatted.put("breakType", recognizedBreakRaw.getDetectedBreakType());
    recognizedBreakFormatted.put("isPrefix", recognizedBreakRaw.getIsPrefix());
    return recognizedBreakFormatted;
  }

  private List<String> getRecognizedLanguagesList(List<RecognizedLanguage> recognizedLanguages) {
    List<String> recognizedLanguagesFormatted = new ArrayList<>(recognizedLanguages.size());

    for (RecognizedLanguage recognizedLanguage : recognizedLanguages) {
      recognizedLanguagesFormatted.add(recognizedLanguage.getLanguageCode());
    }

    return recognizedLanguagesFormatted;
  }

}
