export interface PluginConfigType {
  ios?: PluginConfigTypeIos;
}

export interface PluginConfigTypeIos {
  /**
   * @deprecated Firebase Apple SDK 13+ is SPM-only. Setting this to `true`
   * fails Expo prebuild / `pod install` — CocoaPods no longer distributes Firebase.
   * Remove this option and use `use_frameworks! :linkage => :dynamic` (via
   * `expo-build-properties` `ios.useFrameworks: "dynamic"`).
   *
   * @platform ios iOS
   */
  disableSPM?: boolean;
}
