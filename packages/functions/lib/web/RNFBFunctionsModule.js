import {
  getApp,
  getFunctions,
  httpsCallable,
  httpsCallableFromURL,
  connectFunctionsEmulator,
} from '@react-native-firebase/app/lib/internal/web/firebaseFunctions';

/**
 * This is a 'NativeModule' for the web platform.
 * Methods here are identical to the ones found in
 * the native android/ios modules e.g. `@ReactMethod` annotated
 * java methods on Android.
 */
export default {
  /**
   * Get and execute a Firebase Functions callable.
   * @param {string} appName - The name of the app to get the functions instance for.
   * @param {string} regionOrCustomDomain - The region or custom domain to use for the functions instance.
   * @param {string} host - The host to use for the functions emulator.
   * @param {number} port - The port to use for the functions emulator.
   * @param {string} name - The name of the functions callable.
   * @param {object} wrapper - The wrapper object to use for the functions callable.
   * @param {object} options - The options to use for the functions callable.
   * @returns {object} - The result of the functions callable.
   */
  async httpsCallable(appName, regionOrCustomDomain, host, port, name, wrapper, options) {
    try {
      const app = getApp(appName);
      let functionsInstance;
      if (regionOrCustomDomain) {
        functionsInstance = getFunctions(app, regionOrCustomDomain);
        // Hack to work around custom domain and region not being set on the instance.
        if (regionOrCustomDomain.startsWith('http')) {
          functionsInstance.customDomain = regionOrCustomDomain;
          functionsInstance.region = 'us-central1';
        } else {
          functionsInstance.region = regionOrCustomDomain;
          functionsInstance.customDomain = null;
        }
      } else {
        functionsInstance = getFunctions(app);
        functionsInstance.region = 'us-central1';
        functionsInstance.customDomain = null;
      }
      if (host) {
        connectFunctionsEmulator(functionsInstance, host, port);
        // Hack to work around emulator origin not being set on the instance.
        functionsInstance.emulatorOrigin = `http://${host}:${port}`;
      }
      let callable;
      if (Object.keys(options).length) {
        callable = httpsCallable(functionsInstance, name, options);
      } else {
        callable = httpsCallable(functionsInstance, name);
      }
      // if data is undefined use null,
      const data = wrapper['data'] ?? null;
      const result = await callable(data);
      return result;
    } catch (error) {
      const { code, message, details } = error;
      const nativeError = {
        code,
        message,
        userInfo: {
          code: code ? code.replace('functions/', '') : 'unknown',
          message,
          details,
        },
      };
      return Promise.reject(nativeError);
    }
  },

  /**
   * Get and execute a Firebase Functions callable from a URL.
   * @param {string} appName - The name of the app to get the functions instance for.
   * @param {string} regionOrCustomDomain - The region or custom domain to use for the functions instance.
   * @param {string} host - The host to use for the functions emulator.
   * @param {number} port - The port to use for the functions emulator.
   * @param {string} url - The URL to use for the functions callable.
   * @param {object} wrapper - The wrapper object to use for the functions callable.
   * @param {object} options - The options to use for the functions callable.
   * @returns {object} - The result of the functions callable.
   */
  async httpsCallableFromUrl(appName, regionOrCustomDomain, host, port, url, wrapper, options) {
    try {
      const app = getApp(appName);
      let functionsInstance;
      if (regionOrCustomDomain) {
        functionsInstance = getFunctions(app, regionOrCustomDomain);
        // Hack to work around custom domain and` region not being set on the instance.
        if (regionOrCustomDomain.startsWith('http')) {
          functionsInstance.customDomain = regionOrCustomDomain;
        } else {
          functionsInstance.region = regionOrCustomDomain;
        }
      } else {
        functionsInstance = getFunctions(app);
        functionsInstance.region = 'us-central1';
        functionsInstance.customDomain = null;
      }
      if (host) {
        connectFunctionsEmulator(functionsInstance, host, port);
        // Hack to work around emulator origin not being set on the instance.
        functionsInstance.emulatorOrigin = `http://${host}:${port}`;
      }
      const callable = httpsCallableFromURL(functionsInstance, url, options);
      const result = await callable(wrapper['data']);
      return result;
    } catch (error) {
      const { code, message, details } = error;
      const nativeError = {
        code,
        message,
        userInfo: {
          code: code ? code.replace('functions/', '') : 'unknown',
          message,
          details,
        },
      };
      return Promise.reject(nativeError);
    }
  },
};
