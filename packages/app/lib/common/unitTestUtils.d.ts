export type CheckV9DeprecationFunction = (
  modularFunction: () => void,
  nonModularFunction: () => void,
  methodNameKey: string,
  uniqueMessage?: string | null,
  ignoreFirebaseAppDeprecationWarning?: boolean,
) => void;

export function createCheckV9Deprecation(moduleNames: string[]): CheckV9DeprecationFunction;

export function checkV9Deprecation(
  modularFunction: () => void,
  nonModularFunction: () => void,
): void;
