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

const path = require('path');
const fs = require('fs');
const toJson = require('js-yaml');

module.exports = async function sourceSidebar({ reporter, actions, createContentDigest }) {
  try {
    const yaml = fs.readFileSync(path.resolve(__dirname, '../../docs/sidebar.yaml'), 'utf8');
    const json = toJson.safeLoad(yaml);

    actions.createNode({
      type: 'documentation',
      raw: JSON.stringify(json),
      id: 'sidebar-documentation',
      internal: {
        type: 'Sidebar',
        contentDigest: createContentDigest(json),
      },
    });
  } catch (e) {
    reporter.panic(e);
  }
};
