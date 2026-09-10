import { useState } from 'react';
import { Text } from 'react-native';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

import { ScreenChrome } from '../src/ScreenChrome';

export default function FunctionsScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const ping = httpsCallable(getFunctions(), 'ping');
      const response = await ping();
      setResult(JSON.stringify(response.data ?? null));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="functions" onRun={handleRun} result={result} error={error}>
      <Text>
        {'PROJECT_ID=test-expo-fixture-fake is a placeholder; real Functions calls will fail.'}
      </Text>
    </ScreenChrome>
  );
}
