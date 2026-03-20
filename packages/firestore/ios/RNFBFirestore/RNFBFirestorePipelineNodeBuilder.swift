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

final class RNFBFirestorePipelineNodeBuilder {
  func coerceExpression(
    _ value: RNFBFirestoreParsedExpressionNode,
    fieldName: String
  ) throws -> ExprBridge {
    switch value {
    case let .field(path):
      return FieldBridge(name: path)
    case let .constant(constantValue):
      return ConstantBridge(serializeValueNode(constantValue))
    case let .function(name, args):
      return try coerceFunctionExpression(
        name: name,
        args: args.map(serializeValueNode),
        fieldName: fieldName
      )
    }
  }

  func coerceBooleanExpression(
    _ value: RNFBFirestoreParsedExpressionNode,
    fieldName: String
  ) throws -> ExprBridge {
    switch value {
    case let .function(name, args):
      return try coerceBooleanFunctionExpression(
        name: name,
        args: args.map(serializeValueNode),
        fieldName: fieldName
      )
    default:
      return try coerceExpression(value, fieldName: fieldName)
    }
  }

  func coerceNamedSelectables(
    _ values: [RNFBFirestoreParsedSelectableNode],
    fieldName: String
  ) throws -> [String: ExprBridge] {
    guard !values.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to contain at least one value.")
    }

