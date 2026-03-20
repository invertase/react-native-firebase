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

import type { DocumentReference } from '../types/firestore';
import type VectorValue from '../FirestoreVectorValue';
import type { Bytes } from '../modular/Bytes';

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
 * Firestore value type for isType() checks.
 */
export type Type =
  | 'null'
  | 'array'
  | 'boolean'
  | 'bytes'
  | 'timestamp'
  | 'geo_point'
  | 'number'
  | 'int32'
  | 'int64'
  | 'float64'
  | 'decimal128'
  | 'map'
  | 'reference'
  | 'string'
  | 'vector'
  | 'max_key'
  | 'min_key'
  | 'object_id'
  | 'regex'
  | 'request_timestamp';

/**
 * @beta
 * Time granularity for timestampTruncate.
 */
export type TimeGranularity =
  | 'microsecond'
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'week(monday)'
  | 'week(tuesday)'
  | 'week(wednesday)'
  | 'week(thursday)'
  | 'week(friday)'
  | 'week(saturday)'
  | 'week(sunday)'
  | 'isoWeek'
  | 'month'
  | 'quarter'
  | 'year'
  | 'isoYear';

/**
 * @beta
 * Boolean expression for pipeline `where()` (e.g. field('x').gt(0), and(...), or(...)).
 */
interface FluentExpressionMethods {
  as(name: string): AliasedExpression;
  ascending(): Ordering;
  descending(): Ordering;
  add(value: Expression): FunctionExpression;
  add(value: unknown): FunctionExpression;
  average(): AggregateFunction;
  count(): AggregateFunction;
  countDistinct(): AggregateFunction;
  equal(expression: Expression): BooleanExpression;
  equal(value: unknown): BooleanExpression;
  first(): AggregateFunction;
  greaterThan(expression: Expression): BooleanExpression;
  greaterThan(value: unknown): BooleanExpression;
  greaterThanOrEqual(expression: Expression): BooleanExpression;
  greaterThanOrEqual(value: unknown): BooleanExpression;
  last(): AggregateFunction;
  maximum(): AggregateFunction;
  minimum(): AggregateFunction;
  sum(): AggregateFunction;
  arrayAgg(): AggregateFunction;
  arrayAggDistinct(): AggregateFunction;
}

export interface BooleanExpression extends Selectable, FluentExpressionMethods {
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
export interface Field extends Selectable, FluentExpressionMethods {
  readonly _brand?: 'Field';
}

/**
 * @beta
 * Function expression (e.g. map(...), array(...)). Used as return type and in Expression union.
 */
export interface FunctionExpression extends Selectable, FluentExpressionMethods {
  selectable: true;
  readonly _brand?: 'FunctionExpression';
}

/**
 * @beta
 * Constant/literal expression returned by `constant(...)`.
 */
export interface ConstantExpression extends FluentExpressionMethods {
  readonly _brand?: 'ConstantExpression';
}

/**
 * @beta
 * Expression type for pipeline parameters (field refs, literals, function results).
 */
export type Expression = Field | FunctionExpression | ConstantExpression | Selectable | string;

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
  as(name: string): AliasedAggregate;
  readonly _brand?: 'Accumulator';
}

/**
 * @beta
 * Aggregate function (e.g. countAll()). Alias for Accumulator.
 */
export type AggregateFunction = Accumulator;

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

type RuntimeNodeKind =
  | 'expression'
  | 'aggregate'
  | 'ordering'
  | 'aliasedExpression'
  | 'aliasedAggregate';
type RuntimeDirection = 'ascending' | 'descending';

const RUNTIME_NODE_SYMBOL = Symbol.for('RNFBFirestorePipelineExpressionNode');

interface RuntimeNodeBase {
  readonly [RUNTIME_NODE_SYMBOL]: true;
  readonly __kind: RuntimeNodeKind;
  exprType?: ExpressionType;
  selectable?: true;
}

interface RuntimeExpressionNode extends RuntimeNodeBase {
  readonly __kind: 'expression';
  path?: string;
  name?: string;
  args?: RuntimeNode[];
  value?: unknown;
}

interface RuntimeAggregateNode extends RuntimeNodeBase {
  readonly __kind: 'aggregate';
  kind: string;
  args?: RuntimeNode[];
}

interface RuntimeOrderingNode extends RuntimeNodeBase {
  readonly __kind: 'ordering';
  expr: RuntimeNode;
  direction: RuntimeDirection;
}

interface RuntimeAliasedExpressionNode extends RuntimeNodeBase {
  readonly __kind: 'aliasedExpression';
  exprType: 'AliasedExpression';
  selectable: true;
  expr: RuntimeNode;
  alias: string;
}

interface RuntimeAliasedAggregateNode extends RuntimeNodeBase {
  readonly __kind: 'aliasedAggregate';
  aggregate: RuntimeAggregateNode;
  alias: string;
}

type RuntimeExpressionMethods = FluentExpressionMethods;
type RuntimeOrderingMethods = Pick<Ordering, 'ascending' | 'descending'>;
type RuntimeAggregateMethods = Pick<Accumulator, 'as'>;

type ConstantExpressionNode = RuntimeExpressionNode & RuntimeExpressionMethods & ConstantExpression;
type BooleanExpressionNode = RuntimeExpressionNode & RuntimeExpressionMethods & BooleanExpression;
type RuntimeExpressionFluentNode =
  | (RuntimeExpressionNode & RuntimeExpressionMethods & Field)
  | (RuntimeExpressionNode & RuntimeExpressionMethods & FunctionExpression)
  | BooleanExpressionNode
  | ConstantExpressionNode;
type FieldNode = RuntimeExpressionFluentNode & Field;
type FunctionExpressionNode = RuntimeExpressionFluentNode & FunctionExpression;
type AggregateNode = RuntimeAggregateNode & RuntimeAggregateMethods & AggregateFunction;
type OrderingNode = RuntimeOrderingNode & RuntimeOrderingMethods & Ordering;
type AliasedExpressionNode = RuntimeAliasedExpressionNode & AliasedExpression;
type AliasedAggregateNode = RuntimeAliasedAggregateNode & AliasedAggregate;

type RuntimeNode =
  | RuntimeExpressionFluentNode
  | AggregateNode
  | OrderingNode
  | AliasedExpressionNode
  | AliasedAggregateNode;

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  if (!isRecord(value)) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isDocumentReferenceLike(value: unknown): value is { path: string; firestore: unknown } {
  return (
    isRecord(value) &&
    typeof value.path === 'string' &&
    value.path.length > 0 &&
    isRecord(value.firestore)
  );
}

function isRuntimeNode(value: unknown): value is RuntimeNode {
  return isRecord(value) && value[RUNTIME_NODE_SYMBOL] === true;
}

function isOrderingNode(value: unknown): value is OrderingNode {
  return isRuntimeNode(value) && value.__kind === 'ordering';
}

