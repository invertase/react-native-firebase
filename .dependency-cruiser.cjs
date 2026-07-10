const fs = require('fs');
const path = require('path');

const tsconfigDepcruisePath = path.join(__dirname, 'tsconfig.depcruise.json');
const appLib = 'packages/app/lib';

fs.writeFileSync(
  tsconfigDepcruisePath,
  `${JSON.stringify(
    {
      extends: './tsconfig.packages.base.json',
      compilerOptions: {
        baseUrl: '.',
        moduleResolution: 'node',
        noEmit: true,
        paths: {
          '@react-native-firebase/app/dist/module/common/*': [`${appLib}/common/*`],
          '@react-native-firebase/app/dist/module/common': [`${appLib}/common`],
          '@react-native-firebase/app/dist/module/internal/web/*': [`${appLib}/internal/web/*`],
          '@react-native-firebase/app/dist/module/internal/*': [`${appLib}/internal/*`],
          '@react-native-firebase/app/dist/module/internal': [`${appLib}/internal`],
          '@react-native-firebase/app/dist/module/types/internal': [`${appLib}/types/internal`],
          '@react-native-firebase/app/dist/module/types/common': [`${appLib}/types/common`],
          '@react-native-firebase/app': [appLib],
          '@react-native-firebase/auth': ['packages/auth/lib'],
          '@react-native-firebase/app-check': ['packages/app-check/lib'],
          '@react-native-firebase/ai': ['packages/ai/lib'],
        },
      },
      include: ['packages/*/lib/**/*.ts'],
      exclude: [
        'node_modules',
        'packages/*/dist',
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
      comment:
        'Circular dependencies bloat bundle size and break module initialization order.',
      from: { path: '^packages/[^/]+/lib$' },
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules|packages/[^/]+/(dist|__tests__|e2e|plugin)',
    },
    includeOnly: {
      path: '^packages/[^/]+/lib/.*\\.tsx?$',
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
    collapse: '^packages/[^/]+/',
  },
};
