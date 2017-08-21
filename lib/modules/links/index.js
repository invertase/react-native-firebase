import { NativeEventEmitter, NativeModules } from 'react-native'
import { Base } from './../base'
import { nativeSDKMissing } from './../../utils'

const FirebaseLinks = NativeModules.RNFirebaseLinks
const FirebaseLinksEvt = FirebaseLinks && new NativeEventEmitter(FirebaseLinks)

const EVENT_TYPE = {
  Link: 'dynamic_link_received',
}

/**
 * @class Links
 */
export default class Links extends Base {
  constructor(firebase, options = {}) {
    super(firebase, options)
    if (!FirebaseLinks) {
      return nativeSDKMissing('links')
    }

    this.namespace = 'firebase:links'
  }

  get EVENT_TYPE() {
    return EVENT_TYPE
  }

  /**
   * Returns the link that triggered application open
   * @returns {*}
   */
  getInitialLink() {
    return FirebaseLinks.getInitialLink()
  }

  /**
   * Subscribe to dynamic links
   * @param listener
   * @returns {*}
   */
  onLink(listener: Function): () => any {
    const rnListener = FirebaseLinksEvt.addListener(EVENT_TYPE.Link, listener)
    return () => rnListener.remove()
  }

  createDynamicLink(parameters: Object = {}): Promise<String> {
    return FirebaseLinks.createDynamicLink(parameters)
  }

  createShortDynamicLink(parameters: Object = {}): Promise<String> {
    return FirebaseLinks.createShortDynamicLink(parameters)
  }
}

export const statics = {
  EVENT_TYPE,
}
