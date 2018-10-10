/* @flow */
import type ModuleBase from '../utils/ModuleBase';
import type Utils from '../modules/utils';
import { typeof statics as UtilsStatics } from '../modules/utils';

/* Core types */
export type FirebaseError = {
  message: string,
  name: string,
  code: string,
  stack: string,
  path: string,
  details: string,
  modifiers: string,
};

export type FirebaseModule = $Subtype<ModuleBase>;

export type FirebaseModuleConfig = {
  events?: string[],
  moduleName: FirebaseModuleName,
  hasMultiAppSupport: boolean,
  hasCustomUrlSupport?: boolean,
  hasRegionsSupport?: boolean,
  namespace: FirebaseNamespace,
};

export type FirebaseModuleName =
  | 'RNFirebaseAdMob'
  | 'RNFirebaseAnalytics'
  | 'RNFirebaseAuth'
  | 'RNFirebaseRemoteConfig'
  | 'RNFirebaseCrashlytics'
  | 'RNFirebaseDatabase'
  | 'RNFirebaseFirestore'
  | 'RNFirebaseFunctions'
  | 'RNFirebaseInstanceId'
  | 'RNFirebaseInvites'
  | 'RNFirebaseLinks'
  | 'RNFirebaseMessaging'
  | 'RNFirebaseNotifications'
  | 'RNFirebasePerformance'
  | 'RNFirebaseStorage'
  | 'RNFirebaseUtils';

export type FirebaseNamespace =
  | 'admob'
  | 'analytics'
  | 'auth'
  | 'config'
  | 'crashlytics'
  | 'database'
  | 'firestore'
  | 'functions'
  | 'iid'
  | 'invites'
  | 'links'
  | 'messaging'
  | 'notifications'
  | 'perf'
  | 'storage'
  | 'utils';

export type FirebaseOptions = {
  apiKey: string,
  appId: string,
  databaseURL: string,
  messagingSenderId: string,
  projectId: string,
  storageBucket: string,
  persistence?: boolean,
};

export type FirebaseModuleAndStatics<M: FirebaseModule, S: FirebaseStatics> = {
  (): M,
  nativeModuleExists: boolean,
} & S;

export type FirebaseStatics = $Subtype<Object>;

/* Utils types */
export type UtilsModule = {
  (): Utils,
  nativeModuleExists: boolean,
} & UtilsStatics;
