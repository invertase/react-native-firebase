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

require('@react-native-firebase/firestore/pipelines');

const { execute } = require('@react-native-firebase/firestore/pipelines');

const COLLECTION = 'firestore';

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
      const db = firebase.firestore();
      const collectionName = `${COLLECTION}/${Utils.randString(12, '#aA')}/pipeline-order`;
      const collectionRef = db.collection(collectionName);
      const querySource = collectionRef.where('score', '>=', 10).orderBy('score', 'desc').limit(2);

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

      pipelineFromCollection.serialize().source.should.deep.equal({
        source: 'collection',
        path: collectionRef.path,
      });

      pipelineFromCollection.serialize().stages.should.deep.equal([
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

      pipelineFromGroup.serialize().source.should.deep.equal({
        source: 'collectionGroup',
        collectionId: 'pipeline-order-sub',
      });

      pipelineFromDatabase.serialize().source.should.deep.equal({
        source: 'database',
        rawOptions: { explain: true },
      });

      pipelineFromDocuments.serialize().source.should.deep.equal({
        source: 'documents',
        documents: [`${collectionName}/one`, `${collectionName}/two`],
      });

      pipelineFromQuery.serialize().source.source.should.equal('query');
      pipelineFromQuery.serialize().source.path.should.equal(collectionRef.path);
      pipelineFromQuery.serialize().source.queryType.should.equal('collection');
      pipelineFromQuery.serialize().source.filters.should.have.length(1);
      pipelineFromQuery.serialize().source.orders.should.have.length(1);
      pipelineFromQuery.serialize().source.options.should.deep.equal({ limit: 2 });
    });

    it('forwards execute options and parses pipeline results', async function () {
      const db = firebase.firestore();
      const originalPipelineExecute = db.native.pipelineExecute;

      let capturedPipeline;
      let capturedOptions;

      db.native.pipelineExecute = async function pipelineExecute(pipeline, options) {
        capturedPipeline = pipeline;
        capturedOptions = options;

        return {
          executionTime: { seconds: 1735689600, nanoseconds: 123456789 },
          results: [
            {
              path: 'firestore/pipeline-doc',
              data: {
                score: 42,
                nested: { ok: true },
              },
              createTime: [1735689601, 100],
              updateTime: 1735689602000,
            },
          ],
        };
      };

      try {
        const pipeline = db
          .pipeline()
          .documents(['firestore/pipeline-doc'])
          .select('score', 'nested');

        const snapshot = await execute({
          pipeline,
          indexMode: 'recommended',
          rawOptions: { requestLabel: 'e2e' },
        });

        capturedPipeline.source.should.deep.equal({
          source: 'documents',
          documents: ['firestore/pipeline-doc'],
        });
        capturedPipeline.stages.should.have.length(1);
        capturedPipeline.stages[0].stage.should.equal('select');
        capturedPipeline.stages[0].options.selections.should.deep.equal(['score', 'nested']);

        capturedOptions.should.deep.equal({
          indexMode: 'recommended',
          rawOptions: { requestLabel: 'e2e' },
        });

        snapshot.results.should.have.length(1);
        snapshot.executionTime.toMillis().should.equal(1735689600123);

        const first = snapshot.results[0];
        first.id.should.equal('pipeline-doc');
        first.ref.path.should.equal('firestore/pipeline-doc');
        first.data().should.deep.equal({ score: 42, nested: { ok: true } });
        first.get('nested.ok').should.equal(true);
        first.createTime.toMillis().should.equal(1735689601000);
        first.updateTime.toMillis().should.equal(1735689602000);
      } finally {
        db.native.pipelineExecute = originalPipelineExecute;
      }
    });

    it('throws helpful validation errors for invalid source arguments', function () {
      const db = firebase.firestore();

      (() => db.pipeline().documents([])).should.throw(
        'firebase.firestore().pipeline().documents(*) expected at least one document path or DocumentReference.',
      );

      (() => db.pipeline().collection('')).should.throw(
        'firebase.firestore().pipeline().collection(*) expected a non-empty string.',
      );
    });

    it('returns an unsupported error when native pipeline execution is unavailable', async function () {
      const db = firebase.firestore();
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
});
