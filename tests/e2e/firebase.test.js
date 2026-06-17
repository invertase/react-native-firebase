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
const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

const { pullAndroidCoverage, pullIosCoverage } = require('../scripts/pull-native-coverage');

const JET_REMOTE_PORT = parseInt(process.env.JET_REMOTE_PORT || '8090', 10);

function waitForTcpPort(port, host = '127.0.0.1', timeoutMs = 120000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out waiting for ${host}:${port} after ${timeoutMs}ms`));
        return;
      }

      const socket = net.connect(port, host);
      socket.once('connect', () => {
        socket.end();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        setTimeout(tryConnect, 250);
      });
    };

    tryConnect();
  });
}

describe('Jet Tests', function () {
  jest.retryTimes(0, { logErrorsBeforeRetry: true });

  it('runs all tests', async function () {
    return new Promise(async (resolve, reject) => {
      const platform = detox.device.getPlatform();
      const deviceId = detox.device.id;
      const testsDir = path.resolve(__dirname, '..');
      const jetArgs =
        process.platform === 'win32'
          ? ['jet', `--target=${platform}`] // NYC / coverage does not work on windows.
          : ['jet', `--target=${platform}`, '--coverage'];
      const jetProcess = spawn('yarn', jetArgs, {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
        cwd: testsDir,
      });
      jetProcess.on('error', err => {
        console.error(`Jet tests had an error: ${err}`);
        reject(new Error(`Jet tests failed!`));
      });
      jetProcess.on('close', code => {
        if (code !== 0) {
          reject(new Error(`Jet tests failed!`));
          return;
        }

        try {
          if (platform === 'android' && process.platform !== 'win32') {
            pullAndroidCoverage(deviceId, { testsDir, softFail: true });
          }
          if (platform === 'ios' && process.platform === 'darwin') {
            pullIosCoverage(deviceId, { testsDir });
          }
        } catch (e) {
          reject(new Error(`Failed to download native coverage data: ${e.message}`));
          return;
        }

        resolve();
      });

      await waitForTcpPort(JET_REMOTE_PORT);
      await device.launchApp({
        newInstance: true,
        delete: true,
        launchArgs: {
          detoxURLBlacklistRegex: `.*`,
          // Avoid sync/idling blocking the main queue while Detox WS login is pending.
          detoxEnableSynchronization: 'NO',
        },
      });
    });
  });

  afterAll(async function () {
    console.log(' ✨ Tests Complete ✨ ');
    try {
      await device.terminateApp();
    } catch (_) {
      // No-op
    }
  });
});
