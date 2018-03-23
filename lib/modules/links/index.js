/**
 * @flow
 * Dynamic Links representation wrapper
 */
import { SharedEventEmitter } from '../../utils/events';
import { getLogger } from '../../utils/log';
import ModuleBase from '../../utils/ModuleBase';
import { areObjectKeysContainedInOther, isObject, isString } from '../../utils';
import { getNativeModule } from '../../utils/native';

import type App from '../core/app';

const NATIVE_EVENTS = ['links_link_received'];

export const MODULE_NAME = 'RNFirebaseLinks';
export const NAMESPACE = 'links';

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
  if (
    isObject(parameters.androidInfo) &&
    !isString(parameters.androidInfo.androidPackageName)
  ) {
    throw new Error('No androidPackageName was specified.');
  }
  if (
    isObject(parameters.iosInfo) &&
    !isString(parameters.iosInfo.iosBundleId)
  ) {
    throw new Error('No iosBundleId was specified.');
  }
}

/**
 * @class Links
 */
export default class Links extends ModuleBase {
  constructor(app: App) {
    super(app, {
      events: NATIVE_EVENTS,
      moduleName: MODULE_NAME,
      multiApp: false,
      namespace: NAMESPACE,
    });

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onMessage
      'links_link_received',
      (link: string) => {
        SharedEventEmitter.emit('onLink', link);
      }
    );
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
      return getNativeModule(this).createDynamicLink(parameters);
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
      return getNativeModule(this).createShortDynamicLink(parameters);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Returns the link that triggered application open
   * @returns {Promise.<String>}
   */
  getInitialLink(): Promise<string> {
    return getNativeModule(this).getInitialLink();
  }

  /**
   * Subscribe to dynamic links
   * @param listener
   * @returns {Function}
   */
  onLink(listener: string => any): () => any {
    getLogger(this).info('Creating onLink listener');

    SharedEventEmitter.addListener('onLink', listener);

    return () => {
      getLogger(this).info('Removing onLink listener');
      SharedEventEmitter.removeListener('onLink', listener);
    };
  }
}

export const statics = {};
