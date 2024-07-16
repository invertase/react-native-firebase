import {
  getApp,
  initializeAppCheck,
  getToken,
  getLimitedUseToken,
  setTokenAutoRefreshEnabled,
  CustomProvider,
  onTokenChanged,
  makeIDBAvailable,
} from '@react-native-firebase/app/lib/internal/web/firebaseAppCheck';
import { guard, emitEvent } from '@react-native-firebase/app/lib/internal/web/utils';

let appCheckInstances = {};
let listenersForApp = {};

function getAppCheckInstanceForApp(appName) {
  if (!appCheckInstances[appName]) {
    throw new Error(
      `firebase AppCheck instance for app ${appName} has not been initialized, ensure you have called initializeAppCheck() first.`,
    );
  }
  return appCheckInstances[appName];
}

/**
 * This is a 'NativeModule' for the web platform.
 * Methods here are identical to the ones found in
 * the native android/ios modules e.g. `@ReactMethod` annotated
 * java methods on Android.
 */
export default {
  initializeAppCheck(appName, options) {
    makeIDBAvailable();
    return guard(async () => {
      if (appCheckInstances[appName]) {
        return;
      }
      const { provider, isTokenAutoRefreshEnabled } = options;
      const _provider = new CustomProvider({
        getToken() {
          return provider.getToken();
        },
      });
      appCheckInstances[appName] = initializeAppCheck(getApp(appName), {
        provider: _provider,
        isTokenAutoRefreshEnabled,
      });
      return null;
    });
  },
  setTokenAutoRefreshEnabled(appName, isTokenAutoRefreshEnabled) {
    return guard(async () => {
      const instance = getAppCheckInstanceForApp(appName);
      setTokenAutoRefreshEnabled(instance, isTokenAutoRefreshEnabled);
      return null;
    });
  },
  getLimitedUseToken(appName) {
    return guard(async () => {
      const instance = getAppCheckInstanceForApp(appName);
      return getLimitedUseToken(instance);
    });
  },
  getToken(appName, forceRefresh) {
    return guard(async () => {
      const instance = getAppCheckInstanceForApp(appName);
      return getToken(instance, forceRefresh);
    });
  },
  addAppCheckListener(appName) {
    return guard(async () => {
      if (listenersForApp[appName]) {
        return;
      }
      const instance = getAppCheckInstanceForApp(appName);
      listenersForApp[appName] = onTokenChanged(instance, tokenResult => {
        emitEvent('appCheck_token_changed', {
          appName,
          ...tokenResult,
        });
      });
      return null;
    });
  },
  removeAppCheckListener(appName) {
    return guard(async () => {
      if (!listenersForApp[appName]) {
        return;
      }
      listenersForApp[appName]();
      delete listenersForApp[appName];
      return null;
    });
  },
};
