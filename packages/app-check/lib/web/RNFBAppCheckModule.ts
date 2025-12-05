/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

// @ts-ignore - web platform imports available at runtime
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
// @ts-ignore - web platform imports available at runtime
import { guard, emitEvent } from '@react-native-firebase/app/lib/internal/web/utils';
import type { AppCheckOptions } from '../types/appcheck';

interface AppCheckInstances {
  [appName: string]: any;
}

interface ListenersForApp {
  [appName: string]: (() => void) | undefined;
}

let appCheckInstances: AppCheckInstances = {};
let listenersForApp: ListenersForApp = {};

function getAppCheckInstanceForApp(appName: string): any {
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
  initializeAppCheck(appName: string, options: AppCheckOptions): Promise<null> {
    makeIDBAvailable();
    return guard(async () => {
      if (appCheckInstances[appName]) {
        return null;
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
  setTokenAutoRefreshEnabled(appName: string, isTokenAutoRefreshEnabled: boolean): Promise<null> {
    return guard(async () => {
      const instance = getAppCheckInstanceForApp(appName);
      setTokenAutoRefreshEnabled(instance, isTokenAutoRefreshEnabled);
      return null;
    });
  },
  getLimitedUseToken(appName: string): Promise<any> {
    return guard(async () => {
      const instance = getAppCheckInstanceForApp(appName);
      return getLimitedUseToken(instance);
    });
  },
  getToken(appName: string, forceRefresh: boolean): Promise<any> {
    return guard(async () => {
      const instance = getAppCheckInstanceForApp(appName);
      return getToken(instance, forceRefresh);
    });
  },
  addAppCheckListener(appName: string): Promise<null> {
    return guard(async () => {
      if (listenersForApp[appName]) {
        return null;
      }
      const instance = getAppCheckInstanceForApp(appName);
      listenersForApp[appName] = onTokenChanged(instance, (tokenResult: any) => {
        emitEvent('appCheck_token_changed', {
          appName,
          ...tokenResult,
        });
      });
      return null;
    });
  },
  removeAppCheckListener(appName: string): Promise<null> {
    return guard(async () => {
      if (!listenersForApp[appName]) {
        return null;
      }
      listenersForApp[appName]?.();
      delete listenersForApp[appName];
      return null;
    });
  },
};
