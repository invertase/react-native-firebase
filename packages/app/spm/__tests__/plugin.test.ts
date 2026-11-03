import fs from 'fs';
import path from 'path';
import { afterEach, describe, expect, it } from '@jest/globals';

import plugin from '../src';
import {
  commentLines,
  createFixture,
  firebaseProducts,
  FIXTURE_SDK,
  libraryTargets,
  sources,
  target,
  targetDependencies,
  targetNames,
  writeTree,
  type Fixture,
} from './fixture';

const SCRIPT_PHASE_ID = /^[@A-Za-z0-9_./-]+$/;
const CRASHLYTICS_INPUT_FILES: string[] = require('../../../crashlytics/react-native.config.js')
  .dependency.platforms.ios.scriptPhases[0].input_files;

let fixture: Fixture | undefined;

function setUp(folders: string[], options?: Parameters<typeof createFixture>[1]): Fixture {
  fixture = createFixture(folders, options);
  return fixture;
}

afterEach(() => {
  fixture?.cleanup();
  fixture = undefined;
});

function generate(f: Fixture) {
  const result = plugin(f.context);
  return { result, manifest: f.readManifest() };
}

const configScript = (f: Fixture, folder: string) =>
  `"$SRCROOT/${path.relative(f.context.appRoot, f.packageRoot(folder))}/ios_config.sh"`;

