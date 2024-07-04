module.exports = {
  config: {
    slow: 3000,
    reporter: 'spec',
    timeout: 2000000,
    // TODO bail & retries not currently supported on jet (config needs passing through to mocha)
    // retries: 4,
    // bail: true,
    exitOnError: true,
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
  },
};
