/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: ['lib/**/*.d.ts'],
  plugin: ['typedoc-plugin-markdown'],
  basePath: './lib',
};
