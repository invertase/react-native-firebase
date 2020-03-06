const { request, keyWithDomainPrefix } = require('./common');

const DOMAIN = 'firebase.googleapis.com';
const BASE_URL = `https://${DOMAIN}/v1beta1`;
const Cache = require('../../cache');

/**
 * Returns a management API instance specific to the account provided.
 *
 * @param account
 * @return {{getProject: (function(*, *): *), getProjects: (function(*=): (Promise<*>|*))}}
 */
module.exports = function managementApiWithAccount(account) {
  /**
   * Get detailed project information for the specified projectId,
   * includes a clients summary list.
   *
   * @param projectId
   * @param platforms
   * @param bypass
   * @returns {Promise<*>}
   */
  async function getProject(projectId, apps, bypass) {
    const requestOptionsGet = {
      url: `${BASE_URL}/projects/${projectId}`,
    };

    const cacheOptionsGet = {
      bypass,
      key: keyWithDomainPrefix(DOMAIN, `project:${projectId}`),
      ttl: Cache.hours(72),
    };

    const project = await request(account, requestOptionsGet, cacheOptionsGet);

    if (project) {
      project.apps = {};

      if (apps.android) {
        project.apps.android =
          (await request(
            account,
            {
              url: `${BASE_URL}/projects/${projectId}/androidApps`,
            },
            {
              bypass,
              key: keyWithDomainPrefix(DOMAIN, `project:${projectId}:androidApps`),
              ttl: Cache.hours(12),
            },
          )).apps || [];
      }

      if (apps.ios) {
        project.apps.ios =
          (await request(
            account,
            {
              url: `${BASE_URL}/projects/${projectId}/iosApps`,
            },
            {
              bypass,
              key: keyWithDomainPrefix(DOMAIN, `project:${projectId}:iosApps`),
              ttl: Cache.hours(12),
            },
          )).apps || [];
      }

      if (apps.web) {
        project.apps.web =
          (await request(
            account,
            {
              url: `${BASE_URL}/projects/${projectId}/webApps`,
            },
            {
              bypass,
              key: keyWithDomainPrefix(DOMAIN, `project:${projectId}:webApps`),
              ttl: Cache.hours(12),
            },
          )).apps || [];
      }
    }

    return project;
  }

  /**
   * Retrieve all firebase projects for the specified account
   *
   * @param bypass
   * @returns {Promise<*>}
   */
  async function getProjects(bypass = false) {
    const requestOptions = {
      url: `${BASE_URL}/projects`,
      params: {
        // TODO: handle pagination
        pageSize: 100,
      },
    };

    const cacheOptions = {
      bypass,
      key: keyWithDomainPrefix(DOMAIN, 'projects'),
      ttl: Cache.hours(72),
    };

    return request(account, requestOptions, cacheOptions);
  }

  async function getAppConfig(appName) {
    const configFile = await request(account, {
      url: `${BASE_URL}/${appName}/config`,
    });

    return Buffer.from(configFile.configFileContents, 'base64').toString('utf-8');
  }

  async function getAndroidAppConfigShaList(appName) {
    return request(account, {
      url: `${BASE_URL}/${appName}/sha`,
    });
  }

  return {
    getProject,
    getProjects,
    getAppConfig,
    getAndroidAppConfigShaList,
  };
};
