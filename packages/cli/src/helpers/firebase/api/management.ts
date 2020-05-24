import { request, keyWithDomainPrefix } from './common';
import Cache from '../../cache';
import { Account, AndroidSha, Project, ProjectDetail } from '../../../types/firebase';
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
 * @param appName
 */
async function createAndroidApp(
  account: Account,
  projectId: string,
  packageName: string,
  displayName: string,
) {
  const androidApp = {
    name: '',
    appId: '',
    displayName: displayName,
    projectId: projectId,
    packageName: packageName,
  };
  const operation = await request(account, {
    url: `${BASE_URL}/projects/${projectId}/androidApps`,
    method: 'post',
    data: androidApp,
  });

  return operation;
}

/**
 *
 * @param account
 */
export default function managementApiWithAccount(account: Account) {
  return {
    getProjects: () => getProjects(account),
    getProject: (projectId: string, apps: Apps) => getProject(account, projectId, apps),
    getAppConfig: (appName: string) => getAppConfig(account, appName),
    getAndroidAppConfigShaList: (appName: string) => getAndroidAppConfigShaList(account, appName),
    createAndroidApp: (appName: string) => createAndroidApp(account, appName),
  };
}
