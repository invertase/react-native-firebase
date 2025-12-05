module.exports = {
  reactNativePath: './node_modules/react-native',
  project: {
    ios: {
      sourceDir: './ios',
      // Required for using test app with turbo-modules
      // automaticPodsInstallation: false,
    },
    macos: {
      sourceDir: './macos',
    },
  },
};
