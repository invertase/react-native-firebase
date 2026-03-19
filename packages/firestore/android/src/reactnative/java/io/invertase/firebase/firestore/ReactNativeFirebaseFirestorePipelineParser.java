package io.invertase.firebase.firestore;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import java.util.Arrays;
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

  private ReactNativeFirebaseFirestorePipelineParser() {}

  static ParsedPipelineRequest parse(ReadableMap pipeline, ReadableMap options)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (pipeline == null) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected a pipeline object.");
    }

    ReadableMap sourceMap = requireMap(pipeline, "source", "pipeline.source");
    ReadableArray stagesArray = requireArray(pipeline, "stages", "pipeline.stages");

    return new ParsedPipelineRequest(
        parseSource(sourceMap), parseStages(stagesArray), parseOptions(options));
  }

  private static ParsedPipelineSource parseSource(ReadableMap source)
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
            optionalJavaMap(source, "rawOptions", "pipeline.source.rawOptions"));
      case "collectionGroup":
        return ParsedPipelineSource.collectionGroup(
            requireNonEmptyString(source, "collectionId", "pipeline.source.collectionId"),
            optionalJavaMap(source, "rawOptions", "pipeline.source.rawOptions"));
      case "database":
        return ParsedPipelineSource.database(
            optionalJavaMap(source, "rawOptions", "pipeline.source.rawOptions"));
      case "documents":
        return ParsedPipelineSource.documents(
            parseDocuments(requireArray(source, "documents", "pipeline.source.documents")));
      case "query":
        return ParsedPipelineSource.query(
            requireNonEmptyString(source, "path", "pipeline.source.path"),
            requireNonEmptyString(source, "queryType", "pipeline.source.queryType"),
            readableArrayToJava(requireArray(source, "filters", "pipeline.source.filters")),
            readableArrayToJava(requireArray(source, "orders", "pipeline.source.orders")),
            readableMapToJava(requireMap(source, "options", "pipeline.source.options")));
      default:
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() received an unknown source type.");
    }
  }

  private static List<ParsedPipelineStage> parseStages(ReadableArray stages)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    List<Object> stageValues = readableArrayToJava(stages);
    List<ParsedPipelineStage> parsedStages = new java.util.ArrayList<>(stageValues.size());

    for (int i = 0; i < stageValues.size(); i++) {
      Object stageValue = stageValues.get(i);
      if (!(stageValue instanceof Map)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected each pipeline stage to be an object.");
      }

      @SuppressWarnings("unchecked")
      Map<String, Object> stageMap = (Map<String, Object>) stageValue;
      Object stageNameValue = stageMap.get("stage");
      if (!(stageNameValue instanceof String) || ((String) stageNameValue).isEmpty()) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected each stage.stage to be a non-empty string.");
      }

      String stageName = (String) stageNameValue;
      if (!KNOWN_STAGES.contains(stageName)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() received an unknown stage: " + stageName + ".");
      }

      Object optionsValue = stageMap.get("options");
      if (!(optionsValue instanceof Map)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected each stage.options to be an object.");
      }

      @SuppressWarnings("unchecked")
      Map<String, Object> stageOptions = (Map<String, Object>) optionsValue;
      parsedStages.add(new ParsedPipelineStage(stageName, stageOptions));
    }

    return parsedStages;
  }

  private static ParsedPipelineExecuteOptions parseOptions(ReadableMap options)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (options == null) {
      return new ParsedPipelineExecuteOptions(null, null);
    }

    String indexMode = null;
    if (options.hasKey("indexMode")) {
      if (options.getType("indexMode") != ReadableType.String) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() expected options.indexMode to be a string.");
      }
      indexMode = options.getString("indexMode");
      if (indexMode != null && !"recommended".equals(indexMode)) {
        throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
            "pipelineExecute() only supports options.indexMode=\"recommended\".");
      }
    }

    Map<String, Object> rawOptions = optionalJavaMap(options, "rawOptions", "options.rawOptions");
    return new ParsedPipelineExecuteOptions(indexMode, rawOptions);
  }

  private static String[] parseDocuments(ReadableArray documents)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    List<Object> values = readableArrayToJava(documents);
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

  private static Map<String, Object> optionalJavaMap(ReadableMap map, String key, String fieldName)
      throws ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException {
    if (!map.hasKey(key) || map.getType(key) == ReadableType.Null) {
      return null;
    }
    if (map.getType(key) != ReadableType.Map) {
      throw new ReactNativeFirebaseFirestorePipelineExecutor.PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be an object.");
    }

    ReadableMap nestedMap = map.getMap(key);
    return nestedMap == null ? null : readableMapToJava(nestedMap);
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
      return new ParsedPipelineSource("database", null, null, null, null, null, null, null, rawOptions);
    }

    static ParsedPipelineSource documents(String[] documents) {
      return new ParsedPipelineSource("documents", null, null, documents, null, null, null, null, null);
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

  static final class ParsedPipelineStage {
    final String stageName;
    final Map<String, Object> options;

    ParsedPipelineStage(String stageName, Map<String, Object> options) {
      this.stageName = stageName;
      this.options = options;
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
