import { ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';
import { withExpoPluginFirebaseNotification } from './android';
import {
  withAppEnvironment,
  withNotificationServiceExtension,
  withRNFirebaseXcodeProject,
} from './ios';
import { PluginProps, withEasManagedCredentials } from './ios/setupNotificationServiceExtension';

/**
 * A config plugin for configuring `@react-native-firebase/app`
 */
const withRnFirebaseApp: ConfigPlugin<PluginProps> = (config, props) => {
  // iOS
  if (props.installNSE) {
    config = withAppEnvironment(config, props);
    config = withNotificationServiceExtension(config, props);
    config = withRNFirebaseXcodeProject(config, props);
    config = withEasManagedCredentials(config, props);
  }

  // Android
  config = withExpoPluginFirebaseNotification(config);
  return config;
};

const pak = require('@react-native-firebase/messaging/package.json');
export default createRunOncePlugin(withRnFirebaseApp, pak.name, pak.version);
