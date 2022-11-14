import { deleteApp as deleteAppV8, getApp, getApps, initializeApp, setLogLevel } from '../internal';

/**
 * Renders this app unusable and frees the resources of all associated services.
 * @param app - FirebaseApp - The app to delete.
 * @returns
 */
function deleteApp(app) {
  return deleteAppV8(app.name, app._nativeInitialized);
}

export { getApps, initializeApp, deleteApp, setLogLevel, getApp };
