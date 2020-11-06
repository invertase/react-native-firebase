/**
 * 
 * Dynamic Links representation wrapper
 */
import { Platform } from 'react-native';
import DynamicLink from './DynamicLink';
import { SharedEventEmitter } from '../../utils/events';
import { getLogger } from '../../utils/log';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';
const NATIVE_EVENTS = ['links_link_received'];
export const MODULE_NAME = 'RNFirebaseLinks';
export const NAMESPACE = 'links';
/**
 * @class Links
 */

export default class Links extends ModuleBase {
  constructor(app) {
    super(app, {
      events: NATIVE_EVENTS,
      moduleName: MODULE_NAME,
      hasMultiAppSupport: false,
      hasCustomUrlSupport: false,
      namespace: NAMESPACE
    });
    SharedEventEmitter.addListener( // sub to internal native event - this fans out to
    // public event name: onMessage
    'links_link_received', link => {
      SharedEventEmitter.emit('onLink', link);
    }); // Tell the native module that we're ready to receive events

    if (Platform.OS === 'ios') {
      getNativeModule(this).jsInitialised();
    }
  }
  /**
   * Create long Dynamic Link from parameters
   * @param parameters
   * @returns {Promise.<string>}
   */


  createDynamicLink(link) {
    if (!(link instanceof DynamicLink)) {
      return Promise.reject(new Error(`Links:createDynamicLink expects a 'DynamicLink' but got type ${typeof link}`));
    }

    try {
      return getNativeModule(this).createDynamicLink(link.build());
    } catch (error) {
      return Promise.reject(error);
    }
  }
  /**
   * Create short Dynamic Link from parameters
   * @param parameters
   * @returns {Promise.<string>}
   */


  createShortDynamicLink(link, type) {
    if (!(link instanceof DynamicLink)) {
      return Promise.reject(new Error(`Links:createShortDynamicLink expects a 'DynamicLink' but got type ${typeof link}`));
    }

    try {
      return getNativeModule(this).createShortDynamicLink(link.build(), type);
    } catch (error) {
      return Promise.reject(error);
    }
  }
  /**
   * Returns the link that triggered application open
   * @returns {Promise.<string>}
   */


  getInitialLink() {
    return getNativeModule(this).getInitialLink();
  }
  /**
   * Subscribe to dynamic links
   * @param listener
   * @returns {Function}
   */


  onLink(listener) {
    getLogger(this).info('Creating onLink listener');
    SharedEventEmitter.addListener('onLink', listener);
    return () => {
      getLogger(this).info('Removing onLink listener');
      SharedEventEmitter.removeListener('onLink', listener);
    };
  }

}
export const statics = {
  DynamicLink
};