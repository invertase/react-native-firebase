import { useState } from 'react';
import { Text } from 'react-native';
import { getMessaging, getToken } from '@react-native-firebase/messaging';

import { ScreenChrome } from '../src/ScreenChrome';

export default function MessagingScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const token = await getToken(getMessaging());
      setResult(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="messaging" onRun={handleRun} result={result} error={error}>
      <Text>
        {'PROJECT_ID=test-expo-fixture-fake is a placeholder; real Messaging calls will fail.'}
      </Text>
    </ScreenChrome>
  );
}
