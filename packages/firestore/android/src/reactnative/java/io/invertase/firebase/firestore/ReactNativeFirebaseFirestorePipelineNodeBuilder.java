package io.invertase.firebase.firestore;

import com.google.firebase.Timestamp;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.pipeline.AggregateFunction;
import com.google.firebase.firestore.pipeline.AliasedAggregate;
import com.google.firebase.firestore.pipeline.BooleanExpression;
import com.google.firebase.firestore.pipeline.Expression;
import com.google.firebase.firestore.pipeline.Ordering;
import com.google.firebase.firestore.pipeline.Selectable;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

final class ReactNativeFirebaseFirestorePipelineNodeBuilder {
  private static final class ResolvedValueBox {
    Object value;
  }

  private static final class SerializedValueBox {
    Object value;
  }

  private static final class SerializedExpressionBox {
    Object value;
  }

  private static final class ConstantValueBox {
    Object value;
  }

  private static final class LoweredBooleanBox {
    BooleanExpression value;
  }

  private static final class PendingReceiverOperation {
    final String normalizedName;
    final List<Object> args;
    final String fieldName;
    final String originalName;

    PendingReceiverOperation(
        String normalizedName, String originalName, List<Object> args, String fieldName) {
      this.normalizedName = normalizedName;
      this.originalName = originalName;
      this.args = args;
      this.fieldName = fieldName;
    }
  }

  private static final class PendingBooleanReceiverOperation {
    final String normalizedName;
    final List<Object> args;
    final String fieldName;
    final String originalName;

    PendingBooleanReceiverOperation(
        String normalizedName, String originalName, List<Object> args, String fieldName) {
      this.normalizedName = normalizedName;
      this.originalName = originalName;
      this.args = args;
      this.fieldName = fieldName;
    }
  }

  private interface ValueResolutionFrame {}

  private interface SerializationFrame {}

  private interface ConstantResolutionFrame {}

  private interface BooleanLoweringFrame {}

  private static final class EnterValueResolutionFrame implements ValueResolutionFrame {
    final ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value;
    final String fieldName;
    final ResolvedValueBox box;

    EnterValueResolutionFrame(
        ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value,
        String fieldName,
        ResolvedValueBox box) {
      this.value = value;
      this.fieldName = fieldName;
      this.box = box;
    }
  }

  private static final class ExitListValueResolutionFrame implements ValueResolutionFrame {
    final ResolvedValueBox box;
    final List<ResolvedValueBox> childBoxes;

    ExitListValueResolutionFrame(ResolvedValueBox box, List<ResolvedValueBox> childBoxes) {
      this.box = box;
      this.childBoxes = childBoxes;
    }
  }

  private static final class ExitMapValueResolutionFrame implements ValueResolutionFrame {
    final ResolvedValueBox box;
    final List<Map.Entry<String, ResolvedValueBox>> entries;

    ExitMapValueResolutionFrame(
        ResolvedValueBox box, List<Map.Entry<String, ResolvedValueBox>> entries) {
      this.box = box;
      this.entries = entries;
    }
  }

  private static final class EnterSerializedExpressionFrame implements SerializationFrame {
    final ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode value;
    final SerializedExpressionBox box;

    EnterSerializedExpressionFrame(
        ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode value,
        SerializedExpressionBox box) {
      this.value = value;
      this.box = box;
    }
  }

  private static final class ExitSerializedExpressionFunctionFrame implements SerializationFrame {
    final SerializedExpressionBox box;
    final String name;
    final List<SerializedValueBox> argBoxes;

    ExitSerializedExpressionFunctionFrame(
        SerializedExpressionBox box, String name, List<SerializedValueBox> argBoxes) {
      this.box = box;
      this.name = name;
      this.argBoxes = argBoxes;
    }
  }

  private static final class EnterSerializedValueFrame implements SerializationFrame {
    final ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value;
    final SerializedValueBox box;

    EnterSerializedValueFrame(
        ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value, SerializedValueBox box) {
      this.value = value;
      this.box = box;
    }
  }

  private static final class ExitSerializedValueListFrame implements SerializationFrame {
    final SerializedValueBox box;
    final List<SerializedValueBox> childBoxes;

    ExitSerializedValueListFrame(SerializedValueBox box, List<SerializedValueBox> childBoxes) {
      this.box = box;
      this.childBoxes = childBoxes;
    }
  }

  private static final class ExitSerializedValueMapFrame implements SerializationFrame {
    final SerializedValueBox box;
    final List<Map.Entry<String, SerializedValueBox>> entries;

    ExitSerializedValueMapFrame(
        SerializedValueBox box, List<Map.Entry<String, SerializedValueBox>> entries) {
      this.box = box;
      this.entries = entries;
    }
  }

  private static final class ExitSerializedExpressionConstantFrame implements SerializationFrame {
    final SerializedExpressionBox expressionBox;
    final SerializedValueBox valueBox;

    ExitSerializedExpressionConstantFrame(
        SerializedExpressionBox expressionBox, SerializedValueBox valueBox) {
      this.expressionBox = expressionBox;
      this.valueBox = valueBox;
    }
  }

  private static final class ExitSerializedValueExpressionFrame implements SerializationFrame {
    final SerializedValueBox valueBox;
    final SerializedExpressionBox expressionBox;

    ExitSerializedValueExpressionFrame(
        SerializedValueBox valueBox, SerializedExpressionBox expressionBox) {
      this.valueBox = valueBox;
      this.expressionBox = expressionBox;
    }
  }

  private static final class EnterConstantResolutionFrame implements ConstantResolutionFrame {
    final Object value;
    final String fieldName;
    final ConstantValueBox box;

    EnterConstantResolutionFrame(Object value, String fieldName, ConstantValueBox box) {
      this.value = value;
      this.fieldName = fieldName;
      this.box = box;
    }
  }

  private static final class ExitConstantListFrame implements ConstantResolutionFrame {
    final ConstantValueBox box;
    final List<ConstantValueBox> childBoxes;

    ExitConstantListFrame(ConstantValueBox box, List<ConstantValueBox> childBoxes) {
      this.box = box;
      this.childBoxes = childBoxes;
    }
  }

  private static final class ExitConstantMapFrame implements ConstantResolutionFrame {
    final ConstantValueBox box;
    final List<Map.Entry<String, ConstantValueBox>> entries;

    ExitConstantMapFrame(ConstantValueBox box, List<Map.Entry<String, ConstantValueBox>> entries) {
      this.box = box;
      this.entries = entries;
    }
  }

  private static final class EnterBooleanLoweringFrame implements BooleanLoweringFrame {
    final Object value;
    final String fieldName;
    final LoweredBooleanBox box;

    EnterBooleanLoweringFrame(Object value, String fieldName, LoweredBooleanBox box) {
      this.value = value;
      this.fieldName = fieldName;
      this.box = box;
    }
  }

  private static final class ExitBooleanLogicalFrame implements BooleanLoweringFrame {
    final LoweredBooleanBox box;
    final boolean andOperator;
    final List<LoweredBooleanBox> childBoxes;
    final String fieldName;

    ExitBooleanLogicalFrame(
        LoweredBooleanBox box,
        boolean andOperator,
        List<LoweredBooleanBox> childBoxes,
        String fieldName) {
      this.box = box;
      this.andOperator = andOperator;
      this.childBoxes = childBoxes;
      this.fieldName = fieldName;
    }
  }

  Expression coerceExpression(
      ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    return coerceExpression(serializeExpressionNode(value), fieldName);
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
        && value.expression
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedFieldExpressionNode) {
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
    return coerceBooleanExpression(serializeExpressionNode(value), fieldName);
  }

  AliasedAggregate coerceAliasedAggregate(
      ReactNativeFirebaseFirestorePipelineParser.ParsedAggregateNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    AggregateFunction function = buildAggregateFunction(value, fieldName);
    return function.alias(value.alias);
  }

