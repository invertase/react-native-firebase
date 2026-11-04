import fs from 'fs';
import path from 'path';
import { describe, expect, it } from '@jest/globals';

import { discoverPackages, ON_DEVICE_CONVERSION } from '../src/packages';
import { targetsFor } from '../src/targets';

const PACKAGES = path.resolve(__dirname, '..', '..', '..');

// Products are the third `firebase_dependency` argument of each podspec; analytics takes its
// product from firebase.json instead.
const EXPECTED: Record<string, { module: string; firebaseProducts: string[]; targets: string[] }> =
  {
    app: {
      module: 'RNFBApp',
      firebaseProducts: ['FirebaseCore', 'FirebaseInstallations'],
      targets: ['RNFBApp', 'RNFBAppObjC'],
    },
    analytics: {
      module: 'RNFBAnalytics',
      firebaseProducts: ['FirebaseAnalytics'],
      targets: ['RNFBAnalytics', 'RNFBAnalyticsObjC'],
    },
    'app-check': {
      module: 'RNFBAppCheck',
      firebaseProducts: ['FirebaseAppCheck'],
      targets: ['RNFBAppCheck', 'RNFBAppCheckObjC'],
    },
    'app-distribution': {
      module: 'RNFBAppDistribution',
      firebaseProducts: ['FirebaseAppDistribution-Beta'],
      targets: ['RNFBAppDistribution'],
    },
    auth: {
      module: 'RNFBAuth',
      firebaseProducts: ['FirebaseAuth'],
      targets: ['RNFBAuth', 'RNFBAuthObjC'],
    },
    crashlytics: {
      module: 'RNFBCrashlytics',
      firebaseProducts: ['FirebaseCrashlytics'],
      targets: ['RNFBCrashlytics', 'RNFBCrashlyticsObjC'],
    },
    database: {
      module: 'RNFBDatabase',
      firebaseProducts: ['FirebaseDatabase'],
      targets: ['RNFBDatabase', 'RNFBDatabaseObjC'],
    },
    firestore: {
      module: 'RNFBFirestore',
      firebaseProducts: ['FirebaseFirestore'],
      targets: ['RNFBFirestoreCore', 'RNFBFirestore', 'RNFBFirestoreObjC'],
    },
    functions: {
      module: 'RNFBFunctions',
      firebaseProducts: ['FirebaseFunctions'],
      targets: ['RNFBFunctions', 'RNFBFunctionsObjC'],
    },
    'in-app-messaging': {
      module: 'RNFBInAppMessaging',
      firebaseProducts: ['FirebaseInAppMessaging-Beta'],
      targets: ['RNFBInAppMessaging'],
    },
    installations: {
      module: 'RNFBInstallations',
      firebaseProducts: ['FirebaseInstallations'],
      targets: ['RNFBInstallations'],
    },
    messaging: {
      module: 'RNFBMessaging',
      firebaseProducts: ['FirebaseMessaging'],
      targets: ['RNFBMessaging', 'RNFBMessagingObjC'],
    },
    perf: {
      module: 'RNFBPerf',
      firebaseProducts: ['FirebasePerformance'],
      targets: ['RNFBPerf', 'RNFBPerfObjC'],
    },
    'remote-config': {
      module: 'RNFBRemoteConfig',
      firebaseProducts: ['FirebaseRemoteConfig'],
      targets: ['RNFBRemoteConfig', 'RNFBRemoteConfigObjC'],
    },
    storage: {
      module: 'RNFBStorage',
      firebaseProducts: ['FirebaseStorage'],
      targets: ['RNFBStorage', 'RNFBStorageObjC'],
    },
  };

describe('package discovery on the packages in this repository', () => {
  const dependencies = Object.fromEntries(
    fs
      .readdirSync(PACKAGES)
      .filter(folder => fs.existsSync(path.join(PACKAGES, folder, 'package.json')))
      .map(folder => {
        const name = `@react-native-firebase/${folder}`;
        return [name, { name, root: path.join(PACKAGES, folder) }];
      }),
  );
  const discovered = discoverPackages(dependencies, { analyticsProduct: 'FirebaseAnalytics' });

  it('finds exactly the packages with native iOS code, app first', () => {
    expect(discovered[0]?.name).toBe('@react-native-firebase/app');
    expect(discovered.map(pkg => path.basename(pkg.root)).sort()).toEqual(
      Object.keys(EXPECTED).sort(),
    );
  });

  it.each(Object.entries(EXPECTED))('reads %s', (folder, expected) => {
    const pkg = discovered.find(candidate => path.basename(candidate.root) === folder);

    expect(pkg).toBeDefined();
    expect({
      module: pkg!.module,
      firebaseProducts: pkg!.firebaseProducts,
      targets: targetsFor(pkg!).map(t => t.name),
    }).toEqual(expected);
  });
});

describe('GoogleAdsOnDeviceConversion package', () => {
  it('matches the spm_dependency of the analytics podspec', () => {
    const podspec = fs.readFileSync(
      path.join(PACKAGES, 'analytics', 'RNFBAnalytics.podspec'),
      'utf8',
    );
    const call =
      /spm_dependency\(\s*s\s*,\s*url:\s*'([^']+)',\s*requirement:\s*\{\s*kind:\s*'upToNextMajorVersion',\s*minimumVersion:\s*'([^']+)'\s*\},\s*products:\s*\['([^']+)'\]/.exec(
        podspec,
      );

    expect(call).not.toBeNull();
    const [, url, minimumVersion, product] = call!;
    expect({ url, from: minimumVersion, name: product }).toEqual({
      url: ON_DEVICE_CONVERSION.url,
      from: ON_DEVICE_CONVERSION.from,
      name: ON_DEVICE_CONVERSION.name,
    });
  });
});
