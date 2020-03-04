const API_INSTANCE_CACHE = {};

/**
 * Returns a Firebase.api instance for the specified account.
 *
 * @param account
 * @return {*}
 */
module.exports = function apiForAccount(account) {
  if (API_INSTANCE_CACHE[account.user.sub]) {
    return API_INSTANCE_CACHE[account.user.sub];
  }

  const newInstance = {
    management: require('./management')(account),
  };

  API_INSTANCE_CACHE[account.user.sub] = newInstance;

  return newInstance;
};
