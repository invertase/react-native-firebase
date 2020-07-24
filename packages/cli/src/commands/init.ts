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

import Chalk from 'chalk';
import { Config } from '@react-native-community/cli-types';

import firebase from '../helpers/firebase';
import prompt from '../helpers/prompt';
import log from '../helpers/log';

import { AppTypes } from '../types/cli';

import initAndroid from './initAndroid';
import initIos from './initIos';
import { trackModified } from '../helpers/tracker';
import getAccount from '../actions/getAccount';
import CliError from '../helpers/error';
import handleFirebaseConfig from '../actions/handleFirebase';

export default async function initCommand(args: string[], reactNativeConfig: Config) {
  log.debug('Running "firebase init" command...');
  if (
    !(await prompt.confirm(
      'This command is a work in progress, are you sure you want to continue?',
    ))
  )
    return;

  trackModified(args.includes('force'));

  const account = await getAccount();

  const apps: { [type in AppTypes]: boolean } = {
    android: await prompt.confirm('Do you want to setup Android for your app?'),
    ios: false && (await prompt.confirm('Do you want to setup iOS for your app?')), // not implemented
    web: false, // not supported
  };

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

  await handleFirebaseConfig(reactNativeConfig, apps);

  if (apps.android) await initAndroid(account, projectDetail, reactNativeConfig);
  if (apps.ios) await initIos(account, projectDetail, reactNativeConfig);
}
