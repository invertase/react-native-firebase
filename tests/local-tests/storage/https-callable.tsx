import React from 'react';
import { Button, Text, View } from 'react-native';

import { getApp } from '@react-native-firebase/app';
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from '@react-native-firebase/functions';

const functions = getFunctions();
connectFunctionsEmulator(functions, 'localhost', 5001);

export function HttpsCallableTestComponent(): React.JSX.Element {
  const handleCallFunction = async (): Promise<void> => {
    try {
      const functionRunner = httpsCallable<unknown[], unknown>(
        getFunctions(getApp()),
        'testFunctionDefaultRegionV2',
      );
      const response = await functionRunner([1, 2, 3, 4, null, { yo: 1, nooo: null }]);
      console.log('response', response.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: 'bold', padding: 20, textAlign: 'center' }}>
        Ensure Emulator is running!!
      </Text>

      <Button title="Call Function" onPress={handleCallFunction} />
    </View>
  );
}
