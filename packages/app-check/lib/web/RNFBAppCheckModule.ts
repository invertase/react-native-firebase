import {
  getApp,
  initializeAppCheck,
  getToken,
  getLimitedUseToken,
  setTokenAutoRefreshEnabled,
  CustomProvider,
  onTokenChanged,
  makeIDBAvailable,
  type AppCheckOptions,
  type AppCheckTokenResult,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseAppCheck';
import { guard, emitEvent } from '@react-native-firebase/app/dist/module/internal/web/utils';

let appCheckInstances: Record<string, any> = {};
let listenersForApp: Record<string, () => void> = {};

function getAppCheckInstanceForApp(appName: string): any {
  if (!appCheckInstances[appName]) {
    throw new Error(
      `firebase AppCheck instance for app ${appName} has not been initialized, ensure you have called initializeAppCheck() first.`,
    );
  }
  return appCheckInstances[appName];
}

interface AppCheckModule {
  initializeAppCheck(appName: string, options: AppCheckOptions): Promise<void>;
  setTokenAutoRefreshEnabled(appName: string, isTokenAutoRefreshEnabled: boolean): Promise<void>;
  getLimitedUseToken(appName: string): Promise<AppCheckTokenResult>;
  getToken(appName: string, forceRefresh: boolean): Promise<AppCheckTokenResult>;
  addAppCheckListener(appName: string): Promise<void>;
  removeAppCheckListener(appName: string): Promise<void>;
}

/**
 * This is a 'NativeModule' for the web platform.
 * Methods here are identical to the ones found in
 * the native android/ios modules e.g. `@ReactMethod` annotated
 * java methods on Android.
 */
const module: AppCheckModule = {
  initializeAppCheck(appName: string, options: AppCheckOptions) {
    makeIDBAvailable();
    return guard(async () => {
      if (appCheckInstances[appName]) {
        return;
      }
      const { provider, isTokenAutoRefreshEnabled } = options;
      const _provider = new CustomProvider({
        getToken() {
          if ('getToken' in provider && typeof provider.getToken === 'function') {
            return provider.getToken();
          }
          throw new Error('Provider does not have a getToken method');
        },
      });
      appCheckInstances[appName] = initializeAppCheck(getApp(appName), {
        provider: _provider,
        isTokenAutoRefreshEnabled,
      });
    });
  },
  setTokenAutoRefreshEnabled(appName: string, isTokenAutoRefreshEnabled: boolean) {
    return guard(async () => {
      const instance = getAppCheckInstanceForApp(appName);
      setTokenAutoRefreshEnabled(instance, isTokenAutoRefreshEnabled);
    });
  },
  getLimitedUseToken(appName: string) {
    return guard(async () => {
      const instance = getAppCheckInstanceForApp(appName);
      return getLimitedUseToken(instance);
    });
  },
  getToken(appName: string, forceRefresh: boolean) {
    return guard(async () => {
      const instance = getAppCheckInstanceForApp(appName);
      return getToken(instance, forceRefresh);
    });
  },
  addAppCheckListener(appName: string) {
    return guard(async () => {
      if (listenersForApp[appName]) {
        return;
      }
      const instance = getAppCheckInstanceForApp(appName);
      listenersForApp[appName] = onTokenChanged(instance, (tokenResult: AppCheckTokenResult) => {
        emitEvent('appCheck_token_changed', {
          appName,
          ...tokenResult,
        });
      });
    });
  },
  removeAppCheckListener(appName: string) {
    return guard(async () => {
      if (!listenersForApp[appName]) {
        return;
      }
      listenersForApp[appName]();
      delete listenersForApp[appName];
    });
  },
};

export default module;
