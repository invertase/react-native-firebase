import { deleteApp, getApp, getApps, initializeApp } from '../src';
import * as impl from '../src/impl';
import { defaultAppName } from '../src/common';
import { createFirebaseApp, createFirebaseOptions } from './utils';

jest.mock('../src/impl');

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
      expect(impl.deleteApp.mock.calls[0][0]).toBe(app.name);
    });

    test('throws if an invalid app is provided', async () => {
      impl.deleteApp.mockResolvedValue(undefined);
      await expect(deleteApp()).rejects.toThrowError(/An invalid FirebaseApp was provided/);
      expect(impl.deleteApp.mock.calls).toHaveLength(0);
    });

    test('it does not allow deletion of the default app', async () => {
      impl.deleteApp.mockResolvedValue(undefined);
      expect.assertions(2);
      const app = createFirebaseApp();

      try {
        await deleteApp(app);
      } catch (e) {
        expect(impl.deleteApp.mock.calls).toHaveLength(0);
        expect(e.code).toEqual('app/no-delete-default');
      }
    });
  });

  describe('getApp', () => {
    test('it calls the implementation and returns a value', () => {
      const created = createFirebaseApp();
      impl.getApp.mockReturnValueOnce(created);
      const app = getApp();
      expect(impl.getApp.mock.calls).toHaveLength(1);
      expect(impl.getApp.mock.calls[0][0]).toBe(undefined);
      expect(app.name).toEqual(created.name);
    });

    test('it throws if no app is found', () => {
      expect.assertions(3);
      impl.getApp.mockReturnValueOnce(undefined);

      try {
        getApp('foo');
      } catch (e) {
        expect(e.code).toBe('app/no-app');
        expect(impl.getApp.mock.calls).toHaveLength(1);
        expect(impl.getApp.mock.calls[0][0]).toBe('foo');
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
      expect(impl.getApps.mock.calls[0][0]).toBe(undefined);
    });
  });

  describe('initializeApp', () => {
    test('it throws if an invalid object is provided', async () => {
      await expect(() => initializeApp()).rejects.toThrow(/Expected a FirebaseOptions object/);
    });

    test('throws if an invalid config is provided', async () => {
      await expect(() => initializeApp({}, 123)).rejects.toThrow(
        /Expected a FirebaseOptions object/,
      );
    });

    test('it does not require a name or config', async () => {
      const app = createFirebaseApp();
      const options = createFirebaseOptions();

      impl.initializeApp.mockReturnValueOnce(app);

      const created = await initializeApp(options);
      expect(impl.initializeApp.mock.calls).toHaveLength(1);
      expect(impl.initializeApp.mock.calls[0][0]).toEqual(options);
      expect(impl.initializeApp.mock.calls[0][1]).toEqual(undefined);
      expect(created.name).toBe(app.name);
    });

    test('it creates a config object if name is provided', async () => {
      const name = 'foo';
      const app = createFirebaseApp(name);
      const options = createFirebaseOptions();

      impl.initializeApp.mockReturnValueOnce(app);

      const created = await initializeApp(options, name);
      expect(impl.initializeApp.mock.calls).toHaveLength(1);
      expect(impl.initializeApp.mock.calls[0][0]).toEqual(options);
      expect(impl.initializeApp.mock.calls[0][1]).toEqual({ name });
      expect(created.name).toBe(app.name);
    });

    test('it uses a config object if provided', async () => {
      const name = 'foo';
      const app = createFirebaseApp(name);
      const options = createFirebaseOptions();

      impl.initializeApp.mockReturnValueOnce(app);

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
