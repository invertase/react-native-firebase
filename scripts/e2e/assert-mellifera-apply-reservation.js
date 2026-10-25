#!/usr/bin/env node
/**
 * Unit assert: mellifera-apply-reservation maps placement:"slot" + slot N to the
 * same ports/device names as export-slot-env <platform> N for android|ios|macos.
 * Slot fixtures are samples, not the product band: shared-band edges plus one
 * interior index. Run: yarn tests:mellifera:assert-apply-reservation
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const APPLY = path.join(SCRIPT_DIR, 'mellifera-apply-reservation.js');
const EXPORT_SLOT_ENV = path.join(SCRIPT_DIR, 'export-slot-env.sh');

const PLATFORMS = ['android', 'ios', 'macos'];
// Samples, not the product band: shared-band edges and one interior index.
const SLOTS = [0, 3, 7];

/** Ports + device identities that must match export-slot-env for the active platform. */
const COMPARE_KEYS = [
  'RNFB_E2E_SLOT',
  'RNFB_E2E_HOST_SLOT',
  'RCT_METRO_PORT',
  'RNFB_METRO_PORT',
  'JET_METRO_PORT',
  'JET_REMOTE_PORT',
  'RNFB_JET_CONTROL_PORT',
  'RNFB_ANDROID_METRO_PORT',
  'RNFB_ANDROID_JET_PORT',
  'RNFB_ANDROID_JET_CONTROL_PORT',
  'RNFB_ANDROID_EMULATOR_FIRESTORE_PORT',
  'RNFB_IOS_METRO_PORT',
  'RNFB_IOS_JET_PORT',
  'RNFB_IOS_JET_CONTROL_PORT',
  'RNFB_IOS_EMULATOR_FIRESTORE_PORT',
  'RNFB_MACOS_METRO_PORT',
  'RNFB_MACOS_JET_PORT',
  'RNFB_MACOS_JET_CONTROL_PORT',
  'RNFB_MACOS_EMULATOR_FIRESTORE_PORT',
  'RNFB_ANDROID_AVD',
  'RNFB_ANDROID_AVD_NAME',
  'RNFB_ANDROID_CONSOLE_PORT',
  'ANDROID_SERIAL',
  'RNFB_IOS_SIMULATOR',
  'RNFB_MACOS_PRODUCT_NAME',
  'AVD_NAME',
  'SIMCTL_CHILD_RCT_METRO_PORT',
  'ORG_GRADLE_PROJECT_reactNativeDevServerPort',
];

function parseDotEnv(text) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) {
      continue;
    }
    const eq = line.indexOf('=');
    if (eq < 1) {
      continue;
    }
    const key = line.slice(0, eq);
    let raw = line.slice(eq + 1);
    try {
      out[key] = JSON.parse(raw);
    } catch {
      out[key] = raw;
    }
  }
  return out;
}

function captureExportSlotEnv(platform, slot) {
  const nodeDump =
    'const keys=JSON.parse(process.env.RNFB_DUMP_KEYS);const out={};' +
    'for (const k of keys){if (Object.prototype.hasOwnProperty.call(process.env,k)) out[k]=process.env[k];}' +
    'process.stdout.write(JSON.stringify(out));';
  const bash = `
set -euo pipefail
eval "$(bash ${JSON.stringify(EXPORT_SLOT_ENV)} ${JSON.stringify(platform)} ${JSON.stringify(String(slot))})"
exec ${JSON.stringify(process.execPath)} -e ${JSON.stringify(nodeDump)}
`;
  return JSON.parse(
    execFileSync('bash', ['-c', bash], {
      encoding: 'utf8',
      cwd: REPO_ROOT,
      env: { ...process.env, RNFB_DUMP_KEYS: JSON.stringify(COMPARE_KEYS) },
    }),
  );
}

function runApply(reserve, envFile, portsFile) {
  return execFileSync(process.execPath, [APPLY, JSON.stringify(reserve), envFile, portsFile], {
    encoding: 'utf8',
    cwd: REPO_ROOT,
  });
}

