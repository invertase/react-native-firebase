import EventEmitter from 'EventEmitter';
import { Platform, NativeModules } from 'react-native';

import SyncTree from './utils/SyncTree';

const DEFAULT_APP_NAME = Platform.OS === 'ios' ? '__FIRAPP_DEFAULT' : '[DEFAULT]';

const NAMESPACE_PODS = {
  admob: 'Firebase/AdMob',
  analytics: 'Firebase/Analytics',
  auth: 'Firebase/Auth',
  config: 'Firebase/RemoteConfig',
  crash: 'Firebase/Crash',
  database: 'Firebase/Database',
  links: 'Firebase/DynamicLinks',
  messaging: 'Firebase/Messaging',
  perf: 'Firebase/Performance',
  storage: 'Firebase/Storage',
};

const GRADLE_DEPS = {
  admob: 'ads',
};

export default {
  // default options
  OPTIONS: {
    logLevel: 'warn',
  },

  // track all initialized firebase apps
  APPS: {
    [DEFAULT_APP_NAME]: null,
  },

  STRINGS: {
    WARN_INITIALIZE_DEPRECATION: 'Deprecation: Calling \'initializeApp()\' for apps that are already initialised natively ' +
    'is unnecessary, use \'firebase.app()\' instead to access the already initialized default app instance.',

    /**
     * @return {string}
     */
    get ERROR_MISSING_CORE() {
      if (Platform.OS === 'ios') {
        return 'RNFirebase core module was not found natively on iOS, ensure you have ' +
          'correctly included the RNFirebase pod in your projects `Podfile` and have run `pod install`.' +
          '\r\n\r\n See http://invertase.link/ios for the ios setup guide.';
      }

      return 'RNFirebase core module was not found natively on Android, ensure you have ' +
        'correctly added the RNFirebase and Firebase gradle dependencies to your `android/app/build.gradle` file.' +
        '\r\n\r\n See http://invertase.link/android for the android setup guide.';
    },


    ERROR_INIT_OBJECT: 'Firebase.initializeApp(options <-- requires a valid configuration object.',
    ERROR_INIT_STRING_NAME: 'Firebase.initializeApp(options, name <-- requires a valid string value.',

    /**
     * @return {string}
     */
    ERROR_MISSING_CB(method) {
      return `Missing required callback for method ${method}().`;
    },

    /**
     * @return {string}
     * @param namespace
     * @param nativeModule
     */
    ERROR_MISSING_MODULE(namespace, nativeModule) {
      const snippet = `firebase.${namespace}()`;
      if (Platform.OS === 'ios') {
        return `You attempted to use a firebase module that's not installed natively on your iOS project by calling ${snippet}.` +
          '\r\n\r\nEnsure you have the required Firebase iOS SDK pod for this module included in your Podfile, in this instance ' +
          `confirm you've added "pod '${NAMESPACE_PODS[namespace]}'" to your Podfile` +
          '\r\n\r\nSee http://invertase.link/ios for full setup instructions.';
      }

      const fbSDKDep = `'com.google.firebase:firebase-${GRADLE_DEPS[namespace] || namespace}'`;
      const rnFirebasePackage = `'io.invertase.firebase.${namespace}.${nativeModule}Package'`;
      const newInstance = `'new ${nativeModule}Package()'`;
      return `You attempted to use a firebase module that's not installed on your Android project by calling ${snippet}.` +
        `\r\n\r\nEnsure you have:\r\n\r\n1) Installed the required Firebase Android SDK dependency ${fbSDKDep} in your 'android/app/build.gradle' ` +
        `file.\r\n\r\n2) Imported the ${rnFirebasePackage} module in your 'MainApplication.java' file.\r\n\r\n3) Added the ` +
        `${newInstance} line inside of the RN 'getPackages()' method list.` +
        '\r\n\r\nSee http://invertase.link/android for full setup instructions.';
    },

    /**
     * @return {string}
     */
    ERROR_APP_NOT_INIT(appName) {
      return `The [${appName}] firebase app has not been initialized!`;
    },

    /**
     * @param optName
     * @return {string}
     * @constructor
     */
    ERROR_MISSING_OPT(optName) {
      return `Failed to initialize app. FirebaseOptions missing or invalid '${optName}' property.`;
    },

    /**
     * @return {string}
     */
    ERROR_NOT_APP(namespace) {
      return `Invalid FirebaseApp instance passed to firebase.${namespace}(app <--).`;
    },

    DEFAULT_APP_NAME,
  },


  SharedEventEmitter: new EventEmitter(),
  SyncTree: NativeModules.RNFirebaseDatabase ? new SyncTree(NativeModules.RNFirebaseDatabase) : null,

  // internal utils
  deleteApp(name: String) {
    const app = this.APPS[name];
    if (!app) return Promise.resolve();

    // https://firebase.google.com/docs/reference/js/firebase.app.App#delete
    return app.delete().then(() => {
      delete this.APPS[name];
      return true;
    });
  },
};
