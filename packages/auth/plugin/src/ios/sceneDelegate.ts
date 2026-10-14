import { ConfigPlugin, WarningAggregator, withDangerousMod } from '@expo/config-plugins';
import type { ExpoConfig } from '@expo/config/build/Config.types';
import fs from 'fs';
import path from 'path';

import { PluginConfigType } from '../pluginConfig';
import { shouldApplyIosOpenUrlFix } from './openUrlFix';
import { resolveSceneDelegateFile } from './sceneLifecycle';

export const generatedTag = '@react-native-firebase/auth-openURL';

/**
 * Warm-path contract for the SceneDelegate reCAPTCHA patch.
 *
 * Firebase Auth presents reCAPTCHA in an in-app `SFSafariViewController` / auth session while the
 * app is already running, then returns via a custom-scheme URL. Upstream documents and samples
 * handle that return only in `scene(_:openURLContexts:)` (see Firebase phone-auth appendix and the
 * Auth quickstart `SceneDelegate`); they do not route Auth reCAPTCHA through
 * `scene(_:willConnectTo:options:)`. A cold start would also drop Auth's in-memory pending
 * verification, so this plugin intentionally patches the warm path only.
 */
export const sceneDelegateWarmPathContract = {
  handlesOpenURLContexts: true,
  handlesWillConnectTo: false,
  evidence: [
    'https://firebase.google.com/docs/auth/ios/phone-auth#appendix:-using-phone-sign-in-without-swizzling',
    'https://github.com/firebase/quickstart-ios/blob/main/authentication/AuthenticationExample/SceneDelegate.swift',
  ],
} as const;

export const sceneDelegateFirebaseAuthImport = 'import FirebaseAuth';

export const sceneDelegateOpenUrlBlock: string = `\
// @generated begin ${generatedTag} - expo prebuild (DO NOT MODIFY)
  // Warm path only: Auth reCAPTCHA returns via openURLContexts while the app is running.
  // Cold-start scene connection is intentionally not patched (see sceneDelegateWarmPathContract).
  override func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    // Let Firebase Auth handle owned URLs (reCAPTCHA); forward the rest to Expo / RCTLinkingManager.
    let forwardedContexts = Set(URLContexts.filter { !Auth.auth().canHandle($0.url) })
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

function ensureFirebaseAuthImport(contents: string): string {
  if (/^\s*import\s+FirebaseAuth\s*$/m.test(contents)) {
    return contents;
  }

  const newline = contents.includes('\r\n') ? '\r\n' : '\n';
  const expoImport = /^[ \t]*(?:internal\s+)?import\s+Expo[ \t]*$/m.exec(contents);
  if (expoImport?.index !== undefined) {
    const insertionPoint = expoImport.index + expoImport[0].length;
    return `${contents.slice(0, insertionPoint)}${newline}${sceneDelegateFirebaseAuthImport}${contents.slice(
      insertionPoint,
    )}`;
  }

  const firstImport = /^[ \t]*import\b[^\r\n]*$/m.exec(contents);
  if (firstImport?.index !== undefined) {
    return `${contents.slice(0, firstImport.index)}${sceneDelegateFirebaseAuthImport}${newline}${contents.slice(
      firstImport.index,
    )}`;
  }

  return `${sceneDelegateFirebaseAuthImport}${newline}${contents}`;
}

/**
 * Add an `openURLContexts` override that lets Firebase Auth handle reCAPTCHA redirects, then
 * forwards only unhandled contexts to `super` (Expo Router / RCTLinkingManager).
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

  const withImport = ensureFirebaseAuthImport(contents);
  // Re-match after import insertion — the class body offset can shift.
  const rematch = withImport.match(sceneDelegateClassMatcher);
  if (!rematch || rematch.index === undefined) {
    return null;
  }

  const insertionPoint = rematch.index + rematch[0].length;
  return `${withImport.slice(0, insertionPoint)}${sceneDelegateOpenUrlBlock}\n${withImport.slice(
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
      const resolution = resolveSceneDelegateFile(config.modRequest.platformProjectRoot);

      if (resolution.kind === 'missing') {
        return config;
      }

      if (resolution.kind === 'ambiguous') {
        WarningAggregator.addWarningIOS(
          '@react-native-firebase/auth',
          `Skipping iOS openURL fix because multiple SceneDelegate.swift files were found and none is uniquely co-located with AppDelegate (${resolution.candidates
            .map(candidate => path.relative(config.modRequest.platformProjectRoot, candidate))
            .join(', ')}). Firebase Auth reCAPTCHA redirect URLs may be forwarded to your router.`,
        );
        return config;
      }

      const sceneDelegatePath = resolution.path;
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
