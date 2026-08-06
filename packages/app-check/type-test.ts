import { getApp } from '@react-native-firebase/app';
import {
  initializeAppCheck,
  getToken,
  getLimitedUseToken,
  setTokenAutoRefreshEnabled,
  onTokenChanged,
  CustomProvider,
  SDK_VERSION,
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
