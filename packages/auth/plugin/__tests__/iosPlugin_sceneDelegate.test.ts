import fs from 'fs/promises';
import fsSync from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { WarningAggregator } from '@expo/config-plugins';
import type { AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';

import { modifySceneDelegate, generatedTag } from '../src/ios/sceneDelegate';
import { findSceneDelegateFile, usesSceneLifecycle } from '../src/ios/sceneLifecycle';
import { withOpenUrlFixForAppDelegate } from '../src/ios/openUrlFix';

const SCENE_MANIFEST_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
  <dict>
    <key>UIApplicationSceneManifest</key>
    <dict>
      <key>UIApplicationSupportsMultipleScenes</key>
      <false/>
    </dict>
  </dict>
</plist>
`;

describe('Config Plugin iOS Tests - sceneDelegate', () => {
  let tmpDir: string;

  beforeEach(async () => {
    jest.resetAllMocks();
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rnfb-scene-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe('detection', () => {
    it('finds SceneDelegate.swift nested under the project directory', async () => {
      const projectDir = path.join(tmpDir, 'HelloWorld');
      await fs.mkdir(projectDir, { recursive: true });
      const scenePath = path.join(projectDir, 'SceneDelegate.swift');
      await fs.writeFile(scenePath, 'class SceneDelegate: ExpoAppSceneDelegate {\n}\n');

      expect(findSceneDelegateFile(tmpDir)).toBe(scenePath);
      expect(usesSceneLifecycle(tmpDir)).toBe(true);
    });

    it('finds SceneDelegate.swift at the ios root (bare-expo layout)', async () => {
      const scenePath = path.join(tmpDir, 'SceneDelegate.swift');
      await fs.writeFile(scenePath, 'class SceneDelegate: ExpoAppSceneDelegate {\n}\n');

      expect(findSceneDelegateFile(tmpDir)).toBe(scenePath);
    });

    it('ignores Pods and build directories', async () => {
      const podsDir = path.join(tmpDir, 'Pods', 'SomePod');
      await fs.mkdir(podsDir, { recursive: true });
      await fs.writeFile(path.join(podsDir, 'SceneDelegate.swift'), 'class SceneDelegate {}');

      expect(findSceneDelegateFile(tmpDir)).toBeNull();
    });

    it('detects the scene lifecycle from Info.plist when SceneDelegate.swift is absent', async () => {
      const projectDir = path.join(tmpDir, 'HelloWorld');
      await fs.mkdir(projectDir, { recursive: true });
      await fs.writeFile(path.join(projectDir, 'Info.plist'), SCENE_MANIFEST_PLIST);

      expect(findSceneDelegateFile(tmpDir)).toBeNull();
      expect(usesSceneLifecycle(tmpDir)).toBe(true);
    });

    it('reports false for an app-delegate lifecycle project', async () => {
      const projectDir = path.join(tmpDir, 'HelloWorld');
      await fs.mkdir(projectDir, { recursive: true });
      await fs.writeFile(path.join(projectDir, 'Info.plist'), '<plist><dict></dict></plist>');

      expect(usesSceneLifecycle(tmpDir)).toBe(false);
    });

    it('reports false for a missing or empty platform project root', () => {
      expect(usesSceneLifecycle(path.join(tmpDir, 'does-not-exist'))).toBe(false);
      expect(usesSceneLifecycle('')).toBe(false);
      expect(findSceneDelegateFile('')).toBeNull();
    });
  });

  describe('patching', () => {
    it('inserts the openURLContexts override into the SDK 58 SceneDelegate', async () => {
      const sceneDelegate = await fs.readFile(
        path.join(__dirname, './fixtures/SceneDelegate_sdk58.swift'),
        { encoding: 'utf8' },
      );

      const result = modifySceneDelegate(sceneDelegate);

      expect(result).not.toBeNull();
      expect(result).toContain('override func scene(_ scene: UIScene, openURLContexts');
      expect(result).toContain('$0.url.host?.lowercased() != "firebaseauth"');
      expect(result).toContain('super.scene(scene, openURLContexts: forwardedContexts)');
      expect(result).toMatchSnapshot();
    });

    it('returns null when already patched, so prebuild is idempotent', async () => {
      const sceneDelegate = await fs.readFile(
        path.join(__dirname, './fixtures/SceneDelegate_sdk58.swift'),
        { encoding: 'utf8' },
      );

      const once = modifySceneDelegate(sceneDelegate) as string;
      expect(modifySceneDelegate(once)).toBeNull();
      expect(once.match(new RegExp(generatedTag, 'g'))).toHaveLength(2);
    });

    it('returns null for a file that is not a SceneDelegate subclass', () => {
      expect(modifySceneDelegate('import Expo\n\nstruct Unrelated {}\n')).toBeNull();
    });
  });

  describe('app delegate fix defers to the scene lifecycle', () => {
    async function makeSceneProject(): Promise<string> {
      const projectDir = path.join(tmpDir, 'HelloWorld');
      await fs.mkdir(projectDir, { recursive: true });
      await fs.writeFile(
        path.join(projectDir, 'SceneDelegate.swift'),
        'class SceneDelegate: ExpoAppSceneDelegate {\n}\n',
      );
      return projectDir;
    }

    function makeConfig(appDelegate: string, platformProjectRoot: string) {
      return {
        name: 'TestName',
        slug: 'TestSlug',
        plugins: ['expo-router'],
        modRequest: { projectRoot: tmpDir, platformProjectRoot } as any,
        modResults: {
          path: path.join(platformProjectRoot, 'AppDelegate.swift'),
          language: 'swift',
          contents: appDelegate,
        } as AppDelegateProjectFile,
        modRawConfig: { name: 'TestName', slug: 'TestSlug' },
      };
    }

    it('does not warn when the AppDelegate has no openURL but the project uses scenes', async () => {
      await makeSceneProject();
      const appDelegate = await fs.readFile(
        path.join(__dirname, './fixtures/AppDelegate_sdk58.swift'),
        { encoding: 'utf8' },
      );
      const spy = jest
        .spyOn(WarningAggregator, 'addWarningIOS')
        .mockImplementation(() => undefined);

      const result = withOpenUrlFixForAppDelegate({
        config: makeConfig(appDelegate, tmpDir),
        props: undefined,
      });

      expect(result.modResults.contents).toBe(appDelegate);
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not throw when captchaOpenUrlFix is forced on and the project uses scenes', async () => {
      await makeSceneProject();
      const appDelegate = await fs.readFile(
        path.join(__dirname, './fixtures/AppDelegate_sdk58.swift'),
        { encoding: 'utf8' },
      );

      expect(() =>
        withOpenUrlFixForAppDelegate({
          config: makeConfig(appDelegate, tmpDir),
          props: { ios: { captchaOpenUrlFix: true } },
        }),
      ).not.toThrow();
    });

    it('still throws for an app-delegate lifecycle project with no openURL method', async () => {
      const appDelegate = await fs.readFile(
        path.join(__dirname, './fixtures/AppDelegate_noOpenURL_sdk53.swift'),
        { encoding: 'utf8' },
      );
      // No SceneDelegate.swift and no scene manifest were written to tmpDir.
      expect(fsSync.existsSync(path.join(tmpDir, 'HelloWorld'))).toBe(false);

      expect(() =>
        withOpenUrlFixForAppDelegate({
          config: makeConfig(appDelegate, tmpDir),
          props: { ios: { captchaOpenUrlFix: true } },
        }),
      ).toThrow("Failed to apply iOS openURL fix because no 'openURL' method was found");
    });
  });
});
