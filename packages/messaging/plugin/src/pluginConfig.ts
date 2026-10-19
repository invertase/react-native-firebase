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
}

export interface PluginConfigTypeAndroid {
  notificationIcon?: string;
  notificationColor?: string;
}
