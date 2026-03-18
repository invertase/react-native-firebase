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
  isArray,
  isAndroid,
  isIOS,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/app/dist/module/common';
import type {
  FirestoreInternal,
  FirestorePipelineExecuteOptionsInternal,
  FirestorePipelinePrototypeInternal,
  FirestorePipelineResultInternal,
  FirestorePipelineSerializedInternal,
  FirestorePipelineSnapshotInternal,
  FirestorePipelineSourceInternal,
  FirestorePipelineStageInternal,
  FirestorePipelineTimestampInternal,
  QueryWithAggregateInternals,
} from '../types/internal';
import type {
  CollectionReference,
  DocumentReference,
  Query,
  DocumentData,
} from '../types/firestore';
import FirestorePath from '../FirestorePath';
import FirestoreTimestamp from '../FirestoreTimestamp';
import DocumentReferenceClass from '../FirestoreDocumentReference';
import FieldPath, { fromDotSeparatedString } from '../FieldPath';
import { extractFieldPathData } from '../utils';
import { parseNativeMap } from '../utils/serialize';

import type { BooleanExpression, Field, Ordering, Selectable, Accumulator } from './expressions';
import type { Pipeline } from './pipeline';
import type {
  PipelineCollectionSourceOptions,
  PipelineCollectionGroupSourceOptions,
  PipelineDatabaseSourceOptions,
  PipelineDocumentsSourceOptions,
  PipelineSource,
} from './pipeline-source';
import type { PipelineResult, PipelineSnapshot } from './pipeline-result';
import type {
  PipelineAggregateOptions,
  PipelineDistinctOptions,
  PipelineFindNearestOptions,
  PipelineRawStageOptions,
  PipelineReplaceWithOptions,
  PipelineSampleOptions,
  PipelineUnionOptions,
  PipelineUnnestOptions,
} from './stage_options';
import type { PipelineExecuteOptions } from './pipeline_options';
import { getFirestore } from '../modular';

const PIPELINE_RUNTIME_SYMBOL = Symbol.for('RNFBFirestorePipelineRuntime');
const PIPELINE_RUNTIME_INSTALLER_SYMBOL = Symbol.for('RNFBFirestorePipelineRuntimeInstaller');

type GlobalWithPipelineInstaller = typeof globalThis & {
  [PIPELINE_RUNTIME_INSTALLER_SYMBOL]?: (firestore?: FirestoreInternal) => void;
};

interface RuntimePipeline extends Pipeline {
  readonly [PIPELINE_RUNTIME_SYMBOL]: true;
  readonly firestore: FirestoreInternal;
  serialize(visiting?: WeakSet<object>): FirestorePipelineSerializedInternal;
}

function isRuntimePipeline(value: unknown): value is RuntimePipeline {
  return isObject(value) && (value as unknown as RuntimePipeline)[PIPELINE_RUNTIME_SYMBOL] === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return isObject(value) && !isArray(value);
}

function hasAnyKey(value: Record<string, unknown>, keys: string[]): boolean {
  return keys.some(key => Object.prototype.hasOwnProperty.call(value, key));
}

function assertSameFirestoreInstance(
  actual: FirestoreInternal,
  expected: FirestoreInternal,
  method: 'collection' | 'documents',
): void {
  if (actual !== expected) {
    throw new Error(
      `firebase.firestore().pipeline().${method}(*) cannot use a reference from a different Firestore instance.`,
    );
  }
}

function getFirestoreReference(
  value: unknown,
): { firestore: FirestoreInternal; path: string } | undefined {
  if (
    isRecord(value) &&
    isRecord(value.firestore) &&
    isString(value.path) &&
    value.path.length > 0
  ) {
    return {
      firestore: value.firestore as unknown as FirestoreInternal,
      path: value.path,
    };
  }

  return undefined;
}

function parseTimestamp(
  value: FirestorePipelineTimestampInternal | undefined,
): FirestoreTimestamp | undefined {
  if (value instanceof FirestoreTimestamp) {
    return value;
  }

  if (isNumber(value)) {
    return FirestoreTimestamp.fromMillis(value);
  }

  if (isArray(value)) {
    const seconds = Number(value[0] ?? 0);
    const nanoseconds = Number(value[1] ?? 0);
    return new FirestoreTimestamp(seconds, nanoseconds);
  }

  if (isRecord(value)) {
    const seconds = Number(value.seconds ?? 0);
    const nanoseconds = Number(value.nanoseconds ?? 0);
    return new FirestoreTimestamp(seconds, nanoseconds);
  }

  return undefined;
}

