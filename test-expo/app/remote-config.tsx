import { useState } from 'react';
import { Text } from 'react-native';
import {
  fetchAndActivate,
  getAll,
  getRemoteConfig,
  getValue,
} from '@react-native-firebase/remote-config';

import { ScreenChrome } from '../src/ScreenChrome';

export default function RemoteConfigScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setError(null);
    try {
      const remoteConfig = getRemoteConfig();
      const activated = await fetchAndActivate(remoteConfig);
      const example = getValue(remoteConfig, 'example');
      const all = Object.fromEntries(
        Object.entries(getAll(remoteConfig)).map(([key, value]) => [key, value.asString()]),
      );
      setResult(
        JSON.stringify({
          activated,
          example: example.asString(),
          exampleSource: example.getSource(),
          all,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScreenChrome title="remote-config" onRun={handleRun} result={result} error={error}>
      <Text>
        {'PROJECT_ID=test-expo-fixture-fake is a placeholder; real Remote Config calls will fail.'}
      </Text>
    </ScreenChrome>
  );
}
