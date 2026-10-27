import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  SDK_VERSION,
  getInAppMessaging,
  isAutomaticDataCollectionEnabled,
  isMessagesDisplaySuppressed,
  setAutomaticDataCollectionEnabled,
  setMessagesDisplaySuppressed,
  triggerEvent,
} from '@react-native-firebase/in-app-messaging';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function InAppMessagingScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inAppMessaging = useMemo(() => getInAppMessaging(), []);

  function showResult(message: string) {
    setError(null);
    setResult(message);
  }

  function showError(e: unknown) {
    setResult(null);
    setError(errorMessage(e));
  }

  async function run(label: string, action: () => unknown | Promise<unknown>) {
    try {
      const value = await action();
      showResult(
        typeof value === 'string'
          ? value
          : `${label}: ok${value === undefined ? '' : ` → ${JSON.stringify(value)}`}`,
      );
    } catch (e) {
      showError(e);
    }
  }

  return (
    <ScreenChrome title="in-app-messaging" result={result} error={error}>
      <Text style={styles.hint}>
        Controls mirror runtime APIs taught on the In-App Messaging usage page. This is Firebase
        In-App Messaging, not Cloud Messaging (@react-native-firebase/messaging). There is no
        emulator and no connect*Emulator helper. Campaigns are authored in the Firebase console.
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getInAppMessaging"
        onPress={() =>
          run('getInAppMessaging', () => {
            const instance = getInAppMessaging();
            const sameDefaultApp = getInAppMessaging(getApp());
            return {
              appName: instance.app.name,
              sameAsMemo: instance === inAppMessaging,
              sameAsGetApp: sameDefaultApp === instance,
              isMessagesDisplaySuppressed: isMessagesDisplaySuppressed(instance),
              isAutomaticDataCollectionEnabled: isAutomaticDataCollectionEnabled(instance),
            };
          })
        }
      />

      <Text style={styles.section}>Display suppression</Text>
      <AppButton
        title="isMessagesDisplaySuppressed"
        onPress={() =>
          run('isMessagesDisplaySuppressed', () => ({
            suppressed: isMessagesDisplaySuppressed(inAppMessaging),
          }))
        }
      />
      <Text style={styles.warning}>
        WARNING: setMessagesDisplaySuppressed throws if enabled is not a boolean. Suppression is not
        persisted across app restarts.
      </Text>
      <AppButton
        title="setMessagesDisplaySuppressed(true)"
        onPress={() =>
          run('setMessagesDisplaySuppressed', async () => {
            await setMessagesDisplaySuppressed(inAppMessaging, true);
            return { suppressed: isMessagesDisplaySuppressed(inAppMessaging) };
          })
        }
      />
      <AppButton
        title="setMessagesDisplaySuppressed(false)"
        onPress={() =>
          run('setMessagesDisplaySuppressed', async () => {
            await setMessagesDisplaySuppressed(inAppMessaging, false);
            return { suppressed: isMessagesDisplaySuppressed(inAppMessaging) };
          })
        }
      />

      <Text style={styles.section}>Automatic data collection</Text>
      <AppButton
        title="isAutomaticDataCollectionEnabled"
        onPress={() =>
          run('isAutomaticDataCollectionEnabled', () => ({
            enabled: isAutomaticDataCollectionEnabled(inAppMessaging),
          }))
        }
      />
      <Text style={styles.warning}>
        WARNING: setAutomaticDataCollectionEnabled throws if enabled is not a boolean. The value is
        persisted across app restarts and overrides firebase.json.
      </Text>
      <AppButton
        title="setAutomaticDataCollectionEnabled(true)"
        onPress={() =>
          run('setAutomaticDataCollectionEnabled', async () => {
            await setAutomaticDataCollectionEnabled(inAppMessaging, true);
            return { enabled: isAutomaticDataCollectionEnabled(inAppMessaging) };
          })
        }
      />
      <AppButton
        title="setAutomaticDataCollectionEnabled(false)"
        onPress={() =>
          run('setAutomaticDataCollectionEnabled', async () => {
            await setAutomaticDataCollectionEnabled(inAppMessaging, false);
            return { enabled: isAutomaticDataCollectionEnabled(inAppMessaging) };
          })
        }
      />

      <Text style={styles.section}>Programmatic trigger</Text>
      <Text style={styles.warning}>
        WARNING: triggerEvent throws if eventId is not a string. Use an event ID from a published
        campaign Scheduling step; with no matching campaign this still resolves.
      </Text>
      <AppButton
        title="triggerEvent"
        onPress={() =>
          run('triggerEvent', async () => {
            await triggerEvent(inAppMessaging, 'exampleTrigger');
            return { eventId: 'exampleTrigger' };
          })
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
  warning: { color: theme.error, fontSize: 13, lineHeight: 18 },
});
