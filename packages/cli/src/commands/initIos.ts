import { Config } from '@react-native-community/cli-types';
import { Account, ProjectDetail } from '../types/firebase';
import log from '../helpers/log';
import { getIosConfig } from '../actions/getConfig';

import file from '../helpers/file';
import { getIOSApp } from '../actions/getApp';

import generatePlist from '../actions/generatePlist';
import generateCredentials from '../actions/generateCredentials';

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
        // TODO: Need to create a new app
    }

    console.log('iosProjectConfig >>>>', iosProjectConfig);

    await generatePlist(iosProjectConfig, account, selectedIOSApp?.name as string);

    await generateCredentials(iosProjectConfig, account, selectedIOSApp?.name as string);

    log.info('The Firebase setup for iOS has finished');
}
