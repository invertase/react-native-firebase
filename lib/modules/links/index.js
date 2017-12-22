/**
 * @flow
 * Dynamic Links representation wrapper
 */
import { SharedEventEmitter } from '../../utils/events';
import ModuleBase from '../../utils/ModuleBase';
import { areObjectKeysContainedInOther, isObject, isString } from './../../utils';

import type FirebaseApp from '../core/firebase-app';

const EVENT_TYPE = {
  Link: 'dynamic_link_received',
};

const NATIVE_EVENTS = [
  EVENT_TYPE.Link,
];

function validateParameters(parameters: Object): void {
  const suportedParametersObject = {
    dynamicLinkDomain: 'string',
    link: 'string',
    androidInfo: {
      androidPackageName: 'string',
      androidFallbackLink: 'string',
      androidMinPackageVersionCode: 'string',
      androidLink: 'string',
    },
    iosInfo: {
      iosBundleId: 'string',
      iosFallbackLink: 'string',
      iosCustomScheme: 'string',
      iosIpadFallbackLink: 'string',
      iosIpadBundleId: 'string',
      iosAppStoreId: 'string',
    },
    socialMetaTagInfo: {
      socialTitle: 'string',
      socialDescription: 'string',
      socialImageLink: 'string',
    },
    suffix: {
      option: 'string',
    },
  };
  if (!areObjectKeysContainedInOther(parameters, suportedParametersObject)) {
    throw new Error('Invalid Parameters.');
  }
}

function checkForMandatoryParameters(parameters: Object): void {
  if (!isString(parameters.dynamicLinkDomain)) {
    throw new Error('No dynamicLinkDomain was specified.');
  }
  if (!isString(parameters.link)) {
    throw new Error('No link was specified.');
  }
  if (isObject(parameters.androidInfo) && !isString(parameters.androidInfo.androidPackageName)) {
    throw new Error('No androidPackageName was specified.');
  }
  if (isObject(parameters.iosInfo) && !isString(parameters.iosInfo.iosBundleId)) {
    throw new Error('No iosBundleId was specified.');
  }
}

/**
 * @class Links
 */
export default class Links extends ModuleBase {
  static _NAMESPACE = 'links';
  static _NATIVE_MODULE = 'RNFirebaseLinks';

  constructor(firebaseApp: FirebaseApp, options: Object = {}) {
    super(firebaseApp, options, NATIVE_EVENTS);
  }

  get EVENT_TYPE(): Object {
    return EVENT_TYPE;
  }

  /**
   * Returns the link that triggered application open
   * @returns {Promise.<String>}
   */
  getInitialLink(): Promise<string> {
    return this._native.getInitialLink();
  }

  /**
   * Subscribe to dynamic links
   * @param listener
   * @returns {Function}
   */
  onLink(listener: Function): () => any {
    const rnListener = SharedEventEmitter.addListener(EVENT_TYPE.Link, listener);
    return () => rnListener.remove();
  }

  /**
   * Create long Dynamic Link from parameters
   * @param parameters
   * @returns {Promise.<String>}
   */
  createDynamicLink(parameters: Object = {}): Promise<string> {
    try {
      checkForMandatoryParameters(parameters);
      validateParameters(parameters);
      return this._native.createDynamicLink(parameters);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Create short Dynamic Link from parameters
   * @param parameters
   * @returns {Promise.<String>}
   */
  createShortDynamicLink(parameters: Object = {}): Promise<String> {
    try {
      checkForMandatoryParameters(parameters);
      validateParameters(parameters);
      return this._native.createShortDynamicLink(parameters);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export const statics = {
  EVENT_TYPE,
};
