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
const { execSync, spawn } = require('child_process');
const net = require('net');
const path = require('path');

const { pullIosCoverage } = require('../scripts/pull-native-coverage');

const JET_REMOTE_PORT = parseInt(process.env.JET_REMOTE_PORT || '8090', 10);
const METRO_PORT = parseInt(process.env.JET_METRO_PORT || process.env.RCT_METRO_PORT || '8081', 10);
const LAUNCH_APP_TIMEOUT_MS = parseInt(process.env.RNFB_LAUNCH_APP_TIMEOUT_MS || '180000', 10);
const LAUNCH_APP_RELEASE_TIMEOUT_MS = parseInt(
  process.env.RNFB_LAUNCH_APP_RELEASE_TIMEOUT_MS || '120000',
  10,
);
const LAUNCH_APP_MAX_ATTEMPTS = parseInt(process.env.RNFB_LAUNCH_APP_MAX_ATTEMPTS || '2', 10);
const SLOW_TERMINATE_MS = parseInt(process.env.RNFB_SLOW_TERMINATE_MS || '10000', 10);
const REBOOT_IOS_SIMULATOR_TIMEOUT_MS = parseInt(
  process.env.RNFB_REBOOT_IOS_SIMULATOR_TIMEOUT_MS || String(12 * 60 * 1000),
  10,
);
const JET_RETRYABLE_WS_RE = /\[jet-ws\] RETRYABLE_DISCONNECT code=(1006|1001)\b/;
const JET_RECONNECT_RECOVERED_RE = /\[jet-ws\] reconnect_recovered code=(1006|1001)\b/;
const JET_SERVER_NOT_RUNNING_RE = /server wasn't running/i;
const JET_COVERAGE_LOST_RE = /Coverage summary:[\s\S]*?Unknown% \( 0\/0 \)/;
const JET_COVERAGE_TEARDOWN_RE =
  /Failed to send 'coverage-ready' message: WebSocket is closed|coverage upload timed out waiting for coverage-ack/i;
const RETRYABLE_LAUNCH_RE =
  /launchApp timed out|RCTJavaScriptDidFailToLoad|packager-probe|Metro not responding|Unknown application display identifier|Simulator device failed to launch|unknown to FrontBoard|FBSOpenApplicationServiceErrorDomain/i;
const PORT_CLOSED_ERROR_CODES = new Set(['ECONNREFUSED', 'ECONNRESET', 'EPIPE']);

let cachedUsesLiveMetro;

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
  if (cachedUsesLiveMetro !== undefined) {
    return cachedUsesLiveMetro;
  }

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

function cacheUsesLiveMetro() {
  cachedUsesLiveMetro = usesLiveMetro();
  console.log(`[rnfb-e2e] cached usesLiveMetro=${cachedUsesLiveMetro}`);
}

function resolveIosSimulatorUdid() {
  try {
    if (typeof device !== 'undefined' && device?.id) {
      return device.id;
    }
  } catch (_) {
    // Detox device may not be ready yet.
  }
  return '';
}

function logLaunchInstallState(label) {
  const udid = resolveIosSimulatorUdid();
  if (!udid || process.platform !== 'darwin') {
    console.log(`[rnfb-e2e] install-state label=${label} udid=unknown skipped=non-darwin-or-no-udid`);
    return;
  }

  try {
    const container = execSync(
      `/usr/bin/xcrun simctl get_app_container ${udid} com.invertase.testing 2>&1`,
      { encoding: 'utf8', timeout: 15000 },
    ).trim();
    console.log(`[rnfb-e2e] install-state label=${label} udid=${udid} container=${container}`);
  } catch (err) {
    const detail = err?.stdout?.toString?.() || err?.message || String(err);
    console.warn(`[rnfb-e2e] install-state label=${label} udid=${udid} container=missing detail=${detail}`);
  }

  try {
    const apps = execSync(`/usr/bin/xcrun simctl listapps ${udid} 2>/dev/null`, {
      encoding: 'utf8',
      timeout: 30000,
    });
    const invertaseLine =
      apps
        .split('\n')
        .find(line => line.includes('com.invertase.testing')) || '(not listed)';
    console.log(`[rnfb-e2e] install-state label=${label} listapps=${invertaseLine.trim()}`);
  } catch (err) {
    console.warn(
      `[rnfb-e2e] install-state label=${label} listapps=error detail=${err?.message || err}`,
    );
  }
}

