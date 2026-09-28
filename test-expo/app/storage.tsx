import { useState } from 'react';
import { getMetadata, getStorage, ref } from '@react-native-firebase/storage';

import { ScreenChrome } from '../src/ScreenChrome';

export default function StorageScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const metadata = await getMetadata(ref(getStorage(), 'example'));
      setResult(JSON.stringify(metadata));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return <ScreenChrome title="storage" onRun={handleRun} result={result} error={error} />;
}
