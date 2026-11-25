import fsSync from 'fs';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { WarningAggregator } from '@expo/config-plugins';
import type { InfoPlist } from '@expo/config-plugins/build/ios/IosConfig.types';
import { getInfoPlistPathFromPbxproj } from '@expo/config-plugins/build/ios/utils/getInfoPlistPath';

import {
  applySceneLinkAttributionAsync,
  declaresSceneManifest,
  maskSwiftComments,
  modifySwiftAppDelegate,
  removeSceneLinkAttribution,
  sceneLinkAttributionTag,
  withIosSceneLinkAttribution,
} from '../src/ios/appDelegate';
import { modifySwiftAppDelegate as authModifySwiftAppDelegate } from '../../../auth/plugin/src/ios/openUrlFix';
import { modifySceneDelegate } from '../../../auth/plugin/src/ios/sceneDelegate';

jest.mock('@expo/config-plugins/build/ios/utils/getInfoPlistPath', () => ({
  getInfoPlistPathFromPbxproj: jest.fn(),
}));

const mockedGetInfoPlistPathFromPbxproj = jest.mocked(getInfoPlistPathFromPbxproj);

type ExpoConfig = Parameters<typeof withIosSceneLinkAttribution>[0];

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

const NO_SCENE_MANIFEST_PLIST = '<plist version="1.0"><dict></dict></plist>\n';

const BINARY_PLIST = 'bplist00\xd1\x01\x02_\x10\x1aUIApplicationSceneManifest\xd0\x08\x0b\x28\x00';

