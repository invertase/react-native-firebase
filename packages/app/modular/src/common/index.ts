import { Platform } from 'react-native';

export * from './ArgumentError';
export * from './FirebaseError';
export * from './guards';

/**
 * A constant value representing whether the current platform is Android.
 */
export const isAndroid = Platform.OS === 'android';

/**
 * A constant value representing whether the current platform is iOS.
 */
export const isIOS = Platform.OS === 'ios';

/**
 * A constant value representing whether the current platform is Web.
 */
export const isWeb = Platform.OS === 'web';

/**
 * A constant value representing the default `FirebaseApp` name.
 */
export const defaultAppName = '[DEFAULT]';

/**
 * Noop function.
 */
export function noop(): void {}

/**
 * Noop async function.
 */
export async function asyncNoop(): Promise<void> {}

/**
 * Casts an object of type `T` into a mutable type.
 *
 * This is useful in cases whereby the public API should only contain read-only
 * values, but internally those values need changing.
 */
export type Mutable<T> = {
  -readonly [k in keyof T]: T[k];
};

/**
 * Remove a trailing forward slash from a string if it exists
 *
 * @param string
 * @returns {*}
 */
export function stripTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
