const { execSync, spawn } = require('child_process');
const { promisify } = require('util');
const execFile = promisify(require('child_process').execFile);

let macOsRetries = 0;

const MACOS_BUNDLE_QUERY =
  'platform=macos&dev=true&lazy=true&minify=false&inlineSourceMap=true&modulesOnly=false&runModule=true&app=org.reactjs.native.io-invertase-testing';

const SERIAL_JET_PORT = 8090;
const SERIAL_METRO_PORT = 8081;

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
    case 'macos':
      prefixed = parseEnvPort(process.env.RNFB_MACOS_JET_PORT);
      break;
    default:
      break;
  }
  return prefixed != null ? prefixed : SERIAL_JET_PORT;
}

function readMetroPort(platformKey) {
  const fromLocal =
    parseEnvPort(process.env.RCT_METRO_PORT) ?? parseEnvPort(process.env.RNFB_METRO_PORT);
  if (fromLocal != null) {
    return fromLocal;
  }
  let prefixed = null;
  switch (platformKey) {
    case 'android':
      prefixed = parseEnvPort(process.env.RNFB_ANDROID_METRO_PORT);
      break;
    case 'ios':
      prefixed = parseEnvPort(process.env.RNFB_IOS_METRO_PORT);
      break;
    case 'macos':
      prefixed = parseEnvPort(process.env.RNFB_MACOS_METRO_PORT);
      break;
    default:
      break;
  }
  return prefixed != null ? prefixed : SERIAL_METRO_PORT;
}

function isMacOsTestAppRunning() {
  try {
    execSync('pgrep -x io.invertase.testing', { stdio: 'ignore' });
    return true;
  } catch (_e) {
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function killMacOsTestApp() {
  if (!isMacOsTestAppRunning()) {
    return;
  }
  try {
    execSync('killall "io.invertase.testing"', { stdio: 'ignore' });
  } catch (_e) {
    // already gone
  }
  await sleep(500);
  if (isMacOsTestAppRunning()) {
    try {
      execSync('killall -9 "io.invertase.testing"', { stdio: 'ignore' });
    } catch (_e) {
      // already gone
    }
  }
  // Short retry loop (~2s total) so callers can rely on the process being
  // gone before a piped `tee` is expected to see EOF.
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline && isMacOsTestAppRunning()) {
    await sleep(250);
  }
  if (isMacOsTestAppRunning()) {
    console.warn(
      '[rnfb-e2e] io.invertase.testing still running after killall -9 — tee/pipe may not close',
    );
  }
}

let macOsExitHandlersRegistered = false;

// Best-effort synchronous cleanup on process exit/abort so an interrupted
// run doesn't leave the app holding the tee pipe open indefinitely.
function registerMacOsExitHandlers() {
  if (macOsExitHandlersRegistered) {
    return;
  }
  macOsExitHandlersRegistered = true;
  const cleanup = () => {
    try {
      execSync('killall -9 "io.invertase.testing"', { stdio: 'ignore' });
    } catch (_e) {
      // already gone
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });
}

async function waitForMetroMacosBundle(metroPort = 8081, timeoutMs = 600000) {
  const host = '127.0.0.1';
  const statusUrl = `http://${host}:${metroPort}/status`;
  const bundleUrl = `http://${host}:${metroPort}/index.bundle?${MACOS_BUNDLE_QUERY}`;
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const { stdout } = await execFile('curl', ['-sf', statusUrl]);
      if (stdout.includes('packager-status:running')) {
        break;
      }
    } catch (_e) {
      // Metro still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const remainingSec = Math.max(60, Math.ceil((timeoutMs - (Date.now() - started)) / 1000));
  await execFile('curl', ['-sf', '--max-time', String(remainingSec), '-o', '/dev/null', bundleUrl]);
  console.warn(`[rnfb-e2e] macOS Metro bundle prefetched from ${bundleUrl}`);
}

module.exports = {
  config: {
    // Serial fallback only — each target.before() sets the real port.
    port: SERIAL_JET_PORT,
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
        return config;
      },
      async after(_config) {
        // no-op
      },
    },
    ios: {
      async before(config) {
        config.port = readJetPort('ios');
        return config;
      },
      async after(_config) {
        // no-op
      },
    },
    macos: {
      async before(config) {
        await killMacOsTestApp();
        registerMacOsExitHandlers();
        const metroPort = readMetroPort('macos');
        const jetPort = readJetPort('macos');
        config.metroPort = metroPort;
        config.port = jetPort;
        await waitForMetroMacosBundle(metroPort);
        const macBinary =
          './macos/build/Build/Products/Debug/io.invertase.testing.app/Contents/MacOS/io.invertase.testing';
        const macApp = spawn(macBinary, [], {
          // 'ignore' (not 'inherit'): inherited stdio hands the app the
          // write end of the agent's stdout/stderr pipe (e.g. `| tee`), so
          // the pipe never sees EOF and the shell hangs after the suite
          // finishes even though the app has nothing left to print.
          stdio: ['ignore', 'ignore', 'ignore'],
          env: {
            ...process.env,
            RCT_METRO_PORT: String(metroPort),
            JET_REMOTE_PORT: String(jetPort),
          },
        });
        macApp.on('close', code => {
          if (code === 0) {
            return;
          }
          if (macOsRetries < 3) {
            macOsRetries++;
            // eslint-disable-next-line no-console
            console.log('App crashed, retrying macOS app tests...');
            this.before(config);
            return;
          } else {
            // eslint-disable-next-line no-console
            console.error('macOS app failed to start, exiting...');
            process.exit(1);
          }
        });
        macApp.on('spawn', () => {
          // eslint-disable-next-line no-console
          console.log('[💻] macOS app started');
        });
        return config;
      },
      async after(_config) {
        await killMacOsTestApp();
        if (isMacOsTestAppRunning()) {
          console.warn('[rnfb-e2e] macOS app teardown FAILED — io.invertase.testing still alive');
        } else {
          console.warn('[rnfb-e2e] macOS app teardown complete');
        }
      },
    },
  },
};
