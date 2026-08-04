export interface PluginConfigType {
  ios?: PluginConfigTypeIos;
}

export interface PluginConfigTypeIos {
  /**
   * Sets `$RNFirebaseDisableSPM = true` in the Podfile, forcing Firebase
   * dependencies to be installed with CocoaPods instead of Swift Package Manager.
   *
   * @platform ios iOS
   */
  disableSPM?: boolean;
}
