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

import type { Pipeline } from './pipeline';

/**
 * @beta
 * Boolean expression for pipeline `where()` (e.g. field('x').gt(0), and(...), or(...)).
 */
export interface BooleanExpression {
  readonly _brand?: 'BooleanExpression';
}

/**
 * @beta
 * Selectable for pipeline field selection/expressions (e.g. field('a').as('b'), expressions).
 */
export interface Selectable {
  readonly _brand?: 'Selectable';
}

/**
 * @beta
 * Field reference for pipeline stages.
 */
export interface Field {
  readonly _brand?: 'Field';
}

/**
 * @beta
 * Ordering for pipeline sort() (e.g. Ordering.of(field('rating')).descending()).
 */
export interface Ordering {
  descending(): Ordering;
  ascending(): Ordering;
  readonly _brand?: 'Ordering';
}

/**
 * @beta
 * Accumulator for pipeline aggregate() (e.g. avg(field('rating')).as('avgRating'), countAll().as('total')).
 */
export interface Accumulator {
  as(name: string): Accumulator;
  readonly _brand?: 'Accumulator';
}

/**
 * @beta
 * Distance measure for vector search.
 */
export type PipelineDistanceMeasure = 'COSINE' | 'EUCLIDEAN' | 'DOT_PRODUCT';

/**
 * @beta
 * Options for pipeline aggregate() stage.
 */
export interface PipelineAggregateOptions {
  accumulator?: Accumulator[];
  groups?: Selectable[];
}

/**
 * @beta
 * Options for pipeline distinct() stage.
 */
export interface PipelineDistinctOptions {
  group?: (Field | string)[];
}

/**
 * @beta
 * Options for pipeline findNearest() stage (vector search).
 */
export interface PipelineFindNearestOptions {
  field: string | Field;
  vectorValue: number[] | { values: number[] };
  distanceMeasure: PipelineDistanceMeasure;
  limit?: number;
  distanceField?: string;
}

/**
 * @beta
 * Options for pipeline replaceWith() stage.
 */
export interface PipelineReplaceWithOptions {
  expr?: Selectable;
  fieldName?: string;
}

/**
 * @beta
 * Options for pipeline sample() stage.
 */
export interface PipelineSampleOptions {
  n?: number;
  percent?: number;
}

/**
 * @beta
 * Options for pipeline union() stage.
 */
export interface PipelineUnionOptions<T = import('../types/firestore').DocumentData> {
  pipeline?: Pipeline<T>;
}

/**
 * @beta
 * Options for pipeline unnest() stage.
 */
export interface PipelineUnnestOptions {
  selectable?: Selectable;
  indexField?: string;
}

/**
 * @beta
 * Options for pipeline rawStage().
 */
export interface PipelineRawStageOptions {
  [key: string]: unknown;
}
