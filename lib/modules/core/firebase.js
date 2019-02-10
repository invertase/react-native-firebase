/**
 * @flow
 */
import { NativeModules } from 'react-native';

import APPS from '../../utils/apps';
import INTERNALS from '../../utils/internals';
import App from './app';
import VERSION from '../../version';

// module imports
import {
  statics as AdMobStatics,
  MODULE_NAME as AdmobModuleName,
} from '../admob';
import { statics as AuthStatics, MODULE_NAME as AuthModuleName } from '../auth';
import {
  statics as AnalyticsStatics,
  MODULE_NAME as AnalyticsModuleName,
} from '../analytics';
import {
  statics as ConfigStatics,
  MODULE_NAME as ConfigModuleName,
} from '../config';
import {
  statics as CrashStatics,
  MODULE_NAME as CrashModuleName,
} from '../crash';
import {
  statics as CrashlyticsStatics,
  MODULE_NAME as CrashlyticsModuleName,
} from '../crashlytics';
import {
  statics as DatabaseStatics,
  MODULE_NAME as DatabaseModuleName,
} from '../database';
import {
  statics as FirestoreStatics,
  MODULE_NAME as FirestoreModuleName,
} from '../firestore';
import {
  statics as FunctionsStatics,
  MODULE_NAME as FunctionsModuleName,
} from '../functions';
import {
  statics as InstanceIdStatics,
  MODULE_NAME as InstanceIdModuleName,
} from '../iid';
import {
  statics as InvitesStatics,
  MODULE_NAME as InvitesModuleName,
} from '../invites';
import {
  statics as LinksStatics,
  MODULE_NAME as LinksModuleName,
} from '../links';
import {
  statics as MessagingStatics,
  MODULE_NAME as MessagingModuleName,
} from '../messaging';
import {
  statics as NotificationsStatics,
  MODULE_NAME as NotificationsModuleName,
} from '../notifications';
import {
  statics as PerformanceStatics,
  MODULE_NAME as PerfModuleName,
} from '../perf';
import {
  statics as StorageStatics,
  MODULE_NAME as StorageModuleName,
} from '../storage';
import {
  statics as UtilsStatics,
  MODULE_NAME as UtilsModuleName,
} from '../utils';

import type {
  AdMobModule,
  AnalyticsModule,
  AuthModule,
  ConfigModule,
  CrashModule,
  CrashlyticsModule,
  DatabaseModule,
  FirebaseOptions,
  FirestoreModule,
  FunctionsModule,
  InstanceIdModule,
  InvitesModule,
  LinksModule,
  MessagingModule,
  NotificationsModule,
  PerformanceModule,
  StorageModule,
  UtilsModule,
} from '../../types';

const FirebaseCoreModule = NativeModules.RNFirebase;

class Firebase {
  admob: AdMobModule;
  analytics: AnalyticsModule;
  auth: AuthModule;
  config: ConfigModule;
  crash: CrashModule;
  crashlytics: CrashlyticsModule;
  database: DatabaseModule;
  firestore: FirestoreModule;
  functions: FunctionsModule;
  iid: InstanceIdModule;
  invites: InvitesModule;
  links: LinksModule;
  messaging: MessagingModule;
  notifications: NotificationsModule;
  perf: PerformanceModule;
  storage: StorageModule;
  utils: UtilsModule;

  constructor() {
    if (!FirebaseCoreModule) {
      throw new Error(INTERNALS.STRINGS.ERROR_MISSING_CORE);
    }
    APPS.initializeNativeApps();

    // modules
    this.admob = APPS.moduleAndStatics('admob', AdMobStatics, AdmobModuleName);
    this.analytics = APPS.moduleAndStatics(
      'analytics',
      AnalyticsStatics,
      AnalyticsModuleName
    );
    this.auth = APPS.moduleAndStatics('auth', AuthStatics, AuthModuleName);
    this.config = APPS.moduleAndStatics(
      'config',
      ConfigStatics,
      ConfigModuleName
    );
    this.crash = APPS.moduleAndStatics('crash', CrashStatics, CrashModuleName);
    this.crashlytics = APPS.moduleAndStatics(
      'crashlytics',
      CrashlyticsStatics,
      CrashlyticsModuleName
    );
    this.database = APPS.moduleAndStatics(
      'database',
      DatabaseStatics,
      DatabaseModuleName
    );
    this.firestore = APPS.moduleAndStatics(
      'firestore',
      FirestoreStatics,
      FirestoreModuleName
    );
    this.functions = APPS.moduleAndStatics(
      'functions',
      FunctionsStatics,
      FunctionsModuleName
    );
    this.iid = APPS.moduleAndStatics(
      'iid',
      InstanceIdStatics,
      InstanceIdModuleName
    );
    this.invites = APPS.moduleAndStatics(
      'invites',
      InvitesStatics,
      InvitesModuleName
    );
    this.links = APPS.moduleAndStatics('links', LinksStatics, LinksModuleName);
    this.messaging = APPS.moduleAndStatics(
      'messaging',
      MessagingStatics,
      MessagingModuleName
    );
    this.notifications = APPS.moduleAndStatics(
      'notifications',
      NotificationsStatics,
      NotificationsModuleName
    );
    this.perf = APPS.moduleAndStatics(
      'perf',
      PerformanceStatics,
      PerfModuleName
    );
    this.storage = APPS.moduleAndStatics(
      'storage',
      StorageStatics,
      StorageModuleName
    );
    this.utils = APPS.moduleAndStatics('utils', UtilsStatics, UtilsModuleName);
  }

  /**
   * Web SDK initializeApp
   *
   * @param options
   * @param name
   * @return {*}
   */
  initializeApp(options: FirebaseOptions, name: string): App {
    return APPS.initializeApp(options, name);
  }

  /**
   * Retrieves a Firebase app instance.
   *
   * When called with no arguments, the default app is returned.
   * When an app name is provided, the app corresponding to that name is returned.
   *
   * @param name
   * @return {*}
   */
  app(name?: string): App {
    return APPS.app(name);
  }

  /**
   * A (read-only) array of all initialized apps.
   * @return {Array}
   */
  get apps(): Array<App> {
    return APPS.apps();
  }

  /**
   * The current SDK version.
   * @return {string}
   */
  get SDK_VERSION(): string {
    return VERSION;
  }
}

export default new Firebase();
