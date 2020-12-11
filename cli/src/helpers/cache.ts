import ConfigStore from 'configstore';
const { name, version } = require('../../package.json');

const store = new ConfigStore(`${name}-cache`);

// wipe cache if cli version changes - to prevent cache issues
if (store.get('version') !== version) {
    store.clear();
    store.set('version', version);
}

export default {
    store,

    /**
     *
     * @param key
     * @param value
     * @param ttl
     * @returns {*}
     */
    set(key: string, ttl = 120, value: any) {
        if (arguments.length !== 3) {
            throw new Error('Invalid Cache.set args - requires 3 args: key, ttl and value.');
        }

        if (value === undefined) return value;
        return store.set(key, {
            key,
            value,
            expires: Date.now() + ttl * 1000,
        });
    },

    /**
     *
     * @param key
     */
    delete(key: string) {
        return store.delete(key);
    },

    /**
     *
     * @param key
     * @returns {*}
     */
    get(key: string): any {
        if (!store.has(key)) return undefined;
        const { expires, value } = store.get(key);

        if (expires < Date.now()) {
            return store.delete(key);
        }

        return value;
    },

    /**
     *
     */
    clear() {
        return store.clear();
    },

    /**
     * Wraps a promise for the purposes of caching a successful result.
     *
     * @param key
     * @param fnReturnsPromise A function that returns a promise (for deferring)
     * @param ttl
     * @param bypassCache
     * @returns {*}
     */
    promise(
        key: string,
        ttl = 120,
        fnReturnsPromise: () => Promise<any>,
        bypassCache = false,
    ): Promise<any> {
        if (arguments.length !== 4) {
            throw new Error(
                'Invalid Cache.promise args - requires 4 args: key, ttl, fnReturnsPromise and eager',
            );
        }

        const isCached = store.has(key) && !bypassCache;

        if (isCached && module.exports.get(key) !== undefined) {
            return Promise.resolve(module.exports.get(key));
        }

        return fnReturnsPromise().then(value => {
            module.exports.set(key, ttl, value);
            return value;
        });
    },

    /**
     * Returns the seconds for the given number of minutes
     *
     * @param number
     * @returns {number}
     */
    minutes(number: number): number {
        return number * 60;
    },

    /**
     * Returns the seconds for the given number of hours
     * @param number
     * @returns {number}
     */
    hours(number: number): number {
        return number * 60 * 60;
    },

    /**
     * Returns the seconds for the given number of days
     *
     * @param number
     * @returns {number}
     */
    days(number: number): number {
        return number * 24 * 60 * 60;
    },
};
