import auth, { firebase } from '../lib';

describe('Auth', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      expect(app.auth).toBeDefined();
      expect(app.auth().useEmulator).toBeDefined();
    });
  });

  describe('useEmulator()', () => {
    it('useEmulator requires a string url', () => {
      // @ts-ignore because we pass an invalid argument...
      expect(() => auth().useEmulator()).toThrow(
        'firebase.auth().useEmulator() takes a non-empty string',
      );
      expect(() => auth().useEmulator('')).toThrow(
        'firebase.auth().useEmulator() takes a non-empty string',
      );
      // @ts-ignore because we pass an invalid argument...
      expect(() => auth().useEmulator(123)).toThrow(
        'firebase.auth().useEmulator() takes a non-empty string',
      );
    });

    it('useEmulator requires a well-formed url', () => {
      // No http://
      expect(() => auth().useEmulator('localhost:9099')).toThrow(
        'firebase.auth().useEmulator() unable to parse host and port from url',
      );
      // No port
      expect(() => auth().useEmulator('http://localhost')).toThrow(
        'firebase.auth().useEmulator() unable to parse host and port from url',
      );
    });

    it('useEmulator -> remaps Android loopback to host', () => {
      const foo = auth().useEmulator('http://localhost:9099');
      expect(foo).toEqual(['10.0.2.2', 9099]);

      const bar = auth().useEmulator('http://127.0.0.1:9099');
      expect(bar).toEqual(['10.0.2.2', 9099]);
    });
  });
});
