/**
 * @providesModule Firebase
 * @flow
 */
import { NativeModules } from 'react-native';

import APPS from '../../utils/apps';
import INTERNALS from '../../utils/internals';
import FirebaseApp from './firebase-app';

// module imports
import AdMob, { statics as AdMobStatics } from '../admob';
import Auth, { statics as AuthStatics } from '../auth';
import Analytics, { statics as AnalyticsStatics } from '../analytics';
import Config, { statics as ConfigStatics } from '../config';
import Crash, { statics as CrashStatics } from '../crash';
import Crashlytics, { statics as CrashlyticsStatics } from '../fabric/crashlytics';
import Database, { statics as DatabaseStatics } from '../database';
import Firestore, { statics as FirestoreStatics } from '../firestore';
import Links, { statics as LinksStatics } from '../links';
import Messaging, { statics as MessagingStatics } from '../messaging';
import Performance, { statics as PerformanceStatics } from '../perf';
import Storage, { statics as StorageStatics } from '../storage';
import Utils, { statics as UtilsStatics } from '../utils';

import type {
  AdMobModule,
  AnalyticsModule,
  AuthModule,
  ConfigModule,
  CrashModule,
  DatabaseModule,
  FabricModule,
  FirebaseOptions,
  FirestoreModule,
  LinksModule,
  MessagingModule,
  PerformanceModule,
  StorageModule,
  UtilsModule,
} from '../../types';

const FirebaseCoreModule = NativeModules.RNFirebase;

class FirebaseCore {
  admob: AdMobModule;
  analytics: AnalyticsModule;
  auth: AuthModule;
  config: ConfigModule;
  crash: CrashModule;
  database: DatabaseModule;
  fabric: FabricModule;
  firestore: FirestoreModule;
  links: LinksModule;
  messaging: MessagingModule;
  perf: PerformanceModule;
  storage: StorageModule;
  utils: UtilsModule;

  constructor() {
    if (!FirebaseCoreModule) {
      throw (new Error(INTERNALS.STRINGS.ERROR_MISSING_CORE));
    }
    APPS.initializeNativeApps();

    // modules
    this.admob = APPS.moduleAndStatics('admob', AdMobStatics, AdMob);
    this.analytics = APPS.moduleAndStatics('analytics', AnalyticsStatics, Analytics);
    this.auth = APPS.moduleAndStatics('auth', AuthStatics, Auth);
    this.config = APPS.moduleAndStatics('config', ConfigStatics, Config);
    this.crash = APPS.moduleAndStatics('crash', CrashStatics, Crash);
    this.database = APPS.moduleAndStatics('database', DatabaseStatics, Database);
    this.fabric = {
      crashlytics: APPS.moduleAndStatics('crashlytics', CrashlyticsStatics, Crashlytics),
    };
    this.firestore = APPS.moduleAndStatics('firestore', FirestoreStatics, Firestore);
    this.links = APPS.moduleAndStatics('links', LinksStatics, Links);
    this.messaging = APPS.moduleAndStatics('messaging', MessagingStatics, Messaging);
    this.perf = APPS.moduleAndStatics('perf', PerformanceStatics, Performance);
    this.storage = APPS.moduleAndStatics('storage', StorageStatics, Storage);
    this.utils = APPS.moduleAndStatics('utils', UtilsStatics, Utils);
  }

  /**
   * Web SDK initializeApp
   *
   * @param options
   * @param name
   * @return {*}
   */
  initializeApp(options: FirebaseOptions, name: string): FirebaseApp {
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
  app(name?: string): FirebaseApp {
    return APPS.app(name);
  }

  /**
   * A (read-only) array of all initialized apps.
   * @return {Array}
   */
  get apps(): Array<FirebaseApp> {
    return APPS.apps();
  }
}

export default new FirebaseCore();
