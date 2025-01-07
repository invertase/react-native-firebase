export interface PluginConfigType {
  ios?: PluginConfigTypeIos;
}

export interface PluginConfigTypeIos {
  captchaOpenUrlFix?: undefined | boolean | 'default';
}
