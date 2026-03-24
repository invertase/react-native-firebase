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

final class RNFBFirestorePipelineBridgeFactory {
  private let nodeBuilder = RNFBFirestorePipelineNodeBuilder()

  private final class StageBridgeBox {
    var stages: [StageBridge]?
  }

  private enum PendingStageBridge {
    case ready(StageBridge)
    case union(StageBridgeBox)
  }

  private enum StageBridgeFrame {
    case enter(
      request: RNFBFirestoreParsedPipelineRequest,
      box: StageBridgeBox
    )
    case exit(
      sourceStages: [StageBridge],
      pendingStages: [PendingStageBridge],
      box: StageBridgeBox
    )
  }

  private final class QuerySourceValueBox {
    var value: Any?
  }

  private enum QuerySourceBuildFrame {
    case value(
      RNFBFirestoreParsedValueNode,
      QuerySourceValueBox
    )
    case valueListExit(
      QuerySourceValueBox,
      [QuerySourceValueBox]
    )
    case valueMapExit(
      QuerySourceValueBox,
      [(String, QuerySourceValueBox)]
    )
    case expression(
      RNFBFirestoreParsedExpressionNode,
      QuerySourceValueBox
    )
    case expressionConstantExit(
      QuerySourceValueBox,
      QuerySourceValueBox
    )
    case expressionFunctionExit(
      String,
      QuerySourceValueBox,
      [QuerySourceValueBox]
    )
  }

  func buildStageBridges(
    firestore: Firestore,
    request: RNFBFirestoreParsedPipelineRequest
  ) throws -> [StageBridge] {
    let rootBox = StageBridgeBox()
    var stack: [StageBridgeFrame] = [
      .enter(request: request, box: rootBox),
    ]

    while let frame = stack.popLast() {
      switch frame {
      case let .enter(request, box):
        let sourceStages = try buildSourceStageBridges(firestore: firestore, source: request.source)
        var pendingStages: [PendingStageBridge] = []
        var nestedRequests: [(RNFBFirestoreParsedPipelineRequest, StageBridgeBox)] = []
        pendingStages.reserveCapacity(request.stages.count)

        for stage in request.stages {
          if case let .unionStage(parsed) = stage {
            let childBox = StageBridgeBox()
            pendingStages.append(.union(childBox))
            nestedRequests.append((parsed.other, childBox))
          } else {
            pendingStages.append(.ready(try buildStageBridge(stage, firestore: firestore)))
          }
        }

        stack.append(.exit(
          sourceStages: sourceStages,
          pendingStages: pendingStages,
          box: box
        ))

        for (nestedRequest, childBox) in nestedRequests.reversed() {
          stack.append(.enter(request: nestedRequest, box: childBox))
        }
      case let .exit(sourceStages, pendingStages, box):
        var stageBridges = sourceStages
        for pendingStage in pendingStages {
          switch pendingStage {
          case let .ready(stageBridge):
            stageBridges.append(stageBridge)
          case let .union(childBox):
            guard let childStages = childBox.stages else {
              throw PipelineValidationError("pipelineExecute() failed to build nested union pipeline.")
            }
            stageBridges.append(UnionStageBridge(other: PipelineBridge(stages: childStages, db: firestore)))
          }
        }

        box.stages = stageBridges
      }
    }

    guard let stageBridges = rootBox.stages else {
      throw PipelineValidationError("pipelineExecute() failed to build pipeline stages.")
    }

    return stageBridges
  }

  private func buildSourceStageBridges(
    firestore: Firestore,
    source: RNFBFirestoreParsedPipelineSource
  ) throws -> [StageBridge] {
    let sourceType = source.sourceType

    switch sourceType {
    case "collection":
      guard let path = source.path else {
        throw PipelineValidationError("pipelineExecute() expected pipeline.source.path to be a non-empty string.")
      }
      return [CollectionSourceStageBridge(ref: firestore.collection(path), firestore: firestore)]
    case "collectionGroup":
      guard let collectionId = source.collectionId else {
        throw PipelineValidationError(
          "pipelineExecute() expected pipeline.source.collectionId to be a non-empty string.")
      }
      return [CollectionGroupSourceStageBridge(collectionId: collectionId)]
    case "database":
      return [DatabaseSourceStageBridge()]
    case "documents":
      guard !source.documents.isEmpty else {
        throw PipelineValidationError(
          "pipelineExecute() expected pipeline.source.documents to contain at least one document path.")
      }
      let refs = source.documents.map { firestore.document($0) }
      return [DocumentsSourceStageBridge(documents: refs, firestore: firestore)]
    case "query":
      guard let path = source.path else {
        throw PipelineValidationError("pipelineExecute() expected pipeline.source.path to be a non-empty string.")
      }
      guard let queryType = source.queryType else {
        throw PipelineValidationError("pipelineExecute() expected pipeline.source.queryType to be a non-empty string.")
      }
      guard let querySource = source.query else {
        throw PipelineValidationError("pipelineExecute() expected query source payload to be provided.")
      }

      let baseQuery = RNFBFirestoreCommon.getQueryFor(firestore, path: path, type: queryType)
      let query = RNFBFirestoreQuery(
        modifiers: firestore,
        query: baseQuery,
        filters: buildQuerySourceArray(querySource.filters),
        orders: buildQuerySourceArray(querySource.orders),
        options: buildQuerySourceMap(querySource.options)
      ).instance()

      guard let query else {
        throw PipelineValidationError("pipelineExecute() expected query source to be a valid query.")
      }

      return PipelineBridge.createStageBridges(from: query)
    default:
      throw PipelineValidationError("pipelineExecute() received an unknown source type.")
    }
  }

