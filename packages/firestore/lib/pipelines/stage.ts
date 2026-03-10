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
  FunctionExpression,
  Ordering,
  Accumulator,
  AggregateFunction,
  Expression,
  Selectable,
} from './stage_options';
import type { DocumentReference } from '../types/firestore';

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

export function execute(_pipelineOrOptions: Pipeline | ExecuteOptions): Promise<PipelineSnapshot> {
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

// --- Arithmetic / constant expression helpers (align with JS SDK) ---

/**
 * @beta
 * Creates a constant expression for a number value.
 */
export function constant(_value: number): Expression;
/**
 * @beta
 * Creates a constant expression for a string value.
 */
export function constant(_value: string): Expression;
/**
 * @beta
 * Creates a constant boolean expression.
 */
export function constant(_value: boolean): BooleanExpression;
/**
 * @beta
 * Creates a constant expression for null.
 */
export function constant(_value: null): Expression;
/**
 * @beta
 * Creates a constant expression for a value (e.g. GeoPoint, Timestamp, Date, Bytes, DocumentReference, VectorValue).
 */
export function constant(_value: unknown): Expression;
export function constant(
  _value: number | string | boolean | null | unknown,
): Expression | BooleanExpression {
  return {} as Expression | BooleanExpression;
}

/**
 * @beta
 * Creates an expression that adds two or more expressions together.
 *
 * @param first - The first expression to add.
 * @param second - The second expression or literal to add.
 * @returns A new Expression representing the addition operation.
 */
export function add(_first: Expression, _second: Expression | unknown): FunctionExpression;
/**
 * @beta
 * Creates an expression that adds a field's value to an expression.
 *
 * @param fieldName - The name of the field containing the value to add.
 * @param second - The second expression or literal to add.
 * @returns A new Expression representing the addition operation.
 */
export function add(_fieldName: string, _second: Expression | unknown): FunctionExpression;
export function add(
  _first: Expression | string,
  _second: Expression | unknown,
): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Creates an expression that subtracts the second from the first.
 */
export function subtract(_left: Expression, _right: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that subtracts a constant value from an expression.
 */
export function subtract(_expression: Expression, _value: unknown): FunctionExpression;
/**
 * @beta
 * Creates an expression that subtracts an expression from a field's value.
 */
export function subtract(_fieldName: string, _expression: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that subtracts a constant value from a field's value.
 */
export function subtract(_fieldName: string, _value: unknown): FunctionExpression;
export function subtract(
  _leftOrField: Expression | string,
  _rightOrValue: Expression | unknown,
): FunctionExpression {
  return {} as FunctionExpression;
}

// --- Additional arithmetic and aggregate helpers (align with JS SDK) ---

/**
 * @beta
 * Creates an expression that divides the first by the second.
 */
export function divide(_left: Expression, _right: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that divides an expression by a constant value.
 */
export function divide(_expression: Expression, _value: unknown): FunctionExpression;
/**
 * @beta
 * Creates an expression that divides a field's value by an expression.
 */
export function divide(_fieldName: string, _expression: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that divides a field's value by a constant.
 */
export function divide(_fieldName: string, _value: unknown): FunctionExpression;
export function divide(
  _leftOrField: Expression | string,
  _rightOrValue: Expression | unknown,
): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Creates an expression that multiplies two or more expressions.
 */
export function multiply(_first: Expression, _second: Expression | unknown): FunctionExpression;
/**
 * @beta
 * Creates an expression that multiplies a field's value by an expression or literal.
 */
export function multiply(_fieldName: string, _second: Expression | unknown): FunctionExpression;
export function multiply(
  _first: Expression | string,
  _second: Expression | unknown,
): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Creates an expression that evaluates to the document ID (and optionally path).
 *
 * @param documentPath - Document path string or DocumentReference.
 * @returns A new Expression representing the document ID.
 */
export function documentId(_documentPath: string | DocumentReference): FunctionExpression;
/**
 * @beta
 * Creates an expression that evaluates to the document ID from a path expression.
 */
export function documentId(_documentPathExpr: Expression): FunctionExpression;
export function documentId(
  _documentPath: string | DocumentReference | Expression,
): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Creates an aggregation that sums values from an expression across stage inputs.
 */
export function sum(_expression: Expression): AggregateFunction;
/**
 * @beta
 * Creates an aggregation that sums a field's values across stage inputs.
 */
export function sum(_fieldName: string): AggregateFunction;
export function sum(_exprOrField: Expression | string): AggregateFunction {
  return {} as AggregateFunction;
}

/**
 * @beta
 * Creates an aggregation that counts stage inputs with valid evaluations of the expression.
 */
export function count(_expression: Expression): AggregateFunction;
/**
 * @beta
 * Creates an aggregation that counts stage inputs where the field exists.
 */
export function count(_fieldName: string): AggregateFunction;
export function count(_exprOrField: Expression | string): AggregateFunction {
  return {} as AggregateFunction;
}

/**
 * @beta
 * Creates an aggregation that calculates the average (mean) of values from an expression.
 * SDK name: average (avg is RN alias).
 */
export function average(_expression: Expression): AggregateFunction;
/**
 * @beta
 * Creates an aggregation that calculates the average (mean) of a field's values.
 */
export function average(_fieldName: string): AggregateFunction;
export function average(_exprOrField: Expression | string): AggregateFunction {
  return {} as AggregateFunction;
}

// --- More expression and aggregate helpers (align with JS SDK) ---

/**
 * @beta
 * Absolute value of a numeric expression.
 */
export function abs(_expr: Expression): FunctionExpression;
/**
 * @beta
 * Absolute value of a field.
 */
export function abs(_fieldName: string): FunctionExpression;
export function abs(_exprOrField: Expression | string): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Rounds up to the nearest integer.
 */
export function ceil(_expression: Expression): FunctionExpression;
export function ceil(_fieldName: string): FunctionExpression;
export function ceil(_exprOrField: Expression | string): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Rounds down to the nearest integer.
 */
export function floor(_expr: Expression): FunctionExpression;
export function floor(_fieldName: string): FunctionExpression;
export function floor(_exprOrField: Expression | string): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Remainder (modulo) of left divided by right.
 */
export function mod(_left: Expression, _right: Expression): FunctionExpression;
export function mod(_expression: Expression, _value: unknown): FunctionExpression;
export function mod(_fieldName: string, _expression: Expression): FunctionExpression;
export function mod(_fieldName: string, _value: unknown): FunctionExpression;
export function mod(
  _leftOrField: Expression | string,
  _rightOrValue: Expression | unknown,
): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Rounds to the nearest integer (or to decimalPlaces when provided).
 */
export function round(_expression: Expression): FunctionExpression;
export function round(_fieldName: string): FunctionExpression;
/**
 * @beta
 * Rounds to the given number of decimal places.
 */
export function round(
  _expression: Expression,
  _decimalPlaces: number | Expression,
): FunctionExpression;
export function round(_fieldName: string, _decimalPlaces: number | Expression): FunctionExpression;
export function round(
  _exprOrField: Expression | string,
  _decimalPlaces?: number | Expression,
): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Conditional expression: if condition then thenExpr else elseExpr.
 */
export function conditional(
  _condition: BooleanExpression,
  _thenExpr: Expression,
  _elseExpr: Expression,
): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Count distinct values of an expression or field.
 */
export function countDistinct(_expr: Expression | string): AggregateFunction {
  return {} as AggregateFunction;
}

/**
 * @beta
 * First value of the expression in each group (aggregate).
 */
export function first(_expression: Expression): AggregateFunction;
export function first(_fieldName: string): AggregateFunction;
export function first(_exprOrField: Expression | string): AggregateFunction {
  return {} as AggregateFunction;
}

/**
 * @beta
 * Last value of the expression in each group (aggregate).
 */
export function last(_expression: Expression): AggregateFunction;
export function last(_fieldName: string): AggregateFunction;
export function last(_exprOrField: Expression | string): AggregateFunction {
  return {} as AggregateFunction;
}

// --- arrayAgg, concat, sqrt, currentTimestamp, not, ifAbsent, ifError, string helpers ---

/**
 * @beta
 * Collects all values of an expression across stage inputs into an array (aggregate).
 */
export function arrayAgg(_expression: Expression): AggregateFunction;
export function arrayAgg(_fieldName: string): AggregateFunction;
export function arrayAgg(_exprOrField: Expression | string): AggregateFunction {
  return {} as AggregateFunction;
}

/**
 * @beta
 * Concatenates two or more expressions (e.g. strings or arrays).
 */
export function concat(
  _first: Expression,
  _second: Expression | unknown,
  ..._others: Array<Expression | unknown>
): FunctionExpression;
export function concat(
  _fieldName: string,
  _second: Expression | unknown,
  ..._others: Array<Expression | unknown>
): FunctionExpression;
export function concat(
  _first: Expression | string,
  _second: Expression | unknown,
  ..._others: Array<Expression | unknown>
): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Square root of a numeric expression.
 */
export function sqrt(_expression: Expression): FunctionExpression;
export function sqrt(_fieldName: string): FunctionExpression;
export function sqrt(_exprOrField: Expression | string): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Server timestamp at execution time.
 */
export function currentTimestamp(): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Logical NOT of a boolean expression.
 */
export function not(_booleanExpr: BooleanExpression): BooleanExpression {
  return {} as BooleanExpression;
}

/**
 * @beta
 * If ifExpr is present use it, else use elseExpr/elseValue.
 */
export function ifAbsent(_ifExpr: Expression, _elseExpr: Expression): Expression;
export function ifAbsent(_ifExpr: Expression, _elseValue: unknown): Expression;
export function ifAbsent(_ifFieldName: string, _elseExpr: Expression): Expression;
export function ifAbsent(
  _ifFieldName: string | Expression,
  _elseValue: Expression | unknown,
): Expression;
export function ifAbsent(
  _ifExpr: string | Expression,
  _elseValue: Expression | unknown,
): Expression {
  return {} as Expression;
}

/**
 * @beta
 * If tryExpr errors, return catchExpr/catchValue (error handling expression).
 */
export function ifError(
  _tryExpr: BooleanExpression,
  _catchExpr: BooleanExpression,
): BooleanExpression;
export function ifError(_tryExpr: Expression, _catchExpr: Expression): FunctionExpression;
export function ifError(_tryExpr: Expression, _catchValue: unknown): FunctionExpression;
export function ifError(
  _tryExpr: BooleanExpression | Expression,
  _catch: BooleanExpression | Expression | unknown,
): BooleanExpression | FunctionExpression {
  return {} as BooleanExpression | FunctionExpression;
}

/**
 * @beta
 * Converts string to lower case.
 */
export function toLower(_fieldName: string): FunctionExpression;
export function toLower(_stringExpression: Expression): FunctionExpression;
export function toLower(_fieldOrExpr: string | Expression): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Converts string to upper case.
 */
export function toUpper(_fieldName: string): FunctionExpression;
export function toUpper(_stringExpression: Expression): FunctionExpression;
export function toUpper(_fieldOrExpr: string | Expression): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Trims whitespace (or optional valueToTrim) from string.
 */
export function trim(_fieldName: string, _valueToTrim?: string | Expression): FunctionExpression;
export function trim(
  _stringExpression: Expression,
  _valueToTrim?: string | Expression,
): FunctionExpression;
export function trim(
  _fieldOrExpr: string | Expression,
  _valueToTrim?: string | Expression,
): FunctionExpression {
  return {} as FunctionExpression;
}

/**
 * @beta
 * Substring from position with optional length.
 */
export function substring(_field: string, _position: number, _length?: number): FunctionExpression;
export function substring(
  _input: Expression,
  _position: number,
  _length?: number,
): FunctionExpression;
export function substring(
  _field: string,
  _position: Expression,
  _length?: Expression,
): FunctionExpression;
export function substring(
  _input: Expression,
  _position: Expression,
  _length?: Expression,
): FunctionExpression;
export function substring(
  _fieldOrInput: string | Expression,
  _position: number | Expression,
  _length?: number | Expression,
): FunctionExpression {
  return {} as FunctionExpression;
}
