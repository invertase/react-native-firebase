const redirects = require('../redirects.json');

module.exports = async function createRedirects({ graphql, actions }) {
  const { createRedirect } = actions;

  function setupRedirect(from, to) {
    return createRedirect({
      fromPath: from,
      toPath: to,
      redirectInBrowser: true, // only necessary for dev
      isPermanent: true,
      force: true,
    });
  }

  const { data } = await graphql(`
    {
      allModule {
        nodes {
          module
          entities {
            name
            slug
          }
        }
      }
    }
  `);

  data.allModule.nodes.forEach((node) => {
    const moduleRedirects = redirects.modules[node.module] || {};

    setupRedirect(`/v6/${node.module}/reference`, `/reference/${node.module}`);
    setupRedirect(
      `/v6/${node.module}/reference/module`,
      `/reference/${node.module}`
    );
    setupRedirect(
      `/v6/${node.module}/reference/statics`,
      `/reference/${node.module}#statics`
    );
    node.entities.forEach((entity) => {
      // redirect the reference entities
      setupRedirect(
        `/v6/${node.module}/reference/${entity.name.toLowerCase()}`,
        entity.slug
      );
    });

    // supplement common documentation pages
    Object.assign(moduleRedirects, redirects.common);

    // redirect the documentation pages
    for (const [from, to] of Object.entries(moduleRedirects)) {
      setupRedirect(
        `/v6/${node.module}/${from}`,
        `/${node.module}/${to || ''}`
      );
    }
  });
};
