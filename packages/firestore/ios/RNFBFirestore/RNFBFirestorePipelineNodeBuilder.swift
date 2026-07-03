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
  var currentFirestore: Firestore?
  var buildNestedPipelineSubquery: ((Firestore, [String: Any], Bool) throws -> ExprBridge)?

  #if DEBUG
  private var pipelineCoercionDebugEnabled: Bool {
    ProcessInfo.processInfo.environment["RNFB_PIPELINE_COERCION_DEBUG"] == "1"
  }

  private func pipelineCoercionLog(_ message: String) {
    if pipelineCoercionDebugEnabled {
      NSLog("[RNFBPipelineCoercion] %@", message)
    }
  }
  #endif

  private final class SerializedValueBox {
    var value: Any?
  }

  private final class SerializedExpressionBox {
    var value: Any?
  }

  private final class ExprBridgeBox {
    var value: ExprBridge?
  }

  private final class ArrayCountLiteralBox {
    var literalCount: Int?
    var expressionCountBox: ExprBridgeBox?
  }

  private final class ArraySliceLiteralBox {
    var literalOffset: Int?
    var expressionOffsetBox: ExprBridgeBox?
    var hasLengthArg = false
    var literalLength: Int?
    var expressionLengthBox: ExprBridgeBox?
  }

  private enum ArrayCountExpressionMethod: String {
    case arrayFirstN
    case arrayLastN
    case arrayMaximumN
    case arrayMinimumN
  }

  private final class RawParamBox {
    var value: Any?
  }

  private enum ExpressionCoercionMode {
    case expression
    case booleanExpression
    case booleanReceiverExpression
    case expressionValue
    case comparisonOperand
    case numericOperand
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
    case arrayCountExit(
      ExprBridgeBox,
      ExprBridgeBox,
      ArrayCountLiteralBox,
      ArrayCountExpressionMethod,
      String
    )
    case arraySliceExit(
      ExprBridgeBox,
      ExprBridgeBox,
      ArraySliceLiteralBox,
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

  func coerceStageOptionFieldName(
    _ value: RNFBFirestoreParsedExpressionNode,
    fieldName: String
  ) throws -> String {
    switch value {
    case let .field(path):
      return path
    case let .constant(constantValue):
      return try coerceStringValue(serializeValueNode(constantValue), fieldName: fieldName)
    default:
      return try coerceFieldPath(serializeExpressionNode(value), fieldName: fieldName)
    }
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

    if normalizedKind == "count_if" {
      var predicate = aggregate["expr"] ?? aggregate["field"] ?? aggregate["value"]
      if predicate == nil, let extraArgs = aggregate["args"] as? [Any], let first = extraArgs.first {
        predicate = first
      }
      guard let predicate else {
        throw PipelineValidationError("pipelineExecute() expected \(fieldName) to include an expression for countIf.")
      }
      return AggregateFunctionBridge(
        name: "count_if",
        args: [try coerceBooleanExpression(predicate, fieldName: "\(fieldName).expr")]
      )
    }

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

  private func coerceStringValue(_ value: Any, fieldName: String) throws -> String {
    let resolved = try resolveConstantValue(value, fieldName: fieldName)
    guard let string = resolved as? String else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to resolve to a string.")
    }
    return string
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

    if map["integerLiteral"] as? Bool == true {
      if let boolValue = value as? Bool {
        return boolValue ? 1 : 0
      }
      if let number = value as? NSNumber {
        if isBooleanNSNumber(number) {
          return number.boolValue ? 1 : 0
        }
        if let intValue = wholeNumberInt(from: number) {
          return intValue
        }
      }
      if let intValue = value as? Int {
        return intValue
      }
    }

    return value
  }

  private func scalarConstantBridge(fromConstantMap map: [String: Any], fieldName: String) throws -> ExprBridge {
    guard let kind = (map["exprType"] as? String)?.lowercased(), kind == "constant" else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a constant expression.")
    }

    if map["integerLiteral"] as? Bool == true {
      if let boolValue = map["value"] as? Bool {
        return ConstantBridge(boolValue ? 1 : 0)
      }
      if let number = map["value"] as? NSNumber {
        if isBooleanNSNumber(number) {
          return ConstantBridge(number.boolValue ? 1 : 0)
        }
        if let intValue = wholeNumberInt(from: number) {
          return ConstantBridge(intValue)
        }
      }
      if let intValue = map["value"] as? Int {
        return ConstantBridge(intValue)
      }
    }

    guard let value = map["value"] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).value to be provided.")
    }

    return scalarConstantBridge(from: value)
  }

  private func isSerializedExpressionLike(_ map: [String: Any]) -> Bool {
    if let kind = (map["exprType"] as? String)?.lowercased(), kind == "constant" {
      return false
    }

    return map["exprType"] != nil || map["operator"] != nil || map["name"] != nil || map["expr"] != nil ||
      map["expression"] != nil || map["fieldPath"] != nil || map["path"] != nil ||
      map["segments"] != nil || map["_segments"] != nil
  }

  private let booleanComparisonFunctions: Set<String> = [
    "equal", "notequal", "greaterthan", "greaterthanorequal", "lessthan", "lessthanorequal",
    "arraycontains", "arraycontainsany", "arraycontainsall", "equalany", "notequalany",
  ]

  private func isBooleanComparisonFunction(_ normalizedName: String) -> Bool {
    booleanComparisonFunctions.contains(normalizedName)
  }

  private func advanceSerializedExpressionEnvelope(
    value: inout Any,
    fieldName: inout String,
    map: [String: Any]
  ) -> Bool {
    if let nested = map["expr"] {
      value = nested
      fieldName = "\(fieldName).expr"
      return true
    }
    if let nested = map["expression"] {
      value = nested
      fieldName = "\(fieldName).expression"
      return true
    }
    return false
  }

  private func functionArgs(from map: [String: Any]) -> [Any] {
    if let args = map["args"] as? [Any] {
      return args
    }
    if let singleArg = map["args"] {
      return [singleArg]
    }
    return []
  }

  private func constantExpressionValue(fromConstantMap map: [String: Any], fieldName: String) throws -> Any {
    guard let kind = (map["exprType"] as? String)?.lowercased(), kind == "constant" else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a constant expression.")
    }

    if map["integerLiteral"] as? Bool == true {
      if let boolValue = map["value"] as? Bool {
        return boolValue ? 1 : 0
      }
      if let number = map["value"] as? NSNumber {
        if isBooleanNSNumber(number) {
          return number.boolValue ? 1 : 0
        }
        if let intValue = wholeNumberInt(from: number) {
          return intValue
        }
      }
      if let intValue = map["value"] as? Int {
        return intValue
      }
    }

    guard let value = map["value"] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName).value to be provided.")
    }

    return value
  }

  private func coerceSendableConstant(_ value: Any) -> any Sendable {
    switch value {
    case let intValue as Int:
      return intValue
    case let doubleValue as Double:
      return doubleValue
    case let stringValue as String:
      return stringValue
    case let boolValue as Bool:
      return boolValue
    case let number as NSNumber:
      if isBooleanNSNumber(number) {
        return number.boolValue
      }
      if let intValue = wholeNumberInt(from: number) {
        return intValue
      }
      return number.doubleValue
    case let dateValue as Date:
      return dateValue
    case let timestampValue as Timestamp:
      return timestampValue
    case let geoPointValue as GeoPoint:
      return geoPointValue
    case let referenceValue as DocumentReference:
      return referenceValue
    case let vectorValue as VectorValue:
      return vectorValue
    default:
      return value as! Sendable
    }
  }

  private func firebaseConstantExpression(_ value: Any) -> any FirebaseFirestore.Expression {
    switch value {
    case let stringValue as String:
      return Constant(stringValue)
    case let intValue as Int:
      return Constant(intValue)
    case let doubleValue as Double:
      return Constant(doubleValue)
    case let boolValue as Bool:
      return Constant(boolValue)
    case let number as NSNumber:
      if isBooleanNSNumber(number) {
        return Constant(number.boolValue)
      }
      if let intValue = wholeNumberInt(from: number) {
        return Constant(intValue)
      }
      return Constant(number.doubleValue)
    case let dateValue as Date:
      return Constant(dateValue)
    case let timestampValue as Timestamp:
      return Constant(timestampValue)
    case let geoPointValue as GeoPoint:
      return Constant(geoPointValue)
    case let referenceValue as DocumentReference:
      return Constant(referenceValue)
    case let vectorValue as VectorValue:
      return Constant(vectorValue)
    default:
      return Constant(String(describing: value))
    }
  }

  private func coerceFirebaseExpressionArray(
    _ value: Any,
    fieldName: String
  ) throws -> [any FirebaseFirestore.Expression] {
    let resolved = try resolveConstantValue(value, fieldName: fieldName)
    guard let array = resolved as? [Any] else {
      throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be an array.")
    }
    return array.map { firebaseConstantExpression($0) }
  }

  private func bridgeFromSDKValue(_ value: Any) -> ExprBridge? {
    if let bridge = value as? ExprBridge {
      return bridge
    }

    let object = value as AnyObject
    if object.responds(to: Selector(("bridge"))) {
      if let bridge = object.perform(Selector(("bridge")))?.takeUnretainedValue() as? ExprBridge {
        return bridge
      }
    }

    if let functionExpression = value as? FunctionExpression {
      let mirror = Mirror(reflecting: functionExpression)
      for child in mirror.children {
        if child.label == "bridge", let bridge = child.value as? ExprBridge {
          return bridge
        }
      }
    }

    return nil
  }

  private func pipelineExprBridge(_ value: Any) throws -> ExprBridge {
    #if DEBUG
    pipelineCoercionLog("pipelineExprBridge \(String(describing: type(of: value)))")
    #endif
    if let bridge = bridgeFromSDKValue(value) {
      return bridge
    }

    throw PipelineValidationError("pipelineExecute() could not convert a pipeline value into a native bridge.")
  }

  private func switchOnConditionBridge(
    from expression: any FirebaseFirestore.BooleanExpression,
    fieldName: String
  ) throws -> ExprBridge {
    let probeExpression = FunctionExpression(
      functionName: "switch_on",
      args: [expression, Constant("")],
      options: nil
    )
    let switchBridge = try pipelineExprBridge(probeExpression)
    if let args = (switchBridge as AnyObject).value(forKey: "args") as? [ExprBridge],
      let conditionBridge = args.first {
      return conditionBridge
    }

    throw PipelineValidationError(
      "pipelineExecute() could not convert \(fieldName) into a boolean expression bridge.")
  }

  private func booleanExpressionBridge(
    _ expression: any FirebaseFirestore.BooleanExpression,
    fieldName: String
  ) throws -> ExprBridge {
    #if DEBUG
    pipelineCoercionLog("booleanExpressionBridge field=\(fieldName)")
    #endif
    if let bridge = bridgeFromSDKValue(expression) {
      return bridge
    }

    return try switchOnConditionBridge(from: expression, fieldName: fieldName)
  }

  private func coerceBooleanComparisonReceiverBridge(
    _ value: Any,
    fieldName: String
  ) throws -> ExprBridge {
    #if DEBUG
    pipelineCoercionLog("booleanComparisonReceiverBridge at \(fieldName)")
    #endif
    let expression = try coerceFirebaseExpression(value, fieldName: fieldName)
    guard let booleanExpression = expression as? any FirebaseFirestore.BooleanExpression else {
      throw PipelineValidationError(
        "pipelineExecute() expected \(fieldName) to be a boolean comparison expression.")
    }
    return try booleanExpressionBridge(booleanExpression, fieldName: fieldName)
  }

  private struct PendingReceiverOperation {
    let normalizedName: String
    let originalName: String
    let args: [Any]
    let fieldName: String
  }

  private struct ReceiverExpressionChainSeed {
    let baseValue: Any
    let baseFieldName: String
    let operations: [PendingReceiverOperation]
  }

  private func isReceiverExpressionFunction(_ normalizedName: String) -> Bool {
    switch normalizedName {
    case "substring", "arrayget", "timestampadd", "timestampsubtract":
      return true
    default:
      return false
    }
  }

  private func collectReceiverExpressionChain(
    normalizedName: String,
    originalName: String,
    args: [Any],
    fieldName: String
  ) throws -> ReceiverExpressionChainSeed {
    guard !args.isEmpty else {
      throw PipelineValidationError(
        "pipelineExecute() expected \(fieldName).\(originalName) to include at least 1 argument.")
    }

    var operations = [
      PendingReceiverOperation(
        normalizedName: normalizedName,
        originalName: originalName,
        args: args,
        fieldName: fieldName
      ),
    ]

    var currentValue: Any = args[0]
    var currentFieldName = "\(fieldName).args[0]"

    while true {
      guard let map = currentValue as? [String: Any] else {
        break
      }

      if advanceSerializedExpressionEnvelope(value: &currentValue, fieldName: &currentFieldName, map: map) {
        continue
      }

      guard let nestedName = map["name"] as? String else {
        break
      }

      let nestedArgs = functionArgs(from: map)
      let nestedNormalized = canonicalizeFunctionName(nestedName)
      guard isReceiverExpressionFunction(nestedNormalized), !nestedArgs.isEmpty else {
        break
      }

      operations.append(
        PendingReceiverOperation(
          normalizedName: nestedNormalized,
          originalName: nestedName,
          args: nestedArgs,
          fieldName: currentFieldName
        )
      )
      currentValue = nestedArgs[0]
      currentFieldName = "\(currentFieldName).args[0]"
    }

    return ReceiverExpressionChainSeed(
      baseValue: currentValue,
      baseFieldName: currentFieldName,
      operations: operations
    )
  }

  private func tryCoerceStringConstant(_ value: Any, fieldName: String) -> String? {
    if let stringValue = value as? String {
      return stringValue
    }
    guard let map = value as? [String: Any],
      (map["exprType"] as? String)?.lowercased() == "constant",
      let raw = map["value"] as? String else {
      return nil
    }
    return raw
  }

  private func requireWholeNumber(_ value: Any, fieldName: String) throws -> Int {
    if let intValue = tryIntegerLiteral(from: value) {
      return intValue
    }
    throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be an integer.")
  }

  private func applyTimestampMathReceiver(
    add: Bool,
    expression: any FirebaseFirestore.Expression,
    unitArg: Any,
    amountArg: Any,
    fieldName: String
  ) throws -> any FirebaseFirestore.Expression {
    if !containsSerializedExpression(unitArg), !containsSerializedExpression(amountArg),
      let unit = tryCoerceStringConstant(unitArg, fieldName: "\(fieldName).args[1]"),
      let amount = tryIntegerLiteral(from: amountArg) {
      let amountExpression = firebaseConstantExpression(amount)
      if add {
        return expression.timestampAdd(amount: amountExpression, unit: unit)
      }
      return expression.timestampSubtract(amount: amountExpression, unit: unit)
    }

    let unitExpression = try coerceFirebaseExpression(unitArg, fieldName: "\(fieldName).args[1]")
    let amountExpression = try coerceFirebaseExpression(amountArg, fieldName: "\(fieldName).args[2]")
    if add {
      return expression.timestampAdd(amount: amountExpression, unit: unitExpression)
    }
    return expression.timestampSubtract(amount: amountExpression, unit: unitExpression)
  }

  private func applyExpressionReceiverOperation(
    to expression: any FirebaseFirestore.Expression,
    operation: PendingReceiverOperation
  ) throws -> any FirebaseFirestore.Expression {
    switch operation.normalizedName {
    case "substring":
      guard operation.args.count >= 2 else {
        throw PipelineValidationError(
          "pipelineExecute() expected \(operation.fieldName).\(operation.originalName) to include at least 2 arguments.")
      }
      let positionArg = operation.args[1]
      if operation.args.count >= 3 {
        let lengthArg = operation.args[2]
        if !containsSerializedExpression(positionArg), !containsSerializedExpression(lengthArg) {
          let position = try requireWholeNumber(positionArg, fieldName: "\(operation.fieldName).args[1]")
          let length = try requireWholeNumber(lengthArg, fieldName: "\(operation.fieldName).args[2]")
          return expression.substring(position: position, length: length)
        }
        let positionExpression = try coerceFirebaseExpression(
          positionArg, fieldName: "\(operation.fieldName).args[1]")
        let lengthExpression = try coerceFirebaseExpression(
          lengthArg, fieldName: "\(operation.fieldName).args[2]")
        return expression.substring(position: positionExpression, length: lengthExpression)
      }
      if !containsSerializedExpression(positionArg) {
        let position = try requireWholeNumber(positionArg, fieldName: "\(operation.fieldName).args[1]")
        return expression.substring(position: position)
      }
      let positionExpression = try coerceFirebaseExpression(
        positionArg, fieldName: "\(operation.fieldName).args[1]")
      return expression.substring(position: positionExpression)
    case "arrayget":
      guard operation.args.count >= 2 else {
        throw PipelineValidationError(
          "pipelineExecute() expected \(operation.fieldName).\(operation.originalName) to include at least 2 arguments.")
      }
      let indexArg = operation.args[1]
      if !containsSerializedExpression(indexArg), let index = tryIntegerLiteral(from: indexArg) {
        return expression.arrayGet(index)
      }
      let indexExpression = try coerceFirebaseExpression(
        indexArg, fieldName: "\(operation.fieldName).args[1]")
      return expression.arrayGet(indexExpression)
    case "timestampadd":
      guard operation.args.count == 3 else {
        throw PipelineValidationError(
          "pipelineExecute() expected \(operation.fieldName).\(operation.originalName) to include exactly 3 arguments.")
      }
      return try applyTimestampMathReceiver(
        add: true,
        expression: expression,
        unitArg: operation.args[1],
        amountArg: operation.args[2],
        fieldName: operation.fieldName
      )
    case "timestampsubtract":
      guard operation.args.count == 3 else {
        throw PipelineValidationError(
          "pipelineExecute() expected \(operation.fieldName).\(operation.originalName) to include exactly 3 arguments.")
      }
      return try applyTimestampMathReceiver(
        add: false,
        expression: expression,
        unitArg: operation.args[1],
        amountArg: operation.args[2],
        fieldName: operation.fieldName
      )
    default:
      throw PipelineValidationError("pipelineExecute() expected a receiver expression operation.")
    }
  }

  private func buildReceiverFirebaseExpression(
    normalizedName: String,
    originalName: String,
    rawArgs: [Any],
    fieldName: String
  ) throws -> any FirebaseFirestore.Expression {
    let seed = try collectReceiverExpressionChain(
      normalizedName: normalizedName,
      originalName: originalName,
      args: rawArgs,
      fieldName: fieldName
    )
    var expression = try coerceFirebaseExpression(seed.baseValue, fieldName: seed.baseFieldName)
    for operation in seed.operations.reversed() {
      expression = try applyExpressionReceiverOperation(to: expression, operation: operation)
    }
    return expression
  }

  private func expressionBridge(
    _ expression: any FirebaseFirestore.Expression,
    fieldName: String
  ) throws -> ExprBridge {
    if let bridge = bridgeFromSDKValue(expression) {
      return bridge
    }

    throw PipelineValidationError(
      "pipelineExecute() could not convert \(fieldName) into an expression bridge.")
  }

  private func coerceReceiverExpressionBridge(
    _ map: [String: Any],
    fieldName: String
  ) throws -> ExprBridge {
    guard let name = map["name"] as? String else {
      throw PipelineValidationError(
        "pipelineExecute() expected \(fieldName) to be a receiver expression.")
    }
    let rawArgs = functionArgs(from: map)
    let normalized = canonicalizeFunctionName(name)
    let expression = try buildReceiverFirebaseExpression(
      normalizedName: normalized,
      originalName: name,
      rawArgs: rawArgs,
      fieldName: fieldName
    )
    return try expressionBridge(expression, fieldName: fieldName)
  }

  // Builds Firebase SDK `Expression` values for boolean receiver APIs (`.equal()`, etc.).
  // Wire-based lowering uses `coerceExpressionTree` → `ExprBridge`; the two paths share
  // serialized envelope helpers but target different SDK types by design.
  private func coerceFirebaseExpression(_ value: Any, fieldName: String) throws -> any FirebaseFirestore.Expression {
    var currentValue: Any = value
    var currentField = fieldName

    while true {
      if let stringValue = currentValue as? String {
        return Field(stringValue)
      }

      guard let map = currentValue as? [String: Any] else {
        throw PipelineValidationError(
          "pipelineExecute() could not convert \(currentField) into a pipeline expression.")
      }

      if advanceSerializedExpressionEnvelope(value: &currentValue, fieldName: &currentField, map: map) {
        continue
      }

      if let kind = (map["exprType"] as? String)?.lowercased() {
        switch kind {
        case "field":
          return Field(try coerceFieldPath(map, fieldName: currentField))
        case "constant":
          return firebaseConstantExpression(try constantExpressionValue(fromConstantMap: map, fieldName: currentField))
        case "variable":
          guard let name = map["name"] as? String, !name.isEmpty else {
            throw PipelineValidationError(
              "pipelineExecute() expected \(currentField).name to be a non-empty string.")
          }
          return Variable(name)
        default:
          break
        }
      }

      if map["fieldPath"] != nil || map["path"] != nil || map["segments"] != nil || map["_segments"] != nil {
        return Field(try coerceFieldPath(map, fieldName: currentField))
      }

      if let name = map["name"] as? String {
        let rawArgs = functionArgs(from: map)
        let normalized = canonicalizeFunctionName(name)
        if isBooleanComparisonFunction(normalized) {
          guard rawArgs.count >= 2 else {
            throw PipelineValidationError(
              "pipelineExecute() expected \(currentField).args to include left and right operands.")
          }
          return try applyBooleanReceiver(
            normalizedName: normalized,
            left: try coerceFirebaseExpression(rawArgs[0], fieldName: "\(currentField).args[0]"),
            right: rawArgs[1],
            fieldName: "\(currentField).args[1]"
          )
        }

        if isReceiverExpressionFunction(normalized) {
          return try buildReceiverFirebaseExpression(
            normalizedName: normalized,
            originalName: name,
            rawArgs: rawArgs,
            fieldName: currentField
          )
        }

        let args = try rawArgs.enumerated().map { index, arg in
          try coerceFirebaseExpression(arg, fieldName: "\(currentField).args[\(index)]")
        }
        return FunctionExpression(
          functionName: normalizeExpressionFunctionName(name),
          args: args,
          options: nil
        )
      }

      throw PipelineValidationError(
        "pipelineExecute() could not convert \(currentField) into a pipeline expression.")
    }
  }

  private func applyBooleanReceiverConstant(
    normalizedName: String,
    left: any FirebaseFirestore.Expression,
    right: Any,
    fieldName: String
  ) throws -> (any FirebaseFirestore.BooleanExpression)? {
    if containsSerializedExpression(right) {
      return nil
    }

    switch normalizedName {
    case "arraycontainsany":
      return left.arrayContainsAny(try coerceFirebaseExpressionArray(right, fieldName: fieldName))
    case "arraycontainsall":
      return left.arrayContainsAll(try coerceFirebaseExpressionArray(right, fieldName: fieldName))
    case "equalany":
      return left.equalAny(try coerceFirebaseExpressionArray(right, fieldName: fieldName))
    case "notequalany":
      return left.notEqualAny(try coerceFirebaseExpressionArray(right, fieldName: fieldName))
    default:
      let constant = coerceSendableConstant(try resolveConstantValue(right, fieldName: fieldName))
      switch normalizedName {
      case "equal":
        return left.equal(constant)
      case "notequal":
        return left.notEqual(constant)
      case "greaterthan":
        return left.greaterThan(constant)
      case "greaterthanorequal":
        return left.greaterThanOrEqual(constant)
      case "lessthan":
        return left.lessThan(constant)
      case "lessthanorequal":
        return left.lessThanOrEqual(constant)
      case "arraycontains":
        return left.arrayContains(constant)
      default:
        throw PipelineValidationError("pipelineExecute() expected a boolean receiver operation.")
      }
    }
  }

  private func applyBooleanReceiverExpression(
    normalizedName: String,
    left: any FirebaseFirestore.Expression,
    right: any FirebaseFirestore.Expression
  ) throws -> any FirebaseFirestore.BooleanExpression {
    switch normalizedName {
    case "equal":
      return left.equal(right)
    case "notequal":
      return left.notEqual(right)
    case "greaterthan":
      return left.greaterThan(right)
    case "greaterthanorequal":
      return left.greaterThanOrEqual(right)
    case "lessthan":
      return left.lessThan(right)
    case "lessthanorequal":
      return left.lessThanOrEqual(right)
    case "arraycontains":
      return left.arrayContains(right)
    case "arraycontainsany":
      return left.arrayContainsAny(right)
    case "arraycontainsall":
      return left.arrayContainsAll(right)
    case "equalany":
      return left.equalAny(right)
    case "notequalany":
      return left.notEqualAny(right)
    default:
      throw PipelineValidationError("pipelineExecute() expected a boolean receiver operation.")
    }
  }

  private func applyBooleanReceiver(
    normalizedName: String,
    left: any FirebaseFirestore.Expression,
    right: Any,
    fieldName: String
  ) throws -> any FirebaseFirestore.BooleanExpression {
    #if DEBUG
    pipelineCoercionLog("applyBooleanReceiver \(normalizedName) at \(fieldName)")
    #endif
    if let constantResult = try applyBooleanReceiverConstant(
      normalizedName: normalizedName,
      left: left,
      right: right,
      fieldName: fieldName
    ) {
      return constantResult
    }

    return try applyBooleanReceiverExpression(
      normalizedName: normalizedName,
      left: left,
      right: try coerceFirebaseExpression(right, fieldName: fieldName)
    )
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
      return "conditional"
    case "arraytransformwithindex":
      return "array_transform"
    case "arraylastindexof":
      return "array_index_of"
    case "logicalmaximum", "arraymaximum":
      return "maximum"
    case "arraymaximumn":
      return "maximum_n"
    case "logicalminimum", "arrayminimum":
      return "minimum"
    case "arrayminimumn":
      return "minimum_n"
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
      return "timestamp_subtract"
    case "timestamptruncate":
      return "timestamp_trunc"
    case "arraycontains":
      return "array_contains"
    case "arraycontainsany":
      return "array_contains_any"
    case "arraycontainsall":
      return "array_contains_all"
    case "arrayfirst":
      return "array_first"
    case "arrayfirstn":
      return "array_first_n"
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
    case "switchon":
      return "switch_on"
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

  // NOTE: iOS pipeline function lowering lives in this builder.
  //
  // If a serialized JS pipeline function is not supported by the currently linked
  // Firebase iOS pipeline runtime, implement or document the lowering here.
  private func coerceExpressionTree(
    _ value: Any,
    fieldName: String,
    mode: ExpressionCoercionMode
  ) throws -> ExprBridge {
    let orderingComparisonFunctions: Set<String> = [
      "greaterthan", "greaterthanorequal", "lessthan", "lessthanorequal",
    ]
    let arithmeticFunctions: Set<String> = [
      "add", "subtract", "multiply", "divide", "mod", "pow",
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
          if let map = value as? [String: Any],
             let kind = (map["exprType"] as? String)?.lowercased(), kind == "constant" {
            box.value = try scalarConstantBridge(fromConstantMap: map, fieldName: currentFieldName)
            continue
          }
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
            box.value = ConstantBridge(try resolveConstantValue(values, fieldName: currentFieldName))
            continue
          }
          if let stringValue = value as? String {
            box.value = ConstantBridge(stringValue)
            continue
          }
          if isImmediateExpressionConstant(value) {
            box.value = scalarConstantBridge(from: value)
            continue
          }
          stack.append(.enter(value, currentFieldName, .expression, box))
          continue
        case .numericOperand:
          if let map = value as? [String: Any],
             let kind = (map["exprType"] as? String)?.lowercased(), kind == "constant" {
            if let boolValue = map["value"] as? Bool {
              box.value = ConstantBridge(boolValue ? 1.0 : 0.0)
              continue
            }
            if let number = map["value"] as? NSNumber, isBooleanNSNumber(number) {
              box.value = ConstantBridge(number.boolValue ? 1.0 : 0.0)
              continue
            }
            let constantValue = try constantExpressionValue(fromConstantMap: map, fieldName: currentFieldName)
            box.value = try numericOperandConstantBridge(from: constantValue)
            continue
          }
          if let values = value as? [Any] {
            box.value = ConstantBridge(try resolveConstantValue(values, fieldName: currentFieldName))
            continue
          }
          if let stringValue = value as? String {
            box.value = try numericOperandConstantBridge(from: stringValue)
            continue
          }
          if let boolValue = value as? Bool {
            box.value = ConstantBridge(boolValue ? 1.0 : 0.0)
            continue
          }
          if let number = value as? NSNumber, isBooleanNSNumber(number) {
            box.value = ConstantBridge(number.boolValue ? 1.0 : 0.0)
            continue
          }
          if isImmediateExpressionConstant(value) {
            box.value = try numericOperandConstantBridge(from: value)
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
        case .expression, .booleanExpression, .booleanReceiverExpression:
          var currentValue: Any = value
          var currentField = currentFieldName

          expressionLoop: while true {
            if currentMode == .booleanExpression || currentMode == .booleanReceiverExpression,
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
              box.value = scalarConstantBridge(from: currentValue)
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
              let comparisonFunction = mapOperatorToFunction(normalizedOperator)
              let normalizedComparisonFunction = canonicalizeFunctionName(comparisonFunction)
              let rawWhereRightOperandMode: ExpressionCoercionMode =
                orderingComparisonFunctions.contains(normalizedComparisonFunction)
                  ? .numericOperand
                  : .comparisonOperand
              stack.append(.binaryOperatorExit(
                box,
                comparisonFunction,
                leftFieldPath,
                rightBox,
                currentField
              ))
              stack.append(.enter(right, "\(currentField).value", rawWhereRightOperandMode, rightBox))
              break expressionLoop
            }

            if let kind = (map["exprType"] as? String)?.lowercased(), kind == "variable" {
              guard let name = map["name"] as? String, !name.isEmpty else {
                throw PipelineValidationError("pipelineExecute() expected \(currentField).name to be a non-empty string.")
              }
              box.value = VariableBridge(name: name)
              break expressionLoop
            }

            if let kind = (map["exprType"] as? String)?.lowercased(), kind == "pipelinevalue" {
              if let pipelineMap = map["pipeline"] as? [String: Any],
                let firestore = currentFirestore,
                let builder = buildNestedPipelineSubquery {
                box.value = try builder(firestore, pipelineMap, true)
                break expressionLoop
              }
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

              if normalized == "scalar" {
                guard rawArgs.count == 1,
                  let firestore = currentFirestore,
                  let pipelineMap = extractNestedPipelineMap(rawArgs[0]),
                  let builder = buildNestedPipelineSubquery else {
                  throw PipelineValidationError(
                    "pipelineExecute() expected \(currentField) to contain a nested pipeline subquery.")
                }
                box.value = try builder(firestore, pipelineMap, true)
                break expressionLoop
              }

              if normalized == "array" {
                if rawArgs.count == 1, let pipelineMap = extractNestedPipelineMap(rawArgs[0]),
                  let firestore = currentFirestore,
                  let builder = buildNestedPipelineSubquery {
                  box.value = try builder(firestore, pipelineMap, false)
                  break expressionLoop
                }

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

              if normalized == "arrayfirst" {
                guard rawArgs.count == 1 else {
                  throw PipelineValidationError(
                    "pipelineExecute() expected \(currentField).\(name) to include exactly 1 argument.")
                }

                let argBoxes = rawArgs.map { _ in ExprBridgeBox() }
                stack.append(.functionExit(box, "array_first", argBoxes, currentField))
                stack.append(.enter(rawArgs[0], "\(currentField).args[0]", .expressionValue, argBoxes[0]))
                break expressionLoop
              }

              if normalized == "arrayfirstn" {
                try pushArrayCountExpressionFrame(
                  stack: &stack,
                  box: box,
                  rawArgs: rawArgs,
                  currentField: currentField,
                  method: .arrayFirstN
                )
                break expressionLoop
              }

              if normalized == "arraylastn" {
                try pushArrayCountExpressionFrame(
                  stack: &stack,
                  box: box,
                  rawArgs: rawArgs,
                  currentField: currentField,
                  method: .arrayLastN
                )
                break expressionLoop
              }

              if normalized == "arraymaximumn" {
                try pushArrayCountExpressionFrame(
                  stack: &stack,
                  box: box,
                  rawArgs: rawArgs,
                  currentField: currentField,
                  method: .arrayMaximumN
                )
                break expressionLoop
              }

              if normalized == "arrayminimumn" {
                try pushArrayCountExpressionFrame(
                  stack: &stack,
                  box: box,
                  rawArgs: rawArgs,
                  currentField: currentField,
                  method: .arrayMinimumN
                )
                break expressionLoop
              }

              if normalized == "arrayslice" {
                try pushArraySliceExpressionFrame(
                  stack: &stack,
                  box: box,
                  rawArgs: rawArgs,
                  currentField: currentField
                )
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

              if normalized == "and" || normalized == "or" || normalized == "xor" || normalized == "nor" {
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

              if booleanComparisonFunctions.contains(normalized) {
                guard rawArgs.count >= 2 else {
                  throw PipelineValidationError(
                    "pipelineExecute() expected \(currentField).args to include left and right operands.")
                }

                if currentMode == .booleanReceiverExpression {
                  box.value = try coerceBooleanComparisonReceiverBridge(map, fieldName: currentField)
                  break expressionLoop
                }

                let argBoxes = rawArgs.map { _ in ExprBridgeBox() }
                stack.append(.functionExit(box, normalizeExpressionFunctionName(name), argBoxes, currentField))
                let rightOperandMode: ExpressionCoercionMode =
                  orderingComparisonFunctions.contains(normalized) ? .numericOperand : .comparisonOperand
                stack.append(.enter(rawArgs[1], "\(currentField).args[1]", rightOperandMode, argBoxes[1]))
                stack.append(.enter(rawArgs[0], "\(currentField).args[0]", .expression, argBoxes[0]))
                break expressionLoop
              }

              if normalized == "switchon" {
                guard rawArgs.count >= 2 else {
                  throw PipelineValidationError(
                    "pipelineExecute() expected \(currentField).\(name) to include at least one condition/result pair.")
                }

                #if DEBUG
                pipelineCoercionLog("switchOn stack lowering at \(currentField) args=\(rawArgs.count)")
                #endif

                let argBoxes = rawArgs.map { _ in ExprBridgeBox() }
                stack.append(.functionExit(box, "switch_on", argBoxes, currentField))
                for index in rawArgs.indices.reversed() {
                  let isCondition = index % 2 == 0 && index + 1 < rawArgs.count
                  stack.append(.enter(
                    rawArgs[index],
                    "\(currentField).args[\(index)]",
                    isCondition ? .booleanReceiverExpression : .expression,
                    argBoxes[index]
                  ))
                }
                break expressionLoop
              }

              if isReceiverExpressionFunction(normalized) {
                box.value = try coerceReceiverExpressionBridge(map, fieldName: currentField)
                break expressionLoop
              }

              let argBoxes = rawArgs.map { _ in ExprBridgeBox() }
              stack.append(.functionExit(box, normalizeExpressionFunctionName(name), argBoxes, currentField))
              for index in rawArgs.indices.reversed() {
                let argMode: ExpressionCoercionMode =
                  arithmeticFunctions.contains(normalized) && index > 0
                    ? .numericOperand
                    : .expressionValue
                stack.append(.enter(
                  rawArgs[index],
                  "\(currentField).args[\(index)]",
                  argMode,
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
              box.value = try scalarConstantBridge(fromConstantMap: map, fieldName: currentField)
              break expressionLoop
            }

            if let kind = (map["exprType"] as? String)?.lowercased(), kind == "variable" {
              guard let name = map["name"] as? String, !name.isEmpty else {
                throw PipelineValidationError("pipelineExecute() expected \(currentField).name to be a non-empty string.")
              }
              box.value = VariableBridge(name: name)
              break expressionLoop
            }

            throw PipelineValidationError(
              "pipelineExecute() could not convert \(currentField) into a pipeline expression.")
          }
        }
      case let .functionExit(box, name, argBoxes, currentFieldName):
        let args = try argBoxes.enumerated().map { index, argBox in
          try requireExpressionValue(argBox, fieldName: "\(currentFieldName).args[\(index)]")
        }
        box.value = FunctionExprBridge(name: name, args: args)
        if RNFBFirestorePipelineDebug.enabled,
           name == "add" || name.contains("array") || name.contains("equal") || name.contains("greater") {
          RNFBFirestorePipelineDebug.log(
            "built \(name) at \(currentFieldName) -> \(RNFBFirestorePipelineDebug.describeExpr(box.value!))"
          )
        }
      case let .arrayCountExit(box, arrayBox, countBox, method, currentFieldName):
        let arrayBridge = try requireExpressionValue(arrayBox, fieldName: "\(currentFieldName).args[0]")
        if let literalCount = countBox.literalCount {
          box.value = buildArrayCountFunctionBridge(
            arrayBridge: arrayBridge,
            count: literalCount,
            method: method
          )
        } else if let countExprBox = countBox.expressionCountBox {
          let countBridge = try requireExpressionValue(
            countExprBox,
            fieldName: "\(currentFieldName).args[1]"
          )
          box.value = FunctionExprBridge(
            name: normalizedArrayCountFunctionName(method),
            args: [arrayBridge, countBridge],
            options: nil
          )
        } else {
          throw PipelineValidationError(
            "pipelineExecute() expected \(currentFieldName).args[1] to be provided.")
        }
      case let .arraySliceExit(box, arrayBox, sliceBox, currentFieldName):
        var args = [try requireExpressionValue(arrayBox, fieldName: "\(currentFieldName).args[0]")]
        if let literalOffset = sliceBox.literalOffset {
          args.append(scalarConstantBridge(from: literalOffset))
        } else if let offsetBox = sliceBox.expressionOffsetBox {
          args.append(try requireExpressionValue(offsetBox, fieldName: "\(currentFieldName).args[1]"))
        } else {
          throw PipelineValidationError(
            "pipelineExecute() expected \(currentFieldName).args[1] to be provided.")
        }

        if sliceBox.hasLengthArg {
          if let literalLength = sliceBox.literalLength {
            args.append(scalarConstantBridge(from: literalLength))
          } else if let lengthBox = sliceBox.expressionLengthBox {
            args.append(try requireExpressionValue(lengthBox, fieldName: "\(currentFieldName).args[2]"))
          } else {
            throw PipelineValidationError(
              "pipelineExecute() expected \(currentFieldName).args[2] to be provided.")
          }
        }

        box.value = FunctionExprBridge(name: "array_slice", args: args, options: nil)
      case let .conditionalExit(box, conditionBox, trueBox, falseBox, currentFieldName):
        box.value = FunctionExprBridge(name: "conditional", args: [
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


  private func numericOperandConstantBridge(from value: Any) throws -> ExprBridge {
    if let boolValue = value as? Bool {
      return ConstantBridge(boolValue ? 1.0 : 0.0)
    }
    if let number = value as? NSNumber, isBooleanNSNumber(number) {
      return ConstantBridge(number.boolValue ? 1.0 : 0.0)
    }
    if let stringValue = value as? String {
      let trimmed = stringValue.trimmingCharacters(in: .whitespacesAndNewlines)
      if !trimmed.isEmpty, let parsed = Double(trimmed), parsed.isFinite {
        if let intValue = wholeNumberInt(from: NSNumber(value: parsed)) {
          return ConstantBridge(intValue)
        }
        return ConstantBridge(parsed)
      }
      return ConstantBridge(stringValue)
    }
    return scalarConstantBridge(from: value)
  }

  private func tryIntegerLiteral(from value: Any) -> Int? {
    if let number = value as? NSNumber {
      return wholeNumberInt(from: number)
    }
    if let intValue = value as? Int {
      return intValue
    }
    guard let map = value as? [String: Any],
          (map["exprType"] as? String)?.lowercased() == "constant" else {
      return nil
    }
    if let number = map["value"] as? NSNumber {
      return wholeNumberInt(from: number)
    }
    if let intValue = map["value"] as? Int {
      return intValue
    }
    return nil
  }

  private func isBooleanNSNumber(_ number: NSNumber) -> Bool {
    CFGetTypeID(number) == CFBooleanGetTypeID()
  }

  private func wholeNumberInt(from number: NSNumber) -> Int? {
    if isBooleanNSNumber(number) {
      return nil
    }
    let doubleValue = number.doubleValue
    guard doubleValue.isFinite,
          doubleValue.rounded() == doubleValue,
          doubleValue >= Double(Int.min),
          doubleValue <= Double(Int.max) else {
      return nil
    }
    return number.intValue
  }

  private func scalarConstantBridge(from value: Any) -> ExprBridge {
    if let boolValue = value as? Bool {
      return ConstantBridge(boolValue)
    }
    if let number = value as? NSNumber, isBooleanNSNumber(number) {
      return ConstantBridge(number.boolValue)
    }
    if let number = value as? NSNumber, let intValue = wholeNumberInt(from: number) {
      return ConstantBridge(intValue)
    }
    if let intValue = value as? Int {
      return ConstantBridge(intValue)
    }
    return ConstantBridge(value)
  }

  private func pushArrayCountExpressionFrame(
    stack: inout [ExpressionCoercionFrame],
    box: ExprBridgeBox,
    rawArgs: [Any],
    currentField: String,
    method: ArrayCountExpressionMethod
  ) throws {
    guard rawArgs.count == 2 else {
      throw PipelineValidationError(
        "pipelineExecute() expected \(currentField) to include exactly 2 arguments.")
    }

    let arrayBox = ExprBridgeBox()
    let countBox = ArrayCountLiteralBox()
    if let literalCount = tryIntegerLiteral(from: rawArgs[1]) {
      countBox.literalCount = literalCount
      stack.append(.arrayCountExit(box, arrayBox, countBox, method, currentField))
      stack.append(.enter(rawArgs[0], "\(currentField).args[0]", .expressionValue, arrayBox))
      return
    }

    let countExprBox = ExprBridgeBox()
    countBox.expressionCountBox = countExprBox
    stack.append(.arrayCountExit(box, arrayBox, countBox, method, currentField))
    stack.append(.enter(rawArgs[1], "\(currentField).args[1]", .expressionValue, countExprBox))
    stack.append(.enter(rawArgs[0], "\(currentField).args[0]", .expressionValue, arrayBox))
  }

  private func pushArraySliceExpressionFrame(
    stack: inout [ExpressionCoercionFrame],
    box: ExprBridgeBox,
    rawArgs: [Any],
    currentField: String
  ) throws {
    guard rawArgs.count == 2 || rawArgs.count == 3 else {
      throw PipelineValidationError(
        "pipelineExecute() expected \(currentField) to include 2 or 3 arguments.")
    }

    let arrayBox = ExprBridgeBox()
    let sliceBox = ArraySliceLiteralBox()

    if let literalOffset = tryIntegerLiteral(from: rawArgs[1]) {
      sliceBox.literalOffset = literalOffset
    } else {
      sliceBox.expressionOffsetBox = ExprBridgeBox()
    }

    if rawArgs.count == 3 {
      sliceBox.hasLengthArg = true
      if let literalLength = tryIntegerLiteral(from: rawArgs[2]) {
        sliceBox.literalLength = literalLength
      } else {
        sliceBox.expressionLengthBox = ExprBridgeBox()
      }
    }

    stack.append(.arraySliceExit(box, arrayBox, sliceBox, currentField))
    if rawArgs.count == 3, sliceBox.expressionLengthBox != nil {
      stack.append(.enter(rawArgs[2], "\(currentField).args[2]", .expressionValue, sliceBox.expressionLengthBox!))
    }
    if sliceBox.expressionOffsetBox != nil {
      stack.append(.enter(rawArgs[1], "\(currentField).args[1]", .expressionValue, sliceBox.expressionOffsetBox!))
    }
    stack.append(.enter(rawArgs[0], "\(currentField).args[0]", .expressionValue, arrayBox))
  }

  private func buildArrayCountFunctionBridge(
    arrayBridge: ExprBridge,
    count: Int,
    method: ArrayCountExpressionMethod
  ) -> ExprBridge {
    FunctionExprBridge(
      name: normalizedArrayCountFunctionName(method),
      args: [arrayBridge, scalarConstantBridge(from: count)],
      options: nil
    )
  }

  private func normalizedArrayCountFunctionName(_ method: ArrayCountExpressionMethod) -> String {
    switch method {
    case .arrayFirstN:
      return "array_first_n"
    case .arrayLastN:
      return "array_last_n"
    case .arrayMaximumN:
      return "maximum_n"
    case .arrayMinimumN:
      return "minimum_n"
    }
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
        case let .variable(name):
          box.value = [
            "__kind": "expression",
            "exprType": "Variable",
            "name": name,
          ]
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
        case let .variable(name):
          box.value = [
            "__kind": "expression",
            "exprType": "Variable",
            "name": name,
          ]
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

  private func extractNestedPipelineMap(_ value: Any) -> [String: Any]? {
    guard let map = value as? [String: Any] else {
      return nil
    }

    if let pipeline = map["pipeline"] as? [String: Any] {
      return pipeline
    }

    if map["source"] != nil, map["stages"] != nil {
      return map
    }

    return nil
  }

  private func coerceNumber(_ value: Any, fieldName: String) throws -> Double {
    if let number = value as? NSNumber {
      return number.doubleValue
    }
    throw PipelineValidationError("pipelineExecute() expected \(fieldName) to be a number.")
  }
}
