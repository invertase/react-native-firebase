import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { OptionDefaults } from 'typedoc';

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  excludeExternals: true,
  // tsconfig: path.resolve(__dirname, 'tsconfig-typedoc.json'),
  entryPointStrategy: 'packages',
  name: 'React Native Firebase',
  entryPoints: [
    'packages/app',
    'packages/ai',
    'packages/analytics',
    'packages/app-check',
    'packages/app-distribution',
    'packages/auth',
    'packages/crashlytics',
    'packages/database',
    'packages/firestore',
    'packages/functions',
    'packages/in-app-messaging',
    'packages/installations',
    'packages/messaging',
    'packages/ml',
    'packages/perf',
    'packages/remote-config',
    'packages/storage',
  ],
  out: path.resolve(process.cwd(), 'docs/reference'),
  cleanOutputDir: true,
  // includeHierarchySummary: true, // Maybe this is useful? Maybe not?
  fileExtension: '.mdx',
  router: 'module',
  plugin: ['typedoc-plugin-markdown'],
  blockTags: [...OptionDefaults.blockTags, '@firebase', '@ios', '@android', '@platform', '@link'],
  preservedTypeAnnotationTags: ['@firebase'],
  sourceLinkExternal: true,
  markdownLinkExternal: true,

  navigation: {
    includeFolders: true,
    includeCategories: true,
    includeGroups: true,
    excludeReferences: false,
  },
  categorizeByGroup: false,
  sortEntryPoints: false,
  excludeExternals: true,
  useFirstParagraphOfCommentAsSummary: true,
  searchInComments: true,
  hideGenerator: true,
  cleanOutputDir: true,
  titleLink: 'https://github.com/invertase/react-native-firebase',
  navigationLinks: {
    GitHub: 'https://github.com/invertase/react-native-firebase',
    npm: 'https://www.npmjs.com/search?q=scope%3Areact-native-firebase',
  },
  sidebarLinks: {
    Documentation: 'https://rnfirebase.io',
  },
  packageOptions: {
    excludeExternals: true,
    excludePrivate: true,
    readme: 'none',
    skipErrorChecking: true,
    gitRevision: 'main',
    groupOrder: ['Functions', '*'],
  },
  externalSymbolLinkMappings: {
    '@firebase/app': {
      FirebaseApp: 'https://firebase.google.com/docs/reference/js/app.firebaseapp',
    },
  },
  validation: {
    notExported: false,
    invalidLink: false,
    notDocumented: false,
  },
};

export default config;