function getNativeTypeMapArray(value: unknown): [number, unknown?] | undefined {
  if (isArray(value) && value.length > 0 && isNumber(value[0])) {
    return value as [number, unknown?];
  }

  if (isRecord(value) && isNumber(value[0])) {
    return [value[0], value[1]];
  }

  return undefined;
}

function isNativeTypeMapValue(value: unknown): boolean {
  return getNativeTypeMapArray(value) !== undefined;
}

function isNativeTypeMapObject(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }

  const values = Object.values(value);
  if (values.length === 0) {
    return true;
  }

  return values.every(isNativeTypeMapValue);
}

function fieldPathToSegments(fieldPath: string | FieldPath | Field): string[] {
  if (isString(fieldPath)) {
    return fromDotSeparatedString(fieldPath)._segments;
  }

  if (fieldPath instanceof FieldPath) {
    return fieldPath._segments;
  }

  if (isRecord(fieldPath) && isString(fieldPath.path)) {
    return fromDotSeparatedString(fieldPath.path)._segments;
  }

  throw new Error(
    "firebase.firestore().pipeline().execute().result.get(*) 'fieldPath' must be a string, FieldPath, or field().",
  );
}

class RuntimePipelineResult<T = DocumentData> implements PipelineResult<T> {
  private readonly _data: T;
  readonly ref?: DocumentReference;
  readonly id?: string;
  readonly createTime?: FirestoreTimestamp;
  readonly updateTime?: FirestoreTimestamp;

  constructor(firestore: FirestoreInternal, nativeResult: FirestorePipelineResultInternal) {
    if (isNativeTypeMapObject(nativeResult.data)) {
      const normalizedData = Object.fromEntries(
        Object.entries(nativeResult.data ?? {}).map(([key, value]) => [
          key,
          getNativeTypeMapArray(value) ?? value,
        ]),
      );
      this._data = parseNativeMap(firestore, normalizedData) as T;
    } else {
      this._data = (nativeResult.data ?? {}) as T;
    }

    if (isString(nativeResult.path)) {
      this.ref = new DocumentReferenceClass(
        firestore,
        FirestorePath.fromName(nativeResult.path),
      ) as unknown as DocumentReference;
    }

    this.id = isString(nativeResult.id) ? nativeResult.id : this.ref?.id;
    this.createTime = parseTimestamp(nativeResult.createTime);
    this.updateTime = parseTimestamp(nativeResult.updateTime);
  }

  data(): T {
    return this._data;
  }

  get(fieldPath: string | FieldPath | Field): unknown {
    return extractFieldPathData(this._data, fieldPathToSegments(fieldPath));
  }
}

function serializeValue(value: unknown, visiting: WeakSet<object>): unknown {
  if (value instanceof FirestoreTimestamp) {
    return { seconds: value.seconds, nanoseconds: value.nanoseconds };
  }

  if (value instanceof FieldPath) {
    return { segments: value._toArray() };
  }

  if (isRuntimePipeline(value)) {
    return value.serialize(visiting);
  }

  if (isArray(value)) {
    return value.map(entry => serializeValue(entry, visiting));
  }

  if (isRecord(value)) {
    if (visiting.has(value)) {
      throw new Error(
        'firebase.firestore().pipeline() failed to serialize arguments because of a circular value.',
      );
    }

    // Explicit wire format for aliased expressions so native (Android) always receives expr, alias, as.
    const rec = value as Record<string, unknown>;
    if (rec.__kind === 'aliasedExpression' && rec.expr !== undefined && rec.alias !== undefined) {
      visiting.add(value);
      const inner = rec.expr as Record<string, unknown>;
      // Flat form for simple field path: { path, alias, as } so native does not need to parse nested expr.
      if (
        inner &&
        typeof inner === 'object' &&
        (inner.__kind === 'expression' || inner.exprType === 'Field') &&
        typeof inner.path === 'string' &&
        inner.path.length > 0
      ) {
        visiting.delete(value);
        return { path: inner.path, alias: rec.alias, as: rec.alias };
      }
      const result = {
        expr: serializeValue(rec.expr, visiting),
        alias: rec.alias,
        as: rec.alias,
      };
      visiting.delete(value);
      return result;
    }

    // Convert document/collection references to a stable path representation.
    if (
      isString((value as { path?: unknown }).path) &&
      isObject((value as { firestore?: unknown }).firestore)
    ) {
      return { path: (value as { path: string }).path };
    }

    visiting.add(value);
    const output: Record<string, unknown> = {};
    const entries = Object.entries(value);

    for (const [key, entryValue] of entries) {
      if (!isUndefined(entryValue)) {
        output[key] = serializeValue(entryValue, visiting);
      }
    }

    visiting.delete(value);
    // Ensure aliased expressions have both "alias" and "as" for native (e.g. Android coerceSelectable).
    if (
      typeof (output as Record<string, unknown>).alias !== 'undefined' &&
      (typeof (output as Record<string, unknown>).expr !== 'undefined' ||
        (output as Record<string, unknown>).__kind === 'aliasedExpression')
    ) {
      (output as Record<string, unknown>).as = (output as Record<string, unknown>).alias;
    }
    return output;
  }

  return value;
}

