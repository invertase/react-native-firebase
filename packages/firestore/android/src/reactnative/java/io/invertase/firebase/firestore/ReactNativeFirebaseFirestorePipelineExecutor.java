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

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.google.firebase.firestore.FirebaseFirestore;
import java.util.Arrays;
import java.util.HashSet;
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
      rejectPromiseWithCodeAndMessage(
          promise, "firestore/unsupported", createUnsupportedMessage(pipeline));
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

  private String createUnsupportedMessage(ReadableMap pipeline) {
    ReadableArray stages = pipeline.getArray("stages");
    if (stages != null && stages.size() > 0) {
      ReadableMap firstStage = stages.getMap(0);
      if (firstStage != null
          && firstStage.hasKey("stage")
          && firstStage.getType("stage") == ReadableType.String) {
        String stageName = firstStage.getString("stage");
        if (stageName != null && !stageName.isEmpty()) {
          return "Firestore pipelines are not supported by this native implementation yet. Unsupported stage: "
              + stageName
              + ".";
        }
      }
    }

    ReadableMap source = pipeline.getMap("source");
    if (source != null && source.hasKey("source") && source.getType("source") == ReadableType.String) {
      String sourceType = source.getString("source");
      if (sourceType != null && !sourceType.isEmpty()) {
        return "Firestore pipelines are not supported by this native implementation yet. Unsupported source: "
            + sourceType
            + ".";
      }
    }

    return "Firestore pipelines are not supported by this native implementation yet.";
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
