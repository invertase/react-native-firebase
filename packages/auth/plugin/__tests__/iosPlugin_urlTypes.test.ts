import path from 'path';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { setUrlTypesForCaptcha } from '../src/ios/urlTypes';

describe('Config Plugin iOS Tests - urlTypes', () => {
  beforeEach(function () {
    jest.resetAllMocks();
  });

  it('throws if path to GoogleServer-Info.plist is not provided', async () => {
    expect(() => {
      setUrlTypesForCaptcha({
        config: {
          name: 'TestName',
          slug: 'TestSlug',
          modRequest: { projectRoot: path.join(__dirname, 'fixtures') } as any,
          modResults: {},
          modRawConfig: { name: 'TestName', slug: 'TestSlug' },
          ios: {},
        },
      });
    }).toThrow(
      `[@react-native-firebase/auth] Your app.json file is missing ios.googleServicesFile. Please add this field.`,
    );
  });

  it('throws if GoogleServer-Info.plist cannot be read', async () => {
    const googleServiceFilePath = path.join(__dirname, 'fixtures', 'ThisFileDoesNotExist.plist');
    expect(() => {
      setUrlTypesForCaptcha({
        config: {
          name: 'TestName',
          slug: 'TestSlug',
          modRequest: { projectRoot: path.join(__dirname, 'fixtures') } as any,
          modResults: {},
          modRawConfig: { name: 'TestName', slug: 'TestSlug' },
          ios: { googleServicesFile: 'ThisFileDoesNotExist.plist' },
        },
      });
    }).toThrow(
      `[@react-native-firebase/auth] GoogleService-Info.plist doesn't exist in ${googleServiceFilePath}. Place it there or configure the path in app.json`,
    );
  });

  it('warns if GoogleServer-Info.plist has no reversed client id', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    setUrlTypesForCaptcha({
      config: {
        name: 'TestName',
        slug: 'TestSlug',
        modRequest: { projectRoot: path.join(__dirname, 'fixtures') } as any,
        modResults: {},
        modRawConfig: { name: 'TestName', slug: 'TestSlug' },
        ios: { googleServicesFile: 'TestGoogleService-Info.incomplete.plist' },
      },
    });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[@react-native-firebase/auth] No REVERSED_CLIENT_ID found in GoogleService-Info.plist. Skipping URL scheme configuration.',
    );
    consoleWarnSpy.mockRestore();
  });

  it('adds url types to the Info.plist', async () => {
    const result = setUrlTypesForCaptcha({
      config: {
        name: 'TestName',
        slug: 'TestSlug',
        modRequest: { projectRoot: path.join(__dirname, 'fixtures') } as any,
        modResults: {},
        modRawConfig: { name: 'TestName', slug: 'TestSlug' },
        ios: { googleServicesFile: 'TestGoogleService-Info.plist' },
      },
    });
    expect(result.modResults).toMatchSnapshot();
  });
});
