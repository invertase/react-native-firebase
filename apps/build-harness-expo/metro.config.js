const {existsSync, readFileSync, readdirSync, statSync} = require('fs');
const {join, resolve} = require('path');
const {getDefaultConfig} = require('expo/metro-config');

const rootDir = resolve(__dirname, '../..');
const packagesDir = resolve(rootDir, 'packages');
const localConfigPath = resolve(__dirname, '.build-harness.local.json');

let rnfbSource = 'workspace';
if (existsSync(localConfigPath)) {
  try {
    const localConfig = JSON.parse(readFileSync(localConfigPath, 'utf8'));
    if (localConfig.rnfbSource === 'published') {
      rnfbSource = 'published';
    }
  } catch (_error) {
    // Fall back to workspace mode when the local config is missing or invalid.
  }
}

const firebasePackages = readdirSync(packagesDir)
  .map(name => join(packagesDir, name))
  .filter(source => statSync(source).isDirectory());

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  extraNodeModules: new Proxy(
    {},
    {
      get: (_, name) => {
        if (
          rnfbSource === 'workspace' &&
          typeof name === 'string' &&
          name.startsWith('@react-native-firebase/')
        ) {
          return join(
            rootDir,
            'packages',
            name.replace('@react-native-firebase/', ''),
          );
        }

        return join(__dirname, 'node_modules', name);
      },
    },
  ),
  resolveRequest(context, moduleName, platform) {
    if (
      rnfbSource === 'workspace' &&
      moduleName === '@react-native-firebase/firestore/pipelines'
    ) {
      return {
        type: 'sourceFile',
        filePath: join(
          rootDir,
          'packages',
          'firestore',
          'lib',
          'pipelines',
          'index.ts',
        ),
      };
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

config.watchFolders =
  rnfbSource === 'workspace'
    ? [resolve(__dirname, '.'), ...firebasePackages]
    : [resolve(__dirname, '.')];

module.exports = config;
