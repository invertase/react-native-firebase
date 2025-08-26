/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { Button, Text, View } from 'react-native';

import '@react-native-firebase/app';
import {
  collection,
  doc,
  setDoc,
  getFirestore,
  onSnapshotsInSync,
} from '@react-native-firebase/firestore';

export function FirestoreOnSnapshotInSyncTest() {
  let unsubscribe;

  const subscribe = () => {
    if (unsubscribe) {
      console.log('already subscribed');
      return;
    }
    unsubscribe = onSnapshotsInSync(getFirestore(), () => {
      console.log('snapshots are in sync.');
    });
  };
  useEffect(() => {
    subscribe();
  }, []);

  async function addDocument() {
    console.log('adding a document');
    await setDoc(doc(collection(getFirestore(), 'flutter-tests'), 'one'), { foo: 'bar' });
    console.log('done adding a document');
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
            console.log('Add document failed', e);
          }
        }}
      />
      <Button
        title="unsubscribe to snapshot in sync"
        onPress={() => {
          try {
            unsubscribe();
            unsubscribe = undefined;
          } catch (e) {
            console.log('Unsubscribe failed: ', e);
          }
        }}
      />
      <Button
        title="subscribe to snapshot in sync"
        onPress={() => {
          try {
            subscribe();
          } catch (e) {
            console.log('Subscribe failed: ', e);
          }
        }}
      />
    </View>
  );
}
