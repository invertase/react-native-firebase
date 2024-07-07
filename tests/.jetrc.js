module.exports = {
  config: {
    slow: 3000,
    reporter: 'spec',
    timeout: 300000, // 5 minutes
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
