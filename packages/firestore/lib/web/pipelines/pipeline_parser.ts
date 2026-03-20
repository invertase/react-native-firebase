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

import type {
  FirestorePipelineExecuteOptionsInternal,
  FirestorePipelineSerializedInternal,
  FirestorePipelineSourceInternal,
  FirestorePipelineStageInternal,
} from '../../types/internal';

export interface WebParsedPipelineRequest {
  pipeline: FirestorePipelineSerializedInternal;
  options?: FirestorePipelineExecuteOptionsInternal;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function validateNonEmptyStringArray(value: unknown, fieldName: string): void {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`pipelineExecute() expected ${fieldName} to contain at least one value.`);
  }

  if (!value.every(isNonEmptyString)) {
    throw new Error(`pipelineExecute() expected ${fieldName} to contain only non-empty strings.`);
  }
}

function validateSource(
  source: unknown,
  fieldName: string = 'pipeline.source',
): asserts source is FirestorePipelineSourceInternal {
  if (!isRecord(source)) {
    throw new Error(`pipelineExecute() expected ${fieldName} to be an object.`);
  }

  switch (source.source) {
    case 'collection':
      if (!isNonEmptyString(source.path)) {
        throw new Error(`pipelineExecute() expected ${fieldName}.path to be a non-empty string.`);
      }
      return;
    case 'collectionGroup':
      if (!isNonEmptyString(source.collectionId)) {
        throw new Error(
          `pipelineExecute() expected ${fieldName}.collectionId to be a non-empty string.`,
        );
      }
      return;
    case 'database':
      return;
    case 'documents':
      validateNonEmptyStringArray(source.documents, `${fieldName}.documents`);
      return;
    case 'query':
      if (!isNonEmptyString(source.path)) {
        throw new Error(`pipelineExecute() expected ${fieldName}.path to be a non-empty string.`);
      }
      if (!isNonEmptyString(source.queryType)) {
        throw new Error(
          `pipelineExecute() expected ${fieldName}.queryType to be a non-empty string.`,
        );
      }
      if (!Array.isArray(source.filters)) {
        throw new Error(`pipelineExecute() expected ${fieldName}.filters to be an array.`);
      }
      if (!Array.isArray(source.orders)) {
        throw new Error(`pipelineExecute() expected ${fieldName}.orders to be an array.`);
      }
      if (!isRecord(source.options)) {
        throw new Error(`pipelineExecute() expected ${fieldName}.options to be an object.`);
      }
      return;
    default:
      throw new Error('pipelineExecute() received an unknown source type.');
  }
}

function validateNonEmptyStageArray(
  value: unknown,
  fieldName: string,
  errorLabel: string = fieldName,
): void {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`pipelineExecute() expected ${errorLabel} to contain at least one value.`);
  }
}

function validateStage(
  stage: unknown,
  stagePath: string,
  optionsPath: string,
): asserts stage is FirestorePipelineStageInternal {
  if (!isRecord(stage) || typeof stage.stage !== 'string' || !isRecord(stage.options)) {
    throw new Error(`pipelineExecute() expected ${stagePath} to include stage and options.`);
  }

  switch (stage.stage) {
    case 'select':
      validateNonEmptyStageArray(stage.options.selections, `${optionsPath}.selections`);
      return;
    case 'addFields':
      validateNonEmptyStageArray(stage.options.fields, `${optionsPath}.fields`);
      return;
    case 'removeFields':
      validateNonEmptyStageArray(stage.options.fields, `${optionsPath}.fields`);
      return;
    case 'sort':
      validateNonEmptyStageArray(stage.options.orderings, `${optionsPath}.orderings`);
      return;
    case 'aggregate':
      validateNonEmptyStageArray(stage.options.accumulators, `${optionsPath}.accumulators`);
      return;
    case 'distinct':
      validateNonEmptyStageArray(stage.options.groups, `${optionsPath}.groups`);
      return;
    case 'sample': {
      const hasDocuments = typeof stage.options.documents === 'number';
      const hasPercentage = typeof stage.options.percentage === 'number';
      if (!hasDocuments && !hasPercentage) {
        throw new Error(
          'pipelineExecute() expected sample stage to include documents or percentage.',
        );
      }
      return;
    }
    case 'union':
      if (
        !isRecord(stage.options.other) ||
        !isRecord(stage.options.other.source) ||
        !Array.isArray(stage.options.other.stages)
      ) {
        throw new Error(
          'pipelineExecute() expected stage.options.other to be a serialized pipeline object.',
        );
      }
      validateSerializedPipeline(stage.options.other, `${optionsPath}.other`);
      return;
    case 'where':
    case 'limit':
    case 'offset':
    case 'findNearest':
    case 'replaceWith':
    case 'unnest':
    case 'rawStage':
      return;
    default:
      throw new Error(`pipelineExecute() received an unknown stage: ${stage.stage}.`);
  }
}

export function validateSerializedPipeline(
  pipeline: unknown,
  fieldName: string = 'pipeline',
): asserts pipeline is FirestorePipelineSerializedInternal {
  if (!isRecord(pipeline)) {
    throw new Error(`pipelineExecute() expected ${fieldName} to be an object.`);
  }

  validateSource(pipeline.source, `${fieldName}.source`);

  if (!Array.isArray(pipeline.stages)) {
    throw new Error(`pipelineExecute() expected ${fieldName}.stages to be an array.`);
  }

  for (let i = 0; i < pipeline.stages.length; i++) {
    validateStage(
      pipeline.stages[i],
      `${fieldName}.stages[${i}]`,
      fieldName === 'pipeline' ? 'stage.options' : `${fieldName}.stages[${i}].options`,
    );
  }
}

function validateExecuteOptions(
  options: unknown,
): FirestorePipelineExecuteOptionsInternal | undefined {
  if (options === undefined) {
    return undefined;
  }

  if (!isRecord(options)) {
    throw new Error('pipelineExecute() expected options to be an object.');
  }

  if (options.indexMode !== undefined && options.indexMode !== 'recommended') {
    throw new Error('pipelineExecute() expected options.indexMode to equal "recommended".');
  }

  if (options.rawOptions !== undefined && !isRecord(options.rawOptions)) {
    throw new Error('pipelineExecute() expected options.rawOptions to be an object.');
  }

  return options as FirestorePipelineExecuteOptionsInternal;
}

export function parseWebSdkPipelineRequest(
  pipeline: unknown,
  options: unknown,
): WebParsedPipelineRequest {
  validateSerializedPipeline(pipeline);
  return {
    pipeline,
    options: validateExecuteOptions(options),
  };
}
