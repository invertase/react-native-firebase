const { resolve, join } = require('path');
const { createBlacklist } = require('metro');

const { mergeConfig } = require('metro-config');
const { DEFAULT } = require('react-native/local-cli/util/Config');
// https://github.com/facebook/react-native/blob/master/local-cli/core/Constants.js
// https://github.com/facebook/react-native/blob/master/local-cli/util/Config.js

const extraNodeModulesGetter = {
  get: (target, name) => join(__dirname, `node_modules/${name}`),
};

const config = {
  resolver: {
    blackListRE: createBlacklist([
      new RegExp(`^${escape(resolve(__dirname, '..', 'node_modules'))}\\/.*$`),
    ]),
    extraNodeModules: new Proxy({}, extraNodeModulesGetter),
  },
  watchFolders: [resolve(__dirname, '../src')],
  transformer: {
    // TODO
  },
  serializer: {
    getModulesRunBeforeMainModule: () => [
      // TODO inject Jet
    ],
  },
};

module.exports = mergeConfig(DEFAULT, config);