function containsRuntimeNode(value: unknown): boolean {
  if (isRuntimeNode(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some(containsRuntimeNode);
  }

  if (!isRecord(value)) {
    return false;
  }

  if (!isPlainObject(value)) {
    return false;
  }

  return Object.values(value).some(containsRuntimeNode);
}

function toCanonicalFunctionName(name: string): string {
  switch (name) {
    case 'gt':
      return 'greaterThan';
    case 'eq':
      return 'equal';
    case 'gte':
      return 'greaterThanOrEqual';
    case 'lt':
      return 'lessThan';
    case 'lte':
      return 'lessThanOrEqual';
    case 'avg':
      return 'average';
    case 'toLower':
      return 'lower';
    case 'toUpper':
      return 'upper';
    default:
      return name;
  }
}

const AGGREGATE_KINDS = new Set<string>([
  'countAll',
  'count',
  'countIf',
  'sum',
  'average',
  'minimum',
  'maximum',
  'countDistinct',
  'first',
  'last',
  'arrayAgg',
  'arrayAggDistinct',
]);

const EXPRESSION_METHOD_NAMES = [
  'and',
  'or',
  'gt',
  'greaterThan',
  'eq',
  'equal',
  'notEqual',
  'gte',
  'greaterThanOrEqual',
  'lt',
  'lessThan',
  'lte',
  'lessThanOrEqual',
  'exists',
  'arrayContains',
  'arrayContainsAny',
  'arrayContainsAll',
  'startsWith',
  'endsWith',
  'add',
  'subtract',
  'divide',
  'multiply',
  'documentId',
  'sum',
  'count',
  'average',
  'abs',
  'ceil',
  'floor',
  'mod',
  'round',
  'conditional',
  'countDistinct',
  'first',
  'last',
  'arrayAgg',
  'concat',
  'sqrt',
  'currentTimestamp',
  'not',
  'ifAbsent',
  'ifError',
  'toLower',
  'toUpper',
  'trim',
  'substring',
  'arrayAggDistinct',
  'arrayConcat',
  'arrayGet',
  'arrayLength',
  'arraySum',
  'byteLength',
  'charLength',
  'collectionId',
  'countIf',
  'exp',
  'join',
  'like',
  'ln',
  'log',
  'log10',
  'maximum',
  'minimum',
  'pow',
  'reverse',
  'split',
  'cosineDistance',
  'dotProduct',
  'equalAny',
  'euclideanDistance',
  'isAbsent',
  'isError',
  'isType',
  'logicalMaximum',
  'logicalMinimum',
  'ltrim',
  'notEqualAny',
  'rand',
  'rtrim',
  'stringConcat',
  'mapEntries',
  'mapGet',
  'mapKeys',
  'mapMerge',
  'mapRemove',
  'mapSet',
  'mapValues',
  'regexContains',
  'regexFind',
  'regexFindAll',
  'regexMatch',
  'stringContains',
  'stringIndexOf',
  'stringRepeat',
  'stringReplaceAll',
  'stringReplaceOne',
  'stringReverse',
  'timestampAdd',
  'timestampSubtract',
  'timestampToUnixMicros',
  'timestampToUnixMillis',
  'timestampToUnixSeconds',
  'timestampTruncate',
  'trunc',
  'type',
  'unixMicrosToTimestamp',
  'unixMillisToTimestamp',
  'unixSecondsToTimestamp',
  'vectorLength',
  'xor',
  'length',
] as const;

function createNode<TNode extends RuntimeNodeBase, TMethods extends object>(
  proto: TMethods,
  node: TNode,
): TNode & TMethods {
  const runtimeNode: TNode & TMethods = Object.create(proto);
  Object.assign(runtimeNode, node);
  return runtimeNode;
}

function createExpressionProto(): RuntimeExpressionMethods {
  const proto: Partial<RuntimeExpressionMethods> = {
    as(this: RuntimeExpressionFluentNode, name: string): AliasedExpressionNode {
      return createAliasedExpression(this, name);
    },

    ascending(this: RuntimeExpressionFluentNode): OrderingNode {
      return createOrdering(this, 'ascending');
    },

    descending(this: RuntimeExpressionFluentNode): OrderingNode {
      return createOrdering(this, 'descending');
    },
  };

  for (const methodName of EXPRESSION_METHOD_NAMES) {
    Object.defineProperty(proto, methodName, {
      value(this: RuntimeExpressionFluentNode, ...args: unknown[]) {
        return createMethodResult(methodName, this, args);
      },
    });
  }

  return proto as RuntimeExpressionMethods;
}

const expressionProto = createExpressionProto();

const aggregateProto: RuntimeAggregateMethods = {
  as(this: AggregateNode, name: string): AliasedAggregateNode {
    return createAliasedAggregate(this, name);
  },
};

const orderingProto: RuntimeOrderingMethods = {
  ascending(this: OrderingNode): OrderingNode {
    return createOrdering(this.expr, 'ascending');
  },

  descending(this: OrderingNode): OrderingNode {
    return createOrdering(this.expr, 'descending');
  },
};

function createField(path: unknown): FieldNode {
  return createNode(expressionProto, {
    [RUNTIME_NODE_SYMBOL]: true,
    __kind: 'expression',
    exprType: 'Field',
    selectable: true,
    path: String(path ?? ''),
  });
}

function createConstant(value: unknown): ConstantExpressionNode {
  return createNode(expressionProto, {
    [RUNTIME_NODE_SYMBOL]: true,
    __kind: 'expression',
    exprType: 'Constant',
    value,
  });
}

function normalizeMapLikeValue(value: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, entryValue] of Object.entries(value)) {
    output[key] = normalizeRawValue(entryValue);
  }

  return output;
}

