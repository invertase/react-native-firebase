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

const babel = require('@babel/core');
const mdx = require('@mdx-js/mdx');
const prism = require('@mapbox/rehype-prism');
const headers = require('remark-autolink-headings');
const slug = require('slug');

// Use Babel to transform JSX into JS
function transformJsx(jsx) {
  return babel.transform(jsx, {
    plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-proposal-object-rest-spread'],
  }).code;
}

// Transform any Markdown (MDX) into a JS string which can then be used on the client
// with the Markdown.Raw component
function transformMdx(mdxCode) {
  const transformed = docCommentsToMarkdown(mdxCode);
  const jsx = mdx.sync(transformed, {
    skipExport: true,
    rehypePlugins: [prism],
    remarkPlugins: [headers],
  });
  return transformJsx(jsx);
}

const linkRegex = /{@link\s([a-zA-Z.#]*)}/gm; // {@link module.Class#hash}
function docCommentsToMarkdown(string) {
  let transformed = string;

  let m;
  while ((m = linkRegex.exec(string)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === linkRegex.lastIndex) {
      linkRegex.lastIndex++;
    }

    const foundLink = m[0]; //{@link analytics.BeginCheckoutEventParameters#foo}
    const rawLink = m[1]; // analytics.BeginCheckoutEventParameters#foo

    let url = '';
    let title = '';

    const [module, entity] = rawLink.split('.');

    if (!entity) {
      title = `\`${module}\``;
      url = `/reference/${module}`;
    } else {
      const [entityName, hash] = entity.split('#');
      title = `\`${entity}\``;
      url = `/reference/${module}/${entityName.toLowerCase()}`;
      if (hash) url = `${url}#${hash}`;
    }
    transformed = transformed.replace(foundLink, `[${title}](${url})`);
  }

  return transformed;
}

/**
 * TypeDoc returns code comments in 2 forms, shortText (first line) and text (bulk content).
 *
 * The output of this on TypeDoc is Markdown. As we are using MDX, we can transform the Markdown
 * to MDX output (JSX, using Babel) and then convert the JSX into raw JavaScript which we can inject
 * into our page.
 *
 * This is what the gatsby-plugin-mdx does under the hood for markdown files, but as we're manually
 * extracting this from TypeDoc, we need to do it manually.
 */
module.exports.extractComments = function extractComments(comment = {}) {
  return {
    // Keep reference to the first line as raw text. This can be later used for place which dont
    // support HTML/JavaScript (such as a meta description).
    excerpt: comment.shortText || '',
    // The first line of the code block, as JS output.
    description: transformMdx(comment.shortText || ''),
    // The main content as JS output.
    mdx: transformMdx(comment.text || ''),
    // Any tags, e.g. "@platform android"
    tags: comment.tags ? comment.tags : [],
  };
};

module.exports.camelCaseToDash = function camelCaseToDash(myStr) {
  return myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

module.exports.extractSourceFile = function extractSourceFile(sources = []) {
  return sources.map(source => {
    if (!source) return '';
    if (source.fileName.includes('node_modules')) return '';
    return `https://github.com/invertase/react-native-firebase/blob/master/${
      source.fileName
    }#L${source.line || 0}`;
  });
};

module.exports.extractCommonEntityProps = function extractCommonEntityProps(entity) {
  const props = {
    id: entity.id.toString(), // GQL node IDs must be strings
    name: entity.name,
    hash: slug(entity.name),
  };

  if (entity.flags) {
    if (entity.flags.hasOwnProperty('isOptional')) {
      props.optional = !!entity.flags.isOptional;
    }
    if (entity.flags.hasOwnProperty('isPrivate')) {
      props.private = !!entity.flags.isPrivate;
    }
  }

  return props;
};

module.exports.extractInherited = function extractInherited(inheritedFrom = {}) {
  let value = '';
  if (inheritedFrom.id) value = inheritedFrom.name.replace('.', '#');
  return {
    inherited: value,
  };
};
