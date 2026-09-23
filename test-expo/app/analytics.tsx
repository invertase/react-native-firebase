import { useState } from 'react';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';

import { ScreenChrome } from '../src/ScreenChrome';

export default function AnalyticsScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      logEvent(getAnalytics(), 'test_expo_example', { source: 'test-expo' });
      setResult('logged test_expo_example');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return <ScreenChrome title="analytics" onRun={handleRun} result={result} error={error} />;
}
