import { isFirebaseApp, isFirebaseOptions, isFirebaseAppConfig } from '../src/internal';
import { createFirebaseApp, createFirebaseOptions } from './helpers';

describe('validation', () => {
  describe('isFirebaseApp', () => {
    test('returns false if instance is not a FirebaseApp', async () => {
      expect(isFirebaseApp()).toBe(false);
      expect(isFirebaseApp(null)).toBe(false);
      expect(isFirebaseApp('foo')).toBe(false);
      expect(isFirebaseApp(123)).toBe(false);
      expect(isFirebaseApp({})).toBe(false);
    });

    test('returns true if instance is a FirebaseApp', async () => {
      const instance = createFirebaseApp();
      expect(isFirebaseApp(instance)).toBe(true);
    });
  });

  describe('isFirebaseOptions', () => {
    test('returns false if an object is not provided', async () => {
      expect(isFirebaseOptions()).toBe(false);
      expect(isFirebaseApp(null)).toBe(false);
      expect(isFirebaseApp('foo')).toBe(false);
      expect(isFirebaseApp(123)).toBe(false);
    });

    test('returns false a required property is not provided', async () => {
      const options = { ...createFirebaseOptions() };
      delete options['projectId'];

      expect(isFirebaseOptions(options)).toBe(false);
    });

    test('returns true if all required properties are provided', async () => {
      const options = createFirebaseOptions();
      expect(isFirebaseOptions(options)).toBe(true);
    });

    test('returns correct value if optional values provided', async () => {
      const options = createFirebaseOptions();

      expect(isFirebaseOptions({ ...options, authDomain: 123 })).toBe(false);
      expect(isFirebaseOptions({ ...options, authDomain: 'authDomain' })).toBe(true);

      expect(isFirebaseOptions({ ...options, storageBucket: 123 })).toBe(false);
      expect(isFirebaseOptions({ ...options, storageBucket: 'authDomain' })).toBe(true);

      expect(isFirebaseOptions({ ...options, measurementId: 123 })).toBe(false);
      expect(isFirebaseOptions({ ...options, measurementId: 'authDomain' })).toBe(true);

      expect(isFirebaseOptions({ ...options, androidClientId: 123 })).toBe(false);
      expect(isFirebaseOptions({ ...options, androidClientId: 'androidClientId' })).toBe(true);

      expect(isFirebaseOptions({ ...options, clientId: 123 })).toBe(false);
      expect(isFirebaseOptions({ ...options, clientId: 'clientId' })).toBe(true);

      expect(isFirebaseOptions({ ...options, deepLinkURLScheme: 123 })).toBe(false);
      expect(isFirebaseOptions({ ...options, deepLinkURLScheme: 'deepLinkURLScheme' })).toBe(true);
    });
  });

  describe('isFirebaseAppConfig', () => {
    test('returns false if an object is not provided', async () => {
      expect(isFirebaseAppConfig()).toBe(false);
      expect(isFirebaseAppConfig(null)).toBe(false);
      expect(isFirebaseAppConfig('foo')).toBe(false);
      expect(isFirebaseAppConfig(123)).toBe(false);
    });

    test('returns true if an empty object is provided', () => {
      expect(isFirebaseAppConfig({})).toBe(true);
    });

    test('returns false if any property provided is not the correct value', () => {
      expect(isFirebaseAppConfig({ name: 123 })).toBe(false);
      expect(isFirebaseAppConfig({ automaticDataCollectionEnabled: 'foo' })).toBe(false);
      expect(isFirebaseAppConfig({ automaticResourceManagement: 'foo' })).toBe(false);
    });

    test('returns true if any property provided is the correct value', () => {
      expect(isFirebaseAppConfig({ name: 'foo' })).toBe(true);
      expect(isFirebaseAppConfig({ automaticDataCollectionEnabled: false })).toBe(true);
      expect(isFirebaseAppConfig({ automaticResourceManagement: true })).toBe(true);
    });

    test('returns true if all values are correct', () => {
      expect(
        isFirebaseAppConfig({
          name: 'foo',
          automaticDataCollectionEnabled: false,
          automaticResourceManagement: true,
        }),
      ).toBe(true);
    });
  });
});
