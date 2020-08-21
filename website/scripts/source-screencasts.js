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

module.exports = async function sourceAdverts({
  reporter,
  actions,
  createContentDigest,
  createNodeId,
}) {
  try {
    const file = fs.readFileSync(path.resolve(__dirname, '../../docs/screencasts.json'), 'utf8');
    const casts = JSON.parse(file);

    casts.forEach(cast => {
      actions.createNode({
        ...cast,
        slug: `/screencasts/${cast.slug}`,
        id: createNodeId(cast.slug),
        internal: {
          type: 'ScreenCast',
          contentDigest: createContentDigest(cast),
        },
      });
    });
  } catch (e) {
    reporter.panic(e);
  }
};
