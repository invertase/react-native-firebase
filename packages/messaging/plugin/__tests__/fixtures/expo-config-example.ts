import { ExpoConfig } from '@expo/config-types';

const notificationConfig = {
  icon: 'IconAsset',
  color: '#1D172D',
};

/**
 * @type {import('@expo/config-types').ExpoConfig}
 */
export const expoConfigExample: ExpoConfig = {
  name: 'FirebaseMessagingTest',
  slug: 'fire-base-messaging-test',
  notification: notificationConfig,
};

/**
 * @type {import('@expo/config-types').ExpoConfig}
 */
export const expoConfigExampleWithExpoNotificationsPlugin: ExpoConfig = {
  name: 'FirebaseMessagingTest',
  slug: 'fire-base-messaging-test',
  notification: notificationConfig,
  plugins: [['expo-notifications', notificationConfig]],
};
