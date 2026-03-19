package io.invertase.firebase.firestore;

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import static io.invertase.firebase.common.ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreCommon.rejectPromiseFirestoreException;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.objectMapToWritable;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getQueryForFirestore;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.firebase.Timestamp;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Pipeline;
import com.google.firebase.firestore.PipelineResult;
import com.google.firebase.firestore.PipelineSource;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.pipeline.AggregateFunction;
import com.google.firebase.firestore.pipeline.AggregateStage;
import com.google.firebase.firestore.pipeline.AliasedAggregate;
import com.google.firebase.firestore.pipeline.BooleanExpression;
import com.google.firebase.firestore.pipeline.CollectionGroupOptions;
import com.google.firebase.firestore.pipeline.CollectionHints;
import com.google.firebase.firestore.pipeline.CollectionSourceOptions;
import com.google.firebase.firestore.pipeline.Expression;
import com.google.firebase.firestore.pipeline.FindNearestOptions;
import com.google.firebase.firestore.pipeline.FindNearestStage;
import com.google.firebase.firestore.pipeline.Ordering;
import com.google.firebase.firestore.pipeline.RawOptions;
import com.google.firebase.firestore.pipeline.RawStage;
import com.google.firebase.firestore.pipeline.SampleStage;
import com.google.firebase.firestore.pipeline.Selectable;
import com.google.firebase.firestore.pipeline.UnnestOptions;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

class ReactNativeFirebaseFirestorePipelineExecutor {
  private final FirebaseFirestore firestore;

  ReactNativeFirebaseFirestorePipelineExecutor(FirebaseFirestore firestore) {
    this.firestore = firestore;
  }

  void execute(ReadableMap pipeline, ReadableMap options, Promise promise) {
    try {
      ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineRequest request =
          ReactNativeFirebaseFirestorePipelineParser.parse(pipeline, options);
      Pipeline sdkPipeline = buildNativePipeline(request);
      Pipeline.ExecuteOptions executeOptions = buildExecuteOptions(request.options);
      Task<Pipeline.Snapshot> executeTask =
          executeOptions == null ? sdkPipeline.execute() : sdkPipeline.execute(executeOptions);
      executeTask.addOnCompleteListener(task -> resolvePipelineTask(task, promise));
    } catch (PipelineValidationException e) {
      rejectPromiseWithCodeAndMessage(promise, "invalid-argument", e.getMessage());
    } catch (Exception e) {
      rejectPromiseWithCodeAndMessage(
          promise, "unknown", "Failed to execute pipeline: " + e.getMessage());
    }
  }

  private void resolvePipelineTask(Task<Pipeline.Snapshot> task, Promise promise) {
    if (task.isSuccessful()) {
      Pipeline.Snapshot snapshot = task.getResult();
      try {
        promise.resolve(serializeSnapshot(snapshot));
      } catch (PipelineValidationException e) {
        rejectPromiseWithCodeAndMessage(promise, "unknown", e.getMessage());
      }
      return;
    }

    Exception exception = task.getException();
    if (exception != null) {
      rejectPromiseFirestoreException(promise, exception);
      return;
    }

    rejectPromiseWithCodeAndMessage(
        promise, "unknown", "Failed to execute pipeline: empty pipeline task response.");
  }

  private Pipeline buildNativePipeline(
      ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineRequest request)
      throws PipelineValidationException {
    Pipeline currentPipeline = buildSourcePipeline(request.source);

    for (ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineStage stage : request.stages) {
      currentPipeline = applyStage(currentPipeline, stage.stageName, stage.options);
    }

    return currentPipeline;
  }

  private Pipeline buildSourcePipeline(
      ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineSource source)
      throws PipelineValidationException {
    String sourceType = source.sourceType;
    PipelineSource pipelineSource = firestore.pipeline();

    if ("collection".equals(sourceType)) {
      CollectionSourceOptions options = buildCollectionSourceOptions(source.rawOptions);
      return options == null
          ? pipelineSource.collection(source.path)
          : pipelineSource.collection(firestore.collection(source.path), options);
    }

    if ("collectionGroup".equals(sourceType)) {
      CollectionGroupOptions options = buildCollectionGroupOptions(source.rawOptions);
      return options == null
          ? pipelineSource.collectionGroup(source.collectionId)
          : pipelineSource.collectionGroup(source.collectionId, options);
    }

    if ("database".equals(sourceType)) {
      return pipelineSource.database();
    }

    if ("documents".equals(sourceType)) {
      if (source.documents == null || source.documents.length == 0) {
        throw new PipelineValidationException(
            "pipelineExecute() expected pipeline.source.documents to contain at least one document"
                + " path.");
      }
      return pipelineSource.documents(source.documents);
    }

    if ("query".equals(sourceType)) {
      Query baseQuery = getQueryForFirestore(firestore, source.path, source.queryType);
      ReadableArray filters = Arguments.makeNativeArray(source.filters);
      ReadableArray orders = Arguments.makeNativeArray(source.orders);
      ReadableMap queryOptions = Arguments.makeNativeMap(source.options);
      ReactNativeFirebaseFirestoreQuery firestoreQuery =
          new ReactNativeFirebaseFirestoreQuery(
              "pipeline", "pipeline", baseQuery, filters, orders, queryOptions);
      return pipelineSource.createFrom(firestoreQuery.query);
    }

    throw new PipelineValidationException("pipelineExecute() received an unknown source type.");
  }

  private CollectionSourceOptions buildCollectionSourceOptions(Map<String, Object> rawOptions)
      throws PipelineValidationException {
    CollectionHints hints = buildCollectionHints(rawOptions);
    if (hints == null) {
      return null;
    }

    return new CollectionSourceOptions().withHints(hints);
  }

  private CollectionGroupOptions buildCollectionGroupOptions(Map<String, Object> rawOptions)
      throws PipelineValidationException {
    CollectionHints hints = buildCollectionHints(rawOptions);
    if (hints == null) {
      return null;
    }

    return new CollectionGroupOptions().withHints(hints);
  }

