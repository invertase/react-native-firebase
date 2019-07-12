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
import com.google.firebase.ml.vision.common.FirebaseVisionPoint;
import com.google.firebase.ml.vision.face.*;
import io.invertase.firebase.common.SharedUtils;
import io.invertase.firebase.common.UniversalFirebaseModule;

import java.util.*;

import static io.invertase.firebase.ml.vision.UniversalFirebaseMLVisionCommon.*;

class UniversalFirebaseMLVisionFaceDetectorModule extends UniversalFirebaseModule {
  UniversalFirebaseMLVisionFaceDetectorModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<List<Map<String, Object>>> faceDetectorProcessImage(
    String appName,
    String stringUri,
    Bundle faceDetectorOptionsBundle
  ) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseVisionFaceDetectorOptions options = getFaceDetectorOptions(faceDetectorOptionsBundle);
      FirebaseVisionFaceDetector visionFaceDetector = FirebaseVision.getInstance(firebaseApp)
        .getVisionFaceDetector(options);
      FirebaseVisionImage image = FirebaseVisionImage.fromFilePath(
        getContext(),
        SharedUtils.getUri(stringUri)
      );

      List<FirebaseVisionFace> visionFacesRaw = Tasks.await(visionFaceDetector.detectInImage(image));
      List<Map<String, Object>> visionFacesFormatted = new ArrayList<>(visionFacesRaw.size());

