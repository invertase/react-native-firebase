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

exports.sourceNodes = async (...args) => {
  await require('./scripts/source-sidebar')(...args);
  await require('./scripts/source-adverts')(...args);
  await require('./scripts/source-screencasts')(...args);
  await require('./scripts/source-reference')(...args);
  await require('./scripts/source-jsonconfig')(...args);
};

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        react: path.resolve('./node_modules/react'),
        'react-dom': path.resolve('./node_modules/react-dom'),
      },
    },
  });
};

exports.onCreateNode = async (...args) => {
  await require('./scripts/parse-mdx')(...args);
};

exports.createPages = async (...args) => {
  await require('./scripts/create-documentation-pages')(...args);
  await require('./scripts/create-reference-pages')(...args);
  await require('./scripts/create-redirects')(...args);
  await require('./scripts/create-screencast-pages')(...args);
};
