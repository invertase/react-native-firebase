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

import React from 'react';
import { StyleSheet, View, StatusBar, AppRegistry } from 'react-native';

import { JetProvider, ConnectionText, StatusEmoji, StatusText } from 'jet';

const platformSupportedModules = [];

if (Platform.other) {
  platformSupportedModules.push('app');
  platformSupportedModules.push('functions');
  platformSupportedModules.push('firestore');
  platformSupportedModules.push('database');
  platformSupportedModules.push('auth');
  platformSupportedModules.push('storage');
  platformSupportedModules.push('remoteConfig');
  platformSupportedModules.push('analytics');
  platformSupportedModules.push('appCheck');
  // TODO add more modules here once they are supported.
}

if (!Platform.other) {
  platformSupportedModules.push('app');
  platformSupportedModules.push('functions');
  platformSupportedModules.push('auth');
  platformSupportedModules.push('database');
  platformSupportedModules.push('firestore');
  platformSupportedModules.push('storage');
  platformSupportedModules.push('messaging');
  platformSupportedModules.push('perf');
  platformSupportedModules.push('analytics');
  platformSupportedModules.push('remoteConfig');
  platformSupportedModules.push('crashlytics');
  platformSupportedModules.push('inAppMessaging');
  platformSupportedModules.push('installations');
  platformSupportedModules.push('appCheck');
  platformSupportedModules.push('appDistribution');
  platformSupportedModules.push('dynamicLinks');
  platformSupportedModules.push('ml');
}
// Registering an error handler that always throw unhandled exceptions
// This is to enable Jet to exit on uncaught errors
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((err, isFatal) => {
  originalHandler(err, isFatal);
  throw err;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function loadTests(_) {
  describe('React Native Firebase', function () {
    if (!global.RNFBDebug) {
      // Only retry tests if not debugging locally,
      // otherwise it gets annoying to debug.
      this.retries(4);
    }

    before(async function () {
      if (platformSupportedModules.includes('functions'))
        firebase.functions().useEmulator('localhost', 5001);
      if (platformSupportedModules.includes('database'))
        firebase.database().useEmulator('localhost', 9000);
      if (platformSupportedModules.includes('auth'))
        firebase.auth().useEmulator('http://localhost:9099');
      if (platformSupportedModules.includes('firestore')) {
        firebase.firestore().useEmulator('localhost', 8080);
        firebase.app().firestore('second-rnfb').useEmulator('localhost', 8080);
        // Firestore caches documents locally (a great feature!) and that confounds tests
        // as data from previous runs pollutes following runs until re-install the app. Clear it.
        if (!Platform.other) {
          firebase.firestore().clearPersistence();
        }
      }
      if (platformSupportedModules.includes('storage')) {
        firebase.storage().useEmulator('localhost', 9199);
        firebase.app().storage('gs://react-native-firebase-testing').useEmulator('localhost', 9199);
      }
    });

    afterEach(async function afterEachTest() {
      global.RNFBDebugLastTest = this.currentTest.title;
      global.RNFBDebugInTestLeakDetection = false;
      if (RNFBDebug) {
        const emoji = this.currentTest.state === 'passed' ? '✅' : '❌';
        console.debug(`[TEST->Finish][${emoji}] ${this.currentTest.title}`);
        console.debug('');
      }
      // Allow time for things to settle between tests.
      await Utils.sleep(25);
    });

    beforeEach(async function beforeEachTest() {
      const retry = this.currentTest.currentRetry();
      if (RNFBDebug) {
        console.debug('');
        console.debug('');
        console.debug(`[TEST-->Start][🧪] ${this.currentTest.title}`);
      }
      if (retry > 0) {
        if (retry === 1) {
          console.log('');
          console.warn('⚠️ A test failed:');
          console.warn(`️   ->  ${this.currentTest.title}`);
        }
        if (retry > 1) {
          console.warn(`   🔴  Retry #${retry - 1} failed...`);
        }
        console.warn(`️   ->  Retrying in ${5 * retry} seconds ... (${retry})`);
        await Utils.sleep(5000 * retry);
      } else {
        // Allow time for things to settle between tests.
        await Utils.sleep(50);
      }
      global.RNFBDebugInTestLeakDetection = true;
    });

    // Load tests for each Firebase module.
    if (platformSupportedModules.includes('app')) {
      const appTests = require.context('../packages/app/e2e', true, /\.e2e\.js$/);
      appTests.keys().forEach(appTests);
    }
    if (platformSupportedModules.includes('functions')) {
      const functionsTests = require.context('../packages/functions/e2e', true, /\.e2e\.js$/);
      functionsTests.keys().forEach(functionsTests);
    }
    if (platformSupportedModules.includes('appCheck')) {
      const appCheckTests = require.context('../packages/app-check/e2e', true, /\.e2e\.js$/);
      appCheckTests.keys().forEach(appCheckTests);
    }
    if (platformSupportedModules.includes('appDistribution')) {
      const appDistributionTests = require.context(
        '../packages/app-distribution/e2e',
        true,
        /\.e2e\.js$/,
      );
      appDistributionTests.keys().forEach(appDistributionTests);
    }
    if (platformSupportedModules.includes('analytics')) {
      const analyticsTests = require.context('../packages/analytics/e2e', true, /\.e2e\.js$/);
      analyticsTests.keys().forEach(analyticsTests);
    }
    if (platformSupportedModules.includes('auth')) {
      const authTests = require.context('../packages/auth/e2e', true, /\.e2e\.js$/);
      authTests.keys().forEach(authTests);
    }
    if (platformSupportedModules.includes('crashlytics')) {
      const crashlyticsTests = require.context('../packages/crashlytics/e2e', true, /\.e2e\.js$/);
      crashlyticsTests.keys().forEach(crashlyticsTests);
    }
    if (platformSupportedModules.includes('database')) {
      const databaseTests = require.context('../packages/database/e2e', true, /\.e2e\.js$/);
      databaseTests.keys().forEach(databaseTests);
    }

    if (platformSupportedModules.includes('dynamicLinks')) {
      const dynamicLinksTests = require.context(
        '../packages/dynamic-links/e2e',
        true,
        /\.e2e\.js$/,
      );
      dynamicLinksTests.keys().forEach(dynamicLinksTests);
    }
    if (platformSupportedModules.includes('firestore')) {
      const firestoreTests = require.context('../packages/firestore/e2e', true, /\.e2e\.js$/);
      firestoreTests.keys().forEach(firestoreTests);
    }
    if (platformSupportedModules.includes('perf')) {
      const perfTests = require.context('../packages/perf/e2e', true, /\.e2e\.js$/);
      perfTests.keys().forEach(perfTests);
    }
    if (platformSupportedModules.includes('messaging')) {
      const messagingTests = require.context('../packages/messaging/e2e', true, /\.e2e\.js$/);
      messagingTests.keys().forEach(messagingTests);
    }
    if (platformSupportedModules.includes('ml')) {
      const mlTests = require.context('../packages/ml/e2e', true, /\.e2e\.js$/);
      mlTests.keys().forEach(mlTests);
    }
    if (platformSupportedModules.includes('inAppMessaging')) {
      const inAppMessagingTests = require.context(
        '../packages/in-app-messaging/e2e',
        true,
        /\.e2e\.js$/,
      );
      inAppMessagingTests.keys().forEach(inAppMessagingTests);
    }
    if (platformSupportedModules.includes('installations')) {
      const installationsTests = require.context(
        '../packages/installations/e2e',
        true,
        /\.e2e\.js$/,
      );
      installationsTests.keys().forEach(installationsTests);
    }
    if (platformSupportedModules.includes('remoteConfig')) {
      const remoteConfigTests = require.context(
        '../packages/remote-config/e2e',
        true,
        /\.e2e\.js$/,
      );
      remoteConfigTests.keys().forEach(remoteConfigTests);
    }
    if (platformSupportedModules.includes('storage')) {
      const storageTests = require.context('../packages/storage/e2e', true, /\.e2e\.js$/);
      storageTests.keys().forEach(storageTests);
    }
  });
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
