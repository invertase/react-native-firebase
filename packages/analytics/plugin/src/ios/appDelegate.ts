import { ConfigPlugin, IOSConfig, WarningAggregator, withDangerousMod } from '@expo/config-plugins';
import type { InfoPlist } from '@expo/config-plugins/build/ios/IosConfig.types';
import { getInfoPlistPathFromPbxproj } from '@expo/config-plugins/build/ios/utils/getInfoPlistPath';
import fs from 'fs';
import path from 'path';

const PLUGIN_NAME = '@react-native-firebase/analytics';

export const sceneLinkAttributionTag = '@react-native-firebase/analytics-sceneLinkAttribution';

// Tagged so a later prebuild can tell the import was added here and remove it.
const firebaseAnalyticsImport = `import FirebaseAnalytics // @generated ${sceneLinkAttributionTag}`;

const beginMarker = `// @generated begin ${sceneLinkAttributionTag} - expo prebuild (DO NOT MODIFY)`;
const endMarker = `// @generated end ${sceneLinkAttributionTag}`;

const generatedBlockMatcher = new RegExp(
  `${escapeRegExp(beginMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}`,
  'g',
);
const generatedBlockLineMatcher = new RegExp(`${generatedBlockMatcher.source}[ \\t]*\\r?\\n?`, 'g');
const generatedImportLineMatcher = new RegExp(
  String.raw`^[ \t]*${escapeRegExp(firebaseAnalyticsImport)}[ \t]*(?:\r?\n|$)`,
  'm',
);
const authOpenUrlTag = '@react-native-firebase/auth-openURL';
const authBlockLineMatcher = new RegExp(
  String.raw`^// @generated begin ${escapeRegExp(authOpenUrlTag)} [^\r\n]*\r?\n[\s\S]*?^// @generated end ${escapeRegExp(authOpenUrlTag)}[ \t]*\r?\n`,
  'gm',
);
const firebaseAnalyticsUseMatcher = /\b(?:FirebaseAnalytics|Analytics\w*)\b/;

// Declaration modifiers and attributes such as `@objc(name)`, `public`, `open`, `@preconcurrency`.
const modifiers = String.raw`(?:(?:@\w+(?:\([^)\r\n]*\))?|\w+)\s+)*`;

const firebaseAnalyticsImportMatcher = new RegExp(
  String.raw`^[ \t]*${modifiers}import[ \t]+FirebaseAnalytics[ \t]*\r?$`,
  'm',
);
const expoImportMatcher = new RegExp(
  String.raw`^[ \t]*${modifiers}import[ \t]+Expo[ \t]*\r?$`,
  'm',
);
const anyImportMatcher = new RegExp(String.raw`^[ \t]*${modifiers}import\b`, 'm');

