import { deleteApp as deleteAppV8, FirebaseApp, getApps, initializeApp } from '../internal';

/**
 * Renders this app unusable and frees the resources of all associated services.
 * @param app - The app to delete.
 * @returns
 */
function deleteApp(app: FirebaseApp): Promise<void> {
  return deleteAppV8(app.name, app._nativeInitialized);
}

export { getApps, initializeApp, deleteApp };
