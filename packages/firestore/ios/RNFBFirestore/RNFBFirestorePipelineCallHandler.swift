/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
import FirebaseFirestore

@objcMembers
public class RNFBFirestorePipelineCallHandler: NSObject {
  private let bridgeFactory = RNFBFirestorePipelineBridgeFactory()
  private let snapshotSerializer = RNFBFirestorePipelineSnapshotSerializer()

  @objc(executeWithFirestore:pipeline:options:completion:)
  public func execute(
    withFirestore firestore: Firestore,
    pipeline: NSDictionary?,
    options: NSDictionary?,
    completion: @escaping ([AnyHashable: Any]?, [AnyHashable: Any]?) -> Void
  ) {
    do {
      let request = try RNFBFirestorePipelineParser.parse(pipeline: pipeline, options: options)
      let metadata = snapshotSerializer.buildExecutionMetadata(request)
      let stageBridges = try bridgeFactory.buildStageBridges(firestore: firestore, request: request)

      // FirebaseFirestoreInternal currently exposes only PipelineBridge.executeWithCompletion() and
      // source-stage initializers without execute/source options. Reject these inputs on iOS until
      // the native SDK exposes an options-bearing pipeline execution/source API.
      let bridge = PipelineBridge(stages: stageBridges, db: firestore)

      bridge.execute { snapshot, error in
        if let error {
          completion(nil, [
            "code": "firestore/native",
            "message": error.localizedDescription,
            "nativeError": error,
          ])
          return
        }

        do {
          completion(try self.snapshotSerializer.serializeSnapshot(snapshot, metadata: metadata), nil)
        } catch let error as PipelineValidationError {
          completion(nil, [
            "code": "firestore/unknown",
            "message": error.message,
          ])
        } catch {
          completion(nil, [
            "code": "firestore/unknown",
            "message": "Failed to serialize pipeline snapshot: \(error.localizedDescription)",
          ])
        }
      }
    } catch let error as PipelineValidationError {
      completion(nil, [
        "code": "firestore/invalid-argument",
        "message": error.message,
      ])
    } catch {
      completion(nil, [
        "code": "firestore/unknown",
        "message": "Failed to execute pipeline: \(error.localizedDescription)",
      ])
    }
  }
}

struct PipelineValidationError: Error {
  let message: String

  init(_ message: String) {
    self.message = message
  }
}
