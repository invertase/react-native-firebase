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
  },
};
