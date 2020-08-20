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

    actions.createPage({
      path: fields.slug || '/',
      component: path.resolve('./src/templates/documentation.tsx'),
      context: {
        id: id,
        next: fields.next,
        previous: fields.previous,
      },
    });
  });
};