function normalizeRawValue(value: unknown): unknown {
  if (isRuntimeNode(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    if (containsRuntimeNode(value)) {
      return createFunctionExpression(
        'array',
        value.map(entry => toExpressionArgument(entry)),
      );
    }

    return value.map(normalizeRawValue);
  }

  if (isDocumentReferenceLike(value)) {
    // Treat references as atomic values to avoid walking circular internal firestore graphs.
    return value;
  }

  if (isRecord(value)) {
    if (!isPlainObject(value)) {
      return value;
    }
    return normalizeMapLikeValue(value);
  }

  return value;
}

function toExpressionArgument(value: unknown, fieldString = false): RuntimeNode {
  if (isRuntimeNode(value)) {
    return value;
  }

  if (fieldString && typeof value === 'string') {
    return createField(value);
  }

  if (Array.isArray(value) && containsRuntimeNode(value)) {
    return createFunctionExpression(
      'array',
      value.map(entry => toExpressionArgument(entry)),
    );
  }

  return createConstant(normalizeRawValue(value));
}

function createFunctionExpression(name: string, args: RuntimeNode[]): FunctionExpressionNode {
  return createNode(expressionProto, {
    [RUNTIME_NODE_SYMBOL]: true,
    __kind: 'expression',
    exprType: 'Function',
    selectable: true,
    name,
    args,
  });
}

function createBooleanExpression(name: string, args: RuntimeNode[]): BooleanExpressionNode {
  return createNode(expressionProto, {
    [RUNTIME_NODE_SYMBOL]: true,
    __kind: 'expression',
    exprType: 'Function',
    selectable: true,
    name,
    args,
  });
}

function createAggregate(kind: string, args: RuntimeNode[] = []): AggregateNode {
  return createNode(aggregateProto, {
    [RUNTIME_NODE_SYMBOL]: true,
    __kind: 'aggregate',
    exprType: 'AggregateFunction',
    kind,
    args,
  });
}

function createAliasedExpression(
  expr: RuntimeExpressionFluentNode,
  alias: string,
): AliasedExpressionNode {
  return createNode(Object.prototype, {
    [RUNTIME_NODE_SYMBOL]: true,
    __kind: 'aliasedExpression',
    exprType: 'AliasedExpression',
    selectable: true,
    expr,
    alias,
  });
}

function createAliasedAggregate(aggregate: AggregateNode, alias: string): AliasedAggregateNode {
  return createNode(Object.prototype, {
    [RUNTIME_NODE_SYMBOL]: true,
    __kind: 'aliasedAggregate',
    aggregate,
    alias,
  });
}

function createOrdering(expr: RuntimeNode, direction: RuntimeDirection): OrderingNode {
  return createNode(orderingProto, {
    [RUNTIME_NODE_SYMBOL]: true,
    __kind: 'ordering',
    expr,
    direction,
  });
}

function normalizeGlobalArguments(name: string, args: unknown[]): RuntimeNode[] {
  const fieldIndexList: number[] = [];

  switch (name) {
    case 'add':
    case 'subtract':
    case 'divide':
    case 'multiply':
    case 'mod':
    case 'pow':
    case 'abs':
    case 'ceil':
    case 'floor':
    case 'round':
    case 'trunc':
    case 'toLower':
    case 'toUpper':
    case 'trim':
    case 'substring':
    case 'arrayGet':
    case 'arrayLength':
    case 'arraySum':
    case 'arrayConcat':
    case 'byteLength':
    case 'charLength':
    case 'collectionId':
    case 'exp':
    case 'ln':
    case 'log':
    case 'log10':
    case 'reverse':
    case 'split':
    case 'cosineDistance':
    case 'dotProduct':
    case 'euclideanDistance':
    case 'isAbsent':
    case 'isType':
    case 'logicalMaximum':
    case 'logicalMinimum':
    case 'ltrim':
    case 'rtrim':
    case 'stringConcat':
    case 'mapEntries':
    case 'mapGet':
    case 'mapKeys':
    case 'mapMerge':
    case 'mapRemove':
    case 'mapSet':
    case 'mapValues':
    case 'regexContains':
    case 'regexFind':
    case 'regexFindAll':
    case 'regexMatch':
    case 'stringContains':
    case 'stringIndexOf':
    case 'stringRepeat':
    case 'stringReplaceAll':
    case 'stringReplaceOne':
    case 'stringReverse':
    case 'timestampAdd':
    case 'timestampSubtract':
    case 'timestampToUnixMicros':
    case 'timestampToUnixMillis':
    case 'timestampToUnixSeconds':
    case 'timestampTruncate':
    case 'type':
    case 'unixMicrosToTimestamp':
    case 'unixMillisToTimestamp':
    case 'unixSecondsToTimestamp':
    case 'vectorLength':
    case 'length':
    case 'startsWith':
    case 'endsWith':
    case 'like':
    case 'equalAny':
    case 'notEqualAny':
      fieldIndexList.push(0);
      break;
    case 'gt':
    case 'greaterThan':
    case 'eq':
    case 'equal':
    case 'notEqual':
    case 'gte':
    case 'greaterThanOrEqual':
    case 'lt':
    case 'lessThan':
    case 'lte':
    case 'lessThanOrEqual':
    case 'exists':
    case 'arrayContains':
    case 'arrayContainsAny':
    case 'arrayContainsAll':
    case 'sum':
    case 'count':
    case 'average':
    case 'countDistinct':
    case 'first':
    case 'last':
    case 'arrayAgg':
    case 'arrayAggDistinct':
    case 'maximum':
    case 'minimum':
      fieldIndexList.push(0);
      break;
    default:
      break;
  }

  return args.map((arg, index) => toExpressionArgument(arg, fieldIndexList.includes(index)));
}

function createMethodResult(
  name: string,
  base: RuntimeExpressionFluentNode,
  rawArgs: unknown[],
): RuntimeNode {
  const canonicalName = toCanonicalFunctionName(name);

  if (AGGREGATE_KINDS.has(canonicalName)) {
    return createAggregate(canonicalName, [base, ...rawArgs.map(arg => toExpressionArgument(arg))]);
  }

  return createFunctionExpression(canonicalName, [
    base,
    ...rawArgs.map(arg => toExpressionArgument(arg)),
  ]);
}

function callBooleanHelper(name: string, argsLike: IArguments): BooleanExpression {
  return createBooleanExpression(
    toCanonicalFunctionName(name),
    normalizeGlobalArguments(name, Array.from(argsLike)),
  );
}

function callFunctionHelper(name: string, argsLike: IArguments): FunctionExpression {
  return createFunctionExpression(
    toCanonicalFunctionName(name),
    normalizeGlobalArguments(name, Array.from(argsLike)),
  );
}

function callAggregateHelper(name: string, argsLike: IArguments): AggregateFunction {
  return createAggregate(
    toCanonicalFunctionName(name),
    normalizeGlobalArguments(name, Array.from(argsLike)),
  );
}

function callExpressionHelper(name: string, argsLike: IArguments): FunctionExpression {
  return createFunctionExpression(
    toCanonicalFunctionName(name),
    normalizeGlobalArguments(name, Array.from(argsLike)),
  );
}

// --- Expression / helper stubs (for use in where, select, addFields, aggregate, sort, etc.) ---

/**
 * @beta
 * Returns a Field reference for use in pipeline expressions.
 */
export function field(_path: string): Field {
  return createField(_path);
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
  return callBooleanHelper('and', arguments);
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
  return callBooleanHelper('or', arguments);
}

/**
 * @beta
 * Greater-than comparison.
 */
export function gt(_left: Expression, _right: Expression): BooleanExpression {
  return callBooleanHelper('gt', arguments);
}

/**
 * @beta
 * Greater-than comparison (alias for gt).
 */
export function greaterThan(_left: Expression, _right: Expression): BooleanExpression {
  return callBooleanHelper('greaterThan', arguments);
}

/**
 * @beta
 * Equality comparison.
 */
export function eq(_left: Expression, _right: Expression): BooleanExpression {
  return callBooleanHelper('eq', arguments);
}

/**
 * @beta
 * Equality comparison (alias for eq).
 */
export function equal(_left: Expression, _right: Expression): BooleanExpression {
  return callBooleanHelper('equal', arguments);
}

/**
 * @beta
 * Inequality comparison.
 */
export function notEqual(_left: Expression, _right: Expression): BooleanExpression {
  return callBooleanHelper('notEqual', arguments);
}

/**
 * @beta
 * Greater-than-or-equal comparison.
 */
export function gte(_left: Expression, _right: Expression): BooleanExpression {
  return callBooleanHelper('gte', arguments);
}

/**
 * @beta
 * Less-than comparison.
 */
export function lt(_left: Expression, _right: Expression): BooleanExpression {
  return callBooleanHelper('lt', arguments);
}

/**
 * @beta
 * Less-than comparison (alias for lt).
 */
export function lessThan(_left: Expression, _right: Expression): BooleanExpression {
  return callBooleanHelper('lessThan', arguments);
}

/**
 * @beta
 * Less-than-or-equal comparison.
 */
export function lte(_left: Expression, _right: Expression): BooleanExpression {
  return callBooleanHelper('lte', arguments);
}

/**
 * @beta
 * Less-than-or-equal comparison (alias for lte).
 */
export function lessThanOrEqual(_left: Expression, _right: Expression): BooleanExpression {
  return callBooleanHelper('lessThanOrEqual', arguments);
}

/**
 * @beta
 * Greater-than-or-equal comparison (alias for gte).
 */
export function greaterThanOrEqual(_left: Expression, _right: Expression): BooleanExpression {
  return callBooleanHelper('greaterThanOrEqual', arguments);
}

/**
 * @beta
 * Checks if a field exists (or expression evaluates to a value).
 */
export function exists(_valueOrFieldName: Expression): BooleanExpression {
  return callBooleanHelper('exists', arguments);
}

/**
 * @beta
 * Checks if an array contains an element.
 */
export function arrayContains(
  _arrayOrFieldName: Expression,
  _element: Expression,
): BooleanExpression {
  return callBooleanHelper('arrayContains', arguments);
}

/**
 * @beta
 * Checks if an array contains any of the given values.
 */
export function arrayContainsAny(
  _arrayOrFieldName: Expression,
  _values: Array<Expression | unknown>,
): BooleanExpression {
  return callBooleanHelper('arrayContainsAny', arguments);
}

/**
 * @beta
 * Checks if an array contains all of the given values.
 */
export function arrayContainsAll(
  _arrayOrFieldName: Expression,
  _values: Array<Expression | unknown>,
): BooleanExpression {
  return callBooleanHelper('arrayContainsAll', arguments);
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
  return callBooleanHelper('startsWith', arguments);
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
  return callBooleanHelper('endsWith', arguments);
}

/**
 * @beta
 * Ordering helper (e.g. Ordering.of(field('rating')).descending()).
 */
export const OrderingHelper = {
  of(_fieldOrOrdering: Field | Ordering): Ordering {
    if (isOrderingNode(_fieldOrOrdering)) {
      return _fieldOrOrdering;
    }

    return createOrdering(toExpressionArgument(_fieldOrOrdering, true), 'ascending');
  },
};

/**
 * @beta
 * Ascending ordering (standalone). Use in sort().
 */
export function ascending(_expr: Expression): Ordering {
  return createOrdering(toExpressionArgument(_expr, true), 'ascending');
}

/**
 * @beta
 * Descending ordering (standalone). Use in sort().
 */
export function descending(_expr: Expression): Ordering {
  return createOrdering(toExpressionArgument(_expr, true), 'descending');
}

/**
 * @beta
 * Average aggregation (e.g. avg(field('rating')).as('avgRating')).
 */
export function avg(_f: Field | Selectable): Accumulator {
  return callAggregateHelper('avg', arguments);
}

/**
 * @beta
 * Count-all aggregation (e.g. countAll().as('total')).
 */
export function countAll(): AggregateFunction {
  return createAggregate('countAll');
}

/**
 * @beta
 * Map expression for replaceWith etc.
 */
export function map(_entries: Record<string, unknown>): FunctionExpression {
  return createFunctionExpression('map', [toExpressionArgument(_entries)]);
}

/**
 * @beta
 * Array expression.
 */
export function array(_elements: unknown[]): FunctionExpression {
  return createFunctionExpression(
    'array',
    _elements.map(entry => toExpressionArgument(entry)),
  );
}

// --- Arithmetic / constant expression helpers (align with JS SDK) ---

/**
 * @beta
 * Creates a constant expression for a number value.
 */
export function constant(_value: number): ConstantExpression;
/**
 * @beta
 * Creates a constant expression for a string value.
 */
export function constant(_value: string): ConstantExpression;
/**
 * @beta
 * Creates a constant boolean expression.
 */
export function constant(_value: boolean): ConstantExpression;
/**
 * @beta
 * Creates a constant expression for null.
 */
export function constant(_value: null): ConstantExpression;
/**
 * @beta
 * Creates a constant expression for a value (e.g. GeoPoint, Timestamp, Date, Bytes, DocumentReference, VectorValue).
 */
export function constant(_value: unknown): ConstantExpression;
export function constant(_value: number | string | boolean | null | unknown): ConstantExpression {
  return createConstant(normalizeRawValue(_value));
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
  return callFunctionHelper('add', arguments);
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
  return callFunctionHelper('subtract', arguments);
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
  return callFunctionHelper('divide', arguments);
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
  return callFunctionHelper('multiply', arguments);
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
  return callFunctionHelper('documentId', arguments);
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
  return callAggregateHelper('sum', arguments);
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
  return callAggregateHelper('count', arguments);
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
  return callAggregateHelper('average', arguments);
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
  return callFunctionHelper('abs', arguments);
}

/**
 * @beta
 * Rounds up to the nearest integer.
 */
export function ceil(_fieldName: string): FunctionExpression;
export function ceil(_expression: Expression): FunctionExpression;
export function ceil(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('ceil', arguments);
}

/**
 * @beta
 * Rounds down to the nearest integer.
 */
export function floor(_expr: Expression): FunctionExpression;
export function floor(_fieldName: string): FunctionExpression;
export function floor(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('floor', arguments);
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
  return callFunctionHelper('mod', arguments);
}

/**
 * @beta
 * Rounds to the nearest integer (or to decimalPlaces when provided).
 */
export function round(_fieldName: string): FunctionExpression;
export function round(_expression: Expression): FunctionExpression;
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
  return callFunctionHelper('round', arguments);
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
  return callFunctionHelper('conditional', arguments);
}

