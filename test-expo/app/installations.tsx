import { useState } from 'react';
import { Text } from 'react-native';
import { getId, getInstallations } from '@react-native-firebase/installations';

import { ScreenChrome } from '../src/ScreenChrome';

export default function InstallationsScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const id = await getId(getInstallations());
      setResult(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="installations" onRun={handleRun} result={result} error={error}>
      <Text>
        {'PROJECT_ID=test-expo-fixture-fake is a placeholder; real Installations calls will fail.'}
      </Text>
    </ScreenChrome>
  );
}