function rebootIosSimulator(testsDir) {
  return new Promise((resolve, reject) => {
    const repoRoot = path.resolve(testsDir, '..');
    const bootScript = path.join(repoRoot, '.github/workflows/scripts/boot-simulator.sh');
    console.warn(`[rnfb-e2e] Rebooting iOS simulator via ${bootScript}`);
    const child = spawn('bash', [bootScript], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`boot-simulator.sh timed out after ${REBOOT_IOS_SIMULATOR_TIMEOUT_MS}ms`));
    }, REBOOT_IOS_SIMULATOR_TIMEOUT_MS);

    child.on('close', code => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`boot-simulator.sh failed with code ${code}`));
    });
    child.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
  });
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

function waitForTcpPortClosed(port, host = '127.0.0.1', timeoutMs = 120000) {
  const start = Date.now();
  let probes = 0;

  return new Promise((resolve, reject) => {
    const probe = () => {
      if (Date.now() - start > timeoutMs) {
        reject(
          new Error(
            `Timed out waiting for ${host}:${port} to close after ${timeoutMs}ms (probes=${probes})`,
          ),
        );
        return;
      }

      probes += 1;
      const socket = net.connect(port, host);
      socket.once('connect', () => {
        socket.end();
        setTimeout(probe, 250);
      });
      socket.once('error', err => {
        socket.destroy();
        const elapsedMs = Date.now() - start;
        const code = err?.code || 'UNKNOWN';
        if (PORT_CLOSED_ERROR_CODES.has(code)) {
          console.log(
            `[rnfb-e2e] port ${host}:${port} closed (code=${code}, elapsed=${elapsedMs}ms, probes=${probes})`,
          );
          resolve();
          return;
        }
        console.warn(
          `[rnfb-e2e] port-probe non-close error code=${code} host=${host} port=${port} probe=${probes}`,
        );
        setTimeout(probe, 250);
      });
    };

    probe();
  });
}

function isRetryableJetDisconnect(output) {
  return JET_RETRYABLE_WS_RE.test(output);
}

function isRetryableJetSessionFailure(output) {
  if (JET_SERVER_NOT_RUNNING_RE.test(output)) {
    return true;
  }

  if (JET_COVERAGE_TEARDOWN_RE.test(output)) {
    return true;
  }

  if (!JET_RECONNECT_RECOVERED_RE.test(output)) {
    return false;
  }

  return JET_COVERAGE_LOST_RE.test(output) || /\[🟥\] Stopped the server/i.test(output);
}

function isRetryableLaunchFailure(err) {
  const message = err?.message || '';
  if (err?.retryableAtJetLevel) {
    return true;
  }
  if (!usesLiveMetro()) {
    return (
      /launchApp timed out/i.test(message) ||
      RETRYABLE_LAUNCH_RE.test(message) ||
      /FrontBoard|unknown to FrontBoard|FBSOpenApplication/i.test(message)
    );
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

function logRetryEligibility(err, attempt) {
  const jetOutput = err?.jetOutput || '';
  const checks = {
    jetDisconnect: isRetryableJetDisconnect(jetOutput),
    jetSession: isRetryableJetSessionFailure(jetOutput),
    coverageTeardown: JET_COVERAGE_TEARDOWN_RE.test(jetOutput),
    launchFailure: isRetryableLaunchFailure(err),
    launchJetLevel: Boolean(err?.retryableAtJetLevel),
  };
  console.warn(
    `[rnfb-e2e] retry-eligibility attempt=${attempt} retryable=${attempt === 1 && isRetryableE2eFailure(err)} checks=${JSON.stringify(checks)}`,
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

async function terminateAppWithTiming(label) {
  const start = Date.now();
  try {
    await device.terminateApp();
    const elapsedMs = Date.now() - start;
    console.log(`[rnfb-e2e] terminateApp label=${label} elapsed=${elapsedMs}ms`);
    return elapsedMs;
  } catch (err) {
    const elapsedMs = Date.now() - start;
    console.warn(
      `[rnfb-e2e] terminateApp label=${label} elapsed=${elapsedMs}ms error=${err?.message || err}`,
    );
    return elapsedMs;
  }
}

async function launchAppWithTimeout(launchArgs, { deleteApp = true, timeoutMs } = {}) {
  const effectiveTimeout = timeoutMs ?? (usesLiveMetro() ? LAUNCH_APP_TIMEOUT_MS : LAUNCH_APP_RELEASE_TIMEOUT_MS);
  console.log(
    `[rnfb-e2e] launchApp starting timeout=${effectiveTimeout}ms delete=${deleteApp} liveMetro=${usesLiveMetro()}`,
  );
  logLaunchInstallState(`before-launch delete=${deleteApp}`);
  let timer;

  try {
    await Promise.race([
      device.launchApp({
        newInstance: true,
        delete: deleteApp,
        launchArgs,
      }),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const err = new Error(
            `[rnfb-e2e] launchApp timed out after ${effectiveTimeout}ms — check simulator.log for ` +
              `[rnfb-lifecycle] packager-probe / RCTJavaScriptDidFailToLoad and Detox waitForActive`,
          );
          err.retryableLaunchFailure = true;
          reject(err);
        }, effectiveTimeout);
      }),
    ]);
    console.log('[rnfb-e2e] launchApp complete');
    logLaunchInstallState('after-launch-success');
  } finally {
    clearTimeout(timer);
  }
}

