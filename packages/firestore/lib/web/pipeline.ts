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
import * as firebaseFirestorePipelines from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines';
import type {
  AggregateFunction,
  AliasedAggregate,
  AliasedExpression,
  Expression,
  Ordering,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines';
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

type PipelineExecuteFn = (...args: unknown[]) => Promise<unknown>;

interface WebPipelineSdkHooks {
  execute?: PipelineExecuteFn;
}

type WebPipelineMethod = (...args: unknown[]) => unknown;

type WebPipelineInstance = Record<string, unknown> & {
  execute?: (options?: unknown) => Promise<unknown>;
};

type WebPipelineSource = Record<string, unknown> & {
  collection?: WebPipelineMethod;
  collectionGroup?: WebPipelineMethod;
  database?: WebPipelineMethod;
  documents?: WebPipelineMethod;
  createFrom?: (query: Query) => unknown;
};

const FIRESTORE_LITE_UNSUPPORTED_SUFFIX =
  ' This operation is unavailable because the web runtime uses Firestore Lite.';

function createLiteUnsupportedError(message: string): Error {
  return new Error(message + FIRESTORE_LITE_UNSUPPORTED_SUFFIX);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

type PipelineHelperFn = (...args: unknown[]) => unknown;
type AliasedValue = { as: (name: string) => unknown };
const WEB_PIPELINE_HELPER_ALIASES: Record<string, string> = {
  lower: 'toLower',
  upper: 'toUpper',
};

function getPipelineHelper(name: string): PipelineHelperFn {
  const helperModule = firebaseFirestorePipelines as Record<string, unknown>;
  const helper = helperModule[name] ?? helperModule[WEB_PIPELINE_HELPER_ALIASES[name] ?? ''];
  if (typeof helper !== 'function') {
    throw new Error(
      `pipelineExecute() cannot rebuild "${name}" because the web helper is missing.`,
    );
  }
  return helper as PipelineHelperFn;
}

function reviveExpressionNode(node: Record<string, unknown>): Expression {
  if (node.exprType === 'Field' || typeof node.path === 'string') {
    return getPipelineHelper('field')(node.path) as Expression;
  }

  if (node.exprType === 'Constant' || Object.prototype.hasOwnProperty.call(node, 'value')) {
    return getPipelineHelper('constant')(revivePipelineValue(node.value)) as Expression;
  }

  if (typeof node.name === 'string') {
    const args = Array.isArray(node.args) ? node.args.map(revivePipelineValue) : [];
    return getPipelineHelper(node.name)(...args) as Expression;
  }

  throw new Error('pipelineExecute() failed to rebuild a serialized expression node for web SDK.');
}

function reviveAggregateNode(node: Record<string, unknown>): AggregateFunction {
  if (typeof node.kind !== 'string') {
    throw new Error('pipelineExecute() failed to rebuild aggregate node: missing aggregate kind.');
  }

  const args = Array.isArray(node.args) ? node.args.map(revivePipelineValue) : [];
  return getPipelineHelper(node.kind)(...args) as AggregateFunction;
}

function reviveOrderingNode(node: Record<string, unknown>): Ordering {
  if (!Object.prototype.hasOwnProperty.call(node, 'expr')) {
    throw new Error('pipelineExecute() failed to rebuild ordering node: missing expr.');
  }

  const direction = node.direction === 'descending' ? 'descending' : 'ascending';
  return getPipelineHelper(direction)(revivePipelineValue(node.expr)) as Ordering;
}

function reviveAliasedNode(
  node: Record<string, unknown>,
  nodeKey: 'expr' | 'aggregate',
): AliasedExpression | AliasedAggregate {
  const alias = typeof node.alias === 'string' ? node.alias : undefined;
  if (!alias) {
    throw new Error(`pipelineExecute() failed to rebuild aliased node: missing ${nodeKey} alias.`);
  }

  const value = revivePipelineValue(node[nodeKey]);
  if (!value || (typeof value !== 'object' && typeof value !== 'function') || !('as' in value)) {
    throw new Error(`pipelineExecute() failed to rebuild aliased ${nodeKey}: invalid value.`);
  }

  return (value as AliasedValue).as(alias) as AliasedExpression | AliasedAggregate;
}

function isFlatAliasedFieldNode(value: Record<string, unknown>): boolean {
  const alias = value.alias ?? value.as;
  return (
    typeof value.path === 'string' &&
    value.path.length > 0 &&
    typeof alias === 'string' &&
    alias.length > 0
  );
}

function isAliasedExpressionNode(value: Record<string, unknown>): boolean {
  const alias = value.alias ?? value.as;
  return (
    typeof alias === 'string' &&
    alias.length > 0 &&
    Object.prototype.hasOwnProperty.call(value, 'expr')
  );
}

function isAliasedAggregateNode(value: Record<string, unknown>): boolean {
  return (
    typeof value.alias === 'string' &&
    value.alias.length > 0 &&
    Object.prototype.hasOwnProperty.call(value, 'aggregate')
  );
}

function revivePipelineValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(revivePipelineValue);
  }

  if (!isRecord(value)) {
    return value;
  }

  if (isFlatAliasedFieldNode(value)) {
    const alias = (value.alias ?? value.as) as string;
    const field = getPipelineHelper('field')(value.path) as Expression & Partial<AliasedValue>;
    const asFn = field.as;
    if (typeof asFn !== 'function') {
      throw new Error('pipelineExecute() failed to rebuild flat aliased field for web SDK.');
    }
    return asFn.call(field, alias);
  }

  if (isAliasedExpressionNode(value)) {
    const alias = (value.alias ?? value.as) as string;
    const expr = revivePipelineValue(value.expr) as Expression & Partial<AliasedValue>;
    const asFn = expr.as;
    if (typeof asFn !== 'function') {
      throw new Error('pipelineExecute() failed to rebuild aliased expression for web SDK.');
    }
    return asFn.call(expr, alias);
  }

  if (isAliasedAggregateNode(value)) {
    const aggregate = revivePipelineValue(value.aggregate) as AggregateFunction &
      Partial<AliasedValue>;
    const asFn = aggregate.as;
    if (typeof asFn !== 'function') {
      throw new Error('pipelineExecute() failed to rebuild aliased aggregate for web SDK.');
    }
    return asFn.call(aggregate, value.alias as string);
  }

  switch (value.__kind) {
    case 'expression':
      return reviveExpressionNode(value);
    case 'aggregate':
      return reviveAggregateNode(value);
    case 'ordering':
      return reviveOrderingNode(value);
    case 'aliasedExpression':
      return reviveAliasedNode(value, 'expr');
    case 'aliasedAggregate':
      return reviveAliasedNode(value, 'aggregate');
    default: {
      const revived: Record<string, unknown> = {};
      for (const [key, entry] of Object.entries(value)) {
        revived[key] = revivePipelineValue(entry);
      }
      return revived;
    }
  }
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
  current: WebPipelineInstance,
  stageName: string,
  stageOptions: Record<string, unknown>,
  firestore: Firestore,
): WebPipelineInstance {
  const revivedStageOptions = revivePipelineValue(stageOptions);
  const stageArgs = isRecord(revivedStageOptions) ? revivedStageOptions : stageOptions;
  const method = current?.[stageName];
  if (typeof method !== 'function') {
    throw new Error(`Pipeline stage "${stageName}" is not supported by the current web SDK.`);
  }

  switch (stageName) {
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
      if (Array.isArray(stageArgs.selections) && stageArgs.selections.length === 0) {
        throw new Error(
          'pipelineExecute() expected stage.options.selections to contain at least one value.',
        );
      }
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
      if (Array.isArray(stageArgs.orderings) && stageArgs.orderings.length === 0) {
        throw new Error(
          'pipelineExecute() expected stage.options.orderings to contain at least one value.',
        );
      }
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
      if (Array.isArray(stageArgs.groups) && stageArgs.groups.length === 0) {
        throw new Error(
          'pipelineExecute() expected stage.options.groups to contain at least one value.',
        );
      }
      return (
        Array.isArray(stageArgs.groups)
          ? method.call(current, ...stageArgs.groups)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'aggregate':
      if (Array.isArray(stageArgs.accumulators) && stageArgs.accumulators.length === 0) {
        throw new Error(
          'pipelineExecute() expected stage.options.accumulators to contain at least one value.',
        );
      }
      return method.call(current, stageArgs) as WebPipelineInstance;
    case 'replaceWith':
      return (
        stageArgs.map !== undefined
          ? method.call(current, stageArgs.map)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'sample':
      if (typeof stageArgs.documents !== 'number' && typeof stageArgs.percentage !== 'number') {
        throw new Error(
          'pipelineExecute() expected sample stage to include documents or percentage.',
        );
      }
      return (
        typeof stageArgs.documents === 'number'
          ? method.call(current, stageArgs.documents)
          : method.call(current, stageArgs)
      ) as WebPipelineInstance;
    case 'union': {
      const rawOther = stageOptions.other;
      if (!isSerializedPipeline(rawOther)) {
        throw new Error(
          'pipelineExecute() expected stage.options.other to be a serialized pipeline object.',
        );
      }
      const nested = buildWebSdkPipeline(firestore, rawOther);
      return method.call(current, { other: nested }) as WebPipelineInstance;
    }
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

function buildWebSdkPipeline(
  firestore: Firestore,
  pipeline: FirestorePipelineSerializedInternal,
): WebPipelineInstance {
  const pipelineFactory = (firestore as { pipeline?: () => unknown }).pipeline;
  if (typeof pipelineFactory !== 'function') {
    throw createLiteUnsupportedError(
      'pipelineExecute() expected a Firestore instance with pipeline() support.',
    );
  }

  const pipelineSource = pipelineFactory.call(firestore) as WebPipelineSource;
  const source = pipeline.source;
  let currentPipeline: WebPipelineInstance | undefined;

  switch (source.source) {
    case 'collection': {
      const collectionMethod = pipelineSource.collection;
      if (typeof collectionMethod === 'function') {
        currentPipeline = (
          isRecord(source.rawOptions) && source.rawOptions
            ? collectionMethod.call(pipelineSource, {
                collection: source.path,
                rawOptions: source.rawOptions,
              })
            : collectionMethod.call(pipelineSource, source.path)
        ) as WebPipelineInstance;
      }
      break;
    }
    case 'collectionGroup': {
      const collectionGroupMethod = pipelineSource.collectionGroup;
      if (typeof collectionGroupMethod === 'function') {
        currentPipeline = (
          isRecord(source.rawOptions) && source.rawOptions
            ? collectionGroupMethod.call(pipelineSource, {
                collectionId: source.collectionId,
                rawOptions: source.rawOptions,
              })
            : collectionGroupMethod.call(pipelineSource, source.collectionId)
        ) as WebPipelineInstance;
      }
      break;
    }
    case 'database': {
      const databaseMethod = pipelineSource.database;
      if (typeof databaseMethod === 'function') {
        currentPipeline = (
          isRecord(source.rawOptions) && source.rawOptions
            ? databaseMethod.call(pipelineSource, { rawOptions: source.rawOptions })
            : databaseMethod.call(pipelineSource)
        ) as WebPipelineInstance;
      }
      break;
    }
    case 'documents': {
      const documentsMethod = pipelineSource.documents;
      if (typeof documentsMethod === 'function') {
        currentPipeline = (
          isRecord(source.rawOptions) && source.rawOptions
            ? documentsMethod.call(pipelineSource, {
                docs: source.documents,
                rawOptions: source.rawOptions,
              })
            : documentsMethod.call(pipelineSource, source.documents)
        ) as WebPipelineInstance;
      }
      break;
    }
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
      ) as WebPipelineInstance;
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
    if (hasOptions) {
      try {
        rawSnapshot = await sdkExecute(webSdkPipeline, executeOptions);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isLegacyObjectOverload =
          message.includes('_terminated') ||
          message.includes('Cannot read properties of undefined');
        if (!isLegacyObjectOverload) {
          throw error;
        }
        rawSnapshot = await sdkExecute({ pipeline: webSdkPipeline, ...executeOptions });
      }
    } else {
      rawSnapshot = await sdkExecute(webSdkPipeline);
    }
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
