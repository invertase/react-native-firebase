const {resolve} = require('path');

module.exports = {
  dependencies: {
    '@react-native-firebase-modular/app': {
      root: resolve('..', 'packages', 'app', 'modular'),
    },
  },
};
