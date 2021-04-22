/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const {resolve, join} = require('path');
const {readdirSync, existsSync} = require('fs');

const exclusionList = require('metro-config/src/defaults/exclusionList');

const rootDir = resolve(__dirname, '..');
const packagesDir = resolve(rootDir, 'packages');

const isDirectory = source => {
  const path = join(source, 'modular', 'src');
  return existsSync(path);
};
const firebaseModules = readdirSync(packagesDir)
  .map(name => join(packagesDir, name))
  .filter(isDirectory)
  .map(name => join(name, 'modular'));

module.exports = {
  projectRoot: __dirname,
  resolver: {
    useWatchman: !process.env.CI,
    blocklist: exclusionList([
      /.*\/__fixtures__\/.*/,
      new RegExp(`^${escape(resolve(rootDir, 'docs'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests/ios'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests/e2e'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests/android'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests/functions'))}\\/.*$`),
    ]),
    resolveRequest: (context, realModuleName, platform, moduleName) => {
      console.log(context, realModuleName, platform, moduleName);
    },
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (typeof name !== 'string') {
            return target[name];
          }
          if (
            name &&
            name.startsWith &&
            name.startsWith('@react-native-firebase-modular')
          ) {
            const packageName = name.replace(
              '@react-native-firebase-modular/',
              '',
            );
            return join(__dirname, `../packages/${packageName}/modular`);
          }
          return join(__dirname, `node_modules/${name}`);
        },
      },
    ),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  server: {
    runInspectorProxy: !process.env.CI,
  },
  watchFolders: [resolve(__dirname, '.'), ...firebaseModules],
};
