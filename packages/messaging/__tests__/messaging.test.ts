import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock getFirebaseRoot before any imports that use it
jest.mock('@react-native-firebase/app/lib/internal', () => {
  const actual = jest.requireActual('@react-native-firebase/app/lib/internal');
  return Object.assign({}, actual, {
    getFirebaseRoot: jest.fn(() => ({
      utils: jest.fn(() => ({
        playServicesAvailability: {
          isAvailable: true,
          status: 0,
          hasResolution: false,
          isUserResolvableError: false,
          error: undefined,
        },
      })),
    })),
  });
});

import messaging, {
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

import {
  createCheckV9Deprecation,
  CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

describe('Messaging', function () {
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

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    let messagingV9Deprecation: CheckV9DeprecationFunction;
    let staticsV9Deprecation: CheckV9DeprecationFunction;

    beforeEach(function () {
      messagingV9Deprecation = createCheckV9Deprecation(['messaging']);
      staticsV9Deprecation = createCheckV9Deprecation(['messaging', 'statics']);

      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: () =>
              jest.fn().mockResolvedValue({
                result: true,
              } as never),
          },
        );
      });
    });

    describe('Messaging', function () {
      it('isAutoInitEnabled', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => isAutoInitEnabled(messaging),
          () => messaging.isAutoInitEnabled,
          'isAutoInitEnabled',
        );
      });

      it('isDeviceRegisteredForRemoteMessages', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => isDeviceRegisteredForRemoteMessages(messaging),
          () => messaging.isDeviceRegisteredForRemoteMessages,
          'isDeviceRegisteredForRemoteMessages',
        );
      });

      it('setAutoInitEnabled', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => setAutoInitEnabled(messaging, true),
          () => messaging.setAutoInitEnabled(true),
          'setAutoInitEnabled',
        );
      });

      it('getInitialNotification', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => getInitialNotification(messaging),
          () => messaging.getInitialNotification(),
          'getInitialNotification',
        );
      });

      it('getDidOpenSettingsForNotification', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => getDidOpenSettingsForNotification(messaging),
          () => messaging.getDidOpenSettingsForNotification(),
          'getDidOpenSettingsForNotification',
        );
      });

      it('getIsHeadless', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => getIsHeadless(messaging),
          () => messaging.getIsHeadless(),
          'getIsHeadless',
        );
      });

      it('requestPermission', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => requestPermission(messaging),
          () => messaging.requestPermission(),
          'requestPermission',
        );
      });

      it('registerDeviceForRemoteMessages', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => registerDeviceForRemoteMessages(messaging),
          () => messaging.registerDeviceForRemoteMessages(),
          'registerDeviceForRemoteMessages',
        );
      });

      it('unregisterDeviceForRemoteMessages', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => unregisterDeviceForRemoteMessages(messaging),
          () => messaging.unregisterDeviceForRemoteMessages(),
          'unregisterDeviceForRemoteMessages',
        );
      });

      it('getAPNSToken', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => getAPNSToken(messaging),
          () => messaging.getAPNSToken(),
          'getAPNSToken',
        );
      });

      it('setAPNSToken', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => setAPNSToken(messaging, 'token'),
          () => messaging.setAPNSToken('token'),
          'setAPNSToken',
        );
      });

      it('hasPermission', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => hasPermission(messaging),
          () => messaging.hasPermission(),
          'hasPermission',
        );
      });

      it('subscribeToTopic', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => subscribeToTopic(messaging, 'topic'),
          () => messaging.subscribeToTopic('topic'),
          'subscribeToTopic',
        );
      });

      it('unsubscribeFromTopic', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => unsubscribeFromTopic(messaging, 'topic'),
          () => messaging.unsubscribeFromTopic('topic'),
          'unsubscribeFromTopic',
        );
      });

      it('getToken', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => getToken(messaging),
          () => messaging.getToken(),
          'getToken',
        );
      });

      it('deleteToken', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => deleteToken(messaging),
          () => messaging.deleteToken(),
          'deleteToken',
        );
      });

      it('isSupported', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => isSupported(messaging),
          () => messaging.isSupported(),
          'isSupported',
        );
      });

      it('experimentalSetDeliveryMetricsExportedToBigQueryEnabled', function () {
        const messaging = getMessaging();
        messagingV9Deprecation(
          () => experimentalSetDeliveryMetricsExportedToBigQueryEnabled(messaging, true),
          () => messaging.setDeliveryMetricsExportToBigQuery(true),
          'setDeliveryMetricsExportToBigQuery',
        );
      });

      describe('statics', function () {
        it('AuthorizationStatus', function () {
          staticsV9Deprecation(
            () => AuthorizationStatus,
            () => messaging.AuthorizationStatus,
            'AuthorizationStatus',
          );
        });

        it('NotificationAndroidPriority', function () {
          staticsV9Deprecation(
            () => NotificationAndroidPriority,
            () => messaging.NotificationAndroidPriority,
            'NotificationAndroidPriority',
          );
        });

        it('NotificationAndroidVisibility', function () {
          staticsV9Deprecation(
            () => NotificationAndroidVisibility,
            () => messaging.NotificationAndroidVisibility,
            'NotificationAndroidVisibility',
          );
        });
      });
    });
  });
});
