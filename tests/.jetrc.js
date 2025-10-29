const { execSync, spawn } = require('child_process');

let macOsRetries = 0;

module.exports = {
  config: {
    slow: 3000,
    reporter: 'spec',
    timeout: 420000, // 7 minutes - fetchAndActivate takes 5+ sometimes
    exitOnError: true,
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
