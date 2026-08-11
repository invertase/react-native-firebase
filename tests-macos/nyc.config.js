module.exports = {
  'check-coverage': false,
  lines: 95,
  statements: 95,
  functions: 95,
  branches: 95,
  include: [
    'packages/*/lib/**/*.{js,ts,tsx}',
    'packages/*/dist/**/*.js',
  ],
  exclude: [
    '**/common/lib/**',
    '**/lib/handlers.js',
    '**/internal/registry/**',
    'packages/database/lib/DatabaseSyncTree.js',
  ],
  cwd: '..',
  sourceMap: true,
  'exclude-after-remap': true,
  instrument: false,
  reporter: ['lcov', 'html', 'text-summary'],
};
