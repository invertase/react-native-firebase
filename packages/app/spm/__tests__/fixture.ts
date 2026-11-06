import fs from 'fs';
import os from 'os';
import path from 'path';

const REPO_PACKAGES = path.resolve(__dirname, '..', '..', '..');

// Deliberately not the real pin, so a passing test proves the plugin reads sdkVersions.ios.
export const FIXTURE_SDK = {
  firebase: '99.1.2',
  firebaseSpmUrl: 'https://example.com/mirror/firebase-ios-sdk.git',
  iosTarget: '16.4',
  macosTarget: '12.3',
  tvosTarget: '17.1',
};

export const REACT_PRODUCTS = [
  { name: 'ReactHeaders', package: 'ReactNative' },
  { name: 'ReactNativeHeaders', package: 'ReactNative' },
  { name: 'ReactNativeDependenciesHeaders', package: 'ReactNative' },
  { name: 'ReactAppHeaders', package: 'React-GeneratedCode' },
];

type SourceTree = Record<string, string>;

const header = '#import <Foundation/Foundation.h>\n';
const objc = (own: string) => `#import "${own}.h"\n`;
const swift = (...imports: string[]) => imports.map(m => `import ${m}\n`).join('');
const turboModules = (module: string): SourceTree => ({
  [`generated/${module}TurboModules/${module}TurboModules.h`]: header,
  [`generated/${module}TurboModules/${module}TurboModules-generated.mm`]: objc(
    `${module}TurboModules`,
  ),
  [`generated/${module}TurboModulesJSI.h`]: header,
});

