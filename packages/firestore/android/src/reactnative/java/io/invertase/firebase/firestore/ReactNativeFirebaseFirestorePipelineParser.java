package io.invertase.firebase.firestore;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import java.util.Arrays;
import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

final class ReactNativeFirebaseFirestorePipelineParser {
  private static final Set<String> SOURCE_TYPES =
      new HashSet<>(
          Arrays.asList("collection", "collectionGroup", "database", "documents", "query"));

  private static final Set<String> KNOWN_STAGES =
      new HashSet<>(
          Arrays.asList(
              "where",
              "select",
              "addFields",
              "removeFields",
              "sort",
              "limit",
              "offset",
              "aggregate",
              "distinct",
              "findNearest",
              "replaceWith",
              "sample",
              "union",
              "unnest",
              "rawStage"));

  private static final class ParsedPipelineRequestBox {
    ParsedPipelineRequest value;
  }

  private static final class ParsedExpressionNodeBox {
    ParsedExpressionNode value;
  }

  private static final class ParsedValueNodeBox {
    ParsedValueNode value;
  }

  private interface PendingParsedStage {}

  private static final class ReadyParsedStage implements PendingParsedStage {
    final ParsedPipelineStage stage;

    ReadyParsedStage(ParsedPipelineStage stage) {
      this.stage = stage;
    }
  }

  private static final class PendingUnionStage implements PendingParsedStage {
    final ParsedPipelineRequestBox childBox;

    PendingUnionStage(ParsedPipelineRequestBox childBox) {
      this.childBox = childBox;
    }
  }

  private abstract static class PipelineParseFrame {}

  private abstract static class ExpressionValueParseFrame {}

  private static final class PendingValueEntry {
    final String key;
    final Object value;
    final ParsedValueNodeBox box;

    PendingValueEntry(String key, Object value, ParsedValueNodeBox box) {
      this.key = key;
      this.value = value;
      this.box = box;
    }
  }

  private static final class EnterPipelineParseFrame extends PipelineParseFrame {
    final Map<String, Object> pipeline;
    final Map<String, Object> options;
    final ParsedPipelineRequestBox box;

    EnterPipelineParseFrame(
        Map<String, Object> pipeline, Map<String, Object> options, ParsedPipelineRequestBox box) {
      this.pipeline = pipeline;
      this.options = options;
      this.box = box;
    }
  }

  private static final class ExitPipelineParseFrame extends PipelineParseFrame {
    final ParsedPipelineSource source;
    final List<PendingParsedStage> stages;
    final ParsedPipelineExecuteOptions options;
    final ParsedPipelineRequestBox box;

    ExitPipelineParseFrame(
        ParsedPipelineSource source,
        List<PendingParsedStage> stages,
        ParsedPipelineExecuteOptions options,
        ParsedPipelineRequestBox box) {
      this.source = source;
      this.stages = stages;
      this.options = options;
      this.box = box;
    }
  }

  private static final class ExpressionEnterFrame extends ExpressionValueParseFrame {
    final Object value;
    final ParsedExpressionNodeBox box;
    final String fieldName;

    ExpressionEnterFrame(Object value, ParsedExpressionNodeBox box, String fieldName) {
      this.value = value;
      this.box = box;
      this.fieldName = fieldName;
    }
  }

  private static final class ExpressionValueExitFrame extends ExpressionValueParseFrame {
    final ParsedValueNodeBox valueBox;
    final ParsedExpressionNodeBox expressionBox;
    final String fieldName;

    ExpressionValueExitFrame(
        ParsedValueNodeBox valueBox, ParsedExpressionNodeBox expressionBox, String fieldName) {
      this.valueBox = valueBox;
      this.expressionBox = expressionBox;
      this.fieldName = fieldName;
    }
  }

  private static final class ExpressionConstantExitFrame extends ExpressionValueParseFrame {
    final ParsedExpressionNodeBox expressionBox;
    final ParsedValueNodeBox valueBox;
    final String fieldName;

    ExpressionConstantExitFrame(
        ParsedExpressionNodeBox expressionBox, ParsedValueNodeBox valueBox, String fieldName) {
      this.expressionBox = expressionBox;
      this.valueBox = valueBox;
      this.fieldName = fieldName;
    }
  }

  private static final class ExpressionFunctionExitFrame extends ExpressionValueParseFrame {
    final ParsedExpressionNodeBox box;
    final String name;
    final List<ParsedValueNodeBox> argBoxes;
    final String fieldName;

    ExpressionFunctionExitFrame(
        ParsedExpressionNodeBox box,
        String name,
        List<ParsedValueNodeBox> argBoxes,
        String fieldName) {
      this.box = box;
      this.name = name;
      this.argBoxes = argBoxes;
      this.fieldName = fieldName;
    }
  }

  private static final class ExpressionOperatorLogicalExitFrame extends ExpressionValueParseFrame {
    final ParsedExpressionNodeBox box;
    final String normalizedOperator;
    final List<ParsedExpressionNodeBox> queryBoxes;
    final String fieldName;

    ExpressionOperatorLogicalExitFrame(
        ParsedExpressionNodeBox box,
        String normalizedOperator,
        List<ParsedExpressionNodeBox> queryBoxes,
        String fieldName) {
      this.box = box;
      this.normalizedOperator = normalizedOperator;
      this.queryBoxes = queryBoxes;
      this.fieldName = fieldName;
    }
  }

  private static final class ExpressionOperatorBinaryExitFrame extends ExpressionValueParseFrame {
    final ParsedExpressionNodeBox box;
    final String normalizedOperator;
    final ParsedExpressionNodeBox fieldBox;
    final ParsedValueNodeBox valueBox;
    final String fieldName;

    ExpressionOperatorBinaryExitFrame(
        ParsedExpressionNodeBox box,
        String normalizedOperator,
        ParsedExpressionNodeBox fieldBox,
        ParsedValueNodeBox valueBox,
        String fieldName) {
      this.box = box;
      this.normalizedOperator = normalizedOperator;
      this.fieldBox = fieldBox;
      this.valueBox = valueBox;
      this.fieldName = fieldName;
    }
  }

  private static final class ValueEnterFrame extends ExpressionValueParseFrame {
    final Object value;
    final ParsedValueNodeBox box;
    final String fieldName;

    ValueEnterFrame(Object value, ParsedValueNodeBox box, String fieldName) {
      this.value = value;
      this.box = box;
      this.fieldName = fieldName;
    }
  }

  private static final class ValueListExitFrame extends ExpressionValueParseFrame {
    final ParsedValueNodeBox box;
    final List<ParsedValueNodeBox> childBoxes;
    final String fieldName;

