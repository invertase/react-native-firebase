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
 * `FIRStorageTaskStatus` raw value → JS task-state string mapping previously
 * inline in `+[RNFBStorageCommon getTaskStatus:]`.
 *
 * Raw ints from Firebase Storage `StorageTaskStatus`
 * (`@objc(FIRStorageTaskStatus)` in `StorageConstants.swift`):
 * - unknown = 0, resume = 1, progress = 2, pause = 3, success = 4, failure = 5
 *
 * Hardcoded so the Storage unit target does not need FirebaseStorage.
 */
@objc(RNFBStorageTaskStatusMapper)
public final class RNFBStorageTaskStatusMapper: NSObject {
  /// `FIRStorageTaskStatusResume`
  private static let statusResume = 1
  /// `FIRStorageTaskStatusProgress`
  private static let statusProgress = 2
  /// `FIRStorageTaskStatusPause`
  private static let statusPause = 3
  /// `FIRStorageTaskStatusSuccess`
  private static let statusSuccess = 4
  /// `FIRStorageTaskStatusFailure`
  private static let statusFailure = 5

  @objc(stringForTaskStatus:)
  public static func string(forTaskStatus status: Int) -> String {
    if status == statusResume || status == statusProgress {
      return "running"
    } else if status == statusPause {
      return "paused"
    } else if status == statusSuccess {
      return "success"
    } else if status == statusFailure {
      return "error"
    } else {
      // `FIRStorageTaskStatusUnknown` (0) and any other raw value
      return "unknown"
    }
  }
}
