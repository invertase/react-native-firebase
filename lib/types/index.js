/* @flow */
import type AdMob from '../modules/admob';
import { typeof statics as AdMobStatics } from '../modules/admob';
import type Analytics from '../modules/analytics';
import { typeof statics as AnalyticsStatics } from '../modules/analytics';
import type Auth from '../modules/auth';
import { typeof statics as AuthStatics } from '../modules/auth';
import type Config from '../modules/config';
import { typeof statics as ConfigStatics } from '../modules/config';
import type Crash from '../modules/crash';
import { typeof statics as CrashStatics } from '../modules/crash';
import type Crashlytics from '../modules/fabric/crashlytics';
import { typeof statics as CrashlyticsStatics } from '../modules/fabric/crashlytics';
import type Database from '../modules/database';
import { typeof statics as DatabaseStatics } from '../modules/database';
import type Firestore from '../modules/firestore';
import { typeof statics as FirestoreStatics } from '../modules/firestore';
import type Links from '../modules/links';
import { typeof statics as LinksStatics } from '../modules/links';
import type Messaging from '../modules/messaging';
import { typeof statics as MessagingStatics } from '../modules/messaging';
import type ModuleBase from '../utils/ModuleBase';
import type Performance from '../modules/perf';
import { typeof statics as PerformanceStatics } from '../modules/perf';
import type Storage from '../modules/storage';
import { typeof statics as StorageStatics } from '../modules/storage';
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
  multiApp: boolean,
  namespace: FirebaseNamespace,
};

export type FirebaseModuleName =
  | 'RNFirebaseAdMob'
  | 'RNFirebaseAnalytics'
  | 'RNFirebaseAuth'
  | 'RNFirebaseRemoteConfig'
  | 'RNFirebaseCrash'
  | 'RNFirebaseCrashlytics'
  | 'RNFirebaseDatabase'
  | 'RNFirebaseFirestore'
  | 'RNFirebaseLinks'
  | 'RNFirebaseMessaging'
  | 'RNFirebasePerformance'
  | 'RNFirebaseStorage'
  | 'RNFirebaseUtils';

export type FirebaseNamespace =
  | 'admob'
  | 'analytics'
  | 'auth'
  | 'config'
  | 'crash'
  | 'crashlytics'
  | 'database'
  | 'firestore'
  | 'links'
  | 'messaging'
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
};

export type FirebaseModuleAndStatics<M: FirebaseModule, S: FirebaseStatics> = {
  (): M,
  nativeModuleExists: boolean,
} & S;

export type FirebaseStatics = $Subtype<Object>;

/* Admob types */

export type AdMobModule = {
  (): AdMob,
  nativeModuleExists: boolean,
} & AdMobStatics;

/* Analytics types */

export type AnalyticsModule = {
  (): Analytics,
  nativeModuleExists: boolean,
} & AnalyticsStatics;

/* Remote Config types */

export type ConfigModule = {
  (): Config,
  nativeModuleExists: boolean,
} & ConfigStatics;

/* Auth types */

export type AuthModule = {
  (): Auth,
  nativeModuleExists: boolean,
} & AuthStatics;

/* Crash types */

export type CrashModule = {
  (): Crash,
  nativeModuleExists: boolean,
} & CrashStatics;

/* Database types */

export type DatabaseModule = {
  (): Database,
  nativeModuleExists: boolean,
} & DatabaseStatics;

export type DatabaseModifier = {
  id: string,
  type: 'orderBy' | 'limit' | 'filter',
  name?: string,
  key?: string,
  limit?: number,
  value?: any,
  valueType?: string,
};

/* Fabric types */
export type CrashlyticsModule = {
  (): Crashlytics,
  nativeModuleExists: boolean,
} & CrashlyticsStatics;

export type FabricModule = {
  crashlytics: CrashlyticsModule,
};

/* Firestore types */

export type FirestoreModule = {
  (): Firestore,
  nativeModuleExists: boolean,
} & FirestoreStatics;

/* Links types */

export type LinksModule = {
  (): Links,
  nativeModuleExists: boolean,
} & LinksStatics;

/* Messaging types */

export type MessagingModule = {
  (): Messaging,
  nativeModuleExists: boolean,
} & MessagingStatics;

/* Performance types */

export type PerformanceModule = {
  (): Performance,
  nativeModuleExists: boolean,
} & PerformanceStatics;

/* Storage types */

export type StorageModule = {
  (): Storage,
  nativeModuleExists: boolean,
} & StorageStatics;

/* Utils types */

export type UtilsModule = {
  (): Utils,
  nativeModuleExists: boolean,
} & UtilsStatics;
