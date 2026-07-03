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

const { pullIosCoverage, pullAndroidCoverageWithRetry } = require('../scripts/pull-native-coverage');
const { recordE2eCloudMetricFromHost } = require('../../packages/app/e2e/cloud-metrics');

const E2E_TEST_PROJECT = 'react-native-firebase-testing';
const E2E_CLOUD_PRESSURE_LOG_FILTER = 'jsonPayload.message="[rnfb-e2e-metrics]"';
const E2E_CLOUD_PRESSURE_LOG_CONSOLE_URL = `https://console.cloud.google.com/logs/query;query=${encodeURIComponent(
  E2E_CLOUD_PRESSURE_LOG_FILTER,
)};storageScope=project;project=${E2E_TEST_PROJECT}`;
const E2E_CLOUD_PRESSURE_SUMMARY_CALLABLE = `https://us-central1-${E2E_TEST_PROJECT}.cloudfunctions.net/e2eCloudMetricsSummaryV2`;

function logCloudPressureAnalysisPointer(context) {
  console.warn(
    `[rnfb-e2e] cloud-pressure-analysis (${context}): retrospective pressure data is in Cloud Logging ` +
      `(project=${E2E_TEST_PROJECT}, filter ${E2E_CLOUD_PRESSURE_LOG_FILTER}) or via POST ` +
      `${E2E_CLOUD_PRESSURE_SUMMARY_CALLABLE} with {"data":{"lookbackHours":24}} — ` +
      `console: ${E2E_CLOUD_PRESSURE_LOG_CONSOLE_URL}`,
  );
}

const JET_REMOTE_PORT = parseInt(process.env.JET_REMOTE_PORT || '8090', 10);
const JET_CONTROL_PORT = parseInt(
  process.env.RNFB_JET_CONTROL_PORT || String(JET_REMOTE_PORT + 1),
  10,
);
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
const REBOOT_ANDROID_EMULATOR_TIMEOUT_MS = parseInt(
  process.env.RNFB_REBOOT_ANDROID_EMULATOR_TIMEOUT_MS || '300000',
  10,
);
const ANDROID_READY_MAX_LOAD = parseFloat(process.env.RNFB_ANDROID_READY_MAX_LOAD || '5');
const ANDROID_READY_LOAD_POLLS = parseInt(process.env.RNFB_ANDROID_READY_LOAD_POLLS || '3', 10);
const ANDROID_READY_POLL_MS = parseInt(process.env.RNFB_ANDROID_READY_POLL_MS || '2000', 10);
const ANDROID_PACKAGE_HANDLER_TIMEOUT_MS = parseInt(
  process.env.RNFB_ANDROID_PACKAGE_HANDLER_TIMEOUT_MS || '30000',
  10,
);
const ANDROID_BOOT_SETTLE_MS = parseInt(process.env.RNFB_ANDROID_BOOT_SETTLE_MS || '30000', 10);
const DRAIN_ORCHESTRATE_TIMEOUT_MS = parseInt(
  process.env.RNFB_DRAIN_ORCHESTRATE_TIMEOUT_MS || '30000',
  10,
);
const KILL_JET_FOR_LAUNCH_RETRY_TIMEOUT_MS = parseInt(
  process.env.RNFB_KILL_JET_LAUNCH_RETRY_TIMEOUT_MS || '30000',
  10,
);
const JET_RETRYABLE_WS_RE = /\[jet-ws\] RETRYABLE_DISCONNECT code=(1006|1001)\b/;
const JET_RECONNECT_RECOVERED_RE = /\[jet-ws\] reconnect_recovered code=(1006|1001)\b/;
const JET_SERVER_NOT_RUNNING_RE = /server wasn't running/i;
const JET_COVERAGE_LOST_RE = /Coverage summary:[\s\S]*?Unknown% \( 0\/0 \)/;
const JET_COVERAGE_TEARDOWN_RE =
  /Failed to send 'coverage-ready' message: WebSocket is closed|coverage upload timed out waiting for coverage-ack/i;
