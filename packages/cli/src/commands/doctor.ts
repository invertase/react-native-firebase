import Chalk from 'chalk';
import { Config } from '@react-native-community/cli-types';
import getAccount from '../actions/getAccount';
import log from '../helpers/log';
import file from '../helpers/file';
import getConfig from '../actions/getConfig';
import prompt from '../helpers/prompt';
import firebase from '../helpers/firebase';
import { getAndroidApp } from '../actions/getApp';

export default async function doctorCommand(args: string[], reactNativeConfig: Config) {
  const [androidProjectConfig, iosProjectConfig] = getConfig(reactNativeConfig);

  const account = await getAccount(true);
  if (account) {
    var firebaseProject = await prompt.selectFirebaseProject(account);
    if (!firebaseProject)
      log.warn(
        `No Firebase projects exist for user ${Chalk.cyanBright(
          `[${account.user.email}], Firebase information will not be available.`,
        )}`,
      );
    else {
      var projectDetail = await firebase
        .api(account)
        .management.getProject(firebaseProject.projectId, { android: true, ios: true, web: false });
      log.info('# Firebase project information');
      log.info(`Display name: ${projectDetail.displayName}`);
      log.info(`Project ID: ${projectDetail.projectId}`);
      log.info(`Project number: ${projectDetail.projectNumber}`);
    }
  } else {
    log.warn('Not logged into Firebase, Firebase information will not be available.');
  }

  log.info('# Firebase Android information');
  log.info(`Package name: ${androidProjectConfig.packageName}`);
  if (projectDetail) {
    var androidApp = getAndroidApp(projectDetail, androidProjectConfig.packageName);
    if (androidApp) {
      log.info(`Display name: ${androidApp.displayName}`);
      log.info(`AppId: ${androidApp.appId}`);
      log.info(`AppId: ${androidApp.name}`);
    }
  }
  const androidGoogleServicesFile = await file.readAndroidGoogleServices(androidProjectConfig);
  if (androidGoogleServicesFile) {
    log.success('A "google-services.json" has been found.');
  } else {
    log.warn(
      'No "google-services.json" file has been found, Firebase for Android has not been setup.',
    );
  }

  log.info('# iOS');
  const iosGoogleServicesFile = await file.readIosGoogleServices(iosProjectConfig);
  if (iosGoogleServicesFile) {
    log.success('A "GoogleService-Info.plist" has been found.');
  } else {
    log.warn(
      'No "GoogleService-Info.plist" file has been found, Firebase for iOS has not been setup.',
    );
  }
}
