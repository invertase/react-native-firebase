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

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    it('deleteApp', function () {
      const firebaseApp = firebase.app();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      jest.spyOn(firebaseApp, '_deleteApp').mockImplementation(() => Promise.resolve(null));
      // we don't need to test this because we call underlying deleteApp directly
      // deleteApp(firebaseApp);

      firebaseApp.delete();
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('getApps', function () {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // Check that console.warn was not called for v9 method call
      getApps();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      // Check that console.warn was called for v8 method call
      firebase.apps;
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('getApp', function () {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // Check that console.warn was not called for v9 method call
      getApp();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      // Check that console.warn was called for v8 method call
      firebase.app();
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('setLogLevel', function () {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // Check that console.warn was not called for v9 method call
      setLogLevel('debug');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      // Check that console.warn was called for v8 method call
      firebase.setLogLevel('debug');
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });
  });
});
