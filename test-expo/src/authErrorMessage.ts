function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Maps an Auth error to a message suitable for display in this example.
 * Firebase Auth errors carry a `message` field; anything else falls back
 * to `String(error)` so unexpected errors are never swallowed silently.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (isRecord(error) && typeof error.message === 'string') {
    return error.message;
  }
  return String(error);
}
