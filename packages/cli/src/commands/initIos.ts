import { Config } from '@react-native-community/cli-types';
import { Account, ProjectDetail } from '../types/firebase';
import log from '../helpers/log';
import { getIosConfig } from '../actions/getConfig';
import prompt from '../helpers/prompt';
import file from '../helpers/file';

export default async function initIos(
  account: Account,
  projectDetail: ProjectDetail,
  reactNativeConfig: Config,
) {
  const iosProjectConfig = getIosConfig(reactNativeConfig);
  log.info('Setting up Firebase for your iOS app..');

  const iosGoogleServicesFile = await file.readIosGoogleServices(iosProjectConfig);
  if (iosGoogleServicesFile) {
    const result = await prompt.confirm(
      'An iOS "GoogleService-Info.plist" file already exists, do you want to replace this file?',
    );

    if (result) {
      // Write the config file
      log.error('Not implemented');
    }
  }

  log.info('The Firebase setup for iOS has finished');
}
