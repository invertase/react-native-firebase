const ora = require('ora');

/**
 * @link https://github.com/sindresorhus/ora
 */
module.exports = {
  /**
   * Create a terminal spinner with text or options.
   *
   * @param args
   * @returns {*|Ora}
   */
  create(...args) {
    return ora(...args);
  },

  /**
   * Create a spinner for a promise. The spinner is stopped with .succeed() if the promise
   * fulfills or with .fail() if it rejects. Returns the spinner instance.
   *
   * @param args
   * @returns {*|Ora}
   */
  forPromise(...args) {
    return ora.promise(...args);
  },
};
