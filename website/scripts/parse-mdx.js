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


module.exports = async function parseMdx({ node, getNode, actions }) {

  if (node.internal.type !== 'Mdx') return;

  // Mdx nodes parents are a File
  const File = getNode(node.parent);

  // Skip Script Generated MDX
  if (!File.relativePath) return;

  // Create a slug for the file
  let slug = `/${File.relativePath.toLowerCase()}`;
  // Remove any index file names
  slug = slug.replace('/index', '');
  // Remove .md postfix from filenames
  slug = slug.replace('.md', '');

  const redirect = node.frontmatter.redirect || null;

  actions.createNodeField({
    node,
    name: 'slug',
    value: slug,
  });

  actions.createNodeField({
    node,
    name: 'redirect',
    value: redirect || '',
  });

  // Any pages with a redirect front-matter will only create a redirect page and nothing else
  if (redirect) return;

  const next = node.frontmatter.next || '-------';
  const previous = node.frontmatter.previous || '-------';

  actions.createNodeField({
    node,
    name: 'next',
    value: next,
  });

  actions.createNodeField({
    node,
    name: 'previous',
    value: previous,
  });
};
