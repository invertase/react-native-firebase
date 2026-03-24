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
  let query: RNFBFirestoreParsedQuerySource?
  let rawOptions: [String: Any]?
}

struct RNFBFirestoreParsedQuerySource {
  let filters: [RNFBFirestoreParsedValueNode]
  let orders: [RNFBFirestoreParsedValueNode]
  let options: [String: RNFBFirestoreParsedValueNode]
}

indirect enum RNFBFirestoreParsedExpressionNode {
  case field(path: String)
  case constant(RNFBFirestoreParsedValueNode)
  case function(name: String, args: [RNFBFirestoreParsedValueNode])
}

indirect enum RNFBFirestoreParsedValueNode {
  case primitive(Any)
  case list([RNFBFirestoreParsedValueNode])
  case map([String: RNFBFirestoreParsedValueNode])
  case expression(RNFBFirestoreParsedExpressionNode)
}

struct RNFBFirestoreParsedSelectableNode {
  let expression: RNFBFirestoreParsedExpressionNode
  let alias: String?
  let isFlatFieldAlias: Bool
}

struct RNFBFirestoreParsedOrderingNode {
  let expression: RNFBFirestoreParsedExpressionNode
  let descending: Bool
  let fieldShortcut: Bool
}

struct RNFBFirestoreParsedAggregateNode {
  let kind: String
  let alias: String
  let primaryValue: RNFBFirestoreParsedValueNode?
  let args: [RNFBFirestoreParsedValueNode]
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
  let condition: RNFBFirestoreParsedExpressionNode
}

struct RNFBFirestoreParsedSelectStage {
  let selections: [RNFBFirestoreParsedSelectableNode]
}

struct RNFBFirestoreParsedAddFieldsStage {
  let fields: [RNFBFirestoreParsedSelectableNode]
}

struct RNFBFirestoreParsedRemoveFieldsStage {
  let fields: [String]
}

struct RNFBFirestoreParsedSortStage {
  let orderings: [RNFBFirestoreParsedOrderingNode]
}

struct RNFBFirestoreParsedLimitStage {
  let limit: NSNumber
}

struct RNFBFirestoreParsedOffsetStage {
  let offset: NSNumber
}

struct RNFBFirestoreParsedAggregateStage {
  let accumulators: [RNFBFirestoreParsedAggregateNode]
  let groups: [RNFBFirestoreParsedSelectableNode]
}

struct RNFBFirestoreParsedDistinctStage {
  let groups: [RNFBFirestoreParsedSelectableNode]
}

struct RNFBFirestoreParsedFindNearestStage {
  let field: RNFBFirestoreParsedExpressionNode
  let vectorValue: RNFBFirestoreParsedValueNode
  let distanceMeasure: String
  let limit: NSNumber?
  let distanceField: RNFBFirestoreParsedExpressionNode?
}

struct RNFBFirestoreParsedReplaceWithStage {
  let value: RNFBFirestoreParsedExpressionNode
}

struct RNFBFirestoreParsedSampleStage {
  let documents: NSNumber?
  let percentage: NSNumber?
}

struct RNFBFirestoreParsedUnionStage {
  let other: RNFBFirestoreParsedPipelineRequest
}

struct RNFBFirestoreParsedUnnestStage {
  let selectable: RNFBFirestoreParsedSelectableNode
  let indexField: RNFBFirestoreParsedExpressionNode?
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

  private final class ParsedPipelineRequestBox {
    var value: RNFBFirestoreParsedPipelineRequest?
  }

  private final class ParsedValueNodeBox {
    var value: RNFBFirestoreParsedValueNode?
  }

  private enum PendingParsedStage {
    case ready(RNFBFirestoreParsedPipelineStage)
    case union(ParsedPipelineRequestBox)
  }

  private enum PipelineParseFrame {
    case enter(
      pipeline: [String: Any],
      options: [String: Any]?,
      box: ParsedPipelineRequestBox
    )
    case exit(
      source: RNFBFirestoreParsedPipelineSource,
      stages: [PendingParsedStage],
      options: RNFBFirestoreParsedPipelineExecuteOptions,
      box: ParsedPipelineRequestBox
    )
  }