function ensureNonEmptyString(path: unknown, method: string): string {
  if (!isString(path) || path.length === 0) {
    throw new Error(`firebase.firestore().pipeline().${method}(*) expected a non-empty string.`);
  }

  return path;
}

function asQueryInternals(query: Query): QueryWithAggregateInternals {
  return query as unknown as QueryWithAggregateInternals;
}

class RuntimePipelineImpl<T = DocumentData> implements RuntimePipeline {
  readonly [PIPELINE_RUNTIME_SYMBOL] = true as const;
  readonly firestore: FirestoreInternal;

  private readonly _source: FirestorePipelineSourceInternal;
  private readonly _stages: FirestorePipelineStageInternal[];

  constructor(
    firestore: FirestoreInternal,
    source: FirestorePipelineSourceInternal,
    stages: FirestorePipelineStageInternal[] = [],
  ) {
    this.firestore = firestore;
    this._source = source;
    this._stages = stages;
  }

  private append(stage: string, options: Record<string, unknown>): RuntimePipelineImpl<T> {
    return new RuntimePipelineImpl(this.firestore, this._source, [
      ...this._stages,
      { stage, options },
    ]);
  }

  serialize(
    visiting: WeakSet<object> = new WeakSet<object>(),
  ): FirestorePipelineSerializedInternal {
    if (visiting.has(this)) {
      throw new Error('firebase.firestore().pipeline() cannot union a pipeline with itself.');
    }

    visiting.add(this);
    const stages = this._stages.map(stage => ({
      stage: stage.stage,
      options: serializeValue(stage.options, visiting) as Record<string, unknown>,
    }));
    const source = serializeValue(this._source, visiting) as FirestorePipelineSourceInternal;
    visiting.delete(this);

    return { source, stages };
  }

  where(condition: BooleanExpression): Pipeline<T>;
  where(options: { condition: BooleanExpression }): Pipeline<T>;
  where(conditionOrOptions: BooleanExpression | { condition: BooleanExpression }): Pipeline<T> {
    const condition =
      isRecord(conditionOrOptions) && hasAnyKey(conditionOrOptions, ['condition'])
        ? conditionOrOptions.condition
        : conditionOrOptions;
    return this.append('where', { condition });
  }

  select(...selection: (Selectable | string)[]): Pipeline<T>;
  select(options: { selection: (Selectable | string)[] }): Pipeline<T>;
  select(
    ...selectionOrOptions: (Selectable | string)[] | [{ selection: (Selectable | string)[] }]
  ): Pipeline<T> {
    const first = selectionOrOptions[0];
    const selections =
      selectionOrOptions.length === 1 &&
      isRecord(first) &&
      hasAnyKey(first, ['selection', 'selections'])
        ? (first.selection ?? (first as { selections?: (Selectable | string)[] }).selections) || []
        : (selectionOrOptions as (Selectable | string)[]);
    return this.append('select', { selections });
  }

