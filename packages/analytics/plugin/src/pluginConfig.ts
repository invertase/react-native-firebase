export interface PluginConfigType {
  ios?: PluginConfigTypeIos;
}

export interface PluginConfigTypeIos {
  withoutAdIdSupport?: boolean;
  /**
   * @platform ios iOS
   */
  googleAppMeasurementOnDeviceConversion?: boolean;
}
