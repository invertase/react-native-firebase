#!/usr/bin/env node
/**
 * Android / iOS coverage pull orchestration for RNFB tests.
 *
 * Android pull + post-e2e use `rn-coverage` CLI with RNFB artifact paths.
 * iOS pull (Jet close) still copies profraw into
 * tests/ios/build/output/coverage for the package export step.
 */
'use strict';

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadCoverageConfig, resolveStrict } = require('./load-coverage-config');
const { runRnCoverage } = require('./resolve-rn-coverage');

const coverageConfig = loadCoverageConfig();
const repoRoot = path.resolve(__dirname, '../..');
const testsDir = path.join(repoRoot, 'tests');
const ANDROID_TEST_APP_PACKAGE = coverageConfig.app.androidApplicationId;
const IOS_TEST_APP_BUNDLE_ID = coverageConfig.app.iosBundleId;
const ANDROID_COVERAGE_RELATIVE_PATH = coverageConfig.android.coverageRelativePath;
const ANDROID_DETOX_STAGING_PATH = coverageConfig.android.detoxStagingPath;

function getAdbBinary() {
  return process.env.ANDROID_HOME ? `${process.env.ANDROID_HOME}/platform-tools/adb` : 'adb';
}

function resolveAndroidDeviceId(preferredDeviceId) {
  if (preferredDeviceId) {
    return preferredDeviceId;
  }

  if (process.env.ANDROID_SERIAL) {
    return process.env.ANDROID_SERIAL;
  }

  const adb = getAdbBinary();
  const output = execSync(`${adb} devices`, { encoding: 'utf8' });
  const deviceLine = output
    .split('\n')
    .slice(1)
    .map(line => line.trim())
    .find(line => line.endsWith('\tdevice'));

  if (!deviceLine) {
    throw new Error('No online Android device found for native coverage pull');
  }

  return deviceLine.split('\t')[0];
}

function androidCoverageFileExists(deviceId) {
  const adb = getAdbBinary();
  const serial = deviceId ? `-s ${deviceId}` : '';

  try {
    execSync(
      `${adb} ${serial} shell "run-as ${ANDROID_TEST_APP_PACKAGE} test -f ${ANDROID_COVERAGE_RELATIVE_PATH}"`,
      { stdio: 'pipe' },
    );
    return true;
  } catch (_) {
    return false;
  }
}

function pullAndroidCoverage(deviceId, options = {}) {
  const { softFail = false, testsDir = path.resolve(__dirname, '..') } = options;
  const emuDest = ANDROID_DETOX_STAGING_PATH;
  const localDestDir = path.join(testsDir, 'android/app/build/output/coverage');
  const localDestFile = path.join(localDestDir, 'emulator_coverage.ec');
  const adb = getAdbBinary();
  const serial = deviceId ? `-s ${deviceId}` : '';

  try {
    execSync(
      `${adb} ${serial} shell "run-as ${ANDROID_TEST_APP_PACKAGE} cat ${ANDROID_COVERAGE_RELATIVE_PATH} > ${emuDest}"`,
    );
    fs.mkdirSync(localDestDir, { recursive: true });
    execSync(`${adb} ${serial} pull ${emuDest} ${localDestFile}`);
    console.log(`Coverage data downloaded to: ${localDestFile}`);
    return localDestFile;
  } catch (error) {
    const message = `Android native coverage pull failed: ${error.message}`;
    if (softFail) {
      console.warn(`[native-coverage] ${message}`);
      return null;
    }
    throw new Error(message);
  }
}

async function pullAndroidCoverageWithRetry(deviceId, options = {}) {
  const {
    softFail = true,
    testsDir = path.resolve(__dirname, '..'),
    retries = 15,
    intervalMs = 2000,
  } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    if (androidCoverageFileExists(deviceId)) {
      const pulled = pullAndroidCoverage(deviceId, { softFail: true, testsDir });
      if (pulled) {
        return pulled;
      }
    } else if (attempt === 1 || attempt % 5 === 0) {
      console.log(
        `[native-coverage] Waiting for ${ANDROID_COVERAGE_RELATIVE_PATH} (attempt ${attempt}/${retries})`,
      );
    }

    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  const message = `Android native coverage file not found after ${retries} attempts`;
  if (softFail) {
    console.warn(`[native-coverage] ${message}`);
    return null;
  }
  throw new Error(message);
}

