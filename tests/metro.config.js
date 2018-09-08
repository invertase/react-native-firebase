const { resolve } = require('path');
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
    providesModuleNodeModules: ['react-native', 'react', 'prop-types', 'fbjs'],
  },
  watchFolders: [resolve(__dirname, '../src')],
  transformer: {
    // TODO
  },
  serializer: {
    getModulesRunBeforeMainModule: () => [
      // TODO
    ],
  },
};

module.exports = mergeConfig(DEFAULT, config);
