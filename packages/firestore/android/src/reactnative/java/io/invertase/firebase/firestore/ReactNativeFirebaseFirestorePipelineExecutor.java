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
import com.google.firebase.firestore.pipeline.RawStage;
import com.google.firebase.firestore.pipeline.SampleStage;
import com.google.firebase.firestore.pipeline.Selectable;
import com.google.firebase.firestore.pipeline.UnnestOptions;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

class ReactNativeFirebaseFirestorePipelineExecutor {
  private static final Set<String> SOURCE_TYPES =
      new HashSet<>(Arrays.asList("collection", "collectionGroup", "database", "documents", "query"));

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

  private final FirebaseFirestore firestore;

  ReactNativeFirebaseFirestorePipelineExecutor(FirebaseFirestore firestore) {
    this.firestore = firestore;
  }

  void execute(ReadableMap pipeline, ReadableMap options, Promise promise) {
    try {
      validatePipelineRequest(pipeline, options);
      Pipeline sdkPipeline = buildNativePipeline(pipeline);
      Pipeline.ExecuteOptions executeOptions = buildExecuteOptions(options);
      Task<Pipeline.Snapshot> executeTask =
          executeOptions == null ? sdkPipeline.execute() : sdkPipeline.execute(executeOptions);
      executeTask.addOnCompleteListener(task -> resolvePipelineTask(task, promise));
    } catch (PipelineValidationException e) {
      rejectPromiseWithCodeAndMessage(promise, "firestore/invalid-argument", e.getMessage());
    } catch (Exception e) {
      rejectPromiseWithCodeAndMessage(
          promise, "firestore/unknown", "Failed to execute pipeline: " + e.getMessage());
    }
  }

  private void validatePipelineRequest(ReadableMap pipeline, ReadableMap options)
      throws PipelineValidationException {
    if (pipeline == null) {
      throw new PipelineValidationException("pipelineExecute() expected a pipeline object.");
    }

    if (!pipeline.hasKey("source") || pipeline.getType("source") != ReadableType.Map) {
      throw new PipelineValidationException("pipelineExecute() expected pipeline.source to be an object.");
    }

    if (!pipeline.hasKey("stages") || pipeline.getType("stages") != ReadableType.Array) {
      throw new PipelineValidationException("pipelineExecute() expected pipeline.stages to be an array.");
    }

    ReadableMap source = pipeline.getMap("source");
    ReadableArray stages = pipeline.getArray("stages");
    if (source == null || stages == null) {
      throw new PipelineValidationException("pipelineExecute() expected source and stages.");
    }

    validateSource(source);
    validateStages(stages);
    validateOptions(options);
  }

  private void validateSource(ReadableMap source) throws PipelineValidationException {
    if (!source.hasKey("source") || source.getType("source") != ReadableType.String) {
      throw new PipelineValidationException(
          "pipelineExecute() expected pipeline.source.source to be a string.");
    }

    String sourceType = source.getString("source");
    if (sourceType == null || !SOURCE_TYPES.contains(sourceType)) {
      throw new PipelineValidationException("pipelineExecute() received an unknown source type.");
    }

    switch (sourceType) {
      case "collection":
        validateNonEmptyString(source, "path", "pipeline.source.path");
        break;
      case "collectionGroup":
        validateNonEmptyString(source, "collectionId", "pipeline.source.collectionId");
        break;
      case "documents":
        if (!source.hasKey("documents") || source.getType("documents") != ReadableType.Array) {
          throw new PipelineValidationException(
              "pipelineExecute() expected pipeline.source.documents to be an array.");
        }
        ReadableArray documents = source.getArray("documents");
        if (documents == null || documents.size() == 0) {
          throw new PipelineValidationException(
              "pipelineExecute() expected pipeline.source.documents to contain at least one document path.");
        }
        for (int i = 0; i < documents.size(); i++) {
          if (documents.getType(i) != ReadableType.String) {
            throw new PipelineValidationException(
                "pipelineExecute() expected pipeline.source.documents entries to be strings.");
          }
        }
        break;
      case "query":
        validateNonEmptyString(source, "path", "pipeline.source.path");
        validateNonEmptyString(source, "queryType", "pipeline.source.queryType");
        if (!source.hasKey("filters") || source.getType("filters") != ReadableType.Array) {
          throw new PipelineValidationException(
              "pipelineExecute() expected pipeline.source.filters to be an array.");
        }
        if (!source.hasKey("orders") || source.getType("orders") != ReadableType.Array) {
          throw new PipelineValidationException(
              "pipelineExecute() expected pipeline.source.orders to be an array.");
        }
        if (!source.hasKey("options") || source.getType("options") != ReadableType.Map) {
          throw new PipelineValidationException(
              "pipelineExecute() expected pipeline.source.options to be an object.");
        }
        break;
      case "database":
      default:
        break;
    }
  }

