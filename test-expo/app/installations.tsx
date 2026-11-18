import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  SDK_VERSION,
  deleteInstallations,
  getId,
  getInstallations,
  getToken,
  onIdChange,
} from '@react-native-firebase/installations';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function InstallationsScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const installations = useMemo(() => getInstallations(), []);

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
    <ScreenChrome title="installations" result={result} error={error}>
      <Text style={styles.hint}>
        Controls mirror runtime APIs taught on the Installations usage page. There is no
        Installations emulator and no connect*Emulator helper.
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getInstallations"
        onPress={() =>
          run('getInstallations', () => {
            const instance = getInstallations();
            const sameDefaultApp = getInstallations(getApp());
            return {
              appName: instance.app.name,
              sameAsMemo: instance === installations,
              sameAsGetApp: sameDefaultApp === instance,
            };
          })
        }
      />

      <Text style={styles.section}>Identifiers and tokens</Text>
      <AppButton
        title="getId"
        onPress={() => run('getId', async () => ({ id: await getId(installations) }))}
      />
      <AppButton
        title="getToken"
        onPress={() =>
          run('getToken', async () => ({
            token: await getToken(installations, true),
          }))
        }
      />

      <Text style={styles.section}>Delete and listeners</Text>
      <Text style={styles.warning}>
        WARNING: deleteInstallations removes this app installation and associated data. A later
        getId may create a new, unrelated installation ID.
      </Text>
      <AppButton
        title="deleteInstallations"
        onPress={() =>
          run('deleteInstallations', async () => {
            await deleteInstallations(installations);
            return { deleted: true };
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: onIdChange throws on React Native Firebase. It is unsupported (API shape parity
        only).
      </Text>
      <AppButton
        title="onIdChange (throws)"
        onPress={() =>
          run('onIdChange', () => {
            const unsubscribe = onIdChange(installations, () => {});
            return { unsubscribed: typeof unsubscribe === 'function' };
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
