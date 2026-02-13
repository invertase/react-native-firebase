import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { OptionDefaults } from 'typedoc';

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  excludeExternals: true,
  tsconfig: path.resolve(__dirname, 'tsconfig-typedoc.json'),
  entryPointStrategy: 'expand',
  entryPoints: [
    'packages/*/lib/modular/*ts',
    'packages/*/lib/modular.ts',
    'packages/*ai/lib/index.ts',
    'packages/app/lib/utils/*.ts',
  ],
  out: path.resolve(process.cwd(), 'docs/reference'),
  cleanOutputDir: true,
  // includeHierarchySummary: true, // Maybe this is useful? Maybe not?
  fileExtension: '.mdx',
  router: 'module',
  plugin: ['typedoc-plugin-markdown'],
  blockTags: [...OptionDefaults.blockTags, '@firebase', '@ios', '@android', '@platform', '@link'],
  preservedTypeAnnotationTags: ['@firebase'],
  hideGenerator: true,
  gitRevision: 'main',
  sourceLinkExternal: true,
  markdownLinkExternal: true,
};

export default config;
