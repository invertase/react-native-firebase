/**
 * Known differences between the firebase-js-sdk public API and
 * the @react-native-firebase/messaging modular API.
 *
 * Each entry must have a `name` and a `reason`. Undocumented drift fails CI.
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {},

  missingInRN: [
    { name: 'onRegistered', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/messaging.' },
    { name: 'onUnregistered', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/messaging.' },
    { name: 'register', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/messaging.' },
    { name: 'unregister', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/messaging.' },
    { name: 'MessagePayload', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/messaging.' },
    { name: 'NextFn', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/messaging.' },
    { name: 'NotificationPayload', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/messaging.' },
    { name: 'Observer', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/messaging.' },
    { name: 'RegisterOptions', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/messaging.' },
    { name: 'Unsubscribe', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/messaging.' },
  ],

  extraInRN: [
    { name: 'onNotificationOpenedApp', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'onTokenRefresh', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'requestPermission', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'isAutoInitEnabled', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'setAutoInitEnabled', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'getInitialNotification', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'getDidOpenSettingsForNotification', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'getIsHeadless', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'registerDeviceForRemoteMessages', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'isDeviceRegisteredForRemoteMessages', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'unregisterDeviceForRemoteMessages', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'getAPNSToken', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'setAPNSToken', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'hasPermission', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'onDeletedMessages', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'onMessageSent', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'onSendError', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'setBackgroundMessageHandler', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'setOpenSettingsForNotificationsHandler', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'sendMessage', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'subscribeToTopic', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'unsubscribeFromTopic', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'isDeliveryMetricsExportToBigQueryEnabled', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'isNotificationDelegationEnabled', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'setNotificationDelegationEnabled', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'experimentalSetDeliveryMetricsExportedToBigQueryEnabled', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'SDK_VERSION', reason: 'RN Firebase package version string exported from the modular entry point. The firebase-js-sdk does not export SDK_VERSION from @firebase/messaging.' },
    { name: 'AuthorizationStatus', reason: 'RN Firebase re-exports this Messaging constant enum from the modular entry point for convenience.' },
    { name: 'NotificationAndroidPriority', reason: 'RN Firebase re-exports this Messaging constant enum from the modular entry point for convenience.' },
    { name: 'NotificationAndroidVisibility', reason: 'RN Firebase re-exports this Messaging constant enum from the modular entry point for convenience.' },
    { name: 'RemoteMessage', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'MessagePriority', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'NativeTokenOptions', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'Notification', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'NotificationIOSCriticalSound', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'IOSPermissions', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
    { name: 'SendErrorEvent', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for messaging.' },
  ],

  differentShape: [
    { name: 'deleteToken', reason: 'Export shares a name with the firebase-js-sdk but has a different public shape in @react-native-firebase/messaging.' },
    { name: 'getToken', reason: 'Export shares a name with the firebase-js-sdk but has a different public shape in @react-native-firebase/messaging.' },
    { name: 'isSupported', reason: 'Export shares a name with the firebase-js-sdk but has a different public shape in @react-native-firebase/messaging.' },
    { name: 'onMessage', reason: 'Export shares a name with the firebase-js-sdk but has a different public shape in @react-native-firebase/messaging.' },
    { name: 'GetTokenOptions', reason: 'Export shares a name with the firebase-js-sdk but has a different public shape in @react-native-firebase/messaging.' },
    { name: 'Messaging', reason: 'RN Firebase extends the Messaging service interface with native FCM APIs (token lifecycle, permissions, background handlers) beyond the firebase-js-sdk web push surface.' },
  ],
};

export default config;
