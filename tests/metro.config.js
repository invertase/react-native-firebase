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

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const { resolve, join, dirname } = require('path');
const { readdirSync, statSync, existsSync } = require('fs');

const exclusionList = require('metro-config/src/defaults/exclusionList');

const rootDir = resolve(__dirname, '..');
const packagesDir = resolve(rootDir, 'packages');

const isDirectory = source => statSync(source).isDirectory();
const firebaseModules = readdirSync(packagesDir)
  .map(name => join(packagesDir, name))
  .filter(isDirectory);

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
            return join(__dirname, `../packages/${packageName}`);
          }
          return join(__dirname, `node_modules/${name}`);
        },
      },
    ),
    resolveRequest(context, moduleName, platform) {
      // The optional local harness overrides file (tests/harness.overrides.js) is
      // gitignored and usually absent. Because it is required inside a try/catch,
      // Metro treats it as an optional dependency and, when it cannot resolve,
      // OMITS it from the requiring module's dependency-id array — shifting every
      // later dependency and dropping the last one, which surfaces at runtime as
      // `Requiring unknown module "undefined"`. Resolve to a committed empty stub
      // when the local file does not exist so the dependency map stays intact.
      if (moduleName === './harness.overrides.js') {
        const originDir = context.originModulePath
          ? dirname(context.originModulePath)
          : __dirname;
        if (!existsSync(resolve(originDir, 'harness.overrides.js'))) {
          return { type: 'sourceFile', filePath: resolve(__dirname, 'harness.overrides.stub.js') };
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
  watchFolders: [resolve(__dirname, '.'), ...firebaseModules],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
