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

const { pullIosCoverage } = require('../scripts/pull-native-coverage');

const JET_REMOTE_PORT = parseInt(process.env.JET_REMOTE_PORT || '8090', 10);
const METRO_PORT = parseInt(process.env.JET_METRO_PORT || process.env.RCT_METRO_PORT || '8081', 10);
const LAUNCH_APP_TIMEOUT_MS = parseInt(process.env.RNFB_LAUNCH_APP_TIMEOUT_MS || '180000', 10);
const LAUNCH_APP_MAX_ATTEMPTS = parseInt(process.env.RNFB_LAUNCH_APP_MAX_ATTEMPTS || '2', 10);
const JET_RETRYABLE_WS_RE = /\[jet-ws\] RETRYABLE_DISCONNECT code=(1006|1001)\b/;
const JET_RECONNECT_RECOVERED_RE = /\[jet-ws\] reconnect_recovered code=(1006|1001)\b/;
const JET_SERVER_NOT_RUNNING_RE = /server wasn't running/i;
const JET_COVERAGE_LOST_RE = /Coverage summary:[\s\S]*?Unknown% \( 0\/0 \)/;
const RETRYABLE_LAUNCH_RE =
  /launchApp timed out|RCTJavaScriptDidFailToLoad|packager-probe|Metro not responding/i;

function resolveDetoxConfigurationName() {
  if (process.env.DETOX_CONFIGURATION) {
    return process.env.DETOX_CONFIGURATION;
  }

  if (typeof detox !== 'undefined' && detox?.config?.configurationName) {
    return detox.config.configurationName;
  }

  return '';
}

function resolveAppBinaryPath() {
  if (typeof detox === 'undefined' || !detox?.config?.apps) {
    return '';
  }

  const apps = detox.config.apps;
  const appConfig = apps.default || apps[Object.keys(apps)[0]];
  return appConfig?.binaryPath || '';
}

function usesLiveMetro() {
  const configName = resolveDetoxConfigurationName();
  if (/debug/i.test(configName)) {
    return true;
  }
  if (/release/i.test(configName)) {
    return false;
  }

  const binaryPath = resolveAppBinaryPath();
  if (/Debug-|app-debug/i.test(binaryPath)) {
    return true;
  }
  if (/Release-|app-release/i.test(binaryPath)) {
    return false;
  }

  return false;
}

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

function isRetryableJetSessionFailure(output) {
  if (JET_SERVER_NOT_RUNNING_RE.test(output)) {
    return true;
  }

  if (!JET_RECONNECT_RECOVERED_RE.test(output)) {
    return false;
  }

  return JET_COVERAGE_LOST_RE.test(output) || /\[🟥\] Stopped the server/i.test(output);
}

function isRetryableLaunchFailure(err) {
  const message = err?.message || '';
  if (!usesLiveMetro()) {
    return /launchApp timed out/i.test(message);
  }
  return RETRYABLE_LAUNCH_RE.test(message);
}

function isRetryableE2eFailure(err) {
  const jetOutput = err?.jetOutput || '';
  return (
    isRetryableJetDisconnect(jetOutput) ||
    isRetryableJetSessionFailure(jetOutput) ||
    isRetryableLaunchFailure(err)
  );
}

