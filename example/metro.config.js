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

const rootDir = resolve(__dirname, '..');

const config = {
  projectRoot: __dirname,
  resolver: {
    blackListRE: createBlacklist([
      /.*\/__fixtures__\/.*/,
      new RegExp(`^${escape(resolve(rootDir, 'example/ios'))}\\/.*$`),
    ]),
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (typeof name !== 'string') {
            return target[name];
          }
          if (name && name.startsWith && name.startsWith('@invertase/react-native-')) {
            const packageName = name.replace('@invertase/react-native-', '');
            return join(__dirname, `../`);
          }
          return join(__dirname, `node_modules/${name}`);
        },
      },
    ),
  },
  watchFolders: [rootDir],
};

module.exports = config;