  addFields(...field: Selectable[]): Pipeline<T>;
  addFields(options: { field: Selectable[] }): Pipeline<T>;
  addFields(...fieldOrOptions: Selectable[] | [{ field: Selectable[] }]): Pipeline<T> {
    const first = fieldOrOptions[0];
    const fields =
      fieldOrOptions.length === 1 && isRecord(first) && hasAnyKey(first, ['field', 'fields'])
        ? (first.field ?? (first as { fields?: Selectable[] }).fields) || []
        : (fieldOrOptions as Selectable[]);
    return this.append('addFields', { fields });
  }

  removeFields(...field: (Field | string)[]): Pipeline<T>;
  removeFields(options: { field: (Field | string)[] }): Pipeline<T>;
  removeFields(
    ...fieldOrOptions: (Field | string)[] | [{ field: (Field | string)[] }]
  ): Pipeline<T> {
    const first = fieldOrOptions[0];
    const fields =
      fieldOrOptions.length === 1 && isRecord(first) && hasAnyKey(first, ['field', 'fields'])
        ? (first.field ?? (first as { fields?: (Field | string)[] }).fields) || []
        : (fieldOrOptions as (Field | string)[]);
    return this.append('removeFields', { fields });
  }

  sort(...ordering: Ordering[]): Pipeline<T>;
  sort(options: { ordering: Ordering[] }): Pipeline<T>;
  sort(...orderingOrOptions: Ordering[] | [{ ordering: Ordering[] }]): Pipeline<T> {
    const first = orderingOrOptions[0];
    const orderings =
      orderingOrOptions.length === 1 &&
      isRecord(first) &&
      hasAnyKey(first, ['ordering', 'orderings'])
        ? (first.ordering ?? (first as { orderings?: Ordering[] }).orderings) || []
        : (orderingOrOptions as Ordering[]);
    return this.append('sort', { orderings });
  }

  limit(n: number): Pipeline<T>;
  limit(options: { n: number }): Pipeline<T>;
  limit(nOrOptions: number | { n: number }): Pipeline<T> {
    const limit = isNumber(nOrOptions)
      ? nOrOptions
      : Number(nOrOptions.n ?? (nOrOptions as { limit?: number }).limit ?? 0);
    return this.append('limit', { limit });
  }

  offset(n: number): Pipeline<T>;
  offset(options: { n: number }): Pipeline<T>;
  offset(nOrOptions: number | { n: number }): Pipeline<T> {
    const offset = isNumber(nOrOptions)
      ? nOrOptions
      : Number(nOrOptions.n ?? (nOrOptions as { offset?: number }).offset ?? 0);
    return this.append('offset', { offset });
  }

  aggregate(...accumulator: Accumulator[]): Pipeline<T>;
  aggregate(options: PipelineAggregateOptions): Pipeline<T>;
  aggregate(...accumulatorOrOptions: Accumulator[] | [PipelineAggregateOptions]): Pipeline<T> {
    const first = accumulatorOrOptions[0];
    const isOptionsRecord =
      accumulatorOrOptions.length === 1 &&
      isRecord(first) &&
      hasAnyKey(first, ['accumulators', 'accumulator', 'groups', 'group']);
    const accumulators = isOptionsRecord
      ? (first.accumulators ?? (first as { accumulator?: Accumulator[] }).accumulator) || []
      : (accumulatorOrOptions as Accumulator[]);
    const groups = isOptionsRecord
      ? ((first.groups ?? (first as { group?: (Field | string)[] }).group) as
          | (Field | string)[]
          | undefined)
      : undefined;

    return this.append('aggregate', { accumulators, groups });
  }

  distinct(...group: (Field | string)[]): Pipeline<T>;
  distinct(options: PipelineDistinctOptions): Pipeline<T>;
  distinct(...groupOrOptions: (Field | string)[] | [PipelineDistinctOptions]): Pipeline<T> {
    const first = groupOrOptions[0];
    const groups =
      groupOrOptions.length === 1 && isRecord(first) && hasAnyKey(first, ['groups', 'group'])
        ? (first.groups ?? (first as { group?: (Field | string)[] }).group) || []
        : (groupOrOptions as (Field | string)[]);
    return this.append('distinct', { groups });
  }

  findNearest(options: PipelineFindNearestOptions): Pipeline<T> {
    return this.append('findNearest', options as unknown as Record<string, unknown>);
  }

