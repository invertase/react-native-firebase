const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEST_APP_PACKAGE = 'com.invertase.testing';
const ANDROID_COVERAGE_RELATIVE_PATH = 'files/coverage.ec';

function getAdbBinary() {
  return process.env.ANDROID_HOME
    ? `${process.env.ANDROID_HOME}/platform-tools/adb`
    : 'adb';
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
      `${adb} ${serial} shell "run-as ${TEST_APP_PACKAGE} test -f ${ANDROID_COVERAGE_RELATIVE_PATH}"`,
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
      `${adb} ${serial} shell "run-as ${TEST_APP_PACKAGE} cat ${ANDROID_COVERAGE_RELATIVE_PATH} > ${emuDest}"`,
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
  const container = execSync(`xcrun simctl get_app_container ${deviceId} ${TEST_APP_PACKAGE} data`, {
    encoding: 'utf8',
  }).trim();
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

function runJacocoAndroidTestReport() {
  const androidDir = path.resolve(__dirname, '../android');
  const result = spawnSync('./gradlew', ['jacocoAndroidTestReport'], {
    cwd: androidDir,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    console.warn(
      `[native-coverage] jacocoAndroidTestReport exited with status ${result.status ?? 'unknown'}`,
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

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--android-pull')) {
    const deviceId = resolveAndroidDeviceId();
    console.log(`[native-coverage] Pulling Android coverage from ${deviceId}`);
    await pullAndroidCoverageWithRetry(deviceId, { softFail: true });
    return;
  }

  if (args.includes('--android-post-e2e')) {
    const deviceId = resolveAndroidDeviceId();
    const testsDir = path.resolve(__dirname, '..');
    const localDestFile = path.join(
      testsDir,
      'android/app/build/output/coverage/emulator_coverage.ec',
    );
    console.log(`[native-coverage] Post-e2e Android coverage on ${deviceId}`);
    let pulled = null;
    if (fs.existsSync(localDestFile)) {
      console.log(`[native-coverage] Using existing ${localDestFile} from Jet-close pull`);
      pulled = localDestFile;
    } else {
      pulled = await pullAndroidCoverageWithRetry(deviceId, { softFail: true, testsDir });
    }
    const reportOk = runJacocoAndroidTestReport();
    if (!pulled) {
      console.warn('[native-coverage] Jacoco report may be empty (no coverage.ec pulled)');
    } else if (reportOk) {
      deleteProcessedAndroidCoverageEc(pulled);
    }
    return;
  }

  console.error(
    'Usage: node tests/scripts/pull-native-coverage.js --android-pull|--android-post-e2e',
  );
  process.exit(1);
}

if (require.main === module) {
  main().catch(error => {
    console.warn(`[native-coverage] ${error.message}`);
    process.exit(0);
  });
}

module.exports = {
  pullAndroidCoverage,
  pullAndroidCoverageWithRetry,
  pullIosCoverage,
  resolveAndroidDeviceId,
  runJacocoAndroidTestReport,
};
