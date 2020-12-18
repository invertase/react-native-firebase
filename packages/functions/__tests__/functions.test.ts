import functions, { firebase } from '../lib';

describe('Cloud Functions', function() {
  describe('namespace', function() {
    it('accessible from firebase.app()', function() {
      const app = firebase.app();
      expect(app.functions).toBeDefined();
      expect(app.functions().httpsCallable).toBeDefined();
    });
  });

  describe('useFunctionsEmulator()', function() {
    it('useFunctionsEmulator -> uses 10.0.2.2', function() {
      functions().useFunctionsEmulator('http://localhost');

      // @ts-ignore
      expect(functions()._useFunctionsEmulatorOrigin).toBe('http://10.0.2.2');

      functions().useFunctionsEmulator('http://127.0.0.1');

      // @ts-ignore
      expect(functions()._useFunctionsEmulatorOrigin).toBe('http://10.0.2.2');
    });
  });

  describe('httpcallable()', function() {
    it('throws an error with an incorrect timeout', function() {
      const app = firebase.app();

      // @ts-ignore
      expect(() => app.functions().httpsCallable('example', { timeout: 'test' })).toThrow(
        'HttpsCallableOptions.timeout expected a Number in milliseconds',
      );
    });
  });
});
