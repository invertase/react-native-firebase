import { firebase } from '..';

/**
 * Returns an instance of Installations associated with the given FirebaseApp instance.
 * @param app - FirebaseApp. Optional.
 * @returns {Installations}
 */
export function getInstallations(app) {
  if (app) {
    return firebase.app(app.name).installations();
  }
  return firebase.app().installations();
}

/**
 * Deletes the Firebase Installation and all associated data.
 * @param installations
 * @returns {Promise<void>}
 */
export function deleteInstallations(installations) {
  return installations.delete();
}
