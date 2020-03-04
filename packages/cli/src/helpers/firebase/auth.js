const Chalk = require('chalk');
const Store = require('../store.js');
const Cache = require('../cache.js');

module.exports = {
  get authWithBrowser() {
    return require('./auth-browser').bind(null, module.exports);
  },

  /**
   *
   * @param sub
   * @returns {*}
   */
  getAccount(sub) {
    const _sub = sub || module.exports.getAccountId();
    if (!_sub) {
      return undefined;
    }
    return Store.get(`account.${_sub}`);
  },

  /**
   *
   * @returns {null|*}
   */
  getAccountId() {
    return Store.get('selected_account');
  },

  /**
   *
   * @param email
   * @returns {*}
   */
  getAccountByEmail(email) {
    const accounts = module.exports.getAccounts();
    if (!accounts.length) {
      return undefined;
    }

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      if (account.user.email === email) {
        return account;
      }
    }

    return undefined;
  },

  /**
   *
   * @returns {any[]}
   */
  getAccounts() {
    return Object.values(Store.get('account') || {});
  },

  /**
   *
   * @returns {any[]}
   */
  getEmails() {
    return module.exports.getAccounts().map(a => a.user.email);
  },

  /**
   *
   * @param email
   * @returns {boolean}
   */
  hasAccountForEmail(email) {
    return module.exports.getEmails().includes(email);
  },

  /**
   *
   * @param account
   */
  removeAccount(account) {
    if (!account) {
      return "The account you're looking for no longer exists or none was provided.";
    }

    const { sub, email } = account.user;

    // remove from disk store
    Store.delete(`account.${sub}`, account);

    // remove all cached items for this account
    Cache.store.delete(`firebase.${sub}`);

    if (Store.get('selected_account') === sub) {
      const accounts = module.exports.getAccounts();
      if (accounts[0]) {
        module.exports.setDefaultAccount(accounts[0]);
      } else {
        Store.delete('selected_account');
      }
    }

    return `Account removed for email [${Chalk.cyanBright(email)}].`;
  },

  /**
   *
   * @returns {string}
   */
  removeAllAccounts() {
    const accounts = module.exports.getAccounts();

    for (let i = 0; i < accounts.length; i++) {
      module.exports.removeAccount(accounts[i]);
    }

    return `${Chalk.cyanBright(accounts.length)} account(s) removed.`;
  },

  /**
   *
   * @param account: { user, tokens }
   */
  addAccount(account) {
    Store.set(`account.${account.user.sub}`, account);
    module.exports.clearAccountCache(account);

    if (!Store.has('selected_account')) {
      module.exports.setDefaultAccount(account);
    }

    return `New account added [${Chalk.cyanBright(module.exports.getEmail(account.user.sub))}]`;
  },

  /**
   *
   * @param account
   * @return {string}
   */
  setDefaultAccount(account) {
    Store.set('selected_account', account.user.sub);
    return `Default account set to [${Chalk.cyanBright(module.exports.getEmail())}]`;
  },

  /**
   *
   * @param sub
   * @returns {any}
   */
  getEmail(sub) {
    const account = module.exports.getAccount(sub);
    return account ? account.user.email : undefined;
  },

  /**
   * Clears all cache items relating to the provided account
   */
  clearAccountCache(account) {
    return Cache.delete(`firebase.${account.user.sub}`);
  },
};
