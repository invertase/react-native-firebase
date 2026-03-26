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
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

class ReactNativeFirebaseFirestorePipelineExecutor {
  private final FirebaseFirestore firestore;
  private final ReactNativeFirebaseFirestorePipelineNodeBuilder nodeBuilder;

  private static final class PipelineBox {
    Pipeline value;
  }

  private interface PendingPipelineStage {}

  private static final class ReadyPipelineStage implements PendingPipelineStage {
    final ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineStage stage;

    ReadyPipelineStage(ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineStage stage) {
      this.stage = stage;
    }
  }

  private static final class PendingUnionPipelineStage implements PendingPipelineStage {
    final PipelineBox childBox;

    PendingUnionPipelineStage(PipelineBox childBox) {
      this.childBox = childBox;
    }
  }

  private abstract static class PipelineBuildFrame {}

  private static final class EnterPipelineBuildFrame extends PipelineBuildFrame {
    final ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineRequest request;
    final PipelineBox box;

    EnterPipelineBuildFrame(
        ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineRequest request, PipelineBox box) {
      this.request = request;
      this.box = box;
    }
  }

  private static final class ExitPipelineBuildFrame extends PipelineBuildFrame {
    final Pipeline sourcePipeline;
    final List<PendingPipelineStage> stages;
    final PipelineBox box;

    ExitPipelineBuildFrame(
        Pipeline sourcePipeline, List<PendingPipelineStage> stages, PipelineBox box) {
      this.sourcePipeline = sourcePipeline;
      this.stages = stages;
      this.box = box;
    }
  }

  private abstract static class ReadableContainerBuildFrame {}

  private static final class ReadableMapBuildFrame extends ReadableContainerBuildFrame {
    final ReadableMap source;
    final Map<String, Object> target;

    ReadableMapBuildFrame(ReadableMap source, Map<String, Object> target) {
      this.source = source;
      this.target = target;
    }
  }

  private static final class ReadableArrayBuildFrame extends ReadableContainerBuildFrame {
    final ReadableArray source;
    final List<Object> target;

    ReadableArrayBuildFrame(ReadableArray source, List<Object> target) {
      this.source = source;
      this.target = target;
    }
  }

  ReactNativeFirebaseFirestorePipelineExecutor(FirebaseFirestore firestore) {
    this.firestore = firestore;
    this.nodeBuilder = new ReactNativeFirebaseFirestorePipelineNodeBuilder();
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
    PipelineBox rootBox = new PipelineBox();
    ArrayDeque<PipelineBuildFrame> stack = new ArrayDeque<>();
    stack.push(new EnterPipelineBuildFrame(request, rootBox));

    while (!stack.isEmpty()) {
      PipelineBuildFrame frame = stack.pop();
      if (frame instanceof EnterPipelineBuildFrame) {
        EnterPipelineBuildFrame enterFrame = (EnterPipelineBuildFrame) frame;
        Pipeline sourcePipeline = buildSourcePipeline(enterFrame.request.source);
        List<PendingPipelineStage> pendingStages =
            new java.util.ArrayList<>(enterFrame.request.stages.size());
        List<
                Map.Entry<
                    ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineRequest, PipelineBox>>
            nestedRequests = new java.util.ArrayList<>();

        for (ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineStage stage :
            enterFrame.request.stages) {
          if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedUnionStage) {
            PipelineBox childBox = new PipelineBox();
            pendingStages.add(new PendingUnionPipelineStage(childBox));
            nestedRequests.add(
                new java.util.AbstractMap.SimpleEntry<>(
                    ((ReactNativeFirebaseFirestorePipelineParser.ParsedUnionStage) stage).other,
                    childBox));
          } else {
            pendingStages.add(new ReadyPipelineStage(stage));
          }
        }

        stack.push(new ExitPipelineBuildFrame(sourcePipeline, pendingStages, enterFrame.box));
        for (int i = nestedRequests.size() - 1; i >= 0; i--) {
          Map.Entry<ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineRequest, PipelineBox>
              nestedEntry = nestedRequests.get(i);
          stack.push(new EnterPipelineBuildFrame(nestedEntry.getKey(), nestedEntry.getValue()));
        }
        continue;
      }

      ExitPipelineBuildFrame exitFrame = (ExitPipelineBuildFrame) frame;
      Pipeline currentPipeline = exitFrame.sourcePipeline;
      for (PendingPipelineStage pendingStage : exitFrame.stages) {
        if (pendingStage instanceof ReadyPipelineStage) {
          currentPipeline = applyStage(currentPipeline, ((ReadyPipelineStage) pendingStage).stage);
          continue;
        }

        Pipeline otherPipelineInstance = ((PendingUnionPipelineStage) pendingStage).childBox.value;
        if (otherPipelineInstance == null) {
          throw new PipelineValidationException(
              "pipelineExecute() failed to build nested union pipeline.");
        }
        currentPipeline = currentPipeline.union(otherPipelineInstance);
      }

      exitFrame.box.value = currentPipeline;
    }

