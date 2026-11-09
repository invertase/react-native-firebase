export interface PluginConfigType {
  /**
   * When `true`, writes Installation ID messaging opt-in keys for both platforms:
   * - Android: `firebase_messaging_installation_id_enabled=true` with `tools:replace="android:value"`
   * - iOS: `FirebaseMessagingInstallationIdEnabled=YES`
   *
   * Omitted or `false` writes nothing. The library emits the Android meta defaulting to false.
   */
  installationIdEnabled?: boolean;
  android?: PluginConfigTypeAndroid;
  ios?: PluginConfigTypeIos;
}

export interface PluginConfigTypeAndroid {
  notificationIcon?: string;
  notificationColor?: string;
}

export interface PluginConfigTypeIos {
  /**
   * Adds a Notification Service Extension target that displays the image of FCM notifications
   * (`Messaging.serviceExtension().populateNotificationContent`), linking `FirebaseMessaging`
   * through Swift Package Manager at the Firebase Apple SDK version of `@react-native-firebase/app`.
   *
   * `true` uses the defaults of {@link NotificationServiceExtensionConfig}. Omitted or `false` adds nothing.
   */
  notificationServiceExtension?: boolean | NotificationServiceExtensionConfig;
}

export interface NotificationServiceExtensionConfig {
  /**
   * Name of the extension target, also its folder in `ios/` and the last component of its bundle
   * identifier (`<ios.bundleIdentifier>.<targetName>`). Defaults to `NotificationServiceExtension`.
   */
  targetName?: string;
}