const JET_PROTOCOL_ERROR_RE = /\[🟥\] Unexpected end of JSON input/i;
const JET_NO_CLIENT_CONNECTED_RE = /Error: No client connected/i;
const RETRYABLE_CLOUD_QUOTA_RE =
  /installations\/token-error|Too many server requests|firebaseinstallations\.googleapis\.com|remoteConfig\/failure.*fetch\(\)|Failed to get installations token|\[remoteConfig\/unknown\].*installations/i;
const CLOUD_QUOTA_RETRY_COOLDOWN_MS = parseInt(
  process.env.RNFB_CLOUD_QUOTA_RETRY_COOLDOWN_MS || '90000',
  10,
);
const RETRYABLE_LAUNCH_RE =
  /launchApp timed out|RCTJavaScriptDidFailToLoad|packager-probe|Metro not responding|Unknown application display identifier|Simulator device failed to launch|unknown to FrontBoard|FBSOpenApplicationServiceErrorDomain/i;
const PORT_CLOSED_ERROR_CODES = new Set(['ECONNREFUSED', 'ECONNRESET', 'EPIPE']);

let cachedUsesLiveMetro;
let lastJetAttemptContext;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
  if (typeof detox !== 'undefined' && detox?.config?.apps) {
    const apps = detox.config.apps;
    const appConfig = apps.default || apps[Object.keys(apps)[0]];
    if (appConfig?.binaryPath) {
      return appConfig.binaryPath;
    }
  }

  const fs = require('node:fs');
  const debugIosApp = path.resolve(__dirname, '../ios/build/Build/Products/Debug-iphonesimulator/testing.app');
  if (fs.existsSync(debugIosApp)) {
    return debugIosApp;
  }
  const releaseIosApp = path.resolve(
    __dirname,
    '../ios/build/Build/Products/Release-iphonesimulator/testing.app',
  );
  if (fs.existsSync(releaseIosApp)) {
    return releaseIosApp;
  }

  return '';
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

function resolveAdbPath() {
  const sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  return sdkRoot ? path.join(sdkRoot, 'platform-tools', 'adb') : 'adb';
}

function resolveAndroidSerial() {
  try {
    if (typeof device !== 'undefined' && device?.id) {
      return device.id;
    }
  } catch (_) {
    // Detox device may not be ready yet.
  }
  return process.env.ANDROID_SERIAL || 'emulator-5554';
}

function adbShell(serial, command, timeoutMs = 15000) {
  const adb = resolveAdbPath();
  return execSync(`${adb} -s ${serial} shell ${command}`, {
    encoding: 'utf8',
    timeout: timeoutMs,
  }).trim();
}

function parseGuestLoad1Min(loadavgLine) {
  const first = loadavgLine.trim().split(/\s+/)[0];
  const load = parseFloat(first);
  return Number.isFinite(load) ? load : NaN;
}

function rebootAndroidEmulator() {
  const adb = resolveAdbPath();
  const serial = resolveAndroidSerial();
  console.warn(`[rnfb-e2e] Rebooting Android emulator serial=${serial} via adb reboot`);

  execSync(`${adb} -s ${serial} reboot`, { stdio: 'inherit' });
  execSync(`${adb} -s ${serial} wait-for-device`, {
    stdio: 'inherit',
    timeout: REBOOT_ANDROID_EMULATOR_TIMEOUT_MS,
  });
}