  private CollectionHints buildCollectionHints(Map<String, Object> rawOptions)
      throws PipelineValidationException {
    if (rawOptions == null) {
      return null;
    }

    CollectionHints hints = new CollectionHints();
    boolean hasHint = false;
    String forceIndex = optionalString(rawOptions, "forceIndex");
    if (forceIndex != null && !forceIndex.isEmpty()) {
      hints = hints.withForceIndex(forceIndex);
      hasHint = true;
    }

    if (rawOptions.containsKey("ignoreIndexFields")) {
      Object ignoreIndexFields = rawOptions.get("ignoreIndexFields");
      String[] fields =
          coerceStringList(ignoreIndexFields, "pipeline.source.rawOptions.ignoreIndexFields");
      if (fields.length > 0) {
        hints = hints.withIgnoreIndexFields(fields);
        hasHint = true;
      }
    }

    return hasHint ? hints : null;
  }

  private Pipeline.ExecuteOptions buildExecuteOptions(
      ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineExecuteOptions options)
      throws PipelineValidationException {
    if (options == null || options.isEmpty()) {
      return null;
    }

    Pipeline.ExecuteOptions executeOptions = new Pipeline.ExecuteOptions();
    boolean hasOptions = false;

    if ("recommended".equals(options.indexMode)) {
      // This continues to produce "Client specified an invalid argument" error so we throw early
      // in JS code when present
      executeOptions = executeOptions.withIndexMode(Pipeline.ExecuteOptions.IndexMode.RECOMMENDED);
      hasOptions = true;
    }

    if (options.rawOptions != null) {
      // This continues to produce "Client specified an invalid argument" error so we throw early in
      // JS code when present
      executeOptions = applyExecuteRawOptions(executeOptions, options.rawOptions);
      hasOptions = true;
    }

    return hasOptions ? executeOptions : null;
  }

  private Pipeline applyStage(Pipeline pipeline, String stageName, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    switch (stageName) {
      case "where":
        return applyWhereStage(pipeline, stageOptions);
      case "select":
        return applySelectStage(pipeline, stageOptions);
      case "addFields":
        return applyAddFieldsStage(pipeline, stageOptions);
      case "removeFields":
        return applyRemoveFieldsStage(pipeline, stageOptions);
      case "sort":
        return applySortStage(pipeline, stageOptions);
      case "limit":
        return pipeline.limit(coerceInt(stageOptions.get("limit"), "stage.options.limit"));
      case "offset":
        return pipeline.offset(coerceInt(stageOptions.get("offset"), "stage.options.offset"));
      case "aggregate":
        return applyAggregateStage(pipeline, stageOptions);
      case "distinct":
        return applyDistinctStage(pipeline, stageOptions);
      case "findNearest":
        return applyFindNearestStage(pipeline, stageOptions);
      case "replaceWith":
        return applyReplaceWithStage(pipeline, stageOptions);
      case "sample":
        return applySampleStage(pipeline, stageOptions);
      case "union":
        return applyUnionStage(pipeline, stageOptions);
      case "unnest":
        return applyUnnestStage(pipeline, stageOptions);
      case "rawStage":
        return applyRawStage(pipeline, stageOptions);
      default:
        throw new PipelineValidationException(
            "pipelineExecute() received an unknown stage: " + stageName + ".");
    }
  }

