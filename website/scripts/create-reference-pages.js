const path = require('path');

const EXCLUDE_MODULES = ['indexing']; // removed from RNFB

module.exports = async function createReferencePages({
  reporter,
  graphql,
  actions,
}) {
  const { data } = await graphql(`
    {
      allModule {
        nodes {
          id
          module
          entities {
            id
            slug
          }
        }
      }
    }
  `);

  // Page creation counter
  let referencePagesCreated = 1;

  // Create root page
  actions.createPage({
    path: '/reference',
    component: path.resolve('./src/templates/reference.tsx'),
  });

  data.allModule.nodes
    .filter(({ module }) => !EXCLUDE_MODULES.includes(module))
    .map(async ({ id, module, entities }) => {
      // Create a page for each filtered entity
      entities.forEach(({ slug, id: entityId }, index) => {
        referencePagesCreated++;

        let next = '';
        let previous = '';

        // If it's the first entity & others exist, set the next slug
        if (index === 0 && entities.length > 1) {
          next = entities[index + 1].slug;
        }

        // Set next/previous slugs
        if (index > 0 && index + 1 < entities.length) {
          next = entities[index + 1].slug;
          previous = entities[index - 1].slug;
        }

        // If it's the last entity & others exist, set the next slug
        if (index + 1 === entities.length && entities.length > 1) {
          previous = entities[index - 1].slug;
        }

        actions.createPage({
          path: slug,
          component: path.resolve('./src/templates/entity.tsx'),
          context: {
            id: entityId,
            next,
            previous,
          },
        });
      });
    });

  reporter.info(
    `Created ${referencePagesCreated} reference pages from TypeDoc`
  );
};