  replaceWith(fieldName: string): Pipeline<T>;
  replaceWith(expr: Selectable): Pipeline<T>;
  replaceWith(options: PipelineReplaceWithOptions): Pipeline<T>;
  replaceWith(
    fieldNameOrExprOrOptions: string | Selectable | PipelineReplaceWithOptions,
  ): Pipeline<T> {
    if (isString(fieldNameOrExprOrOptions)) {
      return this.append('replaceWith', { map: fieldNameOrExprOrOptions });
    }

    if (
      isRecord(fieldNameOrExprOrOptions) &&
      hasAnyKey(fieldNameOrExprOrOptions, ['map', 'expr', 'fieldName'])
    ) {
      const map =
        fieldNameOrExprOrOptions.map ??
        (fieldNameOrExprOrOptions as { expr?: Selectable }).expr ??
        (fieldNameOrExprOrOptions as { fieldName?: string }).fieldName;
      return this.append('replaceWith', { map });
    }

    return this.append('replaceWith', { map: fieldNameOrExprOrOptions });
  }

  sample(n: number): Pipeline<T>;
  sample(options: PipelineSampleOptions): Pipeline<T>;
  sample(nOrOptions: number | PipelineSampleOptions): Pipeline<T> {
    if (isNumber(nOrOptions)) {
      return this.append('sample', { documents: nOrOptions });
    }

    return this.append('sample', nOrOptions as Record<string, unknown>);
  }

  union(otherPipeline: Pipeline<T>): Pipeline<T>;
  union(options: PipelineUnionOptions<T>): Pipeline<T>;
  union(otherOrOptions: Pipeline<T> | PipelineUnionOptions<T>): Pipeline<T> {
    const other = isRuntimePipeline(otherOrOptions)
      ? otherOrOptions
      : (otherOrOptions as PipelineUnionOptions<T>).pipeline;

    if (!other || !isRuntimePipeline(other)) {
      throw new Error(
        'firebase.firestore().pipeline().union(*) expected a pipeline created from firestore.pipeline().',
      );
    }

    if (other.firestore !== this.firestore) {
      throw new Error(
        'firebase.firestore().pipeline().union(*) cannot combine pipelines from different Firestore instances.',
      );
    }

    return this.append('union', { other });
  }

  unnest(selectable: Selectable, indexField?: string): Pipeline<T>;
  unnest(options: PipelineUnnestOptions): Pipeline<T>;
  unnest(
    selectableOrOptions: Selectable | PipelineUnnestOptions,
    indexField?: string,
  ): Pipeline<T> {
    const isOptionsObject =
      isRecord(selectableOrOptions) &&
      (Object.prototype.hasOwnProperty.call(selectableOrOptions, 'indexField') ||
        (Object.prototype.hasOwnProperty.call(selectableOrOptions, 'selectable') &&
          !hasAnyKey(selectableOrOptions, [
            '__kind',
            'exprType',
            'path',
            'name',
            'args',
            'alias',
          ])));

    if (isOptionsObject) {
      return this.append('unnest', selectableOrOptions as Record<string, unknown>);
    }

    return this.append('unnest', { selectable: selectableOrOptions, indexField });
  }

  rawStage(
    name: string,
    params: Record<string, unknown>,
    options?: PipelineRawStageOptions,
  ): Pipeline<T> {
    return this.append('rawStage', { name, params, options: options ?? {} });
  }
}

class RuntimePipelineSourceImpl<
  TPipeline extends Pipeline = Pipeline,
