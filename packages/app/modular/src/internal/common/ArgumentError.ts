export class ArgumentError extends Error {
  constructor(argument: string, message?: string) {
    let msg = `Invalid argument '${argument}'.`;

    if (message) {
      msg += ` ${message}.`;
    }

    super(msg);
    this.argument = argument;
  }

  /**
   * The argument which failed validation.
   */
  readonly argument: string;
}
