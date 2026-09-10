/**
 * This fixture ships a placeholder `GoogleService-Info.plist` / `google-services.json`
 * (`PROJECT_ID=test-expo-fixture-fake`), so every real Firebase Auth call here fails
 * against a project that does not exist. Firebase Auth surfaces this as one of a
 * small set of `auth/*` error codes depending on platform/network path — this helper
 * recognizes the known ones and falls back to the raw message for anything else so
 * unexpected errors are never swallowed silently.
 */
const PLACEHOLDER_CONFIG_CODES = new Set([
  'auth/invalid-api-key',
  'auth/api-key-not-valid',
  'auth/network-request-failed',
  'auth/internal-error',
  'auth/app-not-authorized',
]);

// Fallback for message text on Firebase Auth errors whose `code` isn't one of the
// codes above. Only ever checked against errors that already have an `auth/*` code
// (see `isFirebaseAuthCode` below), so it can't relabel a generic/non-Firebase error
// (e.g. a real network blip with no `code` at all) as a placeholder-config problem.
const PLACEHOLDER_CONFIG_MESSAGE_PATTERN = /api key|api-key|not authorized|network.request/i;

const PLACEHOLDER_CONFIG_MESSAGE =
  'This example ships placeholder Firebase config — replace GoogleService-Info.plist / google-services.json with your own project to use Auth.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorCode(error: unknown): string | undefined {
  return isRecord(error) && typeof error.code === 'string' ? error.code : undefined;
}

function getErrorMessage(error: unknown): string {
  if (isRecord(error) && typeof error.message === 'string') {
    return error.message;
  }
  return String(error);
}

/**
 * Maps an Auth error to a message suitable for display in this example.
 * Recognized placeholder-config errors get a clear explanation; everything
 * else falls back to the raw `error.message`.
 */
export function getAuthErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);
  const isFirebaseAuthCode = typeof code === 'string' && code.startsWith('auth/');

  if (
    (code && PLACEHOLDER_CONFIG_CODES.has(code)) ||
    (isFirebaseAuthCode && PLACEHOLDER_CONFIG_MESSAGE_PATTERN.test(message))
  ) {
    return PLACEHOLDER_CONFIG_MESSAGE;
  }

  return message;
}
