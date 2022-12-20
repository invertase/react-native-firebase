import fs from 'fs/promises';
import path from 'path';
import { beforeAll, describe, expect, it } from '@jest/globals';

import { applyPlugin } from '../src/android/applyPlugin';
import { setBuildscriptDependency } from '../src/android/buildscriptDependency';

describe('Crashlytics Plugin Android Tests', function () {
  let appBuildGradle: string;
  let projectBuildGradle: string;

  beforeAll(async function () {
    projectBuildGradle = await fs.readFile(
      path.resolve(__dirname, './fixtures/project_build.gradle'),
      { encoding: 'utf-8' },
    );

    appBuildGradle = await fs.readFile(path.resolve(__dirname, './fixtures/app_build.gradle'), {
      encoding: 'utf-8',
    });
  });

  it('applies crashlytics classpath to project build.gradle', async function () {
    const result = setBuildscriptDependency(projectBuildGradle);
    expect(result).toMatchSnapshot();
  });

  it('applies crashlytics plugin to app/build.gradle', async function () {
    const result = applyPlugin(appBuildGradle);
    expect(result).toMatchSnapshot();
  });
});
