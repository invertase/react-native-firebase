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
  private static let sourceTypes: Set<String> = [
    "collection", "collectionGroup", "database", "documents", "query",
  ]

  private static let knownStages: Set<String> = [
    "where", "select", "addFields", "removeFields", "sort", "limit", "offset",
    "aggregate", "distinct", "findNearest", "replaceWith", "sample", "union", "unnest", "rawStage",
  ]

  private static let metadataFallbackStages: Set<String> = ["select", "addFields", "removeFields"]

  @objc(executeWithFirestore:pipeline:options:completion:)
  public func execute(
    withFirestore firestore: Firestore,
    pipeline: NSDictionary?,
    options: NSDictionary?,
    completion: @escaping ([AnyHashable: Any]?, [AnyHashable: Any]?) -> Void
  ) {
    do {
      let pipelineMap = try validateAndNormalizePipeline(pipeline, options: options)
      let metadata = buildExecutionMetadata(pipelineMap)
      let stageBridges = try buildStageBridges(firestore: firestore, pipeline: pipelineMap)

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
          completion(try self.serializeSnapshot(snapshot, metadata: metadata), nil)
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

  private func validateAndNormalizePipeline(
    _ pipeline: NSDictionary?,
    options: NSDictionary?
  ) throws -> [String: Any] {
    guard let pipeline = pipeline as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected a pipeline object.")
    }

    guard let source = pipeline["source"] as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected pipeline.source to be an object.")
    }

    guard let stages = pipeline["stages"] as? [[String: Any]] else {
      throw PipelineValidationError("pipelineExecute() expected pipeline.stages to be an array.")
    }

    try validateSource(source)
    try validateStages(stages)
    try validateOptions(options as? [String: Any])

    return pipeline
  }

  private func validateSource(_ source: [String: Any]) throws {
    guard let sourceType = source["source"] as? String else {
      throw PipelineValidationError("pipelineExecute() expected pipeline.source.source to be a string.")
    }

    guard Self.sourceTypes.contains(sourceType) else {
      throw PipelineValidationError("pipelineExecute() received an unknown source type.")
    }

    switch sourceType {
    case "collection":
      try rejectUnsupportedSourceRawOptions(source, sourceType: sourceType)
      _ = try requireNonEmptyString(source, key: "path", fieldName: "pipeline.source.path")
    case "collectionGroup":
      try rejectUnsupportedSourceRawOptions(source, sourceType: sourceType)
      _ = try requireNonEmptyString(source, key: "collectionId", fieldName: "pipeline.source.collectionId")
    case "database":
      try rejectUnsupportedSourceRawOptions(source, sourceType: sourceType)
    case "documents":
      guard let documents = source["documents"] as? [Any] else {
        throw PipelineValidationError("pipelineExecute() expected pipeline.source.documents to be an array.")
      }
      guard !documents.isEmpty else {
        throw PipelineValidationError(
          "pipelineExecute() expected pipeline.source.documents to contain at least one document path.")
      }
      for value in documents where !(value is String) {
        throw PipelineValidationError("pipelineExecute() expected pipeline.source.documents entries to be strings.")
      }
    case "query":
      _ = try requireNonEmptyString(source, key: "path", fieldName: "pipeline.source.path")
      _ = try requireNonEmptyString(source, key: "queryType", fieldName: "pipeline.source.queryType")
      guard source["filters"] is [Any] else {
        throw PipelineValidationError("pipelineExecute() expected pipeline.source.filters to be an array.")
      }
      guard source["orders"] is [Any] else {
        throw PipelineValidationError("pipelineExecute() expected pipeline.source.orders to be an array.")
      }
      guard source["options"] is [String: Any] else {
        throw PipelineValidationError("pipelineExecute() expected pipeline.source.options to be an object.")
      }
    default:
      break
    }
  }

  private func validateStages(_ stages: [[String: Any]]) throws {
    for stage in stages {
      guard let stageName = stage["stage"] as? String else {
        throw PipelineValidationError("pipelineExecute() expected each stage.stage to be a string.")
      }

      guard !stageName.isEmpty else {
        throw PipelineValidationError("pipelineExecute() expected each stage.stage to be a non-empty string.")
      }

      guard Self.knownStages.contains(stageName) else {
        throw PipelineValidationError("pipelineExecute() received an unknown stage: \(stageName).")
      }

      guard stage["options"] is [String: Any] else {
        throw PipelineValidationError("pipelineExecute() expected each stage.options to be an object.")
      }
    }
  }

  private func validateOptions(_ options: [String: Any]?) throws {
    guard let options else {
      return
    }

    if let indexMode = options["indexMode"], !(indexMode is String) {
      throw PipelineValidationError("pipelineExecute() expected options.indexMode to be a string.")
    }

    if let indexMode = options["indexMode"] as? String {
      if indexMode != "recommended" {
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
  }

  private func rejectUnsupportedSourceRawOptions(
    _ source: [String: Any],
    sourceType: String
  ) throws {
    guard let rawOptions = source["rawOptions"] else {
      return
    }

    guard rawOptions is [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected pipeline.source.rawOptions to be an object.")
    }

    throw PipelineValidationError(
      "pipelineExecute() does not support pipeline.source.rawOptions for \(sourceType) on iOS because the native Firestore pipeline SDK does not expose source options.")
  }

  private func buildStageBridges(
    firestore: Firestore,
    pipeline: [String: Any]
  ) throws -> [StageBridge] {
    guard let source = pipeline["source"] as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() expected pipeline.source to be an object.")
    }
    guard let stages = pipeline["stages"] as? [[String: Any]] else {
      throw PipelineValidationError("pipelineExecute() expected pipeline.stages to be an array.")
    }

    var stageBridges = try buildSourceStageBridges(firestore: firestore, source: source)
    for stage in stages {
      guard let stageName = stage["stage"] as? String,
            let stageOptions = stage["options"] as? [String: Any] else {
        throw PipelineValidationError("pipelineExecute() expected each stage to include stage and options.")
      }

      stageBridges.append(try buildStageBridge(stageName: stageName, options: stageOptions, firestore: firestore))
    }

    return stageBridges
  }

  private func buildSourceStageBridges(
    firestore: Firestore,
    source: [String: Any]
  ) throws -> [StageBridge] {
    let sourceType = try requireNonEmptyString(source, key: "source", fieldName: "pipeline.source.source")

    switch sourceType {
    case "collection":
      let path = try requireNonEmptyString(source, key: "path", fieldName: "pipeline.source.path")
      return [CollectionSourceStageBridge(ref: firestore.collection(path), firestore: firestore)]
    case "collectionGroup":
      let collectionId = try requireNonEmptyString(source, key: "collectionId", fieldName: "pipeline.source.collectionId")
      return [CollectionGroupSourceStageBridge(collectionId: collectionId)]
    case "database":
      return [DatabaseSourceStageBridge()]
    case "documents":
      guard let documents = source["documents"] as? [String], !documents.isEmpty else {
        throw PipelineValidationError(
          "pipelineExecute() expected pipeline.source.documents to contain at least one document path.")
      }
      let refs = documents.map { firestore.document($0) }
      return [DocumentsSourceStageBridge(documents: refs, firestore: firestore)]
    case "query":
      let path = try requireNonEmptyString(source, key: "path", fieldName: "pipeline.source.path")
      let queryType = try requireNonEmptyString(source, key: "queryType", fieldName: "pipeline.source.queryType")
      let filters = source["filters"] as? [Any] ?? []
      let orders = source["orders"] as? [Any] ?? []
      let queryOptions = source["options"] as? [String: Any] ?? [:]

      let baseQuery = RNFBFirestoreCommon.getQueryFor(firestore, path: path, type: queryType)
      let query = RNFBFirestoreQuery(
        modifiers: firestore,
        query: baseQuery,
        filters: filters,
        orders: orders,
        options: queryOptions
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
    stageName: String,
    options: [String: Any],
    firestore: Firestore
  ) throws -> StageBridge {
    switch stageName {
    case "where":
      let condition = try requireValue(options, key: "condition", fieldName: "stage.options.condition")
      return WhereStageBridge(expr: try coerceBooleanExpression(condition, fieldName: "stage.options.condition"))
    case "select":
      return SelectStageBridge(selections: try coerceNamedSelectables(options, key: "selections"))
    case "addFields":
      return AddFieldsStageBridge(fields: try coerceNamedSelectables(options, key: "fields"))
    case "removeFields":
      return RemoveFieldsStageBridge(fields: try coerceStringArray(options, key: "fields"))
    case "sort":
      return SortStageBridge(orderings: try coerceOrderings(options))
    case "limit":
      return LimitStageBridge(limit: try coerceInt(options, key: "limit"))
    case "offset":
      return OffsetStageBridge(offset: try coerceInt(options, key: "offset"))
    case "aggregate":
      return try buildAggregateStage(options)
    case "distinct":
      return DistinctStageBridge(groups: try coerceNamedSelectables(options, key: "groups"))
    case "findNearest":
      return try buildFindNearestStage(options)
    case "replaceWith":
      let value = try requireValue(options, key: "map", fieldName: "stage.options.map")
      return ReplaceWithStageBridge(expr: try coerceExpression(value, fieldName: "stage.options.map"))
    case "sample":
      if let documents = options["documents"] {
        return SampleStageBridge(count: Int64(try coerceNumber(documents, fieldName: "stage.options.documents")))
      }
      if let percentage = options["percentage"] {
        return SampleStageBridge(percentage: try coerceNumber(percentage, fieldName: "stage.options.percentage"))
      }
      throw PipelineValidationError("pipelineExecute() expected sample stage to include documents or percentage.")
    case "union":
      guard let other = options["other"] as? [String: Any] else {
        throw PipelineValidationError(
          "pipelineExecute() expected stage.options.other to be a serialized pipeline object.")
      }
      let otherStages = try buildStageBridges(firestore: firestore, pipeline: other)
      return UnionStageBridge(other: PipelineBridge(stages: otherStages, db: firestore))
    case "unnest":
      let selectable = try requireValue(options, key: "selectable", fieldName: "stage.options.selectable")
      let expression = try coerceExpression(selectable, fieldName: "stage.options.selectable")
      let alias = coerceAlias(from: selectable) ?? "_unnest"
      let indexExpr: ExprBridge?
      if let indexField = options["indexField"] {
        indexExpr = try coerceExpression(indexField, fieldName: "stage.options.indexField")
      } else {
        indexExpr = nil
      }
      return UnnestStageBridge(field: expression, alias: FieldBridge(name: alias), indexField: indexExpr)
    case "rawStage":
      let name = try requireNonEmptyString(options, key: "name", fieldName: "stage.options.name")
      let params = options["params"]
      let rawOptions = options["options"] as? [String: Any]
      return RawStageBridge(name: name, params: try coerceRawParams(params), options: try coerceRawOptions(rawOptions))
    default:
      throw PipelineValidationError("pipelineExecute() received an unknown stage: \(stageName).")
    }
  }

  private func buildAggregateStage(_ options: [String: Any]) throws -> StageBridge {
    let rawAccumulators = try requireArray(options, key: "accumulators", fieldName: "stage.options.accumulators")
    guard !rawAccumulators.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected stage.options.accumulators to contain at least one value.")
    }

    var accumulators: [String: AggregateFunctionBridge] = [:]
    for (index, value) in rawAccumulators.enumerated() {
      guard let map = value as? [String: Any] else {
        throw PipelineValidationError("pipelineExecute() expected stage.options.accumulators[\(index)] to be an object.")
      }

      let alias = (map["alias"] as? String) ?? (map["as"] as? String) ?? (map["name"] as? String) ?? "acc_\(index)"
      let aggregateFn = try coerceAggregateFunction(map, fieldName: "stage.options.accumulators[\(index)]")
      accumulators[alias] = aggregateFn
    }

    let groups = try coerceOptionalNamedSelectables(options, key: "groups")
    return AggregateStageBridge(accumulators: accumulators, groups: groups)
  }

  private func buildFindNearestStage(_ options: [String: Any]) throws -> StageBridge {
    let fieldValue = try requireValue(options, key: "field", fieldName: "stage.options.field")
    let fieldPath = try coerceFieldPath(fieldValue, fieldName: "stage.options.field")
    let vector = try coerceVector(options["vectorValue"])
    let distanceMeasure = try requireNonEmptyString(options, key: "distanceMeasure", fieldName: "stage.options.distanceMeasure")

    let limit = options["limit"] as? NSNumber
    let distanceFieldExpr: ExprBridge?
    if let distanceField = options["distanceField"] {
      distanceFieldExpr = try coerceExpression(distanceField, fieldName: "stage.options.distanceField")
    } else {
      distanceFieldExpr = nil
    }

    return FindNearestStageBridge(
      field: FieldBridge(name: fieldPath),
      vectorValue: VectorValue(__array: vector.map { NSNumber(value: $0) }),
      distanceMeasure: distanceMeasure.lowercased(),
      limit: limit,
      distanceField: distanceFieldExpr
    )
  }

  private func coerceExpression(_ value: Any, fieldName: String) throws -> ExprBridge {
    if let stringValue = value as? String {
      return FieldBridge(name: stringValue)
    }

    if let expression = value as? ExprBridge {
      return expression
    }

    if value is NSNull || value is NSNumber || value is Date || value is Timestamp ||
      value is GeoPoint || value is DocumentReference || value is VectorValue {
      return ConstantBridge(value)
    }

    guard let map = value as? [String: Any] else {
      throw PipelineValidationError("pipelineExecute() could not convert \(fieldName) into a pipeline expression.")
    }

    if let nested = map["expr"] {
      return try coerceExpression(nested, fieldName: "\(fieldName).expr")
    }
    if let nested = map["expression"] {
      return try coerceExpression(nested, fieldName: "\(fieldName).expression")
    }

    if let operatorName = map["operator"] as? String {
      return try coerceBooleanOperatorExpression(map: map, operatorName: operatorName, fieldName: fieldName)
    }

    if let name = map["name"] as? String {
      let args = (map["args"] as? [Any]) ?? []
      return FunctionExprBridge(name: normalizeExpressionFunctionName(name), args: try args.enumerated().map {
        try coerceExpression($0.element, fieldName: "\(fieldName).args[\($0.offset)]")
      })
    }

    if map["fieldPath"] != nil || map["path"] != nil || map["segments"] != nil || map["_segments"] != nil {
      return FieldBridge(name: try coerceFieldPath(map, fieldName: fieldName))
    }

    if let kind = (map["exprType"] as? String)?.lowercased(), kind == "constant" {
      return ConstantBridge(map["value"] as Any)
    }

    throw PipelineValidationError("pipelineExecute() could not convert \(fieldName) into a pipeline expression.")
  }

  private func coerceBooleanExpression(_ value: Any, fieldName: String) throws -> ExprBridge {
    if let map = value as? [String: Any] {
      if let nested = map["condition"] {
        return try coerceBooleanExpression(nested, fieldName: "\(fieldName).condition")
      }

      if let operatorName = map["operator"] as? String {
        return try coerceBooleanOperatorExpression(map: map, operatorName: operatorName, fieldName: fieldName)
      }

      if let name = map["name"] as? String {
        let rawArgs: [Any]
        if let args = map["args"] as? [Any] {
          rawArgs = args
        } else if let singleArg = map["args"] {
          rawArgs = [singleArg]
        } else {
          rawArgs = []
        }
        return try coerceBooleanFunctionExpression(name: name, args: rawArgs, fieldName: fieldName)
      }
    }

    return try coerceExpression(value, fieldName: fieldName)
  }

  private func coerceBooleanFunctionExpression(
    name: String,
    args: [Any],
    fieldName: String
  ) throws -> ExprBridge {
    return try coerceFunctionExpression(name: name, args: args, fieldName: fieldName)
  }

  private func coerceFunctionExpression(
    name: String,
    args: [Any],
    fieldName: String
  ) throws -> ExprBridge {
    let normalized = name.lowercased()

    if normalized == "and" || normalized == "or" {
      guard !args.isEmpty else {
        throw PipelineValidationError("pipelineExecute() expected \(fieldName).args to contain boolean expressions.")
      }

      let parsedArgs = try args.enumerated().map { index, value in
        try coerceBooleanExpression(value, fieldName: "\(fieldName).args[\(index)]")
      }
      return FunctionExprBridge(name: normalized, args: parsedArgs)
    }

    let comparisonFunctions: Set<String> = [
      "equal", "notequal", "greaterthan", "greaterthanorequal", "lessthan", "lessthanorequal",
      "arraycontains", "arraycontainsany", "arraycontainsall", "equalany", "notequalany",
    ]

    if comparisonFunctions.contains(normalized) {
      guard args.count >= 2 else {
        throw PipelineValidationError(
          "pipelineExecute() expected \(fieldName).args to include left and right operands.")
      }

      let left = try coerceExpression(args[0], fieldName: "\(fieldName).args[0]")
      let right = try coerceComparisonOperand(args[1], fieldName: "\(fieldName).args[1]")
      let canonicalName = canonicalComparisonFunctionName(normalized)
      return FunctionExprBridge(name: canonicalName, args: [left, right])
    }

    let parsedArgs = try args.enumerated().map { index, value in
      try coerceBooleanExpression(value, fieldName: "\(fieldName).args[\(index)]")
    }
    return FunctionExprBridge(name: normalizeExpressionFunctionName(name), args: parsedArgs)
  }

  private func coerceBooleanOperatorExpression(
    map: [String: Any],
    operatorName: String,
    fieldName: String
  ) throws -> ExprBridge {
    let normalized = operatorName.uppercased()
    if normalized == "AND" || normalized == "OR" {
      guard let queries = map["queries"] as? [Any], !queries.isEmpty else {
        throw PipelineValidationError("pipelineExecute() expected \(fieldName).queries to contain boolean expressions.")
      }

      let args = try queries.map { try coerceBooleanExpression($0, fieldName: "\(fieldName).queries") }
      return FunctionExprBridge(name: normalized == "AND" ? "and" : "or", args: args)
    }

    let fieldValue = map["fieldPath"] ?? map["field"]
    guard let fieldValue else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).fieldPath to be provided.")
    }

    let left = FieldBridge(name: try coerceFieldPath(fieldValue, fieldName: "\(fieldName).fieldPath"))
    let right = map["value"] ?? map["right"] ?? map["operand"] ?? NSNull()
    let rightExpr = try coerceComparisonOperand(right, fieldName: "\(fieldName).value")
    let fnName = mapOperatorToFunction(normalized)
    return FunctionExprBridge(name: fnName, args: [left, rightExpr])
  }

  private func coerceComparisonOperand(_ value: Any, fieldName: String) throws -> ExprBridge {
    if let map = value as? [String: Any] {
      return try coerceExpression(map, fieldName: fieldName)
    }

    if let values = value as? [Any] {
      return ConstantBridge(values)
    }

    if value is NSNull || value is NSNumber || value is String || value is Date || value is Timestamp ||
      value is GeoPoint || value is DocumentReference || value is VectorValue {
      return ConstantBridge(value)
    }

    return try coerceExpression(value, fieldName: fieldName)
  }

  private func canonicalComparisonFunctionName(_ normalizedName: String) -> String {
    switch normalizedName {
    case "equal": return "equal"
    case "notequal": return "not_equal"
    case "greaterthan": return "greater_than"
    case "greaterthanorequal": return "greater_than_or_equal"
    case "lessthan": return "less_than"
    case "lessthanorequal": return "less_than_or_equal"
    case "arraycontains": return "array_contains"
    case "arraycontainsany": return "array_contains_any"
    case "arraycontainsall": return "array_contains_all"
    case "equalany": return "equal_any"
    case "notequalany": return "not_equal_any"
    default: return normalizedName
    }
  }

  private func normalizeExpressionFunctionName(_ name: String) -> String {
    let normalized = name.lowercased().replacingOccurrences(of: "-", with: "")
    switch normalized {
    case "lower", "tolower":
      return "to_lower"
    case "upper", "toupper":
      return "to_upper"
    case "startswith":
      return "starts_with"
    case "endswith":
      return "ends_with"
    case "arraycontains":
      return "array_contains"
    case "arraycontainsany":
      return "array_contains_any"
    case "arraycontainsall":
      return "array_contains_all"
    case "charlength", "characterlength":
      return "char_length"
    case "bytelength":
      return "byte_length"
    case "greaterthan":
      return "greater_than"
    case "lessthan":
      return "less_than"
    case "greaterthanorequal":
      return "greater_than_or_equal"
    case "lessthanorequal":
      return "less_than_or_equal"
    case "notequal":
      return "not_equal"
    default:
      return name
    }
  }

  private func normalizeAggregateKind(_ kind: String) -> String {
    let normalized = kind.lowercased().replacingOccurrences(of: "-", with: "")
    switch normalized {
    case "countall", "count_all":
      // iOS bridge accepts count() with no args as count-all.
      return "count"
    case "countif", "count_if":
      return "countIf"
    case "countdistinct", "count_distinct":
      return "countDistinct"
    case "arrayagg", "array_agg":
      return "arrayAgg"
    case "arrayaggdistinct", "array_agg_distinct":
      return "arrayAggDistinct"
    default:
      return kind
    }
  }

  private func mapOperatorToFunction(_ operatorName: String) -> String {
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

  private func coerceAggregateFunction(
    _ accumulator: [String: Any],
    fieldName: String
  ) throws -> AggregateFunctionBridge {
    let aggregate = (accumulator["aggregate"] as? [String: Any]) ?? accumulator
    let kind = (aggregate["kind"] as? String)
      ?? (aggregate["name"] as? String)
      ?? (aggregate["function"] as? String)
      ?? (aggregate["op"] as? String)

    guard let kind, !kind.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to include an aggregate kind.")
    }
    let normalizedKind = normalizeAggregateKind(kind)

    var args: [ExprBridge] = []
    if let expr = aggregate["expr"] ?? aggregate["field"] ?? aggregate["value"] {
      args.append(try coerceExpression(expr, fieldName: "\(fieldName).expr"))
    }

    if let extraArgs = aggregate["args"] as? [Any] {
      args.append(contentsOf: try extraArgs.map {
        try coerceExpression($0, fieldName: "\(fieldName).args")
      })
    }

    return AggregateFunctionBridge(name: normalizedKind, args: args)
  }

  private func coerceNamedSelectables(
    _ options: [String: Any],
    key: String
  ) throws -> [String: ExprBridge] {
    let values = try requireArray(options, key: key, fieldName: "stage.options.\(key)")
    guard !values.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected stage.options.\(key) to contain at least one value.")
    }

    var output: [String: ExprBridge] = [:]
    for (index, value) in values.enumerated() {
      let expression = try coerceExpression(value, fieldName: "stage.options.\(key)[\(index)]")
      let alias = coerceAlias(from: value) ?? expressionAlias(expression) ?? "field_\(index)"
      output[alias] = expression
    }
    return output
  }

  private func coerceOptionalNamedSelectables(
    _ options: [String: Any],
    key: String
  ) throws -> [String: ExprBridge] {
    guard options[key] != nil else {
      return [:]
    }
    return try coerceNamedSelectables(options, key: key)
  }

  private func coerceOrderings(_ options: [String: Any]) throws -> [Any] {
    let values = try requireArray(options, key: "orderings", fieldName: "stage.options.orderings")
    guard !values.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected stage.options.orderings to contain at least one value.")
    }

    return try values.enumerated().map { index, value in
      if let path = value as? String {
        return OrderingBridge(expr: FieldBridge(name: path), direction: "asc")
      }

      guard let map = value as? [String: Any] else {
        throw PipelineValidationError("pipelineExecute() expected stage.options.orderings[\(index)] to be a string or object.")
      }

      let direction = (map["direction"] as? String) ?? "asc"
      let expressionValue = map["expression"] ?? map["expr"] ?? map["field"] ?? map["fieldPath"] ?? map["path"] ?? map
      return OrderingBridge(
        expr: try coerceExpression(expressionValue, fieldName: "stage.options.orderings[\(index)]"),
        direction: direction
      )
    }
  }

  private func coerceRawParams(_ value: Any?) throws -> [Any] {
    guard let value else {
      return []
    }

    if let values = value as? [Any] {
      return try values.enumerated().map { index, nested in
        try coerceRawParamValue(nested, fieldName: "stage.options.params[\(index)]")
      }
    }

    if let values = value as? [String: Any] {
      return [try coerceRawParamDictionary(values, fieldName: "stage.options.params")]
    }

    return [try coerceRawParamValue(value, fieldName: "stage.options.params")]
  }

  private func coerceRawParamDictionary(_ values: [String: Any], fieldName: String) throws -> [String: Any] {
    var output: [String: Any] = [:]
    for (key, nested) in values {
      output[key] = try coerceRawParamValue(nested, fieldName: "\(fieldName).\(key)")
    }
    return output
  }

  private func coerceRawParamValue(_ value: Any, fieldName: String) throws -> Any {
    if value is ExprBridge || value is AggregateFunctionBridge {
      return value
    }
    if let map = value as? [String: Any] {
      return try coerceRawParamDictionary(map, fieldName: fieldName)
    }
    if let array = value as? [Any] {
      return try array.enumerated().map { index, nested in
        try coerceRawParamValue(nested, fieldName: "\(fieldName)[\(index)]")
      }
    }
    return try coerceExpression(value, fieldName: fieldName)
  }

  private func coerceRawOptions(_ options: [String: Any]?) throws -> [String: ExprBridge]? {
    guard let options else {
      return nil
    }

    var output: [String: ExprBridge] = [:]
    for (key, value) in options {
      output[key] = try coerceExpression(value, fieldName: "stage.options.options.\(key)")
    }
    return output
  }

  private func coerceVector(_ value: Any?) throws -> [Double] {
    if let map = value as? [String: Any] {
      return try coerceVector(map["values"])
    }

    guard let values = value as? [Any] else {
      throw PipelineValidationError("pipelineExecute() expected findNearest.vectorValue to be an array.")
    }

    return try values.map {
      try coerceNumber($0, fieldName: "findNearest.vectorValue")
    }
  }

  private func coerceFieldPath(_ value: Any, fieldName: String) throws -> String {
    if let string = value as? String, !string.isEmpty {
      return string
    }

    if let map = value as? [String: Any] {
      if let path = map["path"] as? String, !path.isEmpty {
        return path
      }

      if let fieldPath = map["fieldPath"], !(fieldPath is [String: Any]) {
        return try coerceFieldPath(fieldPath, fieldName: fieldName)
      }

      let segments = (map["segments"] as? [Any]) ?? (map["_segments"] as? [Any]) ?? []
      if !segments.isEmpty {
        let stringSegments = try segments.map { segment -> String in
          guard let value = segment as? String else {
            throw PipelineValidationError("pipelineExecute() expected \(fieldName) segment values to be strings.")
          }
          return value
        }
        let path = stringSegments.joined(separator: ".")
        if !path.isEmpty {
          return path
        }
      }
    }

    throw PipelineValidationError("pipelineExecute() expected \(fieldName) to resolve to a field path string.")
  }

  private func coerceAlias(from value: Any) -> String? {
    guard let map = value as? [String: Any] else {
      return nil
    }
    if let alias = map["alias"] as? String, !alias.isEmpty {
      return alias
    }
    if let alias = map["as"] as? String, !alias.isEmpty {
      return alias
    }
    return nil
  }

  private func expressionAlias(_ expression: ExprBridge) -> String? {
    if let field = expression as? FieldBridge {
      return field.field_name()
    }
    return nil
  }

  private func coerceStringArray(_ map: [String: Any], key: String) throws -> [String] {
    let values = try requireArray(map, key: key, fieldName: "stage.options.\(key)")
    guard !values.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected stage.options.\(key) to contain at least one value.")
    }

    return try values.map {
      guard let string = $0 as? String else {
        throw PipelineValidationError("pipelineExecute() expected stage.options.\(key) values to be strings.")
      }
      return string
    }
  }

  private func coerceInt(_ map: [String: Any], key: String) throws -> Int {
    guard let value = map[key] else {
      throw PipelineValidationError("pipelineExecute() expected stage.options.\(key) to be a number.")
    }
    return Int(try coerceNumber(value, fieldName: "stage.options.\(key)"))
  }

  private func coerceNumber(_ value: Any, fieldName: String) throws -> Double {
    if let number = value as? NSNumber {
      return number.doubleValue
    }
    throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a number.")
  }

  private func requireNonEmptyString(
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

  private func requireArray(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> [Any] {
    guard let value = map[key] as? [Any] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be an array.")
    }
    return value
  }

  private func requireValue(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> Any {
    guard let value = map[key] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be provided.")
    }
    return value
  }

  private func buildExecutionMetadata(_ pipeline: [String: Any]) -> PipelineExecutionMetadata {
    guard let source = pipeline["source"] as? [String: Any],
          (source["source"] as? String) == "documents",
          let stages = pipeline["stages"] as? [[String: Any]],
          stages.allSatisfy({ Self.metadataFallbackStages.contains(($0["stage"] as? String) ?? "") }),
          let documentPaths = source["documents"] as? [String],
          !documentPaths.isEmpty else {
      return .empty
    }

    return PipelineExecutionMetadata(sourceDocumentPaths: documentPaths)
  }

  private func serializeSnapshot(
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

    map["data"] = result.data()
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

private struct PipelineExecutionMetadata {
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

private struct PipelineValidationError: Error {
  let message: String

  init(_ message: String) {
    self.message = message
  }
}
