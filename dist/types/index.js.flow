/* @flow */
import type AdMob from '../modules/admob';
import { typeof statics as AdMobStatics } from '../modules/admob';
import type Analytics from '../modules/analytics';
import { typeof statics as AnalyticsStatics } from '../modules/analytics';
import type Auth from '../modules/auth';
import { typeof statics as AuthStatics } from '../modules/auth';
import type Config from '../modules/config';
import { typeof statics as ConfigStatics } from '../modules/config';
import type Crashlytics from '../modules/crashlytics';
import { typeof statics as CrashlyticsStatics } from '../modules/crashlytics';
import type Database from '../modules/database';
import { typeof statics as DatabaseStatics } from '../modules/database';
import type Firestore from '../modules/firestore';
import { typeof statics as FirestoreStatics } from '../modules/firestore';
import type Functions from '../modules/functions';
import { typeof statics as FunctionsStatics } from '../modules/functions';
import type InstanceId from '../modules/iid';
import { typeof statics as InstanceIdStatics } from '../modules/iid';
import type Links from '../modules/links';
import { typeof statics as LinksStatics } from '../modules/links';
import type Messaging from '../modules/messaging';
import { typeof statics as MessagingStatics } from '../modules/messaging';
import type Notifications from '../modules/notifications';
import { typeof statics as NotificationsStatics } from '../modules/notifications';
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

/* Crashlytics types */
export type CrashlyticsModule = {
  (): Crashlytics,
  nativeModuleExists: boolean,
} & CrashlyticsStatics;

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

/* Firestore types */

export type FirestoreModule = {
  (): Firestore,
  nativeModuleExists: boolean,
} & FirestoreStatics;

/* Functions types */

export type FunctionsModule = {
  (): Functions,
  nativeModuleExists: boolean,
} & FunctionsStatics;

/* InstanceId types */

export type InstanceIdModule = {
  (): InstanceId,
  nativeModuleExists: boolean,
} & InstanceIdStatics;

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

/* Notifications types */

export type NotificationsModule = {
  (): Notifications,
  nativeModuleExists: boolean,
} & NotificationsStatics;

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
