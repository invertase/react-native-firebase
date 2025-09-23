import { ExpoConfig } from '@expo/config-types';

/**
 * @type {import('@expo/config-types').ExpoConfig}
 */
const expoConfigExample: ExpoConfig = {
  name: 'FirebaseMessagingTest',
  slug: 'fire-base-messaging-test',
  notification: {
    icon: 'IconAsset',
    color: '#1D172D',
  },
};

const expoNotificationsConfigExample: ExpoConfig = {
  name: 'FirebaseMessagingTest',
  slug: 'fire-base-messaging-test',
  plugins: [
    [
      'expo-notifications',
      {
        icon: `IconAsset`,
        color: '#1D172D',
      },
    ],
  ],
};

const expoNotificationsConfigWithoutColorExample: ExpoConfig = {
  name: 'FirebaseMessagingTest',
  slug: 'fire-base-messaging-test',
  plugins: [
    [
      'expo-notifications',
      {
        icon: `IconAsset`,
      },
    ],
  ],
};

const expoNotificationsConfigWithoutPluginExample: ExpoConfig = {
  name: 'FirebaseMessagingTest',
  slug: 'fire-base-messaging-test',
};

export {
  expoConfigExample,
  expoNotificationsConfigExample,
  expoNotificationsConfigWithoutColorExample,
  expoNotificationsConfigWithoutPluginExample,
};
