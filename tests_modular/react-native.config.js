const {resolve} = require('path');

module.exports = {
  dependencies: {
    '@react-native-firebase/app-exp': {
      root: resolve('..', 'packages', 'app', 'modular'),
    },
    '@react-native-firebase/storage-exp': {
      root: resolve('..', 'packages', 'storage', 'modular'),
    },
  },
};
