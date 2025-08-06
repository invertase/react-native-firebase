import { IOSConfig } from '@expo/config-plugins';
import { AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';

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

  it('supports Swift AppDelegate', async function () {
    // Use MockedFunction to properly type the mock
    const writeFileMock = jest
      .spyOn(fs, 'writeFile')
      .mockImplementation(async () => {}) as jest.MockedFunction<typeof fs.writeFile>;

    const swiftContents = `import Expo
import React

@UIApplicationMain
class AppDelegate: ExpoAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Initialize the factory
    let factory = ExpoReactNativeFactory(delegate: delegate)
    factory.startReactNative(withModuleName: "main", in: window, launchOptions: launchOptions)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}`;

    const appDelegateFileInfo: AppDelegateProjectFile = {
      path: '/app/ios/App/AppDelegate.swift',
      language: 'swift',
      contents: swiftContents,
    };

    await modifyAppDelegateAsync(appDelegateFileInfo);

    // Check if writeFile was called
    expect(writeFileMock).toHaveBeenCalled();

    // Get the modified content with explicit string type assertion
    const modifiedContents = writeFileMock.mock.calls[0][1] as string;

    // Verify import was added
    expect(modifiedContents).toContain('import RNFBAppCheck');

    // Verify initialization code was added
    expect(modifiedContents).toContain('RNFBAppCheckModule.sharedInstance()');

    // Verify Firebase.configure() was added
    expect(modifiedContents).toContain('FirebaseApp.configure()');

    // Verify the code was added before startReactNative (with explicit type assertion)
    const codeIndex = (modifiedContents as string).indexOf('RNFBAppCheckModule.sharedInstance()');
    const startReactNativeIndex = (modifiedContents as string).indexOf('factory.startReactNative');
    expect(codeIndex).toBeLessThan(startReactNativeIndex);
  });

  it('does not add the firebase import multiple times', async function () {
    const singleImport = '#import "AppDelegate.h"\n#import <RNFBAppCheckModule.h>';
    const doubleImport = singleImport + '\n#import <RNFBAppCheckModule.h>';

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

  it('does not add the swift import multiple times', async function () {
    const swiftContents = `import Expo
import React

@UIApplicationMain
class AppDelegate: ExpoAppDelegate {
  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let factory = ExpoReactNativeFactory(delegate: delegate)
    factory.startReactNative(withModuleName: "main", in: window, launchOptions: launchOptions)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}`;

    const onceModifiedContents = modifySwiftAppDelegate(swiftContents);
    expect(onceModifiedContents).toContain('import RNFBAppCheck');

    // Count occurrences of the import
    const importCount = (onceModifiedContents.match(/import RNFBAppCheck/g) || []).length;
    expect(importCount).toBe(1);

    // Modify a second time and ensure imports aren't duplicated
    const twiceModifiedContents = modifySwiftAppDelegate(onceModifiedContents);
    const secondImportCount = (twiceModifiedContents.match(/import RNFBAppCheck/g) || []).length;
    expect(secondImportCount).toBe(1);
  });
});
