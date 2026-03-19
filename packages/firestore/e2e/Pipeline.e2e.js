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

const DATABASE_ID = 'pipelines-e2e';
const COLLECTION = 'pipeline-collection';
const COLLECTION_GROUP = 'pipeline-collection-group';
const PIPELINE_TEST_BASE64 = 'eyJoZWxsbyI6IndvcmxkIn0=';

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

async function expectIOSUnsupportedFunctions(run, functionNames) {
  return expectAsyncError(
    run,
    `pipelineExecute() does not support these functions on iOS yet: ${[...functionNames].sort().join(', ')}.`,
  );
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
      should(snapshot.executionTime).have.property('toMillis').which.is.a.Function();
      should(snapshot.executionTime.toMillis()).be.a.Number();
      should(snapshot.executionTime.toMillis()).be.greaterThan(0);

      const first = snapshot.results[0];
      should(first.data()).eql({ score: 42, nested: { ok: true } });
      should(first.get('nested.ok')).equal(true);
    });

    it('preserves typed Firestore values in pipeline result data', async function () {
      const { execute } = firestorePipelinesModular;
      const { getFirestore, doc, setDoc, Timestamp, Bytes, vector } = firestoreModular;

      const db = getFirestore(DATABASE_ID);
      const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;
      const linkedRef = doc(db, `${COLLECTION}/${Utils.randString(12, '#aA')}`);
      const createdAt = new Timestamp(1700000000, 123000000);
      const updatedAt = new Timestamp(1700000001, 456000000);

      await Promise.all([
        setDoc(linkedRef, { label: 'linked-doc' }),
        setDoc(doc(db, docPath), {
          createdAt,
          linkedRef,
          payloadBytes: Bytes.fromBase64String(PIPELINE_TEST_BASE64),
          embedding: vector([0.12, 0.34, 0.56]),
          nested: {
            updatedAt,
            linkedRef,
            payloadBytes: Bytes.fromBase64String(PIPELINE_TEST_BASE64),
            embedding: vector([9, 8, 7]),
          },
        }),
      ]);

      const snapshot = await execute(
        db
          .pipeline()
          .documents([docPath])
          .select('createdAt', 'linkedRef', 'payloadBytes', 'embedding', 'nested'),
      );

      snapshot.results.should.have.length(1);

      const first = snapshot.results[0];
      const data = first.data();

      data.createdAt.constructor.name.should.equal('Timestamp');
      data.createdAt.seconds.should.equal(createdAt.seconds);
      data.createdAt.nanoseconds.should.equal(createdAt.nanoseconds);
      data.linkedRef.path.should.equal(linkedRef.path);
      data.payloadBytes.toBase64().should.equal(PIPELINE_TEST_BASE64);
      data.embedding.toArray().should.eql([0.12, 0.34, 0.56]);
      data.nested.updatedAt.constructor.name.should.equal('Timestamp');
      data.nested.updatedAt.seconds.should.equal(updatedAt.seconds);
      data.nested.updatedAt.nanoseconds.should.equal(updatedAt.nanoseconds);
      data.nested.linkedRef.path.should.equal(linkedRef.path);
      data.nested.payloadBytes.toBase64().should.equal(PIPELINE_TEST_BASE64);
      data.nested.embedding.toArray().should.eql([9, 8, 7]);

      first.get('createdAt').constructor.name.should.equal('Timestamp');
      first.get('createdAt').seconds.should.equal(createdAt.seconds);
      first.get('createdAt').nanoseconds.should.equal(createdAt.nanoseconds);
      first.get('linkedRef').path.should.equal(linkedRef.path);
      first.get('payloadBytes').toBase64().should.equal(PIPELINE_TEST_BASE64);
      first.get('embedding').toArray().should.eql([0.12, 0.34, 0.56]);
      first.get('nested.updatedAt').constructor.name.should.equal('Timestamp');
      first.get('nested.updatedAt').seconds.should.equal(updatedAt.seconds);
      first.get('nested.updatedAt').nanoseconds.should.equal(updatedAt.nanoseconds);
      first.get('nested.linkedRef').path.should.equal(linkedRef.path);
      first.get('nested.payloadBytes').toBase64().should.equal(PIPELINE_TEST_BASE64);
      first.get('nested.embedding').toArray().should.eql([9, 8, 7]);
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

        const executeOptions = {
          pipeline: db
            .pipeline()
            .collection(collectionRef)
            .where(field('category').equal('A'))
            .sort(field('score').descending())
            .select('score'),
          indexMode: 'recommended',
          rawOptions: { requestLabel: 'e2e-execute-options' },
        };

        if (Platform.ios || Platform.android) {
          await expectAsyncError(
            () => execute(executeOptions),
            [
              'pipelineExecute() does not support options.indexMode on Android and iOS because native Firestore pipeline execute options are currently unstable or unavailable.',
              'pipelineExecute() does not support options.rawOptions on Android and iOS because native Firestore pipeline execute options are currently unstable or unavailable.',
            ],
          );
          return;
        }

        const snapshot = await execute(executeOptions);
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
          setDoc(doc(db, `${rootA}/${COLLECTION_GROUP}/eng`), {
            city: 'SF',
            employees: 120,
            runId,
          }),
          setDoc(doc(db, `${rootB}/${COLLECTION_GROUP}/sales`), {
            city: 'NY',
            employees: 85,
            runId,
          }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collectionGroup(COLLECTION_GROUP)
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

  describe('operator and function coverage', function () {
    describe('comparison and logical operators', function () {
      it('filters with greaterThan, lessThanOrEqual, notEqual, exists, not/isAbsent, equalAny, notEqualAny', async function () {
        const {
          execute,
          field,
          and,
          greaterThan,
          lessThanOrEqual,
          notEqual,
          exists,
          isAbsent,
          not,
          equalAny,
          notEqualAny,
        } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/comparison-ops`);

        // doc 'a': price=20 (>10 ✓), stock=50 (<=100 ✓), active ✓, sku present ✓, EU in list ✓, tag not spam ✓ → PASS
        // doc 'b': price=5 (>10 ✗), no sku ✗, tag=spam ✗ → FAIL
        // doc 'c': price=30 (>10 ✓), stock=80 ✓, active ✓, sku present ✓, APAC not in [EU,US] ✗ → FAIL
        await Promise.all([
          setDoc(doc(coll, 'a'), {
            price: 20,
            stock: 50,
            status: 'active',
            sku: 'SKU001',
            region: 'EU',
            tag: 'news',
          }),
          setDoc(doc(coll, 'b'), {
            price: 5,
            stock: 150,
            status: 'discontinued',
            region: 'US',
            tag: 'spam',
          }),
          setDoc(doc(coll, 'c'), {
            price: 30,
            stock: 80,
            status: 'active',
            sku: 'SKU003',
            region: 'APAC',
            tag: 'info',
          }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .where(
              and(
                greaterThan(field('price'), 10),
                lessThanOrEqual(field('stock'), 100),
                notEqual(field('status'), 'discontinued'),
                exists(field('sku')),
                not(isAbsent(field('region'))),
                equalAny(field('region'), ['EU', 'US']),
                notEqualAny(field('tag'), ['spam', 'bot']),
              ),
            )
            .select('price', 'stock', 'sku'),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().sku.should.equal('SKU001');
      });

      it('evaluates conditional, isType, logicalMaximum, logicalMinimum', async function () {
        const { execute, field, constant, conditional, isType, logicalMaximum, logicalMinimum } =
          firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          stock: 5,
          bidA: 100,
          bidB: 150,
          askA: 200,
          askB: 175,
          value: 'hello',
        });

        const pipeline = db
          .pipeline()
          .documents([docPath])
          .select(
            conditional(
              field('stock').greaterThan(0),
              constant('in-stock'),
              constant('out-of-stock'),
            ).as('availability'),
            isType(field('value'), 'string').as('isString'),
            logicalMaximum(field('bidA'), field('bidB')).as('topBid'),
            logicalMinimum(field('askA'), field('askB')).as('bottomAsk'),
          );

        if (Platform.ios) {
          await expectIOSUnsupportedFunctions(() => execute(pipeline), ['isType']);
          return;
        }

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.availability.should.equal('in-stock');
        data.isString.should.equal(true);
        data.topBid.should.equal(150);
        data.bottomAsk.should.equal(175);
      });

      it('evaluates xor in a where clause', async function () {
        const { execute, field, xor } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/xor-ops`);

        // xor: exactly one of isPublic/isVerified is true
        await Promise.all([
          setDoc(doc(coll, 'a'), { isPublic: true, isVerified: false }),
          setDoc(doc(coll, 'b'), { isPublic: true, isVerified: true }),
          setDoc(doc(coll, 'c'), { isPublic: false, isVerified: true }),
          setDoc(doc(coll, 'd'), { isPublic: false, isVerified: false }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .where(xor(field('isPublic').equal(true), field('isVerified').equal(true)))
            .sort(field('__name__').ascending())
            .select('isPublic', 'isVerified'),
        );

        snapshot.results.should.have.length(2);
        snapshot.results[0].data().isPublic.should.equal(true);
        snapshot.results[0].data().isVerified.should.equal(false);
        snapshot.results[1].data().isPublic.should.equal(false);
        snapshot.results[1].data().isVerified.should.equal(true);
      });
    });

    describe('arithmetic operators', function () {
      it('evaluates add, subtract, multiply, divide, mod, pow, abs, ceil, floor, round', async function () {
        const {
          execute,
          field,
          add,
          subtract,
          multiply,
          divide,
          mod,
          pow,
          abs,
          ceil,
          floor,
          round,
        } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          subtotal: 100,
          tax: 8,
          msrp: 50,
          salePrice: 35,
          price: 10,
          qty: 3,
          revenue: 500,
          units: 4,
          id: 27,
          rating: 4,
          rawScore: 7.8,
          balance: -42,
          score: 3.567,
        });

        const pipeline = db
          .pipeline()
          .documents([docPath])
          .select(
            add(field('subtotal'), field('tax')).as('total'),
            subtract(field('msrp'), field('salePrice')).as('savings'),
            multiply(field('price'), field('qty')).as('lineTotal'),
            divide(field('revenue'), field('units')).as('revenuePerUnit'),
            mod(field('id'), 10).as('shard'),
            pow(field('rating'), 2).as('squaredRating'),
            abs(field('balance')).as('absBalance'),
            ceil(field('rawScore')).as('ceiledScore'),
            floor(field('rawScore')).as('flooredScore'),
            round(field('score'), 2).as('roundedScore'),
          );

        if (Platform.ios) {
          await expectIOSUnsupportedFunctions(() => execute(pipeline), ['ceil', 'floor', 'round']);
          return;
        }

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.total.should.equal(108);
        data.savings.should.equal(15);
        data.lineTotal.should.equal(30);
        data.revenuePerUnit.should.equal(125);
        data.shard.should.equal(7);
        data.squaredRating.should.equal(16);
        data.absBalance.should.equal(42);
        data.ceiledScore.should.equal(8);
        data.flooredScore.should.equal(7);
        should(data.roundedScore).be.approximately(3.57, 0.001);
      });

      it('evaluates sqrt, trunc, exp, ln, log, log10, rand', async function () {
        const { execute, field, sqrt, trunc, exp, ln, log, log10, rand } =
          firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          area: 4,
          value: 3.789,
          x: 0,
          y: 1,
          logBase: 100,
        });

        const pipeline = db
          .pipeline()
          .documents([docPath])
          .select(
            sqrt(field('area')).as('side'),
            trunc(field('value'), 2).as('truncValue'),
            exp(field('x')).as('expX'),
            ln(field('y')).as('lnY'),
            log(field('logBase'), 10).as('logVal'),
            log10(field('logBase')).as('log10Val'),
            rand().as('randomValue'),
          );

        if (Platform.ios) {
          await expectIOSUnsupportedFunctions(
            () => execute(pipeline),
            ['log10', 'rand', 'sqrt', 'trunc'],
          );
          return;
        }

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.side.should.equal(2);
        should(data.truncValue).be.approximately(3.78, 0.001);
        data.expX.should.equal(1);
        data.lnY.should.equal(0);
        should(data.logVal).be.approximately(2, 0.0001);
        should(data.log10Val).be.approximately(2, 0.0001);
        data.randomValue.should.be.a.Number();
        data.randomValue.should.be.greaterThanOrEqual(0);
        should(data.randomValue).be.lessThan(1);
      });
    });

    describe('string operators', function () {
      it('filters with startsWith, endsWith, stringContains, like, regexContains', async function () {
        const { execute, field, and, startsWith, endsWith, stringContains, like, regexContains } =
          firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/string-predicates`,
        );

        await Promise.all([
          setDoc(doc(coll, 'a'), {
            username: 'admin_user',
            email: 'test@example.com',
            bio: 'senior developer',
            role: 'engineer',
            phone: '+1-555-0100',
          }),
          setDoc(doc(coll, 'b'), {
            username: 'guest',
            email: 'other@gmail.com',
            bio: 'product manager',
            role: 'manager',
            phone: '555-0200',
          }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .where(
              and(
                startsWith(field('username'), 'admin'),
                endsWith(field('email'), '.com'),
                stringContains(field('bio'), 'developer'),
                like(field('role'), 'eng%'),
                regexContains(field('phone'), '^\\+1'),
              ),
            )
            .select('username'),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().username.should.equal('admin_user');
      });

      it('transforms with toUpper, toLower, trim, ltrim, rtrim, substring, length, byteLength, charLength', async function () {
        const {
          execute,
          field,
          toUpper,
          toLower,
          trim,
          ltrim,
          rtrim,
          substring,
          length,
          byteLength,
          charLength,
        } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          name: 'Alice',
          rawText: '  hello  ',
          bio: 'React Native developer',
        });

        const pipeline = db
          .pipeline()
          .documents([docPath])
          .select(
            toUpper(field('name')).as('upperName'),
            toLower(field('name')).as('lowerName'),
            trim(field('rawText')).as('trimmed'),
            ltrim(field('rawText')).as('ltrimmed'),
            rtrim(field('rawText')).as('rtrimmed'),
            substring(field('bio'), 0, 12).as('shortBio'),
            length(field('name')).as('nameLength'),
            byteLength(field('name')).as('byteLen'),
            charLength(field('name')).as('charLen'),
          );

        if (Platform.ios) {
          await expectIOSUnsupportedFunctions(
            () => execute(pipeline),
            ['length', 'ltrim', 'rtrim', 'substring'],
          );
          return;
        }

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.upperName.should.equal('ALICE');
        data.lowerName.should.equal('alice');
        data.trimmed.should.equal('hello');
        data.ltrimmed.should.equal('hello  ');
        data.rtrimmed.should.equal('  hello');
        data.shortBio.should.equal('React Native');
        data.nameLength.should.equal(5);
        data.byteLen.should.equal(5);
        data.charLen.should.equal(5);
      });

      it('transforms with stringConcat, concat, stringIndexOf, stringRepeat, stringReplaceAll, stringReplaceOne, split, reverse, stringReverse', async function () {
        const {
          execute,
          field,
          stringConcat,
          concat,
          stringIndexOf,
          stringRepeat,
          stringReplaceAll,
          stringReplaceOne,
          reverse,
          stringReverse,
          split,
        } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          firstName: 'John',
          lastName: 'Doe',
          a: 'foo',
          b: 'bar',
          c: 'baz',
          email: 'john@example.com',
          sep: '-',
          text: 'foo bar foo',
          code: 'abc',
          csvField: 'a,b,c',
          token: 'abc123',
        });

        const pipeline = db
          .pipeline()
          .documents([docPath])
          .select(
            stringConcat(field('firstName'), ' ', field('lastName')).as('fullName'),
            concat(field('a'), field('b'), field('c')).as('concatResult'),
            stringIndexOf(field('email'), '@').as('atIndex'),
            stringRepeat(field('sep'), 3).as('tripled'),
            stringReplaceAll(field('text'), 'foo', 'bar').as('replaced'),
            stringReplaceOne(field('text'), 'foo', 'bar').as('replacedOnce'),
            split(field('csvField'), ',').as('parts'),
            reverse(field('code')).as('reversedCode'),
            stringReverse(field('token')).as('reversedToken'),
          );

        if (Platform.ios) {
          await expectIOSUnsupportedFunctions(
            () => execute(pipeline),
            [
              'concat',
              'split',
              'stringIndexOf',
              'stringRepeat',
              'stringReplaceAll',
              'stringReplaceOne',
            ],
          );
          return;
        }

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.fullName.should.equal('John Doe');
        data.concatResult.should.equal('foobarbaz');
        data.atIndex.should.equal(4);
        data.tripled.should.equal('---');
        data.replaced.should.equal('bar bar bar');
        data.replacedOnce.should.equal('bar bar foo');
        data.parts.should.eql(['a', 'b', 'c']);
        data.reversedCode.should.equal('cba');
        data.reversedToken.should.equal('321cba');
      });

      it('evaluates regexFind, regexFindAll, regexMatch', async function () {
        const { execute, field, regexFind, regexFindAll, regexMatch } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          text: 'Order 123 and 456',
          code: 'ABC',
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              regexFind(field('text'), '\\d+').as('firstNumber'),
              regexFindAll(field('text'), '\\d+').as('allNumbers'),
              regexMatch(field('code'), '^[A-Z]{3}$').as('isValidCode'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.firstNumber.should.equal('123');
        data.allNumbers.should.eql(['123', '456']);
        data.isValidCode.should.equal(true);
      });
    });

    describe('map operators', function () {
      it('evaluates map, mapGet, mapKeys, mapValues, mapEntries', async function () {
        const { execute, field, constant, map, mapGet, mapKeys, mapValues, mapEntries } =
          firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          settings: { theme: 'dark', language: 'en' },
          metadata: { x: 1, y: 2 },
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              map({ type: constant('doc'), version: constant(1) }).as('meta'),
              mapGet(field('settings'), 'theme').as('theme'),
              mapKeys(field('metadata')).as('metaKeys'),
              mapValues(field('metadata')).as('metaValues'),
              mapEntries(field('settings')).as('settingsEntries'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.meta.should.eql({ type: 'doc', version: 1 });
        data.theme.should.equal('dark');
        data.metaKeys.sort().should.eql(['x', 'y']);
        data.metaValues.sort((a, b) => a - b).should.eql([1, 2]);
        data.settingsEntries.should.have.length(2);
      });

      it('evaluates mapSet, mapRemove, mapMerge', async function () {
        const { execute, field, constant, mapSet, mapRemove, mapMerge } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          prefs: { color: 'blue', legacyKey: 'old' },
          defaults: { a: 1, b: 2 },
          overrides: { b: 99, c: 3 },
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              mapSet(field('prefs'), 'updated', constant(true)).as('updatedPrefs'),
              mapRemove(field('prefs'), 'legacyKey').as('cleanedPrefs'),
              mapMerge(field('defaults'), field('overrides')).as('merged'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.updatedPrefs.should.eql({ color: 'blue', legacyKey: 'old', updated: true });
        data.cleanedPrefs.should.eql({ color: 'blue' });
        data.merged.should.eql({ a: 1, b: 99, c: 3 });
      });
    });

    describe('array operators', function () {
      it('evaluates array, arrayLength, arrayGet, arrayConcat, arraySum and array predicates', async function () {
        const {
          execute,
          field,
          constant,
          array,
          arrayLength,
          arrayGet,
          arrayConcat,
          arraySum,
          and,
          arrayContains,
          arrayContainsAny,
          arrayContainsAll,
        } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/array-ops`);

        await Promise.all([
          setDoc(doc(coll, 'p1'), {
            tags: ['typescript', 'js'],
            permissions: ['read', 'write'],
            primaryTags: ['a', 'b'],
            secondaryTags: ['c', 'd'],
            scores: [10, 20, 30],
            items: ['x', 'y', 'z'],
          }),
          setDoc(doc(coll, 'p2'), {
            tags: ['python'],
            permissions: ['read'],
            primaryTags: ['e'],
            secondaryTags: ['f'],
            scores: [5],
            items: ['only'],
          }),
        ]);

        const pipeline = db
          .pipeline()
          .collection(coll)
          .where(
            and(
              arrayContains(field('tags'), 'typescript'),
              arrayContainsAny(field('tags'), ['js', 'ts']),
              arrayContainsAll(field('permissions'), ['read', 'write']),
            ),
          )
          .select(
            array([constant(1), constant(2), constant(3)]).as('fixedArr'),
            arrayLength(field('tags')).as('tagCount'),
            arrayGet(field('items'), 0).as('firstItem'),
            arrayConcat(field('primaryTags'), field('secondaryTags')).as('allTags'),
            arraySum(field('scores')).as('totalScore'),
          );

        if (Platform.ios) {
          await expectIOSUnsupportedFunctions(() => execute(pipeline), ['arrayConcat', 'arrayGet']);
          return;
        }

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.fixedArr.should.eql([1, 2, 3]);
        data.tagCount.should.equal(2);
        data.firstItem.should.equal('x');
        data.allTags.should.eql(['a', 'b', 'c', 'd']);
        data.totalScore.should.equal(60);
      });
    });

    describe('aggregate functions', function () {
      it('evaluates countAll, count, countDistinct, countIf, sum, average, minimum, maximum, first, last, arrayAgg, arrayAggDistinct', async function () {
        const {
          execute,
          field,
          countAll,
          count,
          countDistinct,
          countIf,
          sum,
          average,
          minimum,
          maximum,
          first,
          last,
          arrayAgg,
          arrayAggDistinct,
        } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/agg-all`);

        await Promise.all([
          setDoc(doc(coll, 'a1'), {
            userId: 'u1',
            sessionId: 's1',
            converted: true,
            revenue: 100,
            price: 10,
            score: 50,
            category: 'A',
          }),
          setDoc(doc(coll, 'a2'), {
            userId: 'u2',
            sessionId: 's1',
            converted: false,
            revenue: 200,
            price: 20,
            score: 70,
            category: 'A',
          }),
          setDoc(doc(coll, 'a3'), {
            userId: 'u3',
            sessionId: 's2',
            converted: true,
            revenue: 150,
            price: 5,
            score: 90,
            category: 'B',
          }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .aggregate({
              accumulators: [
                countAll().as('total'),
                count(field('userId')).as('userCount'),
                countDistinct(field('sessionId')).as('uniqueSessions'),
                countIf(field('converted').equal(true)).as('conversions'),
                sum(field('revenue')).as('totalRevenue'),
                average(field('revenue')).as('avgRevenue'),
                minimum(field('price')).as('minPrice'),
                maximum(field('price')).as('maxPrice'),
                first(field('score')).as('firstScore'),
                last(field('score')).as('lastScore'),
                arrayAgg(field('category')).as('allCategories'),
                arrayAggDistinct(field('category')).as('distinctCategories'),
              ],
            }),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.total.should.equal(3);
        data.userCount.should.equal(3);
        data.uniqueSessions.should.equal(2);
        data.conversions.should.equal(2);
        data.totalRevenue.should.equal(450);
        data.avgRevenue.should.equal(150);
        data.minPrice.should.equal(5);
        data.maxPrice.should.equal(20);
        data.firstScore.should.be.a.Number();
        data.lastScore.should.be.a.Number();
        data.allCategories.sort().should.eql(['A', 'A', 'B']);
        data.distinctCategories.sort().should.eql(['A', 'B']);
      });

      it('evaluates grouped aggregate with minimum, maximum, first, last per group', async function () {
        const { execute, field, minimum, maximum, first, last, Ordering } =
          firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/agg-grouped`);

        await Promise.all([
          setDoc(doc(coll, 'e1'), { dept: 'eng', salary: 80, name: 'Alice' }),
          setDoc(doc(coll, 'e2'), { dept: 'eng', salary: 120, name: 'Bob' }),
          setDoc(doc(coll, 'e3'), { dept: 'sales', salary: 60, name: 'Carol' }),
          setDoc(doc(coll, 'e4'), { dept: 'sales', salary: 90, name: 'Dave' }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .aggregate({
              accumulators: [
                minimum(field('salary')).as('minSalary'),
                maximum(field('salary')).as('maxSalary'),
                first(field('name')).as('firstName'),
                last(field('name')).as('lastName'),
              ],
              groups: [field('dept').as('dept')],
            })
            .sort(Ordering.of(field('dept')).ascending()),
        );

        snapshot.results.should.have.length(2);
        const eng = snapshot.results.find(r => r.data().dept === 'eng').data();
        const sales = snapshot.results.find(r => r.data().dept === 'sales').data();
        eng.minSalary.should.equal(80);
        eng.maxSalary.should.equal(120);
        eng.firstName.should.be.a.String();
        eng.lastName.should.be.a.String();
        sales.minSalary.should.equal(60);
        sales.maxSalary.should.equal(90);
      });
    });

    describe('timestamp functions', function () {
      it('evaluates timestampToUnixMillis, timestampToUnixSeconds, timestampAdd, timestampSubtract, timestampTruncate, unixMillisToTimestamp', async function () {
        const {
          execute,
          field,
          timestampToUnixMillis,
          timestampToUnixSeconds,
          timestampAdd,
          timestampSubtract,
          timestampTruncate,
          unixMillisToTimestamp,
        } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc, Timestamp } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        const eventTime = new Timestamp(1700000000, 0);

        await setDoc(doc(db, docPath), {
          eventTime,
          epochMs: 1700000000000,
        });

        const pipeline = db
          .pipeline()
          .documents([docPath])
          .select(
            timestampToUnixMillis(field('eventTime')).as('eventTimeMs'),
            timestampToUnixSeconds(field('eventTime')).as('eventTimeSec'),
            timestampAdd(field('eventTime'), 'day', 1).as('nextDay'),
            timestampSubtract(field('eventTime'), 'hour', 1).as('prevHour'),
            timestampTruncate(field('eventTime'), 'day').as('dayBucket'),
            unixMillisToTimestamp(field('epochMs')).as('fromEpochMs'),
          );

        if (Platform.ios) {
          await expectIOSUnsupportedFunctions(() => execute(pipeline), ['timestampTruncate']);
          return;
        }

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.eventTimeMs.should.equal(1700000000000);
        data.eventTimeSec.should.equal(1700000000);
        data.nextDay.constructor.name.should.equal('Timestamp');
        data.nextDay.seconds.should.equal(1700000000 + 86400);
        data.prevHour.constructor.name.should.equal('Timestamp');
        data.prevHour.seconds.should.equal(1700000000 - 3600);
        data.dayBucket.constructor.name.should.equal('Timestamp');
        data.fromEpochMs.constructor.name.should.equal('Timestamp');
        data.fromEpochMs.seconds.should.equal(1700000000);
      });

      it('evaluates currentTimestamp, timestampToUnixMicros, unixSecondsToTimestamp, unixMicrosToTimestamp', async function () {
        const {
          execute,
          field,
          currentTimestamp,
          timestampToUnixMicros,
          unixSecondsToTimestamp,
          unixMicrosToTimestamp,
        } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc, Timestamp } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        const eventTime = new Timestamp(1700000000, 0);

        await setDoc(doc(db, docPath), {
          eventTime,
          epochSec: 1700000000,
          epochMicros: 1700000000000000,
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              currentTimestamp().as('now'),
              timestampToUnixMicros(field('eventTime')).as('eventTimeMicros'),
              unixSecondsToTimestamp(field('epochSec')).as('fromSec'),
              unixMicrosToTimestamp(field('epochMicros')).as('fromMicros'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.now.constructor.name.should.equal('Timestamp');
        should(data.now.toMillis()).be.greaterThan(0);
        data.eventTimeMicros.should.equal(1700000000000000);
        data.fromSec.constructor.name.should.equal('Timestamp');
        data.fromSec.seconds.should.equal(1700000000);
        data.fromMicros.constructor.name.should.equal('Timestamp');
        data.fromMicros.seconds.should.equal(1700000000);
      });

      it('evaluates type, collectionId, documentId', async function () {
        const { execute, field, type, collectionId, documentId } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/metadata-ops`);

        await setDoc(doc(coll, 'item1'), { value: 'hello', num: 42 });

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .select(
              type(field('value')).as('valueType'),
              type(field('num')).as('numType'),
              collectionId(field('__name__')).as('collId'),
              documentId(field('__name__')).as('docId'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.valueType.should.equal('string');
        data.numType.should.be.a.String();
        data.collId.should.be.a.String();
        data.docId.should.equal('item1');
      });
    });

    describe('vector distance functions', function () {
      it('evaluates cosineDistance, dotProduct, euclideanDistance, vectorLength', async function () {
        const { execute, field, cosineDistance, dotProduct, euclideanDistance, vectorLength } =
          firestorePipelinesModular;
        const { getFirestore, doc, setDoc, vector } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          embedding: vector([1.0, 0.0, 0.0]),
        });

        const queryVec = [1.0, 0.0, 0.0];

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              cosineDistance(field('embedding'), queryVec).as('cosDist'),
              dotProduct(field('embedding'), queryVec).as('dotDist'),
              euclideanDistance(field('embedding'), queryVec).as('euclidDist'),
              vectorLength(field('embedding')).as('vecLen'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        // identical vectors: cosine distance = 0, dot product = 1, euclidean distance = 0
        should(data.cosDist).be.approximately(0, 0.0001);
        should(data.dotDist).be.approximately(1, 0.0001);
        should(data.euclidDist).be.approximately(0, 0.0001);
        // vectorLength returns the number of dimensions
        data.vecLen.should.equal(3);
      });

      it('computes non-trivial cosineDistance, dotProduct, euclideanDistance between distinct vectors', async function () {
        const { execute, field, cosineDistance, dotProduct, euclideanDistance } =
          firestorePipelinesModular;
        const { getFirestore, doc, setDoc, vector } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        // [1,0] vs [0,1]: orthogonal → cosine distance = 1, dot = 0, euclidean = sqrt(2)
        await setDoc(doc(db, docPath), {
          embedding: vector([1.0, 0.0]),
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              cosineDistance(field('embedding'), [0.0, 1.0]).as('cosDist'),
              dotProduct(field('embedding'), [0.0, 1.0]).as('dotDist'),
              euclideanDistance(field('embedding'), [0.0, 1.0]).as('euclidDist'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        should(data.cosDist).be.approximately(1, 0.0001);
        should(data.dotDist).be.approximately(0, 0.0001);
        should(data.euclidDist).be.approximately(Math.sqrt(2), 0.0001);
      });
    });

    describe('sort operators', function () {
      it('sorts using standalone ascending and descending functions', async function () {
        const { execute, field, ascending } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/sort-standalone`);

        await Promise.all([
          setDoc(doc(coll, 'a'), { createdAt: 3, score: 1 }),
          setDoc(doc(coll, 'b'), { createdAt: 1, score: 3 }),
          setDoc(doc(coll, 'c'), { createdAt: 2, score: 2 }),
        ]);

        const ascSnapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .sort(ascending(field('createdAt')))
            .select('createdAt', 'score'),
        );

        ascSnapshot.results.should.have.length(3);
        ascSnapshot.results[0].data().createdAt.should.equal(1);
        ascSnapshot.results[1].data().createdAt.should.equal(2);
        ascSnapshot.results[2].data().createdAt.should.equal(3);

        const descSnapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .sort(descending(field('score')))
            .select('createdAt', 'score'),
        );

        descSnapshot.results.should.have.length(3);
        descSnapshot.results[0].data().score.should.equal(3);
        descSnapshot.results[1].data().score.should.equal(2);
        descSnapshot.results[2].data().score.should.equal(1);
      });

      it('sorts with multi-key ascending/descending tie-break', async function () {
        const { execute, field, ascending } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/sort-multi`);

        await Promise.all([
          setDoc(doc(coll, 'a'), { tier: 1, name: 'Zara' }),
          setDoc(doc(coll, 'b'), { tier: 1, name: 'Anna' }),
          setDoc(doc(coll, 'c'), { tier: 2, name: 'Mike' }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .sort(ascending(field('tier')), ascending(field('name')))
            .select('tier', 'name'),
        );

        snapshot.results.should.have.length(3);
        snapshot.results[0].data().name.should.equal('Anna');
        snapshot.results[1].data().name.should.equal('Zara');
        snapshot.results[2].data().name.should.equal('Mike');
      });
    });
  });
});
