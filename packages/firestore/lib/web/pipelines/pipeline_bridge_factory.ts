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
import type { FirestorePipelineSerializedInternal } from '../../types/internal';
import {
  revivePipelineValue,
  type WebPipelineInstance,
  type WebPipelineSource,
} from './pipeline_node_builder';
import type { WebParsedPipelineRequest } from './pipeline_parser';
import { buildQuery } from '../query';
import type { FilterSpec, OrderSpec, QueryOptions } from '../query';

const FIRESTORE_LITE_UNSUPPORTED_SUFFIX =
  ' This operation is unavailable because the web runtime uses Firestore Lite.';

function createLiteUnsupportedError(message: string): Error {
  return new Error(message + FIRESTORE_LITE_UNSUPPORTED_SUFFIX);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function buildCollectionSourcePipeline(
  pipelineSource: WebPipelineSource,
  source: Extract<FirestorePipelineSerializedInternal['source'], { source: 'collection' }>,
): WebPipelineInstance | undefined {
  if (typeof pipelineSource.collection !== 'function') {
    return undefined;
  }

  return pipelineSource.collection({
    collection: source.path,
    ...(isRecord(source.rawOptions) && source.rawOptions ? { rawOptions: source.rawOptions } : {}),
  }) as WebPipelineInstance;
}

function buildCollectionGroupSourcePipeline(
  pipelineSource: WebPipelineSource,
  source: Extract<FirestorePipelineSerializedInternal['source'], { source: 'collectionGroup' }>,
): WebPipelineInstance | undefined {
  if (typeof pipelineSource.collectionGroup !== 'function') {
    return undefined;
  }

  return pipelineSource.collectionGroup({
    collectionId: source.collectionId,
    ...(isRecord(source.rawOptions) && source.rawOptions ? { rawOptions: source.rawOptions } : {}),
  }) as WebPipelineInstance;
}

function buildDatabaseSourcePipeline(
  pipelineSource: WebPipelineSource,
  source: Extract<FirestorePipelineSerializedInternal['source'], { source: 'database' }>,
): WebPipelineInstance | undefined {
  if (typeof pipelineSource.database !== 'function') {
    return undefined;
  }

  return pipelineSource.database(
    isRecord(source.rawOptions) && source.rawOptions ? { rawOptions: source.rawOptions } : {},
  ) as WebPipelineInstance;
}

function buildDocumentsSourcePipeline(
  pipelineSource: WebPipelineSource,
  source: Extract<FirestorePipelineSerializedInternal['source'], { source: 'documents' }>,
): WebPipelineInstance | undefined {
  if (typeof pipelineSource.documents !== 'function') {
    return undefined;
  }

  return pipelineSource.documents({
    docs: source.documents,
    ...(isRecord(source.rawOptions) && source.rawOptions ? { rawOptions: source.rawOptions } : {}),
  }) as WebPipelineInstance;
}

function buildQuerySourcePipeline(
  firestore: Firestore,
  pipelineSource: WebPipelineSource,
  source: Extract<FirestorePipelineSerializedInternal['source'], { source: 'query' }>,
): WebPipelineInstance {
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

  return pipelineSource.createFrom(query as unknown as Query) as WebPipelineInstance;
}

function getPipelineStageMethod(
  current: WebPipelineInstance,
  stageName: string,
): (this: WebPipelineInstance, ...args: unknown[]) => unknown {
  const method = current?.[stageName] as ((this: WebPipelineInstance, ...args: unknown[]) => unknown)
    | undefined;
  if (typeof method !== 'function') {
    throw new Error(`Pipeline stage "${stageName}" is not supported by the current web SDK.`);
  }
  return method;
}

function applyPipelineStage(
  current: WebPipelineInstance,
  stage: FirestorePipelineSerializedInternal['stages'][number],
  nestedUnionPipeline?: WebPipelineInstance,
): WebPipelineInstance {
  if (stage.stage === 'union') {
    return getPipelineStageMethod(current, stage.stage).call(current, {
      other: nestedUnionPipeline,
    }) as WebPipelineInstance;
  }

  const revivedStageOptions = revivePipelineValue(stage.options);
  const stageArgs = (isRecord(revivedStageOptions) ? revivedStageOptions : stage.options) as Record<
    string,
    unknown
  >;
  const method = getPipelineStageMethod(current, stage.stage);

  switch (stage.stage) {
    case 'where':
      if (isRecord(stageArgs.condition) && typeof stageArgs.condition.operator === 'string') {
        const op = stageArgs.condition.operator.toUpperCase();
        const isArrayOperator =
          op === 'IN' ||
          op === 'NOT_IN' ||
          op === 'ARRAY_CONTAINS_ANY' ||
          op === 'ARRAY_CONTAINS_ALL';
        if (isArrayOperator && !Array.isArray(stageArgs.condition.value)) {
          throw new Error('invalid argument');
        }
      }
      return (
        stageArgs.condition !== undefined
          ? method.call(current, stageArgs.condition)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'select':
      return (
        Array.isArray(stageArgs.selections)
          ? method.call(current, ...stageArgs.selections)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'addFields':
      return (
        Array.isArray(stageArgs.fields)
          ? method.call(current, ...stageArgs.fields)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'removeFields':
      return (
        Array.isArray(stageArgs.fields)
          ? method.call(current, ...stageArgs.fields)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'sort':
      return (
        Array.isArray(stageArgs.orderings)
          ? method.call(current, ...stageArgs.orderings)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'limit':
      return (
        typeof stageArgs.limit === 'number'
          ? method.call(current, stageArgs.limit)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'offset':
      return (
        typeof stageArgs.offset === 'number'
          ? method.call(current, stageArgs.offset)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'distinct':
      return (
        Array.isArray(stageArgs.groups)
          ? method.call(current, ...stageArgs.groups)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'aggregate':
      return method.call(current, stageArgs) as WebPipelineInstance;
    case 'replaceWith':
      return (
        stageArgs.map !== undefined
          ? method.call(current, stageArgs.map)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'sample':
      return (
        typeof stageArgs.documents === 'number'
          ? method.call(current, stageArgs.documents)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'unnest':
      return (
        stageArgs.selectable !== undefined
          ? method.call(current, stageArgs.selectable, stageArgs.indexField)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'rawStage':
      return (
        typeof stageArgs.name === 'string'
          ? method.call(
              current,
              stageArgs.name,
              stageArgs.params,
              isRecord(stageArgs.options) ? stageArgs.options : undefined,
            )
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    default:
      return method.call(current, stageArgs) as WebPipelineInstance;
  }
}

function buildSourcePipeline(
  firestore: Firestore,
  pipelineFactory: () => unknown,
  pipeline: FirestorePipelineSerializedInternal,
): WebPipelineInstance {
  const pipelineSource = pipelineFactory.call(firestore) as WebPipelineSource;
  const source = pipeline.source;
  let currentPipeline: WebPipelineInstance | undefined;

  switch (source.source) {
    case 'collection':
      currentPipeline = buildCollectionSourcePipeline(pipelineSource, source);
      break;
    case 'collectionGroup':
      currentPipeline = buildCollectionGroupSourcePipeline(pipelineSource, source);
      break;
    case 'database':
      currentPipeline = buildDatabaseSourcePipeline(pipelineSource, source);
      break;
    case 'documents':
      currentPipeline = buildDocumentsSourcePipeline(pipelineSource, source);
      break;
    case 'query':
      currentPipeline = buildQuerySourcePipeline(firestore, pipelineSource, source);
      break;
    default:
      throw new Error('pipelineExecute() received an unknown source type.');
  }

  if (!currentPipeline) {
    throw new Error(
      `pipelineExecute() failed to construct source stage "${String(source.source)}" for web SDK.`,
    );
  }

  return currentPipeline;
}

type PipelineBuildFrame = {
  kind: 'pipeline';
  pipeline: FirestorePipelineSerializedInternal;
  currentPipeline: WebPipelineInstance;
  stageIndex: number;
};

type UnionBuildFrame = {
  kind: 'union';
  parent: PipelineBuildFrame;
  stage: Extract<FirestorePipelineSerializedInternal['stages'][number], { stage: 'union' }>;
  method: (this: WebPipelineInstance, ...args: unknown[]) => unknown;
};

export function buildWebSdkPipeline(
  firestore: Firestore,
  request: Pick<WebParsedPipelineRequest, 'pipeline'>,
): WebPipelineInstance {
  const pipelineFactory = (firestore as { pipeline?: () => unknown }).pipeline;
  if (typeof pipelineFactory !== 'function') {
    throw createLiteUnsupportedError(
      'pipelineExecute() expected a Firestore instance with pipeline() support.',
    );
  }

  const stack: Array<PipelineBuildFrame | UnionBuildFrame> = [
    {
      kind: 'pipeline',
      pipeline: request.pipeline,
      currentPipeline: buildSourcePipeline(firestore, pipelineFactory, request.pipeline),
      stageIndex: 0,
    },
  ];
  let lastCompletedPipeline: WebPipelineInstance | undefined;

  while (stack.length > 0) {
    const frame = stack[stack.length - 1]!;

    if (frame.kind === 'union') {
      if (!lastCompletedPipeline) {
        throw new Error('pipelineExecute() failed to rebuild nested union pipeline for web SDK.');
      }

      frame.parent.currentPipeline = frame.method.call(frame.parent.currentPipeline, {
        other: lastCompletedPipeline,
      }) as WebPipelineInstance;
      frame.parent.stageIndex += 1;
      lastCompletedPipeline = undefined;
      stack.pop();
      continue;
    }

    if (frame.stageIndex >= frame.pipeline.stages.length) {
      lastCompletedPipeline = frame.currentPipeline;
      stack.pop();
      continue;
    }

    const stage = frame.pipeline.stages[frame.stageIndex]!;
    if (stage.stage !== 'union') {
      frame.currentPipeline = applyPipelineStage(frame.currentPipeline, stage);
      frame.stageIndex += 1;
      continue;
    }

    const unionPipeline = stage.options.other as FirestorePipelineSerializedInternal;
    stack.push({
      kind: 'union',
      parent: frame,
      stage,
      method: getPipelineStageMethod(frame.currentPipeline, stage.stage),
    });
    stack.push({
      kind: 'pipeline',
      pipeline: unionPipeline,
      currentPipeline: buildSourcePipeline(firestore, pipelineFactory, unionPipeline),
      stageIndex: 0,
    });
  }

  if (!lastCompletedPipeline) {
    throw new Error('pipelineExecute() failed to rebuild a pipeline for web SDK.');
  }

  return lastCompletedPipeline;
}
