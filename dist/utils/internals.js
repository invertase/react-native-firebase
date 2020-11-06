import { Platform } from 'react-native';
const NAMESPACE_PODS = {
  admob: 'Firebase/AdMob',
  analytics: 'Firebase/Analytics',
  auth: 'Firebase/Auth',
  config: 'Firebase/RemoteConfig',
  database: 'Firebase/Database',
  links: 'Firebase/DynamicLinks',
  messaging: 'Firebase/Messaging',
  perf: 'Firebase/Performance',
  storage: 'Firebase/Storage'
};
const GRADLE_DEPS = {
  admob: 'ads'
};
const PLAY_SERVICES_CODES = {
  // $FlowExpectedError: Doesn't like numerical object keys: https://github.com/facebook/flow/issues/380
  1: {
    code: 'SERVICE_MISSING',
    message: 'Google Play services is missing on this device.'
  },
  // $FlowExpectedError: Doesn't like numerical object keys: https://github.com/facebook/flow/issues/380
  2: {
    code: 'SERVICE_VERSION_UPDATE_REQUIRED',
    message: 'The installed version of Google Play services on this device is out of date.'
  },
  // $FlowExpectedError: Doesn't like numerical object keys: https://github.com/facebook/flow/issues/380
  3: {
    code: 'SERVICE_DISABLED',
    message: 'The installed version of Google Play services has been disabled on this device.'
  },
  // $FlowExpectedError: Doesn't like numerical object keys: https://github.com/facebook/flow/issues/380
  9: {
    code: 'SERVICE_INVALID',
    message: 'The version of the Google Play services installed on this device is not authentic.'
  },
  // $FlowExpectedError: Doesn't like numerical object keys: https://github.com/facebook/flow/issues/380
  18: {
    code: 'SERVICE_UPDATING',
    message: 'Google Play services is currently being updated on this device.'
  },
  // $FlowExpectedError: Doesn't like numerical object keys: https://github.com/facebook/flow/issues/380
  19: {
    code: 'SERVICE_MISSING_PERMISSION',
    message: "Google Play service doesn't have one or more required permissions."
  }
};
export default {
  // default options
  OPTIONS: {
    logLevel: 'warn',
    errorOnMissingPlayServices: true,
    promptOnMissingPlayServices: true
  },
  FLAGS: {
    checkedPlayServices: false
  },
  STRINGS: {
    WARN_INITIALIZE_DEPRECATION: "Deprecation: Calling 'initializeApp()' for apps that are already initialised natively " + "is unnecessary, use 'firebase.app()' instead to access the already initialized default app instance.",

    /**
     * @return {string}
     */
    get ERROR_MISSING_CORE() {
      if (Platform.OS === 'ios') {
        return 'RNFirebase core module was not found natively on iOS, ensure you have ' + 'correctly included the RNFirebase pod in your projects `Podfile` and have run `pod install`.' + '\r\n\r\n See http://invertase.link/ios for the ios setup guide.';
      }

      return 'RNFirebase core module was not found natively on Android, ensure you have ' + 'correctly added the RNFirebase and Firebase gradle dependencies to your `android/app/build.gradle` file.' + '\r\n\r\n See http://invertase.link/android for the android setup guide.';
    },

    ERROR_INIT_OBJECT: 'Firebase.initializeApp(options <-- requires a valid configuration object.',
    ERROR_INIT_STRING_NAME: 'Firebase.initializeApp(options, name <-- requires a valid string value.',

    /**
     * @return {string}
     */
    ERROR_INIT_SERVICE_URL_OR_REGION_UNSUPPORTED(namespace) {
      return `${namespace} does not support a URL or region as a param, please pass in an app.`;
    },

    /**
     * @return {string}
     */
    ERROR_MISSING_CB(method) {
      return `Missing required callback for method ${method}().`;
    },

    /**
     * @return {string}
     */
    ERROR_MISSING_ARG(type, method) {
      return `Missing required argument of type '${type}' for method '${method}()'.`;
    },

    /**
     * @return {string}
     */
    ERROR_MISSING_ARG_NAMED(name, type, method) {
      return `Missing required argument '${name}' of type '${type}' for method '${method}()'.`;
    },

    /**
     * @return {string}
     */
    ERROR_ARG_INVALID_VALUE(name, expected, got) {
      return `Invalid value for argument '${name}' expected value '${expected}' but got '${got}'.`;
    },

    /**
     * @return {string}
     */
    ERROR_PROTECTED_PROP(name) {
      return `Property '${name}' is protected and can not be overridden by extendApp.`;
    },

    /**
     * @return {string}
     * @param namespace
     * @param nativeModule
     */
    ERROR_MISSING_MODULE(namespace, nativeModule) {
      const snippet = `firebase.${namespace}()`;

      if (Platform.OS === 'ios') {
        return `You attempted to use a firebase module that's not installed natively on your iOS project by calling ${snippet}.` + '\r\n\r\nEnsure you have the required Firebase iOS SDK pod for this module included in your Podfile, in this instance ' + `confirm you've added "pod '${NAMESPACE_PODS[namespace]}'" to your Podfile` + '\r\n\r\nSee http://invertase.link/ios for full setup instructions.';
      }

      const fbSDKDep = `'com.google.firebase:firebase-${GRADLE_DEPS[namespace] || namespace}'`;
      const rnFirebasePackage = `'io.invertase.firebase.${namespace}.${nativeModule}Package'`;
      const newInstance = `'new ${nativeModule}Package()'`;
      return `You attempted to use a firebase module that's not installed on your Android project by calling ${snippet}.` + `\r\n\r\nEnsure you have:\r\n\r\n1) Installed the required Firebase Android SDK dependency ${fbSDKDep} in your 'android/app/build.gradle' ` + `file.\r\n\r\n2) Imported the ${rnFirebasePackage} module in your 'MainApplication.java' file.\r\n\r\n3) Added the ` + `${newInstance} line inside of the RN 'getPackages()' method list.` + '\r\n\r\nSee http://invertase.link/android for full setup instructions.';
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
      return `Invalid App instance passed to firebase.${namespace}(app <--).`;
    },

    /**
     * @return {string}
     */
    ERROR_UNSUPPORTED_CLASS_METHOD(className, method) {
      return `${className}.${method}() is unsupported by the native Firebase SDKs.`;
    },

    /**
     * @return {string}
     */
    ERROR_UNSUPPORTED_CLASS_PROPERTY(className, property) {
      return `${className}.${property} is unsupported by the native Firebase SDKs.`;
    },

    /**
     * @return {string}
     */
    ERROR_UNSUPPORTED_MODULE_METHOD(namespace, method) {
      return `firebase.${namespace}().${method}() is unsupported by the native Firebase SDKs.`;
    },

    /**
     * @return {string}
     */
    ERROR_PLAY_SERVICES(statusCode) {
      const knownError = PLAY_SERVICES_CODES[statusCode];
      let start = 'Google Play Services is required to run firebase services on android but a valid installation was not found on this device.';

      if (statusCode === 2) {
        start = 'Google Play Services is out of date and may cause some firebase services like authentication to hang when used. It is recommended that you update it.';
      } // eslint-disable-next-line prefer-template


      return `${`${start}\r\n\r\n-------------------------\r\n`}${knownError ? `${knownError.code}: ${knownError.message} (code ${statusCode})` : `A specific play store availability reason reason was not available (unknown code: ${statusCode})`}\r\n-------------------------` + `\r\n\r\n` + `For more information on how to resolve this issue, configure Play Services checks or for guides on how to validate Play Services on your users devices see the link below:` + `\r\n\r\nhttp://invertase.link/play-services`;
    }

  }
};