/** Minimal `ios/` trees, keyed by package folder name. File names mirror the real packages. */
export const IOS_SOURCES: Record<string, SourceTree> = {
  app: {
    'RNFBApp/RNFBAppModule.h': header,
    'RNFBApp/RNFBAppModule.mm': objc('RNFBAppModule'),
    'RNFBApp/RNFBSharedUtils.h': header,
    'RNFBApp/RNFBSharedUtils.m': objc('RNFBSharedUtils'),
    'RNFBApp/RNFBHandleMapStorage.swift': swift('Foundation', 'FirebaseCore'),
    'RNFBApp/RNFBAppModuleFirebase.swift': swift('Foundation', 'FirebaseCore'),
    ...turboModules('RNFBApp'),
    'RNFBAppUnitTests/RNFBHandleMapStorageTests.swift': swift('XCTest'),
    'RNFBAppUnitTests/RNFBAppHostStubTests.m': header,
    'RNFBApp.xcodeproj/project.pbxproj': '// !$*UTF8*$!\n',
    'RNFBFirebase/Package.swift': '// swift-tools-version: 6.0\n',
    'RNFBFirebase/Sources/RNFBFirebaseBridge/RNFBFirebaseBridge.m':
      '#if RNFB_DYNAMIC_FIREBASE_PROBE\n#endif\n',
    'RNFBFirebaseUnitTests/RNFBFirebaseTests.swift': swift('XCTest'),
  },
  analytics: {
    'RNFBAnalytics/RNFBAnalyticsHelper.h': header,
    'RNFBAnalytics/RNFBAnalyticsHelper.m': objc('RNFBAnalyticsHelper'),
    'RNFBAnalytics/RNFBAnalyticsModule.h': header,
    'RNFBAnalytics/RNFBAnalyticsModule.mm': objc('RNFBAnalyticsModule'),
    'RNFBAnalytics/RNFBAnalyticsLogTransaction.swift': swift('Foundation', 'FirebaseAnalytics'),
    ...turboModules('RNFBAnalytics'),
    'RNFBAnalyticsUnitTests/RNFBAnalyticsTests.swift': swift('XCTest'),
    'RNFBAnalytics.xcodeproj/project.pbxproj': '// !$*UTF8*$!\n',
  },
  firestore: {
    'RNFBFirestore/RNFBFirestoreCommon.h': header,
    'RNFBFirestore/RNFBFirestoreCommon.m': objc('RNFBFirestoreCommon'),
    'RNFBFirestore/RNFBFirestoreQuery.h': '#import <RNFBFirestoreSerialize.h>\n',
    'RNFBFirestore/RNFBFirestoreQuery.m': objc('RNFBFirestoreQuery'),
    'RNFBFirestore/RNFBFirestoreSerialize.h': header,
    'RNFBFirestore/RNFBFirestoreSerialize.m': objc('RNFBFirestoreSerialize'),
    'RNFBFirestore/RNFBFirestoreModule.h': header,
    'RNFBFirestore/RNFBFirestoreModule.mm': objc('RNFBFirestoreModule'),
    'RNFBFirestore/RNFBFirestoreCollectionModuleHelper.h': header,
    'RNFBFirestore/RNFBFirestoreCollectionModuleHelper.m':
      '#import <RNFBFirestore/RNFBFirestore-Swift.h>\n',
    'RNFBFirestore/RNFBFirestorePipelineBridgeFactory.swift':
      swift('Foundation', 'FirebaseFirestore') + 'let query: RNFBFirestoreQuery? = nil\n',
    'RNFBFirestore/RNFBFirestorePipelineSnapshotSerializer.swift':
      swift('Foundation', 'FirebaseFirestore') + 'let serialize = RNFBFirestoreSerialize.self\n',
    'RNFBFirestore/RNFBFirestoreListenerRegistryStorage.swift': swift('Foundation', 'RNFBApp'),
    ...turboModules('RNFBFirestore'),
    'RNFBFirestoreUnitTests/RNFBFirestoreTests.swift': swift('XCTest'),
    'RNFBFirestore.xcodeproj/project.pbxproj': '// !$*UTF8*$!\n',
  },
  'remote-config': {
    'RNFBConfig/RNFBConfigModule.h': header,
    'RNFBConfig/RNFBConfigModule.mm': objc('RNFBConfigModule'),
    'RNFBConfig/RNFBConfigHelper.h': header,
    'RNFBConfig/RNFBConfigHelper.m': '#import <RNFBRemoteConfig/RNFBRemoteConfig-Swift.h>\n',
    'RNFBConfig/RNFBRemoteConfigValueMapper.swift': swift('Foundation', 'RNFBApp'),
    ...turboModules('RNFBRemoteConfig'),
    'RNFBRemoteConfigUnitTests/RNFBRemoteConfigValueMapperTests.swift': swift('XCTest'),
    'RNFBConfig.xcodeproj/project.pbxproj': '// !$*UTF8*$!\n',
  },
  'in-app-messaging': {
    'RNFBFiam/RNFBFiamModule.h': header,
    'RNFBFiam/RNFBFiamModule.mm': objc('RNFBFiamModule'),
    'RNFBFiam/RNFBFiamHelper.h': header,
    'RNFBFiam/RNFBFiamHelper.m': objc('RNFBFiamHelper'),
    ...turboModules('RNFBInAppMessaging'),
    'RNFBFiam.xcodeproj/project.pbxproj': '// !$*UTF8*$!\n',
  },
  crashlytics: {
    'RNFBCrashlytics/RNFBCrashlyticsModule.h': header,
    'RNFBCrashlytics/RNFBCrashlyticsModule.mm': objc('RNFBCrashlyticsModule'),
    'RNFBCrashlytics/RNFBCrashlyticsDebuggerProbe.swift': swift('Foundation', 'RNFBApp'),
    ...turboModules('RNFBCrashlytics'),
    'RNFBCrashlyticsUnitTests/RNFBCrashlyticsDebuggerProbeTests.swift': swift('XCTest'),
    'RNFBCrashlytics.xcodeproj/project.pbxproj': '// !$*UTF8*$!\n',
  },
};

