const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Android applicationId stays com.invertase.testing; iOS PRODUCT_BUNDLE_IDENTIFIER is io.invertase.testing.
const ANDROID_TEST_APP_PACKAGE = 'com.invertase.testing';
const IOS_TEST_APP_BUNDLE_ID = 'io.invertase.testing';
const ANDROID_COVERAGE_RELATIVE_PATH = 'files/coverage.ec';

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
  const emuDest = '/data/local/tmp/detox/coverage.ec';
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

// Merged unit (*.exec) + e2e (*.ec) report — Codecov android-native uploads this XML.
// See tests/android/app/jacoco.gradle (jacocoTestReport) and okf-bundle/testing/coverage-design.md.
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
  if (args.includes('--no-strict')) {
    return false;
  }
  if (args.includes('--strict')) {
    return true;
  }
  return process.env.RNFB_COVERAGE_STRICT !== '0';
}

async function main() {
  const args = process.argv.slice(2);
  const strict = isCoverageStrict(args);
  const {
    assertAndroidJacoco,
    DEFAULT_ANDROID_JACOCO,
    EXIT_STRICT_EMPTY,
  } = require('./assert-native-coverage-presence');

  if (args.includes('--android-pull')) {
    const deviceId = resolveAndroidDeviceId();
    console.log(`[native-coverage] Pulling Android coverage from ${deviceId}`);
    // Always softFail at retry layer so miss returns null; strict maps to exit 2 below.
    const pulled = await pullAndroidCoverageWithRetry(deviceId, { softFail: true });
    if (!pulled && strict) {
      console.error('[native-coverage] Android coverage.ec missing (strict)');
      process.exit(EXIT_STRICT_EMPTY);
    }
    return;
  }

  if (args.includes('--android-post-e2e')) {
    const deviceId = resolveAndroidDeviceId();
    const testsDir = path.resolve(__dirname, '..');
    const localDestFile = path.join(
      testsDir,
      'android/app/build/output/coverage/emulator_coverage.ec',
    );
    console.log(`[native-coverage] Post-e2e Android coverage on ${deviceId} (strict=${strict})`);
    let pulled = null;
    if (fs.existsSync(localDestFile)) {
      console.log(`[native-coverage] Using existing ${localDestFile} from Jet-close pull`);
      pulled = localDestFile;
    } else {
      // softFail so miss returns null; !pulled && strict → EXIT_STRICT_EMPTY (not throw→1).
      pulled = await pullAndroidCoverageWithRetry(deviceId, { softFail: true, testsDir });
    }
    const reportOk = runJacocoTestReport();
    if (!pulled) {
      const message = 'Merged Jacoco report lacks e2e data (no coverage.ec pulled)';
      if (strict) {
        console.error(`[native-coverage] ${message}`);
        process.exit(EXIT_STRICT_EMPTY);
      }
      console.warn(`[native-coverage] ${message}`);
    } else if (reportOk) {
      deleteProcessedAndroidCoverageEc(pulled);
    }

    if (!reportOk) {
      console.error('[native-coverage] jacocoTestReport failed');
      process.exit(1);
    }

    // Presence guard: invertase package LINE hits must be non-empty.
    const assertCode = assertAndroidJacoco(DEFAULT_ANDROID_JACOCO, strict);
    if (assertCode !== 0) {
      process.exit(assertCode);
    }
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
  resolveAndroidDeviceId,
  runJacocoTestReport,
};
