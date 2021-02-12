import Chalk from 'chalk';
import { OAuth2Client } from 'google-auth-library';

import Auth from '../auth';
import { Account } from '../../../types/firebase';

import Box from '../../box';
import Store from '../../store';

const OAUTH_CONFIG = {
    client_id: '467090028974-obb90livofalo0lmjq3n4agk7bocrrs8.apps.googleusercontent.com',
    client_secret: 'ktxgTUEr42PVVU4oD9Bk7ahn',
};

const OAUTH_CLIENT_CACHE: { [key: string]: any } = {}; // todo any type

/**
 * Prefixes the cache key string with the account id, ensuring caches are account specific
 *
 * @param account
 * @param key
 * @returns {string}
 */
function keyWithAccountPrefix(account: Account, key: string): string {
    return `firebase.${account.user.sub}:${key}`;
}

/**
 * Prefixes the cache key string with the FQDN.
 *
 * @param domain
 * @param key
 * @returns {string}
 */
function keyWithDomainPrefix(domain: string, key: string): string {
    return `${domain}:${key}`;
}

/**
 * Creates custom error printing boxes for common request errors.
 *
 * @param error
 * @param requestOptions
 * @param account
 * @returns {*}
 */
function handleRequestError(error: any, requestOptions: any, account: Account) {
    if (error.message.includes('entity was not found')) {
        error.print = () => {
            Box.warn(
                [
                    'The requested Firebase entity was not found.',
                    '',
                    `${Chalk.white.bold('Account:')} ${Chalk.cyanBright(account.user.email)}`,
                    '',
                    `${Chalk.white.bold('URL:')} ${Chalk.grey(requestOptions.url)}`,
                ],
                'Resource Not Found (404)',
            );

            return Promise.resolve();
        };
    }

    if (error.message.includes('caller does not have permission')) {
        error.print = () => {
            Box.warn(
                [
                    'The account specified does not have permission to view the requested Firebase resource.',
                    '',
                    `${Chalk.white.bold('Account:')} ${Chalk.cyanBright(account.user.email)}`,
                    '',
                    // @ts-ignore // TODO???
                    `${Chalk.white.bold('URL:')} ${Chalk.grey(request.url)}`,
                ],
                'Permission Denied for Resource (403)',
            );

            return Promise.resolve();
        };
    }

    if (!error.print) {
        error.print = () => {
            Box.errorWithStack(error);
            return Promise.resolve();
        };
    }

    return error;
}

/**
 * Returns an instance of an OAuth2 client for the provided account or the default account.
 *
 * Internally caches OAuth Clients.
 *
 * @param account
 * @returns {*}
 */
function getOAuthClient(account: Account) {
    const _account = account || Auth.getAccount();
    const { user, tokens } = _account;

    if (OAUTH_CLIENT_CACHE[user.sub]) {
        return OAUTH_CLIENT_CACHE[user.sub];
    }

    const oAuth2Client = new OAuth2Client(OAUTH_CONFIG.client_id, OAUTH_CONFIG.client_secret);

    oAuth2Client.setCredentials(tokens);
    OAUTH_CLIENT_CACHE[user.sub] = oAuth2Client;
    return oAuth2Client;
}

/**
 * Executes an http request via OauthClient for the provided account with caching.
 *
 * @param account
 * @param requestOptions
 */
async function request(account: Account, requestOptions: object) {
    const _account = account || Auth.getAccount();
    const oAuth2Client = getOAuthClient(_account);

    try {
        const requestResponse = await oAuth2Client.request(requestOptions).then((r: any) => r.data);

        Store.set(`account.${_account.user.sub}.tokens`, {
            ...oAuth2Client.credentials,
        });

        return requestResponse;
    } catch (requestError) {
        return Promise.reject(handleRequestError(requestError, requestOptions, account));
    }
}

export { request, getOAuthClient, keyWithAccountPrefix, keyWithDomainPrefix };
