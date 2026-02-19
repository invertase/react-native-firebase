import React, { useMemo, useState } from 'react';
import { Button, Text, View, ScrollView } from 'react-native';

import { getApp } from '@react-native-firebase/app';
import { RemoteConfigService, createFirebaseRemoteConfigClient } from './RemoteConfigService';

const REMOTE_CONFIG_KEYS = ['local_test_1', 'local_test_2'];

export function RemoteConfigTestComponent(): React.JSX.Element {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const remoteConfigService = useMemo(() => {
    const app = getApp();
    const client = createFirebaseRemoteConfigClient();
    return new RemoteConfigService(app, client);
  }, []);

  const handleFetchAndActivate = async (): Promise<void> => {
    setLoading(true);
    setStatus('');

    try {
      const result = await remoteConfigService.fetchAndActivate(REMOTE_CONFIG_KEYS);
      setStatus(RemoteConfigService.formatResult(result));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', padding: 20, textAlign: 'center' }}>
        Uses real Remote Config backend (no emulator). Ensure project has config in Firebase
        Console.
      </Text>

      <Button
        title={loading ? 'Fetching...' : 'Fetch and activate'}
        onPress={handleFetchAndActivate}
        disabled={loading}
      />

      {status ? (
        <ScrollView
          style={{ margin: 20, backgroundColor: '#E8E8E8', borderRadius: 8, padding: 15 }}
        >
          <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#333' }}>{status}</Text>
        </ScrollView>
      ) : null}
    </View>
  );
}
