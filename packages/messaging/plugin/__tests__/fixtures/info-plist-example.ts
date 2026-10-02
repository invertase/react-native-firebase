import type { InfoPlist } from '@expo/config-plugins';

/** Representative existing Info.plist content that the plugin must preserve. */
const infoPlistExample: InfoPlist = {
  CFBundleDisplayName: 'FirebaseMessagingTest',
  CFBundleURLTypes: [{ CFBundleURLSchemes: ['com.example.fbm'] }],
  UIBackgroundModes: ['remote-notification'],
  FirebaseAppDelegateProxyEnabled: true,
};

export { infoPlistExample };
