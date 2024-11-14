import { expect, jest } from '@jest/globals';

export const checkV9Deprecation = (modularFunction: () => void, nonModularFunction: () => void) => {
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  modularFunction();
  expect(consoleWarnSpy).not.toHaveBeenCalled();
  nonModularFunction();
  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  consoleWarnSpy.mockRestore();
};
