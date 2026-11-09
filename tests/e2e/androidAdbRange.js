'use strict';

// adb only auto-connects emulator console ports in this closed even range.
// FreePortFinder 10000–20000 is outside it (qemu up, serial never listed).
const ADB_EMULATOR_CONSOLE_PORT_MIN = 5554;
const ADB_EMULATOR_CONSOLE_PORT_MAX = 5584;

function parseEmulatorConsolePort(serial) {
  const portMatch = String(serial || '').match(/^emulator-(\d+)$/);
  if (!portMatch) {
    return NaN;
  }
  return Number.parseInt(portMatch[1], 10);
}

function isAdbEmulatorConsolePortInRange(port) {
  return (
    Number.isInteger(port) &&
    port >= ADB_EMULATOR_CONSOLE_PORT_MIN &&
    port <= ADB_EMULATOR_CONSOLE_PORT_MAX
  );
}

function emulatorConsolePortOutOfAdbRange(serial) {
  return !isAdbEmulatorConsolePortInRange(parseEmulatorConsolePort(serial));
}

// Immediate qemu-without-adb is only valid when -port cannot be adb-visible.
// In-range serials (e.g. slotted 5556/5558/5560) must poll first.
function shouldFailFastQemuWithoutAdb(serial, deviceState) {
  return deviceState === 'unknown' && emulatorConsolePortOutOfAdbRange(serial);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Complete qemu @AVD identity: @name then whitespace or end.
// `\b` after D still matches `@TestingAVD-0` (hyphen is a non-word char).
function qemuAvdIdentityPattern(avdName) {
  return `@${escapeRegExp(avdName)}(?:\\s|$)`;
}

function qemuCmdlineMatchesAvd(cmdline, avdName) {
  return new RegExp(qemuAvdIdentityPattern(avdName)).test(String(cmdline || ''));
}

// POSIX ERE for pgrep/pkill — same complete-identity rule as qemuAvdIdentityPattern.
function qemuAvdPgrepPattern(avdName) {
  return `qemu-system.*@${escapeRegExp(avdName)}([[:space:]]|$)`;
}

// Metro /status or bundle wait failures — retryable, but not an emulator health fault.
const METRO_WAIT_FAILURE_RE = /Metro not responding|Metro bundle not available|packager-probe/i;

// Android cold-boot is only for device-side launch/health faults (ANR, offline, qemu/adb,
// package-manager / ActivityManager collapse, install SIGTERM under load, unreachable app).
// Metro wait failures are excluded via isMetroWaitFailure before this regex runs.
// Includes Detox SPAWN_STDERR / Jet output phrasing: "Can't find service: package|activity|settings".
const ANDROID_DEVICE_SIDE_LAUNCH_RE =
  /ANR|\boffline\b|qemu-without-adb|did not become 'device'|cold-boot spawn did not register|unknown to FrontBoard|FBSOpenApplicationServiceErrorDomain|Can't find service: (?:package|activity|settings)|terminated with SIGTERM|Process was killed with SIGTERM|APP_UNREACHABLE|Failed to run application/i;

// jetOutput is Mocha/Jet log text (product titles like "whilst offline"). Only guest-death
// phrases — never the full device-side token set (\boffline\b, SIGTERM, APP_UNREACHABLE, …).
const ANDROID_JET_OUTPUT_GUEST_DEATH_RE =
  /ANRError|Application Not Responding|Can't find service: (?:package|activity|settings)/i;

function errorMessage(messageOrErr) {
  if (typeof messageOrErr === 'string') {
    return messageOrErr;
  }
  return messageOrErr?.message || '';
}

// Detox often surfaces only "Process exited with code N" in err.message while the
// actionable "Can't find service: …" lives on err.stderr / stdout. Full device-side
// regex applies here only — not to jetOutput (see ANDROID_JET_OUTPUT_GUEST_DEATH_RE).
function errorProbeText(messageOrErr) {
  if (typeof messageOrErr === 'string') {
    return messageOrErr;
  }
  if (!messageOrErr || typeof messageOrErr !== 'object') {
    return '';
  }
  return [messageOrErr.message, messageOrErr.stderr, messageOrErr.stdout]
    .filter(part => part != null && String(part).length > 0)
    .map(String)
    .join('\n');
}

function errorJetOutputText(messageOrErr) {
  if (typeof messageOrErr === 'string' || !messageOrErr || typeof messageOrErr !== 'object') {
    return '';
  }
  return messageOrErr.jetOutput != null ? String(messageOrErr.jetOutput) : '';
}

function isMetroWaitFailure(messageOrErr) {
  return METRO_WAIT_FAILURE_RE.test(errorMessage(messageOrErr));
}

// True only when an Android Jet retry should kill+relaunch qemu. Metro wait timeouts
// must leave the emulator alone and re-wait for packager-status:running / bundle.
function shouldColdBootAndroidOnLaunchRetry(messageOrErr) {
  // Metro exclusion stays message-primary so a polluted jetOutput cannot force a cold boot.
  if (isMetroWaitFailure(messageOrErr)) {
    return false;
  }
  if (ANDROID_DEVICE_SIDE_LAUNCH_RE.test(errorProbeText(messageOrErr))) {
    return true;
  }
  return ANDROID_JET_OUTPUT_GUEST_DEATH_RE.test(errorJetOutputText(messageOrErr));
}

function adbRangeDiagnosis(serial, avdName) {
  const port = parseEmulatorConsolePort(serial);
  const portLabel = Number.isInteger(port) ? String(port) : String(serial);
  const range = `[${ADB_EMULATOR_CONSOLE_PORT_MIN}, ${ADB_EMULATOR_CONSOLE_PORT_MAX}]`;
  const prefix =
    `qemu-without-adb: qemu is running for AVD ${avdName} but adb serial ${serial} ` +
    `is not 'device' (console -port ${portLabel}`;

  if (emulatorConsolePortOutOfAdbRange(serial)) {
    return (
      `${prefix} is outside adb's emulator range ${range}). ` +
      `Detox FreePortFinder defaults (10000–20000) are not adb-visible; pin ` +
      `RNFB_ANDROID_CONSOLE_PORT (slotted: 5556+2*slot) and do not add a second -port to bootArgs.`
    );
  }

  return (
    `${prefix} is inside adb's emulator range ${range}). ` +
    `This is not a Detox FreePortFinder 10000–20000 miss; adb never listed the serial after poll. ` +
    `Check qemu vs adb desync, leftover emulator, or host adb.`
  );
}

module.exports = {
  ADB_EMULATOR_CONSOLE_PORT_MIN,
  ADB_EMULATOR_CONSOLE_PORT_MAX,
  parseEmulatorConsolePort,
  isAdbEmulatorConsolePortInRange,
  emulatorConsolePortOutOfAdbRange,
  shouldFailFastQemuWithoutAdb,
  qemuAvdIdentityPattern,
  qemuCmdlineMatchesAvd,
  qemuAvdPgrepPattern,
  adbRangeDiagnosis,
  isMetroWaitFailure,
  shouldColdBootAndroidOnLaunchRetry,
  errorProbeText,
  METRO_WAIT_FAILURE_RE,
  ANDROID_DEVICE_SIDE_LAUNCH_RE,
  ANDROID_JET_OUTPUT_GUEST_DEATH_RE,
};
