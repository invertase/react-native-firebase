// @ts-nocheck
import { expect, jest } from '@jest/globals';
import { createMessage } from './index';

export const checkV9Deprecation = (modularFunction: () => void, nonModularFunction: () => void) => {
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  consoleWarnSpy.mockRestore();
  modularFunction();
  expect(consoleWarnSpy).not.toHaveBeenCalled();
  consoleWarnSpy.mockClear();
  const consoleWarnSpy2 = jest.spyOn(console, 'warn').mockImplementation(() => {});
  nonModularFunction();

  expect(consoleWarnSpy2).toHaveBeenCalledTimes(1);
  consoleWarnSpy2.mockClear();
};

export type CheckV9DeprecationFunction = (
  modularFunction: () => void,
  nonModularFunction: () => void,
  methodNameKey: string,
  uniqueMessage?: string | null,
  ignoreFirebaseAppDeprecationWarning?: boolean,
) => void;

export const createCheckV9Deprecation = (moduleNames: string[]): CheckV9DeprecationFunction => {
  return (
    modularFunction: () => void,
    nonModularFunction: () => void,
    methodNameKey: string,
    uniqueMessage: string?,
    checkFirebaseAppDeprecationWarning: boolean = false,
  ) => {
    const moduleName = moduleNames[0]; // firestore, database, etc
    const instanceName = moduleNames[1] || 'default'; // default, FirestoreCollectionReference, etc
    const consoleWarnSpy = jest.spyOn(console, 'warn');
    consoleWarnSpy.mockReset();

    consoleWarnSpy.mockImplementation(warnMessage => {
      const firebaseAppDeprecationMessage = warnMessage.includes('Please use `getApp()` instead.');
      if (checkFirebaseAppDeprecationWarning) {
        throw new Error(`Console warn was called unexpectedly with: ${warnMessage}`);
      } else {
        if (!firebaseAppDeprecationMessage) {
          // we want to ignore all firebase app deprecation warnings (e.g. "Please use `getApp()` instead.") unless actually testing for it which we do above
          throw new Error(`Console warn was called unexpectedly with: ${warnMessage}`);
        }
      }
    });
    // Do not call `mockRestore()` unless removing the spy
    modularFunction();
    consoleWarnSpy.mockReset();
    consoleWarnSpy.mockRestore();
    const consoleWarnSpy2 = jest.spyOn(console, 'warn').mockImplementation(warnMessage => {
      const message = createMessage(moduleName, methodNameKey, instanceName, uniqueMessage);
      expect(warnMessage).toMatch(message);
    });
    nonModularFunction();

    expect(consoleWarnSpy2).toHaveBeenCalledTimes(1);
    consoleWarnSpy2.mockReset();
  };
};
