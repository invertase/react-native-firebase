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
      '[@react-native-firebase/auth] REVERSED_CLIENT_ID not found in GoogleService-Info.plist. This is required for Google Sign-In — if you need it, enable Google Sign-In in the Firebase console and re-download your plist. Phone auth reCAPTCHA will still work via the Encoded App ID scheme.',
    );
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    consoleWarnSpy.mockRestore();
  });

  it('adds url types to the Info.plist (with REVERSED_CLIENT_ID and GOOGLE_APP_ID)', async () => {
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

  it('adds encoded app ID url scheme when only GOOGLE_APP_ID is present (no REVERSED_CLIENT_ID)', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const result = setUrlTypesForCaptcha({
      config: {
        name: 'TestName',
        slug: 'TestSlug',
        modRequest: { projectRoot: path.join(__dirname, 'fixtures') } as any,
        modResults: {},
        modRawConfig: { name: 'TestName', slug: 'TestSlug' },
        ios: { googleServicesFile: 'TestGoogleService-Info.no-reversed-client-id.plist' },
      },
    });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[@react-native-firebase/auth] REVERSED_CLIENT_ID not found in GoogleService-Info.plist. This is required for Google Sign-In — if you need it, enable Google Sign-In in the Firebase console and re-download your plist. Phone auth reCAPTCHA will still work via the Encoded App ID scheme.',
    );
    expect(result.modResults).toMatchSnapshot();
    consoleWarnSpy.mockRestore();
  });
});
