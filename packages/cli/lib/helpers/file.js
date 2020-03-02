const { readFile, writeFile, stat, statSync } = require('fs');
const { promiseDefer } = require('./utils');

module.exports = {
  /**
   * Check a file exists at the specified path.
   *
   * @param path
   * @returns Promise<Boolean>
   */
  exists(path) {
    const { promise, resolve } = promiseDefer();
    stat(path, {}, e => (e ? resolve(false) : resolve(true)));
    return promise;
  },

  /**
   * Check a file exists at the specified path.
   *
   * @param path
   * @returns Boolean
   */
  existsSync(path) {
    try {
      statSync(path);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Read a file asynchronously
   *
   * @link https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback
   * @param args
   * @returns Promise
   */
  read(...args) {
    const { promise, resolve, reject } = promiseDefer();
    readFile(args[0], Object.assign({ encoding: 'utf8' }, args[1] || {}), (e, r) =>
      e ? reject(e) : resolve(r),
    );
    return promise;
  },

  /**
   * Write a file asynchronously
   *
   * @link https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
   * @param args
   * @returns Promise
   */
  write(...args) {
    const { promise, resolve, reject } = promiseDefer();
    writeFile(...args, (e, r) => (e ? reject(e) : resolve(r)));
    return promise;
  },
};
