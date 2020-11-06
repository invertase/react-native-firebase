/**
 * 
 * Instance ID representation wrapper
 */
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';
export const NAMESPACE = 'iid';
export const MODULE_NAME = 'RNFirebaseInstanceId';
export default class InstanceId extends ModuleBase {
  constructor(app) {
    super(app, {
      hasCustomUrlSupport: false,
      moduleName: MODULE_NAME,
      hasMultiAppSupport: false,
      namespace: NAMESPACE
    });
  }
  /**
   * Get the current Instance ID.
   *
   * @returns {*}
   */


  get() {
    return getNativeModule(this).get();
  }
  /**
   * Delete the current Instance ID.
   *
   * @returns {*}
   */


  delete() {
    return getNativeModule(this).delete();
  }
  /**
   * Get a token that authorizes an Entity to perform an action on behalf
   * of the application identified by Instance ID.
   *
   * @param authorizedEntity
   * @param scope
   * @returns {Promise<string>}
   */


  getToken(authorizedEntity, scope) {
    return getNativeModule(this).getToken(authorizedEntity || this.app.options.messagingSenderId, scope || '*');
  }
  /**
   * Revokes access to a scope (action) for an entity previously authorized by getToken().
   *
   * @param authorizedEntity
   * @param scope
   * @returns {Promise<void>}
   */


  deleteToken(authorizedEntity, scope) {
    return getNativeModule(this).deleteToken(authorizedEntity || this.app.options.messagingSenderId, scope || '*');
  }

}
export const statics = {};