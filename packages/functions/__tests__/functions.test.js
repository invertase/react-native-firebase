import functions from '../lib';
import { firebase } from '@react-native-firebase/functions';

describe('functions', () => {
  describe('useFunctionsEmulator()', () => {
    it('useFunctionsEmulator -> uses 10.0.2.2', async () => {
      const region = 'europe-west2';
      const functions = firebase.app().functions(region);

      functions.useFunctionsEmulator('http://localhost');
      expect(functions._useFunctionsEmulatorOrigin).toBe('http://10.0.2.2');
      functions.useFunctionsEmulator('http://127.0.0.1');
      expect(functions._useFunctionsEmulatorOrigin).toBe('http://10.0.2.2');
    });
  });
});
