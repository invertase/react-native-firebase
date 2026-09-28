import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  SDK_VERSION,
  getAnalytics,
  getAppInstanceId,
  getGoogleAnalyticsClientId,
  getSessionId,
  initializeAnalytics,
  initiateOnDeviceConversionMeasurementWithEmailAddress,
  initiateOnDeviceConversionMeasurementWithHashedEmailAddress,
  initiateOnDeviceConversionMeasurementWithHashedPhoneNumber,
  initiateOnDeviceConversionMeasurementWithPhoneNumber,
  isSupported,
  logEvent,
  logPurchase,
  logScreenView,
  logSelectContent,
  logTransaction,
  resetAnalyticsData,
  setAnalyticsCollectionEnabled,
  setConsent,
  setDefaultEventParameters,
  setSessionTimeoutDuration,
  setUserId,
  setUserProperties,
  setUserProperty,
  settings,
} from '@react-native-firebase/analytics';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

/** Example SHA-256 hex digest for hashed on-device conversion helpers (not a real credential). */
const EXAMPLE_SHA256_HEX = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function AnalyticsScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analytics = useMemo(() => getAnalytics(), []);

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
    <ScreenChrome title="analytics" result={result} error={error}>
      <Text style={styles.hint}>
        Controls mirror runtime APIs taught on the Analytics usage and screen-tracking pages. There
        is no Analytics emulator in yarn tests:emulator:start-ci.
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getAnalytics"
        onPress={() =>
          run('getAnalytics', () => {
            const instance = getAnalytics();
            return { appName: instance.app.name };
          })
        }
      />
      <AppButton
        title="initializeAnalytics"
        onPress={() =>
          run('initializeAnalytics', () => {
            const instance = initializeAnalytics(getApp());
            return { appName: instance.app.name, sameAsGetAnalytics: instance === analytics };
          })
        }
      />
      <AppButton
        title="isSupported"
        onPress={() => run('isSupported', async () => ({ supported: await isSupported() }))}
      />
      <AppButton
        title="settings"
        onPress={() =>
          run('settings', () => {
            settings({ gtagName: 'ga', dataLayerName: 'dataLayer' });
            return 'settings called (no-op on React Native)';
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: getGoogleAnalyticsClientId throws on iOS and Android (web-only).
      </Text>
      <AppButton
        title="getGoogleAnalyticsClientId (can throw)"
        onPress={() =>
          run('getGoogleAnalyticsClientId', async () => getGoogleAnalyticsClientId(analytics))
        }
      />

      <Text style={styles.section}>Events</Text>
      <AppButton
        title="logEvent"
        onPress={() =>
          run('logEvent', async () => {
            await logEvent(analytics, 'test_expo_example', { source: 'test-expo' });
            return 'logged test_expo_example';
          })
        }
      />
      <AppButton
        title="logSelectContent"
        onPress={() =>
          run('logSelectContent', async () => {
            await logSelectContent(analytics, {
              content_type: 'clothing',
              item_id: 'abcd',
            });
            return 'logged select_content';
          })
        }
      />
      <AppButton
        title="logPurchase"
        onPress={() =>
          run('logPurchase', async () => {
            await logPurchase(analytics, {
              value: 19.99,
              currency: 'USD',
              items: [
                {
                  item_id: 'sku-grey-tee',
                  item_name: 'mens grey t-shirt',
                  item_category: 'clothing',
                  quantity: 1,
                  price: 19.99,
                },
              ],
            });
            return 'logged purchase';
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: logTransaction rejects on Android and web (iOS only).
      </Text>
      <AppButton
        title="logTransaction (can throw)"
        onPress={() =>
          run('logTransaction', async () => {
            await logTransaction(analytics, 'test-expo-transaction-id');
            return 'logged transaction';
          })
        }
      />
      <AppButton
        title="logScreenView"
        onPress={() =>
          run('logScreenView', async () => {
            await logScreenView(analytics, {
              screen_name: 'AnalyticsExpo',
              screen_class: 'AnalyticsExpo',
            });
            return 'logged screen_view';
          })
        }
      />

      <Text style={styles.section}>User and defaults</Text>
      <AppButton
        title="setUserId"
        onPress={() => run('setUserId', async () => setUserId(analytics, 'test-expo-user'))}
      />
      <AppButton
        title="setUserProperty"
        onPress={() =>
          run('setUserProperty', async () => setUserProperty(analytics, 'favorite_food', 'apples'))
        }
      />
      <AppButton
        title="setUserProperties"
        onPress={() =>
          run('setUserProperties', async () =>
            setUserProperties(analytics, {
              favorite_food: 'apples',
              preferred_shop: 'downtown',
            }),
          )
        }
      />
      <AppButton
        title="setDefaultEventParameters"
        onPress={() =>
          run('setDefaultEventParameters', async () =>
            setDefaultEventParameters(analytics, {
              campaign: 'spring_launch',
              source: 'test-expo',
            }),
          )
        }
      />

      <Text style={styles.section}>Ids and session</Text>
      <AppButton
        title="getAppInstanceId"
        onPress={() => run('getAppInstanceId', async () => getAppInstanceId(analytics))}
      />
      <AppButton
        title="getSessionId"
        onPress={() => run('getSessionId', async () => getSessionId(analytics))}
      />
      <AppButton
        title="setSessionTimeoutDuration"
        onPress={() =>
          run('setSessionTimeoutDuration', async () =>
            setSessionTimeoutDuration(analytics, 1_800_000),
          )
        }
      />
      <AppButton
        title="resetAnalyticsData"
        onPress={() => run('resetAnalyticsData', async () => resetAnalyticsData(analytics))}
      />

      <Text style={styles.section}>Collection and consent</Text>
      <AppButton
        title="setAnalyticsCollectionEnabled"
        onPress={() =>
          run('setAnalyticsCollectionEnabled', async () =>
            setAnalyticsCollectionEnabled(analytics, true),
          )
        }
      />
      <AppButton
        title="setConsent"
        onPress={() =>
          run('setConsent', async () =>
            setConsent(analytics, {
              analytics_storage: true,
              ad_storage: true,
              ad_user_data: true,
              ad_personalization: true,
            }),
          )
        }
      />

      <Text style={styles.section}>On-device conversion (iOS; no-op elsewhere)</Text>
      <AppButton
        title="initiateOnDeviceConversionMeasurementWithEmailAddress"
        onPress={() =>
          run('initiateOnDeviceConversionMeasurementWithEmailAddress', async () =>
            initiateOnDeviceConversionMeasurementWithEmailAddress(analytics, 'user@example.com'),
          )
        }
      />
      <AppButton
        title="initiateOnDeviceConversionMeasurementWithPhoneNumber"
        onPress={() =>
          run('initiateOnDeviceConversionMeasurementWithPhoneNumber', async () =>
            initiateOnDeviceConversionMeasurementWithPhoneNumber(analytics, '+15555550100'),
          )
        }
      />
      <AppButton
        title="initiateOnDeviceConversionMeasurementWithHashedEmailAddress"
        onPress={() =>
          run('initiateOnDeviceConversionMeasurementWithHashedEmailAddress', async () =>
            initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
              analytics,
              EXAMPLE_SHA256_HEX,
            ),
          )
        }
      />
      <AppButton
        title="initiateOnDeviceConversionMeasurementWithHashedPhoneNumber"
        onPress={() =>
          run('initiateOnDeviceConversionMeasurementWithHashedPhoneNumber', async () =>
            initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
              analytics,
              EXAMPLE_SHA256_HEX,
            ),
          )
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
