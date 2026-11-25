import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterAll, describe, expect, it } from '@jest/globals';

import { REACT_PRODUCTS } from './fixture';

const PACKAGES = path.resolve(__dirname, '..', '..', '..');

// Native iOS packages are the ones with a podspec; phone-number-verification has an ios/ folder
// holding only codegen output and no podspec.
const nativeIosPackages = fs
  .readdirSync(PACKAGES)
  .filter(folder => fs.existsSync(path.join(PACKAGES, folder, 'ios')))
  .filter(folder => fs.readdirSync(path.join(PACKAGES, folder)).some(f => f.endsWith('.podspec')));
const stubPackages = nativeIosPackages.filter(folder => folder !== 'app');

interface PluginModule {
  default?: unknown;
  plugin?: unknown;
}

function declaredPlugins(folder: string) {
  const root = path.join(PACKAGES, folder);
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const config = require(path.join(root, 'react-native.config.js'));
  const fromPackageJson: unknown = packageJson.swiftpmConfig?.autolinkingPlugin;
  const fromConfig: unknown = config.spm?.autolinkingPlugin;
  return {
    fromPackageJson:
      typeof fromPackageJson === 'string' ? path.resolve(root, fromPackageJson) : fromPackageJson,
    fromConfig: typeof fromConfig === 'string' ? path.resolve(root, fromConfig) : fromConfig,
  };
}

const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-spm-stub-')));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

const stubContext = {
  appRoot: path.join(tmp, 'ios'),
  projectRoot: tmp,
  reactNativeRoot: path.join(tmp, 'react-native'),
  outputDir: path.join(tmp, 'ios', 'build', 'generated', 'autolinking'),
  autolinking: { dependencies: {} },
  react: {
    packageRef: { name: 'ReactNative', path: path.join(tmp, 'xcframeworks') },
    products: REACT_PRODUCTS,
  },
};

describe('SwiftPM autolinking plugin declarations', () => {
  it('declares the app plugin in package.json and react-native.config.js', () => {
    const builtPlugin = path.join(PACKAGES, 'app', 'spm', 'build', 'index.js');
    expect(declaredPlugins('app')).toEqual({
      fromPackageJson: builtPlugin,
      fromConfig: builtPlugin,
    });
  });

  describe.each(stubPackages)('@react-native-firebase/%s', folder => {
    it('declares the same stub plugin in package.json and react-native.config.js', () => {
      const { fromPackageJson, fromConfig } = declaredPlugins(folder);

      expect(typeof fromPackageJson).toBe('string');
      expect(fromConfig).toBe(fromPackageJson);
      expect((fromPackageJson as string).startsWith(path.join(PACKAGES, folder) + path.sep)).toBe(
        true,
      );
      expect(fs.existsSync(fromPackageJson as string)).toBe(true);
    });

    it('stub plugin contributes nothing', () => {
      const { fromPackageJson } = declaredPlugins(folder);
      expect(typeof fromPackageJson).toBe('string');
      const loaded: unknown = require(fromPackageJson as string);
      const plugin =
        typeof loaded === 'function'
          ? loaded
          : ((loaded as PluginModule).default ?? (loaded as PluginModule).plugin);
      expect(typeof plugin).toBe('function');

      const result = (plugin as (context: unknown) => Record<string, unknown> | null | undefined)(
        stubContext,
      );
      for (const field of [
        'packageDependencies',
        'productDependencies',
        'scriptPhases',
        'watchPaths',
        'generatedSources',
        'flavoredFrameworks',
      ]) {
        expect(result?.[field] ?? []).toEqual([]);
      }
    });
  });
});
