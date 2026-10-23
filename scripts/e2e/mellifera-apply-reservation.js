#!/usr/bin/env node
/**
 * Bind a mellifera spill/desk slot grant to RNFB_* env files.
 *
 * Mellifera session `env` is always {} (Mlf-AD-9). This helper reads `placement`
 * and `slot` from the requester result and runs
 * `export-slot-env <platform> N` once per platform subprocess (android, ios, macos).
 * yarn tests:e2e:check / release read RNFB_* only — not the reservation JSON /
 * ports file.
 *
 * usage: mellifera-apply-reservation.js <reserve-json> <env-file> [ports-file]
 * CLI --env-file passes ports-file as tests/mellifera.env.json under cwd.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const EXPORT_SLOT_ENV = path.join(SCRIPT_DIR, 'export-slot-env.sh');

const PLATFORMS = ['android', 'ios', 'macos'];

/** Keys emitted by e2e_slot_env_print (carry-in + process-local). */
const ENV_KEYS = [
  'RNFB_E2E_SLOT',
  'RNFB_E2E_HOST_SLOT',
  'RNFB_E2E_DEBUG',
  'RCT_METRO_PORT',
  'RNFB_METRO_PORT',
  'JET_METRO_PORT',
  'JET_REMOTE_PORT',
  'RNFB_JET_CONTROL_PORT',
  'RNFB_ANDROID_METRO_PORT',
  'RNFB_ANDROID_JET_PORT',
  'RNFB_ANDROID_JET_CONTROL_PORT',
  'RNFB_ANDROID_EMULATOR_FIRESTORE_PORT',
  'RNFB_ANDROID_EMULATOR_AUTH_PORT',
  'RNFB_ANDROID_EMULATOR_DATABASE_PORT',
  'RNFB_ANDROID_EMULATOR_FUNCTIONS_PORT',
  'RNFB_ANDROID_EMULATOR_STORAGE_PORT',
  'RNFB_ANDROID_EMULATOR_HUB_PORT',
  'RNFB_ANDROID_EMULATOR_LOGGING_PORT',
  'RNFB_IOS_METRO_PORT',
  'RNFB_IOS_JET_PORT',
  'RNFB_IOS_JET_CONTROL_PORT',
  'RNFB_IOS_EMULATOR_FIRESTORE_PORT',
  'RNFB_IOS_EMULATOR_AUTH_PORT',
  'RNFB_IOS_EMULATOR_DATABASE_PORT',
  'RNFB_IOS_EMULATOR_FUNCTIONS_PORT',
  'RNFB_IOS_EMULATOR_STORAGE_PORT',
  'RNFB_IOS_EMULATOR_HUB_PORT',
  'RNFB_IOS_EMULATOR_LOGGING_PORT',
  'RNFB_MACOS_METRO_PORT',
  'RNFB_MACOS_JET_PORT',
  'RNFB_MACOS_JET_CONTROL_PORT',
  'RNFB_MACOS_EMULATOR_FIRESTORE_PORT',
  'RNFB_MACOS_EMULATOR_AUTH_PORT',
  'RNFB_MACOS_EMULATOR_DATABASE_PORT',
  'RNFB_MACOS_EMULATOR_FUNCTIONS_PORT',
  'RNFB_MACOS_EMULATOR_STORAGE_PORT',
  'RNFB_MACOS_EMULATOR_HUB_PORT',
  'RNFB_MACOS_EMULATOR_LOGGING_PORT',
  'RNFB_DETOX_ANDROID_CONFIG',
  'RNFB_ANDROID_AVD',
  'RNFB_ANDROID_AVD_NAME',
  'RNFB_ANDROID_CONSOLE_PORT',
  'ANDROID_SERIAL',
  'RNFB_DETOX_IOS_CONFIG',
  'RNFB_IOS_SIMULATOR',
  'RNFB_IOS_SIM_RUNTIME',
  'RNFB_MACOS_PRODUCT_NAME',
  'RNFB_MACOS_BUNDLE_IDENTIFIER',
  'RNFB_E2E_PLATFORM',
  'AVD_NAME',
  'SIMCTL_CHILD_RCT_METRO_PORT',
  'ORG_GRADLE_PROJECT_reactNativeDevServerPort',
];

function usage() {
  console.error('usage: mellifera-apply-reservation.js <reserve-json> <env-file> [ports-file]');
  process.exit(1);
}

/**
 * Desk spill/local grant: placement "slot" + integer slot index.
 * Rejects placement "host" / slot 0 host grants and scaler unitId substitutes.
 */