/**
 * @beta
 * Count distinct values of an expression or field.
 */
export function countDistinct(_expr: Expression | string): AggregateFunction {
  return callAggregateHelper('countDistinct', arguments);
}

/**
 * @beta
 * First value of the expression in each group (aggregate).
 */
export function first(_expression: Expression): AggregateFunction;
export function first(_fieldName: string): AggregateFunction;
export function first(_exprOrField: Expression | string): AggregateFunction {
  return callAggregateHelper('first', arguments);
}

/**
 * @beta
 * Last value of the expression in each group (aggregate).
 */
export function last(_expression: Expression): AggregateFunction;
export function last(_fieldName: string): AggregateFunction;
export function last(_exprOrField: Expression | string): AggregateFunction {
  return callAggregateHelper('last', arguments);
}

// --- arrayAgg, concat, sqrt, currentTimestamp, not, ifAbsent, ifError, string helpers ---

/**
 * @beta
 * Collects all values of an expression across stage inputs into an array (aggregate).
 */
export function arrayAgg(_expression: Expression): AggregateFunction;
export function arrayAgg(_fieldName: string): AggregateFunction;
export function arrayAgg(_exprOrField: Expression | string): AggregateFunction {
  return callAggregateHelper('arrayAgg', arguments);
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
  return callFunctionHelper('concat', arguments);
}

