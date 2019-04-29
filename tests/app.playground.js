/* eslint-disable import/extensions,import/no-unresolved,import/first,import/no-extraneous-dependencies */
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
import { AppRegistry, Image, NativeModules, StyleSheet, Text, View } from 'react-native';

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
    try {
      await firebase
        .storage()
        .ref('/not.jpg')
        .getFile(`${firebase.storage.Path.DocumentDirectory}/not.jpg`);
      return Promise.reject(new Error('No permission denied error'));
    } catch (error) {
      error.code.should.equal('storage/unauthorized');
      error.message.includes('not authorized').should.be.true();
      return Promise.resolve();
    }
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