async function waitForAndroidEmulatorReady() {
  const serial = resolveAndroidSerial();
  const deadline = Date.now() + REBOOT_ANDROID_EMULATOR_TIMEOUT_MS;
  let stableLoadPolls = 0;
  let packageHandlerDone = false;
  let bootSettleDone = false;

  while (Date.now() < deadline) {
    try {
      const bootCompleted = adbShell(serial, 'getprop sys.boot_completed');
      const bootDev = adbShell(serial, 'getprop dev.bootcomplete');
      const provisioned = adbShell(serial, 'settings get global device_provisioned');
      adbShell(serial, 'echo ok', 5000);

      if (bootCompleted !== '1') {
        stableLoadPolls = 0;
        console.log(`[rnfb-e2e] android-ready probe boot_completed=${bootCompleted} (waiting)`);
        await sleep(ANDROID_READY_POLL_MS);
        continue;
      }

      if (bootDev !== '1') {
        stableLoadPolls = 0;
        console.log(`[rnfb-e2e] android-ready probe dev.bootcomplete=${bootDev} (waiting)`);
        await sleep(ANDROID_READY_POLL_MS);
        continue;
      }

      if (provisioned !== '1') {
        stableLoadPolls = 0;
        console.log(`[rnfb-e2e] android-ready probe provisioned=${provisioned} (waiting)`);
        await sleep(ANDROID_READY_POLL_MS);
        continue;
      }

      if (!packageHandlerDone) {
        console.log('[rnfb-e2e] android-ready probe waiting for package handler queue...');
        try {
          adbShell(
            serial,
            `cmd package wait-for-handler --timeout ${ANDROID_PACKAGE_HANDLER_TIMEOUT_MS}`,
            ANDROID_PACKAGE_HANDLER_TIMEOUT_MS + 5000,
          );
          packageHandlerDone = true;
          console.log('[rnfb-e2e] android-ready probe package handler ready');
        } catch (err) {
          console.warn(`[rnfb-e2e] android-ready package handler wait: ${err?.message || err}`);
          await sleep(ANDROID_READY_POLL_MS);
          continue;
        }
      }

      if (!bootSettleDone) {
        console.log(
          `[rnfb-e2e] android-ready boot complete; settling ${ANDROID_BOOT_SETTLE_MS}ms before load polling`,
        );
        await sleep(ANDROID_BOOT_SETTLE_MS);
        bootSettleDone = true;
        stableLoadPolls = 0;
      }

      const loadLine = adbShell(serial, 'cat /proc/loadavg');
      const load1 = parseGuestLoad1Min(loadLine);
      if (!Number.isFinite(load1) || load1 >= ANDROID_READY_MAX_LOAD) {
        stableLoadPolls = 0;
        console.log(
          `[rnfb-e2e] android-ready probe load1=${load1} max=${ANDROID_READY_MAX_LOAD} loadavg="${loadLine.trim()}" (waiting)`,
        );
        await sleep(ANDROID_READY_POLL_MS);
        continue;
      }

      stableLoadPolls += 1;
      console.log(
        `[rnfb-e2e] android-ready probe load1=${load1} stable=${stableLoadPolls}/${ANDROID_READY_LOAD_POLLS} boot=1 provisioned=1`,
      );
      if (stableLoadPolls >= ANDROID_READY_LOAD_POLLS) {
        console.log(`[rnfb-e2e] Android emulator ready serial=${serial}`);
        return;
      }
      await sleep(ANDROID_READY_POLL_MS);
    } catch (err) {
      stableLoadPolls = 0;
      console.warn(`[rnfb-e2e] android-ready probe: ${err?.message || err}`);
      await sleep(ANDROID_READY_POLL_MS);
    }
  }

  throw new Error(
    `Android emulator did not become ready within ${REBOOT_ANDROID_EMULATOR_TIMEOUT_MS}ms (serial=${serial})`,
  );
}

