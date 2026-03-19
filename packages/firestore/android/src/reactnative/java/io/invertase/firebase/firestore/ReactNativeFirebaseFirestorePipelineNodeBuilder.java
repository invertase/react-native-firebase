package io.invertase.firebase.firestore;

import com.google.firebase.Timestamp;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.pipeline.AggregateFunction;
import com.google.firebase.firestore.pipeline.AliasedAggregate;
import com.google.firebase.firestore.pipeline.BooleanExpression;
import com.google.firebase.firestore.pipeline.Expression;
import com.google.firebase.firestore.pipeline.Ordering;
import com.google.firebase.firestore.pipeline.Selectable;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;

final class ReactNativeFirebaseFirestorePipelineNodeBuilder {
  Expression coerceExpression(
      ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedFieldExpressionNode) {
      return Expression.field(
          ((ReactNativeFirebaseFirestorePipelineParser.ParsedFieldExpressionNode) value).path);
    }

    if (value instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode) {
      ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode constant =
          (ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode) value;
      return constantExpression(toRawValueNode(constant.value));
    }

    if (value instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode) {
      ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode function =
          (ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode) value;
      Map<String, Object> functionMap = new java.util.LinkedHashMap<>();
      functionMap.put("exprType", "Function");
      functionMap.put("name", function.name);
      List<Object> args = new java.util.ArrayList<>(function.args.size());
      for (ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode arg : function.args) {
        args.add(toSerializedValueNode(arg));
      }
      functionMap.put("args", args);
      return rawFunctionFromMap(functionMap, fieldName);
    }

    throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
        "pipelineExecute() could not convert " + fieldName + " into a pipeline expression.");
  }

  Expression coerceExpression(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof Expression) {
      return (Expression) value;
    }

    if (value instanceof String) {
      return Expression.field((String) value);
    }

    if (value instanceof Map) {
      Map<?, ?> map = (Map<?, ?>) value;
      if (map.containsKey("expr")) {
        return coerceExpression(map.get("expr"), fieldName + ".expr");
      }
      if (map.containsKey("expression")) {
        return coerceExpression(map.get("expression"), fieldName + ".expression");
      }

      Object exprType = map.get("exprType");
      if (exprType instanceof String) {
        String normalizedType = ((String) exprType).toLowerCase(Locale.ROOT);
        if ("field".equals(normalizedType)) {
          return Expression.field(coerceFieldPath(value, fieldName));
        }
        if ("constant".equals(normalizedType)) {
          return constantExpression(map.get("value"));
        }
        if ("function".equals(normalizedType)) {
          return rawFunctionFromMap(map, fieldName);
        }
      }

      if (map.containsKey("name")) {
        return rawFunctionFromMap(map, fieldName);
      }

      return Expression.Companion.toExprOrConstant$com_google_firebase_firebase_firestore(value);
    }

    if (value instanceof List) {
      return Expression.Companion.toExprOrConstant$com_google_firebase_firebase_firestore(value);
    }

    if (value == null
        || value instanceof Boolean
        || value instanceof Number
        || value instanceof java.util.Date
        || value instanceof Timestamp
        || value instanceof com.google.firebase.firestore.GeoPoint
        || value instanceof com.google.firebase.firestore.Blob
        || value instanceof DocumentReference
        || value instanceof com.google.firebase.firestore.VectorValue
        || value instanceof byte[]) {
      return constantExpression(value);
    }

    throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
        "pipelineExecute() could not convert " + fieldName + " into a pipeline expression.");
  }

  Selectable coerceSelectable(
      ReactNativeFirebaseFirestorePipelineParser.ParsedSelectableNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression expr = coerceExpression(value.expression, fieldName + ".expr");
    if (value.alias != null && !value.alias.isEmpty()) {
      return expr.alias(value.alias);
    }
    if (expr instanceof Selectable) {
      return (Selectable) expr;
    }
    throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
        "pipelineExecute() expected "
            + fieldName
            + " to include an alias for computed expressions.");
  }

  Ordering coerceOrdering(
      ReactNativeFirebaseFirestorePipelineParser.ParsedOrderingNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression expression = coerceExpression(value.expression, fieldName + ".expr");
    if (value.fieldShortcut
        && value.expression instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedFieldExpressionNode) {
      String fieldPath =
          ((ReactNativeFirebaseFirestorePipelineParser.ParsedFieldExpressionNode) value.expression)
              .path;
      return value.descending ? Ordering.descending(fieldPath) : Ordering.ascending(fieldPath);
    }
    return value.descending ? expression.descending() : expression.ascending();
  }

  BooleanExpression coerceBooleanExpression(
      ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode) {
      ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode function =
          (ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode) value;
      return booleanExpressionFromParsedFunction(function.name, function.args, fieldName);
    }

    Expression expression = coerceExpression(value, fieldName);
    if (expression instanceof BooleanExpression) {
      return (BooleanExpression) expression;
    }
    throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
        "pipelineExecute() expected " + fieldName + " to resolve to a boolean expression.");
  }

  AliasedAggregate coerceAliasedAggregate(
      ReactNativeFirebaseFirestorePipelineParser.ParsedAggregateNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    AggregateFunction function = buildAggregateFunction(value, fieldName);
    return function.alias(value.alias);
  }

  String coerceFieldPath(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof String) {
      String fieldPath = (String) value;
      if (!fieldPath.isEmpty()) {
        return fieldPath;
      }
    }

    if (value instanceof Map) {
      Map<?, ?> map = (Map<?, ?>) value;
      Object directPath = map.get("path");
      if (directPath instanceof String && !((String) directPath).isEmpty()) {
        return (String) directPath;
      }

      Object fieldPath = map.get("fieldPath");
      if (fieldPath != null && fieldPath != map) {
        return coerceFieldPath(fieldPath, fieldName);
      }

      Object segments = map.get("segments");
      if (!(segments instanceof List)) {
        segments = map.get("_segments");
      }
      if (segments instanceof List) {
        List<?> list = (List<?>) segments;
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
          Object segment = list.get(i);
          if (!(segment instanceof String)) {
            throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                "pipelineExecute() expected " + fieldName + " segment values to be strings.");
          }
          if (i > 0) {
            builder.append('.');
          }
          builder.append((String) segment);
        }
        String path = builder.toString();
        if (!path.isEmpty()) {
          return path;
        }
      }
    }

    throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
        "pipelineExecute() expected " + fieldName + " to resolve to a field path string.");
  }

  double[] coerceVectorValue(Object value)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof Map) {
      Object nestedValues = ((Map<?, ?>) value).get("values");
      return coerceVectorValue(nestedValues);
    }

    if (!(value instanceof List)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected findNearest.vectorValue to be an array.");
    }

    List<?> values = (List<?>) value;
    double[] vector = new double[values.size()];
    for (int i = 0; i < values.size(); i++) {
      Object item = values.get(i);
      if (!(item instanceof Number)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected findNearest.vectorValue to contain only numbers.");
      }
      vector[i] = ((Number) item).doubleValue();
    }

    return vector;
  }

  private Expression rawFunctionFromMap(Map<?, ?> map, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object nameValue = map.get("name");
    if (!(nameValue instanceof String) || ((String) nameValue).isEmpty()) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + ".name to be a non-empty string.");
    }

    Object argsValue = map.get("args");
    List<Object> args;
    if (argsValue == null) {
      args = new java.util.ArrayList<>();
    } else if (argsValue instanceof List) {
      args = (List<Object>) argsValue;
    } else {
      args = new java.util.ArrayList<>();
      args.add(argsValue);
    }

    Expression specialized = buildSpecialExpressionFunction((String) nameValue, args, fieldName);
    if (specialized != null) {
      return specialized;
    }

    Expression[] expressions = new Expression[args.size()];
    for (int i = 0; i < args.size(); i++) {
      expressions[i] = coerceExpression(args.get(i), fieldName + ".args[" + i + "]");
    }

    String functionName = normalizeExpressionFunctionName((String) nameValue);
    return Expression.rawFunction(functionName, expressions);
  }

  private Expression buildSpecialExpressionFunction(
      String functionName, List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String normalizedName = canonicalizeExpressionFunctionName(functionName);

    switch (normalizedName) {
      case "array":
        return buildArrayExpression(args, fieldName);
      case "map":
        return buildMapExpression(args, fieldName);
      case "conditional":
        requireArgumentCount(args, 3, functionName, fieldName);
        return Expression.conditional(
            coerceBooleanExpression(args.get(0), fieldName + ".args[0]"),
            coerceExpression(args.get(1), fieldName + ".args[1]"),
            coerceExpression(args.get(2), fieldName + ".args[2]"));
      case "currenttimestamp":
        requireArgumentCount(args, 0, functionName, fieldName);
        return Expression.currentTimestamp();
      case "type":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").type();
      case "collectionid":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").collectionId();
      case "documentid":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").documentId();
      case "istype":
        requireArgumentCount(args, 2, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]")
            .type()
            .equal(coerceStringLiteral(args.get(1), fieldName + ".args[1]"));
      case "logicalmaximum":
        return buildLogicalExtremaExpression(true, args, functionName, fieldName);
      case "logicalminimum":
        return buildLogicalExtremaExpression(false, args, functionName, fieldName);
      case "mapget":
        requireArgumentCount(args, 2, functionName, fieldName);
        return buildMapGetExpression(args, fieldName);
      case "mapmerge":
        return buildMapMergeExpression(args, functionName, fieldName);
      case "arraylength":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").arrayLength();
      case "arrayget":
        requireArgumentCount(args, 2, functionName, fieldName);
        return buildArrayGetExpression(args, fieldName);
      case "arrayconcat":
        return buildArrayConcatExpression(args, functionName, fieldName);
      case "arraysum":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").arraySum();
      case "vectorlength":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").vectorLength();
      case "cosinedistance":
        requireArgumentCount(args, 2, functionName, fieldName);
        return buildVectorDistanceExpression("cosineDistance", args, fieldName);
      case "dotproduct":
        requireArgumentCount(args, 2, functionName, fieldName);
        return buildVectorDistanceExpression("dotProduct", args, fieldName);
      case "euclideandistance":
        requireArgumentCount(args, 2, functionName, fieldName);
        return buildVectorDistanceExpression("euclideanDistance", args, fieldName);
      case "timestamptounixmicros":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").timestampToUnixMicros();
      case "timestamptounixmillis":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").timestampToUnixMillis();
      case "timestamptounixseconds":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").timestampToUnixSeconds();
      case "unixmicrostotimestamp":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").unixMicrosToTimestamp();
      case "unixmillistotimestamp":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").unixMillisToTimestamp();
      case "unixsecondstotimestamp":
        requireArgumentCount(args, 1, functionName, fieldName);
        return coerceExpression(args.get(0), fieldName + ".args[0]").unixSecondsToTimestamp();
      case "timestampadd":
        requireArgumentCount(args, 3, functionName, fieldName);
        return buildTimestampMathExpression(true, args, fieldName);
      case "timestampsubtract":
        requireArgumentCount(args, 3, functionName, fieldName);
        return buildTimestampMathExpression(false, args, fieldName);
      case "timestamptruncate":
        if (args.size() == 2) {
          return buildTimestampTruncateExpression(args, fieldName);
        }
        return null;
      default:
        return null;
    }
  }

  private Expression buildArrayExpression(List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    List<?> elements;
    if (args.size() == 1 && args.get(0) instanceof List) {
      elements = (List<?>) args.get(0);
    } else {
      elements = args;
    }

    List<Object> resolvedConstants = new java.util.ArrayList<>(elements.size());
    boolean allConstant = true;
    for (Object element : elements) {
      Object resolved = unwrapSerializedConstantDeep(element);
      resolvedConstants.add(resolved);
      if (containsSerializedExpression(resolved)) {
        allConstant = false;
      }
    }

    if (allConstant) {
      return constantExpression(resolvedConstants);
    }

    Expression[] expressions = new Expression[elements.size()];
    for (int i = 0; i < elements.size(); i++) {
      expressions[i] = coerceExpression(elements.get(i), fieldName + ".args[" + i + "]");
    }
    return Expression.rawFunction("array", expressions);
  }

  private Expression buildMapExpression(List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    requireArgumentCount(args, 1, "map", fieldName);
    Object entriesValue = args.get(0);
    if (!(entriesValue instanceof Map)) {
      return null;
    }

    Map<?, ?> entries = (Map<?, ?>) entriesValue;
    Map<String, Object> resolvedConstants = new java.util.LinkedHashMap<>();
    boolean allConstant = true;

    for (Map.Entry<?, ?> entry : entries.entrySet()) {
      if (!(entry.getKey() instanceof String)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected " + fieldName + ".args[0] map keys to be strings.");
      }

      String key = (String) entry.getKey();
      Object resolved = unwrapSerializedConstantDeep(entry.getValue());
      resolvedConstants.put(key, resolved);
      if (containsSerializedExpression(resolved)) {
        allConstant = false;
      }
    }

    if (allConstant) {
      return constantExpression(resolvedConstants);
    }

    Expression[] expressions = new Expression[entries.size() * 2];
    int index = 0;

    for (Map.Entry<?, ?> entry : entries.entrySet()) {
      if (!(entry.getKey() instanceof String)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected " + fieldName + ".args[0] map keys to be strings.");
      }

      String key = (String) entry.getKey();
      expressions[index++] = constantExpression(key);
      expressions[index++] = coerceExpression(entry.getValue(), fieldName + ".args[0]." + key);
    }

    return Expression.rawFunction("map", expressions);
  }

  private Expression buildLogicalExtremaExpression(
      boolean maximum, List<Object> args, String functionName, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (args.size() < 2) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected "
              + fieldName
              + "."
              + functionName
              + " to include at least 2 arguments.");
    }

    Expression left = coerceExpression(args.get(0), fieldName + ".args[0]");
    Expression[] others = new Expression[args.size() - 1];
    for (int i = 1; i < args.size(); i++) {
      others[i - 1] = coerceExpression(args.get(i), fieldName + ".args[" + i + "]");
    }

    return maximum ? left.logicalMaximum(others) : left.logicalMinimum(others);
  }

  private Expression buildMapGetExpression(List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression mapExpr = coerceExpression(args.get(0), fieldName + ".args[0]");
    Object keyValue = unwrapSerializedConstant(args.get(1));
    if (keyValue instanceof String) {
      return mapExpr.mapGet((String) keyValue);
    }
    return mapExpr.mapGet(coerceExpression(args.get(1), fieldName + ".args[1]"));
  }

  private Expression buildMapMergeExpression(List<Object> args, String functionName, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (args.size() < 2) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected "
              + fieldName
              + "."
              + functionName
              + " to include at least 2 arguments.");
    }

    Expression left = coerceExpression(args.get(0), fieldName + ".args[0]");
    Expression right = coerceExpression(args.get(1), fieldName + ".args[1]");
    Expression[] others = new Expression[Math.max(0, args.size() - 2)];
    for (int i = 2; i < args.size(); i++) {
      others[i - 2] = coerceExpression(args.get(i), fieldName + ".args[" + i + "]");
    }

    return left.mapMerge(right, others);
  }

  private Expression buildArrayGetExpression(List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression arrayExpr = coerceExpression(args.get(0), fieldName + ".args[0]");
    Object indexValue = unwrapSerializedConstant(args.get(1));
    if (indexValue instanceof Number) {
      return arrayExpr.arrayGet(((Number) indexValue).intValue());
    }
    return arrayExpr.arrayGet(coerceExpression(args.get(1), fieldName + ".args[1]"));
  }

  private Expression buildArrayConcatExpression(List<Object> args, String functionName, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (args.size() < 2) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected "
              + fieldName
              + "."
              + functionName
              + " to include at least 2 arguments.");
    }

    Expression arrayExpr = coerceExpression(args.get(0), fieldName + ".args[0]");
    Object secondValue = toRawValueOrExpression(args.get(1), fieldName + ".args[1]");
    Object[] rest = new Object[Math.max(0, args.size() - 2)];
    for (int i = 2; i < args.size(); i++) {
      rest[i - 2] = toRawValueOrExpression(args.get(i), fieldName + ".args[" + i + "]");
    }
    return arrayExpr.arrayConcat(secondValue, rest);
  }

  private Expression buildVectorDistanceExpression(String functionName, List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression left = coerceExpression(args.get(0), fieldName + ".args[0]");
    Object rightValue = args.get(1);
    Object normalizedRightValue = unwrapSerializedConstantDeep(rightValue);

    if (normalizedRightValue instanceof List
        || (normalizedRightValue instanceof Map
            && ((Map<?, ?>) normalizedRightValue).get("values") != null)) {
      double[] vector = coerceVectorValue(normalizedRightValue);
      switch (functionName) {
        case "cosineDistance":
          return left.cosineDistance(vector);
        case "dotProduct":
          return left.dotProduct(vector);
        default:
          return left.euclideanDistance(vector);
      }
    }

    Expression right = coerceExpression(rightValue, fieldName + ".args[1]");
    switch (functionName) {
      case "cosineDistance":
        return left.cosineDistance(right);
      case "dotProduct":
        return left.dotProduct(right);
      default:
        return left.euclideanDistance(right);
    }
  }

  private Expression buildTimestampMathExpression(boolean addition, List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression base = coerceExpression(args.get(0), fieldName + ".args[0]");
    Object unitValue = unwrapSerializedConstant(args.get(1));
    Object amountValue = unwrapSerializedConstant(args.get(2));

    if (unitValue instanceof String && amountValue instanceof Number) {
      long amount = ((Number) amountValue).longValue();
      return addition
          ? base.timestampAdd((String) unitValue, amount)
          : base.timestampSubtract((String) unitValue, amount);
    }

    Expression unitExpression = coerceExpression(args.get(1), fieldName + ".args[1]");
    Expression amountExpression = coerceExpression(args.get(2), fieldName + ".args[2]");
    return addition
        ? base.timestampAdd(unitExpression, amountExpression)
        : base.timestampSubtract(unitExpression, amountExpression);
  }

  private Expression buildTimestampTruncateExpression(List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression base = coerceExpression(args.get(0), fieldName + ".args[0]");
    Object granularityValue = unwrapSerializedConstant(args.get(1));
    if (granularityValue instanceof String) {
      return base.timestampTruncate((String) granularityValue);
    }
    return base.timestampTruncate(coerceExpression(args.get(1), fieldName + ".args[1]"));
  }

  private void requireArgumentCount(List<Object> args, int expectedCount, String functionName, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (args.size() != expectedCount) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected "
              + fieldName
              + "."
              + functionName
              + " to include exactly "
              + expectedCount
              + " arguments.");
    }
  }

  private String coerceStringLiteral(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object rawValue = unwrapSerializedConstant(value);
    if (rawValue instanceof String) {
      return (String) rawValue;
    }
    throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
        "pipelineExecute() expected " + fieldName + " to resolve to a string.");
  }

  private Object toRawValueOrExpression(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object rawValue = unwrapSerializedConstantDeep(value);
    if (containsSerializedExpression(rawValue)) {
      return coerceExpression(value, fieldName);
    }
    return rawValue;
  }

  private String canonicalizeExpressionFunctionName(String name) {
    if (name == null) {
      return "";
    }
    return name.toLowerCase(Locale.ROOT).replace("_", "").replace("-", "");
  }

  private String normalizeExpressionFunctionName(String name) {
    if (name == null) {
      return name;
    }

    switch (canonicalizeExpressionFunctionName(name)) {
      case "conditional":
        return "cond";
      case "logicalmaximum":
        return "logical_max";
      case "logicalminimum":
        return "logical_min";
      case "lower":
      case "tolower":
        return "to_lower";
      case "upper":
      case "toupper":
        return "to_upper";
      case "stringconcat":
        return "string_concat";
      case "timestamptruncate":
        return "timestamp_trunc";
      case "timestampsubtract":
        return "timestamp_sub";
      default:
        break;
    }

    StringBuilder result = new StringBuilder(name.length() + 8);
    for (int i = 0; i < name.length(); i++) {
      char c = name.charAt(i);
      if (Character.isUpperCase(c)) {
        if (i > 0) {
          result.append('_');
        }
        result.append(Character.toLowerCase(c));
      } else {
        result.append(c);
      }
    }
    return result.toString();
  }

  private Expression constantExpression(Object value)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value == null) {
      return Expression.nullValue();
    }
    if (value instanceof String) {
      return Expression.constant((String) value);
    }
    if (value instanceof Number) {
      return Expression.constant((Number) value);
    }
    if (value instanceof Boolean) {
      return Expression.constant((Boolean) value);
    }
    if (value instanceof java.util.Date) {
      return Expression.constant((java.util.Date) value);
    }
    if (value instanceof Timestamp) {
      return Expression.constant((Timestamp) value);
    }
    if (value instanceof com.google.firebase.firestore.GeoPoint) {
      return Expression.constant((com.google.firebase.firestore.GeoPoint) value);
    }
    if (value instanceof com.google.firebase.firestore.Blob) {
      return Expression.constant((com.google.firebase.firestore.Blob) value);
    }
    if (value instanceof DocumentReference) {
      return Expression.constant((DocumentReference) value);
    }
    if (value instanceof com.google.firebase.firestore.VectorValue) {
      return Expression.constant((com.google.firebase.firestore.VectorValue) value);
    }
    if (value instanceof byte[]) {
      return Expression.constant((byte[]) value);
    }

    if (value instanceof Map) {
      Map<?, ?> mapValue = (Map<?, ?>) value;
      Map<String, Object> resolved = new java.util.LinkedHashMap<>();
      boolean unwrapped = false;
      for (Map.Entry<?, ?> entry : mapValue.entrySet()) {
        if (!(entry.getKey() instanceof String)) {
          continue;
        }
        Object raw = unwrapSerializedConstant(entry.getValue());
        resolved.put((String) entry.getKey(), raw);
        if (raw != entry.getValue()) {
          unwrapped = true;
        }
      }
      return Expression.Companion.toExprOrConstant$com_google_firebase_firebase_firestore(
          unwrapped ? resolved : value);
    }

    return Expression.Companion.toExprOrConstant$com_google_firebase_firebase_firestore(value);
  }

  private Object unwrapSerializedConstant(Object value) {
    if (!(value instanceof Map)) {
      return value;
    }
    Map<?, ?> map = (Map<?, ?>) value;
    Object exprType = map.get("exprType");
    if (exprType instanceof String && ((String) exprType).equalsIgnoreCase("constant")) {
      return unwrapSerializedConstant(map.get("value"));
    }
    return value;
  }

  private Object unwrapSerializedConstantDeep(Object value) {
    Object unwrapped = unwrapSerializedConstant(value);
    if (unwrapped != value) {
      return unwrapSerializedConstantDeep(unwrapped);
    }

    if (value instanceof List) {
      List<?> listValue = (List<?>) value;
      List<Object> resolved = new java.util.ArrayList<>(listValue.size());
      for (Object item : listValue) {
        resolved.add(unwrapSerializedConstantDeep(item));
      }
      return resolved;
    }

    if (value instanceof Map) {
      Map<?, ?> mapValue = (Map<?, ?>) value;
      Map<String, Object> resolved = new java.util.LinkedHashMap<>();
      for (Map.Entry<?, ?> entry : mapValue.entrySet()) {
        if (entry.getKey() instanceof String) {
          resolved.put((String) entry.getKey(), unwrapSerializedConstantDeep(entry.getValue()));
        }
      }
      return resolved;
    }

    return value;
  }

  private boolean containsSerializedExpression(Object value) {
    if (value instanceof List) {
      for (Object item : (List<?>) value) {
        if (containsSerializedExpression(item)) {
          return true;
        }
      }
      return false;
    }

    if (!(value instanceof Map)) {
      return false;
    }

    Map<?, ?> mapValue = (Map<?, ?>) value;
    Object exprType = mapValue.get("exprType");
    if (exprType instanceof String) {
      return true;
    }
    if (mapValue.containsKey("name")
        || mapValue.containsKey("path")
        || mapValue.containsKey("fieldPath")
        || mapValue.containsKey("expr")
        || mapValue.containsKey("expression")) {
      return true;
    }
    for (Object item : mapValue.values()) {
      if (containsSerializedExpression(item)) {
        return true;
      }
    }
    return false;
  }

  private BooleanExpression coerceBooleanExpression(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof BooleanExpression) {
      return (BooleanExpression) value;
    }

    if (value instanceof Map) {
      Map<?, ?> map = (Map<?, ?>) value;
      if (map.containsKey("condition")) {
        return coerceBooleanExpression(map.get("condition"), fieldName + ".condition");
      }

      Object operatorValue = map.get("operator");
      if (operatorValue instanceof String) {
        return booleanExpressionFromOperatorMap(map, (String) operatorValue, fieldName);
      }

      Object functionNameValue = map.get("name");
      if (functionNameValue instanceof String) {
        Object argsValue = map.get("args");
        List<Object> args;
        if (argsValue == null) {
          args = new java.util.ArrayList<>();
        } else if (argsValue instanceof List) {
          args = (List<Object>) argsValue;
        } else {
          args = new java.util.ArrayList<>();
          args.add(argsValue);
        }
        return booleanExpressionFromFunction((String) functionNameValue, args, fieldName);
      }
    }

    Expression expression = coerceExpression(value, fieldName);
    if (expression instanceof BooleanExpression) {
      return (BooleanExpression) expression;
    }

    throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
        "pipelineExecute() expected " + fieldName + " to resolve to a boolean expression.");
  }

  private BooleanExpression booleanExpressionFromParsedFunction(
      String functionName,
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    return booleanExpressionFromFunction(functionName, toSerializedValueNodes(args), fieldName);
  }

  private BooleanExpression booleanExpressionFromFunction(
      String functionName, List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String normalizedName = functionName.toLowerCase(Locale.ROOT);

    if ("and".equals(normalizedName) || "or".equals(normalizedName)) {
      if (args == null || args.isEmpty()) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected " + fieldName + ".args to contain boolean expressions.");
      }

      BooleanExpression[] expressions = new BooleanExpression[args.size()];
      for (int i = 0; i < args.size(); i++) {
        expressions[i] = coerceBooleanExpression(args.get(i), fieldName + ".args[" + i + "]");
      }

      BooleanExpression first = expressions[0];
      BooleanExpression[] rest = Arrays.copyOfRange(expressions, 1, expressions.length);
      return "and".equals(normalizedName)
          ? Expression.and(first, rest)
          : Expression.or(first, rest);
    }

    if ("equal".equals(normalizedName)
        || "notequal".equals(normalizedName)
        || "greaterthan".equals(normalizedName)
        || "greaterthanorequal".equals(normalizedName)
        || "lessthan".equals(normalizedName)
        || "lessthanorequal".equals(normalizedName)
        || "arraycontains".equals(normalizedName)
        || "arraycontainsany".equals(normalizedName)
        || "arraycontainsall".equals(normalizedName)
        || "equalany".equals(normalizedName)
        || "notequalany".equals(normalizedName)) {
      if (args == null || args.size() < 2) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected "
                + fieldName
                + ".args to include left and right operands.");
      }

      Expression left = coerceExpression(args.get(0), fieldName + ".args[0]");
      Object right = args.get(1);

      if ("equal".equals(normalizedName)) {
        return applyComparison(left::equal, right);
      }
      if ("notequal".equals(normalizedName)) {
        return applyComparison(left::notEqual, right);
      }
      if ("greaterthan".equals(normalizedName)) {
        return applyComparison(left::greaterThan, right);
      }
      if ("greaterthanorequal".equals(normalizedName)) {
        return applyComparison(left::greaterThanOrEqual, right);
      }
      if ("lessthan".equals(normalizedName)) {
        return applyComparison(left::lessThan, right);
      }
      if ("lessthanorequal".equals(normalizedName)) {
        return applyComparison(left::lessThanOrEqual, right);
      }
      if ("arraycontains".equals(normalizedName)) {
        return applyArrayContains(left, right, fieldName + ".args[1]");
      }
      if ("arraycontainsany".equals(normalizedName)) {
        return applyArrayContainsAny(left, right, fieldName + ".args[1]");
      }
      if ("arraycontainsall".equals(normalizedName)) {
        return applyArrayContainsAll(left, right, fieldName + ".args[1]");
      }
      if ("equalany".equals(normalizedName)) {
        if (right instanceof List) {
          return left.equalAny((List<?>) right);
        }
        return left.equalAny(coerceExpression(right, fieldName + ".args[1]"));
      }
      if ("notequalany".equals(normalizedName)) {
        if (right instanceof List) {
          return left.notEqualAny((List<?>) right);
        }
        return left.notEqualAny(coerceExpression(right, fieldName + ".args[1]"));
      }
    }

    Expression[] expressions = new Expression[args.size()];
    for (int i = 0; i < args.size(); i++) {
      expressions[i] = coerceExpression(args.get(i), fieldName + ".args[" + i + "]");
    }
    return BooleanExpression.rawFunction(normalizeExpressionFunctionName(functionName), expressions);
  }

  private BooleanExpression booleanExpressionFromOperatorMap(
      Map<?, ?> map, String operator, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String normalizedOperator = operator.toUpperCase(Locale.ROOT);
    if ("AND".equals(normalizedOperator) || "OR".equals(normalizedOperator)) {
      Object queriesValue = map.get("queries");
      if (!(queriesValue instanceof List) || ((List<?>) queriesValue).isEmpty()) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected " + fieldName + ".queries to contain boolean expressions.");
      }

      List<?> queries = (List<?>) queriesValue;
      BooleanExpression[] conditions = new BooleanExpression[queries.size()];
      for (int i = 0; i < queries.size(); i++) {
        conditions[i] = coerceBooleanExpression(queries.get(i), fieldName + ".queries[" + i + "]");
      }

      BooleanExpression first = conditions[0];
      BooleanExpression[] rest = Arrays.copyOfRange(conditions, 1, conditions.length);
      return "AND".equals(normalizedOperator)
          ? Expression.and(first, rest)
          : Expression.or(first, rest);
    }

    String fieldPath =
        coerceFieldPath(
            map.get("fieldPath") != null ? map.get("fieldPath") : map.get("field"),
            fieldName + ".fieldPath");
    Expression fieldExpression = Expression.field(fieldPath);
    Object rightValue =
        map.containsKey("value")
            ? map.get("value")
            : map.containsKey("right") ? map.get("right") : map.get("operand");

    if ("==".equals(normalizedOperator)
        || "=".equals(normalizedOperator)
        || "EQUAL".equals(normalizedOperator)) {
      return applyComparison(fieldExpression::equal, rightValue);
    }
    if ("!=".equals(normalizedOperator)
        || "<>".equals(normalizedOperator)
        || "NOT_EQUAL".equals(normalizedOperator)) {
      return applyComparison(fieldExpression::notEqual, rightValue);
    }
    if (">".equals(normalizedOperator) || "GREATER_THAN".equals(normalizedOperator)) {
      return applyComparison(fieldExpression::greaterThan, rightValue);
    }
    if (">=".equals(normalizedOperator) || "GREATER_THAN_OR_EQUAL".equals(normalizedOperator)) {
      return applyComparison(fieldExpression::greaterThanOrEqual, rightValue);
    }
    if ("<".equals(normalizedOperator) || "LESS_THAN".equals(normalizedOperator)) {
      return applyComparison(fieldExpression::lessThan, rightValue);
    }
    if ("<=".equals(normalizedOperator) || "LESS_THAN_OR_EQUAL".equals(normalizedOperator)) {
      return applyComparison(fieldExpression::lessThanOrEqual, rightValue);
    }
    if ("ARRAY_CONTAINS".equals(normalizedOperator)
        || "ARRAY-CONTAINS".equals(normalizedOperator)) {
      return applyArrayContains(fieldExpression, rightValue, fieldName);
    }
    if ("ARRAY_CONTAINS_ANY".equals(normalizedOperator)
        || "ARRAY-CONTAINS-ANY".equals(normalizedOperator)) {
      return applyArrayContainsAny(fieldExpression, rightValue, fieldName);
    }
    if ("ARRAY_CONTAINS_ALL".equals(normalizedOperator)
        || "ARRAY-CONTAINS-ALL".equals(normalizedOperator)) {
      return applyArrayContainsAll(fieldExpression, rightValue, fieldName);
    }
    if ("IN".equals(normalizedOperator)) {
      if (!(rightValue instanceof List)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "Client specified an invalid argument. pipelineExecute() expected "
                + fieldName
                + ".value to be an array for operator IN.");
      }
      return fieldExpression.equalAny((List<?>) rightValue);
    }
    if ("NOT_IN".equals(normalizedOperator)) {
      if (!(rightValue instanceof List)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "Client specified an invalid argument. pipelineExecute() expected "
                + fieldName
                + ".value to be an array for operator NOT_IN.");
      }
      return fieldExpression.notEqualAny((List<?>) rightValue);
    }

    throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
        "pipelineExecute() received unsupported where operator: " + operator + ".");
  }

  private BooleanExpression applyComparison(ComparisonFn fn, Object rawValue)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (rawValue instanceof Map) {
      return fn.apply(coerceExpression(rawValue, "stage.options.condition.value"));
    }
    return fn.apply(rawValue);
  }

  private BooleanExpression applyArrayContains(Expression expression, Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof Map) {
      return expression.arrayContains(coerceExpression(value, fieldName + ".value"));
    }
    return expression.arrayContains(value);
  }

  private BooleanExpression applyArrayContainsAny(
      Expression expression, Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof List) {
      return expression.arrayContainsAny((List<?>) value);
    }
    return expression.arrayContainsAny(coerceExpression(value, fieldName + ".value"));
  }

  private BooleanExpression applyArrayContainsAll(
      Expression expression, Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof List) {
      return expression.arrayContainsAll((List<?>) value);
    }
    return expression.arrayContainsAll(coerceExpression(value, fieldName + ".value"));
  }

  private AggregateFunction buildAggregateFunction(
      ReactNativeFirebaseFirestorePipelineParser.ParsedAggregateNode aggregate, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Map<String, Object> aggregateMap = new java.util.LinkedHashMap<>();
    aggregateMap.put("kind", aggregate.kind);
    if (aggregate.primaryValue != null) {
      aggregateMap.put("expr", toSerializedValueNode(aggregate.primaryValue));
    }
    if (aggregate.args != null && !aggregate.args.isEmpty()) {
      aggregateMap.put("args", toSerializedValueNodes(aggregate.args));
    }
    return buildAggregateFunction(aggregate.kind, aggregateMap, fieldName);
  }

  private AggregateFunction buildAggregateFunction(String kind, Map<?, ?> aggregate, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String normalizedKind = kind.toLowerCase(Locale.ROOT);
    Object expressionValue = firstNonNull(aggregate.get("expr"), aggregate.get("field"));
    if (expressionValue == null) {
      expressionValue = aggregate.get("value");
    }
    if (expressionValue == null && aggregate.get("args") instanceof List) {
      List<?> args = (List<?>) aggregate.get("args");
      if (!args.isEmpty()) {
        expressionValue = args.get(0);
      }
    }

    switch (normalizedKind) {
      case "countall":
      case "count_all":
        return AggregateFunction.countAll();
      case "count":
        if (expressionValue == null) {
          return AggregateFunction.countAll();
        }
        return aggregateWithExpression(
            expressionValue, AggregateFunction::count, AggregateFunction::count, fieldName);
      case "countif":
      case "count_if":
        if (expressionValue == null) {
          throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
              "pipelineExecute() expected " + fieldName + ".expr for countIf aggregate.");
        }
        return AggregateFunction.countIf(coerceBooleanExpression(expressionValue, fieldName + ".expr"));
      case "sum":
        return aggregateWithExpression(
            expressionValue, AggregateFunction::sum, AggregateFunction::sum, fieldName);
      case "avg":
      case "average":
        return aggregateWithExpression(
            expressionValue, AggregateFunction::average, AggregateFunction::average, fieldName);
      case "min":
      case "minimum":
        return aggregateWithExpression(
            expressionValue, AggregateFunction::minimum, AggregateFunction::minimum, fieldName);
      case "max":
      case "maximum":
        return aggregateWithExpression(
            expressionValue, AggregateFunction::maximum, AggregateFunction::maximum, fieldName);
      case "countdistinct":
      case "count_distinct":
        return aggregateWithExpression(
            expressionValue,
            AggregateFunction::countDistinct,
            AggregateFunction::countDistinct,
            fieldName);
      default:
        List<Object> args =
            aggregate.get("args") instanceof List
                ? (List<Object>) aggregate.get("args")
                : new java.util.ArrayList<>();
        Expression[] expressions = new Expression[args.size()];
        for (int i = 0; i < args.size(); i++) {
          expressions[i] = coerceExpression(args.get(i), fieldName + ".args[" + i + "]");
        }
        return AggregateFunction.rawAggregate(normalizeExpressionFunctionName(kind), expressions);
    }
  }

  private AggregateFunction aggregateWithExpression(
      Object value,
      AggregateWithString withString,
      AggregateWithExpression withExpression,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof String) {
      return withString.apply((String) value);
    }
    return withExpression.apply(coerceExpression(value, fieldName + ".expr"));
  }

  private Object toRawValueNode(ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value) {
    if (value instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) {
      return ((ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) value).value;
    }

    if (value instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode) {
      return toRawExpressionNode(
          ((ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode) value).expression);
    }

    if (value instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) {
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
          ((ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) value).values;
      List<Object> output = new java.util.ArrayList<>(values.size());
      for (ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode entry : values) {
        output.add(toRawValueNode(entry));
      }
      return output;
    }

    if (value instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode) {
      Map<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
          ((ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode) value).values;
      Map<String, Object> output = new java.util.LinkedHashMap<>();
      for (Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> entry :
          values.entrySet()) {
        output.put(entry.getKey(), toRawValueNode(entry.getValue()));
      }
      return output;
    }

    return null;
  }

  private Object toSerializedValueNode(
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value) {
    return toRawValueNode(value);
  }

  private List<Object> toSerializedValueNodes(
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values) {
    List<Object> output = new java.util.ArrayList<>(values.size());
    for (ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value : values) {
      output.add(toSerializedValueNode(value));
    }
    return output;
  }

  private Object toRawExpressionNode(
      ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode expression) {
    if (expression
        instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedFieldExpressionNode) {
      Map<String, Object> output = new java.util.LinkedHashMap<>();
      output.put("exprType", "Field");
      output.put(
          "path",
          ((ReactNativeFirebaseFirestorePipelineParser.ParsedFieldExpressionNode) expression).path);
      return output;
    }

    if (expression
        instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode) {
      Map<String, Object> output = new java.util.LinkedHashMap<>();
      output.put("exprType", "Constant");
      output.put(
          "value",
          toRawValueNode(
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode) expression)
                  .value));
      return output;
    }

    if (expression
        instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode) {
      ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode function =
          (ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode) expression;
      Map<String, Object> output = new java.util.LinkedHashMap<>();
      output.put("exprType", "Function");
      output.put("name", function.name);
      List<Object> args = new java.util.ArrayList<>(function.args.size());
      for (ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode arg : function.args) {
        args.add(toRawValueNode(arg));
      }
      output.put("args", args);
      return output;
    }

    return null;
  }

  private String firstString(Object... values) {
    for (Object value : values) {
      if (value instanceof String && !((String) value).isEmpty()) {
        return (String) value;
      }
    }
    return null;
  }

  private Object firstNonNull(Object... values) {
    for (Object value : values) {
      if (value != null) {
        return value;
      }
    }
    return null;
  }

  private interface ComparisonFn {
    BooleanExpression apply(Object value);
  }

  private interface AggregateWithString {
    AggregateFunction apply(String expression);
  }

  private interface AggregateWithExpression {
    AggregateFunction apply(Expression expression);
  }
}
