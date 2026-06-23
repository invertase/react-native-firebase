const { execSync, spawn } = require('child_process');
const { promisify } = require('util');
const execFile = promisify(require('child_process').execFile);

let macOsRetries = 0;

const MACOS_BUNDLE_QUERY =
  'platform=macos&dev=true&lazy=true&minify=false&inlineSourceMap=true&modulesOnly=false&runModule=true&app=org.reactjs.native.io-invertase-testing';

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
        return config;
      },
      async after(_config) {
        // no-op
      },
    },
    ios: {
      async before(config) {
        return config;
      },
      async after(_config) {
        // no-op
      },
    },
    macos: {
      async before(config) {
        try {
          execSync(`killall "io.invertase.testing"`);
        } catch (_e) {
          // noop
        }
        await waitForMetroMacosBundle(config.metroPort ?? 8081);
        const macApp = spawn(
          'open',
          ['./macos/build/Build/Products/Debug/io.invertase.testing.app'],
          {
            stdio: ['ignore', 'inherit', 'inherit'],
          },
        );
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
        try {
          execSync(`killall "io.invertase.testing"`);
        } catch (_e) {
          // noop
        }
      },
    },
  },
};
