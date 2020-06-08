// check if signed in?
// - yes: continue
// - no: auth with browser

// check android config file exists
// check ios config file exists
// - prompt to continue for each platform (save for later)

// select a firebase project
// - if no projects: redirect to console (and show message)
// - if projects: list out and select (include "New Firebase Project")

// get apps for project (ios + android)

// attempt to auto-match app for each platform (bundle/app id)
// ask whether app is correct
// - if yes: select and continue
// - if no:
//   - Select from list / create (via CI or console for now)

// fetch config from api for app

// [android]: grab apps debugSha
// - post to API to create

// write config file to android/app/... ios/whatever
// [ios] also link?

// do installation steps if required (regex check of files)
// write to files if needed

// print out final steps (run-android/ios)

import { join } from 'path';
import Chalk from 'chalk';
import { AndroidProjectConfig, Config, IOSProjectConfig } from '@react-native-community/cli-types';

import firebase from '../helpers/firebase';
import file from '../helpers/file';
import prompt from '../helpers/prompt';
import log from '../helpers/log';

import { AppTypes } from '../types/cli';

import initAndroid from './initAndroid';
import initIos from './initIos';
import { trackModified } from '../helpers/tracker';
import getAccount from '../actions/getAccount';
import getConfig from '../actions/getConfig';
import CliError from '../helpers/error';
import { Account } from '../types/firebase';

export default async function initCommand(args: string[], reactNativeConfig: Config) {
  log.debug('Running "firebase init" command...');
  trackModified(args.includes('force'));

  const account = await getAccount();

  const [androidProjectConfig, iosProjectConfig] = getConfig(reactNativeConfig);

  const apps: { [type in AppTypes]: boolean } = {
    android: true,
    ios: false,
    web: false, // not supported
  };

  const androidGoogleServicesFile = await file.readAndroidGoogleServices(androidProjectConfig);
  if (androidGoogleServicesFile) {
    apps.android = await prompt.confirm(
      'An Android "google-services.json" file already exists, do you want to replace this file?',
    );

    if (!apps.android) {
      log.warn(
        'Firebase will not be setup for Android as a "google-services.json" file already exists and you have chosen to not override it.',
      );
    }
  }

  const iosGoogleServicesFile = await file.readIosGoogleServices(iosProjectConfig);
  if (iosGoogleServicesFile) {
    apps.ios = await prompt.confirm(
      'An iOS "GoogleService-Info.plist" file already exists, do you want to replace this file?',
    );

    if (!apps.ios) {
      log.warn(
        'Firebase will not be setup for iOS as a "GoogleService-Info.plist" file already exists and you have chosen to not override it.',
      );
    }
  }

  // Quit if no apps need to be setup
  if (!Object.values(apps).includes(true)) {
    log.info('No apps are required to be setup, exiting...');
    return;
  }

  // ask user to choose a project
  const firebaseProject = await prompt.selectFirebaseProject(account);

  // if no project exists - ask them to create one
  if (!firebaseProject) {
    throw new CliError(
      `No Firebase projects exist for user ${Chalk.cyanBright(
        `[${account.user.email}]. To continue, create a new project on the Firebase Console at https://console.firebase.google.com/.`,
      )}`,
    );
  }

  // Fetch project detail including apps config
  const projectDetail = await firebase
    .api(account)
    .management.getProject(firebaseProject.projectId, apps);

  if (apps.android) await initAndroid(account, projectDetail, androidProjectConfig);
  if (apps.ios) await initIos(account, projectDetail, iosProjectConfig);
}
