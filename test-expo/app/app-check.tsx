import { useState } from 'react';
import { Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getToken, initializeAppCheck } from '@react-native-firebase/app-check';

import { ScreenChrome } from '../src/ScreenChrome';

export default function AppCheckScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const appCheck = initializeAppCheck(getApp(), {
        provider: {
          providerOptions: {
            android: { provider: 'debug' },
            apple: { provider: 'debug' },
          },
        },
      });
      const tokenResult = await getToken(appCheck);
      setResult(JSON.stringify({ token: tokenResult.token }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="app-check" onRun={handleRun} result={result} error={error}>
      <Text>
        {'PROJECT_ID=test-expo-fixture-fake is a placeholder; real App Check calls will fail.'}
      </Text>
    </ScreenChrome>
  );
}
