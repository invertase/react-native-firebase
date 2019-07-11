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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.invertase.firebase.common.SharedUtils;
import io.invertase.firebase.common.UniversalFirebaseModule;

public class UniversalFirebaseMLVisionLandmarkRecognizerModule extends UniversalFirebaseModule {

  UniversalFirebaseMLVisionLandmarkRecognizerModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  public Task<List<Map<String, Object>>> cloudLandmarkRecognizerProcessImage(String appName, String stringUri, Bundle cloudLandmarkRecognizerOptions) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseVisionCloudDetectorOptions options = getClouldLandMarkRecognizerOptions(cloudLandmarkRecognizerOptions);
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

        visionLandmark.put("confidence", cloudLandmark.getConfidence());
        visionLandmark.put("entityId", cloudLandmark.getEntityId());
        visionLandmark.put("landmark", cloudLandmark.getLandmark());

        visionLandmark.put(
          "boundingBox",
          SharedUtils.rectToIntArray(cloudLandmark.getBoundingBox())
        );

        List<List<Double>> visionLandmarkLocations = new ArrayList<>(cloudLandmark.getLocations().size());

        for (FirebaseVisionLatLng location : cloudLandmark.getLocations()) {
          List<Double> latLng = new ArrayList<>(2);
          latLng.add(location.getLatitude());
          latLng.add(location.getLongitude());
          visionLandmarkLocations.add(latLng);
        }

        visionLandmark.put("locations", visionLandmarkLocations);

        visionCloudLandmarksFormatted.add(visionLandmark);
      }

      return visionCloudLandmarksFormatted;
    });
  }

  private FirebaseVisionCloudDetectorOptions getClouldLandMarkRecognizerOptions(Bundle cloudLandmarkRecognizerOptionsBundle) {
    FirebaseVisionCloudDetectorOptions.Builder builder = new FirebaseVisionCloudDetectorOptions.Builder();

    if (
      cloudLandmarkRecognizerOptionsBundle.containsKey("enforceCertFingerprintMatch") &&
      cloudLandmarkRecognizerOptionsBundle.getBoolean("enforceCertFingerprintMatch"))
    {
      builder.enforceCertFingerprintMatch();
    }

    if (cloudLandmarkRecognizerOptionsBundle.containsKey("maxResults")) {
      int maxResults = (int) cloudLandmarkRecognizerOptionsBundle.getDouble("maxResults");
      builder.setMaxResults(maxResults);
    }

    if (cloudLandmarkRecognizerOptionsBundle.containsKey("model")) {
      int model = (int) cloudLandmarkRecognizerOptionsBundle.getDouble("model");
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
