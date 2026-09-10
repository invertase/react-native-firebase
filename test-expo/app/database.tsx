import { useState } from 'react';
import { Text } from 'react-native';
import { get, getDatabase, ref } from '@react-native-firebase/database';

import { ScreenChrome } from '../src/ScreenChrome';

export default function DatabaseScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const snapshot = await get(ref(getDatabase(), '/example'));
      setResult(JSON.stringify(snapshot.val() ?? null));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="database" onRun={handleRun} result={result} error={error}>
      <Text>
        {'PROJECT_ID=test-expo-fixture-fake is a placeholder; real Database calls will fail.'}
      </Text>
    </ScreenChrome>
  );
}
