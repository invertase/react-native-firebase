import { FirebaseInAppMessagingTypes } from '..';

type FirebaseInAppMessaging = FirebaseInAppMessagingTypes.Module;

export declare function getInAppMessaging(): FirebaseInAppMessaging;

/**
 * Determines whether messages are suppressed or not.
 *
 * #### Example
 *
 * ```js
 * const inAppMessaging = getInAppMessaging();
 * const isSuppressed = isMessagesDisplaySuppressed(inAppMessaging);
 * ```
 */
export declare function isMessagesDisplaySuppressed(
  inAppMessaging: FirebaseInAppMessaging,
): boolean;

/**
 * Enable or disable suppression of Firebase In App Messaging messages.
 *
 * When enabled, no in app messages will be rendered until either you disable suppression, or the app restarts.
 * This state is not persisted between app restarts.
 *
 * #### Example
 *
 * ```js
 * // Suppress messages
 * const inAppMessaging = getInAppMessaging();
 * await setMessagesDisplaySuppressed(inAppMessaging, true);
 * ```
 */
export declare function setMessagesDisplaySuppressed(
  inAppMessaging: FirebaseInAppMessaging,
  enabled: boolean,
): Promise<null>;

/**
 * Determines whether automatic data collection is enabled or not.
 *
 * #### Example
 *
 * ```js
 * const inAppMessaging = getInAppMessaging();
 * const isDataCollectionEnabled = isAutomaticDataCollectionEnabled(inAppMessaging);
 * ```
 */
export declare function isAutomaticDataCollectionEnabled(
  inAppMessaging: FirebaseInAppMessaging,
): boolean;

/**
 * Enable or disable automatic data collection for Firebase In-App Messaging.
 *
 * When enabled, generates a registration token on app startup if there is no valid one and generates a new token
 * when it is deleted (which prevents `deleteInstanceId()` from stopping the periodic sending of data).
 *
 * This setting is persisted across app restarts and overrides the setting specified in your manifest/plist file.
 *
 * #### Example
 *
 * ```js
 * // Disable data collection
 * const inAppMessaging = getInAppMessaging();
 * setAutomaticDataCollectionEnabled(inAppMessaging, false);
 * ```
 */
export declare function setAutomaticDataCollectionEnabled(
  inAppMessaging: FirebaseInAppMessaging,
  enabled: boolean,
): Promise<null>;

/**
 * Trigger in-app messages programmatically
 *
 * #### Example
 *
 * ```js
 * // Suppress messages
 * const inAppMessaging = getInAppMessaging();
 * await triggerEvent(inAppMessaging, "exampleTrigger");
 * ```
 */
export declare function triggerEvent(
  inAppMessaging: FirebaseInAppMessaging,
  eventId: string,
): Promise<null>;
