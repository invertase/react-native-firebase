import React, { useState } from 'react';
import { Button, Text, View, ScrollView } from 'react-native';

import { getApp } from '@react-native-firebase/app';
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from '@react-native-firebase/functions';

const functions = getFunctions();
connectFunctionsEmulator(functions, 'localhost', 5001);

export function HttpsCallableTestComponent(): React.JSX.Element {
  const [responseData, setResponseData] = useState<string>('');

  const handleCallFunction = async (): Promise<void> => {
    try {
      const functionRunner = httpsCallable<unknown[], unknown>(
        getFunctions(getApp()),
        'testFunctionDefaultRegionV2',
      );
      const response = await functionRunner([1, 2, 3, 4, null, { yo: 1, nooo: null }]);
      setResponseData(JSON.stringify(response.data, null, 2));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', padding: 20, textAlign: 'center' }}>
        Ensure Emulator is running!!
      </Text>

      <Button title="Call Function" onPress={handleCallFunction} />

      {responseData ? (
        <ScrollView
          style={{ margin: 20, backgroundColor: '#E8E8E8', borderRadius: 8, padding: 15 }}
        >
          <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#333' }}>
            {responseData}
          </Text>
        </ScrollView>
      ) : null}
    </View>
  );
}
