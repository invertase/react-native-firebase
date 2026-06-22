import { getApp, initializeApp } from '@react-native-firebase/app';
import {
  initializeAppCheck,
  getToken,
  getLimitedUseToken,
  setTokenAutoRefreshEnabled,
  onTokenChanged,
  CustomProvider,
  ReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider,
  ReactNativeFirebaseAppCheckProvider,
  SDK_VERSION,
  type AppCheck,
  type AppCheckOptions,
  type AppCheckTokenResult,
} from '.';

const options: AppCheckOptions = {
  provider: {
    providerOptions: {
      android: { provider: 'debug' },
    },
  },
};
const appCheck = initializeAppCheck(getApp(), options);
console.log(appCheck.app.name);

getToken(appCheck).then((result: AppCheckTokenResult) => {
  console.log(result.token);
});

getLimitedUseToken(appCheck).then((result: AppCheckTokenResult) => {
  console.log(result.token);
});

setTokenAutoRefreshEnabled(appCheck, true);
onTokenChanged(appCheck, () => {});

console.log(CustomProvider);
console.log(SDK_VERSION);

const reCaptchaV3Provider = new ReCaptchaV3Provider('v3-site-key');
const reCaptchaEnterpriseProvider = new ReCaptchaEnterpriseProvider('enterprise-site-key');
console.log(reCaptchaV3Provider);
console.log(reCaptchaEnterpriseProvider);

initializeAppCheck(getApp(), {
  provider: reCaptchaEnterpriseProvider,
  isTokenAutoRefreshEnabled: true,
});

initializeAppCheck(getApp(), {
  provider: reCaptchaV3Provider,
  isTokenAutoRefreshEnabled: true,
});

const rnfbProvider = new ReactNativeFirebaseAppCheckProvider();
rnfbProvider.configure({
  android: { provider: 'recaptcha' },
  apple: { provider: 'recaptcha' },
  web: { provider: 'reCaptchaEnterprise', siteKey: 'test' },
});
initializeAppCheck(getApp(), {
  provider: rnfbProvider,
  isTokenAutoRefreshEnabled: true,
});

// provider-less initializeAppCheck when app has recaptchaSiteKey (js-sdk 12.15+)
initializeApp(
  { apiKey: 'a', appId: 'b', projectId: 'c', recaptchaSiteKey: '6Le-test-site-key' },
  'providerLessAppCheckApp',
).then(recaptchaSiteKeyApp =>
  initializeAppCheck(recaptchaSiteKeyApp, {
    isTokenAutoRefreshEnabled: true,
  }),
).then((providerLessAppCheck: AppCheck) => {
  console.log(providerLessAppCheck.app.options.recaptchaSiteKey);
});