async function waitForMetro(port = METRO_PORT, timeoutMs = 120000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/status`);
      const body = await response.text();
      if (body.includes('packager-status:running')) {
        console.log(`[rnfb-e2e] Metro OK on 127.0.0.1:${port}`);
        return;
      }
      console.warn(
        `[rnfb-e2e] Metro 127.0.0.1:${port}/status returned unexpected body: ${body.slice(0, 120)}`,
      );
    } catch (_) {
      // Metro not ready yet; keep polling.
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error(
    `Metro not responding with packager-status:running on 127.0.0.1:${port} after ${timeoutMs}ms`,
  );
}

async function launchAppWithTimeout(launchArgs, timeoutMs = LAUNCH_APP_TIMEOUT_MS) {
  console.log(`[rnfb-e2e] launchApp starting (timeout=${timeoutMs}ms)`);
  let timer;

  try {
    await Promise.race([
      device.launchApp({
        newInstance: true,
        delete: true,
        launchArgs,
      }),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const err = new Error(
            `[rnfb-e2e] launchApp timed out after ${timeoutMs}ms — check simulator.log for ` +
              `[rnfb-lifecycle] packager-probe / RCTJavaScriptDidFailToLoad and Detox waitForActive`,
          );
          err.retryableLaunchFailure = true;
          reject(err);
        }, timeoutMs);
      }),
    ]);
    console.log('[rnfb-e2e] launchApp complete');
  } finally {
    clearTimeout(timer);
  }
}

async function launchAppWithRetry(launchArgs) {
  for (let launchAttempt = 1; launchAttempt <= LAUNCH_APP_MAX_ATTEMPTS; launchAttempt++) {
    try {
      if (launchAttempt > 1) {
        console.warn(
          `[rnfb-e2e] Retrying launchApp after Metro/bundle load failure (attempt ${launchAttempt}/${LAUNCH_APP_MAX_ATTEMPTS})`,
        );
        try {
          await device.terminateApp();
        } catch (_) {
          // No-op
        }
        if (usesLiveMetro()) {
          await waitForMetro(METRO_PORT);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await launchAppWithTimeout(launchArgs);
      return;
    } catch (err) {
      const retryable = launchAttempt < LAUNCH_APP_MAX_ATTEMPTS && isRetryableLaunchFailure(err);
      if (!retryable) {
        throw err;
      }
    }
  }
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
      if (usesLiveMetro()) {
        console.log(`[rnfb-e2e] Jet attempt ${attempt}: waiting for Metro on port ${METRO_PORT}`);
        await waitForMetro(METRO_PORT);
      } else {
        console.log(
          `[rnfb-e2e] Jet attempt ${attempt}: skipping Metro wait (configuration=${resolveDetoxConfigurationName() || 'unknown'}, binary=${resolveAppBinaryPath() || 'unknown'})`,
        );
      }
      console.log(`[rnfb-e2e] Jet attempt ${attempt}: launching app`);
      await launchAppWithRetry({
        detoxURLBlacklistRegex: `.*`,
        // Avoid sync/idling blocking the main queue while Detox WS login is pending.
        detoxEnableSynchronization: 'NO',
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

    let lastFailure;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (attempt > 1) {
          const lastOutput = lastFailure?.jetOutput || '';
          if (isRetryableJetDisconnect(lastOutput)) {
            console.warn('[rnfb-e2e] Retrying after transient Jet WS disconnect (1006/1001)');
          } else if (isRetryableJetSessionFailure(lastOutput)) {
            console.warn(
              '[rnfb-e2e] Retrying after Jet session desync (reconnect recovered / server not running)',
            );
          } else if (isRetryableLaunchFailure(lastFailure)) {
            console.warn('[rnfb-e2e] Retrying after Metro/bundle load launch failure');
          }
          try {
            await device.terminateApp();
          } catch (_) {
            // No-op
          }
        }

        await runJetE2eAttempt(attempt);
        break;
      } catch (err) {
        lastFailure = err;
        const jetOutput = err.jetOutput || '';
        const retryable = attempt === 1 && isRetryableE2eFailure(err);
        console.warn(
          `[rnfb-e2e] Jet attempt ${attempt} failed (retryable=${retryable}, exit=${err.jetExitCode ?? 'n/a'})`,
        );
        if (!retryable) {
          throw err;
        }
      }
    }

    if (platform === 'ios' && process.platform === 'darwin') {
      try {
        pullIosCoverage(deviceId, { testsDir });
      } catch (e) {
        throw new Error(`Failed to download native coverage data: ${e.message}`);
      }
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
