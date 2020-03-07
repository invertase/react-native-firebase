import Chalk from 'chalk';
import Store from '../store';
import Cache from '../cache';

// TODO how does this work?
const authWithBrowser = (() => require('./auth-browser').bind(null, module.exports))();

/**
 *
 * @param sub
 * @returns {*}
 */
function getAccount(sub?: any) {
  const _sub = sub || getAccountId();
  if (!_sub) {
    return undefined;
  }
  return Store.get(`account.${_sub}`);
}

/**
 *
 * @returns {null|*}
 */
function getAccountId(): null | string {
  return Store.get('selected_account');
}

/**
 *
 * @param email
 */
function getAccountByEmail(email: string) {
  const accounts = getAccounts();
  if (!accounts.length) {
    return undefined;
  }

  for (let i = 0; i < accounts.length; i = i + 1) {
    const account = accounts[i];
    if (account.user.email === email) {
      return account;
    }
  }

  return undefined;
}

/**
 *
 */
function getAccounts(): any[] {
  return Object.values(Store.get('account') || {});
}

/**
 *
 */
function getEmails(): string[] {
  return getAccounts().map(a => a.user.email);
}

/**
 *
 * @param email
 */
function hasAccountForEmail(email: string) {
  return getEmails().includes(email);
}

/**
 *
 * @param account
 */
function removeAccount(account: any) {
  if (!account) {
    return "The account you're looking for no longer exists or none was provided.";
  }

  const { sub, email } = account.user;

  // remove from disk store
  Store.delete(`account.${sub}`);

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
}

/**
 *
 */
function removeAllAccounts() {
  const accounts = getAccounts();

  for (let i = 0; i < accounts.length; i = i + 1) {
    removeAccount(accounts[i]);
  }

  return `${Chalk.cyanBright(accounts.length)} account(s) removed.`;
}

/**
 *
 * @param account: { user, tokens }
 */
function addAccount(account: any) {
  Store.set(`account.${account.user.sub}`, account);
  clearAccountCache(account);

  if (!Store.has('selected_account')) {
    setDefaultAccount(account);
  }

  return `New account added [${Chalk.cyanBright(getEmail(account.user.sub))}]`;
}

/**
 *
 * @param account
 * @return {string}
 */
function setDefaultAccount(account: any) {
  Store.set('selected_account', account.user.sub);
  return `Default account set to [${Chalk.cyanBright(getEmail(account.user.sub))}]`;
}

/**
 *
 * @param sub
 */
function getEmail(sub: any): string | undefined {
  const account = getAccount(sub);
  return account ? account.user.email : undefined;
}

/**
 * Clears all cache items relating to the provided account
 */
function clearAccountCache(account: any): void {
  return Cache.delete(`firebase.${account.user.sub}`);
}

export default {
  authWithBrowser,
  getAccount,
  getAccountId,
  getAccountByEmail,
  getAccounts,
  getEmails,
  hasAccountForEmail,
  removeAccount,
  removeAllAccounts,
  addAccount,
  setDefaultAccount,
  getEmail,
  clearAccountCache,
};
