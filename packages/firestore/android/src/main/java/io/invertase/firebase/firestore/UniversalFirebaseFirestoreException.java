package io.invertase.firebase.firestore;

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

import com.google.firebase.firestore.FirebaseFirestoreException;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class UniversalFirebaseFirestoreException extends Exception {

  private final String code;
  private final String message;

  UniversalFirebaseFirestoreException(FirebaseFirestoreException nativeException, Throwable cause) {
    super(nativeException != null ? nativeException.getMessage() : "", cause);

    String code = null;
    String message = "An unknown error occurred";

    if (cause != null && cause.getMessage() != null && cause.getMessage().contains(":")) {
      String causeMessage = cause.getMessage();
      Matcher matcher = Pattern.compile("([A-Z_]{3,25}):\\s(.*)").matcher(causeMessage);
      if (matcher.find()) {
        String foundCode = matcher.group(1).trim();
        String foundMessage = matcher.group(2).trim();
        switch (foundCode) {
          case "ABORTED":
            code = "aborted";
            message = "The operation was aborted, typically due to a concurrency issue like transaction aborts, etc.";
            break;
          case "ALREADY_EXISTS":
            code = "already-exists";
            message = "Some document that we attempted to create already exists.";
            break;
          case "CANCELLED":
            code = "cancelled";
            message = "The operation was cancelled (typically by the caller).";
            break;
          case "DATA_LOSS":
            code = "data-loss";
            message = "Unrecoverable data loss or corruption.";
            break;
          case "DEADLINE_EXCEEDED":
            code = "deadline-exceeded";
            message = "Deadline expired before operation could complete. For operations that change the state of the system, this error may be returned even if the operation has completed successfully. For example, a successful response from a server could have been delayed long enough for the deadline to expire.";
            break;
          case "FAILED_PRECONDITION":
            code = "failed-precondition";
            if (foundMessage.contains("query requires an index")) {
              message = foundMessage;
            } else {
              message = "Operation was rejected because the system is not in a state required for the operation's execution. Ensure your query has been indexed via the Firebase console.";
            }
            break;
          case "INTERNAL":
            code = "internal";
            message = "Internal errors. Means some invariants expected by underlying system has been broken. If you see one of these errors, something is very broken.";
            break;
          case "INVALID_ARGUMENT":
            code = "invalid-argument";
            message = "Client specified an invalid argument. Note that this differs from failed-precondition. invalid-argument indicates arguments that are problematic regardless of the state of the system (e.g., an invalid field name).";
            break;
          case "NOT_FOUND":
            code = "not-found";
            message = "Some requested document was not found.";
            break;
          case "OUT_OF_RANGE":
            code = "out-of-range";
            message = "Operation was attempted past the valid range.";
            break;
          case "PERMISSION_DENIED":
            code = "permission-denied";
            message = "The caller does not have permission to execute the specified operation.";
            break;
          case "RESOURCE_EXHAUSTED":
            code = "resource-exhausted";
            message = "Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is out of space.";
            break;
          case "UNAUTHENTICATED":
            code = "unauthenticated";
            message = "The request does not have valid authentication credentials for the operation.";
            break;
          case "UNAVAILABLE":
            code = "unavailable";
            message = "The service is currently unavailable. This is a most likely a transient condition and may be corrected by retrying with a backoff.";
            break;
          case "UNIMPLEMENTED":
            code = "unimplemented";
            message = "Operation is not implemented or not supported/enabled.";
            break;
          case "UNKNOWN":
            code = "unknown";
            message = "Unknown error or an error from a different error domain.";
            break;
        }
      }
    }

    if (code == null && nativeException != null) {
      switch (nativeException.getCode()) {
        case ABORTED:
          code = "aborted";
          message = "The operation was aborted, typically due to a concurrency issue like transaction aborts, etc.";
          break;
        case ALREADY_EXISTS:
          code = "already-exists";
          message = "Some document that we attempted to create already exists.";
          break;
        case CANCELLED:
          code = "cancelled";
          message = "The operation was cancelled (typically by the caller).";
          break;
        case DATA_LOSS:
          code = "data-loss";
          message = "Unrecoverable data loss or corruption.";
          break;
        case DEADLINE_EXCEEDED:
          code = "deadline-exceeded";
          message = "Deadline expired before operation could complete. For operations that change the state of the system, this error may be returned even if the operation has completed successfully. For example, a successful response from a server could have been delayed long enough for the deadline to expire.";
          break;
        case FAILED_PRECONDITION:
          code = "failed-precondition";
          if (nativeException.getMessage() != null && nativeException.getMessage().contains("query requires an index")) {
            message = nativeException.getMessage();
          } else {
            message = "Operation was rejected because the system is not in a state required for the operation's execution. Ensure your query has been indexed via the Firebase console.";
          }
          break;
        case INTERNAL:
          code = "internal";
          message = "Internal errors. Means some invariants expected by underlying system has been broken. If you see one of these errors, something is very broken.";
          break;
        case INVALID_ARGUMENT:
          code = "invalid-argument";
          message = "Client specified an invalid argument. Note that this differs from failed-precondition. invalid-argument indicates arguments that are problematic regardless of the state of the system (e.g., an invalid field name).";
          break;
        case NOT_FOUND:
          code = "not-found";
          message = "Some requested document was not found.";
          break;
        case OUT_OF_RANGE:
          code = "out-of-range";
          message = "Operation was attempted past the valid range.";
          break;
        case PERMISSION_DENIED:
          code = "permission-denied";
          message = "The caller does not have permission to execute the specified operation.";
          break;
        case RESOURCE_EXHAUSTED:
          code = "resource-exhausted";
          message = "Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is out of space.";
          break;
        case UNAUTHENTICATED:
          code = "unauthenticated";
          message = "The request does not have valid authentication credentials for the operation.";
          break;
        case UNAVAILABLE:
          code = "unavailable";
          message = "The service is currently unavailable. This is a most likely a transient condition and may be corrected by retrying with a backoff.";
          break;
        case UNIMPLEMENTED:
          code = "unimplemented";
          message = "Operation is not implemented or not supported/enabled.";
          break;
        case UNKNOWN:
          code = "unknown";
          message = "Unknown error or an error from a different error domain.";
          break;
        default:
          // Even though UNKNOWN exists, this is a fallback
          code = "unknown";
          message = "An unknown error occurred";
      }
    }

    this.code = code;
    this.message = message;
  }

  public String getCode() {
    return code;
  }

  @Override
  public String getMessage() {
    return message;
  }
}
