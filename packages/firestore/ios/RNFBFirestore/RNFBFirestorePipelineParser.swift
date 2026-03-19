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

struct RNFBFirestoreParsedPipelineRequest {
  let source: RNFBFirestoreParsedPipelineSource
  let stages: [RNFBFirestoreParsedPipelineStage]
  let options: RNFBFirestoreParsedPipelineExecuteOptions
}

struct RNFBFirestoreParsedPipelineSource {
  let sourceType: String
  let path: String?
  let collectionId: String?
  let documents: [String]
  let queryType: String?
  let filters: [Any]
  let orders: [Any]
  let options: [String: Any]
  let rawOptions: [String: Any]?
}

enum RNFBFirestoreParsedPipelineStage {
  case whereStage(RNFBFirestoreParsedWhereStage)
  case selectStage(RNFBFirestoreParsedSelectStage)
  case addFieldsStage(RNFBFirestoreParsedAddFieldsStage)
  case removeFieldsStage(RNFBFirestoreParsedRemoveFieldsStage)
  case sortStage(RNFBFirestoreParsedSortStage)
  case limitStage(RNFBFirestoreParsedLimitStage)
  case offsetStage(RNFBFirestoreParsedOffsetStage)
  case aggregateStage(RNFBFirestoreParsedAggregateStage)
  case distinctStage(RNFBFirestoreParsedDistinctStage)
  case findNearestStage(RNFBFirestoreParsedFindNearestStage)
  case replaceWithStage(RNFBFirestoreParsedReplaceWithStage)
  case sampleStage(RNFBFirestoreParsedSampleStage)
  case unionStage(RNFBFirestoreParsedUnionStage)
  case unnestStage(RNFBFirestoreParsedUnnestStage)
  case rawStage(RNFBFirestoreParsedRawStage)

  var stageName: String {
    switch self {
    case .whereStage: return "where"
    case .selectStage: return "select"
    case .addFieldsStage: return "addFields"
    case .removeFieldsStage: return "removeFields"
    case .sortStage: return "sort"
    case .limitStage: return "limit"
    case .offsetStage: return "offset"
    case .aggregateStage: return "aggregate"
    case .distinctStage: return "distinct"
    case .findNearestStage: return "findNearest"
    case .replaceWithStage: return "replaceWith"
    case .sampleStage: return "sample"
    case .unionStage: return "union"
    case .unnestStage: return "unnest"
    case .rawStage: return "rawStage"
    }
  }
}

struct RNFBFirestoreParsedPipelineExecuteOptions {
  let indexMode: String?
  let rawOptions: [String: Any]?

  var isEmpty: Bool {
    indexMode == nil && rawOptions == nil
  }
}

struct RNFBFirestoreParsedWhereStage {
  let condition: Any
}

struct RNFBFirestoreParsedSelectStage {
  let selections: [Any]
}

struct RNFBFirestoreParsedAddFieldsStage {
  let fields: [Any]
}

struct RNFBFirestoreParsedRemoveFieldsStage {
  let fields: [String]
}

struct RNFBFirestoreParsedSortStage {
  let orderings: [Any]
}

struct RNFBFirestoreParsedLimitStage {
  let limit: Any
}

struct RNFBFirestoreParsedOffsetStage {
  let offset: Any
}

struct RNFBFirestoreParsedAggregateStage {
  let accumulators: [[String: Any]]
  let groups: [Any]
}

struct RNFBFirestoreParsedDistinctStage {
  let groups: [Any]
}

struct RNFBFirestoreParsedFindNearestStage {
  let field: Any
  let vectorValue: Any?
  let distanceMeasure: String
  let limit: NSNumber?
  let distanceField: Any?
}

struct RNFBFirestoreParsedReplaceWithStage {
  let value: Any
}

struct RNFBFirestoreParsedSampleStage {
  let documents: Any?
  let percentage: Any?
}

struct RNFBFirestoreParsedUnionStage {
  let other: [String: Any]
}

struct RNFBFirestoreParsedUnnestStage {
  let selectable: Any
  let indexField: Any?
}

struct RNFBFirestoreParsedRawStage {
  let name: String
  let params: Any?
  let options: [String: Any]?
}

enum RNFBFirestorePipelineParser {
  private static let sourceTypes: Set<String> = [
    "collection", "collectionGroup", "database", "documents", "query",
  ]

