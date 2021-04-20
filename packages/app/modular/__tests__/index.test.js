import { deleteApp, getApps } from '../src';
import * as impl from '../src/impl';
import FirebaseAppImpl from '../src/implementations/firebaseApp';
import { defaultAppName } from '../src/common';

jest.mock('../src/impl');

describe('app', () => {
  let firebaseApp;
  let defaultFirebaseApp;

  beforeEach(() => {
    jest.clearAllMocks();
    impl.getApps.mockReturnValueOnce([]);
    impl.deleteApp.mockResolvedValue(undefined);
    firebaseApp = new FirebaseAppImpl('foo', {}, false);
    defaultFirebaseApp = new FirebaseAppImpl(defaultAppName, {}, false);
  });

  describe('deleteApp', () => {
    test('throws if an invalid app is provided', async () => {
      await expect(deleteApp()).rejects.toThrowError(/An invalid FirebaseApp was provided/);
      await expect(() => deleteApp('foo')).rejects.toThrowError(
        /An invalid FirebaseApp was provided/,
      );
      await expect(() => deleteApp(123)).rejects.toThrowError(
        /An invalid FirebaseApp was provided/,
      );
      await expect(() => deleteApp({})).rejects.toThrowError(/An invalid FirebaseApp was provided/);
      await expect(() =>
        deleteApp({
          name: 'foo',
        }),
      ).rejects.toThrowError(/An invalid FirebaseApp was provided/);
    });

    test('it does not allow deletion of the default app', async () => {
      expect.assertions(1);

      try {
        await deleteApp(defaultFirebaseApp);
      } catch (e) {
        expect(e.code).toEqual('app/no-default-app-delete');
      }
    });

    test('it calls the implementation and returns a promise', async () => {
      await expect(deleteApp(firebaseApp)).resolves.toBeUndefined();
    });
  });

  describe('getApps', () => {
    test('it calls the implementation and returns a value', () => {
      impl.getApps.mockReturnValueOnce([]);
      const apps = getApps();
      expect(impl.getApps.mock.calls).toHaveLength(1);
      expect(apps).toEqual([]);
    });
  });
});
