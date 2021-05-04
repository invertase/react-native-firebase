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


import android.content.Context;
import android.os.Bundle;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.ml.vision.FirebaseVision;
import com.google.firebase.ml.vision.common.FirebaseVisionImage;
import com.google.firebase.ml.vision.label.FirebaseVisionCloudImageLabelerOptions;
import com.google.firebase.ml.vision.label.FirebaseVisionImageLabel;
import com.google.firebase.ml.vision.label.FirebaseVisionImageLabeler;
import com.google.firebase.ml.vision.label.FirebaseVisionOnDeviceImageLabelerOptions;
import io.invertase.firebase.common.SharedUtils;
import io.invertase.firebase.common.UniversalFirebaseModule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.invertase.firebase.ml.UniversalFirebaseMLCommon.*;

class UniversalFirebaseMLImageLabelerModule extends UniversalFirebaseModule {
  UniversalFirebaseMLImageLabelerModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<List<Map<String, Object>>> cloudImageLabelerProcessImage(String appName, String stringUri, Bundle cloudImageLabelerOptions) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseVisionCloudImageLabelerOptions options = getCloudImageLabelerOptions(cloudImageLabelerOptions);
      FirebaseVisionImageLabeler visionImageLabeler = FirebaseVision.getInstance(firebaseApp)
        .getCloudImageLabeler(options);

      FirebaseVisionImage image = FirebaseVisionImage.fromFilePath(
        getContext(),
        SharedUtils.getUri(stringUri)
      );

      return processLabelerList(
        Tasks.await(visionImageLabeler.processImage(image))
      );
    });
  }

  private List<Map<String, Object>> processLabelerList(List<FirebaseVisionImageLabel> visionImageLabels) {
    List<Map<String, Object>> visionLabelsFormatted = new ArrayList<>(visionImageLabels.size());

    for (FirebaseVisionImageLabel visionImageLabel : visionImageLabels) {
      Map<String, Object> visionImageLabelFormatted = new HashMap<>();

      visionImageLabelFormatted.put(KEY_CONFIDENCE, visionImageLabel.getConfidence());
      visionImageLabelFormatted.put(KEY_ENTITY_ID, visionImageLabel.getEntityId());
      visionImageLabelFormatted.put(KEY_TEXT, visionImageLabel.getText());

      visionLabelsFormatted.add(visionImageLabelFormatted);
    }

    return visionLabelsFormatted;
  }

  private FirebaseVisionOnDeviceImageLabelerOptions getOnDeviceImageLabelerOptions(Bundle imageLabelerOptionsBundle) {
    FirebaseVisionOnDeviceImageLabelerOptions.Builder builder = new FirebaseVisionOnDeviceImageLabelerOptions.Builder();

    if (imageLabelerOptionsBundle.containsKey(KEY_CONFIDENCE_THRESHOLD)) {
      builder.setConfidenceThreshold(imageLabelerOptionsBundle.getFloat(KEY_CONFIDENCE_THRESHOLD));
    }

    return builder.build();
  }

  private FirebaseVisionCloudImageLabelerOptions getCloudImageLabelerOptions(Bundle cloudImageLabelerOptionsBundle) {
    FirebaseVisionCloudImageLabelerOptions.Builder builder = new FirebaseVisionCloudImageLabelerOptions.Builder();

    if (
      cloudImageLabelerOptionsBundle.containsKey(KEY_ENFORCE_CERT_FINGERPRINT_MATCH) &&
        cloudImageLabelerOptionsBundle.getBoolean(KEY_ENFORCE_CERT_FINGERPRINT_MATCH)
    ) {
      builder.enforceCertFingerprintMatch();
    }

    builder.setConfidenceThreshold(cloudImageLabelerOptionsBundle.getFloat(KEY_CONFIDENCE_THRESHOLD, (float) 0.5));

    return builder.build();
  }
}
