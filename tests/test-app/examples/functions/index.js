import React from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';

import { getApp } from '@react-native-firebase/app';
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from '@react-native-firebase/functions';

const functions = getFunctions();
connectFunctionsEmulator(functions, 'localhost', 5001);
function App() {
  return (
    <View>
      <Text>React Native Firebase</Text>
      <Text>Functions API</Text>
      <Text>Ensure Emulator is running!!</Text>
      <Button
        title="Call Function"
        onPress={async () => {
          try {
            const functionRunner = httpsCallable(
              getFunctions(getApp()),
              'testFunctionDefaultRegionV2',
            );
            const response = await functionRunner([1, 2, 3, 4]);
            console.log('response', response.data);
          } catch (e) {
            console.log('EEEE', e);
          }
        }}
      />
    </View>
  );
}

AppRegistry.registerComponent('testing', () => App);
