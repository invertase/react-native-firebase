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
 * Activate App Check for the given app. Can be called only once per app.
 * @param app - FirebaseApp. Optional.
 * @param options - AppCheckOptions
 * @returns {AppCheck}
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
 * @param appCheckInstance - AppCheck
 * @param forceRefresh - boolean
 * @returns {Promise<AppCheckTokenResult>}
 */
export function getToken(appCheckInstance, forceRefresh) {
  return appCheckInstance.app.appCheck().getToken(forceRefresh);
}

/**
 * Get a limited-use (consumable) App Check token.
 * For use with server calls to firebase functions or custom backends using firebase admin SDK.
 * @param appCheckInstance - AppCheck
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
 * @param appCheckInstance - AppCheck
 * @param listener - PartialObserver<AppCheckTokenResult>
 * @returns {Unsubscribe}
 */
export function addTokenListener(appCheckInstance, listener) {
  // Not implemented on React Native
  // See packages/app-check/lib/index.js:127
  throw new Error('addTokenListener is not implemented on React Native');
}

/**
 * Set whether App Check will automatically refresh tokens as needed.
 * @param appCheckInstance - AppCheck
 * @param isAutoRefreshEnabled - boolean
 */
export function setTokenAutoRefreshEnabled(appCheckInstance, isAutoRefreshEnabled) {
  return appCheckInstance.app.appCheck().setTokenAutoRefreshEnabled(isAutoRefreshEnabled);
}