/**
 * @beta
 * Square root of a numeric expression.
 */
export function sqrt(_expression: Expression): FunctionExpression;
export function sqrt(_fieldName: string): FunctionExpression;
export function sqrt(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('sqrt', arguments);
}

/**
 * @beta
 * Server timestamp at execution time.
 */
export function currentTimestamp(): FunctionExpression {
  return callFunctionHelper('currentTimestamp', arguments);
}

/**
 * @beta
 * Logical NOT of a boolean expression.
 */
export function not(_booleanExpr: BooleanExpression): BooleanExpression {
  return callBooleanHelper('not', arguments);
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
  return callExpressionHelper('ifAbsent', arguments);
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
  return callFunctionHelper('ifError', arguments);
}

/**
 * @beta
 * Converts string to lower case.
 */
export function toLower(_fieldName: string): FunctionExpression;
export function toLower(_stringExpression: Expression): FunctionExpression;
export function toLower(_fieldOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('toLower', arguments);
}

/**
 * @beta
 * Converts string to upper case.
 */
export function toUpper(_fieldName: string): FunctionExpression;
export function toUpper(_stringExpression: Expression): FunctionExpression;
export function toUpper(_fieldOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('toUpper', arguments);
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
  return callFunctionHelper('trim', arguments);
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
  return callFunctionHelper('substring', arguments);
}

// --- Array expression helpers (align with JS SDK) ---

/**
 * @beta
 * Collects distinct values of an expression across stage inputs into an array (aggregate).
 */
export function arrayAggDistinct(_expression: Expression): AggregateFunction;
export function arrayAggDistinct(_fieldName: string): AggregateFunction;
export function arrayAggDistinct(_exprOrField: Expression | string): AggregateFunction {
  return callAggregateHelper('arrayAggDistinct', arguments);
}

/**
 * @beta
 * Concatenates two or more arrays.
 */
export function arrayConcat(
  _firstArray: Expression,
  _secondArray: Expression | unknown[],
  ..._otherArrays: Array<Expression | unknown[]>
): FunctionExpression;
export function arrayConcat(
  _firstArrayField: string,
  _secondArray: Expression | unknown[],
  ..._otherArrays: Array<Expression | unknown[]>
): FunctionExpression;
export function arrayConcat(
  _first: Expression | string,
  _second: Expression | unknown[],
  ..._others: Array<Expression | unknown[]>
): FunctionExpression {
  return callFunctionHelper('arrayConcat', arguments);
}

/**
 * @beta
 * Gets element at offset in an array field or expression.
 */
export function arrayGet(_arrayField: string, _offset: number): FunctionExpression;
export function arrayGet(_arrayField: string, _offsetExpr: Expression): FunctionExpression;
export function arrayGet(_arrayExpression: Expression, _offset: number): FunctionExpression;
export function arrayGet(_arrayExpression: Expression, _offsetExpr: Expression): FunctionExpression;
export function arrayGet(
  _arrayOrField: string | Expression,
  _offset: number | Expression,
): FunctionExpression {
  return callFunctionHelper('arrayGet', arguments);
}

/**
 * @beta
 * Length of an array (field or expression).
 */
export function arrayLength(_fieldName: string): FunctionExpression;
export function arrayLength(_array: Expression): FunctionExpression;
export function arrayLength(_fieldOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('arrayLength', arguments);
}

/**
 * @beta
 * Sum of numeric values in an array (aggregate-like for arrays).
 */
export function arraySum(_fieldName: string): FunctionExpression;
export function arraySum(_expression: Expression): FunctionExpression;
export function arraySum(_fieldOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('arraySum', arguments);
}

// --- Batch: byteLength, charLength, collectionId, countIf, exp, join, like, ln, log, log10, maximum, minimum, pow, reverse, split ---

export function byteLength(_expr: Expression): FunctionExpression;
export function byteLength(_fieldName: string): FunctionExpression;
export function byteLength(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('byteLength', arguments);
}

export function charLength(_fieldName: string): FunctionExpression;
export function charLength(_stringExpression: Expression): FunctionExpression;
export function charLength(_fieldOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('charLength', arguments);
}

export function collectionId(_fieldName: string): FunctionExpression;
export function collectionId(_expression: Expression): FunctionExpression;
export function collectionId(_fieldOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('collectionId', arguments);
}

export function countIf(_booleanExpr: BooleanExpression): AggregateFunction {
  return callAggregateHelper('countIf', arguments);
}

export function exp(_expression: Expression): FunctionExpression;
export function exp(_fieldName: string): FunctionExpression;
export function exp(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('exp', arguments);
}

export function join(_arrayFieldName: string, _delimiter: string): Expression;
export function join(_arrayExpression: Expression, _delimiterExpression: Expression): Expression;
export function join(_arrayExpression: Expression, _delimiter: string): Expression;
export function join(_arrayFieldName: string, _delimiterExpression: Expression): Expression;
export function join(
  _arrayOrField: string | Expression,
  _delimiter: string | Expression,
): Expression {
  return callExpressionHelper('join', arguments);
}

export function like(_fieldName: string, _pattern: string): BooleanExpression;
export function like(_fieldName: string, _pattern: Expression): BooleanExpression;
export function like(_stringExpression: Expression, _pattern: string): BooleanExpression;
export function like(_stringExpression: Expression, _pattern: Expression): BooleanExpression;
export function like(
  _fieldOrExpr: string | Expression,
  _pattern: string | Expression,
): BooleanExpression {
  return callBooleanHelper('like', arguments);
}

export function ln(_fieldName: string): FunctionExpression;
export function ln(_expression: Expression): FunctionExpression;
export function ln(_fieldOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('ln', arguments);
}

export function log(_expression: Expression, _base: number): FunctionExpression;
export function log(_expression: Expression, _base: Expression): FunctionExpression;
export function log(_fieldName: string, _base: number): FunctionExpression;
export function log(_fieldName: string, _base: Expression): FunctionExpression;
export function log(
  _exprOrField: Expression | string,
  _base: number | Expression,
): FunctionExpression {
  return callFunctionHelper('log', arguments);
}

export function log10(_fieldName: string): FunctionExpression;
export function log10(_expression: Expression): FunctionExpression;
export function log10(_fieldOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('log10', arguments);
}

export function maximum(_expression: Expression): AggregateFunction;
export function maximum(_fieldName: string): AggregateFunction;
export function maximum(_exprOrField: Expression | string): AggregateFunction {
  return callAggregateHelper('maximum', arguments);
}

