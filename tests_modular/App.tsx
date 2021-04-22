/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {Text, View} from 'react-native';

import {getApp, getApps} from '@react-native-firebase-modular/app';

function App() {
  getApps().forEach(app => {
    console.log(app.name);
  });

  return (
    <View>
      <Text>Hello World</Text>
    </View>
  );
}

export default App;
