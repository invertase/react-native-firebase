package io.invertase.firebase.ml.naturallanguage;

import com.google.firebase.ml.common.FirebaseMLException;

import javax.annotation.Nullable;

public class UniversalFirebaseMLNaturalLanguageCommon {

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
