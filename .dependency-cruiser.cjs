const fs = require('fs');
const path = require('path');

const tsconfigDepcruisePath = path.join(__dirname, 'tsconfig.depcruise.json');
const appLib = 'packages/app/lib';
const packagesDir = path.join(__dirname, 'packages');

const packageNames = fs
  .readdirSync(packagesDir)
  .filter(
    entry =>
      fs.statSync(path.join(packagesDir, entry)).isDirectory() &&
      fs.existsSync(path.join(packagesDir, entry, 'lib')),
  );

const paths = {
  '@react-native-firebase/app/dist/module/common/*': [`${appLib}/common/*`],
  '@react-native-firebase/app/dist/module/common': [`${appLib}/common`],
  '@react-native-firebase/app/dist/module/internal/web/*': [`${appLib}/internal/web/*`],
  '@react-native-firebase/app/dist/module/internal/*': [`${appLib}/internal/*`],
  '@react-native-firebase/app/dist/module/internal': [`${appLib}/internal`],
  '@react-native-firebase/app/dist/module/types/internal': [`${appLib}/types/internal`],
  '@react-native-firebase/app/dist/module/types/common': [`${appLib}/types/common`],
  '@react-native-firebase/app': [appLib],
};

for (const pkg of packageNames) {
  if (pkg === 'app') {
    continue;
  }
  const lib = `packages/${pkg}/lib`;
  paths[`@react-native-firebase/${pkg}`] = [lib];
  paths[`@react-native-firebase/${pkg}/*`] = [`${lib}/*`];
}

fs.writeFileSync(
  tsconfigDepcruisePath,
  `${JSON.stringify(
    {
      extends: './tsconfig.packages.base.json',
      compilerOptions: {
        baseUrl: '.',
        moduleResolution: 'node',
        noEmit: true,
        paths,
      },
      include: ['packages/*/lib/**/*.ts'],
      exclude: [
        'node_modules',
        'packages/*/__tests__',
        'packages/*/e2e',
        'packages/*/plugin',
        '**/*.test.ts',
      ],
    },
    null,
    2,
  )}\n`,
);

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      scope: 'folder',
      comment: 'Circular dependencies bloat bundle size and break module initialization order.',
      from: { path: '^packages/[^/]+/lib$' },
      to: { circular: true },
    },
    {
      name: 'not-to-own-dist',
      severity: 'error',
      scope: 'module',
      comment:
        'Do not import your own package built output via relative ../dist or ./dist paths. ' +
        'The hub API @react-native-firebase/app/dist/module/... is mapped to lib and is allowed.',
      from: { path: '^packages/([^/]+)/lib' },
      to: { path: '^packages/$1/dist' },
    },
    {
      name: 'hub-no-internal',
      severity: 'error',
      comment: 'app is the hub — it must not import other internal packages.',
      from: { path: '^packages/app/lib/' },
      to: {
        path: '^packages/[^/]+/lib/',
        pathNot: '^packages/app/lib/',
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'satellites-only-hub',
      severity: 'error',
      comment: 'Plain satellites may import @react-native-firebase/app (and its subpaths) only.',
      from: {
        path: '^packages/([^/]+)/lib/',
        pathNot: '^packages/(?:app|ai|vertexai)/lib/',
      },
      to: {
        path: '^packages/([^/]+)/lib/',
        pathNot: ['^packages/$1/lib/', '^packages/app/lib/'],
        dependencyTypesNot: ['type-only', 'require'],
      },
    },
    {
      name: 'satellites-only-hub-require',
      severity: 'error',
      comment:
        'Dynamic require between satellites is forbidden (crashlytics→analytics optional integration excluded).',
      from: {
        path: '^packages/([^/]+)/lib/',
        pathNot: '^packages/(?:app|ai|vertexai|crashlytics)/lib/',
      },
      to: {
        path: '^packages/([^/]+)/lib/',
        pathNot: ['^packages/$1/lib/', '^packages/app/lib/'],
        dependencyTypes: ['require'],
      },
    },
    {
      name: 'ai-graph',
      severity: 'error',
      comment: 'ai may import app, auth, and app-check (and their subpaths).',
      from: { path: '^packages/ai/lib/' },
      to: {
        path: '^packages/([^/]+)/lib/',
        pathNot: '^packages/(?:app|auth|app-check|ai)/lib/',
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'vertexai-graph',
      severity: 'error',
      comment: 'vertexai may import ai (and hub app transitively); not other satellites.',
      from: { path: '^packages/vertexai/lib/' },
      to: {
        path: '^packages/([^/]+)/lib/',
        pathNot: '^packages/(?:ai|app|vertexai)/lib/',
        dependencyTypesNot: ['type-only'],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules|packages/[^/]+/(dist|__tests__|e2e|plugin)',
    },
    includeOnly: {
      path: '^packages/[^/]+/(lib|dist)/',
    },
    exclude: {
      path: 'packages/app/lib/internal/web/memidb',
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.depcruise.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
