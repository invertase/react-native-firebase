exports.getE2eTestProject = function getE2eTestProject() {
  return 'react-native-firebase-testing';
};

exports.getE2eEmulatorHost = function getE2eEmulatorHost() {
  if (Platform.android) {
    return '10.0.2.2';
  }
  return '127.0.0.1';
};

function platformKey() {
  if (Platform.other) {
    return 'macos';
  }
  if (Platform.android) {
    return 'android';
  }
  return 'ios';
}

const DEFAULT_EMULATOR = {
  firestore: 8080,
  auth: 9099,
  database: 9000,
  functions: 5001,
  storage: 9199,
};

const DEFAULT_JET_SERIAL = 8090;
const DEFAULT_METRO_PORT = 8081;

function e2eDebug(msg, extra) {
  if (process.env.RNFB_E2E_DEBUG !== '1') {
    return;
  }
  const pk = platformKey();
  // eslint-disable-next-line no-console
  console.log(`[rnfb-e2e] platform=${pk} ${msg}`, extra || '');
}

function parsePort(value) {
  if (!value) {
    return null;
  }
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

// NOTE: tests/.babelrc and tests-macos/.babelrc's `transform-inline-environment-variables`
// plugin only rewrites static `process.env.NAME` member expressions at Metro-transform
// time — it cannot see through computed/dynamic lookups such as `process.env[key]` or
// template-built names. The packaged app has no real `process.env` at runtime, so every
// slotted var below must be spelled out literally to match the include list in both
// tests/.babelrc and tests-macos/.babelrc.
function staticEmulatorPort(pk, service) {
  switch (pk) {
    case 'android':
      switch (service) {
        case 'firestore':
          return process.env.RNFB_ANDROID_EMULATOR_FIRESTORE_PORT;
        case 'auth':
          return process.env.RNFB_ANDROID_EMULATOR_AUTH_PORT;
        case 'database':
          return process.env.RNFB_ANDROID_EMULATOR_DATABASE_PORT;
        case 'functions':
          return process.env.RNFB_ANDROID_EMULATOR_FUNCTIONS_PORT;
        case 'storage':
          return process.env.RNFB_ANDROID_EMULATOR_STORAGE_PORT;
        default:
          return undefined;
      }
    case 'macos':
      switch (service) {
        case 'firestore':
          return process.env.RNFB_MACOS_EMULATOR_FIRESTORE_PORT;
        case 'auth':
          return process.env.RNFB_MACOS_EMULATOR_AUTH_PORT;
        case 'database':
          return process.env.RNFB_MACOS_EMULATOR_DATABASE_PORT;
        case 'functions':
          return process.env.RNFB_MACOS_EMULATOR_FUNCTIONS_PORT;
        case 'storage':
          return process.env.RNFB_MACOS_EMULATOR_STORAGE_PORT;
        default:
          return undefined;
      }
    case 'ios':
    default:
      switch (service) {
        case 'firestore':
          return process.env.RNFB_IOS_EMULATOR_FIRESTORE_PORT;
        case 'auth':
          return process.env.RNFB_IOS_EMULATOR_AUTH_PORT;
        case 'database':
          return process.env.RNFB_IOS_EMULATOR_DATABASE_PORT;
        case 'functions':
          return process.env.RNFB_IOS_EMULATOR_FUNCTIONS_PORT;
        case 'storage':
          return process.env.RNFB_IOS_EMULATOR_STORAGE_PORT;
        default:
          return undefined;
      }
  }
}

function staticMetroPort(pk) {
  switch (pk) {
    case 'android':
      return process.env.RNFB_ANDROID_METRO_PORT;
    case 'macos':
      return process.env.RNFB_MACOS_METRO_PORT;
    case 'ios':
    default:
      return process.env.RNFB_IOS_METRO_PORT;
  }
}

function staticJetPort(pk) {
  switch (pk) {
    case 'android':
      return process.env.RNFB_ANDROID_JET_PORT;
    case 'macos':
      return process.env.RNFB_MACOS_JET_PORT;
    case 'ios':
    default:
      return process.env.RNFB_IOS_JET_PORT;
  }
}

exports.getE2ePlatformKey = platformKey;

exports.getE2eEmulatorPort = function getE2eEmulatorPort(service) {
  const pk = platformKey();
  const prefixed = parsePort(staticEmulatorPort(pk, service));
  if (prefixed) {
    e2eDebug(`emulator.${service} from env`, prefixed);
    return prefixed;
  }
  const fallback = DEFAULT_EMULATOR[service] ?? 8080;
  e2eDebug(`emulator.${service} default`, fallback);
  return fallback;
};

// Precedence: platform-prefixed (static env) -> JET_REMOTE_PORT (global override) -> default.
exports.getJetRemotePort = function getJetRemotePort() {
  const pk = platformKey();
  const prefixed = parsePort(staticJetPort(pk));
  if (prefixed) {
    e2eDebug('jet.port from platform env', prefixed);
    return prefixed;
  }
  const global_ = parsePort(process.env.JET_REMOTE_PORT);
  if (global_) {
    e2eDebug('jet.port from JET_REMOTE_PORT', global_);
    return global_;
  }
  e2eDebug('jet.port default', DEFAULT_JET_SERIAL);
  return DEFAULT_JET_SERIAL;
};

exports.getJetRemoteUrl = function getJetRemoteUrl() {
  const host = exports.getE2eEmulatorHost();
  return `ws://${host}:${exports.getJetRemotePort()}`;
};

// Precedence: platform-prefixed -> RCT_METRO_PORT -> RNFB_METRO_PORT -> JET_METRO_PORT -> default.
exports.getMetroPort = function getMetroPort() {
  const pk = platformKey();
  const prefixed = parsePort(staticMetroPort(pk));
  if (prefixed) {
    e2eDebug('metro.port from platform env', prefixed);
    return prefixed;
  }
  const rct = parsePort(process.env.RCT_METRO_PORT);
  if (rct) {
    e2eDebug('metro.port from RCT_METRO_PORT', rct);
    return rct;
  }
  const rnfb = parsePort(process.env.RNFB_METRO_PORT);
  if (rnfb) {
    e2eDebug('metro.port from RNFB_METRO_PORT', rnfb);
    return rnfb;
  }
  const jet = parsePort(process.env.JET_METRO_PORT);
  if (jet) {
    e2eDebug('metro.port from JET_METRO_PORT', jet);
    return jet;
  }
  e2eDebug('metro.port default', DEFAULT_METRO_PORT);
  return DEFAULT_METRO_PORT;
};
