import { AndroidProjectConfig } from '@react-native-community/cli-types';

import firebase from '../helpers/firebase';
import file from '../helpers/file';
import prompt from '../helpers/prompt';
import log from '../helpers/log';

import { Account, AndroidSha, ProjectDetail } from '../types/firebase';
import CliError from '../helpers/error';
import { getAndroidApp } from '../actions/getApp';
import { GradleDependency } from '../types/cli';
import { getGoogleServicesPlugin, getGoogleServicesDependency } from '../helpers/gradle';

const GOOGLE_SERVICES_PLUGIN_VERSION = '4.2.0';

export default async function initAndroid(
  account: Account,
  projectDetail: ProjectDetail,
  androidProjectConfig: AndroidProjectConfig,
) {
  log.info('Setting up Firebase for your Android app..');

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
  const androidBuildGradleFile = await file.readAndroidBuildGradle(androidProjectConfig);

  if (!androidBuildGradleFile) {
    log.warn('Could not find an Android "build.gradle" file, unable to check dependencies exist');
  } else {
    const dependency = await getGoogleServicesDependency(androidBuildGradleFile);

    if (dependency) {
      if (dependency.version == GOOGLE_SERVICES_PLUGIN_VERSION)
        log.success('Google Services dependency already set.');
      else {
        const updatedGradleFile = androidBuildGradleFile.replace(
          `'com.google.gms:google-services:${dependency.version}'`,
          `'com.google.gms:google-services:${GOOGLE_SERVICES_PLUGIN_VERSION}'`,
        );
        log.info(
          `Google Services plugin version ${dependency.version} found instead of ${GOOGLE_SERVICES_PLUGIN_VERSION}, updating "/android/build.gradle"...`,
        );
        await file.writeAndroidBuildGradle(androidProjectConfig, updatedGradleFile);
      }
    } else {
      // Update the file with the added dependency
      log.info('Google Services not found, updating "/android/build.gradle"...');
      const addDependencyRegex = /buildscript[\w\W]*dependencies[\s]*{/g;
      const updatedGradleFile = androidBuildGradleFile.replace(addDependencyRegex, str => {
        return `${str}
    classpath 'com.google.gms:google-services:${GOOGLE_SERVICES_PLUGIN_VERSION}'`;
      });
      await file.writeAndroidBuildGradle(androidProjectConfig, updatedGradleFile);
    }
  }

  // Read the "/android/app/build.gradle" file
  const androidAppBuildGradleFile = await file.readAndroidAppBuildGradle(androidProjectConfig);

  if (!androidAppBuildGradleFile) {
    log.warn(
      'Could not find an app level "build.gradle" file, unable to check whether Google Services plugin has been registered',
    );
  } else {
    const googleServicePlugin = getGoogleServicesPlugin(androidAppBuildGradleFile);
    // Check whether plugin has been registered
    if (!googleServicePlugin) {
      log.info(
        'Google Services plugin has not been registered, updating "/android/app/build.gradle"',
      );
      await file.writeAndroidAppBuildGradle(
        androidProjectConfig,
        `${androidAppBuildGradleFile}
apply plugin: 'com.google.gms.google-services'`,
      );
    } else {
      log.success('Google Services plugin already registered.');
    }
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
