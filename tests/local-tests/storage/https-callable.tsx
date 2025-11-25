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
      const functionRunner = httpsCallable<number[], unknown>(
        getFunctions(getApp()),
        'testFunctionDefaultRegionV2',
      );
      const response = await functionRunner([1, 2, 3, 4]);
      console.log('response', response.data);
    } catch (e) {
      console.log('EEEE', e);
    }
  };

  return (
    <View>
      <Text>React Native Firebase</Text>
      <Text>Functions API</Text>
      <Text>Ensure Emulator is running!!</Text>
      <Button title="Call Function" onPress={handleCallFunction} />
    </View>
  );
}
