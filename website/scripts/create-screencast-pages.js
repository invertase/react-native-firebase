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

module.exports = async function createScreencastPages({ graphql, actions }) {
  const { data } = await graphql(`
    {
      allScreenCast {
        nodes {
          slug
          id
        }
      }
    }
  `);

  const nodes = data.allScreenCast.nodes;

  nodes.forEach(({ id, slug }, index) => {
    let next = '';
    let previous = '';

    // If it's the first entity & others exist, set the next slug
    if (index === 0 && nodes.length > 1) {
      next = nodes[index + 1].slug;
    }

    // Set next/previous slugs
    if (index > 0 && index + 1 < nodes.length) {
      next = nodes[index + 1].slug;
      previous = nodes[index - 1].slug;
    }

    // If it's the last entity & others exist, set the next slug
    if (index + 1 === nodes.length && nodes.length > 1) {
      previous = nodes[index - 1].slug;
    }

    actions.createPage({
      path: slug,
      component: path.resolve('./src/templates/screencast.tsx'),
      context: {
        id: id,
        next: next,
        previous: previous,
      },
    });
  });
};
