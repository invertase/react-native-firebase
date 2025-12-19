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

// Keep this in sync with the data in:
// https://github.com/invertase/react-native-firebase/blob/main/.github/workflows/scripts/functions/src/sample-data.ts
const SAMPLE_DATA = {
  number: 1234,
  string: 'acde',
  boolean: true,
  null: null,
  object: {
    number: 1234,
    string: 'acde',
    boolean: true,
    null: null,
  },
  array: [1234, 'acde', true, null],
  deepObject: {
    array: [1234, 'acde', false, null],
    object: {
      number: 1234,
      string: 'acde',
      boolean: true,
      null: null,
      array: [1234, 'acde', true, null],
    },
    number: 1234,
    string: 'acde',
    boolean: true,
    null: null,
  },
  deepArray: [
    1234,
    'acde',
    true,
    null,
    [1234, 'acde', true, null],
    {
      number: 1234,
      string: 'acde',
      boolean: true,
      null: null,
      array: [1234, 'acde', true, null],
    },
  ],
  deepMap: {
    number: 123,
    string: 'foo',
    booleanTrue: true,
    booleanFalse: false,
    null: null,
    list: ['1', 2, true, false],
    map: {
      number: 123,
      string: 'foo',
      booleanTrue: true,
      booleanFalse: false,
      null: null,
    },
  },
  deepList: [
    '1',
    2,
    true,
    false,
    ['1', 2, true, false],
    {
      number: 123,
      string: 'foo',
      booleanTrue: true,
      booleanFalse: false,
      null: null,
    },
  ],
};

