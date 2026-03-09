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
  CollectionReference,
  DocumentData,
  DocumentReference,
  Query,
} from '../types/firestore';
import type Timestamp from '../FirestoreTimestamp';
import type {
  BooleanExpression,
  Selectable,
  Field,
  Ordering,
  Accumulator,
  PipelineAggregateOptions,
  PipelineDistinctOptions,
  PipelineFindNearestOptions,
  PipelineReplaceWithOptions,
  PipelineSampleOptions,
  PipelineUnionOptions,
  PipelineUnnestOptions,
  PipelineRawStageOptions,
} from './stage_options';

/**
 * @beta
 * Result of running a pipeline. One per document (or per group with aggregation, or single for global aggregation).
 */
export interface PipelineResult<T = DocumentData> {
  data(): T;
  get(fieldPath: string | import('../modular/FieldPath').FieldPath | Field): unknown;
  readonly ref?: DocumentReference;
  readonly id?: string;
  readonly createTime?: Timestamp;
  readonly updateTime?: Timestamp;
}

/**
 * @beta
 * Snapshot returned from `execute(pipeline)`.
 */
export interface PipelineSnapshot<T = DocumentData> {
  readonly results: PipelineResult<T>[];
  readonly executionTime: Timestamp;
}

/**
 * @beta
 * Options for `execute()`.
 */
export interface ExecuteOptions<T = DocumentData> {
  pipeline: Pipeline<T>;
  indexMode?: 'recommended';
  rawOptions?: { [key: string]: unknown };
}

/**
 * @beta
 * Pipeline with chained stages. Each stage returns a new Pipeline (immutable chain).
 */
export interface Pipeline<T = DocumentData> {
  where(condition: BooleanExpression): Pipeline<T>;
  where(options: { condition: BooleanExpression }): Pipeline<T>;

  select(...selection: (Selectable | string)[]): Pipeline<T>;
  select(options: { selection: (Selectable | string)[] }): Pipeline<T>;

  addFields(...field: Selectable[]): Pipeline<T>;
  addFields(options: { field: Selectable[] }): Pipeline<T>;

  removeFields(...field: (Field | string)[]): Pipeline<T>;
  removeFields(options: { field: (Field | string)[] }): Pipeline<T>;

  sort(...ordering: Ordering[]): Pipeline<T>;
  sort(options: { ordering: Ordering[] }): Pipeline<T>;

  limit(n: number): Pipeline<T>;
  limit(options: { n: number }): Pipeline<T>;

  offset(n: number): Pipeline<T>;
  offset(options: { n: number }): Pipeline<T>;

  aggregate(...accumulator: Accumulator[]): Pipeline<T>;
  aggregate(options: PipelineAggregateOptions): Pipeline<T>;

  distinct(...group: (Field | string)[]): Pipeline<T>;
  distinct(options: PipelineDistinctOptions): Pipeline<T>;

  findNearest(options: PipelineFindNearestOptions): Pipeline<T>;

  replaceWith(fieldName: string): Pipeline<T>;
  replaceWith(expr: Selectable): Pipeline<T>;
  replaceWith(options: PipelineReplaceWithOptions): Pipeline<T>;

  sample(n: number): Pipeline<T>;
  sample(options: PipelineSampleOptions): Pipeline<T>;

  union(otherPipeline: Pipeline<T>): Pipeline<T>;
  union(options: PipelineUnionOptions<T>): Pipeline<T>;

  unnest(selectable: Selectable, indexField?: string): Pipeline<T>;
  unnest(options: PipelineUnnestOptions): Pipeline<T>;

  rawStage(
    name: string,
    params: Record<string, unknown>,
    options?: PipelineRawStageOptions,
  ): Pipeline<T>;
}

/**
 * @beta
 * Source stage options for collection.
 */
export interface PipelineCollectionSourceOptions {
  path?: string;
  collectionRef?: CollectionReference;
}

/**
 * @beta
 * Source stage options for collectionGroup.
 */
export interface PipelineCollectionGroupSourceOptions {
  collectionId?: string;
}

/**
 * @beta
 * Source stage options for database.
 */
export interface PipelineDatabaseSourceOptions {
  [key: string]: unknown;
}

/**
 * @beta
 * Source stage options for documents.
 */
export interface PipelineDocumentsSourceOptions {
  docs?: Array<string | DocumentReference>;
}

/**
 * @beta
 * PipelineSource defines the input for a pipeline. Call exactly one of collection, collectionGroup, database, documents, or createFrom.
 */
export interface PipelineSource<TPipeline extends Pipeline = Pipeline> {
  collection(path: string): TPipeline;
  collection(collectionRef: CollectionReference): TPipeline;
  collection(options: PipelineCollectionSourceOptions): TPipeline;

  collectionGroup(collectionId: string): TPipeline;
  collectionGroup(options: PipelineCollectionGroupSourceOptions): TPipeline;

  database(options?: PipelineDatabaseSourceOptions): TPipeline;

  documents(docs: Array<string | DocumentReference>): TPipeline;
  documents(options: PipelineDocumentsSourceOptions): TPipeline;

  createFrom(query: Query): TPipeline;
}
