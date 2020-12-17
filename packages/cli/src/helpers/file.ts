import { readFile, writeFile, stat, statSync, PathLike } from 'fs';
import { URL } from 'url';
import { promiseDefer } from './utils';
import { AndroidProjectConfig, Config, IOSProjectConfig } from '@react-native-community/cli-types';
import { join } from 'path';
import { addModified } from './tracker';
import { FirebaseConfig } from '../types/cli';
import xcode from 'xcode';

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

    const fileExists = await exists(androidFirebaseConfigFilePath);
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
async function readAndroidBuildGradle(androidProjectConfig: AndroidProjectConfig) {
    const fileExists = await exists(androidProjectConfig.buildGradlePath);
    if (!fileExists) return null;
    return read(androidProjectConfig.buildGradlePath);
}

/**
 * Writes a new "build.gradle" file to the project
 * @param androidProjectConfig
 * @param data
 */
function writeAndroidBuildGradle(androidProjectConfig: AndroidProjectConfig, data: string) {
    return write(androidProjectConfig.buildGradlePath, data);
}

/**
 * Returns the app level "build.gradle" file. Returns null if it doesnt exist
 *
 * @param androidProjectConfig
 */
async function readAndroidAppBuildGradle(androidProjectConfig: AndroidProjectConfig) {
    const androidAppBuildGradlePath = join(androidProjectConfig.sourceDir, 'app', 'build.gradle');
    const fileExists = await exists(androidAppBuildGradlePath);
    if (!fileExists) return null;
    return read(androidAppBuildGradlePath);
}

/**
 * Writes a new app level "build.gradle" file to the project
 * @param androidProjectConfig
 * @param data
 */
function writeAndroidAppBuildGradle(androidProjectConfig: AndroidProjectConfig, data: string) {
    const androidAppBuildGradlePath = join(androidProjectConfig.sourceDir, 'app', 'build.gradle');
    return write(androidAppBuildGradlePath, data);
}

/**
 * Returns
 *
 * @param projectPath
 */
async function readIOSProjectPathConfig(projectPath: string) {
    const fileExists = await exists(projectPath);
    if (!fileExists) return {};

    const proj = await xcode.project(projectPath);

    const config = await new Promise(resolve => {
        proj.parse((error: any, file: any) => {
            const { XCBuildConfiguration } = file.project.objects;

            // Multiple configs exist - Debug, Release. Select first (Debug).
            const envSettings = Object.values(XCBuildConfiguration)[0] as any;

            resolve({
                bundleId: envSettings.buildSettings.PRODUCT_BUNDLE_IDENTIFIER,
            });
        });
    });

    return config;
}

/**
 * Returns the "GoogleService-Info.plist" file for the project. Returns "null" if it doesnt exist
 *
 * @param iosProjectConfig
 */
async function readIosGoogleServices(iosProjectConfig: IOSProjectConfig): Promise<string | null> {
    if (!iosProjectConfig.plist) return null;
    return iosProjectConfig.plist[0];
}

/**
 * Overwrites the "GoogleService-Info.plist" file for the project.
 * @param iosProjectConfig
 * @param data
 */
function writeGoogleServiceInfoPlist(iosProjectConfig: IOSProjectConfig, data: string) {
    const iOSGoogleServicesPath = join(iosProjectConfig.sourceDir, 'GoogleService-Info.plist');
    return write(iOSGoogleServicesPath, data);
}

/**
 * Returns "firebase.json" file. Returns null if it doesnt exist
 *
 * @param androidProjectConfig
 */
async function readFirebaseConfig(reactNativeConfig: Config) {
    const firebaseConfigPath = join(reactNativeConfig.root, 'firebase.json');
    const fileExists = await exists(firebaseConfigPath);
    if (!fileExists) return null;
    return JSON.parse(await read(firebaseConfigPath));
}

/**
 * Writes a new "firebase.json" file to the project
 * @param androidProjectConfig
 * @param data
 */
function writeFirebaseConfig(reactNativeConfig: Config, data: FirebaseConfig) {
    const androidAppBuildGradlePath = join(reactNativeConfig.root, 'app', 'build.gradle');
    return write(androidAppBuildGradlePath, JSON.stringify(data, null, 2));
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
    readIOSProjectPathConfig,
    writeGoogleServiceInfoPlist,
    readIosGoogleServices,
    readFirebaseConfig,
    writeFirebaseConfig,
};
