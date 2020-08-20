module.exports = async function parseMdx({ node, getNode, actions }) {
  if (node.internal.type !== 'Mdx') return;

  // Mdx nodes parents are a File
  const File = getNode(node.parent);

  // Create a slug for the file
  let slug = `/${File.relativePath.toLowerCase()}`;
  // Remove any index file names
  slug = slug.replace('/index', '');
  // Remove .md postfix from filenames
  slug = slug.replace('.md', '');

  const redirect = node.frontmatter.redirect || null;

  actions.createNodeField({
    node,
    name: 'slug',
    value: slug,
  });

  actions.createNodeField({
    node,
    name: 'redirect',
    value: redirect || '',
  });

  // Any pages with a redirect front-matter will only create a redirect page and nothing else
  if (redirect) return;

  const next = node.frontmatter.next || '-------';
  const previous = node.frontmatter.previous || '-------';

  actions.createNodeField({
    node,
    name: 'next',
    value: next,
  });

  actions.createNodeField({
    node,
    name: 'previous',
    value: previous,
  });
};
