import { AppRegistry } from 'react-native';
import bootstrap from './src/main';
import bgMessaging from './src/bgMessaging';

AppRegistry.registerComponent('ReactNativeFirebaseDemo', () => bootstrap);
// Task registered to handle background data-only FCM messages
AppRegistry.registerHeadlessTask(
  'RNFirebaseBackgroundMessage',
  () => bgMessaging
);
