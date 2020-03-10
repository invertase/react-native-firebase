const { resolve, join } = require('path');
const { createBlacklist } = require('metro');
const { mergeConfig } = require('metro-config');
const { DEFAULT } = require('react-native/local-cli/util/Config');

// https://github.com/facebook/react-native/blob/master/local-cli/core/Constants.js
// https://github.com/facebook/react-native/blob/master/local-cli/util/Config.js
const config = {
  resolver: {
    blackListRE: createBlacklist([
      new RegExp(`^${escape(resolve(__dirname, '..', 'node_modules'))}\\/.*$`),
    ]),
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (name === 'react-native-firebase') {
            return join(__dirname, `../src`);
          }
          return join(__dirname, `node_modules/${name}`);
        },
      }
    ),
    platforms: ['android', 'ios'],
  },
  watchFolders: [resolve(__dirname, '../src')],
};

module.exports = mergeConfig(DEFAULT, config);
