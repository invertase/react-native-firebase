import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  SDK_VERSION,
  checkForUnsentReports,
  crash,
  deleteUnsentReports,
  didCrashOnPreviousExecution,
  getCrashlytics,
  log,
  recordError,
  sendUnsentReports,
  setAttribute,
  setAttributes,
  setCrashlyticsCollectionEnabled,
  setUserId,
} from '@react-native-firebase/crashlytics';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function CrashlyticsScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const crashlytics = useMemo(() => getCrashlytics(), []);

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
    <ScreenChrome title="crashlytics" result={result} error={error}>
      <Text style={styles.hint}>
        Controls mirror runtime APIs taught on the Crashlytics usage page. Crashlytics has no
        emulator, so every control calls the native SDK directly.
      </Text>
      <Text style={styles.hint}>
        In debug builds, native collection stays disabled unless crashlytics_debug_enabled is true
        in firebase.json. While it is disabled the native module ignores setUserId, setAttribute,
        setAttributes and recordError, and crash does nothing.
      </Text>
      <Text style={styles.hint}>
        expo-dev-client custom error overlay catches native crashes such as those from
        crash(getCrashlytics()) during development, so they are not reported to Firebase
        Crashlytics. Testing native crash reporting requires a build without that overlay.
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getCrashlytics"
        onPress={() =>
          run('getCrashlytics', () => {
            const instance = getCrashlytics();
            return {
              appName: instance.app.name,
              collectionEnabled: instance.isCrashlyticsCollectionEnabled,
            };
          })
        }
      />

      <Text style={styles.section}>Attributes and logs</Text>
      <AppButton
        title="log"
        onPress={() =>
          run('log', () => {
            log(crashlytics, 'test-expo example');
            return 'logged test-expo example';
          })
        }
      />
      <AppButton
        title="setUserId"
        onPress={() => run('setUserId', async () => setUserId(crashlytics, 'test-expo-user'))}
      />
      <AppButton
        title="setAttribute"
        onPress={() =>
          run('setAttribute', async () => setAttribute(crashlytics, 'source', 'test-expo'))
        }
      />
      <AppButton
        title="setAttributes"
        onPress={() =>
          run('setAttributes', async () =>
            setAttributes(crashlytics, {
              role: 'tester',
              screen: 'crashlytics',
            }),
          )
        }
      />

      <Text style={styles.section}>Errors and crashes</Text>
      <AppButton
        title="recordError"
        onPress={() =>
          run('recordError', () => {
            recordError(crashlytics, new Error('test-expo example non-fatal'));
            return 'recorded non-fatal error';
          })
        }
      />
      <AppButton
        title="recordError (with jsErrorName)"
        onPress={() =>
          run('recordError', () => {
            recordError(
              crashlytics,
              new Error('test-expo example named non-fatal'),
              'ExampleError',
            );
            return 'recorded non-fatal error named ExampleError';
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: crash() terminates the app when collection is enabled and does nothing when it is
        disabled. In expo-dev-client the custom error overlay may catch it so Firebase never
        receives the report.
      </Text>
      <AppButton
        title="crash (can throw / kill process)"
        onPress={() =>
          run('crash', () => {
            crash(crashlytics);
            return 'crash invoked';
          })
        }
      />

      <Text style={styles.section}>Collection</Text>
      <AppButton
        title="setCrashlyticsCollectionEnabled(true)"
        onPress={() =>
          run('setCrashlyticsCollectionEnabled', async () => {
            await setCrashlyticsCollectionEnabled(crashlytics, true);
            return { collectionEnabled: crashlytics.isCrashlyticsCollectionEnabled };
          })
        }
      />
      <AppButton
        title="setCrashlyticsCollectionEnabled(false)"
        onPress={() =>
          run('setCrashlyticsCollectionEnabled', async () => {
            await setCrashlyticsCollectionEnabled(crashlytics, false);
            return { collectionEnabled: crashlytics.isCrashlyticsCollectionEnabled };
          })
        }
      />

      <Text style={styles.section}>Unsent reports</Text>
      <Text style={styles.warning}>
        WARNING: checkForUnsentReports throws when Crashlytics collection is enabled.
      </Text>
      <AppButton
        title="checkForUnsentReports (can throw)"
        onPress={() => run('checkForUnsentReports', async () => checkForUnsentReports(crashlytics))}
      />
      <Text style={styles.warning}>
        WARNING: sendUnsentReports only reaches native when collection is enabled; when disabled it
        is a silent no-op.
      </Text>
      <AppButton
        title="sendUnsentReports"
        onPress={() =>
          run('sendUnsentReports', () => {
            sendUnsentReports(crashlytics);
            return 'sendUnsentReports invoked';
          })
        }
      />
      <AppButton
        title="deleteUnsentReports"
        onPress={() =>
          run('deleteUnsentReports', async () => {
            await deleteUnsentReports(crashlytics);
            return 'deleteUnsentReports completed';
          })
        }
      />
      <AppButton
        title="didCrashOnPreviousExecution"
        onPress={() =>
          run('didCrashOnPreviousExecution', async () => didCrashOnPreviousExecution(crashlytics))
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
