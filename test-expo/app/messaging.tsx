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
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
  setAPNSToken,
  setAutoInitEnabled,
  setBackgroundMessageHandler,
  setNotificationDelegationEnabled,
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
      <AppButton
        title="deleteToken"
        onPress={() => run('deleteToken', () => deleteToken(getMessaging()))}
      />

      <Text style={styles.section}>Permissions (deprecated)</Text>
      <AppButton
        title="requestPermission"
        onPress={() => run('requestPermission', () => requestPermission(getMessaging()))}
      />
      <AppButton
        title="hasPermission"
        onPress={() => run('hasPermission', () => hasPermission(getMessaging()))}
      />
      <AppButton
        title="AuthorizationStatus.AUTHORIZED"
        onPress={() =>
          run('AuthorizationStatus', () => ({
            AUTHORIZED: AuthorizationStatus.AUTHORIZED,
            DENIED: AuthorizationStatus.DENIED,
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
      <AppButton
        title="onDeletedMessages (install)"
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
      <AppButton
        title="setBackgroundMessageHandler"
        onPress={() =>
          run('setBackgroundMessageHandler', () => {
            setBackgroundMessageHandler(getMessaging(), async () => {
              // Prefer registering this in the app entry file in production.
            });
            return 'handler registered (prefer entry file in production)';
          })
        }
      />
      <AppButton
        title="getIsHeadless"
        onPress={() => run('getIsHeadless', () => getIsHeadless(getMessaging()))}
      />

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
      <AppButton
        title="registerDeviceForRemoteMessages"
        onPress={() =>
          run('registerDeviceForRemoteMessages', () =>
            registerDeviceForRemoteMessages(getMessaging()),
          )
        }
      />
      <AppButton
        title="isDeviceRegisteredForRemoteMessages"
        onPress={() =>
          run('isDeviceRegisteredForRemoteMessages', () =>
            isDeviceRegisteredForRemoteMessages(getMessaging()),
          )
        }
      />
      <AppButton
        title="unregisterDeviceForRemoteMessages"
        onPress={() =>
          run('unregisterDeviceForRemoteMessages', () =>
            unregisterDeviceForRemoteMessages(getMessaging()),
          )
        }
      />

      <Text style={styles.section}>APNs (iOS)</Text>
      <AppButton
        title="getAPNSToken"
        onPress={() => run('getAPNSToken', () => getAPNSToken(getMessaging()))}
      />
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
      <AppButton
        title="setNotificationDelegationEnabled(false)"
        onPress={() =>
          run('setNotificationDelegationEnabled', () =>
            setNotificationDelegationEnabled(getMessaging(), false),
          )
        }
      />

      <Text style={styles.section}>Delivery metrics (BigQuery)</Text>
      <AppButton
        title="isDeliveryMetricsExportToBigQueryEnabled"
        onPress={() =>
          run('isDeliveryMetricsExportToBigQueryEnabled', () =>
            isDeliveryMetricsExportToBigQueryEnabled(getMessaging()),
          )
        }
      />
      <AppButton
        title="experimentalSetDeliveryMetricsExportedToBigQueryEnabled(false)"
        onPress={() =>
          run('experimentalSetDeliveryMetricsExportedToBigQueryEnabled', () =>
            experimentalSetDeliveryMetricsExportedToBigQueryEnabled(getMessaging(), false),
          )
        }
      />

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
