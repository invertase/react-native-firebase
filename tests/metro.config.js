/* eslint-disable import/no-extraneous-dependencies */
const { resolve, join } = require('path');
const { createBlacklist } = require('metro');
const { mergeConfig } = require('metro-config');
const { DEFAULT } = require('react-native/local-cli/util/Config');

const config = {
  projectRoot: __dirname,
  resolver: {
    resolverMainFields: ['testsMain', 'browser', 'main'],
    blackListRE: createBlacklist([
      new RegExp(`^${escape(resolve(__dirname, '..', 'docs'))}\\/.*$`),
      new RegExp(`^${escape(resolve(__dirname, '..', 'tests/node_modules'))}\\/.*$`),
      new RegExp(`^${escape(resolve(__dirname, '..', 'tests/android'))}\\/.*$`),
      new RegExp(`^${escape(resolve(__dirname, '..', 'tests/ios'))}\\/.*$`),
      new RegExp(`^${escape(resolve(__dirname, '..', 'tests/e2e'))}\\/.*$`),
      new RegExp(`^${escape(resolve(__dirname, '..', 'tests/functions'))}\\/.*$`),
    ]),
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (name === 'react-native-firebase') {
            return join(__dirname, `../packages/app`);
          }

          if (name.startsWith('@react-native-firebase')) {
            const packageName = name.replace('@react-native-firebase/', '');
            return join(__dirname, `../packages/${packageName}`);
          }

          return join(__dirname, '..', `node_modules/${name}`);
        },
      },
    ),
    platforms: ['android', 'ios'],
  },
  watchFolders: [
    resolve(__dirname, '..'),
    resolve(__dirname, '../packages/app/lib'),
    resolve(__dirname, '../packages/app-types'),
    resolve(__dirname, '../packages/common/lib'),
    resolve(__dirname, '../packages/analytics/lib'),
  ],
};

module.exports = mergeConfig(DEFAULT, config);
