import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { firebase } from '../lib';
import { and, execute, field, greaterThan, Ordering } from '../lib/pipelines';
import '../lib/pipelines';

describe('Firestore pipelines runtime', function () {
  beforeAll(function () {
    // @ts-ignore test
    globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
  });

  afterAll(function () {
    // @ts-ignore test
    globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
  });

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

  it('validates execute input and enforces native execute option guards', async function () {
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
        'pipelineExecute() does not support options.indexMode on Android and iOS because native Firestore pipeline execute options are currently unstable or unavailable.',
      );

      await expect(
        execute({
          pipeline,
          rawOptions: { requestLabel: 'unit-test' },
        }),
      ).rejects.toThrow(
        'pipelineExecute() does not support options.rawOptions on Android and iOS because native Firestore pipeline execute options are currently unstable or unavailable.',
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
    const f = (path: string): any => field(path as any);

    const pipeline = db
      .pipeline()
      .collection('firestore')
      .where(and(f('rating').greaterThan(4), f('genre').equal('Fantasy')))
      .select(
        f('title').as('title'),
        f('rating').add(1).as('boostedRating'),
        f('genre').equal('Fantasy').as('isFantasy'),
      )
      .sort((Ordering.of(f('rating')) as any).descending())
      .aggregate(f('rating').average().as('averageRating'));

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
});
