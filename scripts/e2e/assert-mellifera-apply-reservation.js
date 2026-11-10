#!/usr/bin/env node
/**
 * Unit assert: mellifera-apply-reservation maps placement:"slot" + slot N to the
 * same ports/device names as export-slot-env <platform> N for android|ios|macos.
 * Slot fixtures are samples, not the product band: shared-band edges plus one
 * interior index. The band edge comes from scripts/e2e/lib/e2e-slot-env.sh, and
 * apply's own band must match it. A platform env file loaded with
 * `set -a; . FILE; set +a` must reach a child process, because apply writes
 * KEY="value" lines without `export`. check/release scripts must keep the blobs
 * this helper was built against. Run: yarn tests:mellifera:assert-apply-reservation
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const APPLY = path.join(SCRIPT_DIR, 'mellifera-apply-reservation.js');
const EXPORT_SLOT_ENV = path.join(SCRIPT_DIR, 'export-slot-env.sh');
const SLOT_ENV_LIB = path.join(SCRIPT_DIR, 'lib', 'e2e-slot-env.sh');

const PLATFORMS = ['android', 'ios', 'macos'];

// E2E_SLOTTED_HARD_MAX in the shared slot library is the source of truth for the
// band. apply keeps its own SLOT_BAND_MAX copy; assertSlotBand fails if they diverge.
function sharedSlotHardMax() {
  const out = execFileSync(
    'bash',
    ['-c', '. "$1"; printf %s "$E2E_SLOTTED_HARD_MAX"', 'bash', SLOT_ENV_LIB],
    {
      encoding: 'utf8',
      cwd: REPO_ROOT,
    },
  );
  const max = Number(out);
  if (!Number.isInteger(max) || max < 0) {
    throw new Error(
      `could not read E2E_SLOTTED_HARD_MAX from ${SLOT_ENV_LIB}: ${JSON.stringify(out)}`,
    );
  }
  return max;
}

const SLOT_MAX = sharedSlotHardMax();
// Samples, not the product band: shared-band edges and one interior index.
const SLOTS = [...new Set([0, Math.floor(SLOT_MAX / 2), SLOT_MAX])];

// Blobs of the check/release scripts at the commit this helper was built on.
// A deliberate change to those scripts must update these ids in the same change.
const CHECK_RELEASE_BLOBS = {
  'scripts/e2e/check-e2e-resources.sh': '75437c77f4eeaf7956b9e197acdcd76b6a48d80f',
  'scripts/e2e/release-e2e-resources.sh': 'c5d0121fa5ce44edb94051a9060d749b83cd4bd5',
  'scripts/e2e/lib/e2e-resource-env.sh': 'dd10fa4f8f74eee9ed1b7167fcb5e4504fb1978e',
};

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

function assertSlotBand() {
  const match = /^const SLOT_BAND_MAX = (\d+);$/m.exec(fs.readFileSync(APPLY, 'utf8'));
  if (!match) {
    throw new Error(`could not find SLOT_BAND_MAX in ${APPLY}`);
  }
  if (Number(match[1]) !== SLOT_MAX) {
    throw new Error(
      `apply SLOT_BAND_MAX=${match[1]} diverges from E2E_SLOTTED_HARD_MAX=${SLOT_MAX} in ${SLOT_ENV_LIB}`,
    );
  }
}

/** The documented load: `set -a; . FILE; set +a`, then a child process reads the env. */
function assertSourcedEnvReachesChild(envPath, slot) {
  const env = { ...process.env };
  for (const key of Object.keys(parseDotEnv(fs.readFileSync(envPath, 'utf8')))) {
    delete env[key];
  }
  const dump =
    'process.stdout.write(JSON.stringify({slot:process.env.RNFB_E2E_SLOT,mellifera:process.env.RNFB_MELLIFERA,metro:process.env.RCT_METRO_PORT}))';
  const res = spawnSync(
    'bash',
    ['-c', 'set -a; . "$1"; set +a; exec "$2" -e "$3"', 'bash', envPath, process.execPath, dump],
    { encoding: 'utf8', cwd: REPO_ROOT, env },
  );
  if (res.status !== 0) {
    throw new Error(`sourcing ${envPath} failed (exit ${res.status}): ${res.stderr}`);
  }
  const seen = JSON.parse(res.stdout);
  if (seen.slot !== String(slot) || seen.mellifera !== '1' || !/^\d+$/.test(seen.metro || '')) {
    throw new Error(
      `a child process does not see the slot env after set -a sourcing ${envPath}: ${res.stdout}`,
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

  assertSlotBand();

  expectApplyFails(
    { placement: 'slot', slot: SLOT_MAX + 1, sessionId: 's-oor', env: {} },
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
      assertSourcedEnvReachesChild(platPath, slot);
    }
  }

  // Check/release scripts are out of scope for this helper (RNFB_* only).
  for (const [rel, blob] of Object.entries(CHECK_RELEASE_BLOBS)) {
    const actual = execFileSync('git', ['hash-object', '--', path.join(REPO_ROOT, rel)], {
      encoding: 'utf8',
      cwd: os.tmpdir(),
    }).trim();
    if (actual !== blob) {
      throw new Error(
        `check/release behavior changed unexpectedly: ${rel} is ${actual}, expected ${blob}`,
      );
    }
  }

  console.log(
    `OK mellifera-apply-reservation matches export-slot-env for platforms=${PLATFORMS.join(',')} slots=${SLOTS.join(',')}; ` +
      `slot band matches E2E_SLOTTED_HARD_MAX=${SLOT_MAX}; set -a sourcing reaches child processes; check/release blobs unchanged`,
  );
}

main();
