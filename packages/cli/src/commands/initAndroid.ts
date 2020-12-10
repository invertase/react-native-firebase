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
    getDependencyList,
    getPluginList,
} from '../actions/handleGradle';
import { getAndroidConfig } from '../actions/getConfig';
import { Config } from '@react-native-community/cli-types';
import validateGoogleServices from '../actions/validateGoogleServices';
import { GradleFile } from '../helpers/gradle';

export default async function initAndroid(
    account: Account,
    projectDetail: ProjectDetail,
    reactNativeConfig: Config,
) {
    log.info('Setting up Firebase for your Android app..');

    const androidProjectConfig = getAndroidConfig(reactNativeConfig);

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

    let writeNewGoogleServices;
    const androidGoogleServicesFile = await file.readAndroidGoogleServices(androidProjectConfig);
    if (androidGoogleServicesFile) {
        const validationError = validateGoogleServices(
            androidGoogleServicesFile,
            projectDetail,
            selectedAndroidApp,
        );
        if (validationError) {
            log.warn(
                `An Android "google-services.json" file already exists, but is invalid for the selected app: ${validationError}`,
            );
            writeNewGoogleServices = await prompt.confirm('Do you want to replace this file?');
        } else {
            writeNewGoogleServices = await prompt.confirm(
                'An Android "google-services.json" file already exists, do you want to replace this file?',
            );
        }
    } else {
        writeNewGoogleServices = true;
        log.warn('No "google-services.json" file found.');
    }

    if (writeNewGoogleServices) {
        // Fetch the config file for the app
        const androidConfigFile = await firebase
            .api(account)
            .management.getAppConfig(selectedAndroidApp.name);
        // Write the config file
        log.info('Writing new "google-services.json" file to "/android/app/google-services.json".');
        await file.writeAndroidGoogleServices(androidProjectConfig, androidConfigFile);
    }

    // Read the "/android/build.gradle" file from the users project
    const androidBuildGradleFile = await file.readAndroidBuildGradle(androidProjectConfig);
    if (!androidBuildGradleFile) {
        log.warn('Could not find an Android "build.gradle" file, unable to check for dependencies');
    } else {
        const gradleFile = new GradleFile(androidBuildGradleFile);
        const dependencies = getDependencyList(reactNativeConfig);
        for (const dependency of dependencies)
            await handleGradleDependency(dependency[0], dependency[1], gradleFile);

        if (androidBuildGradleFile != gradleFile.fileText) {
            log.info('Writing new "build.gradle" file to "/android/build.gradle".');
            await file.writeAndroidBuildGradle(androidProjectConfig, gradleFile.fileText);
        }
    }

    // Read the "/android/app/build.gradle" file
    const androidAppBuildGradleFile = await file.readAndroidAppBuildGradle(androidProjectConfig);
    if (!androidAppBuildGradleFile) {
        log.warn(
            'Could not find an app level "build.gradle" file, unable to check for registered plugins',
        );
    } else {
        const gradleFile = new GradleFile(androidAppBuildGradleFile);
        const plugins = getPluginList(reactNativeConfig);
        for (const plugin of plugins)
            handleGradlePlugin(plugin[0], plugin[1], plugin[2], gradleFile);

        if (androidAppBuildGradleFile != gradleFile.fileText) {
            log.info('Writing new "build.gradle" file to "/android/app/build.gradle".');
            await file.writeAndroidAppBuildGradle(androidProjectConfig, gradleFile.fileText);
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
            const exists = androidAppConfigShaList.find(
                (sha: AndroidSha) => sha.shaHash === shaKey,
            );

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
