import { ConfigPlugin, withAndroidManifest } from '@expo/config-plugins';
import { ManifestApplication } from '@expo/config-plugins/build/android/Manifest';
import { ExpoConfig } from '@expo/config-types';

/**
 * Determine whether a ManifestApplication has an attribute.
 */
const hasMetaData = (application: ManifestApplication, metaData: string) => {
  return application['meta-data']?.some(item => item['$']['android:name'] === metaData);
};

/**
 * Create `com.google.firebase.messaging.default_notification_icon` and `com.google.firebase.messaging.default_notification_color`
 */
export const withExpoPluginFirebaseNotification: ConfigPlugin = config => {
  return withAndroidManifest(config, async config => {
    // Add NS `xmlns:tools to handle boundary conditions.
    config.modResults.manifest.$ = {
      ...config.modResults.manifest.$,
      'xmlns:tools': 'http://schemas.android.com/tools',
    };

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
      '[@react-native-firebase/messaging] For Android, it is necessary to set a notification icon to ensure correct display. Add notification configuration to your app.json:\n' +
        '{\n' +
        '  "expo": {\n' +
        '    "notification": {\n' +
        '      "icon": "./assets/notification-icon.png",\n' +
        '      "color": "#FF0000"\n' +
        '    }\n' +
        '  }\n' +
        '}\n' +
        'For more information, visit https://docs.expo.dev/versions/latest/config/app/#notification',
    );
    return config;
  }

  // Defensive code
  application['meta-data'] ??= [];

  const metaData = application['meta-data'];

  if (
    config.notification.icon &&
    !hasMetaData(application, 'com.google.firebase.messaging.default_notification_icon')
  ) {
    // Expo will automatically create '@drawable/notification_icon' resource if you specify config.notification.icon.
    metaData.push({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_icon',
        'android:resource': '@drawable/notification_icon',
      },
    });

    // eslint-disable-next-line no-console
    console.log(
      '[@react-native-firebase/messaging] Android notification icon configured from app.json',
    );
  }

  if (
    config.notification.color &&
    !hasMetaData(application, 'com.google.firebase.messaging.default_notification_color')
  ) {
    metaData.push({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_color',
        'android:resource': '@color/notification_icon_color',
        // @react-native-firebase/messaging will automatically configure the notification color from the 'firebase.json' file, setting 'tools:replace' = 'android:resource' to overwrite it.
        // @ts-ignore
        'tools:replace': 'android:resource',
      },
    });

    // eslint-disable-next-line no-console
    console.log(
      '[@react-native-firebase/messaging] Android notification color configured from app.json',
    );
  }

  return application;
}
