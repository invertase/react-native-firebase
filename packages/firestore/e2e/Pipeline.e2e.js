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
      const { getApp } = modular;
      const { getFirestore, collection, doc } = firestoreModular;
      const db = getFirestore(DATABASE_ID);
      const secondaryDb = getFirestore(getApp('secondaryFromNative'), DATABASE_ID);
      const crossInstancePath = `${COLLECTION}/${Utils.randString(12, '#aA')}/ref-cross-instance`;
      const secondaryColl = collection(secondaryDb, crossInstancePath);
      const secondaryDoc = doc(secondaryDb, `${COLLECTION}/${Utils.randString(12, '#aA')}`);

      (() => db.pipeline().collection({})).should.throw(
        'firebase.firestore().pipeline().collection(*) expected a non-empty string.',
      );

      (() => db.pipeline().collection(null)).should.throw(
        'firebase.firestore().pipeline().collection(*) expected a path, CollectionReference, or options object.',
      );

      (() => db.pipeline().collectionGroup({})).should.throw(
        'firebase.firestore().pipeline().collectionGroup(*) expected a non-empty string.',
      );

      (() => db.pipeline().collectionGroup(null)).should.throw(
        'firebase.firestore().pipeline().collectionGroup(*) expected a collectionId string or options object.',
      );

      (() => db.pipeline().documents(['valid/path', 123])).should.throw(
        'firebase.firestore().pipeline().documents(*) invalid value at index 1. Expected a document path or DocumentReference.',
      );

      (() => db.pipeline().collection(secondaryColl)).should.throw(
        'firebase.firestore().pipeline().collection(*) cannot use a reference from a different Firestore instance.',
      );

      (() => db.pipeline().documents([secondaryDoc])).should.throw(
        'firebase.firestore().pipeline().documents(*) cannot use a reference from a different Firestore instance.',
      );
    });

    it('accepts CollectionReference and DocumentReference pipeline sources on the same Firestore instance', async function () {
      const { execute, field } = firestorePipelinesModular;
      const { getFirestore, collection, doc, setDoc } = firestoreModular;
      const db = getFirestore(DATABASE_ID);
      const collectionRef = collection(
        db,
        `${COLLECTION}/${Utils.randString(12, '#aA')}/ref-source`,
      );
      const docRef = doc(collectionRef, 'one');

      await setDoc(docRef, { score: 11 });

      const fromCollectionRef = await execute(
        db.pipeline().collection(collectionRef).select(field('score').as('score')),
      );
      fromCollectionRef.results.should.have.length(1);
      fromCollectionRef.results[0].data().score.should.equal(11);

      const fromDocumentRef = await execute(
        db.pipeline().documents([docRef]).select(field('score').as('score')),
      );
      fromDocumentRef.results.should.have.length(1);
      fromDocumentRef.results[0].data().score.should.equal(11);
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

      await expectAsyncError(
        () => execute(firestorePipelinesModular.subcollection('reviews')),
        'This pipeline was created without a database (e.g., as a subcollection pipeline) and cannot be executed directly. It can only be used as part of another pipeline.',
      );
    });

    it('serializes subcollection options overload and rejects invalid detached paths', function () {
      const { subcollection } = firestorePipelinesModular;

      const withOptions = subcollection({
        path: 'reviews',
        rawOptions: { requestLabel: 'e2e-subcollection-options' },
      });
      should(withOptions.serialize().source).eql({
        source: 'subcollection',
        path: 'reviews',
        rawOptions: { requestLabel: 'e2e-subcollection-options' },
      });

      (() => subcollection('')).should.throw(
        'subcollection(*) expected path to be a non-empty string.',
      );
      (() => subcollection({ path: '' })).should.throw(
        'subcollection(*) expected path to be a non-empty string.',
      );
      (() => subcollection(null)).should.throw(
        'subcollection(*) expected a path string or SubcollectionStageOptions object.',
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

      const { field } = firestorePipelinesModular;

      const snapshot = await execute(db.pipeline().documents([docPath]).select('nested'));
      (() => snapshot.results[0].get(123)).should.throw(
        "firebase.firestore().pipeline().execute().result.get(*) 'fieldPath' must be a string, FieldPath, or field().",
      );
      snapshot.results[0].get(field('nested.ok')).should.equal(true);

      const circularValue = { label: 'cycle' };
      circularValue.self = circularValue;
      const circularPipeline = db
        .pipeline()
        .collection(`${COLLECTION}/${Utils.randString(12, '#aA')}`)
        .select(field('nested'));
      circularPipeline._stages[0].options.selections = [field('nested'), circularValue];
      (() => circularPipeline.serialize()).should.throw(
        'firebase.firestore().pipeline() failed to serialize arguments because of a circular value.',
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

      it('executes createFrom(query) with compound inequality filters', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc, query, where, orderBy } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const collectionRef = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/pipeline-query-compound`,
        );

        await Promise.all([
          setDoc(doc(collectionRef, 'low'), { score: 5, tier: 'a' }),
          setDoc(doc(collectionRef, 'mid'), { score: 15, tier: 'a' }),
          setDoc(doc(collectionRef, 'high'), { score: 25, tier: 'b' }),
        ]);

        const queryRef = query(
          collectionRef,
          where('score', '>=', 10),
          where('score', '<=', 20),
          orderBy('score', 'asc'),
        );

        const snapshot = await execute(db.pipeline().createFrom(queryRef));

        snapshot.results.should.have.length(1);
        snapshot.results[0].id.should.equal('mid');
        snapshot.results[0].data().score.should.equal(15);
      });
    });

    describe('functions and expressions', function () {
      it('executes method-style expressions', async function () {
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const { and, execute, field, constant, Ordering } = firestorePipelinesModular;
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
          .select(f('title').as('title'), f('rating').add(constant(1)).as('boostedRating'))
          .sort(Ordering.of(f('rating')).descending());

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(2);
        snapshot.results[0].data().should.eql({
          title: 'C',
          boostedRating: 9,
        });
        snapshot.results[1].data().should.eql({
          title: 'B',
          boostedRating: 6,
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

        const replaceExprSnapshot = await execute(
          db
            .pipeline()
            .documents([`${collectionRef.path}/two`])
            .replaceWith({ expr: field('payload') }),
        );

        replaceExprSnapshot.results.should.have.length(1);
        replaceExprSnapshot.results[0].data().should.eql({ label: 'B', rank: 2 });
      });

      it('serializes rawStage append without requiring native execution', function () {
        const { field } = firestorePipelinesModular;
        const { getFirestore, collection } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/raw-stage-serialize`,
        );

        const pipeline = db
          .pipeline()
          .collection(coll)
          .rawStage('score', { input: field('rating') }, { enabled: true });

        const serialized = pipeline.serialize();
        serialized.stages.should.have.length(1);
        serialized.stages[0].stage.should.equal('rawStage');
        serialized.stages[0].options.name.should.equal('score');
      });

      it('rejects execute(options) when indexMode or rawOptions are provided', async function () {
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

        await expectAsyncError(
          () => execute(executeOptions),
          [
            'pipelineExecute() does not support options.indexMode because Firestore pipeline execute options are currently unstable or unavailable.',
            'pipelineExecute() does not support options.rawOptions because Firestore pipeline execute options are currently unstable or unavailable.',
          ],
        );
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

        // Cloud Firestore can be briefly eventually consistent for collection group reads.
        await Utils.sleep(2000);

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
      it('supports grouped aggregate + post-aggregate where', async function () {
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

      it('executes sample stage with document count', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/sample`);

        await Promise.all(
          Array.from({ length: 10 }, (_, index) =>
            setDoc(doc(coll, `doc-${index}`), { slot: index }),
          ),
        );

        const snapshot = await execute(
          db.pipeline().collection(coll).sample({ documents: 5 }).select('slot'),
        );

        snapshot.results.should.have.length(5);
      });

      it('executes sample stage with numeric document count overload', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/sample-numeric`);

        await Promise.all(
          Array.from({ length: 10 }, (_, index) =>
            setDoc(doc(coll, `doc-${index}`), { slot: index }),
          ),
        );

        const snapshot = await execute(db.pipeline().collection(coll).sample(3).select('slot'));

        snapshot.results.should.have.length(3);
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

      it('rejects invalid stage options with clear validation errors', async function () {
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
        );

        await expectAsyncError(
          () => execute(db.pipeline().collection(coll).sort()),
          'pipelineExecute() expected stage.options.orderings to contain at least one value.',
        );

        await expectAsyncError(
          () => execute(db.pipeline().collection(coll).aggregate()),
          'pipelineExecute() expected stage.options.accumulators to contain at least one value.',
        );

        await expectAsyncError(
          () => execute(db.pipeline().collection(coll).distinct()),
          'pipelineExecute() expected stage.options.groups to contain at least one value.',
        );

        await expectAsyncError(
          () => execute(db.pipeline().collection(coll).sample({})),
          'pipelineExecute() expected sample stage to include documents or percentage.',
        );
      });

      it('rejects malformed where and malformed union payloads at validation boundary', async function () {
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
        );

        const badUnion = db.pipeline().collection(coll);
        badUnion._stages.push({ stage: 'union', options: { other: {} } });
        await expectAsyncError(
          () => execute(badUnion),
          [
            'pipelineExecute() expected stage.options.other to be a serialized pipeline object.',
            'pipelineExecute() expected pipeline.source to be an object.',
          ],
        );
      });
    });

    describe('pipeline execute validation guards', function () {
      it('rejects tampered documents and collection source fields', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/validate-documents-source`,
        );
        const docPath = `${coll.path}/base`;
        await setDoc(doc(coll, 'base'), { value: 1 });

        const emptyDocuments = db.pipeline().documents([docPath]);
        emptyDocuments._source.documents = [];
        await expectAsyncError(
          () => execute(emptyDocuments),
          'pipelineExecute() expected pipeline.source.documents to contain at least one value.',
        );

        const badDocumentEntry = db.pipeline().documents([docPath]);
        badDocumentEntry._source.documents = [docPath, ''];
        await expectAsyncError(
          () => execute(badDocumentEntry),
          'pipelineExecute() expected pipeline.source.documents to contain only non-empty strings.',
        );

        const nonObjectSource = db.pipeline().collection(coll);
        nonObjectSource._source = null;
        await expectAsyncError(
          () => execute(nonObjectSource),
          'pipelineExecute() expected pipeline.source to be an object.',
        );

        const emptyCollectionPath = db.pipeline().collection(coll);
        emptyCollectionPath._source.path = '';
        await expectAsyncError(
          () => execute(emptyCollectionPath),
          'pipelineExecute() expected pipeline.source.path to be a non-empty string.',
        );
      });

      it('rejects tampered collectionGroup and subcollection source fields', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/validate-group-subcollection`,
        );

        const emptyCollectionGroupId = db.pipeline().collectionGroup(COLLECTION_GROUP);
        emptyCollectionGroupId._source.collectionId = '';
        await expectAsyncError(
          () => execute(emptyCollectionGroupId),
          'pipelineExecute() expected pipeline.source.collectionId to be a non-empty string.',
        );

        const emptySubcollectionPath = db.pipeline().collection(coll);
        emptySubcollectionPath._source = { source: 'subcollection', path: '' };
        await expectAsyncError(
          () => execute(emptySubcollectionPath),
          'pipelineExecute() expected pipeline.source.path to be a non-empty string.',
        );
      });

      it('rejects tampered query source fields', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, query, where } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/validate-query-source`,
        );
        const queryPipeline = db.pipeline().createFrom(query(coll, where('value', '>=', 1)));

        const emptyQueryPath = db.pipeline().createFrom(query(coll, where('value', '>=', 1)));
        emptyQueryPath._source.path = '';
        await expectAsyncError(
          () => execute(emptyQueryPath),
          'pipelineExecute() expected pipeline.source.path to be a non-empty string.',
        );

        const emptyQueryType = db.pipeline().createFrom(query(coll, where('value', '>=', 1)));
        emptyQueryType._source.queryType = '';
        await expectAsyncError(
          () => execute(emptyQueryType),
          'pipelineExecute() expected pipeline.source.queryType to be a non-empty string.',
        );

        const badFilters = db.pipeline().createFrom(query(coll, where('value', '>=', 1)));
        badFilters._source.filters = 'not-an-array';
        await expectAsyncError(
          () => execute(badFilters),
          'pipelineExecute() expected pipeline.source.filters to be an array.',
        );

        const badOrders = db.pipeline().createFrom(query(coll, where('value', '>=', 1)));
        badOrders._source.orders = 'not-an-array';
        await expectAsyncError(
          () => execute(badOrders),
          'pipelineExecute() expected pipeline.source.orders to be an array.',
        );

        const badOptions = db.pipeline().createFrom(query(coll, where('value', '>=', 1)));
        badOptions._source.options = 'not-an-object';
        await expectAsyncError(
          () => execute(badOptions),
          'pipelineExecute() expected pipeline.source.options to be an object.',
        );

        queryPipeline._source.source = 'galaxy';
        await expectAsyncError(
          () => execute(queryPipeline),
          'pipelineExecute() received an unknown source type.',
        );
      });

      it('rejects tampered stage payloads and unknown stage names', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/validate-stages`);

        const malformedStage = db.pipeline().collection(coll);
        malformedStage._stages.push({ stage: 'select' });
        await expectAsyncError(
          () => execute(malformedStage),
          'pipelineExecute() expected pipeline.stages[0] to include stage and options.',
        );

        const unknownStage = db.pipeline().collection(coll);
        unknownStage._stages.push({ stage: 'teleport', options: {} });
        await expectAsyncError(
          () => execute(unknownStage),
          'pipelineExecute() received an unknown stage: teleport.',
        );
      });

      it('rejects nested union pipelines with non-object payloads', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/validate-union-recursion`,
        );

        const nestedUnion = db.pipeline().collection(coll);
        nestedUnion._stages.push({
          stage: 'union',
          options: {
            other: {
              source: { source: 'database' },
              stages: [
                {
                  stage: 'union',
                  options: { other: null },
                },
              ],
            },
          },
        });
        await expectAsyncError(
          () => execute(nestedUnion),
          'pipelineExecute() expected stage.options.other to be a serialized pipeline object.',
        );
      });

      it('rejects invalid execute options indexMode and rawOptions types', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/validate-execute-options`,
        );
        const validPipeline = db.pipeline().collection(coll).select('value');

        await expectAsyncError(
          () => execute({ pipeline: validPipeline, indexMode: 'fast' }),
          'pipelineExecute() expected options.indexMode to equal "recommended".',
        );

        await expectAsyncError(
          () => execute({ pipeline: validPipeline, rawOptions: 'not-an-object' }),
          'pipelineExecute() expected options.rawOptions to be an object.',
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

        const pipeline = db
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
          );

        const snapshot = await execute(pipeline);

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

      it('filters with fluent comparison alias methods (gt, eq, gte, lt, lte)', async function () {
        const { execute, field, and } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/fluent-comparison-aliases`,
        );

        await Promise.all([
          setDoc(doc(coll, 'match'), { price: 42, stock: 60, sku: 'SKU001' }),
          setDoc(doc(coll, 'skip'), { price: 5, stock: 200, sku: 'SKU002' }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .where(
              and(
                field('price').gt(10),
                field('price').lt(100),
                field('sku').eq('SKU001'),
                field('stock').gte(50),
                field('stock').lte(70),
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

      it('evaluates nor in a where clause', async function () {
        const { execute, field, nor } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/nor-ops`);

        // nor: neither isPublic nor isVerified is true
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
            .where(nor(field('isPublic').equal(true), field('isVerified').equal(true)))
            .sort(field('__name__').ascending())
            .select('isPublic', 'isVerified'),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().isPublic.should.equal(false);
        snapshot.results[0].data().isVerified.should.equal(false);
      });

      it('evaluates switchOn with multiple conditions and a default', async function () {
        const { execute, field, constant, switchOn, equal } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/switch-on`);

        await Promise.all([
          setDoc(doc(coll, 'a'), { status: 1 }),
          setDoc(doc(coll, 'b'), { status: 2 }),
          setDoc(doc(coll, 'c'), { status: 99 }),
        ]);

        const pipeline = db
          .pipeline()
          .collection(coll)
          .sort(field('__name__').ascending())
          .select(
            switchOn(
              equal(field('status'), constant(1)),
              constant('Active'),
              equal(field('status'), constant(2)),
              constant('Pending'),
              constant('Unknown'),
            ).as('statusLabel'),
          );

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(3);
        snapshot.results[0].data().statusLabel.should.equal('Active');
        snapshot.results[1].data().statusLabel.should.equal('Pending');
        snapshot.results[2].data().statusLabel.should.equal('Unknown');
      });

      it('evaluates ifNull for null, present, and missing field values', async function () {
        const { execute, field, constant, ifNull } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/if-null`);

        await Promise.all([
          setDoc(doc(coll, 'a'), { displayName: null, label: 'set' }),
          setDoc(doc(coll, 'b'), { displayName: 'Ada', label: 'set' }),
          setDoc(doc(coll, 'c'), { label: 'only-label' }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .sort(field('__name__').ascending())
            .select(
              ifNull(field('displayName'), constant('Anonymous')).as('displayName'),
              ifNull(field('label'), constant('fallback')).as('label'),
              field('displayName').ifNull(constant('Fluent Anonymous')).as('fluentDisplayName'),
            ),
        );

        snapshot.results.should.have.length(3);
        snapshot.results[0].data().displayName.should.equal('Anonymous');
        snapshot.results[0].data().label.should.equal('set');
        snapshot.results[0].data().fluentDisplayName.should.equal('Fluent Anonymous');
        snapshot.results[1].data().displayName.should.equal('Ada');
        snapshot.results[1].data().fluentDisplayName.should.equal('Ada');
        snapshot.results[2].data().displayName.should.equal('Anonymous');
        snapshot.results[2].data().fluentDisplayName.should.equal('Fluent Anonymous');
      });

      it('evaluates ifAbsent for present and missing field values', async function () {
        const { execute, field, constant, ifAbsent } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/if-absent`);

        await setDoc(doc(coll, 'only'), { label: 'set', explicitNull: null });

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .select(
              ifAbsent(field('label'), constant('fallback')).as('existing'),
              ifAbsent(field('missing'), constant('fallback')).as('absent'),
              ifAbsent(field('explicitNull'), constant('fallback')).as('nullKept'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.existing.should.equal('set');
        data.absent.should.equal('fallback');
        should(data.nullKept).be.null();
      });

      it('evaluates coalesce for present, missing, and fallback values', async function () {
        const { execute, field, constant, coalesce } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/coalesce`);

        await Promise.all([
          setDoc(doc(coll, 'a'), { preferredName: 'Alice', fullName: 'Alice Smith' }),
          setDoc(doc(coll, 'b'), { fullName: 'Bob Jones' }),
          setDoc(doc(coll, 'c'), {}),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .sort(field('__name__').ascending())
            .select(
              coalesce(field('preferredName'), field('fullName'), constant('Anonymous')).as(
                'displayName',
              ),
            ),
        );

        snapshot.results.should.have.length(3);
        snapshot.results[0].data().displayName.should.equal('Alice');
        snapshot.results[1].data().displayName.should.equal('Bob Jones');
        snapshot.results[2].data().displayName.should.equal('Anonymous');
      });

      it('evaluates currentDocument via mapGet', async function () {
        const { execute, field, currentDocument, mapGet } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/current-document`,
        );

        await setDoc(doc(coll, 'a'), { title: 'Neuromancer', author: 'Gibson' });

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .select(
              mapGet(currentDocument(), 'title').as('titleFromDoc'),
              mapGet(currentDocument(), 'author').as('authorFromDoc'),
              field('title').as('titleFromField'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.titleFromDoc.should.equal('Neuromancer');
        data.authorFromDoc.should.equal('Gibson');
        data.titleFromField.should.equal('Neuromancer');
      });

      it('evaluates ifError and isError', async function () {
        const { execute, field, constant, ifError, isError } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/if-error`);

        await setDoc(doc(coll, 'only'), { label: 'ok' });

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .select(
              ifError(field('label'), constant('fallback')).as('safeLabel'),
              ifError(field('missing'), constant('fallback')).as('safeMissing'),
              isError(field('label')).as('labelIsError'),
              isError(field('missing')).as('missingIsError'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.safeLabel.should.equal('ok');
        // Absent fields are not expression errors; ifError leaves them absent (ifAbsent handles fallback).
        should(data.safeMissing).be.undefined();
        data.labelIsError.should.equal(false);
        data.missingIsError.should.equal(false);
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
              mapSet(field('prefs'), 'disabled', constant(false)).as('disabledPrefs'),
              mapRemove(field('prefs'), 'legacyKey').as('cleanedPrefs'),
              mapMerge(field('defaults'), field('overrides')).as('merged'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.updatedPrefs.should.eql({ color: 'blue', legacyKey: 'old', updated: true });
        data.disabledPrefs.should.eql({ color: 'blue', legacyKey: 'old', disabled: false });
        data.cleanedPrefs.should.eql({ color: 'blue' });
        data.merged.should.eql({ a: 1, b: 99, c: 3 });
      });

      it('evaluates map and array literals with mixed constants and field expressions', async function () {
        const { execute, field, constant, map, array } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          flagA: true,
          score: 42,
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              map({
                active: field('flagA'),
                label: constant('item'),
                score: field('score'),
              }).as('meta'),
              array([field('score'), constant('tail')]).as('scoreWithTail'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.meta.should.eql({ active: true, label: 'item', score: 42 });
        data.scoreWithTail.should.eql([42, 'tail']);
      });

      it('routes nested constant envelopes inside map literals consistently', async function () {
        // P-011 parity: a serialized { exprType: "constant", value: … } envelope
        // that appears as a value inside a map literal must be treated as
        // expression-like and re-emerge as a constant, matching iOS. Android
        // previously excluded "constant" from isExpressionLike and descended it
        // as a literal map, mishandling nested constants (e.g. ref-shaped maps).
        const { execute, field, constant, map, array } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          score: 7,
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              map({
                header: map({
                  kind: constant('doc'),
                  version: constant(2),
                  docPath: constant('collection/document'),
                }),
                tags: array([constant('a'), constant('b')]),
                score: field('score'),
              }).as('envelope'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.envelope.should.eql({
          header: { kind: 'doc', version: 2, docPath: 'collection/document' },
          tags: ['a', 'b'],
          score: 7,
        });
      });
    });

    describe('array operators', function () {
      it('evaluates array helpers and array predicates', async function () {
        const {
          execute,
          field,
          constant,
          array,
          arrayLength,
          arrayGet,
          arrayConcat,
          arrayFilter,
          arrayFirst,
          arrayFirstN,
          arrayIndexOf,
          arrayIndexOfAll,
          arrayLastIndexOf,
          arrayLast,
          arrayLastN,
          arrayMaximum,
          arrayMaximumN,
          arrayMinimum,
          arrayMinimumN,
          arraySlice,
          arrayTransform,
          arrayTransformWithIndex,
          arraySum,
          variable,
          and,
          add,
          greaterThan,
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
            scores: [10, 20, 30, 20],
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
              arrayContainsAny(field('tags'), [constant('js'), constant('ts')]),
              arrayContainsAll(field('permissions'), ['read', 'write']),
            ),
          )
          .select(
            array([constant('one'), constant('two'), constant('three')]).as('fixedArr'),
            arrayLength(field('tags')).as('tagCount'),
            arrayFirst(field('items')).as('firstItemByHelper'),
            arrayFirstN(field('items'), 2).as('firstTwoItems'),
            arrayGet(field('items'), 0).as('firstItem'),
            arrayConcat(field('primaryTags'), field('secondaryTags')).as('allTags'),
            arrayFilter(field('scores'), 'score', greaterThan(variable('score'), 15)).as(
              'filteredItems',
            ),
            arrayFirst('scores').as('firstScore'),
            arrayFirstN('scores', 2).as('firstTwoScores'),
            arrayLast('scores').as('globalLastScore'),
            arrayLastN('scores', 2).as('globalLastTwoScores'),
            field('scores').arrayLast().as('lastScore'),
            field('scores').arrayLastN(2).as('lastTwoScores'),
            arraySlice('scores', 1, 2).as('middleScores'),
            arrayTransform('scores', 'score', add(variable('score'), 1)).as('incrementedScores'),
            arrayTransformWithIndex(
              'scores',
              'score',
              'index',
              add(variable('score'), variable('index')),
            ).as('indexedScores'),
            arrayMaximum('scores').as('maxScore'),
            arrayMaximumN('scores', 2).as('topTwoScores'),
            arrayMinimum('scores').as('globalMinScore'),
            field('scores').arrayMinimum().as('minScore'),
            arrayMinimumN('scores', 2).as('bottomTwoScores'),
            arrayIndexOf('scores', 20).as('firstTwentyIndex'),
            field('scores').arrayIndexOf(20).as('fluentFirstTwentyIndex'),
            arrayLastIndexOf('scores', 20).as('lastTwentyIndex'),
            field('scores').arrayLastIndexOf(20).as('fluentLastTwentyIndex'),
            arrayIndexOfAll('scores', 20).as('allTwentyIndexes'),
            arraySum(field('scores')).as('totalScore'),
          );

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.fixedArr.should.eql(['one', 'two', 'three']);
        data.tagCount.should.equal(2);
        data.firstItemByHelper.should.equal('x');
        data.firstTwoItems.should.eql(['x', 'y']);
        data.firstItem.should.equal('x');
        data.allTags.should.eql(['a', 'b', 'c', 'd']);
        data.filteredItems.should.eql([20, 30, 20]);
        data.firstScore.should.equal(10);
        data.firstTwoScores.should.eql([10, 20]);
        data.globalLastScore.should.equal(20);
        data.globalLastTwoScores.should.eql([30, 20]);
        data.lastScore.should.equal(20);
        data.lastTwoScores.should.eql([30, 20]);
        data.middleScores.should.eql([20, 30]);
        data.incrementedScores.should.eql([11, 21, 31, 21]);
        data.indexedScores.should.eql([10, 21, 32, 23]);
        data.maxScore.should.equal(30);
        [...data.topTwoScores].sort((a, b) => a - b).should.eql([20, 30]);
        data.minScore.should.equal(10);
        data.globalMinScore.should.equal(10);
        [...data.bottomTwoScores].sort((a, b) => a - b).should.eql([10, 20]);
        data.firstTwentyIndex.should.equal(1);
        data.fluentFirstTwentyIndex.should.equal(1);
        data.lastTwentyIndex.should.equal(3);
        data.fluentLastTwentyIndex.should.equal(3);
        data.allTwentyIndexes.should.eql([1, 3]);
        data.totalScore.should.equal(80);
      });

      it('evaluates arrayFirstN and arraySlice with expression count/offset', async function () {
        const { execute, field, arrayFirstN, arraySlice, arrayMaximumN } =
          firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          items: ['a', 'b', 'c', 'd'],
          start: 1,
          len: 2,
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              arrayFirstN(field('items'), field('start')).as('dynamicFirstN'),
              arraySlice(field('items'), field('start'), field('len')).as('dynamicSlice'),
              arrayMaximumN('items', field('len')).as('dynamicMaxN'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.dynamicFirstN.should.eql(['a']);
        data.dynamicSlice.should.eql(['b', 'c']);
        [...data.dynamicMaxN].sort().should.eql(['c', 'd']);
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

      it('evaluates countIf with false literal predicate', async function () {
        const { execute, field, countIf } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/agg-count-if-false`,
        );

        await Promise.all([
          setDoc(doc(coll, 'a1'), { converted: true }),
          setDoc(doc(coll, 'a2'), { converted: false }),
          setDoc(doc(coll, 'a3'), { converted: true }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .aggregate({
              accumulators: [countIf(field('converted').equal(false)).as('nonConversions')],
            }),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().nonConversions.should.equal(1);
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

      it('evaluates grouped aggregate with expression group aliases', async function () {
        const { execute, field, countAll, toLower } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/agg-expr-groups`);

        await Promise.all([
          setDoc(doc(coll, 'a1'), { region: 'US', city: 'Austin' }),
          setDoc(doc(coll, 'a2'), { region: 'US', city: 'austin' }),
          setDoc(doc(coll, 'b1'), { region: 'EU', city: 'Paris' }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .aggregate({
              accumulators: [countAll().as('total')],
              groups: [field('region').as('region'), toLower(field('city')).as('cityNorm')],
            }),
        );

        snapshot.results.should.have.length(2);
        const us = snapshot.results.find(r => r.data().region === 'US').data();
        const eu = snapshot.results.find(r => r.data().region === 'EU').data();
        us.cityNorm.should.equal('austin');
        us.total.should.equal(2);
        eu.cityNorm.should.equal('paris');
        eu.total.should.equal(1);
      });
    });

    describe('fluent construction parity', function () {
      it('evaluates fluent chains equivalently to global helpers', async function () {
        const {
          execute,
          field,
          mapGet,
          stringReplaceAll,
          regexMatch,
          arrayGet,
          ifNull,
          coalesce,
          timestampTruncate,
        } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc, Timestamp } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          label: 'aaa',
          code: 'ABC',
          metadata: { theme: 'light' },
          scores: [10, 20, 30],
          displayName: null,
          preferredName: 'Ada',
          eventTime: new Timestamp(1700000000, 0),
        });

        const pipeline = db
          .pipeline()
          .documents([docPath])
          .select(
            mapGet(field('metadata'), 'theme').as('globalTheme'),
            field('metadata').mapGet('theme').as('fluentTheme'),
            stringReplaceAll(field('label'), 'a', 'b').as('globalLabel'),
            field('label').stringReplaceAll('a', 'b').as('fluentLabel'),
            regexMatch(field('code'), '^[A-Z]{3}$').as('globalRegex'),
            field('code').regexMatch('^[A-Z]{3}$').as('fluentRegex'),
            arrayGet(field('scores'), 1).as('globalScore'),
            field('scores').arrayGet(1).as('fluentScore'),
            ifNull(field('displayName'), 'Anonymous').as('globalIfNull'),
            field('displayName').ifNull('Anonymous').as('fluentIfNull'),
            coalesce(field('preferredName'), 'Unknown').as('globalCoalesce'),
            field('preferredName').coalesce('Unknown').as('fluentCoalesce'),
            timestampTruncate(field('eventTime'), 'day').as('globalDayBucket'),
            field('eventTime').timestampTruncate('day').as('fluentDayBucket'),
          );

        const snapshot = await execute(pipeline);

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.globalTheme.should.equal('light');
        data.fluentTheme.should.equal('light');
        data.globalLabel.should.equal('bbb');
        data.fluentLabel.should.equal('bbb');
        data.globalRegex.should.equal(true);
        data.fluentRegex.should.equal(true);
        data.globalScore.should.equal(20);
        data.fluentScore.should.equal(20);
        data.globalIfNull.should.equal('Anonymous');
        data.fluentIfNull.should.equal('Anonymous');
        data.globalCoalesce.should.equal('Ada');
        data.fluentCoalesce.should.equal('Ada');
        data.globalDayBucket.constructor.name.should.equal('Timestamp');
        data.fluentDayBucket.constructor.name.should.equal('Timestamp');
        data.globalDayBucket.seconds.should.equal(data.fluentDayBucket.seconds);
      });

      it('covers fluent string aliases, ordering passthrough, and fluent aggregates', async function () {
        const { execute, field, Ordering } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/fluent-runtime-parity`,
        );

        await Promise.all([
          setDoc(doc(coll, 'a'), { name: 'Alpha', salary: 100 }),
          setDoc(doc(coll, 'b'), { name: 'Beta', salary: 200 }),
        ]);

        const descendingScore = field('salary').descending();
        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .aggregate({
              accumulators: [field('salary').sum().as('totalSalary')],
              groups: [field('name').toLower().as('nameNorm')],
            })
            .sort(Ordering.of(field('totalSalary').descending())),
        );

        snapshot.results.should.have.length(2);
        const alpha = snapshot.results.find(r => r.data().nameNorm === 'alpha').data();
        alpha.totalSalary.should.equal(100);
        alpha.nameNorm.should.equal('alpha');

        const passthrough = Ordering.of(descendingScore);
        passthrough.should.equal(descendingScore);
      });

      it('normalizes nested literal maps, document references, and runtime-node arrays', async function () {
        const { execute, field, constant, array } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/normalize-runtime-values`,
        );
        const docPath = `${coll.path}/a`;
        const linkedRef = doc(db, `${COLLECTION}/${Utils.randString(12, '#aA')}`);

        await Promise.all([
          setDoc(linkedRef, { label: 'linked' }),
          setDoc(doc(db, docPath), {
            region: 'US',
            tags: ['alpha', 'beta'],
            linkedRef,
          }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              array([field('tags'), constant('tail')]).as('nestedItems'),
              constant(linkedRef).as('refCopy'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.nestedItems.should.eql([['alpha', 'beta'], 'tail']);
        data.refCopy.path.should.equal(linkedRef.path);
      });
    });

    describe('timestamp functions', function () {
      it('evaluates timestampDiff across all global overload classes', async function () {
        const { execute, field, timestampDiff } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc, Timestamp } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        const startTime = new Timestamp(1700000000, 0);
        const endTime = new Timestamp(1700000000 + 2 * 86400, 0);

        await setDoc(doc(db, docPath), { startTime, endTime });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              timestampDiff(field('endTime'), field('startTime'), 'day').as('exprExprDays'),
              timestampDiff(field('endTime'), 'startTime', 'day').as('exprFieldDays'),
              timestampDiff('endTime', field('startTime'), 'day').as('fieldExprDays'),
              timestampDiff('endTime', 'startTime', 'hour').as('fieldFieldHours'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.exprExprDays.should.equal(2);
        data.exprFieldDays.should.equal(2);
        data.fieldExprDays.should.equal(2);
        data.fieldFieldHours.should.equal(48);
      });

      it('evaluates subcollection scalar subquery via addFields', async function () {
        const { execute, field, subcollection, average, countAll } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const base = `${COLLECTION}/${Utils.randString(12, '#aA')}/subcollection-e2e`;
        const parentPath = `${base}/restaurant-a`;

        await setDoc(doc(db, parentPath), { name: 'Pizza Place' });
        await setDoc(doc(db, `${parentPath}/reviews/review-1`), { rating: 4 });
        await setDoc(doc(db, `${parentPath}/reviews/review-2`), { rating: 5 });

        const snapshot = await execute(
          db
            .pipeline()
            .collection(base)
            .addFields(
              subcollection('reviews')
                .aggregate(countAll().as('reviewCount'), average('rating').as('avgRating'))
                .toScalarExpression()
                .as('reviewSummary'),
            )
            .select('name', field('reviewSummary')),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.name.should.equal('Pizza Place');
        data.reviewSummary.reviewCount.should.equal(2);
        data.reviewSummary.avgRating.should.equal(4.5);
      });

      it('evaluates timestampExtract across global overload classes', async function () {
        const { execute, field, timestampExtract } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc, Timestamp } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        const eventTime = new Timestamp(1700000000, 0);

        await setDoc(doc(db, docPath), { eventTime });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              timestampExtract(field('eventTime'), 'year').as('exprYear'),
              timestampExtract('eventTime', 'month').as('fieldMonth'),
              timestampExtract(field('eventTime'), 'day').as('exprDay'),
              field('eventTime').timestampExtract('year').as('fluentYear'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.exprYear.should.equal(2023);
        data.fieldMonth.should.equal(11);
        data.exprDay.should.equal(14);
        data.fluentYear.should.equal(2023);
      });

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
              field('eventTime').currentTimestamp().as('receiverNow'),
              timestampToUnixMicros(field('eventTime')).as('eventTimeMicros'),
              unixSecondsToTimestamp(field('epochSec')).as('fromSec'),
              unixMicrosToTimestamp(field('epochMicros')).as('fromMicros'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.now.constructor.name.should.equal('Timestamp');
        should(data.now.toMillis()).be.greaterThan(0);
        data.receiverNow.constructor.name.should.equal('Timestamp');
        should(data.receiverNow.toMillis()).be.greaterThan(0);
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

      it('executes findNearest vector search stage', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc, vector } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/find-nearest`);

        await Promise.all([
          setDoc(doc(coll, 'near'), { name: 'near', embedding: vector([1.0, 0.0, 0.0]) }),
          setDoc(doc(coll, 'far'), { name: 'far', embedding: vector([0.0, 1.0, 0.0]) }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .findNearest({
              field: 'embedding',
              vectorValue: [1.0, 0.0, 0.0],
              distanceMeasure: 'euclidean',
              limit: 1,
            })
            .select('name'),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().name.should.equal('near');
      });
    });

    describe('sort operators', function () {
      it('sorts using standalone ascending and descending functions', async function () {
        const { execute, field, ascending, descending } = firestorePipelinesModular;
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

  // Pathological / recursion + parsing-correctness coverage. These execute the
  // exact native paths that previously hung: an AggregateFunction nested inside a
  // PipelineValue subquery (scalar + array), and a deep expression tree whose
  // analysis used to be O(2^depth) on iOS. They run on iOS, Android, and macOS.
  describe('native expression literal lowering coverage', function () {
    describe('expression literal lowering and function dispatch edges', function () {
      it('lowers non-constant array and map literals with nested expression slots', async function () {
        const { execute, field, constant, map, array, add, multiply } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          a: 10,
          b: 5,
          c: 2,
          flag: true,
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              array([
                field('a'),
                add(field('b'), constant(1)),
                multiply(field('c'), field('c')),
              ]).as('computedList'),
              map({
                total: add(field('a'), field('b')),
                doubled: multiply(field('c'), constant(2)),
                active: field('flag'),
              }).as('computedMap'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.computedList.should.eql([10, 6, 4]);
        data.computedMap.should.eql({ total: 15, doubled: 4, active: true });
      });

      it('unwraps constant-wrapped array arguments during native lowering', async function () {
        const { execute, field, constant, array, add } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          score: 42,
          bump: 3,
        });

        if (Platform.other) {
          const macSnapshot = await execute(
            db
              .pipeline()
              .documents([docPath])
              .select(
                array([field('score'), add(field('bump'), constant(1))]).as('nestedExprList'),
              ),
          );

          macSnapshot.results.should.have.length(1);
          macSnapshot.results[0].data().nestedExprList.should.eql([42, 4]);
          return;
        }

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              array([constant([1, 2, 3])]).as('constantWrappedFixed'),
              array([field('score'), add(field('bump'), constant(1))]).as('nestedExprList'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.constantWrappedFixed.should.eql([1, 2, 3]);
        data.nestedExprList.should.eql([42, 4]);
      });

      it('lowers map non-literal arguments through native passthrough lowering', async function () {
        if (Platform.other) {
          return;
        }

        const { execute, constant, map } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          settings: { theme: 'dark', lang: 'en' },
        });

        await expectAsyncError(
          () =>
            execute(
              db
                .pipeline()
                .documents([docPath])
                .select(map(map({ label: constant('child') })).as('nestedMapPassthrough')),
            ),
          ['invalid-argument', 'Failed to execute pipeline'],
        );
      });

      it('rejects timestampTruncate with wrong arity at validation boundary', async function () {
        if (Platform.other) {
          return;
        }

        const { execute, field, timestampTruncate } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc, Timestamp } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          eventTime: new Timestamp(1700000000, 0),
        });

        await expectAsyncError(
          () =>
            execute(
              db
                .pipeline()
                .documents([docPath])
                .select(timestampTruncate(field('eventTime')).as('badTruncate')),
            ),
          ['pipelineExecute() expected', 'invalid-argument', 'Failed to execute pipeline'],
        );
      });
    });

    describe('enter object expression frame lowering coverage', function () {
      it('lowers array and map slots with direct constant and field exprType nodes', async function () {
        const { execute, field, constant, map, array, add } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          score: 8,
          bonus: 2,
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              array([constant(2), field('score'), add(field('bonus'), constant(3))]).as(
                'slotArray',
              ),
              map({
                base: constant(10),
                live: field('score'),
                sum: add(field('score'), field('bonus')),
              }).as('slotMap'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.slotArray.should.eql([2, 8, 5]);
        data.slotMap.should.eql({ base: 10, live: 8, sum: 10 });
      });

      it('lowers conditional boolean value frames through native lowering', async function () {
        const { execute, field, constant, conditional, greaterThan } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          score: 12,
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              conditional(
                greaterThan(field('score'), constant(0)),
                constant('positive'),
                constant('non-positive'),
              ).as('scoreSign'),
            ),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().scoreSign.should.equal('positive');
      });

      it('lowers raw operator AND and comparison boolean shapes in where filters', async function () {
        if (Platform.other) {
          return;
        }

        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/raw-boolean-where`,
        );

        await Promise.all([
          setDoc(doc(coll, 'match'), { status: 'active', score: 15 }),
          setDoc(doc(coll, 'skip-status'), { status: 'inactive', score: 15 }),
          setDoc(doc(coll, 'skip-score'), { status: 'active', score: 5 }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .where({
              condition: {
                operator: 'AND',
                queries: [
                  { operator: '==', fieldPath: 'status', value: 'active' },
                  { operator: '>=', fieldPath: 'score', value: 10 },
                ],
              },
            })
            .select('status', 'score'),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().status.should.equal('active');
        snapshot.results[0].data().score.should.equal(15);
      });

      it('lowers arrayConcat through value-or-expression literal slots', async function () {
        const { execute, field, constant, array, arrayConcat } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          tags: ['a'],
          extra: 'b',
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              arrayConcat(field('tags'), array([constant('extra'), field('extra')])).as(
                'mergedTags',
              ),
            ),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().mergedTags.should.eql(['a', 'extra', 'b']);
      });

      it('lowers countIf boolean predicate through boolean value lowering frames', async function () {
        const { execute, field, constant, countIf, greaterThan } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/countif-bool-frames`,
        );

        await Promise.all([
          setDoc(doc(coll, 'a'), { score: 10 }),
          setDoc(doc(coll, 'b'), { score: 0 }),
          setDoc(doc(coll, 'c'), { score: 5 }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .aggregate({
              accumulators: [countIf(greaterThan(field('score'), constant(0))).as('positiveCount')],
            }),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().positiveCount.should.equal(2);
      });
    });

    describe('exit frame and receiver expression lowering coverage', function () {
      it('lowers vector distance receiver chains with expression vector operands', async function () {
        const { execute, field, cosineDistance, dotProduct } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc, vector } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          embedding: vector([1.0, 0.0, 0.0]),
          query: vector([0.0, 1.0, 0.0]),
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              cosineDistance(field('embedding'), field('query')).as('globalCosDist'),
              field('embedding').dotProduct(field('query')).as('fluentDot'),
              field('embedding').euclideanDistance(field('query')).as('fluentEuclid'),
              dotProduct(field('embedding'), field('query')).as('globalDot'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        should(data.globalCosDist).be.approximately(1, 0.0001);
        should(data.fluentDot).be.approximately(0, 0.0001);
        should(data.fluentEuclid).be.approximately(Math.sqrt(2), 0.0001);
        should(data.globalDot).be.approximately(0, 0.0001);
      });

      it('lowers fluent receiver exit frames with expression map, array, and extrema operands', async function () {
        const { execute, field, logicalMaximum, logicalMinimum } = firestorePipelinesModular;
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          metadata: { theme: 'dark', locale: 'en' },
          keyName: 'theme',
          scores: [10, 25, 40],
          idx: 1,
          bidA: 100,
          bidB: 150,
          bidC: 120,
          askA: 200,
          askB: 175,
          askC: 190,
        });

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              field('metadata').mapGet(field('keyName')).as('fluentMapGet'),
              field('scores').arrayGet(field('idx')).as('fluentArrayGet'),
              field('bidA').logicalMaximum(field('bidB'), field('bidC')).as('fluentMaxBid'),
              field('askA').logicalMinimum(field('askB'), field('askC')).as('fluentMinAsk'),
              logicalMaximum(field('bidA'), field('bidB'), field('bidC')).as('globalMaxBid'),
              logicalMinimum(field('askA'), field('askB'), field('askC')).as('globalMinAsk'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.fluentMapGet.should.equal('dark');
        data.fluentArrayGet.should.equal(25);
        data.fluentMaxBid.should.equal(150);
        data.fluentMinAsk.should.equal(175);
        data.globalMaxBid.should.equal(150);
        data.globalMinAsk.should.equal(175);
      });

      it('lowers boolean receiver and logical exit frames with expression operands', async function () {
        const { execute, field, or, and } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/boolean-receiver-exit-frames`,
        );

        await Promise.all([
          setDoc(doc(coll, 'match-a'), { score: 12, threshold: 10, tier: 'gold', region: 'EU' }),
          setDoc(doc(coll, 'match-b'), { score: 12, threshold: 10, tier: 'silver', region: 'US' }),
          setDoc(doc(coll, 'skip'), { score: 3, threshold: 10, tier: 'bronze', region: 'APAC' }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .where(
              and(
                field('score').greaterThan(field('threshold')),
                or(field('tier').equal('gold'), field('region').equal('US')),
              ),
            )
            .select('score', 'tier', 'region'),
        );

        snapshot.results.should.have.length(2);
        const tiers = snapshot.results.map(row => row.data().tier).sort();
        tiers.should.eql(['gold', 'silver']);
      });
    });

    describe('operand mode rhs shape coverage', function () {
      it('coerces string, array, and boolean rhs shapes in comparisons and arithmetic', async function () {
        const { execute, field, constant, add, multiply, mod, equal, equalAny, greaterThan, and } =
          firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          status: 'active',
          region: 'EU',
          allowed: ['EU', 'US'],
          base: 10,
          bump: true,
          scale: false,
          id: 27,
        });

        if (Platform.other) {
          const macSnapshot = await execute(
            db
              .pipeline()
              .documents([docPath])
              .select(
                equal(field('status'), 'active').as('statusStringRhs'),
                equal(field('status'), constant('active')).as('statusConstRhs'),
                equalAny(field('region'), ['EU', 'US']).as('regionInList'),
                equal(field('bump'), true).as('bumpIsTrue'),
              ),
          );

          macSnapshot.results.should.have.length(1);
          const macData = macSnapshot.results[0].data();
          macData.statusStringRhs.should.equal(true);
          macData.statusConstRhs.should.equal(true);
          macData.regionInList.should.equal(true);
          macData.bumpIsTrue.should.equal(true);
          return;
        }

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              add(field('base'), true).as('basePlusTrue'),
              multiply(field('base'), false).as('baseTimesFalse'),
              mod(field('id'), true).as('modByTrue'),
              equal(field('status'), 'active').as('statusStringRhs'),
              equal(field('status'), constant('active')).as('statusConstRhs'),
              equalAny(field('region'), ['EU', 'US']).as('regionInList'),
              equal(field('bump'), true).as('bumpIsTrue'),
              greaterThan(field('base'), false).as('baseGtFalse'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.basePlusTrue.should.equal(11);
        data.baseTimesFalse.should.equal(0);
        data.modByTrue.should.equal(0);
        data.statusStringRhs.should.equal(true);
        data.statusConstRhs.should.equal(true);
        data.regionInList.should.equal(true);
        data.bumpIsTrue.should.equal(true);
        data.baseGtFalse.should.equal(true);

        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/operand-mode-where`,
        );

        await Promise.all([
          setDoc(doc(coll, 'match'), {
            status: 'active',
            region: 'EU',
            base: 10,
            bump: true,
          }),
          setDoc(doc(coll, 'skip'), {
            status: 'inactive',
            region: 'APAC',
            base: 10,
            bump: true,
          }),
        ]);

        const filtered = await execute(
          db
            .pipeline()
            .collection(coll)
            .where(
              and(
                equal(field('status'), 'active'),
                equalAny(field('region'), ['EU', 'US']),
                greaterThan(field('base'), false),
                equal(field('bump'), true),
              ),
            )
            .select('status', 'region'),
        );

        filtered.results.should.have.length(1);
        filtered.results[0].data().status.should.equal('active');
        filtered.results[0].data().region.should.equal('EU');
      });

      it('coerces bare rhs operands through raw where filters', async function () {
        if (Platform.other) {
          return;
        }

        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/raw-operand-where`,
        );

        await Promise.all([
          setDoc(doc(coll, 'match'), {
            region: 'EU',
            bump: true,
            base: 10,
            status: 'active',
          }),
          setDoc(doc(coll, 'skip-region'), {
            region: 'APAC',
            bump: true,
            base: 10,
            status: 'active',
          }),
          setDoc(doc(coll, 'skip-bump'), {
            region: 'EU',
            bump: false,
            base: 10,
            status: 'active',
          }),
          setDoc(doc(coll, 'skip-base'), {
            region: 'EU',
            bump: true,
            base: 0,
            status: 'active',
          }),
        ]);

        const baseRhsFilter = { operator: '>=', fieldPath: 'base', value: true };

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .where({
              condition: {
                operator: 'AND',
                queries: [
                  { operator: 'IN', fieldPath: 'region', value: ['EU', 'US'] },
                  { operator: '==', fieldPath: 'bump', value: true },
                  baseRhsFilter,
                  { operator: '==', fieldPath: 'status', value: 'active' },
                ],
              },
            })
            .select('region', 'bump', 'base', 'status'),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.region.should.equal('EU');
        data.bump.should.equal(true);
        data.base.should.equal(10);
        data.status.should.equal('active');
      });
    });

    describe('iOS NodeBuilder stage coercion and operand tail coverage', function () {
      it('exercises stage option coercion for findNearest dot product and transform stages', async function () {
        if (Platform.other) {
          return;
        }

        const { execute, field, constant, add, countAll } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc, vector } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/stage-coercion-options`,
        );

        await Promise.all([
          setDoc(doc(coll, 'v1'), {
            name: 'alpha',
            region: 'EU',
            score: 40,
            embedding: vector([1.0, 0.0, 0.0]),
          }),
          setDoc(doc(coll, 'v2'), {
            name: 'beta',
            region: 'EU',
            score: 70,
            embedding: vector([0.0, 1.0, 0.0]),
          }),
          setDoc(doc(coll, 'v3'), {
            name: 'gamma',
            region: 'US',
            score: 55,
            embedding: vector([0.0, 0.0, 1.0]),
          }),
        ]);

        const dotSnapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .findNearest({
              field: 'embedding',
              vectorValue: [1.0, 0.0, 0.0],
              distanceMeasure: 'DOT_PRODUCT',
              limit: 2,
            })
            .select('name'),
        );

        dotSnapshot.results.should.have.length(2);
        dotSnapshot.results[0].data().name.should.equal('alpha');

        const transformSnapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .where(field('region').equal('EU'))
            .addFields(add(field('score'), constant(5)).as('scorePlusFive'))
            .sort(field('scorePlusFive').descending(), field('name').ascending())
            .offset(1)
            .limit(1)
            .select('name', 'scorePlusFive'),
        );

        transformSnapshot.results.should.have.length(1);
        transformSnapshot.results[0].data().name.should.equal('alpha');
        transformSnapshot.results[0].data().scorePlusFive.should.equal(45);

        const groupedSnapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .aggregate({
              accumulators: [countAll().as('rows')],
              groups: [field('region').as('regionKey')],
            })
            .sort(field('regionKey').ascending()),
        );

        groupedSnapshot.results.should.have.length(2);
        groupedSnapshot.results[0].data().regionKey.should.equal('EU');
        groupedSnapshot.results[0].data().rows.should.equal(2);
      });

      it('covers remaining comparison and numeric operand rhs coercion tails', async function () {
        const {
          execute,
          field,
          subtract,
          divide,
          pow,
          equal,
          notEqual,
          lessThanOrEqual,
          greaterThanOrEqual,
          greaterThan,
          and,
        } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

        await setDoc(doc(db, docPath), {
          base: 20,
          divisor: 4,
          exp: 3,
          tag: 'alpha',
          mirrorTag: 'alpha',
          score: 42,
          cap: '50',
          status: 'active',
        });

        if (Platform.other) {
          const macSnapshot = await execute(
            db
              .pipeline()
              .documents([docPath])
              .select(
                subtract(field('base'), true).as('subTrue'),
                divide(field('base'), false).as('divFalse'),
                pow(field('exp'), true).as('powTrue'),
                equal(field('tag'), field('mirrorTag')).as('tagsMatch'),
                equal(field('tag'), 'alpha').as('tagStringRhs'),
                lessThanOrEqual(field('score'), '50').as('scoreLteString'),
              ),
          );

          macSnapshot.results.should.have.length(1);
          const macData = macSnapshot.results[0].data();
          macData.subTrue.should.equal(19);
          macData.divFalse.should.equal(0);
          macData.powTrue.should.equal(3);
          macData.tagsMatch.should.equal(true);
          macData.tagStringRhs.should.equal(true);
          macData.scoreLteString.should.equal(true);
          return;
        }

        if (!Platform.ios) {
          return;
        }

        const snapshot = await execute(
          db
            .pipeline()
            .documents([docPath])
            .select(
              subtract(field('base'), true).as('subTrue'),
              subtract(field('base'), '5').as('subString'),
              divide(field('base'), field('divisor')).as('divField'),
              pow(field('exp'), true).as('powTrue'),
              equal(field('tag'), field('mirrorTag')).as('tagsMatch'),
              equal(field('tag'), 'alpha').as('tagStringRhs'),
              notEqual(field('status'), 'inactive').as('statusActive'),
              lessThanOrEqual(field('score'), '50').as('scoreLteString'),
              greaterThanOrEqual(field('base'), false).as('baseGteFalse'),
            ),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.subTrue.should.equal(19);
        data.subString.should.equal(15);
        data.divField.should.equal(5);
        data.powTrue.should.equal(3);
        data.tagsMatch.should.equal(true);
        data.tagStringRhs.should.equal(true);
        data.statusActive.should.equal(true);
        data.scoreLteString.should.equal(true);
        data.baseGteFalse.should.equal(true);

        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/operand-tail-raw-where`,
        );

        await Promise.all([
          setDoc(doc(coll, 'match'), {
            tag: 'alpha',
            score: 42,
            bump: true,
            status: 'active',
          }),
          setDoc(doc(coll, 'skip-tag'), {
            tag: 'beta',
            score: 42,
            bump: true,
            status: 'active',
          }),
          setDoc(doc(coll, 'skip-score'), {
            tag: 'alpha',
            score: 10,
            bump: false,
            status: 'active',
          }),
        ]);

        const filtered = await execute(
          db
            .pipeline()
            .collection(coll)
            .where({
              condition: {
                operator: 'AND',
                queries: [
                  { operator: '==', fieldPath: 'tag', value: 'alpha' },
                  { operator: '==', fieldPath: 'bump', value: true },
                  { operator: '==', fieldPath: 'status', value: 'active' },
                ],
              },
            })
            .select('tag', 'score', 'status'),
        );

        filtered.results.should.have.length(1);
        filtered.results[0].data().tag.should.equal('alpha');
        filtered.results[0].data().score.should.equal(42);

        const whereSnapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .where(
              and(
                equal(field('tag'), 'alpha'),
                equal(field('status'), 'active'),
                greaterThanOrEqual(field('score'), false),
                greaterThan(field('score'), 20),
              ),
            )
            .select('tag', 'score'),
        );

        whereSnapshot.results.should.have.length(1);
        whereSnapshot.results[0].data().score.should.equal(42);
      });
    });

    describe('aggregate expression argument lowering', function () {
      it('evaluates aggregates with computed expression arguments', async function () {
        const {
          execute,
          field,
          constant,
          add,
          multiply,
          sum,
          average,
          first,
          last,
          minimum,
          maximum,
          arrayAgg,
          arrayAggDistinct,
        } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/agg-expr-args`);

        await Promise.all([
          setDoc(doc(coll, 'a1'), { revenue: 100, bonus: 10, name: 'Alice' }),
          setDoc(doc(coll, 'a2'), { revenue: 200, bonus: 20, name: 'Bob' }),
        ]);

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .aggregate({
              accumulators: [
                sum(add(field('revenue'), field('bonus'))).as('totalWithBonus'),
                average(add(field('revenue'), constant(0))).as('avgRevenue'),
              ],
            }),
        );

        snapshot.results.should.have.length(1);
        const data = snapshot.results[0].data();
        data.totalWithBonus.should.equal(330);
        data.avgRevenue.should.equal(150);

        if (Platform.ios) {
          return;
        }

        const extendedSnapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .aggregate({
              accumulators: [
                first(add(field('bonus'), constant(0))).as('firstBonus'),
                last(add(constant(0), field('bonus'))).as('lastBonus'),
                minimum(multiply(field('revenue'), constant(1))).as('minScaled'),
                maximum(add(field('revenue'), field('bonus'))).as('maxTotal'),
                arrayAgg(add(field('revenue'), field('bonus'))).as('allTotals'),
                arrayAggDistinct(multiply(field('bonus'), constant(1))).as('distinctBonuses'),
              ],
            }),
        );

        extendedSnapshot.results.should.have.length(1);
        const extendedData = extendedSnapshot.results[0].data();
        extendedData.firstBonus.should.equal(10);
        extendedData.lastBonus.should.equal(20);
        extendedData.minScaled.should.equal(100);
        extendedData.maxTotal.should.equal(220);
        [...extendedData.allTotals].sort((a, b) => a - b).should.eql([110, 220]);
        [...extendedData.distinctBonuses].sort((a, b) => a - b).should.eql([10, 20]);
      });
    });
  });

  describe('executor parser and bridge factory coverage', function () {
    describe('source execute paths', function () {
      it('executes database() source with where filter and limit', async function () {
        const { execute, field } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/database-source`);
        const runId = Utils.randString(12, '#aA');

        await setDoc(doc(coll, 'doc-a'), { runId, label: 'database-source-hit' });

        const snapshot = await execute(
          db.pipeline().database().where(field('runId').equal(runId)).select('label').limit(5),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().label.should.equal('database-source-hit');
      });

      it('routes collection and collectionGroup index hint rawOptions through native builder', async function () {
        if (Platform.other || Platform.ios) {
          return;
        }

        const { execute, field } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/coll-hints`);
        const root = `${COLLECTION}/${Utils.randString(12, '#aA')}`;
        const runId = Utils.randString(12, '#aA');

        await Promise.all([
          setDoc(doc(coll, 'hint-a'), { runId, value: 1 }),
          setDoc(doc(db, `${root}/${COLLECTION_GROUP}/grp-a`), { runId, employees: 42 }),
        ]);

        await expectAsyncError(
          () =>
            execute(
              db
                .pipeline()
                .collection({
                  collectionRef: coll,
                  rawOptions: {
                    ignoreIndexFields: ['value'],
                  },
                })
                .where(field('runId').equal(runId))
                .select('value'),
            ),
          ['invalid-argument', 'invalid argument', 'Failed to execute pipeline'],
        );

        await expectAsyncError(
          () =>
            execute(
              db
                .pipeline()
                .collectionGroup({
                  collectionId: COLLECTION_GROUP,
                  rawOptions: {
                    ignoreIndexFields: ['employees'],
                  },
                })
                .where(field('runId').equal(runId))
                .select('employees'),
            ),
          ['invalid-argument', 'invalid argument', 'Failed to execute pipeline'],
        );
      });

      it('executes createFrom(query) with composite and array filter operands', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc, query, where, orderBy, limit } =
          firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/query-source-operands`,
        );
        const runId = Utils.randString(12, '#aA');

        await Promise.all([
          setDoc(doc(coll, 'match'), { runId, score: 90, tier: 1 }),
          setDoc(doc(coll, 'skip-score'), { runId, score: 10, tier: 1 }),
        ]);

        const querySource = query(
          coll,
          where('runId', '==', runId),
          where('score', '>=', 50),
          orderBy('score', 'desc'),
          limit(5),
        );

        const snapshot = await execute(db.pipeline().createFrom(querySource).select('score'));

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().score.should.equal(90);
      });
    });

    describe('stage execute paths', function () {
      it('executes sample stage with percentage', async function () {
        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(db, `${COLLECTION}/${Utils.randString(12, '#aA')}/sample-percent`);

        await Promise.all(
          Array.from({ length: 10 }, (_, index) =>
            setDoc(doc(coll, `doc-${index}`), { slot: index }),
          ),
        );

        const snapshot = await execute(
          db.pipeline().collection(coll).sample({ percentage: 0.5 }).select('slot'),
        );

        snapshot.results.length.should.be.greaterThan(0);
        snapshot.results.length.should.be.lessThanOrEqual(10);
      });

      it('executes findNearest basic and distanceField option paths', async function () {
        if (Platform.other) {
          return;
        }

        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc, vector } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/find-nearest-options`,
        );

        await Promise.all([
          setDoc(doc(coll, 'near'), { name: 'near', embedding: vector([1.0, 0.0, 0.0]) }),
          setDoc(doc(coll, 'far'), { name: 'far', embedding: vector([0.0, 1.0, 0.0]) }),
        ]);

        const basicSnapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .findNearest({
              field: 'embedding',
              vectorValue: [1.0, 0.0, 0.0],
              distanceMeasure: 'COSINE',
            })
            .select('name'),
        );

        basicSnapshot.results.should.have.length(2);
        basicSnapshot.results[0].data().name.should.equal('near');

        const distanceFieldSnapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .findNearest({
              field: 'embedding',
              vectorValue: [1.0, 0.0, 0.0],
              distanceMeasure: 'EUCLIDEAN',
              limit: 1,
              distanceField: 'matchDistance',
            })
            .select('name', 'matchDistance'),
        );

        distanceFieldSnapshot.results.should.have.length(1);
        distanceFieldSnapshot.results[0].data().name.should.equal('near');
        should(distanceFieldSnapshot.results[0].data().matchDistance).be.a.Number();
      });

      it('executes unnest options-object overload', async function () {
        if (Platform.other) {
          return;
        }

        const { execute, field } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/unnest-options-object`,
        );

        await setDoc(doc(coll, 'u1'), { name: 'A', scores: [5, 7] });

        const unnestSnapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .where(field('name').equal('A'))
            .unnest({ selectable: field('scores').as('score'), indexField: 'attempt' })
            .sort(field('name').ascending(), field('attempt').ascending())
            .select('name', 'score', 'attempt'),
        );

        unnestSnapshot.results.should.have.length(2);
        unnestSnapshot.results[0].data().attempt.should.equal(0);
        unnestSnapshot.results[1].data().attempt.should.equal(1);
      });

      it('routes rawStage through native bridge factory', async function () {
        if (Platform.other || Platform.ios) {
          return;
        }

        const { execute, field } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/raw-stage-bridge`,
        );

        await setDoc(doc(coll, 'base'), { rating: 4, boost: 1 });

        await expectAsyncError(
          () =>
            execute(
              db
                .pipeline()
                .collection(coll)
                .rawStage(
                  'score',
                  {
                    input: field('rating'),
                    threshold: 4,
                  },
                  { enabled: true },
                )
                .select('rating'),
            ),
          ['invalid-argument', 'Failed to execute pipeline', 'firestore/'],
        );
      });
    });

    describe('native validation error paths', function () {
      it('rejects invalid findNearest distanceMeasure at native boundary', async function () {
        if (Platform.other) {
          return;
        }

        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc, vector } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/find-nearest-invalid-measure`,
        );

        await setDoc(doc(coll, 'vec'), { embedding: vector([1.0, 0.0, 0.0]) });

        await expectAsyncError(
          () =>
            execute(
              db
                .pipeline()
                .collection(coll)
                .findNearest({
                  field: 'embedding',
                  vectorValue: [1.0, 0.0, 0.0],
                  distanceMeasure: 'INVALID_MEASURE',
                })
                .select('embedding'),
            ),
          [
            'pipelineExecute() expected stage.options.distanceMeasure to be one of COSINE, EUCLIDEAN, DOT_PRODUCT.',
            'pipelineExecute() expected stage.options.distanceMeasure to be one of euclidean, cosine, or dot_product.',
            'invalid-argument',
            'Failed to execute pipeline',
          ],
        );
      });

      it('rejects empty addFields and removeFields at validation boundary', async function () {
        if (Platform.other) {
          return;
        }

        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/native-empty-field-stages`,
        );

        await setDoc(doc(coll, 'base'), { value: 1 });

        await expectAsyncError(
          () => execute(db.pipeline().collection(coll).addFields()),
          'pipelineExecute() expected stage.options.fields to contain at least one value.',
        );

        await expectAsyncError(
          () => execute(db.pipeline().collection(coll).removeFields()),
          'pipelineExecute() expected stage.options.fields to contain at least one value.',
        );
      });

      it('normalizes findNearest DOTPRODUCT distance measure alias', async function () {
        if (Platform.other) {
          return;
        }

        const { execute } = firestorePipelinesModular;
        const { getFirestore, collection, doc, setDoc, vector } = firestoreModular;
        const db = getFirestore(DATABASE_ID);
        const coll = collection(
          db,
          `${COLLECTION}/${Utils.randString(12, '#aA')}/find-nearest-dot-product`,
        );

        await setDoc(doc(coll, 'vec'), { name: 'dot', embedding: vector([1.0, 0.0, 0.0]) });

        const snapshot = await execute(
          db
            .pipeline()
            .collection(coll)
            .findNearest({
              field: 'embedding',
              vectorValue: [1.0, 0.0, 0.0],
              distanceMeasure: 'DOTPRODUCT',
              limit: 1,
            })
            .select('name'),
        );

        snapshot.results.should.have.length(1);
        snapshot.results[0].data().name.should.equal('dot');
      });
    });
  });

  describe('pathological subqueries and recursion', function () {
    it('evaluates a scalar subquery with a where filter and multiple accumulators', async function () {
      const { execute, field, constant, subcollection, average, countAll, sum, greaterThan } =
        firestorePipelinesModular;
      const { getFirestore, doc, setDoc } = firestoreModular;
      const db = getFirestore(DATABASE_ID);
      const base = `${COLLECTION}/${Utils.randString(12, '#aA')}/subquery-filter`;
      const parentPath = `${base}/restaurant-a`;

      await setDoc(doc(db, parentPath), { name: 'Pizza Place' });
      await Promise.all([
        setDoc(doc(db, `${parentPath}/reviews/r1`), { rating: 2 }),
        setDoc(doc(db, `${parentPath}/reviews/r2`), { rating: 4 }),
        setDoc(doc(db, `${parentPath}/reviews/r3`), { rating: 5 }),
      ]);

      const snapshot = await execute(
        db
          .pipeline()
          .collection(base)
          .addFields(
            subcollection('reviews')
              .where(greaterThan(field('rating'), constant(3)))
              .aggregate(countAll().as('n'), average('rating').as('avg'), sum('rating').as('total'))
              .toScalarExpression()
              .as('goodReviews'),
          )
          .select('name', field('goodReviews')),
      );

      snapshot.results.should.have.length(1);
      const data = snapshot.results[0].data();
      data.name.should.equal('Pizza Place');
      data.goodReviews.n.should.equal(2);
      data.goodReviews.avg.should.equal(4.5);
      data.goodReviews.total.should.equal(9);
    });

    it('evaluates an array subquery (toArrayExpression) over a subcollection', async function () {
      const { execute, field, subcollection, ascending } = firestorePipelinesModular;
      const { getFirestore, doc, setDoc } = firestoreModular;
      const db = getFirestore(DATABASE_ID);
      const base = `${COLLECTION}/${Utils.randString(12, '#aA')}/subquery-array`;
      const parentPath = `${base}/restaurant-a`;

      await setDoc(doc(db, parentPath), { name: 'Pizza Place' });
      await Promise.all([
        setDoc(doc(db, `${parentPath}/reviews/r1`), { rating: 5 }),
        setDoc(doc(db, `${parentPath}/reviews/r2`), { rating: 3 }),
        setDoc(doc(db, `${parentPath}/reviews/r3`), { rating: 4 }),
      ]);

      const snapshot = await execute(
        db
          .pipeline()
          .collection(base)
          .addFields(
            subcollection('reviews')
              .sort(ascending(field('rating')))
              .select('rating')
              .toArrayExpression()
              .as('reviewDocs'),
          )
          .select('name', field('reviewDocs')),
      );

      snapshot.results.should.have.length(1);
      const data = snapshot.results[0].data();
      data.name.should.equal('Pizza Place');
      Array.isArray(data.reviewDocs).should.equal(true);
      data.reviewDocs.should.have.length(3);
      // A single-field select() inside an array subquery yields the scalar values.
      data.reviewDocs.should.deepEqual([3, 4, 5]);
    });

    it('evaluates sibling scalar + array subqueries in one addFields', async function () {
      const { execute, field, subcollection, countAll, average, ascending } =
        firestorePipelinesModular;
      const { getFirestore, doc, setDoc } = firestoreModular;
      const db = getFirestore(DATABASE_ID);
      const base = `${COLLECTION}/${Utils.randString(12, '#aA')}/subquery-siblings`;
      const parentPath = `${base}/restaurant-a`;

      await setDoc(doc(db, parentPath), { name: 'Pizza Place' });
      await Promise.all([
        setDoc(doc(db, `${parentPath}/reviews/r1`), { rating: 4 }),
        setDoc(doc(db, `${parentPath}/reviews/r2`), { rating: 5 }),
      ]);

      const snapshot = await execute(
        db
          .pipeline()
          .collection(base)
          .addFields(
            subcollection('reviews')
              .aggregate(countAll().as('count'), average('rating').as('avg'))
              .toScalarExpression()
              .as('summary'),
            subcollection('reviews')
              .sort(ascending(field('rating')))
              .select('rating')
              .toArrayExpression()
              .as('reviewDocs'),
          )
          .select('name', field('summary'), field('reviewDocs')),
      );

      snapshot.results.should.have.length(1);
      const data = snapshot.results[0].data();
      data.summary.count.should.equal(2);
      data.summary.avg.should.equal(4.5);
      Array.isArray(data.reviewDocs).should.equal(true);
      data.reviewDocs.should.deepEqual([4, 5]);
    });

    it('evaluates a deeply nested arithmetic expression without hanging analysis', async function () {
      // A 30-deep add() chain must parse + execute quickly and return the exact sum.
      const { execute, field, add, constant } = firestorePipelinesModular;
      const { getFirestore, doc, setDoc } = firestoreModular;
      const db = getFirestore(DATABASE_ID);
      const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;

      await setDoc(doc(db, docPath), { x: 1 });

      const depth = 30;
      let expr = constant(0);
      for (let i = 0; i < depth; i++) {
        expr = add(field('x'), expr);
      }

      const snapshot = await execute(db.pipeline().documents([docPath]).select(expr.as('deepSum')));

      snapshot.results.should.have.length(1);
      snapshot.results[0].data().deepSum.should.equal(depth);
    });
  });
});