export function minimum(_expression: Expression): AggregateFunction;
export function minimum(_fieldName: string): AggregateFunction;
export function minimum(_exprOrField: Expression | string): AggregateFunction {
  return callAggregateHelper('minimum', arguments);
}

export function pow(_base: Expression, _exponent: Expression): FunctionExpression;
export function pow(_base: Expression, _exponent: number): FunctionExpression;
export function pow(_base: string, _exponent: Expression): FunctionExpression;
export function pow(_base: string, _exponent: number): FunctionExpression;
export function pow(
  _base: Expression | string,
  _exponent: Expression | number,
): FunctionExpression {
  return callFunctionHelper('pow', arguments);
}

export function reverse(_stringExpression: Expression): FunctionExpression;
export function reverse(_field: string): FunctionExpression;
export function reverse(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('reverse', arguments);
}

export function split(_fieldName: string, _delimiter: string): FunctionExpression;
export function split(_fieldName: string, _delimiter: Expression): FunctionExpression;
export function split(_expression: Expression, _delimiter: string): FunctionExpression;
export function split(_expression: Expression, _delimiter: Expression): FunctionExpression;
export function split(
  _fieldOrExpr: string | Expression,
  _delimiter: string | Expression,
): FunctionExpression {
  return callFunctionHelper('split', arguments);
}

// --- Batch 2: cosineDistance, dotProduct, equalAny, euclideanDistance, isAbsent, isError, isType, logicalMaximum, logicalMinimum, ltrim, notEqualAny, rand, rtrim, stringConcat ---

export function cosineDistance(
  _fieldName: string,
  _vector: number[] | VectorValue,
): FunctionExpression;
export function cosineDistance(
  _fieldName: string,
  _vectorExpression: Expression,
): FunctionExpression;
export function cosineDistance(
  _vectorExpression: Expression,
  _vector: number[] | VectorValue,
): FunctionExpression;
export function cosineDistance(
  _vectorExpression: Expression,
  _otherVectorExpression: Expression,
): FunctionExpression;
export function cosineDistance(
  _fieldOrExpr: string | Expression,
  _vectorOrExpr: number[] | VectorValue | Expression,
): FunctionExpression {
  return callFunctionHelper('cosineDistance', arguments);
}

export function dotProduct(_fieldName: string, _vector: number[] | VectorValue): FunctionExpression;
export function dotProduct(_fieldName: string, _vectorExpression: Expression): FunctionExpression;
export function dotProduct(
  _vectorExpression: Expression,
  _vector: number[] | VectorValue,
): FunctionExpression;
export function dotProduct(
  _vectorExpression: Expression,
  _otherVectorExpression: Expression,
): FunctionExpression;
export function dotProduct(
  _fieldOrExpr: string | Expression,
  _vectorOrExpr: number[] | VectorValue | Expression,
): FunctionExpression {
  return callFunctionHelper('dotProduct', arguments);
}

export function equalAny(
  _expression: Expression,
  _values: Array<Expression | unknown>,
): BooleanExpression;
export function equalAny(_expression: Expression, _arrayExpression: Expression): BooleanExpression;
export function equalAny(
  _fieldName: string,
  _values: Array<Expression | unknown>,
): BooleanExpression;
export function equalAny(_fieldName: string, _arrayExpression: Expression): BooleanExpression;
export function equalAny(
  _exprOrField: string | Expression,
  _valuesOrArray: Array<Expression | unknown> | Expression,
): BooleanExpression {
  return callBooleanHelper('equalAny', arguments);
}

export function euclideanDistance(
  _fieldName: string,
  _vector: number[] | VectorValue,
): FunctionExpression;
export function euclideanDistance(
  _fieldName: string,
  _vectorExpression: Expression,
): FunctionExpression;
export function euclideanDistance(
  _vectorExpression: Expression,
  _vector: number[] | VectorValue,
): FunctionExpression;
export function euclideanDistance(
  _vectorExpression: Expression,
  _otherVectorExpression: Expression,
): FunctionExpression;
export function euclideanDistance(
  _fieldOrExpr: string | Expression,
  _vectorOrExpr: number[] | VectorValue | Expression,
): FunctionExpression {
  return callFunctionHelper('euclideanDistance', arguments);
}

export function isAbsent(_value: Expression): BooleanExpression;
export function isAbsent(_field: string): BooleanExpression;
export function isAbsent(_valueOrField: Expression | string): BooleanExpression {
  return callBooleanHelper('isAbsent', arguments);
}

export function isError(_value: Expression): BooleanExpression {
  return callBooleanHelper('isError', arguments);
}

export function isType(_fieldName: string, _type: Type): BooleanExpression;
export function isType(_expression: Expression, _type: Type): BooleanExpression;
export function isType(_fieldOrExpr: string | Expression, _type: Type): BooleanExpression {
  return callBooleanHelper('isType', arguments);
}

export function logicalMaximum(
  _first: Expression,
  _second: Expression | unknown,
  ..._others: Array<Expression | unknown>
): FunctionExpression;
export function logicalMaximum(
  _fieldName: string,
  _second: Expression | unknown,
  ..._others: Array<Expression | unknown>
): FunctionExpression;
export function logicalMaximum(
  _first: Expression | string,
  _second: Expression | unknown,
  ..._others: Array<Expression | unknown>
): FunctionExpression {
  return callFunctionHelper('logicalMaximum', arguments);
}

export function logicalMinimum(
  _first: Expression,
  _second: Expression | unknown,
  ..._others: Array<Expression | unknown>
): FunctionExpression;
export function logicalMinimum(
  _fieldName: string,
  _second: Expression | unknown,
  ..._others: Array<Expression | unknown>
): FunctionExpression;
export function logicalMinimum(
  _first: Expression | string,
  _second: Expression | unknown,
  ..._others: Array<Expression | unknown>
): FunctionExpression {
  return callFunctionHelper('logicalMinimum', arguments);
}

export function ltrim(
  _fieldName: string,
  _valueToTrim?: string | Expression | Bytes,
): FunctionExpression;
export function ltrim(
  _expression: Expression,
  _valueToTrim?: string | Expression | Bytes,
): FunctionExpression;
export function ltrim(
  _fieldOrExpr: string | Expression,
  _valueToTrim?: string | Expression | Bytes,
): FunctionExpression {
  return callFunctionHelper('ltrim', arguments);
}

export function notEqualAny(
  _element: Expression,
  _values: Array<Expression | unknown>,
): BooleanExpression;
export function notEqualAny(
  _fieldName: string,
  _values: Array<Expression | unknown>,
): BooleanExpression;
export function notEqualAny(_element: Expression, _arrayExpression: Expression): BooleanExpression;
export function notEqualAny(_fieldName: string, _arrayExpression: Expression): BooleanExpression;
export function notEqualAny(
  _elemOrField: string | Expression,
  _valuesOrArray: Array<Expression | unknown> | Expression,
): BooleanExpression {
  return callBooleanHelper('notEqualAny', arguments);
}

