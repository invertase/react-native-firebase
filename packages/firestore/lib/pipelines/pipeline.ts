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
  PipelineAggregateOptions,
  PipelineDistinctOptions,
  PipelineFindNearestOptions,
  PipelineReplaceWithOptions,
  PipelineSampleOptions,
  PipelineUnionOptions,
  PipelineUnnestOptions,
  PipelineRawStageOptions,
} from './stage_options';
import type {
  BooleanExpression,
  Selectable,
  Field,
  Ordering,
  Accumulator,
} from './expressions';

/**
 * @beta
 * Pipeline with chained stages. Each stage returns a new Pipeline (immutable chain).
 */
export interface Pipeline<T = import('../types/firestore').DocumentData> {
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