const BEGIN = `// @generated begin ${sceneLinkAttributionTag} - expo prebuild (DO NOT MODIFY)`;
const END = `// @generated end ${sceneLinkAttributionTag}`;
const IMPORT = `import FirebaseAnalytics // @generated ${sceneLinkAttributionTag}`;
const CLASS_LINE = 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {\n';

function readFixture(name: string): Promise<string> {
  return fs.readFile(path.join(__dirname, 'fixtures', name), 'utf-8');
}

function count(haystack: string, needle: RegExp): number {
  return (haystack.match(new RegExp(needle.source, 'g')) ?? []).length;
}

async function withMembers(members: string): Promise<string> {
  return (await readFixture('AppDelegate_sdk58.swift')).replace(
    CLASS_LINE,
    `${CLASS_LINE}${members}`,
  );
}

const openUrlOverride =
  /override\s+func\s+application\s*\(\s*_\s+\w+\s*:\s*UIApplication\s*,\s*open\s/;
const continueOverride =
  /override\s+func\s+application\s*\(\s*_\s+\w+\s*:\s*UIApplication\s*,\s*continue\s/;
const handleOpen = /FirebaseAnalytics\.Analytics\.handleOpen\(/;
const handleUserActivity = /FirebaseAnalytics\.Analytics\.handleUserActivity\(/;

const SCENE_DELEGATE_OPEN_URL = `\
  override func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    URLContexts.forEach { Analytics.handleOpen($0.url) }
    super.scene(scene, openURLContexts: URLContexts)
  }
`;
const SCENE_DELEGATE_CONTINUE = `\
  override func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    Analytics.handleUserActivity(userActivity)
    super.scene(scene, continue: userActivity)
  }
`;

function sceneDelegate(members = ''): string {
  return `internal import Expo\nimport FirebaseAnalytics\n\nclass SceneDelegate: ExpoSceneDelegate {\n${members}}\n`;
}

describe('Analytics Config Plugin iOS Tests - UIScene link attribution', () => {
  let tmpDir: string;
  let iosDir: string;
  let appDir: string;
  let warningSpy: jest.SpiedFunction<typeof WarningAggregator.addWarningIOS>;

  beforeEach(async () => {
    jest.restoreAllMocks();
    mockedGetInfoPlistPathFromPbxproj.mockReset();
    mockedGetInfoPlistPathFromPbxproj.mockReturnValue(null);
    warningSpy = jest.spyOn(WarningAggregator, 'addWarningIOS').mockImplementation(() => {});
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rnfb-analytics-scene-'));
    iosDir = path.join(tmpDir, 'ios');
    appDir = path.join(iosDir, 'HelloWorld');
    await fs.mkdir(appDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  async function writeProject({
    appDelegateName = 'AppDelegate.swift',
    appDelegateContents,
    infoPlist = SCENE_MANIFEST_PLIST,
  }: {
    appDelegateName?: string;
    appDelegateContents?: string;
    infoPlist?: string;
  }): Promise<string> {
    await fs.writeFile(path.join(appDir, 'Info.plist'), infoPlist);
    const appDelegatePath = path.join(appDir, appDelegateName);
    if (appDelegateContents !== undefined) {
      await fs.writeFile(appDelegatePath, appDelegateContents);
    }
    return appDelegatePath;
  }

  async function writeTargetPlist(target: string, contents: string): Promise<void> {
    await fs.mkdir(path.join(iosDir, target), { recursive: true });
    await fs.writeFile(path.join(iosDir, target, 'Info.plist'), contents);
  }

  function apply(infoPlist?: InfoPlist) {
    return applySceneLinkAttributionAsync({
      projectRoot: tmpDir,
      platformProjectRoot: iosDir,
      infoPlist,
    });
  }

  function declares(infoPlist?: InfoPlist) {
    return declaresSceneManifest({
      projectRoot: tmpDir,
      platformProjectRoot: iosDir,
      appDelegatePath: path.join(appDir, 'AppDelegate.swift'),
      infoPlist,
    });
  }

  describe('modifySwiftAppDelegate', () => {
    it('adds the import and both overrides to the SDK 58 AppDelegate', async () => {
      const appDelegate = await readFixture('AppDelegate_sdk58.swift');

      const result = modifySwiftAppDelegate(appDelegate);

      expect(result).toContain(`internal import Expo\n${IMPORT}\nimport React`);
      expect(count(result, openUrlOverride)).toBe(1);
      expect(count(result, continueOverride)).toBe(1);
      expect(result).toContain('FirebaseAnalytics.Analytics.handleOpen(url)');
      expect(result).toContain('FirebaseAnalytics.Analytics.handleUserActivity(userActivity)');
      expect(result).toContain('return super.application(app, open: url, options: options)');
      expect(result).toContain(
        'return super.application(application, continue: userActivity, restorationHandler: restorationHandler)',
      );
      expect(result).toContain(sceneLinkAttributionTag);
      expect(warningSpy).not.toHaveBeenCalled();
      expect(result).toMatchSnapshot();
    });

    it('is idempotent', async () => {
      const appDelegate = await readFixture('AppDelegate_sdk58.swift');

      const once = modifySwiftAppDelegate(appDelegate);
      const twice = modifySwiftAppDelegate(once);

      expect(twice).toEqual(once);
      expect(count(twice, /import FirebaseAnalytics/)).toBe(1);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('treats an unqualified call in a previously generated block as already applied', async () => {
      const legacy = modifySwiftAppDelegate(await readFixture('AppDelegate_sdk58.swift')).replace(
        /FirebaseAnalytics\.Analytics\./g,
        'Analytics.',
      );

      expect(modifySwiftAppDelegate(legacy)).toEqual(legacy);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('injects into an existing openURL override instead of adding a second one', async () => {
      const appDelegate = await readFixture('AppDelegate_sdk58_openUrl.swift');

      const result = modifySwiftAppDelegate(appDelegate);

      expect(count(result, openUrlOverride)).toBe(1);
      expect(count(result, continueOverride)).toBe(1);
      expect(result).toContain(
        `  ) -> Bool {\n${BEGIN}\n    FirebaseAnalytics.Analytics.handleOpen(url)\n${END}\n    return super.application(app, open: url, options: options) || RCTLinkingManager`,
      );
      expect(modifySwiftAppDelegate(result)).toEqual(result);
      expect(warningSpy).not.toHaveBeenCalled();
      expect(result).toMatchSnapshot();
    });

    it('uses the parameter name of an existing override', async () => {
      const appDelegate = await withMembers(
        `  override func application(_ application: UIApplication, continue activity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    return super.application(application, continue: activity, restorationHandler: restorationHandler)
  }
`,
      );

      const result = modifySwiftAppDelegate(appDelegate);

      expect(count(result, continueOverride)).toBe(1);
      expect(result).toContain('    FirebaseAnalytics.Analytics.handleUserActivity(activity)\n');
    });

    it.each([
      ['@objc public override', '@objc public override func'],
      ['@objc(name) override', '@objc(application:openURL:options:) override func'],
      ['open override', 'open override func'],
      ['override public', 'override public func'],
      ['an attribute on its own line', '@MainActor\n  public override func'],
    ])('injects into an existing override declared with %s', async (_label, declaration) => {
      const appDelegate = await withMembers(
        `  ${declaration} application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    return super.application(app, open: url, options: options)
  }
`,
      );

      const result = modifySwiftAppDelegate(appDelegate);

      expect(
        count(result, /func\s+application\s*\(\s*_\s+app\s*:\s*UIApplication\s*,\s*open\s/),
      ).toBe(1);
      expect(result).toContain(
        ` -> Bool {\n${BEGIN}\n    FirebaseAnalytics.Analytics.handleOpen(url)\n${END}\n`,
      );
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it.each([
      ['unqualified', 'Analytics.handleOpen(url)'],
      ['module-qualified', 'FirebaseAnalytics.Analytics.handleOpen(url)'],
      ['spaced', 'FirebaseAnalytics . Analytics . handleOpen (url)'],
    ])(
      'skips a method whose %s call the user already added, with a warning',
      async (_label, call) => {
        const appDelegate = (await readFixture('AppDelegate_sdk58_openUrl.swift'))
          .replace('internal import Expo\n', 'internal import Expo\nimport FirebaseAnalytics\n')
          .replace(
            '    return super.application(app, open: url, options: options) ||',
            `    ${call}\n    return super.application(app, open: url, options: options) ||`,
          );

        const result = modifySwiftAppDelegate(appDelegate);

        expect(count(result, /handleOpen\s*\(/)).toBe(1);
        expect(count(result, continueOverride)).toBe(1);
        expect(count(result, /import FirebaseAnalytics/)).toBe(1);
        expect(warningSpy).toHaveBeenCalledTimes(1);
        expect(warningSpy).toHaveBeenCalledWith(
          '@react-native-firebase/analytics',
          expect.stringContaining('already calls FirebaseAnalytics.Analytics.handleOpen'),
        );
      },
    );

    it('ignores commented-out calls', async () => {
      const appDelegate = (await readFixture('AppDelegate_sdk58_openUrl.swift')).replace(
        '    return super.application(app, open: url, options: options) ||',
        '    // Analytics.handleOpen(url)\n    /* FirebaseAnalytics.Analytics.handleUserActivity(x) /* nested */ */\n    return super.application(app, open: url, options: options) ||',
      );

      const result = modifySwiftAppDelegate(appDelegate);

      expect(count(result, handleOpen)).toBe(1);
      expect(count(result, handleUserActivity)).toBe(2);
      expect(count(result, continueOverride)).toBe(1);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it("does not mistake another module's Analytics type for Firebase's", async () => {
      const appDelegate = (await readFixture('AppDelegate_sdk58_openUrl.swift')).replace(
        '    return super.application(app, open: url, options: options) ||',
        '    Segment.Analytics.handleOpen(url)\n    MyAnalytics.handleOpen(url)\n    return super.application(app, open: url, options: options) ||',
      );

      const result = modifySwiftAppDelegate(appDelegate);

      expect(count(result, handleOpen)).toBe(1);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('ignores override signatures in comments and comment markers in strings', async () => {
      const appDelegate = await withMembers(
        `  // override func application(_ app: UIApplication, open url: URL) -> Bool {
  let note = "// not a comment \\" still a string"
`,
      );

      const result = modifySwiftAppDelegate(appDelegate);

      expect(count(result, handleOpen)).toBe(1);
      expect(result).toContain('let note = "// not a comment \\" still a string"');
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it.each([
      ['@preconcurrency import FirebaseAnalytics'],
      ['@_exported public import FirebaseAnalytics'],
      ['internal import FirebaseAnalytics // analytics'],
    ])('does not duplicate an existing `%s`', async importLine => {
      const appDelegate = (await readFixture('AppDelegate_sdk58.swift')).replace(
        'import React\n',
        `import React\n${importLine}\n`,
      );

      const result = modifySwiftAppDelegate(appDelegate);

      expect(count(result, /import FirebaseAnalytics/)).toBe(1);
      expect(result).toContain(importLine);
    });

    it('adds the import when the existing one is commented out', async () => {
      const appDelegate = (await readFixture('AppDelegate_sdk58.swift')).replace(
        'import React\n',
        'import React\n// import FirebaseAnalytics\n',
      );

      const result = modifySwiftAppDelegate(appDelegate);

      expect(result).toContain(`internal import Expo\n${IMPORT}\n`);
      expect(count(result, /\nimport FirebaseAnalytics /)).toBe(1);
    });

    it('adds the import after an attributed Expo import', async () => {
      const appDelegate = (await readFixture('AppDelegate_sdk58.swift')).replace(
        'internal import Expo\n',
        '@preconcurrency internal import Expo\n',
      );

      expect(modifySwiftAppDelegate(appDelegate)).toContain(
        `@preconcurrency internal import Expo\n${IMPORT}\nimport React`,
      );
    });

    it('adds the import before the first import when there is no Expo import', async () => {
      const appDelegate = (await readFixture('AppDelegate_sdk58.swift')).replace(
        'internal import Expo\n',
        '// Copyright\n',
      );

      expect(
        modifySwiftAppDelegate(appDelegate).startsWith(`// Copyright\n${IMPORT}\nimport React\n`),
      ).toBe(true);
    });

    it('adds the import at the top when the file has no imports', () => {
      const result = modifySwiftAppDelegate(`${CLASS_LINE}}\n`);

      expect(result.startsWith(`${IMPORT}\n${CLASS_LINE}`)).toBe(true);
      expect(count(result, openUrlOverride)).toBe(1);
    });

    it('keeps CRLF line endings', async () => {
      const appDelegate = (await readFixture('AppDelegate_sdk58_openUrl.swift')).replace(
        /\n/g,
        '\r\n',
      );

      const result = modifySwiftAppDelegate(appDelegate);

      expect(result).toContain(`internal import Expo\r\n${IMPORT}\r\nimport React`);
      expect(result).toContain(
        `) -> Bool {\r\n${BEGIN}\r\n    FirebaseAnalytics.Analytics.handleOpen(url)\r\n${END}\r\n`,
      );
      expect(count(result, continueOverride)).toBe(1);
      const addedOverride = result.slice(
        result.indexOf(BEGIN),
        result.indexOf(END) + `${END}\n`.length,
      );
      expect(addedOverride).toMatch(continueOverride);
      expect(addedOverride).not.toContain('\r');
      expect(result.replace(addedOverride, '').replace(/\r\n/g, '')).not.toContain('\n');
      expect(modifySwiftAppDelegate(result)).toEqual(result);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('accepts an inheritance clause that spans several lines', async () => {
      const appDelegate = (await readFixture('AppDelegate_sdk58.swift')).replace(
        CLASS_LINE,
        'class AppDelegate:\n  ExpoAppDelegate,\n  ExpoReactNativeFactoryProvider\n{\n',
      );

      const result = modifySwiftAppDelegate(appDelegate);

      expect(result).toContain(`  ExpoReactNativeFactoryProvider\n{\n${BEGIN}\n`);
      expect(count(result, openUrlOverride)).toBe(1);
      expect(count(result, continueOverride)).toBe(1);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('adds the options: override next to a legacy sourceApplication: override', async () => {
      const legacy = `  override func application(_ application: UIApplication, open url: URL, sourceApplication: String?, annotation: Any) -> Bool {
    return true
  }
`;
      const appDelegate = await withMembers(legacy);

      const result = modifySwiftAppDelegate(appDelegate);

      expect(result).toContain(legacy);
      expect(count(result, handleOpen)).toBe(1);
      expect(result).toContain('    options: [UIApplication.OpenURLOptionsKey: Any] = [:]\n');
      expect(result.indexOf('FirebaseAnalytics.Analytics.handleOpen(url)')).toBeLessThan(
        result.indexOf('sourceApplication:'),
      );
      expect(modifySwiftAppDelegate(result)).toEqual(result);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('leaves an unrecognisable file unchanged, with a warning', () => {
      const contents = 'import UIKit\n\nstruct NotAnAppDelegate {}\n';

      expect(modifySwiftAppDelegate(contents)).toEqual(contents);
      expect(warningSpy).toHaveBeenCalledWith(
        '@react-native-firebase/analytics',
        expect.stringContaining('does not declare a recognisable AppDelegate class'),
      );
    });

    it('leaves an override it cannot parse unchanged, with a warning', async () => {
      const appDelegate = await withMembers(
        `  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool { super.application(app, open: url, options: options) }
`,
      );

      const result = modifySwiftAppDelegate(appDelegate);

      expect(count(result, openUrlOverride)).toBe(1);
      expect(result).not.toMatch(handleOpen);
      expect(result).toMatch(handleUserActivity);
      expect(warningSpy).toHaveBeenCalledWith(
        '@react-native-firebase/analytics',
        expect.stringContaining('could not be recognised'),
      );
    });
  });

  describe('modifySwiftAppDelegate with SceneDelegate.swift calls', () => {
    function expectSceneDelegateWarning(call: string) {
      expect(warningSpy).toHaveBeenCalledWith(
        '@react-native-firebase/analytics',
        expect.stringContaining(
          `SceneDelegate.swift already calls FirebaseAnalytics.Analytics.${call}`,
        ),
      );
    }

    it('leaves AppDelegate.swift unchanged when SceneDelegate.swift makes both calls', async () => {
      const appDelegate = await readFixture('AppDelegate_sdk58.swift');

      const result = modifySwiftAppDelegate(
        appDelegate,
        sceneDelegate(`${SCENE_DELEGATE_OPEN_URL}${SCENE_DELEGATE_CONTINUE}`),
      );

      expect(result).toEqual(appDelegate);
      expectSceneDelegateWarning('handleOpen');
      expectSceneDelegateWarning('handleUserActivity');
    });

    it('adds only the call SceneDelegate.swift does not make', async () => {
      const appDelegate = await readFixture('AppDelegate_sdk58.swift');

      const result = modifySwiftAppDelegate(appDelegate, sceneDelegate(SCENE_DELEGATE_CONTINUE));

      expect(result).toMatch(handleOpen);
      expect(result).not.toMatch(handleUserActivity);
      expect(count(result, continueOverride)).toBe(0);
      expect(result).toContain(IMPORT);
      expect(warningSpy).toHaveBeenCalledTimes(1);
      expectSceneDelegateWarning('handleUserActivity');
    });

    it.each([
      ['added overrides', 'AppDelegate_sdk58.swift', '\n'],
      ['a call injected into a user override', 'AppDelegate_sdk58_openUrl.swift', '\n'],
      ['added overrides in a CRLF file', 'AppDelegate_sdk58.swift', '\r\n'],
      ['an injected call in a CRLF file', 'AppDelegate_sdk58_openUrl.swift', '\r\n'],
    ])(
      'removes %s an earlier prebuild generated once SceneDelegate.swift makes the calls',
      async (_label, fixture, newline) => {
        const original = (await readFixture(fixture)).replace(/\n/g, newline);
        const both = sceneDelegate(`${SCENE_DELEGATE_OPEN_URL}${SCENE_DELEGATE_CONTINUE}`);

        const result = modifySwiftAppDelegate(modifySwiftAppDelegate(original), both);

        expect(result).toEqual(original);
        expect(modifySwiftAppDelegate(result, both)).toEqual(original);
      },
    );

    it('removes only the generated code for the call SceneDelegate.swift makes', async () => {
      const appDelegate = await readFixture('AppDelegate_sdk58.swift');

      const result = modifySwiftAppDelegate(
        modifySwiftAppDelegate(appDelegate),
        sceneDelegate(SCENE_DELEGATE_OPEN_URL),
      );

      expect(result).toEqual(
        modifySwiftAppDelegate(appDelegate, sceneDelegate(SCENE_DELEGATE_OPEN_URL)),
      );
      expect(result).not.toMatch(handleOpen);
      expect(result).toMatch(handleUserActivity);
      expect(result).toContain(IMPORT);
    });

    it('removes an added openURL override together with the Auth guard nested in it', async () => {
      const original = await readFixture('AppDelegate_sdk58.swift');
      const patched = authModifySwiftAppDelegate(modifySwiftAppDelegate(original)) as string;

      const result = modifySwiftAppDelegate(patched, sceneDelegate(SCENE_DELEGATE_OPEN_URL));

      expect(result).not.toContain('auth-openURL');
      expect(result).not.toMatch(handleOpen);
      expect(result).toMatch(handleUserActivity);
    });

    it('keeps modified generated blocks, with a warning', async () => {
      const patched = modifySwiftAppDelegate(await readFixture('AppDelegate_sdk58.swift')).replace(
        '    FirebaseAnalytics.Analytics.handleOpen(url)\n',
        '    FirebaseAnalytics.Analytics.handleOpen(url)\n    print("opened")\n',
      );

      const result = modifySwiftAppDelegate(patched, sceneDelegate(SCENE_DELEGATE_OPEN_URL));

      expect(result).toEqual(patched);
      expect(warningSpy).toHaveBeenCalledWith(
        '@react-native-firebase/analytics',
        expect.stringContaining(
          'Skipping removal of the generated FirebaseAnalytics.Analytics.handleOpen call from AppDelegate.swift',
        ),
      );
    });

    it('keeps every generated block when the block for the other call was modified', async () => {
      const patched = modifySwiftAppDelegate(await readFixture('AppDelegate_sdk58.swift')).replace(
        '    FirebaseAnalytics.Analytics.handleUserActivity(userActivity)\n',
        '    FirebaseAnalytics.Analytics.handleUserActivity(userActivity)\n    print("continued")\n',
      );

      const result = modifySwiftAppDelegate(patched, sceneDelegate(SCENE_DELEGATE_OPEN_URL));

      expect(result).toEqual(patched);
      expect(warningSpy).toHaveBeenCalledWith(
        '@react-native-firebase/analytics',
        expect.stringContaining('a @react-native-firebase/analytics-sceneLinkAttribution block'),
      );
    });

    it('leaves a method to SceneDelegate.swift when it makes the call only for launch links', async () => {
      const appDelegate = await readFixture('AppDelegate_sdk58.swift');
      const willConnectOnly = sceneDelegate(`\
  override func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    super.scene(scene, willConnectTo: session, options: connectionOptions)
    connectionOptions.urlContexts.forEach { Analytics.handleOpen($0.url) }
  }
`);

      const result = modifySwiftAppDelegate(appDelegate, willConnectOnly);

      expect(result).not.toMatch(handleOpen);
      expect(result).toMatch(handleUserActivity);
      expect(warningSpy).toHaveBeenCalledWith(
        '@react-native-firebase/analytics',
        expect.stringContaining('for links that launch the app and for links that arrive'),
      );
    });

    it("is not triggered by the Auth plugin's SceneDelegate.swift patch", async () => {
      const appDelegate = await readFixture('AppDelegate_sdk58.swift');
      const authPatched = modifySceneDelegate(
        'internal import Expo\n\nclass SceneDelegate: ExpoSceneDelegate {\n}\n',
      ) as string;
      expect(authPatched).toContain('auth-openURL');

      expect(modifySwiftAppDelegate(appDelegate, authPatched)).toEqual(
        modifySwiftAppDelegate(appDelegate),
      );
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('ignores commented-out calls in SceneDelegate.swift', async () => {
      const appDelegate = await readFixture('AppDelegate_sdk58.swift');

      const result = modifySwiftAppDelegate(
        appDelegate,
        sceneDelegate(
          '  // Analytics.handleOpen(url)\n  /* Analytics.handleUserActivity(activity) */\n',
        ),
      );

      expect(result).toEqual(modifySwiftAppDelegate(appDelegate));
      expect(warningSpy).not.toHaveBeenCalled();
    });
  });

  describe('maskSwiftComments', () => {
    it('blanks comments and keeps offsets, line breaks and strings', () => {
      const source = 'a // b\r\n"/* s */" /* c /* d */ e */ f\n// end';

      const masked = maskSwiftComments(source);

      expect(masked).toHaveLength(source.length);
      expect(masked).toEqual(`a     \r\n"/* s */" ${' '.repeat(17)} f\n${' '.repeat(6)}`);
    });

    it('keeps multi-line and raw strings that contain a lone quote', () => {
      const strings = [
        '"""\n  say "hi // not a comment\n  """',
        '#"raw " // still raw"#',
        '#"escaped \\#" // still raw"#',
        '##"x"# /* still raw */ "##',
      ];
      const source = strings.map(literal => `let s = ${literal} // c\n`).join('');

      const masked = maskSwiftComments(source);

      expect(masked).toHaveLength(source.length);
      expect(masked).toEqual(strings.map(literal => `let s = ${literal}     \n`).join(''));
    });

    it('treats `#if` and `#selector` as code, not raw strings', () => {
      const source = '#if DEBUG // a\nlet s = #selector(f) // b\n#endif\n';

      expect(maskSwiftComments(source)).toEqual(
        `#if DEBUG     \nlet s = #selector(f)     \n#endif\n`,
      );
    });
  });

  describe('Auth openURL fix compatibility', () => {
    it('lets Auth patch the openURL override Analytics adds, and both stay idempotent', async () => {
      const analytics = modifySwiftAppDelegate(await readFixture('AppDelegate_sdk58.swift'));

      const patched = authModifySwiftAppDelegate(analytics);

      expect(patched).not.toBeNull();
      const contents = patched as string;
      const authBegin = contents.indexOf('// @generated begin @react-native-firebase/auth-openURL');
      const authEnd = contents.indexOf('// @generated end @react-native-firebase/auth-openURL');
      const blockBegin = contents.lastIndexOf(BEGIN, authBegin);
      const call = contents.search(handleOpen);
      expect(count(contents, /auth-openURL - expo prebuild/)).toBe(1);
      expect(blockBegin).toBeGreaterThan(-1);
      expect(contents.slice(blockBegin, authBegin)).not.toContain(END);
      expect(authEnd).toBeGreaterThan(authBegin);
      expect(call).toBeGreaterThan(authEnd);
      expect(contents.indexOf(END, call)).toBeGreaterThan(call);
      expect(modifySwiftAppDelegate(contents)).toEqual(contents);
      expect(authModifySwiftAppDelegate(contents)).toBeNull();
      expect(warningSpy).not.toHaveBeenCalled();
      expect(contents).toMatchSnapshot();
    });

    it('lets Auth patch the openURL override Analytics adds to a CRLF AppDelegate', async () => {
      const appDelegate = (await readFixture('AppDelegate_sdk58.swift')).replace(/\n/g, '\r\n');
      const analytics = modifySwiftAppDelegate(appDelegate);

      const runAuth = () => authModifySwiftAppDelegate(analytics);
      expect(runAuth).not.toThrow();

      const patched = runAuth();
      expect(patched).not.toBeNull();
      const contents = patched as string;
      const authBegin = contents.indexOf('// @generated begin @react-native-firebase/auth-openURL');
      const authEnd = contents.indexOf('// @generated end @react-native-firebase/auth-openURL');
      const blockBegin = contents.lastIndexOf(BEGIN, authBegin);
      const call = contents.search(handleOpen);
      expect(count(contents, /auth-openURL - expo prebuild/)).toBe(1);
      expect(blockBegin).toBeGreaterThan(-1);
      expect(contents.slice(blockBegin, authBegin)).toMatch(/open url: URL/);
      expect(contents.slice(blockBegin, authBegin)).not.toContain(END);
      expect(call).toBeGreaterThan(authEnd);
      expect(contents.indexOf(END, call)).toBeGreaterThan(call);
      expect(modifySwiftAppDelegate(contents)).toEqual(contents);
      expect(authModifySwiftAppDelegate(contents)).toBeNull();
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('lets Auth patch a user openURL override Analytics injected into', async () => {
      const analytics = modifySwiftAppDelegate(
        await readFixture('AppDelegate_sdk58_openUrl.swift'),
      );

      const patched = authModifySwiftAppDelegate(analytics);

      expect(patched).not.toBeNull();
      const contents = patched as string;
      expect(count(contents, /auth-openURL - expo prebuild/)).toBe(1);
      expect(contents.indexOf('auth-openURL')).toBeLessThan(contents.search(handleOpen));
      expect(modifySwiftAppDelegate(contents)).toEqual(contents);
      expect(authModifySwiftAppDelegate(contents)).toBeNull();
    });
  });

  describe('removeSceneLinkAttribution', () => {
    it.each([
      ['added overrides', 'AppDelegate_sdk58.swift', '\n'],
      ['a call injected into a user override', 'AppDelegate_sdk58_openUrl.swift', '\n'],
      ['added overrides in a CRLF file', 'AppDelegate_sdk58.swift', '\r\n'],
      ['an injected call in a CRLF file', 'AppDelegate_sdk58_openUrl.swift', '\r\n'],
    ])('restores the original file after %s, idempotently', async (_label, fixture, newline) => {
      const original = (await readFixture(fixture)).replace(/\n/g, newline);

      const removed = removeSceneLinkAttribution(modifySwiftAppDelegate(original));

      expect(removed).toEqual(original);
      expect(removeSceneLinkAttribution(removed)).toEqual(removed);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('removes an added openURL override together with the Auth guard nested in it', async () => {
      const original = await readFixture('AppDelegate_sdk58.swift');
      const patched = authModifySwiftAppDelegate(modifySwiftAppDelegate(original)) as string;
      expect(patched).toContain('auth-openURL');

      const removed = removeSceneLinkAttribution(patched);

      expect(removed).toEqual(original);
      expect(authModifySwiftAppDelegate(removed)).toBeNull();
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('keeps the Auth guard in a user openURL override', async () => {
      const original = await readFixture('AppDelegate_sdk58_openUrl.swift');
      const patched = authModifySwiftAppDelegate(modifySwiftAppDelegate(original)) as string;

      const removed = removeSceneLinkAttribution(patched);

      expect(removed).toEqual(authModifySwiftAppDelegate(original));
      expect(removed).not.toContain(sceneLinkAttributionTag);
    });

    it('keeps the added import while other code uses Firebase Analytics', async () => {
      const original = await withMembers(
        '  func track() { Analytics.logEvent("opened", parameters: nil) }\n',
      );

      const removed = removeSceneLinkAttribution(modifySwiftAppDelegate(original));

      expect(removed).toEqual(
        original.replace('internal import Expo\n', `internal import Expo\n${IMPORT}\n`),
      );
      expect(removeSceneLinkAttribution(removed)).toEqual(removed);
    });

    it('keeps an import the user wrote', async () => {
      const original = (await readFixture('AppDelegate_sdk58.swift')).replace(
        'import React\n',
        'import React\nimport FirebaseAnalytics\n',
      );

      expect(removeSceneLinkAttribution(modifySwiftAppDelegate(original))).toEqual(original);
    });

    it('leaves a file without generated code unchanged', async () => {
      const original = await readFixture('AppDelegate_sdk58_openUrl.swift');

      expect(removeSceneLinkAttribution(original)).toEqual(original);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it.each([
      [
        'wrap code generated by another plugin',
        (contents: string) =>
          contents.replace(
            '    FirebaseAnalytics.Analytics.handleOpen(url)\n',
            '// @generated begin other-plugin - expo prebuild (DO NOT MODIFY)\n    other()\n// @generated end other-plugin\n    FirebaseAnalytics.Analytics.handleOpen(url)\n',
          ),
      ],
      [
        'wrap an Auth guard without its end marker',
        (contents: string) =>
          contents.replace(
            '    FirebaseAnalytics.Analytics.handleOpen(url)\n',
            '// @generated begin @react-native-firebase/auth-openURL - expo prebuild (DO NOT MODIFY)\n    FirebaseAnalytics.Analytics.handleOpen(url)\n',
          ),
      ],
      ['lost an end marker', (contents: string) => contents.replace(`${END}\n`, '')],
      [
        'were edited by hand',
        (contents: string) =>
          contents.replace(
            'return super.application(app, open: url, options: options)',
            'return false',
          ),
      ],
    ])('warns and changes nothing when the blocks %s', async (_label, corrupt) => {
      const contents = corrupt(
        modifySwiftAppDelegate(await readFixture('AppDelegate_sdk58.swift')),
      );

      expect(removeSceneLinkAttribution(contents)).toEqual(contents);
      expect(warningSpy).toHaveBeenCalledWith(
        '@react-native-firebase/analytics',
        expect.stringContaining('Skipping removal of UIScene link attribution'),
      );
    });

    it('keeps user code between two injected blocks that lost the markers between them', async () => {
      const original = (await readFixture('AppDelegate_sdk58_openUrl.swift')).replace(
        '  // Linking API\n',
        [
          '  public override func application(',
          '    _ application: UIApplication,',
          '    continue userActivity: NSUserActivity,',
          '    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void',
          '  ) -> Bool {',
          '    return super.application(application, continue: userActivity, restorationHandler: restorationHandler)',
          '  }',
          '',
          '  // Linking API',
          '',
        ].join('\n'),
      );
      const patched = modifySwiftAppDelegate(original);
      expect(patched.split(BEGIN)).toHaveLength(3);
      expect(count(patched, /override func application\(/)).toBe(
        count(original, /override func application\(/),
      );

      const end1 = patched.indexOf(`${END}\n`);
      const withoutEnd1 = `${patched.slice(0, end1)}${patched.slice(end1 + END.length + 1)}`;
      const begin2 = withoutEnd1.indexOf(`${BEGIN}\n`, end1);
      const contents = `${withoutEnd1.slice(0, begin2)}${withoutEnd1.slice(
        begin2 + BEGIN.length + 1,
      )}`;
      expect(contents.split(BEGIN)).toHaveLength(2);
      expect(contents.split(END)).toHaveLength(2);

      expect(removeSceneLinkAttribution(contents)).toEqual(contents);
      expect(warningSpy).toHaveBeenCalledWith(
        '@react-native-firebase/analytics',
        expect.stringContaining('Skipping removal of UIScene link attribution'),
      );
    });
  });

  describe('declaresSceneManifest', () => {
    it('reads the Info.plist next to the AppDelegate', async () => {
      await writeProject({ infoPlist: SCENE_MANIFEST_PLIST });
      expect(declares()).toBe(true);
    });

    it('reads the Expo config infoPlist', async () => {
      await writeProject({ infoPlist: NO_SCENE_MANIFEST_PLIST });
      expect(declares({ UIApplicationSceneManifest: {} })).toBe(true);
    });

    it('ignores App Clip and extension Info.plist files', async () => {
      await writeProject({ infoPlist: NO_SCENE_MANIFEST_PLIST });
      await writeTargetPlist('HelloWorldClip', SCENE_MANIFEST_PLIST);
      await writeTargetPlist('ShareExtension', SCENE_MANIFEST_PLIST);

      expect(declares()).toBe(false);
    });

    it('prefers the Info.plist the Xcode project assigns to the app target', async () => {
      await writeProject({ infoPlist: NO_SCENE_MANIFEST_PLIST });
      await writeTargetPlist('Config', SCENE_MANIFEST_PLIST);
      mockedGetInfoPlistPathFromPbxproj.mockReturnValue('Config/Info.plist');

      expect(declares()).toBe(true);
      expect(mockedGetInfoPlistPathFromPbxproj).toHaveBeenCalledWith(tmpDir);
    });

    it('falls back to the Info.plist next to the AppDelegate', async () => {
      await writeProject({ infoPlist: SCENE_MANIFEST_PLIST });

      mockedGetInfoPlistPathFromPbxproj.mockReturnValue('Missing/Info.plist');
      expect(declares()).toBe(true);

      mockedGetInfoPlistPathFromPbxproj.mockImplementation(() => {
        throw new Error('Could not find any application target in project.pbxproj');
      });
      expect(declares()).toBe(true);
    });

    it('does not match the key name outside a <key> element', async () => {
      await writeProject({
        infoPlist:
          '<plist><dict><key>Note</key><string>UIApplicationSceneManifest</string></dict></plist>',
      });
      expect(declares()).toBe(false);
    });

    it('ignores a key inside an XML comment', async () => {
      await writeProject({
        infoPlist:
          '<plist><dict>\n<!--\n  <key>UIApplicationSceneManifest</key>\n  <dict/>\n-->\n</dict></plist>',
      });
      expect(declares()).toBe(false);
    });

    it('reports false for a readable XML Info.plist without a scene manifest', async () => {
      await writeProject({ infoPlist: NO_SCENE_MANIFEST_PLIST });
      expect(declares()).toBe(false);
    });

    it('reads a plist the Xcode project resolves to the one next to the AppDelegate once', async () => {
      await writeProject({ infoPlist: NO_SCENE_MANIFEST_PLIST });
      mockedGetInfoPlistPathFromPbxproj.mockReturnValue('HelloWorld/Info.plist');
      const readSpy = jest.spyOn(fsSync, 'readFileSync');

      expect(declares()).toBe(false);
      expect(readSpy).toHaveBeenCalledTimes(1);
    });

    it('reports unknown when no Info.plist can be resolved', async () => {
      mockedGetInfoPlistPathFromPbxproj.mockReturnValue('Missing/Info.plist');
      expect(declares()).toBeNull();
    });

    it('reports unknown when the Info.plist cannot be read', async () => {
      await fs.mkdir(path.join(appDir, 'Info.plist'));
      expect(declares()).toBeNull();
    });

    it('reports unknown for a binary Info.plist', async () => {
      await writeProject({ infoPlist: BINARY_PLIST });
      expect(declares()).toBeNull();
      expect(declares({ UIApplicationSceneManifest: {} })).toBe(true);
    });

    it('falls back to the next Info.plist when the Xcode project one gives no answer', async () => {
      await writeProject({ infoPlist: SCENE_MANIFEST_PLIST });
      await writeTargetPlist('Config', BINARY_PLIST);
      mockedGetInfoPlistPathFromPbxproj.mockReturnValue('Config/Info.plist');

      expect(declares()).toBe(true);
    });
  });

  describe('applySceneLinkAttributionAsync', () => {
    it('patches AppDelegate.swift when Info.plist declares UIApplicationSceneManifest', async () => {
      const fixture = await readFixture('AppDelegate_sdk58.swift');
      const appDelegatePath = await writeProject({ appDelegateContents: fixture });

      await apply();

      expect(await fs.readFile(appDelegatePath, 'utf-8')).toEqual(modifySwiftAppDelegate(fixture));
    });

    it('skips the calls the SceneDelegate.swift next to AppDelegate.swift already makes', async () => {
      const fixture = await readFixture('AppDelegate_sdk58.swift');
      const appDelegatePath = await writeProject({ appDelegateContents: fixture });
      const sceneDelegateContents = sceneDelegate(SCENE_DELEGATE_OPEN_URL);
      await fs.writeFile(path.join(appDir, 'SceneDelegate.swift'), sceneDelegateContents);

      await apply();

      expect(await fs.readFile(appDelegatePath, 'utf-8')).toEqual(
        modifySwiftAppDelegate(fixture, sceneDelegateContents),
      );
      expect(await fs.readFile(appDelegatePath, 'utf-8')).not.toMatch(handleOpen);
      expect(await fs.readFile(path.join(appDir, 'SceneDelegate.swift'), 'utf-8')).toEqual(
        sceneDelegateContents,
      );
    });

    it('does not change AppDelegate.swift without a scene manifest', async () => {
      const fixture = await readFixture('AppDelegate_sdk58.swift');
      const appDelegatePath = await writeProject({
        appDelegateContents: fixture,
        infoPlist: NO_SCENE_MANIFEST_PLIST,
      });

      await apply();

      expect(await fs.readFile(appDelegatePath, 'utf-8')).toEqual(fixture);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('removes what an earlier prebuild added once the scene manifest is gone', async () => {
      const fixture = await readFixture('AppDelegate_sdk58_openUrl.swift');
      const appDelegatePath = await writeProject({
        appDelegateContents: modifySwiftAppDelegate(fixture),
        infoPlist: NO_SCENE_MANIFEST_PLIST,
      });

      await apply();
      expect(await fs.readFile(appDelegatePath, 'utf-8')).toEqual(fixture);

      const { mtimeMs } = await fs.stat(appDelegatePath);
      await apply();
      expect(await fs.readFile(appDelegatePath, 'utf-8')).toEqual(fixture);
      expect((await fs.stat(appDelegatePath)).mtimeMs).toEqual(mtimeMs);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it.each([
      ['cannot be resolved', null],
      ['is a binary plist', BINARY_PLIST],
    ])(
      'warns and neither adds nor removes code when the Info.plist %s',
      async (_label, infoPlist) => {
        const fixture = await readFixture('AppDelegate_sdk58_openUrl.swift');
        for (const contents of [fixture, modifySwiftAppDelegate(fixture)]) {
          warningSpy.mockClear();
          const appDelegatePath = await writeProject({
            appDelegateContents: contents,
            infoPlist: infoPlist ?? undefined,
          });
          if (infoPlist === null) {
            await fs.rm(path.join(appDir, 'Info.plist'));
          }

          await apply();

          expect(await fs.readFile(appDelegatePath, 'utf-8')).toEqual(contents);
          expect(warningSpy).toHaveBeenCalledWith(
            '@react-native-firebase/analytics',
            expect.stringContaining('Info.plist could not be read'),
          );
        }
      },
    );

    it('does not change AppDelegate.swift when only an extension declares a scene manifest', async () => {
      const fixture = await readFixture('AppDelegate_sdk58.swift');
      const appDelegatePath = await writeProject({
        appDelegateContents: fixture,
        infoPlist: NO_SCENE_MANIFEST_PLIST,
      });
      await writeTargetPlist('HelloWorldClip', SCENE_MANIFEST_PLIST);

      await apply();

      expect(await fs.readFile(appDelegatePath, 'utf-8')).toEqual(fixture);
    });

    it('does not throw when FirebaseAppDelegateProxyEnabled is false', async () => {
      const fixture = await readFixture('AppDelegate_sdk58.swift');
      const appDelegatePath = await writeProject({ appDelegateContents: fixture });

      await expect(apply({ FirebaseAppDelegateProxyEnabled: false })).resolves.toBeUndefined();

      expect(await fs.readFile(appDelegatePath, 'utf-8')).toMatch(handleOpen);
    });

    it('warns and leaves an Objective-C AppDelegate unchanged', async () => {
      const fixture = await readFixture('AppDelegate_sdk45.mm');
      const appDelegatePath = await writeProject({
        appDelegateName: 'AppDelegate.mm',
        appDelegateContents: fixture,
      });

      await apply();

      expect(await fs.readFile(appDelegatePath, 'utf-8')).toEqual(fixture);
      expect(warningSpy).toHaveBeenCalledWith(
        '@react-native-firebase/analytics',
        expect.stringContaining('AppDelegate.mm is not Swift'),
      );
    });

    it('does not warn about an Objective-C AppDelegate without a scene manifest', async () => {
      await writeProject({
        appDelegateName: 'AppDelegate.mm',
        appDelegateContents: await readFixture('AppDelegate_sdk45.mm'),
        infoPlist: NO_SCENE_MANIFEST_PLIST,
      });

      await apply();

      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('leaves an AppDelegate it cannot patch unchanged', async () => {
      const contents = 'import UIKit\n\nstruct NotAnAppDelegate {}\n';
      const appDelegatePath = await writeProject({ appDelegateContents: contents });
      const { mtimeMs } = await fs.stat(appDelegatePath);

      await apply();

      expect(await fs.readFile(appDelegatePath, 'utf-8')).toEqual(contents);
      expect((await fs.stat(appDelegatePath)).mtimeMs).toEqual(mtimeMs);
    });

    it('is a no-op when there is no AppDelegate', async () => {
      await writeProject({});

      await expect(apply()).resolves.toBeUndefined();

      expect(await fs.readdir(appDir)).toEqual(['Info.plist']);
      expect(warningSpy).not.toHaveBeenCalled();
    });
  });

  describe('withIosSceneLinkAttribution', () => {
    it.each([
      ['the Info.plist', undefined, SCENE_MANIFEST_PLIST],
      ['ios.infoPlist', { infoPlist: { UIApplicationSceneManifest: {} } }, NO_SCENE_MANIFEST_PLIST],
    ])(
      'registers a dangerous mod that patches the AppDelegate from %s',
      async (_label, ios, infoPlist) => {
        const fixture = await readFixture('AppDelegate_sdk58.swift');
        const appDelegatePath = await writeProject({ appDelegateContents: fixture, infoPlist });

        const config = withIosSceneLinkAttribution({
          name: 'HelloWorld',
          slug: 'hello-world',
          ios,
        });
        const { mods } = config as { mods?: { ios?: { dangerous?: unknown } } };
        const dangerousMod = mods?.ios?.dangerous as (
          config: ExpoConfig & { modRequest: object },
        ) => Promise<ExpoConfig>;
        await dangerousMod({
          ...config,
          modRequest: {
            projectRoot: tmpDir,
            platformProjectRoot: iosDir,
            platform: 'ios',
            modName: 'dangerous',
            introspect: false,
          },
        });

        expect(await fs.readFile(appDelegatePath, 'utf-8')).toEqual(
          modifySwiftAppDelegate(fixture),
        );
      },
    );
  });
});
