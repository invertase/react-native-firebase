import { Account } from '../types/firebase';
import { Config, IOSProjectConfig } from '@react-native-community/cli-types';
import log from '../helpers/log';

export default async function initIos(
  account: Account,
  projectDetail: ProjectDetail,
  iosProjectConfig: IOSProjectConfig,
) {
  log.info('Setting up Firebase for your Android app..');
  log.error('Not implemented');
}
