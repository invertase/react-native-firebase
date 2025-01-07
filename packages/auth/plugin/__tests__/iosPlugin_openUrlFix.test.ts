import fs from 'fs/promises';
import path from 'path';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { WarningAggregator } from '@expo/config-plugins';
import type { AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';
import {
  shouldApplyIosOpenUrlFix,
  modifyObjcAppDelegate,
  withOpenUrlFixForAppDelegate,
  ensureFirebaseSwizzlingIsEnabled,
  appDelegateOpenUrlInsertionPointAfter,
  multiline_appDelegateOpenUrlInsertionPointAfter,
} from '../src/ios/openUrlFix';
import type { ExpoConfigPluginEntry } from '../src/ios/openUrlFix';

describe('Config Plugin iOS Tests - openUrlFix', () => {
  beforeEach(function () {
    jest.resetAllMocks();
  });

  it('is disabled by default', async () => {
    const config = {
      name: 'TestName',
      slug: 'TestSlug',
    };

    expect(
      shouldApplyIosOpenUrlFix({
        config,
      }),
    ).toBe(false);

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {},
      }),
    ).toBe(false);

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {
          ios: {},
        },
      }),
    ).toBe(false);

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {
          ios: {
            captchaOpenUrlFix: undefined,
          },
        },
      }),
    ).toBe(false);

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {
          ios: {
            captchaOpenUrlFix: 'default',
          },
        },
      }),
    ).toBe(false);

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {
          ios: {
            captchaOpenUrlFix: false,
          },
        },
      }),
    ).toBe(false);

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {
          ios: {
            captchaOpenUrlFix: true,
          },
        },
      }),
    ).toBe(true);
  });

  it('is enabled by default when expo-router is found', async () => {
    const cases: ExpoConfigPluginEntry[] = ['expo-router', ['expo-router'], ['expo-router', {}]];

    for (const routerPluginEntry of cases) {
      const plugins: ExpoConfigPluginEntry[] = [
        'something',
        [],
        ['something-else', { foo: 'bar' }],
        routerPluginEntry,
      ];

      const config = {
        name: 'TestName',
        slug: 'TestSlug',
        plugins,
      };

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {},
        }),
      ).toBe(true);

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {
            ios: {},
          },
        }),
      ).toBe(true);

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {
            ios: {
              captchaOpenUrlFix: undefined,
            },
          },
        }),
      ).toBe(true);

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {
            ios: {
              captchaOpenUrlFix: 'default',
            },
          },
        }),
      ).toBe(true);

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {
            ios: {
              captchaOpenUrlFix: false,
            },
          },
        }),
      ).toBe(false);

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {
            ios: {
              captchaOpenUrlFix: true,
            },
          },
        }),
      ).toBe(true);
    }
  });

  it('throws an error for invalid config', () => {
    expect(() =>
      shouldApplyIosOpenUrlFix({
        config: {
          name: 'TestName',
          slug: 'TestSlug',
        },
        props: {
          ios: {
            // @ts-ignore testing invalid argument
            captchaOpenUrlFix: Math.PI,
          },
        },
      }),
    ).toThrow("Unexpected value for 'captchaOpenUrlFix' config option");
  });

  const appDelegateFixturesPatch = [
    'AppDelegate_bare_sdk43.m',
    'AppDelegate_sdk44.m',
    'AppDelegate_sdk45.mm',
  ];
  appDelegateFixturesPatch.forEach(fixtureName => {
    it(`munges AppDelegate correctly - ${fixtureName}`, async () => {
      const fixturePath = path.join(__dirname, 'fixtures', fixtureName);
      const appDelegate = await fs.readFile(fixturePath, { encoding: 'utf-8' });
      const result = modifyObjcAppDelegate(appDelegate);
      expect(result).toMatchSnapshot();
    });

    it(`prints warning message when configured to default and AppDelegate is modified`, async () => {
      const fixturePath = path.join(__dirname, 'fixtures', fixtureName);
      const appDelegate = await fs.readFile(fixturePath, { encoding: 'utf-8' });
      const config = {
        name: 'TestName',
        slug: 'TestSlug',
        modRequest: { projectRoot: path.join(__dirname, 'fixtures') } as any,
        modResults: {
          path: fixturePath,
          language: 'objc',
          contents: appDelegate,
        } as AppDelegateProjectFile,
        modRawConfig: { name: 'TestName', slug: 'TestSlug' },
      };
      const props = undefined;
      const spy = jest
        .spyOn(WarningAggregator, 'addWarningIOS')
        .mockImplementation(() => undefined);
      withOpenUrlFixForAppDelegate({ config, props });
      expect(spy).toHaveBeenCalledWith(
        '@react-native-firebase/auth',
        'modifying iOS AppDelegate openURL method to ignore firebaseauth reCAPTCHA redirect URLs',
      );
    });
  });

  const appDelegateFixturesNoop = ['AppDelegate_sdk42.m', 'AppDelegate_fallback.m'];
  appDelegateFixturesNoop.forEach(fixtureName => {
    it(`skips AppDelegate without openURL - ${fixtureName}`, async () => {
      const fixturePath = path.join(__dirname, 'fixtures', fixtureName);
      const appDelegate = await fs.readFile(fixturePath, { encoding: 'utf-8' });
      const config = {
        name: 'TestName',
        slug: 'TestSlug',
        plugins: ['expo-router'],
        modRequest: { projectRoot: path.join(__dirname, 'fixtures') } as any,
        modResults: {
          path: fixturePath,
          language: 'objc',
          contents: appDelegate,
        } as AppDelegateProjectFile,
        modRawConfig: { name: 'TestName', slug: 'TestSlug' },
      };
      const props = undefined;
      const spy = jest
        .spyOn(WarningAggregator, 'addWarningIOS')
        .mockImplementation(() => undefined);
      const result = withOpenUrlFixForAppDelegate({ config, props });
      expect(result.modResults.contents).toBe(appDelegate);
      expect(spy).toHaveBeenCalledWith(
        '@react-native-firebase/auth',
        "Skipping iOS openURL fix because no 'openURL' method was found",
      );
    });

    it(`errors when enabled but openURL not found - ${fixtureName}`, async () => {
      const fixturePath = path.join(__dirname, 'fixtures', fixtureName);
      const appDelegate = await fs.readFile(fixturePath, { encoding: 'utf-8' });
      const config = {
        name: 'TestName',
        slug: 'TestSlug',
        modRequest: { projectRoot: path.join(__dirname, 'fixtures') } as any,
        modResults: {
          path: fixturePath,
          language: 'objc',
          contents: appDelegate,
        } as AppDelegateProjectFile,
        modRawConfig: { name: 'TestName', slug: 'TestSlug' },
      };
      const props = {
        ios: {
          captchaOpenUrlFix: true,
        },
      };
      expect(() => withOpenUrlFixForAppDelegate({ config, props })).toThrow(
        "Failed to apply iOS openURL fix because no 'openURL' method was found",
      );
    });
  });

  it(`should issue error when openURL is found but patching fails`, () => {
    const snippet = [
      '// preamble goes here\nint theAnswer()\n{\n\treturn 42;\n}',
      '- (BOOL)application:(UIApplication *)application options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options openURL:(NSURL *)url\n{',
      'int x = theAnswer();\n',
    ].join('');
    expect(() => modifyObjcAppDelegate(snippet)).toThrow(
      "Failed to apply 'captchaOpenUrlFix' but detected 'openURL' method.",
    );
  });

  const positiveTemplateCases = [
    '- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {\n\tint x=3;',
    '- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options',
    '\t- (\tBOOL ) application : ( UIApplication*\t)   application openURL : ( NSURL*) url   options :  (  NSDictionary < UIApplicationOpenURLOptionsKey , id > *)\toptions',
    '  - ( BOOL ) application : ( UIApplication*\t)   application openURL : ( NSURL*) url   options :  (  NSDictionary < UIApplicationOpenURLOptionsKey , id > *)\toptions\n\n{\n\n',
  ];
  positiveTemplateCases.forEach((snippet, caseIdx) => {
    it(`must match positiveTemplateCases[${caseIdx}]`, () => {
      expect(appDelegateOpenUrlInsertionPointAfter.test(snippet)).toBe(true);
      if (snippet.match(/{/)) {
        expect(multiline_appDelegateOpenUrlInsertionPointAfter.test(snippet)).toBe(true);
        expect(modifyObjcAppDelegate(snippet)).toMatchSnapshot();
      }
    });
  });

  const negativeTemplateCases = [
    '- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity {',
    '- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url',
    '\t( BOOL ) application : ( UIApplication*\t)   application openURL : ( NSURL*) url   options :  (  NSDictionary < UIApplicationOpenURLOptionsKey , id > *)\toptions',
  ];
  negativeTemplateCases.forEach((snippet, caseIdx) => {
    it(`must not match negativeTemplateCases[${caseIdx}]`, () => {
      expect(appDelegateOpenUrlInsertionPointAfter.test(snippet)).toBe(false);
    });
  });

  it(`rejects projects with swizzling disabled`, () => {
    const config = {
      name: 'TestName',
      slug: 'TestSlug',
      plugins: ['expo-router'],
      modRequest: { projectRoot: path.join(__dirname, 'fixtures') } as any,
      modResults: {
        path: path.join(__dirname, 'fixtures', '/path/to/Info.plist'),
        language: 'plist',
        contents: '',
      },
      modRawConfig: { name: 'TestName', slug: 'TestSlug' },
      ios: {
        infoPlist: {
          FirebaseAppDelegateProxyEnabled: false,
        },
      },
    };
    expect(() => ensureFirebaseSwizzlingIsEnabled(config)).toThrow(
      'Your app has disabled swizzling by setting FirebaseAppDelegateProxyEnabled=false in its Info.plist.',
    );
  });
});
