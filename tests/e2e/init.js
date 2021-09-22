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
require('./globals');

const detox = require('detox');
const { execSync } = require('child_process');
const jet = require('jet/platform/node');

const { detox: config } = require('../package.json');

config.configurations['android.emu.debug'].device.avdName =
  process.env.ANDROID_AVD_NAME || config.configurations['android.emu.debug'].device.avdName;

before(async function () {
  await detox.init(config);
  await device.launchApp();
  await jet.init();
});

beforeEach(async function beforeEach() {
  const retry = this.currentTest.currentRetry();

  if (retry > 0) {
    if (retry === 1) {
      console.log('');
      console.warn('⚠️ A test failed:');
      console.warn(`️   ->  ${this.currentTest.title}`);
    }

    if (retry > 1) {
      console.warn(`   🔴  Retry #${retry - 1} failed...`);
    }

    console.warn(`️   ->  Retrying in ${5 * retry} seconds ... (${retry})`);
    await Utils.sleep(5000 * retry);
  }
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

    try {
      execSync(`adb -s ${deviceId} shell "run-as ${pkg} cat ${emuOrig} > ${emuDest}"`);
      execSync(`mkdir -p ${localDestDir}`);
      execSync(`adb -s ${deviceId} pull ${emuDest} ${localDestDir}/emulator_coverage.ec`);
      console.log(`Coverage data downloaded to: ${localDestDir}/emulator_coverage.ec`);
    } catch (e) {
      console.log('Unable to download coverage data from device: ', JSON.stringify(e));
    }
  }

  try {
    await device.terminateApp();
  } catch (e) {
    console.log('Unable to terminate app?', e);
  }
});
