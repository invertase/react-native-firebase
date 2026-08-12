#!/usr/bin/env node
/**
 * Run RN codegen for migrated packages from the mobile test app toolchain (tests/).
 * NewArch-AD-20: CLI / @react-native/codegen must resolve from tests/, not library cwd.
 *
 * Usage:
 *   node ./scripts/codegen-package.mjs <packageName> <android|ios>
 *   node ./scripts/codegen-package.mjs --all
 *
 * iOS 0.86+ writes under <outputPath>/ReactCodegen/; we flatten into <outputPath>
 * so existing podspec HEADER_SEARCH_PATHS / shell imports keep working.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const TESTS_DIR = path.join(REPO_ROOT, 'tests');
const PACKAGES_ROOT = path.join(REPO_ROOT, 'packages');

/** Committed generated output dirs (relative to package root). */
const OUTPUT_PATHS = {
  app: {
    android: 'android/src/reactnative/java/io/invertase/firebase/app/generated',
    ios: 'ios/generated',
  },
  firestore: {
    android: 'android/src/reactnative/java/io/invertase/firebase/firestore/generated',
    ios: 'ios/generated',
  },
  installations: {
    android: 'android/src/main/java/io/invertase/firebase/installations/generated',
    ios: 'ios/generated',
  },
  perf: {
    android: 'android/src/reactnative/java/io/invertase/firebase/perf/generated',
    ios: 'ios/generated',
  },
  'in-app-messaging': {
    android: 'android/src/reactnative/java/io/invertase/firebase/fiam/generated',
    ios: 'ios/generated',
  },
  messaging: {
    android: 'android/src/main/java/io/invertase/firebase/messaging/generated',
    ios: 'ios/generated',
  },
  'app-distribution': {
    android: 'android/src/main/java/io/invertase/firebase/appdistribution/generated',
    ios: 'ios/generated',
  },
  ml: {
    android: 'android/src/reactnative/java/io/invertase/firebase/ml/generated',
    ios: 'ios/generated',
  },
  'app-check': {
    android: 'android/src/main/java/io/invertase/firebase/appcheck/generated',
    ios: 'ios/generated',
  },
  'remote-config': {
    android: 'android/src/reactnative/java/io/invertase/firebase/config/generated',
    ios: 'ios/generated',
  },
  analytics: {
    android: 'android/src/reactnative/java/io/invertase/firebase/analytics/generated',
    ios: 'ios/generated',
  },
  crashlytics: {
    android: 'android/src/main/java/io/invertase/firebase/crashlytics/generated',
    ios: 'ios/generated',
  },
  storage: {
    android: 'android/src/main/java/io/invertase/firebase/storage/generated',
    ios: 'ios/generated',
  },
  functions: {
    android: 'android/src/main/java/io/invertase/firebase/functions/generated',
    ios: 'ios/generated',
  },
  database: {
    android: 'android/src/reactnative/java/io/invertase/firebase/database/generated',
    ios: 'ios/generated',
  },
  auth: {
    android: 'android/src/main/java/io/invertase/firebase/auth/generated',
    ios: 'ios/generated',
  },
  'phone-number-verification': {
    android: 'android/src/reactnative/java/io/invertase/firebase/pnv/generated',
    ios: 'ios/generated',
  },
};

const MIGRATED_PACKAGES = Object.keys(OUTPUT_PATHS);

const APP_ONLY_IOS_GENERATED = [
  'RCTAppDependencyProvider.h',
  'RCTAppDependencyProvider.mm',
  'RCTModuleProviders.h',
  'RCTModuleProviders.mm',
  'RCTModulesConformingToProtocolsProvider.h',
  'RCTModulesConformingToProtocolsProvider.mm',
  'RCTThirdPartyComponentsProvider.h',
  'RCTThirdPartyComponentsProvider.mm',
  'RCTUnstableModulesRequiringMainQueueSetupProvider.h',
  'RCTUnstableModulesRequiringMainQueueSetupProvider.mm',
  'ReactAppDependencyProvider.podspec',
  'ReactCodegen.podspec',
];

/** RN 0.86+ emits header-only CxxSpec JSI; stale *JSI-generated.cpp from 0.78 must not remain. */
function scrubStaleJsiCpp(outputAbs) {
  if (!fs.existsSync(outputAbs)) {
    return;
  }
  const stack = [outputAbs];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.name.endsWith('JSI-generated.cpp')) {
        rmrf(full);
      }
    }
  }
}

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function flattenReactCodegen(outputAbs) {
  const nested = path.join(outputAbs, 'ReactCodegen');
  if (!fs.existsSync(nested)) {
    return;
  }
  for (const entry of fs.readdirSync(nested)) {
    const from = path.join(nested, entry);
    const to = path.join(outputAbs, entry);
    rmrf(to);
    fs.renameSync(from, to);
  }
  rmrf(nested);
}

function scrubAppOnlyIosArtifacts(outputAbs) {
  for (const name of APP_ONLY_IOS_GENERATED) {
    rmrf(path.join(outputAbs, name));
  }
}

function runPackagePlatform(packageName, platform) {
  const paths = OUTPUT_PATHS[packageName];
  if (!paths) {
    throw new Error(`Unknown package for codegen: ${packageName}`);
  }
  if (!['android', 'ios'].includes(platform)) {
    throw new Error(`platform must be android|ios, got ${platform}`);
  }

  const packageDir = path.join(PACKAGES_ROOT, packageName);
  const relativeOutput = paths[platform];
  const outputAbs = path.join(packageDir, relativeOutput);
  const outputFromTests = path.relative(TESTS_DIR, outputAbs);
  const packageFromTests = path.relative(TESTS_DIR, packageDir);

  // NewArch-AD-22: wipe configured outputPath before CLI codegen writes.
  rmrf(outputAbs);
  fs.mkdirSync(outputAbs, { recursive: true });

  const command = [
    'npx @react-native-community/cli codegen',
    `--path ${packageFromTests}`,
    `--platform ${platform}`,
    `--source library`,
    `--outputPath ${outputFromTests}`,
  ].join(' ');

  console.log(`[codegen] ${packageName} (${platform})`);
  execSync(command, { stdio: 'inherit', cwd: TESTS_DIR });

  if (platform === 'ios') {
    flattenReactCodegen(outputAbs);
    scrubAppOnlyIosArtifacts(outputAbs);
  }
  scrubStaleJsiCpp(outputAbs);
}

function runAll() {
  for (const packageName of MIGRATED_PACKAGES) {
    runPackagePlatform(packageName, 'android');
    runPackagePlatform(packageName, 'ios');
  }
}

const args = process.argv.slice(2);
if (args[0] === '--all') {
  runAll();
} else if (args.length === 2) {
  runPackagePlatform(args[0], args[1]);
} else {
  console.error(
    'Usage: node ./scripts/codegen-package.mjs <packageName> <android|ios>\n' +
      '       node ./scripts/codegen-package.mjs --all',
  );
  process.exit(1);
}