  String coerceFieldPath(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object currentValue = value;

    while (true) {
      if (currentValue instanceof String) {
        String fieldPath = (String) currentValue;
        if (!fieldPath.isEmpty()) {
          return fieldPath;
        }
      }

      if (currentValue instanceof Map) {
        Map<?, ?> map = (Map<?, ?>) currentValue;
        Object directPath = map.get("path");
        if (directPath instanceof String && !((String) directPath).isEmpty()) {
          return (String) directPath;
        }

        Object fieldPath = map.get("fieldPath");
        if (fieldPath != null && fieldPath != map) {
          currentValue = fieldPath;
          continue;
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
  }

  double[] coerceVectorValue(Object value)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object currentValue = value;

    while (currentValue instanceof Map) {
      currentValue = ((Map<?, ?>) currentValue).get("values");
    }

    if (!(currentValue instanceof List)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected findNearest.vectorValue to be an array.");
    }

    List<?> values = (List<?>) currentValue;
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

  Expression coerceExpression(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object currentValue = value;
    String currentFieldName = fieldName;
    List<String> pendingUnaryFunctions = new ArrayList<>();

    while (true) {
      if (currentValue instanceof String) {
        return applyPendingUnaryExpressionFunctions(
            Expression.field((String) currentValue), pendingUnaryFunctions);
      }

      if (currentValue instanceof Expression) {
        return applyPendingUnaryExpressionFunctions(
            (Expression) currentValue, pendingUnaryFunctions);
      }

      if (currentValue == null
          || currentValue instanceof Number
          || currentValue instanceof Boolean
          || currentValue instanceof java.util.Date
          || currentValue instanceof Timestamp
          || currentValue instanceof com.google.firebase.firestore.GeoPoint
          || currentValue instanceof com.google.firebase.firestore.Blob
          || currentValue instanceof DocumentReference
          || currentValue instanceof com.google.firebase.firestore.VectorValue
          || currentValue instanceof byte[]) {
        return applyPendingUnaryExpressionFunctions(
            constantExpression(currentValue), pendingUnaryFunctions);
      }

      if (!(currentValue instanceof Map)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() could not convert "
                + currentFieldName
                + " into a pipeline expression.");
      }

      Map<?, ?> map = (Map<?, ?>) currentValue;
      Object nested = map.get("expr");
      if (nested != null) {
        currentValue = nested;
        currentFieldName = currentFieldName + ".expr";
        continue;
      }

      nested = map.get("expression");
      if (nested != null) {
        currentValue = nested;
        currentFieldName = currentFieldName + ".expression";
        continue;
      }

      Object operatorName = map.get("operator");
      if (operatorName instanceof String) {
        return applyPendingUnaryExpressionFunctions(
            coerceBooleanExpression(currentValue, currentFieldName), pendingUnaryFunctions);
      }

      Object name = map.get("name");
      if (name instanceof String) {
        if (isBooleanFunctionName((String) name)) {
          return applyPendingUnaryExpressionFunctions(
              coerceBooleanExpression(currentValue, currentFieldName), pendingUnaryFunctions);
        }
        List<Object> args = normalizeArgs(map.get("args"));
        String normalizedFunctionName = canonicalizeExpressionFunctionName((String) name);
        if (isDeferredUnaryExpressionFunction(normalizedFunctionName) && args.size() == 1) {
          pendingUnaryFunctions.add(normalizedFunctionName);
          currentValue = args.get(0);
          currentFieldName = currentFieldName + ".args[0]";
          continue;
        }
        return applyPendingUnaryExpressionFunctions(
            coerceFunctionExpression((String) name, args, currentFieldName), pendingUnaryFunctions);
      }

      Object exprType = map.get("exprType");
      if (exprType instanceof String) {
        String normalizedType = ((String) exprType).toLowerCase(Locale.ROOT);
        if ("field".equals(normalizedType)) {
          return applyPendingUnaryExpressionFunctions(
              Expression.field(coerceFieldPath(currentValue, currentFieldName)),
              pendingUnaryFunctions);
        }
        if ("constant".equals(normalizedType)) {
          return applyPendingUnaryExpressionFunctions(
              constantExpression(resolveConstantValue(map.get("value"), currentFieldName + ".value")),
              pendingUnaryFunctions);
        }
      }

      if (map.containsKey("fieldPath")
          || map.containsKey("path")
          || map.containsKey("segments")
          || map.containsKey("_segments")) {
        return applyPendingUnaryExpressionFunctions(
            Expression.field(coerceFieldPath(currentValue, currentFieldName)),
            pendingUnaryFunctions);
      }

      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() could not convert "
              + currentFieldName
              + " into a pipeline expression.");
    }
  }

  BooleanExpression coerceBooleanExpression(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    LoweredBooleanBox rootBox = new LoweredBooleanBox();
    ArrayDeque<BooleanLoweringFrame> stack = new ArrayDeque<>();
    stack.push(new EnterBooleanLoweringFrame(value, fieldName, rootBox));

    while (!stack.isEmpty()) {
      BooleanLoweringFrame frame = stack.pop();
      if (frame instanceof EnterBooleanLoweringFrame) {
        EnterBooleanLoweringFrame enterFrame = (EnterBooleanLoweringFrame) frame;
        Object currentValue = enterFrame.value;
        String currentFieldName = enterFrame.fieldName;

        while (currentValue instanceof Map) {
          Map<?, ?> map = (Map<?, ?>) currentValue;
          Object nested = map.get("condition");
          if (nested == null) {
            break;
          }
          currentValue = nested;
          currentFieldName = currentFieldName + ".condition";
        }

        if (currentValue instanceof Map) {
          @SuppressWarnings("unchecked")
          Map<String, Object> map = (Map<String, Object>) currentValue;

          Object operatorName = map.get("operator");
          if (operatorName instanceof String) {
            String normalizedOperator = ((String) operatorName).toUpperCase(Locale.ROOT);
            if ("AND".equals(normalizedOperator) || "OR".equals(normalizedOperator)) {
              Object queriesValue = map.get("queries");
              if (!(queriesValue instanceof List) || ((List<?>) queriesValue).isEmpty()) {
                throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                    "pipelineExecute() expected "
                        + currentFieldName
                        + ".queries to contain boolean expressions.");
              }

              List<?> queries = (List<?>) queriesValue;
              List<LoweredBooleanBox> childBoxes = new ArrayList<>(queries.size());
              for (int i = 0; i < queries.size(); i++) {
                childBoxes.add(new LoweredBooleanBox());
              }
              stack.push(
                  new ExitBooleanLogicalFrame(
                      enterFrame.box, "AND".equals(normalizedOperator), childBoxes, currentFieldName));
              for (int i = queries.size() - 1; i >= 0; i--) {
                stack.push(
                    new EnterBooleanLoweringFrame(
                        queries.get(i), currentFieldName + ".queries[" + i + "]", childBoxes.get(i)));
              }
              continue;
            }

            enterFrame.box.value =
                coerceBooleanOperatorExpression(map, (String) operatorName, currentFieldName);
            continue;
          }

          Object name = map.get("name");
          if (name instanceof String) {
            String normalizedName = canonicalizeExpressionFunctionName((String) name);
            List<Object> args = normalizeArgs(map.get("args"));
            if ("and".equals(normalizedName) || "or".equals(normalizedName)) {
              if (args.isEmpty()) {
                throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                    "pipelineExecute() expected "
                        + currentFieldName
                        + ".args to contain boolean expressions.");
              }

              List<LoweredBooleanBox> childBoxes = new ArrayList<>(args.size());
              for (int i = 0; i < args.size(); i++) {
                childBoxes.add(new LoweredBooleanBox());
              }
              stack.push(
                  new ExitBooleanLogicalFrame(
                      enterFrame.box, "and".equals(normalizedName), childBoxes, currentFieldName));
              for (int i = args.size() - 1; i >= 0; i--) {
                stack.push(
                    new EnterBooleanLoweringFrame(
                        args.get(i), currentFieldName + ".args[" + i + "]", childBoxes.get(i)));
              }
              continue;
            }

            enterFrame.box.value = booleanExpressionFromFunction((String) name, args, currentFieldName);
            continue;
          }
        }

        Expression expression = coerceExpression(currentValue, currentFieldName);
        if (expression instanceof BooleanExpression) {
          enterFrame.box.value = (BooleanExpression) expression;
          continue;
        }
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected "
                + currentFieldName
                + " to resolve to a boolean expression.");
      }

