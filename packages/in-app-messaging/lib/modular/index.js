import { firebase } from '..';

/**
 * @typedef {import("..").FirebaseApp} FirebaseApp
 * @typedef {import("..").FirebaseInAppMessagingTypes.Module} FirebaseInAppMessaging
 */

/**
 * @returns {FirebaseInAppMessaging}
 */
export function getInAppMessaging() {
  return firebase.inAppMessaging();
}

/**
 * @param {FirebaseInAppMessaging} inAppMessaging
 * @returns {boolean}
 */
export function isMessagesDisplaySuppressed(inAppMessaging) {
  return inAppMessaging.isMessagesDisplaySuppressed;
}

/**
 *
 * @param {FirebaseInAppMessaging} inAppMessaging
 * @param {boolean} enabled
 * @returns {Promise<null>}
 */
export function setMessagesDisplaySuppressed(inAppMessaging, enabled) {
  return inAppMessaging.setMessagesDisplaySuppressed(enabled);
}

/**
 * @param {FirebaseInAppMessaging} inAppMessaging
 * @returns {boolean}
 */
export function isAutomaticDataCollectionEnabled(inAppMessaging) {
  return inAppMessaging.isAutomaticDataCollectionEnabled;
}

/**
 * @param {FirebaseInAppMessaging} inAppMessaging
 * @param {boolean} enabled
 * @returns {Promise<null>}
 */
export function setAutomaticDataCollectionEnabled(inAppMessaging, enabled) {
  return inAppMessaging.setAutomaticDataCollectionEnabled(enabled);
}

/**
 * @param {FirebaseInAppMessaging} inAppMessaging
 * @param {string} eventId
 * @returns {Promise<null>}
 */
export function triggerEvent(inAppMessaging, eventId) {
  return inAppMessaging.triggerEvent(eventId);
}
