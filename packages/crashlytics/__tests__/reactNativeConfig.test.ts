import { existsSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from '@jest/globals';

const config = require('../react-native.config.js');

function expandFlatBuildSettings(value: string, settings: Record<string, string>): string {
  return value.replace(/\$[{(](\w+)[})]/g, (_match: string, name: string) =>
    expandFlatBuildSettings(settings[name] ?? '', settings),
  );
}

const appBuildSettings: Record<string, string> = {
  DWARF_DSYM_FOLDER_PATH: '/dsyms',
  DWARF_DSYM_FILE_NAME: 'ExampleApp.app.dSYM',
  TARGET_NAME: 'ExampleApp',
  PRODUCT_NAME: 'Example Development',
  EXECUTABLE_PREFIX: '',
  EXECUTABLE_VARIANT_SUFFIX: '',
  EXECUTABLE_SUFFIX: '',
  EXECUTABLE_NAME:
    '$(EXECUTABLE_PREFIX)$(PRODUCT_NAME)$(EXECUTABLE_VARIANT_SUFFIX)$(EXECUTABLE_SUFFIX)',
};

function declaredDwarfInput(): string {
  const input = config.dependency.platforms.ios.scriptPhases[0].input_files.find((file: string) =>
    file.includes('/DWARF/'),
  );
  expect(typeof input).toBe('string');
  return input;
}

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

  it('declares the dSYM DWARF input by executable name', function () {
    const inputFiles = config.dependency.platforms.ios.scriptPhases[0].input_files;

    expect(inputFiles).toContain(
      '${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Resources/DWARF/${EXECUTABLE_NAME}',
    );
    expect(inputFiles.some((file: string) => file.includes('${TARGET_NAME}'))).toBe(false);
  });

  it('resolves the dSYM DWARF input to the product name for an app by default', function () {
    expect(expandFlatBuildSettings(declaredDwarfInput(), appBuildSettings)).toBe(
      '/dsyms/ExampleApp.app.dSYM/Contents/Resources/DWARF/Example Development',
    );
  });

  it('resolves the dSYM DWARF input to a custom executable name when overridden', function () {
    expect(
      expandFlatBuildSettings(declaredDwarfInput(), {
        ...appBuildSettings,
        EXECUTABLE_NAME: 'CustomBinary',
      }),
    ).toBe('/dsyms/ExampleApp.app.dSYM/Contents/Resources/DWARF/CustomBinary');
  });

  it('points the script phase at a script that exists', function () {
    const scriptPath = join(__dirname, '..', config.dependency.platforms.ios.scriptPhases[0].path);

    expect(existsSync(scriptPath)).toBe(true);
  });
});
