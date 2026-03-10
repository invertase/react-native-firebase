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

import type { Pipeline, PipelineSource } from './pipeline';

/**
 * @beta
 * Pipeline type for Firestore pipelines API.
 */
export type {
  Pipeline,
  PipelineSource,
  PipelineSnapshot,
  PipelineResult,
  ExecuteOptions,
} from './pipeline';
export type {
  PipelineCollectionSourceOptions,
  PipelineCollectionGroupSourceOptions,
  PipelineDatabaseSourceOptions,
  PipelineDocumentsSourceOptions,
} from './pipeline';

export type {
  BooleanExpression,
  Selectable,
  Field,
  Expression,
  FunctionExpression,
  Accumulator,
  AggregateFunction,
  PipelineDistanceMeasure,
  PipelineAggregateOptions,
  PipelineDistinctOptions,
  PipelineFindNearestOptions,
  PipelineReplaceWithOptions,
  PipelineSampleOptions,
  PipelineUnionOptions,
  PipelineUnnestOptions,
  PipelineRawStageOptions,
  ExpressionType,
  Type,
  TimeGranularity,
  StageOptions,
  AliasedAggregate,
  AliasedExpression,
  AddFieldsStageOptions,
  AggregateStageOptions,
  CollectionGroupStageOptions,
  CollectionStageOptions,
  DatabaseStageOptions,
  DistinctStageOptions,
  DocumentsStageOptions,
  FindNearestStageOptions,
  LimitStageOptions,
  OffsetStageOptions,
  PipelineExecuteOptions,
  RemoveFieldsStageOptions,
  ReplaceWithStageOptions,
  SampleStageOptions,
  SelectStageOptions,
  SortStageOptions,
  UnionStageOptions,
  UnnestStageOptions,
  WhereStageOptions,
  OneOf,
} from './stage_options';

export {
  execute,
  field,
  and,
  or,
  gt,
  eq,
  greaterThan,
  equal,
  notEqual,
  gte,
  greaterThanOrEqual,
  lt,
  lte,
  lessThan,
  lessThanOrEqual,
  exists,
  arrayContains,
  arrayContainsAny,
  arrayContainsAll,
  startsWith,
  endsWith,
  OrderingHelper as Ordering,
  ascending,
  descending,
  avg,
  countAll,
  map,
  array,
  constant,
  add,
  subtract,
  divide,
  multiply,
  documentId,
  sum,
  count,
  average,
  abs,
  ceil,
  floor,
  mod,
  round,
  conditional,
  countDistinct,
  first,
  last,
  arrayAgg,
  concat,
  sqrt,
  currentTimestamp,
  not,
  ifAbsent,
  ifError,
  toLower,
  toUpper,
  trim,
  substring,
  arrayAggDistinct,
  arrayConcat,
  arrayGet,
  arrayLength,
  arraySum,
  byteLength,
  charLength,
  collectionId,
  countIf,
  exp,
  join,
  like,
  ln,
  log,
  log10,
  maximum,
  minimum,
  pow,
  reverse,
  split,
  cosineDistance,
  dotProduct,
  equalAny,
  euclideanDistance,
  isAbsent,
  isError,
  isType,
  logicalMaximum,
  logicalMinimum,
  ltrim,
  notEqualAny,
  pipelineResultEqual,
  rand,
  rtrim,
  stringConcat,
  mapEntries,
  mapGet,
  mapKeys,
  mapMerge,
  mapRemove,
  mapSet,
  mapValues,
  regexContains,
  regexFind,
  regexFindAll,
  regexMatch,
  stringContains,
  stringIndexOf,
  stringRepeat,
  stringReplaceAll,
  stringReplaceOne,
  stringReverse,
  timestampAdd,
  timestampSubtract,
  timestampToUnixMicros,
  timestampToUnixMillis,
  timestampToUnixSeconds,
  timestampTruncate,
  trunc,
  type,
  unixMicrosToTimestamp,
  unixMillisToTimestamp,
  unixSecondsToTimestamp,
  vectorLength,
  xor,
  length,
} from './stage';

declare module '../types/firestore' {
  /**
   * @beta
   * Creates and returns a new PipelineSource, which allows specifying the source stage of a `Pipeline`.
   *
   * @example
   * ```
   * const myPipeline = firestore.pipeline().collection('books');
   * ```
   */
  interface Firestore {
    pipeline(): PipelineSource<Pipeline>;
  }
}