describe('ReactNativeFirebase SwiftPM autolinking plugin', () => {
  describe('app only', () => {
    it('returns the generated package and its single product', () => {
      const f = setUp(['app']);
      const { result } = generate(f);

      expect(result.packageDependencies).toEqual([
        { name: 'ReactNativeFirebase', path: f.packageDir },
      ]);
      expect(result.productDependencies).toEqual([
        { name: 'ReactNativeFirebase', package: 'ReactNativeFirebase' },
      ]);
    });

    it('writes RNFBApp (Swift) and RNFBAppObjC targets from the package sources', () => {
      const { manifest } = generate(setUp(['app']));

      expect(targetNames(manifest)).toEqual(['RNFBApp', 'RNFBAppObjC']);
      expect(libraryTargets(manifest)).toEqual(['RNFBApp', 'RNFBAppObjC']);

      const swiftTarget = target(manifest, 'RNFBApp');
      expect(swiftTarget.kind).toBe('swift');
      expect(sources(swiftTarget).sort()).toEqual([
        'root/RNFBApp/RNFBAppModuleFirebase.swift',
        'root/RNFBApp/RNFBHandleMapStorage.swift',
      ]);
      expect(firebaseProducts(swiftTarget)).toEqual(['FirebaseCore']);

      const objcTarget = target(manifest, 'RNFBAppObjC');
      expect(objcTarget.kind).toBe('objc');
      expect(sources(objcTarget).sort()).toEqual([
        'root/RNFBApp/RNFBAppModule.mm',
        'root/RNFBApp/RNFBSharedUtils.m',
        'root/generated/RNFBAppTurboModules/RNFBAppTurboModules-generated.mm',
      ]);
      expect(targetDependencies(objcTarget)).toContain('RNFBApp');
      expect(firebaseProducts(objcTarget).sort()).toEqual([
        'FirebaseCore',
        'FirebaseInstallations',
      ]);
    });

    it('pins firebase-ios-sdk and the platforms from sdkVersions.ios of the app package', () => {
      const { manifest } = generate(setUp(['app']));

      expect(manifest).toContain(
        `.package(url: "${FIXTURE_SDK.firebaseSpmUrl}", exact: "${FIXTURE_SDK.firebase}")`,
      );
      expect(manifest).not.toContain('13.1.1');
      const platforms = /platforms:\s*\[([^\]]*)\]/.exec(manifest)?.[1] ?? '';
      expect(platforms).toContain(`.iOS("${FIXTURE_SDK.iosTarget}")`);
      expect(platforms).toContain(`.macOS("${FIXTURE_SDK.macosTarget}")`);
      expect(platforms).toContain(`.tvOS("${FIXTURE_SDK.tvosTarget}")`);
    });

    it('depends on React through context.react', () => {
      const f = setUp(['app']);
      const { manifest } = generate(f);

      expect(manifest).toContain(
        `.package(name: "ReactNative", path: "${f.context.react.packageRef.path}")`,
      );
      for (const product of f.context.react.products) {
        expect(manifest).toContain(
          `.product(name: "${product.name}", package: "${product.package}")`,
        );
      }
      expect(manifest).toMatch(/swiftLanguageModes:\s*\[\.v5\]/);
    });

    it('writes the header farm and the Swift header shim', () => {
      const f = setUp(['app']);
      generate(f);

      const headers = path.join(f.packageDir, 'headers', 'RNFBApp');
      expect(fs.readFileSync(path.join(headers, 'RNFBApp-Swift.h'), 'utf8')).toContain(
        '@import RNFBApp;',
      );
      expect(fs.realpathSync(path.join(headers, 'RNFBAppModule.h'))).toBe(
        path.join(f.packageRoot('app'), 'ios', 'RNFBApp', 'RNFBAppModule.h'),
      );
    });

    it('returns only the core configuration script phase', () => {
      const f = setUp(['app']);
      const { result } = generate(f);
      const scriptPhases = result.scriptPhases ?? [];

      expect(scriptPhases).toHaveLength(1);
      expect(scriptPhases[0]).toMatchObject({
        id: '@react-native-firebase/app/core-config',
        name: '[RNFB] Core Configuration',
        position: 'end',
        inputPaths: ['$(BUILT_PRODUCTS_DIR)/$(INFOPLIST_PATH)'],
      });
      expect(scriptPhases[0]!.script).toContain(configScript(f, 'app'));
      expect(scriptPhases[0]!.id).toMatch(SCRIPT_PHASE_ID);
    });

    it('watches absolute paths, including firebase.json even before it exists', () => {
      const f = setUp(['app']);
      const { result } = generate(f);
      const watchPaths = result.watchPaths ?? [];

      expect(watchPaths.length).toBeGreaterThan(0);
      for (const watched of watchPaths) {
        expect(path.isAbsolute(watched)).toBe(true);
      }
      expect(watchPaths).toContain(path.join(f.context.projectRoot, 'firebase.json'));
    });
  });

  describe('analytics product selection', () => {
    const analyticsProducts = (manifest: string) => [
      ...firebaseProducts(target(manifest, 'RNFBAnalytics')),
      ...firebaseProducts(target(manifest, 'RNFBAnalyticsObjC')),
    ];

    it('writes RNFBAnalytics and RNFBAnalyticsObjC on top of RNFBApp', () => {
      const { manifest } = generate(setUp(['app', 'analytics']));

      expect(targetNames(manifest)).toEqual([
        'RNFBAnalytics',
        'RNFBAnalyticsObjC',
        'RNFBApp',
        'RNFBAppObjC',
      ]);
      expect(targetDependencies(target(manifest, 'RNFBAnalytics'))).toEqual(['RNFBApp']);
      expect(targetDependencies(target(manifest, 'RNFBAnalyticsObjC')).sort()).toEqual([
        'RNFBAnalytics',
        'RNFBApp',
        'RNFBAppObjC',
      ]);
    });

    it.each([
      ['there is no firebase.json', undefined],
      ['firebase.json has no react-native key', { other: true }],
      ['the key is absent', { 'react-native': { analytics_auto_collection_enabled: true } }],
      ['the key is false', { 'react-native': { analytics_without_ad_id_support: false } }],
    ])('uses FirebaseAnalytics when %s', (_, firebaseJson) => {
      const { manifest } = generate(setUp(['app', 'analytics'], { firebaseJson }));

      expect(new Set(analyticsProducts(manifest))).toEqual(new Set(['FirebaseAnalytics']));
      expect(manifest).not.toContain('FirebaseAnalyticsCore');
    });

    it('uses FirebaseAnalyticsCore when analytics_without_ad_id_support is true', () => {
      const { manifest } = generate(
        setUp(['app', 'analytics'], {
          firebaseJson: { 'react-native': { analytics_without_ad_id_support: true } },
        }),
      );

      expect(new Set(analyticsProducts(manifest))).toEqual(new Set(['FirebaseAnalyticsCore']));
      expect(manifest).not.toContain('"FirebaseAnalytics"');
    });

    it('adds no analytics product when analytics is not installed', () => {
      const { manifest } = generate(
        setUp(['app'], {
          firebaseJson: { 'react-native': { analytics_without_ad_id_support: true } },
        }),
      );

      expect(manifest).not.toContain('FirebaseAnalytics');
    });
  });

  describe('firestore', () => {
    const CORE = ['RNFBFirestoreCommon', 'RNFBFirestoreQuery', 'RNFBFirestoreSerialize'];

    it('splits into RNFBFirestoreCore (ObjC) <- RNFBFirestore (Swift) <- RNFBFirestoreObjC', () => {
      const { manifest } = generate(setUp(['app', 'firestore']));

      const core = target(manifest, 'RNFBFirestoreCore');
      expect(core.kind).toBe('objc');
      expect(sources(core).sort()).toEqual(CORE.map(f => `root/RNFBFirestore/${f}.m`));
      expect(targetDependencies(core)).toContain('RNFBAppObjC');

      const swiftTarget = target(manifest, 'RNFBFirestore');
      expect(swiftTarget.kind).toBe('swift');
      expect(sources(swiftTarget)).toEqual(
        expect.arrayContaining([
          'root/RNFBFirestore/RNFBFirestoreListenerRegistryStorage.swift',
          'root/RNFBFirestore/RNFBFirestorePipelineBridgeFactory.swift',
          'root/RNFBFirestore/RNFBFirestorePipelineSnapshotSerializer.swift',
        ]),
      );
      expect(sources(swiftTarget).every(s => s.endsWith('.swift'))).toBe(true);
      expect(targetDependencies(swiftTarget)).toEqual(
        expect.arrayContaining(['RNFBFirestoreCore', 'RNFBApp']),
      );
      expect(targetDependencies(swiftTarget)).not.toContain('RNFBFirestoreObjC');

      const objcTarget = target(manifest, 'RNFBFirestoreObjC');
      expect(objcTarget.kind).toBe('objc');
      expect(sources(objcTarget).sort()).toEqual([
        'root/RNFBFirestore/RNFBFirestoreCollectionModuleHelper.m',
        'root/RNFBFirestore/RNFBFirestoreModule.mm',
        'root/generated/RNFBFirestoreTurboModules/RNFBFirestoreTurboModules-generated.mm',
      ]);
      expect(targetDependencies(objcTarget)).toEqual(
        expect.arrayContaining(['RNFBFirestore', 'RNFBFirestoreCore', 'RNFBApp', 'RNFBAppObjC']),
      );
      for (const t of [core, swiftTarget, objcTarget]) {
        expect(firebaseProducts(t)).toContain('FirebaseFirestore');
      }
    });

    it('writes an explicit module map for RNFBFirestoreCore', () => {
      const f = setUp(['app', 'firestore']);
      generate(f);

      const modulemap = fs.readFileSync(
        path.join(f.packageDir, 'Targets', 'RNFBFirestoreCore', 'Public', 'module.modulemap'),
        'utf8',
      );
      expect(modulemap).toMatch(/module RNFBFirestoreCore\s*\{/);
      for (const name of CORE) {
        expect(modulemap).toContain(`header "${name}.h"`);
      }
    });

    it('re-exports RNFBFirestoreCore to every Swift file of RNFBFirestore', () => {
      const f = setUp(['app', 'firestore']);
      const { manifest } = generate(f);

      const generated = sources(target(manifest, 'RNFBFirestore'))
        .filter(s => !s.startsWith('root/'))
        .map(s => fs.readFileSync(path.join(f.packageDir, 'Targets', 'RNFBFirestore', s), 'utf8'));
      expect(generated.join('\n')).toContain('@_exported import RNFBFirestoreCore');
    });
  });

  describe('module names that differ from the ios source folder', () => {
    it('maps remote-config ios/RNFBConfig to the RNFBRemoteConfig module', () => {
      const f = setUp(['app', 'remote-config']);
      const { manifest } = generate(f);

      expect(targetNames(manifest)).toEqual(
        expect.arrayContaining(['RNFBRemoteConfig', 'RNFBRemoteConfigObjC']),
      );
      expect(manifest).not.toMatch(/"RNFBConfig(ObjC)?"/);
      expect(sources(target(manifest, 'RNFBRemoteConfig'))).toEqual([
        'root/RNFBConfig/RNFBRemoteConfigValueMapper.swift',
      ]);
      expect(sources(target(manifest, 'RNFBRemoteConfigObjC')).sort()).toEqual([
        'root/RNFBConfig/RNFBConfigHelper.m',
        'root/RNFBConfig/RNFBConfigModule.mm',
        'root/generated/RNFBRemoteConfigTurboModules/RNFBRemoteConfigTurboModules-generated.mm',
      ]);
      expect(
        fs.readFileSync(
          path.join(f.packageDir, 'headers', 'RNFBRemoteConfig', 'RNFBRemoteConfig-Swift.h'),
          'utf8',
        ),
      ).toContain('@import RNFBRemoteConfig;');
    });

    it('maps in-app-messaging ios/RNFBFiam to a single RNFBInAppMessaging ObjC target', () => {
      const f = setUp(['app', 'in-app-messaging']);
      const { manifest } = generate(f);

      expect(targetNames(manifest)).toEqual(['RNFBApp', 'RNFBAppObjC', 'RNFBInAppMessaging']);
      const fiam = target(manifest, 'RNFBInAppMessaging');
      expect(fiam.kind).toBe('objc');
      expect(sources(fiam).sort()).toEqual([
        'root/RNFBFiam/RNFBFiamHelper.m',
        'root/RNFBFiam/RNFBFiamModule.mm',
        'root/generated/RNFBInAppMessagingTurboModules/RNFBInAppMessagingTurboModules-generated.mm',
      ]);
      expect(manifest).not.toMatch(/"RNFBFiam"/);
      expect(
        fs.existsSync(
          path.join(f.packageDir, 'headers', 'RNFBInAppMessaging', 'RNFBInAppMessaging-Swift.h'),
        ),
      ).toBe(false);
    });
  });

  describe('crashlytics', () => {
    it('adds the crashlytics configuration script phase', () => {
      const f = setUp(['app', 'crashlytics']);
      const { result } = generate(f);
      const scriptPhases = result.scriptPhases ?? [];

      expect(scriptPhases.map((p: { id: string }) => p.id).sort()).toEqual([
        '@react-native-firebase/app/core-config',
        '@react-native-firebase/crashlytics/config',
      ]);
      const crashlytics = scriptPhases.find(
        (p: { id: string }) => p.id === '@react-native-firebase/crashlytics/config',
      );
      expect(crashlytics).toMatchObject({
        name: '[RNFB] Crashlytics Configuration',
        position: 'end',
        inputPaths: CRASHLYTICS_INPUT_FILES,
      });
      expect(crashlytics!.script).toContain(configScript(f, 'crashlytics'));
      expect(crashlytics!.script).not.toContain(configScript(f, 'app'));
      for (const phase of scriptPhases) {
        expect(phase.id).toMatch(SCRIPT_PHASE_ID);
      }
    });

    it('marks every script phase always out of date, as CocoaPods runs them on every build', () => {
      const { result } = generate(setUp(['app', 'crashlytics']));
      const scriptPhases = result.scriptPhases ?? [];

      expect(scriptPhases).toHaveLength(2);
      for (const phase of scriptPhases) {
        expect(phase.alwaysOutOfDate).toBe(true);
      }
    });
  });

  describe('firebase.json', () => {
    it('names the file when it is not valid JSON', () => {
      const f = setUp(['app']);
      const firebaseJson = path.join(f.context.projectRoot, 'firebase.json');
      fs.writeFileSync(firebaseJson, '{ "react-native": ');

      expect(() => plugin(f.context)).toThrow(firebaseJson);
    });
  });

  describe('package discovery', () => {
    it('uses only autolinked @react-native-firebase packages that have an ios folder', () => {
      const f = setUp(['app', 'ai']);
      f.addDependency('react-native-safe-area-context', {
        'package.json': JSON.stringify({ name: 'react-native-safe-area-context' }),
        'ios/RNCSafeAreaView.h': '#import <UIKit/UIKit.h>\n',
        'ios/RNCSafeAreaView.m': '#import "RNCSafeAreaView.h"\n',
      });
      const { manifest } = generate(f);

      expect(targetNames(manifest)).toEqual(['RNFBApp', 'RNFBAppObjC']);
      expect(manifest).not.toMatch(/RNCSafeArea|safe-area/);
    });

    it('ignores a package whose ios folder holds only codegen output and no podspec', () => {
      const f = setUp(['app', 'phone-number-verification']);
      const pnvRoot = f.packageRoot('phone-number-verification');
      expect(fs.readdirSync(pnvRoot).some(file => file.endsWith('.podspec'))).toBe(false);
      writeTree(path.join(pnvRoot, 'ios', 'generated'), {
        'RNFBPnvTurboModules/RNFBPnvTurboModules.h': '#import <Foundation/Foundation.h>\n',
        'RNFBPnvTurboModules/RNFBPnvTurboModules-generated.mm': '#import "RNFBPnvTurboModules.h"\n',
        'RNFBPnvTurboModulesJSI.h': '#import <Foundation/Foundation.h>\n',
      });
      const { manifest } = generate(f);

      expect(targetNames(manifest)).toEqual(['RNFBApp', 'RNFBAppObjC']);
      expect(manifest).not.toMatch(/Pnv|PhoneNumber/);
    });

    it('never reads <projectRoot>/node_modules', () => {
      const f = setUp(['app']);
      const decoys = path.join(f.context.projectRoot, 'node_modules', '@react-native-firebase');
      writeTree(path.join(decoys, 'app'), {
        'package.json': JSON.stringify({
          name: '@react-native-firebase/app',
          sdkVersions: { ios: { ...FIXTURE_SDK, firebase: '0.0.1' } },
        }),
      });
      writeTree(path.join(decoys, 'analytics'), {
        'package.json': JSON.stringify({ name: '@react-native-firebase/analytics' }),
        'ios/RNFBAnalytics/RNFBAnalyticsModule.mm': '\n',
      });
      const { manifest } = generate(f);

      expect(manifest).toContain(`exact: "${FIXTURE_SDK.firebase}"`);
      expect(manifest).not.toContain('0.0.1');
      expect(manifest).not.toContain('RNFBAnalytics');
    });

    it('skips a package that autolinking disables for iOS', () => {
      const f = setUp(['app', 'analytics']);
      Object.assign(f.context.autolinking.dependencies['@react-native-firebase/analytics']!, {
        platforms: { ios: null },
      });
      const { manifest } = generate(f);

      expect(targetNames(manifest)).toEqual(['RNFBApp', 'RNFBAppObjC']);
    });

    it('ignores ios folders that are not RNFB source folders, such as a build folder', () => {
      const f = setUp(['app']);
      f.addSource('app', 'build/Intermediates/Stale.m');
      f.addSource('app', 'Pods/Stale.h');
      const { manifest } = generate(f);

      expect(targetNames(manifest)).toEqual(['RNFBApp', 'RNFBAppObjC']);
      expect(manifest).not.toContain('Stale');
    });

    it('ignores Firebase products in Ruby comments of the podspec', () => {
      const f = setUp(['app', 'crashlytics']);
      const podspec = path.join(f.packageRoot('crashlytics'), 'RNFBCrashlytics.podspec');
      const original = fs.readFileSync(podspec, 'utf8');
      const commented = original.replace(
        "['FirebaseCrashlytics'],",
        "['FirebaseCrashlytics' # , 'FirebaseSessions'\n    ],",
      );
      expect(commented).not.toBe(original);
      fs.writeFileSync(
        podspec,
        "# firebase_dependency(s, firebase_sdk_version, ['FirebaseLegacy'], 'Firebase/Legacy')\n" +
          commented,
      );
      const { manifest } = generate(f);

      for (const name of ['RNFBCrashlytics', 'RNFBCrashlyticsObjC']) {
        expect(firebaseProducts(target(manifest, name))).toEqual(['FirebaseCrashlytics']);
      }
    });
  });

  describe('pruning', () => {
    it('removes the links and targets of a package that is no longer autolinked', () => {
      const f = setUp(['app', 'analytics']);
      generate(f);
      const unrelated = [
        path.join(f.packageDir, '.build', 'keep'),
        path.join(f.packageDir, 'Package.resolved'),
      ];
      writeTree(f.packageDir, { '.build/keep': '', 'Package.resolved': '{}' });

      delete f.context.autolinking.dependencies['@react-native-firebase/analytics'];
      generate(f);

      const children = (folder: string) => fs.readdirSync(path.join(f.packageDir, folder)).sort();
      expect(children('src')).toEqual(['RNFBApp']);
      expect(children('headers')).toEqual(['RNFBApp']);
      expect(children('Targets')).toEqual(['RNFBApp', 'RNFBAppObjC']);
      expect(fs.existsSync(path.join(f.packageRoot('analytics'), 'ios', 'RNFBAnalytics'))).toBe(
        true,
      );
      for (const file of unrelated) {
        expect(fs.existsSync(file)).toBe(true);
      }
    });

    it('removes the link of a header that the package no longer ships', () => {
      const f = setUp(['app']);
      generate(f);

      fs.rmSync(path.join(f.packageRoot('app'), 'ios', 'RNFBApp', 'RNFBSharedUtils.h'));
      generate(f);

      expect(fs.readdirSync(path.join(f.packageDir, 'headers', 'RNFBApp')).sort()).toEqual([
        'RNFBApp-Swift.h',
        'RNFBAppModule.h',
      ]);
    });

    it('removes the Swift header shim of a package that no longer has Swift sources', () => {
      const f = setUp(['app', 'crashlytics']);
      generate(f);
      const shim = path.join(f.packageDir, 'headers', 'RNFBCrashlytics', 'RNFBCrashlytics-Swift.h');
      expect(fs.existsSync(shim)).toBe(true);

      fs.rmSync(
        path.join(
          f.packageRoot('crashlytics'),
          'ios',
          'RNFBCrashlytics',
          'RNFBCrashlyticsDebuggerProbe.swift',
        ),
      );
      generate(f);

      expect(fs.existsSync(shim)).toBe(false);
      expect(fs.existsSync(path.join(f.packageDir, 'headers', 'RNFBApp', 'RNFBApp-Swift.h'))).toBe(
        true,
      );
    });

    it('removes the module map of a target that no longer exports module headers', () => {
      const f = setUp(['app']);
      generate(f);
      const publicDir = path.join(f.packageDir, 'Targets', 'RNFBAppObjC', 'Public');
      writeTree(publicDir, { 'module.modulemap': 'module RNFBAppObjC {}\n', 'Stale.h': '' });

      generate(f);

      expect(fs.readdirSync(publicDir)).toEqual([]);
    });
  });

  describe('layout hash and idempotence', () => {
    it('leaves Package.swift untouched when the layout is unchanged', () => {
      const f = setUp(['app', 'analytics', 'firestore']);
      const { manifest: first } = generate(f);
      const manifestPath = path.join(f.packageDir, 'Package.swift');
      const past = new Date('2001-01-01T00:00:00Z');
      fs.utimesSync(manifestPath, past, past);

      const { manifest: second } = generate(f);

      expect(second).toBe(first);
      expect(fs.statSync(manifestPath).mtimeMs).toBe(past.getTime());
    });

    it('changes the layout hash comment when a source file is added', () => {
      const f = setUp(['app']);
      const { manifest: before } = generate(f);

      f.addSource('app', 'RNFBApp/RNFBAddedLater.swift', 'import Foundation\n');
      const { manifest: after } = generate(f);

      expect(sources(target(after, 'RNFBApp'))).toContain('root/RNFBApp/RNFBAddedLater.swift');
      expect(commentLines(after)).not.toEqual(commentLines(before));
    });

    it('excludes unit tests, Xcode projects, the RNFBFirebase package and the probe define', () => {
      const { manifest } = generate(setUp(['app', 'analytics', 'firestore']));

      expect(manifest).not.toContain('UnitTests');
      expect(manifest).not.toContain('.xcodeproj');
      expect(manifest).not.toContain('RNFBFirebase');
      expect(manifest).not.toContain('RNFB_DYNAMIC_FIREBASE_PROBE');
    });
  });
});
