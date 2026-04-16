import fs from 'fs';
import path from 'path';
import { describe, expect, it } from '@jest/globals';

const pluginPackages = [
  'analytics',
  'app',
  'app-check',
  'app-distribution',
  'auth',
  'crashlytics',
  'messaging',
  'perf',
] as const;

const repoRoot = path.resolve(__dirname, '../../../../');

interface ExpoPluginPackageJson {
  expo?: {
    plugin?: string;
  };
  exports?: Record<string, string>;
}

function readPackageJson(pkg: (typeof pluginPackages)[number]): ExpoPluginPackageJson {
  const packageJsonPath = path.resolve(repoRoot, 'packages', pkg, 'package.json');

  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as ExpoPluginPackageJson;
  } catch (error) {
    throw new Error(`Failed to read ${pkg}/package.json: ${String(error)}`);
  }
}

describe('Expo config plugin package manifests', function () {
  it.each(pluginPackages)('%s declares app.plugin.js for Expo tooling', function (pkg) {
    const packageJsonPath = path.resolve(repoRoot, 'packages', pkg, 'package.json');
    const pluginEntryPath = path.resolve(repoRoot, 'packages', pkg, 'app.plugin.js');

    expect(fs.existsSync(packageJsonPath)).toBe(true);
    expect(fs.existsSync(pluginEntryPath)).toBe(true);

    const manifest = readPackageJson(pkg);

    expect(manifest.expo).toMatchObject({
      plugin: './app.plugin.js',
    });

    // Older JS packages do not declare an exports map yet, but any package that does
    // must keep the config plugin subpath available for Expo's resolver.
    if (manifest.exports) {
      expect(manifest.exports['./app.plugin.js']).toBe('./app.plugin.js');
    }
  });
});
