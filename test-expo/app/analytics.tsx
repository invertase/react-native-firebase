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
  logAddPaymentInfo,
  logAddShippingInfo,
  logAddToCart,
  logAddToWishlist,
  logAppOpen,
  logBeginCheckout,
  logCampaignDetails,
  logEarnVirtualCurrency,
  logEvent,
  logGenerateLead,
  logJoinGroup,
  logLevelEnd,
  logLevelStart,
  logLevelUp,
  logLogin,
  logPostScore,
  logPurchase,
  logRefund,
  logRemoveFromCart,
  logScreenView,
  logSearch,
  logSelectContent,
  logSelectItem,
  logSelectPromotion,
  logSetCheckoutOption,
  logShare,
  logSignUp,
  logSpendVirtualCurrency,
  logTransaction,
  logTutorialBegin,
  logTutorialComplete,
  logUnlockAchievement,
  logViewCart,
  logViewItem,
  logViewItemList,
  logViewPromotion,
  logViewSearchResults,
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

const EXAMPLE_ITEM = {
  item_id: 'sku-grey-tee',
  item_name: 'mens grey t-shirt',
  item_category: 'clothing',
  quantity: 1,
  price: 19.99,
};

/** One control per predefined event helper that has no dedicated button below. */
const PREDEFINED_EVENT_CONTROLS: { title: string; log: () => Promise<void> }[] = [
  {
    title: 'logAddPaymentInfo',
    log: () =>
      logAddPaymentInfo(getAnalytics(), {
        value: 19.99,
        currency: 'USD',
        payment_type: 'card',
        items: [EXAMPLE_ITEM],
      }),
  },
  {
    title: 'logAddShippingInfo',
    log: () =>
      logAddShippingInfo(getAnalytics(), {
        value: 19.99,
        currency: 'USD',
        shipping_tier: 'ground',
        items: [EXAMPLE_ITEM],
      }),
  },
  {
    title: 'logAddToCart',
    log: () =>
      logAddToCart(getAnalytics(), { value: 19.99, currency: 'USD', items: [EXAMPLE_ITEM] }),
  },
  {
    title: 'logAddToWishlist',
    log: () =>
      logAddToWishlist(getAnalytics(), { value: 19.99, currency: 'USD', items: [EXAMPLE_ITEM] }),
  },
  { title: 'logAppOpen', log: () => logAppOpen(getAnalytics()) },
  {
    title: 'logBeginCheckout',
    log: () =>
      logBeginCheckout(getAnalytics(), { value: 19.99, currency: 'USD', items: [EXAMPLE_ITEM] }),
  },
  {
    title: 'logCampaignDetails',
    log: () =>
      logCampaignDetails(getAnalytics(), {
        source: 'newsletter',
        medium: 'email',
        campaign: 'spring_launch',
      }),
  },
  {
    title: 'logEarnVirtualCurrency',
    log: () => logEarnVirtualCurrency(getAnalytics(), { virtual_currency_name: 'gems', value: 10 }),
  },
  {
    title: 'logGenerateLead',
    log: () => logGenerateLead(getAnalytics(), { value: 19.99, currency: 'USD' }),
  },
  { title: 'logJoinGroup', log: () => logJoinGroup(getAnalytics(), { group_id: 'group-1' }) },
  { title: 'logLevelEnd', log: () => logLevelEnd(getAnalytics(), { level: 3, success: true }) },
  { title: 'logLevelStart', log: () => logLevelStart(getAnalytics(), { level: 3 }) },
  {
    title: 'logLevelUp',
    log: () => logLevelUp(getAnalytics(), { level: 4, character: 'knight' }),
  },
  { title: 'logLogin', log: () => logLogin(getAnalytics(), { method: 'email' }) },
  {
    title: 'logPostScore',
    log: () => logPostScore(getAnalytics(), { score: 1200, level: 3, character: 'knight' }),
  },
  {
    title: 'logRefund',
    log: () =>
      logRefund(getAnalytics(), {
        value: 19.99,
        currency: 'USD',
        transaction_id: 'T12345',
        items: [EXAMPLE_ITEM],
      }),
  },
  {
    title: 'logRemoveFromCart',
    log: () =>
      logRemoveFromCart(getAnalytics(), { value: 19.99, currency: 'USD', items: [EXAMPLE_ITEM] }),
  },
  {
    title: 'logSearch',
    log: () => logSearch(getAnalytics(), { search_term: 'grey t-shirt' }),
  },
  {
    title: 'logSelectItem',
    log: () =>
      logSelectItem(getAnalytics(), {
        content_type: 'product',
        item_list_id: 'list-1',
        item_list_name: 'Featured',
        items: [EXAMPLE_ITEM],
      }),
  },
  {
    title: 'logSelectPromotion',
    log: () =>
      logSelectPromotion(getAnalytics(), {
        creative_name: 'spring_banner',
        creative_slot: 'top',
        location_id: 'home',
        promotion_id: 'promo-1',
        promotion_name: 'Spring sale',
        items: [EXAMPLE_ITEM],
      }),
  },
  {
    title: 'logSetCheckoutOption',
    log: () =>
      logSetCheckoutOption(getAnalytics(), { checkout_step: 2, checkout_option: 'express' }),
  },
  {
    title: 'logShare',
    log: () =>
      logShare(getAnalytics(), { content_type: 'clothing', item_id: 'abcd', method: 'email' }),
  },
  { title: 'logSignUp', log: () => logSignUp(getAnalytics(), { method: 'email' }) },
  {
    title: 'logSpendVirtualCurrency',
    log: () =>
      logSpendVirtualCurrency(getAnalytics(), {
        item_name: 'sword',
        virtual_currency_name: 'gems',
        value: 5,
      }),
  },
  { title: 'logTutorialBegin', log: () => logTutorialBegin(getAnalytics()) },
  { title: 'logTutorialComplete', log: () => logTutorialComplete(getAnalytics()) },
  {
    title: 'logUnlockAchievement',
    log: () => logUnlockAchievement(getAnalytics(), { achievement_id: 'first_win' }),
  },
  {
    title: 'logViewCart',
    log: () =>
      logViewCart(getAnalytics(), { value: 19.99, currency: 'USD', items: [EXAMPLE_ITEM] }),
  },
  {
    title: 'logViewItem',
    log: () =>
      logViewItem(getAnalytics(), { value: 19.99, currency: 'USD', items: [EXAMPLE_ITEM] }),
  },
  {
    title: 'logViewItemList',
    log: () =>
      logViewItemList(getAnalytics(), {
        item_list_id: 'list-1',
        item_list_name: 'Featured',
        items: [EXAMPLE_ITEM],
      }),
  },
  {
    title: 'logViewPromotion',
    log: () =>
      logViewPromotion(getAnalytics(), {
        creative_name: 'spring_banner',
        creative_slot: 'top',
        location_id: 'home',
        promotion_id: 'promo-1',
        promotion_name: 'Spring sale',
        items: [EXAMPLE_ITEM],
      }),
  },
  {
    title: 'logViewSearchResults',
    log: () => logViewSearchResults(getAnalytics(), { search_term: 'grey t-shirt' }),
  },
];

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
        Controls mirror runtime APIs taught on the Analytics usage and screen-tracking pages.
        Analytics has no emulator, so every control calls the native SDK directly.
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
          run('logEvent', () => {
            logEvent(analytics, 'test_expo_example', { source: 'test-expo' });
            return 'logged test_expo_example';
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: logEvent throws for reserved event names and names with a reserved prefix.
      </Text>
      <AppButton
        title="logEvent (reserved name; can throw)"
        onPress={() =>
          run('logEvent(reserved)', () => {
            logEvent(analytics, 'first_open');
            return 'logged first_open';
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
      {PREDEFINED_EVENT_CONTROLS.map(control => (
        <AppButton
          key={control.title}
          title={control.title}
          onPress={() =>
            run(control.title, async () => {
              await control.log();
              return `logged ${control.title}`;
            })
          }
        />
      ))}
      <Text style={styles.warning}>
        WARNING: logTransaction rejects on Android and web (iOS only) and on iOS older than 15.0.
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
      <Text style={styles.warning}>
        WARNING: on iOS getSessionId can take up to 60 seconds before it resolves null.
      </Text>
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
      <Text style={styles.warning}>
        WARNING: resetAnalyticsData clears Analytics data on this device and resets the app instance
        id.
      </Text>
      <AppButton
        title="resetAnalyticsData (destructive)"
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
      <Text style={styles.warning}>
        WARNING: iOS only. These resolve without doing anything on Android. They throw when the
        argument has the wrong format (E.164 for phone numbers, 64-character SHA-256 hex for hashed
        values).
      </Text>
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