const appDelegateClassMatcher = /class\s+AppDelegate\s*:[^{]*\{[ \t]*\r?\n/;

// Only the `options:` overload; the legacy `sourceApplication:annotation:` one is a separate method.
const openUrlSignatureMatcher =
  /func\s+application\s*\(\s*_\s+\w+\s*:\s*UIApplication\s*,\s*open\s+\w+\s*:\s*URL\s*,\s*options\b/;
const openUrlOverrideMatcher = new RegExp(
  String.raw`^([ \t]*)${modifiers}override\s+${modifiers}func\s+application\s*\(\s*_\s+\w+\s*:\s*UIApplication\s*,\s*open\s+(\w+)\s*:\s*URL\s*,\s*options\b[^{]*\{[ \t]*\r?\n`,
  'm',
);

const continueSignatureMatcher =
  /func\s+application\s*\(\s*_\s+\w+\s*:\s*UIApplication\s*,\s*continue\s+\w+\s*:\s*NSUserActivity\b/;
const continueOverrideMatcher = new RegExp(
  String.raw`^([ \t]*)${modifiers}override\s+${modifiers}func\s+application\s*\(\s*_\s+\w+\s*:\s*UIApplication\s*,\s*continue\s+(\w+)\s*:\s*NSUserActivity\b[^{]*\{[ \t]*\r?\n`,
  'm',
);

// Module-qualified so a same-named `Analytics` type from another SDK cannot shadow it.
const handleOpenCall = 'FirebaseAnalytics.Analytics.handleOpen';
const handleUserActivityCall = 'FirebaseAnalytics.Analytics.handleUserActivity';

// The parameter layout must keep matching `appDelegateSwiftOpenUrlInsertionPointAfter` in the Auth
// plugin, which patches this override when it runs after us. That regex only matches LF, so added
// overrides are written with LF even in a CRLF file.
const openUrlOverrideBlock = `\
${beginMarker}
  // Expo's SceneEventForwarder re-feeds scene URLs and user activities to these AppDelegate
  // methods with direct Swift calls, which Firebase's app delegate proxy never sees.
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    ${handleOpenCall}(url)
    return super.application(app, open: url, options: options)
  }
${endMarker}
`;

const continueUserActivityOverrideBlock = `\
${beginMarker}
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    ${handleUserActivityCall}(userActivity)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
${endMarker}
`;

const addedOverrideBlocks = [openUrlOverrideBlock, continueUserActivityOverrideBlock].map(block =>
  block.slice(0, -1),
);
const injectedCallBlockMatcher = new RegExp(
  String.raw`^${escapeRegExp(beginMarker)}\r?\n[ \t]*(?:${escapeRegExp(handleOpenCall)}|${escapeRegExp(
    handleUserActivityCall,
  )})\(\w+\)\r?\n${escapeRegExp(endMarker)}$`,
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Whether a begin…end match is exactly what `modifySwiftAppDelegate` writes: an injected call, or
 * an added override with at most Auth's openURL guard nested in it. Anything else, such as a match
 * spanning user code because an end and the next begin marker were deleted, is not removable.
 */
function isIntactGeneratedBlock(block: string): boolean {
  return (
    injectedCallBlockMatcher.test(block) ||
    addedOverrideBlocks.includes(block.replace(authBlockLineMatcher, '').replace(/\r\n/g, '\n'))
  );
}

function callMatcher(method: string): RegExp {
  return new RegExp(
    String.raw`(?<![\w.])(?:FirebaseAnalytics\s*\.\s*)?Analytics\s*\.\s*${method}\s*\(`,
  );
}

function warn(message: string): void {
  WarningAggregator.addWarningIOS(PLUGIN_NAME, message);
}

/**
 * Blank out Swift comments, keeping string literals, line breaks and character offsets intact so
 * matches on the result can be used as indexes into the original contents.
 */
export function maskSwiftComments(contents: string): string {
  const blank = (text: string) => text.replace(/[^\r\n]/g, ' ');
  // Covers `"…"`, `"""…"""` and raw strings such as `#"…"#`, which close on quotes plus hashes.
  const stringOpeningMatcher = /(#*)("""|")/y;
  let result = '';
  let index = 0;
  let stringEnd: string | null = null;
  let stringEscape = '\\';
  let blockDepth = 0;

  while (index < contents.length) {
    const char = contents.charAt(index);
    const pair = contents.slice(index, index + 2);

    if (blockDepth > 0) {
      if (pair === '/*' || pair === '*/') {
        blockDepth += pair === '/*' ? 1 : -1;
        result += '  ';
        index += 2;
      } else {
        result += blank(char);
        index += 1;
      }
    } else if (stringEnd !== null) {
      if (contents.startsWith(stringEnd, index)) {
        result += stringEnd;
        index += stringEnd.length;
        stringEnd = null;
      } else {
        const step = contents.startsWith(stringEscape, index) ? stringEscape.length + 1 : 1;
        result += contents.slice(index, index + step);
        index += step;
      }
    } else if (pair === '//') {
      const lineEnd = contents.slice(index).search(/\r?\n/);
      const end = lineEnd === -1 ? contents.length : index + lineEnd;
      result += blank(contents.slice(index, end));
      index = end;
    } else if (pair === '/*') {
      blockDepth = 1;
      result += '  ';
      index += 2;
    } else {
      stringOpeningMatcher.lastIndex = index;
      const opening = stringOpeningMatcher.exec(contents);
      if (opening) {
        const [delimiter, hashes, quotes] = opening;
        stringEnd = `${quotes}${hashes}`;
        stringEscape = `\\${hashes}`;
        result += delimiter;
        index += delimiter.length;
      } else {
        result += char;
        index += 1;
      }
    }
  }

  return result;
}

function ensureFirebaseAnalyticsImport(contents: string, newline: string): string {
  const code = maskSwiftComments(contents);
  if (firebaseAnalyticsImportMatcher.test(code)) {
    return contents;
  }

  const expoImport = expoImportMatcher.exec(code);
  if (expoImport) {
    const insertionPoint = expoImport.index + expoImport[0].replace(/\r$/, '').length;
    return `${contents.slice(0, insertionPoint)}${newline}${firebaseAnalyticsImport}${contents.slice(
      insertionPoint,
    )}`;
  }

  const insertionPoint = anyImportMatcher.exec(code)?.index ?? 0;
  return `${contents.slice(0, insertionPoint)}${firebaseAnalyticsImport}${newline}${contents.slice(
    insertionPoint,
  )}`;
}

type MethodPatch = {
  description: string;
  call: string;
  callMatcher: RegExp;
  signatureMatcher: RegExp;
  overrideMatcher: RegExp;
  overrideBlock: string;
};

// Each added override goes to the top of the class, so the last entry ends up first.
const methodPatches: MethodPatch[] = [
  {
    description: 'application(_:continue:restorationHandler:)',
    call: handleUserActivityCall,
    callMatcher: callMatcher('handleUserActivity'),
    signatureMatcher: continueSignatureMatcher,
    overrideMatcher: continueOverrideMatcher,
    overrideBlock: continueUserActivityOverrideBlock,
  },
  {
    description: 'application(_:open:options:)',
    call: handleOpenCall,
    callMatcher: callMatcher('handleOpen'),
    signatureMatcher: openUrlSignatureMatcher,
    overrideMatcher: openUrlOverrideMatcher,
    overrideBlock: openUrlOverrideBlock,
  },
];

/**
 * Make a Swift `AppDelegate: ExpoAppDelegate` forward opening URLs and user activities to
 * Firebase Analytics. Existing overrides get the call injected at the start of their body;
 * missing overrides are added. A method whose call `SceneDelegate.swift` already makes is skipped,
 * and code an earlier prebuild generated for it is removed, so each link is recorded once.
 * Returns the contents unchanged when nothing applies.
 */
export function modifySwiftAppDelegate(
  contents: string,
  sceneDelegateContents: string | null = null,
): string {
  const newline = contents.includes('\r\n') ? '\r\n' : '\n';
  const userCode = maskSwiftComments(contents.replace(generatedBlockMatcher, ''));
  const sceneDelegateCode =
    sceneDelegateContents === null ? null : maskSwiftComments(sceneDelegateContents);
  let result = contents;
  let patched = false;
  let removed = false;

  for (const patch of methodPatches) {
    if (sceneDelegateCode !== null && patch.callMatcher.test(sceneDelegateCode)) {
      warn(
        `Skipping UIScene link attribution for ${patch.description} because SceneDelegate.swift already calls ${patch.call}. Remove every such call from SceneDelegate.swift to let this plugin handle it, or make sure SceneDelegate.swift makes it for links that launch the app and for links that arrive while it is running.`,
      );
      const withoutCall = removeGeneratedCode(result, patch.call);
      if (withoutCall === null) {
        warn(
          `Skipping removal of the generated ${patch.call} call from AppDelegate.swift because a ${sceneLinkAttributionTag} block in it was modified. Remove the generated ${patch.call} call manually, or each link is recorded twice.`,
        );
      } else if (withoutCall !== result) {
        result = withoutCall;
        removed = true;
      }
      continue;
    }
    if (patch.callMatcher.test(userCode)) {
      warn(
        `Skipping UIScene link attribution for ${patch.description} because AppDelegate.swift already calls ${patch.call}.`,
      );
      continue;
    }
    const code = maskSwiftComments(result);
    if (patch.callMatcher.test(code)) {
      continue;
    }

    if (patch.signatureMatcher.test(code)) {
      const match = patch.overrideMatcher.exec(code);
      if (!match) {
        warn(
          `Skipping UIScene link attribution because the ${patch.description} override in AppDelegate.swift could not be recognised. Call ${patch.call} from it manually.`,
        );
        continue;
      }
      const insertionPoint = match.index + match[0].length;
      const injected = [beginMarker, `${match[1]}  ${patch.call}(${match[2]})`, endMarker, ''];
      result = `${result.slice(0, insertionPoint)}${injected.join(newline)}${result.slice(
        insertionPoint,
      )}`;
      patched = true;
      continue;
    }

    const classMatch = appDelegateClassMatcher.exec(code);
    if (!classMatch) {
      warn(
        `Skipping UIScene link attribution because AppDelegate.swift does not declare a recognisable AppDelegate class. Call ${patch.call} from ${patch.description} manually.`,
      );
      continue;
    }
    const insertionPoint = classMatch.index + classMatch[0].length;
    result = `${result.slice(0, insertionPoint)}${patch.overrideBlock}${result.slice(
      insertionPoint,
    )}`;
    patched = true;
  }

  if (patched) {
    return ensureFirebaseAnalyticsImport(result, newline);
  }
  return removed ? removeGeneratedImportIfUnused(result) : result;
}

function hasOnlyIntactGeneratedBlocks(contents: string): boolean {
  const blocks = contents.match(generatedBlockMatcher) ?? [];
  const beginCount = contents.split(beginMarker).length - 1;
  const endCount = contents.split(endMarker).length - 1;
  return (
    blocks.length === beginCount &&
    blocks.length === endCount &&
    blocks.every(isIntactGeneratedBlock)
  );
}

// `null` when a generated block was modified, so removing it could take user code with it.
function removeGeneratedCode(contents: string, call: string): string | null {
  if (!hasOnlyIntactGeneratedBlocks(contents)) {
    return null;
  }
  return contents.replace(generatedBlockLineMatcher, block =>
    block.includes(`${call}(`) ? '' : block,
  );
}

function removeGeneratedImportIfUnused(contents: string): string {
  const importMatch = generatedImportLineMatcher.exec(contents);
  if (!importMatch) {
    return contents;
  }
  const withoutImport = `${contents.slice(0, importMatch.index)}${contents.slice(
    importMatch.index + importMatch[0].length,
  )}`;
  return firebaseAnalyticsUseMatcher.test(maskSwiftComments(withoutImport))
    ? contents
    : withoutImport;
}

/**
 * Undo `modifySwiftAppDelegate`: remove the generated blocks, then the tagged import when nothing
 * else in the file refers to Firebase Analytics. If any block differs from what was generated (other
 * than Auth's openURL guard, which Auth re-applies afterwards), the file is left alone, with a warning.
 */
export function removeSceneLinkAttribution(contents: string): string {
  if (!hasOnlyIntactGeneratedBlocks(contents)) {
    warn(
      `Skipping removal of UIScene link attribution from AppDelegate.swift because its ${sceneLinkAttributionTag} blocks were modified. Remove them manually: without UIScene, Firebase records links itself.`,
    );
    return contents;
  }
  return removeGeneratedImportIfUnused(contents.replace(generatedBlockLineMatcher, ''));
}

/**
 * Candidate paths of the application target's `Info.plist`, most authoritative first: the
 * `INFOPLIST_FILE` of the first application target in the Xcode project (as Expo's `infoPlist` mod
 * resolves it), then the `Info.plist` next to the AppDelegate. App Clip and extension plists are
 * never considered.
 */
export function appInfoPlistCandidates(
  projectRoot: string,
  platformProjectRoot: string,
  appDelegatePath: string,
): string[] {
  let infoPlistBuildSetting: string | null;
  try {
    infoPlistBuildSetting = getInfoPlistPathFromPbxproj(projectRoot);
  } catch {
    infoPlistBuildSetting = null;
  }
  const candidates = infoPlistBuildSetting
    ? [path.join(platformProjectRoot, infoPlistBuildSetting)]
    : [];
  const besideAppDelegate = path.join(path.dirname(appDelegatePath), 'Info.plist');
  return candidates.includes(besideAppDelegate) ? candidates : [...candidates, besideAppDelegate];
}

// `null` when the file is missing, unreadable, or not an XML plist (such as a `bplist00` binary one).
function readSceneManifestDeclaration(infoPlistPath: string): boolean | null {
  let xml: string;
  try {
    xml = fs.readFileSync(infoPlistPath, 'utf-8').replace(/<!--[\s\S]*?-->/g, '');
  } catch {
    return null;
  }
  if (!/<plist\b/.test(xml)) {
    return null;
  }
  return /<key>\s*UIApplicationSceneManifest\s*<\/key>/.test(xml);
}

/**
 * Detect the UIScene life cycle: a `UIApplicationSceneManifest` in the Expo config's
 * `ios.infoPlist`, or in the app target's `Info.plist`. On a first or `--clean` prebuild the
 * latter is the native template's, because dangerous mods run before the `infoPlist` mod.
 * Returns `null` when the config has no manifest and no candidate `Info.plist` can be read.
 */
export function declaresSceneManifest({
  projectRoot,
  platformProjectRoot,
  appDelegatePath,
  infoPlist,
}: {
  projectRoot: string;
  platformProjectRoot: string;
  appDelegatePath: string;
  infoPlist?: InfoPlist;
}): boolean | null {
  if (infoPlist?.UIApplicationSceneManifest !== undefined) {
    return true;
  }

  for (const candidate of appInfoPlistCandidates(
    projectRoot,
    platformProjectRoot,
    appDelegatePath,
  )) {
    const declared = readSceneManifestDeclaration(candidate);
    if (declared !== null) {
      return declared;
    }
  }
  return null;
}

// Expo SDK 58 prebuild writes `SceneDelegate.swift` next to `AppDelegate.swift`.
function readSceneDelegate(sceneDelegatePath: string): string | null {
  try {
    return fs.readFileSync(sceneDelegatePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function applySceneLinkAttributionAsync({
  projectRoot,
  platformProjectRoot,
  infoPlist,
}: {
  projectRoot: string;
  platformProjectRoot: string;
  infoPlist?: InfoPlist;
}): Promise<void> {
  let fileInfo: ReturnType<typeof IOSConfig.Paths.getAppDelegate>;
  try {
    fileInfo = IOSConfig.Paths.getAppDelegate(projectRoot);
  } catch {
    return;
  }

  const sceneApp = declaresSceneManifest({
    projectRoot,
    platformProjectRoot,
    appDelegatePath: fileInfo.path,
    infoPlist,
  });
  const appDelegateName = path.basename(fileInfo.path);

  if (sceneApp === null) {
    warn(
      `Skipping UIScene link attribution because the app target's Info.plist could not be read as an XML plist, so ${appDelegateName} was left unchanged. If the app uses the UIScene life cycle, call FirebaseAnalytics.Analytics.handleOpen(_:) and handleUserActivity(_:) for scene URLs and user activities manually.`,
    );
    return;
  }

  if (fileInfo.language !== 'swift') {
    if (sceneApp) {
      warn(
        `Skipping UIScene link attribution because ${appDelegateName} is not Swift. Expo forwards scene links only to a Swift AppDelegate that subclasses ExpoAppDelegate: convert it to Swift, or call [FIRAnalytics handleOpenURL:] and [FIRAnalytics handleUserActivity:] from your own scene delegate.`,
      );
    }
    return;
  }

  // Without UIScene, UIKit calls the app delegate and Firebase's proxy already records the link,
  // so code left by an earlier prebuild would count it twice.
  const newContents = sceneApp
    ? modifySwiftAppDelegate(
        fileInfo.contents,
        readSceneDelegate(path.join(path.dirname(fileInfo.path), 'SceneDelegate.swift')),
      )
    : removeSceneLinkAttribution(fileInfo.contents);
  if (newContents !== fileInfo.contents) {
    await fs.promises.writeFile(fileInfo.path, newContents);
  }
}

// Dangerous mods write before any `appDelegate` mod reads the file, so the Auth plugin's openURL
// fix sees the override added here whatever the plugin order.
export const withIosSceneLinkAttribution: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      await applySceneLinkAttributionAsync({
        projectRoot: config.modRequest.projectRoot,
        platformProjectRoot: config.modRequest.platformProjectRoot,
        infoPlist: config.ios?.infoPlist,
      });
      return config;
    },
  ]);
};
