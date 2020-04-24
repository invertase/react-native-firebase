import functions from '../lib';

describe('functions', () => {
  describe('useFunctionsEmulator()', () => {
    it('useFunctionsEmulator -> uses 10.0.2.2', async () => {
      functions().useFunctionsEmulator('http://localhost');
      expect(functions()._useFunctionsEmulatorOrigin).toBe('http://10.0.2.2');
      functions().useFunctionsEmulator('http://127.0.0.1');
      expect(functions()._useFunctionsEmulatorOrigin).toBe('http://10.0.2.2');
    });
  });
});
