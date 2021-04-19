export class FirebaseError extends Error {
  constructor(error: Error, module: string, code?: string) {
    super(error.message);
    this.code = `${module}/${code ?? 'unknown'}`;
  }

  /**
   * The code related to the error.
   */
  readonly code: string;

  /**
   * Returns the `FirebaseError` as a string.
   *
   * @returns
   */
  public toString(): string {
    return `FirebaseError: ${this.message} (${this.code}).${
      this.stack ? `\n\n${this.stack}` : ''
    }}`;
  }
}
