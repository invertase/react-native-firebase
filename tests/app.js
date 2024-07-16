import React from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';
import firebase, { utils } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

function App() {
  const db = firestore();
  const indexManager = db.persistentCacheIndexManager();

  return (
    <View>
      <Text>text text text</Text>
      <Text>text text text</Text>
      <Text>text text text</Text>
      <Button
        title="enableIndexAutoCreation"
        onPress={async () => {
          try {
            await indexManager.enableIndexAutoCreation();
          } catch (e) {
            console.log('EEEE', e);
          }
        }}
      />
      <Button
        title="disableIndexAutoCreation"
        onPress={async () => {
          try {
            await indexManager.disableIndexAutoCreation();
          } catch (e) {
            console.log('EEEE', e);
          }
        }}
      />
      <Button
        title="deleteAllIndexes"
        onPress={async () => {
          try {
            await indexManager.deleteAllIndexes();
          } catch (e) {
            console.log('EEEE', e);
          }
        }}
      />
    </View>
  );
}

AppRegistry.registerComponent('testing', () => App);