export interface FixtureContext {
  appRoot: string;
  projectRoot: string;
  reactNativeRoot: string;
  outputDir: string;
  autolinking: { dependencies: Record<string, { name: string; root: string }> };
  react: {
    packageRef: { name: string; path: string; relPath: string };
    products: Array<{ name: string; package: string }>;
  };
}

export interface Fixture {
  context: FixtureContext;
  /** `<outputDir>/ReactNativeFirebase` */
  packageDir: string;
  packageRoot(folder: string): string;
  readManifest(): string;
  addSource(folder: string, iosRelativePath: string, contents?: string): void;
  writeFirebaseJson(json: unknown): void;
  /** Registers an extra autolinked dependency at a non-standard root and writes `files` into it. */
  addDependency(name: string, files: SourceTree): string;
  cleanup(): void;
}

export function writeTree(root: string, files: SourceTree): void {
  for (const [relative, contents] of Object.entries(files)) {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents);
  }
}

// Package metadata (package.json, react-native.config.js, podspec, ios_config.sh) is copied from
// the real package, so the fixture carries whatever per-package data the plugin derives from it.
function copyPackageMetadata(folder: string, destination: string): void {
  const source = path.join(REPO_PACKAGES, folder);
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.isFile() && !entry.name.endsWith('.md')) {
      fs.copyFileSync(path.join(source, entry.name), path.join(destination, entry.name));
    }
  }
}

function pinFixtureSdk(appPackageRoot: string): void {
  const manifestPath = path.join(appPackageRoot, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.sdkVersions.ios = { ...manifest.sdkVersions.ios, ...FIXTURE_SDK };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Builds an app whose RNFB packages live outside `<projectRoot>/node_modules`, at roots whose
 * folder names differ from the npm names. Only `context.autolinking` says where they are.
 */
export function createFixture(
  folders: string[],
  options: { firebaseJson?: unknown } = {},
): Fixture {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-spm-')));
  const projectRoot = path.join(tmp, 'workspace', 'my-app');
  const appRoot = path.join(projectRoot, 'ios');
  const outputDir = path.join(appRoot, 'build', 'generated', 'autolinking');
  const reactNativeRoot = path.join(tmp, 'workspace', 'react-native');
  const reactPackagePath = path.join(appRoot, 'build', 'xcframeworks');
  for (const dir of [appRoot, outputDir, reactNativeRoot, reactPackagePath]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const dependencies: FixtureContext['autolinking']['dependencies'] = {};
  const roots: Record<string, string> = {};
  const register = (name: string, root: string) => {
    dependencies[name] = { name, root };
  };

  for (const folder of folders) {
    const root = path.join(tmp, 'store', `vendored-${folder}`);
    copyPackageMetadata(folder, root);
    const sources = IOS_SOURCES[folder];
    if (sources) {
      writeTree(path.join(root, 'ios'), sources);
    }
    if (folder === 'app') {
      pinFixtureSdk(root);
    }
    roots[folder] = root;
    register(`@react-native-firebase/${folder}`, root);
  }

  const context: FixtureContext = {
    appRoot,
    projectRoot,
    reactNativeRoot,
    outputDir,
    autolinking: { dependencies },
    react: {
      packageRef: {
        name: 'ReactNative',
        path: reactPackagePath,
        relPath: path.relative(outputDir, reactPackagePath),
      },
      products: REACT_PRODUCTS,
    },
  };

  const packageDir = path.join(outputDir, 'ReactNativeFirebase');
  const fixture: Fixture = {
    context,
    packageDir,
    packageRoot(folder) {
      const root = roots[folder];
      if (!root) {
        throw new Error(`fixture has no package ${folder}`);
      }
      return root;
    },
    readManifest() {
      return fs.readFileSync(path.join(packageDir, 'Package.swift'), 'utf8');
    },
    addSource(folder, iosRelativePath, contents = header) {
      writeTree(path.join(fixture.packageRoot(folder), 'ios'), { [iosRelativePath]: contents });
    },
    writeFirebaseJson(json) {
      fs.writeFileSync(path.join(projectRoot, 'firebase.json'), JSON.stringify(json, null, 2));
    },
    addDependency(name, files) {
      const root = path.join(tmp, 'elsewhere', name.replace(/[@/]/g, '_'));
      writeTree(root, files);
      register(name, root);
      return root;
    },
    cleanup() {
      fs.rmSync(tmp, { recursive: true, force: true });
    },
  };

  if (options.firebaseJson !== undefined) {
    fixture.writeFirebaseJson(options.firebaseJson);
  }
  return fixture;
}

export interface ManifestTarget {
  kind: 'swift' | 'objc';
  name: string;
  body: string;
}

function quoted(text: string): string[] {
  const values: string[] = [];
  const pattern = /"([^"]+)"/g;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    values.push(match[1]!);
  }
  return values;
}

