import { request } from './common';
import {
    Account,
    AndroidSha,
    Project,
    ProjectDetail,
    AndroidApp,
    ShaCertificateType,
} from '../../../types/firebase';
import { Apps } from '../../../types/cli';
import { withParameter } from '../../utils';
import CliError from '../../error';

const DOMAIN = 'firebase.googleapis.com';
const BASE_URL = `https://${DOMAIN}/v1beta1`;

/**
 * Returns a project by the ID, with apps if provided
 *
 * @param account
 * @param projectId
 * @param apps
 */
async function getProject(account: Account, projectId: string, apps: Apps): Promise<ProjectDetail> {
    const requestOptionsGet = {
        url: `${BASE_URL}/projects/${projectId}`,
    };

    const project = await request(account, requestOptionsGet);

    if (project) {
        project.apps = {};

        if (apps.android) {
            project.apps.android =
                (
                    await request(account, {
                        url: `${BASE_URL}/projects/${projectId}/androidApps`,
                    })
                ).apps || [];
        }

        if (apps.ios) {
            project.apps.ios =
                (
                    await request(account, {
                        url: `${BASE_URL}/projects/${projectId}/iosApps`,
                    })
                ).apps || [];
        }

        if (apps.web) {
            project.apps.web =
                (
                    await request(account, {
                        url: `${BASE_URL}/projects/${projectId}/webApps`,
                    })
                ).apps || [];
        }
    }

    return project;
}

/**
 * Retrieve all firebase projects for the specified account
 *
 * @returns {Promise<*>}
 */
async function getProjects(account: Account): Promise<Project[]> {
    const requestOptions = {
        url: `${BASE_URL}/projects`,
        params: {
            // TODO: handle pagination
            pageSize: 100,
        },
    };

    return request(account, requestOptions).then(r => r.results as Project[]);
}

/**
 *
 * @param account
 * @param appName
 */
async function getAppConfig(account: Account, appName: string) {
    const configFile = await request(account, {
        url: `${BASE_URL}/${appName}/config`,
    });

    return Buffer.from(configFile.configFileContents, 'base64').toString('utf-8');
}

/**
 * Gets the SHA Android keys for an app
 * @param account
 * @param appName
 */
async function getAndroidAppConfigShaList(
    account: Account,
    projectDetailAndroidApp: AndroidApp,
): Promise<AndroidSha[]> {
    return request(account, {
        url: `${BASE_URL}/${projectDetailAndroidApp.name}/sha`,
    }).then($ => $.certificates || []);
}

/**
 *
 * @param account
 * @param projectDetail
 * @param packageName
 */
async function createAndroidApp(
    account: Account,
    projectDetail: ProjectDetail,
    packageName: string,
    displayName: string,
) {
    // TODO: use an actual ID
    const appId = 'SomeId';
    const androidApp: AndroidApp = {
        name: `${projectDetail.name}/androidApps/${appId}`,
        appId,
        displayName,
        projectId: projectDetail.projectId,
        packageName,
    };
    const operation = await request(account, {
        url: `${BASE_URL}/${projectDetail.name}/androidApps`,
        method: 'post',
        data: androidApp,
    });

    return operation.response;
}

async function createAndroidSha(
    account: Account,
    projectDetailAndroidApp: AndroidApp,
    hash: string,
) {
    hash = hash.toUpperCase();
    if (!hash.match(/^[0-9a-f]{2}(:[0-9a-f]{2})*$/))
        throw new CliError(
            'Invalid SHA hash format. Bytes need to be in hex and seperated by colons.',
        );
    const hashParts = hash.split(':');
    let type: ShaCertificateType;
    if (hashParts.length == 20) type = 'SHA_1';
    else if (hashParts.length == 32) type = 'SHA_256';
    else throw new CliError('Invalid SHA hash type. Only SHA-1 and SHA-256 are allowed.');

    // TODO: use an actual ID
    const shaId = 'SomeId';
    const shaCertificate: AndroidSha = {
        name: `${projectDetailAndroidApp.name}/sha/${shaId}`,
        shaHash: hash,
        certType: type,
    };
    const operation = await request(account, {
        url: `${BASE_URL}/${projectDetailAndroidApp.name}/sha`,
        method: 'post',
        data: shaCertificate,
    });

    return operation.response;
}

/**
 *
 * @param account
 */
export default function managementApiWithAccount(account: Account) {
    const functions = {
        getProjects,
        getProject,
        getAppConfig,
        getAndroidAppConfigShaList,
        createAndroidApp,
        createAndroidSha,
    };

    return withParameter(functions, account);
}
