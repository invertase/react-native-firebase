import { useState } from 'react';
import { Text } from 'react-native';
import { getVerificationSupportInfo } from '@react-native-firebase/phone-number-verification';

import { ScreenChrome } from '../src/ScreenChrome';

export default function PhoneNumberVerificationScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const support = await getVerificationSupportInfo();
      setResult(JSON.stringify(support));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="phone-number-verification" onRun={handleRun} result={result} error={error}>
      <Text>
        {
          'Android-only. getVerificationSupportInfo() throws on iOS. PROJECT_ID=test-expo-fixture-fake is a placeholder; real Phone Number Verification calls will fail.'
        }
      </Text>
    </ScreenChrome>
  );
}