async function drainJetAttempt(platform) {
  const ctx = lastJetAttemptContext;
  console.warn('[rnfb-e2e] Draining Jet attempt before outer retry...');

  if (platform === 'android') {
    const adb = resolveAdbPath();
    const serial = resolveAndroidSerial();
    try {
      await device.terminateApp();
    } catch (_) {
      // Detox may already be disconnected.
    }
    try {
      execSync(`${adb} -s ${serial} shell am force-stop com.invertase.testing`, {
        stdio: 'inherit',
        timeout: 15000,
      });
      execSync(`${adb} -s ${serial} shell am force-stop com.invertase.testing.test`, {
        stdio: 'inherit',
        timeout: 15000,
      });
    } catch (err) {
      console.warn(`[rnfb-e2e] force-stop during drain: ${err?.message || err}`);
    }
  } else {
    try {
      await device.terminateApp();
    } catch (_) {
      // No-op
    }
  }

  if (ctx?.orchestratePromise) {
    await Promise.race([
      ctx.orchestratePromise.catch(() => {}),
      sleep(DRAIN_ORCHESTRATE_TIMEOUT_MS).then(() => {
        console.warn(
          `[rnfb-e2e] drain orchestrate timed out after ${DRAIN_ORCHESTRATE_TIMEOUT_MS}ms`,
        );
      }),
    ]);
  }

  if (ctx?.jetProcess && !ctx.jetProcess.killed) {
    ctx.jetProcess.kill('SIGTERM');
    await sleep(500);
    if (!ctx.jetProcess.killed) {
      ctx.jetProcess.kill('SIGKILL');
    }
  }

  await waitForTcpPortClosed(JET_REMOTE_PORT);

  if (platform === 'android') {
    const adb = resolveAdbPath();
    const serial = resolveAndroidSerial();

    const instrumentationDeadline = Date.now() + 30000;
    while (Date.now() < instrumentationDeadline) {
      try {
        const pid = adbShell(serial, 'pidof com.invertase.testing.test', 5000);
        if (!pid) {
          break;
        }
        console.log(`[rnfb-e2e] drain waiting for instrumentation pid=${pid}`);
      } catch (_) {
        break;
      }
      await sleep(1000);
    }
  }

  console.log('[rnfb-e2e] Jet attempt drain complete');
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

  if (JET_PROTOCOL_ERROR_RE.test(output)) {
    return true;
  }

  if (JET_NO_CLIENT_CONNECTED_RE.test(output)) {
    return true;
  }

  if (!JET_RECONNECT_RECOVERED_RE.test(output)) {
    return false;
  }

  return JET_COVERAGE_LOST_RE.test(output) || /\[🟥\] Stopped the server/i.test(output);
}

function isRetryableCloudQuotaFailure(jetOutput) {
  return RETRYABLE_CLOUD_QUOTA_RE.test(jetOutput);
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
    isRetryableCloudQuotaFailure(jetOutput) ||
    isRetryableLaunchFailure(err)
  );
}

