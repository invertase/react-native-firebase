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

export const createCheckV9Deprecation = (moduleName: string): CheckV9DeprecationFunction => {
  return (
    modularFunction: () => void,
    nonModularFunction: () => void,
    methodName: string,
    uniqueMessage = '',
  ) => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleWarnSpy.mockReset();
    modularFunction();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    consoleWarnSpy.mockReset();
    const consoleWarnSpy2 = jest.spyOn(console, 'warn').mockImplementation(warnMessage => {
      const message = createMessage(moduleName, methodName, uniqueMessage);
      expect(message).toMatch(warnMessage);
    });
    nonModularFunction();

    expect(consoleWarnSpy2).toHaveBeenCalledTimes(1);
    consoleWarnSpy2.mockReset();
  };
};
