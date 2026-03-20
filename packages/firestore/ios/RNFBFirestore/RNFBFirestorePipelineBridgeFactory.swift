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

  func buildStageBridges(
    firestore: Firestore,
    request: RNFBFirestoreParsedPipelineRequest
  ) throws -> [StageBridge] {
    var stageBridges = try buildSourceStageBridges(firestore: firestore, source: request.source)
    for stage in request.stages {
      stageBridges.append(try buildStageBridge(stage, firestore: firestore))
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
    case let .unionStage(parsed):
      let otherStages = try buildStageBridges(firestore: firestore, request: parsed.other)
      return UnionStageBridge(other: PipelineBridge(stages: otherStages, db: firestore))
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
    switch value {
    case let .primitive(primitive):
      return primitive
    case let .list(values):
      return buildQuerySourceArray(values)
    case let .map(values):
      return buildQuerySourceMap(values)
    case let .expression(expression):
      return buildQuerySourceExpression(expression)
    }
  }

  private func buildQuerySourceExpression(_ expression: RNFBFirestoreParsedExpressionNode) -> Any {
    switch expression {
    case let .field(path):
      return [
        "__kind": "expression",
        "exprType": "Field",
        "path": path,
      ]
    case let .constant(value):
      return [
        "__kind": "expression",
        "exprType": "Constant",
        "value": buildQuerySourceValue(value),
      ]
    case let .function(name, args):
      return [
        "__kind": "expression",
        "exprType": "Function",
        "name": name,
        "args": buildQuerySourceArray(args),
      ]
    }
  }
}