> implements PipelineSource<TPipeline> {
  private readonly _firestore: FirestoreInternal;

  constructor(firestore: FirestoreInternal) {
    this._firestore = firestore;
  }

  collection(path: string): TPipeline;
  collection(collectionRef: CollectionReference): TPipeline;
  collection(options: PipelineCollectionSourceOptions): TPipeline;
  collection(
    pathOrCollectionRefOrOptions: string | CollectionReference | PipelineCollectionSourceOptions,
  ): TPipeline {
    if (isString(pathOrCollectionRefOrOptions)) {
      return new RuntimePipelineImpl(this._firestore, {
        source: 'collection',
        path: ensureNonEmptyString(pathOrCollectionRefOrOptions, 'collection'),
      }) as unknown as TPipeline;
    }

    if (!isRecord(pathOrCollectionRefOrOptions)) {
      throw new Error(
        'firebase.firestore().pipeline().collection(*) expected a path, CollectionReference, or options object.',
      );
    }

    const collectionRef =
      getFirestoreReference(pathOrCollectionRefOrOptions.collectionRef) ??
      getFirestoreReference(pathOrCollectionRefOrOptions);

    if (collectionRef) {
      assertSameFirestoreInstance(collectionRef.firestore, this._firestore, 'collection');
    }

    const path = isString(pathOrCollectionRefOrOptions.path)
      ? pathOrCollectionRefOrOptions.path
      : isRecord(pathOrCollectionRefOrOptions.collectionRef) &&
          isString(pathOrCollectionRefOrOptions.collectionRef.path)
        ? pathOrCollectionRefOrOptions.collectionRef.path
        : undefined;

    return new RuntimePipelineImpl(this._firestore, {
      source: 'collection',
      path: ensureNonEmptyString(path, 'collection'),
      rawOptions: isRecord(pathOrCollectionRefOrOptions.rawOptions)
        ? pathOrCollectionRefOrOptions.rawOptions
        : undefined,
    }) as unknown as TPipeline;
  }

  collectionGroup(collectionId: string): TPipeline;
  collectionGroup(options: PipelineCollectionGroupSourceOptions): TPipeline;
  collectionGroup(collectionIdOrOptions: string | PipelineCollectionGroupSourceOptions): TPipeline {
    if (isString(collectionIdOrOptions)) {
      return new RuntimePipelineImpl(this._firestore, {
        source: 'collectionGroup',
        collectionId: ensureNonEmptyString(collectionIdOrOptions, 'collectionGroup'),
      }) as unknown as TPipeline;
    }

    if (!isRecord(collectionIdOrOptions)) {
      throw new Error(
        'firebase.firestore().pipeline().collectionGroup(*) expected a collectionId string or options object.',
      );
    }

    return new RuntimePipelineImpl(this._firestore, {
      source: 'collectionGroup',
      collectionId: ensureNonEmptyString(collectionIdOrOptions.collectionId, 'collectionGroup'),
      rawOptions: isRecord(collectionIdOrOptions.rawOptions)
        ? collectionIdOrOptions.rawOptions
        : undefined,
    }) as unknown as TPipeline;
  }

  database(options?: PipelineDatabaseSourceOptions): TPipeline {
    return new RuntimePipelineImpl(this._firestore, {
      source: 'database',
      rawOptions: isRecord(options?.rawOptions) ? options.rawOptions : undefined,
    }) as unknown as TPipeline;
  }

  documents(docs: Array<string | DocumentReference>): TPipeline;
  documents(options: PipelineDocumentsSourceOptions): TPipeline;
  documents(
    docsOrOptions: Array<string | DocumentReference> | PipelineDocumentsSourceOptions,
  ): TPipeline {
    const docs = isArray(docsOrOptions)
      ? docsOrOptions
      : (docsOrOptions.docs ??
          (docsOrOptions as { documents?: Array<string | DocumentReference> }).documents) ||
        [];

    if (!isArray(docs) || docs.length === 0) {
      throw new Error(
        'firebase.firestore().pipeline().documents(*) expected at least one document path or DocumentReference.',
      );
    }

    const documents = docs.map((doc, index) => {
      if (isString(doc) && doc.length > 0) {
        return doc;
      }

      if (isRecord(doc) && isString(doc.path) && doc.path.length > 0) {
        const documentRef = getFirestoreReference(doc);
        if (documentRef) {
          assertSameFirestoreInstance(documentRef.firestore, this._firestore, 'documents');
        }

        return doc.path;
      }

      throw new Error(
        `firebase.firestore().pipeline().documents(*) invalid value at index ${index}. Expected a document path or DocumentReference.`,
      );
    });

    return new RuntimePipelineImpl(this._firestore, {
      source: 'documents',
      documents,
    }) as unknown as TPipeline;
  }

  createFrom(query: Query): TPipeline {
    const internals = asQueryInternals(query);

    if (!internals || !internals._collectionPath || !internals._modifiers) {
      throw new Error(
        'firebase.firestore().pipeline().createFrom(*) expected a Query from @react-native-firebase/firestore.',
      );
    }

    if (internals._firestore !== this._firestore) {
      throw new Error(
        'firebase.firestore().pipeline().createFrom(*) cannot use a Query from a different Firestore instance.',
      );
    }

    return new RuntimePipelineImpl(this._firestore, {
      source: 'query',
      path: internals._collectionPath.relativeName,
      queryType: internals._modifiers.type,
      filters: internals._modifiers.filters,
      orders: internals._modifiers.orders,
      options: internals._modifiers.options as unknown as Record<string, unknown>,
    }) as unknown as TPipeline;
  }
}

