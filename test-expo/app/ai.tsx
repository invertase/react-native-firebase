import { useState } from 'react';
import { Text } from 'react-native';
import { getAI, getGenerativeModel } from '@react-native-firebase/ai';
import { getApp } from '@react-native-firebase/app';

import { ScreenChrome } from '../src/ScreenChrome';

export default function AiScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const model = getGenerativeModel(getAI(getApp()), { model: 'gemini-2.5-flash' });
      const response = await model.generateContent('hello from test-expo');
      setResult(response.response.text());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="ai" onRun={handleRun} result={result} error={error}>
      <Text>{'PROJECT_ID=test-expo-fixture-fake is a placeholder; real AI calls will fail.'}</Text>
    </ScreenChrome>
  );
}
