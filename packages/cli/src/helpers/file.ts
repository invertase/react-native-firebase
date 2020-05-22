import { readFile, writeFile, stat, statSync, PathLike } from 'fs';
import { URL } from 'url';
import { promiseDefer } from './utils';
import { AndroidProjectConfig, Config, IOSProjectConfig } from '@react-native-community/cli-types';
import { join } from 'path';
import { addModified } from './tracker';

/**
 * Check a file exists at the specified path.
 *
 * @param path
 * @returns Promise<Boolean>
 */
function exists(path: string) {
  const { promise, resolve } = promiseDefer<boolean>();
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
function read(path: string | Buffer | URL): Promise<string> {
  const { promise, resolve, reject } = promiseDefer<string>();
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
function write(path: PathLike, data: any): Promise<void> {
  const { promise, resolve, reject } = promiseDefer<void>();
  writeFile(path, data, error => (error ? reject(error) : resolve()));
  addModified(path);
  return promise;
}

/**
 * Returns the "google-services.json" file for the project. Returns "null" if it doesnt exist
 *
 * @param androidProjectConfig
 */
async function readAndroidGoogleServices(
  androidProjectConfig: AndroidProjectConfig,
): Promise<string | null> {
  const androidFirebaseConfigFilePath = join(
    androidProjectConfig.sourceDir,
    'google-services.json',
  );

  const fileExists = exists(androidFirebaseConfigFilePath);
  if (!fileExists) return null;
  return read(androidFirebaseConfigFilePath);
}

/**
 * Writes a new "google-services.json" file to the project
 *
 * @param androidProjectConfig
 * @param data
 */
function writeAndroidGoogleServices(androidProjectConfig: AndroidProjectConfig, data: string) {
  const androidFirebaseConfigFilePath = join(
    androidProjectConfig.sourceDir,
    'google-services.json',
  );
  return write(androidFirebaseConfigFilePath, data);
}

/**
 * Returns the "build.gradle" file. Returns null if it doesnt exist
 *
 * @param androidProjectConfig
 */
function readAndroidBuildGradle(androidProjectConfig: AndroidProjectConfig) {
  const androidBuildGradleFilePath = join(androidProjectConfig.sourceDir, '..', 'build.gradle');
  console.log(androidBuildGradleFilePath);
  const fileExists = exists(androidBuildGradleFilePath);
  if (!fileExists) return null;
  return read(androidBuildGradleFilePath);
}

/**
 * Writes a new "build.gradle" file to the project
 * @param androidProjectConfig
 * @param data
 */
function writeAndroidBuildGradle(androidProjectConfig: AndroidProjectConfig, data: string) {
  const androidBuildGradleFilePath = join(androidProjectConfig.sourceDir, '..', 'build.gradle');
  return write(androidBuildGradleFilePath, data);
}

/**
 * Returns the app level "build.gradle" file. Returns null if it doesnt exist
 *
 * @param androidProjectConfig
 */
function readAndroidAppBuildGradle(androidProjectConfig: AndroidProjectConfig) {
  const fileExists = exists(androidProjectConfig.buildGradlePath);
  if (!fileExists) return null;
  return read(androidProjectConfig.buildGradlePath);
}

/**
 * Writes a new app level "build.gradle" file to the project
 * @param androidProjectConfig
 * @param data
 */
function writeAndroidAppBuildGradle(androidProjectConfig: AndroidProjectConfig, data: string) {
  return write(androidProjectConfig.buildGradlePath, data);
}

async function readIosGoogleServices(iosProjectConfig: IOSProjectConfig): Promise<string | null> {
  return null;
}

export default {
  exists,
  existsSync,
  read,
  write,
  readAndroidGoogleServices,
  writeAndroidGoogleServices,
  readAndroidBuildGradle,
  writeAndroidBuildGradle,
  readAndroidAppBuildGradle,
  writeAndroidAppBuildGradle,
  readIosGoogleServices,
};
