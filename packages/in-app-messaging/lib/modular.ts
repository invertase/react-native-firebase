import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type { InAppMessaging } from './types/in-app-messaging';
import type { InAppMessagingInternal, WithModularDeprecationArg } from './types/internal';

export type { Statics } from './types/in-app-messaging';

/**
 * Returns an In-App Messaging instance for the default app.
 */
export function getInAppMessaging(): InAppMessaging {
  return getApp().inAppMessaging() as InAppMessaging;
}

/**
 * Determines whether messages are suppressed or not.
 */
export function isMessagesDisplaySuppressed(inAppMessaging: InAppMessaging): boolean {
  return (inAppMessaging as InAppMessagingInternal).isMessagesDisplaySuppressed;
}

/**
 * Enable or disable suppression of Firebase In App Messaging messages.
 */
export function setMessagesDisplaySuppressed(
  inAppMessaging: InAppMessaging,
  enabled: boolean,
): Promise<null> {
  return (
    (inAppMessaging as InAppMessagingInternal).setMessagesDisplaySuppressed as WithModularDeprecationArg<
      InAppMessagingInternal['setMessagesDisplaySuppressed']
    >
  ).call(inAppMessaging, enabled, MODULAR_DEPRECATION_ARG);
}

/**
 * Determines whether automatic data collection is enabled or not.
 */
export function isAutomaticDataCollectionEnabled(inAppMessaging: InAppMessaging): boolean {
  return (inAppMessaging as InAppMessagingInternal).isAutomaticDataCollectionEnabled;
}

/**
 * Enable or disable automatic data collection for Firebase In-App Messaging.
 */
export function setAutomaticDataCollectionEnabled(
  inAppMessaging: InAppMessaging,
  enabled: boolean,
): Promise<null> {
  return (
    (inAppMessaging as InAppMessagingInternal).setAutomaticDataCollectionEnabled as WithModularDeprecationArg<
      InAppMessagingInternal['setAutomaticDataCollectionEnabled']
    >
  ).call(inAppMessaging, enabled, MODULAR_DEPRECATION_ARG);
}

/**
 * Trigger in-app messages programmatically
 */
export function triggerEvent(inAppMessaging: InAppMessaging, eventId: string): Promise<null> {
  return (
    (inAppMessaging as InAppMessagingInternal).triggerEvent as WithModularDeprecationArg<
      InAppMessagingInternal['triggerEvent']
    >
  ).call(inAppMessaging, eventId, MODULAR_DEPRECATION_ARG);
}