function expectApplyFails(reserve, envFile, portsFile, code) {
  try {
    execFileSync(process.execPath, [APPLY, JSON.stringify(reserve), envFile, portsFile], {
      encoding: 'utf8',
      cwd: REPO_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    throw new Error(`expected apply to fail with ${code}`);
  } catch (err) {
    if (err.status !== 1) {
      throw err;
    }
    const stderr = String(err.stderr || '');
    if (!stderr.includes(code)) {
      throw new Error(`expected ${code}, got stderr: ${stderr}`);
    }
  }
}

function assertEqualMaps(label, actual, expected) {
  const missing = [];
  const mismatched = [];
  for (const key of COMPARE_KEYS) {
    const exp = expected[key];
    const act = actual[key];
    if (exp === undefined && act === undefined) {
      continue;
    }
    if (exp === undefined && act !== undefined) {
      mismatched.push(`${key}: unexpected actual=${JSON.stringify(act)}`);
      continue;
    }
    if (act === undefined) {
      missing.push(`${key}: expected ${JSON.stringify(exp)}`);
      continue;
    }
    if (String(act) !== String(exp)) {
      mismatched.push(`${key}: expected ${JSON.stringify(exp)} got ${JSON.stringify(act)}`);
    }
  }
  if (missing.length || mismatched.length) {
    throw new Error(
      `${label}\n  missing: ${missing.join('; ') || '(none)'}\n  mismatched: ${mismatched.join('; ') || '(none)'}`,
    );
  }
}

function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-mlf-apply-'));
  const envFile = path.join(tmp, 'rnfb.env');
  const portsFile = path.join(tmp, 'mellifera.env.json');

  // Host placement is not a slot bind. Slot 0 on that grant must not be inferred.
  expectApplyFails(
    { placement: 'host', slot: 0, sessionId: 's-host', env: {} },
    path.join(tmp, 'reject-host.env'),
    path.join(tmp, 'reject-host.json'),
    'unsupported-placement',
  );

  expectApplyFails(
    { placement: 'slot', slot: 8, sessionId: 's-oor', env: {} },
    path.join(tmp, 'reject-oor.env'),
    path.join(tmp, 'reject-oor.json'),
    'slot-out-of-range',
  );

  for (const slot of SLOTS) {
    const reserve = {
      sessionId: `s-slot-${slot}`,
      token: `t-${slot}`,
      placement: 'slot',
      slot,
      env: {},
      execution: { host: 'bastion-stand-in', checkoutMode: 'remote' },
    };
    runApply(reserve, envFile, portsFile);

    const ports = JSON.parse(fs.readFileSync(portsFile, 'utf8'));
    if (ports.placement !== 'slot' || ports.slot !== slot) {
      throw new Error(`ports file placement/slot mismatch for slot ${slot}`);
    }
    if (ports.env && Object.keys(ports.env).length > 0) {
      throw new Error('ports file must keep mellifera env empty (Mlf-AD-9)');
    }

    for (const platform of PLATFORMS) {
      const platPath = path.join(path.dirname(portsFile), 'mellifera-platform', `${platform}.env`);
      if (!fs.existsSync(platPath)) {
        throw new Error(`missing platform env ${platPath}`);
      }
      const applied = parseDotEnv(fs.readFileSync(platPath, 'utf8'));
      const expected = captureExportSlotEnv(platform, slot);
      assertEqualMaps(`slot ${slot} ${platform}`, applied, expected);
    }
  }

  // Check/release scripts are out of scope for this helper (RNFB_* only).
  const checkRelease = [
    'scripts/e2e/check-e2e-resources.sh',
    'scripts/e2e/release-e2e-resources.sh',
    'scripts/e2e/lib/e2e-resource-env.sh',
  ];
  for (const rel of checkRelease) {
    const diff = execFileSync('git', ['diff', '--', rel], {
      encoding: 'utf8',
      cwd: REPO_ROOT,
    });
    if (diff.trim()) {
      throw new Error(`check/release behavior changed unexpectedly: ${rel}`);
    }
  }

  console.log(
    `OK mellifera-apply-reservation matches export-slot-env for platforms=${PLATFORMS.join(',')} slots=${SLOTS.join(',')}`,
  );
}

main();
