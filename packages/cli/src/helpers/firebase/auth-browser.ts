import http from 'http';
import { join } from 'path';
import { parse as urlParse } from 'url';
import { parse as qsParse } from 'querystring';

import A2A from 'a2a';
import Chalk from 'chalk';
import { decode } from 'jsonwebtoken';
import { getPortPromise } from 'portfinder';
import { OAuth2Client } from 'google-auth-library';

import File from '../file';
import Open from '../open';
import Spinner from '../spinner';
import { promiseDefer } from '../utils';
import { TemplateTypes } from '../../types/cli';
import { Account, Tokens, User } from '../../types/firebase';

const OAUTH_CONFIG = {
    client_id: '467090028974-obb90livofalo0lmjq3n4agk7bocrrs8.apps.googleusercontent.com',
    client_secret: 'ktxgTUEr42PVVU4oD9Bk7ahn',
};

const DEFAULT_SCOPES = [
    'email',
    'openid',
    'https://www.googleapis.com/auth/firebase',
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/cloudplatformprojects.readonly',
];

/**
 * Read the contents of the specified html file in the responses directory
 *
 * @param name
 * @returns {Promise<void>}
 */
async function getResponseHtml(name: TemplateTypes) {
    const filePath = join(__dirname, `../../../templates/login-${name}.html`);
    return File.read(filePath);
}

/**
 *
 * @param auth
 */
// todo how to type this?
async function authWithBrowser(auth: any) {
    const requestDeferred = promiseDefer<Parameters<http.RequestListener>>();

    // get an available/free port on the OS
    const port = await getPortPromise();

    // create a new google OAuth2Client with the free port
    const oAuth2Client = new OAuth2Client(
        OAUTH_CONFIG.client_id,
        OAUTH_CONFIG.client_secret,
        `http://localhost:${port}/oauth2callback`,
    );

    // generate the url that will be used for the consent dialog
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        response_type: 'code',
        include_granted_scopes: true,
        scope: DEFAULT_SCOPES,
    });

    // open an http server to accept the oauth callback
    // only requests to /oauth2callback?code=<code> are accepted
    const server = http.createServer(async (req, res) => {
        if (req && req.url && req.url.indexOf('/oauth2callback') > -1) {
            requestDeferred.resolve([req, res]);
        }
    });

    server.listen(port);

    // open the url in the users browser to begin sign-in flow
    Open.openUrl(authorizeUrl);

    /* eslint no-console: ["error", { allow: ["log"] }] */
    console.log('');
    console.log('Your browser should now open to the following URL: ');
    console.log('');
    console.log(Chalk.underline.blue(authorizeUrl));
    console.log('');

    const spinner = Spinner.create('Waiting for browser authentication to complete');

    spinner.start();

    try {
        // wait for the oauth callback to be called after consent granted
        const [req, res] = await requestDeferred.promise;

        // parse the request url and extract authorisation code
        let queryStr;
        if (!req.url || !(queryStr = urlParse(req.url).query))
            throw new Error('Invalid authentication response received');

        let { code } = qsParse(queryStr);
        if (Array.isArray(code)) code = code[0];

        // respond to the browser and close http server
        const html = await getResponseHtml(code ? 'success' : 'failure');
        res.writeHead(code ? 200 : 500, {
            'Content-Type': 'text/html',
        });
        res.end(html);
        req.socket.destroy();
        server.close();

        if (!code) throw new Error('Failed authentication response received');

        // exchange access token
        const [tokenError, response] = await A2A(oAuth2Client.getToken(code));
        if (tokenError || !response?.tokens?.id_token) {
            throw new Error('Invalid authentication tokens received');
        }
        const { tokens } = response;
        const { id_token } = response.tokens;

        oAuth2Client.setCredentials(tokens);

        // TODO should probably do a test request e.g. get projects list to confirm valid access
        const result: Account = {
            user: decode(id_token) as User,
            tokens: tokens as Tokens,
        };

        auth.addAccount(result);
        spinner.succeed(
            `Successfully added account ${Chalk.cyanBright(`[${result.user.email}]`)}!`,
        );

        console.log('');

        return Promise.resolve({
            client: oAuth2Client,
            ...result,
        });
    } catch (err) {
        const error = err as Error;
        spinner.fail(
            `Error authenticating your account: ${error.message}. Please try again later.`,
        );
        return process.exit();
    }
}

export default authWithBrowser;
