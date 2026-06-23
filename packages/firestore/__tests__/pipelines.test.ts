import { describe, expect, it, jest } from '@jest/globals';
import { firebase } from '../lib';
import {
  arrayFilter,
  arrayFirst,
  arrayFirstN,
  arrayIndexOf,
  arrayGet,
  arrayLastIndexOf,
  arrayMaximum,
  arrayMaximumN,
  arrayMinimumN,
  arrayTransform,
  and,
  coalesce,
  conditional,
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
  round,
  stringRepeat,
  substring,
  timestampAdd,
  timestampSubtract,
  trunc,
  variable,
} from '../lib/pipelines';
import '../lib/pipelines';
import { ConstantExpression, FunctionExpression } from '../lib/pipelines/expressions';
import { getIOSUnsupportedPipelineFunctions } from '../lib/pipelines/pipeline_support';

describe('Firestore pipelines runtime', function () {
  it('installs pipeline() and serializes source builders', function () {
    const db: any = firebase.firestore();
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
    const db: any = firebase.firestore();

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
    const db: any = firebase.firestore();
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
    const db: any = firebase.firestore();
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
    const db: any = firebase.firestore();
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
    const db: any = firebase.firestore();
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
    const db: any = firebase.firestore();
    const serialized = db
      .pipeline()
      .collection('firestore')
      .select(
        ifNull(field('displayName'), constant('Anonymous')).as('displayName'),
        ifNull('displayName', field('fullName')).as('stringFieldIfNull'),
        field('displayName')
          .ifNull(field('fullName'))
          .as('fluentIfNull'),
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
    const db: any = firebase.firestore();
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
    const db: any = firebase.firestore();
    const serialized = db
      .pipeline()
      .collection('firestore')
      .select(
        coalesce(field('preferredName'), field('fullName'), constant('Anonymous')).as('displayName'),
        coalesce('preferredName', field('fullName'), constant('Anonymous')).as('stringFieldCoalesce'),
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
    const db: any = firebase.firestore();
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
    const db: any = firebase.firestore();
    const secondaryDb: any = firebase.app('secondaryFromNative').firestore();
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
    const db: any = firebase.firestore();
    const secondaryDb: any = firebase.app('secondaryFromNative').firestore();
    const secondaryQuery = secondaryDb.collection('firestore').where('value', '==', 1);

    expect(() => db.pipeline().createFrom({} as any)).toThrow(
      'firebase.firestore().pipeline().createFrom(*) expected a Query from @react-native-firebase/firestore.',
    );

    expect(() => db.pipeline().createFrom(secondaryQuery)).toThrow(
      'firebase.firestore().pipeline().createFrom(*) cannot use a Query from a different Firestore instance.',
    );
  });

  it('enforces source reference affinity for collection() and documents()', function () {
    const db: any = firebase.firestore();
    const secondaryDb: any = firebase.app('secondaryFromNative').firestore();

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
    const db: any = firebase.firestore();
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
    const db: any = firebase.firestore();
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

  it('supports method-style expression chaining and ordering helper serialization', function () {
    const db: any = firebase.firestore();

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

  it('detects unsupported iOS runtime functions from serialized pipelines', function () {
    const db: any = firebase.firestore();
    const serialized = db
      .pipeline()
      .documents(['firestore/a'])
      .select(
        arrayFirst(field('items')).as('firstArrayItem'),
        arrayFirstN(field('items'), 2).as('firstArrayItems'),
        field('items').arrayFirst().as('fluentFirstArrayItem'),
        field('items').arrayFirstN(2).as('fluentFirstArrayItems'),
        arrayGet(field('items'), 0).as('firstItem'),
        conditional(
          field('value').greaterThan(0),
          constant('positive'),
          constant('non-positive'),
        ).as('bucket'),
        switchOn(
          field('value').greaterThan(0),
          constant('positive'),
          constant('non-positive'),
        ).as('switchBucket'),
        round(field('score'), 2).as('roundedScore'),
        stringRepeat(field('separator'), 3).as('divider'),
        substring(field('label'), 0, 4).as('labelPrefix'),
        timestampAdd(field('eventTime'), 'day', 1).as('nextDay'),
        timestampSubtract(field('eventTime'), 'hour', 1).as('prevHour'),
        trunc(field('score'), 2).as('truncatedScore'),
      )
      .serialize();

    expect(getIOSUnsupportedPipelineFunctions(serialized)).toEqual([
      'arrayGet',
      'conditional',
      'round',
      'stringRepeat',
      'substring',
      'switchOn',
      'timestampAdd',
      'timestampSubtract',
      'trunc',
    ]);
  });
});
