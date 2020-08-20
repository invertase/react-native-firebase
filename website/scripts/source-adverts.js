const path = require('path');
const fs = require('fs');

module.exports = async function sourceAdverts({
  reporter,
  actions,
  createContentDigest,
  createNodeId,
}) {
  try {
    const adsFile = fs.readFileSync(
      path.resolve(__dirname, '../adverts.json'),
      'utf8'
    );
    const ads = JSON.parse(adsFile);

    ads.forEach((ad) => {
      actions.createNode({
        ...ad,
        id: createNodeId(ad.url),
        internal: {
          type: 'Advert',
          contentDigest: createContentDigest(ads),
        },
      });
    });
  } catch (e) {
    reporter.panic(e);
  }
};
