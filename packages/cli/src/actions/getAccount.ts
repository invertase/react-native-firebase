import Chalk from 'chalk';
import firebase from '../helpers/firebase';
import { Account } from '../types/firebase';
import log from '../helpers/log';
import prompt from '../helpers/prompt';
import CliError from '../helpers/error';

export default async function getAccount(): Promise<Account> {
    // fetch users account
    let account = firebase.auth.getAccount();

    if (account) {
        const cont = await prompt.confirm(
            `You're already logged into Firebase as ${Chalk.cyanBright(
                `[${account.user.email}]`,
            )}. Continue with this account?`,
        );

        if (cont) return account;
    } else {
        log.info('No existing Firebase account was detected.');
    }

    log.info(
        'To continue, sign-in to your Google account which owns the Firebase project you wish to setup:',
    );
    await firebase.auth.authWithBrowser();

    account = firebase.auth.getAccount();
    if (!account) throw new CliError('Something went wrong using your Firebase account');

    return account;
}
