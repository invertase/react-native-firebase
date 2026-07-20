const SERIAL_JET_PORT = 8090;

function parseEnvPort(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

// Prefer process-local binds set by firebase.test.js spawnJet / launchers.
// Fall back to an explicit platform key — never RNFB_E2E_PLATFORM (shared
// babel/transform cache + multi-platform worktrees; see running-e2e.md).
// macOS Jet lives in tests-macos/.jetrc.js after the tests-macos/ split.
function readJetPort(platformKey) {
  const fromLocal = parseEnvPort(process.env.JET_REMOTE_PORT);
  if (fromLocal != null) {
    return fromLocal;
  }
  let prefixed = null;
  switch (platformKey) {
    case 'android':
      prefixed = parseEnvPort(process.env.RNFB_ANDROID_JET_PORT);
      break;
    case 'ios':
      prefixed = parseEnvPort(process.env.RNFB_IOS_JET_PORT);
      break;
    default:
      break;
  }
  return prefixed != null ? prefixed : SERIAL_JET_PORT;
}

module.exports = {
  config: {
    // Prefer process-local JET_REMOTE_PORT when already exported (slotted launchers);
    // each target.before() still re-applies the platform-prefixed port and logs it.
    port: parseEnvPort(process.env.JET_REMOTE_PORT) ?? SERIAL_JET_PORT,
    slow: 3000,
    reporter: 'spec',
    timeout: 420000, // 7 minutes - fetchAndActivate takes 5+ sometimes
    exitOnError: true,
    // Wait for mocha-remote client auto-reconnect before fatal exit (1006/1001).
    reconnectGraceMs: 30000,
    coverage: true,
  },
  targets: {
    android: {
      async before(config) {
        config.port = readJetPort('android');
        console.warn(`[rnfb-e2e] android Jet port=${config.port}`);
        return config;
      },
      async after(_config) {
        // no-op
      },
    },
    ios: {
      async before(config) {
        config.port = readJetPort('ios');
        console.warn(`[rnfb-e2e] ios Jet port=${config.port}`);
        return config;
      },
      async after(_config) {
        // no-op
      },
    },
  },
};
