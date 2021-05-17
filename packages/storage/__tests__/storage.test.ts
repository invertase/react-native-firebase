import storage, { firebase } from '../lib';

describe('Storage', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.storage).toBeDefined();
      expect(app.storage().useEmulator).toBeDefined();
    });
  });

  describe('useEmulator()', function () {
    it('useEmulator requires a string host', function () {
      // @ts-ignore because we pass an invalid argument...
      expect(() => storage().useEmulator()).toThrow(
        'firebase.storage().useEmulator() takes a non-empty host',
      );
      expect(() => storage().useEmulator('', -1)).toThrow(
        'firebase.storage().useEmulator() takes a non-empty host',
      );
      // @ts-ignore because we pass an invalid argument...
      expect(() => storage().useEmulator(123)).toThrow(
        'firebase.storage().useEmulator() takes a non-empty host',
      );
    });

    it('useEmulator requires a host and port', function () {
      expect(() => storage().useEmulator('', 9000)).toThrow(
        'firebase.storage().useEmulator() takes a non-empty host and port',
      );
      // No port
      // @ts-ignore because we pass an invalid argument...
      expect(() => storage().useEmulator('localhost')).toThrow(
        'firebase.storage().useEmulator() takes a non-empty host and port',
      );
    });

    it('useEmulator -> remaps Android loopback to host', function () {
      const foo = storage().useEmulator('localhost', 9000);
      expect(foo).toEqual(['10.0.2.2', 9000]);

      const bar = storage().useEmulator('127.0.0.1', 9000);
      expect(bar).toEqual(['10.0.2.2', 9000]);
    });
  });
});
