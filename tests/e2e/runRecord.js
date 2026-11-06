/*
 * Run record: resources e2e runs from this checkout started or worked with.
 * Same layout and entry format as scripts/e2e/lib/e2e-run-record.sh, which
 * yarn tests:e2e:release reads to free only recorded resources.
 *
 *   ${RNFB_E2E_RUN_RECORD_DIR:-<repo>/.e2e-run}/<slot-N|serial>/<entry>
 *   pid     <pid> <start> <label>                    file pid-<pid>-<start key>
 *   android <serial> <avd> <qemu pid> <start>        file android-<serial>
 *   ios-sim <udid> <name> <launchd_sim pid> <start>  file ios-sim-<udid>
 *
 * Device entries carry the qemu / launchd_sim instance the run used; release acts on
 * them only while that exact instance is alive.
 *
 * Recording must never fail a run: every helper swallows errors.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { qemuCmdlineMatchesAvd } = require('./androidAdbRange');

const repoRoot = path.resolve(__dirname, '../..');

function run(cmd, args, extraEnv) {
  try {
    return execFileSync(cmd, args, {
      encoding: 'utf8',
      timeout: 10000,
      stdio: ['ignore', 'pipe', 'ignore'],
      env: extraEnv ? { ...process.env, ...extraEnv } : process.env,
    });
  } catch (_) {
    return '';
  }
}

// The shell twin also honours E2E_SLOT_OVERRIDE (release/check --slot=N); the harness
// only ever runs under exported slot env, so it reads RNFB_E2E_SLOT / _HOST_SLOT only.
function runIdentity(env = process.env) {
  const slot = env.RNFB_E2E_SLOT || env.RNFB_E2E_HOST_SLOT;
  return slot ? `slot-${slot}` : 'serial';
}

function runRecordDir(env = process.env) {
  const base = env.RNFB_E2E_RUN_RECORD_DIR || path.join(repoRoot, '.e2e-run');
  return path.join(base, runIdentity(env));
}

/** Linux: /proc stat starttime; elsewhere ps lstart pinned to LC_ALL=C TZ=UTC. */
function processStartTime(pid) {
  if (!/^\d+$/.test(String(pid))) {
    return '';
  }
  try {
    const stat = fs.readFileSync(`/proc/${pid}/stat`, 'utf8');
    const fields = stat
      .slice(stat.lastIndexOf(') ') + 2)
      .trim()
      .split(/\s+/);
    return fields[19] ? `proc:${fields[19]}` : '';
  } catch (_) {
    // no procfs (macOS) or pid gone
  }
  return run('ps', ['-p', String(pid), '-o', 'lstart='], { LC_ALL: 'C', TZ: 'UTC' }).trim();
}

function recordKey(start) {
  return start.replace(/[^A-Za-z0-9]/g, '_');
}

function parentPid(pid) {
  const out = run('ps', ['-p', String(pid), '-o', 'ppid=']).trim();
  return /^\d+$/.test(out) ? Number(out) : 0;
}

function processArgs(pid) {
  return run('ps', ['-p', String(pid), '-o', 'args=']).trim();
}

function processCwd(pid) {
  const line = run('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'])
    .split('\n')
    .find(l => l.startsWith('n'));
  return line ? line.slice(1) : '';
}

/** Elapsed seconds since the process started (ps etime: [[dd-]hh:]mm:ss), or NaN. */
function processElapsedSeconds(pid) {
  const m = run('ps', ['-p', String(pid), '-o', 'etime='])
    .trim()
    .match(/^(?:(\d+)-)?(?:(\d+):)?(\d+):(\d+)$/);
  if (!m) {
    return NaN;
  }
  const [, d = 0, h = 0, mi, s] = m;
  return ((Number(d) * 24 + Number(h)) * 60 + Number(mi)) * 60 + Number(s);
}

