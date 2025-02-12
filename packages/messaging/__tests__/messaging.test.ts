import { describe, expect, it } from '@jest/globals';

import {
  getMessaging,
  deleteToken,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
  isAutoInitEnabled,
  setAutoInitEnabled,
  getInitialNotification,
  getDidOpenSettingsForNotification,
  getIsHeadless,
  registerDeviceForRemoteMessages,
  isDeviceRegisteredForRemoteMessages,
  unregisterDeviceForRemoteMessages,
  getAPNSToken,
  setAPNSToken,
  hasPermission,
  onDeletedMessages,
  onMessageSent,
  onSendError,
  setBackgroundMessageHandler,
  setOpenSettingsForNotificationsHandler,
  sendMessage,
  subscribeToTopic,
  unsubscribeFromTopic,
  isDeliveryMetricsExportToBigQueryEnabled,
  isSupported,
  experimentalSetDeliveryMetricsExportedToBigQueryEnabled,
  AuthorizationStatus,
  NotificationAndroidPriority,
  NotificationAndroidVisibility,
} from '../lib';

describe('Firestore', function () {
  describe('modular', function () {
    it('`getMessaging` function is properly exposed to end user', function () {
      expect(getMessaging).toBeDefined();
    });

    it('`deleteToken` function is properly exposed to end user', function () {
      expect(deleteToken).toBeDefined();
    });

    it('`getToken` function is properly exposed to end user', function () {
      expect(getToken).toBeDefined();
    });

    it('`onMessage` function is properly exposed to end user', function () {
      expect(onMessage).toBeDefined();
    });

    it('`onNotificationOpenedApp` function is properly exposed to end user', function () {
      expect(onNotificationOpenedApp).toBeDefined();
    });

    it('`onTokenRefresh` function is properly exposed to end user', function () {
      expect(onTokenRefresh).toBeDefined();
    });

    it('`requestPermission` function is properly exposed to end user', function () {
      expect(requestPermission).toBeDefined();
    });

    it('`isAutoInitEnabled` function is properly exposed to end user', function () {
      expect(isAutoInitEnabled).toBeDefined();
    });

    it('`setAutoInitEnabled` function is properly exposed to end user', function () {
      expect(setAutoInitEnabled).toBeDefined();
    });

    it('`getInitialNotification` function is properly exposed to end user', function () {
      expect(getInitialNotification).toBeDefined();
    });

    it('`getDidOpenSettingsForNotification` function is properly exposed to end user', function () {
      expect(getDidOpenSettingsForNotification).toBeDefined();
    });

    it('`getIsHeadless` function is properly exposed to end user', function () {
      expect(getIsHeadless).toBeDefined();
    });

    it('`registerDeviceForRemoteMessages` function is properly exposed to end user', function () {
      expect(registerDeviceForRemoteMessages).toBeDefined();
    });

    it('`isDeviceRegisteredForRemoteMessages` function is properly exposed to end user', function () {
      expect(isDeviceRegisteredForRemoteMessages).toBeDefined();
    });

    it('`unregisterDeviceForRemoteMessages` function is properly exposed to end user', function () {
      expect(unregisterDeviceForRemoteMessages).toBeDefined();
    });

    it('`getAPNSToken` function is properly exposed to end user', function () {
      expect(getAPNSToken).toBeDefined();
    });

    it('`setAPNSToken` function is properly exposed to end user', function () {
      expect(setAPNSToken).toBeDefined();
    });

    it('`hasPermission` function is properly exposed to end user', function () {
      expect(hasPermission).toBeDefined();
    });

    it('`onDeletedMessages` function is properly exposed to end user', function () {
      expect(onDeletedMessages).toBeDefined();
    });

    it('`onMessageSent` function is properly exposed to end user', function () {
      expect(onMessageSent).toBeDefined();
    });

    it('`onSendError` function is properly exposed to end user', function () {
      expect(onSendError).toBeDefined();
    });

    it('`setBackgroundMessageHandler` function is properly exposed to end user', function () {
      expect(setBackgroundMessageHandler).toBeDefined();
    });

    it('`setOpenSettingsForNotificationsHandler` function is properly exposed to end user', function () {
      expect(setOpenSettingsForNotificationsHandler).toBeDefined();
    });

    it('`sendMessage` function is properly exposed to end user', function () {
      expect(sendMessage).toBeDefined();
    });

    it('`subscribeToTopic` function is properly exposed to end user', function () {
      expect(subscribeToTopic).toBeDefined();
    });

    it('`unsubscribeFromTopic` function is properly exposed to end user', function () {
      expect(unsubscribeFromTopic).toBeDefined();
    });

    it('`isDeliveryMetricsExportToBigQueryEnabled` function is properly exposed to end user', function () {
      expect(isDeliveryMetricsExportToBigQueryEnabled).toBeDefined();
    });

    it('`isSupported` function is properly exposed to end user', function () {
      expect(isSupported).toBeDefined();
    });

    it('`experimentalSetDeliveryMetricsExportedToBigQueryEnabled` function is properly exposed to end user', function () {
      expect(experimentalSetDeliveryMetricsExportedToBigQueryEnabled).toBeDefined();
    });

    it('`AuthorizationStatus` static is exposed to end user', function () {
      expect(AuthorizationStatus.AUTHORIZED).toBeDefined();
      expect(AuthorizationStatus.DENIED).toBeDefined();
      expect(AuthorizationStatus.EPHEMERAL).toBeDefined();
      expect(AuthorizationStatus.NOT_DETERMINED).toBeDefined();
      expect(AuthorizationStatus.PROVISIONAL).toBeDefined();
    });

    it('`NotificationAndroidPriority` static is exposed to end user', function () {
      expect(NotificationAndroidPriority.PRIORITY_DEFAULT).toBeDefined();
      expect(NotificationAndroidPriority.PRIORITY_HIGH).toBeDefined();
      expect(NotificationAndroidPriority.PRIORITY_LOW).toBeDefined();
      expect(NotificationAndroidPriority.PRIORITY_MAX).toBeDefined();
      expect(NotificationAndroidPriority.PRIORITY_MIN).toBeDefined();
    });

    it('`NotificationAndroidVisibility` static is exposed to end user', function () {
      expect(NotificationAndroidVisibility.VISIBILITY_PRIVATE).toBeDefined();
      expect(NotificationAndroidVisibility.VISIBILITY_PUBLIC).toBeDefined();
      expect(NotificationAndroidVisibility.VISIBILITY_SECRET).toBeDefined();
    });
  });
});
