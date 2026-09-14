import { IOSConfig, WarningAggregator } from '@expo/config-plugins';
import { AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';
import fs from 'fs/promises';
import path from 'path';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  modifyAppDelegateAsync,
  modifyObjcAppDelegate,
  modifySwiftAppDelegate,
} from '../src/ios/appDelegate';
import { platform } from 'os';

describe('Config Plugin iOS Tests', function () {
  beforeEach(function () {
    jest.resetAllMocks();
  });

  it('tests changes made to old AppDelegate.m (SDK 42)', async function () {
    const appDelegate = await fs.readFile(path.join(__dirname, './fixtures/AppDelegate_sdk42.m'), {
      encoding: 'utf8',
    });
    const result = modifyObjcAppDelegate(appDelegate);
    expect(result).toMatchSnapshot();
  });

  it('tests changes made to AppDelegate.m (SDK 43)', async function () {
    const appDelegate = await fs.readFile(
      path.join(__dirname, './fixtures/AppDelegate_bare_sdk43.m'),
      {
        encoding: 'utf8',
      },
    );
    const result = modifyObjcAppDelegate(appDelegate);
    expect(result).toMatchSnapshot();
  });

  it('tests changes made to AppDelegate.m with Expo ReactDelegate support (SDK 44+)', async function () {
    const appDelegate = await fs.readFile(path.join(__dirname, './fixtures/AppDelegate_sdk44.m'), {
      encoding: 'utf8',
    });
    const result = modifyObjcAppDelegate(appDelegate);
    expect(result).toMatchSnapshot();
  });

  it('tests changes made to AppDelegate.m with fallback regex (if the original one fails)', async function () {
    if (platform() == 'win32') {
      return;
    }
    const appDelegate = await fs.readFile(
      path.join(__dirname, './fixtures/AppDelegate_fallback.m'),
      {
        encoding: 'utf8',
      },
    );
    const result = modifyObjcAppDelegate(appDelegate);
    expect(result).toMatchSnapshot();
  });

  it('works with AppDelegate.mm (RN 0.68+)', async function () {
    const appDelegate = await fs.readFile(path.join(__dirname, './fixtures/AppDelegate_sdk45.mm'), {
      encoding: 'utf8',
    });
    const result = modifyObjcAppDelegate(appDelegate);
    expect(result).toMatchSnapshot();
  });

  it('detects Objective-C++ AppDelegate.mm', async function () {
    jest.spyOn(fs, 'writeFile').mockImplementation(async () => {});

    const appDelegatePath = path.join(__dirname, './fixtures/AppDelegate_sdk45.mm');
    const appDelegateFileInfo = IOSConfig.Paths.getFileInfo(
      appDelegatePath,
    ) as AppDelegateProjectFile;

    await modifyAppDelegateAsync(appDelegateFileInfo);

    // expect file contents to be modified
    expect(fs.writeFile).toHaveBeenCalledWith(
      appDelegateFileInfo.path,
      expect.not.stringContaining(appDelegateFileInfo.contents),
    );
  });

  it('works with Swift AppDelegate (SDK 53+)', async function () {
    const appDelegate = await fs.readFile(
      path.join(__dirname, './fixtures/AppDelegate_sdk53.swift'),
      {
        encoding: 'utf8',
      },
    );
    const result = modifySwiftAppDelegate(appDelegate);
    expect(result).toMatchSnapshot();
  });

  it('works with a UIScene lifecycle Swift AppDelegate (SDK 58+)', async function () {
    const appDelegate = await fs.readFile(
      path.join(__dirname, './fixtures/AppDelegate_sdk58.swift'),
      {
        encoding: 'utf8',
      },
    );

    // The SDK 58 template moved `startReactNative` into SceneDelegate.swift, so neither of the
    // pre-existing anchors is present. Without the didFinishLaunchingWithOptions fallback the
    // plugin silently skips and Firebase is never configured.
    expect(appDelegate).not.toContain('factory.startReactNative(');
    expect(appDelegate).not.toContain('self.moduleName');

    const result = modifySwiftAppDelegate(appDelegate);

    expect(result).toContain('import FirebaseCore');
    // Must land inside didFinishLaunchingWithOptions: it has to run before any scene connects.
    const configureIndex = result.indexOf('FirebaseApp.configure()');
    const didFinishLaunchingIndex = result.indexOf('didFinishLaunchingWithOptions launchOptions');
    const superCallIndex = result.indexOf('return super.application(application');
    expect(configureIndex).toBeGreaterThan(didFinishLaunchingIndex);
    expect(configureIndex).toBeLessThan(superCallIndex);
    expect(result).toMatchSnapshot();
  });

  it('is idempotent on a UIScene lifecycle Swift AppDelegate', async function () {
    const appDelegate = await fs.readFile(
      path.join(__dirname, './fixtures/AppDelegate_sdk58.swift'),
      {
        encoding: 'utf8',
      },
    );

    const once = modifySwiftAppDelegate(appDelegate);
    const twice = modifySwiftAppDelegate(once);

    expect(twice).toEqual(once);
    expect(twice.match(/FirebaseApp\.configure\(\)/g)).toHaveLength(1);
    expect(twice.match(/import FirebaseCore/g)).toHaveLength(1);
  });

  it('warns rather than throwing when a Swift AppDelegate has no recognizable insertion point', function () {
    const appDelegate = `import UIKit

class NotAnAppDelegate {
  var window: UIWindow?
}
`;
    const spy = jest.spyOn(WarningAggregator, 'addWarningIOS').mockImplementation(() => undefined);

    const result = modifySwiftAppDelegate(appDelegate);

    expect(result).not.toContain('FirebaseApp.configure()');
    expect(spy).toHaveBeenCalledWith(
      '@react-native-firebase/app',
      'Unable to determine correct Firebase insertion point in AppDelegate.swift. Skipping Firebase addition.',
    );
  });

  it('does not add the firebase import multiple times', async function () {
    const singleImport = '#import "AppDelegate.h"\n#import <Firebase/Firebase.h>';
    const doubleImport = singleImport + '\n#import <Firebase/Firebase.h>';

    const appDelegate = await fs.readFile(path.join(__dirname, './fixtures/AppDelegate_sdk45.mm'), {
      encoding: 'utf8',
    });
    expect(appDelegate).not.toContain(singleImport);

    const onceModifiedAppDelegate = modifyObjcAppDelegate(appDelegate);
    expect(onceModifiedAppDelegate).toContain(singleImport);
    expect(onceModifiedAppDelegate).not.toContain(doubleImport);

    const twiceModifiedAppDelegate = modifyObjcAppDelegate(onceModifiedAppDelegate);
    expect(twiceModifiedAppDelegate).toContain(singleImport);
    expect(twiceModifiedAppDelegate).not.toContain(doubleImport);
  });

  it('adds the Firebase import to an Objective-C AppDelegate without the standard header import', function () {
    const appDelegate = `#import <UIKit/UIKit.h>

@implementation AppDelegate
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  return YES;
}
@end
`;

    const result = modifyObjcAppDelegate(appDelegate);
    expect(result).toContain('#import <Firebase/Firebase.h>');
    expect(result).toContain('[FIRApp configure];');
  });

  it('adds the Firebase import to a Swift AppDelegate without Expo', function () {
    const appDelegate = `import UIKit
import React

class AppDelegate {
  func configure() {
    self.moduleName = "App"
  }
}
`;

    const result = modifySwiftAppDelegate(appDelegate);
    expect(result).toContain('import FirebaseCore');
    expect(result).toContain('FirebaseApp.configure()');
  });
});
