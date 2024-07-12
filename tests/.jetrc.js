const { execSync, spawn } = require('child_process');

let macOsRetries = 0;

module.exports = {
  config: {
    slow: 3000,
    reporter: 'spec',
    timeout: 300000, // 5 minutes
    exitOnError: true,
    coverage: true,
  },
  targets: {
    android: {
      async before(config) {
        return config;
      },
      async after(config) {
        // no-op
      },
    },
    ios: {
      async before(config) {
        return config;
      },
      async after(config) {
        // no-op
      },
    },
    macos: {
      async before(config) {
        try {
          execSync(`killall "io.invertase.testing"`);
        } catch (e) {
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
            console.log('App crashed, retrying macOS app tests...');
            this.before(config);
            return;
          } else {
            console.error('macOS app failed to start, exiting...');
            process.exit(1);
          }
        });
        macApp.on('spawn', () => {
          console.log('[💻] macOS app started');
        });
        return config;
      },
      async after(config) {
        try {
          execSync(`killall "io.invertase.testing"`);
        } catch (e) {
          // noop
        }
      },
    },
  },
};