      ExitBooleanLogicalFrame exitFrame = (ExitBooleanLogicalFrame) frame;
      BooleanExpression[] expressions = new BooleanExpression[exitFrame.childBoxes.size()];
      for (int i = 0; i < exitFrame.childBoxes.size(); i++) {
        BooleanExpression valueAtIndex = exitFrame.childBoxes.get(i).value;
        if (valueAtIndex == null) {
          throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
              "pipelineExecute() expected "
                  + exitFrame.fieldName
                  + " to contain boolean expressions.");
        }
        expressions[i] = valueAtIndex;
      }
      BooleanExpression first = expressions[0];
      BooleanExpression[] rest = Arrays.copyOfRange(expressions, 1, expressions.length);
      exitFrame.box.value =
          exitFrame.andOperator ? Expression.and(first, rest) : Expression.or(first, rest);
    }

    return rootBox.value;
  }

  private Expression coerceFunctionExpression(String name, List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String normalizedName = canonicalizeExpressionFunctionName(name);

    switch (normalizedName) {
      case "array":
        return buildArrayExpression(args, fieldName);
      case "map":
        return buildMapExpression(args, fieldName);
      case "conditional":
        requireArgumentCount(args, 3, name, fieldName);
        return Expression.conditional(
            coerceBooleanValue(args.get(0), fieldName + ".args[0]"),
            coerceExpressionValue(args.get(1), fieldName + ".args[1]"),
            coerceExpressionValue(args.get(2), fieldName + ".args[2]"));
      case "currenttimestamp":
        requireArgumentCount(args, 0, name, fieldName);
        return Expression.currentTimestamp();
      case "type":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").type();
      case "collectionid":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").collectionId();
      case "documentid":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").documentId();
      case "istype":
        requireArgumentCount(args, 2, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]")
            .type()
            .equal(coerceStringValue(args.get(1), fieldName + ".args[1]"));
      case "logicalmaximum":
        return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
      case "logicalminimum":
        return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
      case "mapget":
        requireArgumentCount(args, 2, name, fieldName);
        return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
      case "mapmerge":
        return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
      case "arraylength":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").arrayLength();
      case "arrayget":
        requireArgumentCount(args, 2, name, fieldName);
        return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
      case "arrayconcat":
        return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
      case "arraysum":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").arraySum();
      case "vectorlength":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").vectorLength();
      case "cosinedistance":
        requireArgumentCount(args, 2, name, fieldName);
        return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
      case "dotproduct":
        requireArgumentCount(args, 2, name, fieldName);
        return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
      case "euclideandistance":
        requireArgumentCount(args, 2, name, fieldName);
        return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
      case "timestamptounixmicros":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").timestampToUnixMicros();
      case "timestamptounixmillis":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").timestampToUnixMillis();
      case "timestamptounixseconds":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").timestampToUnixSeconds();
      case "unixmicrostotimestamp":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").unixMicrosToTimestamp();
      case "unixmillistotimestamp":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").unixMillisToTimestamp();
      case "unixsecondstotimestamp":
        requireArgumentCount(args, 1, name, fieldName);
        return coerceExpressionValue(args.get(0), fieldName + ".args[0]").unixSecondsToTimestamp();
      case "timestampadd":
        requireArgumentCount(args, 3, name, fieldName);
        return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
      case "timestampsubtract":
        requireArgumentCount(args, 3, name, fieldName);
        return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
      case "timestamptruncate":
        if (args.size() == 2) {
          return coerceReceiverExpressionChain(normalizedName, name, args, fieldName);
        }
        return null;
      default:
        break;
    }

    Expression[] expressions = new Expression[args.size()];
    for (int i = 0; i < args.size(); i++) {
      expressions[i] = coerceExpressionValue(args.get(i), fieldName + ".args[" + i + "]");
    }
    return Expression.rawFunction(normalizeExpressionFunctionName(name), expressions);
  }

  private Expression coerceReceiverExpressionChain(
      String normalizedName, String originalName, List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (args.isEmpty()) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected "
              + fieldName
              + "."
              + originalName
              + " to include at least 1 argument.");
    }

    List<PendingReceiverOperation> pendingOperations = new ArrayList<>();
    pendingOperations.add(new PendingReceiverOperation(normalizedName, originalName, args, fieldName));

    Object currentValue = args.get(0);
    String currentFieldName = fieldName + ".args[0]";

    while (currentValue instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> map = (Map<String, Object>) currentValue;

      Object nested = map.get("expr");
      if (nested != null) {
        currentValue = nested;
        currentFieldName = currentFieldName + ".expr";
        continue;
      }

      nested = map.get("expression");
      if (nested != null) {
        currentValue = nested;
        currentFieldName = currentFieldName + ".expression";
        continue;
      }

      Object name = map.get("name");
      if (!(name instanceof String)) {
        break;
      }

      List<Object> nestedArgs = normalizeArgs(map.get("args"));
      String nestedNormalizedName = canonicalizeExpressionFunctionName((String) name);
      if (!isDeferredReceiverExpressionFunction(nestedNormalizedName) || nestedArgs.isEmpty()) {
        break;
      }

      pendingOperations.add(
          new PendingReceiverOperation(
              nestedNormalizedName, (String) name, nestedArgs, currentFieldName));
      currentValue = nestedArgs.get(0);
      currentFieldName = currentFieldName + ".args[0]";
    }

    Expression baseExpression = coerceExpression(currentValue, currentFieldName);
    return applyPendingReceiverOperations(baseExpression, pendingOperations);
  }

  private Expression applyPendingReceiverOperations(
      Expression expression, List<PendingReceiverOperation> pendingOperations)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression currentExpression = expression;

    for (int i = pendingOperations.size() - 1; i >= 0; i--) {
      PendingReceiverOperation operation = pendingOperations.get(i);
      List<Object> args = operation.args;
      String fieldName = operation.fieldName;

      switch (operation.normalizedName) {
        case "logicalmaximum": {
          if (args.size() < 2) {
            throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                "pipelineExecute() expected "
                    + fieldName
                    + "."
                    + operation.originalName
                    + " to include at least 2 arguments.");
          }
          Expression[] others = new Expression[args.size() - 1];
          for (int argIndex = 1; argIndex < args.size(); argIndex++) {
            others[argIndex - 1] =
                coerceExpressionValue(args.get(argIndex), fieldName + ".args[" + argIndex + "]");
          }
          currentExpression = currentExpression.logicalMaximum(others);
          break;
        }
        case "logicalminimum": {
          if (args.size() < 2) {
            throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                "pipelineExecute() expected "
                    + fieldName
                    + "."
                    + operation.originalName
                    + " to include at least 2 arguments.");
          }
          Expression[] others = new Expression[args.size() - 1];
          for (int argIndex = 1; argIndex < args.size(); argIndex++) {
            others[argIndex - 1] =
                coerceExpressionValue(args.get(argIndex), fieldName + ".args[" + argIndex + "]");
          }
          currentExpression = currentExpression.logicalMinimum(others);
          break;
        }
        case "mapget": {
          Object keyArg = args.get(1);
          if (!containsSerializedExpression(keyArg)) {
            Object keyValue = resolveConstantValue(keyArg, fieldName + ".args[1]");
            if (keyValue instanceof String) {
              currentExpression = currentExpression.mapGet((String) keyValue);
              break;
            }
          }
          currentExpression = currentExpression.mapGet(coerceExpressionValue(keyArg, fieldName + ".args[1]"));
          break;
        }
        case "mapmerge": {
          if (args.size() < 2) {
            throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                "pipelineExecute() expected "
                    + fieldName
                    + "."
                    + operation.originalName
                    + " to include at least 2 arguments.");
          }
          Expression right = coerceExpressionValue(args.get(1), fieldName + ".args[1]");
          Expression[] others = new Expression[Math.max(0, args.size() - 2)];
          for (int argIndex = 2; argIndex < args.size(); argIndex++) {
            others[argIndex - 2] =
                coerceExpressionValue(args.get(argIndex), fieldName + ".args[" + argIndex + "]");
          }
          currentExpression = currentExpression.mapMerge(right, others);
          break;
        }
        case "arrayget": {
          Object indexArg = args.get(1);
          if (!containsSerializedExpression(indexArg)) {
            Object indexValue = resolveConstantValue(indexArg, fieldName + ".args[1]");
            if (indexValue instanceof Number) {
              currentExpression = currentExpression.arrayGet(((Number) indexValue).intValue());
              break;
            }
          }
          currentExpression =
              currentExpression.arrayGet(coerceExpressionValue(indexArg, fieldName + ".args[1]"));
          break;
        }
        case "arrayconcat": {
          if (args.size() < 2) {
            throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                "pipelineExecute() expected "
                    + fieldName
                    + "."
                    + operation.originalName
                    + " to include at least 2 arguments.");
          }
          Object secondValue = resolveValueOrExpression(args.get(1), fieldName + ".args[1]");
          Object[] rest = new Object[Math.max(0, args.size() - 2)];
          for (int argIndex = 2; argIndex < args.size(); argIndex++) {
            rest[argIndex - 2] =
                resolveValueOrExpression(args.get(argIndex), fieldName + ".args[" + argIndex + "]");
          }
          currentExpression = currentExpression.arrayConcat(secondValue, rest);
          break;
        }
        case "cosinedistance":
        case "dotproduct":
        case "euclideandistance": {
          Object rightArg = args.get(1);
          if (!containsSerializedExpression(rightArg)) {
            Object rightValue = resolveConstantValue(rightArg, fieldName + ".args[1]");
            if (rightValue instanceof List
                || (rightValue instanceof Map && ((Map<?, ?>) rightValue).get("values") != null)) {
              double[] vector = coerceVectorValue(rightValue);
              if ("cosinedistance".equals(operation.normalizedName)) {
                currentExpression = currentExpression.cosineDistance(vector);
              } else if ("dotproduct".equals(operation.normalizedName)) {
                currentExpression = currentExpression.dotProduct(vector);
              } else {
                currentExpression = currentExpression.euclideanDistance(vector);
              }
              break;
            }
          }
          Expression right = coerceVectorExpressionValue(rightArg, fieldName + ".args[1]");
          if ("cosinedistance".equals(operation.normalizedName)) {
            currentExpression = currentExpression.cosineDistance(right);
          } else if ("dotproduct".equals(operation.normalizedName)) {
            currentExpression = currentExpression.dotProduct(right);
          } else {
            currentExpression = currentExpression.euclideanDistance(right);
          }
          break;
        }
        case "timestampadd":
        case "timestampsubtract": {
          if (args.size() != 3) {
            throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                "pipelineExecute() expected "
                    + fieldName
                    + "."
                    + operation.originalName
                    + " to include exactly 3 arguments.");
          }
          Object unitArg = args.get(1);
          Object amountArg = args.get(2);
          if (!containsSerializedExpression(unitArg) && !containsSerializedExpression(amountArg)) {
            Object unitValue = resolveConstantValue(unitArg, fieldName + ".args[1]");
            Object amountValue = resolveConstantValue(amountArg, fieldName + ".args[2]");
            if (unitValue instanceof String && amountValue instanceof Number) {
              long amount = ((Number) amountValue).longValue();
              currentExpression =
                  "timestampadd".equals(operation.normalizedName)
                      ? currentExpression.timestampAdd((String) unitValue, amount)
                      : currentExpression.timestampSubtract((String) unitValue, amount);
              break;
            }
          }
          Expression unitExpression = coerceExpressionValue(unitArg, fieldName + ".args[1]");
          Expression amountExpression = coerceExpressionValue(amountArg, fieldName + ".args[2]");
          currentExpression =
              "timestampadd".equals(operation.normalizedName)
                  ? currentExpression.timestampAdd(unitExpression, amountExpression)
                  : currentExpression.timestampSubtract(unitExpression, amountExpression);
          break;
        }
        case "timestamptruncate": {
          Object granularityArg = args.get(1);
          if (!containsSerializedExpression(granularityArg)) {
            Object granularityValue = resolveConstantValue(granularityArg, fieldName + ".args[1]");
            if (granularityValue instanceof String) {
              currentExpression = currentExpression.timestampTruncate((String) granularityValue);
              break;
            }
          }
          currentExpression =
              currentExpression.timestampTruncate(
                  coerceExpressionValue(granularityArg, fieldName + ".args[1]"));
          break;
        }
        default:
          break;
      }
    }

    return currentExpression;
  }

  private BooleanExpression coerceReceiverBooleanChain(
      String normalizedName, String originalName, List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    List<PendingReceiverOperation> pendingReceiverOperations = new ArrayList<>();

    Object currentValue = args.get(0);
    String currentFieldName = fieldName + ".args[0]";

    while (currentValue instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> map = (Map<String, Object>) currentValue;

      Object nested = map.get("expr");
      if (nested != null) {
        currentValue = nested;
        currentFieldName = currentFieldName + ".expr";
        continue;
      }

      nested = map.get("expression");
      if (nested != null) {
        currentValue = nested;
        currentFieldName = currentFieldName + ".expression";
        continue;
      }

      Object name = map.get("name");
      if (!(name instanceof String)) {
        break;
      }

      List<Object> nestedArgs = normalizeArgs(map.get("args"));
      String nestedNormalizedName = canonicalizeExpressionFunctionName((String) name);
      if (!isDeferredReceiverExpressionFunction(nestedNormalizedName) || nestedArgs.isEmpty()) {
        break;
      }

      pendingReceiverOperations.add(
          new PendingReceiverOperation(
              nestedNormalizedName, (String) name, nestedArgs, currentFieldName));
      currentValue = nestedArgs.get(0);
      currentFieldName = currentFieldName + ".args[0]";
    }

    Expression baseExpression = coerceExpression(currentValue, currentFieldName);
    Expression currentExpression = applyPendingReceiverOperations(baseExpression, pendingReceiverOperations);
    Object rightArg = args.get(1);

    switch (normalizedName) {
      case "equal":
        return containsSerializedExpression(rightArg)
            ? currentExpression.equal(coerceExpressionValue(rightArg, fieldName + ".args[1]"))
            : currentExpression.equal(resolveConstantValue(rightArg, fieldName + ".args[1]"));
      case "notequal":
        return containsSerializedExpression(rightArg)
            ? currentExpression.notEqual(coerceExpressionValue(rightArg, fieldName + ".args[1]"))
            : currentExpression.notEqual(resolveConstantValue(rightArg, fieldName + ".args[1]"));
      case "greaterthan":
        return containsSerializedExpression(rightArg)
            ? currentExpression.greaterThan(coerceExpressionValue(rightArg, fieldName + ".args[1]"))
            : currentExpression.greaterThan(resolveConstantValue(rightArg, fieldName + ".args[1]"));
      case "greaterthanorequal":
        return containsSerializedExpression(rightArg)
            ? currentExpression.greaterThanOrEqual(
                coerceExpressionValue(rightArg, fieldName + ".args[1]"))
            : currentExpression.greaterThanOrEqual(
                resolveConstantValue(rightArg, fieldName + ".args[1]"));
      case "lessthan":
        return containsSerializedExpression(rightArg)
            ? currentExpression.lessThan(coerceExpressionValue(rightArg, fieldName + ".args[1]"))
            : currentExpression.lessThan(resolveConstantValue(rightArg, fieldName + ".args[1]"));
      case "lessthanorequal":
        return containsSerializedExpression(rightArg)
            ? currentExpression.lessThanOrEqual(
                coerceExpressionValue(rightArg, fieldName + ".args[1]"))
            : currentExpression.lessThanOrEqual(
                resolveConstantValue(rightArg, fieldName + ".args[1]"));
      case "arraycontains":
        return containsSerializedExpression(rightArg)
            ? currentExpression.arrayContains(
                coerceExpressionValue(rightArg, fieldName + ".args[1]"))
            : currentExpression.arrayContains(resolveConstantValue(rightArg, fieldName + ".args[1]"));
      case "arraycontainsany":
        if (!containsSerializedExpression(rightArg)) {
          Object resolved = resolveConstantValue(rightArg, fieldName + ".args[1]");
          if (resolved instanceof List) {
            return currentExpression.arrayContainsAny((List<?>) resolved);
          }
        }
        return currentExpression.arrayContainsAny(
            coerceExpressionValue(rightArg, fieldName + ".args[1]"));
      case "arraycontainsall":
        if (!containsSerializedExpression(rightArg)) {
          Object resolved = resolveConstantValue(rightArg, fieldName + ".args[1]");
          if (resolved instanceof List) {
            return currentExpression.arrayContainsAll((List<?>) resolved);
          }
        }
        return currentExpression.arrayContainsAll(
            coerceExpressionValue(rightArg, fieldName + ".args[1]"));
      case "equalany":
        if (!containsSerializedExpression(rightArg)) {
          Object resolved = resolveConstantValue(rightArg, fieldName + ".args[1]");
          if (resolved instanceof List) {
            return currentExpression.equalAny((List<?>) resolved);
          }
        }
        return currentExpression.equalAny(coerceExpressionValue(rightArg, fieldName + ".args[1]"));
      case "notequalany":
        if (!containsSerializedExpression(rightArg)) {
          Object resolved = resolveConstantValue(rightArg, fieldName + ".args[1]");
          if (resolved instanceof List) {
            return currentExpression.notEqualAny((List<?>) resolved);
          }
        }
        return currentExpression.notEqualAny(
            coerceExpressionValue(rightArg, fieldName + ".args[1]"));
      default:
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected a boolean receiver operation.");
    }
  }

  private Expression buildArrayExpression(List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    List<Object> elements = args;
    if (args.size() == 1) {
      List<Object> unwrapped = unwrapConstantArray(args.get(0), fieldName + ".args[0]");
      if (unwrapped != null) {
        elements = unwrapped;
      }
    }

    boolean allConstant = true;
    for (Object element : elements) {
      if (containsSerializedExpression(element)) {
        allConstant = false;
        break;
      }
    }

    if (allConstant) {
      List<Object> resolved = new ArrayList<>(elements.size());
      for (int i = 0; i < elements.size(); i++) {
        resolved.add(resolveConstantValue(elements.get(i), fieldName + ".args[" + i + "]"));
      }
      return constantExpression(resolved);
    }

    Expression[] expressions = new Expression[elements.size()];
    for (int i = 0; i < elements.size(); i++) {
      expressions[i] = coerceExpressionValue(elements.get(i), fieldName + ".args[" + i + "]");
    }
    return Expression.rawFunction("array", expressions);
  }

  private Expression buildMapExpression(List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    requireArgumentCount(args, 1, "map", fieldName);
    Map<String, Object> entries = unwrapConstantMap(args.get(0), fieldName + ".args[0]");
    if (entries == null) {
      Expression[] expressions = new Expression[args.size()];
      for (int i = 0; i < args.size(); i++) {
        expressions[i] = coerceExpressionValue(args.get(i), fieldName + ".args[" + i + "]");
      }
      return Expression.rawFunction("map", expressions);
    }

    boolean allConstant = true;
    for (Object entryValue : entries.values()) {
      if (containsSerializedExpression(entryValue)) {
        allConstant = false;
        break;
      }
    }

    if (allConstant) {
      Map<String, Object> resolved = new LinkedHashMap<>();
      for (Map.Entry<String, Object> entry : entries.entrySet()) {
        resolved.put(
            entry.getKey(),
            resolveConstantValue(entry.getValue(), fieldName + ".args[0]." + entry.getKey()));
      }
      return constantExpression(resolved);
    }

    Expression[] expressions = new Expression[entries.size() * 2];
    int index = 0;
    for (Map.Entry<String, Object> entry : entries.entrySet()) {
      expressions[index++] = constantExpression(entry.getKey());
      expressions[index++] =
          coerceExpressionValue(entry.getValue(), fieldName + ".args[0]." + entry.getKey());
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

    Expression left = coerceExpressionValue(args.get(0), fieldName + ".args[0]");
    Expression[] others = new Expression[args.size() - 1];
    for (int i = 1; i < args.size(); i++) {
      others[i - 1] = coerceExpressionValue(args.get(i), fieldName + ".args[" + i + "]");
    }
    return maximum ? left.logicalMaximum(others) : left.logicalMinimum(others);
  }

  private Expression buildMapGetExpression(List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression mapExpr = coerceExpressionValue(args.get(0), fieldName + ".args[0]");
    if (!containsSerializedExpression(args.get(1))) {
      Object keyValue = resolveConstantValue(args.get(1), fieldName + ".args[1]");
      if (keyValue instanceof String) {
        return mapExpr.mapGet((String) keyValue);
      }
    }
    return mapExpr.mapGet(coerceExpressionValue(args.get(1), fieldName + ".args[1]"));
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

    Expression left = coerceExpressionValue(args.get(0), fieldName + ".args[0]");
    Expression right = coerceExpressionValue(args.get(1), fieldName + ".args[1]");
    Expression[] others = new Expression[Math.max(0, args.size() - 2)];
    for (int i = 2; i < args.size(); i++) {
      others[i - 2] = coerceExpressionValue(args.get(i), fieldName + ".args[" + i + "]");
    }
    return left.mapMerge(right, others);
  }

  private Expression buildArrayGetExpression(List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression arrayExpr = coerceExpressionValue(args.get(0), fieldName + ".args[0]");
    if (!containsSerializedExpression(args.get(1))) {
      Object indexValue = resolveConstantValue(args.get(1), fieldName + ".args[1]");
      if (indexValue instanceof Number) {
        return arrayExpr.arrayGet(((Number) indexValue).intValue());
      }
    }
    return arrayExpr.arrayGet(coerceExpressionValue(args.get(1), fieldName + ".args[1]"));
  }

  private Expression buildArrayConcatExpression(
      List<Object> args, String functionName, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (args.size() < 2) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected "
              + fieldName
              + "."
              + functionName
              + " to include at least 2 arguments.");
    }

    Expression arrayExpr = coerceExpressionValue(args.get(0), fieldName + ".args[0]");
    Object secondValue = resolveValueOrExpression(args.get(1), fieldName + ".args[1]");
    Object[] rest = new Object[Math.max(0, args.size() - 2)];
    for (int i = 2; i < args.size(); i++) {
      rest[i - 2] = resolveValueOrExpression(args.get(i), fieldName + ".args[" + i + "]");
    }
    return arrayExpr.arrayConcat(secondValue, rest);
  }

  private Expression buildVectorDistanceExpression(
      String functionName, List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression left = coerceExpressionValue(args.get(0), fieldName + ".args[0]");
    if (!containsSerializedExpression(args.get(1))) {
      Object rightValue = resolveConstantValue(args.get(1), fieldName + ".args[1]");
      if (rightValue instanceof List
          || (rightValue instanceof Map && ((Map<?, ?>) rightValue).get("values") != null)) {
        double[] vector = coerceVectorValue(rightValue);
        switch (functionName) {
          case "cosineDistance":
            return left.cosineDistance(vector);
          case "dotProduct":
            return left.dotProduct(vector);
          default:
            return left.euclideanDistance(vector);
        }
      }
    }

    Expression right = coerceVectorExpressionValue(args.get(1), fieldName + ".args[1]");
    switch (functionName) {
      case "cosineDistance":
        return left.cosineDistance(right);
      case "dotProduct":
        return left.dotProduct(right);
      default:
        return left.euclideanDistance(right);
    }
  }

  private Expression buildTimestampMathExpression(
      boolean addition, List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression base = coerceExpressionValue(args.get(0), fieldName + ".args[0]");
    if (!containsSerializedExpression(args.get(1)) && !containsSerializedExpression(args.get(2))) {
      Object unitValue = resolveConstantValue(args.get(1), fieldName + ".args[1]");
      Object amountValue = resolveConstantValue(args.get(2), fieldName + ".args[2]");
      if (unitValue instanceof String && amountValue instanceof Number) {
        long amount = ((Number) amountValue).longValue();
        return addition
            ? base.timestampAdd((String) unitValue, amount)
            : base.timestampSubtract((String) unitValue, amount);
      }
    }

    Expression unitExpression = coerceExpressionValue(args.get(1), fieldName + ".args[1]");
    Expression amountExpression = coerceExpressionValue(args.get(2), fieldName + ".args[2]");
    return addition
        ? base.timestampAdd(unitExpression, amountExpression)
        : base.timestampSubtract(unitExpression, amountExpression);
  }

  private Expression buildTimestampTruncateExpression(List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression base = coerceExpressionValue(args.get(0), fieldName + ".args[0]");
    if (!containsSerializedExpression(args.get(1))) {
      Object granularityValue = resolveConstantValue(args.get(1), fieldName + ".args[1]");
      if (granularityValue instanceof String) {
        return base.timestampTruncate((String) granularityValue);
      }
    }
    return base.timestampTruncate(coerceExpressionValue(args.get(1), fieldName + ".args[1]"));
  }

  private BooleanExpression coerceBooleanOperatorExpression(
      Map<String, Object> map, String operatorName, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String normalizedOperator = operatorName.toUpperCase(Locale.ROOT);
    Object fieldValue = map.get("fieldPath") != null ? map.get("fieldPath") : map.get("field");
    if (fieldValue == null) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + ".fieldPath to be provided.");
    }

    List<Object> args = new ArrayList<>(2);
    args.add(fieldValue);
    args.add(
        map.containsKey("value")
            ? map.get("value")
            : map.containsKey("right") ? map.get("right") : map.get("operand"));
    return booleanExpressionFromFunction(mapOperatorToFunctionName(normalizedOperator), args, fieldName);
  }

  private BooleanExpression booleanExpressionFromFunction(
      String functionName, List<Object> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String normalizedName = canonicalizeExpressionFunctionName(functionName);

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
      if (args.size() < 2) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected "
                + fieldName
                + ".args to include left and right operands.");
      }
      return coerceReceiverBooleanChain(normalizedName, functionName, args, fieldName);
    }

    Expression[] expressions = new Expression[args.size()];
    for (int i = 0; i < args.size(); i++) {
      expressions[i] = coerceExpressionValue(args.get(i), fieldName + ".args[" + i + "]");
    }
    return BooleanExpression.rawFunction(normalizeExpressionFunctionName(functionName), expressions);
  }

  private BooleanExpression applyComparison(ComparisonFn fn, Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (containsSerializedExpression(value)) {
      return fn.apply(coerceExpressionValue(value, fieldName));
    }
    return fn.apply(resolveConstantValue(value, fieldName));
  }

  private BooleanExpression applyArrayContains(Expression expression, Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (containsSerializedExpression(value)) {
      return expression.arrayContains(coerceExpressionValue(value, fieldName + ".value"));
    }
    return expression.arrayContains(resolveConstantValue(value, fieldName));
  }

  private BooleanExpression applyArrayContainsAny(
      Expression expression, Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!containsSerializedExpression(value)) {
      Object resolved = resolveConstantValue(value, fieldName);
      if (resolved instanceof List) {
        return expression.arrayContainsAny((List<?>) resolved);
      }
    }
    return expression.arrayContainsAny(coerceExpressionValue(value, fieldName + ".value"));
  }

  private BooleanExpression applyArrayContainsAll(
      Expression expression, Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!containsSerializedExpression(value)) {
      Object resolved = resolveConstantValue(value, fieldName);
      if (resolved instanceof List) {
        return expression.arrayContainsAll((List<?>) resolved);
      }
    }
    return expression.arrayContainsAll(coerceExpressionValue(value, fieldName + ".value"));
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

  private Expression coerceExpressionValue(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (containsSerializedExpression(value)) {
      return coerceExpression(value, fieldName);
    }
    return constantExpression(resolveConstantValue(value, fieldName));
  }

  private BooleanExpression coerceBooleanValue(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (containsSerializedExpression(value)) {
      return coerceBooleanExpression(value, fieldName);
    }

    Expression expression = constantExpression(resolveConstantValue(value, fieldName));
    if (expression instanceof BooleanExpression) {
      return (BooleanExpression) expression;
    }
    throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
        "pipelineExecute() expected " + fieldName + " to resolve to a boolean expression.");
  }

  private String coerceStringValue(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object rawValue = resolveConstantValue(value, fieldName);
    if (rawValue instanceof String) {
      return (String) rawValue;
    }
    throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
        "pipelineExecute() expected " + fieldName + " to resolve to a string.");
  }

  private Object resolveValueOrExpression(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (containsSerializedExpression(value)) {
      return coerceExpressionValue(value, fieldName);
    }
    return resolveConstantValue(value, fieldName);
  }

  private Expression coerceVectorExpressionValue(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object currentValue = value;

    while (currentValue instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> map = (Map<String, Object>) currentValue;
      Object constantValue = unwrapConstantValue(map, fieldName);
      if (constantValue != null) {
        currentValue = constantValue;
        continue;
      }

      if (map.get("values") != null) {
        double[] vector = coerceVectorValue(map.get("values"));
        return Expression.vector(vector);
      }
      break;
    }

    if (currentValue instanceof List) {
      double[] vector = coerceVectorValue(currentValue);
      return Expression.vector(vector);
    }

    return coerceExpressionValue(currentValue, fieldName);
  }

  private Object resolveConstantValue(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    ConstantValueBox rootBox = new ConstantValueBox();
    ArrayDeque<ConstantResolutionFrame> stack = new ArrayDeque<>();
    stack.push(new EnterConstantResolutionFrame(value, fieldName, rootBox));

    while (!stack.isEmpty()) {
      ConstantResolutionFrame frame = stack.pop();
      if (frame instanceof EnterConstantResolutionFrame) {
        EnterConstantResolutionFrame enterFrame = (EnterConstantResolutionFrame) frame;
        Object currentValue = enterFrame.value;
        String currentFieldName = enterFrame.fieldName;

        while (currentValue instanceof Map) {
          @SuppressWarnings("unchecked")
          Map<String, Object> map = (Map<String, Object>) currentValue;
          Object constantValue = unwrapConstantValue(map, currentFieldName);
          if (constantValue == null) {
            break;
          }
          currentValue = constantValue;
        }

        if (currentValue instanceof Map) {
          @SuppressWarnings("unchecked")
          Map<String, Object> map = (Map<String, Object>) currentValue;
          if (isSerializedExpressionLike(map)) {
            enterFrame.box.value = coerceExpression(map, currentFieldName);
            continue;
          }

          List<Map.Entry<String, ConstantValueBox>> entries = new ArrayList<>(map.size());
          stack.push(new ExitConstantMapFrame(enterFrame.box, entries));
          List<Map.Entry<String, Object>> pendingEntries = new ArrayList<>(map.entrySet());
          for (Map.Entry<String, Object> entry : pendingEntries) {
            ConstantValueBox childBox = new ConstantValueBox();
            entries.add(new java.util.AbstractMap.SimpleEntry<>(entry.getKey(), childBox));
          }
          for (int i = pendingEntries.size() - 1; i >= 0; i--) {
            Map.Entry<String, Object> entry = pendingEntries.get(i);
            stack.push(
                new EnterConstantResolutionFrame(
                    entry.getValue(),
                    currentFieldName + "." + entry.getKey(),
                    entries.get(i).getValue()));
          }
          continue;
        }

        if (currentValue instanceof List) {
          List<?> values = (List<?>) currentValue;
          List<ConstantValueBox> childBoxes = new ArrayList<>(values.size());
          for (int i = 0; i < values.size(); i++) {
            childBoxes.add(new ConstantValueBox());
          }
          stack.push(new ExitConstantListFrame(enterFrame.box, childBoxes));
          for (int i = values.size() - 1; i >= 0; i--) {
            stack.push(
                new EnterConstantResolutionFrame(
                    values.get(i), currentFieldName + "[" + i + "]", childBoxes.get(i)));
          }
          continue;
        }

        enterFrame.box.value = currentValue;
        continue;
      }

      if (frame instanceof ExitConstantListFrame) {
        ExitConstantListFrame exitFrame = (ExitConstantListFrame) frame;
        List<Object> output = new ArrayList<>(exitFrame.childBoxes.size());
        for (ConstantValueBox childBox : exitFrame.childBoxes) {
          output.add(childBox.value);
        }
        exitFrame.box.value = output;
        continue;
      }

      ExitConstantMapFrame exitFrame = (ExitConstantMapFrame) frame;
      Map<String, Object> output = new LinkedHashMap<>();
      for (Map.Entry<String, ConstantValueBox> entry : exitFrame.entries) {
        output.put(entry.getKey(), entry.getValue().value);
      }
      exitFrame.box.value = output;
    }

    return rootBox.value;
  }

  private boolean containsSerializedExpression(Object value) {
    ArrayDeque<Object> stack = new ArrayDeque<>();
    if (value != null) {
      stack.push(value);
    }

    while (!stack.isEmpty()) {
      Object currentValue = stack.pop();
      if (currentValue == null) {
        continue;
      }

      while (currentValue instanceof Map) {
        @SuppressWarnings("unchecked")
        Map<String, Object> map = (Map<String, Object>) currentValue;
        Object constantValue = null;
        try {
          constantValue = unwrapConstantValue(map, "");
        } catch (ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException e) {
          constantValue = null;
        }
        if (constantValue == null) {
          break;
        }
        currentValue = constantValue;
      }

      if (currentValue instanceof Map) {
        @SuppressWarnings("unchecked")
        Map<String, Object> map = (Map<String, Object>) currentValue;
        if (isSerializedExpressionLike(map)) {
          return true;
        }
        for (Object nestedValue : map.values()) {
          if (nestedValue != null) {
            stack.push(nestedValue);
          }
        }
        continue;
      }

      if (currentValue instanceof List) {
        for (Object nestedValue : (List<?>) currentValue) {
          if (nestedValue != null) {
            stack.push(nestedValue);
          }
        }
      }
    }

    return false;
  }

  private List<Object> normalizeArgs(Object argsValue) {
    List<Object> args = new ArrayList<>();
    if (argsValue == null) {
      return args;
    }
    if (argsValue instanceof List) {
      for (Object arg : (List<?>) argsValue) {
        args.add(arg);
      }
      return args;
    }
    args.add(argsValue);
    return args;
  }

  private List<Object> unwrapConstantArray(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof List) {
      List<Object> output = new ArrayList<>();
      for (Object entry : (List<?>) value) {
        output.add(entry);
      }
      return output;
    }

    if (!(value instanceof Map)) {
      return null;
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> map = (Map<String, Object>) value;
    Object constantValue = unwrapConstantValue(map, fieldName);
    if (constantValue instanceof List) {
      List<Object> output = new ArrayList<>();
      for (Object entry : (List<?>) constantValue) {
        output.add(entry);
      }
      return output;
    }
    return null;
  }

  private Map<String, Object> unwrapConstantMap(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!(value instanceof Map)) {
      return null;
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> map = (Map<String, Object>) value;
    Object constantValue = unwrapConstantValue(map, fieldName);
    if (constantValue instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> constantMap = (Map<String, Object>) constantValue;
      return constantMap;
    }

    return isSerializedExpressionLike(map) ? null : map;
  }

  private Object unwrapConstantValue(Map<String, Object> map, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object exprType = map.get("exprType");
    if (!(exprType instanceof String)
        || !"constant".equals(((String) exprType).toLowerCase(Locale.ROOT))) {
      return null;
    }

    if (!map.containsKey("value")) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + ".value to be provided.");
    }
    return map.get("value");
  }

  private boolean isSerializedExpressionLike(Map<String, Object> map) {
    return map.get("exprType") != null
        || map.get("operator") != null
        || map.get("name") != null
        || map.get("expr") != null
        || map.get("expression") != null
        || map.get("fieldPath") != null
        || map.get("path") != null
        || map.get("segments") != null
        || map.get("_segments") != null;
  }

  private boolean isBooleanFunctionName(String functionName) {
    String normalizedName = canonicalizeExpressionFunctionName(functionName);
    return "and".equals(normalizedName)
        || "or".equals(normalizedName)
        || "equal".equals(normalizedName)
        || "notequal".equals(normalizedName)
        || "greaterthan".equals(normalizedName)
        || "greaterthanorequal".equals(normalizedName)
        || "lessthan".equals(normalizedName)
        || "lessthanorequal".equals(normalizedName)
        || "arraycontains".equals(normalizedName)
        || "arraycontainsany".equals(normalizedName)
        || "arraycontainsall".equals(normalizedName)
        || "equalany".equals(normalizedName)
        || "notequalany".equals(normalizedName);
  }

  private boolean isDeferredUnaryExpressionFunction(String normalizedFunctionName) {
    return "type".equals(normalizedFunctionName)
        || "collectionid".equals(normalizedFunctionName)
        || "documentid".equals(normalizedFunctionName)
        || "arraylength".equals(normalizedFunctionName)
        || "arraysum".equals(normalizedFunctionName)
        || "vectorlength".equals(normalizedFunctionName)
        || "timestamptounixmicros".equals(normalizedFunctionName)
        || "timestamptounixmillis".equals(normalizedFunctionName)
        || "timestamptounixseconds".equals(normalizedFunctionName)
        || "unixmicrostotimestamp".equals(normalizedFunctionName)
        || "unixmillistotimestamp".equals(normalizedFunctionName)
        || "unixsecondstotimestamp".equals(normalizedFunctionName);
  }

  private boolean isDeferredReceiverExpressionFunction(String normalizedFunctionName) {
    return "logicalmaximum".equals(normalizedFunctionName)
        || "logicalminimum".equals(normalizedFunctionName)
        || "mapget".equals(normalizedFunctionName)
        || "mapmerge".equals(normalizedFunctionName)
        || "arrayget".equals(normalizedFunctionName)
        || "arrayconcat".equals(normalizedFunctionName)
        || "cosinedistance".equals(normalizedFunctionName)
        || "dotproduct".equals(normalizedFunctionName)
        || "euclideandistance".equals(normalizedFunctionName)
        || "timestampadd".equals(normalizedFunctionName)
        || "timestampsubtract".equals(normalizedFunctionName)
        || "timestamptruncate".equals(normalizedFunctionName);
  }

  private Expression applyPendingUnaryExpressionFunctions(
      Expression expression, List<String> pendingUnaryFunctions) {
    Expression currentExpression = expression;
    for (int i = pendingUnaryFunctions.size() - 1; i >= 0; i--) {
      String functionName = pendingUnaryFunctions.get(i);
      switch (functionName) {
        case "type":
          currentExpression = currentExpression.type();
          break;
        case "collectionid":
          currentExpression = currentExpression.collectionId();
          break;
        case "documentid":
          currentExpression = currentExpression.documentId();
          break;
        case "arraylength":
          currentExpression = currentExpression.arrayLength();
          break;
        case "arraysum":
          currentExpression = currentExpression.arraySum();
          break;
        case "vectorlength":
          currentExpression = currentExpression.vectorLength();
          break;
        case "timestamptounixmicros":
          currentExpression = currentExpression.timestampToUnixMicros();
          break;
        case "timestamptounixmillis":
          currentExpression = currentExpression.timestampToUnixMillis();
          break;
        case "timestamptounixseconds":
          currentExpression = currentExpression.timestampToUnixSeconds();
          break;
        case "unixmicrostotimestamp":
          currentExpression = currentExpression.unixMicrosToTimestamp();
          break;
        case "unixmillistotimestamp":
          currentExpression = currentExpression.unixMillisToTimestamp();
          break;
        case "unixsecondstotimestamp":
          currentExpression = currentExpression.unixSecondsToTimestamp();
          break;
        default:
          break;
      }
    }
    return currentExpression;
  }

  private String mapOperatorToFunctionName(String operatorName) {
    switch (operatorName) {
      case "==":
      case "=":
      case "EQUAL":
        return "equal";
      case "!=":
      case "<>":
      case "NOT_EQUAL":
        return "not_equal";
      case ">":
      case "GREATER_THAN":
        return "greater_than";
      case ">=":
      case "GREATER_THAN_OR_EQUAL":
        return "greater_than_or_equal";
      case "<":
      case "LESS_THAN":
        return "less_than";
      case "<=":
      case "LESS_THAN_OR_EQUAL":
        return "less_than_or_equal";
      case "ARRAY_CONTAINS":
      case "ARRAY-CONTAINS":
        return "array_contains";
      case "ARRAY_CONTAINS_ANY":
      case "ARRAY-CONTAINS-ANY":
        return "array_contains_any";
      case "ARRAY_CONTAINS_ALL":
      case "ARRAY-CONTAINS-ALL":
        return "array_contains_all";
      case "IN":
      case "EQUAL_ANY":
      case "EQUAL-ANY":
        return "equal_any";
      case "NOT_IN":
      case "NOT_EQUAL_ANY":
      case "NOT-EQUAL-ANY":
        return "not_equal_any";
      default:
        return normalizeExpressionFunctionName(operatorName);
    }
  }

  private Expression buildParsedFunctionExpression(
      ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode function,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression specialized =
        buildSpecialParsedExpressionFunction(function.name, function.args, fieldName);
    if (specialized != null) {
      return specialized;
    }

    Expression[] expressions = new Expression[function.args.size()];
    for (int i = 0; i < function.args.size(); i++) {
      expressions[i] =
          coerceExpressionValueNode(function.args.get(i), fieldName + ".args[" + i + "]");
    }
    return Expression.rawFunction(normalizeExpressionFunctionName(function.name), expressions);
  }

  private Expression buildSpecialParsedExpressionFunction(
      String functionName,
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String normalizedName = canonicalizeExpressionFunctionName(functionName);

    switch (normalizedName) {
      case "array":
        return buildParsedArrayExpression(args, fieldName);
      case "map":
        return buildParsedMapExpression(args, fieldName);
      case "conditional":
        requireParsedArgumentCount(args, 3, functionName, fieldName);
        return Expression.conditional(
            coerceBooleanValueNode(args.get(0), fieldName + ".args[0]"),
            coerceExpressionValueNode(args.get(1), fieldName + ".args[1]"),
            coerceExpressionValueNode(args.get(2), fieldName + ".args[2]"));
      case "currenttimestamp":
        requireParsedArgumentCount(args, 0, functionName, fieldName);
        return Expression.currentTimestamp();
      case "type":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]").type();
      case "collectionid":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]").collectionId();
      case "documentid":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]").documentId();
      case "istype":
        requireParsedArgumentCount(args, 2, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]")
            .type()
            .equal(coerceStringValueNode(args.get(1), fieldName + ".args[1]"));
      case "logicalmaximum":
        return buildParsedLogicalExtremaExpression(true, args, functionName, fieldName);
      case "logicalminimum":
        return buildParsedLogicalExtremaExpression(false, args, functionName, fieldName);
      case "mapget":
        requireParsedArgumentCount(args, 2, functionName, fieldName);
        return buildParsedMapGetExpression(args, fieldName);
      case "mapmerge":
        return buildParsedMapMergeExpression(args, functionName, fieldName);
      case "arraylength":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]").arrayLength();
      case "arrayget":
        requireParsedArgumentCount(args, 2, functionName, fieldName);
        return buildParsedArrayGetExpression(args, fieldName);
      case "arrayconcat":
        return buildParsedArrayConcatExpression(args, functionName, fieldName);
      case "arraysum":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]").arraySum();
      case "vectorlength":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]").vectorLength();
      case "cosinedistance":
        requireParsedArgumentCount(args, 2, functionName, fieldName);
        return buildParsedVectorDistanceExpression("cosineDistance", args, fieldName);
      case "dotproduct":
        requireParsedArgumentCount(args, 2, functionName, fieldName);
        return buildParsedVectorDistanceExpression("dotProduct", args, fieldName);
      case "euclideandistance":
        requireParsedArgumentCount(args, 2, functionName, fieldName);
        return buildParsedVectorDistanceExpression("euclideanDistance", args, fieldName);
      case "timestamptounixmicros":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]")
            .timestampToUnixMicros();
      case "timestamptounixmillis":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]")
            .timestampToUnixMillis();
      case "timestamptounixseconds":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]")
            .timestampToUnixSeconds();
      case "unixmicrostotimestamp":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]")
            .unixMicrosToTimestamp();
      case "unixmillistotimestamp":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]")
            .unixMillisToTimestamp();
      case "unixsecondstotimestamp":
        requireParsedArgumentCount(args, 1, functionName, fieldName);
        return coerceExpressionValueNode(args.get(0), fieldName + ".args[0]")
            .unixSecondsToTimestamp();
      case "timestampadd":
        requireParsedArgumentCount(args, 3, functionName, fieldName);
        return buildParsedTimestampMathExpression(true, args, fieldName);
      case "timestampsubtract":
        requireParsedArgumentCount(args, 3, functionName, fieldName);
        return buildParsedTimestampMathExpression(false, args, fieldName);
      case "timestamptruncate":
        if (args.size() == 2) {
          return buildParsedTimestampTruncateExpression(args, fieldName);
        }
        return null;
      default:
        return null;
    }
  }

  private Expression buildParsedArrayExpression(
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> elements;
    if (args.size() == 1
        && args.get(0) instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) {
      elements =
          ((ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) args.get(0)).values;
    } else {
      elements = args;
    }

    boolean allConstant = true;
    for (ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode element : elements) {
      if (containsParsedExpression(element)) {
        allConstant = false;
        break;
      }
    }

    if (allConstant) {
      java.util.List<Object> resolved = new java.util.ArrayList<>(elements.size());
      for (int i = 0; i < elements.size(); i++) {
        resolved.add(resolveValueNode(elements.get(i), fieldName + ".args[" + i + "]"));
      }
      return constantExpression(resolved);
    }

    Expression[] expressions = new Expression[elements.size()];
    for (int i = 0; i < elements.size(); i++) {
      expressions[i] = coerceExpressionValueNode(elements.get(i), fieldName + ".args[" + i + "]");
    }
    return Expression.rawFunction("array", expressions);
  }

  private Expression buildParsedMapExpression(
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    requireParsedArgumentCount(args, 1, "map", fieldName);
    ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode mapArg = args.get(0);
    if (mapArg instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode) {
      ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode expression =
          ((ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode) mapArg)
              .expression;
      if (expression
          instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode) {
        mapArg =
            ((ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode) expression)
                .value;
      }
    }

    if (!(mapArg instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode)) {
      return null;
    }

    Map<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> entries =
        ((ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode) mapArg).values;
    boolean allConstant = true;
    for (ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value : entries.values()) {
      if (containsParsedExpression(value)) {
        allConstant = false;
        break;
      }
    }

    if (allConstant) {
      Map<String, Object> resolved = new java.util.LinkedHashMap<>();
      for (Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> entry :
          entries.entrySet()) {
        resolved.put(
            entry.getKey(),
            resolveValueNode(entry.getValue(), fieldName + ".args[0]." + entry.getKey()));
      }
      return constantExpression(resolved);
    }

    Expression[] expressions = new Expression[entries.size() * 2];
    int index = 0;
    for (Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> entry :
        entries.entrySet()) {
      expressions[index++] = constantExpression(entry.getKey());
      expressions[index++] =
          coerceExpressionValueNode(entry.getValue(), fieldName + ".args[0]." + entry.getKey());
    }
    return Expression.rawFunction("map", expressions);
  }

  private Expression buildParsedLogicalExtremaExpression(
      boolean maximum,
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args,
      String functionName,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (args.size() < 2) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected "
              + fieldName
              + "."
              + functionName
              + " to include at least 2 arguments.");
    }

    Expression left = coerceExpressionValueNode(args.get(0), fieldName + ".args[0]");
    Expression[] others = new Expression[args.size() - 1];
    for (int i = 1; i < args.size(); i++) {
      others[i - 1] = coerceExpressionValueNode(args.get(i), fieldName + ".args[" + i + "]");
    }
    return maximum ? left.logicalMaximum(others) : left.logicalMinimum(others);
  }

  private Expression buildParsedMapGetExpression(
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression mapExpr = coerceExpressionValueNode(args.get(0), fieldName + ".args[0]");
    if (!containsParsedExpression(args.get(1))) {
      Object keyValue = resolveValueNode(args.get(1), fieldName + ".args[1]");
      if (keyValue instanceof String) {
        return mapExpr.mapGet((String) keyValue);
      }
    }
    return mapExpr.mapGet(coerceExpressionValueNode(args.get(1), fieldName + ".args[1]"));
  }

  private Expression buildParsedMapMergeExpression(
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args,
      String functionName,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (args.size() < 2) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected "
              + fieldName
              + "."
              + functionName
              + " to include at least 2 arguments.");
    }

    Expression left = coerceExpressionValueNode(args.get(0), fieldName + ".args[0]");
    Expression right = coerceExpressionValueNode(args.get(1), fieldName + ".args[1]");
    Expression[] others = new Expression[Math.max(0, args.size() - 2)];
    for (int i = 2; i < args.size(); i++) {
      others[i - 2] = coerceExpressionValueNode(args.get(i), fieldName + ".args[" + i + "]");
    }
    return left.mapMerge(right, others);
  }

  private Expression buildParsedArrayGetExpression(
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression arrayExpr = coerceExpressionValueNode(args.get(0), fieldName + ".args[0]");
    if (!containsParsedExpression(args.get(1))) {
      Object indexValue = resolveValueNode(args.get(1), fieldName + ".args[1]");
      if (indexValue instanceof Number) {
        return arrayExpr.arrayGet(((Number) indexValue).intValue());
      }
    }
    return arrayExpr.arrayGet(coerceExpressionValueNode(args.get(1), fieldName + ".args[1]"));
  }

  private Expression buildParsedArrayConcatExpression(
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args,
      String functionName,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (args.size() < 2) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected "
              + fieldName
              + "."
              + functionName
              + " to include at least 2 arguments.");
    }

    Expression arrayExpr = coerceExpressionValueNode(args.get(0), fieldName + ".args[0]");
    Object secondValue = resolveValueOrExpressionNode(args.get(1), fieldName + ".args[1]");
    Object[] rest = new Object[Math.max(0, args.size() - 2)];
    for (int i = 2; i < args.size(); i++) {
      rest[i - 2] = resolveValueOrExpressionNode(args.get(i), fieldName + ".args[" + i + "]");
    }
    return arrayExpr.arrayConcat(secondValue, rest);
  }

  private Expression buildParsedVectorDistanceExpression(
      String functionName,
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression left = coerceExpressionValueNode(args.get(0), fieldName + ".args[0]");
    if (!containsParsedExpression(args.get(1))) {
      Object rightValue = resolveValueNode(args.get(1), fieldName + ".args[1]");
      if (rightValue instanceof List
          || (rightValue instanceof Map && ((Map<?, ?>) rightValue).get("values") != null)) {
        double[] vector = coerceVectorValue(rightValue);
        switch (functionName) {
          case "cosineDistance":
            return left.cosineDistance(vector);
          case "dotProduct":
            return left.dotProduct(vector);
          default:
            return left.euclideanDistance(vector);
        }
      }
    }

    Expression right = coerceExpressionValueNode(args.get(1), fieldName + ".args[1]");
    switch (functionName) {
      case "cosineDistance":
        return left.cosineDistance(right);
      case "dotProduct":
        return left.dotProduct(right);
      default:
        return left.euclideanDistance(right);
    }
  }

  private Expression buildParsedTimestampMathExpression(
      boolean addition,
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression base = coerceExpressionValueNode(args.get(0), fieldName + ".args[0]");
    if (!containsParsedExpression(args.get(1)) && !containsParsedExpression(args.get(2))) {
      Object unitValue = resolveValueNode(args.get(1), fieldName + ".args[1]");
      Object amountValue = resolveValueNode(args.get(2), fieldName + ".args[2]");
      if (unitValue instanceof String && amountValue instanceof Number) {
        long amount = ((Number) amountValue).longValue();
        return addition
            ? base.timestampAdd((String) unitValue, amount)
            : base.timestampSubtract((String) unitValue, amount);
      }
    }

    Expression unitExpression = coerceExpressionValueNode(args.get(1), fieldName + ".args[1]");
    Expression amountExpression = coerceExpressionValueNode(args.get(2), fieldName + ".args[2]");
    return addition
        ? base.timestampAdd(unitExpression, amountExpression)
        : base.timestampSubtract(unitExpression, amountExpression);
  }

  private Expression buildParsedTimestampTruncateExpression(
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Expression base = coerceExpressionValueNode(args.get(0), fieldName + ".args[0]");
    if (!containsParsedExpression(args.get(1))) {
      Object granularityValue = resolveValueNode(args.get(1), fieldName + ".args[1]");
      if (granularityValue instanceof String) {
        return base.timestampTruncate((String) granularityValue);
      }
    }
    return base.timestampTruncate(coerceExpressionValueNode(args.get(1), fieldName + ".args[1]"));
  }

  private void requireParsedArgumentCount(
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args,
      int expectedCount,
      String functionName,
      String fieldName)
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

  private Expression coerceExpressionValueNode(
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    return coerceExpressionValue(serializeValueNode(value), fieldName);
  }

  private BooleanExpression coerceBooleanValueNode(
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    return coerceBooleanValue(serializeValueNode(value), fieldName);
  }

  private String coerceStringValueNode(
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    return coerceStringValue(serializeValueNode(value), fieldName);
  }

  private Object resolveValueOrExpressionNode(
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    return resolveValueOrExpression(serializeValueNode(value), fieldName);
  }

  private Object resolveValueNode(
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    ResolvedValueBox rootBox = new ResolvedValueBox();
    java.util.ArrayDeque<ValueResolutionFrame> stack = new java.util.ArrayDeque<>();
    stack.push(new EnterValueResolutionFrame(value, fieldName, rootBox));

    while (!stack.isEmpty()) {
      ValueResolutionFrame frame = stack.pop();
      if (frame instanceof EnterValueResolutionFrame) {
        EnterValueResolutionFrame enterFrame = (EnterValueResolutionFrame) frame;
        ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode currentValue = enterFrame.value;
        String currentFieldName = enterFrame.fieldName;

        if (currentValue instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) {
          enterFrame.box.value =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) currentValue)
                  .value;
          continue;
        }

        if (currentValue
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode) {
          ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode expression =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode) currentValue)
                  .expression;
          if (expression
              instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode) {
            stack.push(
                new EnterValueResolutionFrame(
                    ((ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode)
                            expression)
                        .value,
                    currentFieldName,
                    enterFrame.box));
            continue;
          }
          enterFrame.box.value = coerceExpression(expression, currentFieldName);
          continue;
        }

        if (currentValue instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) {
          List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) currentValue).values;
          List<ResolvedValueBox> childBoxes = new java.util.ArrayList<>(values.size());
          for (int i = 0; i < values.size(); i++) {
            childBoxes.add(new ResolvedValueBox());
          }
          stack.push(new ExitListValueResolutionFrame(enterFrame.box, childBoxes));
          for (int i = values.size() - 1; i >= 0; i--) {
            stack.push(
                new EnterValueResolutionFrame(
                    values.get(i), currentFieldName + "[" + i + "]", childBoxes.get(i)));
          }
          continue;
        }

        if (currentValue instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode) {
          Map<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode) currentValue).values;
          List<Map.Entry<String, ResolvedValueBox>> entries = new java.util.ArrayList<>(values.size());
          stack.push(new ExitMapValueResolutionFrame(enterFrame.box, entries));
          List<Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode>>
              pendingEntries = new java.util.ArrayList<>(values.entrySet());
          for (Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> entry :
              pendingEntries) {
            ResolvedValueBox childBox = new ResolvedValueBox();
            entries.add(new java.util.AbstractMap.SimpleEntry<>(entry.getKey(), childBox));
          }
          for (int i = pendingEntries.size() - 1; i >= 0; i--) {
            Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> entry =
                pendingEntries.get(i);
            stack.push(
                new EnterValueResolutionFrame(
                    entry.getValue(),
                    currentFieldName + "." + entry.getKey(),
                    entries.get(i).getValue()));
          }
          continue;
        }

        enterFrame.box.value = null;
        continue;
      }

      if (frame instanceof ExitListValueResolutionFrame) {
        ExitListValueResolutionFrame exitFrame = (ExitListValueResolutionFrame) frame;
        List<Object> output = new java.util.ArrayList<>(exitFrame.childBoxes.size());
        for (ResolvedValueBox childBox : exitFrame.childBoxes) {
          output.add(childBox.value);
        }
        exitFrame.box.value = output;
        continue;
      }

      ExitMapValueResolutionFrame exitFrame = (ExitMapValueResolutionFrame) frame;
      Map<String, Object> output = new java.util.LinkedHashMap<>();
      for (Map.Entry<String, ResolvedValueBox> entry : exitFrame.entries) {
        output.put(entry.getKey(), entry.getValue().value);
      }
      exitFrame.box.value = output;
    }

    return rootBox.value;
  }

  private boolean containsParsedExpression(
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value) {
    java.util.ArrayDeque<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> stack =
        new java.util.ArrayDeque<>();
    stack.push(value);

    while (!stack.isEmpty()) {
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode currentValue = stack.pop();
      if (currentValue
          instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode) {
        ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode expression =
            ((ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode) currentValue)
                .expression;
        if (expression
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode) {
          stack.push(
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode) expression)
                  .value);
          continue;
        }
        return true;
      }

      if (currentValue instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) {
        List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
            ((ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) currentValue).values;
        for (int i = values.size() - 1; i >= 0; i--) {
          stack.push(values.get(i));
        }
        continue;
      }

      if (currentValue instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode) {
        for (ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode entry :
            ((ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode) currentValue)
                .values
                .values()) {
          stack.push(entry);
        }
      }
    }

    return false;
  }

  private Object serializeExpressionNode(
      ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode value) {
    SerializedExpressionBox rootBox = new SerializedExpressionBox();
    ArrayDeque<SerializationFrame> stack = new ArrayDeque<>();
    stack.push(new EnterSerializedExpressionFrame(value, rootBox));

    while (!stack.isEmpty()) {
      SerializationFrame frame = stack.pop();
      if (frame instanceof EnterSerializedExpressionFrame) {
        EnterSerializedExpressionFrame enterFrame = (EnterSerializedExpressionFrame) frame;
        ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode expression = enterFrame.value;

        if (expression
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedFieldExpressionNode) {
          Map<String, Object> output = new LinkedHashMap<>();
          output.put("__kind", "expression");
          output.put("exprType", "Field");
          output.put(
              "path",
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedFieldExpressionNode) expression)
                  .path);
          enterFrame.box.value = output;
          continue;
        }

        if (expression
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode) {
          SerializedValueBox valueBox = new SerializedValueBox();
          stack.push(new ExitSerializedExpressionConstantFrame(enterFrame.box, valueBox));
          stack.push(
              new EnterSerializedValueFrame(
                  ((ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode)
                          expression)
                      .value,
                  valueBox));
          continue;
        }

        ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode function =
            (ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode) expression;
        List<SerializedValueBox> argBoxes = new ArrayList<>(function.args.size());
        for (int i = 0; i < function.args.size(); i++) {
          argBoxes.add(new SerializedValueBox());
        }
        stack.push(new ExitSerializedExpressionFunctionFrame(enterFrame.box, function.name, argBoxes));
        for (int i = function.args.size() - 1; i >= 0; i--) {
          stack.push(new EnterSerializedValueFrame(function.args.get(i), argBoxes.get(i)));
        }
        continue;
      }

      if (frame instanceof ExitSerializedExpressionFunctionFrame) {
        ExitSerializedExpressionFunctionFrame exitFrame =
            (ExitSerializedExpressionFunctionFrame) frame;
        Map<String, Object> output = new LinkedHashMap<>();
        output.put("__kind", "expression");
        output.put("exprType", "Function");
        output.put("name", exitFrame.name);
        List<Object> args = new ArrayList<>(exitFrame.argBoxes.size());
        for (SerializedValueBox argBox : exitFrame.argBoxes) {
          args.add(argBox.value);
        }
        output.put("args", args);
        exitFrame.box.value = output;
        continue;
      }

      if (frame instanceof EnterSerializedValueFrame) {
        EnterSerializedValueFrame enterFrame = (EnterSerializedValueFrame) frame;
        ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode currentValue = enterFrame.value;

        if (currentValue instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) {
          enterFrame.box.value =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) currentValue)
                  .value;
          continue;
        }

        if (currentValue instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) {
          List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) currentValue).values;
          List<SerializedValueBox> childBoxes = new ArrayList<>(values.size());
          for (int i = 0; i < values.size(); i++) {
            childBoxes.add(new SerializedValueBox());
          }
          stack.push(new ExitSerializedValueListFrame(enterFrame.box, childBoxes));
          for (int i = values.size() - 1; i >= 0; i--) {
            stack.push(new EnterSerializedValueFrame(values.get(i), childBoxes.get(i)));
          }
          continue;
        }

        if (currentValue instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode) {
          Map<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode) currentValue).values;
          List<Map.Entry<String, SerializedValueBox>> entries = new ArrayList<>(values.size());
          stack.push(new ExitSerializedValueMapFrame(enterFrame.box, entries));
          List<Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode>>
              pendingEntries = new ArrayList<>(values.entrySet());
          for (Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> entry :
              pendingEntries) {
            SerializedValueBox childBox = new SerializedValueBox();
            entries.add(new java.util.AbstractMap.SimpleEntry<>(entry.getKey(), childBox));
          }
          for (int i = pendingEntries.size() - 1; i >= 0; i--) {
            Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> entry =
                pendingEntries.get(i);
            stack.push(new EnterSerializedValueFrame(entry.getValue(), entries.get(i).getValue()));
          }
          continue;
        }

        SerializedExpressionBox expressionBox = new SerializedExpressionBox();
        stack.push(new ExitSerializedValueExpressionFrame(enterFrame.box, expressionBox));
        stack.push(
            new EnterSerializedExpressionFrame(
                ((ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode) currentValue)
                    .expression,
                expressionBox));
        continue;
      }

      if (frame instanceof ExitSerializedValueListFrame) {
        ExitSerializedValueListFrame exitFrame = (ExitSerializedValueListFrame) frame;
        List<Object> output = new ArrayList<>(exitFrame.childBoxes.size());
        for (SerializedValueBox childBox : exitFrame.childBoxes) {
          output.add(childBox.value);
        }
        exitFrame.box.value = output;
        continue;
      }

      if (frame instanceof ExitSerializedValueMapFrame) {
        ExitSerializedValueMapFrame exitFrame = (ExitSerializedValueMapFrame) frame;
        Map<String, Object> output = new LinkedHashMap<>();
        for (Map.Entry<String, SerializedValueBox> entry : exitFrame.entries) {
          output.put(entry.getKey(), entry.getValue().value);
        }
        exitFrame.box.value = output;
        continue;
      }

      if (frame instanceof ExitSerializedExpressionConstantFrame) {
        ExitSerializedExpressionConstantFrame exitFrame =
            (ExitSerializedExpressionConstantFrame) frame;
        Map<String, Object> output = new LinkedHashMap<>();
        output.put("__kind", "expression");
        output.put("exprType", "constant");
        output.put("value", exitFrame.valueBox.value);
        exitFrame.expressionBox.value = output;
        continue;
      }

      ExitSerializedValueExpressionFrame exitFrame = (ExitSerializedValueExpressionFrame) frame;
      exitFrame.valueBox.value = exitFrame.expressionBox.value;
    }

    return rootBox.value;
  }

  private Object serializeValueNode(ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value) {
    SerializedValueBox rootBox = new SerializedValueBox();
    ArrayDeque<SerializationFrame> stack = new ArrayDeque<>();
    stack.push(new EnterSerializedValueFrame(value, rootBox));

    while (!stack.isEmpty()) {
      SerializationFrame frame = stack.pop();
      if (frame instanceof EnterSerializedValueFrame) {
        EnterSerializedValueFrame enterFrame = (EnterSerializedValueFrame) frame;
        ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode currentValue = enterFrame.value;

        if (currentValue instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) {
          enterFrame.box.value =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) currentValue)
                  .value;
          continue;
        }

        if (currentValue instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) {
          List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) currentValue).values;
          List<SerializedValueBox> childBoxes = new ArrayList<>(values.size());
          for (int i = 0; i < values.size(); i++) {
            childBoxes.add(new SerializedValueBox());
          }
          stack.push(new ExitSerializedValueListFrame(enterFrame.box, childBoxes));
          for (int i = values.size() - 1; i >= 0; i--) {
            stack.push(new EnterSerializedValueFrame(values.get(i), childBoxes.get(i)));
          }
          continue;
        }

        if (currentValue instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode) {
          Map<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedMapValueNode) currentValue).values;
          List<Map.Entry<String, SerializedValueBox>> entries = new ArrayList<>(values.size());
          stack.push(new ExitSerializedValueMapFrame(enterFrame.box, entries));
          List<Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode>>
              pendingEntries = new ArrayList<>(values.entrySet());
          for (Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> entry :
              pendingEntries) {
            SerializedValueBox childBox = new SerializedValueBox();
            entries.add(new java.util.AbstractMap.SimpleEntry<>(entry.getKey(), childBox));
          }
          for (int i = pendingEntries.size() - 1; i >= 0; i--) {
            Map.Entry<String, ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> entry =
                pendingEntries.get(i);
            stack.push(new EnterSerializedValueFrame(entry.getValue(), entries.get(i).getValue()));
          }
          continue;
        }

        SerializedExpressionBox expressionBox = new SerializedExpressionBox();
        stack.push(new ExitSerializedValueExpressionFrame(enterFrame.box, expressionBox));
        stack.push(
            new EnterSerializedExpressionFrame(
                ((ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode) currentValue)
                    .expression,
                expressionBox));
        continue;
      }

      if (frame instanceof ExitSerializedValueListFrame) {
        ExitSerializedValueListFrame exitFrame = (ExitSerializedValueListFrame) frame;
        List<Object> output = new ArrayList<>(exitFrame.childBoxes.size());
        for (SerializedValueBox childBox : exitFrame.childBoxes) {
          output.add(childBox.value);
        }
        exitFrame.box.value = output;
        continue;
      }

      if (frame instanceof ExitSerializedValueMapFrame) {
        ExitSerializedValueMapFrame exitFrame = (ExitSerializedValueMapFrame) frame;
        Map<String, Object> output = new LinkedHashMap<>();
        for (Map.Entry<String, SerializedValueBox> entry : exitFrame.entries) {
          output.put(entry.getKey(), entry.getValue().value);
        }
        exitFrame.box.value = output;
        continue;
      }

      if (frame instanceof EnterSerializedExpressionFrame) {
        EnterSerializedExpressionFrame enterFrame = (EnterSerializedExpressionFrame) frame;
        ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode expression = enterFrame.value;

        if (expression
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedFieldExpressionNode) {
          Map<String, Object> output = new LinkedHashMap<>();
          output.put("__kind", "expression");
          output.put("exprType", "Field");
          output.put(
              "path",
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedFieldExpressionNode) expression)
                  .path);
          enterFrame.box.value = output;
          continue;
        }

        if (expression
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode) {
          SerializedValueBox valueBox = new SerializedValueBox();
          stack.push(new ExitSerializedExpressionConstantFrame(enterFrame.box, valueBox));
          stack.push(
              new EnterSerializedValueFrame(
                  ((ReactNativeFirebaseFirestorePipelineParser.ParsedConstantExpressionNode)
                          expression)
                      .value,
                  valueBox));
          continue;
        }

        ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode function =
            (ReactNativeFirebaseFirestorePipelineParser.ParsedFunctionExpressionNode) expression;
        List<SerializedValueBox> argBoxes = new ArrayList<>(function.args.size());
        for (int i = 0; i < function.args.size(); i++) {
          argBoxes.add(new SerializedValueBox());
        }
        stack.push(new ExitSerializedExpressionFunctionFrame(enterFrame.box, function.name, argBoxes));
        for (int i = function.args.size() - 1; i >= 0; i--) {
          stack.push(new EnterSerializedValueFrame(function.args.get(i), argBoxes.get(i)));
        }
        continue;
      }

      if (frame instanceof ExitSerializedExpressionFunctionFrame) {
        ExitSerializedExpressionFunctionFrame exitFrame =
            (ExitSerializedExpressionFunctionFrame) frame;
        Map<String, Object> output = new LinkedHashMap<>();
        output.put("__kind", "expression");
        output.put("exprType", "Function");
        output.put("name", exitFrame.name);
        List<Object> args = new ArrayList<>(exitFrame.argBoxes.size());
        for (SerializedValueBox argBox : exitFrame.argBoxes) {
          args.add(argBox.value);
        }
        output.put("args", args);
        exitFrame.box.value = output;
        continue;
      }

      if (frame instanceof ExitSerializedExpressionConstantFrame) {
        ExitSerializedExpressionConstantFrame exitFrame =
            (ExitSerializedExpressionConstantFrame) frame;
        Map<String, Object> output = new LinkedHashMap<>();
        output.put("__kind", "expression");
        output.put("exprType", "constant");
        output.put("value", exitFrame.valueBox.value);
        exitFrame.expressionBox.value = output;
        continue;
      }

      ExitSerializedValueExpressionFrame exitFrame = (ExitSerializedValueExpressionFrame) frame;
      exitFrame.valueBox.value = exitFrame.expressionBox.value;
    }

    return rootBox.value;
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
      return Expression.Companion.toExprOrConstant$com_google_firebase_firebase_firestore(value);
    }

    return Expression.Companion.toExprOrConstant$com_google_firebase_firebase_firestore(value);
  }

  private BooleanExpression booleanExpressionFromParsedFunction(
      String functionName,
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String normalizedName = functionName.toLowerCase(Locale.ROOT);

    if ("and".equals(normalizedName) || "or".equals(normalizedName)) {
      if (args == null || args.isEmpty()) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected " + fieldName + ".args to contain boolean expressions.");
      }

      BooleanExpression[] expressions = new BooleanExpression[args.size()];
      for (int i = 0; i < args.size(); i++) {
        expressions[i] = coerceBooleanValueNode(args.get(i), fieldName + ".args[" + i + "]");
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

      Expression left = coerceExpressionValueNode(args.get(0), fieldName + ".args[0]");

      if ("equal".equals(normalizedName)) {
        return applyParsedComparison(left::equal, args.get(1), fieldName + ".args[1]");
      }
      if ("notequal".equals(normalizedName)) {
        return applyParsedComparison(left::notEqual, args.get(1), fieldName + ".args[1]");
      }
      if ("greaterthan".equals(normalizedName)) {
        return applyParsedComparison(left::greaterThan, args.get(1), fieldName + ".args[1]");
      }
      if ("greaterthanorequal".equals(normalizedName)) {
        return applyParsedComparison(left::greaterThanOrEqual, args.get(1), fieldName + ".args[1]");
      }
      if ("lessthan".equals(normalizedName)) {
        return applyParsedComparison(left::lessThan, args.get(1), fieldName + ".args[1]");
      }
      if ("lessthanorequal".equals(normalizedName)) {
        return applyParsedComparison(left::lessThanOrEqual, args.get(1), fieldName + ".args[1]");
      }
      if ("arraycontains".equals(normalizedName)) {
        return applyParsedArrayContains(left, args.get(1), fieldName + ".args[1]");
      }
      if ("arraycontainsany".equals(normalizedName)) {
        return applyParsedArrayContainsAny(left, args.get(1), fieldName + ".args[1]");
      }
      if ("arraycontainsall".equals(normalizedName)) {
        return applyParsedArrayContainsAll(left, args.get(1), fieldName + ".args[1]");
      }
      if ("equalany".equals(normalizedName)) {
        if (!containsParsedExpression(args.get(1))) {
          Object right = resolveValueNode(args.get(1), fieldName + ".args[1]");
          if (right instanceof List) {
            return left.equalAny((List<?>) right);
          }
        }
        return left.equalAny(coerceExpressionValueNode(args.get(1), fieldName + ".args[1]"));
      }
      if ("notequalany".equals(normalizedName)) {
        if (!containsParsedExpression(args.get(1))) {
          Object right = resolveValueNode(args.get(1), fieldName + ".args[1]");
          if (right instanceof List) {
            return left.notEqualAny((List<?>) right);
          }
        }
        return left.notEqualAny(coerceExpressionValueNode(args.get(1), fieldName + ".args[1]"));
      }
    }

    Expression[] expressions = new Expression[args.size()];
    for (int i = 0; i < args.size(); i++) {
      expressions[i] = coerceExpressionValueNode(args.get(i), fieldName + ".args[" + i + "]");
    }
    return BooleanExpression.rawFunction(
        normalizeExpressionFunctionName(functionName), expressions);
  }

  private BooleanExpression applyParsedComparison(
      ComparisonFn fn,
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (containsParsedExpression(value)) {
      return fn.apply(coerceExpressionValueNode(value, fieldName));
    }
    return fn.apply(resolveValueNode(value, fieldName));
  }

  private BooleanExpression applyParsedArrayContains(
      Expression expression,
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (containsParsedExpression(value)) {
      return expression.arrayContains(coerceExpressionValueNode(value, fieldName + ".value"));
    }
    return expression.arrayContains(resolveValueNode(value, fieldName));
  }

  private BooleanExpression applyParsedArrayContainsAny(
      Expression expression,
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!containsParsedExpression(value)) {
      Object resolved = resolveValueNode(value, fieldName);
      if (resolved instanceof List) {
        return expression.arrayContainsAny((List<?>) resolved);
      }
    }
    return expression.arrayContainsAny(coerceExpressionValueNode(value, fieldName + ".value"));
  }

  private BooleanExpression applyParsedArrayContainsAll(
      Expression expression,
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!containsParsedExpression(value)) {
      Object resolved = resolveValueNode(value, fieldName);
      if (resolved instanceof List) {
        return expression.arrayContainsAll((List<?>) resolved);
      }
    }
    return expression.arrayContainsAll(coerceExpressionValueNode(value, fieldName + ".value"));
  }

  private AggregateFunction buildAggregateFunction(
      ReactNativeFirebaseFirestorePipelineParser.ParsedAggregateNode aggregate, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String normalizedKind = aggregate.kind.toLowerCase(Locale.ROOT);
    ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode expressionValue =
        aggregate.primaryValue;
    if (expressionValue == null && aggregate.args != null && !aggregate.args.isEmpty()) {
      expressionValue = aggregate.args.get(0);
    }

    switch (normalizedKind) {
      case "countall":
      case "count_all":
        return AggregateFunction.countAll();
      case "count":
        if (expressionValue == null) {
          return AggregateFunction.countAll();
        }
        return aggregateWithParsedValue(
            expressionValue, AggregateFunction::count, AggregateFunction::count, fieldName);
      case "countif":
      case "count_if":
        if (expressionValue == null) {
          throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
              "pipelineExecute() expected " + fieldName + ".expr for countIf aggregate.");
        }
        return AggregateFunction.countIf(
            coerceBooleanValueNode(expressionValue, fieldName + ".expr"));
      case "sum":
        return aggregateWithParsedValue(
            expressionValue, AggregateFunction::sum, AggregateFunction::sum, fieldName);
      case "avg":
      case "average":
        return aggregateWithParsedValue(
            expressionValue, AggregateFunction::average, AggregateFunction::average, fieldName);
      case "min":
      case "minimum":
        return aggregateWithParsedValue(
            expressionValue, AggregateFunction::minimum, AggregateFunction::minimum, fieldName);
      case "max":
      case "maximum":
        return aggregateWithParsedValue(
            expressionValue, AggregateFunction::maximum, AggregateFunction::maximum, fieldName);
      case "countdistinct":
      case "count_distinct":
        return aggregateWithParsedValue(
            expressionValue,
            AggregateFunction::countDistinct,
            AggregateFunction::countDistinct,
            fieldName);
      default:
        List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> args =
            aggregate.args != null ? aggregate.args : new java.util.ArrayList<>();
        Expression[] expressions = new Expression[args.size()];
        for (int i = 0; i < args.size(); i++) {
          expressions[i] = coerceExpressionValueNode(args.get(i), fieldName + ".args[" + i + "]");
        }
        return AggregateFunction.rawAggregate(
            normalizeExpressionFunctionName(aggregate.kind), expressions);
    }
  }

  private AggregateFunction aggregateWithParsedValue(
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value,
      AggregateWithString withString,
      AggregateWithExpression withExpression,
      String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value == null) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + ".expr to be provided.");
    }

    if (!containsParsedExpression(value)) {
      Object resolved = resolveValueNode(value, fieldName + ".expr");
      if (resolved instanceof String) {
        return withString.apply((String) resolved);
      }
    }
    return withExpression.apply(coerceExpressionValueNode(value, fieldName + ".expr"));
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