  private void validateStages(ReadableArray stages) throws PipelineValidationException {
    for (int i = 0; i < stages.size(); i++) {
      if (stages.getType(i) != ReadableType.Map) {
        throw new PipelineValidationException(
            "pipelineExecute() expected each pipeline stage to be an object.");
      }

      ReadableMap stage = stages.getMap(i);
      if (stage == null) {
        throw new PipelineValidationException("pipelineExecute() expected each stage to be non-null.");
      }

      if (!stage.hasKey("stage") || stage.getType("stage") != ReadableType.String) {
        throw new PipelineValidationException(
            "pipelineExecute() expected each stage.stage to be a string.");
      }

      String stageName = stage.getString("stage");
      if (stageName == null || stageName.isEmpty()) {
        throw new PipelineValidationException(
            "pipelineExecute() expected each stage.stage to be a non-empty string.");
      }

      if (!KNOWN_STAGES.contains(stageName)) {
        throw new PipelineValidationException(
            "pipelineExecute() received an unknown stage: " + stageName + ".");
      }

      if (!stage.hasKey("options") || stage.getType("options") != ReadableType.Map) {
        throw new PipelineValidationException(
            "pipelineExecute() expected each stage.options to be an object.");
      }
    }
  }

  private void validateOptions(ReadableMap options) throws PipelineValidationException {
    if (options == null) {
      return;
    }

    if (options.hasKey("indexMode") && options.getType("indexMode") != ReadableType.String) {
      throw new PipelineValidationException("pipelineExecute() expected options.indexMode to be a string.");
    }

    String indexMode = options.getString("indexMode");
    if (indexMode != null && !"recommended".equals(indexMode)) {
      throw new PipelineValidationException(
          "pipelineExecute() only supports options.indexMode=\"recommended\".");
    }

    if (options.hasKey("rawOptions") && options.getType("rawOptions") != ReadableType.Map) {
      throw new PipelineValidationException("pipelineExecute() expected options.rawOptions to be an object.");
    }
  }

  private void resolvePipelineTask(Task<Pipeline.Snapshot> task, Promise promise) {
    if (task.isSuccessful()) {
      Pipeline.Snapshot snapshot = task.getResult();
      promise.resolve(serializeSnapshot(snapshot));
      return;
    }

    Exception exception = task.getException();
    if (exception != null) {
      rejectPromiseFirestoreException(promise, exception);
      return;
    }

    rejectPromiseWithCodeAndMessage(
        promise, "firestore/unknown", "Failed to execute pipeline: empty pipeline task response.");
  }

  private Pipeline buildNativePipeline(ReadableMap pipeline) throws PipelineValidationException {
    ReadableMap source = Objects.requireNonNull(pipeline.getMap("source"));
    ReadableArray stages = Objects.requireNonNull(pipeline.getArray("stages"));
    Pipeline currentPipeline = buildSourcePipeline(source);

    for (int i = 0; i < stages.size(); i++) {
      ReadableMap stage = Objects.requireNonNull(stages.getMap(i));
      String stageName = Objects.requireNonNull(stage.getString("stage"));
      ReadableMap stageOptions = Objects.requireNonNull(stage.getMap("options"));
      currentPipeline = applyStage(currentPipeline, stageName, stageOptions);
    }

    return currentPipeline;
  }

