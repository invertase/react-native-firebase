/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect} from 'react';
import {Text, View} from 'react-native';

import {getApp} from '@react-native-firebase/app-exp';
// import {
//   getStorage,
//   ref,
//   uploadString,
// } from '@react-native-firebase/storage-exp';

function App() {
  // console.log('SSS', getStorage().bucket);

  useEffect(() => {
    console.log('AAA', getApp());
    // console.log(ref(getStorage(), 'elliot.txt'));
    // uploadString(ref(getStorage(), 'elliot.txt'), 'woo!')
    //   .then(console.log)
    //   .catch(console.log);
  }, []);

  return (
    <View>
      <Text>Hello World</Text>
    </View>
  );
}

export default App;