  private enum QuerySourceValueParseFrame {
    case enter(
      Any,
      ParsedValueNodeBox
    )
    case exitList(
      ParsedValueNodeBox,
      [ParsedValueNodeBox]
    )
    case exitMap(
      ParsedValueNodeBox,
      [(String, ParsedValueNodeBox)]
    )
  }

  private struct StageDescriptor {
    let name: String
    let options: [String: Any]
  }

  static func parse(
    pipeline: NSDictionary?,
    options: NSDictionary?
  ) throws -> RNFBFirestoreParsedPipelineRequest {
    guard let pipeline = pipeline as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected a pipeline object.")
    }

    return try parsePipelineMap(pipeline, options: options as? [String: Any])
  }

  private static func parsePipelineMap(
    _ pipeline: [String: Any],
    options: [String: Any]?
  ) throws -> RNFBFirestoreParsedPipelineRequest {
    let rootBox = ParsedPipelineRequestBox()
    var stack: [PipelineParseFrame] = [
      .enter(pipeline: pipeline, options: options, box: rootBox),
    ]

    while let frame = stack.popLast() {
      switch frame {
      case let .enter(pipeline, options, box):
        let source = try parseSource(requireMap(pipeline, key: "source", fieldName: "pipeline.source"))
        let stageMaps = try requireStageArray(pipeline, key: "stages", fieldName: "pipeline.stages")
        let executeOptions = try parseOptions(options)
        var stages: [PendingParsedStage] = []
        var nestedPipelines: [([String: Any], ParsedPipelineRequestBox)] = []
        stages.reserveCapacity(stageMaps.count)

        for (index, stage) in stageMaps.enumerated() {
          let fieldName = "pipeline.stages[\(index)]"
          let descriptor = try parseStageDescriptor(stage, fieldName: fieldName)
          if descriptor.name == "union" {
            let childBox = ParsedPipelineRequestBox()
            stages.append(.union(childBox))
            nestedPipelines.append((
              try requireMap(descriptor.options, key: "other", fieldName: "\(fieldName).options.other"),
              childBox
            ))
          } else {
            stages.append(.ready(try parseStage(
              stageName: descriptor.name,
              options: descriptor.options,
              fieldName: fieldName
            )))
          }
        }

        stack.append(.exit(
          source: source,
          stages: stages,
          options: executeOptions,
          box: box
        ))

        for (nestedPipeline, childBox) in nestedPipelines.reversed() {
          stack.append(.enter(pipeline: nestedPipeline, options: nil, box: childBox))
        }
      case let .exit(source, pendingStages, options, box):
        var stages: [RNFBFirestoreParsedPipelineStage] = []
        stages.reserveCapacity(pendingStages.count)

        for pendingStage in pendingStages {
          switch pendingStage {
          case let .ready(stage):
            stages.append(stage)
          case let .union(childBox):
            guard let other = childBox.value else {
              throw PipelineValidationError("pipelineExecute() failed to parse nested union pipeline.")
            }
            stages.append(.unionStage(RNFBFirestoreParsedUnionStage(other: other)))
          }
        }

        box.value = RNFBFirestoreParsedPipelineRequest(source: source, stages: stages, options: options)
      }
    }

    guard let request = rootBox.value else {
      throw PipelineValidationError("pipelineExecute() expected a pipeline object.")
    }

    return request
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
        query: nil,
        rawOptions: try parseUnsupportedSourceRawOptions(source, sourceType: sourceType)
      )
    case "collectionGroup":
      return RNFBFirestoreParsedPipelineSource(
        sourceType: sourceType,
        path: nil,
        collectionId: try requireNonEmptyString(source, key: "collectionId", fieldName: "pipeline.source.collectionId"),
        documents: [],
        queryType: nil,
        query: nil,
        rawOptions: try parseUnsupportedSourceRawOptions(source, sourceType: sourceType)
      )
    case "database":
      return RNFBFirestoreParsedPipelineSource(
        sourceType: sourceType,
        path: nil,
        collectionId: nil,
        documents: [],
        queryType: nil,
        query: nil,
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
        query: nil,
        rawOptions: nil
      )
    case "query":
      return RNFBFirestoreParsedPipelineSource(
        sourceType: sourceType,
        path: try requireNonEmptyString(source, key: "path", fieldName: "pipeline.source.path"),
        collectionId: nil,
        documents: [],
        queryType: try requireNonEmptyString(source, key: "queryType", fieldName: "pipeline.source.queryType"),
        query: try parseQuerySource(source),
        rawOptions: nil
      )
    default:
      throw PipelineValidationError("pipelineExecute() received an unknown source type.")
    }
  }

  private static func parseQuerySource(_ source: [String: Any]) throws -> RNFBFirestoreParsedQuerySource {
    let filters = try requireArray(source, key: "filters", fieldName: "pipeline.source.filters")
    let orders = try requireArray(source, key: "orders", fieldName: "pipeline.source.orders")
    let options = try requireMap(source, key: "options", fieldName: "pipeline.source.options")

    return RNFBFirestoreParsedQuerySource(
      filters: try filters.enumerated().map { index, value in
        try parseQuerySourceValueNode(value, fieldName: "pipeline.source.filters[\(index)]")
      },
      orders: try orders.enumerated().map { index, value in
        try parseQuerySourceValueNode(value, fieldName: "pipeline.source.orders[\(index)]")
      },
      options: try options.reduce(into: [String: RNFBFirestoreParsedValueNode]()) { result, entry in
        result[entry.key] = try parseQuerySourceValueNode(
          entry.value,
          fieldName: "pipeline.source.options.\(entry.key)"
        )
      }
    )
  }

  private static func parseStageDescriptor(
    _ stage: [String: Any],
    fieldName: String
  ) throws -> StageDescriptor {
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
    return StageDescriptor(name: stageName, options: options)
  }

  private static func parseStage(
    stageName: String,
    options: [String: Any],
    fieldName: String
  ) throws -> RNFBFirestoreParsedPipelineStage {
    switch stageName {
    case "where":
      return .whereStage(RNFBFirestoreParsedWhereStage(
        condition: try parseExpressionNode(
          requireValue(options, key: "condition", fieldName: "\(fieldName).options.condition"),
          fieldName: "\(fieldName).options.condition"
        )
      ))
    case "select":
      return .selectStage(RNFBFirestoreParsedSelectStage(
        selections: try parseSelectableNodes(
          requireArray(options, key: "selections", fieldName: "\(fieldName).options.selections"),
          fieldName: "\(fieldName).options.selections"
        )
      ))
    case "addFields":
      return .addFieldsStage(RNFBFirestoreParsedAddFieldsStage(
        fields: try parseSelectableNodes(
          requireArray(options, key: "fields", fieldName: "\(fieldName).options.fields"),
          fieldName: "\(fieldName).options.fields"
        )
      ))
    case "removeFields":
      return .removeFieldsStage(RNFBFirestoreParsedRemoveFieldsStage(
        fields: try requireStringArray(options, key: "fields", fieldName: "\(fieldName).options.fields")
      ))
    case "sort":
      return .sortStage(RNFBFirestoreParsedSortStage(
        orderings: try parseOrderingNodes(
          requireArray(options, key: "orderings", fieldName: "\(fieldName).options.orderings"),
          fieldName: "\(fieldName).options.orderings"
        )
      ))
    case "limit":
      return .limitStage(RNFBFirestoreParsedLimitStage(
        limit: try requireNumber(options, key: "limit", fieldName: "\(fieldName).options.limit")
      ))
    case "offset":
      return .offsetStage(RNFBFirestoreParsedOffsetStage(
        offset: try requireNumber(options, key: "offset", fieldName: "\(fieldName).options.offset")
      ))
    case "aggregate":
      return .aggregateStage(try parseAggregateStage(options, fieldName: "\(fieldName).options"))
    case "distinct":
      return .distinctStage(RNFBFirestoreParsedDistinctStage(
        groups: try parseSelectableNodes(
          requireArray(options, key: "groups", fieldName: "\(fieldName).options.groups"),
          fieldName: "\(fieldName).options.groups"
        )
      ))
    case "findNearest":
      return .findNearestStage(try parseFindNearestStage(options, fieldName: "\(fieldName).options"))
    case "replaceWith":
      return .replaceWithStage(RNFBFirestoreParsedReplaceWithStage(
        value: try parseExpressionNode(
          requireValue(options, key: "map", fieldName: "\(fieldName).options.map"),
          fieldName: "\(fieldName).options.map"
        )
      ))
    case "sample":
      return .sampleStage(try parseSampleStage(options, fieldName: "\(fieldName).options"))
    case "union":
      throw PipelineValidationError("pipelineExecute() failed to parse nested union pipeline.")
    case "unnest":
      return .unnestStage(RNFBFirestoreParsedUnnestStage(
        selectable: try parseSelectableNode(
          requireValue(options, key: "selectable", fieldName: "\(fieldName).options.selectable"),
          fieldName: "\(fieldName).options.selectable"
        ),
        indexField: try optionalExpressionNode(options, key: "indexField", fieldName: "\(fieldName).options.indexField")
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

  private static func optionalExpressionNode(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> RNFBFirestoreParsedExpressionNode? {
    guard let value = map[key] else {
      return nil
    }

    return try parseExpressionNode(value, fieldName: fieldName)
  }

  private static func requireNumber(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> NSNumber {
    guard let value = map[key] as? NSNumber else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a number.")
    }

    return value
  }

  private static func optionalNumber(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> NSNumber? {
    guard let value = map[key] else {
      return nil
    }

    guard let number = value as? NSNumber else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a number.")
    }

    return number
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
    let accumulators = try parseAggregateNodes(
      requireArray(options, key: "accumulators", fieldName: "\(fieldName).accumulators"),
      fieldName: "\(fieldName).accumulators"
    )

    let groups: [RNFBFirestoreParsedSelectableNode]
    if options["groups"] != nil {
      groups = try parseSelectableNodes(
        requireArray(options, key: "groups", fieldName: "\(fieldName).groups"),
        fieldName: "\(fieldName).groups",
        requireNonEmpty: false
      )
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

    return RNFBFirestoreParsedFindNearestStage(
      field: try parseExpressionNode(
        requireValue(options, key: "field", fieldName: "\(fieldName).field"),
        fieldName: "\(fieldName).field"
      ),
      vectorValue: try parseValueNode(
        requireValue(options, key: "vectorValue", fieldName: "\(fieldName).vectorValue"),
        fieldName: "\(fieldName).vectorValue"
      ),
      distanceMeasure: distanceMeasure,
      limit: try optionalNumber(options, key: "limit", fieldName: "\(fieldName).limit"),
      distanceField: try optionalExpressionNode(options, key: "distanceField", fieldName: "\(fieldName).distanceField")
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

    return RNFBFirestoreParsedSampleStage(
      documents: try optionalNumber(options, key: "documents", fieldName: "\(fieldName).documents"),
      percentage: try optionalNumber(options, key: "percentage", fieldName: "\(fieldName).percentage")
    )
  }

  private static func parseSelectableNodes(
    _ values: [Any],
    fieldName: String,
    requireNonEmpty: Bool = true
  ) throws -> [RNFBFirestoreParsedSelectableNode] {
    if requireNonEmpty && values.isEmpty {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to contain at least one value.")
    }

    return try values.enumerated().map { index, value in
      try parseSelectableNode(value, fieldName: "\(fieldName)[\(index)]")
    }
  }

  private static func parseSelectableNode(
    _ value: Any,
    fieldName: String
  ) throws -> RNFBFirestoreParsedSelectableNode {
    if value is String {
      return RNFBFirestoreParsedSelectableNode(
        expression: try parseExpressionNode(value, fieldName: fieldName),
        alias: nil,
        isFlatFieldAlias: false
      )
    }

    guard let map = value as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a selectable expression.")
    }

    let alias = firstString(map["alias"], map["as"], map["name"])
    if let alias, !alias.isEmpty {
      if map["path"] != nil || map["fieldPath"] != nil || map["segments"] != nil {
        return RNFBFirestoreParsedSelectableNode(
          expression: .field(path: try coerceFieldPath(value, fieldName: "\(fieldName).path")),
          alias: alias,
          isFlatFieldAlias: true
        )
      }

      let expressionValue = firstNonNil(map["expr"], map["expression"], map["field"]) ?? value
      return RNFBFirestoreParsedSelectableNode(
        expression: try parseExpressionNode(expressionValue, fieldName: "\(fieldName).expr"),
        alias: alias,
        isFlatFieldAlias: false
      )
    }

    return RNFBFirestoreParsedSelectableNode(
      expression: try parseExpressionNode(value, fieldName: fieldName),
      alias: nil,
      isFlatFieldAlias: false
    )
  }

  private static func parseOrderingNodes(
    _ values: [Any],
    fieldName: String
  ) throws -> [RNFBFirestoreParsedOrderingNode] {
    guard !values.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to contain at least one value.")
    }

    return try values.enumerated().map { index, value in
      try parseOrderingNode(value, fieldName: "\(fieldName)[\(index)]")
    }
  }

  private static func parseOrderingNode(
    _ value: Any,
    fieldName: String
  ) throws -> RNFBFirestoreParsedOrderingNode {
    if value is String {
      return RNFBFirestoreParsedOrderingNode(
        expression: try parseExpressionNode(value, fieldName: fieldName),
        descending: false,
        fieldShortcut: true
      )
    }

    guard let map = value as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a string or object.")
    }

    let direction = (map["direction"] as? String) ?? "asc"
    let expressionValue = firstNonNil(
      map["expression"],
      map["expr"],
      map["field"],
      map["fieldPath"],
      map["path"],
      value
    ) as Any

    return RNFBFirestoreParsedOrderingNode(
      expression: try parseExpressionNode(expressionValue, fieldName: fieldName),
      descending: isDescendingDirection(direction),
      fieldShortcut: false
    )
  }

  private static func parseAggregateNodes(
    _ values: [Any],
    fieldName: String
  ) throws -> [RNFBFirestoreParsedAggregateNode] {
    guard !values.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to contain at least one value.")
    }

    return try values.enumerated().map { index, value in
      try parseAggregateNode(value, fieldName: "\(fieldName)[\(index)]")
    }
  }

  private static func parseAggregateNode(
    _ value: Any,
    fieldName: String
  ) throws -> RNFBFirestoreParsedAggregateNode {
    guard let map = value as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be an object.")
    }

    let aggregateValue = map["aggregate"] ?? value
    guard let aggregateMap = aggregateValue as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).aggregate to be an object.")
    }

    guard let kind = firstString(
      aggregateMap["kind"],
      aggregateMap["name"],
      aggregateMap["function"],
      aggregateMap["op"]
    ), !kind.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to include an aggregate kind.")
    }

    let alias = firstString(map["alias"], map["as"], map["name"]) ?? kind.lowercased()
    let primaryExpression = firstNonNil(aggregateMap["expr"], aggregateMap["field"]) ?? aggregateMap["value"]
    let primaryValue = try primaryExpression.map {
      try parseValueNode($0, fieldName: "\(fieldName).expr")
    }
    let args = try parseArgumentValueNodes(aggregateMap["args"], fieldName: "\(fieldName).args")

    return RNFBFirestoreParsedAggregateNode(kind: kind, alias: alias, primaryValue: primaryValue, args: args)
  }

  private static func parseExpressionNode(
    _ value: Any,
    fieldName: String
  ) throws -> RNFBFirestoreParsedExpressionNode {
    if let stringValue = value as? String {
      return .field(path: stringValue)
    }

    if let map = value as? [String: Any] {
      if let nested = map["expr"] {
        return try parseExpressionNode(nested, fieldName: "\(fieldName).expr")
      }
      if let nested = map["expression"] {
        return try parseExpressionNode(nested, fieldName: "\(fieldName).expression")
      }

      if let operatorName = map["operator"] as? String {
        return try parseOperatorExpressionNode(map: map, operatorName: operatorName, fieldName: fieldName)
      }

      if let exprType = map["exprType"] as? String {
        let normalizedType = exprType.lowercased()
        if normalizedType == "field" {
          return .field(path: try coerceFieldPath(value, fieldName: fieldName))
        }
        if normalizedType == "constant" {
          return .constant(try parseValueNode(map["value"] as Any, fieldName: "\(fieldName).value"))
        }
      }

      if map["name"] != nil {
        guard let nameValue = map["name"] as? String, !nameValue.isEmpty else {
          throw PipelineValidationError("pipelineExecute() expected \(fieldName).name to be a non-empty string.")
        }

        return .function(
          name: nameValue,
          args: try parseArgumentValueNodes(map["args"], fieldName: "\(fieldName).args")
        )
      }

      if map["fieldPath"] != nil || map["path"] != nil || map["segments"] != nil || map["_segments"] != nil {
        return .field(path: try coerceFieldPath(value, fieldName: fieldName))
      }
    }

    return .constant(try parseValueNode(value, fieldName: fieldName))
  }

  private static func parseOperatorExpressionNode(
    map: [String: Any],
    operatorName: String,
    fieldName: String
  ) throws -> RNFBFirestoreParsedExpressionNode {
    let normalizedOperator = operatorName.uppercased()
    if normalizedOperator == "AND" || normalizedOperator == "OR" {
      guard let queries = map["queries"] as? [Any], !queries.isEmpty else {
        throw PipelineValidationError("pipelineExecute() expected \(fieldName).queries to contain boolean expressions.")
      }

      let args = try queries.enumerated().map { index, query in
        RNFBFirestoreParsedValueNode.expression(
          try parseExpressionNode(query, fieldName: "\(fieldName).queries[\(index)]")
        )
      }
      return .function(name: normalizedOperator == "AND" ? "and" : "or", args: args)
    }

    let fieldValue = map["fieldPath"] ?? map["field"]
    guard let fieldValue else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).fieldPath to be provided.")
    }

    let rightValue = map["value"] ?? map["right"] ?? map["operand"] ?? NSNull()
    return .function(name: mapOperatorToFunction(normalizedOperator), args: [
      .expression(try parseExpressionNode(fieldValue, fieldName: "\(fieldName).fieldPath")),
      try parseValueNode(rightValue, fieldName: "\(fieldName).value"),
    ])
  }

  private static func parseArgumentValueNodes(
    _ argsValue: Any?,
    fieldName: String
  ) throws -> [RNFBFirestoreParsedValueNode] {
    guard let argsValue else {
      return []
    }

    if let rawArgs = argsValue as? [Any] {
      return try rawArgs.enumerated().map { index, value in
        try parseValueNode(value, fieldName: "\(fieldName)[\(index)]")
      }
    }

    return [try parseValueNode(argsValue, fieldName: "\(fieldName)[0]")]
  }

  private static func parseValueNode(
    _ value: Any,
    fieldName: String
  ) throws -> RNFBFirestoreParsedValueNode {
    if let map = value as? [String: Any] {
      if isExpressionLike(map) {
        return .expression(try parseExpressionNode(value, fieldName: fieldName))
      }

      return .map(try map.reduce(into: [String: RNFBFirestoreParsedValueNode]()) { result, entry in
        result[entry.key] = try parseValueNode(entry.value, fieldName: "\(fieldName).\(entry.key)")
      })
    }

    if let list = value as? [Any] {
      return .list(try list.enumerated().map { index, entry in
        try parseValueNode(entry, fieldName: "\(fieldName)[\(index)]")
      })
    }

    return .primitive(value)
  }

  private static func parseQuerySourceValueNode(
    _ value: Any,
    fieldName: String
  ) throws -> RNFBFirestoreParsedValueNode {
    let rootBox = ParsedValueNodeBox()
    var stack: [QuerySourceValueParseFrame] = [
      .enter(value, rootBox),
    ]

    while let frame = stack.popLast() {
      switch frame {
      case let .enter(value, box):
        if let map = value as? [String: Any] {
          let entries = map.map { (key: $0.key, value: $0.value, box: ParsedValueNodeBox()) }
          stack.append(.exitMap(box, entries.map { ($0.key, $0.box) }))
          for entry in entries.reversed() {
            stack.append(.enter(entry.value, entry.box))
          }
          continue
        }

        if let list = value as? [Any] {
          let childBoxes = list.map { _ in ParsedValueNodeBox() }
          stack.append(.exitList(box, childBoxes))
          for index in list.indices.reversed() {
            stack.append(.enter(list[index], childBoxes[index]))
          }
          continue
        }

        box.value = .primitive(value)
      case let .exitList(box, childBoxes):
        box.value = .list(try childBoxes.enumerated().map { index, childBox in
          guard let value = childBox.value else {
            throw PipelineValidationError("pipelineExecute() expected \(fieldName)[\(index)] to be provided.")
          }
          return value
        })
      case let .exitMap(box, entries):
        box.value = .map(try entries.reduce(into: [String: RNFBFirestoreParsedValueNode]()) { result, entry in
          guard let value = entry.1.value else {
            throw PipelineValidationError("pipelineExecute() expected \(fieldName).\(entry.0) to be provided.")
          }
          result[entry.0] = value
        })
      }
    }

    guard let parsedValue = rootBox.value else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be provided.")
    }

    return parsedValue
  }

  private static func isExpressionLike(_ map: [String: Any]) -> Bool {
    map["exprType"] != nil || map["operator"] != nil || map["name"] != nil || map["expr"] != nil ||
      map["expression"] != nil || map["fieldPath"] != nil || map["path"] != nil ||
      map["segments"] != nil || map["_segments"] != nil
  }

  private static func coerceFieldPath(
    _ value: Any,
    fieldName: String
  ) throws -> String {
    if let fieldPath = value as? String, !fieldPath.isEmpty {
      return fieldPath
    }

    if let map = value as? [String: Any] {
      let path = firstNonNil(map["path"], map["fieldPath"])
      if let path, !(path is [String: Any]) {
        return try coerceFieldPath(path, fieldName: fieldName)
      }

      let segments = (map["segments"] as? [Any]) ?? (map["_segments"] as? [Any])
      if let segments {
        let stringSegments = try segments.enumerated().map { _, segment -> String in
          guard let stringSegment = segment as? String else {
            throw PipelineValidationError("pipelineExecute() expected \(fieldName) segment values to be strings.")
          }
          return stringSegment
        }

        let pathValue = stringSegments.joined(separator: ".")
        if !pathValue.isEmpty {
          return pathValue
        }
      }
    }

    throw PipelineValidationError("pipelineExecute() expected \(fieldName) to resolve to a field path string.")
  }

  private static func firstString(_ values: Any?...) -> String? {
    for value in values {
      if let stringValue = value as? String, !stringValue.isEmpty {
        return stringValue
      }
    }

    return nil
  }

  private static func firstNonNil(_ values: Any?...) -> Any? {
    for value in values where value != nil {
      return value
    }

    return nil
  }

  private static func isDescendingDirection(_ direction: String?) -> Bool {
    guard let direction else {
      return false
    }

    let normalized = direction.lowercased()
    return normalized == "desc" || normalized == "descending"
  }

  private static func mapOperatorToFunction(_ operatorName: String) -> String {
    switch operatorName {
    case "==", "=", "EQUAL": return "equal"
    case "!=", "<>", "NOT_EQUAL": return "not_equal"
    case ">", "GREATER_THAN": return "greater_than"
    case ">=", "GREATER_THAN_OR_EQUAL": return "greater_than_or_equal"
    case "<", "LESS_THAN": return "less_than"
    case "<=", "LESS_THAN_OR_EQUAL": return "less_than_or_equal"
    case "ARRAY_CONTAINS", "ARRAY-CONTAINS": return "array_contains"
    case "ARRAY_CONTAINS_ANY", "ARRAY-CONTAINS-ANY": return "array_contains_any"
    case "ARRAY_CONTAINS_ALL", "ARRAY-CONTAINS-ALL": return "array_contains_all"
    case "IN": return "equal_any"
    case "NOT_IN": return "not_equal_any"
    default: return operatorName.lowercased()
    }
  }
}
