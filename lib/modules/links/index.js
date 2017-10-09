import ModuleBase from './../../utils/ModuleBase';
import { areObjectKeysContainedInOther } from './../../utils';

const EVENT_TYPE = {
  Link: 'dynamic_link_received',
};

/**
 * @class Links
 */
export default class Links extends ModuleBase {
  static _NAMESPACE = 'links';
  static _NATIVE_MODULE = 'RNFirebaseLinks';

  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options, true);
  }

  get EVENT_TYPE() {
    return EVENT_TYPE;
  }

  /**
   * Returns the link that triggered application open
   * @returns {Promise.<String>}
   */
  getInitialLink() {
    return this._native.getInitialLink();
  }

  /**
   * Subscribe to dynamic links
   * @param listener
   * @returns {Function}
   */
  onLink(listener: Function): () => any {
    const rnListener = this._eventEmitter.addListener(EVENT_TYPE.Link, listener);
    return () => rnListener.remove();
  }

  /**
   * Create long Dynamic Link from parameters
   * @param parameters
   * @returns {Promise.<String>}
   */
  createDynamicLink(parameters: Object = {}): Promise<String> {
    if (!this._validateParameters(parameters)) {
      return Promise.reject(new Error('Invalid Parameters.'));
    }
    return this._native.createDynamicLink(parameters);
  }

  /**
   * Create short Dynamic Link from parameters
   * @param parameters
   * @returns {Promise.<String>}
   */
  createShortDynamicLink(parameters: Object = {}): Promise<String> {
    if (!this._validateParameters(parameters)) {
      return Promise.reject(new Error('Invalid Parameters.'));
    }
    return this._native.createShortDynamicLink(parameters);
  }

  _validateParameters(parameters: Object): boolean {
    const suportedParametersObject = {
      dynamicLinkInfo: {
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
      },
      suffix: {
        option: 'string',
      },
    };
    return areObjectKeysContainedInOther(parameters, suportedParametersObject);
  }
}

export const statics = {
  EVENT_TYPE,
};
