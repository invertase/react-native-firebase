import { useState } from 'react';
import { Text } from 'react-native';
import { doc, getDoc, getFirestore } from '@react-native-firebase/firestore';

import { ScreenChrome } from '../src/ScreenChrome';

export default function FirestoreScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const snapshot = await getDoc(doc(getFirestore(), 'example/doc'));
      setResult(JSON.stringify({ exists: snapshot.exists(), data: snapshot.data() ?? null }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="firestore" onRun={handleRun} result={result} error={error}>
      <Text>
        {'PROJECT_ID=test-expo-fixture-fake is a placeholder; real Firestore calls will fail.'}
      </Text>
    </ScreenChrome>
  );
}
