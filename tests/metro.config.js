/* eslint-disable import/no-extraneous-dependencies */
const { resolve, join } = require('path');
const { readdirSync, statSync } = require('fs');

const { createBlacklist } = require('metro');
const { mergeConfig } = require('metro-config');
const { DEFAULT } = require('react-native/local-cli/util/Config');

const rootDir = resolve(__dirname, '..');
const packagesDir = resolve(rootDir, 'packages');

const isDirectory = source => statSync(source).isDirectory();
const firebaseModules = readdirSync(packagesDir)
  .map(name => join(packagesDir, name))
  .filter(isDirectory);
// .map(path => path.slice(path.lastIndexOf('/') + 1));

const config = {
  projectRoot: __dirname,
  resolver: {
    resolverMainFields: ['browser', 'main'],
    blackListRE: createBlacklist([
      new RegExp(`^${escape(resolve(rootDir, 'docs'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests/ios'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests/e2e'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests/android'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests/functions'))}\\/.*$`),
    ]),
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (name.startsWith('@react-native-firebase')) {
            const packageName = name.replace('@react-native-firebase/', '');
            return join(__dirname, `../packages/${packageName}`);
          }
          return join(__dirname, `node_modules/${name}`);
        },
      },
    ),
    platforms: ['android', 'ios'],
  },
  watchFolders: [resolve(__dirname, '.'), ...firebaseModules],
};

module.exports = mergeConfig(DEFAULT, config);
