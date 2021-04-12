package io.invertase.firebase.ml;

import com.google.firebase.ml.common.FirebaseMLException;

import javax.annotation.Nullable;

class UniversalFirebaseMLCommon {
  static final String KEY_BOUNDING_BOX = "boundingBox";
  static final String KEY_TEXT = "text";
  static final String KEY_CONFIDENCE = "confidence";
  static final String KEY_CONFIDENCE_THRESHOLD = "confidenceThreshold";
  static final String KEY_RECOGNIZED_LANGUAGES = "recognizedLanguages";
  static final String KEY_TEXT_BLOCKS = "blocks";
  static final String KEY_ENFORCE_CERT_FINGERPRINT_MATCH = "enforceCertFingerprintMatch";
  static final String KEY_HINTED_LANGUAGES = "hintedLanguages";
  static final String KEY_RECOGNIZED_BREAK = "recognizedBreak";
  static final String KEY_SYMBOLS = "symbols";
  static final String KEY_WORDS = "words";
  static final String KEY_PARAGRAPHS = "paragraphs";
  static final String KEY_CORNER_POINTS = "cornerPoints";
  static final String KEY_ELEMENTS = "elements";
  static final String KEY_LINES = "lines";
  static final String KEY_MODEL_TYPE = "modelType";
  static final String KEY_ENTITY_ID = "entityId";
  static final String KEY_LANDMARK = "landmark";
  static final String KEY_LOCATIONS = "locations";
  static final String KEY_MAX_RESULTS = "maxResults";
  static final String KEY_MODEL = "model";
  static final String KEY_TYPE = "type";
  static final String KEY_POINTS = "points";
  static final String KEY_CLASSIFICATION_MODE = "classificationMode";
  static final String KEY_ENABLE_TRACKING = "enableTracking";
  static final String KEY_POSITION = "position";
  static final String KEY_LANDMARKS = "landmarks";
  static final String KEY_FACE_CONTOURS = "faceContours";
  static final String KEY_TRACKING_ID = "trackingId";
  static final String KEY_SMILING_PROBABILITY = "smilingProbability";
  static final String KEY_LEFT_EYE_OPEN_PROBABILITY = "leftEyeOpenProbability";
  static final String KEY_RIGHT_EYE_OPEN_PROBABILITY = "rightEyeOpenProbability";
  static final String KEY_HEAD_EULER_ANGLE_Y = "headEulerAngleY";
  static final String KEY_HEAD_EULER_ANGLE_Z = "headEulerAngleZ";
  static final String KEY_CONTOUR_MODE = "contourMode";
  static final String KEY_LANDMARK_MODE = "landmarkMode";
  static final String KEY_MIN_FACE_SIZE = "minFaceSize";
  static final String KEY_PERFORMANCE_MODE = "performanceMode";
  static final String KEY_FORMAT = "format";
  static final String KEY_DISPLAY_VALUE = "displayValue";
  static final String KEY_RAW_VALUE = "rawValue";
  static final String KEY_VALUE_TYPE = "valueType";
  static final String KEY_GEO_POINT = "geoPoint";
  static final String KEY_SMS = "sms";
  static final String KEY_URL = "url";
  static final String KEY_WIFI = "wifi";
  static final String KEY_EMAIL = "email";
  static final String KEY_PHONE = "phone";
  static final String KEY_CALENDAR_EVENT = "calendarEvent";
  static final String KEY_CONTACT_INFO = "contactInfo";

  static String[] getErrorCodeAndMessageFromException(@Nullable Exception possibleMLException) {
    String code = "unknown";
    String message = "An unknown error has occurred.";

    if (possibleMLException != null) {
      message = possibleMLException.getMessage();
      if (possibleMLException instanceof FirebaseMLException) {
        FirebaseMLException mlException = (FirebaseMLException) possibleMLException;
        switch (mlException.getCode()) {
          case FirebaseMLException.ABORTED:
            code = "aborted";
            message = "The operation was aborted, typically due to a concurrency issue like transaction aborts, etc.";
            break;
          case FirebaseMLException.ALREADY_EXISTS:
            code = "already-exists";
            message = "Some resource that we attempted to create already exists.";
            break;
          case FirebaseMLException.CANCELLED:
            code = "cancelled";
            message = "The operation was cancelled (typically by the caller).";
            break;
          case FirebaseMLException.DATA_LOSS:
            code = "data-loss";
            message = "Unrecoverable data loss or corruption.";
            break;
          case FirebaseMLException.DEADLINE_EXCEEDED:
            code = "deadline-exceeded";
            message = "Deadline expired before operation could complete.";
            break;
          case FirebaseMLException.FAILED_PRECONDITION:
            code = "failed-precondition";
            message = "Operation was rejected because the system is not in a state required for the operation's execution.";
            break;
          case FirebaseMLException.INTERNAL:
            code = "internal";
            message = "Internal errors.";
            break;
          case FirebaseMLException.INVALID_ARGUMENT:
            code = "invalid-argument";
            message = "Client specified an invalid argument.";
            break;
          case FirebaseMLException.MODEL_HASH_MISMATCH:
            code = "model-hash-mismatch";
            message = "The downloaded model's hash doesn't match the expected value.";
            break;
          case FirebaseMLException.MODEL_INCOMPATIBLE_WITH_TFLITE:
            code = "model-incompatible-with-tflite";
            message = "The downloaded model isn't compatible with the TFLite runtime.";
            break;
          case FirebaseMLException.NOT_ENOUGH_SPACE:
            code = "not-enough-space";
            message = "There is not enough space left on the device.";
            break;
          case FirebaseMLException.NOT_FOUND:
            code = "not-found";
            message = "Some requested resource was not found.";
            break;
          case FirebaseMLException.OUT_OF_RANGE:
            code = "out-of-range";
            message = "Operation was attempted past the valid range.";
            break;
          case FirebaseMLException.PERMISSION_DENIED:
            code = "permission-denied";
            message = "The caller does not have permission to execute the specified operation.";
            break;
          case FirebaseMLException.RESOURCE_EXHAUSTED:
            code = "resource-exhausted";
            message = "Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is out of space.";
            break;
          case FirebaseMLException.UNAUTHENTICATED:
            code = "unauthenticated";
            message = "The request does not have valid authentication credentials for the operation.";
            break;
          case FirebaseMLException.UNAVAILABLE:
            code = "unavailable";
            message = "The service is currently unavailable.";
            break;
          case FirebaseMLException.UNIMPLEMENTED:
            code = "unimplemented";
            message = "Operation is not implemented or not supported/enabled.";
            break;
        }
      }
    }

    return new String[]{code, message, possibleMLException != null ? possibleMLException.getMessage() : ""};
  }
}
