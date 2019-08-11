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
const { readdirSync, statSync } = require('fs');

const { createBlacklist } = require('metro');

module.exports = {
  projectRoot: __dirname,
  resolver: {
    useWatchman: !process.env.TEAMCITY_VERSION,
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
  watchFolders: [resolve(__dirname, '../src')],
};
