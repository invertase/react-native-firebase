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

final class RNFBFirestorePipelineSnapshotSerializer {
  private static let metadataFallbackStages: Set<String> = ["select", "addFields", "removeFields"]

  func buildExecutionMetadata(_ pipeline: RNFBFirestoreParsedPipelineRequest) -> PipelineExecutionMetadata {
    guard pipeline.source.sourceType == "documents",
          pipeline.stages.allSatisfy({ Self.metadataFallbackStages.contains($0.stageName) }),
          !pipeline.source.documents.isEmpty else {
      return .empty
    }

    return PipelineExecutionMetadata(sourceDocumentPaths: pipeline.source.documents)
  }

  func serializeSnapshot(
    _ snapshot: __PipelineSnapshotBridge?,
    metadata: PipelineExecutionMetadata
  ) throws -> [AnyHashable: Any] {
    var output: [AnyHashable: Any] = [:]
    let results = snapshot?.results ?? []
    let resultCount = results.count

    output["results"] = results.enumerated().map { index, result in
      serializeResult(result, fallbackPath: metadata.fallbackPath(for: index, resultCount: resultCount))
    }

    guard let executionTime = snapshot?.execution_time else {
      throw PipelineValidationError("pipelineExecute() expected native snapshot to include executionTime.")
    }

    output["executionTime"] = serializeTimestamp(executionTime)

    return output
  }

  private func serializeResult(_ result: __PipelineResultBridge, fallbackPath: String?) -> [AnyHashable: Any] {
    var map: [AnyHashable: Any] = [:]

    let path = result.reference?.path ?? fallbackPath
    if let path {
      map["path"] = path
    }

    if let id = result.documentID ?? path?.split(separator: "/").last.map(String.init) {
      map["id"] = id
    } else {
      map["id"] = NSNull()
    }

    map["data"] = RNFBFirestoreSerialize.serializeDictionary(result.data())
    map["createTime"] = result.create_time.map(serializeTimestamp) ?? NSNull()
    map["updateTime"] = result.update_time.map(serializeTimestamp) ?? NSNull()

    return map
  }

  private func serializeTimestamp(_ timestamp: Timestamp) -> [AnyHashable: Any] {
    [
      "seconds": NSNumber(value: timestamp.seconds),
      "nanoseconds": NSNumber(value: timestamp.nanoseconds),
    ]
  }
}

struct PipelineExecutionMetadata {
  static let empty = PipelineExecutionMetadata(sourceDocumentPaths: [])

  let sourceDocumentPaths: [String]

  func fallbackPath(for index: Int, resultCount: Int) -> String? {
    guard !sourceDocumentPaths.isEmpty,
          sourceDocumentPaths.count == resultCount,
          index >= 0,
          index < sourceDocumentPaths.count else {
      return nil
    }

    return sourceDocumentPaths[index]
  }
}