    var output: [String: ExprBridge] = [:]
    for (index, value) in values.enumerated() {
      let expression = try coerceExpression(value.expression, fieldName: "\(fieldName)[\(index)].expr")
      let alias = coerceAlias(from: value) ?? expressionAlias(expression) ?? "field_\(index)"
      output[alias] = expression
    }
    return output
  }

  func coerceOrderings(
    _ values: [RNFBFirestoreParsedOrderingNode],
    fieldName: String
  ) throws -> [Any] {
    guard !values.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to contain at least one value.")
    }

    return try values.enumerated().map { index, value in
      OrderingBridge(
        expr: try coerceExpression(value.expression, fieldName: "\(fieldName)[\(index)].expr"),
        direction: value.descending ? "descending" : "ascending"
      )
    }
  }

  func coerceAliasedAggregate(
    _ value: RNFBFirestoreParsedAggregateNode,
    fieldName: String
  ) throws -> (alias: String, function: AggregateFunctionBridge) {
    var aggregate: [String: Any] = ["kind": value.kind]
    if let primaryValue = value.primaryValue {
      aggregate["expr"] = serializeValueNode(primaryValue)
    }
    if !value.args.isEmpty {
      aggregate["args"] = value.args.map(serializeValueNode)
    }

    let serializedAccumulator: [String: Any] = [
      "alias": value.alias,
      "aggregate": aggregate,
    ]

    return (
      alias: value.alias,
      function: try coerceAggregateFunction(serializedAccumulator, fieldName: fieldName)
    )
  }

  func coerceVector(
    _ value: RNFBFirestoreParsedValueNode,
    fieldName: String
  ) throws -> [Double] {
    try coerceVector(serializeValueNode(value), fieldName: fieldName)
  }

  func coerceFieldPath(
    _ value: RNFBFirestoreParsedExpressionNode,
    fieldName: String
  ) throws -> String {
    switch value {
    case let .field(path):
      return path
    default:
      return try coerceFieldPath(serializeExpressionNode(value), fieldName: fieldName)
    }
  }

  func coerceExpression(_ value: Any, fieldName: String) throws -> ExprBridge {
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
      return try coerceFunctionExpression(name: name, args: args, fieldName: fieldName)
    }

    if map["fieldPath"] != nil || map["path"] != nil || map["segments"] != nil || map["_segments"] != nil {
      return FieldBridge(name: try coerceFieldPath(map, fieldName: fieldName))
    }

    if let kind = (map["exprType"] as? String)?.lowercased(), kind == "constant" {
      return ConstantBridge(map["value"] as Any)
    }

    throw PipelineValidationError("pipelineExecute() could not convert \(fieldName) into a pipeline expression.")
  }

  func coerceBooleanExpression(_ value: Any, fieldName: String) throws -> ExprBridge {
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

  func coerceAggregateFunction(
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

  func coerceNamedSelectables(
    _ values: [Any],
    fieldName: String
  ) throws -> [String: ExprBridge] {
    guard !values.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to contain at least one value.")
    }

    var output: [String: ExprBridge] = [:]
    for (index, value) in values.enumerated() {
      let expression = try coerceExpression(value, fieldName: "\(fieldName)[\(index)]")
      let alias = coerceAlias(from: value) ?? expressionAlias(expression) ?? "field_\(index)"
      output[alias] = expression
    }
    return output
  }

  func coerceOrderings(_ values: [Any], fieldName: String) throws -> [Any] {
    guard !values.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to contain at least one value.")
    }

    return try values.enumerated().map { index, value in
      if let path = value as? String {
        return OrderingBridge(expr: FieldBridge(name: path), direction: "asc")
      }

      guard let map = value as? [String: Any] else {
        throw PipelineValidationError("pipelineExecute() expected \(fieldName)[\(index)] to be a string or object.")
      }

      let direction = (map["direction"] as? String) ?? "asc"
      let expressionValue = map["expression"] ?? map["expr"] ?? map["field"] ?? map["fieldPath"] ?? map["path"] ?? map
      return OrderingBridge(
        expr: try coerceExpression(expressionValue, fieldName: "\(fieldName)[\(index)]"),
        direction: direction
      )
    }
  }

  func coerceRawParams(_ value: Any?, fieldName: String) throws -> [Any] {
    guard let value else {
      return []
    }

    if let values = value as? [Any] {
      return try values.enumerated().map { index, nested in
        try coerceRawParamValue(nested, fieldName: "\(fieldName)[\(index)]")
      }
    }

    if let values = value as? [String: Any] {
      return [try coerceRawParamDictionary(values, fieldName: fieldName)]
    }

    return [try coerceRawParamValue(value, fieldName: fieldName)]
  }

  func coerceRawOptions(_ options: [String: Any]?, fieldName: String) throws -> [String: ExprBridge]? {
    guard let options else {
      return nil
    }

    var output: [String: ExprBridge] = [:]
    for (key, value) in options {
      output[key] = try coerceExpression(value, fieldName: "\(fieldName).\(key)")
    }
    return output
  }

  func coerceVector(_ value: Any?, fieldName: String) throws -> [Double] {
    if let map = value as? [String: Any] {
      return try coerceVector(map["values"], fieldName: fieldName)
    }

    guard let values = value as? [Any] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be an array.")
    }

    return try values.map {
      try coerceNumber($0, fieldName: fieldName)
    }
  }

  func coerceFieldPath(_ value: Any, fieldName: String) throws -> String {
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

  func coerceStringArray(
    _ values: [Any],
    fieldName: String
  ) throws -> [String] {
    guard !values.isEmpty else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to contain at least one value.")
    }

    return try values.enumerated().map { index, value in
      guard let string = value as? String else {
        throw PipelineValidationError("pipelineExecute() expected \(fieldName)[\(index)] to be a string.")
      }
      return string
    }
  }

  func coerceInt(_ value: Any?, fieldName: String) throws -> Int {
    guard let value else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a number.")
    }
    return Int(try coerceNumber(value, fieldName: fieldName))
  }

  func requireValue(
    _ map: [String: Any],
    key: String,
    fieldName: String
  ) throws -> Any {
    guard let value = map[key] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be provided.")
    }
    return value
  }

  func requireNonEmptyString(
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

  private func coerceBooleanFunctionExpression(
    name: String,
    args: [Any],
    fieldName: String
  ) throws -> ExprBridge {
    return try coerceFunctionExpression(name: name, args: args, fieldName: fieldName)
  }

  // NOTE: iOS pipeline function lowering lives in this builder.
  //
  // If a serialized JS pipeline function is not supported by the currently linked
  // Firebase iOS pipeline runtime, add or document it here first.
  //
  // Some functions are intentionally blocked before reaching native on iOS
  // (see `pipeline_support.ts` / `getIOSUnsupportedPipelineFunctions()`)
  // because the installed iOS SDK/runtime currently rejects them with
  // `invalid-argument` even though newer Firebase snippets may show them.
  // When iOS support becomes available, implement the lowering here and then
  // remove the corresponding JS-side unsupported-function guard.
  private func coerceFunctionExpression(
    name: String,
    args: [Any],
    fieldName: String
  ) throws -> ExprBridge {
    let normalized = canonicalizeFunctionName(name)

    if normalized == "array" {
      return try buildArrayExpression(args, fieldName: fieldName)
    }

    if normalized == "map" {
      return try buildMapExpression(args, fieldName: fieldName)
    }

    if normalized == "conditional" {
      guard args.count == 3 else {
        throw PipelineValidationError("pipelineExecute() expected \(fieldName).conditional to include exactly 3 arguments.")
      }

      return FunctionExprBridge(name: "cond", args: [
        try coerceBooleanExpression(args[0], fieldName: "\(fieldName).args[0]"),
        try coerceExpressionValue(args[1], fieldName: "\(fieldName).args[1]"),
        try coerceExpressionValue(args[2], fieldName: "\(fieldName).args[2]"),
      ])
    }

    if normalized == "logicalmaximum" || normalized == "logicalminimum" {
      guard args.count >= 2 else {
        throw PipelineValidationError("pipelineExecute() expected \(fieldName).\(name) to include at least 2 arguments.")
      }

      return FunctionExprBridge(
        name: normalizeExpressionFunctionName(name),
        args: try args.enumerated().map { index, value in
          try coerceExpressionValue(value, fieldName: "\(fieldName).args[\(index)]")
        })
    }

    if normalized == "cosinedistance" || normalized == "dotproduct" || normalized == "euclideandistance" {
      guard args.count == 2 else {
        throw PipelineValidationError("pipelineExecute() expected \(fieldName).\(name) to include exactly 2 arguments.")
      }

      return FunctionExprBridge(name: normalizeExpressionFunctionName(name), args: [
        try coerceExpressionValue(args[0], fieldName: "\(fieldName).args[0]"),
        try coerceVectorExpressionValue(args[1], fieldName: "\(fieldName).args[1]"),
      ])
    }

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
      try coerceExpressionValue(value, fieldName: "\(fieldName).args[\(index)]")
    }
    return FunctionExprBridge(name: normalizeExpressionFunctionName(name), args: parsedArgs)
  }

  private func buildArrayExpression(_ args: [Any], fieldName: String) throws -> ExprBridge {
    let elements: [Any]
    if args.count == 1, let unwrapped = try unwrapConstantArray(args[0], fieldName: "\(fieldName).args[0]") {
      elements = unwrapped
    } else {
      elements = args
    }

    if !elements.contains(where: containsSerializedExpression) {
      return ConstantBridge(try elements.enumerated().map { index, value in
        try resolveConstantValue(value, fieldName: "\(fieldName).args[\(index)]")
      })
    }

    return FunctionExprBridge(name: "array", args: try elements.enumerated().map { index, value in
      try coerceExpressionValue(value, fieldName: "\(fieldName).args[\(index)]")
    })
  }

  private func buildMapExpression(_ args: [Any], fieldName: String) throws -> ExprBridge {
    guard args.count == 1 else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).map to include exactly 1 argument.")
    }

    guard let entries = try unwrapConstantMap(args[0], fieldName: "\(fieldName).args[0]") else {
      return FunctionExprBridge(name: "map", args: try args.enumerated().map { index, value in
        try coerceExpressionValue(value, fieldName: "\(fieldName).args[\(index)]")
      })
    }

    if !entries.values.contains(where: containsSerializedExpression) {
      var resolved: [String: Any] = [:]
      for (key, value) in entries {
        resolved[key] = try resolveConstantValue(value, fieldName: "\(fieldName).args[0].\(key)")
      }
      return ConstantBridge(resolved)
    }

    var expressionArgs: [ExprBridge] = []
    for (key, value) in entries {
      expressionArgs.append(ConstantBridge(key))
      expressionArgs.append(try coerceExpressionValue(value, fieldName: "\(fieldName).args[0].\(key)"))
    }
    return FunctionExprBridge(name: "map", args: expressionArgs)
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

  private func coerceExpressionValue(_ value: Any, fieldName: String) throws -> ExprBridge {
    if containsSerializedExpression(value) {
      return try coerceExpression(value, fieldName: fieldName)
    }

    return ConstantBridge(try resolveConstantValue(value, fieldName: fieldName))
  }

  private func coerceVectorExpressionValue(_ value: Any, fieldName: String) throws -> ExprBridge {
    if let map = value as? [String: Any], let constantValue = try unwrapConstantValue(map, fieldName: fieldName) {
      return try coerceVectorExpressionValue(constantValue, fieldName: fieldName)
    }

    if let map = value as? [String: Any], map["values"] != nil {
      let vector = try coerceVector(map["values"], fieldName: fieldName)
      return ConstantBridge(VectorValue(__array: vector.map { NSNumber(value: $0) }))
    }

    if value is [Any] {
      let vector = try coerceVector(value, fieldName: fieldName)
      return ConstantBridge(VectorValue(__array: vector.map { NSNumber(value: $0) }))
    }

    return try coerceExpressionValue(value, fieldName: fieldName)
  }

  private func resolveConstantValue(_ value: Any, fieldName: String) throws -> Any {
    if let map = value as? [String: Any] {
      if let constantValue = try unwrapConstantValue(map, fieldName: fieldName) {
        return try resolveConstantValue(constantValue, fieldName: fieldName)
      }

      if isSerializedExpressionLike(map) {
        return try coerceExpression(map, fieldName: fieldName)
      }

      var output: [String: Any] = [:]
      for (key, nestedValue) in map {
        output[key] = try resolveConstantValue(nestedValue, fieldName: "\(fieldName).\(key)")
      }
      return output
    }

    if let values = value as? [Any] {
      return try values.enumerated().map { index, nestedValue in
        try resolveConstantValue(nestedValue, fieldName: "\(fieldName)[\(index)]")
      }
    }

    return value
  }

  private func containsSerializedExpression(_ value: Any) -> Bool {
    if let map = value as? [String: Any] {
      if let constantValue = try? unwrapConstantValue(map, fieldName: "") {
        return containsSerializedExpression(constantValue)
      }

      if isSerializedExpressionLike(map) {
        return true
      }

      return map.values.contains(where: containsSerializedExpression)
    }

    if let values = value as? [Any] {
      return values.contains(where: containsSerializedExpression)
    }

    return false
  }

  private func unwrapConstantArray(_ value: Any, fieldName: String) throws -> [Any]? {
    if let array = value as? [Any] {
      return array
    }

    guard let map = value as? [String: Any],
          let constantValue = try unwrapConstantValue(map, fieldName: fieldName) else {
      return nil
    }

    return constantValue as? [Any]
  }

  private func unwrapConstantMap(_ value: Any, fieldName: String) throws -> [String: Any]? {
    guard let map = value as? [String: Any] else {
      return nil
    }

    if let constantValue = try unwrapConstantValue(map, fieldName: fieldName) {
      return constantValue as? [String: Any]
    }

    return isSerializedExpressionLike(map) ? nil : map
  }

  private func unwrapConstantValue(_ map: [String: Any], fieldName: String) throws -> Any? {
    guard let kind = (map["exprType"] as? String)?.lowercased(), kind == "constant" else {
      return nil
    }

    guard let value = map["value"] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).value to be provided.")
    }

    return value
  }

  private func isSerializedExpressionLike(_ map: [String: Any]) -> Bool {
    map["exprType"] != nil || map["operator"] != nil || map["name"] != nil || map["expr"] != nil ||
      map["expression"] != nil || map["fieldPath"] != nil || map["path"] != nil ||
      map["segments"] != nil || map["_segments"] != nil
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

  private func canonicalizeFunctionName(_ name: String) -> String {
    name.lowercased()
      .replacingOccurrences(of: "_", with: "")
      .replacingOccurrences(of: "-", with: "")
  }

  private func normalizeExpressionFunctionName(_ name: String) -> String {
    let normalized = canonicalizeFunctionName(name)
    switch normalized {
    case "conditional":
      return "cond"
    case "logicalmaximum", "arraymaximum":
      return "maximum"
    case "logicalminimum", "arrayminimum":
      return "minimum"
    case "arraysum":
      return "sum"
    case "lower", "tolower":
      return "to_lower"
    case "upper", "toupper":
      return "to_upper"
    case "stringconcat":
      return "string_concat"
    case "startswith":
      return "starts_with"
    case "endswith":
      return "ends_with"
    case "timestampsubtract":
      return "timestamp_sub"
    case "timestamptruncate":
      return "timestamp_trunc"
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
      return snakeCaseFunctionName(name)
    }
  }

  private func normalizeAggregateKind(_ kind: String) -> String {
    let normalized = canonicalizeFunctionName(kind)
    switch normalized {
    case "countall", "count_all":
      return "count"
    case "avg":
      return "average"
    case "min":
      return "minimum"
    case "max":
      return "maximum"
    case "countif", "count_if":
      return "count_if"
    case "countdistinct", "count_distinct":
      return "count_distinct"
    case "arrayagg", "array_agg":
      return "array_agg"
    case "arrayaggdistinct", "array_agg_distinct":
      return "array_agg_distinct"
    default:
      return snakeCaseFunctionName(kind)
    }
  }

  private func snakeCaseFunctionName(_ name: String) -> String {
    guard !name.isEmpty else {
      return name
    }

    var result = ""
    for scalar in name.unicodeScalars {
      let char = Character(scalar)
      if CharacterSet.uppercaseLetters.contains(scalar) {
        if !result.isEmpty {
          result.append("_")
        }
        result.append(String(char).lowercased())
      } else if char == "-" {
        result.append("_")
      } else {
        result.append(String(char).lowercased())
      }
    }

    return result
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

  func coerceAlias(from value: Any) -> String? {
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

  func coerceAlias(from value: RNFBFirestoreParsedSelectableNode) -> String? {
    if let alias = value.alias, !alias.isEmpty {
      return alias
    }

    if case let .field(path) = value.expression, !path.isEmpty {
      return path
    }

    return nil
  }

  private func expressionAlias(_ expression: ExprBridge) -> String? {
    if let field = expression as? FieldBridge {
      return field.field_name()
    }
    return nil
  }

  private func serializeExpressionNode(_ value: RNFBFirestoreParsedExpressionNode) -> Any {
    switch value {
    case let .field(path):
      return [
        "__kind": "expression",
        "exprType": "Field",
        "path": path,
      ]
    case let .constant(constantValue):
      return [
        "__kind": "expression",
        "exprType": "constant",
        "value": serializeValueNode(constantValue),
      ]
    case let .function(name, args):
      return [
        "__kind": "expression",
        "exprType": "Function",
        "name": name,
        "args": args.map(serializeValueNode),
      ]
    }
  }

  private func serializeValueNode(_ value: RNFBFirestoreParsedValueNode) -> Any {
    switch value {
    case let .primitive(primitive):
      return primitive
    case let .list(values):
      return values.map(serializeValueNode)
    case let .map(values):
      return values.reduce(into: [String: Any]()) { result, entry in
        result[entry.key] = serializeValueNode(entry.value)
      }
    case let .expression(expression):
      return serializeExpressionNode(expression)
    }
  }

  private func coerceNumber(_ value: Any, fieldName: String) throws -> Double {
    if let number = value as? NSNumber {
      return number.doubleValue
    }
    throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a number.")
  }
}
