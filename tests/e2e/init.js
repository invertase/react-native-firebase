/* eslint-disable no-console */
/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
const detox = require('detox');
const { execSync, spawn } = require('child_process');

const { detox: config } = require('../package.json');

config.configurations['android.emu.debug'].device.avdName =
  process.env.ANDROID_AVD_NAME || config.configurations['android.emu.debug'].device.avdName;

process.on('unhandledRejection', err => {
  console.error(err);
  process.exit(1);
});

before(async function () {
  await detox.init(config);
});

beforeEach(async function beforeEachTest() {
  const retry = this.currentTest.currentRetry();
  if (retry > 0) {
    if (retry === 1) {
      console.log('');
      console.warn('⚠️ Suite failed. Relaunching application and trying again.');
    }
    if (retry > 1) {
      console.warn(`   🔴  Suite Retry #${retry - 1} failed...`);
    }
    console.warn(`️   ->  Retrying suite in ${5 * retry} seconds ... (${retry})`);
    await new Promise(resolve => setTimeout(resolve, 5000 * retry));
  }
  await device.launchApp({ newInstance: true, delete: true });
  // Give the app time to settle before starting the tests.
  await new Promise(resolve => setTimeout(resolve, 1000));
});

describe('Jet Tests', () => {
  it('runs all tests', async () => {
    return new Promise((resolve, reject) => {
      const platform = detox.device.getPlatform();
      const jetProcess = spawn('yarn', ['jet', `--target=${platform}`, '--coverage'], {
        stdio: ['ignore', 'inherit', 'inherit'],
      });
      jetProcess.on('close', code => {
        if (code === 0) {
          resolve();
        }
        reject(new Error(`Jet tests failed!`));
      });
    });
  });
});

after(async function () {
  console.log(' ✨ Tests Complete ✨ ');
  const isAndroid = detox.device.getPlatform() === 'android';
  const deviceId = detox.device.id;

  // emits 'cleanup' across socket, which goes native, terminates Detox test Looper
  // This returns control to the java code in our instrumented test, and then Instrumentation lifecycle finishes cleanly
  // await Utils.sleep(5000); // give async processes (like Firestore writes) time to complete
  await detox.cleanup();
  // await Utils.sleep(5000); // give client app time to dump coverage report

  // Get the file off the device, into standard location for JaCoCo binary report
  // It will still need processing via gradle jacocoAndroidTestReport task for codecov, but it's available now
  if (isAndroid) {
    const pkg = 'com.invertase.testing';
    const emuOrig = `/data/user/0/${pkg}/files/coverage.ec`;
    const emuDest = '/data/local/tmp/detox/coverage.ec';
    const localDestDir = './android/app/build/output/coverage/';
    const adb = process.env.ANDROID_HOME ? `${process.env.ANDROID_HOME}/platform-tools/adb` : 'adb';

    try {
      execSync(`${adb} -s ${deviceId} shell "run-as ${pkg} cat ${emuOrig} > ${emuDest}"`);
      execSync(`mkdir -p ${localDestDir}`);
      execSync(`${adb} -s ${deviceId} pull ${emuDest} ${localDestDir}/emulator_coverage.ec`);
      console.log(`Coverage data downloaded to: ${localDestDir}/emulator_coverage.ec`);
    } catch (e) {
      console.log('Unable to download coverage data from device: ', JSON.stringify(e));
    }
  }

  try {
    await device.terminateApp();
  } catch (e) {
    // No-op
  }
});
