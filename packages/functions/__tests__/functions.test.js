import functions, { firebase } from '../lib';

describe('Cloud Functions', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      expect(app.functions).toBeDefined();
      expect(app.functions().httpsCallable).toBeDefined();
    });
  });

  describe('useFunctionsEmulator()', () => {
    it('useFunctionsEmulator -> uses 10.0.2.2', () => {
      functions().useFunctionsEmulator('http://localhost');
      expect(functions()._useFunctionsEmulatorOrigin).toBe('http://10.0.2.2');
      functions().useFunctionsEmulator('http://127.0.0.1');
      expect(functions()._useFunctionsEmulatorOrigin).toBe('http://10.0.2.2');
    });
  });
});
