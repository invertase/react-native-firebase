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
      it('should stream data chunks from a basic streaming function', async function () {
        const functionRunner = firebase.functions().httpsCallable('testStreamingCallable');
        const { stream, data } = await functionRunner.stream({ count: 5, delay: 500 });

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should stream progress updates', async function () {
        const functionRunner = firebase.functions().httpsCallable('testProgressStream');
        const { stream, data } = await functionRunner.stream({ task: 'TestTask' });

        const progressUpdates = [];
        for await (const chunk of stream) {
          if (chunk.progress !== undefined) {
            progressUpdates.push(chunk.progress);
          }
        }

        progressUpdates.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should handle complex data structures in stream', async function () {
        const functionRunner = firebase.functions().httpsCallable('testComplexDataStream');
        const { stream, data } = await functionRunner.stream({});

        const complexChunks = [];
        for await (const chunk of stream) {
          complexChunks.push(chunk);
        }

        complexChunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should work with HttpsCallableOptions.timeout', async function () {
        const functionRunner = firebase.functions().httpsCallable('testStreamingCallable', {
          timeout: 10000,
        });
        const { stream, data } = await functionRunner.stream({ count: 3, delay: 300 });

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should accept stream options as second parameter', async function () {
        const functionRunner = firebase.functions().httpsCallable('testStreamingCallable');
        const { stream, data } = await functionRunner.stream(
          { count: 3, delay: 300 },
          { limitedUseAppCheckTokens: false },
        );

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should handle empty data parameter', async function () {
        const functionRunner = firebase.functions().httpsCallable('testComplexDataStream');
        const { stream, data } = await functionRunner.stream();

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should handle null data parameter', async function () {
        const functionRunner = firebase.functions().httpsCallable('testStreamingCallableWithNull');
        const { stream, data } = await functionRunner.stream(null);

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        const result = await data;
        result.should.be.an.Object();
        result.should.have.property('success');
        result.success.should.equal(true);
      });

      it('should return both stream and data promise', async function () {
        const functionRunner = firebase.functions().httpsCallable('testStreamingCallable');
        const result = await functionRunner.stream({ count: 2, delay: 200 });

        result.should.have.property('stream');
        result.should.have.property('data');
        result.stream.should.be.an.Object();
        result.data.should.be.a.Promise();

        // Consume the stream
        for await (const _chunk of result.stream) {
          // Just consume
        }

        const finalData = await result.data;
        finalData.should.be.an.Object();
      });

      it('should work with multiple streams in parallel', async function () {
        const functionRunner1 = firebase.functions().httpsCallable('testStreamingCallable');
        const functionRunner2 = firebase.functions().httpsCallable('testStreamingCallable');

        const [result1, result2] = await Promise.all([
          functionRunner1.stream({ count: 2, delay: 200 }),
          functionRunner2.stream({ count: 2, delay: 200 }),
        ]);

        const chunks1 = [];
        const chunks2 = [];

        const [_, __] = await Promise.all([
          (async () => {
            for await (const chunk of result1.stream) {
              chunks1.push(chunk);
            }
          })(),
          (async () => {
            for await (const chunk of result2.stream) {
              chunks2.push(chunk);
            }
          })(),
        ]);

        chunks1.length.should.be.greaterThan(0);
        chunks2.length.should.be.greaterThan(0);

        const [data1, data2] = await Promise.all([result1.data, result2.data]);
        data1.should.be.an.Object();
        data2.should.be.an.Object();
      });
    });

    describe('httpsCallableFromUrl.stream()', function () {
      it('should stream data chunks from URL', async function () {
        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }
        const functionRunner = firebase
          .functions()
          .httpsCallableFromUrl(
            `http://${hostname}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`,
          );
        const { stream, data } = await functionRunner.stream({ count: 3, delay: 400 });

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should work with HttpsCallableOptions.timeout on URL stream', async function () {
        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }
        const functionRunner = firebase
          .functions()
          .httpsCallableFromUrl(
            `http://${hostname}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`,
            { timeout: 10000 },
          );
        const { stream, data } = await functionRunner.stream({ count: 2, delay: 300 });

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should accept stream options as second parameter for URL', async function () {
        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }
        const functionRunner = firebase
          .functions()
          .httpsCallableFromUrl(
            `http://${hostname}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`,
          );
        const { stream, data } = await functionRunner.stream(
          { count: 2, delay: 300 },
          { limitedUseAppCheckTokens: false },
        );

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should return both stream and data promise for URL', async function () {
        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }
        const functionRunner = firebase
          .functions()
          .httpsCallableFromUrl(
            `http://${hostname}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`,
          );
        const result = await functionRunner.stream({ count: 2, delay: 200 });

        result.should.have.property('stream');
        result.should.have.property('data');
        result.stream.should.be.an.Object();
        result.data.should.be.a.Promise();

        // Consume the stream
        for await (const _chunk of result.stream) {
          // Just consume
        }

        const finalData = await result.data;
        finalData.should.be.an.Object();
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
      it('should stream data chunks from a basic streaming function', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testStreamingCallable');
        const { stream, data } = await functionRunner.stream({ count: 5, delay: 500 });

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should stream progress updates', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testProgressStream');
        const { stream, data } = await functionRunner.stream({ task: 'TestTask' });

        const progressUpdates = [];
        for await (const chunk of stream) {
          if (chunk.progress !== undefined) {
            progressUpdates.push(chunk.progress);
          }
        }

        progressUpdates.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should handle complex data structures in stream', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testComplexDataStream');
        const { stream, data } = await functionRunner.stream({});

        const complexChunks = [];
        for await (const chunk of stream) {
          complexChunks.push(chunk);
        }

        complexChunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should work with HttpsCallableOptions.timeout', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testStreamingCallable', {
          timeout: 10000,
        });
        const { stream, data } = await functionRunner.stream({ count: 3, delay: 300 });

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should accept stream options as second parameter', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testStreamingCallable');
        const { stream, data } = await functionRunner.stream(
          { count: 3, delay: 300 },
          { limitedUseAppCheckTokens: false },
        );

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should handle empty data parameter', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testComplexDataStream');
        const { stream, data } = await functionRunner.stream();

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should handle null data parameter', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(
          getFunctions(getApp()),
          'testStreamingCallableWithNull',
        );
        const { stream, data } = await functionRunner.stream(null);

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        const result = await data;
        result.should.be.an.Object();
        result.should.have.property('success');
        result.success.should.equal(true);
      });

      it('should return both stream and data promise', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functionRunner = httpsCallable(getFunctions(getApp()), 'testStreamingCallable');
        const result = await functionRunner.stream({ count: 2, delay: 200 });

        result.should.have.property('stream');
        result.should.have.property('data');
        result.stream.should.be.an.Object();
        result.data.should.be.a.Promise();

        // Consume the stream
        for await (const _chunk of result.stream) {
          // Just consume
        }

        const finalData = await result.data;
        finalData.should.be.an.Object();
      });

      it('should work with multiple streams in parallel', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallable } = functionsModular;
        const functions = getFunctions(getApp());
        const functionRunner1 = httpsCallable(functions, 'testStreamingCallable');
        const functionRunner2 = httpsCallable(functions, 'testStreamingCallable');

        const [result1, result2] = await Promise.all([
          functionRunner1.stream({ count: 2, delay: 200 }),
          functionRunner2.stream({ count: 2, delay: 200 }),
        ]);

        const chunks1 = [];
        const chunks2 = [];

        const [_, __] = await Promise.all([
          (async () => {
            for await (const chunk of result1.stream) {
              chunks1.push(chunk);
            }
          })(),
          (async () => {
            for await (const chunk of result2.stream) {
              chunks2.push(chunk);
            }
          })(),
        ]);

        chunks1.length.should.be.greaterThan(0);
        chunks2.length.should.be.greaterThan(0);

        const [data1, data2] = await Promise.all([result1.data, result2.data]);
        data1.should.be.an.Object();
        data2.should.be.an.Object();
      });
    });

    describe('httpsCallableFromUrl.stream()', function () {
      it('should stream data chunks from URL', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallableFromUrl } = functionsModular;
        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }
        const functionRunner = httpsCallableFromUrl(
          getFunctions(getApp()),
          `http://${hostname}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`,
        );
        const { stream, data } = await functionRunner.stream({ count: 3, delay: 400 });

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should work with HttpsCallableOptions.timeout on URL stream', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallableFromUrl } = functionsModular;
        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }
        const functionRunner = httpsCallableFromUrl(
          getFunctions(getApp()),
          `http://${hostname}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`,
          { timeout: 10000 },
        );
        const { stream, data } = await functionRunner.stream({ count: 2, delay: 300 });

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should accept stream options as second parameter for URL', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallableFromUrl } = functionsModular;
        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }
        const functionRunner = httpsCallableFromUrl(
          getFunctions(getApp()),
          `http://${hostname}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`,
        );
        const { stream, data } = await functionRunner.stream(
          { count: 2, delay: 300 },
          { limitedUseAppCheckTokens: false },
        );

        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        chunks.length.should.be.greaterThan(0);

        const result = await data;
        result.should.be.an.Object();
      });

      it('should return both stream and data promise for URL', async function () {
        const { getApp } = modular;
        const { getFunctions, httpsCallableFromUrl } = functionsModular;
        let hostname = 'localhost';
        if (Platform.android) {
          hostname = '10.0.2.2';
        }
        const functionRunner = httpsCallableFromUrl(
          getFunctions(getApp()),
          `http://${hostname}:5001/react-native-firebase-testing/us-central1/testStreamingCallable`,
        );
        const result = await functionRunner.stream({ count: 2, delay: 200 });

        result.should.have.property('stream');
        result.should.have.property('data');
        result.stream.should.be.an.Object();
        result.data.should.be.a.Promise();

        // Consume the stream
        for await (const _chunk of result.stream) {
          // Just consume
        }

        const finalData = await result.data;
        finalData.should.be.an.Object();
      });
    });
  });
});
