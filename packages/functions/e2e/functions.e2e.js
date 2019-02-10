/* eslint-disable import/no-extraneous-dependencies */
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

const { SAMPLE_DATA } = require('@react-native-firebase/tests-firebase-functions');

describe('functions()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.functions);
      app.functions().httpsCallable.should.be.a.Function();
    });

    xit('throws if app arg provided to firebase.functions(APP)', {
      // TODO
    });

    it('accepts passing in an FirebaseApp instance as first arg', async () => {
      const appName = `functionsApp${FirebaseHelpers.id}1`;
      const platformAppConfig = FirebaseHelpers.app.config();
      const app = await firebase.initializeApp(platformAppConfig, appName);

      const functionsForApp = firebase.functions(app);

      functionsForApp.app.should.equal(app);
      functionsForApp.app.name.should.equal(app.name);

      // check from an app
      app.functions().app.should.equal(app);
      app.functions().app.name.should.equal(app.name);
    });

    it('accepts passing in a region string as first arg to an app', async () => {
      const region = 'europe-west1';
      const functionsForRegion = firebase.app().functions(region);

      functionsForRegion._customUrlOrRegion.should.equal(region);
      functionsForRegion.app.should.equal(firebase.app());
      functionsForRegion.app.name.should.equal(firebase.app().name);

      firebase
        .app()
        .functions(region)
        .app.should.equal(firebase.app());

      firebase
        .app()
        .functions(region)
        ._customUrlOrRegion.should.equal(region);

      const functionRunner = functionsForRegion.httpsCallable('testFunctionCustomRegion');

      const response = await functionRunner();
      response.data.should.equal(region);
    });
  });

  describe('httpsCallable(fnName)(args)', () => {
    it('accepts primitive args: undefined', async () => {
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');
      const response = await functionRunner();
      response.data.should.equal('null');
    });

    it('accepts primitive args: string', async () => {
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');
      const response = await functionRunner('hello');
      response.data.should.equal('string');
    });

    it('accepts primitive args: number', async () => {
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');
      const response = await functionRunner(123);
      response.data.should.equal('number');
    });

    it('accepts primitive args: boolean', async () => {
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');
      const response = await functionRunner(true);
      response.data.should.equal('boolean');
    });

    it('accepts primitive args: null', async () => {
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');
      const response = await functionRunner(null);
      response.data.should.equal('null');
    });

    it('accepts array args', async () => {
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');
      const response = await functionRunner([1, 2, 3, 4]);
      response.data.should.equal('array');
    });

    it('accepts object args', async () => {
      const type = 'object';
      const inputData = SAMPLE_DATA[type];
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');
      const { data: outputData } = await functionRunner({
        type,
        inputData,
      });
      should.deepEqual(outputData, inputData);
    });

    it('accepts complex nested objects', async () => {
      const type = 'deepObject';
      const inputData = SAMPLE_DATA[type];
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');
      const { data: outputData } = await functionRunner({
        type,
        inputData,
      });
      should.deepEqual(outputData, inputData);
    });

    it('accepts complex nested arrays', async () => {
      const type = 'deepArray';
      const inputData = SAMPLE_DATA[type];
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');
      const { data: outputData } = await functionRunner({
        type,
        inputData,
      });
      should.deepEqual(outputData, inputData);
    });
  });

  describe('HttpsError', () => {
    it('errors return instance of HttpsError', async () => {
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');

      try {
        await functionRunner({});
        return Promise.reject(new Error('Function did not reject with error.'));
      } catch (e) {
        should.equal(e.details, null);
        e.code.should.equal('invalid-argument');
        e.message.should.equal('Invalid test requested.');
      }

      return Promise.resolve();
    });

    it('HttpsError.details -> allows returning complex data', async () => {
      let type = 'deepObject';
      let inputData = SAMPLE_DATA[type];
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');
      try {
        await functionRunner({
          type,
          inputData,
          asError: true,
        });
        return Promise.reject(new Error('Function did not reject with error.'));
      } catch (e) {
        should.deepEqual(e.details, inputData);
        e.code.should.equal('cancelled');
        e.message.should.equal(
          'Response data was requested to be sent as part of an Error payload, so here we are!',
        );
      }

      type = 'deepArray';
      inputData = SAMPLE_DATA[type];
      try {
        await functionRunner({
          type,
          inputData,
          asError: true,
        });
        return Promise.reject(new Error('Function did not reject with error.'));
      } catch (e) {
        should.deepEqual(e.details, inputData);
        e.code.should.equal('cancelled');
        e.message.should.equal(
          'Response data was requested to be sent as part of an Error payload, so here we are!',
        );
      }

      return Promise.resolve();
    });

    it('HttpsError.details -> allows returning primitives', async () => {
      let type = 'number';
      let inputData = SAMPLE_DATA[type];
      const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegion');
      try {
        await functionRunner({
          type,
          inputData,
          asError: true,
        });
        return Promise.reject(new Error('Function did not reject with error.'));
      } catch (e) {
        e.code.should.equal('cancelled');
        e.message.should.equal(
          'Response data was requested to be sent as part of an Error payload, so here we are!',
        );
        should.deepEqual(e.details, inputData);
      }

      type = 'string';
      inputData = SAMPLE_DATA[type];
      try {
        await functionRunner({
          type,
          inputData,
          asError: true,
        });
        return Promise.reject(new Error('Function did not reject with error.'));
      } catch (e) {
        should.deepEqual(e.details, inputData);
        e.code.should.equal('cancelled');
        e.message.should.equal(
          'Response data was requested to be sent as part of an Error payload, so here we are!',
        );
      }

      type = 'boolean';
      inputData = SAMPLE_DATA[type];
      try {
        await functionRunner({
          type,
          inputData,
          asError: true,
        });
        return Promise.reject(new Error('Function did not reject with error.'));
      } catch (e) {
        should.deepEqual(e.details, inputData);
        e.code.should.equal('cancelled');
        e.message.should.equal(
          'Response data was requested to be sent as part of an Error payload, so here we are!',
        );
      }

      type = 'null';
      inputData = SAMPLE_DATA[type];
      try {
        await functionRunner({
          type,
          inputData,
          asError: true,
        });
        return Promise.reject(new Error('Function did not reject with error.'));
      } catch (e) {
        should.deepEqual(e.details, inputData);
        e.code.should.equal('cancelled');
        e.message.should.equal(
          'Response data was requested to be sent as part of an Error payload, so here we are!',
        );
      }

      return Promise.resolve();
    });
  });
});
