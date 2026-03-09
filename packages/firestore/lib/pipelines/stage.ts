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

import type { DocumentData } from '../types/firestore';
import type { ExecuteOptions, Pipeline, PipelineSnapshot } from './pipeline';
import type {
  BooleanExpression,
  Field,
  Ordering as OrderingType,
  Accumulator,
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
export function execute<T = DocumentData>(pipeline: Pipeline<T>): Promise<PipelineSnapshot<T>>;

/**
 * @beta
 * Executes a pipeline with options.
 */
export function execute<T = DocumentData>(options: ExecuteOptions<T>): Promise<PipelineSnapshot<T>>;

export function execute<T = DocumentData>(
  _pipelineOrOptions: Pipeline<T> | ExecuteOptions<T>,
): Promise<PipelineSnapshot<T>> {
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
export function and(..._expressions: BooleanExpression[]): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Logical OR of boolean expressions.
 */
export function or(..._expressions: BooleanExpression[]): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Greater-than comparison.
 */
export function gt(_left: Field | Selectable, _right: unknown): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Equality comparison.
 */
export function eq(_left: Field | Selectable, _right: unknown): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * Ordering helper (e.g. Ordering.of(field('rating')).descending()).
 */
export const Ordering = {
  of(_fieldOrOrdering: Field | OrderingType): OrderingType {
    return {} as OrderingType;
  },
};

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
export function countAll(): Accumulator {
  return {} as Accumulator;
}

/**
 * @beta
 * Map expression for replaceWith etc.
 */
export function map(_entries: Record<string, unknown>): Selectable {
  return {} as Selectable;
}

/**
 * @beta
 * Array expression.
 */
export function array(..._items: unknown[]): Selectable {
  return {} as Selectable;
}
