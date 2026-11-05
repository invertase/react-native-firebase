import fs from 'fs';
import path from 'path';
import { afterEach, describe, expect, it } from '@jest/globals';

import { discoverPackages, ON_DEVICE_CONVERSION, type RnfbPackage } from '../src/packages';
import { scriptPhasesFor } from '../src/scriptPhases';
import { targetsFor } from '../src/targets';
import { createFixture, type Fixture } from './fixture';

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

  it('pins an id for the iOS script phases of every package', () => {
    for (const pkg of discovered) {
      expect(() => scriptPhasesFor(pkg, PACKAGES)).not.toThrow();
    }
  });

  it.each(discovered.map(pkg => [pkg.module, pkg] as const))(
    '%s Swift uses no Objective-C class of its own package outside CORE_CLASSES',
    (_, pkg) => expectSwiftUsesOnlyCoreClasses(pkg),
  );
});

describe('CORE_CLASSES check', () => {
  let fixture: Fixture | undefined;
  afterEach(() => {
    fixture?.cleanup();
    fixture = undefined;
  });

  function crashlyticsWithSwift(swift: string): RnfbPackage {
    fixture = createFixture(['app', 'crashlytics']);
    fixture.addSource(
      'crashlytics',
      'RNFBCrashlytics/RNFBCrashlyticsLog.h',
      '@interface RNFBCrashlyticsLog : NSObject\n@end\n',
    );
    fixture.addSource('crashlytics', 'RNFBCrashlytics/RNFBCrashlyticsLogger.swift', swift);
    const pkg = discoverPackages(fixture.context.autolinking.dependencies, {
      analyticsProduct: 'FirebaseAnalytics',
    }).find(candidate => candidate.module === 'RNFBCrashlytics');
    return pkg!;
  }

  it('names CORE_CLASSES when Swift uses an Objective-C class of its own package', () => {
    const pkg = crashlyticsWithSwift('let log = RNFBCrashlyticsLog()\n');

    expect(() => expectSwiftUsesOnlyCoreClasses(pkg)).toThrow(
      'RNFBCrashlytics: RNFBCrashlyticsLogger.swift uses RNFBCrashlyticsLog from ' +
        'RNFBCrashlyticsLog.h, but a Swift target cannot see the Objective-C target of its own ' +
        "package. Add 'RNFBCrashlyticsLog' to CORE_CLASSES['RNFBCrashlytics'] in " +
        'packages/app/spm/src/targets.ts.',
    );
  });

  it('ignores a class named only in comments and string literals', () => {
    const pkg = crashlyticsWithSwift(
      '// RNFBCrashlyticsLog\n/* RNFBCrashlyticsLog */\nlet name = "RNFBCrashlyticsLog // x"\n',
    );

    expect(() => expectSwiftUsesOnlyCoreClasses(pkg)).not.toThrow();
  });
});

const SWIFT_COMMENTS_AND_STRINGS = /"""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"|\/\/.*|\/\*[\s\S]*?\*\//g;
const OBJC_DECLARATION = /@(?:interface|protocol)\s+(\w+)\b(?!\s*[;(])/g;

// Fails with the table to update, where the Xcode build would fail with "cannot find X in scope":
// the Swift target of a package sees only the classes moved to its `<Module>Core` target.
function expectSwiftUsesOnlyCoreClasses(pkg: RnfbPackage): void {
  const read = (relative: string) => fs.readFileSync(path.join(pkg.root, 'ios', relative), 'utf8');
  const core = targetsFor(pkg).find(t => t.name === `${pkg.module}Core`);
  const coreClasses = new Set(
    core?.kind === 'objc' ? core.moduleHeaders.map(h => path.basename(h, '.h')) : [],
  );
  const declaredIn = new Map(
    pkg.headers.flatMap(header =>
      [...read(`${pkg.sourceFolder}/${header}`).matchAll(OBJC_DECLARATION)].map(
        ([, name]) => [name!, header] as const,
      ),
    ),
  );

  for (const source of pkg.swiftSources) {
    const code = read(source).replace(SWIFT_COMMENTS_AND_STRINGS, ' ');
    for (const [name, header] of declaredIn) {
      const owner = path.basename(header, '.h');
      if (!coreClasses.has(owner) && new RegExp(`\\b${name}\\b`).test(code)) {
        throw new Error(
          `${pkg.module}: ${path.basename(source)} uses ${name} from ${header}, but a Swift ` +
            'target cannot see the Objective-C target of its own package. ' +
            `Add '${owner}' to CORE_CLASSES['${pkg.module}'] in packages/app/spm/src/targets.ts.`,
        );
      }
    }
  }
}

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
