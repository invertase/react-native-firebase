export type FirebaseNativeModuleName =
  | 'RNFBAdMob'
  | 'RNFBAnalytics'
  | 'RNFBAuth'
  | 'RNFBRemoteConfig'
  | 'RNFBCrashlytics'
  | 'RNFBDatabase'
  | 'RNFBFirestore'
  | 'RNFBFunctions'
  | 'RNFBFiam'
  | 'RNFBInstanceId'
  | 'RNFBInvites'
  | 'RNFBLinks'
  | 'RNFBMessaging'
  | 'RNFBMLKit'
  | 'RNFBNotifications'
  | 'RNFBPerformance'
  | 'RNFBStorage'
  | 'RNFBUtils';

export type FirebaseNamespace =
  | 'admob'
  | 'analytics'
  | 'auth'
  | 'config'
  | 'crashlytics'
  | 'database'
  | 'firestore'
  | 'functions'
  | 'fiam'
  | 'iid'
  | 'invites'
  | 'links'
  | 'messaging'
  | 'ml'
  | 'notifications'
  | 'perf'
  | 'storage'
  | 'utils';

export type FirebaseModuleConfig = {
  events?: string[],
  namespace: FirebaseNamespace,
  moduleName: FirebaseNativeModuleName,
  hasMultiAppSupport: boolean,
  hasRegionsSupport?: boolean,
  hasCustomUrlSupport?: boolean,
};

export interface FirebaseModule {
  constructor(app: FirebaseApp, config: FirebaseModuleConfig): this;
}