  private func buildStageBridge(
    _ stage: RNFBFirestoreParsedPipelineStage,
    firestore: Firestore
  ) throws -> StageBridge {
    switch stage {
    case let .whereStage(parsed):
      return WhereStageBridge(
        expr: try nodeBuilder.coerceBooleanExpression(parsed.condition, fieldName: "stage.options.condition"))
    case let .selectStage(parsed):
      return SelectStageBridge(
        selections: try nodeBuilder.coerceNamedSelectables(parsed.selections, fieldName: "stage.options.selections"))
    case let .addFieldsStage(parsed):
      return AddFieldsStageBridge(
        fields: try nodeBuilder.coerceNamedSelectables(parsed.fields, fieldName: "stage.options.fields"))
    case let .removeFieldsStage(parsed):
      return RemoveFieldsStageBridge(
        fields: parsed.fields)
    case let .sortStage(parsed):
      return SortStageBridge(
        orderings: try nodeBuilder.coerceOrderings(parsed.orderings, fieldName: "stage.options.orderings"))
    case let .limitStage(parsed):
      return LimitStageBridge(limit: try nodeBuilder.coerceInt(parsed.limit, fieldName: "stage.options.limit"))
    case let .offsetStage(parsed):
      return OffsetStageBridge(offset: try nodeBuilder.coerceInt(parsed.offset, fieldName: "stage.options.offset"))
    case let .aggregateStage(parsed):
      return try buildAggregateStage(parsed)
    case let .distinctStage(parsed):
      return DistinctStageBridge(
        groups: try nodeBuilder.coerceNamedSelectables(parsed.groups, fieldName: "stage.options.groups"))
    case let .findNearestStage(parsed):
      return try buildFindNearestStage(parsed)
    case let .replaceWithStage(parsed):
      return ReplaceWithStageBridge(expr: try nodeBuilder.coerceExpression(parsed.value, fieldName: "stage.options.map"))
    case let .sampleStage(parsed):
      if let documents = parsed.documents {
        return SampleStageBridge(count: Int64(try nodeBuilder.coerceInt(documents, fieldName: "stage.options.documents")))
      }
      if let percentage = parsed.percentage {
        return SampleStageBridge(percentage: try coerceNumber(percentage, fieldName: "stage.options.percentage"))
      }
      throw PipelineValidationError("pipelineExecute() expected sample stage to include documents or percentage.")
    case .unionStage:
      throw PipelineValidationError("pipelineExecute() failed to build nested union pipeline.")
    case let .unnestStage(parsed):
      let expression = try nodeBuilder.coerceExpression(parsed.selectable.expression, fieldName: "stage.options.selectable")
      let alias = nodeBuilder.coerceAlias(from: parsed.selectable) ?? "_unnest"
      let indexExpr: ExprBridge?
      if let indexField = parsed.indexField {
        indexExpr = try nodeBuilder.coerceExpression(indexField, fieldName: "stage.options.indexField")
      } else {
        indexExpr = nil
      }
      return UnnestStageBridge(field: expression, alias: FieldBridge(name: alias), indexField: indexExpr)
    case let .rawStage(parsed):
      return RawStageBridge(
        name: parsed.name,
        params: try nodeBuilder.coerceRawParams(parsed.params, fieldName: "stage.options.params"),
        options: try nodeBuilder.coerceRawOptions(parsed.options, fieldName: "stage.options.options")
      )
    }
  }

