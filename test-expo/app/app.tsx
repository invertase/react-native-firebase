import { useState } from 'react';
import { Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';

import { ScreenChrome } from '../src/ScreenChrome';

export default function AppScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const app = getApp();
      setResult(JSON.stringify({ name: app.name, options: app.options }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="app" onRun={handleRun} result={result} error={error}>
      <Text>{'PROJECT_ID=test-expo-fixture-fake is a placeholder; real App calls will fail.'}</Text>
    </ScreenChrome>
  );
}
