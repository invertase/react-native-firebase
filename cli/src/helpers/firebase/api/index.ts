import { Account } from '../../../types/firebase';

const API_INSTANCE_CACHE: { [key: string]: any } = {}; // todo any type

/**
 * Returns a Firebase.api instance for the specified account.
 *
 * @param account
 * @return {*}
 */
function apiForAccount(account: Account) {
    if (API_INSTANCE_CACHE[account.user.sub]) {
        return API_INSTANCE_CACHE[account.user.sub];
    }

    const newInstance = {
        management: require('./management').default(account),
    };

    API_INSTANCE_CACHE[account.user.sub] = newInstance;

    return newInstance;
}

export default apiForAccount;
