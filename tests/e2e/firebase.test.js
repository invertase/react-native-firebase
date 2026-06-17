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
const JET_RETRYABLE_WS_RE = /\[jet-ws\] RETRYABLE_DISCONNECT code=(1006|1001)\b/;

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

function isRetryableJetDisconnect(output) {
  return JET_RETRYABLE_WS_RE.test(output);
}

function runJetE2eAttempt(attempt) {
  const platform = detox.device.getPlatform();
  const testsDir = path.resolve(__dirname, '..');
  const jetArgs =
    process.platform === 'win32'
      ? ['jet', `--target=${platform}`]
      : ['jet', `--target=${platform}`, '--coverage'];

  let output = '';
  const jetProcess = spawn('yarn', jetArgs, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    cwd: testsDir,
  });

  jetProcess.stdout.on('data', chunk => {
    const text = chunk.toString();
    output += text;
    process.stdout.write(text);
  });
  jetProcess.stderr.on('data', chunk => {
    const text = chunk.toString();
    output += text;
    process.stderr.write(text);
  });

  return new Promise(async (resolve, reject) => {
    jetProcess.on('error', err => {
      err.jetOutput = output;
      reject(err);
    });
    jetProcess.on('close', code => {
      if (code !== 0) {
        const err = new Error('Jet tests failed!');
        err.jetOutput = output;
        err.jetExitCode = code;
        reject(err);
        return;
      }
      resolve({ output });
    });

    try {
      console.log(`[rnfb-e2e] Jet attempt ${attempt}: waiting for port ${JET_REMOTE_PORT}`);
      await waitForTcpPort(JET_REMOTE_PORT);
      console.log(`[rnfb-e2e] Jet attempt ${attempt}: launching app`);
      await device.launchApp({
        newInstance: true,
        delete: true,
        launchArgs: {
          detoxURLBlacklistRegex: `.*`,
          // Avoid sync/idling blocking the main queue while Detox WS login is pending.
          detoxEnableSynchronization: 'NO',
        },
      });
    } catch (err) {
      jetProcess.kill();
      err.jetOutput = output;
      reject(err);
    }
  });
}

describe('Jet Tests', function () {
  jest.retryTimes(0, { logErrorsBeforeRetry: true });

  it('runs all tests', async function () {
    const platform = detox.device.getPlatform();
    const deviceId = detox.device.id;
    const testsDir = path.resolve(__dirname, '..');

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (attempt > 1) {
          console.warn('[rnfb-e2e] Retrying after transient Jet WS disconnect (1006/1001)');
          try {
            await device.terminateApp();
          } catch (_) {
            // No-op
          }
        }

        await runJetE2eAttempt(attempt);
        break;
      } catch (err) {
        const jetOutput = err.jetOutput || '';
        const retryable = attempt === 1 && isRetryableJetDisconnect(jetOutput);
        console.warn(
          `[rnfb-e2e] Jet attempt ${attempt} failed (retryable=${retryable}, exit=${err.jetExitCode ?? 'n/a'})`,
        );
        if (!retryable) {
          throw err;
        }
      }
    }

    try {
      if (platform === 'android' && process.platform !== 'win32') {
        pullAndroidCoverage(deviceId, { testsDir, softFail: true });
      }
      if (platform === 'ios' && process.platform === 'darwin') {
        pullIosCoverage(deviceId, { testsDir });
      }
    } catch (e) {
      throw new Error(`Failed to download native coverage data: ${e.message}`);
    }
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
