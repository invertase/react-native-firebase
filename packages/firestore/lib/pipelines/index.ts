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

import type { PipelineSource } from './pipeline-source';
import type { Pipeline } from './pipeline';
import { installPipelineRuntime, registerPipelineRuntimeInstaller } from './pipeline_runtime';

/**
 * @beta
 * Pipeline type for Firestore pipelines API.
 */
export type { PipelineResult, PipelineSnapshot } from './pipeline-result';
export type { Pipeline } from './pipeline';
export type { PipelineSource } from './pipeline-source';

export type {
  BooleanExpression,
  Selectable,
  Field,
  Expression,
  FunctionExpression,
  AggregateFunction,
  ExpressionType,
  Type,
  TimeGranularity,
  AliasedAggregate,
  AliasedExpression,
} from './expressions';
export type {
  StageOptions,
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
  RemoveFieldsStageOptions,
  ReplaceWithStageOptions,
  SampleStageOptions,
  SelectStageOptions,
  SortStageOptions,
  UnionStageOptions,
  UnnestStageOptions,
  WhereStageOptions,
} from './stage_options';
export type { PipelineExecuteOptions } from './pipeline_options';
export type { OneOf } from './types';

export { execute } from './pipeline_impl';
export {
  field,
  and,
  or,
  greaterThan,
  equal,
  notEqual,
  greaterThanOrEqual,
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
} from './expressions';
export { pipelineResultEqual } from './pipeline-result';

registerPipelineRuntimeInstaller();
installPipelineRuntime();

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