  private Pipeline buildSourcePipeline(ReadableMap source) throws PipelineValidationException {
    String sourceType = source.getString("source");
    PipelineSource pipelineSource = firestore.pipeline();

    if ("collection".equals(sourceType)) {
      String path = requireNonEmptyString(source, "path", "pipeline.source.path");
      CollectionSourceOptions options = buildCollectionSourceOptions(source.getMap("rawOptions"));
      return options == null
          ? pipelineSource.collection(path)
          : pipelineSource.collection(firestore.collection(path), options);
    }

    if ("collectionGroup".equals(sourceType)) {
      String collectionId =
          requireNonEmptyString(source, "collectionId", "pipeline.source.collectionId");
      CollectionGroupOptions options =
          buildCollectionGroupOptions(source.getMap("rawOptions"));
      return options == null
          ? pipelineSource.collectionGroup(collectionId)
          : pipelineSource.collectionGroup(collectionId, options);
    }

    if ("database".equals(sourceType)) {
      return pipelineSource.database();
    }

    if ("documents".equals(sourceType)) {
      ReadableArray documents = source.getArray("documents");
      if (documents == null || documents.size() == 0) {
        throw new PipelineValidationException(
            "pipelineExecute() expected pipeline.source.documents to contain at least one document path.");
      }

      String[] documentPaths = new String[documents.size()];
      for (int i = 0; i < documents.size(); i++) {
        if (documents.getType(i) != ReadableType.String) {
          throw new PipelineValidationException(
              "pipelineExecute() expected pipeline.source.documents entries to be strings.");
        }
        documentPaths[i] = documents.getString(i);
      }

      return pipelineSource.documents(documentPaths);
    }

    if ("query".equals(sourceType)) {
      String path = requireNonEmptyString(source, "path", "pipeline.source.path");
      String queryType = requireNonEmptyString(source, "queryType", "pipeline.source.queryType");
      ReadableArray filters = Objects.requireNonNull(source.getArray("filters"));
      ReadableArray orders = Objects.requireNonNull(source.getArray("orders"));
      ReadableMap queryOptions = Objects.requireNonNull(source.getMap("options"));

      Query baseQuery = getQueryForFirestore(firestore, path, queryType);
      ReactNativeFirebaseFirestoreQuery firestoreQuery =
          new ReactNativeFirebaseFirestoreQuery(
              "pipeline", "pipeline", baseQuery, filters, orders, queryOptions);
      return pipelineSource.createFrom(firestoreQuery.query);
    }

    throw new PipelineValidationException("pipelineExecute() received an unknown source type.");
  }

  private CollectionSourceOptions buildCollectionSourceOptions(ReadableMap rawOptions)
      throws PipelineValidationException {
    CollectionHints hints = buildCollectionHints(rawOptions);
    if (hints == null) {
      return null;
    }

    return new CollectionSourceOptions().withHints(hints);
  }

  private CollectionGroupOptions buildCollectionGroupOptions(ReadableMap rawOptions)
      throws PipelineValidationException {
    CollectionHints hints = buildCollectionHints(rawOptions);
    if (hints == null) {
      return null;
    }

    return new CollectionGroupOptions().withHints(hints);
  }

  private CollectionHints buildCollectionHints(ReadableMap rawOptions)
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

    if (rawOptions.hasKey("ignoreIndexFields")) {
      Object ignoreIndexFields = getJavaValue(rawOptions, "ignoreIndexFields");
      String[] fields =
          coerceStringList(ignoreIndexFields, "pipeline.source.rawOptions.ignoreIndexFields");
      if (fields.length > 0) {
        hints = hints.withIgnoreIndexFields(fields);
        hasHint = true;
      }
    }

