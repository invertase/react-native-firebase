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

import '@react-native-firebase/analytics';
import * as analyticsModular from '@react-native-firebase/analytics';
import firebase, * as modular from '@react-native-firebase/app';
import '@react-native-firebase/app-check';
import * as appCheckModular from '@react-native-firebase/app-check';
import '@react-native-firebase/app-distribution';
import NativeEventEmitter from '@react-native-firebase/app/lib/internal/RNFBNativeEventEmitter';
import '@react-native-firebase/app/lib/utils';
import '@react-native-firebase/auth';
import '@react-native-firebase/crashlytics';
import '@react-native-firebase/database';
import '@react-native-firebase/dynamic-links';
import '@react-native-firebase/firestore';
import * as functionsModular from '@react-native-firebase/functions';
import '@react-native-firebase/in-app-messaging';
import '@react-native-firebase/installations';
import '@react-native-firebase/messaging';
import * as messagingModular from '@react-native-firebase/messaging';
import '@react-native-firebase/ml';
import * as perfModular from '@react-native-firebase/perf';
import '@react-native-firebase/remote-config';
import * as remoteConfigModular from '@react-native-firebase/remote-config';
import '@react-native-firebase/storage';
import * as storageModular from '@react-native-firebase/storage';
import jet from 'jet/platform/react-native';
import React from 'react';
import { AppRegistry, Button, NativeModules, Text, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import * as installationsModular from '@react-native-firebase/installations';
import * as dynamicLinksModular from '@react-native-firebase/dynamic-links';

jet.exposeContextProperty('NativeModules', NativeModules);
jet.exposeContextProperty('NativeEventEmitter', NativeEventEmitter);
jet.exposeContextProperty('DeviceInfo', DeviceInfo);
jet.exposeContextProperty('module', firebase);
jet.exposeContextProperty('modular', modular);
jet.exposeContextProperty('functionsModular', functionsModular);
jet.exposeContextProperty('analyticsModular', analyticsModular);
jet.exposeContextProperty('remoteConfigModular', remoteConfigModular);
jet.exposeContextProperty('perfModular', perfModular);
jet.exposeContextProperty('appCheckModular', appCheckModular);
jet.exposeContextProperty('messagingModular', messagingModular);
jet.exposeContextProperty('storageModular', storageModular);
jet.exposeContextProperty('installationsModular', installationsModular);
jet.exposeContextProperty('dynamicLinksModular', dynamicLinksModular);

firebase.database().useEmulator('localhost', 9000);
firebase.auth().useEmulator('http://localhost:9099');
firebase.firestore().useEmulator('localhost', 8080);
firebase.storage().useEmulator('localhost', 9199);
firebase.functions().useEmulator('localhost', 5001);

// Firestore caches documents locally (a great feature!) and that confounds tests
// as data from previous runs pollutes following runs until re-install the app. Clear it.
firebase.firestore().clearPersistence();

function Root() {
  return (
    <View
      testID="welcome"
      style={{ flex: 1, paddingTop: 20, justifyContent: 'center', alignItems: 'center' }}
    >
      <Text style={{ fontSize: 25, marginBottom: 30 }}>React Native Firebase</Text>
      <Text style={{ fontSize: 25, marginBottom: 30 }}>End-to-End Testing App</Text>
      <Button
        style={{ flex: 1, marginTop: 20 }}
        title={'Test Native Crash Now.'}
        onPress={() => {
          firebase.crashlytics().crash();
        }}
      />
      <View testId="spacer" style={{ height: 20 }} />
      <Button
        style={{ flex: 1, marginTop: 20 }}
        title={'Test Javascript Crash Now.'}
        onPress={() => {
          undefinedVariable.notAFunction();
        }}
      />
    </View>
  );
}

AppRegistry.registerComponent('testing', () => Root);