function pullIosCoverage(deviceId, options = {}) {
  const testsDir = options.testsDir || path.resolve(__dirname, '..');
  const localDestDir = path.join(testsDir, 'ios/build/output/coverage');
  const container = execSync(
    `xcrun simctl get_app_container ${deviceId} ${IOS_TEST_APP_BUNDLE_ID} data`,
    {
      encoding: 'utf8',
    },
  ).trim();
  fs.mkdirSync(localDestDir, { recursive: true });

  const profrawList = execSync(
    `find "${container}" \\( -path "*/Documents/coverage.profraw" -o -path "*/tmp/coverage.profraw" -o -name '*.profraw' \\)`,
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n')
    .filter(Boolean);

  if (profrawList.length === 0) {
    throw new Error(`No iOS coverage profraw files found under ${container}`);
  }

  const destPaths = profrawList.map((src, index) => {
    const suffix = profrawList.length > 1 ? `_${index}` : '';
    const dest = path.join(localDestDir, `simulator_coverage${suffix}.profraw`);
    execSync(`cp "${src}" "${dest}"`);
    return dest;
  });

  console.log(
    `Coverage data downloaded to: ${localDestDir} (${profrawList.length} profraw file(s))`,
  );
  return destPaths;
}

function runJacocoTestReport() {
  const androidDir = path.resolve(__dirname, '../android');
  const result = spawnSync('./gradlew', ['jacocoTestReport'], {
    cwd: androidDir,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    console.warn(
      `[native-coverage] jacocoTestReport exited with status ${result.status ?? 'unknown'}`,
    );
    return false;
  }

  return true;
}

function deleteProcessedAndroidCoverageEc(ecFilePath) {
  if (!ecFilePath || !fs.existsSync(ecFilePath)) {
    return;
  }

  fs.rmSync(ecFilePath, { force: true });
  console.log(`[native-coverage] Removed processed coverage.ec: ${ecFilePath}`);
}

function isCoverageStrict(args = []) {
  return resolveStrict(args, coverageConfig);
}

function pullJsCoverage(platform, deviceId) {
  const outputDir = path.join(repoRoot, 'coverage/js', platform);
  const args = ['js', 'pull', '--platform', platform, '--output', outputDir];
  if (platform === 'ios') {
    args.push('--device', deviceId);
  } else if (deviceId) {
    args.push('--device', deviceId);
  }

  const { status } = runRnCoverage(args);
  if (status !== 0) {
    throw new Error(`rn-coverage js pull failed for ${platform} (exit ${status ?? 'unknown'})`);
  }
}

function reportJsCoverage(platform) {
  const outputDir = path.join(repoRoot, 'coverage/js', platform);
  // cwd must be tests/ so rn-coverage can resolve tests/node_modules/nyc;
  // tests/nyc.config.js sets cwd:'..' for monorepo include globs.
  const { status } = runRnCoverage([
    'js',
    'report',
    '--input',
    path.join(outputDir, 'coverage-final.json'),
    '--output',
    outputDir,
    '--cwd',
    testsDir,
    '--nyc-config',
    path.join(testsDir, 'nyc.config.js'),
  ]);
  if (status !== 0) {
    throw new Error(`rn-coverage js report failed for ${platform} (exit ${status ?? 'unknown'})`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const strict = isCoverageStrict(args);
  if (!coverageConfig.enabled) {
    console.warn('[native-coverage] disabled via tests/react-native-coverage.config.js');
    return;
  }

  const localDestDir = path.join(testsDir, 'android/app/build/output/coverage');
  const localDestFile = path.join(localDestDir, 'emulator_coverage.ec');
  const deviceId = resolveAndroidDeviceId();

  if (args.includes('--android-pull')) {
    console.log(`[native-coverage] Pulling Android coverage from ${deviceId} via rn-coverage`);
    const { status } = runRnCoverage(
      strict
        ? ['--strict', 'android', 'pull', '--device', deviceId, '--output', localDestDir]
        : ['--no-strict', 'android', 'pull', '--device', deviceId, '--output', localDestDir],
    );
    process.exit(status == null ? 1 : status);
  }

  if (args.includes('--android-post-e2e')) {
    console.log(
      `[native-coverage] Post-e2e Android coverage on ${deviceId} via rn-coverage (strict=${strict})`,
    );
    let pulled = null;
    if (fs.existsSync(localDestFile)) {
      console.log(`[native-coverage] Using existing ${localDestFile} from Jet-close pull`);
      pulled = localDestFile;
    } else {
      const pullResult = runRnCoverage([
        strict ? '--strict' : '--no-strict',
        'android',
        'pull',
        '--device',
        deviceId,
        '--output',
        localDestDir,
      ]);
      if (pullResult.status === 0 && fs.existsSync(localDestFile)) {
        pulled = localDestFile;
      } else if (pullResult.status === 2 && strict) {
        process.exit(2);
      }
    }

    const reportResult = runRnCoverage([
      strict ? '--strict' : '--no-strict',
      'android',
      'report',
      '--android-dir',
      path.join(testsDir, 'android'),
      '--jacoco-xml',
      path.resolve(path.resolve(__dirname, '../..'), coverageConfig.android.jacocoReportXml),
    ]);

    if (reportResult.status !== 0) {
      process.exit(reportResult.status == null ? 1 : reportResult.status);
    }

    if (!pulled) {
      const message = 'Merged Jacoco report lacks e2e data (no coverage.ec pulled)';
      if (strict) {
        console.error(`[native-coverage] ${message}`);
        process.exit(2);
      }
      console.warn(`[native-coverage] ${message}`);
    } else {
      deleteProcessedAndroidCoverageEc(pulled);
    }

    // Explicit presence assert via package CLI (belt-and-suspenders with report assert).
    const assertResult = runRnCoverage([
      strict ? '--strict' : '--no-strict',
      'assert',
      '--platform',
      'android',
    ]);
    if (assertResult.status !== 0) {
      process.exit(assertResult.status == null ? 1 : assertResult.status);
    }

    reportJsCoverage('android');
    return;
  }

  console.error(
    'Usage: node tests/scripts/pull-native-coverage.js --android-pull|--android-post-e2e [--strict|--no-strict]',
  );
  process.exit(1);
}

if (require.main === module) {
  main().catch(error => {
    console.error(`[native-coverage] ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  pullAndroidCoverage,
  pullAndroidCoverageWithRetry,
  pullIosCoverage,
  pullJsCoverage,
  reportJsCoverage,
  resolveAndroidDeviceId,
  runJacocoTestReport,
};
