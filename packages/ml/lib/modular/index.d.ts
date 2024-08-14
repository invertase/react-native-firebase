import { FirebaseApp } from '@firebase/app-types';
import { FirebaseMLTypes } from '..';

type FirebaseML = FirebaseMLTypes.Module;

/**
 * Returns the existing default {@link FirebaseML} instance that is associated with the
 * default {@link @firebase/app#FirebaseApp}. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @returns The {@link FirebaseML} instance of the provided app.
 */
export declare function getML(app?: FirebaseApp): FirebaseML;
