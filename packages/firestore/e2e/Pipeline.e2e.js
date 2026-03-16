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

const DATABASE_ID = 'firestore-pipeline-test';
const COLLECTION = 'react-native-firebase-testing';

async function expectAsyncError(run, expectedMessage, expectedCode) {
  try {
    await run();
    throw new Error('Expected operation to throw.');
  } catch (error) {
    should(error).be.ok();
    const actualCode = error && error.code;
    const actualMessage = String((error && error.message) || '');
    if (expectedCode) {
      const expectedCodes = Array.isArray(expectedCode) ? expectedCode : [expectedCode];
      expectedCodes.should.containEql(actualCode);
    }
    if (expectedMessage) {
      const expectedMessages = Array.isArray(expectedMessage) ? expectedMessage : [expectedMessage];
      expectedMessages.some(message => actualMessage.includes(message)).should.equal(true);
    }
  }
}

describe('FirestorePipeline', function () {
  describe('Modular API', function () {
    it('serializes source builders and stage ordering', function () {
      const { getFirestore, collection, query, where, orderBy, limit } = firestoreModular;
      const db = getFirestore(DATABASE_ID);
      const collectionName = `${COLLECTION}/${Utils.randString(12, '#aA')}/pipeline-order`;
      const collectionRef = collection(db, collectionName);
      const querySource = query(
        collectionRef,
        where('score', '>=', 10),
        orderBy('score', 'desc'),
        limit(2),
      );

      const pipelineFromCollection = db
        .pipeline()
        .collection(collectionRef)
        .where({ condition: { operator: '>=', fieldPath: 'score', value: 10 } })
        .sort({ ordering: [{ fieldPath: 'score', direction: 'desc' }] })
        .limit({ n: 2 });

      const pipelineFromGroup = db.pipeline().collectionGroup('pipeline-order-sub');
      const pipelineFromDatabase = db.pipeline().database({ rawOptions: { explain: true } });
      const pipelineFromDocuments = db
        .pipeline()
        .documents([`${collectionName}/one`, `${collectionName}/two`]);
      const pipelineFromQuery = db.pipeline().createFrom(querySource);

      should(pipelineFromCollection.serialize().source).eql({
        source: 'collection',
        path: collectionRef.path,
      });

      should(pipelineFromCollection.serialize().stages).eql([
        {
          stage: 'where',
          options: {
            condition: { operator: '>=', fieldPath: 'score', value: 10 },
          },
        },
        {
          stage: 'sort',
          options: {
            orderings: [{ fieldPath: 'score', direction: 'desc' }],
          },
        },
        {
          stage: 'limit',
          options: {
            limit: 2,
          },
        },
      ]);

      should(pipelineFromGroup.serialize().source).eql({
        source: 'collectionGroup',
        collectionId: 'pipeline-order-sub',
      });

      should(pipelineFromDatabase.serialize().source).eql({
        source: 'database',
        rawOptions: { explain: true },
      });

      should(pipelineFromDocuments.serialize().source).eql({
        source: 'documents',
        documents: [`${collectionName}/one`, `${collectionName}/two`],
      });

      should(pipelineFromQuery.serialize().source.source).equal('query');
      should(pipelineFromQuery.serialize().source.path).equal(collectionRef.path);
      should(pipelineFromQuery.serialize().source.queryType).equal('collection');
      should(pipelineFromQuery.serialize().source.filters).have.length(1);
      should(pipelineFromQuery.serialize().source.orders).have.length(1);
      should(pipelineFromQuery.serialize().source.options).eql({ limit: 2 });
    });

    it('executes documents source and parses pipeline results', async function () {
      const { execute } = firestorePipelinesModular;
      const { getFirestore, doc, setDoc } = firestoreModular;

      const db = getFirestore(DATABASE_ID);

      const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;
      await setDoc(doc(db, docPath), {
        score: 42,
        nested: { ok: true },
      });

      const pipeline = db.pipeline().documents([docPath]).select('score', 'nested');
      const snapshot = await execute(pipeline);

      snapshot.results.should.have.length(1);
      should(snapshot.executionTime).be.ok();

      const first = snapshot.results[0];
      should(first.data()).eql({ score: 42, nested: { ok: true } });
      should(first.get('nested.ok')).equal(true);
    });

    it('throws helpful validation errors for invalid source arguments', function () {
      const { getFirestore } = firestoreModular;
      const db = getFirestore(DATABASE_ID);

      (() => db.pipeline().documents([])).should.throw(
        'firebase.firestore().pipeline().documents(*) expected at least one document path or DocumentReference.',
      );

      (() => db.pipeline().collection('')).should.throw(
        'firebase.firestore().pipeline().collection(*) expected a non-empty string.',
      );
    });

    it('throws helpful validation errors for overload misuse and invalid document entries', function () {
      const { getFirestore } = firestoreModular;
      const db = getFirestore(DATABASE_ID);

      (() => db.pipeline().collection({})).should.throw(
        'firebase.firestore().pipeline().collection(*) expected a non-empty string.',
      );

      (() => db.pipeline().collectionGroup({})).should.throw(
        'firebase.firestore().pipeline().collectionGroup(*) expected a non-empty string.',
      );

      (() => db.pipeline().documents(['valid/path', 123])).should.throw(
        'firebase.firestore().pipeline().documents(*) invalid value at index 1. Expected a document path or DocumentReference.',
      );
    });

    it('throws helpful runtime guard errors for union/createFrom/execute input', async function () {
      const { getApp } = modular;
      const { getFirestore, collection, query, where } = firestoreModular;
      const { execute } = firestorePipelinesModular;
      const db = getFirestore(DATABASE_ID);
      const secondaryDb = getFirestore(getApp('secondaryFromNative'), DATABASE_ID);
      const base = db.pipeline().collection(`${COLLECTION}/${Utils.randString(12, '#aA')}/guard`);

      (() => base.union({})).should.throw(
        'firebase.firestore().pipeline().union(*) expected a pipeline created from firestore.pipeline().',
      );

      (() =>
        base.union(
          secondaryDb.pipeline().collection(`${COLLECTION}/${Utils.randString(12, '#aA')}`),
        )).should.throw(
        'firebase.firestore().pipeline().union(*) cannot combine pipelines from different Firestore instances.',
      );

      const secondaryQuery = query(
        collection(secondaryDb, `${COLLECTION}/${Utils.randString(12, '#aA')}/create-from`),
        where('value', '==', 1),
      );

      (() => db.pipeline().createFrom({})).should.throw(
        'firebase.firestore().pipeline().createFrom(*) expected a Query from @react-native-firebase/firestore.',
      );

      (() => db.pipeline().createFrom(secondaryQuery)).should.throw(
        'firebase.firestore().pipeline().createFrom(*) cannot use a Query from a different Firestore instance.',
      );

      await expectAsyncError(
        () => execute('invalid-input'),
        'firebase.firestore().pipeline().execute(*) expected a Pipeline or PipelineExecuteOptions.',
      );

      await expectAsyncError(
        () => execute({ pipeline: {} }),
        'firebase.firestore().pipeline().execute(*) expected options.pipeline to be created from firestore.pipeline().',
      );
    });

    it('throws on circular pipeline serialization and invalid result.get field path argument', async function () {
      const { getFirestore, doc, setDoc } = firestoreModular;
      const { execute } = firestorePipelinesModular;
      const db = getFirestore(DATABASE_ID);

      const selfCycle = db.pipeline().collection(`${COLLECTION}/${Utils.randString(12, '#aA')}`);
      selfCycle._stages.push({ stage: 'union', options: { other: selfCycle } });
      (() => selfCycle.serialize()).should.throw(
        'firebase.firestore().pipeline() cannot union a pipeline with itself.',
      );

      const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;
      await setDoc(doc(db, docPath), { nested: { ok: true } });

      const snapshot = await execute(db.pipeline().documents([docPath]).select('nested'));
      (() => snapshot.results[0].get(123)).should.throw(
        "firebase.firestore().pipeline().execute().result.get(*) 'fieldPath' must be a string, FieldPath, or field().",
      );
    });
  });

  describe('native execution', function () {
    describe('query source', function () {
      it('executes createFrom(query) end-to-end', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc, query, where, orderBy, limit } =
          firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const collectionName = `${COLLECTION}/${Utils.randString(12, '#aA')}/pipeline-query`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'one'), { score: 10, active: true }),
          setDoc(doc(collectionRef, 'two'), { score: 21, active: true }),
          setDoc(doc(collectionRef, 'three'), { score: 5, active: false }),
        ]);

        const queryRef = query(
          collectionRef,
          where('active', '==', true),
          orderBy('score', 'desc'),
          limit(2),
        );
        const snapshot = await execute(db.pipeline().createFrom(queryRef));

        snapshot.results.should.have.length(2);
        snapshot.results[0].id.should.equal('two');
        snapshot.results[0].data().score.should.equal(21);
        snapshot.results[1].id.should.equal('one');
        snapshot.results[1].data().score.should.equal(10);
      });
    });

    describe('functions and expressions', function () {
      it('executes method-style expressions', async function () {
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const { and, execute, field, Ordering } = firestorePipelinesModular;
        const db = getFirestore(DATABASE_ID);
        const collectionName = `${COLLECTION}/${Utils.randString(12, '#aA')}/pipeline-expression`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'a'), { title: 'A', rating: 2, genre: 'Fantasy' }),
          setDoc(doc(collectionRef, 'b'), { title: 'B', rating: 5, genre: 'Fantasy' }),
          setDoc(doc(collectionRef, 'c'), { title: 'C', rating: 8, genre: 'Fantasy' }),
          setDoc(doc(collectionRef, 'd'), { title: 'D', rating: 9, genre: 'Sci-Fi' }),
        ]);

        const f = path => field(path);
        const pipeline = db
          .pipeline()
          .collection(collectionRef)
          .where(and(f('genre').equal('Fantasy'), f('rating').greaterThan(3)))
          .select(
            f('title').as('title'),
            f('rating').add(1).as('boostedRating'),
            f('genre').equal('Fantasy').as('isFantasy'),
          )
          .sort(Ordering.of(f('rating')).descending());

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(2);
        snapshot.results[0].data().should.eql({
          title: 'C',
          boostedRating: 9,
          isFantasy: true,
        });
        snapshot.results[1].data().should.eql({
          title: 'B',
          boostedRating: 6,
          isFantasy: true,
        });
      });
    });

    describe('stages (input + transformation)', function () {
      it('executes addFields/removeFields/select against documents source', async function () {
        const { getFirestore, doc, setDoc } = firestoreModular;
        const { execute, field } = firestorePipelinesModular;
        const db = getFirestore(DATABASE_ID);

        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;
        await setDoc(doc(db, docPath), {
          title: 'Book',
          keep: 7,
          removeMe: true,
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .addFields(field('keep').add(3).as('keepPlusThree'))
            .removeFields('removeMe')
            .select('title', 'keepPlusThree'),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().should.eql({
          title: 'Book',
          keepPlusThree: 10,
        });
      });

      it('executes replaceWith and sort/offset/limit chain', async function () {
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const { execute, field, Ordering } = firestorePipelinesModular;
        const db = getFirestore(DATABASE_ID);
        const collectionName = `${COLLECTION}/${Utils.randString(12, '#aA')}/pipeline-transform`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'one'), { score: 1, payload: { label: 'A', rank: 1 } }),
          setDoc(doc(collectionRef, 'two'), { score: 2, payload: { label: 'B', rank: 2 } }),
          setDoc(doc(collectionRef, 'three'), { score: 3, payload: { label: 'C', rank: 3 } }),
        ]);

        const listSnapshot = await execute(
          db
            .pipeline()
            .collection(collectionRef)
            .sort(Ordering.of(field('score')).descending())
            .offset(1)
            .limit(1)
            .select('score'),
        );

        listSnapshot.results.should.have.length(1);
        listSnapshot.results[0].data().score.should.equal(2);

        const replaceSnapshot = await execute(
          db
            .pipeline()
            .documents([`${collectionRef.path}/three`])
            .replaceWith('payload'),
        );

        replaceSnapshot.results.should.have.length(1);
        replaceSnapshot.results[0].data().should.eql({ label: 'C', rank: 3 });
      });

      it('supports execute(options) with indexMode and rawOptions payload', async function () {
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const { execute, field } = firestorePipelinesModular;
        const db = getFirestore(DATABASE_ID);
        const collectionName = `${COLLECTION}/${Utils.randString(12, '#aA')}/execute-options`;
        const collectionRef = collection(db, collectionName);

        await Promise.all([
          setDoc(doc(collectionRef, 'one'), { score: 7, category: 'A' }),
          setDoc(doc(collectionRef, 'two'), { score: 5, category: 'A' }),
        ]);

        const snapshot = await execute({
          pipeline: db
            .pipeline()
            .collection(collectionRef)
            .where(field('category').equal('A'))
            .sort(field('score').descending())
            .select('score'),
          indexMode: 'recommended',
          rawOptions: { requestLabel: 'e2e-execute-options' },
        });

        snapshot.results.should.have.length(2);
        snapshot.results[0].data().score.should.equal(7);
        snapshot.results[1].data().score.should.equal(5);
      });
    });
  });

  describe('cross-platform coverage', function () {
    describe('input stages', function () {
      it('supports collectionGroup source with ordering', async function () {
        const { execute, field } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const rootA = `${COLLECTION}/${Utils.randString(12, '#aA')}`;
        const rootB = `${COLLECTION}/${Utils.randString(12, '#aA')}`;
        const runId = Utils.randString(12, '#aA');

        await Promise.all([
          setDoc(doc(db, `${rootA}/departments/eng`), {
            city: 'SF',
            employees: 120,
            runId,
          }),
          setDoc(doc(db, `${rootB}/departments/sales`), {
            city: 'NY',
            employees: 85,
            runId,
          }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collectionGroup('departments')
            .where(field('runId').equal(runId))
            .where(field('employees').greaterThan(0))
            .sort(field('employees').ascending())
            .select('city', 'employees'),
        );

        snapshot.results.should.have.length(2);
        snapshot.results[0].data().employees.should.equal(85);
        snapshot.results[1].data().employees.should.equal(120);
      });

      it('supports documents source from DocumentReference values', async function () {
        const { execute, field } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/docs-source`);
        const refA = doc(coll, 'a');
        const refB = doc(coll, 'b');

        await Promise.all([
          setDoc(refA, { name: 'Alpha', score: 3 }),
          setDoc(refB, { name: 'Beta', score: 9 }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .documents([refA, refB])
            .sort(field('score').descending())
            .select('name', 'score'),
        );

        snapshot.results.should.have.length(2);
        snapshot.results[0].data().name.should.equal('Beta');
        snapshot.results[1].data().name.should.equal('Alpha');
      });

      it('supports complex pagination-style query with and/or tie-break', async function () {
        const { execute, field, and, or } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/paging`);

        await Promise.all([
          setDoc(doc(coll, 'a'), { name: 'A', population: 100 }),
          setDoc(doc(coll, 'b'), { name: 'B', population: 100 }),
          setDoc(doc(coll, 'c'), { name: 'C', population: 90 }),
          setDoc(doc(coll, 'd'), { name: 'D', population: 80 }),
        ]);

        const pageSize = 2;
        const pipeline = db
          .pipeline()
          .collection(coll)
          .select('name', 'population')
          .sort(field('population').descending(), field('name').ascending());

        const firstPage = await execute(pipeline.limit(pageSize));
        firstPage.results.should.have.length(2);
        firstPage.results[0].data().name.should.equal('A');
        firstPage.results[1].data().name.should.equal('B');

        const last = firstPage.results[firstPage.results.length - 1];
        const secondPage = await execute(
          pipeline
            .where(
              or(
                and(
                  field('population').equal(last.get('population')),
                  field('name').greaterThan(last.get('name')),
                ),
                field('population').lessThan(last.get('population')),
              ),
            )
            .limit(pageSize),
        );

        secondPage.results.should.have.length(2);
        secondPage.results[0].data().name.should.equal('C');
        secondPage.results[1].data().name.should.equal('D');
      });
    });

    describe('stages and transforms', function () {
      it('supports grouped aggregate + post-aggregate where (having style)', async function () {
        const { execute, field, countAll, sum } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/agg`);

        await Promise.all([
          setDoc(doc(coll, 'ca1'), { country: 'US', state: 'CA', population: 70 }),
          setDoc(doc(coll, 'ca2'), { country: 'US', state: 'CA', population: 80 }),
          setDoc(doc(coll, 'ny1'), { country: 'US', state: 'NY', population: 40 }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .aggregate({
              accumulators: [countAll().as('cities'), sum('population').as('totalPopulation')],
              groups: ['country', 'state'],
            })
            .where(field('totalPopulation').greaterThan(100))
            .sort(field('totalPopulation').descending()),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().state.should.equal('CA');
        snapshot.results[0].data().totalPopulation.should.equal(150);
        snapshot.results[0].data().cities.should.equal(2);
      });

      it('supports distinct with expression alias', async function () {
        const { execute, field } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/distinct`);

        await Promise.all([
          setDoc(doc(coll, 'one'), { author: 'ALICE', genre: 'Fantasy' }),
          setDoc(doc(coll, 'two'), { author: 'alice', genre: 'Fantasy' }),
          setDoc(doc(coll, 'three'), { author: 'Bob', genre: 'Sci-Fi' }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .distinct(field('author').toLower().as('authorNorm'), field('genre')),
        );

        snapshot.results.should.have.length(2);
      });

      it('supports union stage across two pipelines', async function () {
        const { execute, field } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const base = `${COLLECTION}/${Utils.randString(12, '#aA')}/union`;
        const sf = collection(db, `${base}/SF/restaurants`);
        const ny = collection(db, `${base}/NY/restaurants`);

        await Promise.all([
          setDoc(doc(sf, 's1'), { type: 'Chinese', rating: 4.8 }),
          setDoc(doc(sf, 's2'), { type: 'Italian', rating: 4.9 }),
          setDoc(doc(ny, 'n1'), { type: 'Italian', rating: 4.7 }),
          setDoc(doc(ny, 'n2'), { type: 'Italian', rating: 3.7 }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(sf)
            .where(field('type').equal('Chinese'))
            .union(db.pipeline().collection(ny).where(field('type').equal('Italian')))
            .where(field('rating').greaterThanOrEqual(4.5))
            .sort(field('__name__').descending())
            .select('type', 'rating'),
        );

        snapshot.results.should.have.length(2);
        snapshot.results[0].data().rating.should.be.greaterThanOrEqual(4.5);
        snapshot.results[1].data().rating.should.be.greaterThanOrEqual(4.5);
      });

      it('supports unnest with index field', async function () {
        const { execute, field } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/unnest`);

        await Promise.all([
          setDoc(doc(coll, 'u1'), { name: 'A', scores: [5, 7] }),
          setDoc(doc(coll, 'u2'), { name: 'B', scores: [3] }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .unnest(field('scores').as('score'), 'attempt')
            .sort(field('name').ascending(), field('attempt').ascending())
            .select('name', 'score', 'attempt'),
        );

        snapshot.results.should.have.length(3);
        snapshot.results[0].data().attempt.should.equal(0);
        snapshot.results[1].data().attempt.should.equal(1);
        snapshot.results[2].data().attempt.should.equal(0);
      });

      it('rejects invalid native stage options with clear firestore errors', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/native-invalid-stage-options`,
        );
        await setDoc(doc(coll, 'base'), { value: 1 });

        await expectAsyncError(
          () => execute(db.pipeline().collection(coll).select()),
          'pipelineExecute() expected stage.options.selections to contain at least one value.',
          ['firestore/invalid-argument', 'firestore/unknown'],
        );

        await expectAsyncError(
          () => execute(db.pipeline().collection(coll).sort()),
          'pipelineExecute() expected stage.options.orderings to contain at least one value.',
          ['firestore/invalid-argument', 'firestore/unknown'],
        );

        await expectAsyncError(
          () => execute(db.pipeline().collection(coll).aggregate()),
          'pipelineExecute() expected stage.options.accumulators to contain at least one value.',
          ['firestore/invalid-argument', 'firestore/unknown'],
        );

        await expectAsyncError(
          () => execute(db.pipeline().collection(coll).distinct()),
          'pipelineExecute() expected stage.options.groups to contain at least one value.',
          ['firestore/invalid-argument', 'firestore/unknown'],
        );

        await expectAsyncError(
          () => execute(db.pipeline().collection(coll).sample({})),
          'pipelineExecute() expected sample stage to include documents or percentage.',
          ['firestore/invalid-argument', 'firestore/unknown'],
        );
      });

      it('rejects malformed where and malformed union payloads at native validation boundary', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/native-where-union`,
        );

        await setDoc(doc(coll, 'base'), { tag: 'a', value: 1 });

        await expectAsyncError(
          () =>
            execute(
              db
                .pipeline()
                .collection(coll)
                .where({ condition: { operator: 'IN', fieldPath: 'tag', value: 'not-an-array' } }),
            ),
          'invalid argument',
          ['firestore/invalid-argument', 'firestore/unknown'],
        );

        const badUnion = db.pipeline().collection(coll);
        badUnion._stages.push({ stage: 'union', options: { other: {} } });
        await expectAsyncError(
          () => execute(badUnion),
          [
            'pipelineExecute() expected stage.options.other to be a serialized pipeline object.',
            'pipelineExecute() expected pipeline.source to be an object.',
          ],
          ['firestore/invalid-argument', 'firestore/unknown'],
        );
      });
    });

    describe('function-heavy expressions', function () {
      it('supports complex composed scalar/boolean expressions', async function () {
        const { execute, field, and } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/expressions`);

        await setDoc(doc(coll, 'book1'), {
          title: 'The RN Firebase Guide',
          rating: 5,
          price: 8,
          sold: 12,
          tags: ['firebase', 'mobile'],
          genre: ['Fantasy', 'Adventure'],
        });

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .select(
              field('rating').greaterThan(4).as('gt4'),
              field('price').lessThan(10).as('cheap'),
              and(field('rating').greaterThan(4), field('price').lessThan(10)).as('recommended'),
              field('title').startsWith('The').as('startsWithThe'),
              field('genre').arrayContains('Fantasy').as('hasFantasy'),
              field('title').charLength().as('titleLength'),
              field('price').multiply(field('sold')).round().as('revenueRounded'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.gt4.should.equal(true);
        data.cheap.should.equal(true);
        data.recommended.should.equal(true);
        data.startsWithThe.should.equal(true);
        data.hasFantasy.should.equal(true);
        data.titleLength.should.be.greaterThan(0);
        data.revenueRounded.should.equal(96);
      });
    });
  });
});
