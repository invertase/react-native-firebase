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
import com.google.firebase.ml.vision.cloud.FirebaseVisionCloudDetectorOptions;
import com.google.firebase.ml.vision.cloud.landmark.FirebaseVisionCloudLandmark;
import com.google.firebase.ml.vision.cloud.landmark.FirebaseVisionCloudLandmarkDetector;
import com.google.firebase.ml.vision.common.FirebaseVisionImage;
import com.google.firebase.ml.vision.common.FirebaseVisionLatLng;
import io.invertase.firebase.common.SharedUtils;
import io.invertase.firebase.common.UniversalFirebaseModule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.invertase.firebase.ml.vision.UniversalFirebaseMLVisionCommon.*;

class UniversalFirebaseMLVisionLandmarkRecognizerModule extends UniversalFirebaseModule {
  UniversalFirebaseMLVisionLandmarkRecognizerModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<List<Map<String, Object>>> cloudLandmarkRecognizerProcessImage(String appName, String stringUri, Bundle cloudLandmarkRecognizerOptions) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseVisionCloudDetectorOptions options = getCloudLandMarkRecognizerOptions(cloudLandmarkRecognizerOptions);
      FirebaseVisionCloudLandmarkDetector visionCloudLandmarkDetector = FirebaseVision.getInstance(firebaseApp)
        .getVisionCloudLandmarkDetector(options);
      FirebaseVisionImage image = FirebaseVisionImage.fromFilePath(
        getContext(),
        SharedUtils.getUri(stringUri)
      );

      List<FirebaseVisionCloudLandmark> visionCloudLandmarksRaw = Tasks.await(visionCloudLandmarkDetector.detectInImage(image));
      List<Map<String, Object>> visionCloudLandmarksFormatted = new ArrayList<>(visionCloudLandmarksRaw.size());

      for (FirebaseVisionCloudLandmark cloudLandmark : visionCloudLandmarksRaw) {
        Map<String, Object> visionLandmark = new HashMap<>();

        visionLandmark.put(KEY_CONFIDENCE, cloudLandmark.getConfidence());
        visionLandmark.put(KEY_ENTITY_ID, cloudLandmark.getEntityId());
        visionLandmark.put(KEY_LANDMARK, cloudLandmark.getLandmark());

        visionLandmark.put(
          KEY_BOUNDING_BOX,
          SharedUtils.rectToIntArray(cloudLandmark.getBoundingBox())
        );

        List<List<Double>> visionLandmarkLocations = new ArrayList<>(cloudLandmark.getLocations().size());

        for (FirebaseVisionLatLng location : cloudLandmark.getLocations()) {
          List<Double> latLng = new ArrayList<>(2);
          latLng.add(location.getLatitude());
          latLng.add(location.getLongitude());
          visionLandmarkLocations.add(latLng);
        }

        visionLandmark.put(KEY_LOCATIONS, visionLandmarkLocations);

        visionCloudLandmarksFormatted.add(visionLandmark);
      }

      return visionCloudLandmarksFormatted;
    });
  }

  private FirebaseVisionCloudDetectorOptions getCloudLandMarkRecognizerOptions(Bundle cloudLandmarkRecognizerOptionsBundle) {
    FirebaseVisionCloudDetectorOptions.Builder builder = new FirebaseVisionCloudDetectorOptions.Builder();

    if (
      cloudLandmarkRecognizerOptionsBundle.containsKey(KEY_ENFORCE_CERT_FINGERPRINT_MATCH) &&
        cloudLandmarkRecognizerOptionsBundle.getBoolean(KEY_ENFORCE_CERT_FINGERPRINT_MATCH)) {
      builder.enforceCertFingerprintMatch();
    }

    if (cloudLandmarkRecognizerOptionsBundle.containsKey(KEY_MAX_RESULTS)) {
      int maxResults = (int) cloudLandmarkRecognizerOptionsBundle.getDouble(KEY_MAX_RESULTS);
      builder.setMaxResults(maxResults);
    }

    if (cloudLandmarkRecognizerOptionsBundle.containsKey(KEY_MODEL)) {
      int model = (int) cloudLandmarkRecognizerOptionsBundle.getDouble(KEY_MODEL);
      switch (model) {
        case FirebaseVisionCloudDetectorOptions.STABLE_MODEL:
          builder.setModelType(FirebaseVisionCloudDetectorOptions.STABLE_MODEL);
          break;
        case FirebaseVisionCloudDetectorOptions.LATEST_MODEL:
          builder.setModelType(FirebaseVisionCloudDetectorOptions.LATEST_MODEL);
          break;
        default:
          throw new IllegalArgumentException(
            "Invalid 'model' Landmark Recognizer option, must be either 1 or 2.");
      }
    }

    return builder.build();
  }
}
