import ora from 'ora';

/**
 * @link https://github.com/sindresorhus/ora
 */
export default {
    /**
     * Create a terminal spinner with text or options.
     *
     * @returns {*|Ora}
     * @param options
     */
    create(options?: ora.Options | string): ora.Ora {
        return ora(options);
    },

    /**
     * Create a spinner for a promise. The spinner is stopped with .succeed() if the promise
     * fulfills or with .fail() if it rejects. Returns the spinner instance.
     *
     * @returns {*|Ora}
     * @param action
     * @param options
     */
    forPromise(action: PromiseLike<unknown>, options?: ora.Options | string): ora.Ora {
        return ora.promise(action, options);
    },
};