  private func buildAggregateStage(_ stage: RNFBFirestoreParsedAggregateStage) throws -> StageBridge {
    var accumulators: [String: AggregateFunctionBridge] = [:]
    for (index, accumulator) in stage.accumulators.enumerated() {
      let aggregate = try nodeBuilder.coerceAliasedAggregate(
        accumulator,
        fieldName: "stage.options.accumulators[\(index)]"
      )
      accumulators[aggregate.alias] = aggregate.function
    }

    let groups = stage.groups.isEmpty
      ? [:]
      : try nodeBuilder.coerceNamedSelectables(stage.groups, fieldName: "stage.options.groups")

    return AggregateStageBridge(accumulators: accumulators, groups: groups)
  }

  private func buildFindNearestStage(_ stage: RNFBFirestoreParsedFindNearestStage) throws -> StageBridge {
    let fieldPath = try nodeBuilder.coerceFieldPath(stage.field, fieldName: "stage.options.field")
    let vector = try nodeBuilder.coerceVector(stage.vectorValue, fieldName: "findNearest.vectorValue")
    let distanceFieldExpr: ExprBridge?
    if let distanceField = stage.distanceField {
      distanceFieldExpr = try nodeBuilder.coerceExpression(distanceField, fieldName: "stage.options.distanceField")
    } else {
      distanceFieldExpr = nil
    }

    return FindNearestStageBridge(
      field: FieldBridge(name: fieldPath),
      vectorValue: VectorValue(__array: vector.map { NSNumber(value: $0) }),
      distanceMeasure: stage.distanceMeasure.lowercased(),
      limit: stage.limit,
      distanceField: distanceFieldExpr
    )
  }

  private func coerceNumber(_ value: Any, fieldName: String) throws -> Double {
    if let number = value as? NSNumber {
      return number.doubleValue
    }
    throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a number.")
  }

  private func buildQuerySourceArray(_ values: [RNFBFirestoreParsedValueNode]) -> [Any] {
    values.map(buildQuerySourceValue)
  }

  private func buildQuerySourceMap(_ values: [String: RNFBFirestoreParsedValueNode]) -> [String: Any] {
    values.reduce(into: [String: Any]()) { result, entry in
      result[entry.key] = buildQuerySourceValue(entry.value)
    }
  }

  private func buildQuerySourceValue(_ value: RNFBFirestoreParsedValueNode) -> Any {
    let rootBox = QuerySourceValueBox()
    var stack: [QuerySourceBuildFrame] = [
      .value(value, rootBox),
    ]

    while let frame = stack.popLast() {
      switch frame {
      case let .value(value, box):
        switch value {
        case let .primitive(primitive):
          box.value = primitive
        case let .list(values):
          let childBoxes = values.map { _ in QuerySourceValueBox() }
          stack.append(.valueListExit(box, childBoxes))
          for index in values.indices.reversed() {
            stack.append(.value(values[index], childBoxes[index]))
          }
        case let .map(values):
          let entries = values.map { (key: $0.key, box: QuerySourceValueBox(), value: $0.value) }
          stack.append(.valueMapExit(box, entries.map { ($0.key, $0.box) }))
          for entry in entries.reversed() {
            stack.append(.value(entry.value, entry.box))
          }
        case let .expression(expression):
          stack.append(.expression(expression, box))
        }
      case let .valueListExit(box, childBoxes):
        box.value = childBoxes.map { $0.value as Any }
      case let .valueMapExit(box, entries):
        var output: [String: Any] = [:]
        for (key, childBox) in entries {
          output[key] = childBox.value
        }
        box.value = output
      case let .expression(expression, box):
        switch expression {
        case let .field(path):
          box.value = [
            "__kind": "expression",
            "exprType": "Field",
            "path": path,
          ]
        case let .constant(value):
          let childBox = QuerySourceValueBox()
          stack.append(.expressionConstantExit(box, childBox))
          stack.append(.value(value, childBox))
        case let .function(name, args):
          let childBoxes = args.map { _ in QuerySourceValueBox() }
          stack.append(.expressionFunctionExit(name, box, childBoxes))
          for index in args.indices.reversed() {
            stack.append(.value(args[index], childBoxes[index]))
          }
        }
      case let .expressionConstantExit(box, childBox):
        box.value = [
          "__kind": "expression",
          "exprType": "Constant",
          "value": childBox.value as Any,
        ]
      case let .expressionFunctionExit(name, box, childBoxes):
        box.value = [
          "__kind": "expression",
          "exprType": "Function",
          "name": name,
          "args": childBoxes.map { $0.value as Any },
        ]
      }
    }

    guard let value = rootBox.value else {
      return NSNull()
    }
    return value
  }
}
