const TEST_DATA = TestHelpers.functions.data;

describe('functions()', () => {
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
    // todo
  });
});
