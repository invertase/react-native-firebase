import { join } from 'path';
import { AndroidProjectConfig, Config } from '@react-native-community/cli-types';

import firebase from '../helpers/firebase';
import file from '../helpers/file';
import prompt from '../helpers/prompt';
import log from '../helpers/log';

import { Account, AndroidSha, Project, ProjectDetail, ProjectDetailAndroidApp } from '../types/firebase';
import createAndroidApp from '../actions/createAndroidApp';

const GOOGLE_SERVICES_PLUGIN_VERSION = '4.2.0';

export default async function initAndroid(
  account: Account,
  projectDetail: ProjectDetail,
  androidReactNativeConfig: AndroidProjectConfig,
) {
  let selectedAndroidApp: ProjectDetailAndroidApp|undefined;
  if (!projectDetail.apps.android?.length) {
    log.warn(`Your project ${projectDetail.displayName} does not contain any Android apps.`);
  } else {
    selectedAndroidApp = projectDetail.apps.android.find(
      app => app.packageName === androidReactNativeConfig.packageName,
    );

    if (!selectedAndroidApp) {
      log.warn(
        `Your project ${
          projectDetail.displayName
        } does not contain any Android apps that match the package name ${
          androidReactNativeConfig.packageName
        }.`,
      );
    }
  }

  if (!selectedAndroidApp) {
    const result = await prompt.confirm(
      `Would you like to create a new Android app for your project ${projectDetail.displayName}?`,
    );

    // TODO: Add android APP from CLI
    if (result)
    selectedAndroidApp = await createAndroidApp(account, androidReactNativeConfig, projectDetail);
    else throw new Error('No Android app available to setup the package with.');
  }

  // ask user whether they want to add a new sha-1 key
  const shaPrompt = await prompt.confirm(
    'Would you like to add a SHA-1 key to your Android app?',
  );

  while(true) {
  // if yes, ask them to enter the key
  if (shaPrompt) {
    const shaKey = await prompt.input('Enter your SHA-1 key:');

    if (shaKey) {
      // get existing sha keys
      const androidAppConfigShaList = await firebase
        .api(account)
        .management.getAndroidAppConfigShaList(selectedAndroidApp.name);

      // check the one they entered doesnt already exist
      const exists = androidAppConfigShaList.find((sha: AndroidSha) => sha.shaHash === shaKey);

      if (!exists) {
        // TODO add sha
      } else {
        log.warn('This SHA-1 already exists for the current app');
        const shaPrompt = await prompt.confirm(
          'Would you like to add a different SHA-1 key to your Android app?',
        );
        if(!shaPrompt)
          break;
      }
    }
  }
}

  // Fetch the config file for the app
  const androidConfigFile = await firebase
    .api(account)
    .management.getAppConfig(selectedAndroidApp.name);

  // Write the config file
  log.info('Writing new "google-services.json" file to "/android/app/google-services.json".');
  await file.writeAndroidGoogleServices(androidReactNativeConfig, androidConfigFile);

  // Read the "/android/build.gradle" file from the users project
  const androidBuildGradleFile = await file.readAndroidBuildGradle(androidReactNativeConfig);

  if (!androidBuildGradleFile) {
    log.warn('Could not find an Android "build.gradle" file, unable to check dependencies exist');
  } else {
    // Check whether the google-services dependency exists
    const findDependencyRegex = /^[\s]*classpath[\s]+["']{1}com\.google\.gms:google-services:.+["']{1}[\s]*$/gm;
    const match = androidBuildGradleFile.match(findDependencyRegex);

    if (match) {
      log.info('Google Services dependency already set.');
    } else {
      // Update the file with the added dependency
      log.info('Google Services not found, updating "/android/build.gradle"...');
      const addDependencyRegex = /buildscript[\w\W]*dependencies[\s]*{/g;
      const updatedGradleFile = androidBuildGradleFile.replace(addDependencyRegex, str => {
        return `${str}
    classpath 'com.google.gms:google-services:${GOOGLE_SERVICES_PLUGIN_VERSION}'`;
      });
      await file.writeAndroidBuildGradle(androidConfigFile, updatedGradleFile);
    }
  }

  // Read the "/android/app/build.gradle" file
  const androidAppBuildGradleFile = await file.readAndroidAppBuildGradle(androidConfigFile);

  if (!androidAppBuildGradleFile) {
    log.warn(
      'Could not find an app level "build.gradle" file, unable to check whether Google Services plugin has been registered',
    );
  } else {
    // Check whether plugin has been registered
    // TODO should be regex to check for commented out...
    if (!androidAppBuildGradleFile.includes("apply plugin: 'com.google.gms.google-services'")) {
      log.info(
        'Google Services plugin has not been registered, updating "/android/app/build.gradle"',
      );
      await file.writeAndroidAppBuildGradle(
        androidConfigFile,
        `${androidAppBuildGradleFile}
apply plugin: 'com.google.gms.google-services'`,
      );
    }
  }
}
