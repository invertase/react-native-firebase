import { useState } from 'react';
import { Text } from 'react-native';
import { getPerformance, trace } from '@react-native-firebase/perf';

import { ScreenChrome } from '../src/ScreenChrome';

export default function PerfScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const perfTrace = trace(getPerformance(), 'test-expo-example');
      perfTrace.start();
      perfTrace.stop();
      setResult('trace test-expo-example start/stop completed');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="perf" onRun={handleRun} result={result} error={error}>
      <Text>
        {'PROJECT_ID=test-expo-fixture-fake is a placeholder; real Performance calls will fail.'}
      </Text>
    </ScreenChrome>
  );
}
