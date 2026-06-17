const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEST_APP_PACKAGE = 'com.invertase.testing';

function pullAndroidCoverage(deviceId, options = {}) {
  const { softFail = false, testsDir = path.resolve(__dirname, '..') } = options;
  const emuOrig = `/data/user/0/${TEST_APP_PACKAGE}/files/coverage.ec`;
  const emuDest = '/data/local/tmp/detox/coverage.ec';
  const localDestDir = path.join(testsDir, 'android/app/build/output/coverage');
  const localDestFile = path.join(localDestDir, 'emulator_coverage.ec');
  const adb = process.env.ANDROID_HOME
    ? `${process.env.ANDROID_HOME}/platform-tools/adb`
    : 'adb';

  try {
    execSync(`${adb} -s ${deviceId} shell "run-as ${TEST_APP_PACKAGE} cat ${emuOrig} > ${emuDest}"`);
    fs.mkdirSync(localDestDir, { recursive: true });
    execSync(`${adb} -s ${deviceId} pull ${emuDest} ${localDestFile}`);
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

module.exports = {
  pullAndroidCoverage,
  pullIosCoverage,
};
