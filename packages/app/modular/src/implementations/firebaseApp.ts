import { FirebaseApp, FirebaseAppConfig, FirebaseOptions } from '../types';

/**
 * The class implementation of `FirebaseApp`.
 */
export default class FirebaseAppImpl implements FirebaseApp {
  constructor(name: string, options: FirebaseOptions, config?: FirebaseAppConfig) {
    this.name = name;
    this.options = options;
    this.automaticDataCollectionEnabled = config?.automaticDataCollectionEnabled ?? true;
    this.automaticResourceManagement = config?.automaticDataCollectionEnabled ?? false;
  }

  readonly name: string;
  readonly options: FirebaseOptions;
  automaticDataCollectionEnabled: boolean;
  automaticResourceManagement: boolean;
}