function putEntry(name, fields, env = process.env) {
  try {
    const dir = runRecordDir(env);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = path.join(dir, `.${name}.${process.pid}`);
    fs.writeFileSync(tmp, `${fields.join('\t')}\n`);
    fs.renameSync(tmp, path.join(dir, name));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[rnfb-e2e] run record: could not write ${name}: ${err?.message || err}`);
  }
}

function recordPid(pid, label, env = process.env) {
  if (!Number.isInteger(Number(pid)) || Number(pid) <= 0) {
    return;
  }
  const start = processStartTime(pid);
  if (start) {
    putEntry(`pid-${pid}-${recordKey(start)}`, ['pid', String(pid), start, label], env);
  }
}

function listProcesses() {
  return run('ps', ['-axo', 'pid=,args='])
    .split('\n')
    .map(line => line.trim().match(/^(\d+)\s+(.*)$/))
    .filter(Boolean)
    .map(([, pid, args]) => ({ pid: Number(pid), args }));
}

function consoleSerialFromQemuArgs(args) {
  const m = String(args).match(/(?:^|\s)-port\s+(\d+)(?:\s|$)/);
  return m ? `emulator-${m[1]}` : null;
}

/** Device started after this process (it is this run's boot, not a pre-existing one). */
function startedDuringThisRun(pid) {
  const elapsed = processElapsedSeconds(pid);
  return Number.isFinite(elapsed) && elapsed <= process.uptime() + 2;
}

/**
 * Record the Android emulator instance (qemu pid + start time) for an AVD. The serial
 * comes from the qemu `-port` when present (cold-boot / FreePortFinder relaunches).
 *
 * The GitHub Linux runner's android-emulator-runner starts qemu with `-avd test`, not
 * `@test`, so nothing matches and the CI emulator is never recorded. Harmless: CI never
 * calls release, and the runner is discarded after the job. (Manual
 * `release --include-unrecorded --devices` reads `-avd X` too, but `test` is never an
 * identity AVD.)
 */
function recordAndroidDevice(
  serial,
  avd,
  env = process.env,
  { onlyIfStartedDuringRun, requireSerial } = {},
) {
  if (!avd) {
    return null;
  }
  let candidates = listProcesses().filter(
    p => /qemu-system/.test(p.args) && qemuCmdlineMatchesAvd(p.args, avd),
  );
  // requireSerial: the caller spawned `-port <serial port>` itself, so a lone same-AVD
  // qemu on another port, or another owner's qemu on this port, is never adopted.
  if (requireSerial || (candidates.length > 1 && serial)) {
    candidates = candidates.filter(p => consoleSerialFromQemuArgs(p.args) === serial);
  }
  if (requireSerial) {
    candidates = candidates.filter(p => pidOwner(p.pid, env) !== 'unrecorded');
  }
  if (candidates.length !== 1) {
    return null;
  }
  const qemu = candidates[0];
  if (onlyIfStartedDuringRun && !startedDuringThisRun(qemu.pid)) {
    return null;
  }
  const start = processStartTime(qemu.pid);
  const recordedSerial = consoleSerialFromQemuArgs(qemu.args) || serial;
  if (!start || !recordedSerial) {
    return null;
  }
  putEntry(
    `android-${recordedSerial}`,
    ['android', recordedSerial, avd, String(qemu.pid), start],
    env,
  );
  return recordedSerial;
}

function bootedSimulatorUdid(name) {
  try {
    const devices = Object.values(
      JSON.parse(run('xcrun', ['simctl', 'list', 'devices', 'booted', '-j']) || '{}').devices || {},
    ).flat();
    return devices.find(d => d.name === name && d.state === 'Booted')?.udid || null;
  } catch (_) {
    return null;
  }
}

/** Record the simulator instance (launchd_sim pid + start time) for a UDID. */
function recordIosSimulator(udid, name, env = process.env, { onlyIfStartedDuringRun } = {}) {
  if (!udid) {
    return null;
  }
  const launchd = listProcesses().find(
    p => /launchd_sim/.test(p.args) && p.args.includes(`/Devices/${udid}/`),
  );
  if (!launchd || (onlyIfStartedDuringRun && !startedDuringThisRun(launchd.pid))) {
    return null;
  }
  const start = processStartTime(launchd.pid);
  if (!start) {
    return null;
  }
  putEntry(`ios-sim-${udid}`, ['ios-sim', udid, name || '', String(launchd.pid), start], env);
  return udid;
}

/**
 * Record the identity's device if this run booted it — used where Detox may have booted
 * it but the test never started (init failure).
 */
function recordRunDevice(platform, env = process.env) {
  try {
    if (platform === 'android') {
      const avd = env.RNFB_ANDROID_AVD || env.RNFB_ANDROID_AVD_NAME || 'TestingAVD';
      return recordAndroidDevice(env.ANDROID_SERIAL || null, avd, env, {
        onlyIfStartedDuringRun: true,
      });
    }
    if (platform === 'ios') {
      const name = env.RNFB_IOS_SIMULATOR || 'iPhone 17';
      return recordIosSimulator(bootedSimulatorUdid(name), name, env, {
        onlyIfStartedDuringRun: true,
      });
    }
  } catch (_) {
    // recording never fails a run
  }
  return null;
}

function listEntries(kind, env = process.env) {
  const dir = runRecordDir(env);
  let names = [];
  try {
    names = fs.readdirSync(dir).filter(name => !name.startsWith('.'));
  } catch (_) {
    return [];
  }
  const entries = [];
  for (const name of names) {
    try {
      const fields = fs.readFileSync(path.join(dir, name), 'utf8').split('\n')[0].split('\t');
      if (fields[0] === kind) {
        entries.push({ file: path.join(dir, name), fields });
      }
    } catch (_) {
      // entry removed concurrently
    }
  }
  return entries;
}

/** Live recorded pids (start time still matches) with an optional exact label. */
function recordedLivePids(label, env = process.env) {
  return listEntries('pid', env)
    .filter(({ fields }) => label === undefined || fields[3] === label)
    .filter(({ fields }) => processStartTime(fields[1]) === fields[2])
    .map(({ fields }) => Number(fields[1]));
}

/** Live recorded qemu pids (instance start time still matches) for an AVD. */
function recordedLiveAndroidQemuPids(avd, env = process.env) {
  return listEntries('android', env)
    .filter(({ fields }) => fields[2] === avd && processStartTime(fields[3]) === fields[4])
    .map(({ fields }) => Number(fields[3]));
}

/**
 * True when pid is this process, one of its descendants, or (an ancestor is) a live
 * pid recorded by this checkout's runs for the current identity.
 */
function isOwnedPid(pid, env = process.env) {
  const owned = new Set(recordedLivePids(undefined, env));
  owned.add(process.pid);
  let current = Number(pid);
  for (let depth = 0; current > 1 && depth < 32; depth++) {
    if (owned.has(current)) {
      return true;
    }
    current = parentPid(current);
  }
  return false;
}

/** this-checkout | this-checkout-unrecorded (cwd inside this repo) | unrecorded */
function pidOwner(pid, env = process.env) {
  if (isOwnedPid(pid, env)) {
    return 'this-checkout';
  }
  const cwd = processCwd(pid);
  return cwd && (cwd === repoRoot || cwd.startsWith(`${repoRoot}${path.sep}`))
    ? 'this-checkout-unrecorded'
    : 'unrecorded';
}

function describePid(pid) {
  return `pid=${pid} cmd=${processArgs(pid).slice(0, 120)} cwd=${processCwd(pid)}`;
}

/**
 * Error for holders this run will not kill. `category` is the yarn tests:e2e:release
 * --only category that frees it (metro, jet, macos-app, …).
 */
function foreignHolderError(what, pids, category, env = process.env) {
  const owners = pids.map(pid => pidOwner(pid, env));
  const holders = pids.map((pid, i) => `${describePid(pid)} owner=${owners[i]}`).join('; ');
  const hint = owners.includes('this-checkout-unrecorded')
    ? `It runs from this checkout but no run recorded it (for example started outside ` +
      `yarn tests:*, before the run record existed, or by a step that does not record what ` +
      `it starts). Stop it, or in this shell's slot env run: ` +
      `yarn tests:e2e:release --include-unrecorded --only ${category}`
    : `Another owner holds it, so it is not killed. Free it from its owner, or use a free slot: ` +
      `eval "$(yarn tests:e2e:export-slot-env <platform> N)" (yarn tests:e2e:check --services names one)`;
  return new Error(`[rnfb-e2e] ${what} is held by ${holders}. ${hint}.`);
}

module.exports = {
  bootedSimulatorUdid,
  consoleSerialFromQemuArgs,
  describePid,
  foreignHolderError,
  isOwnedPid,
  listEntries,
  listProcesses,
  pidOwner,
  processCwd,
  processStartTime,
  recordAndroidDevice,
  recordIosSimulator,
  recordPid,
  recordRunDevice,
  recordedLiveAndroidQemuPids,
  recordedLivePids,
  runIdentity,
  runRecordDir,
};
