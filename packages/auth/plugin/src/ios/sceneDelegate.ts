import { ConfigPlugin, WarningAggregator, withDangerousMod } from '@expo/config-plugins';
import type { ExpoConfig } from '@expo/config/build/Config.types';
import fs from 'fs';
import path from 'path';

import { PluginConfigType } from '../pluginConfig';
import { shouldApplyIosOpenUrlFix } from './openUrlFix';
import { findSceneDelegateFile } from './sceneLifecycle';

export const generatedTag = '@react-native-firebase/auth-openURL';

export const sceneDelegateOpenUrlBlock: string = `\
// @generated begin ${generatedTag} - expo prebuild (DO NOT MODIFY)
  override func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    // invocations for Firebase Auth are handled elsewhere and should not be forwarded to Expo Router
    let forwardedContexts = URLContexts.filter { $0.url.host?.lowercased() != "firebaseauth" }
    guard !forwardedContexts.isEmpty else {
      return
    }
    super.scene(scene, openURLContexts: forwardedContexts)
  }
// @generated end ${generatedTag}\
`;

// Matches the opening brace of a `SceneDelegate` class declaration so the override can be inserted
// as the first member.
const sceneDelegateClassMatcher = /class\s+SceneDelegate\s*:[^\n{]*\{\n/;

/**
 * Add an `openURLContexts` override that drops Firebase Auth reCAPTCHA redirects.
 *
 * Returns the modified contents, or null when the patch does not apply (already present, or the
 * file is not a recognizable `SceneDelegate` subclass).
 */
export function modifySceneDelegate(contents: string): string | null {
  if (contents.includes(generatedTag)) {
    return null;
  }

  const match = contents.match(sceneDelegateClassMatcher);
  if (!match || match.index === undefined) {
    return null;
  }

  const insertionPoint = match.index + match[0].length;
  return `${contents.slice(0, insertionPoint)}${sceneDelegateOpenUrlBlock}\n${contents.slice(
    insertionPoint,
  )}`;
}

/**
 * Applies the reCAPTCHA `openURL` fix to `SceneDelegate.swift` on projects that use the UIScene
 * life cycle. On projects that still use the app-delegate life cycle this is a no-op, the
 * `withIosCaptchaOpenUrlFix` plugin handles those.
 */
export const withIosCaptchaSceneDelegateFix: ConfigPlugin<PluginConfigType> = (
  config: ExpoConfig,
  props?: PluginConfigType,
) => {
  if (!shouldApplyIosOpenUrlFix({ config, props })) {
    return config;
  }

  return withDangerousMod(config, [
    'ios',
    async config => {
      const sceneDelegatePath = findSceneDelegateFile(config.modRequest.platformProjectRoot);

      if (sceneDelegatePath === null) {
        // App-delegate life cycle: `withIosCaptchaOpenUrlFix` owns this project.
        return config;
      }

      const contents = await fs.promises.readFile(sceneDelegatePath, 'utf-8');
      const newContents = modifySceneDelegate(contents);

      if (newContents === null) {
        // Already patched is the common case and needs no warning; an unrecognized shape does.
        if (!contents.includes(generatedTag)) {
          WarningAggregator.addWarningIOS(
            '@react-native-firebase/auth',
            `Skipping iOS openURL fix because ${path.basename(
              sceneDelegatePath,
            )} is not a recognizable SceneDelegate subclass. Firebase Auth reCAPTCHA redirect URLs may be forwarded to your router.`,
          );
        }
        return config;
      }

      await fs.promises.writeFile(sceneDelegatePath, newContents);
      return config;
    },
  ]);
};
