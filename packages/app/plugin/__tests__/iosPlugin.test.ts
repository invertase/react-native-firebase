import fs from 'fs/promises';
import path from 'path';

import { modifyObjcAppDelegate } from '../src/ios/appDelegate';

describe('Config Plugin iOS Tests', function () {
  it('tests changes made to AppDelegate.m', async function () {
    const appDelegate = await fs.readFile(path.join(__dirname, './fixtures/AppDelegate.m'), {
      encoding: 'utf8',
    });
    const result = modifyObjcAppDelegate(appDelegate);
    expect(result).toMatchSnapshot();
  });
});
