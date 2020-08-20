const path = require('path');
const fs = require('fs');

module.exports = async function sourceAdverts({
  reporter,
  actions,
  createContentDigest,
  createNodeId,
}) {
  try {
    const file = fs.readFileSync(
      path.resolve(__dirname, '../../docs/screencasts.json'),
      'utf8'
    );
    const casts = JSON.parse(file);

    casts.forEach((cast) => {
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
