import ModuleBase from './../../utils/ModuleBase';

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
   * @returns {*}
   */
  getInitialLink() {
    return this._native.getInitialLink();
  }

  /**
   * Subscribe to dynamic links
   * @param listener
   * @returns {*}
   */
  onLink(listener: Function): () => any {
    const rnListener = this._eventEmitter.addListener(EVENT_TYPE.Link, listener);
    return () => rnListener.remove();
  }

  createDynamicLink(parameters: Object = {}): Promise<String> {
    return this._native.createDynamicLink(parameters);
  }

  createShortDynamicLink(parameters: Object = {}): Promise<String> {
    return this._native.createShortDynamicLink(parameters);
  }
}

export const statics = {
  EVENT_TYPE,
};
