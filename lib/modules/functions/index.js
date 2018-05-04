/**
 * @flow
 * Functions representation wrapper
 */
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';

import type App from '../core/app';

export const MODULE_NAME = 'RNFirebaseFunctions';
export const NAMESPACE = 'functions';

type HttpsCallable = (data?: any) => Promise<any>;

export default class Analytics extends ModuleBase {
  constructor(app: App) {
    super(app, {
      moduleName: MODULE_NAME,
      multiApp: false,
      hasShards: false,
      namespace: NAMESPACE,
    });
  }

  /**
   * Returns a reference to the callable https trigger with the given name.
   * @param name The name of the trigger.
   */
  httpsCallable(name: string): HttpsCallable {
    return (data?: any) => getNativeModule(this).httpsCallable(name, data);
  }
}

export const statics = {};