export function rand(): FunctionExpression {
  return callFunctionHelper('rand', arguments);
}

export function rtrim(
  _fieldName: string,
  _valueToTrim?: string | Expression | Bytes,
): FunctionExpression;
export function rtrim(
  _expression: Expression,
  _valueToTrim?: string | Expression | Bytes,
): FunctionExpression;
export function rtrim(
  _fieldOrExpr: string | Expression,
  _valueToTrim?: string | Expression | Bytes,
): FunctionExpression {
  return callFunctionHelper('rtrim', arguments);
}

export function stringConcat(
  _fieldName: string,
  _secondString: Expression | string,
  ..._otherStrings: Array<Expression | string>
): FunctionExpression;
export function stringConcat(
  _firstString: Expression,
  _secondString: Expression | string,
  ..._otherStrings: Array<Expression | string>
): FunctionExpression;
export function stringConcat(
  _first: string | Expression,
  _second: Expression | string,
  ..._others: Array<Expression | string>
): FunctionExpression {
  return callFunctionHelper('stringConcat', arguments);
}

// --- Batch 3: map*, regex*, stringContains, stringIndexOf, stringRepeat, stringReplaceAll ---

export function mapEntries(_mapField: string): FunctionExpression;
export function mapEntries(_mapExpression: Expression): FunctionExpression;
export function mapEntries(_mapOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('mapEntries', arguments);
}

export function mapGet(_fieldName: string, _subField: string): FunctionExpression;
export function mapGet(_mapExpression: Expression, _subField: string): FunctionExpression;
export function mapGet(_mapOrExpr: string | Expression, _subField: string): FunctionExpression {
  return callFunctionHelper('mapGet', arguments);
}

export function mapKeys(_mapField: string): FunctionExpression;
export function mapKeys(_mapExpression: Expression): FunctionExpression;
export function mapKeys(_mapOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('mapKeys', arguments);
}

export function mapMerge(
  _mapField: string,
  _secondMap: Record<string, unknown> | Expression,
  ..._otherMaps: Array<Record<string, unknown> | Expression>
): FunctionExpression;
export function mapMerge(
  _firstMap: Record<string, unknown> | Expression,
  _secondMap: Record<string, unknown> | Expression,
  ..._otherMaps: Array<Record<string, unknown> | Expression>
): FunctionExpression;
export function mapMerge(
  _first: string | Record<string, unknown> | Expression,
  _second: Record<string, unknown> | Expression,
  ..._others: Array<Record<string, unknown> | Expression>
): FunctionExpression {
  return callFunctionHelper('mapMerge', arguments);
}

export function mapRemove(_mapField: string, _key: string): FunctionExpression;
export function mapRemove(_mapExpr: Expression, _key: string): FunctionExpression;
export function mapRemove(_mapField: string, _keyExpr: Expression): FunctionExpression;
export function mapRemove(_mapExpr: Expression, _keyExpr: Expression): FunctionExpression;
export function mapRemove(
  _mapOrExpr: string | Expression,
  _keyOrExpr: string | Expression,
): FunctionExpression {
  return callFunctionHelper('mapRemove', arguments);
}

export function mapSet(
  _mapField: string,
  _key: string | Expression,
  _value: unknown,
  ..._moreKeyValues: unknown[]
): FunctionExpression;
export function mapSet(
  _mapExpression: Expression,
  _key: string | Expression,
  _value: unknown,
  ..._moreKeyValues: unknown[]
): FunctionExpression;
export function mapSet(
  _mapOrExpr: string | Expression,
  _key: string | Expression,
  _value: unknown,
  ..._more: unknown[]
): FunctionExpression {
  return callFunctionHelper('mapSet', arguments);
}

export function mapValues(_mapField: string): FunctionExpression;
export function mapValues(_mapExpression: Expression): FunctionExpression;
export function mapValues(_mapOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('mapValues', arguments);
}

export function regexContains(_fieldName: string, _pattern: string): BooleanExpression;
export function regexContains(_fieldName: string, _pattern: Expression): BooleanExpression;
export function regexContains(_stringExpression: Expression, _pattern: string): BooleanExpression;
export function regexContains(
  _stringExpression: Expression,
  _pattern: Expression,
): BooleanExpression;
export function regexContains(
  _fieldOrExpr: string | Expression,
  _pattern: string | Expression,
): BooleanExpression {
  return callBooleanHelper('regexContains', arguments);
}

export function regexFind(_fieldName: string, _pattern: string): FunctionExpression;
export function regexFind(_fieldName: string, _pattern: Expression): FunctionExpression;
export function regexFind(_stringExpression: Expression, _pattern: string): FunctionExpression;
export function regexFind(_stringExpression: Expression, _pattern: Expression): FunctionExpression;
export function regexFind(
  _fieldOrExpr: string | Expression,
  _pattern: string | Expression,
): FunctionExpression {
  return callFunctionHelper('regexFind', arguments);
}

export function regexFindAll(_fieldName: string, _pattern: string): FunctionExpression;
export function regexFindAll(_fieldName: string, _pattern: Expression): FunctionExpression;
export function regexFindAll(_stringExpression: Expression, _pattern: string): FunctionExpression;
export function regexFindAll(
  _stringExpression: Expression,
  _pattern: Expression,
): FunctionExpression;
export function regexFindAll(
  _fieldOrExpr: string | Expression,
  _pattern: string | Expression,
): FunctionExpression {
  return callFunctionHelper('regexFindAll', arguments);
}

export function regexMatch(_fieldName: string, _pattern: string): BooleanExpression;
export function regexMatch(_fieldName: string, _pattern: Expression): BooleanExpression;
export function regexMatch(_stringExpression: Expression, _pattern: string): BooleanExpression;
export function regexMatch(_stringExpression: Expression, _pattern: Expression): BooleanExpression;
export function regexMatch(
  _fieldOrExpr: string | Expression,
  _pattern: string | Expression,
): BooleanExpression {
  return callBooleanHelper('regexMatch', arguments);
}

export function stringContains(_fieldName: string, _substring: string): BooleanExpression;
export function stringContains(_fieldName: string, _substring: Expression): BooleanExpression;
export function stringContains(
  _stringExpression: Expression,
  _substring: string,
): BooleanExpression;
export function stringContains(
  _stringExpression: Expression,
  _substring: Expression,
): BooleanExpression;
export function stringContains(
  _fieldOrExpr: string | Expression,
  _substring: string | Expression,
): BooleanExpression {
  return callBooleanHelper('stringContains', arguments);
}

export function stringIndexOf(
  _fieldName: string,
  _search: string | Expression | Bytes,
): FunctionExpression;
export function stringIndexOf(
  _expression: Expression,
  _search: string | Expression | Bytes,
): FunctionExpression;
export function stringIndexOf(
  _fieldOrExpr: string | Expression,
  _search: string | Expression | Bytes,
): FunctionExpression {
  return callFunctionHelper('stringIndexOf', arguments);
}

