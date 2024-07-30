/* eslint-disable @typescript-eslint/no-unused-vars */
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

import { firebase } from '..';

/**
 * @typedef {import('@firebase/app').FirebaseApp} FirebaseApp
 * @typedef {import('..').FirebaseAppCheckTypes.Module} AppCheck
 * @typedef {import('..').FirebaseAppCheckTypes.AppCheckTokenResult} AppCheckTokenResult
 * @typedef {import('..').FirebaseAppCheckTypes.Unsubscribe} Unsubscribe
 * @typedef {import('..').FirebaseAppCheckTypes.PartialObserver} PartialObserver
 * @typedef {import('..').FirebaseAppCheckTypes.AppCheckOptions} AppCheckOptions
 */

/**
 * Activate App Check for the given app. Can be called only once per app.
 * @param {FirebaseApp} [app] - The app to initialize App Check for. Optional.
 * @param {AppCheckOptions} options - App Check options.
 * @returns {Promise<{ app: FirebaseApp }>}
 */
export async function initializeAppCheck(app, options) {
  if (app) {
    await firebase.app(app.name).appCheck().initializeAppCheck(options);
    return { app: firebase.app(app.name) };
  }

  await firebase.app().appCheck().initializeAppCheck(options);
  return { app: firebase.app() };
}

/**
 * Get the current App Check token. Attaches to the most recent in-flight request if one is present.
 * Returns null if no token is present and no token requests are in-flight.
 * @param {AppCheck} appCheckInstance - The App Check instance.
 * @param {boolean} forceRefresh - Whether to force refresh the token.
 * @returns {Promise<AppCheckTokenResult>}
 */
export function getToken(appCheckInstance, forceRefresh) {
  return appCheckInstance.app.appCheck().getToken(forceRefresh);
}

/**
 * Get a limited-use (consumable) App Check token.
 * For use with server calls to firebase functions or custom backends using the firebase admin SDK.
 * @param {AppCheck} appCheckInstance - The App Check instance.
 * @returns {Promise<AppCheckTokenResult>}
 */
export function getLimitedUseToken(appCheckInstance) {
  return appCheckInstance.app.appCheck().getLimitedUseToken();
}

/**
 * Registers a listener to changes in the token state.
 * There can be more than one listener registered at the same time for one or more App Check instances.
 * The listeners call back on the UI thread whenever the current
 * token associated with this App Check instance changes.
 * @param {AppCheck} appCheckInstance - The App Check instance.
 * @param {PartialObserver<AppCheckTokenResult>} listener - The listener to register.
 * @returns {Unsubscribe}
 */
export function addTokenListener(appCheckInstance, listener) {
  // Not implemented on React Native
  // See packages/app-check/lib/index.js:127
  throw new Error('addTokenListener is not implemented on React Native');
}

/**
 * Set whether App Check will automatically refresh tokens as needed.
 * @param {AppCheck} appCheckInstance - The App Check instance.
 * @param {boolean} isAutoRefreshEnabled - Whether to enable auto-refresh.
 */
export function setTokenAutoRefreshEnabled(appCheckInstance, isAutoRefreshEnabled) {
  return appCheckInstance.app.appCheck().setTokenAutoRefreshEnabled(isAutoRefreshEnabled);
}
