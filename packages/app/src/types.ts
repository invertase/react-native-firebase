import { FirebaseModule } from './internal';
import FirebaseApp from './FirebaseApp';
import { EventEmitter, NativeModule } from 'react-native';

export type DeleteAppType = () => Promise<never | void>;

export interface FirebaseAppImpl {
  /**
   * The name (identifier) for this App. '[DEFAULT]' is the default App.
   */
  readonly name: string;
  readonly options: FirebaseOptionsImpl;
  readonly automaticDataCollectionEnabled: boolean;

  /**
   * The (read-only) configuration options from the app initialization.
   */

  extendApp(extendedProps: any): void;
  delete(): Promise<void>;
  toString(): string;
  SDK_VERSION: string;
  apps: FirebaseAppImpl[];
  app(name?: string): Promise<FirebaseAppImpl>;
  initializeApp(
    options: FirebaseOptionsImpl,
    configOrName: FirebaseConfigImpl | string,
  ): Promise<FirebaseAppImpl>;

  /**
   * Make this app unusable and free up resources.
   */
  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  delete(): Promise<void>;

  utils(): any;
}

export interface FirebaseModuleNamespaceImpl {
  statics: any; //this prop will have to be removed & extended for each namespace as each package has its own statics type
  version: string;
  namespace: NamespaceTypes;
  nativeModuleName: any; //this prop will have to be removed & extended for each namespace as each package has its own statics type
  nativeEvents: any; //this prop will have to be removed & extended for each namespace as each package has its own statics type
  hasMultiAppSupport: boolean;
  hasCustomUrlOrRegionSupport: boolean;
  ModuleClass: FirebaseModule;
  disablePrependCustomUrlOrRegion: boolean;
}

/**
 * A class that all React Native Firebase modules extend from to provide default behaviour.
 */
export interface FirebaseModuleImpl {
  /**
   * The native module instance for this Firebase service.
   */
  readonly native: NativeModule;

  /**
   * Returns the shared event emitter instance used for all JS event routing.
   */
  readonly emitter: EventEmitter;
  /**
   * The current `FirebaseApp` instance for this Firebase service.
   */
  app: FirebaseApp;
}

export interface FirebaseOptionsImpl {
  apiKey: string;
  appId: string;
  databaseURL: string;
  messagingSenderId: string;
  projectId: string;
  storageBucket: string;
}

export interface FirebaseConfigImpl {
  name: string | undefined;
  automaticResourceManagement: boolean | undefined;
  automaticDataCollectionEnabled: boolean | undefined;
}

export type NamespaceTypes =
  | 'admob'
  | 'auth'
  | 'analytics'
  | 'remoteConfig'
  | 'crashlytics'
  | 'database'
  | 'inAppMessaging'
  | 'firestore'
  | 'functions'
  | 'iid'
  | 'indexing'
  | 'storage'
  | 'dynamicLinks'
  | 'messaging'
  | 'naturalLanguage'
  | 'ml'
  | 'notifications'
  | 'perf'
  | 'utils';

export type NativeModuleNames =
  | 'RNFBAppModule'
  | 'RNFBAuthModule'
  | 'RNFBAnalyticsModule'
  | 'RNFBCrashlyticsModule'
  | 'RNFBDynamicLinksModule'
  | 'RNFBFunctionsModule'
  | 'RNFBIidModule'
  | 'RNFBFiamModule'
  | 'RNFBMessagingModule'
  | FirestoreNativeModuleNames
  | AdmobNativeModuleNames
  | DatabaseNativeModuleNames
  | MLNativeModuleNames
  | 'RNFBPerfModule'
  | 'RNFBConfigModule'
  | 'RNFBStorageModule';

export type FirestoreNativeModuleNames =
  | 'RNFBFirestoreModule'
  | 'RNFBFirestoreCollectionModule'
  | 'RNFBFirestoreDocumentModule'
  | 'RNFBFirestoreTransactionModule';

export type AdmobNativeModuleNames =
  | 'RNFBAdMobModule'
  | 'RNFBAdMobInterstitialModule'
  | 'RNFBAdMobRewardedModule';

export type DatabaseNativeModuleNames =
  | 'RNFBDatabaseModule'
  | 'RNFBDatabaseReferenceModule'
  | 'RNFBDatabaseQueryModule'
  | 'RNFBDatabaseOnDisconnectModule'
  | 'RNFBDatabaseTransactionModule';

export type MLNativeModuleNames =
  | 'RNFBMLImageLabelerModule'
  | 'RNFBMLTextRecognizerModule'
  | 'RNFBMLLandmarkRecognizerModule'
  | 'RNFBMLDocumentTextRecognizerModule';
