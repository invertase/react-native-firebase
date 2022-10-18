import { describe, expect, it } from '@jest/globals';

import database, { firebase } from '../lib';

describe('Database', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.database).toBeDefined();
      expect(app.database().useEmulator).toBeDefined();
    });
  });

  describe('useEmulator()', function () {
    it('useEmulator requires a string host', function () {
      // @ts-ignore because we pass an invalid argument...
      expect(() => database().useEmulator()).toThrow(
        'firebase.database().useEmulator() takes a non-empty host',
      );
      expect(() => database().useEmulator('', -1)).toThrow(
        'firebase.database().useEmulator() takes a non-empty host',
      );
      // @ts-ignore because we pass an invalid argument...
      expect(() => database().useEmulator(123)).toThrow(
        'firebase.database().useEmulator() takes a non-empty host',
      );
    });

    it('useEmulator requires a host and port', function () {
      expect(() => database().useEmulator('', 9000)).toThrow(
        'firebase.database().useEmulator() takes a non-empty host and port',
      );
      // No port
      // @ts-ignore because we pass an invalid argument...
      expect(() => database().useEmulator('localhost')).toThrow(
        'firebase.database().useEmulator() takes a non-empty host and port',
      );
    });

    it('useEmulator -> remaps Android loopback to host', function () {
      const foo = database().useEmulator('localhost', 9000);
      expect(foo).toEqual(['10.0.2.2', 9000]);

      const bar = database().useEmulator('127.0.0.1', 9000);
      expect(bar).toEqual(['10.0.2.2', 9000]);
    });
  });
});