async function launchAppWithRetry(launchArgs, { testsDir } = {}) {
  const liveMetro = usesLiveMetro();

  for (let launchAttempt = 1; launchAttempt <= LAUNCH_APP_MAX_ATTEMPTS; launchAttempt++) {
    try {
      if (launchAttempt > 1) {
        console.warn(
          `[rnfb-e2e] Retrying launchApp after launch failure (attempt ${launchAttempt}/${LAUNCH_APP_MAX_ATTEMPTS}) liveMetro=${liveMetro}`,
        );
        const terminateMs = await terminateAppWithTiming(`retry-${launchAttempt}`);
        if (terminateMs >= SLOW_TERMINATE_MS && testsDir && process.platform === 'darwin') {
          console.warn(
            `[rnfb-e2e] slow terminate (${terminateMs}ms >= ${SLOW_TERMINATE_MS}ms) — rebooting simulator before relaunch`,
          );
          await rebootIosSimulator(testsDir);
        }
        if (liveMetro) {
          await waitForMetro(METRO_PORT);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await launchAppWithTimeout(launchArgs, {
        deleteApp: launchAttempt === 1,
      });
      return;
    } catch (err) {
      console.warn(`[rnfb-e2e] launchApp failure reason=${err?.message || err}`);
      logLaunchInstallState(`after-launch-failure attempt=${launchAttempt}`);
      const innerRetryable =
        launchAttempt < LAUNCH_APP_MAX_ATTEMPTS && isRetryableLaunchFailure(err);
      if (!innerRetryable) {
        err.retryableAtJetLevel = isRetryableLaunchFailure(err);
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

  const exitPromise = new Promise((resolve, reject) => {
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
  });

  const orchestrate = async () => {
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
    await launchAppWithRetry(
      {
        detoxURLBlacklistRegex: `.*`,
        // Avoid sync/idling blocking the main queue while Detox WS login is pending.
        detoxEnableSynchronization: 'NO',
      },
      { testsDir },
    );
  };

  return Promise.race([
    orchestrate()
      .then(() => exitPromise)
      .catch(err => {
        jetProcess.kill();
        err.jetOutput = output;
        throw err;
      }),
    exitPromise,
  ]);
}

describe('Jet Tests', function () {
  jest.retryTimes(0, { logErrorsBeforeRetry: true });

  it('runs all tests', async function () {
    const platform = detox.device.getPlatform();
    const deviceId = detox.device.id;
    const testsDir = path.resolve(__dirname, '..');

    cacheUsesLiveMetro();

    let lastFailure;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (attempt > 1) {
          const lastOutput = lastFailure?.jetOutput || '';
          if (isRetryableJetDisconnect(lastOutput)) {
            console.warn('[rnfb-e2e] Retrying after transient Jet WS disconnect (1006/1001)');
          } else if (isRetryableJetSessionFailure(lastOutput)) {
            console.warn(
              '[rnfb-e2e] Retrying after Jet session desync (reconnect recovered / coverage teardown / server not running)',
            );
          } else if (isRetryableLaunchFailure(lastFailure)) {
            console.warn('[rnfb-e2e] Retrying after launch failure (Metro/bundle/FrontBoard)');
          }
          console.log(
            `[rnfb-e2e] Jet attempt ${attempt}: waiting for port ${JET_REMOTE_PORT} to close before retry`,
          );
          await waitForTcpPortClosed(JET_REMOTE_PORT);
          if (platform === 'ios' && process.platform === 'darwin') {
            await rebootIosSimulator(testsDir);
          } else {
            try {
              await device.terminateApp();
            } catch (_) {
              // No-op
            }
          }
        }

        await runJetE2eAttempt(attempt);
        break;
      } catch (err) {
        lastFailure = err;
        logRetryEligibility(err, attempt);
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
