import {
  firebase,
  FirebaseInstallationsTypes,
  IdChangeCallbackFn,
  IdChangeUnsubscribeFn,
} from '..';

/**
 * @param {import("@react-native-firebase/app").ReactNativeFirebase.FirebaseApp} app
 * @returns {import("..").FirebaseInstallationsTypes.Module}
 */
export function getInstallations(app) {
  if (app) {
    return firebase.app(app.name).installations();
  }
  return firebase.app().installations();
}

/**
 * @param {import("..").FirebaseInstallationsTypes.Module} installations
 * @returns {Promise<void>}
 */
export function deleteInstallations(installations) {
  return firebase.app(installations.app.name).installations().delete();
}

/**
 * @param {import("..").FirebaseInstallationsTypes.Module} installations
 * @returns {Promise<string>}
 */
export function getId(installations) {
  return firebase.app(installations.app.name).installations().getId();
}

/**
 * @param {import("..").FirebaseInstallationsTypes.Module} installations
 * @param {boolean | undefined} forceRefresh
 * @returns {Promise<string>}
 */
export function getToken(installations, forceRefresh) {
  return firebase.app(installations.app.name).installations().getToken(forceRefresh);
}

/**
 * @param {import("..").FirebaseInstallationsTypes.Module} installations
 * @param {(string) => void} callback
 * @returns {() => void}
 */
export function onIdChange(installations, callback) {
  throw new Error('onIdChange() is unsupported by the React Native Firebase SDK.');
}
