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

import jet from 'jet/platform/react-native';
import NativeEventEmitter from '@react-native-firebase/app/lib/internal/RNFBNativeEventEmitter';

import '@react-native-firebase/admob';
import '@react-native-firebase/firestore';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import '@react-native-firebase/analytics';
import '@react-native-firebase/config';
import '@react-native-firebase/utils';
import '@react-native-firebase/dynamic-links';
import '@react-native-firebase/crashlytics';
import '@react-native-firebase/fiam';
import '@react-native-firebase/functions';
import '@react-native-firebase/messaging';
import '@react-native-firebase/ml-natural-language';
import '@react-native-firebase/ml-vision';
import '@react-native-firebase/storage';
import '@react-native-firebase/iid';
import '@react-native-firebase/indexing';
import '@react-native-firebase/invites';
import '@react-native-firebase/perf';
import firebase from '@react-native-firebase/app';

jet.exposeContextProperty('NativeModules', NativeModules);
jet.exposeContextProperty('NativeEventEmitter', NativeEventEmitter);
jet.exposeContextProperty('module', firebase);

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTest: null,
    };

    jet.exposeContextProperty('root', this);
  }

  render() {
    const { currentTest } = this.state;

    if (!currentTest) {
      return (
        <View style={[styles.container, styles.horizontal]}>
          <Image
            source={{
              uri:
                'https://github.com/invertase/react-native-firebase-starter/raw/master/assets/ReactNativeFirebase.png',
            }}
            style={[styles.logo]}
          />
          <Text style={[styles.item, styles.module]} testID="module">
            {'No Tests Started'}
          </Text>
          <Text style={styles.item} testID="group">
            {'N/A'}
          </Text>
          <Text style={styles.item} testID="title">
            {"Ensure you're running the Jet Packager together with the Detox test command."}
          </Text>
        </View>
      );
    }

    const module = (() => {
      if (currentTest.parent && currentTest.parent.parent) {
        return currentTest.parent.parent.title;
      }
      return currentTest.parent.title;
    })();

    const group = (() => {
      if (currentTest.parent && currentTest.parent.parent) {
        return currentTest.parent.title;
      }
      return '';
    })();

    const retrying = (() => {
      const retry = currentTest.currentRetry();
      if (retry > 0) {
        return `⚠️ Test failed, retrying... (${retry})`;
      }
      return null;
    })();

    return (
      <View style={[styles.container, styles.horizontal]}>
        <Image
          source={{
            uri:
              'https://github.com/invertase/react-native-firebase-starter/raw/master/assets/RNFirebase.png',
          }}
          style={[styles.logo]}
        />
        <Text style={[styles.item, styles.module]} testID="module">
          {module}
        </Text>
        <Text style={styles.item} testID="group">
          {group}
        </Text>
        <Text style={styles.item} testID="title">
          {currentTest.title}
        </Text>
        {retrying && (
          <Text style={[styles.retry, styles.item]} testID="title">
            {retrying}
          </Text>
        )}
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
  item: {
    marginBottom: 10,
    textAlign: 'center',
  },
  retry: {
    marginTop: 10,
    fontSize: 20,
    color: '#cccc33',
  },
  module: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  group: {
    fontSize: 16,
    color: 'grey',
  },
  logo: {
    height: 120,
    marginBottom: 16,
    width: 135,
  },
});

AppRegistry.registerComponent('testing', () => Root);
