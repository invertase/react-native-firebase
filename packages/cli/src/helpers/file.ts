import { readFile, writeFile, stat, statSync } from 'fs';
import { promiseDefer } from './utils';
import { URL } from 'url';

/**
 * Check a file exists at the specified path.
 *
 * @param path
 * @returns Promise<Boolean>
 */
function exists(path: string) {
  const { promise, resolve } = promiseDefer();
  stat(path, e => (e ? resolve(false) : resolve(true)));
  return promise;
}

/**
 * Check a file exists at the specified path.
 *
 * @param path
 * @returns Boolean
 */
function existsSync(path: string): boolean {
  try {
    statSync(path);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Read a file asynchronously
 *
 * @link https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback
 * @returns Promise
 * @param path
 */
function read(path: string | Buffer | URL) {
  const { promise, resolve, reject } = promiseDefer();
  readFile(path, { encoding: 'utf8' }, (e, r) => (e ? reject(e) : resolve(r)));
  return promise;
}

/**
 * Write a file asynchronously
 *
 * @link https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
 * @returns Promise
 * @param path
 * @param data
 */
function write(path: string | Buffer | URL, data: any) {
  const { promise, resolve, reject } = promiseDefer();
  writeFile(path, data, error => (error ? reject(error) : resolve(error)));
  return promise;
}

export default { exists, existsSync, read, write };
