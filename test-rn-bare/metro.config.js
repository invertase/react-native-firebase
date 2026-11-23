const fs = require('fs');
const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Yarn workspaces with nmHoistingLimits keep @react-native-firebase/* as a
 * symlink from this app's node_modules to packages/*. Metro's project root is
 * this directory, so that symlink points outside the file map and the package
 * name fails to resolve (Unable to resolve module @react-native-firebase/app).
 * Watch the package directories and redirect those names there, the same way
 * tests/metro.config.js does for the e2e app.
 */
const packagesDir = path.resolve(__dirname, '../packages');
const packageDirs = fs
  .readdirSync(packagesDir)
  .map(name => path.join(packagesDir, name))
  .filter(dir => fs.statSync(dir).isDirectory());

const config = {
  watchFolders: packageDirs,
  resolver: {
    // CI sets CI=1. Watchman's project root is the monorepo, and a symlink
    // from this app into packages/ is then outside Metro's file map.
    useWatchman: !process.env.CI,
    disableHierarchicalLookup: true,
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../node_modules'),
    ],
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (typeof name !== 'string' || !name.startsWith('@react-native-firebase/')) {
            return undefined;
          }
          const packageName = name.slice('@react-native-firebase/'.length);
          if (packageName === '' || packageName.includes('..')) {
            return undefined;
          }
          return path.join(packagesDir, packageName);
        },
      },
    ),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
