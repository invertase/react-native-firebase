import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  FunctionsError,
  HttpsError,
  HttpsErrorCode,
  SDK_VERSION,
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
  httpsCallableFromUrl,
} from '@react-native-firebase/functions';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

/** Android emulators reach the host machine at 10.0.2.2; iOS simulators use 127.0.0.1. */
function getFunctionsEmulatorHost(): string {
  return Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
}

/** Default Functions emulator port. */
const FUNCTIONS_EMULATOR_PORT = 5001;

const DEFAULT_CALLABLE = 'testFunctionDefaultRegionV2';
const STREAM_CALLABLE = 'testStreamingCallable';

let emulatorConnected = false;

function ensureFunctionsEmulator(): void {
  if (emulatorConnected) {
    return;
  }
  connectFunctionsEmulator(getFunctions(), getFunctionsEmulatorHost(), FUNCTIONS_EMULATOR_PORT);
  emulatorConnected = true;
}

// Connect at module load before any callable / stream control runs.
ensureFunctionsEmulator();

function errorMessage(e: unknown): string {
  if (e instanceof HttpsError) {
    return `HttpsError code=${e.code} message=${e.message} details=${JSON.stringify(e.details ?? null)}`;
  }
  return e instanceof Error ? e.message : String(e);
}

function emulatorCallableUrl(fnName: string): string {
  const projectId = getApp().options.projectId;
  if (!projectId) {
    throw new Error('getApp().options.projectId is missing');
  }
  return `http://${getFunctionsEmulatorHost()}:${FUNCTIONS_EMULATOR_PORT}/${projectId}/us-central1/${fnName}`;
}

export default function FunctionsScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const functions = useMemo(() => getFunctions(), []);

  function showResult(message: string) {
    setError(null);
    setResult(message);
  }

  function showError(e: unknown) {
    setResult(null);
    setError(errorMessage(e));
  }

  async function run(label: string, action: () => unknown | Promise<unknown>) {
    try {
      ensureFunctionsEmulator();
      const value = await action();
      showResult(
        typeof value === 'string'
          ? value
          : `${label}: ok${value === undefined ? '' : ` → ${JSON.stringify(value)}`}`,
      );
    } catch (e) {
      showError(e);
    }
  }

  return (
    <ScreenChrome title="functions" result={result} error={error}>
      <Text style={styles.hint}>
        Connects to the Functions emulator at {getFunctionsEmulatorHost()}:{FUNCTIONS_EMULATOR_PORT}{' '}
        at module load (default emulator port 5001). The callables {DEFAULT_CALLABLE} and{' '}
        {STREAM_CALLABLE} must exist on that emulator. Controls mirror runtime APIs taught on the
        Functions usage page.
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getFunctions"
        onPress={() =>
          run('getFunctions', () => {
            const instance = getFunctions();
            return { appName: instance.app.name };
          })
        }
      />
      <AppButton
        title="getFunctions (europe-west1)"
        onPress={() =>
          run('getFunctions(region)', () => {
            const europe = getFunctions(getApp(), 'europe-west1');
            return { appName: europe.app.name };
          })
        }
      />
      <AppButton
        title="connectFunctionsEmulator"
        onPress={() =>
          run('connectFunctionsEmulator', () => {
            ensureFunctionsEmulator();
            return `${getFunctionsEmulatorHost()}:${FUNCTIONS_EMULATOR_PORT}`;
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: useFunctionsEmulator is deprecated; invalid origins throw.
      </Text>
      <AppButton
        title="useFunctionsEmulator (deprecated; can throw)"
        onPress={() =>
          run('useFunctionsEmulator', () => {
            // WARNING: deprecated; invalid origins throw.
            functions.useFunctionsEmulator(
              `http://${getFunctionsEmulatorHost()}:${FUNCTIONS_EMULATOR_PORT}`,
            );
            emulatorConnected = true;
            return `http://${getFunctionsEmulatorHost()}:${FUNCTIONS_EMULATOR_PORT}`;
          })
        }
      />

      <Text style={styles.section}>Callables</Text>
      <AppButton
        title="httpsCallable"
        onPress={() =>
          run('httpsCallable', async () => {
            const callable = httpsCallable(functions, DEFAULT_CALLABLE);
            const response = await callable({
              type: 'string',
              asError: false,
              inputData: 'acde',
            });
            return response.data;
          })
        }
      />
      <AppButton
        title="httpsCallable (timeout option)"
        onPress={() =>
          run('httpsCallable(options)', async () => {
            const callable = httpsCallable(functions, DEFAULT_CALLABLE, { timeout: 10_000 });
            const response = await callable({
              type: 'number',
              asError: false,
              inputData: 1234,
            });
            return response.data;
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: limitedUseAppCheckTokens requests a limited-use App Check token. The call can
        reject depending on the App Check setup of the app and the callable.
      </Text>
      <AppButton
        title="httpsCallable (limitedUseAppCheckTokens option; can throw)"
        onPress={() =>
          run('httpsCallable(limitedUseAppCheckTokens)', async () => {
            const callable = httpsCallable(functions, DEFAULT_CALLABLE, {
              limitedUseAppCheckTokens: true,
            });
            const response = await callable({
              type: 'string',
              asError: false,
              inputData: 'acde',
            });
            return response.data;
          })
        }
      />
      <AppButton
        title="httpsCallableFromUrl"
        onPress={() =>
          run('httpsCallableFromUrl', async () => {
            const callable = httpsCallableFromUrl(functions, emulatorCallableUrl(DEFAULT_CALLABLE));
            const response = await callable({
              type: 'boolean',
              asError: false,
              inputData: true,
            });
            return response.data;
          })
        }
      />
      <AppButton
        title="httpsCallable.stream()"
        onPress={() =>
          run('httpsCallable.stream', async () => {
            const callable = httpsCallable(functions, STREAM_CALLABLE);
            const { stream, data } = await callable.stream({ count: 3, delay: 50 });
            const chunks: unknown[] = [];
            for await (const chunk of stream) {
              chunks.push(chunk);
            }
            const finalData = await data;
            return { chunks, finalData };
          })
        }
      />

      <Text style={styles.section}>Errors</Text>
      <AppButton
        title="HttpsErrorCode"
        onPress={() =>
          run('HttpsErrorCode', () => ({
            CANCELLED: HttpsErrorCode.CANCELLED,
            INVALID_ARGUMENT: HttpsErrorCode.INVALID_ARGUMENT,
          }))
        }
      />
      <AppButton
        title="FunctionsError === HttpsError"
        onPress={() =>
          run('FunctionsError alias', () => ({
            sameConstructor: FunctionsError === HttpsError,
          }))
        }
      />
      <Text style={styles.warning}>
        WARNING: this control calls a callable that rejects with HttpsError.
      </Text>
      <AppButton
        title="HttpsError (callable can throw)"
        onPress={() =>
          run('HttpsError', async () => {
            const callable = httpsCallable(functions, DEFAULT_CALLABLE);
            try {
              await callable({ type: 'not-a-sample-type', asError: false, inputData: null });
              return 'expected HttpsError was not thrown';
            } catch (e) {
              if (e instanceof HttpsError) {
                return {
                  isHttpsError: true,
                  code: e.code,
                  message: e.message,
                  details: e.details ?? null,
                };
              }
              throw e;
            }
          })
        }
      />
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  hint: { color: theme.subtleText, fontSize: 13, lineHeight: 18 },
  section: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  warning: { color: theme.error, fontSize: 13, lineHeight: 18 },
});
