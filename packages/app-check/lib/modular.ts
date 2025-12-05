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

import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/lib/common';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import ReactNativeFirebaseAppCheckProvider, {
  type ReactNativeFirebaseAppCheckProviderOptions,
  type ReactNativeFirebaseAppCheckProviderWebOptions,
  type ReactNativeFirebaseAppCheckProviderAppleOptions,
  type ReactNativeFirebaseAppCheckProviderAndroidOptions,
} from './ReactNativeFirebaseAppCheckProvider';
import type {
  AppCheckProvider,
  CustomProviderOptions,
  AppCheckOptions,
  AppCheckTokenResult,
  AppCheckListenerResult,
  PartialObserver,
} from './types/appcheck';
import type { FirebaseAppCheckModule } from './namespaced';

declare module '@react-native-firebase/app' {
  function getApp(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { appCheck(): FirebaseAppCheckModule };
}

export { CustomProvider } from './namespaced';
export {
  ReactNativeFirebaseAppCheckProvider,
  type ReactNativeFirebaseAppCheckProviderOptions,
  type ReactNativeFirebaseAppCheckProviderWebOptions,
  type ReactNativeFirebaseAppCheckProviderAppleOptions,
  type ReactNativeFirebaseAppCheckProviderAndroidOptions,
};

export type {
  AppCheckProvider,
  CustomProviderOptions,
  AppCheckOptions,
  AppCheckTokenResult,
  AppCheckListenerResult,
  PartialObserver,
};

/**
 * Activate App Check for the given app. Can be called only once per app.
 * @param app - The app to initialize App Check for. Optional.
 * @param options - App Check options.
 * @returns {Promise<FirebaseAppCheckModule>}
 */
export async function initializeAppCheck(
  app?: ReactNativeFirebase.FirebaseApp,
  options?: AppCheckOptions,
): Promise<FirebaseAppCheckModule> {
  if (app) {
    const appCheck = getApp(app.name).appCheck();
    if (options) {
      await appCheck.initializeAppCheck.call(appCheck, options, MODULAR_DEPRECATION_ARG);
    }
    return appCheck;
  }
  const appCheck = getApp().appCheck();
  if (options) {
    await appCheck.initializeAppCheck.call(appCheck, options, MODULAR_DEPRECATION_ARG);
  }
  return appCheck;
}

/**
 * Get the current App Check token. Attaches to the most recent in-flight request if one is present.
 * Returns null if no token is present and no token requests are in-flight.
 * @param appCheckInstance - The App Check instance.
 * @param forceRefresh - Whether to force refresh the token. Optional
 * @returns {Promise<AppCheckTokenResult>}
 */
export function getToken(
  appCheckInstance: FirebaseAppCheckModule,
  forceRefresh?: boolean,
): Promise<AppCheckTokenResult> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return appCheckInstance.getToken.call(appCheckInstance, forceRefresh, MODULAR_DEPRECATION_ARG);
}

/**
 * Get a limited-use (consumable) App Check token.
 * For use with server calls to firebase functions or custom backends using the firebase admin SDK.
 * @param appCheckInstance - The App Check instance.
 * @returns {Promise<AppCheckTokenResult>}
 */
export function getLimitedUseToken(
  appCheckInstance: FirebaseAppCheckModule,
): Promise<AppCheckTokenResult> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return appCheckInstance.getLimitedUseToken.call(appCheckInstance, MODULAR_DEPRECATION_ARG);
}

/**
 * Set whether App Check will automatically refresh tokens as needed.
 * @param appCheckInstance - The App Check instance.
 * @param isAutoRefreshEnabled - Whether to enable auto-refresh.
 */
export function setTokenAutoRefreshEnabled(
  appCheckInstance: FirebaseAppCheckModule,
  isAutoRefreshEnabled: boolean,
): void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return appCheckInstance.setTokenAutoRefreshEnabled.call(
    appCheckInstance,
    isAutoRefreshEnabled,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Registers a listener to changes in the token state. There can be more
 * than one listener registered at the same time for one or more
 * App Check instances. The listeners call back on the UI thread whenever
 * the current token associated with this App Check instance changes.
 *
 * @param appCheckInstance - The App Check instance.
 * @param onNextOrObserver - The listener to register.
 * @param onError - Optional error callback.
 * @param onCompletion - Optional completion callback.
 * @returns {() => void}
 */
export function onTokenChanged(
  appCheckInstance: FirebaseAppCheckModule,
  onNextOrObserver:
    | PartialObserver<AppCheckListenerResult>
    | ((tokenResult: AppCheckListenerResult) => void),
  onError?: (error: Error) => void,
  onCompletion?: () => void,
): () => void {
  // Cast to any to handle overload resolution - runtime behavior is correct
  return (appCheckInstance.onTokenChanged as any).call(
    appCheckInstance,
    onNextOrObserver,
    onError,
    onCompletion,
    MODULAR_DEPRECATION_ARG,
  );
}
