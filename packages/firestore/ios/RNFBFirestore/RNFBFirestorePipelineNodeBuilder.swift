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
  private final class SerializedValueBox {
    var value: Any?
  }

  private final class SerializedExpressionBox {
    var value: Any?
  }

  private final class ExprBridgeBox {
    var value: ExprBridge?
  }

  private final class RawParamBox {
    var value: Any?
  }

  private enum ExpressionCoercionMode {
    case expression
    case booleanExpression
    case expressionValue
    case comparisonOperand
    case vectorExpressionValue
  }

  private enum ExpressionCoercionFrame {
    case enter(
      Any,
      String,
      ExpressionCoercionMode,
      ExprBridgeBox
    )
    case functionExit(
      ExprBridgeBox,
      String,
      [ExprBridgeBox],
      String
    )
    case conditionalExit(
      ExprBridgeBox,
      ExprBridgeBox,
      ExprBridgeBox,
      ExprBridgeBox,
      String
    )
    case arrayExit(
      ExprBridgeBox,
      [ExprBridgeBox],
      String
    )
    case mapLiteralExit(
      ExprBridgeBox,
      [(String, ExprBridgeBox)],
      String
    )
    case mapPassthroughExit(
      ExprBridgeBox,
      [ExprBridgeBox],
      String
    )
    case logicalOperatorExit(
      ExprBridgeBox,
      String,
      [ExprBridgeBox],
      String
    )
    case binaryOperatorExit(
      ExprBridgeBox,
      String,
      String,
      ExprBridgeBox,
      String
    )
  }

  private enum RawParamCoercionFrame {
    case enter(
      Any,
      String,
      RawParamBox
    )
    case listExit(
      RawParamBox,
      [RawParamBox]
    )
    case mapExit(
      RawParamBox,
      [(String, RawParamBox)]
    )
  }

  private enum SerializationFrame {
    case expressionEnter(
      RNFBFirestoreParsedExpressionNode,
      SerializedExpressionBox
    )
    case expressionFunctionExit(
      SerializedExpressionBox,
      String,
      [SerializedValueBox]
    )
    case valueEnter(
      RNFBFirestoreParsedValueNode,
      SerializedValueBox
    )
    case valueListExit(
      SerializedValueBox,
      [SerializedValueBox]
    )
    case valueMapExit(
      SerializedValueBox,
      [(String, SerializedValueBox)]
    )
    case expressionConstantExit(
      SerializedExpressionBox,
      SerializedValueBox
    )
    case valueExpressionExit(
      SerializedValueBox,
      SerializedExpressionBox
    )
  }

  private enum ConstantResolutionFrame {
    case enter(
      Any,
      String,
      SerializedValueBox
    )
    case exitList(
      SerializedValueBox,
      [SerializedValueBox]
    )
    case exitMap(
      SerializedValueBox,
      [(String, SerializedValueBox)]
    )
  }

  func coerceExpression(
    _ value: RNFBFirestoreParsedExpressionNode,
    fieldName: String
  ) throws -> ExprBridge {
    try coerceExpression(serializeExpressionNode(value), fieldName: fieldName)
  }

  func coerceBooleanExpression(
    _ value: RNFBFirestoreParsedExpressionNode,
    fieldName: String
  ) throws -> ExprBridge {
    try coerceBooleanExpression(serializeExpressionNode(value), fieldName: fieldName)
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
    try coerceFieldPath(serializeExpressionNode(value), fieldName: fieldName)
  }

  func coerceExpression(_ value: Any, fieldName: String) throws -> ExprBridge {
    try coerceExpressionTree(value, fieldName: fieldName, mode: .expression)
  }

  func coerceBooleanExpression(_ value: Any, fieldName: String) throws -> ExprBridge {
    try coerceExpressionTree(value, fieldName: fieldName, mode: .booleanExpression)
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
    var currentValue: Any = value

    while true {
      if let string = currentValue as? String, !string.isEmpty {
        return string
      }

      if let map = currentValue as? [String: Any] {
        if let path = map["path"] as? String, !path.isEmpty {
          return path
        }

        if let fieldPath = map["fieldPath"], !(fieldPath is [String: Any]) {
          currentValue = fieldPath
          continue
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
    return try coerceBooleanExpression([
      "name": name,
      "args": args,
    ], fieldName: fieldName)
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
    return try coerceExpression([
      "name": name,
      "args": args,
    ], fieldName: fieldName)
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
    try coerceExpressionTree(value, fieldName: fieldName, mode: .comparisonOperand)
  }

  private func coerceExpressionValue(_ value: Any, fieldName: String) throws -> ExprBridge {
    try coerceExpressionTree(value, fieldName: fieldName, mode: .expressionValue)
  }

  private func coerceVectorExpressionValue(_ value: Any, fieldName: String) throws -> ExprBridge {
    try coerceExpressionTree(value, fieldName: fieldName, mode: .vectorExpressionValue)
  }

  private func resolveConstantValue(_ value: Any, fieldName: String) throws -> Any {
    let rootBox = SerializedValueBox()
    var stack: [ConstantResolutionFrame] = [
      .enter(value, fieldName, rootBox),
    ]

    while let frame = stack.popLast() {
      switch frame {
      case let .enter(value, currentFieldName, box):
        var currentValue: Any = value

        while let map = currentValue as? [String: Any],
              let constantValue = try unwrapConstantValue(map, fieldName: currentFieldName) {
          currentValue = constantValue
        }

        if let map = currentValue as? [String: Any] {
          if isSerializedExpressionLike(map) {
            box.value = try coerceExpression(map, fieldName: currentFieldName)
            continue
          }

          let entries = map.map { (key: $0.key, box: SerializedValueBox(), value: $0.value) }
          stack.append(.exitMap(box, entries.map { ($0.key, $0.box) }))
          for entry in entries.reversed() {
            stack.append(.enter(entry.value, "\(currentFieldName).\(entry.key)", entry.box))
          }
          continue
        }

        if let values = currentValue as? [Any] {
          let childBoxes = values.map { _ in SerializedValueBox() }
          stack.append(.exitList(box, childBoxes))
          for index in values.indices.reversed() {
            stack.append(.enter(values[index], "\(currentFieldName)[\(index)]", childBoxes[index]))
          }
          continue
        }

        box.value = currentValue
      case let .exitList(box, childBoxes):
        box.value = childBoxes.map { $0.value as Any }
      case let .exitMap(box, entries):
        var output: [String: Any] = [:]
        for (key, childBox) in entries {
          output[key] = childBox.value
        }
        box.value = output
      }
    }

    return rootBox.value as Any
  }

  private func containsSerializedExpression(_ value: Any) -> Bool {
    var stack: [Any] = [value]

    while let value = stack.popLast() {
      var currentValue: Any = value

      while let map = currentValue as? [String: Any],
            let constantValue = try? unwrapConstantValue(map, fieldName: "") {
        currentValue = constantValue
      }

      if let map = currentValue as? [String: Any] {
        if isSerializedExpressionLike(map) {
          return true
        }

        for nestedValue in map.values {
          stack.append(nestedValue)
        }
        continue
      }

      if let values = currentValue as? [Any] {
        for nestedValue in values {
          stack.append(nestedValue)
        }
      }
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
    let rootBox = RawParamBox()
    var stack: [RawParamCoercionFrame] = [
      .enter(value, fieldName, rootBox),
    ]

    while let frame = stack.popLast() {
      switch frame {
      case let .enter(value, currentFieldName, box):
        if value is ExprBridge || value is AggregateFunctionBridge {
          box.value = value
          continue
        }

        if let map = value as? [String: Any] {
          let entries = map.map { (key: $0.key, box: RawParamBox(), value: $0.value) }
          stack.append(.mapExit(box, entries.map { ($0.key, $0.box) }))
          for entry in entries.reversed() {
            stack.append(.enter(entry.value, "\(currentFieldName).\(entry.key)", entry.box))
          }
          continue
        }

        if let array = value as? [Any] {
          let childBoxes = array.map { _ in RawParamBox() }
          stack.append(.listExit(box, childBoxes))
          for index in array.indices.reversed() {
            stack.append(.enter(array[index], "\(currentFieldName)[\(index)]", childBoxes[index]))
          }
          continue
        }

        box.value = try coerceExpression(value, fieldName: currentFieldName)
      case let .listExit(box, childBoxes):
        box.value = childBoxes.map { $0.value as Any }
      case let .mapExit(box, entries):
        var output: [String: Any] = [:]
        for (key, childBox) in entries {
          output[key] = childBox.value
        }
        box.value = output
      }
    }

    return rootBox.value as Any
  }

  private func coerceExpressionTree(
    _ value: Any,
    fieldName: String,
    mode: ExpressionCoercionMode
  ) throws -> ExprBridge {
    let comparisonFunctions: Set<String> = [
      "equal", "notequal", "greaterthan", "greaterthanorequal", "lessthan", "lessthanorequal",
      "arraycontains", "arraycontainsany", "arraycontainsall", "equalany", "notequalany",
    ]

    let rootBox = ExprBridgeBox()
    var stack: [ExpressionCoercionFrame] = [
      .enter(value, fieldName, mode, rootBox),
    ]

    while let frame = stack.popLast() {
      switch frame {
      case let .enter(value, currentFieldName, currentMode, box):
        switch currentMode {
        case .expressionValue:
          if containsSerializedExpression(value) {
            stack.append(.enter(value, currentFieldName, .expression, box))
          } else {
            box.value = ConstantBridge(try resolveConstantValue(value, fieldName: currentFieldName))
          }
          continue
        case .comparisonOperand:
          if let map = value as? [String: Any] {
            stack.append(.enter(map, currentFieldName, .expression, box))
            continue
          }
          if let values = value as? [Any] {
            box.value = ConstantBridge(values)
            continue
          }
          if let stringValue = value as? String {
            box.value = ConstantBridge(stringValue)
            continue
          }
          if isImmediateExpressionConstant(value) {
            box.value = ConstantBridge(value)
            continue
          }
          stack.append(.enter(value, currentFieldName, .expression, box))
          continue
        case .vectorExpressionValue:
          var currentValue: Any = value
          while let map = currentValue as? [String: Any],
                let constantValue = try unwrapConstantValue(map, fieldName: currentFieldName) {
            currentValue = constantValue
          }

          if let map = currentValue as? [String: Any], map["values"] != nil {
            let vector = try coerceVector(map["values"], fieldName: currentFieldName)
            box.value = ConstantBridge(VectorValue(__array: vector.map { NSNumber(value: $0) }))
            continue
          }

          if currentValue is [Any] {
            let vector = try coerceVector(currentValue, fieldName: currentFieldName)
            box.value = ConstantBridge(VectorValue(__array: vector.map { NSNumber(value: $0) }))
            continue
          }

          if containsSerializedExpression(currentValue) {
            stack.append(.enter(currentValue, currentFieldName, .expression, box))
          } else {
            box.value = ConstantBridge(try resolveConstantValue(currentValue, fieldName: currentFieldName))
          }
          continue
        case .expression, .booleanExpression:
          var currentValue: Any = value
          var currentField = currentFieldName

          expressionLoop: while true {
            if currentMode == .booleanExpression,
              let conditionMap = currentValue as? [String: Any],
              let nested = conditionMap["condition"] {
              currentValue = nested
              currentField = "\(currentField).condition"
              continue
            }

            if let stringValue = currentValue as? String {
              box.value = FieldBridge(name: stringValue)
              break expressionLoop
            }

            if let expression = currentValue as? ExprBridge {
              box.value = expression
              break expressionLoop
            }

            if isImmediateExpressionConstant(currentValue) {
              box.value = ConstantBridge(currentValue)
              break expressionLoop
            }

            guard let map = currentValue as? [String: Any] else {
              throw PipelineValidationError(
                "pipelineExecute() could not convert \(currentField) into a pipeline expression.")
            }

            if let nested = map["expr"] {
              currentValue = nested
              currentField = "\(currentField).expr"
              continue
            }
            if let nested = map["expression"] {
              currentValue = nested
              currentField = "\(currentField).expression"
              continue
            }

            if let operatorName = map["operator"] as? String {
              let normalizedOperator = operatorName.uppercased()
              if normalizedOperator == "AND" || normalizedOperator == "OR" {
                guard let queries = map["queries"] as? [Any], !queries.isEmpty else {
                  throw PipelineValidationError(
                    "pipelineExecute() expected \(currentField).queries to contain boolean expressions.")
                }

                let queryBoxes = queries.map { _ in ExprBridgeBox() }
                stack.append(.logicalOperatorExit(
                  box,
                  normalizedOperator == "AND" ? "and" : "or",
                  queryBoxes,
                  currentField
                ))
                for index in queries.indices.reversed() {
                  stack.append(.enter(
                    queries[index],
                    "\(currentField).queries[\(index)]",
                    .booleanExpression,
                    queryBoxes[index]
                  ))
                }
                break expressionLoop
              }

              let fieldValue = map["fieldPath"] ?? map["field"]
              guard let fieldValue else {
                throw PipelineValidationError("pipelineExecute() expected \(currentField).fieldPath to be provided.")
              }

              let leftFieldPath = try coerceFieldPath(fieldValue, fieldName: "\(currentField).fieldPath")
              let right = map["value"] ?? map["right"] ?? map["operand"] ?? NSNull()
              let rightBox = ExprBridgeBox()
              stack.append(.binaryOperatorExit(
                box,
                mapOperatorToFunction(normalizedOperator),
                leftFieldPath,
                rightBox,
                currentField
              ))
              stack.append(.enter(right, "\(currentField).value", .comparisonOperand, rightBox))
              break expressionLoop
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

              let normalized = canonicalizeFunctionName(name)

              if normalized == "array" {
                let elements: [Any]
                if rawArgs.count == 1,
                  let unwrapped = try unwrapConstantArray(rawArgs[0], fieldName: "\(currentField).args[0]") {
                  elements = unwrapped
                } else {
                  elements = rawArgs
                }

                if !elements.contains(where: containsSerializedExpression) {
                  box.value = ConstantBridge(try elements.enumerated().map { index, element in
                    try resolveConstantValue(element, fieldName: "\(currentField).args[\(index)]")
                  })
                  break expressionLoop
                }

                let argBoxes = elements.map { _ in ExprBridgeBox() }
                stack.append(.arrayExit(box, argBoxes, currentField))
                for index in elements.indices.reversed() {
                  stack.append(.enter(
                    elements[index],
                    "\(currentField).args[\(index)]",
                    .expressionValue,
                    argBoxes[index]
                  ))
                }
                break expressionLoop
              }

              if normalized == "map" {
                guard rawArgs.count == 1 else {
                  throw PipelineValidationError(
                    "pipelineExecute() expected \(currentField).map to include exactly 1 argument.")
                }

                if let entries = try unwrapConstantMap(rawArgs[0], fieldName: "\(currentField).args[0]") {
                  if !entries.values.contains(where: containsSerializedExpression) {
                    var resolved: [String: Any] = [:]
                    for (key, entryValue) in entries {
                      resolved[key] = try resolveConstantValue(
                        entryValue,
                        fieldName: "\(currentField).args[0].\(key)"
                      )
                    }
                    box.value = ConstantBridge(resolved)
                    break expressionLoop
                  }

                  let entryBoxes = entries.map { (key: $0.key, box: ExprBridgeBox(), value: $0.value) }
                  stack.append(.mapLiteralExit(
                    box,
                    entryBoxes.map { ($0.key, $0.box) },
                    currentField
                  ))
                  for entry in entryBoxes.reversed() {
                    stack.append(.enter(
                      entry.value,
                      "\(currentField).args[0].\(entry.key)",
                      .expressionValue,
                      entry.box
                    ))
                  }
                  break expressionLoop
                }

                let argBoxes = rawArgs.map { _ in ExprBridgeBox() }
                stack.append(.mapPassthroughExit(box, argBoxes, currentField))
                for index in rawArgs.indices.reversed() {
                  stack.append(.enter(
                    rawArgs[index],
                    "\(currentField).args[\(index)]",
                    .expressionValue,
                    argBoxes[index]
                  ))
                }
                break expressionLoop
              }

              if normalized == "conditional" {
                guard rawArgs.count == 3 else {
                  throw PipelineValidationError(
                    "pipelineExecute() expected \(currentField).conditional to include exactly 3 arguments.")
                }

                let conditionBox = ExprBridgeBox()
                let trueBox = ExprBridgeBox()
                let falseBox = ExprBridgeBox()
                stack.append(.conditionalExit(box, conditionBox, trueBox, falseBox, currentField))
                stack.append(.enter(rawArgs[2], "\(currentField).args[2]", .expressionValue, falseBox))
                stack.append(.enter(rawArgs[1], "\(currentField).args[1]", .expressionValue, trueBox))
                stack.append(.enter(rawArgs[0], "\(currentField).args[0]", .booleanExpression, conditionBox))
                break expressionLoop
              }

              if normalized == "logicalmaximum" || normalized == "logicalminimum" {
                guard rawArgs.count >= 2 else {
                  throw PipelineValidationError(
                    "pipelineExecute() expected \(currentField).\(name) to include at least 2 arguments.")
                }

                let argBoxes = rawArgs.map { _ in ExprBridgeBox() }
                stack.append(.functionExit(box, normalizeExpressionFunctionName(name), argBoxes, currentField))
                for index in rawArgs.indices.reversed() {
                  stack.append(.enter(
                    rawArgs[index],
                    "\(currentField).args[\(index)]",
                    .expressionValue,
                    argBoxes[index]
                  ))
                }
                break expressionLoop
              }

              if normalized == "cosinedistance" || normalized == "dotproduct" || normalized == "euclideandistance" {
                guard rawArgs.count == 2 else {
                  throw PipelineValidationError(
                    "pipelineExecute() expected \(currentField).\(name) to include exactly 2 arguments.")
                }

                let argBoxes = rawArgs.map { _ in ExprBridgeBox() }
                stack.append(.functionExit(box, normalizeExpressionFunctionName(name), argBoxes, currentField))
                stack.append(.enter(rawArgs[1], "\(currentField).args[1]", .vectorExpressionValue, argBoxes[1]))
                stack.append(.enter(rawArgs[0], "\(currentField).args[0]", .expressionValue, argBoxes[0]))
                break expressionLoop
              }

              if normalized == "and" || normalized == "or" {
                guard !rawArgs.isEmpty else {
                  throw PipelineValidationError(
                    "pipelineExecute() expected \(currentField).args to contain boolean expressions.")
                }

                let argBoxes = rawArgs.map { _ in ExprBridgeBox() }
                stack.append(.functionExit(box, normalized, argBoxes, currentField))
                for index in rawArgs.indices.reversed() {
                  stack.append(.enter(
                    rawArgs[index],
                    "\(currentField).args[\(index)]",
                    .booleanExpression,
                    argBoxes[index]
                  ))
                }
                break expressionLoop
              }

              if comparisonFunctions.contains(normalized) {
                guard rawArgs.count >= 2 else {
                  throw PipelineValidationError(
                    "pipelineExecute() expected \(currentField).args to include left and right operands.")
                }

                let argBoxes = rawArgs.map { _ in ExprBridgeBox() }
                stack.append(.functionExit(box, canonicalComparisonFunctionName(normalized), argBoxes, currentField))
                stack.append(.enter(rawArgs[1], "\(currentField).args[1]", .comparisonOperand, argBoxes[1]))
                stack.append(.enter(rawArgs[0], "\(currentField).args[0]", .expression, argBoxes[0]))
                break expressionLoop
              }

              let argBoxes = rawArgs.map { _ in ExprBridgeBox() }
              stack.append(.functionExit(box, normalizeExpressionFunctionName(name), argBoxes, currentField))
              for index in rawArgs.indices.reversed() {
                stack.append(.enter(
                  rawArgs[index],
                  "\(currentField).args[\(index)]",
                  .expressionValue,
                  argBoxes[index]
                ))
              }
              break expressionLoop
            }

            if map["fieldPath"] != nil || map["path"] != nil || map["segments"] != nil || map["_segments"] != nil {
              box.value = FieldBridge(name: try coerceFieldPath(map, fieldName: currentField))
              break expressionLoop
            }

            if let kind = (map["exprType"] as? String)?.lowercased(), kind == "constant" {
              box.value = ConstantBridge(map["value"] as Any)
              break expressionLoop
            }

            throw PipelineValidationError(
              "pipelineExecute() could not convert \(currentField) into a pipeline expression.")
          }
        }
      case let .functionExit(box, name, argBoxes, currentFieldName):
        box.value = FunctionExprBridge(
          name: name,
          args: try argBoxes.enumerated().map { index, argBox in
            try requireExpressionValue(argBox, fieldName: "\(currentFieldName).args[\(index)]")
          }
        )
      case let .conditionalExit(box, conditionBox, trueBox, falseBox, currentFieldName):
        box.value = FunctionExprBridge(name: "cond", args: [
          try requireExpressionValue(conditionBox, fieldName: "\(currentFieldName).args[0]"),
          try requireExpressionValue(trueBox, fieldName: "\(currentFieldName).args[1]"),
          try requireExpressionValue(falseBox, fieldName: "\(currentFieldName).args[2]"),
        ])
      case let .arrayExit(box, argBoxes, currentFieldName):
        box.value = FunctionExprBridge(
          name: "array",
          args: try argBoxes.enumerated().map { index, argBox in
            try requireExpressionValue(argBox, fieldName: "\(currentFieldName).args[\(index)]")
          }
        )
      case let .mapLiteralExit(box, entries, currentFieldName):
        var args: [ExprBridge] = []
        for (key, valueBox) in entries {
          args.append(ConstantBridge(key))
          args.append(try requireExpressionValue(valueBox, fieldName: "\(currentFieldName).args[0].\(key)"))
        }
        box.value = FunctionExprBridge(name: "map", args: args)
      case let .mapPassthroughExit(box, argBoxes, currentFieldName):
        box.value = FunctionExprBridge(
          name: "map",
          args: try argBoxes.enumerated().map { index, argBox in
            try requireExpressionValue(argBox, fieldName: "\(currentFieldName).args[\(index)]")
          }
        )
      case let .logicalOperatorExit(box, name, argBoxes, currentFieldName):
        box.value = FunctionExprBridge(
          name: name,
          args: try argBoxes.enumerated().map { index, argBox in
            try requireExpressionValue(argBox, fieldName: "\(currentFieldName).queries[\(index)]")
          }
        )
      case let .binaryOperatorExit(box, name, leftFieldPath, rightBox, currentFieldName):
        box.value = FunctionExprBridge(name: name, args: [
          FieldBridge(name: leftFieldPath),
          try requireExpressionValue(rightBox, fieldName: "\(currentFieldName).value"),
        ])
      }
    }

    return try requireExpressionValue(rootBox, fieldName: fieldName)
  }

  private func requireExpressionValue(_ box: ExprBridgeBox, fieldName: String) throws -> ExprBridge {
    guard let value = box.value else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be provided.")
    }
    return value
  }

  private func isImmediateExpressionConstant(_ value: Any) -> Bool {
    value is NSNull || value is NSNumber || value is Date || value is Timestamp ||
      value is GeoPoint || value is DocumentReference || value is VectorValue
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
    let rootBox = SerializedExpressionBox()
    var stack: [SerializationFrame] = [
      .expressionEnter(value, rootBox),
    ]

    while let frame = stack.popLast() {
      switch frame {
      case let .expressionEnter(expression, box):
        switch expression {
        case let .field(path):
          box.value = [
            "__kind": "expression",
            "exprType": "Field",
            "path": path,
          ]
        case let .constant(constantValue):
          let valueBox = SerializedValueBox()
          stack.append(.expressionConstantExit(box, valueBox))
          stack.append(.valueEnter(constantValue, valueBox))
        case let .function(name, args):
          let argBoxes = args.map { _ in SerializedValueBox() }
          stack.append(.expressionFunctionExit(box, name, argBoxes))
          for index in args.indices.reversed() {
            stack.append(.valueEnter(args[index], argBoxes[index]))
          }
        }
      case let .expressionFunctionExit(box, name, argBoxes):
        box.value = [
          "__kind": "expression",
          "exprType": "Function",
          "name": name,
          "args": argBoxes.map { $0.value as Any },
        ]
      case let .valueEnter(value, box):
        switch value {
        case let .primitive(primitive):
          box.value = primitive
        case let .list(values):
          let childBoxes = values.map { _ in SerializedValueBox() }
          stack.append(.valueListExit(box, childBoxes))
          for index in values.indices.reversed() {
            stack.append(.valueEnter(values[index], childBoxes[index]))
          }
        case let .map(values):
          let entries = values.map { (key: $0.key, box: SerializedValueBox(), value: $0.value) }
          stack.append(.valueMapExit(box, entries.map { ($0.key, $0.box) }))
          for entry in entries.reversed() {
            stack.append(.valueEnter(entry.value, entry.box))
          }
        case let .expression(expression):
          let expressionBox = SerializedExpressionBox()
          stack.append(.valueExpressionExit(box, expressionBox))
          stack.append(.expressionEnter(expression, expressionBox))
        }
      case let .valueListExit(box, childBoxes):
        box.value = childBoxes.map { $0.value as Any }
      case let .valueMapExit(box, entries):
        var output: [String: Any] = [:]
        for (key, childBox) in entries {
          output[key] = childBox.value
        }
        box.value = output
      case let .expressionConstantExit(expressionBox, valueBox):
        expressionBox.value = [
          "__kind": "expression",
          "exprType": "constant",
          "value": valueBox.value as Any,
        ]
      case let .valueExpressionExit(valueBox, expressionBox):
        valueBox.value = expressionBox.value
      }
    }

    return rootBox.value as Any
  }

  private func serializeValueNode(_ value: RNFBFirestoreParsedValueNode) -> Any {
    let rootBox = SerializedValueBox()
    var stack: [SerializationFrame] = [
      .valueEnter(value, rootBox),
    ]

    while let frame = stack.popLast() {
      switch frame {
      case let .valueEnter(value, box):
        switch value {
        case let .primitive(primitive):
          box.value = primitive
        case let .list(values):
          let childBoxes = values.map { _ in SerializedValueBox() }
          stack.append(.valueListExit(box, childBoxes))
          for index in values.indices.reversed() {
            stack.append(.valueEnter(values[index], childBoxes[index]))
          }
        case let .map(values):
          let entries = values.map { (key: $0.key, box: SerializedValueBox(), value: $0.value) }
          stack.append(.valueMapExit(box, entries.map { ($0.key, $0.box) }))
          for entry in entries.reversed() {
            stack.append(.valueEnter(entry.value, entry.box))
          }
        case let .expression(expression):
          let expressionBox = SerializedExpressionBox()
          stack.append(.valueExpressionExit(box, expressionBox))
          stack.append(.expressionEnter(expression, expressionBox))
        }
      case let .valueListExit(box, childBoxes):
        box.value = childBoxes.map { $0.value as Any }
      case let .valueMapExit(box, entries):
        var output: [String: Any] = [:]
        for (key, childBox) in entries {
          output[key] = childBox.value
        }
        box.value = output
      case let .expressionEnter(expression, box):
        switch expression {
        case let .field(path):
          box.value = [
            "__kind": "expression",
            "exprType": "Field",
            "path": path,
          ]
        case let .constant(constantValue):
          let valueBox = SerializedValueBox()
          stack.append(.expressionConstantExit(box, valueBox))
          stack.append(.valueEnter(constantValue, valueBox))
        case let .function(name, args):
          let argBoxes = args.map { _ in SerializedValueBox() }
          stack.append(.expressionFunctionExit(box, name, argBoxes))
          for index in args.indices.reversed() {
            stack.append(.valueEnter(args[index], argBoxes[index]))
          }
        }
      case let .expressionFunctionExit(box, name, argBoxes):
        box.value = [
          "__kind": "expression",
          "exprType": "Function",
          "name": name,
          "args": argBoxes.map { $0.value as Any },
        ]
      case let .expressionConstantExit(expressionBox, valueBox):
        expressionBox.value = [
          "__kind": "expression",
          "exprType": "constant",
          "value": valueBox.value as Any,
        ]
      case let .valueExpressionExit(valueBox, expressionBox):
        valueBox.value = expressionBox.value
      }
    }

    return rootBox.value as Any
  }

  private func coerceNumber(_ value: Any, fieldName: String) throws -> Double {
    if let number = value as? NSNumber {
      return number.doubleValue
    }
    throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a number.")
  }
}
