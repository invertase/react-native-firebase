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

module.exports = async function createDocumentationPages({ graphql, actions }) {

  const { data } = await graphql(`
    {
      allMdx {
        nodes {
          id
          fields {
            next
            previous
            slug
            redirect
          }
        }
      }
    }
  `);

  data.allMdx.nodes.map(async ({ id, fields }) => {
    if (!fields) return;

    if (fields.redirect) {
      actions.createRedirect({
        fromPath: fields.slug,
        toPath: fields.redirect,
        isPermanent: true,
        redirectInBrowser: true, // Without this, client redirects don't work
      });
      actions.createRedirect({
        fromPath: fields.slug + '/',
        toPath: fields.redirect,
        isPermanent: true,
        redirectInBrowser: true,
      });
      return;
    }

    let component = path.resolve('./src/templates/documentation.tsx')


    if(fields.slug.includes("/json-config")){
      component = path.resolve('./src/templates/json-config.tsx')
    }

    actions.createPage({
      path: fields.slug || '/',
      component,
      context: {
        id: id,
        next: fields.next,
        previous: fields.previous,
      },
    });
  });
};
