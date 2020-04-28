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

  describe('httpcallable()', () => {
    it('throws an error with an incorrect timeout', () => {
      try {
        const app = firebase.app();
        app.functions().httpsCallable('example', { timeout: 'test' });
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        expect(e.message).toEqual('HttpsCallableOptions.timeout expected a Number in milliseconds');
        return Promise.resolve();
      }
    });
  });
});
