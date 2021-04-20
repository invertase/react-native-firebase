import { deleteApp, getApp, getApps, initializeApp } from '../src';
import * as impl from '../src/impl';
import FirebaseAppImpl from '../src/implementations/firebaseApp';
import { defaultAppName } from '../src/common';

jest.mock('../src/impl');

function createFirebaseApp(name) {
  return new FirebaseAppImpl(name || defaultAppName, {}, false);
}

describe('app', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteApp', () => {
    test('it calls the implementation and returns a promise', async () => {
      const app = createFirebaseApp('foo');
      impl.deleteApp.mockResolvedValue(undefined);
      await expect(deleteApp(app)).resolves.toBeUndefined();
      expect(impl.deleteApp.mock.calls).toHaveLength(1);
    });

    test('throws if an invalid app is provided', async () => {
      impl.deleteApp.mockResolvedValue(undefined);
      await expect(deleteApp()).rejects.toThrowError(/An invalid FirebaseApp was provided/);
      expect(impl.deleteApp.mock.calls).toHaveLength(0);
    });

    test('it does not allow deletion of the default app', async () => {
      impl.deleteApp.mockResolvedValue(undefined);
      expect.assertions(2);

      try {
        const app = createFirebaseApp();
        await deleteApp(app);
      } catch (e) {
        expect(impl.deleteApp.mock.calls).toHaveLength(0);
        expect(e.code).toEqual('app/no-default-app-delete');
      }
    });
  });

  describe('getApp', () => {
    test('it calls the implementation and returns a value', () => {
      const created = createFirebaseApp();
      impl.getApp.mockReturnValueOnce(created);
      const app = getApp();
      expect(impl.getApp.mock.calls).toHaveLength(1);
      expect(app.name).toEqual(created.name);
    });

    test('it throws if no app is found', () => {
      expect.assertions(2);
      impl.getApp.mockReturnValueOnce(undefined);

      try {
        getApp('foo');
      } catch (e) {
        expect(e.code).toBe('app/no-app');
        expect(impl.getApp.mock.calls).toHaveLength(1);
      }
    });

    test('it throws custom error if no default app is returned (explicit)', () => {
      expect.assertions(2);
      impl.getApp.mockReturnValueOnce();

      try {
        getApp(defaultAppName);
      } catch (e) {
        expect(e.code).toBe('app/not-initialized');
        expect(impl.getApp.mock.calls).toHaveLength(1);
      }
    });

    test('it throws custom error if no default app is returned (implicit)', () => {
      expect.assertions(2);
      impl.getApp.mockReturnValueOnce();

      try {
        getApp();
      } catch (e) {
        expect(e.code).toBe('app/not-initialized');
        expect(impl.getApp.mock.calls).toHaveLength(1);
      }
    });
  });

  describe('getApps', () => {
    test('it calls the implementation and returns a value', () => {
      impl.getApps.mockReturnValueOnce([]);
      expect(getApps()).toEqual([]);
      expect(impl.getApps.mock.calls).toHaveLength(1);
    });
  });

  describe('initializeApp', () => {
    test('it throws if an invalid object is provided', async () => {
      await expect(() => initializeApp()).rejects.toThrow(
        /Argument 'options' is not a valid FirebaseOptions object/,
      );
    });

    test('throws if an invalid config is provided', async () => {
      await expect(() => initializeApp({}, 123)).rejects.toThrow(
        /Argument 'config' is not a valid FirebaseAppConfig object/,
      );
    });

    test('it does not require a name or config', async () => {
      const app = createFirebaseApp();
      impl.initializeApp.mockReturnValueOnce(app);
      const options = {
        appId: '123',
      };

      const created = await initializeApp(options);
      expect(impl.initializeApp.mock.calls).toHaveLength(1);
      expect(impl.initializeApp.mock.calls[0][0]).toEqual(options);
      expect(impl.initializeApp.mock.calls[0][1]).toEqual(undefined);
      expect(created.name).toBe(app.name);
    });

    test('it creates a config object if name is provided', async () => {
      const name = 'foo';
      const app = createFirebaseApp(name);
      impl.initializeApp.mockReturnValueOnce(app);
      const options = {
        appId: '123',
      };

      const created = await initializeApp(options, name);
      expect(impl.initializeApp.mock.calls).toHaveLength(1);
      expect(impl.initializeApp.mock.calls[0][0]).toEqual(options);
      expect(impl.initializeApp.mock.calls[0][1]).toEqual({ name });
      expect(created.name).toBe(app.name);
    });

    test('it uses a config object if provided', async () => {
      const name = 'foo';
      const app = createFirebaseApp(name);
      impl.initializeApp.mockReturnValueOnce(app);
      const options = {
        appId: '123',
      };
      const config = {
        name,
      };

      const created = await initializeApp(options, config);
      expect(impl.initializeApp.mock.calls).toHaveLength(1);
      expect(impl.initializeApp.mock.calls[0][0]).toEqual(options);
      expect(impl.initializeApp.mock.calls[0][1]).toEqual(config);
      expect(created.name).toBe(app.name);
    });
  });
});
