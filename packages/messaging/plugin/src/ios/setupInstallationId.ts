import { ConfigPlugin, withInfoPlist } from '@expo/config-plugins';
import { PluginConfigType } from '../pluginConfig';

/**
 * Writes `FirebaseMessagingInstallationIdEnabled=YES` when `installationIdEnabled` is true.
 * Omitted or false writes nothing.
 */
export const withExpoPluginInstallationIdIos: ConfigPlugin<PluginConfigType | undefined> = (
  config,
  props,
) => {
  if (!props?.installationIdEnabled) {
    return config;
  }

  return withInfoPlist(config, config => {
    config.modResults.FirebaseMessagingInstallationIdEnabled = true;
    return config;
  });
};
