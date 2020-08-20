const path = require('path');
const fs = require('fs');
const toJson = require('js-yaml');

module.exports = async function sourceSidebar({
  reporter,
  actions,
  createContentDigest,
  createNodeId,
}) {
  try {
    const yaml = fs.readFileSync(
      path.resolve(__dirname, '../../docs/sidebar.yaml'),
      'utf8'
    );
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
