import {
  getApp,
  initializeAppCheck as initializeJsAppCheck,
  getToken,
  getLimitedUseToken,
  setTokenAutoRefreshEnabled,
  onTokenChanged,
  makeIDBAvailable,
  type AppCheckTokenResult,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseAppCheck';
import { guard, emitEvent } from '@react-native-firebase/app/dist/module/internal/web/utils';
import {
  buildWebAppCheckInitOptions,
  type WebInitializeAppCheckOptions,
} from './appCheckWebProviderRouting';

let appCheckInstances: Record<string, unknown> = {};
let listenersForApp: Record<string, () => void> = {};

function getAppCheckInstanceForApp(appName: string): unknown {
  if (!appCheckInstances[appName]) {
    throw new Error(
      `firebase AppCheck instance for app ${appName} has not been initialized, ensure you have called initializeAppCheck() first.`,
    );
  }
  return appCheckInstances[appName];
}

interface AppCheckModule {
  initializeAppCheck(appName: string, options: WebInitializeAppCheckOptions): Promise<void>;
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
const appCheckWebModule: AppCheckModule = {
  initializeAppCheck(appName: string, options: WebInitializeAppCheckOptions) {
    makeIDBAvailable();
    return guard(async () => {
      if (appCheckInstances[appName]) {
        return;
      }

      const { provider, isTokenAutoRefreshEnabled } = options;
      const app = getApp(appName);
      const initOptions = buildWebAppCheckInitOptions(app, { provider, isTokenAutoRefreshEnabled });
      appCheckInstances[appName] = initializeJsAppCheck(app, initOptions);
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

export default appCheckWebModule;
