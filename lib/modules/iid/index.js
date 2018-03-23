/**
 * @flow
 * Instance ID representation wrapper
 */
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';

import type App from '../core/app';

export const MODULE_NAME = 'RNFirebaseInstanceId';
export const NAMESPACE = 'iid';

export default class InstanceId extends ModuleBase {
  constructor(app: App) {
    super(app, {
      hasShards: false,
      moduleName: MODULE_NAME,
      multiApp: false,
      namespace: NAMESPACE,
    });
  }

  delete(): Promise<void> {
    return getNativeModule(this).delete();
  }

  get(): Promise<string> {
    return getNativeModule(this).get();
  }
}

export const statics = {};
