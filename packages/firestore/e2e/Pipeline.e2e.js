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

describe('FirestorePipeline', function () {
  describe('v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

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
      if (!Platform.android) {
        this.skip();
      }

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

    it('returns an unsupported error when native pipeline execution is unavailable', async function () {
      const { execute } = firestorePipelinesModular;
      const { getFirestore } = firestoreModular;
      if (Platform.android) {
        this.skip();
      }

      const db = getFirestore(DATABASE_ID);
      const pipeline = db
        .pipeline()
        .collection(`${COLLECTION}/${Utils.randString(12, '#aA')}/unsupported`);

      try {
        await execute(pipeline);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.code.should.match(/^firestore\//);
        error.message.toLowerCase().should.containEql('pipelines are not supported');
      }
    });
  });

  describe('android native execution', function () {
    beforeEach(function () {
      if (!Platform.android) {
        this.skip();
      }
    });

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

    it('executes method-style expressions through Android bridge', async function () {
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
});
