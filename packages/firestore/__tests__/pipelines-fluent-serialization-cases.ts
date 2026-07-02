import * as pipelines from '../lib/pipelines';
import * as pipelineExpressions from '../lib/pipelines/expressions';

/** Keep in sync with EXPRESSION_METHOD_NAMES in lib/pipelines/expressions.ts */
export const EXPRESSION_METHOD_NAMES = [
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
  'arrayFilter',
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
  'coalesce',
  'ifNull',
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
  'arrayTransform',
  'arrayTransformWithIndex',
  'arraySlice',
  'arrayFirst',
  'arrayFirstN',
  'arrayLast',
  'arrayLastN',
  'arrayMaximum',
  'arrayMaximumN',
  'arrayMinimum',
  'arrayMinimumN',
  'arrayIndexOf',
  'arrayLastIndexOf',
  'arrayIndexOfAll',
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
  'timestampExtract',
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
  'nor',
  'length',
] as const;

export type FluentParityCategory =
  | 'unary-field'
  | 'unary-boolean'
  | 'binary-compare'
  | 'binary-math'
  | 'binary-field'
  | 'variadic-field'
  | 'array-field'
  | 'map-field'
  | 'string-field'
  | 'regex-field'
  | 'vector-field'
  | 'timestamp-field'
  | 'coalesce-field'
  | 'nullary-global'
  | 'boolean-binary'
  | 'conditional'
  | 'aggregate-boolean';

export type FluentParityCase = {
  category: FluentParityCategory;
  method: string;
  expectedName: string;
  global: () => unknown;
  fluent: () => unknown;
};

type CaseInput = FluentParityCase;

function createCase(input: CaseInput): FluentParityCase {
  return input;
}

const scores = pipelines.field('scores');
const tags = pipelines.field('tags');
const name = pipelines.field('name');
const metadata = pipelines.field('metadata');
const price = pipelines.field('price');
const bio = pipelines.field('bio');
const vec = pipelines.field('embedding');
const code = pipelines.field('code');
const label = pipelines.field('label');
const eventTime = pipelines.field('eventTime');
const micros = pipelines.field('micros');
const millis = pipelines.field('millis');
const seconds = pipelines.field('seconds');
const displayName = pipelines.field('displayName');
const optionalName = pipelines.field('optionalName');
const value = pipelines.field('value');
const active = pipelines.field('active');
const rawText = pipelines.field('rawText');

const fluent = (expr: pipelines.Expression | pipelines.BooleanExpression | pipelines.Field) =>
  expr as any;
const gt0 = pipelines.greaterThan(pipelines.variable('score'), pipelines.constant(0));
const boolA = fluent(pipelines.field('rating')).greaterThan(4);
const boolB = fluent(pipelines.field('price')).lessThan(10);

function canonicalName(method: string): string {
  switch (method) {
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
    case 'toLower':
      return 'lower';
    case 'toUpper':
      return 'upper';
    default:
      return method;
  }
}

function unaryField(method: string, target = scores): FluentParityCase {
  const globalFn = (pipelines as any)[method];
  return createCase({
    category: 'unary-field',
    method,
    expectedName: canonicalName(method),
    global: () => globalFn(target),
    fluent: () => fluent(target)[method](),
  });
}

function resolveGlobalHelper(method: string): (...args: unknown[]) => unknown {
  const fromPipelines = (pipelines as Record<string, unknown>)[method];
  if (typeof fromPipelines === 'function') {
    return fromPipelines as (...args: unknown[]) => unknown;
  }

  const fromExpressions = (pipelineExpressions as Record<string, unknown>)[method];
  if (typeof fromExpressions === 'function') {
    return fromExpressions as (...args: unknown[]) => unknown;
  }

  throw new Error(`Missing global helper for ${method}`);
}

function binaryCompare(
  category: 'binary-compare' | 'binary-math',
  method: string,
  arg: unknown,
  target = scores,
): FluentParityCase {
  return createCase({
    category,
    method,
    expectedName: canonicalName(method),
    global: () => resolveGlobalHelper(method)(target, arg),
    fluent: () => fluent(target)[method](arg),
  });
}

function nullaryGlobal(
  method: 'currentTimestamp' | 'rand',
  fluentTarget: pipelines.Field,
): FluentParityCase {
  return createCase({
    category: 'nullary-global',
    method,
    expectedName: method,
    global: () => (pipelines as any)[method](),
    fluent: () => fluent(fluentTarget)[method](),
  });
}