describe('functions() modular', function () {
  describe('firebase v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    describe('namespace', function () {
      it('accepts passing in an FirebaseApp instance as first arg', async function () {
        const appName = `functionsApp${FirebaseHelpers.id}2`;
        const platformAppConfig = FirebaseHelpers.app.config();
        const app = await firebase.initializeApp(platformAppConfig, appName);

        const functionsForApp = firebase.functions(app);

        functionsForApp.app.should.equal(app);
        functionsForApp.app.name.should.equal(app.name);

        // check from an app
        app.functions().app.should.equal(app);
        app.functions().app.name.should.equal(app.name);
      });

      it('accepts passing in a region string as first arg to an app', async function () {
        const region = 'europe-west1';
        const functionsForRegion = firebase.app().functions(region);

        functionsForRegion._customUrlOrRegion.should.equal(region);
        functionsForRegion.app.should.equal(firebase.app());
        functionsForRegion.app.name.should.equal(firebase.app().name);

        firebase.app().functions(region).app.should.equal(firebase.app());

        firebase.app().functions(region)._customUrlOrRegion.should.equal(region);

        const functionRunner = functionsForRegion.httpsCallable('testFunctionCustomRegion');

        const response = await functionRunner();
        response.data.should.equal(region);
      });

      it('accepts passing in a custom url string as first arg to an app', async function () {
        const customUrl = 'https://us-central1-react-native-firebase-testing.cloudfunctions.net';
        const functionsForCustomUrl = firebase.app().functions(customUrl);

        functionsForCustomUrl._customUrlOrRegion.should.equal(customUrl);
        functionsForCustomUrl.app.should.equal(firebase.app());
        functionsForCustomUrl.app.name.should.equal(firebase.app().name);

        functionsForCustomUrl.app.should.equal(firebase.app());

        functionsForCustomUrl._customUrlOrRegion.should.equal(customUrl);

        const functionRunner = functionsForCustomUrl.httpsCallable('testFunctionDefaultRegionV2');

        const response = await functionRunner();
        response.data.should.equal('null');
      });
    });

    describe('emulator', function () {
      it('configures functions emulator via deprecated method with no port', async function () {
        const region = 'us-central1';
        const fnName = 'helloWorldV2';
        const functions = firebase.app().functions(region);
        functions.useFunctionsEmulator('http://localhost');
        const response = await functions.httpsCallable(fnName)();
        response.data.should.equal('Hello from Firebase!');
      });

      it('configures functions emulator via deprecated method with port', async function () {
        const region = 'us-central1';
        const fnName = 'helloWorldV2';
        const functions = firebase.app().functions(region);
        functions.useFunctionsEmulator('http://localhost:5001');
        const response = await functions.httpsCallable(fnName)();
        response.data.should.equal('Hello from Firebase!');
      });

      it('configures functions emulator', async function () {
        const region = 'us-central1';
        const fnName = 'helloWorldV2';
        const functions = firebase.app().functions(region);
        functions.useEmulator('localhost', 5001);
        const response = await functions.httpsCallable(fnName)();
        response.data.should.equal('Hello from Firebase!');
      });
    });

    describe('httpsCallableFromUrl()', function () {
      it('Calls a function by URL', async function () {
        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }
        const functionRunner = firebase
          .functions()
          .httpsCallableFromUrl(
            `http://${hostname}:5001/react-native-firebase-testing/us-central1/helloWorldV2`,
          );
        const response = await functionRunner();
        response.data.should.equal('Hello from Firebase!');
      });
    });

    describe('httpsCallable(fnName)(args)', function () {
      it('accepts primitive args: undefined', async function () {
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');
        const response = await functionRunner();
        response.data.should.equal('null');
      });

      it('accepts primitive args: string', async function () {
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');
        const response = await functionRunner('hello');
        response.data.should.equal('string');
      });

      it('accepts primitive args: number', async function () {
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');
        const response = await functionRunner(123);
        response.data.should.equal('number');
      });

      it('accepts primitive args: boolean', async function () {
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');
        const response = await functionRunner(true);
        response.data.should.equal('boolean');
      });

      it('accepts primitive args: null', async function () {
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');
        const response = await functionRunner(null);
        response.data.should.equal('null');
      });

      it('accepts array args', async function () {
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');
        const response = await functionRunner([1, 2, 3, 4]);
        response.data.should.equal('array');
      });

      it('accepts object args', async function () {
        const type = 'object';
        const inputData = SAMPLE_DATA[type];
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');
        const { data: outputData } = await functionRunner({
          type,
          inputData,
        });
        should.deepEqual(outputData, inputData);
      });

      it('accepts complex nested objects', async function () {
        const type = 'deepObject';
        const inputData = SAMPLE_DATA[type];
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');
        const { data: outputData } = await functionRunner({
          type,
          inputData,
        });
        should.deepEqual(outputData, inputData);
      });

      it('accepts complex nested arrays', async function () {
        const type = 'deepArray';
        const inputData = SAMPLE_DATA[type];
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');
        const { data: outputData } = await functionRunner({
          type,
          inputData,
        });
        should.deepEqual(outputData, inputData);
      });
    });

    describe('HttpsError', function () {
      it('errors return instance of HttpsError', async function () {
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');

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

      it('HttpsError.details -> allows returning complex data', async function () {
        let type = 'deepObject';
        let inputData = SAMPLE_DATA[type];
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');
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

      it('HttpsError.details -> allows returning primitives', async function () {
        let type = 'number';
        let inputData = SAMPLE_DATA[type];
        const functionRunner = firebase.functions().httpsCallable('testFunctionDefaultRegionV2');
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

      it('HttpsCallableOptions.timeout will error when timeout is exceeded', async function () {
        const functionRunner = firebase.functions().httpsCallable('sleeperV2', { timeout: 1000 });
        try {
          await functionRunner({ delay: 3000 });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          if (Platform.other) {
            error.message.should.containEql('deadline-exceeded');
          } else {
            error.message.should.containEql('DEADLINE').containEql('EXCEEDED');
          }
          return Promise.resolve();
        }
      });
    });

    describe('httpsCallable.stream()', function () {
      // NOTE: The Firebase Functions emulator does not currently support streaming callables,
      // even though the SDK APIs exist. These tests verify the API surface exists and will
      // be updated to test actual streaming behavior once emulator support is added.
      // See: packages/functions/STREAMING_STATUS.md

      it('stream method exists on httpsCallable', function () {
        const functionRunner = firebase.functions().httpsCallable('testStreamingCallable');

        should.exist(functionRunner.stream);
        functionRunner.stream.should.be.a.Function();
      });

      it('stream method returns a function (unsubscribe)', function () {
        const functions = firebase.functions();
        functions.useEmulator('localhost', 5001);
        const functionRunner = functions.httpsCallable('testStreamingCallable');

        const unsubscribe = functionRunner.stream({ count: 2 }, () => {});

        should.exist(unsubscribe);
        unsubscribe.should.be.a.Function();

        // Clean up
        unsubscribe();
      });

      it('unsubscribe function can be called multiple times safely', function () {
        const functions = firebase.functions();
        functions.useEmulator('localhost', 5001);
        const functionRunner = functions.httpsCallable('testStreamingCallable');

        const unsubscribe = functionRunner.stream({ count: 2 }, () => {});

        // Should not throw
        unsubscribe();
        unsubscribe();
        unsubscribe();
      });

      it('stream method accepts data and callback parameters', function () {
        const functions = firebase.functions();
        functions.useEmulator('localhost', 5001);
        const functionRunner = functions.httpsCallable('testStreamingCallable');

        const unsubscribe = functionRunner.stream({ count: 2, delay: 100 }, _event => {
          // Callback will be invoked when streaming works
        });

        should.exist(unsubscribe);
        unsubscribe();
      });

      it('stream method accepts options parameter', function () {
        const functions = firebase.functions();
        functions.useEmulator('localhost', 5001);
        const functionRunner = functions.httpsCallable('testStreamingCallable');

        const unsubscribe = functionRunner.stream({ count: 2 }, () => {}, { timeout: 5000 });

        should.exist(unsubscribe);
        unsubscribe();
      });

      // Skipped until emulator supports streaming
      xit('receives streaming data chunks', function (done) {
        this.timeout(10000);

        const functions = firebase.functions();
        functions.useEmulator('localhost', 5001);
        const events = [];
        const functionRunner = functions.httpsCallable('testStreamingCallable');

        const unsubscribe = functionRunner.stream({ count: 3, delay: 200 }, event => {
          events.push(event);

          if (event.done) {
            try {
              events.length.should.be.greaterThan(1);
              const dataEvents = events.filter(e => e.data && !e.done);
              dataEvents.length.should.be.greaterThan(0);
              const doneEvent = events[events.length - 1];
              doneEvent.done.should.equal(true);
              unsubscribe();
              done();
            } catch (e) {
              unsubscribe();
              done(e);
            }
          }
        });
      });

      it('stream method exists on httpsCallableFromUrl', function () {
        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }

        const functionRunner = firebase
          .functions()
          .httpsCallableFromUrl(
            `http://${hostname}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`,
          );

        should.exist(functionRunner.stream);
        functionRunner.stream.should.be.a.Function();
      });
    });
  });

  describe('modular', function () {
    describe('getFunctions', function () {
      it('pass app as argument', function () {
        const { getApp } = modular;
        const { getFunctions } = functionsModular;
        const functions = getFunctions(getApp());
        functions.constructor.name.should.be.equal('FirebaseFunctionsModule');
      });

      it('no app as argument', function () {
        const { getFunctions } = functionsModular;
        const functions = getFunctions();
        functions.constructor.name.should.be.equal('FirebaseFunctionsModule');
      });
    });

    it('accepts passing in an FirebaseApp instance as first arg', async function () {
      const { initializeApp } = modular;
      const { getFunctions } = functionsModular;
      const appName = `functionsApp${FirebaseHelpers.id}3`;
      const platformAppConfig = FirebaseHelpers.app.config();
      const app = await initializeApp(platformAppConfig, appName);
      const functions = getFunctions(app);

      functions.app.should.equal(app);
      functions.app.name.should.equal(app.name);

      // check from an app
      app.functions().app.should.equal(app);
      app.functions().app.name.should.equal(app.name);
    });

    it('accepts passing in a region string as first arg to an app', async function () {
      const { getApp } = modular;
      const { getFunctions, httpsCallable } = functionsModular;
      const region = 'europe-west1';

      const functionsForRegion = getFunctions(getApp(), region);

      functionsForRegion._customUrlOrRegion.should.equal(region);
      functionsForRegion.app.should.equal(getApp());
      functionsForRegion.app.name.should.equal(getApp().name);

      getApp().functions(region).app.should.equal(getApp());

      getApp().functions(region)._customUrlOrRegion.should.equal(region);

      const functionRunner = httpsCallable(functionsForRegion, 'testFunctionCustomRegion');

      const response = await functionRunner();
      response.data.should.equal(region);
    });

    it('accepts passing in a custom url string as first arg to an app', async function () {
      const { getApp } = modular;
      const { getFunctions, httpsCallable } = functionsModular;
      const customUrl = 'https://us-central1-react-native-firebase-testing.cloudfunctions.net';

      const functionsForCustomUrl = getFunctions(getApp(), customUrl);

      functionsForCustomUrl._customUrlOrRegion.should.equal(customUrl);
      functionsForCustomUrl.app.should.equal(getApp());
      functionsForCustomUrl.app.name.should.equal(getApp().name);

      functionsForCustomUrl.app.should.equal(getApp());

      functionsForCustomUrl._customUrlOrRegion.should.equal(customUrl);

      const functionRunner = httpsCallable(functionsForCustomUrl, 'testFunctionDefaultRegionV2');

      const response = await functionRunner();
      response.data.should.equal('null');
    });

    describe('emulator', function () {
      it('configures functions emulator via deprecated method with no port', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable, connectFunctionsEmulator } = functionsModular;
        const region = 'us-central1';
        const fnName = 'helloWorldV2';
        // const functions = firebase.app().functions(region);
        const functions = getFunctions(getApp(), region);
        connectFunctionsEmulator(functions, 'localhost', 5001);
        const response = await httpsCallable(functions, fnName)();
        response.data.should.equal('Hello from Firebase!');
      });

      it('configures functions emulator via deprecated method with port', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable, connectFunctionsEmulator } = functionsModular;
        const region = 'us-central1';
        const fnName = 'helloWorldV2';
        const functions = getFunctions(getApp(), region);
        connectFunctionsEmulator(functions, 'localhost', 5001);
        const response = await httpsCallable(functions, fnName)();
        response.data.should.equal('Hello from Firebase!');
      });
    });

    describe('httpsCallableFromUrl()', function () {
      it('Calls a function by URL', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallableFromUrl } = functionsModular;

        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }
        const functions = getFunctions(getApp());
        const functionRunner = httpsCallableFromUrl(
          functions,
          `http://${hostname}:5001/react-native-firebase-testing/us-central1/helloWorldV2`,
        );
        const response = await functionRunner();
        response.data.should.equal('Hello from Firebase!');
      });
    });

    describe('httpsCallable(fnName)(args)', function () {
      it('accepts primitive args: undefined', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');
        const response = await functionRunner();
        response.data.should.equal('null');
      });

      it('accepts primitive args: string', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');
        const response = await functionRunner('hello');
        response.data.should.equal('string');
      });

      it('accepts primitive args: number', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');
        const response = await functionRunner(123);
        response.data.should.equal('number');
      });

      it('accepts primitive args: boolean', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');
        const response = await functionRunner(true);
        response.data.should.equal('boolean');
      });

      it('accepts primitive args: null', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');
        const response = await functionRunner(null);
        response.data.should.equal('null');
      });

      it('accepts array args', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');
        const response = await functionRunner([1, 2, 3, 4]);
        response.data.should.equal('array');
      });

      it('accepts object args', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const type = 'object';
        const inputData = SAMPLE_DATA[type];
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');
        const { data: outputData } = await functionRunner({
          type,
          inputData,
        });
        should.deepEqual(outputData, inputData);
      });

      it('accepts complex nested objects', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const type = 'deepObject';
        const inputData = SAMPLE_DATA[type];
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');
        const { data: outputData } = await functionRunner({
          type,
          inputData,
        });
        should.deepEqual(outputData, inputData);
      });

      it('accepts complex nested arrays', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const type = 'deepArray';
        const inputData = SAMPLE_DATA[type];
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');
        const { data: outputData } = await functionRunner({
          type,
          inputData,
        });
        should.deepEqual(outputData, inputData);
      });
    });

    describe('HttpsError', function () {
      it('errors return instance of HttpsError', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');

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

      it('HttpsError.details -> allows returning complex data', async function () {
        let type = 'deepObject';
        let inputData = SAMPLE_DATA[type];
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');
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

      it('HttpsError.details -> allows returning primitives', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        let type = 'number';
        let inputData = SAMPLE_DATA[type];
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testFunctionDefaultRegionV2');
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

      it('HttpsCallableOptions.timeout will error when timeout is exceeded', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functions = getFunctions(getApp());
        const functionRunner = httpsCallable(functions, 'sleeperV2', { timeout: 1000 });

        try {
          await functionRunner({ delay: 3000 });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          if (Platform.other) {
            error.message.should.containEql('deadline-exceeded');
          } else {
            error.message.should.containEql('DEADLINE').containEql('EXCEEDED');
          }
          return Promise.resolve();
        }
      });
    });

    describe('httpsCallable.stream()', function () {
      // NOTE: The Firebase Functions emulator does not currently support streaming callables,
      // even though the SDK APIs exist. These tests verify the API surface exists and will
      // be updated to test actual streaming behavior once emulator support is added.
      // See: packages/functions/STREAMING_STATUS.md

      it('stream method exists on httpsCallable', function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functions = getFunctions(getApp());
        const functionRunner = httpsCallable(functions, 'testStreamingCallable');

        should.exist(functionRunner.stream);
        functionRunner.stream.should.be.a.Function();
      });

      it('stream method returns a function (unsubscribe)', function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable, connectFunctionsEmulator } = functionsModular;
        const functions = getFunctions(getApp());
        connectFunctionsEmulator(functions, 'localhost', 5001);

        const functionRunner = httpsCallable(functions, 'testStreamingCallable');
        const unsubscribe = functionRunner.stream({ count: 2 }, () => {});

        should.exist(unsubscribe);
        unsubscribe.should.be.a.Function();

        // Clean up
        unsubscribe();
      });

      it('unsubscribe function can be called multiple times safely', function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable, connectFunctionsEmulator } = functionsModular;
        const functions = getFunctions(getApp());
        connectFunctionsEmulator(functions, 'localhost', 5001);

        const functionRunner = httpsCallable(functions, 'testStreamingCallable');
        const unsubscribe = functionRunner.stream({ count: 2 }, () => {});

        // Should not throw
        unsubscribe();
        unsubscribe();
        unsubscribe();
      });

      it('stream method accepts data and callback parameters', function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable, connectFunctionsEmulator } = functionsModular;
        const functions = getFunctions(getApp());
        connectFunctionsEmulator(functions, 'localhost', 5001);

        const functionRunner = httpsCallable(functions, 'testStreamingCallable');
        let _callbackInvoked = false;

        const unsubscribe = functionRunner.stream({ count: 2, delay: 100 }, _event => {
          _callbackInvoked = true;
        });

        should.exist(unsubscribe);
        unsubscribe();
      });

      it('stream method accepts options parameter', function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable, connectFunctionsEmulator } = functionsModular;
        const functions = getFunctions(getApp());
        connectFunctionsEmulator(functions, 'localhost', 5001);

        const functionRunner = httpsCallable(functions, 'testStreamingCallable');
        const unsubscribe = functionRunner.stream({ count: 2 }, () => {}, { timeout: 5000 });

        should.exist(unsubscribe);
        unsubscribe();
      });

      // Skipped until emulator supports streaming
      xit('receives streaming data chunks', function (done) {
        this.timeout(10000);

        const { getApp } = modular;
        const { getFunctions, httpsCallable, connectFunctionsEmulator } = functionsModular;
        const functions = getFunctions(getApp());
        connectFunctionsEmulator(functions, 'localhost', 5001);

        const events = [];
        const functionRunner = httpsCallable(functions, 'testStreamingCallable');

        const unsubscribe = functionRunner.stream({ count: 3, delay: 200 }, event => {
          events.push(event);

          if (event.done) {
            try {
              // Should have received data events before done
              events.length.should.be.greaterThan(1);

              const dataEvents = events.filter(e => e.data && !e.done);
              dataEvents.length.should.be.greaterThan(0);

              const doneEvent = events[events.length - 1];
              doneEvent.done.should.equal(true);

              unsubscribe();
              done();
            } catch (e) {
              unsubscribe();
              done(e);
            }
          }
        });
      });

      // Skipped until emulator supports streaming
      xit('handles streaming errors correctly', function (done) {
        this.timeout(10000);

        const { getApp } = modular;
        const { getFunctions, httpsCallable, connectFunctionsEmulator } = functionsModular;
        const functions = getFunctions(getApp());
        connectFunctionsEmulator(functions, 'localhost', 5001);

        const functionRunner = httpsCallable(functions, 'testStreamWithError');

        const unsubscribe = functionRunner.stream({ failAfter: 2 }, event => {
          if (event.error) {
            try {
              should.exist(event.error);
              event.error.should.be.a.String();
              unsubscribe();
              done();
            } catch (e) {
              unsubscribe();
              done(e);
            }
          }
        });
      });

      // Skipped until emulator supports streaming
      xit('cancels stream when unsubscribe is called', function (done) {
        this.timeout(10000);

        const { getApp } = modular;
        const { getFunctions, httpsCallable, connectFunctionsEmulator } = functionsModular;
        const functions = getFunctions(getApp());
        connectFunctionsEmulator(functions, 'localhost', 5001);

        const events = [];
        const functionRunner = httpsCallable(functions, 'testStreamingCallable');

        const unsubscribe = functionRunner.stream({ count: 10, delay: 200 }, event => {
          events.push(event);

          // Cancel after first event
          if (events.length === 1) {
            unsubscribe();
            // Wait a bit to ensure no more events arrive
            setTimeout(() => {
              try {
                // Should not have received all 10 events
                events.length.should.be.lessThan(10);
                done();
              } catch (e) {
                done(e);
              }
            }, 1000);
          }
        });
      });

      it('stream method exists on httpsCallableFromUrl', function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallableFromUrl } = functionsModular;
        const functions = getFunctions(getApp());

        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }

        const functionRunner = httpsCallableFromUrl(
          functions,
          `http://${hostname}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`,
        );

        should.exist(functionRunner.stream);
        functionRunner.stream.should.be.a.Function();
      });

      // Skipped until emulator supports streaming
      xit('httpsCallableFromUrl can stream data', function (done) {
        this.timeout(10000);

        const { getApp } = modular;
        const { getFunctions, httpsCallableFromUrl, connectFunctionsEmulator } = functionsModular;
        const functions = getFunctions(getApp());
        connectFunctionsEmulator(functions, 'localhost', 5001);

        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }

        const events = [];
        const functionRunner = httpsCallableFromUrl(
          functions,
          `http://${hostname}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`,
        );

        const unsubscribe = functionRunner.stream({ count: 3, delay: 200 }, event => {
          events.push(event);

          if (event.done) {
            try {
              events.length.should.be.greaterThan(1);
              const dataEvents = events.filter(e => e.data && !e.done);
              dataEvents.length.should.be.greaterThan(0);
              unsubscribe();
              done();
            } catch (e) {
              unsubscribe();
              done(e);
            }
          }
        });
      });

      it('stream handles complex data structures', function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable, connectFunctionsEmulator } = functionsModular;
        const functions = getFunctions(getApp());
        connectFunctionsEmulator(functions, 'localhost', 5001);

        const functionRunner = httpsCallable(functions, 'testComplexDataStream');
        const complexData = {
          nested: { value: 123 },
          array: [1, 2, 3],
          string: 'test',
        };

        const unsubscribe = functionRunner.stream(complexData, () => {});

        should.exist(unsubscribe);
        unsubscribe();
      });
    });
  });
});
