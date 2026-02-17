import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type { InAppMessaging } from './types/in-app-messaging';

/**
 * Returns an In-App Messaging instance for the default app.
 */
export function getInAppMessaging(): InAppMessaging {
  return getApp().inAppMessaging();
}

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
export function isMessagesDisplaySuppressed(inAppMessaging: InAppMessaging): boolean {
  return inAppMessaging.isMessagesDisplaySuppressed;
}

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
export function setMessagesDisplaySuppressed(
  inAppMessaging: InAppMessaging,
  enabled: boolean,
): Promise<null> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return (inAppMessaging.setMessagesDisplaySuppressed as any).call(
    inAppMessaging,
    enabled,
    MODULAR_DEPRECATION_ARG,
  );
}

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
export function isAutomaticDataCollectionEnabled(inAppMessaging: InAppMessaging): boolean {
  return inAppMessaging.isAutomaticDataCollectionEnabled;
}

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
export function setAutomaticDataCollectionEnabled(
  inAppMessaging: InAppMessaging,
  enabled: boolean,
): Promise<null> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return (inAppMessaging.setAutomaticDataCollectionEnabled as any).call(
    inAppMessaging,
    enabled,
    MODULAR_DEPRECATION_ARG,
  );
}

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
export function triggerEvent(inAppMessaging: InAppMessaging, eventId: string): Promise<null> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return (inAppMessaging.triggerEvent as any).call(inAppMessaging, eventId, MODULAR_DEPRECATION_ARG);
}
