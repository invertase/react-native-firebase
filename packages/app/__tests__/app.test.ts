import { describe, expect, it, jest } from '@jest/globals';

import firebase, {
  deleteApp,
  registerVersion,
  onLog,
  getApps,
  initializeApp,
  getApp,
  setLogLevel,
} from '../lib';

// this could be extracted to some test utils location
const checkV9Deprecation = (modularFunction: () => void, nonModularFunction: () => void) => {
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  modularFunction();
  expect(consoleWarnSpy).not.toHaveBeenCalled();
  nonModularFunction();
  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  consoleWarnSpy.mockRestore();
};

describe('App', function () {
  describe('modular', function () {
    it('`deleteApp` function is properly exposed to end user', function () {
      expect(deleteApp).toBeDefined();
    });

    it('`registerVersion` function is properly exposed to end user', function () {
      expect(registerVersion).toBeDefined();
    });

    it('`onLog` function is properly exposed to end user', function () {
      expect(onLog).toBeDefined();
    });

    it('`getApps` function is properly exposed to end user', function () {
      expect(getApps).toBeDefined();
    });

    it('`initializeApp` function is properly exposed to end user', function () {
      expect(initializeApp).toBeDefined();
    });

    it('`getApp` function is properly exposed to end user', function () {
      expect(getApp).toBeDefined();
    });

    it('`setLogLevel` function is properly exposed to end user', function () {
      expect(setLogLevel).toBeDefined();
    });
  });

  describe('`console.warn` only called for non-modular API', function () {
    it('deleteApp', function () {
      // this test has a slightly special setup
      // @ts-ignore test
      jest.spyOn(getApp(), '_deleteApp').mockImplementation(() => Promise.resolve(null));
      checkV9Deprecation(
        () => {}, // no modular replacement
        () => getApp().delete(), // modular getApp(), then non-modular to check
      );
    });

    it('getApps', function () {
      checkV9Deprecation(
        () => getApps(),
        () => firebase.apps,
      );
    });

    it('getApp', function () {
      checkV9Deprecation(
        () => getApp(),
        () => firebase.app(),
      );
    });

    it('setLogLevel', function () {
      checkV9Deprecation(
        () => setLogLevel('debug'),
        () => firebase.setLogLevel('debug'),
      );
    });

    it('FirebaseApp.toString()', function () {
      checkV9Deprecation(
        () => {}, // no modular replacement
        () => getApp().toString(), // modular getApp(), then non-modular to check
      );
    });

    it('FirebaseApp.extendApp()', function () {
      checkV9Deprecation(
        // no modular replacement for this one so no modular func to send in
        () => {},
        // modular getApp(), then non-modular to check
        () => {
          const app = getApp();
          (app as any).extendApp({ some: 'property' });
          return;
        },
      );
    });
  });
});
