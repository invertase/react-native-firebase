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

  nodes.forEach(async ({ id, slug }, index) => {
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
