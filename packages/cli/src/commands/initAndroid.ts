import { AndroidProjectConfig } from '@react-native-community/cli-types';

import firebase from '../helpers/firebase';
import file from '../helpers/file';
import prompt from '../helpers/prompt';
import log from '../helpers/log';

import { Account, AndroidSha, ProjectDetail } from '../types/firebase';
import CliError from '../helpers/error';
import { getAndroidApp } from '../actions/getApp';
import {
  handleGradleDependency,
  handleGradlePlugin,
  compilePluginList,
} from '../actions/handleGradle';

export default async function initAndroid(
  account: Account,
  projectDetail: ProjectDetail,
  androidProjectConfig: AndroidProjectConfig,
) {
  log.info('Setting up Firebase for your Android app..');

  const plugins = compilePluginList();

  let selectedAndroidApp = getAndroidApp(projectDetail, androidProjectConfig.packageName);

  if (!selectedAndroidApp) {
    const result = await prompt.confirm(
      `Would you like to create a new Android app for your project ${projectDetail.displayName}?`,
    );

    if (result) {
      const displayName = await prompt.input('Enter a display name for the App:');
      selectedAndroidApp = await firebase
        .api(account)
        .management.createAndroidApp(projectDetail, androidProjectConfig, displayName);
      if (!selectedAndroidApp) throw new CliError('Unable to create a new Android app.');
    } else throw new CliError('No Android app available to setup the package with.');
  }

  // Fetch the config file for the app
  const androidConfigFile = await firebase
    .api(account)
    .management.getAppConfig(selectedAndroidApp.name);

  // Write the config file
  log.info('Writing new "google-services.json" file to "/android/app/google-services.json".');
  await file.writeAndroidGoogleServices(androidProjectConfig, androidConfigFile);

  // Read the "/android/build.gradle" file from the users project
  let androidBuildGradleFile = await file.readAndroidBuildGradle(androidProjectConfig);

  if (!androidBuildGradleFile) {
    log.warn('Could not find an Android "build.gradle" file, unable to check for dependencies');
  } else {
    for (const plugin of plugins)
      androidBuildGradleFile = await handleGradleDependency(
        plugin[0],
        plugin[1],
        androidBuildGradleFile,
      );
    await file.writeAndroidBuildGradle(androidProjectConfig, androidBuildGradleFile);
  }

  // Read the "/android/app/build.gradle" file
  const androidAppBuildGradleFile = await file.readAndroidAppBuildGradle(androidProjectConfig);

  if (!androidAppBuildGradleFile) {
    log.warn(
      'Could not find an app level "build.gradle" file, unable to check for registered plugins',
    );
  } else {
    for (const plugin of plugins)
      androidBuildGradleFile = await handleGradlePlugin(
        plugin[0],
        plugin[1],
        plugin[2],
        androidAppBuildGradleFile,
      );
    await file.writeAndroidAppBuildGradle(androidProjectConfig, androidAppBuildGradleFile);
  }

  // ask user whether they want to add a new sha-1 key
  let shaPrompt = await prompt.confirm(
    'Would you like to add a signing certificate to your Android app?',
  );

  // if yes, ask them to enter the key
  while (shaPrompt) {
    const shaKey = await prompt.input(
      'Enter the SHA-1 or SHA-256 fingerprint of your certificate:',
    );

    if (shaKey) {
      // get existing sha keys
      const androidAppConfigShaList = await firebase
        .api(account)
        .management.getAndroidAppConfigShaList(selectedAndroidApp);

      // check the one they entered doesnt already exist
      const exists = androidAppConfigShaList.find((sha: AndroidSha) => sha.shaHash === shaKey);

      if (!exists) {
        await firebase.api(account).management.createAndroidSha(selectedAndroidApp, shaKey);
        log.success('Fingerprint has been succesfully added to your Android app.');
        shaPrompt = await prompt.confirm(
          'Would you like to add another fingerprint to your Android app?',
        );
      } else {
        log.warn('This fingerprint already exists for the current app');
        shaPrompt = await prompt.confirm(
          'Would you like to add a different fingerprint to your Android app?',
        );
      }
    }
  }

  log.info('The Firebase setup for Android has finished');
}
