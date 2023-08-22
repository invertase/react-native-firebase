import { firebase } from '..';

/**
 * @returns {import('.').FirebaseInAppMessaging}
 */
export function getInAppMessaging() {
  return firebase.inAppMessaging();
}

/**
 * @param {import('.').FirebaseInAppMessaging} inAppMessaging
 * @returns {boolean}
 */
export function isMessagesDisplaySuppressed(inAppMessaging) {
  return inAppMessaging.isMessagesDisplaySuppressed;
}

/**
 *
 * @param {import('.').FirebaseInAppMessaging} inAppMessaging
 * @param {boolean} enabled
 * @returns {Promise<null>}
 */
export function setMessagesDisplaySuppressed(inAppMessaging, enabled) {
  return inAppMessaging.setMessagesDisplaySuppressed(enabled);
}

/**
 * @param {import('.').FirebaseInAppMessaging} inAppMessaging
 * @returns {boolean}
 */
export function isAutomaticDataCollectionEnabled(inAppMessaging) {
  return inAppMessaging.isAutomaticDataCollectionEnabled;
}

/**
 * @param {import('.').FirebaseInAppMessaging} inAppMessaging
 * @param {boolean} enabled
 * @returns {Promise<null>}
 */
export function setAutomaticDataCollectionEnabled(inAppMessaging, enabled) {
  return inAppMessaging.setAutomaticDataCollectionEnabled(enabled);
}

/**
 * @param {import('.').FirebaseInAppMessaging} inAppMessaging
 * @param {string} eventId
 * @returns {Promise<null>}
 */
export function triggerEvent(inAppMessaging, eventId) {
  return inAppMessaging.triggerEvent(eventId);
}
