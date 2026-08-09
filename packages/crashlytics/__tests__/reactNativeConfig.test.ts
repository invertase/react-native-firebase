import { existsSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from '@jest/globals';

const config = require('../react-native.config.js');

describe('Crashlytics react-native.config.js', function () {
  it('declares the iOS script phase that uploads dSYMs', function () {
    // Without this entry `pod install` silently drops the
    // `[RNFB] Crashlytics Configuration` build phase from the Xcode project,
    // so dSYMs are never uploaded and iOS crash reports stay unsymbolicated.
    const scriptPhases = config.dependency.platforms.ios.scriptPhases;

    expect(scriptPhases).toHaveLength(1);
    expect(scriptPhases[0].name).toBe('[RNFB] Crashlytics Configuration');
    expect(scriptPhases[0].path).toBe('./ios_config.sh');
    expect(scriptPhases[0].execution_position).toBe('after_compile');
  });

  it('points the script phase at a script that exists', function () {
    const scriptPath = join(__dirname, '..', config.dependency.platforms.ios.scriptPhases[0].path);

    expect(existsSync(scriptPath)).toBe(true);
  });
});
