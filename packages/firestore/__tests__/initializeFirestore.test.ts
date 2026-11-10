import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';

import { getApp } from '@react-native-firebase/app';
import { FirebaseFirestoreModule } from '../lib/FirestoreModule';
import { initializeFirestore } from '../lib/modular';
import type { FirestoreSettings } from '../lib/types/firestore';

const nativeSettings = (
  TurboModuleRegistry.getEnforcing('NativeRNFBTurboFirestore') as unknown as {
    settings: jest.Mock<() => Promise<void>>;
  }
).settings;

const originalSettings = FirebaseFirestoreModule.prototype.settings;

// Instances are cached per database, so each test uses its own.
let databaseIndex = 0;
function nextDatabaseId(): string {
  return `initialize-firestore-${databaseIndex++}`;
}

function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

describe('initializeFirestore settings errors', function () {
  let warn: jest.SpiedFunction<typeof console.warn>;
  // `catch` delegates to `then`, so wrapping `then` captures handlers attached either way.
  let attached: Promise<unknown>[];

  beforeEach(function () {
    nativeSettings.mockImplementation(() => Promise.resolve());
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    attached = [];
    jest.spyOn(FirebaseFirestoreModule.prototype, 'settings').mockImplementation(function (
      this: FirebaseFirestoreModule,
      ...args
    ) {
      return wrapSettingsResult(originalSettings.apply(this, args));
    });
  });

  function wrapSettingsResult(result: Promise<void>): Promise<void> {
    const then = result.then.bind(result);
    result.then = ((onFulfilled, onRejected) => {
      const derived = then(onFulfilled, onRejected);
      attached.push(derived);
      return derived;
    }) as typeof result.then;
    return result;
  }

  afterEach(function () {
    jest.restoreAllMocks();
    nativeSettings.mockReset();
  });

  async function expectSettingsRejectionHandled(): Promise<void> {
    expect(attached).toHaveLength(1);
    await expect(attached[0]).resolves.toBeUndefined();
  }

  it.each([
    ['an unknown key', { foo: true }, "'settings.foo' is not a valid settings field."],
    ['a non-boolean ssl', { ssl: 'yes' }, "'settings.ssl' must be a boolean value."],
  ])('reports %s instead of leaving an unhandled rejection', async function (_, settings, message) {
    const databaseId = nextDatabaseId();
    const firestore = initializeFirestore(
      getApp(),
      settings as unknown as FirestoreSettings,
      databaseId,
    );

    expect(firestore).toBeDefined();
    await expectSettingsRejectionHandled();
    expect(warn).toHaveBeenCalledWith(
      `initializeFirestore() could not apply settings for database '${databaseId}': ${message}`,
    );
  });

  it('reports a native settings failure', async function () {
    nativeSettings.mockImplementation(() => Promise.reject(new Error('native failure')));
    const databaseId = nextDatabaseId();

    initializeFirestore(getApp(), { ignoreUndefinedProperties: true }, databaseId);

    await expectSettingsRejectionHandled();
    expect(warn).toHaveBeenCalledWith(
      `initializeFirestore() could not apply settings for database '${databaseId}': [firestore/unknown] native failure`,
    );
  });

  it('reports a non-Error settings rejection', async function () {
    // The module wraps native failures in an Error, so reject from `settings()` itself.
    jest
      .spyOn(FirebaseFirestoreModule.prototype, 'settings')
      .mockImplementation(() => wrapSettingsResult(Promise.reject('plain failure')));
    const databaseId = nextDatabaseId();

    initializeFirestore(getApp(), { ignoreUndefinedProperties: true }, databaseId);

    await expectSettingsRejectionHandled();
    expect(warn).toHaveBeenCalledWith(
      `initializeFirestore() could not apply settings for database '${databaseId}': plain failure`,
    );
  });

  it('names the default database when no database ID is given', async function () {
    initializeFirestore(getApp(), { ssl: 'yes' } as unknown as FirestoreSettings);

    await expectSettingsRejectionHandled();
    expect(warn).toHaveBeenCalledWith(
      "initializeFirestore() could not apply settings for database '(default)': 'settings.ssl' must be a boolean value.",
    );
  });

  it('does not warn for valid settings', async function () {
    initializeFirestore(getApp(), { ignoreUndefinedProperties: true }, nextDatabaseId());

    await flushPromises();
    expect(nativeSettings).toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(attached).toHaveLength(1);
    await attached[0];
  });
});
