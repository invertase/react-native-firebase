import { request } from './common';
import {
  Account,
  AndroidSha,
  Project,
  ProjectDetail,
  ProjectDetailAndroidApp,
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
        (await request(account, {
          url: `${BASE_URL}/projects/${projectId}/androidApps`,
        })).apps || [];
    }

    if (apps.ios) {
      project.apps.ios =
        (await request(account, {
          url: `${BASE_URL}/projects/${projectId}/iosApps`,
        })).apps || [];
    }

    if (apps.web) {
      project.apps.web =
        (await request(account, {
          url: `${BASE_URL}/projects/${projectId}/webApps`,
        })).apps || [];
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
  appName: string,
): Promise<AndroidSha[]> {
  return request(account, {
    url: `${BASE_URL}/${appName}/sha`,
  }).then($ => $.certificates);
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
  const androidApp: ProjectDetailAndroidApp = {
    name: `${projectDetail.name}/androidApps/SomeId`,
    appId: 'SomeId',
    displayName: displayName,
    projectId: projectDetail.projectId,
    packageName: packageName,
  };
  const operation = await request(account, {
    url: `${BASE_URL}/${projectDetail.name}/androidApps`,
    method: 'post',
    data: androidApp,
  });

  throw new CliError('Not implemented');
}

async function createAndroidSha(
  account: Account,
  projectDetailAndroidApp: ProjectDetailAndroidApp,
  hash: string,
) {
  hash = hash.toUpperCase();
  if (!hash.match(/^[0-9A-F]{2}(:[0-9A-F]{2})*$/))
    throw new CliError('Invalid SHA hash format. Bytes need to be in hex and seperated by colons.');
  const hashParts = hash.split(':');
  if (hashParts.length == 20) var type = 'SHA_1';
  else if (hashParts.length == 32) var type = 'SHA_256';
  else throw new CliError('Invalid SHA hash type. Only SHA-1 and SHA-256 are allowed.');

  const shaCertificate: AndroidSha = {
    name: `${projectDetailAndroidApp.name}/sha/SomeId`,
    shaHash: hash,
    certType: 'SHA_1',
  };
  const operation = await request(account, {
    url: `${BASE_URL}/${projectDetailAndroidApp.name}/sha`,
    method: 'post',
    data: shaCertificate,
  });

  throw new CliError('Not implemented');
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
