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

import { getApp, type FirebaseApp, type ReactNativeFirebase } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import ReactNativeFirebaseAppCheckProvider from './ReactNativeFirebaseAppCheckProvider';

import type {
  AppCheck,
  AppCheckOptions,
  AppCheckTokenResult,
  PartialObserver,
  Unsubscribe,
  AppCheckListenerResult,
} from './types/appcheck';
import type { AppCheckInternal } from './types/internal';

type WithModularDeprecationArg<F> = F extends (...args: infer P) => infer R
  ? (...args: [...P, typeof MODULAR_DEPRECATION_ARG]) => R
  : never;

/**
 * Activate App Check for the given app. Can be called only once per app.
 * @param app - The app to initialize App Check for. Optional.
 * @param options - App Check options.
 * @returns Promise<AppCheck>
 */
export async function initializeAppCheck(
  app?: ReactNativeFirebase.FirebaseApp,
  options?: AppCheckOptions,
): Promise<AppCheck> {
  if (app) {
    const appInstance = getApp(app.name) as FirebaseApp;
    const appCheck = appInstance.appCheck();
    await (
      (appCheck as AppCheckInternal).initializeAppCheck as WithModularDeprecationArg<
        AppCheckInternal['initializeAppCheck']
      >
    ).call(appCheck, options as AppCheckOptions, MODULAR_DEPRECATION_ARG);
    return appCheck;
  }
  const appInstance = getApp() as FirebaseApp;
  const appCheck = appInstance.appCheck();
  await (
    (appCheck as AppCheckInternal).initializeAppCheck as WithModularDeprecationArg<
      AppCheckInternal['initializeAppCheck']
    >
  ).call(appCheck, options as AppCheckOptions, MODULAR_DEPRECATION_ARG);
  return appCheck;
}

/**
 * Get the current App Check token. Attaches to the most recent in-flight request if one is present.
 * Returns null if no token is present and no token requests are in-flight.
 * @param appCheckInstance - The App Check instance.
 * @param forceRefresh - Whether to force refresh the token. Optional
 * @returns Promise<AppCheckTokenResult>
 */
export function getToken(
  appCheckInstance: AppCheck,
  forceRefresh?: boolean,
): Promise<AppCheckTokenResult> {
  return (
    (appCheckInstance as AppCheckInternal).getToken as WithModularDeprecationArg<
      AppCheckInternal['getToken']
    >
  ).call(appCheckInstance, forceRefresh, MODULAR_DEPRECATION_ARG) as Promise<AppCheckTokenResult>;
}

/**
 * Get a limited-use (consumable) App Check token.
 * For use with server calls to firebase functions or custom backends using the firebase admin SDK.
 * @param appCheckInstance - The App Check instance.
 * @returns Promise<AppCheckTokenResult>
 */
export function getLimitedUseToken(appCheckInstance: AppCheck): Promise<AppCheckTokenResult> {
  return (
    (appCheckInstance as AppCheckInternal).getLimitedUseToken as WithModularDeprecationArg<
      AppCheckInternal['getLimitedUseToken']
    >
  ).call(appCheckInstance, MODULAR_DEPRECATION_ARG) as Promise<AppCheckTokenResult>;
}

/**
 * Set whether App Check will automatically refresh tokens as needed.
 * @param appCheckInstance - The App Check instance.
 * @param isAutoRefreshEnabled - Whether to enable auto-refresh.
 */
export function setTokenAutoRefreshEnabled(
  appCheckInstance: AppCheck,
  isAutoRefreshEnabled: boolean,
): void {
  (
    (appCheckInstance as AppCheckInternal).setTokenAutoRefreshEnabled as WithModularDeprecationArg<
      AppCheckInternal['setTokenAutoRefreshEnabled']
    >
  ).call(appCheckInstance, isAutoRefreshEnabled, MODULAR_DEPRECATION_ARG);
}

/**
 * Registers a listener to changes in the token state. There can be more
 * than one listener registered at the same time for one or more
 * App Check instances. The listeners call back on the UI thread whenever
 * the current token associated with this App Check instance changes.
 *
 * @param appCheckInstance - The App Check instance.
 * @param listener - The listener to register.
 * @returns Unsubscribe
 */
export function onTokenChanged(
  appCheckInstance: AppCheck,
  listener: PartialObserver<AppCheckTokenResult>,
): Unsubscribe;

/**
 * Registers a listener to changes in the token state. There can be more
 * than one listener registered at the same time for one or more
 * App Check instances. The listeners call back on the UI thread whenever
 * the current token associated with this App Check instance changes.
 *
 * @param appCheckInstance - The App Check instance.
 * @param onNext - The callback function for token changes.
 * @param onError - Optional error callback.
 * @param onCompletion - Optional completion callback.
 * @returns Unsubscribe
 */
export function onTokenChanged(
  appCheckInstance: AppCheck,
  onNext: (tokenResult: AppCheckListenerResult) => void,
  onError?: (error: Error) => void,
  onCompletion?: () => void,
): Unsubscribe;

export function onTokenChanged(
  appCheckInstance: AppCheck,
  onNextOrObserver:
    | PartialObserver<AppCheckTokenResult>
    | ((tokenResult: AppCheckListenerResult) => void),
  onError?: (error: Error) => void,
  onCompletion?: () => void,
): Unsubscribe {
  return (
    (appCheckInstance as AppCheckInternal).onTokenChanged as WithModularDeprecationArg<
      AppCheckInternal['onTokenChanged']
    >
  ).call(
    appCheckInstance,
    onNextOrObserver,
    onError,
    onCompletion,
    MODULAR_DEPRECATION_ARG,
  ) as Unsubscribe;
}

export { ReactNativeFirebaseAppCheckProvider };
