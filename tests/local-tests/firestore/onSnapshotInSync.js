/* eslint-disable no-console */
/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
