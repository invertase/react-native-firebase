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

import '@react-native-firebase/admob';
import '@react-native-firebase/analytics';
import firebase from '@react-native-firebase/app';
import NativeEventEmitter from '@react-native-firebase/app/lib/internal/RNFBNativeEventEmitter';
import '@react-native-firebase/app/lib/utils';
import '@react-native-firebase/auth';
import '@react-native-firebase/crashlytics';
import '@react-native-firebase/database';
import '@react-native-firebase/dynamic-links';
import '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import '@react-native-firebase/iid';
import '@react-native-firebase/in-app-messaging';
import '@react-native-firebase/messaging';
import '@react-native-firebase/ml-natural-language';
import '@react-native-firebase/ml-vision';
import '@react-native-firebase/perf';
import '@react-native-firebase/remote-config';
import '@react-native-firebase/storage';
import jet from 'jet/platform/react-native';
import React from 'react';
import { AppRegistry, NativeModules, Text, View } from 'react-native';

jet.exposeContextProperty('NativeModules', NativeModules);
jet.exposeContextProperty('NativeEventEmitter', NativeEventEmitter);
jet.exposeContextProperty('module', firebase);

const firestore = firebase.firestore();
firestore.settings({ host: 'localhost:8080', ssl: false, persistence: true });

function Root() {
  return (
    <View
      testID="welcome"
      style={{ flex: 1, paddingTop: 20, justifyContent: 'center', alignItems: 'center' }}
    >
      <Text style={{ fontSize: 25, marginBottom: 30 }}>Testing App</Text>
    </View>
  );
}

AppRegistry.registerComponent('testing', () => Root);