export function stringRepeat(
  _fieldName: string,
  _repetitions: number | Expression,
): FunctionExpression;
export function stringRepeat(
  _expression: Expression,
  _repetitions: number | Expression,
): FunctionExpression;
export function stringRepeat(
  _fieldOrExpr: string | Expression,
  _repetitions: number | Expression,
): FunctionExpression {
  return callFunctionHelper('stringRepeat', arguments);
}

export function stringReplaceAll(
  _fieldName: string,
  _find: string | Expression | Bytes,
  _replacement: string | Expression | Bytes,
): FunctionExpression;
export function stringReplaceAll(
  _expression: Expression,
  _find: string | Expression | Bytes,
  _replacement: string | Expression | Bytes,
): FunctionExpression;
export function stringReplaceAll(
  _fieldOrExpr: string | Expression,
  _find: string | Expression | Bytes,
  _replacement: string | Expression | Bytes,
): FunctionExpression {
  return callFunctionHelper('stringReplaceAll', arguments);
}

// --- Batch 4: stringReplaceOne, stringReverse, timestamp*, trunc, type, unix*ToTimestamp, vectorLength, xor ---

type TimestampUnit = 'microsecond' | 'millisecond' | 'second' | 'minute' | 'hour' | 'day';

export function stringReplaceOne(
  _fieldName: string,
  _find: string | Expression | Bytes,
  _replacement: string | Expression | Bytes,
): FunctionExpression;
export function stringReplaceOne(
  _expression: Expression,
  _find: string | Expression | Bytes,
  _replacement: string | Expression | Bytes,
): FunctionExpression;
export function stringReplaceOne(
  _fieldOrExpr: string | Expression,
  _find: string | Expression | Bytes,
  _replacement: string | Expression | Bytes,
): FunctionExpression {
  return callFunctionHelper('stringReplaceOne', arguments);
}

export function stringReverse(_stringExpression: Expression): FunctionExpression;
export function stringReverse(_field: string): FunctionExpression;
export function stringReverse(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('stringReverse', arguments);
}

export function timestampAdd(
  _timestamp: Expression,
  _unit: Expression,
  _amount: Expression,
): FunctionExpression;
export function timestampAdd(
  _timestamp: Expression,
  _unit: TimestampUnit,
  _amount: number,
): FunctionExpression;
export function timestampAdd(
  _fieldName: string,
  _unit: TimestampUnit,
  _amount: number,
): FunctionExpression;
export function timestampAdd(
  _tsOrField: Expression | string,
  _unit: Expression | TimestampUnit,
  _amount: Expression | number,
): FunctionExpression {
  return callFunctionHelper('timestampAdd', arguments);
}

export function timestampSubtract(
  _timestamp: Expression,
  _unit: Expression,
  _amount: Expression,
): FunctionExpression;
export function timestampSubtract(
  _timestamp: Expression,
  _unit: TimestampUnit,
  _amount: number,
): FunctionExpression;
export function timestampSubtract(
  _fieldName: string,
  _unit: TimestampUnit,
  _amount: number,
): FunctionExpression;
export function timestampSubtract(
  _tsOrField: Expression | string,
  _unit: Expression | TimestampUnit,
  _amount: Expression | number,
): FunctionExpression {
  return callFunctionHelper('timestampSubtract', arguments);
}

export function timestampToUnixMicros(_expr: Expression): FunctionExpression;
export function timestampToUnixMicros(_fieldName: string): FunctionExpression;
export function timestampToUnixMicros(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('timestampToUnixMicros', arguments);
}

export function timestampToUnixMillis(_expr: Expression): FunctionExpression;
export function timestampToUnixMillis(_fieldName: string): FunctionExpression;
export function timestampToUnixMillis(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('timestampToUnixMillis', arguments);
}

export function timestampToUnixSeconds(_expr: Expression): FunctionExpression;
export function timestampToUnixSeconds(_fieldName: string): FunctionExpression;
export function timestampToUnixSeconds(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('timestampToUnixSeconds', arguments);
}

export function timestampTruncate(
  _fieldName: string,
  _granularity: TimeGranularity,
  _timezone?: string | Expression,
): FunctionExpression;
export function timestampTruncate(
  _fieldName: string,
  _granularity: Expression,
  _timezone?: string | Expression,
): FunctionExpression;
export function timestampTruncate(
  _timestampExpression: Expression,
  _granularity: TimeGranularity,
  _timezone?: string | Expression,
): FunctionExpression;
export function timestampTruncate(
  _timestampExpression: Expression,
  _granularity: Expression,
  _timezone?: string | Expression,
): FunctionExpression;
export function timestampTruncate(
  _fieldOrExpr: string | Expression,
  _granularity: TimeGranularity | Expression,
  _timezone?: string | Expression,
): FunctionExpression {
  return callFunctionHelper('timestampTruncate', arguments);
}

export function trunc(_fieldName: string): FunctionExpression;
export function trunc(_expression: Expression): FunctionExpression;
export function trunc(_fieldName: string, _decimalPlaces: number | Expression): FunctionExpression;
export function trunc(
  _expression: Expression,
  _decimalPlaces: number | Expression,
): FunctionExpression;
export function trunc(
  _fieldOrExpr: string | Expression,
  _decimalPlaces?: number | Expression,
): FunctionExpression {
  return callFunctionHelper('trunc', arguments);
}

export function type(_fieldName: string): FunctionExpression;
export function type(_expression: Expression): FunctionExpression;
export function type(_fieldOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('type', arguments);
}

export function unixMicrosToTimestamp(_expr: Expression): FunctionExpression;
export function unixMicrosToTimestamp(_fieldName: string): FunctionExpression;
export function unixMicrosToTimestamp(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('unixMicrosToTimestamp', arguments);
}

export function unixMillisToTimestamp(_expr: Expression): FunctionExpression;
export function unixMillisToTimestamp(_fieldName: string): FunctionExpression;
export function unixMillisToTimestamp(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('unixMillisToTimestamp', arguments);
}

export function unixSecondsToTimestamp(_expr: Expression): FunctionExpression;
export function unixSecondsToTimestamp(_fieldName: string): FunctionExpression;
export function unixSecondsToTimestamp(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('unixSecondsToTimestamp', arguments);
}

export function vectorLength(_vectorExpression: Expression): FunctionExpression;
export function vectorLength(_fieldName: string): FunctionExpression;
export function vectorLength(_exprOrField: Expression | string): FunctionExpression {
  return callFunctionHelper('vectorLength', arguments);
}

export function xor(
  _first: BooleanExpression,
  _second: BooleanExpression,
  ..._additionalConditions: BooleanExpression[]
): BooleanExpression {
  return callBooleanHelper('xor', arguments);
}

/**
 * @beta
 * Length of string, array, map, vector, or bytes (field or expression).
 */
export function length(_fieldName: string): FunctionExpression;
export function length(_expression: Expression): FunctionExpression;
export function length(_fieldOrExpr: string | Expression): FunctionExpression {
  return callFunctionHelper('length', arguments);
}
