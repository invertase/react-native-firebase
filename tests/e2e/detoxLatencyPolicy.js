'use strict';

/**
 * Detox / Jet launch timeouts that tolerate CI-like and 9-way host latency.
 * Status-query 5000ms and 2× launchApp retries flake under load; wait longer
 * and retry instead of serializing Android or shrinking concurrency.
 *
 * Detox CurrentStatus / Login timeouts live in the yarn patch on
 * tests/node_modules/detox (see okf-bundle/ci-workflows/detox-patches.md).
 * This module owns the RNFB-side defaults and is the unit-test contract.
 */
function intEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Detox CurrentStatus / Cleanup message timeout (Detox default 5000). */
function statusQueryTimeoutMs() {
  return intEnv('RNFB_DETOX_STATUS_QUERY_TIMEOUT_MS', 30000);
}

/** Detox Login message timeout (Detox default 1000). */
function loginTimeoutMs() {
  return intEnv('RNFB_DETOX_LOGIN_TIMEOUT_MS', 15000);
}

/** session.debugSynchronization — delay before Detox polls currentStatus. */
function debugSynchronizationMs() {
  return intEnv('RNFB_DETOX_DEBUG_SYNCHRONIZATION_MS', 30000);
}

function launchAppTimeoutMs() {
  return intEnv('RNFB_LAUNCH_APP_TIMEOUT_MS', 300000);
}

function launchAppMaxAttempts() {
  return intEnv('RNFB_LAUNCH_APP_MAX_ATTEMPTS', 4);
}

function androidAdbSerialAppearTimeoutMs() {
  return intEnv('RNFB_ANDROID_ADB_SERIAL_APPEAR_TIMEOUT_MS', 90000);
}

/**
 * Detox ADB `pm install` spawn timeout (Detox default 60000).
 * Same latency class as status 30s / launchApp 300s — under 9-way load install
 * often exceeds 60s and Detox hard-kills with SIGTERM.
 */
function androidAdbInstallTimeoutMs() {
  return intEnv('RNFB_ANDROID_ADB_INSTALL_TIMEOUT_MS', 300000);
}

/** Max wait after launch-ready for Jet exit (successful cells ~8–10m; must not sit 3600000ms). */
function jetAwaitExitStallTimeoutMs() {
  return intEnv('RNFB_JET_AWAIT_EXIT_STALL_MS', 1200000);
}

module.exports = {
  statusQueryTimeoutMs,
  loginTimeoutMs,
  debugSynchronizationMs,
  launchAppTimeoutMs,
  launchAppMaxAttempts,
  androidAdbSerialAppearTimeoutMs,
  androidAdbInstallTimeoutMs,
  jetAwaitExitStallTimeoutMs,
};
