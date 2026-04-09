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

  private static final class LoweredExpressionBox {
    Expression value;
  }

  private static final class LoweredObjectBox {
    Object value;
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

  private interface ObjectLoweringFrame {}

  private static final class ReceiverChainSeed {
    final Object baseValue;
    final String baseFieldName;
    final List<PendingReceiverOperation> pendingOperations;

    ReceiverChainSeed(
        Object baseValue, String baseFieldName, List<PendingReceiverOperation> pendingOperations) {
      this.baseValue = baseValue;
      this.baseFieldName = baseFieldName;
      this.pendingOperations = pendingOperations;
    }
  }

  private static final class EnterObjectExpressionFrame implements ObjectLoweringFrame {
    final Object value;
    final String fieldName;
    final LoweredExpressionBox box;

    EnterObjectExpressionFrame(Object value, String fieldName, LoweredExpressionBox box) {
      this.value = value;
      this.fieldName = fieldName;
      this.box = box;
    }
  }

  private static final class EnterObjectBooleanFrame implements ObjectLoweringFrame {
    final Object value;
    final String fieldName;
    final LoweredBooleanBox box;

    EnterObjectBooleanFrame(Object value, String fieldName, LoweredBooleanBox box) {
      this.value = value;
      this.fieldName = fieldName;
      this.box = box;
    }
  }

  private static final class EnterObjectExpressionValueFrame implements ObjectLoweringFrame {
    final Object value;
    final String fieldName;
    final LoweredExpressionBox box;

    EnterObjectExpressionValueFrame(Object value, String fieldName, LoweredExpressionBox box) {
      this.value = value;
      this.fieldName = fieldName;
      this.box = box;
    }
  }

  private static final class EnterObjectBooleanValueFrame implements ObjectLoweringFrame {
    final Object value;
    final String fieldName;
    final LoweredBooleanBox box;

    EnterObjectBooleanValueFrame(Object value, String fieldName, LoweredBooleanBox box) {
      this.value = value;
      this.fieldName = fieldName;
      this.box = box;
    }
  }

  private static final class EnterObjectValueOrExpressionFrame implements ObjectLoweringFrame {
    final Object value;
    final String fieldName;
    final LoweredObjectBox box;

    EnterObjectValueOrExpressionFrame(Object value, String fieldName, LoweredObjectBox box) {
      this.value = value;
      this.fieldName = fieldName;
      this.box = box;
    }
  }

  private static final class EnterObjectVectorExpressionValueFrame implements ObjectLoweringFrame {
    final Object value;
    final String fieldName;
    final LoweredExpressionBox box;

    EnterObjectVectorExpressionValueFrame(
        Object value, String fieldName, LoweredExpressionBox box) {
      this.value = value;
      this.fieldName = fieldName;
      this.box = box;
    }
  }

  private static final class ExitApplyPendingUnaryFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final LoweredExpressionBox childBox;
    final List<String> pendingUnaryFunctions;

    ExitApplyPendingUnaryFrame(
        LoweredExpressionBox box,
        LoweredExpressionBox childBox,
        List<String> pendingUnaryFunctions) {
      this.box = box;
      this.childBox = childBox;
      this.pendingUnaryFunctions = pendingUnaryFunctions;
    }
  }

  private static final class ExitApplyPendingUnaryBooleanFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final LoweredBooleanBox childBox;
    final List<String> pendingUnaryFunctions;

    ExitApplyPendingUnaryBooleanFrame(
        LoweredExpressionBox box, LoweredBooleanBox childBox, List<String> pendingUnaryFunctions) {
      this.box = box;
      this.childBox = childBox;
      this.pendingUnaryFunctions = pendingUnaryFunctions;
    }
  }

  private static final class ExitCastExpressionToBooleanFrame implements ObjectLoweringFrame {
    final LoweredBooleanBox box;
    final LoweredExpressionBox expressionBox;
    final String fieldName;

    ExitCastExpressionToBooleanFrame(
        LoweredBooleanBox box, LoweredExpressionBox expressionBox, String fieldName) {
      this.box = box;
      this.expressionBox = expressionBox;
      this.fieldName = fieldName;
    }
  }

  private static final class ExitSetObjectFromExpressionFrame implements ObjectLoweringFrame {
    final LoweredObjectBox box;
    final LoweredExpressionBox expressionBox;

    ExitSetObjectFromExpressionFrame(LoweredObjectBox box, LoweredExpressionBox expressionBox) {
      this.box = box;
      this.expressionBox = expressionBox;
    }
  }

  private static final class ExitObjectConditionalExpressionFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final LoweredBooleanBox conditionBox;
    final LoweredExpressionBox trueBox;
    final LoweredExpressionBox falseBox;

    ExitObjectConditionalExpressionFrame(
        LoweredExpressionBox box,
        LoweredBooleanBox conditionBox,
        LoweredExpressionBox trueBox,
        LoweredExpressionBox falseBox) {
      this.box = box;
      this.conditionBox = conditionBox;
      this.trueBox = trueBox;
      this.falseBox = falseBox;
    }
  }

  private static final class ExitObjectIsTypeExpressionFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final LoweredExpressionBox expressionBox;
    final String typeName;

    ExitObjectIsTypeExpressionFrame(
        LoweredExpressionBox box, LoweredExpressionBox expressionBox, String typeName) {
      this.box = box;
      this.expressionBox = expressionBox;
      this.typeName = typeName;
    }
  }

  private static final class ExitObjectArrayExpressionFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final List<LoweredExpressionBox> childBoxes;

    ExitObjectArrayExpressionFrame(
        LoweredExpressionBox box, List<LoweredExpressionBox> childBoxes) {
      this.box = box;
      this.childBoxes = childBoxes;
    }
  }

  private static final class ExitObjectMapExpressionFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final List<Map.Entry<String, LoweredExpressionBox>> entries;

    ExitObjectMapExpressionFrame(
        LoweredExpressionBox box, List<Map.Entry<String, LoweredExpressionBox>> entries) {
      this.box = box;
      this.entries = entries;
    }
  }

  private static final class ExitObjectRawExpressionFunctionFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final String functionName;
    final List<LoweredExpressionBox> childBoxes;

    ExitObjectRawExpressionFunctionFrame(
        LoweredExpressionBox box, String functionName, List<LoweredExpressionBox> childBoxes) {
      this.box = box;
      this.functionName = functionName;
      this.childBoxes = childBoxes;
    }
  }

  private static final class ExitObjectRawBooleanFunctionFrame implements ObjectLoweringFrame {
    final LoweredBooleanBox box;
    final String functionName;
    final List<LoweredExpressionBox> childBoxes;

    ExitObjectRawBooleanFunctionFrame(
        LoweredBooleanBox box, String functionName, List<LoweredExpressionBox> childBoxes) {
      this.box = box;
      this.functionName = functionName;
      this.childBoxes = childBoxes;
    }
  }

  private static final class ContinueReceiverExpressionChainFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final LoweredExpressionBox baseBox;
    final List<PendingReceiverOperation> pendingOperations;
    final int nextIndex;
    final Expression currentExpression;

    ContinueReceiverExpressionChainFrame(
        LoweredExpressionBox box,
        LoweredExpressionBox baseBox,
        List<PendingReceiverOperation> pendingOperations,
        int nextIndex,
        Expression currentExpression) {
      this.box = box;
      this.baseBox = baseBox;
      this.pendingOperations = pendingOperations;
      this.nextIndex = nextIndex;
      this.currentExpression = currentExpression;
    }
  }

  private static final class ExitReceiverLogicalExtremaFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final List<PendingReceiverOperation> pendingOperations;
    final int nextIndex;
    final Expression currentExpression;
    final boolean maximum;
    final List<LoweredExpressionBox> childBoxes;

    ExitReceiverLogicalExtremaFrame(
        LoweredExpressionBox box,
        List<PendingReceiverOperation> pendingOperations,
        int nextIndex,
        Expression currentExpression,
        boolean maximum,
        List<LoweredExpressionBox> childBoxes) {
      this.box = box;
      this.pendingOperations = pendingOperations;
      this.nextIndex = nextIndex;
      this.currentExpression = currentExpression;
      this.maximum = maximum;
      this.childBoxes = childBoxes;
    }
  }

  private static final class ExitReceiverMapGetFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final List<PendingReceiverOperation> pendingOperations;
    final int nextIndex;
    final Expression currentExpression;
    final LoweredExpressionBox keyBox;

    ExitReceiverMapGetFrame(
        LoweredExpressionBox box,
        List<PendingReceiverOperation> pendingOperations,
        int nextIndex,
        Expression currentExpression,
        LoweredExpressionBox keyBox) {
      this.box = box;
      this.pendingOperations = pendingOperations;
      this.nextIndex = nextIndex;
      this.currentExpression = currentExpression;
      this.keyBox = keyBox;
    }
  }

  private static final class ExitReceiverMapMergeFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final List<PendingReceiverOperation> pendingOperations;
    final int nextIndex;
    final Expression currentExpression;
    final List<LoweredExpressionBox> childBoxes;

    ExitReceiverMapMergeFrame(
        LoweredExpressionBox box,
        List<PendingReceiverOperation> pendingOperations,
        int nextIndex,
        Expression currentExpression,
        List<LoweredExpressionBox> childBoxes) {
      this.box = box;
      this.pendingOperations = pendingOperations;
      this.nextIndex = nextIndex;
      this.currentExpression = currentExpression;
      this.childBoxes = childBoxes;
    }
  }

  private static final class ExitReceiverArrayGetFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final List<PendingReceiverOperation> pendingOperations;
    final int nextIndex;
    final Expression currentExpression;
    final LoweredExpressionBox indexBox;

    ExitReceiverArrayGetFrame(
        LoweredExpressionBox box,
        List<PendingReceiverOperation> pendingOperations,
        int nextIndex,
        Expression currentExpression,
        LoweredExpressionBox indexBox) {
      this.box = box;
      this.pendingOperations = pendingOperations;
      this.nextIndex = nextIndex;
      this.currentExpression = currentExpression;
      this.indexBox = indexBox;
    }
  }

  private static final class ExitReceiverArrayConcatFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final List<PendingReceiverOperation> pendingOperations;
    final int nextIndex;
    final Expression currentExpression;
    final List<LoweredObjectBox> childBoxes;

    ExitReceiverArrayConcatFrame(
        LoweredExpressionBox box,
        List<PendingReceiverOperation> pendingOperations,
        int nextIndex,
        Expression currentExpression,
        List<LoweredObjectBox> childBoxes) {
      this.box = box;
      this.pendingOperations = pendingOperations;
      this.nextIndex = nextIndex;
      this.currentExpression = currentExpression;
      this.childBoxes = childBoxes;
    }
  }

  private static final class ExitReceiverVectorDistanceFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final List<PendingReceiverOperation> pendingOperations;
    final int nextIndex;
    final Expression currentExpression;
    final String normalizedName;
    final LoweredExpressionBox rightBox;

    ExitReceiverVectorDistanceFrame(
        LoweredExpressionBox box,
        List<PendingReceiverOperation> pendingOperations,
        int nextIndex,
        Expression currentExpression,
        String normalizedName,
        LoweredExpressionBox rightBox) {
      this.box = box;
      this.pendingOperations = pendingOperations;
      this.nextIndex = nextIndex;
      this.currentExpression = currentExpression;
      this.normalizedName = normalizedName;
      this.rightBox = rightBox;
    }
  }

  private static final class ExitReceiverTimestampMathFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final List<PendingReceiverOperation> pendingOperations;
    final int nextIndex;
    final Expression currentExpression;
    final String normalizedName;
    final LoweredExpressionBox unitBox;
    final LoweredExpressionBox amountBox;

    ExitReceiverTimestampMathFrame(
        LoweredExpressionBox box,
        List<PendingReceiverOperation> pendingOperations,
        int nextIndex,
        Expression currentExpression,
        String normalizedName,
        LoweredExpressionBox unitBox,
        LoweredExpressionBox amountBox) {
      this.box = box;
      this.pendingOperations = pendingOperations;
      this.nextIndex = nextIndex;
      this.currentExpression = currentExpression;
      this.normalizedName = normalizedName;
      this.unitBox = unitBox;
      this.amountBox = amountBox;
    }
  }

  private static final class ExitReceiverTimestampTruncateFrame implements ObjectLoweringFrame {
    final LoweredExpressionBox box;
    final List<PendingReceiverOperation> pendingOperations;
    final int nextIndex;
    final Expression currentExpression;
    final LoweredExpressionBox granularityBox;

    ExitReceiverTimestampTruncateFrame(
        LoweredExpressionBox box,
        List<PendingReceiverOperation> pendingOperations,
        int nextIndex,
        Expression currentExpression,
        LoweredExpressionBox granularityBox) {
      this.box = box;
      this.pendingOperations = pendingOperations;
      this.nextIndex = nextIndex;
      this.currentExpression = currentExpression;
      this.granularityBox = granularityBox;
    }
  }

  private static final class ExitApplyBooleanReceiverFrame implements ObjectLoweringFrame {
    final LoweredBooleanBox box;
    final LoweredExpressionBox leftBox;
    final String normalizedName;
    final Object rightArg;
    final String fieldName;

    ExitApplyBooleanReceiverFrame(
        LoweredBooleanBox box,
        LoweredExpressionBox leftBox,
        String normalizedName,
        Object rightArg,
        String fieldName) {
      this.box = box;
      this.leftBox = leftBox;
      this.normalizedName = normalizedName;
      this.rightArg = rightArg;
      this.fieldName = fieldName;
    }
  }

  private static final class ExitFinalizeBooleanReceiverFrame implements ObjectLoweringFrame {
    final LoweredBooleanBox box;
    final Expression leftExpression;
    final String normalizedName;
    final LoweredExpressionBox rightBox;
    final String fieldName;

    ExitFinalizeBooleanReceiverFrame(
        LoweredBooleanBox box,
        Expression leftExpression,
        String normalizedName,
        LoweredExpressionBox rightBox,
        String fieldName) {
      this.box = box;
      this.leftExpression = leftExpression;
      this.normalizedName = normalizedName;
      this.rightBox = rightBox;
      this.fieldName = fieldName;
    }
  }

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

  private static final class ExitBooleanLogicalFrame
      implements BooleanLoweringFrame, ObjectLoweringFrame {
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
    return lowerExpressionObject(value, fieldName);
  }

  BooleanExpression coerceBooleanExpression(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    return lowerBooleanObject(value, fieldName);
  }

  private Expression lowerExpressionObject(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    LoweredExpressionBox rootBox = new LoweredExpressionBox();
    ArrayDeque<ObjectLoweringFrame> stack = new ArrayDeque<>();
    stack.push(new EnterObjectExpressionFrame(value, fieldName, rootBox));
    processObjectLoweringStack(stack);
    return rootBox.value;
  }

  private BooleanExpression lowerBooleanObject(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    LoweredBooleanBox rootBox = new LoweredBooleanBox();
    ArrayDeque<ObjectLoweringFrame> stack = new ArrayDeque<>();
    stack.push(new EnterObjectBooleanFrame(value, fieldName, rootBox));
    processObjectLoweringStack(stack);
    return rootBox.value;
  }

  private Expression lowerExpressionValueObject(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    LoweredExpressionBox rootBox = new LoweredExpressionBox();
    ArrayDeque<ObjectLoweringFrame> stack = new ArrayDeque<>();
    stack.push(new EnterObjectExpressionValueFrame(value, fieldName, rootBox));
    processObjectLoweringStack(stack);
    return rootBox.value;
  }

  private BooleanExpression lowerBooleanValueObject(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    LoweredBooleanBox rootBox = new LoweredBooleanBox();
    ArrayDeque<ObjectLoweringFrame> stack = new ArrayDeque<>();
    stack.push(new EnterObjectBooleanValueFrame(value, fieldName, rootBox));
    processObjectLoweringStack(stack);
    return rootBox.value;
  }

  private Object lowerValueOrExpressionObject(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    LoweredObjectBox rootBox = new LoweredObjectBox();
    ArrayDeque<ObjectLoweringFrame> stack = new ArrayDeque<>();
    stack.push(new EnterObjectValueOrExpressionFrame(value, fieldName, rootBox));
    processObjectLoweringStack(stack);
    return rootBox.value;
  }

  private Expression lowerVectorExpressionValueObject(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    LoweredExpressionBox rootBox = new LoweredExpressionBox();
    ArrayDeque<ObjectLoweringFrame> stack = new ArrayDeque<>();
    stack.push(new EnterObjectVectorExpressionValueFrame(value, fieldName, rootBox));
    processObjectLoweringStack(stack);
    return rootBox.value;
  }

  private void processObjectLoweringStack(ArrayDeque<ObjectLoweringFrame> stack)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    while (!stack.isEmpty()) {
      ObjectLoweringFrame frame = stack.pop();

      if (frame instanceof EnterObjectExpressionFrame) {
        EnterObjectExpressionFrame enterFrame = (EnterObjectExpressionFrame) frame;
        Object currentValue = enterFrame.value;
        String currentFieldName = enterFrame.fieldName;
        List<String> pendingUnaryFunctions = new ArrayList<>();

        while (true) {
          if (currentValue instanceof String) {
            enterFrame.box.value =
                applyPendingUnaryExpressionFunctions(
                    Expression.field((String) currentValue), pendingUnaryFunctions);
            break;
          }

          if (currentValue instanceof Expression) {
            enterFrame.box.value =
                applyPendingUnaryExpressionFunctions(
                    (Expression) currentValue, pendingUnaryFunctions);
            break;
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
            enterFrame.box.value =
                applyPendingUnaryExpressionFunctions(
                    constantExpression(currentValue), pendingUnaryFunctions);
            break;
          }

          if (!(currentValue instanceof Map)) {
            throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                "pipelineExecute() could not convert "
                    + currentFieldName
                    + " into a pipeline expression.");
          }

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

          Object operatorName = map.get("operator");
          if (operatorName instanceof String) {
            LoweredBooleanBox booleanBox = new LoweredBooleanBox();
            stack.push(
                new ExitApplyPendingUnaryBooleanFrame(
                    enterFrame.box, booleanBox, new ArrayList<>(pendingUnaryFunctions)));
            stack.push(new EnterObjectBooleanFrame(currentValue, currentFieldName, booleanBox));
            break;
          }

          Object name = map.get("name");
          if (name instanceof String) {
            String functionName = (String) name;
            if (isBooleanFunctionName(functionName)) {
              LoweredBooleanBox booleanBox = new LoweredBooleanBox();
              stack.push(
                  new ExitApplyPendingUnaryBooleanFrame(
                      enterFrame.box, booleanBox, new ArrayList<>(pendingUnaryFunctions)));
              stack.push(new EnterObjectBooleanFrame(currentValue, currentFieldName, booleanBox));
              break;
            }

            List<Object> args = normalizeArgs(map.get("args"));
            String normalizedFunctionName = canonicalizeExpressionFunctionName(functionName);
            if (isDeferredUnaryExpressionFunction(normalizedFunctionName) && args.size() == 1) {
              pendingUnaryFunctions.add(normalizedFunctionName);
              currentValue = args.get(0);
              currentFieldName = currentFieldName + ".args[0]";
              continue;
            }

            LoweredExpressionBox targetBox =
                preparePendingUnaryTarget(enterFrame.box, pendingUnaryFunctions, stack);
            scheduleExpressionFunctionLowering(
                functionName, args, currentFieldName, targetBox, stack);
            break;
          }

          Object exprType = map.get("exprType");
          if (exprType instanceof String) {
            String normalizedType = ((String) exprType).toLowerCase(Locale.ROOT);
            if ("field".equals(normalizedType)) {
              enterFrame.box.value =
                  applyPendingUnaryExpressionFunctions(
                      Expression.field(coerceFieldPath(currentValue, currentFieldName)),
                      pendingUnaryFunctions);
              break;
            }
            if ("constant".equals(normalizedType)) {
              enterFrame.box.value =
                  applyPendingUnaryExpressionFunctions(
                      constantExpression(
                          resolveConstantValue(map.get("value"), currentFieldName + ".value")),
                      pendingUnaryFunctions);
              break;
            }
          }

          if (map.containsKey("fieldPath")
              || map.containsKey("path")
              || map.containsKey("segments")
              || map.containsKey("_segments")) {
            enterFrame.box.value =
                applyPendingUnaryExpressionFunctions(
                    Expression.field(coerceFieldPath(currentValue, currentFieldName)),
                    pendingUnaryFunctions);
            break;
          }

          throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
              "pipelineExecute() could not convert "
                  + currentFieldName
                  + " into a pipeline expression.");
        }
        continue;
      }

      if (frame instanceof EnterObjectBooleanFrame) {
        EnterObjectBooleanFrame enterFrame = (EnterObjectBooleanFrame) frame;
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
                      enterFrame.box,
                      "AND".equals(normalizedOperator),
                      childBoxes,
                      currentFieldName));
              for (int i = queries.size() - 1; i >= 0; i--) {
                stack.push(
                    new EnterObjectBooleanFrame(
                        queries.get(i),
                        currentFieldName + ".queries[" + i + "]",
                        childBoxes.get(i)));
              }
              continue;
            }

            Object fieldValue =
                map.get("fieldPath") != null ? map.get("fieldPath") : map.get("field");
            if (fieldValue == null) {
              throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                  "pipelineExecute() expected " + currentFieldName + ".fieldPath to be provided.");
            }

            List<Object> args = new ArrayList<>(2);
            args.add(fieldValue);
            args.add(
                map.containsKey("value")
                    ? map.get("value")
                    : map.containsKey("right") ? map.get("right") : map.get("operand"));
            scheduleBooleanFunctionLowering(
                mapOperatorToFunctionName(normalizedOperator),
                args,
                currentFieldName,
                enterFrame.box,
                stack);
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
                    new EnterObjectBooleanFrame(
                        args.get(i), currentFieldName + ".args[" + i + "]", childBoxes.get(i)));
              }
              continue;
            }

            scheduleBooleanFunctionLowering(
                (String) name, args, currentFieldName, enterFrame.box, stack);
            continue;
          }
        }

        LoweredExpressionBox expressionBox = new LoweredExpressionBox();
        stack.push(
            new ExitCastExpressionToBooleanFrame(enterFrame.box, expressionBox, currentFieldName));
        stack.push(new EnterObjectExpressionFrame(currentValue, currentFieldName, expressionBox));
        continue;
      }

      if (frame instanceof EnterObjectExpressionValueFrame) {
        EnterObjectExpressionValueFrame enterFrame = (EnterObjectExpressionValueFrame) frame;
        if (enterFrame.value instanceof Expression) {
          enterFrame.box.value = (Expression) enterFrame.value;
          continue;
        }
        if (containsLowerableExpression(enterFrame.value)) {
          stack.push(
              new EnterObjectExpressionFrame(
                  enterFrame.value, enterFrame.fieldName, enterFrame.box));
          continue;
        }
        enterFrame.box.value =
            constantExpression(resolveConstantValue(enterFrame.value, enterFrame.fieldName));
        continue;
      }

      if (frame instanceof EnterObjectBooleanValueFrame) {
        EnterObjectBooleanValueFrame enterFrame = (EnterObjectBooleanValueFrame) frame;
        if (enterFrame.value instanceof BooleanExpression) {
          enterFrame.box.value = (BooleanExpression) enterFrame.value;
          continue;
        }
        if (containsLowerableExpression(enterFrame.value)) {
          stack.push(
              new EnterObjectBooleanFrame(enterFrame.value, enterFrame.fieldName, enterFrame.box));
          continue;
        }

        Expression expression =
            constantExpression(resolveConstantValue(enterFrame.value, enterFrame.fieldName));
        if (expression instanceof BooleanExpression) {
          enterFrame.box.value = (BooleanExpression) expression;
          continue;
        }
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected "
                + enterFrame.fieldName
                + " to resolve to a boolean expression.");
      }

      if (frame instanceof EnterObjectValueOrExpressionFrame) {
        EnterObjectValueOrExpressionFrame enterFrame = (EnterObjectValueOrExpressionFrame) frame;
        if (enterFrame.value instanceof Expression) {
          enterFrame.box.value = enterFrame.value;
          continue;
        }
        if (containsLowerableExpression(enterFrame.value)) {
          LoweredExpressionBox expressionBox = new LoweredExpressionBox();
          stack.push(new ExitSetObjectFromExpressionFrame(enterFrame.box, expressionBox));
          stack.push(
              new EnterObjectExpressionValueFrame(
                  enterFrame.value, enterFrame.fieldName, expressionBox));
          continue;
        }
        enterFrame.box.value = resolveConstantValue(enterFrame.value, enterFrame.fieldName);
        continue;
      }

      if (frame instanceof EnterObjectVectorExpressionValueFrame) {
        EnterObjectVectorExpressionValueFrame enterFrame =
            (EnterObjectVectorExpressionValueFrame) frame;
        Object currentValue = enterFrame.value;

        if (currentValue instanceof Expression) {
          enterFrame.box.value = (Expression) currentValue;
          continue;
        }

        while (currentValue instanceof Map) {
          @SuppressWarnings("unchecked")
          Map<String, Object> map = (Map<String, Object>) currentValue;
          Object constantValue = unwrapConstantValue(map, enterFrame.fieldName);
          if (constantValue != null) {
            currentValue = constantValue;
            if (currentValue instanceof Expression) {
              enterFrame.box.value = (Expression) currentValue;
              break;
            }
            continue;
          }

          if (map.get("values") != null) {
            double[] vector = coerceVectorValue(map.get("values"));
            enterFrame.box.value = Expression.vector(vector);
            break;
          }
          break;
        }

        if (enterFrame.box.value != null) {
          continue;
        }

        if (currentValue instanceof List) {
          double[] vector = coerceVectorValue(currentValue);
          enterFrame.box.value = Expression.vector(vector);
          continue;
        }

        stack.push(
            new EnterObjectExpressionValueFrame(
                currentValue, enterFrame.fieldName, enterFrame.box));
        continue;
      }

      if (frame instanceof ExitApplyPendingUnaryFrame) {
        ExitApplyPendingUnaryFrame exitFrame = (ExitApplyPendingUnaryFrame) frame;
        exitFrame.box.value =
            applyPendingUnaryExpressionFunctions(
                exitFrame.childBox.value, exitFrame.pendingUnaryFunctions);
        continue;
      }

      if (frame instanceof ExitApplyPendingUnaryBooleanFrame) {
        ExitApplyPendingUnaryBooleanFrame exitFrame = (ExitApplyPendingUnaryBooleanFrame) frame;
        exitFrame.box.value =
            applyPendingUnaryExpressionFunctions(
                exitFrame.childBox.value, exitFrame.pendingUnaryFunctions);
        continue;
      }

      if (frame instanceof ExitCastExpressionToBooleanFrame) {
        ExitCastExpressionToBooleanFrame exitFrame = (ExitCastExpressionToBooleanFrame) frame;
        if (exitFrame.expressionBox.value instanceof BooleanExpression) {
          exitFrame.box.value = (BooleanExpression) exitFrame.expressionBox.value;
          continue;
        }
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected "
                + exitFrame.fieldName
                + " to resolve to a boolean expression.");
      }

      if (frame instanceof ExitSetObjectFromExpressionFrame) {
        ExitSetObjectFromExpressionFrame exitFrame = (ExitSetObjectFromExpressionFrame) frame;
        exitFrame.box.value = exitFrame.expressionBox.value;
        continue;
      }

      if (frame instanceof ExitBooleanLogicalFrame) {
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
        continue;
      }

      if (frame instanceof ExitObjectConditionalExpressionFrame) {
        ExitObjectConditionalExpressionFrame exitFrame =
            (ExitObjectConditionalExpressionFrame) frame;
        exitFrame.box.value =
            Expression.conditional(
                exitFrame.conditionBox.value, exitFrame.trueBox.value, exitFrame.falseBox.value);
        continue;
      }

      if (frame instanceof ExitObjectIsTypeExpressionFrame) {
        ExitObjectIsTypeExpressionFrame exitFrame = (ExitObjectIsTypeExpressionFrame) frame;
        exitFrame.box.value = exitFrame.expressionBox.value.type().equal(exitFrame.typeName);
        continue;
      }

      if (frame instanceof ExitObjectArrayExpressionFrame) {
        ExitObjectArrayExpressionFrame exitFrame = (ExitObjectArrayExpressionFrame) frame;
        Expression[] expressions = new Expression[exitFrame.childBoxes.size()];
        for (int i = 0; i < exitFrame.childBoxes.size(); i++) {
          expressions[i] = exitFrame.childBoxes.get(i).value;
        }
        exitFrame.box.value = Expression.rawFunction("array", expressions);
        continue;
      }

      if (frame instanceof ExitObjectMapExpressionFrame) {
        ExitObjectMapExpressionFrame exitFrame = (ExitObjectMapExpressionFrame) frame;
        Expression[] expressions = new Expression[exitFrame.entries.size() * 2];
        int index = 0;
        for (Map.Entry<String, LoweredExpressionBox> entry : exitFrame.entries) {
          expressions[index++] = constantExpression(entry.getKey());
          expressions[index++] = entry.getValue().value;
        }
        exitFrame.box.value = Expression.rawFunction("map", expressions);
        continue;
      }

      if (frame instanceof ExitObjectRawExpressionFunctionFrame) {
        ExitObjectRawExpressionFunctionFrame exitFrame =
            (ExitObjectRawExpressionFunctionFrame) frame;
        Expression[] expressions = new Expression[exitFrame.childBoxes.size()];
        for (int i = 0; i < exitFrame.childBoxes.size(); i++) {
          expressions[i] = exitFrame.childBoxes.get(i).value;
        }
        exitFrame.box.value =
            Expression.rawFunction(
                normalizeExpressionFunctionName(exitFrame.functionName), expressions);
        continue;
      }

      if (frame instanceof ExitObjectRawBooleanFunctionFrame) {
        ExitObjectRawBooleanFunctionFrame exitFrame = (ExitObjectRawBooleanFunctionFrame) frame;
        Expression[] expressions = new Expression[exitFrame.childBoxes.size()];
        for (int i = 0; i < exitFrame.childBoxes.size(); i++) {
          expressions[i] = exitFrame.childBoxes.get(i).value;
        }
        exitFrame.box.value =
            BooleanExpression.rawFunction(
                normalizeExpressionFunctionName(exitFrame.functionName), expressions);
        continue;
      }

      if (frame instanceof ContinueReceiverExpressionChainFrame) {
        ContinueReceiverExpressionChainFrame continueFrame =
            (ContinueReceiverExpressionChainFrame) frame;
        Expression currentExpression =
            continueFrame.currentExpression != null
                ? continueFrame.currentExpression
                : continueFrame.baseBox.value;
        if (continueFrame.nextIndex < 0) {
          continueFrame.box.value = currentExpression;
          continue;
        }

        PendingReceiverOperation operation =
            continueFrame.pendingOperations.get(continueFrame.nextIndex);
        List<Object> args = operation.args;
        String operationFieldName = operation.fieldName;
        int nextIndex = continueFrame.nextIndex - 1;

        switch (operation.normalizedName) {
          case "logicalmaximum":
          case "logicalminimum":
            {
              if (args.size() < 2) {
                throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                    "pipelineExecute() expected "
                        + operationFieldName
                        + "."
                        + operation.originalName
                        + " to include at least 2 arguments.");
              }
              List<LoweredExpressionBox> childBoxes = new ArrayList<>(args.size() - 1);
              for (int i = 1; i < args.size(); i++) {
                childBoxes.add(new LoweredExpressionBox());
              }
              stack.push(
                  new ExitReceiverLogicalExtremaFrame(
                      continueFrame.box,
                      continueFrame.pendingOperations,
                      nextIndex,
                      currentExpression,
                      "logicalmaximum".equals(operation.normalizedName),
                      childBoxes));
              for (int i = childBoxes.size() - 1; i >= 0; i--) {
                int argIndex = i + 1;
                stack.push(
                    new EnterObjectExpressionValueFrame(
                        args.get(argIndex),
                        operationFieldName + ".args[" + argIndex + "]",
                        childBoxes.get(i)));
              }
              continue;
            }
          case "mapget":
            {
              Object keyArg = args.get(1);
              if (!containsLowerableExpression(keyArg)) {
                Object keyValue = resolveConstantValue(keyArg, operationFieldName + ".args[1]");
                if (keyValue instanceof String) {
                  stack.push(
                      new ContinueReceiverExpressionChainFrame(
                          continueFrame.box,
                          null,
                          continueFrame.pendingOperations,
                          nextIndex,
                          currentExpression.mapGet((String) keyValue)));
                  continue;
                }
              }

              LoweredExpressionBox keyBox = new LoweredExpressionBox();
              stack.push(
                  new ExitReceiverMapGetFrame(
                      continueFrame.box,
                      continueFrame.pendingOperations,
                      nextIndex,
                      currentExpression,
                      keyBox));
              stack.push(
                  new EnterObjectExpressionValueFrame(
                      keyArg, operationFieldName + ".args[1]", keyBox));
              continue;
            }
          case "mapmerge":
            {
              if (args.size() < 2) {
                throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                    "pipelineExecute() expected "
                        + operationFieldName
                        + "."
                        + operation.originalName
                        + " to include at least 2 arguments.");
              }
              List<LoweredExpressionBox> childBoxes = new ArrayList<>(args.size() - 1);
              for (int i = 1; i < args.size(); i++) {
                childBoxes.add(new LoweredExpressionBox());
              }
              stack.push(
                  new ExitReceiverMapMergeFrame(
                      continueFrame.box,
                      continueFrame.pendingOperations,
                      nextIndex,
                      currentExpression,
                      childBoxes));
              for (int i = childBoxes.size() - 1; i >= 0; i--) {
                int argIndex = i + 1;
                stack.push(
                    new EnterObjectExpressionValueFrame(
                        args.get(argIndex),
                        operationFieldName + ".args[" + argIndex + "]",
                        childBoxes.get(i)));
              }
              continue;
            }
          case "arrayget":
            {
              Object indexArg = args.get(1);
              if (!containsLowerableExpression(indexArg)) {
                Object indexValue = resolveConstantValue(indexArg, operationFieldName + ".args[1]");
                if (indexValue instanceof Number) {
                  stack.push(
                      new ContinueReceiverExpressionChainFrame(
                          continueFrame.box,
                          null,
                          continueFrame.pendingOperations,
                          nextIndex,
                          currentExpression.arrayGet(((Number) indexValue).intValue())));
                  continue;
                }
              }

              LoweredExpressionBox indexBox = new LoweredExpressionBox();
              stack.push(
                  new ExitReceiverArrayGetFrame(
                      continueFrame.box,
                      continueFrame.pendingOperations,
                      nextIndex,
                      currentExpression,
                      indexBox));
              stack.push(
                  new EnterObjectExpressionValueFrame(
                      indexArg, operationFieldName + ".args[1]", indexBox));
              continue;
            }
          case "arrayconcat":
            {
              if (args.size() < 2) {
                throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                    "pipelineExecute() expected "
                        + operationFieldName
                        + "."
                        + operation.originalName
                        + " to include at least 2 arguments.");
              }
              List<LoweredObjectBox> childBoxes = new ArrayList<>(args.size() - 1);
              for (int i = 1; i < args.size(); i++) {
                childBoxes.add(new LoweredObjectBox());
              }
              stack.push(
                  new ExitReceiverArrayConcatFrame(
                      continueFrame.box,
                      continueFrame.pendingOperations,
                      nextIndex,
                      currentExpression,
                      childBoxes));
              for (int i = childBoxes.size() - 1; i >= 0; i--) {
                int argIndex = i + 1;
                stack.push(
                    new EnterObjectValueOrExpressionFrame(
                        args.get(argIndex),
                        operationFieldName + ".args[" + argIndex + "]",
                        childBoxes.get(i)));
              }
              continue;
            }
          case "cosinedistance":
          case "dotproduct":
          case "euclideandistance":
            {
              Object rightArg = args.get(1);
              if (!containsLowerableExpression(rightArg)) {
                Object rightValue = resolveConstantValue(rightArg, operationFieldName + ".args[1]");
                if (rightValue instanceof List
                    || (rightValue instanceof Map
                        && ((Map<?, ?>) rightValue).get("values") != null)) {
                  double[] vector = coerceVectorValue(rightValue);
                  Expression nextExpression =
                      "cosinedistance".equals(operation.normalizedName)
                          ? currentExpression.cosineDistance(vector)
                          : "dotproduct".equals(operation.normalizedName)
                              ? currentExpression.dotProduct(vector)
                              : currentExpression.euclideanDistance(vector);
                  stack.push(
                      new ContinueReceiverExpressionChainFrame(
                          continueFrame.box,
                          null,
                          continueFrame.pendingOperations,
                          nextIndex,
                          nextExpression));
                  continue;
                }
              }

              LoweredExpressionBox rightBox = new LoweredExpressionBox();
              stack.push(
                  new ExitReceiverVectorDistanceFrame(
                      continueFrame.box,
                      continueFrame.pendingOperations,
                      nextIndex,
                      currentExpression,
                      operation.normalizedName,
                      rightBox));
              stack.push(
                  new EnterObjectVectorExpressionValueFrame(
                      rightArg, operationFieldName + ".args[1]", rightBox));
              continue;
            }
          case "timestampadd":
          case "timestampsubtract":
            {
              if (args.size() != 3) {
                throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                    "pipelineExecute() expected "
                        + operationFieldName
                        + "."
                        + operation.originalName
                        + " to include exactly 3 arguments.");
              }
              Object unitArg = args.get(1);
              Object amountArg = args.get(2);
              if (!containsLowerableExpression(unitArg)
                  && !containsLowerableExpression(amountArg)) {
                Object unitValue = resolveConstantValue(unitArg, operationFieldName + ".args[1]");
                Object amountValue =
                    resolveConstantValue(amountArg, operationFieldName + ".args[2]");
                if (unitValue instanceof String && amountValue instanceof Number) {
                  long amount = ((Number) amountValue).longValue();
                  Expression nextExpression =
                      "timestampadd".equals(operation.normalizedName)
                          ? currentExpression.timestampAdd((String) unitValue, amount)
                          : currentExpression.timestampSubtract((String) unitValue, amount);
                  stack.push(
                      new ContinueReceiverExpressionChainFrame(
                          continueFrame.box,
                          null,
                          continueFrame.pendingOperations,
                          nextIndex,
                          nextExpression));
                  continue;
                }
              }

              LoweredExpressionBox unitBox = new LoweredExpressionBox();
              LoweredExpressionBox amountBox = new LoweredExpressionBox();
              stack.push(
                  new ExitReceiverTimestampMathFrame(
                      continueFrame.box,
                      continueFrame.pendingOperations,
                      nextIndex,
                      currentExpression,
                      operation.normalizedName,
                      unitBox,
                      amountBox));
              stack.push(
                  new EnterObjectExpressionValueFrame(
                      amountArg, operationFieldName + ".args[2]", amountBox));
              stack.push(
                  new EnterObjectExpressionValueFrame(
                      unitArg, operationFieldName + ".args[1]", unitBox));
              continue;
            }
          case "timestamptruncate":
            {
              Object granularityArg = args.get(1);
              if (!containsLowerableExpression(granularityArg)) {
                Object granularityValue =
                    resolveConstantValue(granularityArg, operationFieldName + ".args[1]");
                if (granularityValue instanceof String) {
                  stack.push(
                      new ContinueReceiverExpressionChainFrame(
                          continueFrame.box,
                          null,
                          continueFrame.pendingOperations,
                          nextIndex,
                          currentExpression.timestampTruncate((String) granularityValue)));
                  continue;
                }
              }

              LoweredExpressionBox granularityBox = new LoweredExpressionBox();
              stack.push(
                  new ExitReceiverTimestampTruncateFrame(
                      continueFrame.box,
                      continueFrame.pendingOperations,
                      nextIndex,
                      currentExpression,
                      granularityBox));
              stack.push(
                  new EnterObjectExpressionValueFrame(
                      granularityArg, operationFieldName + ".args[1]", granularityBox));
              continue;
            }
          default:
            stack.push(
                new ContinueReceiverExpressionChainFrame(
                    continueFrame.box,
                    null,
                    continueFrame.pendingOperations,
                    nextIndex,
                    currentExpression));
            continue;
        }
      }

      if (frame instanceof ExitReceiverLogicalExtremaFrame) {
        ExitReceiverLogicalExtremaFrame exitFrame = (ExitReceiverLogicalExtremaFrame) frame;
        Expression[] others = new Expression[exitFrame.childBoxes.size()];
        for (int i = 0; i < exitFrame.childBoxes.size(); i++) {
          others[i] = exitFrame.childBoxes.get(i).value;
        }
        Expression nextExpression =
            exitFrame.maximum
                ? exitFrame.currentExpression.logicalMaximum(others)
                : exitFrame.currentExpression.logicalMinimum(others);
        stack.push(
            new ContinueReceiverExpressionChainFrame(
                exitFrame.box,
                null,
                exitFrame.pendingOperations,
                exitFrame.nextIndex,
                nextExpression));
        continue;
      }

      if (frame instanceof ExitReceiverMapGetFrame) {
        ExitReceiverMapGetFrame exitFrame = (ExitReceiverMapGetFrame) frame;
        stack.push(
            new ContinueReceiverExpressionChainFrame(
                exitFrame.box,
                null,
                exitFrame.pendingOperations,
                exitFrame.nextIndex,
                exitFrame.currentExpression.mapGet(exitFrame.keyBox.value)));
        continue;
      }

      if (frame instanceof ExitReceiverMapMergeFrame) {
        ExitReceiverMapMergeFrame exitFrame = (ExitReceiverMapMergeFrame) frame;
        Expression right = exitFrame.childBoxes.get(0).value;
        Expression[] others = new Expression[Math.max(0, exitFrame.childBoxes.size() - 1)];
        for (int i = 1; i < exitFrame.childBoxes.size(); i++) {
          others[i - 1] = exitFrame.childBoxes.get(i).value;
        }
        stack.push(
            new ContinueReceiverExpressionChainFrame(
                exitFrame.box,
                null,
                exitFrame.pendingOperations,
                exitFrame.nextIndex,
                exitFrame.currentExpression.mapMerge(right, others)));
        continue;
      }

      if (frame instanceof ExitReceiverArrayGetFrame) {
        ExitReceiverArrayGetFrame exitFrame = (ExitReceiverArrayGetFrame) frame;
        stack.push(
            new ContinueReceiverExpressionChainFrame(
                exitFrame.box,
                null,
                exitFrame.pendingOperations,
                exitFrame.nextIndex,
                exitFrame.currentExpression.arrayGet(exitFrame.indexBox.value)));
        continue;
      }

      if (frame instanceof ExitReceiverArrayConcatFrame) {
        ExitReceiverArrayConcatFrame exitFrame = (ExitReceiverArrayConcatFrame) frame;
        Object secondValue = exitFrame.childBoxes.get(0).value;
        Object[] rest = new Object[Math.max(0, exitFrame.childBoxes.size() - 1)];
        for (int i = 1; i < exitFrame.childBoxes.size(); i++) {
          rest[i - 1] = exitFrame.childBoxes.get(i).value;
        }
        stack.push(
            new ContinueReceiverExpressionChainFrame(
                exitFrame.box,
                null,
                exitFrame.pendingOperations,
                exitFrame.nextIndex,
                exitFrame.currentExpression.arrayConcat(secondValue, rest)));
        continue;
      }

      if (frame instanceof ExitReceiverVectorDistanceFrame) {
        ExitReceiverVectorDistanceFrame exitFrame = (ExitReceiverVectorDistanceFrame) frame;
        Expression nextExpression =
            "cosinedistance".equals(exitFrame.normalizedName)
                ? exitFrame.currentExpression.cosineDistance(exitFrame.rightBox.value)
                : "dotproduct".equals(exitFrame.normalizedName)
                    ? exitFrame.currentExpression.dotProduct(exitFrame.rightBox.value)
                    : exitFrame.currentExpression.euclideanDistance(exitFrame.rightBox.value);
        stack.push(
            new ContinueReceiverExpressionChainFrame(
                exitFrame.box,
                null,
                exitFrame.pendingOperations,
                exitFrame.nextIndex,
                nextExpression));
        continue;
      }

      if (frame instanceof ExitReceiverTimestampMathFrame) {
        ExitReceiverTimestampMathFrame exitFrame = (ExitReceiverTimestampMathFrame) frame;
        Expression nextExpression =
            "timestampadd".equals(exitFrame.normalizedName)
                ? exitFrame.currentExpression.timestampAdd(
                    exitFrame.unitBox.value, exitFrame.amountBox.value)
                : exitFrame.currentExpression.timestampSubtract(
                    exitFrame.unitBox.value, exitFrame.amountBox.value);
        stack.push(
            new ContinueReceiverExpressionChainFrame(
                exitFrame.box,
                null,
                exitFrame.pendingOperations,
                exitFrame.nextIndex,
                nextExpression));
        continue;
      }

      if (frame instanceof ExitReceiverTimestampTruncateFrame) {
        ExitReceiverTimestampTruncateFrame exitFrame = (ExitReceiverTimestampTruncateFrame) frame;
        stack.push(
            new ContinueReceiverExpressionChainFrame(
                exitFrame.box,
                null,
                exitFrame.pendingOperations,
                exitFrame.nextIndex,
                exitFrame.currentExpression.timestampTruncate(exitFrame.granularityBox.value)));
        continue;
      }

      if (frame instanceof ExitApplyBooleanReceiverFrame) {
        ExitApplyBooleanReceiverFrame exitFrame = (ExitApplyBooleanReceiverFrame) frame;
        Expression leftExpression = exitFrame.leftBox.value;
        Object rightArg = exitFrame.rightArg;
        String rightFieldName = exitFrame.fieldName + ".args[1]";

        if (!containsLowerableExpression(rightArg)) {
          Object resolved = resolveConstantValue(rightArg, rightFieldName);
          BooleanExpression directResult =
              applyBooleanReceiverConstant(exitFrame.normalizedName, leftExpression, resolved);
          if (directResult != null) {
            exitFrame.box.value = directResult;
            continue;
          }
        }

        LoweredExpressionBox rightBox = new LoweredExpressionBox();
        stack.push(
            new ExitFinalizeBooleanReceiverFrame(
                exitFrame.box,
                leftExpression,
                exitFrame.normalizedName,
                rightBox,
                exitFrame.fieldName));
        stack.push(new EnterObjectExpressionValueFrame(rightArg, rightFieldName, rightBox));
        continue;
      }

      ExitFinalizeBooleanReceiverFrame exitFrame = (ExitFinalizeBooleanReceiverFrame) frame;
      exitFrame.box.value =
          applyBooleanReceiverExpression(
              exitFrame.normalizedName, exitFrame.leftExpression, exitFrame.rightBox.value);
    }
  }

  private void scheduleExpressionFunctionLowering(
      String functionName,
      List<Object> args,
      String fieldName,
      LoweredExpressionBox box,
      ArrayDeque<ObjectLoweringFrame> stack)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String normalizedName = canonicalizeExpressionFunctionName(functionName);

    switch (normalizedName) {
      case "array":
        {
          List<Object> elements = args;
          if (args.size() == 1) {
            List<Object> unwrapped = unwrapConstantArray(args.get(0), fieldName + ".args[0]");
            if (unwrapped != null) {
              elements = unwrapped;
            }
          }

          boolean allConstant = true;
          for (Object element : elements) {
            if (containsLowerableExpression(element)) {
              allConstant = false;
              break;
            }
          }

          if (allConstant) {
            List<Object> resolved = new ArrayList<>(elements.size());
            for (int i = 0; i < elements.size(); i++) {
              resolved.add(resolveConstantValue(elements.get(i), fieldName + ".args[" + i + "]"));
            }
            box.value = constantExpression(resolved);
            return;
          }

          List<LoweredExpressionBox> childBoxes = new ArrayList<>(elements.size());
          for (int i = 0; i < elements.size(); i++) {
            childBoxes.add(new LoweredExpressionBox());
          }
          stack.push(new ExitObjectArrayExpressionFrame(box, childBoxes));
          for (int i = elements.size() - 1; i >= 0; i--) {
            stack.push(
                new EnterObjectExpressionValueFrame(
                    elements.get(i), fieldName + ".args[" + i + "]", childBoxes.get(i)));
          }
          return;
        }
      case "map":
        {
          requireArgumentCount(args, 1, "map", fieldName);
          Map<String, Object> entries = unwrapConstantMap(args.get(0), fieldName + ".args[0]");
          if (entries == null) {
            scheduleRawExpressionFunction(functionName, args, fieldName, box, stack);
            return;
          }

          boolean allConstant = true;
          for (Object entryValue : entries.values()) {
            if (containsLowerableExpression(entryValue)) {
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
            box.value = constantExpression(resolved);
            return;
          }

          List<Map.Entry<String, LoweredExpressionBox>> boxedEntries =
              new ArrayList<>(entries.size());
          for (Map.Entry<String, Object> entry : entries.entrySet()) {
            boxedEntries.add(
                new java.util.AbstractMap.SimpleEntry<>(
                    entry.getKey(), new LoweredExpressionBox()));
          }
          stack.push(new ExitObjectMapExpressionFrame(box, boxedEntries));
          List<Map.Entry<String, Object>> pendingEntries = new ArrayList<>(entries.entrySet());
          for (int i = pendingEntries.size() - 1; i >= 0; i--) {
            Map.Entry<String, Object> entry = pendingEntries.get(i);
            stack.push(
                new EnterObjectExpressionValueFrame(
                    entry.getValue(),
                    fieldName + ".args[0]." + entry.getKey(),
                    boxedEntries.get(i).getValue()));
          }
          return;
        }
      case "conditional":
        {
          requireArgumentCount(args, 3, functionName, fieldName);
          LoweredBooleanBox conditionBox = new LoweredBooleanBox();
          LoweredExpressionBox trueBox = new LoweredExpressionBox();
          LoweredExpressionBox falseBox = new LoweredExpressionBox();
          stack.push(
              new ExitObjectConditionalExpressionFrame(box, conditionBox, trueBox, falseBox));
          stack.push(
              new EnterObjectExpressionValueFrame(args.get(2), fieldName + ".args[2]", falseBox));
          stack.push(
              new EnterObjectExpressionValueFrame(args.get(1), fieldName + ".args[1]", trueBox));
          stack.push(
              new EnterObjectBooleanValueFrame(args.get(0), fieldName + ".args[0]", conditionBox));
          return;
        }
      case "currenttimestamp":
        requireArgumentCount(args, 0, functionName, fieldName);
        box.value = Expression.currentTimestamp();
        return;
      case "istype":
        {
          requireArgumentCount(args, 2, functionName, fieldName);
          String typeName = coerceStringValue(args.get(1), fieldName + ".args[1]");
          LoweredExpressionBox expressionBox = new LoweredExpressionBox();
          stack.push(new ExitObjectIsTypeExpressionFrame(box, expressionBox, typeName));
          stack.push(
              new EnterObjectExpressionValueFrame(
                  args.get(0), fieldName + ".args[0]", expressionBox));
          return;
        }
      case "logicalmaximum":
      case "logicalminimum":
      case "mapget":
      case "mapmerge":
      case "arrayget":
      case "arrayconcat":
      case "cosinedistance":
      case "dotproduct":
      case "euclideandistance":
      case "timestampadd":
      case "timestampsubtract":
        scheduleReceiverExpressionChain(normalizedName, functionName, args, fieldName, box, stack);
        return;
      case "timestamptruncate":
        if (args.size() == 2) {
          scheduleReceiverExpressionChain(
              normalizedName, functionName, args, fieldName, box, stack);
          return;
        }
        box.value = null;
        return;
      default:
        scheduleRawExpressionFunction(functionName, args, fieldName, box, stack);
    }
  }

  private void scheduleRawExpressionFunction(
      String functionName,
      List<Object> args,
      String fieldName,
      LoweredExpressionBox box,
      ArrayDeque<ObjectLoweringFrame> stack) {
    List<LoweredExpressionBox> childBoxes = new ArrayList<>(args.size());
    for (int i = 0; i < args.size(); i++) {
      childBoxes.add(new LoweredExpressionBox());
    }
    stack.push(new ExitObjectRawExpressionFunctionFrame(box, functionName, childBoxes));
    for (int i = args.size() - 1; i >= 0; i--) {
      stack.push(
          new EnterObjectExpressionValueFrame(
              args.get(i), fieldName + ".args[" + i + "]", childBoxes.get(i)));
    }
  }

  private void scheduleBooleanFunctionLowering(
      String functionName,
      List<Object> args,
      String fieldName,
      LoweredBooleanBox box,
      ArrayDeque<ObjectLoweringFrame> stack)
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
      scheduleBooleanReceiverChain(normalizedName, functionName, args, fieldName, box, stack);
      return;
    }

    List<LoweredExpressionBox> childBoxes = new ArrayList<>(args.size());
    for (int i = 0; i < args.size(); i++) {
      childBoxes.add(new LoweredExpressionBox());
    }
    stack.push(new ExitObjectRawBooleanFunctionFrame(box, functionName, childBoxes));
    for (int i = args.size() - 1; i >= 0; i--) {
      stack.push(
          new EnterObjectExpressionValueFrame(
              args.get(i), fieldName + ".args[" + i + "]", childBoxes.get(i)));
    }
  }

  private void scheduleReceiverExpressionChain(
      String normalizedName,
      String originalName,
      List<Object> args,
      String fieldName,
      LoweredExpressionBox box,
      ArrayDeque<ObjectLoweringFrame> stack)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    ReceiverChainSeed seed =
        collectReceiverExpressionChain(normalizedName, originalName, args, fieldName);
    LoweredExpressionBox baseBox = new LoweredExpressionBox();
    stack.push(
        new ContinueReceiverExpressionChainFrame(
            box, baseBox, seed.pendingOperations, seed.pendingOperations.size() - 1, null));
    stack.push(new EnterObjectExpressionFrame(seed.baseValue, seed.baseFieldName, baseBox));
  }

  private void scheduleBooleanReceiverChain(
      String normalizedName,
      String originalName,
      List<Object> args,
      String fieldName,
      LoweredBooleanBox box,
      ArrayDeque<ObjectLoweringFrame> stack)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    ReceiverChainSeed seed =
        collectReceiverExpressionChain(normalizedName, originalName, args, fieldName);
    LoweredExpressionBox leftBox = new LoweredExpressionBox();
    LoweredExpressionBox baseBox = new LoweredExpressionBox();
    stack.push(
        new ExitApplyBooleanReceiverFrame(box, leftBox, normalizedName, args.get(1), fieldName));
    stack.push(
        new ContinueReceiverExpressionChainFrame(
            leftBox, baseBox, seed.pendingOperations, seed.pendingOperations.size() - 1, null));
    stack.push(new EnterObjectExpressionFrame(seed.baseValue, seed.baseFieldName, baseBox));
  }

  private ReceiverChainSeed collectReceiverExpressionChain(
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
    pendingOperations.add(
        new PendingReceiverOperation(normalizedName, originalName, args, fieldName));

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

      Object nestedName = map.get("name");
      if (!(nestedName instanceof String)) {
        break;
      }

      List<Object> nestedArgs = normalizeArgs(map.get("args"));
      String nestedNormalizedName = canonicalizeExpressionFunctionName((String) nestedName);
      if (!isDeferredReceiverExpressionFunction(nestedNormalizedName) || nestedArgs.isEmpty()) {
        break;
      }

      pendingOperations.add(
          new PendingReceiverOperation(
              nestedNormalizedName, (String) nestedName, nestedArgs, currentFieldName));
      currentValue = nestedArgs.get(0);
      currentFieldName = currentFieldName + ".args[0]";
    }

    return new ReceiverChainSeed(currentValue, currentFieldName, pendingOperations);
  }

  private BooleanExpression applyBooleanReceiverConstant(
      String normalizedName, Expression expression, Object value)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    switch (normalizedName) {
      case "equal":
        return expression.equal(value);
      case "notequal":
        return expression.notEqual(value);
      case "greaterthan":
        return expression.greaterThan(value);
      case "greaterthanorequal":
        return expression.greaterThanOrEqual(value);
      case "lessthan":
        return expression.lessThan(value);
      case "lessthanorequal":
        return expression.lessThanOrEqual(value);
      case "arraycontains":
        return expression.arrayContains(value);
      case "arraycontainsany":
        return value instanceof List ? expression.arrayContainsAny((List<?>) value) : null;
      case "arraycontainsall":
        return value instanceof List ? expression.arrayContainsAll((List<?>) value) : null;
      case "equalany":
        return value instanceof List ? expression.equalAny((List<?>) value) : null;
      case "notequalany":
        return value instanceof List ? expression.notEqualAny((List<?>) value) : null;
      default:
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected a boolean receiver operation.");
    }
  }

  private BooleanExpression applyBooleanReceiverExpression(
      String normalizedName, Expression expression, Expression value)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    switch (normalizedName) {
      case "equal":
        return expression.equal(value);
      case "notequal":
        return expression.notEqual(value);
      case "greaterthan":
        return expression.greaterThan(value);
      case "greaterthanorequal":
        return expression.greaterThanOrEqual(value);
      case "lessthan":
        return expression.lessThan(value);
      case "lessthanorequal":
        return expression.lessThanOrEqual(value);
      case "arraycontains":
        return expression.arrayContains(value);
      case "arraycontainsany":
        return expression.arrayContainsAny(value);
      case "arraycontainsall":
        return expression.arrayContainsAll(value);
      case "equalany":
        return expression.equalAny(value);
      case "notequalany":
        return expression.notEqualAny(value);
      default:
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected a boolean receiver operation.");
    }
  }

  private boolean containsLowerableExpression(Object value) {
    return value instanceof Expression || containsSerializedExpression(value);
  }

  private LoweredExpressionBox preparePendingUnaryTarget(
      LoweredExpressionBox box,
      List<String> pendingUnaryFunctions,
      ArrayDeque<ObjectLoweringFrame> stack) {
    if (pendingUnaryFunctions.isEmpty()) {
      return box;
    }
    LoweredExpressionBox childBox = new LoweredExpressionBox();
    stack.push(
        new ExitApplyPendingUnaryFrame(box, childBox, new ArrayList<>(pendingUnaryFunctions)));
    return childBox;
  }

  private void requireArgumentCount(
      List<Object> args, int expectedCount, String functionName, String fieldName)
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
    return lowerExpressionValueObject(value, fieldName);
  }

  private BooleanExpression coerceBooleanValue(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    return lowerBooleanValueObject(value, fieldName);
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
    return lowerValueOrExpressionObject(value, fieldName);
  }

  private Expression coerceVectorExpressionValue(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    return lowerVectorExpressionValueObject(value, fieldName);
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

        if (currentValue
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) {
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

        if (currentValue
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) {
          List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) currentValue)
                  .values;
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
          List<Map.Entry<String, ResolvedValueBox>> entries =
              new java.util.ArrayList<>(values.size());
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
                .values.values()) {
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
        ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode expression =
            enterFrame.value;

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
        stack.push(
            new ExitSerializedExpressionFunctionFrame(enterFrame.box, function.name, argBoxes));
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

        if (currentValue
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) {
          enterFrame.box.value =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) currentValue)
                  .value;
          continue;
        }

        if (currentValue
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) {
          List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) currentValue)
                  .values;
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
                ((ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode)
                        currentValue)
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

  private Object serializeValueNode(
      ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode value) {
    SerializedValueBox rootBox = new SerializedValueBox();
    ArrayDeque<SerializationFrame> stack = new ArrayDeque<>();
    stack.push(new EnterSerializedValueFrame(value, rootBox));

    while (!stack.isEmpty()) {
      SerializationFrame frame = stack.pop();
      if (frame instanceof EnterSerializedValueFrame) {
        EnterSerializedValueFrame enterFrame = (EnterSerializedValueFrame) frame;
        ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode currentValue = enterFrame.value;

        if (currentValue
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) {
          enterFrame.box.value =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedPrimitiveValueNode) currentValue)
                  .value;
          continue;
        }

        if (currentValue
            instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) {
          List<ReactNativeFirebaseFirestorePipelineParser.ParsedValueNode> values =
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedListValueNode) currentValue)
                  .values;
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
                ((ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionValueNode)
                        currentValue)
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
        ReactNativeFirebaseFirestorePipelineParser.ParsedExpressionNode expression =
            enterFrame.value;

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
        stack.push(
            new ExitSerializedExpressionFunctionFrame(enterFrame.box, function.name, argBoxes));
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
