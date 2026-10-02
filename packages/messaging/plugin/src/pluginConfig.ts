export interface PluginConfigType {
  /**
   * When `true`, writes Installation ID messaging opt-in keys for both platforms:
   * - Android: `firebase_messaging_installation_id_enabled=true`
   * - iOS: `FirebaseMessagingInstallationIdEnabled=YES`
   *
   * Omitted or `false` writes nothing. The library does not enable this by default.
   */
  installationIdEnabled?: boolean;
  android?: PluginConfigTypeAndroid;
}

export interface PluginConfigTypeAndroid {
  notificationIcon?: string;
  notificationColor?: string;
}
