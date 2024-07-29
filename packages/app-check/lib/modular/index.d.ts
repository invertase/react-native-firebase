import { FirebaseApp } from '@firebase/app-types';
import { FirebaseAppCheckTypes } from '..';

import AppCheck = FirebaseAppCheckTypes.Module;
import AppCheckOptions = FirebaseAppCheckTypes.AppCheckOptions;
import AppCheckTokenResult = FirebaseAppCheckTypes.AppCheckTokenResult;
import PartialObserver = FirebaseAppCheckTypes.PartialObserver;
import Unsubscribe = FirebaseAppCheckTypes.Unsubscribe;

/**
 * Activate App Check for the given app. Can be called only once per app.
 * @param app - FirebaseApp. Optional.
 * @param options - AppCheckOptions
 * @returns {Promise<{ app: FirebaseApp }>}
 */
export function initializeAppCheck(
  app?: FirebaseApp,
  options?: AppCheckOptions,
): Promise<{ app: FirebaseApp }>;

/**
 * Get the current App Check token. Attaches to the most recent in-flight request if one is present.
 * Returns null if no token is present and no token requests are in-flight.
 * @param appCheckInstance - AppCheck
 * @param forceRefresh - boolean
 * @returns {Promise<AppCheckTokenResult>}
 */
export function getToken(
  appCheckInstance: AppCheck,
  forceRefresh: boolean,
): Promise<AppCheckTokenResult>;

/**
 * Get a limited-use (consumable) App Check token.
 * For use with server calls to firebase functions or custom backends using the firebase admin SDK
 * @param appCheckInstance - AppCheck
 * @returns {Promise<AppCheckTokenResult>}
 */
export function getLimitedUseToken(appCheckInstance: AppCheck): Promise<AppCheckTokenResult>;

/**
 * Registers a listener to changes in the token state.
 * There can be more than one listener registered at the same time for one or more App Check instances.
 * The listeners call back on the UI thread whenever the current
 * token associated with this App Check instance changes.
 * @param appCheckInstance - AppCheck
 * @param listener - PartialObserver<AppCheckTokenResult>
 * @returns {Unsubscribe}
 */
export function addTokenListener(
  appCheckInstance: AppCheck,
  listener: PartialObserver<AppCheckTokenResult>,
): Unsubscribe;

/**
 * Set whether App Check will automatically refresh tokens as needed.
 * @param appCheckInstance - AppCheck
 * @param isAutoRefreshEnabled - boolean
 */
export function setTokenAutoRefreshEnabled(
  appCheckInstance: AppCheck,
  isAutoRefreshEnabled: boolean,
): void;
