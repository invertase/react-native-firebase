/* eslint-disable import/no-extraneous-dependencies */
/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const { resolve, join } = require('path');

const { createBlacklist } = require('metro');
// const { mergeConfig } = require('metro-config');
const findPlugins = require('@react-native-community/cli/build/core/findPlugins')
  .default;

const reactNativePath = resolve(__dirname, './node_modules/react-native');

const plugins = findPlugins(__dirname);

const config = {
  projectRoot: __dirname,
  resolver: {
    platforms: ['ios', 'android', 'native'],
    resolverMainFields: ['react-native', 'browser', 'main'],
    providesModuleNodeModules: [
      'react-native',
      ...plugins.haste.providesModuleNodeModules,
    ],
    hasteImplModulePath: join(reactNativePath, 'jest/hasteImpl'),
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
  },
  serializer: {
    getModulesRunBeforeMainModule: () => [
      require.resolve(join(reactNativePath, 'Libraries/Core/InitializeCore')),
    ],
    getPolyfills: () => require(join(reactNativePath, 'rn-get-polyfills'))(),
  },
  server: {
    port: process.env.RCT_METRO_PORT || 8081,
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: true,
        inlineRequires: true,
      },
    }),
    babelTransformerPath: require.resolve(
      'metro-react-native-babel-transformer'
    ),
    assetRegistryPath: join(reactNativePath, 'Libraries/Image/AssetRegistry'),
  },
  watchFolders: [resolve(__dirname, '../src')],
};
// module.exports = mergeConfig(DEFAULT, config);
module.exports = config;