  private Pipeline applyWhereStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    Object conditionValue = stageOptions.get("condition");
    BooleanExpression condition =
        coerceBooleanExpression(conditionValue, "stage.options.condition");
    return pipeline.where(condition);
  }

  private Pipeline applySelectStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    Object selectionsValue = stageOptions.get("selections");
    List<Object> selections = coerceList(selectionsValue, "stage.options.selections");
    if (selections.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.selections to contain at least one value.");
    }

    boolean allStrings = true;
    for (Object selection : selections) {
      if (!(selection instanceof String)) {
        allStrings = false;
        break;
      }
    }

    if (allStrings) {
      String first = (String) selections.get(0);
      Object[] rest = selections.subList(1, selections.size()).toArray();
      return pipeline.select(first, (Object[]) rest);
    }

    Selectable[] selectables = new Selectable[selections.size()];
    for (int i = 0; i < selections.size(); i++) {
      selectables[i] = coerceSelectable(selections.get(i), "stage.options.selections[" + i + "]");
    }

    Selectable first = selectables[0];
    Selectable[] rest = Arrays.copyOfRange(selectables, 1, selectables.length);
    return pipeline.select(first, (Object[]) rest);
  }

  private Pipeline applyAddFieldsStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    Object fieldsValue = stageOptions.get("fields");
    List<Object> fields = coerceList(fieldsValue, "stage.options.fields");
    if (fields.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.fields to contain at least one value.");
    }

    Selectable[] selectables = new Selectable[fields.size()];
    for (int i = 0; i < fields.size(); i++) {
      selectables[i] = coerceSelectable(fields.get(i), "stage.options.fields[" + i + "]");
    }

    Selectable first = selectables[0];
    Selectable[] rest = Arrays.copyOfRange(selectables, 1, selectables.length);
    return pipeline.addFields(first, rest);
  }

  private Pipeline applyRemoveFieldsStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    Object fieldsValue = stageOptions.get("fields");
    String[] fields = coerceStringList(fieldsValue, "stage.options.fields");
    if (fields.length == 0) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.fields to contain at least one value.");
    }

    String first = fields[0];
    String[] rest = Arrays.copyOfRange(fields, 1, fields.length);
    return pipeline.removeFields(first, rest);
  }

  private Pipeline applySortStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    Object orderingsValue = stageOptions.get("orderings");
    List<Object> orderings = coerceList(orderingsValue, "stage.options.orderings");
    if (orderings.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.orderings to contain at least one value.");
    }

    Ordering[] nativeOrderings = new Ordering[orderings.size()];
    for (int i = 0; i < orderings.size(); i++) {
      nativeOrderings[i] = coerceOrdering(orderings.get(i), "stage.options.orderings[" + i + "]");
    }

    Ordering first = nativeOrderings[0];
    Ordering[] rest = Arrays.copyOfRange(nativeOrderings, 1, nativeOrderings.length);
    return pipeline.sort(first, rest);
  }

  private Pipeline applyAggregateStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    Object accumulatorsValue = stageOptions.get("accumulators");
    List<Object> accumulators = coerceList(accumulatorsValue, "stage.options.accumulators");
    if (accumulators.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.accumulators to contain at least one value.");
    }

    AliasedAggregate[] aliasedAggregates = new AliasedAggregate[accumulators.size()];
    for (int i = 0; i < accumulators.size(); i++) {
      aliasedAggregates[i] =
          coerceAliasedAggregate(accumulators.get(i), "stage.options.accumulators[" + i + "]");
    }

    AliasedAggregate firstAccumulator = aliasedAggregates[0];
    AliasedAggregate[] restAccumulators =
        Arrays.copyOfRange(aliasedAggregates, 1, aliasedAggregates.length);
    AggregateStage aggregateStage =
        AggregateStage.withAccumulators(firstAccumulator, restAccumulators);

    if (stageOptions.containsKey("groups")) {
      List<Object> groups = coerceList(stageOptions.get("groups"), "stage.options.groups");
      if (!groups.isEmpty()) {
        boolean allStrings = true;
        for (Object group : groups) {
          if (!(group instanceof String)) {
            allStrings = false;
            break;
          }
        }

        if (allStrings) {
          String firstGroup = (String) groups.get(0);
          Object[] restGroups = groups.subList(1, groups.size()).toArray();
          aggregateStage = aggregateStage.withGroups(firstGroup, restGroups);
        } else {
          Selectable[] selectableGroups = new Selectable[groups.size()];
          for (int i = 0; i < groups.size(); i++) {
            selectableGroups[i] =
                coerceSelectable(groups.get(i), "stage.options.groups[" + i + "]");
          }
          Selectable firstGroup = selectableGroups[0];
          Object[] restGroups = Arrays.copyOfRange(selectableGroups, 1, selectableGroups.length);
          aggregateStage = aggregateStage.withGroups(firstGroup, restGroups);
        }
      }
    }

    return pipeline.aggregate(aggregateStage);
  }

  private Pipeline applyDistinctStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    Object groupsValue = stageOptions.get("groups");
    List<Object> groups = coerceList(groupsValue, "stage.options.groups");
    if (groups.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.groups to contain at least one value.");
    }

    boolean allStrings = true;
    for (Object group : groups) {
      if (!(group instanceof String)) {
        allStrings = false;
        break;
      }
    }

    if (allStrings) {
      String first = (String) groups.get(0);
      Object[] rest = groups.subList(1, groups.size()).toArray();
      return pipeline.distinct(first, rest);
    }

    Selectable[] selectables = new Selectable[groups.size()];
    for (int i = 0; i < groups.size(); i++) {
      selectables[i] = coerceSelectable(groups.get(i), "stage.options.groups[" + i + "]");
    }

    Selectable first = selectables[0];
    Object[] rest = Arrays.copyOfRange(selectables, 1, selectables.length);
    return pipeline.distinct(first, rest);
  }

  private Pipeline applyFindNearestStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    String fieldPath = coerceFieldPath(stageOptions.get("field"), "stage.options.field");
    double[] vector = coerceVectorValue(stageOptions.get("vectorValue"));
    FindNearestStage.DistanceMeasure distanceMeasure =
        coerceDistanceMeasure(
            optionalString(stageOptions, "distanceMeasure"), "stage.options.distanceMeasure");

    boolean hasOptions =
        stageOptions.containsKey("limit") || stageOptions.containsKey("distanceField");
    if (!hasOptions) {
      return pipeline.findNearest(fieldPath, vector, distanceMeasure);
    }

    FindNearestOptions options = new FindNearestOptions();
    if (stageOptions.containsKey("limit")) {
      options = options.withLimit(coerceLong(stageOptions.get("limit"), "stage.options.limit"));
    }
    String distanceField = optionalString(stageOptions, "distanceField");
    if (distanceField != null && !distanceField.isEmpty()) {
      options = options.withDistanceField(distanceField);
    }

    return pipeline.findNearest(fieldPath, Expression.vector(vector), distanceMeasure, options);
  }

  private Pipeline applyReplaceWithStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    Object mapValue = stageOptions.get("map");
    if (mapValue instanceof String) {
      return pipeline.replaceWith((String) mapValue);
    }

    Expression expression = coerceExpression(mapValue, "stage.options.map");
    return pipeline.replaceWith(expression);
  }

  private Pipeline applySampleStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    if (stageOptions.containsKey("documents")) {
      int documents = coerceInt(stageOptions.get("documents"), "stage.options.documents");
      return pipeline.sample(documents);
    }

    if (stageOptions.containsKey("percentage")) {
      double percentage = coerceDouble(stageOptions.get("percentage"), "stage.options.percentage");
      return pipeline.sample(SampleStage.withPercentage(percentage));
    }

    throw new PipelineValidationException(
        "pipelineExecute() expected sample stage to include documents or percentage.");
  }

  private Pipeline applyUnionStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    Object otherValue = stageOptions.get("other");
    if (!(otherValue instanceof Map)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.other to be a serialized pipeline object.");
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> otherPipeline = (Map<String, Object>) otherValue;
    ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineRequest otherRequest =
        ReactNativeFirebaseFirestorePipelineParser.parse(
            Arguments.makeNativeMap(otherPipeline), null);
    Pipeline otherPipelineInstance = buildNativePipeline(otherRequest);
    return pipeline.union(otherPipelineInstance);
  }

  private Pipeline applyUnnestStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    Object selectableValue = stageOptions.get("selectable");
    Selectable selectable = coerceSelectable(selectableValue, "stage.options.selectable");

    String indexField = optionalString(stageOptions, "indexField");
    if (indexField == null || indexField.isEmpty()) {
      return pipeline.unnest(selectable);
    }

    UnnestOptions options = new UnnestOptions().withIndexField(indexField);
    return pipeline.unnest(selectable, options);
  }

  private Pipeline applyRawStage(Pipeline pipeline, Map<String, Object> stageOptions)
      throws PipelineValidationException {
    String stageName = requireNonEmptyString(stageOptions, "name", "stage.options.name");
    RawStage rawStage = RawStage.ofName(stageName);

    if (stageOptions.containsKey("params")) {
      Object paramsValue = stageOptions.get("params");
      if (paramsValue instanceof List) {
        Object[] args = ((List<?>) paramsValue).toArray();
        rawStage = rawStage.withArguments(args);
      } else {
        rawStage = rawStage.withArguments(paramsValue);
      }
    }

    if (stageOptions.containsKey("options") && stageOptions.get("options") instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> rawStageOptions = (Map<String, Object>) stageOptions.get("options");
      rawStage = applyPrimitiveRawStageOptions(rawStage, rawStageOptions);
    }

    return pipeline.rawStage(rawStage);
  }

  private <T extends com.google.firebase.firestore.pipeline.AbstractOptions<T>>
      T applyPrimitiveRawOptions(T options, Map<String, Object> rawOptions)
          throws PipelineValidationException {
    for (Map.Entry<String, Object> entry : rawOptions.entrySet()) {
      String key = entry.getKey();
      Object rawValue = entry.getValue();
      if (rawValue == null) {
        continue;
      }
      if (rawValue instanceof Boolean) {
        options = options.with(key, (Boolean) rawValue);
        continue;
      }
      if (rawValue instanceof String) {
        options = options.with(key, (String) rawValue);
        continue;
      }
      if (rawValue instanceof Number) {
        Number numberValue = (Number) rawValue;
        if (numberValue instanceof Double || numberValue instanceof Float) {
          options = options.with(key, numberValue.doubleValue());
        } else {
          options = options.with(key, numberValue.longValue());
        }
        continue;
      }
      if (rawValue instanceof List) {
        throw new PipelineValidationException(
            "pipelineExecute() received an unsupported raw option array for key: " + key + ".");
      }
      if (rawValue instanceof Map) {
        String fieldPath = coerceFieldPath(rawValue, "options.rawOptions." + key);
        options = options.with(key, Expression.field(fieldPath));
        continue;
      }

      throw new PipelineValidationException(
          "pipelineExecute() received an unsupported raw option value for key: " + key + ".");
    }

    return options;
  }

  private Pipeline.ExecuteOptions applyExecuteRawOptions(
      Pipeline.ExecuteOptions options, Map<String, Object> rawOptions) throws PipelineValidationException {
    for (Map.Entry<String, Object> entry : rawOptions.entrySet()) {
      String rawKey = entry.getKey();
      String key = normalizeRawOptionKey(rawKey);
      Object rawValue = entry.getValue();
      if (rawValue == null) {
        continue;
      }
      if (rawValue instanceof Boolean) {
        options = options.with(key, (Boolean) rawValue);
        continue;
      }
      if (rawValue instanceof String) {
        options = options.with(key, (String) rawValue);
        continue;
      }
      if (rawValue instanceof Number) {
        Number numberValue = (Number) rawValue;
        if (numberValue instanceof Double || numberValue instanceof Float) {
          options = options.with(key, numberValue.doubleValue());
        } else {
          options = options.with(key, numberValue.longValue());
        }
        continue;
      }
      if (rawValue instanceof Map) {
        @SuppressWarnings("unchecked")
        Map<String, Object> nestedMap = (Map<String, Object>) rawValue;
        options = options.with(key, toRawOptions(nestedMap, "options.rawOptions." + rawKey));
        continue;
      }
      if (rawValue instanceof List) {
        throw new PipelineValidationException(
            "pipelineExecute() received an unsupported raw option array for key: " + rawKey + ".");
      }

      throw new PipelineValidationException(
          "pipelineExecute() received an unsupported raw option value for key: " + rawKey + ".");
    }

    return options;
  }

  private RawOptions toRawOptions(Map<String, Object> rawOptions, String fieldName)
      throws PipelineValidationException {
    RawOptions options = RawOptions.DEFAULT;
    for (Map.Entry<String, Object> entry : rawOptions.entrySet()) {
      String rawKey = entry.getKey();
      String key = normalizeRawOptionKey(rawKey);
      Object rawValue = entry.getValue();
      if (rawValue == null) {
        continue;
      }
      if (rawValue instanceof Boolean) {
        options = options.with(key, (Boolean) rawValue);
        continue;
      }
      if (rawValue instanceof String) {
        options = options.with(key, (String) rawValue);
        continue;
      }
      if (rawValue instanceof Number) {
        Number numberValue = (Number) rawValue;
        if (numberValue instanceof Double || numberValue instanceof Float) {
          options = options.with(key, numberValue.doubleValue());
        } else {
          options = options.with(key, numberValue.longValue());
        }
        continue;
      }
      if (rawValue instanceof Map) {
        @SuppressWarnings("unchecked")
        Map<String, Object> nestedMap = (Map<String, Object>) rawValue;
        options = options.with(key, toRawOptions(nestedMap, fieldName + "." + rawKey));
        continue;
      }
      if (rawValue instanceof List) {
        throw new PipelineValidationException(
            "pipelineExecute() received an unsupported raw option array for key: " + rawKey + ".");
      }

      throw new PipelineValidationException(
          "pipelineExecute() received an unsupported raw option value for key: " + rawKey + ".");
    }

    return options;
  }

  private String normalizeRawOptionKey(String key) {
    if (key == null || key.isEmpty()) {
      return key;
    }

    StringBuilder normalized = new StringBuilder();
    for (int i = 0; i < key.length(); i++) {
      char character = key.charAt(i);
      if (Character.isUpperCase(character)) {
        if (i > 0) {
          normalized.append('_');
        }
        normalized.append(Character.toLowerCase(character));
      } else {
        normalized.append(character);
      }
    }
    return normalized.toString();
  }

  private RawStage applyPrimitiveRawStageOptions(RawStage rawStage, Map<String, Object> options)
      throws PipelineValidationException {
    for (Map.Entry<String, Object> entry : options.entrySet()) {
      String key = entry.getKey();
      Object rawValue = entry.getValue();
      if (rawValue == null) {
        continue;
      }
      if (rawValue instanceof Boolean) {
        rawStage = rawStage.withOption(key, (Boolean) rawValue);
        continue;
      }
      if (rawValue instanceof String) {
        rawStage = rawStage.withOption(key, (String) rawValue);
        continue;
      }
      if (rawValue instanceof Number) {
        Number numberValue = (Number) rawValue;
        if (numberValue instanceof Double || numberValue instanceof Float) {
          rawStage = rawStage.withOption(key, numberValue.doubleValue());
        } else {
          rawStage = rawStage.withOption(key, numberValue.longValue());
        }
        continue;
      }
      if (rawValue instanceof Map) {
        String fieldPath = coerceFieldPath(rawValue, "stage.options.options." + key);
        rawStage = rawStage.withOption(key, Expression.field(fieldPath));
        continue;
      }

      throw new PipelineValidationException(
          "pipelineExecute() received an unsupported raw stage option value for key: " + key + ".");
    }

    return rawStage;
  }

  private WritableMap serializeSnapshot(Pipeline.Snapshot snapshot)
      throws PipelineValidationException {
    WritableMap map = Arguments.createMap();
    WritableArray results = Arguments.createArray();
    List<PipelineResult> pipelineResults = snapshot != null ? snapshot.getResults() : null;

    if (pipelineResults != null) {
      for (PipelineResult result : pipelineResults) {
        results.pushMap(serializeResult(result));
      }
    }

    map.putArray("results", results);
    if (snapshot != null) {
      WritableMap executionTime = serializeTimestamp(snapshot.getExecutionTime());
      if (executionTime == null) {
        throw new PipelineValidationException(
            "pipelineExecute() expected native snapshot to include executionTime.");
      }
      map.putMap("executionTime", executionTime);
    }
    return map;
  }

  private WritableMap serializeResult(PipelineResult result) {
    WritableMap map = Arguments.createMap();
    if (result == null) {
      return map;
    }

    DocumentReference reference = result.getRef();
    if (reference != null) {
      map.putString("path", reference.getPath());
    }

    String id = result.getId();
    if (id != null) {
      map.putString("id", id);
    } else {
      map.putNull("id");
    }

    Map<String, Object> data = result.getData();
    if (data != null) {
      Object normalizedData = unwrapPipelineResultValue(data);
      if (normalizedData instanceof Map) {
        map.putMap("data", objectMapToWritable((Map<String, Object>) normalizedData));
      }
    }

    WritableMap createTime = serializeTimestamp(result.getCreateTime());
    if (createTime != null) {
      map.putMap("createTime", createTime);
    } else {
      map.putNull("createTime");
    }

    WritableMap updateTime = serializeTimestamp(result.getUpdateTime());
    if (updateTime != null) {
      map.putMap("updateTime", updateTime);
    } else {
      map.putNull("updateTime");
    }

    return map;
  }

  private WritableMap serializeTimestamp(Timestamp timestamp) {
    if (timestamp == null) {
      return null;
    }

    WritableMap map = Arguments.createMap();
    map.putDouble("seconds", timestamp.getSeconds());
    map.putInt("nanoseconds", timestamp.getNanoseconds());
    return map;
  }

  private Object unwrapPipelineResultValue(Object value) {
    if (value instanceof List) {
      List<?> listValue = (List<?>) value;
      List<Object> normalized = new java.util.ArrayList<>(listValue.size());
      for (Object item : listValue) {
        normalized.add(unwrapPipelineResultValue(item));
      }
      return normalized;
    }

    if (!(value instanceof Map)) {
      return value;
    }

    Map<?, ?> mapValue = (Map<?, ?>) value;
    Object exprType = mapValue.get("exprType");
    if (exprType instanceof String && ((String) exprType).equalsIgnoreCase("constant")) {
      return unwrapPipelineResultValue(mapValue.get("value"));
    }

    Map<String, Object> normalized = new java.util.LinkedHashMap<>();
    for (Map.Entry<?, ?> entry : mapValue.entrySet()) {
      if (entry.getKey() instanceof String) {
        normalized.put((String) entry.getKey(), unwrapPipelineResultValue(entry.getValue()));
      }
    }
    return normalized;
  }

  private Object getJavaValue(ReadableMap map, String key) {
    if (map == null || !map.hasKey(key)) {
      return null;
    }

    ReadableType type = map.getType(key);
    if (type == ReadableType.Null) {
      return null;
    }

    switch (type) {
      case Boolean:
        return map.getBoolean(key);
      case Number:
        return coerceNumber(map.getDouble(key));
      case String:
        return map.getString(key);
      case Map:
        ReadableMap nestedMap = map.getMap(key);
        return nestedMap == null ? null : readableMapToJava(nestedMap);
      case Array:
        ReadableArray nestedArray = map.getArray(key);
        return nestedArray == null ? null : readableArrayToJava(nestedArray);
      case Null:
      default:
        return null;
    }
  }

  private Map<String, Object> readableMapToJava(ReadableMap readableMap) {
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
      }
    }

    return output;
  }

  private List<Object> readableArrayToJava(ReadableArray readableArray) {
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

  private Number coerceNumber(double value) {
    if (Math.floor(value) == value && value <= Long.MAX_VALUE && value >= Long.MIN_VALUE) {
      return (long) value;
    }
    return value;
  }

  private String optionalString(Map<String, Object> map, String key) {
    if (map == null || !map.containsKey(key) || map.get(key) == null) {
      return null;
    }

    Object value = map.get(key);
    if (!(value instanceof String)) {
      return null;
    }

    return (String) value;
  }

  private String requireNonEmptyString(Map<String, Object> map, String key, String fieldName)
      throws PipelineValidationException {
    validateNonEmptyString(map, key, fieldName);
    return (String) map.get(key);
  }

  private int coerceInt(Object value, String fieldName) throws PipelineValidationException {
    if (!(value instanceof Number)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a number.");
    }
    return ((Number) value).intValue();
  }

  private long coerceLong(Object value, String fieldName) throws PipelineValidationException {
    if (!(value instanceof Number)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a number.");
    }
    return ((Number) value).longValue();
  }

  private double coerceDouble(Object value, String fieldName) throws PipelineValidationException {
    if (!(value instanceof Number)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a number.");
    }
    return ((Number) value).doubleValue();
  }

  private List<Object> coerceList(Object value, String fieldName)
      throws PipelineValidationException {
    if (!(value instanceof List)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be an array.");
    }
    return (List<Object>) value;
  }

  private String[] coerceStringList(Object value, String fieldName)
      throws PipelineValidationException {
    List<Object> list = coerceList(value, fieldName);
    String[] values = new String[list.size()];
    for (int i = 0; i < list.size(); i++) {
      Object entry = list.get(i);
      if (!(entry instanceof String)) {
        throw new PipelineValidationException(
            "pipelineExecute() expected " + fieldName + " values to be strings.");
      }
      values[i] = (String) entry;
    }
    return values;
  }

  private String coerceFieldPath(Object value, String fieldName)
      throws PipelineValidationException {
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
            throw new PipelineValidationException(
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

    throw new PipelineValidationException(
        "pipelineExecute() expected " + fieldName + " to resolve to a field path string.");
  }

  private Expression coerceExpression(Object value, String fieldName)
      throws PipelineValidationException {
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

    throw new PipelineValidationException(
        "pipelineExecute() could not convert " + fieldName + " into a pipeline expression.");
  }

  private Expression rawFunctionFromMap(Map<?, ?> map, String fieldName)
      throws PipelineValidationException {
    Object nameValue = map.get("name");
    if (!(nameValue instanceof String) || ((String) nameValue).isEmpty()) {
      throw new PipelineValidationException(
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
      String functionName, List<Object> args, String fieldName) throws PipelineValidationException {
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
      throws PipelineValidationException {
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
      throws PipelineValidationException {
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
        throw new PipelineValidationException(
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
        throw new PipelineValidationException(
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
      throws PipelineValidationException {
    if (args.size() < 2) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + "." + functionName + " to include at least 2 arguments.");
    }

    Expression left = coerceExpression(args.get(0), fieldName + ".args[0]");
    Expression[] others = new Expression[args.size() - 1];
    for (int i = 1; i < args.size(); i++) {
      others[i - 1] = coerceExpression(args.get(i), fieldName + ".args[" + i + "]");
    }

    return maximum ? left.logicalMaximum(others) : left.logicalMinimum(others);
  }

  private Expression buildMapGetExpression(List<Object> args, String fieldName)
      throws PipelineValidationException {
    Expression mapExpr = coerceExpression(args.get(0), fieldName + ".args[0]");
    Object keyValue = unwrapSerializedConstant(args.get(1));
    if (keyValue instanceof String) {
      return mapExpr.mapGet((String) keyValue);
    }
    return mapExpr.mapGet(coerceExpression(args.get(1), fieldName + ".args[1]"));
  }

  private Expression buildMapMergeExpression(List<Object> args, String functionName, String fieldName)
      throws PipelineValidationException {
    if (args.size() < 2) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + "." + functionName + " to include at least 2 arguments.");
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
      throws PipelineValidationException {
    Expression arrayExpr = coerceExpression(args.get(0), fieldName + ".args[0]");
    Object indexValue = unwrapSerializedConstant(args.get(1));
    if (indexValue instanceof Number) {
      return arrayExpr.arrayGet(((Number) indexValue).intValue());
    }
    return arrayExpr.arrayGet(coerceExpression(args.get(1), fieldName + ".args[1]"));
  }

  private Expression buildArrayConcatExpression(List<Object> args, String functionName, String fieldName)
      throws PipelineValidationException {
    if (args.size() < 2) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + "." + functionName + " to include at least 2 arguments.");
    }

    Expression arrayExpr = coerceExpression(args.get(0), fieldName + ".args[0]");
    Object secondValue = toRawValueOrExpression(args.get(1), fieldName + ".args[1]");
    Object[] rest = new Object[Math.max(0, args.size() - 2)];
    for (int i = 2; i < args.size(); i++) {
      rest[i - 2] = toRawValueOrExpression(args.get(i), fieldName + ".args[" + i + "]");
    }
    return arrayExpr.arrayConcat(secondValue, rest);
  }

  private Expression buildVectorDistanceExpression(
      String functionName, List<Object> args, String fieldName) throws PipelineValidationException {
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

  private Expression buildTimestampMathExpression(
      boolean addition, List<Object> args, String fieldName) throws PipelineValidationException {
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
      throws PipelineValidationException {
    Expression base = coerceExpression(args.get(0), fieldName + ".args[0]");
    Object granularityValue = unwrapSerializedConstant(args.get(1));
    if (granularityValue instanceof String) {
      return base.timestampTruncate((String) granularityValue);
    }
    return base.timestampTruncate(coerceExpression(args.get(1), fieldName + ".args[1]"));
  }

  private void requireArgumentCount(
      List<Object> args, int expectedCount, String functionName, String fieldName)
      throws PipelineValidationException {
    if (args.size() != expectedCount) {
      throw new PipelineValidationException(
          "pipelineExecute() expected "
              + fieldName
              + "."
              + functionName
              + " to include exactly "
              + expectedCount
              + " arguments.");
    }
  }

  private String coerceStringLiteral(Object value, String fieldName) throws PipelineValidationException {
    Object rawValue = unwrapSerializedConstant(value);
    if (rawValue instanceof String) {
      return (String) rawValue;
    }
    throw new PipelineValidationException(
        "pipelineExecute() expected " + fieldName + " to resolve to a string.");
  }

  private Object toRawValueOrExpression(Object value, String fieldName) throws PipelineValidationException {
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

  /**
   * Normalize JS/camelCase function names to Firestore backend wire names (snake_case). For
   * example: isAbsent -> is_absent, mapGet -> map_get, timestampToUnixMillis ->
   * timestamp_to_unix_millis. Explicit overrides handle names whose JS canonical form differs from
   * a straight camelCase conversion (e.g. toLower/lower both map to to_lower).
   */
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

    // General camelCase -> snake_case: insert '_' before each uppercase letter and lowercase it.
    // Single-word lowercase names (add, exists, map, trim, etc.) pass through unchanged.
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

  private Expression constantExpression(Object value) throws PipelineValidationException {
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

    // For Map values (e.g. from map({key: constant('v')})), recursively unwrap any serialized
    // Constant expression nodes so toExprOrConstant sees plain primitive values rather than
    // nested expression descriptor objects.
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

  /**
   * Recursively unwraps a serialized Constant expression node back to its raw value. Non-constant
   * expression nodes (Fields, Functions) are returned unchanged.
   */
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

  private Selectable coerceSelectable(Object value, String fieldName)
      throws PipelineValidationException {
    if (value instanceof Selectable) {
      return (Selectable) value;
    }

    if (value instanceof String) {
      return Expression.field((String) value);
    }

    if (value instanceof Map) {
      Map<?, ?> map = (Map<?, ?>) value;
      String alias = firstString(map.get("alias"), map.get("as"), map.get("name"));

      // Flat form: { path, alias, as } from JS for field(path).as(alias) so no nested expr.
      if (alias != null
          && !alias.isEmpty()
          && (map.containsKey("path")
              || map.containsKey("fieldPath")
              || map.containsKey("segments"))) {
        try {
          String path = coerceFieldPath(map, fieldName + ".path");
          if (path != null && !path.isEmpty()) {
            return Expression.field(path).alias(alias);
          }
        } catch (PipelineValidationException e) {
          // Fall through to nested expr handling.
        }
      }

      Object exprValue = firstNonNull(map.get("expr"), map.get("expression"), map.get("field"));
      if (exprValue == null) {
        exprValue = value;
      }
      Expression expr = coerceExpression(exprValue, fieldName + ".expr");
      if (alias != null && !alias.isEmpty()) {
        return expr.alias(alias);
      }
      if (expr instanceof Selectable) {
        return (Selectable) expr;
      }
      throw new PipelineValidationException(
          "pipelineExecute() expected "
              + fieldName
              + " to include an alias for computed expressions.");
    }

    Expression expr = coerceExpression(value, fieldName);
    if (expr instanceof Selectable) {
      return (Selectable) expr;
    }

    throw new PipelineValidationException(
        "pipelineExecute() expected " + fieldName + " to resolve to a selectable expression.");
  }

  private Ordering coerceOrdering(Object value, String fieldName)
      throws PipelineValidationException {
    if (value instanceof Ordering) {
      return (Ordering) value;
    }

    if (value instanceof String) {
      return Ordering.ascending((String) value);
    }

    if (!(value instanceof Map)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a string or object.");
    }

    Map<?, ?> map = (Map<?, ?>) value;
    String direction =
        map.get("direction") instanceof String ? (String) map.get("direction") : "asc";
    boolean descending = isDescendingDirection(direction);

    if (map.containsKey("fieldPath") || map.containsKey("path") || map.containsKey("segments")) {
      String fieldPath = coerceFieldPath(map, fieldName + ".fieldPath");
      return descending ? Ordering.descending(fieldPath) : Ordering.ascending(fieldPath);
    }

    Object expressionValue =
        map.containsKey("expression") ? map.get("expression") : map.get("expr");
    if (expressionValue == null) {
      expressionValue = map.get("field");
    }

    Expression expression = coerceExpression(expressionValue, fieldName + ".expr");
    return descending ? expression.descending() : expression.ascending();
  }

  private boolean isDescendingDirection(String direction) {
    if (direction == null) {
      return false;
    }
    String normalized = direction.toLowerCase(Locale.ROOT);
    return "desc".equals(normalized) || "descending".equals(normalized);
  }

  private BooleanExpression coerceBooleanExpression(Object value, String fieldName)
      throws PipelineValidationException {
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

    throw new PipelineValidationException(
        "pipelineExecute() expected " + fieldName + " to resolve to a boolean expression.");
  }

  private BooleanExpression booleanExpressionFromFunction(
      String functionName, List<Object> args, String fieldName) throws PipelineValidationException {
    String normalizedName = functionName.toLowerCase(Locale.ROOT);

    if ("and".equals(normalizedName) || "or".equals(normalizedName)) {
      if (args == null || args.isEmpty()) {
        throw new PipelineValidationException(
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
        throw new PipelineValidationException(
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
    return BooleanExpression.rawFunction(
        normalizeExpressionFunctionName(functionName), expressions);
  }

  private BooleanExpression booleanExpressionFromOperatorMap(
      Map<?, ?> map, String operator, String fieldName) throws PipelineValidationException {
    String normalizedOperator = operator.toUpperCase(Locale.ROOT);
    if ("AND".equals(normalizedOperator) || "OR".equals(normalizedOperator)) {
      Object queriesValue = map.get("queries");
      if (!(queriesValue instanceof List) || ((List<?>) queriesValue).isEmpty()) {
        throw new PipelineValidationException(
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
        throw new PipelineValidationException(
            "Client specified an invalid argument. pipelineExecute() expected "
                + fieldName
                + ".value to be an array for operator IN.");
      }
      return fieldExpression.equalAny((List<?>) rightValue);
    }
    if ("NOT_IN".equals(normalizedOperator)) {
      if (!(rightValue instanceof List)) {
        throw new PipelineValidationException(
            "Client specified an invalid argument. pipelineExecute() expected "
                + fieldName
                + ".value to be an array for operator NOT_IN.");
      }
      return fieldExpression.notEqualAny((List<?>) rightValue);
    }

    throw new PipelineValidationException(
        "pipelineExecute() received unsupported where operator: " + operator + ".");
  }

  private interface ComparisonFn {
    BooleanExpression apply(Object value);
  }

  private BooleanExpression applyComparison(ComparisonFn fn, Object rawValue)
      throws PipelineValidationException {
    if (rawValue instanceof Map) {
      return fn.apply(coerceExpression(rawValue, "stage.options.condition.value"));
    }
    return fn.apply(rawValue);
  }

  private BooleanExpression applyArrayContains(
      Expression expression, Object value, String fieldName) throws PipelineValidationException {
    if (value instanceof Map) {
      return expression.arrayContains(coerceExpression(value, fieldName + ".value"));
    }
    return expression.arrayContains(value);
  }

  private BooleanExpression applyArrayContainsAny(
      Expression expression, Object value, String fieldName) throws PipelineValidationException {
    if (value instanceof List) {
      return expression.arrayContainsAny((List<?>) value);
    }
    return expression.arrayContainsAny(coerceExpression(value, fieldName + ".value"));
  }

  private BooleanExpression applyArrayContainsAll(
      Expression expression, Object value, String fieldName) throws PipelineValidationException {
    if (value instanceof List) {
      return expression.arrayContainsAll((List<?>) value);
    }
    return expression.arrayContainsAll(coerceExpression(value, fieldName + ".value"));
  }

  private AliasedAggregate coerceAliasedAggregate(Object value, String fieldName)
      throws PipelineValidationException {
    if (!(value instanceof Map)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be an object.");
    }

    Map<?, ?> map = (Map<?, ?>) value;
    Object aggregateValue = map.containsKey("aggregate") ? map.get("aggregate") : map;
    if (!(aggregateValue instanceof Map)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + ".aggregate to be an object.");
    }

    Map<?, ?> aggregate = (Map<?, ?>) aggregateValue;
    String kind =
        firstString(
            aggregate.get("kind"),
            aggregate.get("name"),
            aggregate.get("function"),
            aggregate.get("op"));
    if (kind == null || kind.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to include an aggregate kind.");
    }

    String alias = firstString(map.get("alias"), map.get("as"), map.get("name"));
    if (alias == null || alias.isEmpty()) {
      alias = kind.toLowerCase(Locale.ROOT);
    }

    AggregateFunction function = buildAggregateFunction(kind, aggregate, fieldName);
    return function.alias(alias);
  }

  private AggregateFunction buildAggregateFunction(
      String kind, Map<?, ?> aggregate, String fieldName) throws PipelineValidationException {
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
          throw new PipelineValidationException(
              "pipelineExecute() expected " + fieldName + ".expr for countIf aggregate.");
        }
        return AggregateFunction.countIf(
            coerceBooleanExpression(expressionValue, fieldName + ".expr"));
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

  private interface AggregateWithString {
    AggregateFunction apply(String expression);
  }

  private interface AggregateWithExpression {
    AggregateFunction apply(Expression expression);
  }

  private AggregateFunction aggregateWithExpression(
      Object value,
      AggregateWithString withString,
      AggregateWithExpression withExpression,
      String fieldName)
      throws PipelineValidationException {
    if (value instanceof String) {
      return withString.apply((String) value);
    }
    return withExpression.apply(coerceExpression(value, fieldName + ".expr"));
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

  private double[] coerceVectorValue(Object value) throws PipelineValidationException {
    if (value instanceof Map) {
      Object nestedValues = ((Map<?, ?>) value).get("values");
      return coerceVectorValue(nestedValues);
    }

    if (!(value instanceof List)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected findNearest.vectorValue to be an array.");
    }

    List<?> values = (List<?>) value;
    double[] vector = new double[values.size()];
    for (int i = 0; i < values.size(); i++) {
      Object item = values.get(i);
      if (!(item instanceof Number)) {
        throw new PipelineValidationException(
            "pipelineExecute() expected findNearest.vectorValue to contain only numbers.");
      }
      vector[i] = ((Number) item).doubleValue();
    }

    return vector;
  }

  private FindNearestStage.DistanceMeasure coerceDistanceMeasure(String value, String fieldName)
      throws PipelineValidationException {
    if (value == null) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be provided.");
    }

    String normalized = value.trim().replace('-', '_').replace(' ', '_').toUpperCase(Locale.ROOT);
    if ("COSINE".equals(normalized)) {
      return FindNearestStage.DistanceMeasure.COSINE;
    }
    if ("EUCLIDEAN".equals(normalized)) {
      return FindNearestStage.DistanceMeasure.EUCLIDEAN;
    }
    if ("DOT_PRODUCT".equals(normalized) || "DOTPRODUCT".equals(normalized)) {
      return FindNearestStage.DistanceMeasure.DOT_PRODUCT;
    }

    throw new PipelineValidationException(
        "pipelineExecute() expected "
            + fieldName
            + " to be one of COSINE, EUCLIDEAN, DOT_PRODUCT.");
  }

  private void validateNonEmptyString(Map<String, Object> map, String key, String fieldName)
      throws PipelineValidationException {
    if (map == null || !map.containsKey(key) || !(map.get(key) instanceof String)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a string.");
    }

    String value = (String) map.get(key);
    if (value == null || value.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a non-empty string.");
    }
  }

  static class PipelineValidationException extends Exception {
    PipelineValidationException(String message) {
      super(message);
    }
  }
}
