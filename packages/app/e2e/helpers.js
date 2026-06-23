exports.getE2eTestProject = function getE2eTestProject() {
  return 'react-native-firebase-testing';
};

exports.getE2eEmulatorHost = function getE2eEmulatorHost() {
  if (Platform.android) {
    return '10.0.2.2';
  }
  return '127.0.0.1';
};

/**
 * reCAPTCHA Enterprise App Check site key from the default Firebase app (native config files)
 * or e2e helpers. Skip Tier 1/2 recaptcha e2e when absent — register App Check reCAPTCHA in
 * Firebase console and redownload google-services.json / GoogleService-Info.plist first.
 */
exports.getRecaptchaSiteKey = function getRecaptchaSiteKey() {
  const { getApp } = modular;
  const fromDefaultApp = getApp().options.recaptchaSiteKey;
  if (fromDefaultApp) {
    return fromDefaultApp;
  }
  return FirebaseHelpers.app.config().recaptchaSiteKey;
};
