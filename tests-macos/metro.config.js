/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const { resolve, join, dirname } = require('path');
const { readdirSync, statSync, existsSync } = require('fs');

const exclusionList = require('metro-config/src/defaults/exclusionList');

const rootDir = resolve(__dirname, '..');
const sharedTestsDir = resolve(rootDir, 'tests');
const packagesDir = resolve(rootDir, 'packages');

const isDirectory = source => statSync(source).isDirectory();
const firebaseModules = readdirSync(packagesDir)
  .map(name => join(packagesDir, name))
  .filter(isDirectory);

// Force React/scheduler from this app. Shared harness under ../tests would otherwise
// resolve a second copy from tests/node_modules (Invalid hook call). extraNodeModules
// may fall back into that tree for harness-only deps; do not blocklist all of it.
const SINGLETON_FROM_APP = new Set([
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react/compiler-runtime',
  'scheduler',
]);

const config = {
  projectRoot: __dirname,
  resolver: {
    useWatchman: !process.env.CI,
    blocklist: exclusionList([
      /.*\/__fixtures__\/.*/,
      /.*\/template\/project\/node_modules\/react-native\/.*/,
      new RegExp(`^${escape(resolve(rootDir, 'docs'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests/ios'))}\\/.*$`),
      new RegExp(
        `^${escape(resolve(rootDir, 'packages/template/project/node_modules/react-native'))}\\/.*$`,
      ),
      new RegExp(`^${escape(resolve(rootDir, 'tests/e2e'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests/android'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests/functions'))}\\/.*$`),
      new RegExp(`^${escape(resolve(rootDir, 'tests-macos/macos'))}\\/.*$`),
    ]),
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (typeof name !== 'string') {
            return target[name];
          }
          if (name && name.startsWith && name.startsWith('@react-native-firebase')) {
            const packageName = name.replace('@react-native-firebase/', '');
            return join(rootDir, `packages/${packageName}`);
          }
          const local = join(__dirname, `node_modules/${name}`);
          if (existsSync(local)) {
            return local;
          }
          // Harness-only transitive deps live under tests/. Local-first above;
          // this path is not blocklisted (React/scheduler still SINGLETON_FROM_APP).
          return join(sharedTestsDir, `node_modules/${name}`);
        },
      },
    ),
    resolveRequest(context, moduleName, platform) {
      if (SINGLETON_FROM_APP.has(moduleName)) {
        return {
          type: 'sourceFile',
          filePath: require.resolve(moduleName, { paths: [__dirname] }),
        };
      }
      // Shared harness may require ./harness.overrides.js from ../tests.
      // When absent, resolve to the committed stub so Metro's dependency map stays intact.
      if (moduleName === './harness.overrides.js') {
        const originDir = context.originModulePath
          ? dirname(context.originModulePath)
          : sharedTestsDir;
        if (!existsSync(resolve(originDir, 'harness.overrides.js'))) {
          return {
            type: 'sourceFile',
            filePath: resolve(sharedTestsDir, 'harness.overrides.stub.js'),
          };
        }
      }
      if (moduleName === '@react-native-firebase/firestore/pipelines') {
        const filePath = join(rootDir, 'packages', 'firestore', 'lib', 'pipelines', 'index.ts');
        return { type: 'sourceFile', filePath };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
  transformer: {
    unstable_allowRequireContext: true,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  watchFolders: [__dirname, sharedTestsDir, ...firebaseModules],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
