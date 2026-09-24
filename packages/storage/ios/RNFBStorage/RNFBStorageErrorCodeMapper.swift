/**
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
 */

import Foundation

/**
 * `FIRStorageErrorCode` raw value → JS error-code / message mapping previously
 * inline in `+[RNFBStorageCommon getErrorCodeMessage:]`.
 *
 * Raw ints from Firebase Storage `StorageErrorCode`
 * (`@objc(FIRStorageErrorCode)` in `StorageError.swift`):
 * - unknown = -13000, objectNotFound = -13010, …
 *
 * Hardcoded so the Storage unit target does not need FirebaseStorage.
 */
@objc(RNFBStorageErrorCodeMapper)
public final class RNFBStorageErrorCodeMapper: NSObject {
  /// `FIRStorageErrorCodeUnknown`
  private static let codeUnknown = -13000
  /// `FIRStorageErrorCodeObjectNotFound`
  private static let codeObjectNotFound = -13010
  /// `FIRStorageErrorCodeBucketNotFound`
  private static let codeBucketNotFound = -13011
  /// `FIRStorageErrorCodeProjectNotFound`
  private static let codeProjectNotFound = -13012
  /// `FIRStorageErrorCodeQuotaExceeded`
  private static let codeQuotaExceeded = -13013
  /// `FIRStorageErrorCodeUnauthenticated`
  private static let codeUnauthenticated = -13020
  /// `FIRStorageErrorCodeUnauthorized`
  private static let codeUnauthorized = -13021
  /// `FIRStorageErrorCodeRetryLimitExceeded`
  private static let codeRetryLimitExceeded = -13030
  /// `FIRStorageErrorCodeNonMatchingChecksum`
  private static let codeNonMatchingChecksum = -13031
  /// `FIRStorageErrorCodeDownloadSizeExceeded`
  private static let codeDownloadSizeExceeded = -13032
  /// `FIRStorageErrorCodeCancelled`
  private static let codeCancelled = -13040

  /// Exact pre-port string (U+2019 apostrophe in "couldn't").
  private static let permissionDeniedUnderlying =
    "The operation couldn’t be completed. Permission denied"

  @objc(codeAndMessageForError:)
  public static func codeAndMessage(for error: NSError?) -> [String] {
    var code = "unknown"

    guard let error else {
      return [code, "An unknown error has occurred."]
    }

    var message = error.localizedDescription
    let userInfo = error.userInfo
    let underlyingError = userInfo[NSUnderlyingErrorKey] as? NSError
    let underlyingErrorDescription = underlyingError?.localizedDescription

    switch error.code {
    case codeUnknown:
      if underlyingErrorDescription == permissionDeniedUnderlying {
        code = "invalid-device-file-path"
        message = "The specified device file path is invalid or is restricted."
      } else if let responseBody = userInfo["ResponseBody"] {
        message =
          "An unknown error has occurred. (underlying reason '\(responseBody)')"
      } else {
        message = "An unknown error has occurred."
      }
    case codeObjectNotFound:
      code = "object-not-found"
      message = "No object exists at the desired reference."
    case codeBucketNotFound:
      code = "bucket-not-found"
      message = "No bucket is configured for Firebase Storage."
    case codeProjectNotFound:
      code = "project-not-found"
      message = "No project is configured for Firebase Storage."
    case codeQuotaExceeded:
      code = "quota-exceeded"
      message = "Quota on your Firebase Storage bucket has been exceeded."
    case codeUnauthenticated:
      code = "unauthenticated"
      message = "User is unauthenticated. Authenticate and try again."
    case codeUnauthorized:
      code = "unauthorized"
      message = "User is not authorized to perform the desired action."
    case codeRetryLimitExceeded:
      code = "retry-limit-exceeded"
      message =
        "The maximum time limit on an operation (upload, download, delete, etc.) has been "
        + "exceeded."
    case codeNonMatchingChecksum:
      code = "non-matching-checksum"
      message =
        "File on the client does not match the checksum of the file received by the server."
    case codeDownloadSizeExceeded:
      code = "download-size-exceeded"
      message =
        "Size of the downloaded file exceeds the amount of memory allocated for the download."
    case codeCancelled:
      code = "cancelled"
      message = "User cancelled the operation."
    default:
      break
    }

    return [code, message]
  }
}
