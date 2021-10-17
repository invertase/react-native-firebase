import fs from 'fs/promises';
import path from 'path';

import { modifyObjcAppDelegate } from '../src/ios/appDelegate';

describe('Config Plugin iOS Tests', function () {
  it('tests changes made to old AppDelegate.m (SDK 42)', async function () {
    const appDelegate = await fs.readFile(path.join(__dirname, './fixtures/AppDelegate_sdk42.m'), {
      encoding: 'utf8',
    });
    const result = modifyObjcAppDelegate(appDelegate);
    expect(result).toMatchSnapshot();
  });

  it('tests changes made to AppDelegate.m (SDK 43+)', async function () {
    const appDelegate = await fs.readFile(
      path.join(__dirname, './fixtures/AppDelegate_bare_sdk43.m'),
      {
        encoding: 'utf8',
      },
    );
    const result = modifyObjcAppDelegate(appDelegate);
    expect(result).toMatchSnapshot();
  });
});
