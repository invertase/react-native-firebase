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

import React from 'react';
import { StyleSheet, View, StatusBar, AppRegistry } from 'react-native';

import { JetProvider, ConnectionText, StatusEmoji, StatusText } from 'jet';

// Registering an error handler that always throw unhandled exceptions
// This is to enable Jet to exit on uncaught errors
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((err, isFatal) => {
  originalHandler(err, isFatal);
  throw err;
});

function loadTests(_) {
  beforeEach(async () => {
    // Allow time for things to settle between tests.
    await Utils.sleep(100);
  });
  const appTests = require.context('../packages/app/e2e', true, /\.e2e\.js$/);
  appTests.keys().forEach(appTests);
  const appCheckTests = require.context('../packages/app-check/e2e', true, /\.e2e\.js$/);
  appCheckTests.keys().forEach(appCheckTests);
  const appDistributionTests = require.context(
    '../packages/app-distribution/e2e',
    true,
    /\.e2e\.js$/,
  );
  appDistributionTests.keys().forEach(appDistributionTests);
  const analyticsTests = require.context('../packages/analytics/e2e', true, /\.e2e\.js$/);
  analyticsTests.keys().forEach(analyticsTests);
  const authTests = require.context('../packages/auth/e2e', true, /\.e2e\.js$/);
  authTests.keys().forEach(authTests);
  const crashlyticsTests = require.context('../packages/crashlytics/e2e', true, /\.e2e\.js$/);
  crashlyticsTests.keys().forEach(crashlyticsTests);
  const databaseTests = require.context('../packages/database/e2e', true, /\.e2e\.js$/);
  databaseTests.keys().forEach(databaseTests);
  const dynamicLinksTests = require.context('../packages/dynamic-links/e2e', true, /\.e2e\.js$/);
  dynamicLinksTests.keys().forEach(dynamicLinksTests);
  const firestoreTests = require.context('../packages/firestore/e2e', true, /\.e2e\.js$/);
  firestoreTests.keys().forEach(firestoreTests);
  const functionsTests = require.context('../packages/functions/e2e', true, /\.e2e\.js$/);
  functionsTests.keys().forEach(functionsTests);
  const perfTests = require.context('../packages/perf/e2e', true, /\.e2e\.js$/);
  perfTests.keys().forEach(perfTests);
  const messagingTests = require.context('../packages/messaging/e2e', true, /\.e2e\.js$/);
  messagingTests.keys().forEach(messagingTests);
  const mlTests = require.context('../packages/ml/e2e', true, /\.e2e\.js$/);
  mlTests.keys().forEach(mlTests);
  const inAppMessagingTests = require.context(
    '../packages/in-app-messaging/e2e',
    true,
    /\.e2e\.js$/,
  );
  inAppMessagingTests.keys().forEach(inAppMessagingTests);
  const installationsTests = require.context('../packages/installations/e2e', true, /\.e2e\.js$/);
  installationsTests.keys().forEach(installationsTests);
  const remoteConfigTests = require.context('../packages/remote-config/e2e', true, /\.e2e\.js$/);
  remoteConfigTests.keys().forEach(remoteConfigTests);
  const storageTests = require.context('../packages/storage/e2e', true, /\.e2e\.js$/);
  storageTests.keys().forEach(storageTests);
}

function App() {
  return (
    <JetProvider tests={loadTests}>
      <StatusBar hidden />
      <View style={styles.container}>
        <ConnectionText style={styles.connectionText} />
        <View style={styles.statusContainer}>
          <StatusEmoji style={styles.statusEmoji} />
          <StatusText style={styles.statusText} />
        </View>
      </View>
    </JetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusEmoji: {
    fontSize: 30,
    margin: 30,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 20,
    margin: 20,
    textAlign: 'center',
    color: 'black',
  },
  connectionText: {
    textAlign: 'center',
    color: 'black',
  },
});

AppRegistry.registerComponent('testing', () => App);
