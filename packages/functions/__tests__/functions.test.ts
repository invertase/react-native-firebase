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

      // @ts-ignore
      expect(functions()._useFunctionsEmulatorOrigin).toBe('http://10.0.2.2');

      functions().useFunctionsEmulator('http://127.0.0.1');

      // @ts-ignore
      expect(functions()._useFunctionsEmulatorOrigin).toBe('http://10.0.2.2');
    });
  });

  describe('httpcallable()', () => {
    it('throws an error with an incorrect timeout', () => {
      const app = firebase.app();

      // @ts-ignore
      expect(() => app.functions().httpsCallable('example', { timeout: 'test' })).toThrow(
        'HttpsCallableOptions.timeout expected a Number in milliseconds',
      );
    });
  });
});