export function createPipelineSource(firestore: FirestoreInternal): PipelineSource<Pipeline> {
  return new RuntimePipelineSourceImpl(firestore);
}

export function installPipelineRuntime(firestoreInstance?: FirestoreInternal): void {
  let firestore = firestoreInstance;
  if (!firestore) {
    try {
      firestore = getFirestore() as FirestoreInternal;
    } catch {
      return;
    }
  }

  const prototype = Object.getPrototypeOf(firestore) as FirestorePipelinePrototypeInternal | null;
  if (!prototype || prototype.__rnfbFirestorePipelineInstalled__) {
    return;
  }

  Object.defineProperty(prototype, 'pipeline', {
    value(this: FirestoreInternal) {
      return createPipelineSource(this);
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });

  Object.defineProperty(prototype, '__rnfbFirestorePipelineInstalled__', {
    value: true,
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

export function registerPipelineRuntimeInstaller(): void {
  const runtimeGlobal = globalThis as GlobalWithPipelineInstaller;
  runtimeGlobal[PIPELINE_RUNTIME_INSTALLER_SYMBOL] = installPipelineRuntime;
}

function parseExecuteInput(pipelineOrOptions: Pipeline | PipelineExecuteOptions): {
  runtimePipeline: RuntimePipeline;
  executeOptions: FirestorePipelineExecuteOptionsInternal;
} {
  if (isRuntimePipeline(pipelineOrOptions)) {
    return { runtimePipeline: pipelineOrOptions, executeOptions: {} };
  }

  if (!isRecord(pipelineOrOptions)) {
    throw new Error(
      'firebase.firestore().pipeline().execute(*) expected a Pipeline or PipelineExecuteOptions.',
    );
  }

  const runtimePipeline = pipelineOrOptions.pipeline;
  if (!isRuntimePipeline(runtimePipeline)) {
    throw new Error(
      'firebase.firestore().pipeline().execute(*) expected options.pipeline to be created from firestore.pipeline().',
    );
  }

  return {
    runtimePipeline,
    executeOptions: {
      indexMode: pipelineOrOptions.indexMode === 'recommended' ? 'recommended' : undefined,
      rawOptions: isRecord(pipelineOrOptions.rawOptions) ? pipelineOrOptions.rawOptions : undefined,
    },
  };
}

export async function executeRuntimePipeline(
  pipelineOrOptions: Pipeline | PipelineExecuteOptions,
): Promise<PipelineSnapshot> {
  const { runtimePipeline, executeOptions } = parseExecuteInput(pipelineOrOptions);
  if (isIOS || isAndroid) {
    if (executeOptions.indexMode) {
      throw new Error(
        'pipelineExecute() does not support options.indexMode on Android and iOS because native Firestore pipeline execute options are currently unstable or unavailable.',
      );
    }

    if (isRecord(executeOptions.rawOptions)) {
      throw new Error(
        'pipelineExecute() does not support options.rawOptions on Android and iOS because native Firestore pipeline execute options are currently unstable or unavailable.',
      );
    }
  }

  const nativeResponse = (await runtimePipeline.firestore.native.pipelineExecute(
    runtimePipeline.serialize(),
    executeOptions,
  )) as FirestorePipelineSnapshotInternal;

  const executionTime = parseTimestamp(nativeResponse?.executionTime);
  if (!executionTime) {
    throw new Error(
      'firebase.firestore().pipeline().execute(*) expected pipelineExecute() to return executionTime.',
    );
  }
  const results = (nativeResponse?.results ?? []).map(
    result => new RuntimePipelineResult(runtimePipeline.firestore, result),
  );

  return {
    results,
    executionTime,
  };
}