  private static let knownStages: Set<String> = [
    "where", "select", "addFields", "removeFields", "sort", "limit", "offset",
    "aggregate", "distinct", "findNearest", "replaceWith", "sample", "union", "unnest", "rawStage",
  ]

  static func parse(
    pipeline: NSDictionary?,
    options: NSDictionary?
  ) throws -> RNFBFirestoreParsedPipelineRequest {
    guard let pipeline = pipeline as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected a pipeline object.")
    }

    let source = try parseSource(requireMap(pipeline, key: "source", fieldName: "pipeline.source"))
    let stages = try parseStages(requireStageArray(pipeline, key: "stages", fieldName: "pipeline.stages"))
    let executeOptions = try parseOptions(options as? [String: Any])
    return RNFBFirestoreParsedPipelineRequest(source: source, stages: stages, options: executeOptions)
  }

  private static func parseSource(_ source: [String: Any]) throws -> RNFBFirestoreParsedPipelineSource {
    let sourceType = try requireNonEmptyString(source, key: "source", fieldName: "pipeline.source.source")

    guard sourceTypes.contains(sourceType) else {
      throw PipelineValidationError("pipelineExecute() received an unknown source type.")
    }

    switch sourceType {
    case "collection":
      return RNFBFirestoreParsedPipelineSource(
        sourceType: sourceType,
        path: try requireNonEmptyString(source, key: "path", fieldName: "pipeline.source.path"),
        collectionId: nil,
        documents: [],
        queryType: nil,
        filters: [],
        orders: [],
        options: [:],
        rawOptions: try parseUnsupportedSourceRawOptions(source, sourceType: sourceType)
      )
    case "collectionGroup":
      return RNFBFirestoreParsedPipelineSource(
        sourceType: sourceType,
        path: nil,
        collectionId: try requireNonEmptyString(source, key: "collectionId", fieldName: "pipeline.source.collectionId"),
        documents: [],
        queryType: nil,
        filters: [],
        orders: [],
        options: [:],
        rawOptions: try parseUnsupportedSourceRawOptions(source, sourceType: sourceType)
      )
    case "database":
      return RNFBFirestoreParsedPipelineSource(
        sourceType: sourceType,
        path: nil,
        collectionId: nil,
        documents: [],
        queryType: nil,
        filters: [],
        orders: [],
        options: [:],
        rawOptions: try parseUnsupportedSourceRawOptions(source, sourceType: sourceType)
      )
    case "documents":
      let documents = try requireArray(source, key: "documents", fieldName: "pipeline.source.documents")
      guard !documents.isEmpty else {
        throw PipelineValidationError(
          "pipelineExecute() expected pipeline.source.documents to contain at least one document path.")
      }

      let parsedDocuments = try documents.enumerated().map { index, value in
        guard let documentPath = value as? String else {
          throw PipelineValidationError(
            "pipelineExecute() expected pipeline.source.documents entries to be strings.")
        }
        return documentPath
      }

      return RNFBFirestoreParsedPipelineSource(
        sourceType: sourceType,
        path: nil,
        collectionId: nil,
        documents: parsedDocuments,
        queryType: nil,
        filters: [],
        orders: [],
        options: [:],
        rawOptions: nil
      )
    case "query":
      return RNFBFirestoreParsedPipelineSource(
        sourceType: sourceType,
        path: try requireNonEmptyString(source, key: "path", fieldName: "pipeline.source.path"),
        collectionId: nil,
        documents: [],
        queryType: try requireNonEmptyString(source, key: "queryType", fieldName: "pipeline.source.queryType"),
        filters: try requireArray(source, key: "filters", fieldName: "pipeline.source.filters"),
        orders: try requireArray(source, key: "orders", fieldName: "pipeline.source.orders"),
        options: try requireMap(source, key: "options", fieldName: "pipeline.source.options"),
        rawOptions: nil
      )
    default:
      throw PipelineValidationError("pipelineExecute() received an unknown source type.")
    }
  }

  private static func parseStages(_ stages: [[String: Any]]) throws -> [RNFBFirestoreParsedPipelineStage] {
    try stages.enumerated().map { index, stage in
      try parseStage(stage, fieldName: "pipeline.stages[\(index)]")
    }
  }

  private static func parseStage(
    _ stage: [String: Any],
    fieldName: String
  ) throws -> RNFBFirestoreParsedPipelineStage {
    guard let stageName = stage["stage"] as? String else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).stage to be a string.")
    }

    guard !stageName.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).stage to be a non-empty string.")
    }

    guard knownStages.contains(stageName) else {
      throw PipelineValidationError("pipelineExecute() received an unknown stage: \(stageName).")
    }

    let options = try requireMap(stage, key: "options", fieldName: "\(fieldName).options")

    switch stageName {
    case "where":
      return .whereStage(RNFBFirestoreParsedWhereStage(
        condition: try requireValue(options, key: "condition", fieldName: "\(fieldName).options.condition")
      ))
    case "select":
      return .selectStage(RNFBFirestoreParsedSelectStage(
        selections: try requireArray(options, key: "selections", fieldName: "\(fieldName).options.selections")
      ))
    case "addFields":
      return .addFieldsStage(RNFBFirestoreParsedAddFieldsStage(
        fields: try requireArray(options, key: "fields", fieldName: "\(fieldName).options.fields")
      ))
    case "removeFields":
      return .removeFieldsStage(RNFBFirestoreParsedRemoveFieldsStage(
        fields: try requireStringArray(options, key: "fields", fieldName: "\(fieldName).options.fields")
      ))
    case "sort":
      return .sortStage(RNFBFirestoreParsedSortStage(
        orderings: try requireArray(options, key: "orderings", fieldName: "\(fieldName).options.orderings")
      ))
    case "limit":
      return .limitStage(RNFBFirestoreParsedLimitStage(
        limit: try requireValue(options, key: "limit", fieldName: "\(fieldName).options.limit")
      ))
    case "offset":
      return .offsetStage(RNFBFirestoreParsedOffsetStage(
        offset: try requireValue(options, key: "offset", fieldName: "\(fieldName).options.offset")
      ))
    case "aggregate":
      return .aggregateStage(try parseAggregateStage(options, fieldName: "\(fieldName).options"))
    case "distinct":
      return .distinctStage(RNFBFirestoreParsedDistinctStage(
        groups: try requireArray(options, key: "groups", fieldName: "\(fieldName).options.groups")
      ))
    case "findNearest":
      return .findNearestStage(try parseFindNearestStage(options, fieldName: "\(fieldName).options"))
    case "replaceWith":
      return .replaceWithStage(RNFBFirestoreParsedReplaceWithStage(
        value: try requireValue(options, key: "map", fieldName: "\(fieldName).options.map")
      ))
    case "sample":
      return .sampleStage(try parseSampleStage(options, fieldName: "\(fieldName).options"))
    case "union":
      return .unionStage(RNFBFirestoreParsedUnionStage(
        other: try requireMap(options, key: "other", fieldName: "\(fieldName).options.other")
      ))
    case "unnest":
      return .unnestStage(RNFBFirestoreParsedUnnestStage(
        selectable: try requireValue(options, key: "selectable", fieldName: "\(fieldName).options.selectable"),
        indexField: options["indexField"]
      ))
    case "rawStage":
      return .rawStage(RNFBFirestoreParsedRawStage(
        name: try requireNonEmptyString(options, key: "name", fieldName: "\(fieldName).options.name"),
        params: options["params"],
        options: try optionalMap(options, key: "options", fieldName: "\(fieldName).options.options")
      ))
    default:
      throw PipelineValidationError("pipelineExecute() received an unknown stage: \(stageName).")
    }
  }

  private static func parseOptions(_ options: [String: Any]?) throws -> RNFBFirestoreParsedPipelineExecuteOptions {
    guard let options else {
      return RNFBFirestoreParsedPipelineExecuteOptions(indexMode: nil, rawOptions: nil)
    }

    if let indexMode = options["indexMode"], !(indexMode is String) {
      throw PipelineValidationError("pipelineExecute() expected options.indexMode to be a string.")
    }

    if let indexMode = options["indexMode"] as? String {
      guard indexMode == "recommended" else {
        throw PipelineValidationError("pipelineExecute() only supports options.indexMode=\"recommended\".")
      }

      throw PipelineValidationError(
        "pipelineExecute() does not support options.indexMode on iOS because the native Firestore pipeline SDK does not expose execute options.")
    }

    if let rawOptions = options["rawOptions"] {
      guard rawOptions is [String: Any] else {
        throw PipelineValidationError("pipelineExecute() expected options.rawOptions to be an object.")
      }

      throw PipelineValidationError(
        "pipelineExecute() does not support options.rawOptions on iOS because the native Firestore pipeline SDK does not expose execute options.")
    }

    return RNFBFirestoreParsedPipelineExecuteOptions(indexMode: nil, rawOptions: nil)
  }

  private static func parseUnsupportedSourceRawOptions(
    _ source: [String: Any],
    sourceType: String
  ) throws -> [String: Any]? {
    guard let rawOptions = source["rawOptions"] else {
      return nil
    }

    guard rawOptions is [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected pipeline.source.rawOptions to be an object.")
    }

    throw PipelineValidationError(
      "pipelineExecute() does not support pipeline.source.rawOptions for \(sourceType) on iOS because the native Firestore pipeline SDK does not expose source options.")
  }

  private static func requireMap(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> [String: Any] {
    guard let value = map[key] as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be an object.")
    }

    return value
  }

  private static func requireStageArray(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> [[String: Any]] {
    guard let value = map[key] as? [[String: Any]] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be an array.")
    }

    return value
  }

  private static func requireArray(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> [Any] {
    guard let value = map[key] as? [Any] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be an array.")
    }

    return value
  }

  private static func requireNonEmptyString(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> String {
    guard let value = map[key] as? String else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a string.")
    }
    guard !value.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a non-empty string.")
    }
    return value
  }

  private static func requireValue(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> Any {
    guard let value = map[key] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be provided.")
    }

    return value
  }

  private static func optionalMap(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> [String: Any]? {
    guard let value = map[key] else {
      return nil
    }

    guard let value = value as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be an object.")
    }

    return value
  }

  private static func requireStringArray(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> [String] {
    let values = try requireArray(map, key: key, fieldName: fieldName)
    guard !values.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to contain at least one value.")
    }

    return try values.enumerated().map { index, value in
      guard let stringValue = value as? String else {
        throw PipelineValidationError("pipelineExecute() expected \(fieldName)[\(index)] to be a string.")
      }
      return stringValue
    }
  }

  private static func parseAggregateStage(
    _ options: [String: Any],
    fieldName: String
  ) throws -> RNFBFirestoreParsedAggregateStage {
    let rawAccumulators = try requireArray(options, key: "accumulators", fieldName: "\(fieldName).accumulators")
    guard !rawAccumulators.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).accumulators to contain at least one value.")
    }

    let accumulators = try rawAccumulators.enumerated().map { index, value -> [String: Any] in
      guard let map = value as? [String: Any] else {
        throw PipelineValidationError("pipelineExecute() expected \(fieldName).accumulators[\(index)] to be an object.")
      }
      return map
    }

    let groups: [Any]
    if options["groups"] != nil {
      groups = try requireArray(options, key: "groups", fieldName: "\(fieldName).groups")
    } else {
      groups = []
    }

    return RNFBFirestoreParsedAggregateStage(accumulators: accumulators, groups: groups)
  }

  private static func parseFindNearestStage(
    _ options: [String: Any],
    fieldName: String
  ) throws -> RNFBFirestoreParsedFindNearestStage {
    let distanceMeasure = try requireNonEmptyString(
      options,
      key: "distanceMeasure",
      fieldName: "\(fieldName).distanceMeasure"
    )

    if let limit = options["limit"], !(limit is NSNumber) {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).limit to be a number.")
    }

    return RNFBFirestoreParsedFindNearestStage(
      field: try requireValue(options, key: "field", fieldName: "\(fieldName).field"),
      vectorValue: options["vectorValue"],
      distanceMeasure: distanceMeasure,
      limit: options["limit"] as? NSNumber,
      distanceField: options["distanceField"]
    )
  }

  private static func parseSampleStage(
    _ options: [String: Any],
    fieldName: String
  ) throws -> RNFBFirestoreParsedSampleStage {
    let documents = options["documents"]
    let percentage = options["percentage"]

    if documents == nil && percentage == nil {
      throw PipelineValidationError("pipelineExecute() expected sample stage to include documents or percentage.")
    }

    if let documents, !(documents is NSNumber) {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).documents to be a number.")
    }

    if let percentage, !(percentage is NSNumber) {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).percentage to be a number.")
    }

    return RNFBFirestoreParsedSampleStage(documents: documents, percentage: percentage)
  }
}