    ValueListExitFrame(ParsedValueNodeBox box, List<ParsedValueNodeBox> childBoxes, String fieldName) {
      this.box = box;
      this.childBoxes = childBoxes;
      this.fieldName = fieldName;
    }
  }

  private static final class ValueMapExitFrame extends ExpressionValueParseFrame {
    final ParsedValueNodeBox box;
    final List<Map.Entry<String, ParsedValueNodeBox>> entries;
    final String fieldName;

    ValueMapExitFrame(
        ParsedValueNodeBox box,
        List<Map.Entry<String, ParsedValueNodeBox>> entries,
        String fieldName) {
      this.box = box;
      this.entries = entries;
      this.fieldName = fieldName;
    }
  }

  private static final class StageDescriptor {
    final String stageName;
    final Map<String, Object> stageOptions;

    StageDescriptor(String stageName, Map<String, Object> stageOptions) {
      this.stageName = stageName;
      this.stageOptions = stageOptions;
    }
  }

  private ReactNativeFirebaseFirestorePipelineParser() {}

  static ParsedPipelineRequest parse(ReadableMap pipeline, ReadableMap options)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (pipeline == null) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected a pipeline object.");
    }

    return parsePipelineMap(
        readableMapToJava(pipeline), options == null ? null : readableMapToJava(options));
  }

  private static ParsedPipelineRequest parsePipelineMap(
      Map<String, Object> pipeline, Map<String, Object> options)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    ParsedPipelineRequestBox rootBox = new ParsedPipelineRequestBox();
    ArrayDeque<PipelineParseFrame> stack = new ArrayDeque<>();
    stack.push(new EnterPipelineParseFrame(pipeline, options, rootBox));

    while (!stack.isEmpty()) {
      PipelineParseFrame frame = stack.pop();
      if (frame instanceof EnterPipelineParseFrame) {
        EnterPipelineParseFrame enterFrame = (EnterPipelineParseFrame) frame;
        ParsedPipelineSource source =
            parseSource(requireMap(enterFrame.pipeline, "source", "pipeline.source"));
        List<Object> stagesArray = requireArray(enterFrame.pipeline, "stages", "pipeline.stages");
        ParsedPipelineExecuteOptions parsedOptions = parseOptions(enterFrame.options);
        List<PendingParsedStage> pendingStages = new java.util.ArrayList<>(stagesArray.size());
        List<Map.Entry<Map<String, Object>, ParsedPipelineRequestBox>> nestedPipelines =
            new java.util.ArrayList<>();

        for (int i = 0; i < stagesArray.size(); i++) {
          Object stageValue = stagesArray.get(i);
          if (!(stageValue instanceof Map)) {
            throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                "pipelineExecute() expected each pipeline stage to be an object.");
          }

          @SuppressWarnings("unchecked")
          Map<String, Object> stageMap = (Map<String, Object>) stageValue;
          String fieldName = "pipeline.stages[" + i + "]";
          StageDescriptor descriptor = parseStageDescriptor(stageMap, fieldName);
          if ("union".equals(descriptor.stageName)) {
            ParsedPipelineRequestBox childBox = new ParsedPipelineRequestBox();
            pendingStages.add(new PendingUnionStage(childBox));
            nestedPipelines.add(
                new java.util.AbstractMap.SimpleEntry<>(
                    requireMap(descriptor.stageOptions, "other", fieldName + ".options.other"),
                    childBox));
          } else {
            pendingStages.add(
                new ReadyParsedStage(parseStage(descriptor.stageName, descriptor.stageOptions)));
          }
        }

        stack.push(
            new ExitPipelineParseFrame(source, pendingStages, parsedOptions, enterFrame.box));
        for (int i = nestedPipelines.size() - 1; i >= 0; i--) {
          Map.Entry<Map<String, Object>, ParsedPipelineRequestBox> nestedEntry =
              nestedPipelines.get(i);
          stack.push(new EnterPipelineParseFrame(nestedEntry.getKey(), null, nestedEntry.getValue()));
        }
        continue;
      }

      ExitPipelineParseFrame exitFrame = (ExitPipelineParseFrame) frame;
      List<ParsedPipelineStage> stages = new java.util.ArrayList<>(exitFrame.stages.size());
      for (PendingParsedStage pendingStage : exitFrame.stages) {
        if (pendingStage instanceof ReadyParsedStage) {
          stages.add(((ReadyParsedStage) pendingStage).stage);
          continue;
        }

        ParsedPipelineRequestBox childBox = ((PendingUnionStage) pendingStage).childBox;
        if (childBox.value == null) {
          throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
              "pipelineExecute() failed to parse nested union pipeline.");
        }
        stages.add(new ParsedUnionStage(childBox.value));
      }

      exitFrame.box.value =
          new ParsedPipelineRequest(exitFrame.source, stages, exitFrame.options);
    }

    if (rootBox.value == null) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected a pipeline object.");
    }
    return rootBox.value;
  }

  private static ParsedPipelineSource parseSource(Map<String, Object> source)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    String sourceType = requireNonEmptyString(source, "source", "pipeline.source.source");
    if (!SOURCE_TYPES.contains(sourceType)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() received an unknown source type.");
    }

    switch (sourceType) {
      case "collection":
        return ParsedPipelineSource.collection(
            requireNonEmptyString(source, "path", "pipeline.source.path"),
            optionalMap(source, "rawOptions", "pipeline.source.rawOptions"));
      case "collectionGroup":
        return ParsedPipelineSource.collectionGroup(
            requireNonEmptyString(source, "collectionId", "pipeline.source.collectionId"),
            optionalMap(source, "rawOptions", "pipeline.source.rawOptions"));
      case "database":
        return ParsedPipelineSource.database(
            optionalMap(source, "rawOptions", "pipeline.source.rawOptions"));
      case "documents":
        return ParsedPipelineSource.documents(
            parseDocuments(requireArray(source, "documents", "pipeline.source.documents")));
      case "query":
        return ParsedPipelineSource.query(
            requireNonEmptyString(source, "path", "pipeline.source.path"),
            requireNonEmptyString(source, "queryType", "pipeline.source.queryType"),
            requireArray(source, "filters", "pipeline.source.filters"),
            requireArray(source, "orders", "pipeline.source.orders"),
            requireMap(source, "options", "pipeline.source.options"));
      default:
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() received an unknown source type.");
    }
  }

  private static StageDescriptor parseStageDescriptor(Map<String, Object> stageMap, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object stageNameValue = stageMap.get("stage");
    if (!(stageNameValue instanceof String) || ((String) stageNameValue).isEmpty()) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + ".stage to be a non-empty string.");
    }

    String stageName = (String) stageNameValue;
    if (!KNOWN_STAGES.contains(stageName)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() received an unknown stage: " + stageName + ".");
    }

    Object optionsValue = stageMap.get("options");
    if (!(optionsValue instanceof Map)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + ".options to be an object.");
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> stageOptions = (Map<String, Object>) optionsValue;
    return new StageDescriptor(stageName, stageOptions);
  }

  private static ParsedPipelineStage parseStage(String stageName, Map<String, Object> stageOptions)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    switch (stageName) {
      case "where":
        return new ParsedWhereStage(
            parseExpressionNode(
                requireValue(stageOptions, "condition", "stage.options.condition"),
                "stage.options.condition"));
      case "select":
        return new ParsedSelectStage(
            parseSelectableNodes(
                requireArray(stageOptions, "selections", "stage.options.selections"),
                "stage.options.selections"));
      case "addFields":
        return new ParsedAddFieldsStage(
            parseSelectableNodes(
                requireArray(stageOptions, "fields", "stage.options.fields"),
                "stage.options.fields"));
      case "removeFields":
        return new ParsedRemoveFieldsStage(
            requireArray(stageOptions, "fields", "stage.options.fields"));
      case "sort":
        return new ParsedSortStage(
            parseOrderingNodes(
                requireArray(stageOptions, "orderings", "stage.options.orderings"),
                "stage.options.orderings"));
      case "limit":
        return new ParsedLimitStage(requireValue(stageOptions, "limit", "stage.options.limit"));
      case "offset":
        return new ParsedOffsetStage(requireValue(stageOptions, "offset", "stage.options.offset"));
      case "aggregate":
        return new ParsedAggregateStage(
            parseAggregateNodes(
                requireArray(stageOptions, "accumulators", "stage.options.accumulators"),
                "stage.options.accumulators"),
            optionalSelectableNodes(stageOptions, "groups", "stage.options.groups"));
      case "distinct":
        return new ParsedDistinctStage(
            parseSelectableNodes(
                requireArray(stageOptions, "groups", "stage.options.groups"),
                "stage.options.groups"));
      case "findNearest":
        return new ParsedFindNearestStage(
            requireValue(stageOptions, "field", "stage.options.field"),
            requireValue(stageOptions, "vectorValue", "stage.options.vectorValue"),
            requireString(stageOptions, "distanceMeasure", "stage.options.distanceMeasure"),
            stageOptions.get("limit"),
            optionalString(stageOptions, "distanceField"));
      case "replaceWith":
        return new ParsedReplaceWithStage(
            parseExpressionNode(
                requireValue(stageOptions, "map", "stage.options.map"), "stage.options.map"));
      case "sample":
        return new ParsedSampleStage(stageOptions.get("documents"), stageOptions.get("percentage"));
      case "union":
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() failed to parse nested union pipeline.");
      case "unnest":
        return new ParsedUnnestStage(
            parseSelectableNode(
                requireValue(stageOptions, "selectable", "stage.options.selectable"),
                "stage.options.selectable"),
            optionalString(stageOptions, "indexField"));
      case "rawStage":
        return new ParsedRawStage(
            requireNonEmptyString(stageOptions, "name", "stage.options.name"),
            stageOptions.get("params"),
            optionalMap(stageOptions, "options", "stage.options.options"));
      default:
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() received an unknown stage: " + stageName + ".");
    }
  }

  private static ParsedPipelineExecuteOptions parseOptions(Map<String, Object> options)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (options == null) {
      return new ParsedPipelineExecuteOptions(null, null);
    }

    String indexMode = null;
    if (options.containsKey("indexMode")) {
      if (!(options.get("indexMode") instanceof String)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected options.indexMode to be a string.");
      }
      indexMode = (String) options.get("indexMode");
      if (indexMode != null && !"recommended".equals(indexMode)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() only supports options.indexMode=\"recommended\".");
      }
    }

    Map<String, Object> rawOptions = optionalMap(options, "rawOptions", "options.rawOptions");
    return new ParsedPipelineExecuteOptions(indexMode, rawOptions);
  }

  private static String[] parseDocuments(List<Object> values)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (values.isEmpty()) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected pipeline.source.documents to contain at least one document"
              + " path.");
    }

    String[] parsedDocuments = new String[values.size()];
    for (int i = 0; i < values.size(); i++) {
      Object value = values.get(i);
      if (!(value instanceof String)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected pipeline.source.documents entries to be strings.");
      }
      parsedDocuments[i] = (String) value;
    }

    return parsedDocuments;
  }

  private static Map<String, Object> requireMap(
      Map<String, Object> map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object value = map.get(key);
    if (!(value instanceof Map)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be an object.");
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> nested = (Map<String, Object>) value;
    return nested;
  }

  private static List<Object> requireArray(Map<String, Object> map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object value = map.get(key);
    if (!(value instanceof List)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be an array.");
    }

    @SuppressWarnings("unchecked")
    List<Object> nested = (List<Object>) value;
    return nested;
  }

  private static List<Object> optionalArray(Map<String, Object> map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!map.containsKey(key) || map.get(key) == null) {
      return null;
    }
    return requireArray(map, key, fieldName);
  }

  private static Map<String, Object> optionalMap(
      Map<String, Object> map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!map.containsKey(key) || map.get(key) == null) {
      return null;
    }
    return requireMap(map, key, fieldName);
  }

  private static Object requireValue(Map<String, Object> map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!map.containsKey(key)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be provided.");
    }
    return map.get(key);
  }

  private static String requireString(Map<String, Object> map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object value = requireValue(map, key, fieldName);
    if (!(value instanceof String)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a string.");
    }
    return (String) value;
  }

  private static String optionalString(Map<String, Object> map, String key) {
    if (map == null || !map.containsKey(key) || map.get(key) == null) {
      return null;
    }
    Object value = map.get(key);
    return value instanceof String ? (String) value : null;
  }

  private static List<ParsedSelectableNode> parseSelectableNodes(
      List<Object> values, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    List<ParsedSelectableNode> output = new java.util.ArrayList<>(values.size());
    for (int i = 0; i < values.size(); i++) {
      output.add(parseSelectableNode(values.get(i), fieldName + "[" + i + "]"));
    }
    return output;
  }

  private static List<ParsedSelectableNode> optionalSelectableNodes(
      Map<String, Object> map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    List<Object> values = optionalArray(map, key, fieldName);
    return values == null ? null : parseSelectableNodes(values, fieldName);
  }

  private static List<ParsedOrderingNode> parseOrderingNodes(List<Object> values, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    List<ParsedOrderingNode> output = new java.util.ArrayList<>(values.size());
    for (int i = 0; i < values.size(); i++) {
      output.add(parseOrderingNode(values.get(i), fieldName + "[" + i + "]"));
    }
    return output;
  }

  private static List<ParsedAggregateNode> parseAggregateNodes(
      List<Object> values, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    List<ParsedAggregateNode> output = new java.util.ArrayList<>(values.size());
    for (int i = 0; i < values.size(); i++) {
      output.add(parseAggregateNode(values.get(i), fieldName + "[" + i + "]"));
    }
    return output;
  }

  private static ParsedSelectableNode parseSelectableNode(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof String) {
      return new ParsedSelectableNode(parseExpressionNode(value, fieldName), null, false);
    }

    if (!(value instanceof Map)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a selectable expression.");
    }

    Map<?, ?> map = (Map<?, ?>) value;
    String alias = firstString(map.get("alias"), map.get("as"), map.get("name"));
    if (alias != null && !alias.isEmpty()) {
      if (map.containsKey("path") || map.containsKey("fieldPath") || map.containsKey("segments")) {
        return new ParsedSelectableNode(
            new ParsedFieldExpressionNode(coerceFieldPath(value, fieldName + ".path")),
            alias,
            true);
      }

      Object exprValue = firstNonNull(map.get("expr"), map.get("expression"), map.get("field"));
      if (exprValue == null) {
        exprValue = value;
      }
      return new ParsedSelectableNode(
          parseExpressionNode(exprValue, fieldName + ".expr"), alias, false);
    }

    return new ParsedSelectableNode(parseExpressionNode(value, fieldName), null, false);
  }

  private static ParsedOrderingNode parseOrderingNode(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (value instanceof String) {
      return new ParsedOrderingNode(parseExpressionNode(value, fieldName), false, true);
    }

    if (!(value instanceof Map)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a string or object.");
    }

    Map<?, ?> map = (Map<?, ?>) value;
    String direction =
        map.get("direction") instanceof String ? (String) map.get("direction") : "asc";
    boolean descending = isDescendingDirection(direction);
    Object expressionValue =
        firstNonNull(
            map.get("expression"),
            map.get("expr"),
            map.get("field"),
            map.get("fieldPath"),
            map.get("path"),
            value);
    return new ParsedOrderingNode(
        parseExpressionNode(expressionValue, fieldName), descending, false);
  }

  private static ParsedAggregateNode parseAggregateNode(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!(value instanceof Map)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be an object.");
    }

    Map<?, ?> map = (Map<?, ?>) value;
    Object aggregateValue = map.containsKey("aggregate") ? map.get("aggregate") : map;
    if (!(aggregateValue instanceof Map)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + ".aggregate to be an object.");
    }

    Map<?, ?> aggregateMap = (Map<?, ?>) aggregateValue;
    String kind =
        firstString(
            aggregateMap.get("kind"),
            aggregateMap.get("name"),
            aggregateMap.get("function"),
            aggregateMap.get("op"));
    if (kind == null || kind.isEmpty()) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to include an aggregate kind.");
    }

    String alias = firstString(map.get("alias"), map.get("as"), map.get("name"));
    if (alias == null || alias.isEmpty()) {
      alias = kind.toLowerCase(java.util.Locale.ROOT);
    }

    Object expressionValue = firstNonNull(aggregateMap.get("expr"), aggregateMap.get("field"));
    if (expressionValue == null) {
      expressionValue = aggregateMap.get("value");
    }
    ParsedValueNode primaryValue =
        expressionValue == null ? null : parseValueNode(expressionValue, fieldName + ".expr");

    java.util.List<ParsedValueNode> args = new java.util.ArrayList<>();
    Object argsValue = aggregateMap.get("args");
    if (argsValue instanceof List) {
      List<?> rawArgs = (List<?>) argsValue;
      for (int i = 0; i < rawArgs.size(); i++) {
        args.add(parseValueNode(rawArgs.get(i), fieldName + ".args[" + i + "]"));
      }
    }

    return new ParsedAggregateNode(kind, alias, primaryValue, args);
  }

  private static ParsedExpressionNode parseExpressionNode(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    ParsedExpressionNodeBox rootBox = new ParsedExpressionNodeBox();
    parseExpressionValueTree(new ExpressionEnterFrame(value, rootBox, fieldName));
    if (rootBox.value == null) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be provided.");
    }
    return rootBox.value;
  }

  private static java.util.List<ParsedValueNode> parseArgumentValueNodes(
      Object argsValue, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    java.util.List<ParsedValueNode> args = new java.util.ArrayList<>();
    if (argsValue == null) {
      return args;
    }
    if (argsValue instanceof List) {
      List<?> rawArgs = (List<?>) argsValue;
      for (int i = 0; i < rawArgs.size(); i++) {
        args.add(parseValueNode(rawArgs.get(i), fieldName + "[" + i + "]"));
      }
      return args;
    }
    args.add(parseValueNode(argsValue, fieldName + "[0]"));
    return args;
  }

  private static ParsedValueNode parseValueNode(Object value, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    ParsedValueNodeBox rootBox = new ParsedValueNodeBox();
    parseExpressionValueTree(new ValueEnterFrame(value, rootBox, fieldName));
    if (rootBox.value == null) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be provided.");
    }
    return rootBox.value;
  }

  private static boolean isExpressionLike(Map<?, ?> map) {
    Object exprType = map.get("exprType");
    return exprType instanceof String
        || map.containsKey("operator")
        || map.containsKey("name")
        || map.containsKey("expr")
        || map.containsKey("expression")
        || map.containsKey("fieldPath")
        || map.containsKey("path")
        || map.containsKey("segments")
        || map.containsKey("_segments");
  }

  private static String coerceFieldPath(Object value, String fieldName)
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
        Object path = firstNonNull(map.get("path"), map.get("fieldPath"));
        if (path != null && !(path instanceof Map)) {
          currentValue = path;
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
          String pathValue = builder.toString();
          if (!pathValue.isEmpty()) {
            return pathValue;
          }
        }
      }

      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to resolve to a field path string.");
    }
  }

  private static void parseExpressionValueTree(ExpressionValueParseFrame initialFrame)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    ArrayDeque<ExpressionValueParseFrame> stack = new ArrayDeque<>();
    stack.push(initialFrame);

    while (!stack.isEmpty()) {
      ExpressionValueParseFrame frame = stack.pop();
      if (frame instanceof ExpressionEnterFrame) {
        ExpressionEnterFrame enterFrame = (ExpressionEnterFrame) frame;
        Object value = enterFrame.value;
        String fieldName = enterFrame.fieldName;

        if (value instanceof String) {
          enterFrame.box.value = new ParsedFieldExpressionNode((String) value);
          continue;
        }

        if (value instanceof Map) {
          Map<?, ?> map = (Map<?, ?>) value;
          if (map.containsKey("expr")) {
            stack.push(
                new ExpressionEnterFrame(
                    map.get("expr"), enterFrame.box, fieldName + ".expr"));
            continue;
          }
          if (map.containsKey("expression")) {
            stack.push(
                new ExpressionEnterFrame(
                    map.get("expression"), enterFrame.box, fieldName + ".expression"));
            continue;
          }

          Object operatorValue = map.get("operator");
          if (operatorValue instanceof String) {
            String normalizedOperator =
                ((String) operatorValue).toUpperCase(java.util.Locale.ROOT);
            if ("AND".equals(normalizedOperator) || "OR".equals(normalizedOperator)) {
              Object queriesValue = map.get("queries");
              if (!(queriesValue instanceof List) || ((List<?>) queriesValue).isEmpty()) {
                throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                    "pipelineExecute() expected "
                        + fieldName
                        + ".queries to contain boolean expressions.");
              }
              List<?> queries = (List<?>) queriesValue;
              List<ParsedExpressionNodeBox> queryBoxes =
                  new java.util.ArrayList<>(queries.size());
              for (int i = 0; i < queries.size(); i++) {
                queryBoxes.add(new ParsedExpressionNodeBox());
              }
              stack.push(
                  new ExpressionOperatorLogicalExitFrame(
                      enterFrame.box, normalizedOperator, queryBoxes, fieldName));
              for (int i = queries.size() - 1; i >= 0; i--) {
                stack.push(
                    new ExpressionEnterFrame(
                        queries.get(i), queryBoxes.get(i), fieldName + ".queries[" + i + "]"));
              }
              continue;
            }

            Object fieldValue = map.get("fieldPath") != null ? map.get("fieldPath") : map.get("field");
            if (fieldValue == null) {
              throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                  "pipelineExecute() expected " + fieldName + ".fieldPath to be provided.");
            }

            Object rightValue =
                map.containsKey("value")
                    ? map.get("value")
                    : map.containsKey("right") ? map.get("right") : map.get("operand");
            ParsedExpressionNodeBox fieldBox = new ParsedExpressionNodeBox();
            ParsedValueNodeBox valueBox = new ParsedValueNodeBox();
            stack.push(
                new ExpressionOperatorBinaryExitFrame(
                    enterFrame.box, normalizedOperator, fieldBox, valueBox, fieldName));
            stack.push(new ValueEnterFrame(rightValue, valueBox, fieldName + ".value"));
            stack.push(new ExpressionEnterFrame(fieldValue, fieldBox, fieldName + ".fieldPath"));
            continue;
          }

          Object exprType = map.get("exprType");
          if (exprType instanceof String) {
            String normalizedType = ((String) exprType).toLowerCase(java.util.Locale.ROOT);
            if ("field".equals(normalizedType)) {
              enterFrame.box.value = new ParsedFieldExpressionNode(coerceFieldPath(value, fieldName));
              continue;
            }
            if ("constant".equals(normalizedType)) {
              ParsedValueNodeBox valueBox = new ParsedValueNodeBox();
              stack.push(new ExpressionConstantExitFrame(enterFrame.box, valueBox, fieldName));
              stack.push(new ValueEnterFrame(map.get("value"), valueBox, fieldName + ".value"));
              continue;
            }
          }

          if (map.containsKey("name")) {
            Object nameValue = map.get("name");
            if (!(nameValue instanceof String) || ((String) nameValue).isEmpty()) {
              throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                  "pipelineExecute() expected " + fieldName + ".name to be a non-empty string.");
            }

            List<Object> rawArgs = new java.util.ArrayList<>();
            Object argsValue = map.get("args");
            if (argsValue instanceof List) {
              for (Object rawArg : (List<?>) argsValue) {
                rawArgs.add(rawArg);
              }
            } else if (argsValue != null) {
              rawArgs.add(argsValue);
            }

            List<ParsedValueNodeBox> argBoxes = new java.util.ArrayList<>(rawArgs.size());
            for (int i = 0; i < rawArgs.size(); i++) {
              argBoxes.add(new ParsedValueNodeBox());
            }
            stack.push(
                new ExpressionFunctionExitFrame(
                    enterFrame.box, (String) nameValue, argBoxes, fieldName));
            for (int i = rawArgs.size() - 1; i >= 0; i--) {
              stack.push(
                  new ValueEnterFrame(rawArgs.get(i), argBoxes.get(i), fieldName + ".args[" + i + "]"));
            }
            continue;
          }

          if (map.containsKey("fieldPath")
              || map.containsKey("path")
              || map.containsKey("segments")
              || map.containsKey("_segments")) {
            enterFrame.box.value = new ParsedFieldExpressionNode(coerceFieldPath(value, fieldName));
            continue;
          }
        }

        ParsedValueNodeBox valueBox = new ParsedValueNodeBox();
        stack.push(new ExpressionConstantExitFrame(enterFrame.box, valueBox, fieldName));
        stack.push(new ValueEnterFrame(value, valueBox, fieldName));
        continue;
      }

      if (frame instanceof ExpressionValueExitFrame) {
        ExpressionValueExitFrame exitFrame = (ExpressionValueExitFrame) frame;
        if (exitFrame.expressionBox.value == null) {
          throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
              "pipelineExecute() expected " + exitFrame.fieldName + " to be provided.");
        }
        exitFrame.valueBox.value = new ParsedExpressionValueNode(exitFrame.expressionBox.value);
        continue;
      }

      if (frame instanceof ExpressionConstantExitFrame) {
        ExpressionConstantExitFrame exitFrame = (ExpressionConstantExitFrame) frame;
        if (exitFrame.valueBox.value == null) {
          throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
              "pipelineExecute() expected " + exitFrame.fieldName + " to be provided.");
        }
        exitFrame.expressionBox.value = new ParsedConstantExpressionNode(exitFrame.valueBox.value);
        continue;
      }

      if (frame instanceof ExpressionFunctionExitFrame) {
        ExpressionFunctionExitFrame exitFrame = (ExpressionFunctionExitFrame) frame;
        List<ParsedValueNode> args = new java.util.ArrayList<>(exitFrame.argBoxes.size());
        for (int i = 0; i < exitFrame.argBoxes.size(); i++) {
          ParsedValueNode value = exitFrame.argBoxes.get(i).value;
          if (value == null) {
            throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                "pipelineExecute() expected "
                    + exitFrame.fieldName
                    + ".args["
                    + i
                    + "] to be provided.");
          }
          args.add(value);
        }
        exitFrame.box.value = new ParsedFunctionExpressionNode(exitFrame.name, args);
        continue;
      }

      if (frame instanceof ExpressionOperatorLogicalExitFrame) {
        ExpressionOperatorLogicalExitFrame exitFrame = (ExpressionOperatorLogicalExitFrame) frame;
        List<ParsedValueNode> args = new java.util.ArrayList<>(exitFrame.queryBoxes.size());
        for (int i = 0; i < exitFrame.queryBoxes.size(); i++) {
          ParsedExpressionNode expression = exitFrame.queryBoxes.get(i).value;
          if (expression == null) {
            throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                "pipelineExecute() expected "
                    + exitFrame.fieldName
                    + ".queries["
                    + i
                    + "] to be provided.");
          }
          args.add(new ParsedExpressionValueNode(expression));
        }
        exitFrame.box.value =
            new ParsedFunctionExpressionNode(
                "AND".equals(exitFrame.normalizedOperator) ? "and" : "or", args);
        continue;
      }

      if (frame instanceof ExpressionOperatorBinaryExitFrame) {
        ExpressionOperatorBinaryExitFrame exitFrame = (ExpressionOperatorBinaryExitFrame) frame;
        if (exitFrame.fieldBox.value == null) {
          throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
              "pipelineExecute() expected " + exitFrame.fieldName + ".fieldPath to be provided.");
        }
        if (exitFrame.valueBox.value == null) {
          throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
              "pipelineExecute() expected " + exitFrame.fieldName + ".value to be provided.");
        }
        List<ParsedValueNode> args = new java.util.ArrayList<>(2);
        args.add(new ParsedExpressionValueNode(exitFrame.fieldBox.value));
        args.add(exitFrame.valueBox.value);
        exitFrame.box.value =
            new ParsedFunctionExpressionNode(
                mapOperatorToFunction(exitFrame.normalizedOperator), args);
        continue;
      }

      if (frame instanceof ValueEnterFrame) {
        ValueEnterFrame enterFrame = (ValueEnterFrame) frame;
        Object value = enterFrame.value;
        String fieldName = enterFrame.fieldName;

        if (value instanceof Map) {
          Map<?, ?> map = (Map<?, ?>) value;
          if (isExpressionLike(map)) {
            ParsedExpressionNodeBox expressionBox = new ParsedExpressionNodeBox();
            stack.push(new ExpressionValueExitFrame(enterFrame.box, expressionBox, fieldName));
            stack.push(new ExpressionEnterFrame(value, expressionBox, fieldName));
            continue;
          }

          List<PendingValueEntry> pendingEntries = new java.util.ArrayList<>();
          List<Map.Entry<String, ParsedValueNodeBox>> exitEntries = new java.util.ArrayList<>();
          for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (entry.getKey() instanceof String) {
              ParsedValueNodeBox childBox = new ParsedValueNodeBox();
              String key = (String) entry.getKey();
              pendingEntries.add(new PendingValueEntry(key, entry.getValue(), childBox));
              exitEntries.add(new java.util.AbstractMap.SimpleEntry<>(key, childBox));
            }
          }
          stack.push(new ValueMapExitFrame(enterFrame.box, exitEntries, fieldName));
          for (int i = pendingEntries.size() - 1; i >= 0; i--) {
            PendingValueEntry entry = pendingEntries.get(i);
            stack.push(
                new ValueEnterFrame(entry.value, entry.box, fieldName + "." + entry.key));
          }
          continue;
        }

        if (value instanceof List) {
          List<?> list = (List<?>) value;
          List<ParsedValueNodeBox> childBoxes = new java.util.ArrayList<>(list.size());
          for (int i = 0; i < list.size(); i++) {
            childBoxes.add(new ParsedValueNodeBox());
          }
          stack.push(new ValueListExitFrame(enterFrame.box, childBoxes, fieldName));
          for (int i = list.size() - 1; i >= 0; i--) {
            stack.push(new ValueEnterFrame(list.get(i), childBoxes.get(i), fieldName + "[" + i + "]"));
          }
          continue;
        }

        enterFrame.box.value = new ParsedPrimitiveValueNode(value);
        continue;
      }

      if (frame instanceof ValueListExitFrame) {
        ValueListExitFrame exitFrame = (ValueListExitFrame) frame;
        List<ParsedValueNode> values = new java.util.ArrayList<>(exitFrame.childBoxes.size());
        for (int i = 0; i < exitFrame.childBoxes.size(); i++) {
          ParsedValueNode value = exitFrame.childBoxes.get(i).value;
          if (value == null) {
            throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
                "pipelineExecute() expected "
                    + exitFrame.fieldName
                    + "["
                    + i
                    + "] to be provided.");
          }
          values.add(value);
        }
        exitFrame.box.value = new ParsedListValueNode(values);
        continue;
      }

      ValueMapExitFrame exitFrame = (ValueMapExitFrame) frame;
      Map<String, ParsedValueNode> values = new java.util.LinkedHashMap<>();
      for (Map.Entry<String, ParsedValueNodeBox> entry : exitFrame.entries) {
        if (entry.getValue().value == null) {
          throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
              "pipelineExecute() expected "
                  + exitFrame.fieldName
                  + "."
                  + entry.getKey()
                  + " to be provided.");
        }
        values.put(entry.getKey(), entry.getValue().value);
      }
      exitFrame.box.value = new ParsedMapValueNode(values);
    }
  }

  private static String firstString(Object... values) {
    for (Object value : values) {
      if (value instanceof String && !((String) value).isEmpty()) {
        return (String) value;
      }
    }
    return null;
  }

  private static Object firstNonNull(Object... values) {
    for (Object value : values) {
      if (value != null) {
        return value;
      }
    }
    return null;
  }

  private static boolean isDescendingDirection(String direction) {
    if (direction == null) {
      return false;
    }
    String normalized = direction.toLowerCase(java.util.Locale.ROOT);
    return "desc".equals(normalized) || "descending".equals(normalized);
  }

  private static String mapOperatorToFunction(String operatorName) {
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
        return "equal_any";
      case "NOT_IN":
        return "not_equal_any";
      default:
        return operatorName.toLowerCase(java.util.Locale.ROOT);
    }
  }

  private static ReadableMap requireMap(ReadableMap map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!map.hasKey(key) || map.getType(key) != ReadableType.Map) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be an object.");
    }

    ReadableMap nested = map.getMap(key);
    if (nested == null) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be an object.");
    }

    return nested;
  }

  private static ReadableArray requireArray(ReadableMap map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!map.hasKey(key) || map.getType(key) != ReadableType.Array) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be an array.");
    }

    ReadableArray nested = map.getArray(key);
    if (nested == null) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be an array.");
    }

    return nested;
  }

  private static String requireNonEmptyString(ReadableMap map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!map.hasKey(key) || map.getType(key) != ReadableType.String) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a string.");
    }

    String value = map.getString(key);
    if (value == null || value.isEmpty()) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a non-empty string.");
    }

    return value;
  }

  private static String requireNonEmptyString(Map<String, Object> map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    Object value = map.get(key);
    if (!(value instanceof String)) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a string.");
    }

    String stringValue = (String) value;
    if (stringValue.isEmpty()) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a non-empty string.");
    }

    return stringValue;
  }

  private static Number coerceNumber(double value) {
    if (Math.floor(value) == value && value <= Long.MAX_VALUE && value >= Long.MIN_VALUE) {
      return (long) value;
    }
    return value;
  }

  private static Map<String, Object> readableMapToJava(ReadableMap readableMap) {
    Map<String, Object> output = new HashMap<>();
    ReadableMapKeySetIterator iterator = readableMap.keySetIterator();

    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      ReadableType type = readableMap.getType(key);
      if (type == ReadableType.Null) {
        output.put(key, null);
        continue;
      }

      switch (type) {
        case Boolean:
          output.put(key, readableMap.getBoolean(key));
          break;
        case Number:
          output.put(key, coerceNumber(readableMap.getDouble(key)));
          break;
        case String:
          output.put(key, readableMap.getString(key));
          break;
        case Map:
          ReadableMap nestedMap = readableMap.getMap(key);
          output.put(key, nestedMap == null ? null : readableMapToJava(nestedMap));
          break;
        case Array:
          ReadableArray nestedArray = readableMap.getArray(key);
          output.put(key, nestedArray == null ? null : readableArrayToJava(nestedArray));
          break;
        case Null:
        default:
          output.put(key, null);
          break;
      }
    }

    return output;
  }

  private static List<Object> readableArrayToJava(ReadableArray readableArray) {
    List<Object> output = new java.util.ArrayList<>();
    for (int i = 0; i < readableArray.size(); i++) {
      ReadableType type = readableArray.getType(i);
      if (type == ReadableType.Null) {
        output.add(null);
        continue;
      }

      switch (type) {
        case Boolean:
          output.add(readableArray.getBoolean(i));
          break;
        case Number:
          output.add(coerceNumber(readableArray.getDouble(i)));
          break;
        case String:
          output.add(readableArray.getString(i));
          break;
        case Map:
          ReadableMap nestedMap = readableArray.getMap(i);
          output.add(nestedMap == null ? null : readableMapToJava(nestedMap));
          break;
        case Array:
          ReadableArray nestedArray = readableArray.getArray(i);
          output.add(nestedArray == null ? null : readableArrayToJava(nestedArray));
          break;
        case Null:
        default:
          output.add(null);
          break;
      }
    }

    return output;
  }

  static final class ParsedPipelineRequest {
    final ParsedPipelineSource source;
    final List<ParsedPipelineStage> stages;
    final ParsedPipelineExecuteOptions options;

    ParsedPipelineRequest(
        ParsedPipelineSource source,
        List<ParsedPipelineStage> stages,
        ParsedPipelineExecuteOptions options) {
      this.source = source;
      this.stages = stages;
      this.options = options;
    }
  }

  static final class ParsedPipelineSource {
    final String sourceType;
    final String path;
    final String collectionId;
    final String[] documents;
    final String queryType;
    final List<Object> filters;
    final List<Object> orders;
    final Map<String, Object> options;
    final Map<String, Object> rawOptions;

    private ParsedPipelineSource(
        String sourceType,
        String path,
        String collectionId,
        String[] documents,
        String queryType,
        List<Object> filters,
        List<Object> orders,
        Map<String, Object> options,
        Map<String, Object> rawOptions) {
      this.sourceType = sourceType;
      this.path = path;
      this.collectionId = collectionId;
      this.documents = documents;
      this.queryType = queryType;
      this.filters = filters;
      this.orders = orders;
      this.options = options;
      this.rawOptions = rawOptions;
    }

    static ParsedPipelineSource collection(String path, Map<String, Object> rawOptions) {
      return new ParsedPipelineSource(
          "collection", path, null, null, null, null, null, null, rawOptions);
    }

    static ParsedPipelineSource collectionGroup(
        String collectionId, Map<String, Object> rawOptions) {
      return new ParsedPipelineSource(
          "collectionGroup", null, collectionId, null, null, null, null, null, rawOptions);
    }

    static ParsedPipelineSource database(Map<String, Object> rawOptions) {
      return new ParsedPipelineSource(
          "database", null, null, null, null, null, null, null, rawOptions);
    }

    static ParsedPipelineSource documents(String[] documents) {
      return new ParsedPipelineSource(
          "documents", null, null, documents, null, null, null, null, null);
    }

    static ParsedPipelineSource query(
        String path,
        String queryType,
        List<Object> filters,
        List<Object> orders,
        Map<String, Object> options) {
      return new ParsedPipelineSource(
          "query", path, null, null, queryType, filters, orders, options, null);
    }
  }

  static class ParsedPipelineStage {
    final String stageName;

    ParsedPipelineStage(String stageName) {
      this.stageName = stageName;
    }
  }

  static final class ParsedWhereStage extends ParsedPipelineStage {
    final ParsedExpressionNode condition;

    ParsedWhereStage(ParsedExpressionNode condition) {
      super("where");
      this.condition = condition;
    }
  }

  static final class ParsedSelectStage extends ParsedPipelineStage {
    final List<ParsedSelectableNode> selections;

    ParsedSelectStage(List<ParsedSelectableNode> selections) {
      super("select");
      this.selections = selections;
    }
  }

  static final class ParsedAddFieldsStage extends ParsedPipelineStage {
    final List<ParsedSelectableNode> fields;

    ParsedAddFieldsStage(List<ParsedSelectableNode> fields) {
      super("addFields");
      this.fields = fields;
    }
  }

  static final class ParsedRemoveFieldsStage extends ParsedPipelineStage {
    final List<Object> fields;

    ParsedRemoveFieldsStage(List<Object> fields) {
      super("removeFields");
      this.fields = fields;
    }
  }

  static final class ParsedSortStage extends ParsedPipelineStage {
    final List<ParsedOrderingNode> orderings;

    ParsedSortStage(List<ParsedOrderingNode> orderings) {
      super("sort");
      this.orderings = orderings;
    }
  }

  static final class ParsedLimitStage extends ParsedPipelineStage {
    final Object limit;

    ParsedLimitStage(Object limit) {
      super("limit");
      this.limit = limit;
    }
  }

  static final class ParsedOffsetStage extends ParsedPipelineStage {
    final Object offset;

    ParsedOffsetStage(Object offset) {
      super("offset");
      this.offset = offset;
    }
  }

  static final class ParsedAggregateStage extends ParsedPipelineStage {
    final List<ParsedAggregateNode> accumulators;
    final List<ParsedSelectableNode> groups;

    ParsedAggregateStage(
        List<ParsedAggregateNode> accumulators, List<ParsedSelectableNode> groups) {
      super("aggregate");
      this.accumulators = accumulators;
      this.groups = groups;
    }
  }

  static final class ParsedDistinctStage extends ParsedPipelineStage {
    final List<ParsedSelectableNode> groups;

    ParsedDistinctStage(List<ParsedSelectableNode> groups) {
      super("distinct");
      this.groups = groups;
    }
  }

  static final class ParsedFindNearestStage extends ParsedPipelineStage {
    final Object field;
    final Object vectorValue;
    final String distanceMeasure;
    final Object limit;
    final String distanceField;

    ParsedFindNearestStage(
        Object field,
        Object vectorValue,
        String distanceMeasure,
        Object limit,
        String distanceField) {
      super("findNearest");
      this.field = field;
      this.vectorValue = vectorValue;
      this.distanceMeasure = distanceMeasure;
      this.limit = limit;
      this.distanceField = distanceField;
    }
  }

  static final class ParsedReplaceWithStage extends ParsedPipelineStage {
    final ParsedExpressionNode map;

    ParsedReplaceWithStage(ParsedExpressionNode map) {
      super("replaceWith");
      this.map = map;
    }
  }

  static final class ParsedSampleStage extends ParsedPipelineStage {
    final Object documents;
    final Object percentage;

    ParsedSampleStage(Object documents, Object percentage) {
      super("sample");
      this.documents = documents;
      this.percentage = percentage;
    }
  }

  static final class ParsedUnionStage extends ParsedPipelineStage {
    final ParsedPipelineRequest other;

    ParsedUnionStage(ParsedPipelineRequest other) {
      super("union");
      this.other = other;
    }
  }

  static final class ParsedUnnestStage extends ParsedPipelineStage {
    final ParsedSelectableNode selectable;
    final String indexField;

    ParsedUnnestStage(ParsedSelectableNode selectable, String indexField) {
      super("unnest");
      this.selectable = selectable;
      this.indexField = indexField;
    }
  }

  static final class ParsedRawStage extends ParsedPipelineStage {
    final String name;
    final Object params;
    final Map<String, Object> options;

    ParsedRawStage(String name, Object params, Map<String, Object> options) {
      super("rawStage");
      this.name = name;
      this.params = params;
      this.options = options;
    }
  }

  abstract static class ParsedExpressionNode {}

  static final class ParsedFieldExpressionNode extends ParsedExpressionNode {
    final String path;

    ParsedFieldExpressionNode(String path) {
      this.path = path;
    }
  }

  static final class ParsedConstantExpressionNode extends ParsedExpressionNode {
    final ParsedValueNode value;

    ParsedConstantExpressionNode(ParsedValueNode value) {
      this.value = value;
    }
  }

  static final class ParsedFunctionExpressionNode extends ParsedExpressionNode {
    final String name;
    final List<ParsedValueNode> args;

    ParsedFunctionExpressionNode(String name, List<ParsedValueNode> args) {
      this.name = name;
      this.args = args;
    }
  }

  abstract static class ParsedValueNode {}

  static final class ParsedPrimitiveValueNode extends ParsedValueNode {
    final Object value;

    ParsedPrimitiveValueNode(Object value) {
      this.value = value;
    }
  }

  static final class ParsedListValueNode extends ParsedValueNode {
    final List<ParsedValueNode> values;

    ParsedListValueNode(List<ParsedValueNode> values) {
      this.values = values;
    }
  }

  static final class ParsedMapValueNode extends ParsedValueNode {
    final Map<String, ParsedValueNode> values;

    ParsedMapValueNode(Map<String, ParsedValueNode> values) {
      this.values = values;
    }
  }

  static final class ParsedExpressionValueNode extends ParsedValueNode {
    final ParsedExpressionNode expression;

    ParsedExpressionValueNode(ParsedExpressionNode expression) {
      this.expression = expression;
    }
  }

  static final class ParsedSelectableNode {
    final ParsedExpressionNode expression;
    final String alias;
    final boolean isFlatFieldAlias;

    ParsedSelectableNode(ParsedExpressionNode expression, String alias, boolean isFlatFieldAlias) {
      this.expression = expression;
      this.alias = alias;
      this.isFlatFieldAlias = isFlatFieldAlias;
    }
  }

  static final class ParsedOrderingNode {
    final ParsedExpressionNode expression;
    final boolean descending;
    final boolean fieldShortcut;

    ParsedOrderingNode(ParsedExpressionNode expression, boolean descending, boolean fieldShortcut) {
      this.expression = expression;
      this.descending = descending;
      this.fieldShortcut = fieldShortcut;
    }
  }

  static final class ParsedAggregateNode {
    final String kind;
    final String alias;
    final ParsedValueNode primaryValue;
    final List<ParsedValueNode> args;

    ParsedAggregateNode(
        String kind, String alias, ParsedValueNode primaryValue, List<ParsedValueNode> args) {
      this.kind = kind;
      this.alias = alias;
      this.primaryValue = primaryValue;
      this.args = args;
    }
  }

  static final class ParsedPipelineExecuteOptions {
    final String indexMode;
    final Map<String, Object> rawOptions;

    ParsedPipelineExecuteOptions(String indexMode, Map<String, Object> rawOptions) {
      this.indexMode = indexMode;
      this.rawOptions = rawOptions;
    }

    boolean isEmpty() {
      return indexMode == null && rawOptions == null;
    }
  }
}