    if (rootBox.value == null) {
      throw new PipelineValidationException("pipelineExecute() failed to build pipeline.");
    }
    return rootBox.value;
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

  private Pipeline applyStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedPipelineStage stage)
      throws PipelineValidationException {
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedWhereStage) {
      return applyWhereStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedWhereStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedSelectStage) {
      return applySelectStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedSelectStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedAddFieldsStage) {
      return applyAddFieldsStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedAddFieldsStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedRemoveFieldsStage) {
      return applyRemoveFieldsStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedRemoveFieldsStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedSortStage) {
      return applySortStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedSortStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedLimitStage) {
      return pipeline.limit(
          coerceInt(
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedLimitStage) stage).limit,
              "stage.options.limit"));
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedOffsetStage) {
      return pipeline.offset(
          coerceInt(
              ((ReactNativeFirebaseFirestorePipelineParser.ParsedOffsetStage) stage).offset,
              "stage.options.offset"));
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedAggregateStage) {
      return applyAggregateStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedAggregateStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedDistinctStage) {
      return applyDistinctStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedDistinctStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedFindNearestStage) {
      return applyFindNearestStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedFindNearestStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedReplaceWithStage) {
      return applyReplaceWithStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedReplaceWithStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedSampleStage) {
      return applySampleStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedSampleStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedUnionStage) {
      return applyUnionStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedUnionStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedUnnestStage) {
      return applyUnnestStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedUnnestStage) stage);
    }
    if (stage instanceof ReactNativeFirebaseFirestorePipelineParser.ParsedRawStage) {
      return applyRawStage(
          pipeline, (ReactNativeFirebaseFirestorePipelineParser.ParsedRawStage) stage);
    }

    throw new PipelineValidationException(
        "pipelineExecute() received an unknown stage: " + stage.stageName + ".");
  }

  private Pipeline applyWhereStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedWhereStage stage)
      throws PipelineValidationException {
    BooleanExpression condition =
        nodeBuilder.coerceBooleanExpression(stage.condition, "stage.options.condition");
    return pipeline.where(condition);
  }

  private Pipeline applySelectStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedSelectStage stage)
      throws PipelineValidationException {
    List<ReactNativeFirebaseFirestorePipelineParser.ParsedSelectableNode> selections =
        stage.selections;
    if (selections.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.selections to contain at least one value.");
    }

    Selectable[] selectables = new Selectable[selections.size()];
    for (int i = 0; i < selections.size(); i++) {
      selectables[i] =
          nodeBuilder.coerceSelectable(selections.get(i), "stage.options.selections[" + i + "]");
    }

    Selectable first = selectables[0];
    Selectable[] rest = Arrays.copyOfRange(selectables, 1, selectables.length);
    return pipeline.select(first, (Object[]) rest);
  }

  private Pipeline applyAddFieldsStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedAddFieldsStage stage)
      throws PipelineValidationException {
    List<ReactNativeFirebaseFirestorePipelineParser.ParsedSelectableNode> fields = stage.fields;
    if (fields.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.fields to contain at least one value.");
    }

    Selectable[] selectables = new Selectable[fields.size()];
    for (int i = 0; i < fields.size(); i++) {
      selectables[i] =
          nodeBuilder.coerceSelectable(fields.get(i), "stage.options.fields[" + i + "]");
    }

    Selectable first = selectables[0];
    Selectable[] rest = Arrays.copyOfRange(selectables, 1, selectables.length);
    return pipeline.addFields(first, rest);
  }

  private Pipeline applyRemoveFieldsStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedRemoveFieldsStage stage)
      throws PipelineValidationException {
    String[] fields = coerceStringList(stage.fields, "stage.options.fields");
    if (fields.length == 0) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.fields to contain at least one value.");
    }

    String first = fields[0];
    String[] rest = Arrays.copyOfRange(fields, 1, fields.length);
    return pipeline.removeFields(first, rest);
  }

  private Pipeline applySortStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedSortStage stage)
      throws PipelineValidationException {
    List<ReactNativeFirebaseFirestorePipelineParser.ParsedOrderingNode> orderings = stage.orderings;
    if (orderings.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.orderings to contain at least one value.");
    }

    Ordering[] nativeOrderings = new Ordering[orderings.size()];
    for (int i = 0; i < orderings.size(); i++) {
      nativeOrderings[i] =
          nodeBuilder.coerceOrdering(orderings.get(i), "stage.options.orderings[" + i + "]");
    }

    Ordering first = nativeOrderings[0];
    Ordering[] rest = Arrays.copyOfRange(nativeOrderings, 1, nativeOrderings.length);
    return pipeline.sort(first, rest);
  }

  private Pipeline applyAggregateStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedAggregateStage stage)
      throws PipelineValidationException {
    List<ReactNativeFirebaseFirestorePipelineParser.ParsedAggregateNode> accumulators =
        stage.accumulators;
    if (accumulators.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.accumulators to contain at least one value.");
    }

    AliasedAggregate[] aliasedAggregates = new AliasedAggregate[accumulators.size()];
    for (int i = 0; i < accumulators.size(); i++) {
      aliasedAggregates[i] =
          nodeBuilder.coerceAliasedAggregate(
              accumulators.get(i), "stage.options.accumulators[" + i + "]");
    }

    AliasedAggregate firstAccumulator = aliasedAggregates[0];
    AliasedAggregate[] restAccumulators =
        Arrays.copyOfRange(aliasedAggregates, 1, aliasedAggregates.length);
    AggregateStage aggregateStage =
        AggregateStage.withAccumulators(firstAccumulator, restAccumulators);

    if (stage.groups != null) {
      List<ReactNativeFirebaseFirestorePipelineParser.ParsedSelectableNode> groups = stage.groups;
      if (!groups.isEmpty()) {
        Selectable[] selectableGroups = new Selectable[groups.size()];
        for (int i = 0; i < groups.size(); i++) {
          selectableGroups[i] =
              nodeBuilder.coerceSelectable(groups.get(i), "stage.options.groups[" + i + "]");
        }
        Selectable firstGroup = selectableGroups[0];
        Object[] restGroups = Arrays.copyOfRange(selectableGroups, 1, selectableGroups.length);
        aggregateStage = aggregateStage.withGroups(firstGroup, restGroups);
      }
    }

    return pipeline.aggregate(aggregateStage);
  }

  private Pipeline applyDistinctStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedDistinctStage stage)
      throws PipelineValidationException {
    List<ReactNativeFirebaseFirestorePipelineParser.ParsedSelectableNode> groups = stage.groups;
    if (groups.isEmpty()) {
      throw new PipelineValidationException(
          "pipelineExecute() expected stage.options.groups to contain at least one value.");
    }

    Selectable[] selectables = new Selectable[groups.size()];
    for (int i = 0; i < groups.size(); i++) {
      selectables[i] =
          nodeBuilder.coerceSelectable(groups.get(i), "stage.options.groups[" + i + "]");
    }

    Selectable first = selectables[0];
    Object[] rest = Arrays.copyOfRange(selectables, 1, selectables.length);
    return pipeline.distinct(first, rest);
  }

  private Pipeline applyFindNearestStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedFindNearestStage stage)
      throws PipelineValidationException {
    String fieldPath = nodeBuilder.coerceFieldPath(stage.field, "stage.options.field");
    double[] vector = nodeBuilder.coerceVectorValue(stage.vectorValue);
    FindNearestStage.DistanceMeasure distanceMeasure =
        coerceDistanceMeasure(stage.distanceMeasure, "stage.options.distanceMeasure");

    boolean hasOptions = stage.limit != null || stage.distanceField != null;
    if (!hasOptions) {
      return pipeline.findNearest(fieldPath, vector, distanceMeasure);
    }

    FindNearestOptions options = new FindNearestOptions();
    if (stage.limit != null) {
      options = options.withLimit(coerceLong(stage.limit, "stage.options.limit"));
    }
    String distanceField = stage.distanceField;
    if (distanceField != null && !distanceField.isEmpty()) {
      options = options.withDistanceField(distanceField);
    }

    return pipeline.findNearest(fieldPath, Expression.vector(vector), distanceMeasure, options);
  }

  private Pipeline applyReplaceWithStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedReplaceWithStage stage)
      throws PipelineValidationException {
    Expression expression = nodeBuilder.coerceExpression(stage.map, "stage.options.map");
    return pipeline.replaceWith(expression);
  }

  private Pipeline applySampleStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedSampleStage stage)
      throws PipelineValidationException {
    if (stage.documents != null) {
      int documents = coerceInt(stage.documents, "stage.options.documents");
      return pipeline.sample(documents);
    }

    if (stage.percentage != null) {
      double percentage = coerceDouble(stage.percentage, "stage.options.percentage");
      return pipeline.sample(SampleStage.withPercentage(percentage));
    }

    throw new PipelineValidationException(
        "pipelineExecute() expected sample stage to include documents or percentage.");
  }

  private Pipeline applyUnionStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedUnionStage stage)
      throws PipelineValidationException {
    throw new PipelineValidationException(
        "pipelineExecute() failed to build nested union pipeline.");
  }

  private Pipeline applyUnnestStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedUnnestStage stage)
      throws PipelineValidationException {
    Selectable selectable =
        nodeBuilder.coerceSelectable(stage.selectable, "stage.options.selectable");

    String indexField = stage.indexField;
    if (indexField == null || indexField.isEmpty()) {
      return pipeline.unnest(selectable);
    }

    UnnestOptions options = new UnnestOptions().withIndexField(indexField);
    return pipeline.unnest(selectable, options);
  }

  private Pipeline applyRawStage(
      Pipeline pipeline, ReactNativeFirebaseFirestorePipelineParser.ParsedRawStage stage)
      throws PipelineValidationException {
    RawStage rawStage = RawStage.ofName(stage.name);

    if (stage.params != null) {
      Object paramsValue = stage.params;
      if (paramsValue instanceof List) {
        Object[] args = ((List<?>) paramsValue).toArray();
        rawStage = rawStage.withArguments(args);
      } else {
        rawStage = rawStage.withArguments(paramsValue);
      }
    }

    if (stage.options != null) {
      rawStage = applyPrimitiveRawStageOptions(rawStage, stage.options);
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
        String fieldPath = nodeBuilder.coerceFieldPath(rawValue, "options.rawOptions." + key);
        options = options.with(key, Expression.field(fieldPath));
        continue;
      }

      throw new PipelineValidationException(
          "pipelineExecute() received an unsupported raw option value for key: " + key + ".");
    }

    return options;
  }

  private Pipeline.ExecuteOptions applyExecuteRawOptions(
      Pipeline.ExecuteOptions options, Map<String, Object> rawOptions)
      throws PipelineValidationException {
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
        String fieldPath = nodeBuilder.coerceFieldPath(rawValue, "stage.options.options." + key);
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
    ArrayDeque<ReadableContainerBuildFrame> stack = new ArrayDeque<>();
    stack.push(new ReadableMapBuildFrame(readableMap, output));
    populateReadableContainers(stack);
    return output;
  }

  private List<Object> readableArrayToJava(ReadableArray readableArray) {
    List<Object> output = new java.util.ArrayList<>();
    ArrayDeque<ReadableContainerBuildFrame> stack = new ArrayDeque<>();
    stack.push(new ReadableArrayBuildFrame(readableArray, output));
    populateReadableContainers(stack);
    return output;
  }

  private void populateReadableContainers(ArrayDeque<ReadableContainerBuildFrame> stack) {
    // Use an explicit stack so deeply nested pipeline inputs do not rely on JVM recursion depth.
    while (!stack.isEmpty()) {
      ReadableContainerBuildFrame frame = stack.pop();

      if (frame instanceof ReadableMapBuildFrame) {
        ReadableMapBuildFrame mapFrame = (ReadableMapBuildFrame) frame;
        ReadableMapKeySetIterator iterator = mapFrame.source.keySetIterator();

        while (iterator.hasNextKey()) {
          String key = iterator.nextKey();
          ReadableType type = mapFrame.source.getType(key);
          if (type == ReadableType.Null) {
            mapFrame.target.put(key, null);
            continue;
          }

          switch (type) {
            case Boolean:
              mapFrame.target.put(key, mapFrame.source.getBoolean(key));
              break;
            case Number:
              mapFrame.target.put(key, coerceNumber(mapFrame.source.getDouble(key)));
              break;
            case String:
              mapFrame.target.put(key, mapFrame.source.getString(key));
              break;
            case Map:
              ReadableMap nestedMap = mapFrame.source.getMap(key);
              if (nestedMap == null) {
                mapFrame.target.put(key, null);
                break;
              }

              Map<String, Object> nestedMapOutput = new HashMap<>();
              mapFrame.target.put(key, nestedMapOutput);
              stack.push(new ReadableMapBuildFrame(nestedMap, nestedMapOutput));
              break;
            case Array:
              ReadableArray nestedArray = mapFrame.source.getArray(key);
              if (nestedArray == null) {
                mapFrame.target.put(key, null);
                break;
              }

              List<Object> nestedArrayOutput = new java.util.ArrayList<>();
              mapFrame.target.put(key, nestedArrayOutput);
              stack.push(new ReadableArrayBuildFrame(nestedArray, nestedArrayOutput));
              break;
            case Null:
            default:
              mapFrame.target.put(key, null);
          }
        }

        continue;
      }

      ReadableArrayBuildFrame arrayFrame = (ReadableArrayBuildFrame) frame;
      for (int i = 0; i < arrayFrame.source.size(); i++) {
        ReadableType type = arrayFrame.source.getType(i);
        if (type == ReadableType.Null) {
          arrayFrame.target.add(null);
          continue;
        }

        switch (type) {
          case Boolean:
            arrayFrame.target.add(arrayFrame.source.getBoolean(i));
            break;
          case Number:
            arrayFrame.target.add(coerceNumber(arrayFrame.source.getDouble(i)));
            break;
          case String:
            arrayFrame.target.add(arrayFrame.source.getString(i));
            break;
          case Map:
            ReadableMap nestedMap = arrayFrame.source.getMap(i);
            if (nestedMap == null) {
              arrayFrame.target.add(null);
              break;
            }

            Map<String, Object> nestedMapOutput = new HashMap<>();
            arrayFrame.target.add(nestedMapOutput);
            stack.push(new ReadableMapBuildFrame(nestedMap, nestedMapOutput));
            break;
          case Array:
            ReadableArray nestedArray = arrayFrame.source.getArray(i);
            if (nestedArray == null) {
              arrayFrame.target.add(null);
              break;
            }

            List<Object> nestedArrayOutput = new java.util.ArrayList<>();
            arrayFrame.target.add(nestedArrayOutput);
            stack.push(new ReadableArrayBuildFrame(nestedArray, nestedArrayOutput));
            break;
          case Null:
          default:
            arrayFrame.target.add(null);
            break;
        }
      }
    }
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
