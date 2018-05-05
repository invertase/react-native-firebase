const TEST_DATA = TestHelpers.functions.data;

// TODO tests...
describe.only('functions()', () => {
  it('runs', async () => {
    const type = 'simpleArray';
    const response = await firebase.functions().httpsCallable('runTest')({
      type,
      inputData: TEST_DATA[type],
      asError: true,
    });
    console.log('RESPONSE: ', response, typeof response);
  });
});
