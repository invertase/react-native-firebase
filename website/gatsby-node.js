const path = require('path');

exports.sourceNodes = async (...args) => {
  await require('./scripts/source-sidebar')(...args);
  await require('./scripts/source-adverts')(...args);
  await require('./scripts/source-screencasts')(...args);
  await require('./scripts/source-reference')(...args);
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
