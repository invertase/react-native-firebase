import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { SDK_VERSION, getML } from '@react-native-firebase/ml';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function MlScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ml = useMemo(() => getML(), []);

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
    <ScreenChrome title="ml" result={result} error={error}>
      <Text style={styles.hint}>
        Controls mirror runtime APIs taught on the ML usage page (getML and SDK_VERSION only). This
        package is a legacy shell: no Cloud Vision or custom-model methods. There is no emulator and
        no connect*Emulator helper; ML is not in yarn tests:emulator:start-ci. Prefer Google ML Kit,
        Cloud Vision via a backend, or @react-native-firebase/ai for new work. Do not use
        @react-native-firebase/vertexai.
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getML"
        onPress={() =>
          run('getML', () => {
            const instance = getML();
            const sameDefaultApp = getML(getApp());
            return {
              appName: instance.app.name,
              sameAsMemo: instance === ml,
              sameAsGetApp: sameDefaultApp === instance,
            };
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
});
