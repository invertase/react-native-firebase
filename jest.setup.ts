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
            '[DEFAULT]': null,
          },
          addAuthStateListener: jest.fn(),
          addIdTokenListener: jest.fn(),
          setLanguageCode: jest.fn(() => Promise.resolve()),
          setTenantId: jest.fn(() => Promise.resolve()),
          signOut: jest.fn(() => Promise.resolve()),
          signInAnonymously: jest.fn(() => Promise.resolve({ user: null })),
          createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: null })),
          signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: null })),
          signInWithCustomToken: jest.fn(() => Promise.resolve({ user: null })),
          signInWithCredential: jest.fn(() => Promise.resolve({ user: null })),
          signInWithEmailLink: jest.fn(() => Promise.resolve({ user: null })),
          signInWithProvider: jest.fn(() => Promise.resolve({ user: null })),
          signInWithPhoneNumber: jest.fn(() => Promise.resolve({ verificationId: 'test-id' })),
          verifyPhoneNumberWithMultiFactorInfo: jest.fn(() => Promise.resolve()),
          verifyPhoneNumberForMultiFactor: jest.fn(() => Promise.resolve()),
          resolveTotpSignIn: jest.fn(() => Promise.resolve({})),
          revokeToken: jest.fn(() => Promise.resolve()),
          sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
          sendSignInLinkToEmail: jest.fn(() => Promise.resolve()),
          isSignInWithEmailLink: jest.fn(() => false),
          applyActionCode: jest.fn(() => Promise.resolve(null)),
          checkActionCode: jest.fn(() => Promise.resolve({})),
          confirmPasswordReset: jest.fn(() => Promise.resolve()),
          fetchSignInMethodsForEmail: jest.fn(() => Promise.resolve([])),
          verifyPasswordResetCode: jest.fn(() => Promise.resolve('')),
          useUserAccessGroup: jest.fn(() => Promise.resolve()),
          useEmulator: jest.fn(),
          getCustomAuthDomain: jest.fn(() => Promise.resolve(null)),
          configureAuthDomain: jest.fn(() => Promise.resolve()),
          // User methods
          delete: jest.fn(() => Promise.resolve()),
          getIdToken: jest.fn(() => Promise.resolve('mock-token')),
          getIdTokenResult: jest.fn(() => Promise.resolve({ token: 'mock-token' })),
          linkWithCredential: jest.fn(() => Promise.resolve({ user: null })),
          linkWithProvider: jest.fn(() => Promise.resolve({ user: null })),
          reauthenticateWithCredential: jest.fn(() => Promise.resolve({ user: null })),
          reauthenticateWithProvider: jest.fn(() => Promise.resolve({ user: null })),
          reload: jest.fn(() => Promise.resolve(null)),
          sendEmailVerification: jest.fn(() => Promise.resolve(null)),
          unlink: jest.fn(() => Promise.resolve(null)),
          updateEmail: jest.fn(() => Promise.resolve(null)),
          updatePassword: jest.fn(() => Promise.resolve(null)),
          updatePhoneNumber: jest.fn(() => Promise.resolve(null)),
          updateProfile: jest.fn(() => Promise.resolve(null)),
          verifyBeforeUpdateEmail: jest.fn(() => Promise.resolve(null)),
        },
        RNFBAppCheckModule: {
          initializeAppCheck: jest.fn(),
          setTokenAutoRefreshEnabled: jest.fn(),
          configureProvider: jest.fn(),
          getToken: jest.fn(),
          getLimitedUseToken: jest.fn(),
          addAppCheckListener: jest.fn(),
          removeAppCheckListener: jest.fn(),
        },
        RNFBAppDistributionModule: {
          isTesterSignedIn: jest.fn(),
          signInTester: jest.fn(),
          checkForUpdate: jest.fn(),
          signOutTester: jest.fn(),
        },
        RNFBCrashlyticsModule: {
          isCrashlyticsCollectionEnabled: false,
          checkForUnsentReports: jest.fn(),
          crash: jest.fn(),
          deleteUnsentReports: jest.fn(),
          didCrashOnPreviousExecution: jest.fn(),
          log: jest.fn(),
          setAttribute: jest.fn(),
          setAttributes: jest.fn(),
          setUserId: jest.fn(),
          recordError: jest.fn(),
          sendUnsentReports: jest.fn(),
          setCrashlyticsCollectionEnabled: jest.fn(),
        },
        RNFBDatabaseModule: {
          constants: {
            isDatabaseCollectionEnabled: true,
            url: 'https://test.firebaseio.com',
            ref: 'ref()',
          },
          on: jest.fn(),
          off: jest.fn(),
          once: jest.fn(
            (_appName: any, _customUrl: any, path: any, _modifiers: any, eventType: any) => {
              // Database native methods receive (appName, customUrlOrRegion, ...actualArgs)
              let key = 'test';
              if (path && typeof path === 'string') {
                const parts = path.split('/').filter(p => p);
                key = parts[parts.length - 1] || 'test';
              }

              const snapshotData = {
                key,
                value: null,
                exists: false,
                childKeys: [],
                priority: null,
              };

              if (eventType === 'value') {
                return Promise.resolve(snapshotData);
              }

              return Promise.resolve({
                snapshot: snapshotData,
                previousChildName: null,
              });
            },
          ),
          useEmulator: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          set: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          update: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          setWithPriority: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          remove: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          setPriority: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          keepSynced: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          transactionStart: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          transactionTryCommit: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          goOnline: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          goOffline: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          setPersistenceEnabled: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          setLoggingEnabled: jest.fn((_appName: any, _customUrl: any) => Promise.resolve()),
          setPersistenceCacheSizeBytes: jest.fn((_appName: any, _customUrl: any) =>
            Promise.resolve(),
          ),
          getServerTime: jest.fn((_appName: any, _customUrl: any) => Promise.resolve(Date.now())),
        },
        RNFBFirestoreModule: {
          loadBundle: jest.fn(),
          clearPersistence: jest.fn(),
          waitForPendingWrites: jest.fn(),
          terminate: jest.fn(),
          useEmulator: jest.fn(),
          disableNetwork: jest.fn(),
          enableNetwork: jest.fn(),
          settings: jest.fn(),
          addSnapshotsInSync: jest.fn(),
          removeSnapshotsInSync: jest.fn(),
          collectionOffSnapshot: jest.fn(),
          namedQueryOnSnapshot: jest.fn(),
          collectionOnSnapshot: jest.fn(),
          collectionGet: jest.fn(() =>
            Promise.resolve({
              source: 'cache',
              changes: [],
              documents: [],
              metadata: {},
            }),
          ),
          collectionCount: jest.fn(() => Promise.resolve({ count: 0 })),
          documentDelete: jest.fn(() => Promise.resolve()),
          documentOffSnapshot: jest.fn(),
          documentOnSnapshot: jest.fn(),
          documentGet: jest.fn(() =>
            Promise.resolve({
              data: {},
              metadata: {},
              path: 'firestore/document',
              exists: true,
            }),
          ),
          documentSet: jest.fn(() => Promise.resolve()),
          documentUpdate: jest.fn(() => Promise.resolve()),
          persistenceCacheIndexManager: jest.fn(),
          documentBatch: jest.fn(),
          transactionApplyBuffer: jest.fn(),
          transactionBegin: jest.fn(),
          transactionDispose: jest.fn(),
        },
        RNFBInAppMessagingModule: {
          isMessagesDisplaySuppressed: false,
          isAutomaticDataCollectionEnabled: true,
          setMessagesDisplaySuppressed: jest.fn(),
          setAutomaticDataCollectionEnabled: jest.fn(),
          triggerEvent: jest.fn(),
        },
        RNFBInstallationsModule: {
          getId: jest.fn(),
          getToken: jest.fn(),
          delete: jest.fn(),
        },
        RNFBMessagingModule: {
          isAutoInitEnabled: true,
          isDeliveryMetricsExportToBigQueryEnabled: false,
          isRegisteredForRemoteNotifications: false,
          isNotificationDelegationEnabled: false,
          onMessage: jest.fn(),
          completeNotificationProcessing: jest.fn(),
          setAutoInitEnabled: jest.fn(),
          getInitialNotification: jest.fn(() => Promise.resolve(null)),
          getDidOpenSettingsForNotification: jest.fn(() => Promise.resolve(false)),
          getIsHeadless: jest.fn(() => Promise.resolve(false)),
          getToken: jest.fn(),
          deleteToken: jest.fn(),
          requestPermission: jest.fn(() => Promise.resolve(1)),
          registerForRemoteNotifications: jest.fn(),
          unregisterForRemoteNotifications: jest.fn(),
          getAPNSToken: jest.fn(),
          setAPNSToken: jest.fn(),
          hasPermission: jest.fn(() => Promise.resolve(1)),
          signalBackgroundMessageHandlerSet: jest.fn(),
          sendMessage: jest.fn(),
          subscribeToTopic: jest.fn(),
          unsubscribeFromTopic: jest.fn(),
          setDeliveryMetricsExportToBigQuery: jest.fn(),
          setNotificationDelegationEnabled: jest.fn(),
        },
        RNFBPerfModule: {
          isPerformanceCollectionEnabled: true,
          isInstrumentationEnabled: true,
          instrumentationEnabled: jest.fn(() => Promise.resolve()),
          setPerformanceCollectionEnabled: jest.fn(() => Promise.resolve()),
          startScreenTrace: jest.fn(() => Promise.resolve()),
          stopScreenTrace: jest.fn(() => Promise.resolve()),
          startTrace: jest.fn(() => Promise.resolve()),
          stopTrace: jest.fn(() => Promise.resolve()),
          startHttpMetric: jest.fn(() => Promise.resolve()),
          stopHttpMetric: jest.fn(() => Promise.resolve()),
        },
        RNFBConfigModule: {
          onConfigUpdated: jest.fn(),
          reset: jest.fn(() =>
            Promise.resolve({
              result: true,
              constants: {
                lastFetchTime: Date.now(),
                lastFetchStatus: 'success',
                fetchTimeout: 60,
                minimumFetchInterval: 43200,
                values: {},
              },
            }),
          ),
          setConfigSettings: jest.fn(() =>
            Promise.resolve({
              result: true,
              constants: {
                lastFetchTime: Date.now(),
                lastFetchStatus: 'success',
                fetchTimeout: 60,
                minimumFetchInterval: 43200,
                values: {},
              },
            }),
          ),
          activate: jest.fn(() =>
            Promise.resolve({
              result: true,
              constants: {
                lastFetchTime: Date.now(),
                lastFetchStatus: 'success',
                fetchTimeout: 60,
                minimumFetchInterval: 43200,
                values: {},
              },
            }),
          ),
          fetch: jest.fn(() =>
            Promise.resolve({
              result: true,
              constants: {
                lastFetchTime: Date.now(),
                lastFetchStatus: 'success',
                fetchTimeout: 60,
                minimumFetchInterval: 43200,
                values: {},
              },
            }),
          ),
          fetchAndActivate: jest.fn(() =>
            Promise.resolve({
              result: true,
              constants: {
                lastFetchTime: Date.now(),
                lastFetchStatus: 'success',
                fetchTimeout: 60,
                minimumFetchInterval: 43200,
                values: {},
              },
            }),
          ),
          ensureInitialized: jest.fn(() =>
            Promise.resolve({
              result: true,
              constants: {
                lastFetchTime: Date.now(),
                lastFetchStatus: 'success',
                fetchTimeout: 60,
                minimumFetchInterval: 43200,
                values: {},
              },
            }),
          ),
          setDefaults: jest.fn(() =>
            Promise.resolve({
              result: true,
              constants: {
                lastFetchTime: Date.now(),
                lastFetchStatus: 'success',
                fetchTimeout: 60,
                minimumFetchInterval: 43200,
                values: {},
              },
            }),
          ),
          setDefaultsFromResource: jest.fn(() =>
            Promise.resolve({
              result: true,
              constants: {
                lastFetchTime: Date.now(),
                lastFetchStatus: 'success',
                fetchTimeout: 60,
                minimumFetchInterval: 43200,
                values: {},
              },
            }),
          ),
          removeConfigUpdateRegistration: jest.fn(),
        },
        RNFBStorageModule: {
          maxUploadRetryTime: 0,
          maxDownloadRetryTime: 0,
          maxOperationRetryTime: 0,
          setMaxOperationRetryTime: jest.fn(),
          setMaxUploadRetryTime: jest.fn(),
          setMaxDownloadRetryTime: jest.fn(),
          useEmulator: jest.fn(),
          delete: jest.fn(() => Promise.resolve()),
          getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/file')),
          getMetadata: jest.fn(() => Promise.resolve({})),
          putString: jest.fn(() => Promise.resolve()),
          updateMetadata: jest.fn(() => Promise.resolve({})),
          writeToFile: jest.fn(() => Promise.resolve()),
          putFile: jest.fn(() => Promise.resolve()),
          setTaskStatus: jest.fn(() => Promise.resolve()),
          list: jest.fn(() => Promise.resolve({ items: [], prefixes: [], pageToken: null })),
          listAll: jest.fn(() => Promise.resolve({ items: [], prefixes: [], pageToken: null })),
        },
      },
    },
    ReactNative,
  );
});
