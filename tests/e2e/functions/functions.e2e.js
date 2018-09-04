const TEST_DATA = TestHelpers.functions.data;

describe('functions()', () => {
  it('accepts passing in an FirebaseApp instance as first arg', async () => {
    const appName = `functionsApp${global.testRunId}1`;
    const platformAppConfig = TestHelpers.core.config();
    const app = await firebase
      .initializeApp(platformAppConfig, appName)
      .onReady();

    const functionsForApp = firebase.functions(app);

    functionsForApp.app.should.equal(app);
    functionsForApp.app.name.should.equal(app.name);

    // check from an app
    app.functions().app.should.equal(app);
    app.functions().app.name.should.equal(app.name);
  });

  it('accepts passing in a region string as first arg', async () => {
    const region = 'europe-west1';
    const functionsForRegion = firebase.functions(region);

    // check internal region property
    functionsForRegion._customUrlOrRegion.should.equal(region);
    // app should be default app
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

    const functionRunner = functionsForRegion.httpsCallable(
      'runTestWithRegion'
    );

    const response = await functionRunner();
    // the function just sends back it's region as a string
    response.data.should.equal(region);
  });

  // TODO app and region test both args
  // TODO app passed to existing app instance - should error?

  describe('httpsCallable(fnName)(args)', () => {
    it('accepts primitive args: undefined', async () => {
      const functionRunner = firebase.functions().httpsCallable('runTest');
      const response = await functionRunner();
      response.data.should.equal('null');
    });

    it('accepts primitive args: string', async () => {
      const functionRunner = firebase.functions().httpsCallable('runTest');
      const response = await functionRunner('hello');
      response.data.should.equal('string');
    });

    it('accepts primitive args: number', async () => {
      const functionRunner = firebase.functions().httpsCallable('runTest');
      const response = await functionRunner(123);
      response.data.should.equal('number');
    });

    it('accepts primitive args: boolean', async () => {
      const functionRunner = firebase.functions().httpsCallable('runTest');
      const response = await functionRunner(true);
      response.data.should.equal('boolean');
    });

    it('accepts primitive args: null', async () => {
      const functionRunner = firebase.functions().httpsCallable('runTest');
      const response = await functionRunner(null);
      response.data.should.equal('null');
    });

    it('accepts array args', async () => {
      const functionRunner = firebase.functions().httpsCallable('runTest');
      const response = await functionRunner([1, 2, 3, 4]);
      response.data.should.equal('array');
    });

    it('accepts object args', async () => {
      const type = 'simpleObject';
      const inputData = TEST_DATA[type];
      const functionRunner = firebase.functions().httpsCallable('runTest');
      const { data: outputData } = await functionRunner({
        type,
        inputData,
      });
      should.deepEqual(outputData, inputData);
    });

    it('accepts complex nested objects', async () => {
      const type = 'advancedObject';
      const inputData = TEST_DATA[type];
      const functionRunner = firebase.functions().httpsCallable('runTest');
      const { data: outputData } = await functionRunner({
        type,
        inputData,
      });
      should.deepEqual(outputData, inputData);
    });

    it('accepts complex nested arrays', async () => {
      const type = 'advancedArray';
      const inputData = TEST_DATA[type];
      const functionRunner = firebase.functions().httpsCallable('runTest');
      const { data: outputData } = await functionRunner({
        type,
        inputData,
      });
      should.deepEqual(outputData, inputData);
    });
  });

  describe('HttpsError', () => {
    it('errors return instance of HttpsError', async () => {
      const functionRunner = firebase.functions().httpsCallable('runTest');
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
      let type = 'advancedObject';
      let inputData = TEST_DATA[type];
      const functionRunner = firebase.functions().httpsCallable('runTest');
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
          'Response data was requested to be sent as part of an Error payload, so here we are!'
        );
      }

      type = 'advancedArray';
      inputData = TEST_DATA[type];
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
          'Response data was requested to be sent as part of an Error payload, so here we are!'
        );
      }

      return Promise.resolve();
    });

    it('HttpsError.details -> allows returning primitives', async () => {
      let type = 'number';
      let inputData = TEST_DATA[type];
      const functionRunner = firebase.functions().httpsCallable('runTest');
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
          'Response data was requested to be sent as part of an Error payload, so here we are!'
        );
        should.deepEqual(e.details, inputData);
      }

      type = 'string';
      inputData = TEST_DATA[type];
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
          'Response data was requested to be sent as part of an Error payload, so here we are!'
        );
      }

      type = 'boolean';
      inputData = TEST_DATA[type];
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
          'Response data was requested to be sent as part of an Error payload, so here we are!'
        );
      }

      type = 'null';
      inputData = TEST_DATA[type];
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
          'Response data was requested to be sent as part of an Error payload, so here we are!'
        );
      }

      return Promise.resolve();
    });
  });
});
