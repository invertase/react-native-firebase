export class FirebaseError extends Error {
  constructor(error: Error, module: string, code?: string) {
    const _code = `${module}/${code ?? 'unknown'}`;

    super(`${error.message} (${_code})`);
    this.code = _code;
  }

  /**
   * The code related to the error.
   */
  readonly code: string;
}
