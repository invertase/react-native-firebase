import firebase from '../helpers/firebase';
import { IOSProjectConfig } from '@react-native-community/cli-types';
import { Account } from '../types/firebase';
import log from '../helpers/log';
import prompt from '../helpers/prompt';
import file from '../helpers/file';

export default async function generateCredentialsConfig(
    iosProjectConfig: IOSProjectConfig,
    account: Account,
    appName: string,
) {
    const iosAppDelegateFile = await file.readIOSAppDelegate(iosProjectConfig);

    const promptMessage =
        'An iOS "AppDelegate.m" file already exists, do you want to replace this file?';

    const writeFile = !iosAppDelegateFile || (await prompt.confirm(promptMessage));

    if (writeFile) {
        log.info('Updating new "AppDelegate.m" file to "/ios/AppDelegate.m".');
        return file.writeIOSAppDelegate(iosProjectConfig);
    }

    return Promise.resolve();
}
