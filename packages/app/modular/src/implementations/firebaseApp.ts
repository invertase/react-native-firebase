import { FirebaseApp, FirebaseOptions } from '../types';

/**
 * The class implementation of `FirebaseApp`.
 */
export class FirebaseAppImpl implements FirebaseApp {
  constructor(name: string, options: FirebaseOptions, automaticDataCollectionEnabled: boolean) {
    this.name = name;
    this.options = options;
    this.automaticDataCollectionEnabled = automaticDataCollectionEnabled;
  }

  readonly name: string;
  readonly options: FirebaseOptions;
  readonly automaticDataCollectionEnabled: boolean;
}
