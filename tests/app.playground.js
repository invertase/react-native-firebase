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

// import '@react-native-firebase/analytics';
// import '@react-native-firebase/config';
// import '@react-native-firebase/utils';
// import '@react-native-firebase/crashlytics';
// import '@react-native-firebase/fiam';
// import '@react-native-firebase/functions';
// import '@react-native-firebase/mlkit';
// import '@react-native-firebase/storage';
// import '@react-native-firebase/iid';
// import '@react-native-firebase/invites';
// import '@react-native-firebase/perf';
import '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';

class Root extends Component {
  constructor(props) {
    super(props);
    try {
      this.runSingleTest().catch(console.error);
    } catch (error) {
      console.error(error);
    }
  }

  async runSingleTest() {
    // const random = Utils.randString(12, '#aA');
    const random = 'adsdgdfgh2612';
    const email = `${random}@${random}.com`;

    const { user } = await firebase.auth().createUserWithEmailAndPassword(email, random);

    console.log('After create user', user);

    // Test
    const token = await user.getIdToken();

    console.log('After create token', token);

    // Assertions
    // token.should.be.a.String();
    // token.length.should.be.greaterThan(24);

    // Clean up
    await firebase.auth().currentUser.delete();

    console.log('After delete user', token);
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