function resolveDeskSlot(reserve) {
  const placement = reserve.placement;
  const slot = reserve.slot;
  if (placement !== 'slot') {
    throw new Error(
      `mellifera-apply-reservation requires placement "slot" with a desk slot index; ` +
        `got placement=${JSON.stringify(placement)} slot=${JSON.stringify(slot)} ` +
        `(host/scaler grants are not export-slot-env binds; do not use unitId)`,
    );
  }
  if (typeof slot !== 'number' || !Number.isInteger(slot)) {
    throw new Error(
      `mellifera-apply-reservation requires integer slot from the requester result; got ${JSON.stringify(slot)}`,
    );
  }
  return slot;
}

/**
 * Run export-slot-env <platform> N once and capture the resulting env object.
 * Eval of the printed exports matches a platform subprocess after
 * `eval "$(yarn tests:e2e:export-slot-env …)"`.
 */
function captureExportSlotEnv(platform, slot) {
  // One-line -e dump: keys arrive via env to avoid bash/JSON newline escaping issues.
  const nodeDump =
    'const keys=JSON.parse(process.env.RNFB_DUMP_KEYS);const out={};' +
    'for (const k of keys){if (Object.prototype.hasOwnProperty.call(process.env,k)) out[k]=process.env[k];}' +
    'process.stdout.write(JSON.stringify(out));';
  const bash = `
set -euo pipefail
eval "$(bash ${JSON.stringify(EXPORT_SLOT_ENV)} ${JSON.stringify(platform)} ${JSON.stringify(String(slot))})"
exec ${JSON.stringify(process.execPath)} -e ${JSON.stringify(nodeDump)}
`;
  const raw = execFileSync('bash', ['-c', bash], {
    encoding: 'utf8',
    cwd: REPO_ROOT,
    env: { ...process.env, RNFB_DUMP_KEYS: JSON.stringify(ENV_KEYS) },
  });
  return JSON.parse(raw);
}

function writeDotEnv(filePath, env) {
  const lines = Object.entries(env).map(([k, v]) => `${k}=${JSON.stringify(String(v))}`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function main() {
  const reserveJson = process.argv[2];
  const envFile = process.argv[3];
  const portsFile = process.argv[4] || path.join(REPO_ROOT, 'tests', 'mellifera.env.json');

  if (!reserveJson || !envFile) {
    usage();
  }

  let reserve;
  try {
    reserve = JSON.parse(reserveJson);
  } catch (err) {
    console.error(`error: invalid reserve JSON: ${err.message}`);
    process.exit(1);
  }

  let slot;
  try {
    slot = resolveDeskSlot(reserve);
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(1);
  }

  const platformDir = path.join(path.dirname(portsFile), 'mellifera-platform');
  fs.mkdirSync(platformDir, { recursive: true });

  /** @type {Record<string, Record<string, string>>} */
  const byPlatform = {};
  for (const platform of PLATFORMS) {
    byPlatform[platform] = captureExportSlotEnv(platform, slot);
    writeDotEnv(path.join(platformDir, `${platform}.env`), {
      RNFB_MELLIFERA: '1',
      ...byPlatform[platform],
    });
  }

  // Shared env for check/release: full slot carry-in (same ports/devices as export-slot-env).
  // Prefer android capture for process-local pins when a single file is sourced.
  const shared = {
    RNFB_MELLIFERA: '1',
    ...byPlatform.android,
  };
  if (reserve.sessionId) {
    shared.MELLIFERA_SESSION_ID = String(reserve.sessionId);
  }
  if (reserve.token) {
    shared.MELLIFERA_SESSION_TOKEN = String(reserve.token);
  }
  writeDotEnv(envFile, shared);

  fs.mkdirSync(path.dirname(portsFile), { recursive: true });
  fs.writeFileSync(
    portsFile,
    `${JSON.stringify(
      {
        sessionId: reserve.sessionId || null,
        placement: 'slot',
        slot,
        execution: reserve.execution || null,
        // Mlf-AD-9: mellifera does not render product env; ports live in RNFB_* files.
        env: {},
      },
      null,
      2,
    )}\n`,
  );

  console.log(
    JSON.stringify(
      {
        sessionId: reserve.sessionId || null,
        placement: 'slot',
        slot,
        platforms: PLATFORMS,
        envFile,
        portsFile,
        platformDir,
      },
      null,
      2,
    ),
  );
}

main();
