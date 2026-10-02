import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  getMessaging,
  deleteToken,
  getToken,
  register,
  unregister,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  onRegistered,
  onUnregistered,
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
  isNotificationDelegationEnabled,
  isSupported,
  experimentalSetDeliveryMetricsExportedToBigQueryEnabled,
  setNotificationDelegationEnabled,
  AuthorizationStatus,
  NotificationAndroidPriority,
  NotificationAndroidVisibility,
} from '../lib';

import remoteMessageOptions from '../lib/remoteMessageOptions';
import { SharedEventEmitter } from '@react-native-firebase/app/dist/module/internal';

type MessagingInternals = ReturnType<typeof getMessaging> & {
  _nativeModule: Record<string, unknown>;
  _isInstallationIdEnabled: boolean;
  _cachedInstallationId: string | null;
  _isAutoInitEnabled: boolean;
  _isDeliveryMetricsExportToBigQueryEnabled: boolean;
  _isNotificationDelegationEnabled: boolean;
};

/**
 * Builds a fresh messaging module whose constructor sees the given native
 * `isInstallationIdEnabled` constant, so constructor-time wiring can be asserted per flag state.
 */
function createMessagingInstance(isInstallationIdEnabled: boolean): MessagingInternals {
  const existing = getMessaging() as MessagingInternals;
  const Base = existing.constructor as new (...args: unknown[]) => MessagingInternals;
  const native = { getConstants: () => ({ isInstallationIdEnabled }) };
  class FreshMessaging extends Base {}
  Object.defineProperty(FreshMessaging.prototype, 'native', { get: () => native });
  return new FreshMessaging(
    (existing as unknown as { _app: unknown })._app,
    (existing as unknown as { _config: unknown })._config,
    null,
  );
}

describe('remoteMessageOptions', function () {
  it('serializes array data values as JSON', function () {
    const options = remoteMessageOptions('sender-id', {
      data: {
        items: [{ id: 1 }, { id: 2 }],
      },
      fcmOptions: {},
    });

    expect(options.data.items).toBe('[{"id":1},{"id":2}]');
  });
});

