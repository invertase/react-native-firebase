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

import type { ExecuteOptions, Pipeline, PipelineSnapshot } from './pipeline';
import type {
  BooleanExpression,
  Field,
  Ordering,
  Accumulator,
  AggregateFunction,
  Expression,
  FunctionExpression,
  Selectable,
} from './stage_options';

/**
 * @beta
 * Executes a pipeline and returns a Promise that resolves to the pipeline snapshot.
 *
 * @example
 * ```
 * const snapshot = await execute(
 *   firestore.pipeline().collection('books').where(gt(field('rating'), 4.5)).select('title', 'author', 'rating')
 * );
 * ```
 */
export function execute(pipeline: Pipeline): Promise<PipelineSnapshot>;

/**
 * @beta
 * Executes a pipeline with options.
 */
export function execute(options: ExecuteOptions): Promise<PipelineSnapshot>;

export function execute(
  _pipelineOrOptions: Pipeline | ExecuteOptions,
): Promise<PipelineSnapshot> {
  // Stub: internal implementation will differ for React Native Firebase.
  return Promise.resolve({
    results: [],
    executionTime: {} as import('../FirestoreTimestamp').default,
  });
}

// --- Expression / helper stubs (for use in where, select, addFields, aggregate, sort, etc.) ---

/**
 * @beta
 * Returns a Field reference for use in pipeline expressions.
 */
export function field(_path: string): Field {
  return {} as Field;
}

/**
 * @beta
 * Logical AND of boolean expressions.
 */
export function and(
  first: BooleanExpression,
  second: BooleanExpression,
  ...more: BooleanExpression[]
): BooleanExpression {
  void first;
  void second;
  void more;
  return {} as BooleanExpression;
}

/**
 * @beta
 * Logical OR of boolean expressions.
 */
export function or(
  first: BooleanExpression,
  second: BooleanExpression,
  ...more: BooleanExpression[]
): BooleanExpression {
  void first;
  void second;
  void more;
  return {} as BooleanExpression;
}

/**
 * @beta
 * Greater-than comparison.
 */
export function gt(_left: Expression, _right: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Greater-than comparison (alias for gt).
 */
export function greaterThan(_left: Expression, _right: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Equality comparison.
 */
export function eq(_left: Expression, _right: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Equality comparison (alias for eq).
 */
export function equal(_left: Expression, _right: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Inequality comparison.
 */
export function notEqual(_left: Expression, _right: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Greater-than-or-equal comparison.
 */
export function gte(_left: Expression, _right: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Less-than comparison.
 */
export function lt(_left: Expression, _right: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Less-than comparison (alias for lt).
 */
export function lessThan(_left: Expression, _right: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Less-than-or-equal comparison.
 */
export function lte(_left: Expression, _right: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Less-than-or-equal comparison (alias for lte).
 */
export function lessThanOrEqual(_left: Expression, _right: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Greater-than-or-equal comparison (alias for gte).
 */
export function greaterThanOrEqual(_left: Expression, _right: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Checks if a field exists (or expression evaluates to a value).
 */
export function exists(_valueOrFieldName: Expression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Checks if an array contains an element.
 */
export function arrayContains(
  _arrayOrFieldName: Expression,
  _element: Expression,
): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Checks if an array contains any of the given values.
 */
export function arrayContainsAny(
  _arrayOrFieldName: Expression,
  _values: Array<Expression | unknown>,
): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Checks if an array contains all of the given values.
 */
export function arrayContainsAll(
  _arrayOrFieldName: Expression,
  _values: Array<Expression | unknown>,
): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Checks if a string starts with a prefix.
 */
export function startsWith(_stringOrFieldName: string, _prefix: string): BooleanExpression;
export function startsWith(
  _stringOrFieldName: Expression,
  _prefix: string | Expression,
): BooleanExpression;
export function startsWith(
  _stringOrFieldName: string | Expression,
  _prefix: string | Expression,
): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Checks if a string ends with a suffix.
 */
export function endsWith(_stringOrFieldName: string, _suffix: string): BooleanExpression;
export function endsWith(
  _stringOrFieldName: Expression,
  _suffix: string | Expression,
): BooleanExpression;
export function endsWith(
  _stringOrFieldName: string | Expression,
  _suffix: string | Expression,
): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Ordering helper (e.g. Ordering.of(field('rating')).descending()).
 */
export const OrderingHelper = {
  of(_fieldOrOrdering: Field | Ordering): Ordering {
    return {} as Ordering;
  },
};

/**
 * @beta
 * Ascending ordering (standalone). Use in sort().
 */
export function ascending(_expr: Expression): Ordering {
  return {} as Ordering;
}

/**
 * @beta
 * Descending ordering (standalone). Use in sort().
 */
export function descending(_expr: Expression): Ordering {
  return {} as Ordering;
}

/**
 * @beta
 * Average aggregation (e.g. avg(field('rating')).as('avgRating')).
 */
export function avg(_f: Field | Selectable): Accumulator {
  return {} as Accumulator;
}

/**
 * @beta
 * Count-all aggregation (e.g. countAll().as('total')).
 */
export function countAll(): AggregateFunction {
  return {} as AggregateFunction;
}

/**
 * @beta
 * Map expression for replaceWith etc.
 */
export function map(_entries: Record<string, unknown>): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Array expression.
 */
export function array(_elements: unknown[]): FunctionExpression {
  return {} as FunctionExpression;
}
