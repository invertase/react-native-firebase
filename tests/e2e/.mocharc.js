'use strict';

module.exports = {
  recursive: true,
  timeout: 720000,
  reporter: 'spec',
  slow: 2000,
  retries: 2,
  bail: true,
  exit: true,
  recursive: true,
  require: 'node_modules/jet/platform/node',
  spec: [
    '../packages/app/e2e/*.e2e.js',
    '../packages/analytics/e2e/*.e2e.js',
    '../packages/auth/e2e/*.e2e.js',
    '../packages/crashlytics/e2e/*.e2e.js',
    '../packages/database/e2e/**/*.e2e.js',
    '../packages/dynamic-links/e2e/*.e2e.js',
    '../packages/firestore/e2e/**/*.e2e.js',
    '../packages/functions/e2e/*.e2e.js',
    '../packages/perf/e2e/*.e2e.js',
    '../packages/messaging/e2e/*.e2e.js',
    '../packages/ml/e2e/*.e2e.js',
    '../packages/in-app-messaging/e2e/*.e2e.js',
    '../packages/remote-config/e2e/*.e2e.js',
    '../packages/storage/e2e/*.e2e.js',
  ],
};