function logRetryEligibility(err, attempt) {
  const jetOutput = err?.jetOutput || '';
  const checks = {
    jetDisconnect: isRetryableJetDisconnect(jetOutput),
    jetSession: isRetryableJetSessionFailure(jetOutput),
    jetProtocol: JET_PROTOCOL_ERROR_RE.test(jetOutput),
    jetNoClient: JET_NO_CLIENT_CONNECTED_RE.test(jetOutput),
    coverageTeardown: JET_COVERAGE_TEARDOWN_RE.test(jetOutput),
    cloudQuota: isRetryableCloudQuotaFailure(jetOutput),
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
            `[rnfb-e2e] launchApp timed out after ${effectiveTimeout}ms — check sim-app.log for ` +
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

async function postJetControl(path, body) {
  const url = `http://127.0.0.1:${JET_CONTROL_PORT}${path}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      console.warn(`[rnfb-e2e] jet-control POST ${path} status=${response.status}`);
    }
  } catch (err) {
    console.warn(`[rnfb-e2e] jet-control POST ${path} failed: ${err?.message || err}`);
  }
}

function logOrchestrateState(state) {
  console.log(`[rnfb-e2e] orchestrate-state=${state} ts=${new Date().toISOString()}`);
  postJetControl('/orchestrate-state', { phase: state });
}

async function signalJetLaunchReady() {
  console.log('[rnfb-e2e] signaling Jet launch-ready (permit test run)');
  await postJetControl('/launch-ready', {});
}

async function killJetForLaunchRetry(jetProcess) {
  if (!jetProcess || jetProcess.killed) {
    return;
  }

  logOrchestrateState('launch-retry-kill-jet');
  console.warn('[rnfb-e2e] launch-retry: killing Jet before terminateApp/reboot');
  jetProcess.kill('SIGTERM');
  await sleep(500);
  if (!jetProcess.killed) {
    jetProcess.kill('SIGKILL');
  }

  try {
    await waitForTcpPortClosed(JET_REMOTE_PORT, '127.0.0.1', KILL_JET_FOR_LAUNCH_RETRY_TIMEOUT_MS);
  } catch (err) {
    console.warn(`[rnfb-e2e] launch-retry: Jet port still open after kill: ${err?.message || err}`);
  }
}

async function launchAppWithRetry(launchArgs, { testsDir, onBeforeRelaunch } = {}) {
  const liveMetro = usesLiveMetro();

  for (let launchAttempt = 1; launchAttempt <= LAUNCH_APP_MAX_ATTEMPTS; launchAttempt++) {
    try {
      if (launchAttempt > 1) {
        console.warn(
          `[rnfb-e2e] Retrying launchApp after launch failure (attempt ${launchAttempt}/${LAUNCH_APP_MAX_ATTEMPTS}) liveMetro=${liveMetro}`,
        );
        if (onBeforeRelaunch) {
          await onBeforeRelaunch();
        }
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

function createJetSession(jetArgs, testsDir) {
  let output = '';
  let jetProcess;
  let ignoreExit = false;
  let resolveExit;
  let rejectExit;

  const exitPromise = new Promise((resolve, reject) => {
    resolveExit = resolve;
    rejectExit = reject;
  });

  const bindProcess = proc => {
    jetProcess = proc;
    proc.stdout.on('data', chunk => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });
    proc.stderr.on('data', chunk => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });
    proc.on('error', err => {
      if (ignoreExit) {
        console.warn(`[rnfb-e2e] ignoring Jet error during launch-retry: ${err?.message || err}`);
        return;
      }
      err.jetOutput = output;
      rejectExit(err);
    });
    proc.on('close', code => {
      if (ignoreExit) {
        console.warn(`[rnfb-e2e] ignoring Jet exit code=${code} during launch-retry`);
        return;
      }
      if (code !== 0) {
        const err = new Error('Jet tests failed!');
        err.jetOutput = output;
        err.jetExitCode = code;
        rejectExit(err);
        return;
      }
      resolveExit({ output });
    });
  };

  const spawnJet = () => {
    const proc = spawn('yarn', jetArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      cwd: testsDir,
      env: {
        ...process.env,
        RNFB_JET_DEFER_RUN: '1',
      },
    });
    bindProcess(proc);
    return proc;
  };

  spawnJet();

  return {
    get process() {
      return jetProcess;
    },
    get output() {
      return output;
    },
    exitPromise,
    async respawnAfterLaunchRetry() {
      ignoreExit = true;
      try {
        await killJetForLaunchRetry(jetProcess);
        output += '\n[rnfb-e2e] --- jet respawn after launch retry ---\n';
        spawnJet();
        await waitForTcpPort(JET_REMOTE_PORT);
        logOrchestrateState('launch-retry-jet-respawned');
      } finally {
        ignoreExit = false;
      }
    },
  };
}

function runJetE2eAttempt(attempt) {
  cachedUsesLiveMetro = undefined;
  cacheUsesLiveMetro();

  const platform = detox.device.getPlatform();
  const testsDir = path.resolve(__dirname, '..');
  const jetArgs =
    process.platform === 'win32'
      ? ['jet', `--target=${platform}`]
      : ['jet', `--target=${platform}`, '--coverage'];

  const jetSession = createJetSession(jetArgs, testsDir);

  const orchestrate = async () => {
    logOrchestrateState('jet-spawned');
    console.log(`[rnfb-e2e] Jet attempt ${attempt}: waiting for port ${JET_REMOTE_PORT}`);
    logOrchestrateState('port-wait');
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
    logOrchestrateState('launch-pending');
    await launchAppWithRetry(
      {
        detoxURLBlacklistRegex: `.*`,
        // Avoid sync/idling blocking the main queue while Detox WS login is pending.
        detoxEnableSynchronization: 'NO',
      },
      {
        testsDir,
        onBeforeRelaunch: async () => {
          await jetSession.respawnAfterLaunchRetry();
        },
      },
    );
    logOrchestrateState('launch-ok');
    await signalJetLaunchReady();
    logOrchestrateState('tests-run-permitted');
  };

  const orchestratePromise = orchestrate();
  lastJetAttemptContext = { jetProcess: jetSession.process, orchestratePromise };

  return Promise.race([
    orchestratePromise
      .then(() => {
        logOrchestrateState('awaiting-jet-exit');
        return jetSession.exitPromise;
      })
      .catch(err => {
        logOrchestrateState('orchestrate-failed');
        if (!jetSession.process.killed) {
          jetSession.process.kill();
        }
        err.jetOutput = jetSession.output;
        throw err;
      }),
    jetSession.exitPromise.catch(err => {
      logOrchestrateState('jet-exited');
      err.jetOutput = jetSession.output;
      throw err;
    }),
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
        if (attempt === 1 && platform === 'android') {
          console.warn('[rnfb-e2e] Waiting for Android emulator ready before first Jet attempt');
          await waitForAndroidEmulatorReady();
        }

        if (attempt > 1) {
          const lastOutput = lastFailure?.jetOutput || '';
          if (isRetryableJetDisconnect(lastOutput)) {
            console.warn('[rnfb-e2e] Retrying after transient Jet WS disconnect (1006/1001)');
          } else if (isRetryableJetSessionFailure(lastOutput)) {
            if (JET_PROTOCOL_ERROR_RE.test(lastOutput)) {
              console.warn('[rnfb-e2e] Retrying after Jet protocol error (JSON/WS desync)');
            } else if (JET_NO_CLIENT_CONNECTED_RE.test(lastOutput)) {
              console.warn('[rnfb-e2e] Retrying after Jet reconnect send race (No client connected)');
            } else {
              console.warn(
                '[rnfb-e2e] Retrying after Jet session desync (reconnect recovered / coverage teardown / server not running)',
              );
            }
          } else if (isRetryableLaunchFailure(lastFailure)) {
            console.warn('[rnfb-e2e] Retrying after launch failure (Metro/bundle/FrontBoard)');
          } else if (isRetryableCloudQuotaFailure(lastOutput)) {
            console.warn(
              `[rnfb-e2e] Retrying after cloud quota pressure; cooling down ${CLOUD_QUOTA_RETRY_COOLDOWN_MS}ms`,
            );
            logCloudPressureAnalysisPointer('jet-retry');
            await sleep(CLOUD_QUOTA_RETRY_COOLDOWN_MS);
          }
          await drainJetAttempt(platform);
          if (platform === 'ios' && process.platform === 'darwin') {
            await rebootIosSimulator(testsDir);
          } else if (platform === 'android') {
            rebootAndroidEmulator();
            await waitForAndroidEmulatorReady();
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
        if (isRetryableCloudQuotaFailure(err?.jetOutput || '')) {
          await recordE2eCloudMetricFromHost({
            category: 'cloud-quota',
            event: 'jet-failure',
            attempt,
            error: String(err?.message || err),
            metadata: {
              jetExitCode: err?.jetExitCode ?? null,
            },
          });
          logCloudPressureAnalysisPointer('jet-failure-recorded');
        }
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
    } else if (platform === 'android') {
      const pulled = await pullAndroidCoverageWithRetry(deviceId, {
        softFail: true,
        testsDir,
        retries: 5,
        intervalMs: 1000,
      });
      if (!pulled) {
        console.warn(
          '[native-coverage] Android .ec not pulled on Jet close; post-e2e will retry',
        );
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
