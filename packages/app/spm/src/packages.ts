import fs from 'fs';
import path from 'path';

import type { AutolinkedDependency } from './types';

const SCOPE = '@react-native-firebase/';
export const APP_PACKAGE = '@react-native-firebase/app';
const ANALYTICS_PACKAGE = '@react-native-firebase/analytics';

// Every other package keeps its sources in a folder named after its module (podspec name).
const MODULE_NAMES: Record<string, string> = {
  RNFBConfig: 'RNFBRemoteConfig',
  RNFBFiam: 'RNFBInAppMessaging',
};

// `firebase_dependency(spec, version, spm_products, pods)` (firebase_spm.rb): the third argument
// lists the firebase-ios-sdk SwiftPM products the package needs.
const FIREBASE_DEPENDENCY =
  /firebase_dependency\(\s*s\s*,\s*firebase_sdk_version\s*,\s*\[([^\]]*)\]/;
const IOS_FRAMEWORKS = /^\s*s\.ios\.frameworks\s*=\s*(.+)$/m;

export interface RnfbPackage {
  name: string;
  root: string;
  /** Folder under `ios/` that holds the package's own sources. */
  sourceFolder: string;
  module: string;
  podspec: string;
  /** Paths relative to `ios/`. */
  swiftSources: string[];
  objcSources: string[];
  /** File names in the source folder. */
  headers: string[];
  firebaseProducts: string[];
  frameworks: string[];
}

export interface DiscoveryOptions {
  analyticsProduct: string;
}

/** The autolinked RNFB packages with native iOS code, `@react-native-firebase/app` first. */
export function discoverPackages(
  dependencies: Record<string, AutolinkedDependency>,
  options: DiscoveryOptions,
): RnfbPackage[] {
  return Object.entries(dependencies)
    .filter(([name, { platforms }]) => name.startsWith(SCOPE) && platforms?.ios !== null)
    .flatMap(([name, { root }]) => {
      const podspec = findPodspec(root);
      return podspec && fs.existsSync(path.join(root, 'ios'))
        ? [readPackage(name, root, podspec, options)]
        : [];
    })
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
}

const sortKey = (pkg: RnfbPackage) => (pkg.name === APP_PACKAGE ? '' : pkg.name);

function findPodspec(root: string): string | undefined {
  const podspec = fs.readdirSync(root).find(file => file.endsWith('.podspec'));
  return podspec && path.join(root, podspec);
}

function readPackage(
  name: string,
  root: string,
  podspecPath: string,
  options: DiscoveryOptions,
): RnfbPackage {
  const iosDir = path.join(root, 'ios');
  const sourceFolder = findSourceFolder(name, iosDir);
  const module = MODULE_NAMES[sourceFolder] ?? sourceFolder;
  const turboModules = path.join('generated', `${module}TurboModules`);
  const podspec = stripRubyComments(fs.readFileSync(podspecPath, 'utf8'));
  const inSourceFolder = (extensions: string[]) =>
    filesIn(path.join(iosDir, sourceFolder), extensions).map(file => `${sourceFolder}/${file}`);

  return {
    name,
    root,
    sourceFolder,
    module,
    podspec: podspecPath,
    swiftSources: inSourceFolder(['.swift']),
    objcSources: [
      ...inSourceFolder(['.m', '.mm', '.cpp']),
      ...filesIn(path.join(iosDir, turboModules), ['.mm']).map(file => `${turboModules}/${file}`),
    ],
    headers: filesIn(path.join(iosDir, sourceFolder), ['.h']),
    firebaseProducts:
      name === ANALYTICS_PACKAGE
        ? [options.analyticsProduct]
        : podspecFirebaseProducts(name, podspec),
    frameworks: quoted(IOS_FRAMEWORKS.exec(podspec)?.[1] ?? ''),
  };
}

function findSourceFolder(name: string, iosDir: string): string {
  const candidates = fs
    .readdirSync(iosDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(
      folder =>
        folder.startsWith('RNFB') &&
        !folder.endsWith('UnitTests') &&
        !folder.endsWith('.xcodeproj'),
    )
    // A folder with its own Package.swift is a separate SwiftPM package (app's RNFBFirebase probe).
    .filter(folder => !fs.existsSync(path.join(iosDir, folder, 'Package.swift')));
  if (candidates.length !== 1) {
    throw new Error(
      `${name}: expected one source folder in ${iosDir}, found ${candidates.join(', ') || 'none'}.`,
    );
  }
  return candidates[0];
}

function podspecFirebaseProducts(name: string, podspec: string): string[] {
  const match = FIREBASE_DEPENDENCY.exec(podspec);
  if (!match) {
    throw new Error(`${name}: the podspec declares no firebase_dependency SwiftPM products.`);
  }
  return quoted(match[1]);
}

// A `#` inside a quoted literal, such as `"v#{s.version}"`, starts no comment.
function stripRubyComments(source: string): string {
  return source.replace(
    /('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|#.*$/gm,
    (_, literal: string | undefined) => literal ?? '',
  );
}

function filesIn(dir: string, extensions: string[]): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && extensions.includes(path.extname(entry.name)))
    .map(entry => entry.name)
    .sort();
}

function quoted(text: string): string[] {
  return [...text.matchAll(/['"]([^'"]+)['"]/g)].map(match => match[1]);
}
