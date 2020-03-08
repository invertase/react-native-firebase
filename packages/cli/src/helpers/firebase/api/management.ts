import { request, keyWithDomainPrefix } from './common';
import Cache from '../../cache';
import { Account } from '../../../types/firebase';
import { Apps } from '../../../types/cli';

const DOMAIN = 'firebase.googleapis.com';
const BASE_URL = `https://${DOMAIN}/v1beta1`;

/**
 * Returns a project by the ID, with apps if provided
 *
 * @param account
 * @param projectId
 * @param apps
 */
async function getProject(account: Account, projectId: string, apps: Apps) {
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
async function getProjects(account: Account) {
  const requestOptions = {
    url: `${BASE_URL}/projects`,
    params: {
      // TODO: handle pagination
      pageSize: 100,
    },
  };

  return request(account, requestOptions);
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
async function getAndroidAppConfigShaList(account: Account, appName: string) {
  return request(account, {
    url: `${BASE_URL}/${appName}/sha`,
  });
}

/**
 *
 * @param account
 */
export default function managementApiWithAccount(account: Account) {
  return {
    getProject: (projectId: string, apps: Apps) => getProject(account, projectId, apps),
    getProjects: () => getProjects(account),
    getAppConfig: (appName: string) => getAppConfig(account, appName),
    getAndroidAppConfigShaList: (appName: string) => getAndroidAppConfigShaList(account, appName),
  };
}
