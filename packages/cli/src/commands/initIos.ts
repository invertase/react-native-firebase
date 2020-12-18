import firebase from '../helpers/firebase';
import { Config } from '@react-native-community/cli-types';
import { Account, ProjectDetail } from '../types/firebase';
import log from '../helpers/log';
import { getIosConfig } from '../actions/getConfig';
import prompt from '../helpers/prompt';
import file from '../helpers/file';

import { getIOSApp } from '../actions/getApp';

export default async function initIos(
    account: Account,
    projectDetail: ProjectDetail,
    reactNativeConfig: Config,
) {
    const iosProjectConfig = getIosConfig(reactNativeConfig);

    log.info('Setting up Firebase for your iOS app..');
    const iOSFileProjectConfig = (await file.readIOSProjectPathConfig(
        iosProjectConfig.pbxprojPath,
    )) as any;

    let selectedIOSApp = getIOSApp(projectDetail, iOSFileProjectConfig.bundleId);

    if (!selectedIOSApp) {
        // Need to create a new app
    }

    const iosGoogleServicesFile = await file.readIosGoogleServiceInfo(iosProjectConfig);

    const writeFile =
        !iosGoogleServicesFile ||
        (iosGoogleServicesFile &&
            (await prompt.confirm(
                'An iOS "GoogleService-Info.plist" file already exists, do you want to replace this file?',
            )));

    if (writeFile) {
        const iOSConfigFile = await firebase
            .api(account)
            .management.getAppConfig(selectedIOSApp?.name);

        log.info('Writing new "GoogleService-Info.plist" file to "/ios/GoogleService-Info.plist".');
        await file.writeGoogleServiceInfoPlist(iosProjectConfig, iOSConfigFile);
    }

    log.info('The Firebase setup for iOS has finished');
}