describe('Messaging', function () {
  describe('modular', function () {
    let nativeOverrides: Record<string, ReturnType<typeof jest.fn>>;

    beforeEach(function () {
      nativeOverrides = {};
      (getMessaging() as MessagingInternals)._nativeModule = new Proxy(
        {},
        {
          get: (_target, property) =>
            nativeOverrides[String(property)] ??
            jest.fn().mockResolvedValue({
              result: true,
            } as never),
        },
      );
      const messaging = getMessaging() as MessagingInternals;
      messaging._isInstallationIdEnabled = false;
      messaging._cachedInstallationId = null;
    });

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

    it('`register` function is properly exposed to end user', function () {
      expect(register).toBeDefined();
    });

    it('`unregister` function is properly exposed to end user', function () {
      expect(unregister).toBeDefined();
    });

    it('`onRegistered` function is properly exposed to end user', function () {
      expect(onRegistered).toBeDefined();
    });

    it('`onUnregistered` function is properly exposed to end user', function () {
      expect(onUnregistered).toBeDefined();
    });

    describe('installation id mode gating', function () {
      it('rejects FID APIs when the flag is off', async function () {
        const messaging = getMessaging() as MessagingInternals;
        messaging._isInstallationIdEnabled = false;

        await expect(register(messaging)).rejects.toThrow(/installation-id-not-enabled/);
        await expect(unregister(messaging)).rejects.toThrow(/installation-id-not-enabled/);

        try {
          onRegistered(messaging, () => undefined);
          throw new Error('expected onRegistered to throw');
        } catch (e) {
          expect((e as { code?: string }).code).toBe('messaging/installation-id-not-enabled');
        }

        try {
          onUnregistered(messaging, () => undefined);
          throw new Error('expected onUnregistered to throw');
        } catch (e) {
          expect((e as { code?: string }).code).toBe('messaging/installation-id-not-enabled');
        }
      });

      it('rejects token APIs when the flag is on', async function () {
        const messaging = getMessaging() as MessagingInternals;
        messaging._isInstallationIdEnabled = true;

        await expect(getToken(messaging)).rejects.toThrow(/token-api-disabled/);
        await expect(deleteToken(messaging)).rejects.toThrow(/token-api-disabled/);

        try {
          onTokenRefresh(messaging, () => undefined);
          throw new Error('expected onTokenRefresh to throw');
        } catch (e) {
          expect((e as { code?: string }).code).toBe('messaging/token-api-disabled');
        }
      });

      it('keeps getToken and deleteToken calling native when the flag is off', async function () {
        const messaging = getMessaging() as MessagingInternals;
        expect(messaging._isInstallationIdEnabled).toBe(false);
        const getTokenNative = jest.fn().mockResolvedValue('fcm-token' as never);
        const deleteTokenNative = jest.fn().mockResolvedValue(undefined as never);
        nativeOverrides.getToken = getTokenNative;
        nativeOverrides.deleteToken = deleteTokenNative;

        await expect(getToken(messaging, { appName: 'app', senderId: 'sender' })).resolves.toBe(
          'fcm-token',
        );
        await expect(
          deleteToken(messaging, { appName: 'app', senderId: 'sender' }),
        ).resolves.toBeUndefined();

        expect(getTokenNative).toHaveBeenCalledWith('app', 'sender');
        expect(deleteTokenNative).toHaveBeenCalledWith('app', 'sender');
      });

      it('keeps onTokenRefresh subscribing when the flag is off', function () {
        const messaging = getMessaging() as MessagingInternals;
        expect(messaging._isInstallationIdEnabled).toBe(false);

        const listener = jest.fn();
        let unsubscribe: (() => void) | undefined;
        expect(() => {
          unsubscribe = onTokenRefresh(messaging, listener);
        }).not.toThrow();

        SharedEventEmitter.emit('messaging_token_refresh', { token: 'fcm-token-2' });
        expect(listener).toHaveBeenCalledWith('fcm-token-2');

        unsubscribe?.();
        SharedEventEmitter.emit('messaging_token_refresh', { token: 'fcm-token-3' });
        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('calls native register/unregister when the flag is on', async function () {
        const messaging = getMessaging() as MessagingInternals;
        messaging._isInstallationIdEnabled = true;
        const registerNative = jest.fn().mockResolvedValue(undefined as never);
        const unregisterNative = jest.fn().mockResolvedValue(undefined as never);
        nativeOverrides.register = registerNative;
        nativeOverrides.unregister = unregisterNative;

        await register(messaging, { vapidKey: 'ignored-on-native' });
        await unregister(messaging);

        expect(registerNative).toHaveBeenCalledTimes(1);
        expect(unregisterNative).toHaveBeenCalledTimes(1);
      });

      it('replays the cached installation id to a late onRegistered subscriber', function () {
        const messaging = createMessagingInstance(true);
        SharedEventEmitter.emit('messaging_registered', { installationId: 'fid-cached' });

        const listener = jest.fn();
        const unsubscribe = onRegistered(messaging, listener);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith('fid-cached');

        SharedEventEmitter.emit('messaging_registered', { installationId: 'fid-rotated' });
        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith('fid-rotated');
        expect(messaging._cachedInstallationId).toBe('fid-rotated');

        unsubscribe();
      });

      it('does not replay onRegistered before any registration', function () {
        const messaging = createMessagingInstance(true);

        const listener = jest.fn();
        const unsubscribe = onRegistered(messaging, listener);
        expect(listener).not.toHaveBeenCalled();

        unsubscribe();
      });

      it('registers the onRegistered subscription before replaying the cached id', function () {
        const messaging = createMessagingInstance(true);
        SharedEventEmitter.emit('messaging_registered', { installationId: 'fid-cached' });

        const addListener = jest.spyOn(SharedEventEmitter, 'addListener');
        const subscribedAtReplay: boolean[] = [];
        const listener = jest.fn(() => {
          subscribedAtReplay.push(
            addListener.mock.calls.some(call => call[0] === 'messaging_registered'),
          );
        });

        try {
          const unsubscribe = onRegistered(messaging, listener);
          expect(listener).toHaveBeenCalledTimes(1);
          expect(subscribedAtReplay).toEqual([true]);
          unsubscribe();
        } finally {
          addListener.mockRestore();
        }
      });

      it('keeps the onRegistered subscription and unsubscribe handle when the replay callback throws', function () {
        jest.useFakeTimers();
        try {
          const messaging = createMessagingInstance(true);
          SharedEventEmitter.emit('messaging_registered', { installationId: 'fid-cached' });

          const replayError = new Error('replay callback failed');
          const listener = jest
            .fn<(installationId: string) => void>()
            .mockImplementationOnce(() => {
              throw replayError;
            });

          let unsubscribe: (() => void) | undefined;
          expect(() => {
            unsubscribe = onRegistered(messaging, listener);
          }).not.toThrow();
          expect(unsubscribe).toBeInstanceOf(Function);
          expect(listener).toHaveBeenCalledTimes(1);

          // The replay error is surfaced asynchronously rather than swallowed.
          expect(() => jest.runAllTimers()).toThrow(replayError);

          // The subscription stayed valid: later events still reach the callback.
          SharedEventEmitter.emit('messaging_registered', { installationId: 'fid-rotated' });
          expect(listener).toHaveBeenCalledTimes(2);
          expect(listener).toHaveBeenLastCalledWith('fid-rotated');

          // And the returned handle still unsubscribes.
          unsubscribe?.();
          SharedEventEmitter.emit('messaging_registered', { installationId: 'fid-after' });
          expect(listener).toHaveBeenCalledTimes(2);
        } finally {
          jest.useRealTimers();
        }
      });

      it('does not replay onUnregistered to a late subscriber and clears the cache', function () {
        const messaging = createMessagingInstance(true);
        SharedEventEmitter.emit('messaging_registered', { installationId: 'fid-active' });
        expect(messaging._cachedInstallationId).toBe('fid-active');

        SharedEventEmitter.emit('messaging_unregistered', { installationId: 'fid-active' });
        expect(messaging._cachedInstallationId).toBe(null);

        const listener = jest.fn();
        const unsubscribe = onUnregistered(messaging, listener);
        expect(listener).not.toHaveBeenCalled();

        SharedEventEmitter.emit('messaging_unregistered', { installationId: 'fid-again' });
        expect(listener).toHaveBeenCalledWith('fid-again');
        unsubscribe();
      });

      it('only subscribes to the FID cache events when the flag is on', function () {
        const addListener = jest.spyOn(SharedEventEmitter, 'addListener');
        const fidEvents = () =>
          addListener.mock.calls
            .map(call => call[0])
            .filter(name => name === 'messaging_registered' || name === 'messaging_unregistered');

        try {
          createMessagingInstance(false);
          expect(fidEvents()).toEqual([]);

          createMessagingInstance(true);
          expect(fidEvents()).toEqual(['messaging_registered', 'messaging_unregistered']);
        } finally {
          addListener.mockRestore();
        }
      });

      it('does not cache the installation id when the flag is off', function () {
        const messaging = createMessagingInstance(false);

        SharedEventEmitter.emit('messaging_registered', { installationId: 'fid-ignored' });

        expect(messaging._cachedInstallationId).toBe(null);
      });

      it('throws when onRegistered/onUnregistered get neither a function nor an Observer', function () {
        const messaging = getMessaging() as MessagingInternals;
        messaging._isInstallationIdEnabled = true;

        expect(() => onRegistered(messaging, 'nope' as never)).toThrow(
          "getMessaging().onRegistered(*) 'nextOrObserver' expected a function or Observer.",
        );
        expect(() => onUnregistered(messaging, 'nope' as never)).toThrow(
          "getMessaging().onUnregistered(*) 'nextOrObserver' expected a function or Observer.",
        );
      });

      it('supports Observer next for onRegistered', function () {
        const messaging = getMessaging() as MessagingInternals;
        messaging._isInstallationIdEnabled = true;
        messaging._cachedInstallationId = 'fid-observer';

        const next = jest.fn();
        const unsubscribe = onRegistered(messaging, {
          next,
          error: () => undefined,
          complete: () => undefined,
        });

        expect(next).toHaveBeenCalledWith('fid-observer');
        unsubscribe();
      });
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

    it('`onMessageSent` passes the sent message ID to its listener', function () {
      const listener = jest.fn();
      const unsubscribe = onMessageSent(getMessaging(), listener);

      SharedEventEmitter.emit('messaging_message_sent', { messageId: 'message-id' });

      expect(listener).toHaveBeenCalledWith('message-id');
      unsubscribe();
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

    describe('cached native settings', function () {
      function mockNativeRejection(method: string, error: Error) {
        nativeOverrides[method] = jest.fn().mockRejectedValue(error as never);
      }

      it('preserves auto-init state when the native update rejects', async function () {
        const messaging = getMessaging() as MessagingInternals;
        const error = new Error('native update failed');
        messaging._isAutoInitEnabled = false;
        mockNativeRejection('setAutoInitEnabled', error);

        await expect(setAutoInitEnabled(messaging, true)).rejects.toBe(error);
        expect(isAutoInitEnabled(messaging)).toBe(false);
      });

      it('preserves delivery-metrics state when the native update rejects', async function () {
        const messaging = getMessaging() as MessagingInternals;
        const error = new Error('native update failed');
        messaging._isDeliveryMetricsExportToBigQueryEnabled = false;
        mockNativeRejection('setDeliveryMetricsExportToBigQuery', error);

        await expect(
          experimentalSetDeliveryMetricsExportedToBigQueryEnabled(messaging, true),
        ).rejects.toBe(error);
        expect(isDeliveryMetricsExportToBigQueryEnabled(messaging)).toBe(false);
      });

      it('preserves notification-delegation state when the native update rejects', async function () {
        const messaging = getMessaging() as MessagingInternals;
        const error = new Error('native update failed');
        messaging._isNotificationDelegationEnabled = false;
        mockNativeRejection('setNotificationDelegationEnabled', error);

        await expect(setNotificationDelegationEnabled(messaging, true)).rejects.toBe(error);
        expect(isNotificationDelegationEnabled(messaging)).toBe(false);
      });
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
