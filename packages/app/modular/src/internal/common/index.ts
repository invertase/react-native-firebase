import { Platform } from 'react-native';
import { FirebaseApp } from '../../types';

import { binaryToBase64, btoa } from './base64';

export * from './ArgumentError';
export * from './FirebaseError';
export * from './guards';
export * from './path';
export * from './base64';

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

/**
 * Returns a unique name for events, prefixed for the specific `FirebaseApp`.
 * @param app
 * @param args
 * @returns
 */
export function eventNameForApp(app: FirebaseApp, ...args: string[]) {
  return `${app.name}-${args.join('-')}`;
}

type Base64Response = {
  value: string;
  format: string;
};

/**
 * Converts binary data into a Base64Response.
 * @param data
 * @returns
 */
export function toBase64String(data: Blob | ArrayBuffer | Uint8Array): Promise<Base64Response> {
  if (data instanceof Blob) {
    return new Promise<Base64Response>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(data);

      fileReader.onloadend = function onloadend() {
        return resolve({ value: fileReader.result as string, format: 'data_url' });
      };

      fileReader.onerror = function onerror() {
        fileReader.abort();
        return reject(new Error('FileReader failed to parse Blob value.'));
      };
    });
  }

  if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    return Promise.resolve({
      value: binaryToBase64(data),
      format: 'base64',
    });
  }

  throw new Error('toBase64String: unexpected value provided');
}

/**
 * Returns the base64 value and media type of a data URL.
 * @param url
 */
export function dataUrlParts(url: string): [string | undefined, string | undefined] {
  const isBase64 = url.includes(';base64');
  let [mediaType, base64String] = url.split(',');

  if (!mediaType || !base64String) {
    return [undefined, undefined];
  }

  mediaType = mediaType.replace('data:', '').replace(';base64', '');

  if (base64String && base64String.includes('%')) {
    base64String = decodeURIComponent(base64String);
  }

  if (!isBase64) {
    base64String = btoa(base64String);
  }

  return [base64String, mediaType];
}
