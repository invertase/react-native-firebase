const { execSync, spawn } = require('child_process');
const { promisify } = require('util');
const execFile = promisify(require('child_process').execFile);

let macOsRetries = 0;

const SERIAL_JET_PORT = 8090;
const SERIAL_METRO_PORT = 8081;
const DEFAULT_MACOS_PRODUCT_NAME = 'io.invertase.testing';

function macOsProductName() {
  return process.env.RNFB_MACOS_PRODUCT_NAME || DEFAULT_MACOS_PRODUCT_NAME;
}

function macOsBundleIdentifier() {
  if (process.env.RNFB_MACOS_BUNDLE_IDENTIFIER) {
    return process.env.RNFB_MACOS_BUNDLE_IDENTIFIER;
  }
  // Match Xcode $(PRODUCT_NAME:rfc1034identifier) — dots → hyphens.
  return `org.reactjs.native.${macOsProductName().replace(/\./g, '-')}`;
}

function macOsBundleQuery() {
  // Bundle IDs are ascii; keep hyphens literal in the Metro query string.
  return (
    'platform=macos&dev=true&lazy=true&minify=false&inlineSourceMap=true&modulesOnly=false&runModule=true&app=' +
    macOsBundleIdentifier()
  );
}

function macOsBinaryPath() {
  const name = macOsProductName();
  return `./macos/build/Build/Products/Debug/${name}.app/Contents/MacOS/${name}`;
}

function shellSingleQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function parseEnvPort(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function readJetPort() {
  const fromLocal = parseEnvPort(process.env.JET_REMOTE_PORT);
  if (fromLocal != null) {
    return fromLocal;
  }
  const prefixed = parseEnvPort(process.env.RNFB_MACOS_JET_PORT);
  return prefixed != null ? prefixed : SERIAL_JET_PORT;
}

function readMetroPort() {
  const fromLocal =
    parseEnvPort(process.env.RCT_METRO_PORT) ?? parseEnvPort(process.env.RNFB_METRO_PORT);
  if (fromLocal != null) {
    return fromLocal;
  }
  const prefixed = parseEnvPort(process.env.RNFB_MACOS_METRO_PORT);
  return prefixed != null ? prefixed : SERIAL_METRO_PORT;
}

function isMacOsTestAppRunning() {
  try {
    execSync(`pgrep -x ${shellSingleQuote(macOsProductName())}`, { stdio: 'ignore' });
    return true;
  } catch (_e) {
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function killMacOsTestApp() {
  const name = macOsProductName();
  if (!isMacOsTestAppRunning()) {
    return;
  }
  try {
    execSync(`killall ${shellSingleQuote(name)}`, { stdio: 'ignore' });
  } catch (_e) {
    // already gone
  }
  await sleep(500);
  if (isMacOsTestAppRunning()) {
    try {
      execSync(`killall -9 ${shellSingleQuote(name)}`, { stdio: 'ignore' });
    } catch (_e) {
      // already gone
    }
  }
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline && isMacOsTestAppRunning()) {
    await sleep(250);
  }
  if (isMacOsTestAppRunning()) {
    console.warn(`[rnfb-e2e] ${name} still running after killall -9 — tee/pipe may not close`);
  }
}

let macOsExitHandlersRegistered = false;

function registerMacOsExitHandlers() {
  if (macOsExitHandlersRegistered) {
    return;
  }
  macOsExitHandlersRegistered = true;
  const cleanup = () => {
    try {
      execSync(`killall -9 ${shellSingleQuote(macOsProductName())}`, { stdio: 'ignore' });
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
  const bundleUrl = `http://${host}:${metroPort}/index.bundle?${macOsBundleQuery()}`;
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

  while (Date.now() - started < timeoutMs) {
    const remainingSec = Math.max(30, Math.ceil((timeoutMs - (Date.now() - started)) / 1000));
    const sliceSec = Math.min(120, remainingSec);
    try {
      await execFile('curl', ['-sf', '--max-time', String(sliceSec), '-o', '/dev/null', bundleUrl]);
      console.warn(`[rnfb-e2e] macOS Metro bundle prefetched from ${bundleUrl}`);
      return;
    } catch (err) {
      // curl 18 = partial transfer; 28 = timeout while Metro is still compiling.
      console.warn(`[rnfb-e2e] macOS Metro bundle prefetch retry (code=${err?.code ?? 'unknown'})`);
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  throw new Error(`macOS Metro bundle not available at ${bundleUrl} after ${timeoutMs}ms`);
}

module.exports = {
  config: {
    port: parseEnvPort(process.env.JET_REMOTE_PORT) ?? SERIAL_JET_PORT,
    slow: 3000,
    reporter: 'spec',
    timeout: 420000, // 7 minutes - fetchAndActivate takes 5+ sometimes
    exitOnError: true,
    reconnectGraceMs: 30000,
    coverage: true,
  },
  targets: {
    macos: {
      async before(config) {
        await killMacOsTestApp();
        registerMacOsExitHandlers();
        const metroPort = readMetroPort();
        const jetPort = readJetPort();
        config.metroPort = metroPort;
        config.port = jetPort;
        console.warn(`[rnfb-e2e] macos Jet port=${jetPort} metro=${metroPort}`);
        await waitForMetroMacosBundle(metroPort);
        const macBinary = macOsBinaryPath();
        console.warn(`[rnfb-e2e] spawning macOS app ${macBinary} (${macOsBundleIdentifier()})`);
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
          console.warn(`[rnfb-e2e] macOS app teardown FAILED — ${macOsProductName()} still alive`);
        } else {
          console.warn('[rnfb-e2e] macOS app teardown complete');
        }
      },
    },
  },
};
