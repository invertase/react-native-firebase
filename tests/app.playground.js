/* eslint-disable import/extensions,import/no-unresolved,import/first,import/no-extraneous-dependencies,no-console */
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

import React, { Component } from 'react';
import { AppRegistry, Image, StyleSheet, View } from 'react-native';

import '@react-native-firebase/analytics';
import '@react-native-firebase/config';
import '@react-native-firebase/utils';
import '@react-native-firebase/crashlytics';
import '@react-native-firebase/fiam';
import '@react-native-firebase/functions';
import '@react-native-firebase/mlkit';
import '@react-native-firebase/storage';
import '@react-native-firebase/iid';
import '@react-native-firebase/invites';
import '@react-native-firebase/perf';
import firebase from '@react-native-firebase/app';

class Root extends Component {
  constructor(props) {
    super(props);
    this.runSingleTest();
  }

  async runSingleTest() {
    await firebase
      .storage()
      .ref('/cat.gif')
      .getFile(`${firebase.storage.Path.DocumentDirectory}/pauseUpload.gif`);

    const ref = firebase.storage().ref('/uploadCat.gif');
    const path = `${firebase.storage.Path.DocumentDirectory}/pauseUpload.gif`;
    const uploadTask = ref.putFile(path);

    let hadRunningStatus = false;
    let hadPausedStatus = false;
    let hadResumedStatus = false;

    uploadTask.on(
      'state_changed',
      snapshot => {
        console.log('---->      ', snapshot.state);
        console.dir(snapshot.error);
        // 1) pause when we receive first running event
        if (snapshot.state === firebase.storage.TaskState.RUNNING && !hadRunningStatus) {
          console.log('-->   Pausing');
          hadRunningStatus = true;
          setTimeout(() => {
            uploadTask.pause();
          }, 1000);
        }

        // 2) resume when we receive first paused event
        if (snapshot.state === firebase.storage.TaskState.PAUSED) {
          hadPausedStatus = true;
          setTimeout(() => {
            console.log('-->   Resuming');
            uploadTask.resume();
          }, 1000);
        }

        // 3) track that we resumed on 2nd running status whilst paused
        if (
          snapshot.state === firebase.storage.TaskState.RUNNING &&
          hadRunningStatus &&
          hadPausedStatus &&
          !hadResumedStatus
        ) {
          console.log('-->   Resumed');
          hadResumedStatus = true;
        }

        // 4) finally confirm we received all statuses
        if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
          console.log('-->   Success');
          console.log('FINISH');
        }
      },
      error => {
        console.log('ERROR', error);
      },
    );

    return Promise.resolve();
  }

  render() {
    return (
      <View style={[styles.container, styles.horizontal]}>
        <Image
          source={{
            uri:
              'https://github.com/invertase/react-native-firebase-starter/raw/master/assets/ReactNativeFirebase.png',
          }}
          style={[styles.logo]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  logo: {
    height: 120,
    marginBottom: 16,
    width: 135,
  },
});

AppRegistry.registerComponent('testing', () => Root);
