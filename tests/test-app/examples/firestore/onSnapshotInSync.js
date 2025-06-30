import React, { useEffect } from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';

import '@react-native-firebase/app';
import firestore, { onSnapshotsInSync } from '@react-native-firebase/firestore';

const fire = firestore();
function App() {
  let unsubscribe;
  useEffect(() => {
    unsubscribe = onSnapshotsInSync(fire, () => {
      console.log('onSnapshotsInSync');
    });
  }, []);

  async function addDocument() {
    await firestore().collection('flutter-tests').doc('one').set({ foo: 'bar' });
  }

  return (
    <View>
      <Text>React Native Firebase</Text>
      <Text>onSnapshotsInSync API</Text>
      <Button
        title="add document"
        onPress={async () => {
          try {
            addDocument();
          } catch (e) {
            console.log('EEEE', e);
          }
        }}
      />
      <Button
        title="unsubscribe to snapshot in sync"
        onPress={async () => {
          try {
            unsubscribe();
          } catch (e) {
            console.log('EEEE', e);
          }
        }}
      />
    </View>
  );
}

AppRegistry.registerComponent('testing', () => App);
