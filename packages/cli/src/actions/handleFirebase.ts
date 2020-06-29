import { Config } from '@react-native-community/cli-types';
import file from '../helpers/file';
import { FirebaseConfig } from '../types/cli';
import log from '../helpers/log';
import prompt from '../helpers/prompt';

type validateType = RegExp | any[] | CallableFunction;
// returns array: config key or array of config keys, validation for the key, callback if validation fails
function getFirebaseConfigRequirements(reactNativeConfig: Config) {
  const requirements: [string | string[], validateType, Function][] = [];

  if (reactNativeConfig.dependencies['@react-native-firebase/admob']) {
    requirements.push([
      'admob_android_app_id',
      /ca-app-pub-[0-9]{16}~[0-9]{10}/,
      handleAdmobAndroidAppId,
    ]);
    requirements.push(['admob_ios_app_id', /ca-app-pub-[0-9]{16}~[0-9]{10}/, handleAdmobIosAppId]);
  }

  if (reactNativeConfig.dependencies['@react-native-firebase/ml-natural-language'])
    requirements.push([
      ['ml_natural_language_smart_reply_model', 'ml_natural_language_language_id_model'],
      [true, false],
      handleAdmobAndroidAppId,
    ]);

  return requirements;
}

function validateField(val: any, test: validateType) {
  if (test instanceof Function) return test(val);
  if (test instanceof Array) return test.includes(val);
  if (test instanceof RegExp) {
    if (typeof val != 'string') return false;
    return test.test(val);
  }
}

let appId: string;
async function handleAdmobAndroidAppId(
  reactNativeConfig: Config,
  rnfbConfig: any,
  test: validateType,
) {
  while (await prompt.confirm('Do you want to configure your App Id for Admob on Android?')) {
    if (!appId) {
      log.info('Your App ID can be found at https://apps.admob.com/ under App settings');
      appId = await prompt.input('Please enter your App Id');
    }
    if (validateField(appId, test)) {
      log.info('Setting Firebase config key admob_android_app_id');
      rnfbConfig['admob_android_app_id'] = appId;
      break;
    } else log.warn('Invalid App ID entered.');
  }
}

async function handleAdmobIosAppId(reactNativeConfig: Config, rnfbConfig: any, test: validateType) {
  while (await prompt.confirm('Do you want to configure your App Id for Admob on iOS?')) {
    if (!appId) {
      log.info('Your App ID can be found at https://apps.admob.com/ under App settings');
      appId = await prompt.input('Please enter your App Id');
    }
    if (validateField(appId, test)) {
      log.info('Setting Firebase config key admob_ios_app_id');
      rnfbConfig['admob_ios_app_id'] = appId;
      break;
    } else log.warn('Invalid App ID entered.');
  }
}

async function handleMLNL(reactnativeConfig: Config, rnfbConfig: any) {
  log.info(
    "In order to use ML Kit's Natural Language services, at least one of its services needs to be enabled.",
  );
  if (prompt.confirm("Do you want to enable ML Kit's Smart Reply API?"))
    rnfbConfig['ml_natural_language_smart_reply_model'] = true;
  if (prompt.confirm("Do you want to enable ML Kit's on-device language identification API?"))
    rnfbConfig['ml_natural_language_language_id_model'] = true;
}

export default async function handleFirebaseConfig(reactNativeConfig: Config) {
  const firebaseConfig = ((await file.readFirebaseConfig(reactNativeConfig)) ||
    {}) as FirebaseConfig;

  if (!firebaseConfig['react-native']) firebaseConfig['react-native'] = {};
  const rnfbConfig = firebaseConfig['react-native'];
  const hash = JSON.stringify(rnfbConfig);

  const configRequirements = getFirebaseConfigRequirements(reactNativeConfig);

  for (const [key, test, fn] of configRequirements) {
    if (key instanceof Array) {
      if (!key.every(k => rnfbConfig[k])) {
        log.warn(`Missing setting for keys ${key.join(', ')} in the Firebase config`);
        await fn(reactNativeConfig, rnfbConfig, test);
      } else log.success(`Firebase setting for keys ${key.join(', ')} configured correctly`);
    } else {
      if (rnfbConfig[key] === undefined) {
        log.warn(`Missing setting ${key} in the Firebase config`);
        await fn(reactNativeConfig, rnfbConfig, test);
      } else if (!validateField(rnfbConfig[key], test)) {
        log.warn(`Invalid value for Firebase setting ${key}`);
        await fn(reactNativeConfig, rnfbConfig, test);
      } else log.success(`Firebase setting ${key} configured corrrectly`);
    }
  }

  if (JSON.stringify(rnfbConfig) != hash) {
    log.info('Writing new "firebase.json" file to "/firebase.json".');
    file.writeFirebaseConfig(reactNativeConfig, firebaseConfig);
  }
}
