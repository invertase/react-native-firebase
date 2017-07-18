import EventEmitter from 'EventEmitter';
import { Platform } from 'react-native';

const DEFAULT_APP_NAME = Platform.OS === 'ios' ? '__FIRAPP_DEFAULT' : '[DEFAULT]';

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
    ERROR_INIT_OBJECT: 'Firebase.initializeApp(options <-- requires a valid configuration object.',
    ERROR_INIT_STRING_NAME: 'Firebase.initializeApp(options, name <-- requires a valid string value.',

    /**
     * @param moduleName
     * @return {string}
     */
    ERROR_MISSING_MODULE(moduleName) {
      return `Attempted to call a method for a module that is not installed natively (${moduleName}).`;
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
