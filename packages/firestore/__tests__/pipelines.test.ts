import { describe, expect, it, jest } from '@jest/globals';
import { getFirestore } from '../lib';
import { getApp } from '@react-native-firebase/app';
import { FieldPath } from '../lib/FieldPath';
import { Timestamp } from '../lib/FirestoreTimestamp';
import {
  arrayFilter,
  arrayFirst,
  arrayFirstN,
  arrayIndexOf,
  arrayLastIndexOf,
  arrayMaximum,
  arrayMaximumN,
  arrayMinimumN,
  arrayTransform,
  and,
  coalesce,
  constant,
  currentDocument,
  equal,
  ifNull,
  switchOn,
  descending,
  execute,
  field,
  greaterThan,
  Ordering,
  variable,
  countAll,
  average,
  subcollection,
  array,
  map,
} from '../lib/pipelines';
import '../lib/pipelines';
import {
  avg,
  ConstantExpression,
  eq,
  FunctionExpression,
  gt,
  gte,
  lt,
} from '../lib/pipelines/expressions';

describe('Firestore pipelines runtime', function () {
  it('installs pipeline() and serializes source builders', function () {
    const db: any = getFirestore();
    const docRef = db.doc('firestore/a');
    const query = db
      .collection('firestore')
      .where('value', '>=', 1)
      .orderBy('value', 'desc')
      .limit(2);

    expect(typeof db.pipeline).toBe('function');

    const fromCollection = db.pipeline().collection({ collectionRef: db.collection('firestore') });
    const fromCollectionGroup = db.pipeline().collectionGroup({ collectionId: 'cities' });
    const fromDatabase = db.pipeline().database({ rawOptions: { explain: true } });
    const fromDocuments = db.pipeline().documents({ docs: [docRef, 'firestore/b'] });
    const fromQuery = db.pipeline().createFrom(query);

    expect(fromCollection.serialize().source).toEqual({ source: 'collection', path: 'firestore' });
    expect(fromCollectionGroup.serialize().source).toEqual({
      source: 'collectionGroup',
      collectionId: 'cities',
    });
    expect(fromDatabase.serialize().source).toEqual({
      source: 'database',
      rawOptions: { explain: true },
    });
    expect(fromDocuments.serialize().source).toEqual({
      source: 'documents',
      documents: ['firestore/a', 'firestore/b'],
    });
    expect(fromQuery.serialize().source).toMatchObject({
      source: 'query',
      path: 'firestore',
      queryType: 'collection',
      options: { limit: 2 },
    });
  });

  it('normalizes stage option keys and preserves stage order', function () {
    const db: any = getFirestore();

    const pipeline = db
      .pipeline()
      .collection('firestore')
      .select({ selection: ['name', 'score'] } as any)
      .sort({ orderings: [{ fieldPath: 'score', direction: 'desc' }] } as any)
      .limit({ n: 5 })
      .offset({ offset: 2 } as any)
      .sample(3)
      .replaceWith('payload')
      .distinct({ group: ['country'] } as any)
      .aggregate({ accumulator: [{ kind: 'count' }], group: ['country'] } as any);

    expect(pipeline.serialize().stages).toEqual([
      { stage: 'select', options: { selections: ['name', 'score'] } },
      {
        stage: 'sort',
        options: { orderings: [{ fieldPath: 'score', direction: 'desc' }] },
      },
      { stage: 'limit', options: { limit: 5 } },
      { stage: 'offset', options: { offset: 2 } },
      { stage: 'sample', options: { documents: 3 } },
      { stage: 'replaceWith', options: { map: 'payload' } },
      { stage: 'distinct', options: { groups: ['country'] } },
      { stage: 'aggregate', options: { accumulators: [{ kind: 'count' }], groups: ['country'] } },
    ]);
  });

  it('treats unnest selectable overload as selectable, not options object', function () {
    const db: any = getFirestore();
    const serialized = db
      .pipeline()
      .collection('firestore')
      .unnest(field('scores').as('score'), 'attempt')
      .serialize();
    const unnestStage: any = serialized.stages[0];

    expect(serialized.stages).toHaveLength(1);
    expect(unnestStage?.stage).toBe('unnest');
    expect(unnestStage?.options?.indexField).toBe('attempt');
    expect(unnestStage?.options?.selectable?.alias).toBe('score');
    expect(
      unnestStage?.options?.selectable?.path ?? unnestStage?.options?.selectable?.expr?.path,
    ).toBe('scores');
  });

  it('serializes rawStage params as an object so native bridges preserve named params', function () {
    const db: any = getFirestore();
    const serialized = db
      .pipeline()
      .collection('firestore')
      .rawStage('score', {
        input: field('rating'),
        threshold: 4,
        config: {
          mode: 'strict',
          boost: field('boost'),
        },
      })
      .serialize();

    expect(serialized.stages).toHaveLength(1);
    expect(serialized.stages[0]).toMatchObject({
      stage: 'rawStage',
      options: {
        name: 'score',
        params: {
          input: { exprType: 'Field', path: 'rating' },
          threshold: 4,
          config: {
            mode: 'strict',
            boost: { exprType: 'Field', path: 'boost' },
          },
        },
        options: {},
      },
    });
  });

  it('serializes arrayFilter as a function expression helper and fluent method', function () {
    const db: any = getFirestore();
    const serialized = db
      .pipeline()
      .collection('firestore')
      .select(
        arrayFilter('scores', 'score', greaterThan(variable('score'), constant(15))).as(
          'passingScores',
        ),
        field('scores')
          .arrayFilter('score', greaterThan(variable('score'), constant(20)))
          .as('topScores'),
      )
      .serialize();

    expect(serialized.stages[0]).toMatchObject({
      stage: 'select',
      options: {
        selections: [
          {
            alias: 'passingScores',
            expr: {
              exprType: 'Function',
              name: 'arrayFilter',
              args: [
                { exprType: 'Field', path: 'scores' },
                { exprType: 'Constant', value: 'score' },
                {
                  exprType: 'Function',
                  name: 'greaterThan',
                  args: [
                    { exprType: 'Variable', name: 'score' },
                    { exprType: 'Constant', value: 15 },
                  ],
                },
              ],
            },
          },
          {
            alias: 'topScores',
            expr: {
              exprType: 'Function',
              name: 'arrayFilter',
              args: [
                { exprType: 'Field', path: 'scores' },
                { exprType: 'Constant', value: 'score' },
                {
                  exprType: 'Function',
                  name: 'greaterThan',
                  args: [
                    { exprType: 'Variable', name: 'score' },
                    { exprType: 'Constant', value: 20 },
                  ],
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('serializes currentDocument as a zero-argument function expression helper', function () {
    const db: any = getFirestore();
    const serialized = db
      .pipeline()
      .collection('firestore')
      .select((currentDocument() as FunctionExpression).as('doc'))
      .serialize();

    expect(serialized.stages[0]).toMatchObject({
      stage: 'select',
      options: {
        selections: [
          {
            alias: 'doc',
            expr: {
              exprType: 'Function',
              name: 'currentDocument',
              args: [],
            },
          },
        ],
      },
    });
  });

  it('serializes ifNull as a function expression helper and fluent method', function () {
    const db: any = getFirestore();
    const serialized = db
      .pipeline()
      .collection('firestore')
      .select(
        ifNull(field('displayName'), constant('Anonymous')).as('displayName'),
        ifNull('displayName', field('fullName')).as('stringFieldIfNull'),
        field('displayName').ifNull(field('fullName')).as('fluentIfNull'),
      )
      .serialize();

    expect(serialized.stages[0]).toMatchObject({
      stage: 'select',
      options: {
        selections: [
          {
            alias: 'displayName',
            expr: {
              exprType: 'Function',
              name: 'ifNull',
              args: [
                { exprType: 'Field', path: 'displayName' },
                { exprType: 'Constant', value: 'Anonymous' },
              ],
            },
          },
          {
            alias: 'stringFieldIfNull',
            expr: {
              exprType: 'Function',
              name: 'ifNull',
              args: [
                { exprType: 'Field', path: 'displayName' },
                { exprType: 'Field', path: 'fullName' },
              ],
            },
          },
          {
            alias: 'fluentIfNull',
            expr: {
              exprType: 'Function',
              name: 'ifNull',
              args: [
                { exprType: 'Field', path: 'displayName' },
                { exprType: 'Field', path: 'fullName' },
              ],
            },
          },
        ],
      },
    });
  });

  it('serializes switchOn as a function expression helper', function () {
    const db: any = getFirestore();
    const serialized = db
      .pipeline()
      .collection('firestore')
      .select(
        switchOn(
          equal(field('status'), constant(1)),
          constant('Active'),
          equal(field('status'), constant(2)),
          constant('Pending'),
          constant('Unknown'),
        ).as('statusLabel'),
      )
      .serialize();

    expect(serialized.stages[0]).toMatchObject({
      stage: 'select',
      options: {
        selections: [
          {
            alias: 'statusLabel',
            expr: {
              exprType: 'Function',
              name: 'switchOn',
              args: [
                {
                  exprType: 'Function',
                  name: 'equal',
                  args: [
                    { exprType: 'Field', path: 'status' },
                    { exprType: 'Constant', value: 1 },
                  ],
                },
                { exprType: 'Constant', value: 'Active' },
                {
                  exprType: 'Function',
                  name: 'equal',
                  args: [
                    { exprType: 'Field', path: 'status' },
                    { exprType: 'Constant', value: 2 },
                  ],
                },
                { exprType: 'Constant', value: 'Pending' },
                { exprType: 'Constant', value: 'Unknown' },
              ],
            },
          },
        ],
      },
    });
  });

  it('serializes coalesce as a function expression helper and fluent method', function () {
    const db: any = getFirestore();
    const serialized = db
      .pipeline()
      .collection('firestore')
      .select(
        coalesce(field('preferredName'), field('fullName'), constant('Anonymous')).as(
          'displayName',
        ),
        coalesce('preferredName', field('fullName'), constant('Anonymous')).as(
          'stringFieldCoalesce',
        ),
        field('preferredName')
          .coalesce(field('fullName'), constant('Anonymous'))
          .as('fluentDisplayName'),
      )
      .serialize();

    expect(serialized.stages[0]).toMatchObject({
      stage: 'select',
      options: {
        selections: [
          {
            alias: 'displayName',
            expr: {
              exprType: 'Function',
              name: 'coalesce',
              args: [
                { exprType: 'Field', path: 'preferredName' },
                { exprType: 'Field', path: 'fullName' },
                { exprType: 'Constant', value: 'Anonymous' },
              ],
            },
          },
          {
            alias: 'stringFieldCoalesce',
            expr: {
              exprType: 'Function',
              name: 'coalesce',
              args: [
                { exprType: 'Field', path: 'preferredName' },
                { exprType: 'Field', path: 'fullName' },
                { exprType: 'Constant', value: 'Anonymous' },
              ],
            },
          },
          {
            alias: 'fluentDisplayName',
            expr: {
              exprType: 'Function',
              name: 'coalesce',
              args: [
                { exprType: 'Field', path: 'preferredName' },
                { exprType: 'Field', path: 'fullName' },
                { exprType: 'Constant', value: 'Anonymous' },
              ],
            },
          },
        ],
      },
    });
  });

  it('serializes newer array expression helpers with SDK-compatible arguments', function () {
    const db: any = getFirestore();
    const serialized = db
      .pipeline()
      .collection('firestore')
      .select(
        arrayFirst('scores').as('firstScore'),
        arrayFirstN('scores', 2).as('firstTwoScores'),
        arrayFirstN('scores', field('limit')).as('dynamicFirstScores'),
        field('scores').arrayLast().as('lastScore'),
        field('scores').arrayLastN(2).as('lastTwoScores'),
        field('scores').arraySlice(1, 3).as('middleScores'),
        arrayTransform('scores', 'score', variable('score')).as('transformedScores'),
        field('scores')
          .arrayTransformWithIndex('score', 'index', variable('index'))
          .as('indexedScores'),
        arrayMaximum('scores').as('maxScore'),
        arrayMaximumN(field('scores'), 3).as('topScores'),
        field('scores').arrayMinimum().as('minScore'),
        arrayMinimumN(field('scores'), 3).as('bottomScores'),
        arrayIndexOf('scores', 10).as('firstIndex'),
        field('scores').arrayIndexOf(10).as('fluentFirstIndex'),
        arrayLastIndexOf(field('scores'), 10).as('lastIndex'),
        field('scores').arrayIndexOfAll(10).as('allIndexes'),
      )
      .serialize();

    expect(serialized.stages[0]).toMatchObject({
      stage: 'select',
      options: {
        selections: [
          { alias: 'firstScore', expr: { exprType: 'Function', name: 'arrayFirst' } },
          { alias: 'firstTwoScores', expr: { exprType: 'Function', name: 'arrayFirstN' } },
          {
            alias: 'dynamicFirstScores',
            expr: {
              exprType: 'Function',
              name: 'arrayFirstN',
              args: [
                { exprType: 'Field', path: 'scores' },
                { exprType: 'Field', path: 'limit' },
              ],
            },
          },
          { alias: 'lastScore', expr: { exprType: 'Function', name: 'arrayLast' } },
          { alias: 'lastTwoScores', expr: { exprType: 'Function', name: 'arrayLastN' } },
          { alias: 'middleScores', expr: { exprType: 'Function', name: 'arraySlice' } },
          { alias: 'transformedScores', expr: { exprType: 'Function', name: 'arrayTransform' } },
          {
            alias: 'indexedScores',
            expr: { exprType: 'Function', name: 'arrayTransformWithIndex' },
          },
          { alias: 'maxScore', expr: { exprType: 'Function', name: 'arrayMaximum' } },
          { alias: 'topScores', expr: { exprType: 'Function', name: 'arrayMaximumN' } },
          { alias: 'minScore', expr: { exprType: 'Function', name: 'arrayMinimum' } },
          { alias: 'bottomScores', expr: { exprType: 'Function', name: 'arrayMinimumN' } },
          {
            alias: 'firstIndex',
            expr: {
              exprType: 'Function',
              name: 'arrayIndexOf',
              args: [
                { exprType: 'Field', path: 'scores' },
                { exprType: 'Constant', value: 10 },
                { exprType: 'Constant', value: 'first' },
              ],
            },
          },
          {
            alias: 'fluentFirstIndex',
            expr: {
              exprType: 'Function',
              name: 'arrayIndexOf',
              args: [
                { exprType: 'Field', path: 'scores' },
                { exprType: 'Constant', value: 10 },
                { exprType: 'Constant', value: 'first' },
              ],
            },
          },
          {
            alias: 'lastIndex',
            expr: {
              exprType: 'Function',
              name: 'arrayLastIndexOf',
              args: [
                { exprType: 'Field', path: 'scores' },
                { exprType: 'Constant', value: 10 },
                { exprType: 'Constant', value: 'last' },
              ],
            },
          },
          { alias: 'allIndexes', expr: { exprType: 'Function', name: 'arrayIndexOfAll' } },
        ],
      },
    });
  });

  it('enforces union guards and self-cycle serialization constraints', function () {
    const db: any = getFirestore();
    const secondaryDb: any = getFirestore(getApp('secondaryFromNative'));
    const base = db.pipeline().collection('firestore');

    expect(() => base.union({} as any)).toThrow(
      'firebase.firestore().pipeline().union(*) expected a pipeline created from firestore.pipeline().',
    );

    expect(() => base.union(secondaryDb.pipeline().collection('firestore'))).toThrow(
      'firebase.firestore().pipeline().union(*) cannot combine pipelines from different Firestore instances.',
    );

    const selfCycle: any = db.pipeline().collection('firestore');
    selfCycle._stages.push({ stage: 'union', options: { other: selfCycle } });
    expect(() => selfCycle.serialize()).toThrow(
      'firebase.firestore().pipeline() cannot union a pipeline with itself.',
    );
  });

  it('enforces createFrom cross-firestore and query-shape guards', function () {
    const db: any = getFirestore();
    const secondaryDb: any = getFirestore(getApp('secondaryFromNative'));
    const secondaryQuery = secondaryDb.collection('firestore').where('value', '==', 1);

    expect(() => db.pipeline().createFrom({} as any)).toThrow(
      'firebase.firestore().pipeline().createFrom(*) expected a Query from @react-native-firebase/firestore.',
    );

    expect(() => db.pipeline().createFrom(secondaryQuery)).toThrow(
      'firebase.firestore().pipeline().createFrom(*) cannot use a Query from a different Firestore instance.',
    );
  });

  it('enforces source reference affinity for collection() and documents()', function () {
    const db: any = getFirestore();
    const secondaryDb: any = getFirestore(getApp('secondaryFromNative'));

    expect(() => db.pipeline().collection(secondaryDb.collection('firestore'))).toThrow(
      'firebase.firestore().pipeline().collection(*) cannot use a reference from a different Firestore instance.',
    );

    expect(() =>
      db.pipeline().collection({ collectionRef: secondaryDb.collection('firestore') }),
    ).toThrow(
      'firebase.firestore().pipeline().collection(*) cannot use a reference from a different Firestore instance.',
    );

    expect(() => db.pipeline().documents([secondaryDb.doc('firestore/a')])).toThrow(
      'firebase.firestore().pipeline().documents(*) cannot use a reference from a different Firestore instance.',
    );

    expect(() =>
      db.pipeline().documents({ docs: ['firestore/a', secondaryDb.doc('firestore/b')] }),
    ).toThrow(
      'firebase.firestore().pipeline().documents(*) cannot use a reference from a different Firestore instance.',
    );
  });

  it('validates execute input and rejects unsupported execute options', async function () {
    const db: any = getFirestore();
    const nativeExecute = jest.fn(async () => ({
      executionTime: [1735689600, 123000000],
      results: [{ path: 'firestore/a', data: { value: 42 } }],
    }));

    const originalNativeModule = db._nativeModule;
    db._nativeModule = { pipelineExecute: nativeExecute };

    try {
      const pipeline = db.pipeline().documents(['firestore/a']);
      const snapshot = await execute(pipeline);

      expect(nativeExecute).toHaveBeenCalledTimes(1);
      expect((nativeExecute as any).mock.calls[0]).toEqual([pipeline.serialize(), {}]);
      expect(snapshot.results).toHaveLength(1);
      expect(snapshot.results[0]?.data()).toEqual({ value: 42 });
      expect(snapshot.results[0]?.id).toBe('a');
      expect(snapshot.executionTime.toMillis()).toBe(1735689600123);

      await expect(
        execute({
          pipeline,
          indexMode: 'recommended',
        }),
      ).rejects.toThrow(
        'pipelineExecute() does not support options.indexMode because Firestore pipeline execute options are currently unstable or unavailable.',
      );

      await expect(
        execute({
          pipeline,
          rawOptions: { requestLabel: 'unit-test' },
        }),
      ).rejects.toThrow(
        'pipelineExecute() does not support options.rawOptions because Firestore pipeline execute options are currently unstable or unavailable.',
      );

      await expect(execute('invalid-input' as any)).rejects.toThrow(
        'firebase.firestore().pipeline().execute(*) expected a Pipeline or PipelineExecuteOptions.',
      );

      await expect(execute({ pipeline: {} } as any)).rejects.toThrow(
        'firebase.firestore().pipeline().execute(*) expected options.pipeline to be created from firestore.pipeline().',
      );
    } finally {
      db._nativeModule = originalNativeModule;
    }
  });

  it('throws when pipelineExecute omits executionTime', async function () {
    const db: any = getFirestore();
    const originalNativeModule = db._nativeModule;
    db._nativeModule = {
      pipelineExecute: jest.fn(async () => ({
        results: [{ path: 'firestore/a', data: { value: 42 } }],
      })),
    };

    try {
      await expect(execute(db.pipeline().documents(['firestore/a']))).rejects.toThrow(
        'firebase.firestore().pipeline().execute(*) expected pipelineExecute() to return executionTime.',
      );
    } finally {
      db._nativeModule = originalNativeModule;
    }
  });

  it('serializes global expression helpers with field names and constants', function () {
    const condition: any = greaterThan('rating' as any, 4 as any);
    expect(condition).toMatchObject({
      exprType: 'Function',
      name: 'greaterThan',
      args: [
        { exprType: 'Field', path: 'rating' },
        { exprType: 'Constant', value: 4 },
      ],
    });
  });

  it('serializes comparison alias exports gt, eq, gte, and lt', function () {
    expect(gt(field('rating'), constant(4))).toMatchObject({
      exprType: 'Function',
      name: 'greaterThan',
    });
    expect(eq(field('sku'), constant('SKU001'))).toMatchObject({
      exprType: 'Function',
      name: 'equal',
    });
    expect(gte(field('stock'), constant(50))).toMatchObject({
      exprType: 'Function',
      name: 'greaterThanOrEqual',
    });
    expect(lt(field('price'), constant(100))).toMatchObject({
      exprType: 'Function',
      name: 'lessThan',
    });
  });

  it('serializes avg aggregate alias to average', function () {
    expect(avg(field('score'))).toMatchObject({
      exprType: 'AggregateFunction',
      kind: 'average',
    });
  });

  it('normalizes array and map helpers that embed runtime expression nodes', function () {
    const arrayExpr: any = array([field('score'), constant('tail')]);
    expect(arrayExpr).toMatchObject({
      exprType: 'Function',
      name: 'array',
      args: [
        { exprType: 'Field', path: 'score' },
        { exprType: 'Constant', value: 'tail' },
      ],
    });

    const mapExpr: any = map({ label: field('name'), version: constant(1) });
    expect(mapExpr).toMatchObject({
      exprType: 'Function',
      name: 'map',
    });
    expect(mapExpr.args[0].exprType).toBe('Constant');
    expect(mapExpr.args[0].value.label.exprType).toBe('Field');
    expect(mapExpr.args[0].value.version.value).toBe(1);
  });

  it('preserves non-plain constant values without walking prototype objects', function () {
    class Marker {
      readonly tag = 'marker';
    }
    const marker = new Marker();
    const expr: any = constant(marker);
    expect(expr).toMatchObject({
      exprType: 'Constant',
      value: marker,
    });
  });

  it('normalizes pipeline execute results across timestamp and field path shapes', async function () {
    const db: any = getFirestore();
    const existingExecutionTime = new Timestamp(1735689600, 123000000);
    const nativeExecute = jest.fn(async () => ({
      executionTime: existingExecutionTime,
      results: [
        {
          path: 'books/alpha',
          id: 'alpha',
          data: { title: 'Alpha', nested: { score: 9 } },
          createTime: 1700000000123,
          updateTime: [1700000001, 456000000],
        },
        {
          path: 'books/beta',
          data: { plain: true },
          createTime: { seconds: 2, nanoseconds: 3 },
          updateTime: { seconds: 4, nanoseconds: 5 },
        },
      ],
    }));

    const originalNativeModule = db._nativeModule;
    db._nativeModule = { pipelineExecute: nativeExecute };

    try {
      const snapshot = await execute(db.pipeline().documents(['books/alpha', 'books/beta']));

      expect(snapshot.executionTime).toBe(existingExecutionTime);
      expect(snapshot.results[0]?.createTime?.toMillis()).toBe(1700000000123);
      expect(snapshot.results[0]?.updateTime?.seconds).toBe(1700000001);
      expect(snapshot.results[0]?.updateTime?.nanoseconds).toBe(456000000);
      expect(snapshot.results[0]?.get('nested.score')).toBe(9);
      expect(snapshot.results[0]?.get(new FieldPath('nested', 'score'))).toBe(9);
      expect(snapshot.results[0]?.get(field('nested.score'))).toBe(9);
      expect(snapshot.results[1]?.data()).toEqual({ plain: true });
      expect(snapshot.results[1]?.createTime?.seconds).toBe(2);
      expect(snapshot.results[1]?.updateTime?.nanoseconds).toBe(5);
    } finally {
      db._nativeModule = originalNativeModule;
    }
  });

  it('serializes FieldPath and Timestamp arguments in pipeline stages', function () {
    const db: any = getFirestore();
    const timestamp = new Timestamp(12, 34);
    const fieldPath = new FieldPath('meta', 'createdAt');

    const serialized = db
      .pipeline()
      .collection('books')
      .where(greaterThan(field('rating'), timestamp as any))
      .sort(Ordering.of(fieldPath as any).descending())
      .distinct({ groups: [fieldPath] } as any)
      .select(
        field('title')
          .add(timestamp as any)
          .as('createdAt'),
      )
      .serialize();

    expect(serialized.stages[0]?.options?.condition?.args?.[1]).toMatchObject({
      exprType: 'Constant',
      value: {
        seconds: 12,
        nanoseconds: 34,
      },
    });
    expect(serialized.stages[1]?.options?.orderings?.[0]?.expr).toMatchObject({
      exprType: 'Constant',
      value: {
        segments: ['meta', 'createdAt'],
      },
    });
    expect(serialized.stages[2]?.options?.groups?.[0]).toEqual({
      segments: ['meta', 'createdAt'],
    });
    expect(serialized.stages[3]?.options?.selections?.[0]?.expr?.args?.[1]).toMatchObject({
      exprType: 'Constant',
      value: {
        seconds: 12,
        nanoseconds: 34,
      },
    });
  });

  it('supports method-style expression chaining and ordering helper serialization', function () {
    const db: any = getFirestore();

    const pipeline = db
      .pipeline()
      .collection('firestore')
      .where(and(field('rating').greaterThan(4), field('genre').equal('Fantasy')))
      .select(
        field('title').as('title'),
        field('rating').add(1).as('boostedRating'),
        field('genre').equal('Fantasy').as('isFantasy'),
      )
      .sort(Ordering.of(field('rating')).descending())
      .aggregate(field('rating').average().as('averageRating'));

    const serialized = pipeline.serialize();
    const selectStage: any = serialized.stages[1];
    expect(serialized.stages[0]).toMatchObject({
      stage: 'where',
      options: {
        condition: {
          exprType: 'Function',
          name: 'and',
        },
      },
    });
    expect(selectStage?.stage).toBe('select');
    expect(selectStage?.options?.selections).toHaveLength(3);
    expect(selectStage?.options?.selections?.[0]).toMatchObject({
      alias: 'title',
    });
    expect(selectStage?.options?.selections?.[1]).toMatchObject({
      alias: 'boostedRating',
      expr: { exprType: 'Function', name: 'add' },
    });
    expect(selectStage?.options?.selections?.[2]).toMatchObject({
      alias: 'isFantasy',
      expr: { exprType: 'Function', name: 'equal' },
    });
    expect(serialized.stages[2]).toMatchObject({
      stage: 'sort',
      options: {
        orderings: [
          {
            direction: 'descending',
            expr: { exprType: 'Field', path: 'rating' },
          },
        ],
      },
    });
    expect(serialized.stages[3]).toMatchObject({
      stage: 'aggregate',
      options: {
        accumulators: [
          {
            alias: 'averageRating',
            aggregate: {
              exprType: 'AggregateFunction',
              kind: 'average',
            },
          },
        ],
      },
    });
  });

  it('reuses the inner expression when re-wrapping orderings', function () {
    const ordering = descending(field('rating'));
    const rewritten = Ordering.of(ordering).ascending() as any;

    expect(rewritten).toMatchObject({
      __kind: 'ordering',
      direction: 'ascending',
      expr: {
        __kind: 'expression',
        exprType: 'Field',
        path: 'rating',
      },
    });
    expect(rewritten.expr.__kind).toBe('expression');
  });

  it('supports chaining constant expressions without Promise-like fields', function () {
    const alias = (constant(4) as ConstantExpression).add(1).as('five');

    expect('then' in alias).toBe(false);
    expect(alias).toMatchObject({
      __kind: 'aliasedExpression',
      alias: 'five',
      expr: {
        __kind: 'expression',
        exprType: 'Function',
        name: 'add',
        args: [
          { __kind: 'expression', exprType: 'Constant', value: 4 },
          { __kind: 'expression', exprType: 'Constant', value: 1 },
        ],
      },
    });
  });

  it('serializes subcollection detached pipelines and scalar subqueries', function () {
    const db: any = getFirestore();
    const detached = subcollection('reviews');
    expect(detached.serialize()).toEqual({
      source: { source: 'subcollection', path: 'reviews' },
      stages: [],
    });

    const embedded = db
      .pipeline()
      .collection('restaurants')
      .addFields(
        subcollection('reviews')
          .aggregate(countAll().as('reviewCount'), average('rating').as('avgRating'))
          .toScalarExpression()
          .as('reviewSummary'),
      )
      .serialize();

    expect(embedded.stages[0]).toMatchObject({
      stage: 'addFields',
      options: {
        fields: [
          {
            alias: 'reviewSummary',
            expr: {
              exprType: 'Function',
              name: 'scalar',
              args: [
                {
                  exprType: 'PipelineValue',
                  pipeline: {
                    source: { source: 'subcollection', path: 'reviews' },
                    stages: [
                      {
                        stage: 'aggregate',
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('rejects direct execute of detached subcollection pipelines', async function () {
    await expect(execute(subcollection('reviews'))).rejects.toThrow(
      'This pipeline was created without a database (e.g., as a subcollection pipeline) and cannot be executed directly. It can only be used as part of another pipeline.',
    );
  });

  it('validates subcollection() arguments', function () {
    expect(() => subcollection('')).toThrow(
      'subcollection(*) expected path to be a non-empty string.',
    );
    expect(() => (subcollection as any)(123)).toThrow(
      'subcollection(*) expected a path string or SubcollectionStageOptions object.',
    );
    expect(() => (subcollection as any)(null)).toThrow(
      'subcollection(*) expected a path string or SubcollectionStageOptions object.',
    );
    expect(() => subcollection({ path: '' } as any)).toThrow(
      'subcollection(*) expected path to be a non-empty string.',
    );
  });

  it('accepts subcollection() options form with and without rawOptions', function () {
    expect((subcollection({ path: 'reviews' } as any) as any).serialize()).toEqual({
      source: { source: 'subcollection', path: 'reviews' },
      stages: [],
    });

    expect(
      (
        subcollection({ path: 'reviews', rawOptions: { requestLabel: 'x' } } as any) as any
      ).serialize(),
    ).toEqual({
      source: { source: 'subcollection', path: 'reviews', rawOptions: { requestLabel: 'x' } },
      stages: [],
    });
  });
});