    return hasHint ? hints : null;
  }

  private Pipeline.ExecuteOptions buildExecuteOptions(ReadableMap options)
      throws PipelineValidationException {
    if (options == null) {
      return null;
    }

    Pipeline.ExecuteOptions executeOptions = new Pipeline.ExecuteOptions();
    boolean hasOptions = false;

    if (options.hasKey("indexMode") && options.getType("indexMode") == ReadableType.String) {
      String indexMode = options.getString("indexMode");
      if ("recommended".equals(indexMode)) {
        executeOptions =
            executeOptions.withIndexMode(Pipeline.ExecuteOptions.IndexMode.RECOMMENDED);
        hasOptions = true;
      }
    }

    ReadableMap rawOptions =
        options.hasKey("rawOptions") && options.getType("rawOptions") == ReadableType.Map
            ? options.getMap("rawOptions")
            : null;
    if (rawOptions != null) {
      executeOptions = applyPrimitiveRawOptions(executeOptions, rawOptions);
      hasOptions = true;
    }

    return hasOptions ? executeOptions : null;
  }

  private Pipeline applyStage(Pipeline pipeline, String stageName, ReadableMap stageOptions)
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
        return pipeline.limit(coerceInt(getJavaValue(stageOptions, "limit"), "stage.options.limit"));
      case "offset":
        return pipeline.offset(
            coerceInt(getJavaValue(stageOptions, "offset"), "stage.options.offset"));
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

  private Pipeline applyWhereStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    Object conditionValue = getJavaValue(stageOptions, "condition");
    BooleanExpression condition =
        coerceBooleanExpression(conditionValue, "stage.options.condition");
    return pipeline.where(condition);
  }

  private Pipeline applySelectStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    Object selectionsValue = getJavaValue(stageOptions, "selections");
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

  private Pipeline applyAddFieldsStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    Object fieldsValue = getJavaValue(stageOptions, "fields");
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

  private Pipeline applyRemoveFieldsStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    Object fieldsValue = getJavaValue(stageOptions, "fields");
    String[] fields = coerceStringList(fieldsValue, "stage.options.fields");
    if (fields.length == 0) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.fields to contain at least one value.");
    }

    String first = fields[0];
    String[] rest = Arrays.copyOfRange(fields, 1, fields.length);
    return pipeline.removeFields(first, rest);
  }

  private Pipeline applySortStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    Object orderingsValue = getJavaValue(stageOptions, "orderings");
    List<Object> orderings = coerceList(orderingsValue, "stage.options.orderings");
    if (orderings.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.orderings to contain at least one value.");
    }

    Ordering[] nativeOrderings = new Ordering[orderings.size()];
    for (int i = 0; i < orderings.size(); i++) {
      nativeOrderings[i] =
          coerceOrdering(orderings.get(i), "stage.options.orderings[" + i + "]");
    }

    Ordering first = nativeOrderings[0];
    Ordering[] rest = Arrays.copyOfRange(nativeOrderings, 1, nativeOrderings.length);
    return pipeline.sort(first, rest);
  }

  private Pipeline applyAggregateStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    Object accumulatorsValue = getJavaValue(stageOptions, "accumulators");
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
    AggregateStage aggregateStage = AggregateStage.withAccumulators(firstAccumulator, restAccumulators);

    if (stageOptions.hasKey("groups")) {
      List<Object> groups = coerceList(getJavaValue(stageOptions, "groups"), "stage.options.groups");
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

  private Pipeline applyDistinctStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    Object groupsValue = getJavaValue(stageOptions, "groups");
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

  private Pipeline applyFindNearestStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    String fieldPath =
        coerceFieldPath(
            getJavaValue(stageOptions, "field"),
            "stage.options.field");
    double[] vector = coerceVectorValue(getJavaValue(stageOptions, "vectorValue"));
    FindNearestStage.DistanceMeasure distanceMeasure =
        coerceDistanceMeasure(
            optionalString(stageOptions, "distanceMeasure"),
            "stage.options.distanceMeasure");

    boolean hasOptions = stageOptions.hasKey("limit") || stageOptions.hasKey("distanceField");
    if (!hasOptions) {
      return pipeline.findNearest(fieldPath, vector, distanceMeasure);
    }

    FindNearestOptions options = new FindNearestOptions();
    if (stageOptions.hasKey("limit")) {
      options =
          options.withLimit(
              coerceLong(getJavaValue(stageOptions, "limit"), "stage.options.limit"));
    }
    String distanceField = optionalString(stageOptions, "distanceField");
    if (distanceField != null && !distanceField.isEmpty()) {
      options = options.withDistanceField(distanceField);
    }

    return pipeline.findNearest(fieldPath, Expression.vector(vector), distanceMeasure, options);
  }

  private Pipeline applyReplaceWithStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    Object mapValue = getJavaValue(stageOptions, "map");
    if (mapValue instanceof String) {
      return pipeline.replaceWith((String) mapValue);
    }

    Expression expression = coerceExpression(mapValue, "stage.options.map");
    return pipeline.replaceWith(expression);
  }

  private Pipeline applySampleStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    if (stageOptions.hasKey("documents")) {
      int documents = coerceInt(getJavaValue(stageOptions, "documents"), "stage.options.documents");
      return pipeline.sample(documents);
    }

    if (stageOptions.hasKey("percentage")) {
      double percentage =
          coerceDouble(getJavaValue(stageOptions, "percentage"), "stage.options.percentage");
      return pipeline.sample(SampleStage.withPercentage(percentage));
    }

    throw new PipelineValidationException(
        "pipelineExecute() expected sample stage to include documents or percentage.");
  }

  private Pipeline applyUnionStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    Object otherValue = getJavaValue(stageOptions, "other");
    if (!(otherValue instanceof Map)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.other to be a serialized pipeline object.");
    }

    @SuppressWarnings("unchecked")
    ReadableMap otherPipelineMap = Arguments.makeNativeMap((Map<String, Object>) otherValue);
    Pipeline otherPipeline = buildNativePipeline(otherPipelineMap);
    return pipeline.union(otherPipeline);
  }

  private Pipeline applyUnnestStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    Object selectableValue = getJavaValue(stageOptions, "selectable");
    Selectable selectable = coerceSelectable(selectableValue, "stage.options.selectable");

    String indexField = optionalString(stageOptions, "indexField");
    if (indexField == null || indexField.isEmpty()) {
      return pipeline.unnest(selectable);
    }

    UnnestOptions options = new UnnestOptions().withIndexField(indexField);
    return pipeline.unnest(selectable, options);
  }

  private Pipeline applyRawStage(Pipeline pipeline, ReadableMap stageOptions)
      throws PipelineValidationException {
    String stageName = requireNonEmptyString(stageOptions, "name", "stage.options.name");
    RawStage rawStage = RawStage.ofName(stageName);

    if (stageOptions.hasKey("params")) {
      Object paramsValue = getJavaValue(stageOptions, "params");
      if (paramsValue instanceof List) {
        Object[] args = ((List<?>) paramsValue).toArray();
        rawStage = rawStage.withArguments(args);
      } else {
        rawStage = rawStage.withArguments(paramsValue);
      }
    }

    if (stageOptions.hasKey("options") && stageOptions.getType("options") == ReadableType.Map) {
      ReadableMap rawStageOptions = stageOptions.getMap("options");
      if (rawStageOptions != null) {
        rawStage = applyPrimitiveRawStageOptions(rawStage, rawStageOptions);
      }
    }

    return pipeline.rawStage(rawStage);
  }

  private <T extends com.google.firebase.firestore.pipeline.AbstractOptions<T>> T applyPrimitiveRawOptions(
      T options, ReadableMap rawOptions) throws PipelineValidationException {
    ReadableMapKeySetIterator iterator = rawOptions.keySetIterator();

    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      ReadableType type = rawOptions.getType(key);
      if (type == ReadableType.Null) {
        continue;
      }
      if (type == ReadableType.Boolean) {
        options = options.with(key, rawOptions.getBoolean(key));
        continue;
      }
      if (type == ReadableType.String) {
        options = options.with(key, rawOptions.getString(key));
        continue;
      }
      if (type == ReadableType.Number) {
        double value = rawOptions.getDouble(key);
        if (Math.floor(value) == value) {
          options = options.with(key, (long) value);
        } else {
          options = options.with(key, value);
        }
        continue;
      }
      if (type == ReadableType.Array) {
        throw new PipelineValidationException(
            "pipelineExecute() received an unsupported raw option array for key: " + key + ".");
      }
      if (type == ReadableType.Map) {
        String fieldPath = coerceFieldPath(getJavaValue(rawOptions, key), "options.rawOptions." + key);
        options = options.with(key, Expression.field(fieldPath));
        continue;
      }

      throw new PipelineValidationException(
          "pipelineExecute() received an unsupported raw option value for key: " + key + ".");
    }

    return options;
  }

  private RawStage applyPrimitiveRawStageOptions(RawStage rawStage, ReadableMap options)
      throws PipelineValidationException {
    ReadableMapKeySetIterator iterator = options.keySetIterator();

    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      ReadableType type = options.getType(key);
      if (type == ReadableType.Null) {
        continue;
      }
      if (type == ReadableType.Boolean) {
        rawStage = rawStage.withOption(key, options.getBoolean(key));
        continue;
      }
      if (type == ReadableType.String) {
        rawStage = rawStage.withOption(key, options.getString(key));
        continue;
      }
      if (type == ReadableType.Number) {
        double value = options.getDouble(key);
        if (Math.floor(value) == value) {
          rawStage = rawStage.withOption(key, (long) value);
        } else {
          rawStage = rawStage.withOption(key, value);
        }
        continue;
      }
      if (type == ReadableType.Map) {
        String fieldPath = coerceFieldPath(getJavaValue(options, key), "stage.options.options." + key);
        rawStage = rawStage.withOption(key, Expression.field(fieldPath));
        continue;
      }

      throw new PipelineValidationException(
          "pipelineExecute() received an unsupported raw stage option value for key: " + key + ".");
    }

    return rawStage;
  }

  private WritableMap serializeSnapshot(Pipeline.Snapshot snapshot) {
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
      if (executionTime != null) {
        map.putMap("executionTime", executionTime);
      } else {
        map.putNull("executionTime");
      }
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
      map.putMap("data", objectMapToWritable(data));
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

  private String optionalString(ReadableMap map, String key) {
    if (map == null || !map.hasKey(key) || map.getType(key) == ReadableType.Null) {
      return null;
    }

    if (map.getType(key) != ReadableType.String) {
      return null;
    }

    return map.getString(key);
  }

  private String requireNonEmptyString(ReadableMap map, String key, String fieldName)
      throws PipelineValidationException {
    validateNonEmptyString(map, key, fieldName);
    return map.getString(key);
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

  private List<Object> coerceList(Object value, String fieldName) throws PipelineValidationException {
    if (!(value instanceof List)) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be an array.");
    }
    return (List<Object>) value;
  }

  private String[] coerceStringList(Object value, String fieldName) throws PipelineValidationException {
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

  private String coerceFieldPath(Object value, String fieldName) throws PipelineValidationException {
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

  private Expression coerceExpression(Object value, String fieldName) throws PipelineValidationException {
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

    Expression[] expressions = new Expression[args.size()];
    for (int i = 0; i < args.size(); i++) {
      expressions[i] = coerceExpression(args.get(i), fieldName + ".args[" + i + "]");
    }

    return Expression.rawFunction((String) nameValue, expressions);
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

    return Expression.Companion.toExprOrConstant$com_google_firebase_firebase_firestore(value);
  }

  private Selectable coerceSelectable(Object value, String fieldName) throws PipelineValidationException {
    if (value instanceof Selectable) {
      return (Selectable) value;
    }

    if (value instanceof String) {
      return Expression.field((String) value);
    }

    if (value instanceof Map) {
      Map<?, ?> map = (Map<?, ?>) value;
      String alias = firstString(map.get("alias"), map.get("as"));

      Object exprValue = map.containsKey("expr") ? map.get("expr") : value;
      Expression expr = coerceExpression(exprValue, fieldName + ".expr");
      if (alias != null && !alias.isEmpty()) {
        return expr.alias(alias);
      }
      if (expr instanceof Selectable) {
        return (Selectable) expr;
      }
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to include an alias for computed expressions.");
    }

    Expression expr = coerceExpression(value, fieldName);
    if (expr instanceof Selectable) {
      return (Selectable) expr;
    }

    throw new PipelineValidationException(
        "pipelineExecute() expected " + fieldName + " to resolve to a selectable expression.");
  }

  private Ordering coerceOrdering(Object value, String fieldName) throws PipelineValidationException {
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
    String direction = map.get("direction") instanceof String ? (String) map.get("direction") : "asc";
    boolean descending = isDescendingDirection(direction);

    if (map.containsKey("fieldPath") || map.containsKey("path") || map.containsKey("segments")) {
      String fieldPath = coerceFieldPath(map, fieldName + ".fieldPath");
      return descending ? Ordering.descending(fieldPath) : Ordering.ascending(fieldPath);
    }

    Object expressionValue = map.containsKey("expression") ? map.get("expression") : map.get("expr");
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
        return booleanExpressionFromOperatorMap(
            map, (String) operatorValue, fieldName);
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
      return "and".equals(normalizedName) ? Expression.and(first, rest) : Expression.or(first, rest);
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
            "pipelineExecute() expected " + fieldName + ".args to include left and right operands.");
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
    return BooleanExpression.rawFunction(functionName, expressions);
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
        conditions[i] =
            coerceBooleanExpression(queries.get(i), fieldName + ".queries[" + i + "]");
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

    if ("==".equals(normalizedOperator) || "=".equals(normalizedOperator)
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
    if (">=".equals(normalizedOperator)
        || "GREATER_THAN_OR_EQUAL".equals(normalizedOperator)) {
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
            "pipelineExecute() expected " + fieldName + ".value to be an array for operator IN.");
      }
      return fieldExpression.equalAny((List<?>) rightValue);
    }
    if ("NOT_IN".equals(normalizedOperator)) {
      if (!(rightValue instanceof List)) {
        throw new PipelineValidationException(
            "pipelineExecute() expected " + fieldName + ".value to be an array for operator NOT_IN.");
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

  private BooleanExpression applyArrayContains(Expression expression, Object value, String fieldName)
      throws PipelineValidationException {
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
            expressionValue,
            AggregateFunction::count,
            AggregateFunction::count,
            fieldName);
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
            expressionValue,
            AggregateFunction::sum,
            AggregateFunction::sum,
            fieldName);
      case "avg":
      case "average":
        return aggregateWithExpression(
            expressionValue,
            AggregateFunction::average,
            AggregateFunction::average,
            fieldName);
      case "min":
      case "minimum":
        return aggregateWithExpression(
            expressionValue,
            AggregateFunction::minimum,
            AggregateFunction::minimum,
            fieldName);
      case "max":
      case "maximum":
        return aggregateWithExpression(
            expressionValue,
            AggregateFunction::maximum,
            AggregateFunction::maximum,
            fieldName);
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
        return AggregateFunction.rawAggregate(kind, expressions);
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

    String normalized =
        value.trim().replace('-', '_').replace(' ', '_').toUpperCase(Locale.ROOT);
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
        "pipelineExecute() expected " + fieldName + " to be one of COSINE, EUCLIDEAN, DOT_PRODUCT.");
  }

  private void validateNonEmptyString(ReadableMap map, String key, String fieldName)
      throws PipelineValidationException {
    if (!map.hasKey(key) || map.getType(key) != ReadableType.String) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a string.");
    }

    String value = map.getString(key);
    if (value == null || value.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected " + fieldName + " to be a non-empty string.");
    }
  }

  private static class PipelineValidationException extends Exception {
    PipelineValidationException(String message) {
      super(message);
    }
  }
}
