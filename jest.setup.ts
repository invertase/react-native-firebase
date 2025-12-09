import * as ReactNative from 'react-native';
import { jest } from '@jest/globals';

// Avoid log pollution with emulator URL remap messages during testing
// eslint-disable-next-line no-console
const logOrig = console.log;
const logWithRemapMessageRemoved = (message?: any, ...optionalParams: any[]): void => {
  if (
    // Make sure it is a string before attempting to filter it out
    (typeof message !== 'string' && !(message instanceof String)) ||
    !message.includes('android_bypass_emulator_url_remap')
  ) {
    logOrig(message, ...optionalParams);
  }
};
// eslint-disable-next-line no-console
console.log = logWithRemapMessageRemoved;

jest.doMock('react-native', () => {
  // @ts-ignore - react-native empty bridge config so native modules at least default init
  global.__fbBatchedBridgeConfig = {};

  // @ts-ignore - react-native new architecture interop flag to true
  global.RN$TurboInterop = true;

  // make sure PlatformConstants is visible otherwise turbo modules default init fails
  ReactNative.NativeModules['PlatformConstants'] = {};

  return Object.setPrototypeOf(
    {
      Platform: {
        OS: 'android',
        select: () => {},
      },
      AppRegistry: {
        registerHeadlessTask: jest.fn(),
      },
      NativeModules: {
        ...ReactNative.NativeModules,
        RNFBAnalyticsModule: {
          logEvent: jest.fn(),
          setAnalyticsCollectionEnabled: jest.fn(),
          setSessionTimeoutDuration: jest.fn(),
          getAppInstanceId: jest.fn(),
          getSessionId: jest.fn(),
          setUserId: jest.fn(),
          setUserProperty: jest.fn(),
          setUserProperties: jest.fn(),
          resetAnalyticsData: jest.fn(),
          setConsent: jest.fn(),
          setDefaultEventParameters: jest.fn(),
          initiateOnDeviceConversionMeasurementWithEmailAddress: jest.fn(),
          initiateOnDeviceConversionMeasurementWithHashedEmailAddress: jest.fn(),
          initiateOnDeviceConversionMeasurementWithPhoneNumber: jest.fn(),
          initiateOnDeviceConversionMeasurementWithHashedPhoneNumber: jest.fn(),
        },
        RNFBAppModule: {
          NATIVE_FIREBASE_APPS: [
            {
              appConfig: {
                name: '[DEFAULT]',
              },
              options: {},
            },

            {
              appConfig: {
                name: 'secondaryFromNative',
              },
              options: {},
            },
          ],
          FIREBASE_RAW_JSON: '{}',
          addListener: jest.fn(),
          eventsAddListener: jest.fn(),
          eventsNotifyReady: jest.fn(),
          removeListeners: jest.fn(),
        },
        RNFBAuthModule: {
          APP_LANGUAGE: {
            '[DEFAULT]': 'en-US',
          },
          APP_USER: {
            '[DEFAULT]': 'jestUser',
          },
          addAuthStateListener: jest.fn(),
          addIdTokenListener: jest.fn(),
          setTenantId: jest.fn(),
          useEmulator: jest.fn(),
          configureAuthDomain: jest.fn(),
        },
        RNFBCrashlyticsModule: {},
        RNFBDatabaseModule: {
          on: jest.fn(),
          useEmulator: jest.fn(),
        },
        RNFBFirestoreModule: {
          settings: jest.fn(),
          documentSet: jest.fn(),
        },
        RNFBMessagingModule: {
          onMessage: jest.fn(),
        },
        RNFBPerfModule: {},
        RNFBConfigModule: {
          onConfigUpdated: jest.fn(),
        },
        RNFBStorageModule: {
          useEmulator: jest.fn(),
        },
      },
    },
    ReactNative,
  );
});
