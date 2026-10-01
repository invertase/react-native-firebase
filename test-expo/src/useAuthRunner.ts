import { useCallback, useState } from 'react';

import { ensureAuthEmulator } from '../app/auth/authEmulator';
import { getAuthErrorMessage } from './authErrorMessage';

function formatValue(label: string, value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === undefined) {
    return `${label}: ok`;
  }
  try {
    return `${label}: ok → ${JSON.stringify(value)}`;
  } catch {
    return `${label}: ok → ${String(value)}`;
  }
}

/**
 * Shared "run one Auth call and show the result or error" state for the auth example screens.
 * Every call connects to the Auth emulator first.
 */
export function useAuthRunner() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showResult = useCallback((message: string) => {
    setError(null);
    setResult(message);
  }, []);

  const showError = useCallback((e: unknown) => {
    setResult(null);
    setError(getAuthErrorMessage(e));
  }, []);

  const run = useCallback(
    async (label: string, action: () => unknown | Promise<unknown>) => {
      try {
        ensureAuthEmulator();
        const value = await action();
        showResult(formatValue(label, value));
      } catch (e) {
        showError(e);
      }
    },
    [showError, showResult],
  );

  return { result, error, run, showResult, showError };
}
