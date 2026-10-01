import { useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  AuthorizationStatus,
  NotificationAndroidPriority,
  NotificationAndroidVisibility,
  SDK_VERSION,
  deleteToken,
  experimentalSetDeliveryMetricsExportedToBigQueryEnabled,
  getAPNSToken,
  getDidOpenSettingsForNotification,
  getInitialNotification,
  getIsHeadless,
  getMessaging,
  getToken,
  hasPermission,
  isAutoInitEnabled,
  isDeliveryMetricsExportToBigQueryEnabled,
  isDeviceRegisteredForRemoteMessages,
  isNotificationDelegationEnabled,
  isSupported,
  onDeletedMessages,
  onMessage,
  onMessageSent,
  onNotificationOpenedApp,
  onSendError,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
  sendMessage,
  setAPNSToken,
  setAutoInitEnabled,
  setBackgroundMessageHandler,
  setNotificationDelegationEnabled,
  setOpenSettingsForNotificationsHandler,
  subscribeToTopic,
  unregisterDeviceForRemoteMessages,
  unsubscribeFromTopic,
} from '@react-native-firebase/messaging';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { TextField } from '../src/TextField';
import { theme } from '../src/theme';

const DEMO_TOPIC = 'expo-messaging-demo';

export default function MessagingScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apnsTokenInput, setApnsTokenInput] = useState('');
  const unsubscribers = useRef<Array<() => void>>([]);

  async function run(label: string, action: () => unknown | Promise<unknown>) {
    setResult(null);
    setError(null);
    try {
      const value = await action();
      const text =
        value === undefined
          ? `${label}: ok`
          : typeof value === 'string'
            ? `${label}: ${value}`
            : `${label}: ${JSON.stringify(value)}`;
      setResult(text);
    } catch (e) {
      setError(`${label}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  function trackUnsubscribe(unsubscribe: () => void) {
    unsubscribers.current.push(unsubscribe);
  }

  return (
    <ScreenChrome title="messaging" result={result} error={error}>
      <Text style={styles.hint}>
        Exercises modular `@react-native-firebase/messaging` APIs from the usage docs. Push delivery
        needs a physical device (and iOS APNs setup). There is no Messaging emulator.
      </Text>

      <Text style={styles.section}>Package / support</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getMessaging"
        onPress={() =>
          run('getMessaging', () => {
            const messaging = getMessaging();
            return { appName: messaging.app.name };
          })
        }
      />
      <AppButton
        title="isSupported"
        onPress={() => run('isSupported', () => isSupported(getMessaging()))}
      />

      <Text style={styles.section}>Tokens</Text>
      <AppButton title="getToken" onPress={() => run('getToken', () => getToken(getMessaging()))} />
      <AppButton
        title="onTokenRefresh (install)"
        onPress={() =>
          run('onTokenRefresh', () => {
            const unsubscribe = onTokenRefresh(getMessaging(), () => {
              // Token refresh events arrive asynchronously; inspect device logs if needed.
            });
            trackUnsubscribe(unsubscribe);
            return 'listener installed';
          })
        }
      />
      <View style={styles.warnBlock}>
        <AppButton
          title="deleteToken"
          variant="secondary"
          onPress={() => run('deleteToken', () => deleteToken(getMessaging()))}
        />
        <Text style={styles.warnText}>
          Warning: invalidates the current FCM token immediately and permanently. Call getToken
          afterwards to get a new one.
        </Text>
      </View>

      <Text style={styles.section}>Permissions (deprecated)</Text>
      <View style={styles.warnBlock}>
        <AppButton
          title="requestPermission"
          variant="secondary"
          onPress={() => run('requestPermission', () => requestPermission(getMessaging()))}
        />
        <Text style={styles.warnText}>
          Warning: deprecated. On iOS this shows the system permission dialog once. On Android it
          resolves AUTHORIZED (1) without showing a dialog.
        </Text>
      </View>
      <AppButton
        title="hasPermission"
        onPress={() => run('hasPermission', () => hasPermission(getMessaging()))}
      />
      <AppButton
        title="AuthorizationStatus"
        onPress={() =>
          run('AuthorizationStatus', () => ({
            NOT_DETERMINED: AuthorizationStatus.NOT_DETERMINED,
            DENIED: AuthorizationStatus.DENIED,
            AUTHORIZED: AuthorizationStatus.AUTHORIZED,
            PROVISIONAL: AuthorizationStatus.PROVISIONAL,
            EPHEMERAL: AuthorizationStatus.EPHEMERAL,
          }))
        }
      />

      <Text style={styles.section}>Message handlers</Text>
      <AppButton
        title="onMessage (install)"
        onPress={() =>
          run('onMessage', () => {
            const unsubscribe = onMessage(getMessaging(), () => {
              // Foreground messages arrive asynchronously after install.
            });
            trackUnsubscribe(unsubscribe);
            return 'listener installed';
          })
        }
      />
      <View style={styles.warnBlock}>
        <AppButton
          title="onDeletedMessages (install)"
          variant="secondary"
          onPress={() =>
            run('onDeletedMessages', () => {
              const unsubscribe = onDeletedMessages(getMessaging(), () => {
                // Fired when FCM deletes pending messages for this instance.
              });
              trackUnsubscribe(unsubscribe);
              return 'listener installed';
            })
          }
        />
        <Text style={styles.warnText}>Warning: Android only. The listener never fires on iOS.</Text>
      </View>
      <View style={styles.warnBlock}>
        <AppButton
          title="setBackgroundMessageHandler"
          variant="secondary"
          onPress={() =>
            run('setBackgroundMessageHandler', () => {
              setBackgroundMessageHandler(getMessaging(), async () => {
                // Prefer registering this in the app entry file in production.
              });
              return 'handler registered (prefer entry file in production)';
            })
          }
        />
        <Text style={styles.warnText}>
          Warning: registering here replaces any handler set in the entry file. In an app, register
          it in the entry file before AppRegistry.registerComponent.
        </Text>
      </View>
      <View style={styles.warnBlock}>
        <AppButton
          title="getIsHeadless"
          variant="secondary"
          onPress={() => run('getIsHeadless', () => getIsHeadless(getMessaging()))}
        />
        <Text style={styles.warnText}>Android always resolves false. Meaningful on iOS only.</Text>
      </View>

      <Text style={styles.section}>Notification interaction</Text>
      <Text style={styles.hint}>
        Tap a delivered notification, then open or return to the app. getInitialNotification covers
        a launch from a quit state; on Android a given notification is returned once, so a second
        call resolves null.
      </Text>
      <AppButton
        title="getInitialNotification"
        onPress={() => run('getInitialNotification', () => getInitialNotification(getMessaging()))}
      />
      <AppButton
        title="onNotificationOpenedApp (install)"
        onPress={() =>
          run('onNotificationOpenedApp', () => {
            const unsubscribe = onNotificationOpenedApp(getMessaging(), () => {
              // Fired when a notification tap brings the app from the background.
            });
            trackUnsubscribe(unsubscribe);
            return 'listener installed';
          })
        }
      />
      <AppButton
        title="getDidOpenSettingsForNotification"
        onPress={() =>
          run('getDidOpenSettingsForNotification', () =>
            getDidOpenSettingsForNotification(getMessaging()),
          )
        }
      />
      <View style={styles.warnBlock}>
        <AppButton
          title="setOpenSettingsForNotificationsHandler"
          variant="secondary"
          onPress={() =>
            run('setOpenSettingsForNotificationsHandler', () => {
              setOpenSettingsForNotificationsHandler(getMessaging(), async () => {
                // Fired when the app is opened from the iOS notification settings button.
              });
              return 'handler registered';
            })
          }
        />
        <Text style={styles.warnText}>
          Warning: iOS only. The handler is never called on Android. In an app, register it in the
          entry file before AppRegistry.registerComponent.
        </Text>
      </View>
      <AppButton
        title="Remove installed listeners"
        variant="secondary"
        onPress={() =>
          run('Remove installed listeners', () => {
            const count = unsubscribers.current.length;
            unsubscribers.current.forEach(unsubscribe => unsubscribe());
            unsubscribers.current = [];
            return `removed ${count}`;
          })
        }
      />

      <Text style={styles.section}>Device-to-device XMPP (Android)</Text>
      <Text style={styles.hint}>
        Needs a custom XMPP bridge (see Messaging with XMPP docs). sendMessage is Android only and
        throws in JS on iOS.
      </Text>
      <AppButton
        title="onMessageSent (install)"
        onPress={() =>
          run('onMessageSent', () => {
            const unsubscribe = onMessageSent(getMessaging(), () => {
              // Fired when an upstream sendMessage completes.
            });
            trackUnsubscribe(unsubscribe);
            return 'listener installed';
          })
        }
      />
      <AppButton
        title="onSendError (install)"
        onPress={() =>
          run('onSendError', () => {
            const unsubscribe = onSendError(getMessaging(), () => {
              // Fired when an upstream sendMessage fails.
            });
            trackUnsubscribe(unsubscribe);
            return 'listener installed';
          })
        }
      />
      <View style={styles.warnBlock}>
        <AppButton
          title="sendMessage"
          variant="secondary"
          onPress={() =>
            run('sendMessage', () =>
              sendMessage(getMessaging(), {
                data: { foo: 'bar' },
              }),
            )
          }
        />
        <Text style={styles.warnText}>
          Warning: Android only; requires an XMPP/device-to-device bridge. On iOS this throws in
          JavaScript before any native call.
        </Text>
      </View>

      <Text style={styles.section}>Topics</Text>
      <AppButton
        title={`subscribeToTopic (${DEMO_TOPIC})`}
        onPress={() => run('subscribeToTopic', () => subscribeToTopic(getMessaging(), DEMO_TOPIC))}
      />
      <AppButton
        title={`unsubscribeFromTopic (${DEMO_TOPIC})`}
        onPress={() =>
          run('unsubscribeFromTopic', () => unsubscribeFromTopic(getMessaging(), DEMO_TOPIC))
        }
      />

      <Text style={styles.section}>Device registration</Text>
      <View style={styles.warnBlock}>
        <AppButton
          title="registerDeviceForRemoteMessages"
          variant="secondary"
          onPress={() =>
            run('registerDeviceForRemoteMessages', () =>
              registerDeviceForRemoteMessages(getMessaging()),
            )
          }
        />
        <Text style={styles.warnText}>
          Warning: iOS only, a no-op on Android. Only needed when auto-registration is disabled in
          firebase.json (otherwise it logs a warning). On the ARM64 iOS Simulator it can reject with
          messaging/registration-timeout.
        </Text>
      </View>
      <AppButton
        title="isDeviceRegisteredForRemoteMessages"
        onPress={() =>
          run('isDeviceRegisteredForRemoteMessages', () =>
            isDeviceRegisteredForRemoteMessages(getMessaging()),
          )
        }
      />
      <View style={styles.warnBlock}>
        <AppButton
          title="unregisterDeviceForRemoteMessages"
          variant="secondary"
          onPress={() =>
            run('unregisterDeviceForRemoteMessages', () =>
              unregisterDeviceForRemoteMessages(getMessaging()),
            )
          }
        />
        <Text style={styles.warnText}>
          Warning: iOS only, a no-op on Android. After this the device stops receiving remote
          notifications until it registers again.
        </Text>
      </View>

      <Text style={styles.section}>APNs (iOS)</Text>
      <View style={styles.warnBlock}>
        <AppButton
          title="getAPNSToken"
          variant="secondary"
          onPress={() => run('getAPNSToken', () => getAPNSToken(getMessaging()))}
        />
        <Text style={styles.warnText}>
          Resolves null on Android. On iOS it rejects with messaging/unregistered when the app is
          not registered for remote notifications.
        </Text>
      </View>
      <Text style={styles.hint}>APNs token hex for setAPNSToken</Text>
      <TextField
        placeholder="APNs device token hex"
        value={apnsTokenInput}
        onChangeText={setApnsTokenInput}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.warnBlock}>
        <AppButton
          title="setAPNSToken"
          variant="secondary"
          onPress={() =>
            run('setAPNSToken', async () => {
              if (Platform.OS !== 'ios') {
                throw new Error('setAPNSToken is iOS only');
              }
              if (!apnsTokenInput.trim()) {
                throw new Error('Enter an APNs token hex string first');
              }
              await setAPNSToken(getMessaging(), apnsTokenInput.trim(), 'unknown');
              return 'set';
            })
          }
        />
        <Text style={styles.warnText}>
          Warning: only call with a real APNs device token from your AppDelegate / push pipeline.
        </Text>
      </View>

      <Text style={styles.section}>Auto-init</Text>
      <AppButton
        title="isAutoInitEnabled"
        onPress={() => run('isAutoInitEnabled', () => isAutoInitEnabled(getMessaging()))}
      />
      <AppButton
        title="setAutoInitEnabled(true)"
        onPress={() => run('setAutoInitEnabled', () => setAutoInitEnabled(getMessaging(), true))}
      />

      <Text style={styles.section}>Notification delegation (Android)</Text>
      <AppButton
        title="isNotificationDelegationEnabled"
        onPress={() =>
          run('isNotificationDelegationEnabled', () =>
            isNotificationDelegationEnabled(getMessaging()),
          )
        }
      />
      <View style={styles.warnBlock}>
        <AppButton
          title="setNotificationDelegationEnabled(false)"
          variant="secondary"
          onPress={() =>
            run('setNotificationDelegationEnabled', () =>
              setNotificationDelegationEnabled(getMessaging(), false),
            )
          }
        />
        <Text style={styles.warnText}>
          Warning: Android only, a no-op on iOS. Changes the FCM notification delegation setting
          until it is set again.
        </Text>
      </View>

      <Text style={styles.section}>Delivery metrics (BigQuery)</Text>
      <AppButton
        title="isDeliveryMetricsExportToBigQueryEnabled"
        onPress={() =>
          run('isDeliveryMetricsExportToBigQueryEnabled', () =>
            isDeliveryMetricsExportToBigQueryEnabled(getMessaging()),
          )
        }
      />
      <View style={styles.warnBlock}>
        <AppButton
          title="experimentalSetDeliveryMetricsExportedToBigQueryEnabled(false)"
          variant="secondary"
          onPress={() =>
            run('experimentalSetDeliveryMetricsExportedToBigQueryEnabled', () =>
              experimentalSetDeliveryMetricsExportedToBigQueryEnabled(getMessaging(), false),
            )
          }
        />
        <Text style={styles.warnText}>
          Warning: experimental. Changes whether delivery metrics are exported to BigQuery for this
          app instance. Export needs the FCM to BigQuery link in the Firebase console.
        </Text>
      </View>

      <Text style={styles.section}>Payload constants</Text>
      <AppButton
        title="NotificationAndroidPriority"
        onPress={() =>
          run('NotificationAndroidPriority', () => ({
            PRIORITY_HIGH: NotificationAndroidPriority.PRIORITY_HIGH,
            PRIORITY_MAX: NotificationAndroidPriority.PRIORITY_MAX,
          }))
        }
      />
      <AppButton
        title="NotificationAndroidVisibility"
        onPress={() =>
          run('NotificationAndroidVisibility', () => ({
            VISIBILITY_PRIVATE: NotificationAndroidVisibility.VISIBILITY_PRIVATE,
            VISIBILITY_PUBLIC: NotificationAndroidVisibility.VISIBILITY_PUBLIC,
          }))
        }
      />
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  hint: { color: theme.subtleText, fontSize: 13, lineHeight: 18 },
  section: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  warnBlock: { gap: 6 },
  warnText: { color: theme.error, fontSize: 13, lineHeight: 18 },
});
