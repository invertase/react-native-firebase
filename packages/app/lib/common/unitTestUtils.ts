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
  methodName: string,
  uniqueMessage: string = '',
) => void;

export const createCheckV9Deprecation = (moduleNames: string[]): CheckV9DeprecationFunction => {
  return (
    modularFunction: () => void,
    nonModularFunction: () => void,
    methodName: string,
    uniqueMessage: string?,
  ) => {
    const moduleName = moduleNames[0]; // firestore, database, etc
    const instanceName = moduleNames[1] || 'default'; // default, FirestoreCollectionReference, etc
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleWarnSpy.mockReset();
    consoleWarnSpy.mockRestore();
    modularFunction();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    consoleWarnSpy.mockReset();
    consoleWarnSpy.mockRestore();
    const consoleWarnSpy2 = jest.spyOn(console, 'warn').mockImplementation(warnMessage => {
      const message = createMessage(moduleName, methodName, instanceName, uniqueMessage);
      expect(message).toMatch(warnMessage);
    });
    nonModularFunction();

    expect(consoleWarnSpy2).toHaveBeenCalledTimes(1);
    consoleWarnSpy2.mockReset();
  };
};
