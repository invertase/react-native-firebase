import firebase from '../helpers/firebase';
import { IOSProjectConfig } from '@react-native-community/cli-types';
import { Account } from '../types/firebase';
import log from '../helpers/log';
import prompt from '../helpers/prompt';
import file from '../helpers/file';

export default async function generatePlistConfig(
    iosProjectConfig: IOSProjectConfig,
    account: Account,
    appName: string,
) {
    const iosGoogleServicesFile = await file.readIosGoogleServiceInfo(iosProjectConfig);

    const promptMessage =
        'An iOS "GoogleService-Info.plist" file already exists, do you want to replace this file?';

    const writeFile = !iosGoogleServicesFile || (await prompt.confirm(promptMessage));

    if (writeFile) {
        const iOSConfigFile = await firebase.api(account).management.getAppConfig(appName);

        log.info('Writing new "GoogleService-Info.plist" file to "/ios/GoogleService-Info.plist".');
        return file.writeGoogleServiceInfoPlist(iosProjectConfig, iOSConfigFile);
    }

    return Promise.resolve();
}
