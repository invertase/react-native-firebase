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

import {
  collection,
  collectionGroup,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestore';
import type {
  Firestore,
  Query,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestore';
import type {
  FirestorePipelineExecuteOptionsInternal,
  FirestorePipelineResultInternal,
  FirestorePipelineSerializedInternal,
  FirestorePipelineSnapshotInternal,
  FirestorePipelineTimestampInternal,
} from '../types/internal';
import { objectToWriteable } from './convert';
import { buildQuery } from './query';
import type { FilterSpec, OrderSpec, QueryOptions } from './query';

type PipelineExecuteFn = (input: unknown) => Promise<unknown>;

interface WebPipelineSdkHooks {
  execute?: PipelineExecuteFn;
}

const FIRESTORE_LITE_UNSUPPORTED_SUFFIX =
  ' This operation is unavailable because the web runtime uses Firestore Lite.';

function createLiteUnsupportedError(message: string): Error {
  return new Error(message + FIRESTORE_LITE_UNSUPPORTED_SUFFIX);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeExecuteOptions(
  options?: FirestorePipelineExecuteOptionsInternal,
): FirestorePipelineExecuteOptionsInternal {
  const executeOptions: FirestorePipelineExecuteOptionsInternal = {};

  if (options?.indexMode === 'recommended') {
    executeOptions.indexMode = 'recommended';
  }
  if (isRecord(options?.rawOptions)) {
    executeOptions.rawOptions = options.rawOptions;
  }

  return executeOptions;
}

function serializeTimestamp(value: unknown): FirestorePipelineTimestampInternal | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (isRecord(value)) {
    if (typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
      return {
        seconds: value.seconds,
        nanoseconds: value.nanoseconds,
      };
    }

    if (typeof value.toMillis === 'function') {
      return (value.toMillis as () => number)();
    }
  }

  return undefined;
}

function serializePipelineResult(result: unknown): FirestorePipelineResultInternal {
  const resultRecord = isRecord(result) ? result : {};
  const ref = isRecord(resultRecord.ref) ? resultRecord.ref : undefined;
  const path = typeof ref?.path === 'string' ? ref.path : undefined;
  const rawData = typeof resultRecord.data === 'function' ? resultRecord.data() : resultRecord.data;
  const idFromPath = path ? path.split('/').pop() : undefined;

  return {
    data: isRecord(rawData) ? objectToWriteable(rawData) : undefined,
    path,
    id: typeof resultRecord.id === 'string' ? resultRecord.id : idFromPath,
    createTime: serializeTimestamp(resultRecord.createTime),
    updateTime: serializeTimestamp(resultRecord.updateTime),
  };
}

function isSerializedPipeline(value: unknown): value is FirestorePipelineSerializedInternal {
  return isRecord(value) && isRecord(value.source) && Array.isArray(value.stages);
}

function applyPipelineStage(
  current: any,
  stageName: string,
  stageOptions: Record<string, unknown>,
  firestore: Firestore,
): any {
  const method = current?.[stageName];
  if (typeof method !== 'function') {
    throw new Error(`Pipeline stage "${stageName}" is not supported by the current web SDK.`);
  }

  switch (stageName) {
    case 'select':
      return Array.isArray(stageOptions.selections)
        ? method.call(current, ...stageOptions.selections)
        : method.call(current, stageOptions);
    case 'addFields':
      return Array.isArray(stageOptions.fields)
        ? method.call(current, ...stageOptions.fields)
        : method.call(current, stageOptions);
    case 'removeFields':
      return Array.isArray(stageOptions.fields)
        ? method.call(current, ...stageOptions.fields)
        : method.call(current, stageOptions);
    case 'sort':
      return Array.isArray(stageOptions.orderings)
        ? method.call(current, ...stageOptions.orderings)
        : method.call(current, stageOptions);
    case 'limit':
      return typeof stageOptions.limit === 'number'
        ? method.call(current, stageOptions.limit)
        : method.call(current, stageOptions);
    case 'offset':
      return typeof stageOptions.offset === 'number'
        ? method.call(current, stageOptions.offset)
        : method.call(current, stageOptions);
    case 'distinct':
      return Array.isArray(stageOptions.groups)
        ? method.call(current, ...stageOptions.groups)
        : method.call(current, stageOptions);
    case 'replaceWith':
      return stageOptions.map !== undefined
        ? method.call(current, stageOptions.map)
        : method.call(current, stageOptions);
    case 'sample':
      return typeof stageOptions.documents === 'number'
        ? method.call(current, stageOptions.documents)
        : method.call(current, stageOptions);
    case 'union': {
      const nested = isSerializedPipeline(stageOptions.other)
        ? buildWebSdkPipeline(firestore, stageOptions.other)
        : stageOptions.other;
      return method.call(current, nested);
    }
    case 'unnest':
      return stageOptions.selectable !== undefined
        ? method.call(current, stageOptions.selectable, stageOptions.indexField)
        : method.call(current, stageOptions);
    case 'rawStage':
      return typeof stageOptions.name === 'string'
        ? method.call(
            current,
            stageOptions.name,
            stageOptions.params,
            isRecord(stageOptions.options) ? stageOptions.options : undefined,
          )
        : method.call(current, stageOptions);
    default:
      return method.call(current, stageOptions);
  }
}

function buildWebSdkPipeline(
  firestore: Firestore,
  pipeline: FirestorePipelineSerializedInternal,
): any {
  const pipelineFactory = (firestore as { pipeline?: () => unknown }).pipeline;
  if (typeof pipelineFactory !== 'function') {
    throw createLiteUnsupportedError(
      'pipelineExecute() expected a Firestore instance with pipeline() support.',
    );
  }

  const pipelineSource = pipelineFactory.call(firestore) as Record<string, unknown>;
  const source = pipeline.source;
  let currentPipeline: any;

  switch (source.source) {
    case 'collection':
      currentPipeline =
        isRecord(source.rawOptions) && source.rawOptions
          ? (pipelineSource.collection as any)?.({
              collection: source.path,
              rawOptions: source.rawOptions,
            })
          : (pipelineSource.collection as any)?.(source.path);
      break;
    case 'collectionGroup':
      currentPipeline =
        isRecord(source.rawOptions) && source.rawOptions
          ? (pipelineSource.collectionGroup as any)?.({
              collectionId: source.collectionId,
              rawOptions: source.rawOptions,
            })
          : (pipelineSource.collectionGroup as any)?.(source.collectionId);
      break;
    case 'database':
      currentPipeline =
        isRecord(source.rawOptions) && source.rawOptions
          ? (pipelineSource.database as any)?.({ rawOptions: source.rawOptions })
          : (pipelineSource.database as any)?.();
      break;
    case 'documents':
      currentPipeline =
        isRecord(source.rawOptions) && source.rawOptions
          ? (pipelineSource.documents as any)?.({
              docs: source.documents,
              rawOptions: source.rawOptions,
            })
          : (pipelineSource.documents as any)?.(source.documents);
      break;
    case 'query': {
      if (typeof pipelineSource.createFrom !== 'function') {
        throw createLiteUnsupportedError(
          'pipelineExecute() expected pipeline source to support createFrom(query).',
        );
      }

      const queryRef =
        source.queryType === 'collectionGroup'
          ? (collectionGroup(firestore, source.path) as unknown as Query)
          : (collection(firestore, source.path) as unknown as Query);
      const query = buildQuery(
        queryRef,
        source.filters as FilterSpec[],
        source.orders as OrderSpec[],
        source.options as QueryOptions,
      );
      currentPipeline = (pipelineSource.createFrom as (query: Query) => unknown)(
        query as unknown as Query,
      );
      break;
    }
    default:
      throw new Error('pipelineExecute() received an unknown source type.');
  }

  if (!currentPipeline) {
    throw new Error(
      `pipelineExecute() failed to construct source stage "${String(source.source)}" for web SDK.`,
    );
  }

  for (let i = 0; i < pipeline.stages.length; i++) {
    const stage = pipeline.stages[i];
    if (!stage || typeof stage.stage !== 'string' || !isRecord(stage.options)) {
      throw new Error('pipelineExecute() expected each stage to include stage and options.');
    }
    currentPipeline = applyPipelineStage(currentPipeline, stage.stage, stage.options, firestore);
  }

  return currentPipeline;
}

export async function executeWebSdkPipeline(
  firestore: Firestore | unknown,
  pipeline: FirestorePipelineSerializedInternal,
  options?: FirestorePipelineExecuteOptionsInternal,
  hooks?: WebPipelineSdkHooks,
): Promise<FirestorePipelineSnapshotInternal> {
  const webSdkPipeline = buildWebSdkPipeline(firestore as Firestore, pipeline);
  const executeOptions = normalizeExecuteOptions(options);
  const hasOptions = Object.keys(executeOptions).length > 0;

  const sdkExecute = hooks?.execute;
  const pipelineExecute = webSdkPipeline?.execute;

  let rawSnapshot: unknown;
  if (typeof sdkExecute === 'function') {
    rawSnapshot = hasOptions
      ? await sdkExecute({ pipeline: webSdkPipeline, ...executeOptions })
      : await sdkExecute(webSdkPipeline);
  } else if (typeof pipelineExecute === 'function') {
    rawSnapshot = hasOptions
      ? await pipelineExecute.call(webSdkPipeline, executeOptions)
      : await pipelineExecute.call(webSdkPipeline);
  } else {
    throw createLiteUnsupportedError(
      'pipelineExecute() expected either web execute(...) or pipeline.execute(...).',
    );
  }

  const snapshotRecord = isRecord(rawSnapshot) ? rawSnapshot : {};
  const results = Array.isArray(snapshotRecord.results)
    ? snapshotRecord.results.map(serializePipelineResult)
    : [];

  return {
    results,
    executionTime: (() => {
      const executionTime = serializeTimestamp(snapshotRecord.executionTime);
      if (!executionTime) {
        throw new Error(
          'pipelineExecute() expected the web SDK snapshot to include executionTime.',
        );
      }
      return executionTime;
    })(),
  };
}
