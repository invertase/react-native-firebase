/** @type {Detox.DetoxConfig} */

function intEnv(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === '') {
    return fallback;
  }
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function androidReversePortsFromEnv() {
  return [
    intEnv('RNFB_ANDROID_EMULATOR_FIRESTORE_PORT', 8080),
    intEnv('RNFB_ANDROID_METRO_PORT', intEnv('RCT_METRO_PORT', 8081)),
    intEnv('RNFB_ANDROID_JET_PORT', intEnv('JET_REMOTE_PORT', 8090)),
    intEnv('RNFB_ANDROID_EMULATOR_DATABASE_PORT', 9000),
    intEnv('RNFB_ANDROID_EMULATOR_AUTH_PORT', 9099),
    intEnv('RNFB_ANDROID_EMULATOR_STORAGE_PORT', 9199),
    intEnv('RNFB_ANDROID_EMULATOR_FUNCTIONS_PORT', 5001),
  ];
}

const ANDROID_REVERSE_DEFAULT = androidReversePortsFromEnv();

// iOS xcodebuild only — prefer the ios-prefixed metro port (always exported alongside
// android/macos ports). Do not key off RNFB_E2E_PLATFORM.
function readNativeMetroPort() {
  if (process.env.RNFB_IOS_METRO_PORT) {
    return process.env.RNFB_IOS_METRO_PORT;
  }
  if (process.env.RCT_METRO_PORT) {
    return process.env.RCT_METRO_PORT;
  }
  if (process.env.RNFB_METRO_PORT) {
    return process.env.RNFB_METRO_PORT;
  }
  return '8081';
}

function iosXcodebuildPrefix() {
  return `RCT_METRO_PORT=${readNativeMetroPort()}`;
}

// Slotted devices (including slot 0) — distinct from serial iPhone 17 / TestingAVD
// so a slotted wave can run beside an unslotted serial run.
function iosSimulatorDevice(slot) {
  const deviceType = process.env.RNFB_IOS_BASE_SIMULATOR || 'iPhone 17';
  const slotName = `RNFB E2E iOS slot-${slot}`;
  return {
    type: 'ios.simulator',
    device: { type: deviceType, name: slotName },
  };
}

// Snapshot flags only. Detox LaunchCommand already prepends `-port ${FreePortFinder}`;
// putting `-port` in bootArgs makes qemu use the last value while adb waits on the first.
function androidEmulatorBootArgs() {
  return (process.env.RNFB_ANDROID_EMULATOR_BOOT_ARGS || '-no-snapshot-load -no-snapshot-save')
    .replace(/(?:^|\s)-port\s+\d+/g, '')
    .trim();
}

function androidEmulatorDevice(slot) {
  return {
    type: 'android.emulator',
    device: { avdName: `TestingAVD-${slot}` },
    bootArgs: androidEmulatorBootArgs(),
    readonly: true,
  };
}

function androidApp(reversePorts) {
  return {
    type: 'android.apk',
    binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
    build:
      'cd android && ./gradlew-with-worker-cap.sh assembleDebug assembleAndroidTest lintDebug -DtestBuildType=debug --warning-mode all --stacktrace && cd ..',
    reversePorts,
  };
}

function androidAppWindows(reversePorts) {
  return {
    type: 'android.apk',
    binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
    build:
      'cd android && .\\gradlew-with-worker-cap.bat assembleDebug assembleAndroidTest lintDebug -DtestBuildType=debug --warning-mode all --stacktrace && cd ..',
    reversePorts,
  };
}

const SERIAL_IOS_DEVICE_TYPE = process.env.RNFB_IOS_BASE_SIMULATOR || 'iPhone 17';
const SERIAL_ANDROID_AVD = 'TestingAVD';

const devices = {
  // Serial unslotted defaults (yarn tests:ios / android without slot env).
  simulator: {
    type: 'ios.simulator',
    device: { type: SERIAL_IOS_DEVICE_TYPE, name: SERIAL_IOS_DEVICE_TYPE },
  },
  attached: {
    type: 'android.attached',
    device: { adbName: '.*' },
  },
  emulator: {
    type: 'android.emulator',
    device: { avdName: SERIAL_ANDROID_AVD },
    bootArgs: androidEmulatorBootArgs(),
    readonly: true,
  },
};

for (let slot = 0; slot < 5; slot += 1) {
  devices[`simulator-slot${slot}`] = iosSimulatorDevice(slot);
  devices[`emulator-slot${slot}`] = androidEmulatorDevice(slot);
}

const apps = {
  'ios.debug': {
    type: 'ios.app',
    binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/testing.app',
    build: `set -o pipefail && ${iosXcodebuildPrefix()} xcodebuild VALID_ARCHS="\`uname -m\`"  CC=clang CPLUSPLUS=clang++ LD=clang LDPLUSPLUS=clang++ -workspace ios/testing.xcworkspace -scheme testing -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build | xcbeautify`,
  },
  'ios.release': {
    type: 'ios.app',
    binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/testing.app',
    build: `export RCT_NO_LAUNCH_PACKAGER=true && set -o pipefail && ${iosXcodebuildPrefix()} xcodebuild  CC=clang CPLUSPLUS=clang++ LD=clang LDPLUSPLUS=clang++ -workspace ios/testing.xcworkspace -scheme testing -configuration Release -sdk iphonesimulator -derivedDataPath ios/build | xcbeautify`,
  },
  'android.debug': androidApp(ANDROID_REVERSE_DEFAULT),
  'android.debug.windows': androidAppWindows(ANDROID_REVERSE_DEFAULT),
  'android.release': {
    type: 'android.apk',
    binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
    build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
  },
};

for (let slot = 0; slot < 5; slot += 1) {
  apps[`android.debug.slot${slot}`] = androidApp(ANDROID_REVERSE_DEFAULT);
  apps[`android.debug.slot${slot}.windows`] = androidAppWindows(ANDROID_REVERSE_DEFAULT);
}

const configurations = {
  'ios.sim.debug': { device: 'simulator', app: 'ios.debug' },
  'ios.sim.release': { device: 'simulator', app: 'ios.release' },
  'android.att.debug': { device: 'attached', app: 'android.debug' },
  'android.att.release': { device: 'attached', app: 'android.release' },
  'android.emu.debug': { device: 'emulator', app: 'android.debug' },
  'android.emu.debug.windows': { device: 'emulator', app: 'android.debug.windows' },
  'android.emu.release': { device: 'emulator', app: 'android.release' },
};

for (let slot = 0; slot < 5; slot += 1) {
  configurations[`ios.sim.debug.slot${slot}`] = {
    device: `simulator-slot${slot}`,
    app: 'ios.debug',
  };
  configurations[`android.emu.debug.slot${slot}`] = {
    device: `emulator-slot${slot}`,
    app: `android.debug.slot${slot}`,
  };
  configurations[`android.emu.debug.slot${slot}.windows`] = {
    device: `emulator-slot${slot}`,
    app: `android.debug.slot${slot}.windows`,
  };
}

module.exports = {
  testRunner: {
    args: { $0: 'jest', config: 'e2e/jest.config.js' },
    jest: { setupTimeout: 120000 },
  },
  apps,
  devices,
  configurations,
};
