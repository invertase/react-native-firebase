import { IOSConfig } from '@expo/config-plugins';
import { AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';
import fs from 'fs/promises';
import path from 'path';

import { modifyAppDelegateAsync, modifyObjcAppDelegate } from '../src/ios/appDelegate';

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
    jest.spyOn(fs, 'writeFile').mockImplementation();

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

  it("doesn't support Swift AppDelegate", async function () {
    jest.spyOn(fs, 'writeFile').mockImplementation();

    const appDelegateFileInfo: AppDelegateProjectFile = {
      path: '.',
      language: 'swift',
      contents: 'some dummy content',
    };

    await expect(modifyAppDelegateAsync(appDelegateFileInfo)).rejects.toThrow();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });
});