      for (FirebaseVisionFace visionFaceRaw : visionFacesRaw) {
        Map<String, Object> visionFaceFormatted = new HashMap<>();

        visionFaceFormatted.put(
          KEY_BOUNDING_BOX,
          SharedUtils.rectToIntArray(visionFaceRaw.getBoundingBox())
        );
        visionFaceFormatted.put(KEY_HEAD_EULER_ANGLE_Y, visionFaceRaw.getHeadEulerAngleY());
        visionFaceFormatted.put(KEY_HEAD_EULER_ANGLE_Z, visionFaceRaw.getHeadEulerAngleZ());
        visionFaceFormatted.put(
          KEY_LEFT_EYE_OPEN_PROBABILITY,
          visionFaceRaw.getLeftEyeOpenProbability()
        );
        visionFaceFormatted.put(
          KEY_RIGHT_EYE_OPEN_PROBABILITY,
          visionFaceRaw.getRightEyeOpenProbability()
        );

        visionFaceFormatted.put(KEY_SMILING_PROBABILITY, visionFaceRaw.getSmilingProbability());
        visionFaceFormatted.put(KEY_TRACKING_ID, visionFaceRaw.getTrackingId());

        List<Map<String, Object>> faceContoursFormatted;

        if (options.getContourMode() == FirebaseVisionFaceDetectorOptions.NO_CONTOURS) {
          faceContoursFormatted = new ArrayList<>(0);
        } else {
          faceContoursFormatted = new ArrayList<>(14);
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.ALL_POINTS)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.FACE)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.LEFT_EYEBROW_TOP)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.LEFT_EYEBROW_BOTTOM)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.RIGHT_EYEBROW_TOP)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.RIGHT_EYEBROW_BOTTOM)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.LEFT_EYE)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.RIGHT_EYE)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.UPPER_LIP_TOP)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.UPPER_LIP_BOTTOM)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.LOWER_LIP_TOP)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.LOWER_LIP_BOTTOM)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.NOSE_BRIDGE)));
          faceContoursFormatted.add(getContourMap(visionFaceRaw.getContour(FirebaseVisionFaceContour.NOSE_BOTTOM)));
        }

        visionFaceFormatted.put(KEY_FACE_CONTOURS, faceContoursFormatted);

        List<Map<String, Object>> faceLandmarksFormatted = new ArrayList<>(14);
        if (visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.MOUTH_BOTTOM) != null) {
          faceLandmarksFormatted.add(getLandmarkMap(
            Objects.requireNonNull(visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.MOUTH_BOTTOM)))
          );
        }

        if (visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.MOUTH_RIGHT) != null) {
          faceLandmarksFormatted.add(getLandmarkMap(
            Objects.requireNonNull(visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.MOUTH_RIGHT)))
          );
        }

        if (visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.MOUTH_LEFT) != null) {
          faceLandmarksFormatted.add(getLandmarkMap(
            Objects.requireNonNull(visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.MOUTH_LEFT)))
          );
        }

        if (visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.RIGHT_EYE) != null) {
          faceLandmarksFormatted.add(getLandmarkMap(
            Objects.requireNonNull(visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.RIGHT_EYE)))
          );
        }

        if (visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.LEFT_EYE) != null) {
          faceLandmarksFormatted.add(getLandmarkMap(
            Objects.requireNonNull(visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.LEFT_EYE)))
          );
        }

        if (visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.RIGHT_EAR) != null) {
          faceLandmarksFormatted.add(getLandmarkMap(
            Objects.requireNonNull(visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.RIGHT_EAR)))
          );
        }

        if (visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.LEFT_EAR) != null) {
          faceLandmarksFormatted.add(getLandmarkMap(
            Objects.requireNonNull(visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.LEFT_EAR)))
          );
        }

        if (visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.RIGHT_CHEEK) != null) {
          faceLandmarksFormatted.add(getLandmarkMap(
            Objects.requireNonNull(visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.RIGHT_CHEEK)))
          );
        }

        if (visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.LEFT_CHEEK) != null) {
          faceLandmarksFormatted.add(getLandmarkMap(
            Objects.requireNonNull(visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.LEFT_CHEEK)))
          );
        }

        if (visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.NOSE_BASE) != null) {
          faceLandmarksFormatted.add(getLandmarkMap(
            Objects.requireNonNull(visionFaceRaw.getLandmark(FirebaseVisionFaceLandmark.NOSE_BASE)))
          );
        }

        visionFaceFormatted.put(KEY_LANDMARKS, faceLandmarksFormatted);
        visionFacesFormatted.add(visionFaceFormatted);
      }

      return visionFacesFormatted;
    });
  }

  private Map<String, Object> getLandmarkMap(FirebaseVisionFaceLandmark visionFaceLandmark) {
    Map<String, Object> visionFaceLandmarkMap = new HashMap<>();
    visionFaceLandmarkMap.put(KEY_TYPE, visionFaceLandmark.getLandmarkType());
    visionFaceLandmarkMap.put(KEY_POSITION, getVisionPointMap(visionFaceLandmark.getPosition()));
    return visionFaceLandmarkMap;
  }

  private float[] getVisionPointMap(FirebaseVisionPoint visionPoint) {
    return new float[]{visionPoint.getX(), visionPoint.getY()};
  }

  private Map<String, Object> getContourMap(FirebaseVisionFaceContour visionFaceContour) {
    Map<String, Object> visionFaceContourMap = new HashMap<>();
    visionFaceContourMap.put(KEY_TYPE, visionFaceContour.getFaceContourType());
    List<FirebaseVisionPoint> pointsListRaw = visionFaceContour.getPoints();
    List<float[]> pointsListFormatted = new ArrayList<>(pointsListRaw.size());
    for (FirebaseVisionPoint pointRaw : pointsListRaw) {
      pointsListFormatted.add(getVisionPointMap(pointRaw));
    }
    visionFaceContourMap.put(KEY_TYPE, visionFaceContour.getFaceContourType());
    visionFaceContourMap.put(KEY_POINTS, pointsListFormatted);

    return visionFaceContourMap;
  }


  private FirebaseVisionFaceDetectorOptions getFaceDetectorOptions(Bundle faceDetectorOptionsBundle) {
    FirebaseVisionFaceDetectorOptions.Builder builder = new FirebaseVisionFaceDetectorOptions.Builder();

    if (faceDetectorOptionsBundle.getBoolean(KEY_ENABLE_TRACKING)) {
      builder.enableTracking();
    }

    if (faceDetectorOptionsBundle.containsKey(KEY_CLASSIFICATION_MODE)) {
      int classificationMode = (int) faceDetectorOptionsBundle.getDouble(KEY_CLASSIFICATION_MODE);
      switch (classificationMode) {
        case FirebaseVisionFaceDetectorOptions.NO_CLASSIFICATIONS:
          builder.setClassificationMode(FirebaseVisionFaceDetectorOptions.NO_CLASSIFICATIONS);
          break;
        case FirebaseVisionFaceDetectorOptions.ALL_CLASSIFICATIONS:
          builder.setClassificationMode(FirebaseVisionFaceDetectorOptions.ALL_CLASSIFICATIONS);
          break;
        default:
          throw new IllegalArgumentException(
            "Invalid 'classificationMode' Face Detector option, must be either 1 or 2.");
      }
    }

    if (faceDetectorOptionsBundle.containsKey(KEY_CONTOUR_MODE)) {
      int contourMode = (int) faceDetectorOptionsBundle.getDouble(KEY_CONTOUR_MODE);
      switch (contourMode) {
        case FirebaseVisionFaceDetectorOptions.NO_CONTOURS:
          builder.setContourMode(FirebaseVisionFaceDetectorOptions.NO_CONTOURS);
          break;
        case FirebaseVisionFaceDetectorOptions.ALL_CONTOURS:
          builder.setContourMode(FirebaseVisionFaceDetectorOptions.ALL_CONTOURS);
          break;
        default:
          throw new IllegalArgumentException(
            "Invalid 'contourMode' Face Detector option, must be either 1 or 2.");
      }
    }

    if (faceDetectorOptionsBundle.containsKey(KEY_LANDMARK_MODE)) {
      int landmarkMode = (int) faceDetectorOptionsBundle.getDouble(KEY_LANDMARK_MODE);
      switch (landmarkMode) {
        case FirebaseVisionFaceDetectorOptions.NO_LANDMARKS:
          builder.setLandmarkMode(FirebaseVisionFaceDetectorOptions.NO_LANDMARKS);
          break;
        case FirebaseVisionFaceDetectorOptions.ALL_LANDMARKS:
          builder.setLandmarkMode(FirebaseVisionFaceDetectorOptions.ALL_LANDMARKS);
          break;
        default:
          throw new IllegalArgumentException(
            "Invalid 'landmarkMode' Face Detector option, must be either 1 or 2.");
      }
    }

    if (faceDetectorOptionsBundle.containsKey(KEY_MIN_FACE_SIZE)) {
      float minFaceSize = (float) faceDetectorOptionsBundle.getDouble(KEY_MIN_FACE_SIZE);
      builder.setMinFaceSize(minFaceSize);
    }

    if (faceDetectorOptionsBundle.containsKey(KEY_PERFORMANCE_MODE)) {
      int performanceMode = (int) faceDetectorOptionsBundle.getDouble(KEY_PERFORMANCE_MODE);
      switch (performanceMode) {
        case FirebaseVisionFaceDetectorOptions.FAST:
          builder.setPerformanceMode(FirebaseVisionFaceDetectorOptions.FAST);
          break;
        case FirebaseVisionFaceDetectorOptions.ACCURATE:
          builder.setPerformanceMode(FirebaseVisionFaceDetectorOptions.ACCURATE);
          break;
        default:
          throw new IllegalArgumentException(
            "Invalid 'performanceMode' Face Detector option, must be either 1 or 2.");
      }
    }

    return builder.build();
  }
}
