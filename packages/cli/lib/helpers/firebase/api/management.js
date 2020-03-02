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
   * @param bypass
   * @returns {Promise<*>}
   */
  async function getProject(projectId, bypass) {
    const requestOptionsGet = {
      url: `${BASE_URL}/projects/${projectId}`,
    };

    const requestOptionsApps = {
      url: `${BASE_URL}/projects/${projectId}:searchApps`,
    };

    const cacheOptionsGet = {
      bypass,
      key: keyWithDomainPrefix(DOMAIN, `project:${projectId}`),
      ttl: Cache.hours(72),
    };

    const cacheOptionsApps = {
      bypass,
      key: keyWithDomainPrefix(DOMAIN, `project:${projectId}:apps`),
      ttl: Cache.hours(12),
    };

    const project = await request(account, requestOptionsGet, cacheOptionsGet);

    if (project) {
      project.apps = await request(account, requestOptionsApps, cacheOptionsApps);
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

  return {
    getProject,
    getProjects,
  };
};
