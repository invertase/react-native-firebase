import { isString } from './guards';

export class FirebaseError extends Error {
  constructor(error: Error, module: string, code?: string, customData?: Record<string, unknown>) {
    const _code = `${module}/${code ?? 'unknown'}`;

    super(`${error.message} (${_code})`);
    this.code = _code;
    this.customData = customData;
  }

  /**
   * The code related to the error.
   */
  readonly code: string;

  /**
   * Additional custom data attached to the error.
   */
  readonly customData?: Record<string, unknown>;
}

/**
 * Guards a promise call to throw a `FirebaseError` if the error returned
 * contains a code argument which looks as though it was thrown by an underlying
 * Firebase implementation.
 *
 * @param promise
 * @param convert an optional callback which converts a code, useful if platforms return differing codes.
 * @returns
 */
export async function guard<T = unknown>(
  promise: Promise<T>,
  convert?: (code: string) => string,
): Promise<T> {
  try {
    return await promise.then(res => res);
  } catch (error) {
    if (isString(error?.code) && error.code.includes('/')) {
      const [module, code] = error.code.split('/');
      throw new FirebaseError(error, module, convert ? convert(code) : code);
    }

    throw error;
  }
}
