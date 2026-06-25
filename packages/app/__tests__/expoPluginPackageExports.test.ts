import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from '@jest/globals';

const REPO_ROOT = join(__dirname, '..', '..', '..');
const PACKAGES_DIR = join(REPO_ROOT, 'packages');

/**
 * Canonical list of packages that ship an Expo config plugin (`app.plugin.js`).
 * Update deliberately when adding a new plugin package.
 */
const PACKAGES_WITH_EXPO_CONFIG_PLUGIN = [
  'analytics',
  'app',
  'app-check',
  'app-distribution',
  'auth',
  'crashlytics',
  'messaging',
  'perf',
] as const;

const APP_PLUGIN_EXPORT = './app.plugin.js';

function discoverPackageNamesWithAppPlugin(): string[] {
  return readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => existsSync(join(PACKAGES_DIR, name, 'app.plugin.js')));
}

function readPackageJson(packageDir: string): { exports?: Record<string, unknown> } {
  return JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
}

describe('Expo config plugin package exports', function () {
  it('matches the canonical list of packages with app.plugin.js', function () {
    const discovered = discoverPackageNamesWithAppPlugin().sort();
    const expected = [...PACKAGES_WITH_EXPO_CONFIG_PLUGIN].sort();

    expect(discovered).toEqual(expected);
  });

  describe.each(PACKAGES_WITH_EXPO_CONFIG_PLUGIN)('%s', function (name) {
    const dir = join(PACKAGES_DIR, name);

    it('exports ./app.plugin.js from package.json', function () {
      const pkg = readPackageJson(dir);

      expect(pkg.exports?.[APP_PLUGIN_EXPORT]).toBe(APP_PLUGIN_EXPORT);
    });

    it('has app.plugin.js at the package root', function () {
      expect(existsSync(join(dir, 'app.plugin.js'))).toBe(true);
    });
  });
});
