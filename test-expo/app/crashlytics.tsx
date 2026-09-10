import { useState } from 'react';
import { Text } from 'react-native';
import { getCrashlytics, log, recordError } from '@react-native-firebase/crashlytics';

import { ScreenChrome } from '../src/ScreenChrome';

export default function CrashlyticsScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const crashlytics = getCrashlytics();
      log(crashlytics, 'test-expo example');
      recordError(crashlytics, new Error('test-expo example non-fatal'));
      setResult('logged and recorded a non-fatal error');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="crashlytics" onRun={handleRun} result={result} error={error}>
      <Text>
        {
          'expo-dev-client custom error overlay catches native crashes such as those from crash(getCrashlytics()) during development, so they are not reported to Firebase Crashlytics. Testing native crash reporting requires a build without that overlay.'
        }
      </Text>
      <Text>
        {'PROJECT_ID=test-expo-fixture-fake is a placeholder; real Crashlytics calls will fail.'}
      </Text>
    </ScreenChrome>
  );
}
