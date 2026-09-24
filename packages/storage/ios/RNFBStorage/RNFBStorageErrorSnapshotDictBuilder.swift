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
 * Error payload attachment previously inline in
 * `+[RNFBStorageCommon buildErrorSnapshotDict:taskSnapshotDict:]` and
 * `+[RNFBStorageCommon buildErrorSnapshotDictFromCodeAndMessage:taskSnapshotDict:]`.
 *
 * Mutates `taskSnapshotDict` in place and returns the same instance (or nil when
 * the snapshot dict is nil — matching ObjC nil-messaging).
 */
@objc(RNFBStorageErrorSnapshotDictBuilder)
public final class RNFBStorageErrorSnapshotDictBuilder: NSObject {
  @objc(buildErrorSnapshotDict:taskSnapshotDict:)
  public static func buildErrorSnapshotDict(
    _ error: NSError?,
    taskSnapshotDict: NSMutableDictionary?
  ) -> NSDictionary? {
    guard let taskSnapshotDict else {
      return nil
    }

    let codeAndMessage = RNFBStorageErrorCodeMapper.codeAndMessage(for: error)
    var errorPayload: [String: Any] = [
      "code": codeAndMessage[0],
      "message": codeAndMessage[1],
    ]
    // Pre-port ObjC always set this key from `[error localizedDescription]`.
    if let error {
      errorPayload["nativeErrorMessage"] = error.localizedDescription
    } else {
      errorPayload["nativeErrorMessage"] = NSNull()
    }
    taskSnapshotDict["error"] = errorPayload
    return taskSnapshotDict
  }

  @objc(buildErrorSnapshotDictFromCodeAndMessage:taskSnapshotDict:)
  public static func buildErrorSnapshotDictFromCodeAndMessage(
    _ codeAndMessage: [Any]?,
    taskSnapshotDict: NSMutableDictionary?
  ) -> NSDictionary? {
    guard let taskSnapshotDict else {
      return nil
    }

    // Pre-port ObjC indexed without bounds checks; callers always pass [code, message].
    let pair = codeAndMessage!
    taskSnapshotDict["error"] = [
      "code": pair[0],
      "message": pair[1],
    ]
    return taskSnapshotDict
  }
}
