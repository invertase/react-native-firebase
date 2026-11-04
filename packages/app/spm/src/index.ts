import fs from 'fs';
import path from 'path';

import { writeLayout } from './layout';
import { PACKAGE_NAME, renderManifest, type IosSdkVersions } from './manifest';
import {
  APP_PACKAGE,
  discoverPackages,
  ON_DEVICE_CONVERSION,
  type DiscoveryOptions,
  type RnfbPackage,
} from './packages';
import { scriptPhasesFor } from './scriptPhases';
import { targetsFor } from './targets';
import type { PluginContext, PluginResult } from './types';

type ReactNativeFlag =
  | 'analytics_without_ad_id_support'
  | 'analytics_enable_ad_support'
  | 'analytics_google_app_measurement_on_device_conversion';

interface FirebaseJson {
  'react-native'?: Partial<Record<ReactNativeFlag, unknown>>;
}

/**
 * React Native SwiftPM autolinking plugin: builds every autolinked `@react-native-firebase/*`
 * package with native iOS code into one local SwiftPM package, `ReactNativeFirebase`.
 */
function reactNativeFirebaseSpmPlugin(context: PluginContext): PluginResult {
  const { appRoot, projectRoot, outputDir, react } = context;
  if (!react) {
    throw new Error(
      '@react-native-firebase/app: React Native SwiftPM gave no React package to depend on.',
    );
  }

  const firebaseJsonPath = path.join(projectRoot, 'firebase.json');
  const packages = discoverPackages(
    context.autolinking.dependencies ?? {},
    readDiscoveryOptions(firebaseJsonPath),
  );
  const app = packages.find(pkg => pkg.name === APP_PACKAGE);
  if (!app) {
    throw new Error(`${APP_PACKAGE} is not autolinked, so its SwiftPM package cannot be built.`);
  }

  const targets = packages.flatMap(targetsFor);
  const packageDir = path.join(outputDir, PACKAGE_NAME);
  const appPackageJson = path.join(app.root, 'package.json');
  const manifest = renderManifest({
    targets,
    react,
    reactCodegenPath: path.join(outputDir, '..', 'ios'),
    sdk: readIosSdkVersions(appPackageJson),
    headers: Object.fromEntries(packages.map(pkg => [pkg.module, pkg.headers])),
  });
  writeLayout(packageDir, packages, targets, manifest);

  return {
    packageDependencies: [{ name: PACKAGE_NAME, path: packageDir }],
    productDependencies: [{ name: PACKAGE_NAME, package: PACKAGE_NAME }],
    scriptPhases: packages.flatMap(pkg => scriptPhasesFor(pkg, appRoot)),
    watchPaths: [firebaseJsonPath, appPackageJson, ...packages.flatMap(watchPathsFor)],
  };
}

function readDiscoveryOptions(firebaseJsonPath: string): DiscoveryOptions {
  const config = fs.existsSync(firebaseJsonPath) ? readFirebaseJson(firebaseJsonPath) : null;
  const isSet = (flag: ReactNativeFlag) => config?.['react-native']?.[flag] === true;
  return {
    analyticsProduct: isSet('analytics_without_ad_id_support')
      ? 'FirebaseAnalyticsCore'
      : 'FirebaseAnalytics',
    analyticsExternalProducts: isSet('analytics_google_app_measurement_on_device_conversion')
      ? [ON_DEVICE_CONVERSION]
      : [],
    analyticsFrameworks: isSet('analytics_enable_ad_support') ? ['AdSupport'] : [],
  };
}

function readFirebaseJson(firebaseJsonPath: string): FirebaseJson {
  const text = fs.readFileSync(firebaseJsonPath, 'utf8');
  try {
    return JSON.parse(text);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${firebaseJsonPath} is not valid JSON: ${reason}`, { cause: error });
  }
}

function readIosSdkVersions(appPackageJson: string): IosSdkVersions {
  return JSON.parse(fs.readFileSync(appPackageJson, 'utf8')).sdkVersions.ios;
}

function watchPathsFor(pkg: RnfbPackage): string[] {
  const iosDir = path.join(pkg.root, 'ios');
  return [
    pkg.podspec,
    path.join(pkg.root, 'react-native.config.js'),
    iosDir,
    path.join(iosDir, pkg.sourceFolder),
    path.join(iosDir, 'generated', `${pkg.module}TurboModules`),
  ];
}

export = reactNativeFirebaseSpmPlugin;
