module.exports = {
  dependency: {
    platforms: {
      android: {
        packageImportPath: 'import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;',
      },
      ios: {
        scriptPhases: [
          {
            name: '[RNFB] Core Configuration',
            path: './ios_config.sh',
            execution_position: 'after_compile',
          },
        ],
      },
    },
  },
  commands: [
    {
      name: 'firebase',
      func: require('@react-native-firebase/cli'),
    },
  ],
};
