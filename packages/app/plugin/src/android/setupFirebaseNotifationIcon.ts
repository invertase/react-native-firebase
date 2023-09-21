import { ConfigPlugin, withAndroidManifest } from '@expo/config-plugins';
import { ManifestApplication } from '@expo/config-plugins/build/android/Manifest';
import { ExpoConfig } from '@expo/config-types';

/**
 * Check if the developer has installed '@react-native-firebase/messaging'
 *
 * @return {boolean}
 */
function hasMessagingDependency(): boolean {
  try {
    require.resolve('@react-native-firebase/messaging');
  } catch (error) {
    return false;
  }
  return true;
}

/**
 * Create `com.google.firebase.messaging.default_notification_icon` and `com.google.firebase.messaging.default_notification_color`
 */
export const withExpoPluginFirebaseNotification: ConfigPlugin = config => {
  return withAndroidManifest(config, async config => {
    const messagingInstalled = hasMessagingDependency();
    //  If the developer is not using '@react-native-firebase/messaging', there is no need to do anything
    if (!messagingInstalled) {
      return config;
    }
    // If there is no need to build an Android program, there is no need to do anything
    if (!config.android) {
      return config;
    }
    const application = config.modResults.manifest.application![0];
    setFireBaseMessagingAndroidManifest(config, application);
    return config;
  });
};

export function setFireBaseMessagingAndroidManifest(
  config: ExpoConfig,
  application: ManifestApplication,
) {
  // If the notification object is not defined, print a friendly warning
  if (!config.notification) {
    // This warning is important because the notification icon can only use pure white on Android. By default, the system uses the app icon as the notification icon, but the app icon is usually not pure white, so you need to set the notification icon
    // eslint-disable-next-line no-console
    console.warn(
      'For Android 8.0 and above, it is necessary to set the notification icon to ensure correct display. Otherwise, the notification will not show the correct icon. For more information, visit https://docs.expo.dev/versions/latest/config/app/#notification',
    );
    return config;
  }

  // Defensive code
  application['meta-data'] ??= [];

  const metaData = application['meta-data'];

  if (config.notification.icon) {
    // Expo will automatically create '@drawable/notification_icon' resource if you specify config.notification.icon.
    metaData.push({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_icon',
        'android:resource': '@drawable/notification_icon',
      },
    });
  }

  if (config.notification.color) {
    metaData.push({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_color',
        'android:resource': '@color/notification_icon_color',
        // @react-native-firebase/messaging will automatically configure the notification color from the 'firebase.json' file, setting 'tools:replace' = 'android:resource' to overwrite it.
        // @ts-ignore
        'tools:replace': 'android:resource',
      },
    });
  }

  return application;
}
