import auth, { firebase } from '../lib';

describe('Auth', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.auth).toBeDefined();
      expect(app.auth().useEmulator).toBeDefined();
    });
  });

  describe('useEmulator()', function () {
    it('useEmulator requires a string url', function () {
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

    it('useEmulator requires a well-formed url', function () {
      // No http://
      expect(() => auth().useEmulator('localhost:9099')).toThrow(
        'firebase.auth().useEmulator() takes a non-empty string URL',
      );
      // No port
      expect(() => auth().useEmulator('http://localhost')).toThrow(
        'firebase.auth().useEmulator() unable to parse host and port from URL',
      );
    });

    it('useEmulator -> remaps Android loopback to host', function () {
      const foo = auth().useEmulator('http://localhost:9099');
      expect(foo).toEqual(['10.0.2.2', 9099]);

      const bar = auth().useEmulator('http://127.0.0.1:9099');
      expect(bar).toEqual(['10.0.2.2', 9099]);
    });
  });

  describe('tenantId', function () {
    it('should be able to set tenantId ', function () {
      const auth = firebase.app().auth();
      auth.setTenantId('test-id').then(() => {
        expect(auth.tenantId).toBe('test-id');
      });
    });

    it('should throw error when tenantId is a non string object ', async function () {
      try {
        await firebase.app().auth().setTenantId(Object());
        return Promise.reject('It should throw an error');
      } catch (e) {
        expect(e.message).toBe("firebase.auth().setTenantId(*) expected 'tenantId' to be a string");
        return Promise.resolve('Error catched');
      }
    });
  });
});
