import { describe, expect, it, jest } from '@jest/globals';

type NativeGet = (path: string, modifiers: unknown[]) => Promise<unknown>;
type DatabaseQueryModule = {
  default: { prototype: { _get(this: unknown): Promise<unknown> } };
};

const nativeSnapshot = {
  key: 'd',
  value: 42,
  exists: true,
  childKeys: [],
  priority: null,
};

/**
 * Loads DatabaseQuery with `Platform.OS` fixed, because `isIOS` is read once at import. Asserts
 * the platform took, so a no-op override cannot silently run every case as the same platform.
 */
function loadDatabaseQuery(os: 'ios' | 'android'): DatabaseQueryModule {
  let loaded: DatabaseQueryModule | undefined;
  jest.isolateModules(() => {
    const { Platform } = require('react-native') as { Platform: { OS: string } };
    Object.defineProperty(Platform, 'OS', { get: () => os, configurable: true });
    const common = require('@react-native-firebase/app/dist/module/common') as {
      isIOS: boolean;
    };
    if (common.isIOS !== (os === 'ios')) {
      throw new Error(`could not load DatabaseQuery as ${os}`);
    }
    loaded = require('../lib/DatabaseQuery') as DatabaseQueryModule;
  });
  return loaded as DatabaseQueryModule;
}

/** A query-shaped `this` for DatabaseQuery.prototype._get with a fake native module. */
function fakeQuery(nativeGet: NativeGet, { path = 'tests/d', modifiers = [] as unknown[] } = {}) {
  const once = jest.fn((_eventType: string): Promise<unknown> => Promise.resolve('once-snapshot'));
  const self = {
    path,
    ref: { key: 'd' },
    _modifiers: { _copy: () => ({ toArray: () => modifiers }) },
    _database: { native: { get: jest.fn(nativeGet) } },
    once,
  };
  return { self, once };
}

describe('get() (DatabaseQuery._get)', function () {
  describe.each(['ios', 'android'] as const)('on %s', function (os) {
    const DatabaseQuery = loadDatabaseQuery(os).default;
    const run = (self: unknown) => DatabaseQuery.prototype._get.call(self);

    it('reads a plain location with the native one-shot get', async function () {
      const { self, once } = fakeQuery(() => Promise.resolve(nativeSnapshot));

      const snapshot = (await run(self)) as { val(): unknown };

      expect(self._database.native.get).toHaveBeenCalledWith('tests/d', []);
      expect(once).not.toHaveBeenCalled();
      expect(snapshot.val()).toBe(42);
    });

    if (os === 'ios') {
      it("rejects with the native error, which already is the observer's", async function () {
        const denied = new Error('permission-denied');
        const { self, once } = fakeQuery(() => Promise.reject(denied));

        await expect(run(self)).rejects.toBe(denied);
        expect(once).not.toHaveBeenCalled();
      });
    } else {
      it('passes a permission denial straight through', async function () {
        const denied = Object.assign(new Error('denied'), { code: 'database/permission-denied' });
        const { self, once } = fakeQuery(() => Promise.reject(denied));

        await expect(run(self)).rejects.toBe(denied);
        expect(once).not.toHaveBeenCalled();
      });

      it("retries as once('value') when the native read fails otherwise", async function () {
        const { self, once } = fakeQuery(() => Promise.reject(new Error('Internal error')));

        await expect(run(self)).resolves.toBe('once-snapshot');
        expect(once).toHaveBeenCalledWith('value');
      });

      it("surfaces once('value')'s error when the retry fails too", async function () {
        const { self, once } = fakeQuery(() => Promise.reject(new Error('Internal error')));
        const denied = new Error('permission-denied');
        once.mockImplementation(() => Promise.reject(denied));

        await expect(run(self)).rejects.toBe(denied);
      });
    }

    it("uses once('value') for queries without calling the native get", async function () {
      const { self, once } = fakeQuery(() => Promise.resolve(nativeSnapshot), {
        modifiers: [{ type: 'limit', name: 'limitToLast', value: 1 }],
      });

      await expect(run(self)).resolves.toBe('once-snapshot');
      expect(self._database.native.get).not.toHaveBeenCalled();
      expect(once).toHaveBeenCalledWith('value');
    });

    it.each(['.info/serverTimeOffset', '/.info/connected', '.info'])(
      "uses once('value') for the client-local path %s",
      async function (path) {
        const { self, once } = fakeQuery(() => Promise.resolve(nativeSnapshot), { path });

        await expect(run(self)).resolves.toBe('once-snapshot');
        expect(self._database.native.get).not.toHaveBeenCalled();
        expect(once).toHaveBeenCalledWith('value');
      },
    );

    it('does not mistake a path that merely starts with .info for it', async function () {
      const { self } = fakeQuery(() => Promise.resolve(nativeSnapshot), { path: '.informal/x' });

      await run(self);

      expect(self._database.native.get).toHaveBeenCalled();
    });
  });
});