export function buildFluentParityCases(): FluentParityCase[] {
  const cases: FluentParityCase[] = [];

  const unaryMethods = [
    'abs',
    'ceil',
    'floor',
    'sqrt',
    'exp',
    'ln',
    'log',
    'log10',
    'toLower',
    'toUpper',
    'trim',
    'reverse',
    'isAbsent',
    'isError',
    'documentId',
    'collectionId',
    'type',
    'byteLength',
    'charLength',
    'length',
    'vectorLength',
    'timestampToUnixMicros',
    'timestampToUnixMillis',
    'timestampToUnixSeconds',
    'arrayFirst',
    'arrayLast',
    'arrayMaximum',
    'arrayMinimum',
    'mapEntries',
    'mapKeys',
    'mapValues',
    'sum',
    'count',
    'average',
    'countDistinct',
    'first',
    'last',
    'arrayAgg',
    'arrayAggDistinct',
    'maximum',
    'minimum',
    'exists',
    'unixMicrosToTimestamp',
    'unixMillisToTimestamp',
    'unixSecondsToTimestamp',
    'arrayLength',
  ] as const;

  for (const method of unaryMethods) {
    let target: pipelines.Field = price;
    if (
      method === 'timestampToUnixMicros' ||
      method === 'timestampToUnixMillis' ||
      method === 'timestampToUnixSeconds'
    ) {
      target = eventTime;
    } else if (method === 'unixMicrosToTimestamp') {
      target = micros;
    } else if (method === 'unixMillisToTimestamp') {
      target = millis;
    } else if (method === 'unixSecondsToTimestamp') {
      target = seconds;
    } else if (method.startsWith('map')) {
      target = metadata;
    } else if (
      method.startsWith('array') ||
      method === 'sum' ||
      method === 'count' ||
      method === 'average' ||
      method === 'countDistinct' ||
      method === 'first' ||
      method === 'last' ||
      method === 'arrayAgg' ||
      method === 'arrayAggDistinct'
    ) {
      target = scores;
    } else if (method === 'vectorLength') {
      target = vec;
    } else if (method === 'byteLength' || method === 'charLength' || method === 'length') {
      target = name;
    } else if (method === 'exists') {
      target = active;
    }
    cases.push(unaryField(method, target));
  }

  const compareMethods = [
    ['greaterThan', 5],
    ['gt', 5],
    ['equal', 5],
    ['eq', 5],
    ['notEqual', 5],
    ['greaterThanOrEqual', 5],
    ['gte', 5],
    ['lessThan', 5],
    ['lt', 5],
    ['lessThanOrEqual', 5],
    ['lte', 5],
    ['startsWith', 'The'],
    ['endsWith', 'ing'],
    ['arrayContains', 'sale'],
    ['arrayContainsAny', ['sale', 'new']],
    ['arrayContainsAll', ['sale']],
    ['like', '%ali%'],
    ['stringContains', 'ali'],
    ['equalAny', [1, 2, 3]],
    ['notEqualAny', [9, 8]],
    ['isType', 'string'],
  ] as const;

  for (const [method, arg] of compareMethods) {
    const target = method.startsWith('array') || method.startsWith('equal') ? tags : name;
    cases.push(binaryCompare('binary-compare', method, arg, target));
  }

  const mathBinary = [
    ['add', 1],
    ['subtract', 1],
    ['multiply', 2],
    ['divide', 2],
    ['mod', 3],
    ['pow', 2],
    ['logicalMaximum', 1],
    ['logicalMinimum', 1],
  ] as const;
  for (const [method, arg] of mathBinary) {
    cases.push(binaryCompare('binary-math', method, arg, price));
  }

  cases.push(
    createCase({
      category: 'binary-field',
      method: 'round',
      expectedName: 'round',
      global: () => pipelines.round(price, 2),
      fluent: () => fluent(price).round(2),
    }),
    createCase({
      category: 'binary-field',
      method: 'trunc',
      expectedName: 'trunc',
      global: () => pipelines.trunc(price, 2),
      fluent: () => fluent(price).trunc(2),
    }),
    createCase({
      category: 'binary-field',
      method: 'substring',
      expectedName: 'substring',
      global: () => pipelines.substring(name, 0, 3),
      fluent: () => fluent(name).substring(0, 3),
    }),
    createCase({
      category: 'string-field',
      method: 'split',
      expectedName: 'split',
      global: () => pipelines.split(name, ','),
      fluent: () => fluent(name).split(','),
    }),
    createCase({
      category: 'string-field',
      method: 'join',
      expectedName: 'join',
      global: () => pipelines.join(tags, ','),
      fluent: () => fluent(tags).join(','),
    }),
    createCase({
      category: 'string-field',
      method: 'ltrim',
      expectedName: 'ltrim',
      global: () => pipelines.ltrim(rawText, ' '),
      fluent: () => fluent(rawText).ltrim(' '),
    }),
    createCase({
      category: 'string-field',
      method: 'rtrim',
      expectedName: 'rtrim',
      global: () => pipelines.rtrim(rawText, ' '),
      fluent: () => fluent(rawText).rtrim(' '),
    }),
    createCase({
      category: 'variadic-field',
      method: 'stringConcat',
      expectedName: 'stringConcat',
      global: () => pipelines.stringConcat(name, ' ', bio),
      fluent: () => fluent(name).stringConcat(' ', bio),
    }),
    createCase({
      category: 'string-field',
      method: 'stringIndexOf',
      expectedName: 'stringIndexOf',
      global: () => pipelines.stringIndexOf(name, 'a'),
      fluent: () => fluent(name).stringIndexOf('a'),
    }),
    createCase({
      category: 'string-field',
      method: 'stringRepeat',
      expectedName: 'stringRepeat',
      global: () => pipelines.stringRepeat(name, 2),
      fluent: () => fluent(name).stringRepeat(2),
    }),
    createCase({
      category: 'string-field',
      method: 'stringReverse',
      expectedName: 'stringReverse',
      global: () => pipelines.stringReverse(name),
      fluent: () => fluent(name).stringReverse(),
    }),
    createCase({
      category: 'variadic-field',
      method: 'concat',
      expectedName: 'concat',
      global: () => pipelines.concat(name, ' ', bio),
      fluent: () => fluent(name).concat(' ', bio),
    }),
    createCase({
      category: 'array-field',
      method: 'arrayFirstN',
      expectedName: 'arrayFirstN',
      global: () => pipelines.arrayFirstN(scores, 2),
      fluent: () => fluent(scores).arrayFirstN(2),
    }),
    createCase({
      category: 'array-field',
      method: 'arrayLastN',
      expectedName: 'arrayLastN',
      global: () => pipelines.arrayLastN(scores, 2),
      fluent: () => fluent(scores).arrayLastN(2),
    }),
    createCase({
      category: 'array-field',
      method: 'arrayMaximumN',
      expectedName: 'arrayMaximumN',
      global: () => pipelines.arrayMaximumN(scores, 2),
      fluent: () => fluent(scores).arrayMaximumN(2),
    }),
    createCase({
      category: 'array-field',
      method: 'arrayMinimumN',
      expectedName: 'arrayMinimumN',
      global: () => pipelines.arrayMinimumN(scores, 2),
      fluent: () => fluent(scores).arrayMinimumN(2),
    }),
    createCase({
      category: 'array-field',
      method: 'arraySlice',
      expectedName: 'arraySlice',
      global: () => pipelines.arraySlice(scores, 1, 2),
      fluent: () => fluent(scores).arraySlice(1, 2),
    }),
    createCase({
      category: 'array-field',
      method: 'arrayGet',
      expectedName: 'arrayGet',
      global: () => pipelines.arrayGet(scores, 0),
      fluent: () => fluent(scores).arrayGet(0),
    }),
    createCase({
      category: 'array-field',
      method: 'arrayConcat',
      expectedName: 'arrayConcat',
      global: () => pipelines.arrayConcat(scores, [99]),
      fluent: () => fluent(scores).arrayConcat([99]),
    }),
    createCase({
      category: 'array-field',
      method: 'arraySum',
      expectedName: 'arraySum',
      global: () => pipelines.arraySum(scores),
      fluent: () => fluent(scores).arraySum(),
    }),
    createCase({
      category: 'array-field',
      method: 'arrayIndexOf',
      expectedName: 'arrayIndexOf',
      global: () => pipelines.arrayIndexOf(scores, 10),
      fluent: () => fluent(scores).arrayIndexOf(10),
    }),
    createCase({
      category: 'array-field',
      method: 'arrayLastIndexOf',
      expectedName: 'arrayLastIndexOf',
      global: () => pipelines.arrayLastIndexOf(scores, 10),
      fluent: () => fluent(scores).arrayLastIndexOf(10),
    }),
    createCase({
      category: 'array-field',
      method: 'arrayIndexOfAll',
      expectedName: 'arrayIndexOfAll',
      global: () => pipelines.arrayIndexOfAll(scores, 10),
      fluent: () => fluent(scores).arrayIndexOfAll(10),
    }),
    createCase({
      category: 'array-field',
      method: 'arrayTransform',
      expectedName: 'arrayTransform',
      global: () =>
        pipelines.arrayTransform(scores, 'score', pipelines.add(pipelines.variable('score'), 1)),
      fluent: () =>
        fluent(scores).arrayTransform('score', pipelines.add(pipelines.variable('score'), 1)),
    }),
    createCase({
      category: 'variadic-field',
      method: 'arrayTransformWithIndex',
      expectedName: 'arrayTransformWithIndex',
      global: () =>
        pipelines.arrayTransformWithIndex(
          scores,
          'score',
          'idx',
          pipelines.add(pipelines.variable('score'), pipelines.variable('idx')),
        ),
      fluent: () =>
        fluent(scores).arrayTransformWithIndex(
          'score',
          'idx',
          pipelines.add(pipelines.variable('score'), pipelines.variable('idx')),
        ),
    }),
    createCase({
      category: 'array-field',
      method: 'arrayFilter',
      expectedName: 'arrayFilter',
      global: () => pipelines.arrayFilter(scores, 'score', gt0),
      fluent: () => fluent(scores).arrayFilter('score', gt0),
    }),
    createCase({
      category: 'map-field',
      method: 'mapGet',
      expectedName: 'mapGet',
      global: () => pipelines.mapGet(metadata, 'theme'),
      fluent: () => fluent(metadata).mapGet('theme'),
    }),
    createCase({
      category: 'map-field',
      method: 'mapSet',
      expectedName: 'mapSet',
      global: () => pipelines.mapSet(metadata, 'theme', 'dark'),
      fluent: () => fluent(metadata).mapSet('theme', 'dark'),
    }),
    createCase({
      category: 'map-field',
      method: 'mapRemove',
      expectedName: 'mapRemove',
      global: () => pipelines.mapRemove(metadata, 'theme'),
      fluent: () => fluent(metadata).mapRemove('theme'),
    }),
    createCase({
      category: 'map-field',
      method: 'mapMerge',
      expectedName: 'mapMerge',
      global: () => pipelines.mapMerge(metadata, { extra: true }),
      fluent: () => fluent(metadata).mapMerge({ extra: true }),
    }),
    createCase({
      category: 'regex-field',
      method: 'regexContains',
      expectedName: 'regexContains',
      global: () => pipelines.regexContains(name, '^A'),
      fluent: () => fluent(name).regexContains('^A'),
    }),
    createCase({
      category: 'regex-field',
      method: 'regexFind',
      expectedName: 'regexFind',
      global: () => pipelines.regexFind(name, '\\d+'),
      fluent: () => fluent(name).regexFind('\\d+'),
    }),
    createCase({
      category: 'regex-field',
      method: 'regexFindAll',
      expectedName: 'regexFindAll',
      global: () => pipelines.regexFindAll(name, '\\d+'),
      fluent: () => fluent(name).regexFindAll('\\d+'),
    }),
    createCase({
      category: 'regex-field',
      method: 'regexMatch',
      expectedName: 'regexMatch',
      global: () => pipelines.regexMatch(code, '^[A-Z]{3}$'),
      fluent: () => fluent(code).regexMatch('^[A-Z]{3}$'),
    }),
    createCase({
      category: 'string-field',
      method: 'stringReplaceOne',
      expectedName: 'stringReplaceOne',
      global: () => pipelines.stringReplaceOne(label, 'a', 'b'),
      fluent: () => fluent(label).stringReplaceOne('a', 'b'),
    }),
    createCase({
      category: 'string-field',
      method: 'stringReplaceAll',
      expectedName: 'stringReplaceAll',
      global: () => pipelines.stringReplaceAll(label, 'a', 'b'),
      fluent: () => fluent(label).stringReplaceAll('a', 'b'),
    }),
    createCase({
      category: 'vector-field',
      method: 'cosineDistance',
      expectedName: 'cosineDistance',
      global: () => pipelines.cosineDistance(vec, [1, 0, 0]),
      fluent: () => fluent(vec).cosineDistance([1, 0, 0]),
    }),
    createCase({
      category: 'vector-field',
      method: 'dotProduct',
      expectedName: 'dotProduct',
      global: () => pipelines.dotProduct(vec, [1, 0, 0]),
      fluent: () => fluent(vec).dotProduct([1, 0, 0]),
    }),
    createCase({
      category: 'vector-field',
      method: 'euclideanDistance',
      expectedName: 'euclideanDistance',
      global: () => pipelines.euclideanDistance(vec, [1, 0, 0]),
      fluent: () => fluent(vec).euclideanDistance([1, 0, 0]),
    }),
    createCase({
      category: 'timestamp-field',
      method: 'timestampAdd',
      expectedName: 'timestampAdd',
      global: () => pipelines.timestampAdd(eventTime, 'day', 1),
      fluent: () => fluent(eventTime).timestampAdd('day', 1),
    }),
    createCase({
      category: 'timestamp-field',
      method: 'timestampSubtract',
      expectedName: 'timestampSubtract',
      global: () => pipelines.timestampSubtract(eventTime, 'hour', 1),
      fluent: () => fluent(eventTime).timestampSubtract('hour', 1),
    }),
    createCase({
      category: 'timestamp-field',
      method: 'timestampExtract',
      expectedName: 'timestampExtract',
      global: () => pipelines.timestampExtract(eventTime, 'year'),
      fluent: () => fluent(eventTime).timestampExtract('year'),
    }),
    createCase({
      category: 'timestamp-field',
      method: 'timestampTruncate',
      expectedName: 'timestampTruncate',
      global: () => pipelines.timestampTruncate(eventTime, 'day'),
      fluent: () => fluent(eventTime).timestampTruncate('day'),
    }),
    createCase({
      category: 'coalesce-field',
      method: 'coalesce',
      expectedName: 'coalesce',
      global: () => pipelines.coalesce(displayName, 'Anonymous'),
      fluent: () => fluent(displayName).coalesce('Anonymous'),
    }),
    createCase({
      category: 'coalesce-field',
      method: 'ifNull',
      expectedName: 'ifNull',
      global: () => pipelines.ifNull(displayName, 'Anonymous'),
      fluent: () => fluent(displayName).ifNull('Anonymous'),
    }),
    createCase({
      category: 'coalesce-field',
      method: 'ifAbsent',
      expectedName: 'ifAbsent',
      global: () => pipelines.ifAbsent(optionalName, 'Unknown'),
      fluent: () => fluent(optionalName).ifAbsent('Unknown'),
    }),
    createCase({
      category: 'coalesce-field',
      method: 'ifError',
      expectedName: 'ifError',
      global: () => pipelines.ifError(value, pipelines.constant('fallback')),
      fluent: () => fluent(value).ifError(pipelines.constant('fallback')),
    }),
    createCase({
      category: 'conditional',
      method: 'conditional',
      expectedName: 'conditional',
      global: () =>
        pipelines.conditional(boolA, pipelines.constant('yes'), pipelines.constant('no')),
      fluent: () => (boolA as any).conditional(pipelines.constant('yes'), pipelines.constant('no')),
    }),
    createCase({
      category: 'aggregate-boolean',
      method: 'countIf',
      expectedName: 'countIf',
      global: () => pipelines.countIf(pipelines.field('active').equal(true)),
      fluent: () => (pipelines.field('active').equal(true) as any).countIf(),
    }),
    createCase({
      category: 'unary-boolean',
      method: 'not',
      expectedName: 'not',
      global: () => pipelines.not(boolA),
      fluent: () => fluent(boolA).not(),
    }),
    createCase({
      category: 'boolean-binary',
      method: 'and',
      expectedName: 'and',
      global: () => pipelines.and(boolA, boolB),
      fluent: () => fluent(boolA).and(boolB),
    }),
    createCase({
      category: 'boolean-binary',
      method: 'or',
      expectedName: 'or',
      global: () => pipelines.or(boolA, boolB),
      fluent: () => fluent(boolA).or(boolB),
    }),
    createCase({
      category: 'boolean-binary',
      method: 'xor',
      expectedName: 'xor',
      global: () => pipelines.xor(boolA, boolB),
      fluent: () => fluent(boolA).xor(boolB),
    }),
    createCase({
      category: 'boolean-binary',
      method: 'nor',
      expectedName: 'nor',
      global: () => pipelines.nor(boolA, boolB),
      fluent: () => fluent(boolA).nor(boolB),
    }),
    nullaryGlobal('currentTimestamp', eventTime),
    nullaryGlobal('rand', value),
  );

  return cases;
}

export function assertCoversAllExpressionMethods(cases: FluentParityCase[]): void {
  const covered = new Set(cases.map(entry => entry.method));
  const missing = EXPRESSION_METHOD_NAMES.filter(name => !covered.has(name));
  if (missing.length > 0) {
    throw new Error(`Missing fluent parity cases for: ${missing.join(', ')}`);
  }
}