/** Splits the manifest into `swiftTarget("X", …)` / `objcTarget("X", …)` calls, as in the hand-written manifest. */
export function manifestTargets(manifest: string): ManifestTarget[] {
  const pattern = /\b(swiftTarget|objcTarget)\(\s*"([^"]+)"/g;
  const starts: Array<{ kind: ManifestTarget['kind']; name: string; index: number }> = [];
  for (let match = pattern.exec(manifest); match; match = pattern.exec(manifest)) {
    starts.push({
      kind: match[1] === 'swiftTarget' ? 'swift' : 'objc',
      name: match[2]!,
      index: match.index,
    });
  }
  const targetsEnd = manifest.indexOf('swiftLanguageModes');
  return starts.map((start, i) => {
    const next = starts[i + 1];
    const end = next ? next.index : targetsEnd >= 0 ? targetsEnd : manifest.length;
    return { kind: start.kind, name: start.name, body: manifest.slice(start.index, end) };
  });
}

export function target(manifest: string, name: string): ManifestTarget {
  const found = manifestTargets(manifest).find(t => t.name === name);
  if (!found) {
    throw new Error(`Package.swift has no target ${name}`);
  }
  return found;
}

export function targetNames(manifest: string): string[] {
  return manifestTargets(manifest)
    .map(t => t.name)
    .sort();
}

export function sources(t: ManifestTarget): string[] {
  const match = /sources:\s*\[([\s\S]*?)\]/.exec(t.body);
  return match ? quoted(match[1]!) : [];
}

/** Target (not product) dependencies: quoted names in `dependencies:` outside the Firebase product helpers. */
export function targetDependencies(t: ManifestTarget): string[] {
  const start = t.body.indexOf('dependencies:');
  if (start < 0) {
    return [];
  }
  const end = t.body.indexOf('frameworks:', start);
  const segment = t.body
    .slice(start, end >= 0 ? end : undefined)
    .replace(/firebase\([^)]*\)/g, '')
    .replace(/\.product\([^)]*\)/g, '');
  return quoted(segment);
}

export function firebaseProducts(t: ManifestTarget): string[] {
  const helperCalls = t.body.match(/firebase\([^)]*\)/g) ?? [];
  const inline =
    t.body.match(/\.product\(\s*name:\s*"[^"]+",\s*package:\s*"firebase-ios-sdk"\s*\)/g) ?? [];
  return [...helperCalls.flatMap(call => quoted(call)), ...inline.map(call => quoted(call)[0]!)];
}

export function libraryTargets(manifest: string): string[] {
  const match = /\.library\(\s*name:\s*"ReactNativeFirebase",\s*targets:\s*\[([^\]]*)\]/.exec(
    manifest,
  );
  return match ? quoted(match[1]!).sort() : [];
}

export function commentLines(manifest: string): string[] {
  return manifest.split('\n').filter(line => line.trimStart().startsWith('//'));
}
