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

import React, { useEffect, useState } from 'react';
import { AppRegistry, Text, Image, Button, StyleSheet, View } from 'react-native';

import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async r => {
  console.log('setBackgroundMessageHandler', r);
  await messaging().getAPNSToken();
});

messaging().onMessage(async msg => {
  console.warn('onMessage', msg);
  await messaging().getAPNSToken();
});

function Root() {
  const [token, setToken] = useState('');
  const [apnsToken, setAPNSToken] = useState('');
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    messaging()
      .requestPermission()
      .then(perm => {
        console.log('Permission status:', perm);
        // if (perm) {
        return messaging().registerDeviceForRemoteMessages();
        // }
        // return Promise.resolve();
      })
      .then(() => {
        console.log('registerDeviceForRemoteMessages resolved');
        return messaging().getToken();
      })
      .then(async t => {
        console.log('Got token', t);
        const apnToken = await messaging().getAPNSToken();
        console.log('Got apns token', apnToken);

        setToken(t);
        setAPNSToken(apnToken);
      })
      .catch(console.error);

    messaging()
      .getInitialNotification()
      .then(n => {
        console.warn('initial notification', n);
      });

    // messaging().onNotificationOpenedApp(event => {
    //   console.log('onNotificationOpenedApp', event);
    // });
    //
    //
  }, [counter]);

  return (
    <View style={[styles.container, styles.horizontal]}>
      <Text>{token}</Text>
      <Text>{'  APNS:  '}</Text>
      <Text>{apnsToken}</Text>
      <Button onPress={() => setCounter(counter + 1)} title={'Refresh'} />
    </View>
  );
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
