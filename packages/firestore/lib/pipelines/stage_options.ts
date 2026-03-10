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
 * Expression type kind (for internal/backend use).
 */
export type ExpressionType =
  | 'Field'
  | 'Constant'
  | 'Function'
  | 'AggregateFunction'
  | 'ListOfExpressions'
  | 'AliasedExpression';

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
  selectable: true;
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
 * Function expression (e.g. map(...), array(...)). Used as return type and in Expression union.
 */
export interface FunctionExpression {
  selectable: true;
  readonly _brand?: 'FunctionExpression';
}

/**
 * @beta
 * Expression type for pipeline parameters (field refs, literals, function results).
 */
export type Expression = Field | FunctionExpression | Selectable | string;

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
 * Aggregate function (e.g. countAll()). Alias for Accumulator.
 */
export type AggregateFunction = Accumulator;

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
  accumulators?: Accumulator[];
  groups?: Selectable[];
}

/**
 * @beta
 * Options for pipeline distinct() stage.
 */
export interface PipelineDistinctOptions {
  groups?: (Field | string)[];
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
  map?: Selectable | string;
}

/**
 * @beta
 * Options for pipeline sample() stage.
 */
export interface PipelineSampleOptions {
  documents?: number;
  percentage?: number;
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

/**
 * @beta
 * Options defining how a Stage is evaluated. Base type for stage option types.
 */
export interface StageOptions {
  /**
   * @beta
   * Escape hatch for options not known at build time (e.g. backend-specific snake_case options).
   */
  rawOptions?: {
    [name: string]: unknown;
  };
}

/**
 * @beta
 * An aggregate function with an output alias.
 */
export interface AliasedAggregate {
  readonly aggregate: AggregateFunction;
  readonly alias: string;
}

/**
 * @beta
 * An expression with an output alias (implements Selectable).
 */
export interface AliasedExpression extends Selectable {
  readonly expr: Expression;
  readonly alias: string;
  exprType?: ExpressionType;
}

/**
 * @beta
 * Options for AddFields stage. At least one field required.
 */
export type AddFieldsStageOptions = StageOptions & {
  fields: Selectable[];
};

/**
 * @beta
 * Options for Aggregate stage.
 */
export type AggregateStageOptions = StageOptions & {
  accumulators: AliasedAggregate[];
  groups?: Array<string | Selectable>;
};
