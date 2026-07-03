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

  const turboModuleLookup: Record<string, unknown> = {
    ...ReactNative.NativeModules,
        NativeRNFBTurboAnalytics: {
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
          logTransaction: jest.fn(),
          initiateOnDeviceConversionMeasurementWithEmailAddress: jest.fn(),
          initiateOnDeviceConversionMeasurementWithHashedEmailAddress: jest.fn(),
          initiateOnDeviceConversionMeasurementWithPhoneNumber: jest.fn(),
          initiateOnDeviceConversionMeasurementWithHashedPhoneNumber: jest.fn(),
        },
        NativeRNFBTurboApp: {
          getConstants: () => ({
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
          }),
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
        NativeRNFBTurboUtils: {
          getConstants: () => ({
            isRunningInTestLab: false,
            MAIN_BUNDLE: '/',
            CACHES_DIRECTORY: '/cache',
            DOCUMENT_DIRECTORY: '/documents',
            TEMP_DIRECTORY: '/tmp',
            LIBRARY_DIRECTORY: '/library',
            PICTURES_DIRECTORY: '/pictures',
            MOVIES_DIRECTORY: '/movies',
          }),
          isRunningInTestLab: false,
          MAIN_BUNDLE: '/',
          CACHES_DIRECTORY: '/cache',
          DOCUMENT_DIRECTORY: '/documents',
          TEMP_DIRECTORY: '/tmp',
          LIBRARY_DIRECTORY: '/library',
          PICTURES_DIRECTORY: '/pictures',
          MOVIES_DIRECTORY: '/movies',
          androidGetPlayServicesStatus: jest.fn(() =>
            Promise.resolve({
              isAvailable: true,
              status: 0,
              hasResolution: false,
              isUserResolvableError: false,
            }),
          ),
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
        NativeRNFBTurboAuth: {
          getConstants: () => ({
            APP_LANGUAGE: {
              '[DEFAULT]': 'en-US',
            },
            APP_USER: {
              '[DEFAULT]': null,
            },
          }),
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
          forceRecaptchaFlowForTesting: jest.fn(() => Promise.resolve()),
          setAppVerificationDisabledForTesting: jest.fn(() => Promise.resolve()),
          setAutoRetrievedSmsCodeForPhoneNumber: jest.fn(() => Promise.resolve()),
          removeAuthStateListener: jest.fn(),
          removeIdTokenListener: jest.fn(),
          getSession: jest.fn(() => Promise.resolve('session')),
          unenrollMultiFactor: jest.fn(() => Promise.resolve()),
          finalizeMultiFactorEnrollment: jest.fn(() => Promise.resolve()),
          finalizeTotpEnrollment: jest.fn(() => Promise.resolve()),
          generateTotpSecret: jest.fn(() => Promise.resolve({ secretKey: 'secret' })),
          generateQrCodeUrl: jest.fn(() => 'qr-url'),
          openInOtpApp: jest.fn(),
          resolveMultiFactorSignIn: jest.fn(() => Promise.resolve({ user: null })),
          confirmationResultConfirm: jest.fn(() => Promise.resolve({ user: null })),
          verifyPhoneNumber: jest.fn(),
          useDeviceLanguage: jest.fn(),
        },
        NativeRNFBTurboAppCheck: {
          activate: jest.fn(),
          configureProvider: jest.fn(),
          setTokenAutoRefreshEnabled: jest.fn(),
          isTokenAutoRefreshEnabled: jest.fn(),
          getToken: jest.fn(),
          getLimitedUseToken: jest.fn(),
          addAppCheckListener: jest.fn(),
          removeAppCheckListener: jest.fn(),
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
        NativeRNFBTurboAppDistribution: {
          isTesterSignedIn: jest.fn(),
          signInTester: jest.fn(),
          checkForUpdate: jest.fn(),
          signOutTester: jest.fn(),
        },
        NativeRNFBTurboCrashlytics: {
          getConstants: () => ({
            isCrashlyticsCollectionEnabled: false,
            isErrorGenerationOnJSCrashEnabled: false,
            isCrashlyticsJavascriptExceptionHandlerChainingEnabled: false,
          }),
          isCrashlyticsCollectionEnabled: false,
          isErrorGenerationOnJSCrashEnabled: false,
          isCrashlyticsJavascriptExceptionHandlerChainingEnabled: false,
          checkForUnsentReports: jest.fn(),
          crash: jest.fn(),
          crashWithStackPromise: jest.fn(),
          deleteUnsentReports: jest.fn(),
          didCrashOnPreviousExecution: jest.fn(),
          log: jest.fn(),
          logPromise: jest.fn(),
          setAttribute: jest.fn(),
          setAttributes: jest.fn(),
          setUserId: jest.fn(),
          recordError: jest.fn(),
          recordErrorPromise: jest.fn(),
          sendUnsentReports: jest.fn(),
          setCrashlyticsCollectionEnabled: jest.fn(),
        },
        NativeRNFBTurboFirestore: {
          setLogLevel: jest.fn(),
          loadBundle: jest.fn(() =>
            Promise.resolve({
              taskState: 'Success',
              totalBytes: 0,
              totalDocuments: 0,
              bytesLoaded: 0,
              documentsLoaded: 0,
            }),
          ),
          clearPersistence: jest.fn(),
          waitForPendingWrites: jest.fn(),
          terminate: jest.fn(),
          useEmulator: jest.fn(),
          disableNetwork: jest.fn(),
          enableNetwork: jest.fn(),
          settings: jest.fn(),
          addSnapshotsInSync: jest.fn(),
          removeSnapshotsInSync: jest.fn(),
          persistenceCacheIndexManager: jest.fn(),
        },
        NativeRNFBTurboFirestoreCollection: {
          collectionOffSnapshot: jest.fn(),
          namedQueryOnSnapshot: jest.fn(),
          collectionOnSnapshot: jest.fn(),
          namedQueryGet: jest.fn(() =>
            Promise.resolve({
              source: 'cache',
              changes: [],
              documents: [],
              metadata: {},
            }),
          ),
          collectionGet: jest.fn(() =>
            Promise.resolve({
              source: 'cache',
              changes: [],
              documents: [],
              metadata: {},
            }),
          ),
          collectionCount: jest.fn(() => Promise.resolve({ count: 0 })),
          aggregateQuery: jest.fn(() => Promise.resolve({})),
          pipelineExecute: jest.fn(() =>
            Promise.resolve({
              results: [],
              executionTime: Date.now(),
            }),
          ),
        },
        NativeRNFBTurboFirestoreDocument: {
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
          documentBatch: jest.fn(),
        },
        NativeRNFBTurboFirestoreTransaction: {
          transactionApplyBuffer: jest.fn(),
          transactionBegin: jest.fn(),
          transactionDispose: jest.fn(),
          transactionGetDocument: jest.fn(() =>
            Promise.resolve({
              data: {},
              metadata: {},
              path: 'firestore/document',
              exists: true,
            }),
          ),
        },
        NativeRNFBTurboDatabase: {
          goOnline: jest.fn(() => Promise.resolve()),
          goOffline: jest.fn(() => Promise.resolve()),
          setPersistenceEnabled: jest.fn(),
          setLoggingEnabled: jest.fn(),
          setPersistenceCacheSizeBytes: jest.fn(),
          useEmulator: jest.fn(),
        },
        NativeRNFBTurboDatabaseReference: {
          set: jest.fn(() => Promise.resolve()),
          update: jest.fn(() => Promise.resolve()),
          setWithPriority: jest.fn(() => Promise.resolve()),
          remove: jest.fn(() => Promise.resolve()),
          setPriority: jest.fn(() => Promise.resolve()),
        },
        NativeRNFBTurboDatabaseQuery: {
          once: jest.fn(() =>
            Promise.resolve({
              value: null,
              key: null,
              exists: false,
              childKeys: [],
            }),
          ),
          on: jest.fn(),
          off: jest.fn(),
          keepSynced: jest.fn(() => Promise.resolve()),
        },
        NativeRNFBTurboDatabaseOnDisconnect: {
          onDisconnectCancel: jest.fn(() => Promise.resolve()),
          onDisconnectRemove: jest.fn(() => Promise.resolve()),
          onDisconnectSet: jest.fn(() => Promise.resolve()),
          onDisconnectSetWithPriority: jest.fn(() => Promise.resolve()),
          onDisconnectUpdate: jest.fn(() => Promise.resolve()),
        },
        NativeRNFBTurboDatabaseTransaction: {
          transactionStart: jest.fn(),
          transactionTryCommit: jest.fn(),
        },
        NativeRNFBTurboFiam: {
          getConstants: () => ({
            isMessagesDisplaySuppressed: false,
            isAutomaticDataCollectionEnabled: true,
          }),
          isMessagesDisplaySuppressed: false,
          isAutomaticDataCollectionEnabled: true,
          setMessagesDisplaySuppressed: jest.fn(),
          setAutomaticDataCollectionEnabled: jest.fn(),
          triggerEvent: jest.fn(),
        },
        NativeRNFBTurboInstallations: {
          getId: jest.fn(),
          getToken: jest.fn(),
          deleteInstallations: jest.fn(),
        },
        NativeRNFBTurboMessaging: {
          getConstants: () => ({
            isAutoInitEnabled: true,
            isDeliveryMetricsExportToBigQueryEnabled: false,
            isRegisteredForRemoteNotifications: false,
            isNotificationDelegationEnabled: false,
          }),
          isAutoInitEnabled: true,
          isDeliveryMetricsExportToBigQueryEnabled: false,
          isRegisteredForRemoteNotifications: false,
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
          isNotificationDelegationEnabled: jest.fn(() => Promise.resolve(false)),
          setNotificationDelegationEnabled: jest.fn(),
        },
        NativeRNFBTurboPerf: {
          getConstants: () => ({
            isPerformanceCollectionEnabled: true,
            isInstrumentationEnabled: true,
          }),
          isPerformanceCollectionEnabled: true,
          isInstrumentationEnabled: true,
          instrumentationEnabled: jest.fn(() => Promise.resolve()),
          setPerformanceCollectionEnabled: jest.fn(() => Promise.resolve()),
          startScreenTrace: jest.fn(),
          stopScreenTrace: jest.fn(),
          startTrace: jest.fn(),
          stopTrace: jest.fn(),
          startHttpMetric: jest.fn(),
          stopHttpMetric: jest.fn(),
        },
        NativeRNFBTurboPnv: {
          enableTestSession: jest.fn(() => Promise.resolve()),
          getVerificationSupportInfo: jest.fn(() => Promise.resolve([])),
          getVerificationSupportInfoForSimSlot: jest.fn(() => Promise.resolve([])),
          getVerifiedPhoneNumber: jest.fn(() =>
            Promise.resolve({
              phoneNumber: '+15555550100',
              token: 'jwt',
              expirationTimestamp: 0,
              issuedAtTimestamp: 0,
              nonce: null,
              claims: null,
            }),
          ),
          getDigitalCredentialPayload: jest.fn(() => Promise.resolve('payload')),
          exchangeCredentialResponseForPhoneNumber: jest.fn(() =>
            Promise.resolve({
              phoneNumber: '+15555550100',
              token: 'jwt',
              expirationTimestamp: 0,
              issuedAtTimestamp: 0,
              nonce: null,
              claims: null,
            }),
          ),
        },
        NativeRNFBTurboML: {},
        NativeRNFBTurboConfig: {
          getConstants: () => ({
            lastFetchTime: Date.now(),
            lastFetchStatus: 'success',
            fetchTimeout: 60,
            minimumFetchInterval: 43200,
            values: {},
          }),
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
          setCustomSignals: jest.fn(() =>
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
        NativeRNFBTurboStorage: {
          getConstants: () => ({
            maxUploadRetryTime: 0,
            maxDownloadRetryTime: 0,
            maxOperationRetryTime: 0,
          }),
          maxUploadRetryTime: 0,
          maxDownloadRetryTime: 0,
          maxOperationRetryTime: 0,
          setMaxOperationRetryTime: jest.fn(),
          setMaxUploadRetryTime: jest.fn(),
          setMaxDownloadRetryTime: jest.fn(),
          useEmulator: jest.fn(),
          deleteObject: jest.fn(() => Promise.resolve()),
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
        RNFBStorageModule: {
          maxUploadRetryTime: 0,
          maxDownloadRetryTime: 0,
          maxOperationRetryTime: 0,
          setMaxOperationRetryTime: jest.fn(),
          setMaxUploadRetryTime: jest.fn(),
          setMaxDownloadRetryTime: jest.fn(),
          useEmulator: jest.fn(),
          deleteObject: jest.fn(() => Promise.resolve()),
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
  };

  return Object.setPrototypeOf(
    {
      Platform: {
        OS: 'android',
        select: () => {},
      },
      TurboModuleRegistry: {
        get: jest.fn((moduleName: string) => turboModuleLookup[moduleName]),
        getEnforcing: jest.fn((moduleName: string) => {
          const mod = turboModuleLookup[moduleName];
          if (!mod) {
            throw new Error('TurboModuleRegistry.getEnforcing: module not found');
          }
          return mod;
        }),
      },
      AppRegistry: {
        registerHeadlessTask: jest.fn(),
      },
      NativeModules: turboModuleLookup,
    },
    ReactNative,
  );
});
